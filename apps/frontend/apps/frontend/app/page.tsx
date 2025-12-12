"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Star, Users, Play, ArrowRight, CheckCircle, Zap, Shield, Share2, Eye, Download, Settings, Bell, Search, Filter, Grid, List, TrendingUp, Sparkles, Menu, PlayCircle, TrendingUpIcon, ToyBrick, BadgeCheck, Rocket, Globe, Mail, Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export default function HomePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden">
      {/* Background Ambient Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#4461ee]/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-[#f72585]/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-[#4461ee]/10 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen opacity-70"></div>
      </div>
      
      <div className="flex flex-col min-h-screen relative z-10">
        {/* Navbar */}
        <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-[#101322]/70 border-b border-white/20 dark:border-white/5">
          <div className="px-4 md:px-10 lg:px-40 flex justify-center py-3">
            <div className="w-full max-w-[1280px] flex items-center justify-between">
              <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                <div className="size-8 flex items-center justify-center text-[#4461ee]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Creator Mind</h2>
              </div>
              <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
                <nav className="flex items-center gap-9">
                  <a className="text-sm font-medium hover:text-[#4461ee] transition-colors" href="#">Features</a>
                  <a className="text-sm font-medium hover:text-[#4461ee] transition-colors" href="#">Pricing</a>
                  <a className="text-sm font-medium hover:text-[#4461ee] transition-colors" href="#">About</a>
                </nav>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-700 dark:text-gray-300 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === 'dark' ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex gap-2">
                    <Link href="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-[#4461ee]/10 hover:bg-[#4461ee]/20 text-[#4461ee] dark:text-white dark:bg-white/10 dark:hover:bg-white/20 text-sm font-bold leading-normal tracking-[0.015em] transition-all">
                      <span className="truncate">Sign In</span>
                    </Link>
                    <Link href="/signup" className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-[#4461ee] hover:bg-[#4461ee]/90 text-white dark:text-white dark:bg-white/10 dark:hover:bg-white/20 text-sm font-bold leading-normal tracking-[0.015em] transition-all">
                      <span className="truncate">Sign Up</span>
                    </Link>
                  </div>
                </div>
              </div>
              {/* Mobile Menu Icon (Placeholder) */}
              <div className="md:hidden text-slate-900 dark:text-white">
                <Menu className="w-6 h-6" />
              </div>
            </div>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-12 md:py-20 lg:py-28">
          <div className="flex flex-col max-w-[960px] flex-1 items-center text-center gap-8">
            <div className="inline-flex items-center gap-2 rounded-full border-[#f72585]/20 bg-[#f72585]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#f72585] shadow-sm backdrop-blur-sm">
              <Star className="w-3 h-3" />
              <span>v2.0 is now live</span>
            </div>
            <h1 className="text-slate-900 dark:text-white text-5xl md:text-7xl font-black leading-tight tracking-[-0.033em]">
              Unleash Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4461ee] to-[#f72585]">Creative Potential</span>
            </h1>
            <h2 className="text-slate-600 dark:text-slate-300 text-lg md:text-xl font-normal leading-relaxed max-w-[640px]">
              The Operating System for Modern Creators. Manage content, protect IP, and scale your audience with our AI-powered suite.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
              <Link href="/signup" className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-[#4461ee] hover:bg-[#4461ee]/90 hover:scale-105 hover:shadow-lg hover:shadow-[#4461ee]/30 text-white text-base font-bold leading-normal tracking-[0.015em] transition-all duration-300">
                <span className="truncate">Get Started Free</span>
              </Link>
              <button className="flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 text-base font-bold leading-normal tracking-[0.015em] transition-all shadow-sm hover:shadow-md dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700">
                <span className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  <span className="truncate">Watch Demo</span>
                </span>
              </button>
            </div>
            {/* Abstract Hero Visual */}
            <div className="mt-12 w-full max-w-[800px] relative rounded-2xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#4461ee]/20 to-[#f72585]/20 mix-blend-overlay z-10"></div>
              <img 
                alt="Abstract 3D gradient shapes representing creativity and flow" 
                className="w-full h-auto aspect-[16/9] object-cover transition-transform duration-700 group-hover:scale-105" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPOPb0PaxjdSP-YLgN2H3lAWbqitv-tTN8EZQBqhaZH6ckX0GpuhKPaKGlfJUTohff_HZqAJhRIJQR7KcbLqYLu_lq6olf8G5J32SZY5PpWaVO8SgXZhd1Vw_o5FRYLmeL1BcTNVKVDEWp4mSD0BoQ1tF9J2i_1tQJe4vF7MOYCSafL_FPJ8hV-bgSExJEQ5u8puaRDQ2S1u9RfOOan2Mo-GCmn3788lK2W-kHYM0Pope682F9Rn6DiuVVJy0oY8974wdMq3KwOME" 
              />
              {/* Glass overlay card inside image */}
              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl border border-white/40 shadow-lg z-20 flex items-center gap-3">
                <div className="size-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-600">
                  <TrendingUpIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monthly Growth</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">+124%</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="px-4 md:px-10 lg:px-40 py-20 relative">
          <div className="flex flex-col max-w-[1280px] mx-auto gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col gap-4 max-w-[600px]">
                <h2 className="text-[#4461ee] font-bold tracking-wider uppercase text-sm">Features</h2>
                <h3 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                  Everything you need to scale
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  Our tools are designed to help you create more and manage less.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {/* Card 1 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/40 bg-white/60 dark:bg-slate-800/40 dark:border-white/5 p-6 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="size-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-[#4461ee] group-hover:scale-110 transition-transform duration-300">
                  <ToyBrick className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-slate-900 dark:text-white text-xl font-bold">AI Clips</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Turn long videos into viral shorts instantly using our advanced AI engine. It detects highlights and crops automatically.
                  </p>
                </div>
              </div>
              {/* Card 2 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/40 bg-white/60 dark:bg-slate-800/40 dark:border-white/5 p-6 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="size-12 rounded-lg bg-pink-500/10 dark:bg-pink-500/20 flex items-center justify-center text-[#f72585] group-hover:scale-110 transition-transform duration-300">
                  <BadgeCheck className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-slate-900 dark:text-white text-xl font-bold">Blockchain Protection</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Secure your intellectual property on-chain automatically. Create immutable proof of ownership for every upload.
                  </p>
                </div>
              </div>
              {/* Card 3 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/40 bg-white/60 dark:bg-slate-800/40 dark:border-white/5 p-6 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="size-12 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-slate-900 dark:text-white text-xl font-bold">Smart Publishing</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    One-click distribution to YouTube, TikTok, and Instagram simultaneously. Schedule once, publish everywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="px-4 md:px-10 lg:px-40 py-20">
          <div className="max-w-[1280px] mx-auto rounded-3xl overflow-hidden relative bg-slate-900 dark:bg-[#4461ee]/20">
            {/* Background decoration for CTA */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-900 z-0"></div>
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[#461ee]/20 to-transparent opacity-50 z-0"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#f72585]/30 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 py-20 text-center">
              <div className="flex flex-col gap-4 max-w-[720px]">
                <h2 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                  Ready to start creating?
                </h2>
                <p className="text-slate-300 text-lg font-normal leading-relaxed">
                  Join thousands of creators using Creator Mind to power their journey. No credit card required.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/signup" className="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-white text-[#4461ee] text-lg font-bold leading-normal tracking-[0.015em] hover:bg-slate-100 hover:scale-105 transition-all shadow-xl shadow-black/20">
                  <span className="truncate">Get Started Free</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0c0e1a]/50 backdrop-blur-sm">
          <div className="px-4 md:px-10 lg:px-40 py-12">
            <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between gap-10">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="w-5 h-5 text-[#4461ee]" />
                  <h2 className="text-lg font-bold">Creator Mind</h2>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                  Empowering the next generation of digital creators with AI and blockchain technology.
                </p>
              </div>
              <div className="flex gap-12 md:gap-24 flex-wrap">
                <div className="flex flex-col gap-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wide">Product</h3>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Features</a>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Pricing</a>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Integrations</a>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wide">Company</h3>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">About</a>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Contact</a>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Blog</a>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wide">Legal</h3>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Privacy</a>
                  <a className="text-slate-600 dark:text-slate-400 hover:text-[#4461ee] dark:hover:text-[#4461ee] text-sm transition-colors" href="#">Terms</a>
                </div>
              </div>
              <div className="max-w-[1280px] mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-80 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-slate-50 dark:text-slate-500 text-sm">© 2024 Creator Mind Inc. All rights reserved.</p>
                <div className="flex gap-4">
                  <a className="text-slate-40 hover:text-slate-600 dark:hover:text-white transition-colors" href="#">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a className="text-slate-40 hover:text-slate-600 dark:hover:text-white transition-colors" href="#">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          </footer>
      </div>
    </div>
  );
}