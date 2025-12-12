'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../theme-provider';
import { ThemeToggle } from '../../components/ThemeToggle';
import {
  LayoutDashboard,
  Video,
  MessageSquare,
  Shield,
  BarChart3,
  Users,
  Heart,
  UserPlus,
  DollarSign,
  ArrowUp,
  MoreVertical,
  Menu,
  Sparkles,
  SquarePlus,
 Bot,
  Eye,
  MessageCircle,
  Share,
  Edit,
  Verified,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data for the dashboard
  const metricsData = [
    {
      title: 'Total Reach',
      value: '12.5k',
      change: '+12%',
      icon: Users,
      color: 'text-primary',
      bgClass: 'bg-primary/10'
    },
    {
      title: 'Engagement',
      value: '4.2%',
      change: '+0.8%',
      icon: Heart,
      color: 'text-secondary',
      bgClass: 'bg-secondary/10'
    },
    {
      title: 'Net Followers',
      value: '+120',
      change: '+5',
      icon: UserPlus,
      color: 'text-primary',
      bgClass: 'bg-primary/10'
    },
    {
      title: 'Est. Earnings',
      value: '$340',
      change: '+$12',
      icon: DollarSign,
      color: 'text-emerald-500',
      bgClass: 'bg-emerald-500/10'
    }
  ];

 const scheduleItems = [
    {
      day: 'Mon',
      date: '10',
      title: 'Instagram Reel',
      time: '10:00 AM',
      category: 'Design Tips'
    },
    {
      day: 'Fri',
      date: '14',
      title: 'YouTube Short',
      time: '2:00 PM',
      category: 'Studio Tour'
    }
 ];

  const aiAlerts = [
    {
      type: 'trend',
      title: 'Trend Alert',
      message: '#CreatorEconomy is rising rapidly. Create a post now to capture traffic.',
      icon: TrendingUp,
      color: 'text-secondary',
      borderColor: 'border-secondary/20',
      bgColor: 'bg-secondary/5 dark:bg-secondary/10'
    },
    {
      type: 'copyright',
      title: 'Copyright Check',
      message: 'Your latest draft passed all copyright protection checks.',
      icon: Verified,
      color: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-500/5 dark:bg-emerald-500/10'
    }
  ];

  const topPost = {
    thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoImExLSe-CWYP6mRFMHCnnhd5P9vYcoap8RmMBFoacskNlHV66FbIDfRDZUBPbv8pea61GYddd1nBtbda0GfO6t3IWdCQU_-syvKrImdmutDrnTdvRxIXILDlzMSbCkdCt9KUqbbT6PL_0dGxARIs4_5rvz1WxEKNzu1HRIyGrKXaJJgQHdeu6KPyVQoNgeMGTBI99fknf8UQovQLQudpP787tvudRUmDIEaeMuDkcWDnSs23G0BRNsy9nRmrPDUpuO8zfIRCHw',
    type: 'Video',
    title: 'How to utilize AI tools for better content creation',
    postedTime: 'Posted 2 days ago',
    stats: [
      { icon: Eye, label: 'views', value: '5k' },
      { icon: MessageCircle, label: 'comments', value: '200' },
      { icon: Share, label: 'shares', value: '45' }
    ]
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors duration-200`}>
      {/* Left Sidebar */}
      <aside className={`hidden w-64 flex-col justify-between border-r border-slate-200 bg-surface-light p-4 dark:border-slate-800 dark:bg-surface-dark lg:flex transition-all duration-300`}>
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Creator Mind</h1>
          </div>
          
          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="group flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary transition-all hover:bg-primary/20">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <Video className="w-5 h-5" />
              <span className="font-medium">Studio</span>
            </Link>
            <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Chatbot</span>
            </Link>
            <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Protection</span>
            </Link>
            <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </Link>
            <Link href="/settings" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 rounded-2xl border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: user?.photoURL ? `url("${user?.photoURL}")` : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC12DYAM_9gP7gHS4ToN5eL2AXb3aqerXqaurhCUNxYs0DsqHvaZUib7Y9FSuYSebzUykMHIcnmz7JgMRKqmqi_O4leGoB1Vw6S5aZGldCnrI4XGT8oU1jA420L_9Z-TReB_evqREb9OgNl6uHHo7BhK2DuIldR5cv5aETfGnGRHyE29w2BrL7ukZ9IYuoOQlK6dx2qFs7k9MUcKNOUQkSbjPkGNwZ3dFWZ-iWtTYkORRDPFx2BhkcNyEEesQ2v7-1N9KLdGMbYT3U')" }}>
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pro Creator</p>
          </div>
          <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        {/* Header Mobile Only */}
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between bg-surface-light/80 px-4 backdrop-blur-md dark:bg-surface-dark/80 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold">Creator Mind</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="p-2 text-slate-60 dark:text-slate-300"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-y-0 left-0 z-40 w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 lg:hidden">
            <div className="flex flex-col gap-6 p-4 h-full">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Creator Mind</h1>
              </div>
              
              <nav className="flex flex-col gap-2 flex-1">
                <Link href="/dashboard" className="group flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-primary transition-all hover:bg-primary/20">
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                  <Video className="w-5 h-5" />
                  <span className="font-medium">Studio</span>
                </Link>
                <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Chatbot</span>
                </Link>
                <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Protection</span>
                </Link>
                <Link href="#" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                </Link>
                <Link href="/settings" className="group flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </Link>
              </nav>
              
              <div className="flex items-center gap-3 rounded-2xl border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-200 bg-cover bg-center" style={{ backgroundImage: user?.photoURL ? `url("${user?.photoURL}")` : "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC12DYAM_9gP7gHS4ToN5eL2AXb3aqerXqaurhCUNxYs0DsqHvaZUib7Y9FSuYSebzUykMHIcnmz7JgMRKqmqi_O4leGoB1Vw6S5aZGldCnrI4XGT8oU1jA420L_9Z-TReB_evqREb9OgNl6uHHo7BhK2DuIldR5cv5aETfGnGRHyE29w2BrL7ukZ9IYuoOQlK6dx2qFs7k9MUcKNOUQkSbjPkGNwZ3dFWZ-iWtTYkORRDPFx2BhkcNyEEesQ2v7-1N9KLdGMbYT3U')" }}>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.displayName || user?.email?.split('@')[0] || 'User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pro Creator</p>
                </div>
                <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-1 flex-col xl:flex-row">
          {/* Center Panel: Metrics & Charts */}
          <div className="flex-1 p-6 xl:p-10">
            <div className="mx-auto flex max-w-5xl flex-col gap-8">
              {/* Welcome Text */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h2>
                <p className="text-slate-500 dark:text-slate-400">Welcome back, here's what's happening with your content today.</p>
              </div>
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metricsData.map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 rounded-2xl bg-surface-light p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md dark:bg-surface-dark dark:ring-white/10"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{metric.title}</p>
                        <div className={`p-2 rounded-lg ${metric.bgClass}`}>
                          <IconComponent className={`w-5 h-5 ${metric.color}`} />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{metric.value}</p>
                        <span className="flex items-center text-xs font-medium text-emerald-500">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> {metric.change}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Chart Section */}
              <div className="flex flex-col gap-4 rounded-2xl bg-surface-light p-6 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">7-Day Performance</h3>
                  <select className="rounded-lg border-none bg-slate-100 px-3 py-1 text-xs font-medium text-slate-60 focus:ring-0 dark:bg-slate-800 dark:text-slate-300">
                    <option>Views</option>
                    <option>Likes</option>
                    <option>Shares</option>
                  </select>
                </div>
                <div className="relative h-[240px] w-full pt-4">
                  {/* Simplified Chart SVG */}
                  <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4461ee" stopOpacity="0.2"></stop>
                        <stop offset="100%" stopColor="#4461ee" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeWidth="1" x1="0" x2="500" y1="150" y2="150"></line>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="100" y2="100"></line>
                    <line className="dark:stroke-slate-700" stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="500" y1="50" y2="50"></line>
                    {/* Line Path */}
                    <path d="M0 120 C 50 120, 70 80, 100 80 S 150 110, 200 90 S 250 40, 300 40 S 350 70, 400 60 S 450 20, 500 20" fill="url(#chartGradient)" stroke="none"></path>
                    <path d="M0 120 C 50 120, 70 80, 100 80 S 150 110, 200 90 S 250 40, 300 40 S 350 70, 400 60 S 450 20, 500 20" fill="none" stroke="#4461ee" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                    {/* Tooltip Point Example */}
                    <circle className="shadow-lg" cx="400" cy="60" fill="#4461ee" r="6" stroke="white" strokeWidth="3"></circle>
                  </svg>
                </div>
                <div className="flex justify-between px-2 text-xs font-medium text-slate-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
              </div>
            
              {/* Top Performing Post */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Post</h3>
                <div className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-surface-light p-4 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md dark:bg-surface-dark dark:ring-white/10 sm:flex-row sm:items-center">
                  <div className="aspect-video w-full flex-shrink-0 overflow-hidden rounded-xl bg-slate-200 sm:w-48">
                    <div 
                      className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                      style={{ backgroundImage: `url(${topPost.thumbnail})` }}
                    ></div>
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{topPost.type}</div>
                      <span className="text-xs text-slate-400">{topPost.postedTime}</span>
                    </div>
                    <h4 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">{topPost.title}</h4>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      {topPost.stats.map((stat, idx) => {
                        const StatIcon = stat.icon;
                        return (
                          <div key={idx} className="flex items-center gap-1">
                            <StatIcon className="w-4 h-4" /> {stat.value}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        
          {/* Right Panel: Utilities & Widgets */}
          <aside className="w-full border-l border-slate-200 bg-surface-light/50 p-6 dark:border-slate-800 dark:bg-surface-dark/50 xl:w-96">
            <div className="flex flex-col gap-8">
              {/* Quick Actions */}
              <div>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-primary p-4 text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
                    <SquarePlus className="w-6 h-6" />
                    <span className="text-sm font-semibold">Create Post</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-transform active:scale-95 hover:bg-slate-50 dark:bg-surface-dark dark:text-white dark:ring-white/10 dark:hover:bg-slate-800">
                    <Bot className="w-6 h-6" />
                    <span className="text-sm font-semibold">Ask AI</span>
                  </button>
                  <button className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-900/5 transition-transform active:scale-95 hover:bg-slate-50 dark:bg-surface-dark dark:text-white dark:ring-white/10 dark:hover:bg-slate-800">
                    <BarChart3 className="w-5 h-5" />
                    <span className="text-sm font-semibold">View Full Analytics Report</span>
                  </button>
                </div>
              </div>
            
              {/* Upcoming Schedule */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schedule</h3>
                  <button className="text-xs font-semibold text-primary hover:underline">View All</button>
                </div>
                <div className="flex flex-col gap-3">
                  {scheduleItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-900/5 dark:bg-surface-dark dark:ring-white/10">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="text-xs font-bold uppercase">{item.day}</span>
                        <span className="text-sm font-bold">{item.date}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.time} • {item.category}</p>
                      </div>
                      <button className="ml-auto rounded-full p-1 text-slate-40 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* AI Alerts */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">AI Insights</h3>
                <div className="flex flex-col gap-3">
                  {aiAlerts.map((alert, index) => {
                    const AlertIcon = alert.icon;
                    return (
                      <div 
                        key={index} 
                        className={`relative overflow-hidden rounded-xl border ${alert.borderColor} ${alert.bgColor} p-4`}
                      >
                        <div className="absolute -right-2 -top-2 text-secondary/10">
                          <AlertIcon className="w-16 h-16" />
                        </div>
                        <div className="relative flex items-start gap-3">
                          <AlertIcon className={`w-5 h-5 ${alert.color}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</p>
                            <p className="text-xs leading-relaxed text-slate-60 dark:text-slate-300">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}