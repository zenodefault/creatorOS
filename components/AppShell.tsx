'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import { useApiData } from '../hooks/useApiData';
import { useAuth } from '../hooks/useAuth';
import type { Profile } from '../lib/types';

export type AppShellSection =
  | 'dashboard'
  | 'studio'
  | 'chatbot'
  | 'protection'
  | 'analytics'
  | 'settings';

const NAV: { key: AppShellSection; href: string; label: string; Icon: typeof Video }[] = [
  { key: 'dashboard', href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'studio', href: '/studio', label: 'Studio', Icon: Video },
  { key: 'chatbot', href: '/chatbot', label: 'Chatbot', Icon: MessageSquare },
  { key: 'protection', href: '/protection', label: 'Protection', Icon: Shield },
  { key: 'analytics', href: '/analytics', label: 'Analytics', Icon: BarChart3 },
  { key: 'settings', href: '/settings', label: 'Settings', Icon: SettingsIcon },
];

export function AppShell({ active, children }: { active: AppShellSection; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: profile, reload: reloadProfile } = useApiData<Profile>(user ? '/api/profile' : null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleProfileUpdate() {
      reloadProfile();
    }

    window.addEventListener('creatoros:profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('creatoros:profile-updated', handleProfileUpdate);
  }, [reloadProfile]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [authLoading, user, router, pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Your account';
  const initial = displayName.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    setDrawerOpen(false);
    try {
      await signOut();
    } catch {
      // Signing out locally is still the right outcome if the network call fails.
    }
    router.push('/login');
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light font-display text-slate-500 dark:bg-background-dark dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
          <p className="text-sm">{authLoading ? 'Checking your session…' : 'Redirecting to sign in…'}</p>
        </div>
      </div>
    );
  }

  const renderNav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-2">
      {NAV.map(({ key, href, label, Icon }) => {
        const isActive = key === active;

        return (
          <Link
            key={key}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={
              isActive
                ? 'group flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary transition-all hover:bg-primary/20'
                : 'group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderUserCard = () => (
    <div className="relative" ref={userMenuRef}>
      {userMenuOpen && (
        <div
          role="menu"
          className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-surface-light shadow-lg dark:border-slate-700 dark:bg-surface-dark"
        >
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => {
              setUserMenuOpen(false);
              setDrawerOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <SettingsIcon className="w-4 h-4" />
            Profile settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-secondary transition-colors hover:bg-secondary/10"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-sm font-bold text-primary">
          {initial}
        </div>
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {profile?.email || user?.email || 'Signed in'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUserMenuOpen((open) => !open)}
          aria-expanded={userMenuOpen}
          aria-label="Account menu"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light font-display text-slate-900 transition-colors duration-200 dark:bg-background-dark dark:text-white">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-slate-200 bg-surface-light p-4 dark:border-slate-800 dark:bg-surface-dark lg:flex">
        <div className="flex flex-col gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Creator Mind</h1>
          </Link>
          {renderNav()}
        </div>
        {renderUserCard()}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}
      {drawerOpen && (
        <div className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-slate-200 bg-surface-light p-4 dark:border-slate-800 dark:bg-surface-dark lg:hidden">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-lg font-bold tracking-tight">Creator Mind</h1>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderNav(() => setDrawerOpen(false))}
          </div>
          {renderUserCard()}
        </div>
      )}

      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between bg-surface-light/80 px-4 backdrop-blur-md dark:bg-surface-dark/80 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold">Creator Mind</span>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
