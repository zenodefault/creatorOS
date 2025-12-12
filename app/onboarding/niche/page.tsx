'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../theme-provider';
import { ArrowLeft, ArrowRight, Brain, Video, Palette, FileText, Mic, Terminal, TrendingUp, Search, HelpCircle } from 'lucide-react';

export default function NicheSelectionPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [otherNiche, setOtherNiche] = useState('');

  const niches = [
    { id: 'video', label: 'Video Creation', icon: Video },
    { id: 'art', label: 'Digital Art', icon: Palette },
    { id: 'writing', label: 'Writing', icon: FileText },
    { id: 'podcasting', label: 'Podcasting', icon: Mic },
    { id: 'development', label: 'Development', icon: Terminal },
    { id: 'marketing', label: 'Marketing', icon: TrendingUp },
  ];

  const handleContinue = () => {
    // In a real app, you would save the selected niche to the user's profile
    console.log('Selected niche:', selectedNiche || otherNiche);
    router.push('/onboarding/connect'); // Navigate to next step
  };

  const handleBack = () => {
    router.back(); // Go back to welcome page
  };

  return (
    <div className={`relative flex min-h-screen w-full flex-col ${theme === 'dark' ? 'dark' : ''} font-display bg-background-light dark:bg-background-dark text-[#111218] dark:text-white`}>
      {/* Animated background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[15%] w-[300px] h-[300px] bg-primary/8 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[30%] right-[15%] w-[200px] h-[200px] bg-secondary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Layout Container */}
      <div className="relative z-10 flex flex-col h-full grow">
        {/* Top Navigation */}
        <header className="flex items-center justify-between border-b border-solid border-b-[#f0f1f4] dark:border-white/5 px-8 py-4 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary bg-primary/10 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <h2 className="text-[#111218] dark:text-white text-lg font-bold tracking-tight">Creator Mind</h2>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-medium text-gray-500 hover:text-primary dark:text-gray-400 transition-colors">
              Help
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-[#111218] dark:text-white bg-[#f0f1f4] dark:bg-white/10 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-colors">
              <span>Save & Exit</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex justify-center items-center py-10 px-4 md:px-8">
          <div className="w-full max-w-[960px] flex flex-col gap-6">
            {/* Progress Section */}
            <div className="flex flex-col gap-2 px-1">
              <div className="flex justify-between items-end">
                <p className="text-primary font-bold text-sm tracking-wide uppercase">Step 2 of 4</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm font-medium">50% Completed</p>
              </div>
              <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-[#6366f1] w-1/2 rounded-full shadow-[0_0_10px_rgba(68,97,238,0.5)]"></div>
              </div>
            </div>

            {/* Central Card */}
            <div className="bg-white dark:bg-[#1a1d2d] rounded-2xl shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="p-8 md:p-10 flex flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col gap-2 text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-[#111218] dark:text-white tracking-tight">Define your creative space.</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Select the category that best describes your content. This helps us customize your tools.</p>
                </div>

                {/* Niche Selection Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {niches.map((niche) => {
                    const IconComponent = niche.icon;
                    return (
                      <button
                        key={niche.id}
                        className={`group relative flex flex-col items-center justify-center gap-4 p-6 rounded-xl border-2 ${
                          selectedNiche === niche.id
                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                            : 'border-transparent bg-gray-50 dark:bg-white/5 hover:border-primary/30 hover:bg-white dark:hover:bg-white/10 hover:shadow-lg'
                        } transition-all duration-200 hover:-translate-y-1`}
                        onClick={() => {
                          setSelectedNiche(niche.id);
                          setOtherNiche('');
                        }}
                      >
                        {selectedNiche === niche.id && (
                          <div className="absolute top-3 right-3 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </div>
                        )}
                        <div className={`size-14 rounded-full bg-white dark:bg-white/10 shadow-sm flex items-center justify-center ${
                          selectedNiche === niche.id ? 'text-secondary scale-110' : 'text-gray-500 dark:text-gray-400 group-hover:text-secondary group-hover:scale-110'
                        } transition-all duration-300`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="text-[#111218] dark:text-white font-semibold text-base">{niche.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Other Niche Input */}
                <div className="pt-2">
                  <label className="block">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm mb-2 block">Not on the list?</span>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400 group-focus-within/input:text-primary transition-colors w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={otherNiche}
                        onChange={(e) => {
                          setOtherNiche(e.target.value);
                          setSelectedNiche(null);
                        }}
                        placeholder="Type your own niche..."
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-[#111218] dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer / Action Buttons */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-[#151828] border-t border-gray-100 dark:border-white/5 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                <button
                  onClick={handleBack}
                  className="w-full md:w-auto px-6 py-3 rounded-xl text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="text-lg" />
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  disabled={!selectedNiche && otherNiche.trim() === ''}
                  className={`w-full md:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                    selectedNiche || otherNiche.trim() !== ''
                      ? 'bg-primary text-white shadow-primary/30 hover:bg-[#3350dd] hover:shadow-primary/50 hover:-translate-y-0.5'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="text-lg" />
                </button>
              </div>
            </div>

            {/* Footer Help Text */}
            <p className="text-center text-gray-400 dark:text-gray-600 text-sm">
              Steps are saved automatically. You can change this later in settings.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}