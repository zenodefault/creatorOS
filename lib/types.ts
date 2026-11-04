export type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'LinkedIn' | 'Bluesky';

export const PLATFORMS: Platform[] = ['YouTube', 'Instagram', 'TikTok', 'LinkedIn', 'Bluesky'];

export type DraftStatus = 'draft' | 'scheduled' | 'published';

export type Draft = {
  id: string;
  title: string;
  body: string;
  platform: Platform;
  status: DraftStatus;
  scheduledFor: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: File | null;
};

export type DraftInput = {
  title?: string;
  body?: string;
  platform?: Platform;
  status?: DraftStatus;
  scheduledFor?: string | null;
};

export type ChannelMap = Record<Platform, boolean>;

export type ProfileSettings = {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  publicProfile: boolean;
};

export type Profile = {
  uid: string;
  email: string | null;
  displayName: string;
  niche: string;
  bio: string;
  createdAt: string;
  settings: ProfileSettings;
  channels: ChannelMap;
};

export type ProfilePatch = {
  displayName?: string;
  niche?: string;
  bio?: string;
  settings?: Partial<ProfileSettings>;
  channels?: Partial<ChannelMap>;
};

export type Fingerprint = {
  id: string;
  filename: string;
  sha256: string;
  sizeBytes: number;
  createdAt: string;
};

export type EventType =
  | 'post_scheduled'
  | 'post_published'
  | 'asset_protected'
  | 'assistant_message';

export type ActivityEvent = {
  id: number;
  type: EventType;
  platform: Platform | null;
  createdAt: string;
};

export type SeriesMetric = 'published' | 'scheduled' | 'protected';

export type PlatformBreakdown = {
  platform: Platform;
  posts: number;
  published: number;
  connected: boolean;
};

export type AnalyticsSummary = {
  days: number;
  dates: string[];
  series: Record<SeriesMetric, number[]>;
  totals: {
    drafts: number;
    scheduled: number;
    published: number;
    protectedAssets: number;
    connectedChannels: number;
    assistantMessages: number;
  };
  platforms: PlatformBreakdown[];
  upcoming: Draft[];
  events: ActivityEvent[];
  isEmpty: boolean;
};

export type AssistantMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export const DRAFT_STATUS_LABEL: Record<DraftStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
};