'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../theme-provider';
import { 
  Brain, 
  Zap, 
  Play, 
  Camera, 
  Music, 
  Briefcase, 
  CheckCircle, 
  Lock,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export default function ConnectPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [connectedPlatforms, setConnectedPlatforms] = useState({
    youtube: false,
    instagram: true, // Pre-connected as shown in the original
    tiktok: false,
    linkedin: false,
  });

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Import video analytics & views',
      icon: Play,
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: '@creatormind_official',
      icon: Camera,
      color: 'text-transparent bg-clip-text bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500',
      bgColor: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]',
      connected: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      description: 'Sync follower growth & trends',
      icon: Music,
      color: 'text-white dark:text-gray-200',
      bgColor: 'bg-black dark:bg-black/40 relative overflow-hidden',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Analyze professional reach',
      icon: Briefcase,
      color: 'text-[#0077b5]',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
  ];

  const handlePlatformConnect = (platformId: string) => {
    setConnectedPlatforms(prev => ({
      ...prev,
      [platformId]: !prev[platformId as keyof typeof prev]
    }));
  };

  const handleBack = () => {
    router.push('/onboarding/niche');
  };

  const handleContinue = () => {
    router.push('/onboarding/preferences');
  };

  const totalPlatforms = platforms.length;
  const connectedCount = Object.values(connectedPlatforms).filter(Boolean).length;
  const progressPercentage = 75; // Fixed at 75% as this is the 3rd step of 4 in the onboarding flow

  return (
    <div className={`relative flex min-h-screen w-full flex-col ${theme === 'dark' ? 'dark' : ''} font-display bg-background-light dark:bg-background-dark text-[#111218] dark:text-white transition-colors duration-200`}>
      {/* Ambient Background Effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* Layout Container */}
      <div className="relative z-10 flex flex-col h-full grow">
        {/* Navbar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-gray-800 bg-white/80 dark:bg-[#101322]/80 backdrop-blur-md px-6 lg:px-10 py-4 fixed w-full top-0 z-50">
          <div className="flex items-center gap-4 text-primary">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-[#111218] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Creator Mind</h2>
          </div>
        </header>
        
        {/* Main Content Layout */}
        <div className="layout-container flex h-full grow flex-col pt-20">
          <div className="px-4 md:px-40 flex flex-1 justify-center py-10 relative">
            <div className="layout-content-container flex flex-col max-w-[720px] flex-1 z-10">
              {/* Progress Bar Section */}
              <div className="flex flex-col gap-3 p-4 mb-6">
                <div className="flex gap-6 justify-between items-center">
                  <p className="text-[#111218] dark:text-white text-sm font-semibold uppercase tracking-wider text-primary">Step 3 of 4: Connect</p>
                  <p className="text-[#616889] dark:text-gray-400 text-sm font-medium">{Math.round(progressPercentage)}%</p>
                </div>
                <div className="rounded-full bg-[#dbdde6] dark:bg-gray-700 h-2 w-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Main Card */}
              <div className="bg-white/80 dark:bg-[#1a1d2d]/90 backdrop-blur-xl rounded-xl shadow-soft border border-white/20 dark:border-gray-700 p-8 md:p-12 transition-all">
                {/* Header Icon */}
                <div className="flex justify-center mb-6">
                  <div className="size-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                </div>
                
                {/* Text Content */}
                <h1 className="text-[#111218] dark:text-white tracking-tight text-3xl md:text-[32px] font-bold leading-tight px-4 text-center pb-3">Connect your channels</h1>
                <p className="text-[#616889] dark:text-gray-400 text-base font-normal leading-normal pb-8 pt-1 px-4 text-center max-w-lg mx-auto">
                  Sync your social platforms to let Creator Mind analyze your audience data and generate personalized insights.
                </p>
                
                {/* Platform List */}
                <div className="flex flex-col gap-4 mb-8">
                  {platforms.map((platform) => {
                    const IconComponent = platform.icon;
                    const isConnected = platform.connected || connectedPlatforms[platform.id as keyof typeof connectedPlatforms];
                    
                    return (
                      <div 
                        key={platform.id}
                        className={`group flex items-center justify-between p-4 rounded-lg border ${
                          isConnected 
                            ? 'border-primary/40 bg-primary/[0.03] dark:bg-primary/[0.1] dark:border-primary/50' 
                            : 'border-[#e5e7eb] dark:border-gray-700 hover:border-primary/30 hover:bg-primary/[0.02] bg-white dark:bg-gray-800'
                        } transition-all duration-200 ${!isConnected ? 'cursor-pointer' : ''}`}
                        onClick={() => !isConnected && handlePlatformConnect(platform.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`size-12 rounded-lg ${platform.bgColor} flex items-center justify-center shrink-0`}>
                            {platform.id === 'instagram' ? (
                              // Special handling for Instagram gradient background
                              <div className="bg-white dark:bg-gray-800 w-full h-full rounded-[6px] flex items-center justify-center">
                                <IconComponent className={platform.color} size={24} />
                              </div>
                            ) : platform.id === 'tiktok' ? (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-fuchsia-500 opacity-20"></div>
                                <IconComponent className={platform.color} size={24} />
                              </>
                            ) : (
                              <IconComponent className={platform.color} size={24} />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-[#111218] dark:text-white font-semibold text-base">{platform.name}</h3>
                            <p className="text-[#616889] dark:text-gray-400 text-sm">{platform.description}</p>
                          </div>
                        </div>
                        
                        {isConnected ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm px-4 py-2">
                            <CheckCircle size={18} />
                            <span>Connected</span>
                          </div>
                        ) : (
                          <button 
                            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm shadow-primary/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlatformConnect(platform.id);
                            }}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Footer Actions */}
                <div className="flex flex-col gap-4 mt-4">
                  <button 
                    className="w-full rounded-lg bg-primary px-4 py-3 text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                    onClick={handleContinue}
                  >
                    Continue
                  </button>
                  <button 
                    className="w-full text-center text-[#616889] dark:text-gray-400 text-sm font-medium hover:text-[#111218] dark:hover:text-white transition-colors"
                    onClick={handleBack}
                  >
                    I'll do this later
                  </button>
                </div>
              </div>
              
              {/* Bottom Helper Text */}
              <div className="mt-6 text-center">
                <p className="text-xs text-[#616889] dark:text-gray-500">
                  <Lock className="inline align-middle text-sm mr-1" size={16} />
                  Your data is encrypted and secure. We never post without your permission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}