import {
  PLATFORMS,
  type AnalyticsSummary,
  type Draft,
  type Fingerprint,
  type Platform,
  type Profile,
} from '../types';

type AssistantContext = {
  profile: Profile;
  summary: AnalyticsSummary;
  drafts: Draft[];
  fingerprints: Fingerprint[];
  question: string;
};

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

function listLines(lines: string[]): string {
  return lines.map((line) => `• ${line}`).join('\n');
}

function platformSentence(summary: AnalyticsSummary): string {
  const used = summary.platforms.filter((entry) => entry.posts > 0);
  if (used.length === 0) return 'No platform has any posts yet.';

  const leader = [...used].sort((a, b) => b.posts - a.posts)[0];
  return `Most of your work (${leader.posts}) is on ${leader.platform}.`;
}

function scheduleAnswer({ summary }: AssistantContext): string {
  if (summary.upcoming.length === 0) {
    return [
      "Nothing is scheduled right now, so your next slot is empty.",
      `${plural(summary.totals.drafts, 'draft')} ${summary.totals.drafts === 1 ? 'exists' : 'exist'}, ${summary.totals.published} published so far.`,
      'Add a draft in Studio and give it a date to fill the calendar.',
    ].join('\n');
  }

  const upcoming = summary.upcoming.map(
    (draft) => `${draft.title} — ${draft.platform}, ${formatDateTime(draft.scheduledFor ?? draft.createdAt)}`,
  );

  return [
    `You have ${plural(summary.totals.scheduled, 'scheduled post')}. Next up:`,
    listLines(upcoming),
  ].join('\n');
}

function statsAnswer({ summary, profile }: AssistantContext): string {
  const connected = PLATFORMS.filter((platform) => profile.channels[platform]);

  return [
    `Across your workspace: ${plural(summary.totals.drafts, 'draft')}, ${summary.totals.scheduled} scheduled, ${summary.totals.published} published.`,
    platformSentence(summary),
    summary.totals.protectedAssets === 0
      ? 'No assets are fingerprint-protected yet.'
      : `${plural(summary.totals.protectedAssets, 'asset is', 'assets are')} fingerprint-protected.`,
    connected.length === 0
      ? 'No channels are connected in Settings yet.'
      : `Connected channels: ${connected.join(', ')}.`,
  ].join('\n');
}

function protectionAnswer({ summary, fingerprints }: AssistantContext): string {
  if (fingerprints.length === 0) {
    return [
      'You have not registered any fingerprints yet.',
      'Open Protection, choose a file, and the browser will hash it — only the SHA-256 digest is stored, never the file itself.',
    ].join('\n');
  }

  const latest = fingerprints
    .slice(0, 3)
    .map((entry) => `${entry.filename} — ${entry.sha256.slice(0, 12)}… (${new Date(entry.createdAt).toLocaleDateString('en-US')})`);

  return [
    `${plural(summary.totals.protectedAssets, 'asset is', 'assets are')} protected. Most recent:`,
    listLines(latest),
    'Drop any file into Protection to check whether its hash is already in your ledger.',
  ].join('\n');
}

function ideasAnswer({ drafts, profile, summary }: AssistantContext): string {
  const connected = PLATFORMS.filter((platform) => profile.channels[platform]);
  const considered = connected.length > 0 ? connected : PLATFORMS;

  const thinnest = [...considered].sort((a, b) => {
    const left = drafts.filter((draft) => draft.platform === a).length;
    const right = drafts.filter((draft) => draft.platform === b).length;
    return left - right;
  })[0] as Platform;

  const untitled = drafts.filter((draft) => draft.status === 'draft').slice(0, 2);

  const ideas = [
    `${thinnest} is your thinnest channel (${drafts.filter((draft) => draft.platform === thinnest).length} posts) — a ${profile.niche.toLowerCase()} deep-dive would balance it.`,
    `Reuse your best performing format: ${summary.totals.published > 0 ? 'your published posts' : 'start with one post'} and turn it into a short for ${thinnest}.`,
  ];

  if (untitled.length > 0) {
    ideas.push(`Finish something already started: ${untitled.map((draft) => `"${draft.title}"`).join(', ')}.`);
  }

  return [`Based on what you already have, here is where the gaps are:`, listLines(ideas)].join('\n');
}

function overviewAnswer(context: AssistantContext): string {
  const { profile, summary } = context;

  return [
    `Here is your workspace as it stands, ${profile.displayName || 'creator'}:`,
    listLines([
      `${plural(summary.totals.drafts, 'draft')} (${summary.totals.scheduled} scheduled, ${summary.totals.published} published)`,
      `${plural(summary.totals.protectedAssets, 'protected asset')}, ${plural(summary.totals.connectedChannels, 'connected channel')}`,
      `${plural(summary.totals.assistantMessages, 'question')} asked here`,
    ]),
    'Ask me about your schedule, your numbers, copyright protection, or what to post next.',
  ].join('\n');
}

/**
 * Answers are composed from rows in the database. Nothing here is invented,
 * and no network call is required.
 */
export function buildReply(context: AssistantContext): string {
  const question = context.question.toLowerCase();

  if (/(schedule|calendar|next post|when.*post|queue)/.test(question)) return scheduleAnswer(context);
  if (/(stat|number|perform|analytics|how am i|how is my|progress|report|overview|doing)/.test(question)) return statsAnswer(context);
  if (/(protect|copyright|fingerprint|ownership|stolen|plagiar)/.test(question)) return protectionAnswer(context);
  if (/(idea|what should i post|next topic|inspiration|content plan)/.test(question)) return ideasAnswer(context);

  return overviewAnswer(context);
}
