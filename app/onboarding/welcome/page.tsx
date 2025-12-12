'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../theme-provider';
import { Sparkles, Flag, ChevronRight, HelpCircle } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (!loading && !user) {
      router.push('/login');
    }
    
    // Set dark mode based on theme
    setIsDarkMode(theme === 'dark');
  }, [user, loading, router, theme]);

  const handleStartOnboarding = () => {
    router.push('/onboarding/niche'); // Navigate to niche selection page
  };

  const handleSkipOnboarding = () => {
    router.push('/dashboard'); // Redirect to main dashboard after skipping
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`relative flex min-h-screen w-full flex-col bg-background-light ${isDarkMode ? 'dark' : ''} font-display`}>
      {/* Decorative Gradient Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]"></div>
      </div>
      
      {/* Layout Container */}
      <div className="relative z-10 flex flex-col h-full grow">
        {/* Top Navigation */}
        <header className="flex items-center justify-between border-b border-solid border-b-slate-200 dark:border-b-slate-800 px-6 py-4 md:px-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="text-primary size-8 flex items-center justify-center">
              <Sparkles className="w-full h-full text-primary" />
            </div>
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Creator Mind</h2>
          </div>
          <div className="flex gap-2">
            <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-9 px-4 bg-slate-10 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold leading-normal hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <HelpCircle className="mr-2" size={16} />
              <span className="truncate">Help</span>
            </button>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="glass-card shadow-xl rounded-2xl w-full max-w-[720px] border border-white/20 dark:border-slate-700/50 flex flex-col overflow-hidden animate-fade-in-up">
            {/* Progress Header */}
            <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Flag className="text-primary" size={20} />
                    <p className="text-slate-900 dark:text-white text-sm font-semibold uppercase tracking-wide">Introduction</p>
                  </div>
                  <p className="text-secondary text-sm font-bold leading-normal bg-secondary/10 px-3 py-1 rounded-full">Step 1 of 4</p>
                </div>
                <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-2 w-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
            
            {/* Content Body */}
            <div className="px-8 py-10 md:py-14 flex flex-col items-center text-center">
              {/* Icon Illustration */}
              <div className="mb-8 relative group">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-slate-50 dark:from-slate-700 dark:to-slate-800 p-6 rounded-full shadow-lg border border-slate-100 dark:border-slate-600">
                  <Sparkles className="text-6xl text-primary mx-auto" size={64} />
                </div>
              </div>
              
              {/* Headlines */}
              <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight mb-4 max-w-[500px]">
                Unlock Your Creative Potential
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-relaxed max-w-[540px] mb-10">
                Join thousands of creators turning their ideas into reality. Let's set up your workspace in just 4 simple steps to get you started on the right path.
              </p>
              
              {/* Actions */}
              <div className="flex flex-col gap-4 w-full max-w-[320px]">
                <button 
                  onClick={handleStartOnboarding}
                  className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white text-base font-bold leading-normal tracking-[0.015em] shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span>Start Onboarding</span>
                  <ChevronRight className="ml-2" size={20} />
                </button>
                <button 
                  onClick={handleSkipOnboarding}
                  className="flex w-full cursor-pointer items-center justify-center rounded-xl h-10 px-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium leading-normal hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="truncate">Skip for now</span>
                </button>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 text-center z-10">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-2">
            <Link className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">
              Privacy Policy
            </Link>
            <Link className="text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white text-sm font-medium transition-colors" href="#">
              Terms of Service
            </Link>
          </div>
          <p className="text-slate-400 dark:text-slate-600 text-sm">© 2025 Creator Mind. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}