'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../theme-provider';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Settings,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  Edit3,
  Upload,
  X,
  Monitor,
  Youtube,
  Instagram,
  Twitter,
  Sun,
  Moon,
  ChevronDown,
  CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  const handleThemeToggle = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else { // theme === 'system'
      setTheme('light');
    }
  };

  return (
    <div className="bg-[var(--background-theme)] text-[var(--text-theme)] min-h-screen flex flex-col overflow-hidden relative">
      {/* Ambient Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-primary rounded-full mix-blend-screen filter blur-[150px] opacity-[0.15]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary rounded-full mix-blend-screen filter blur-[150px] opacity-[0.1]"></div>
      </div>

      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-[var(--text-theme)]/10 bg-[var(--background-theme)]/80 backdrop-blur-md px-6 py-3 z-20 shrink-0">
        <div className="flex items-center gap-4 text-[var(--text-theme)]">
          <div className="size-8 text-primary">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 4.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.1986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-[var(--text-theme)] text-lg font-bold leading-tight tracking-tight">Creator Mind</h2>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
          <div className="flex items-center gap-6">
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Dashboard</a>
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Analytics</a>
            <a className="text-gray-300 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Campaigns</a>
          </div>
          <button className="flex items-center justify-center overflow-hidden rounded-xl h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal tracking-wide transition-all shadow-[0_0_15px_rgba(68,99,238,0.3)]">
            <span className="truncate">Create</span>
          </button>
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full size-9 ring-2 ring-white/10"
            data-alt="User profile avatar showing a smiling person"
            style={{ backgroundImage: user?.photoURL ? `url("${user?.photoURL}")` : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAVJKY0nMf9bQr9fAHlkfl-ddBGHY67sE2hsLj4BzpklwyaRKHa8Zr-caU_lLFzjsNPD2EcZQykmUot9ri1UEfuuk0jNgqOahbL-STNEZUgVKziGBqa93OOa6H_rsdhi6k_5kRZ1e3Yv_A2u57MMWKmNC1wRcD-yN-tFJENluqiLCKnL6eSlUloymBaMrn4vEfg-l1NHDSrLfHbymCk1lr2UB3bbmFySI30DzLighUN9dSHg1SiE4red7aaSQUAUk6X1x0xCsqgA0w")' }}
          ></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 hidden lg:flex flex-col border-r border-[var(--text-theme)]/10 bg-[var(--background-theme)]/50 backdrop-blur-sm p-4 gap-6 shrink-0 z-10">
          <div className="flex flex-col gap-2">
            <div className="px-3 py-2">
              <p className="text-xs font-bold text-[var(--text-theme)]/50 uppercase tracking-wider">Account</p>
            </div>
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/20 group">
              <User className="text-primary group-hover:scale-110 transition-transform text-[20px]" />
              <p className="text-[var(--text-theme)] text-sm font-medium">Profile</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group">
              <Settings className="text-gray-500 group-hover:text-white transition-colors text-[20px]" />
              <p className="text-sm font-medium">Account</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all group">
              <Bell className="text-gray-500 group-hover:text-white transition-colors text-[20px]" />
              <p className="text-sm font-medium">Notifications</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-40 hover:text-white transition-all group">
              <CreditCard className="text-gray-500 group-hover:text-white transition-colors text-[20px]" />
              <p className="text-sm font-medium">Billing</p>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-gray-40 hover:text-white transition-all group">
              <Shield className="text-gray-500 group-hover:text-white transition-colors text-[20px]" />
              <p className="text-sm font-medium">Security</p>
            </Link>
          </div>
          <div className="mt-auto px-3 py-4 border-t border-white/5">
            <button className="flex w-full items-center gap-3 text-secondary hover:text-secondary/80 transition-colors">
              <LogOut className="text-[20px]" />
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto relative w-full">
          <div className="max-w-[1000px] mx-auto px-4 py-8 md:px-12 md:py-10 flex flex-col gap-8">
            {/* Page Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[var(--text-theme)] text-3xl font-bold tracking-tight">Profile Settings</h1>
              <p className="text-[var(--text-theme)]/40 text-base font-normal">Manage your public profile information and integrations.</p>
            </div>

            {/* Glass Card 1: Personal Details */}
            <div className="rounded-2xl border-[var(--text-theme)]/10 bg-[var(--background-theme)]/50 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start border-b border-[var(--text-theme)]/5 pb-8">
                  <div className="relative group cursor-pointer">
                    <div 
                      className="bg-center bg-no-repeat bg-cover rounded-full size-24 md:size-32 ring-4 ring-white/5 shadow-lg group-hover:opacity-80 transition-opacity"
                      data-alt="Current profile picture of the user"
                      style={{ backgroundImage: user?.photoURL ? `url("${user?.photoURL}")` : 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBE93OHkICxd-UdesTVS2ZFZc5mQuBbP9XFdeynbShBq2AYmu4l2B2fhFs93LkswM0aSk9Q8WOmqdtyYxk-K6tWZmGW3roKAfjHoatIOYB9BIzgxWPTN6aBjOZH0t_cieEHORRMmeRpPRhmGdoo2jDDUbyyKknK-Bx4HDo9-CZDqV3oAfxExd0V7PWVH-uB8B3eeG1qKhHeZfaYikxxASg2w9RubpdA5LXHKzje3sqbWBhGI6WrGuazr6ZakaXcFqv_PG9oh8HJANc")' }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 rounded-full p-2 backdrop-blur-sm">
                        <Edit3 className="text-white" size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-center sm:text-left pt-2">
                    <h3 className="text-[var(--text-theme)] text-xl font-bold">Profile Photo</h3>
                    <p className="text-[var(--text-theme)]/40 text-sm max-w-xs">Upload a new avatar. Recommended size 400x400px. JPG, PNG or GIF.</p>
                    <div className="mt-2 flex gap-3 justify-center sm:justify-start">
                      <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/5 flex items-center gap-2">
                        <Upload size={14} />
                        Upload
                      </button>
                      <button className="text-sm text-gray-500 hover:text-red-400 px-2 py-2 rounded-lg font-medium transition-colors flex items-center gap-1">
                        <X size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Display Name */}
                  <label className="flex flex-col gap-2">
                    <span className="text-gray-30 text-sm font-medium ml-1">Display Name</span>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]" size={20} />
                      <input 
                        className="w-full bg-[var(--background-theme)]/60 border border-[var(--text-theme)]/10 rounded-xl px-4 pl-11 py-3 text-[var(--text-theme)] placeholder-[var(--text-theme)]/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        placeholder="Your display name" 
                        type="text" 
                        defaultValue={user?.displayName || user?.email?.split('@')[0] || 'User'}
                      />
                    </div>
                  </label>

                  {/* Email */}
                  <label className="flex flex-col gap-2">
                    <span className="text-gray-300 text-sm font-medium ml-1">Email Address</span>
                    <div className="relative">
                      <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]" size={20} />
                      <input 
                        className="w-full bg-[var(--background-theme)]/60 border border-[var(--text-theme)]/10 rounded-xl px-4 pl-11 py-3 text-[var(--text-theme)] placeholder-[var(--text-theme)]/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                        placeholder="name@company.com" 
                        type="email" 
                        defaultValue={user?.email || 'No email'}
                        readOnly
                      />
                    </div>
                  </label>

                  {/* Niche Selector */}
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-gray-30 text-sm font-medium ml-1">Content Niche</span>
                    <div className="relative">
                      <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-[20px]" size={20} />
                      <select className="w-full bg-[var(--background-theme)]/60 border border-[var(--text-theme)]/10 rounded-xl px-4 pl-11 py-3 text-[var(--text-theme)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all text-sm cursor-pointer">
                        <option value="tech">Technology & Coding</option>
                        <option value="lifestyle">Lifestyle & Vlogs</option>
                        <option value="gaming">Gaming & Esports</option>
                        <option value="education">Education & Tutorials</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-[20px]" size={20} />
                    </div>
                  </label>

                  {/* Bio */}
                  <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-gray-30 text-sm font-medium ml-1">Bio</span>
                    <textarea 
                      className="w-full bg-[var(--background-theme)]/60 border border-[var(--text-theme)]/10 rounded-xl px-4 py-3 text-[var(--text-theme)] placeholder-[var(--text-theme)]/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none text-sm"
                      placeholder="Tell us a little about yourself..." 
                      rows={3}
                    ></textarea>
                  </label>
                </div>
              </div>
            </div>

            {/* Glass Card 2: Connected Platforms */}
            <div className="rounded-2xl border-[var(--text-theme)]/10 bg-[var(--background-theme)]/50 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-[var(--text-theme)]/5 flex justify-between items-center">
                <h3 className="text-lg font-bold text-[var(--text-theme)]">Connected Platforms</h3>
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-50/10 text-green-400 border-green-50/20">2 Active</span>
              </div>
              <div className="divide-y divide-[var(--text-theme)]/5">
                {/* YouTube */}
                <div className="p-5 flex items-center justify-between gap-4 hover:bg-surface-glass-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                      <Youtube className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-medium">YouTube</p>
                      <p className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected as {user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      checked 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#1c1e27] appearance-none cursor-pointer transition-all duration-300" 
                      id="toggle-yt" 
                      name="toggle" 
                      type="checkbox"
                    />
                    <label 
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer border border-white/10" 
                      htmlFor="toggle-yt"
                    ></label>
                  </div>
                </div>

                {/* Instagram */}
                <div className="p-5 flex items-center justify-between gap-4 hover:bg-surface-glass-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-pink-600/10 flex items-center justify-center border border-pink-600/20 text-pink-500">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-medium">Instagram</p>
                      <p className="text-gray-50 text-xs">Not connected</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wide transition-all">
                    Connect
                  </button>
                </div>

                {/* Twitter/X */}
                <div className="p-5 flex items-center justify-between gap-4 hover:bg-surface-glass-hover transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white">
                      <Twitter className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-white font-medium">X (Twitter)</p>
                      <p className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </p>
                    </div>
                  </div>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      checked 
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#1c1e27] appearance-none cursor-pointer transition-all duration-300" 
                      id="toggle-x" 
                      name="toggle" 
                      type="checkbox"
                    />
                    <label 
                      className="toggle-label block overflow-hidden h-6 rounded-full bg-primary cursor-pointer border border-white/10" 
                      htmlFor="toggle-x"
                    ></label>
                  </div>
                </div>
              </div>
              {/* Integration Footer */}
              <div className="bg-primary/5 p-4 text-center border-t border-[var(--text-theme)]/5">
                <p className="text-xs text-primary/80 hover:text-primary cursor-pointer font-medium">View all available integrations</p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 pt-4 pb-12">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Theme</span>
                <button
                  className="relative rounded-full w-14 h-8 flex items-center transition-colors duration-300 focus:outline-none"
                  onClick={handleThemeToggle}
                  aria-label="Toggle theme"
                >
                  <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-primary' :
                    theme === 'light' ? 'bg-gray-400' :
                    'bg-blue-500'
                  }`}></div>
                  <div className={`absolute w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    theme === 'dark' ? 'translate-x-7' :
                    theme === 'light' ? 'translate-x-1' :
                    'translate-x-4'
                  }`}></div>
                  <Sun className={`absolute left-1 z-10 w-4 h-4 transition-opacity duration-30 ${
                    theme === 'light' ? 'opacity-100 text-yellow-600' : 'opacity-0'
                  }`} />
                  <Moon className={`absolute right-1 z-10 w-4 h-4 transition-opacity duration-300 ${
                    theme === 'dark' ? 'opacity-100 text-indigo-300' : 'opacity-0'
                  }`} />
                  <Monitor className={`absolute left-1/2 -translate-x-1/2 z-10 w-4 h-4 transition-opacity duration-300 ${
                    theme === 'system' ? 'opacity-100 text-blue-300' : 'opacity-0'
                  }`} />
                </button>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button className="px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5">Save Changes</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}