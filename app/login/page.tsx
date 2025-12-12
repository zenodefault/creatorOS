"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { useTheme } from '../theme-provider';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, setTheme } = useTheme();
 const router = useRouter();
 const { signIn, completeEmailSignIn } = useAuth();

    // Check for email link sign-in
    useEffect(() => {
      // Check if this is an email link sign-in
      if (typeof window !== 'undefined' && window.location.search.includes('oobCode')) {
        const emailForSignIn = window.localStorage.getItem('emailForSignIn');
        if (emailForSignIn) {
          // This is an email link sign-in, handle it automatically
          handleEmailLinkSignIn();
        }
      }
    }, []);

    const handleEmailLinkSignIn = async () => {
      try {
        setIsLoading(true);
        const emailForSignIn = window.localStorage.getItem('emailForSignIn');
        
        if (!emailForSignIn) {
          throw new Error('Email not found in local storage. Please try signing up again.');
        }

        // Complete the sign-in process using the email link
        await completeEmailSignIn(emailForSignIn);
        
        // Clear the stored email
        window.localStorage.removeItem('emailForSignIn');
        
        // Redirect to the home page after successful verification
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'An error occurred during email verification');
      } finally {
        setIsLoading(false);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
        // Basic validation
        if (!email || !password) {
          throw new Error('Please enter both email and password');
        }

        // Firebase authentication
        await signIn(email, password);
        // Redirect to onboarding welcome page after successful login
        router.push('/onboarding/welcome');
      } catch (err: any) {
        setError(err.message || 'An error occurred during login');
      } finally {
        setIsLoading(false);
      }
    };

  const { signInWithGoogle } = useAuth();
 
    const handleGoogleLogin = async () => {
      setIsLoading(true);
      setError('');
      try {
        await signInWithGoogle();
        router.push('/');
      } catch (err: any) {
        setError(err.message || 'An error occurred during Google login');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="font-display antialiased text-gray-900 min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-background-light via-[#e0e7ff] to-[#f0fdf4] py-10 px-4 dark:from-[#101322] dark:to-[#1a1d30]">
        {/* Decorative abstract blobs for depth behind glass card */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl -z-10"></div>
        
        <div className="w-full flex justify-end mb-4">
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
        </div>
        {/* Main Card Container */}
        <div className="bg-white/75 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(68,97,238,0.15)] w-full max-w-[480px] rounded-2xl p-8 sm:p-12 relative z-10 transition-all duration-300 dark:bg-[#1a1d30]/80 dark:border-[#ffffff]/10">
          {/* Logo / Brand Area */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111218] mb-2">Welcome to Creator Mind</h1>
            <p className="text-[#616889] text-sm font-normal">Unleash your creative potential.</p>
          </div>
          
          {/* Social Login */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white border border-gray-200 px-6 py-3.5 text-base font-semibold text-[#111218] transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  {/* Google Icon SVG manually embedded for precision as Material Symbols doesn't have brand logos usually */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative bg-white/60 px-4 text-xs font-medium uppercase text-[#616889] backdrop-blur-sm rounded-full">
              Or continue with email
            </div>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111218]" htmlFor="email">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="text-gray-400 text-sm" />
                </div>
                <input 
                  className="block w-full rounded-xl border-gray-200 bg-white/80 py-3.5 pl-10 pr-3 text-[#111218] placeholder:text-[#616889] focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all duration-200 hover:bg-white" 
                  id="email"
                  name="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-[#111218]" htmlFor="password">Password</label>
                <a className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="text-gray-400 text-sm" />
                </div>
                <input 
                  className="block w-full rounded-xl border-gray-200 bg-white/80 py-3.5 pl-10 pr-10 text-[#111218] placeholder:text-[#616889] focus:border-primary focus:ring-primary sm:text-sm shadow-sm transition-all duration-200 hover:bg-white" 
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div 
                  className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="text-gray-400 group-hover:text-primary transition-colors text-sm" />
                  ) : (
                    <Eye className="text-gray-400 group-hover:text-primary transition-colors text-sm" />
                  )}
                </div>
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="text-red-50 text-sm font-medium bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            
            {/* Submit Button */}
            <button
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/40 active:translate-y-0 active:shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Log in
                </span>
              )}
            </button>
          </form>
          
          {/* Footer */}
          <div className="mt-6 text-center text-sm text-[#616889] space-y-2">
            <div>
              Don't have an account?
              <Link className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all" href="/signup">Sign up</Link>
            </div>
            <div>
              Or verify with phone?
              <Link className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all" href="/verify-otp">Verify with OTP</Link>
            </div>
          </div>
        </div>
        
        {/* Subtle Footer Links */}
        <div className="mt-8 flex gap-6 text-xs text-gray-500/70">
          <Link className="hover:text-gray-600 transition-colors" href="#">Privacy Policy</Link>
          <Link className="hover:text-gray-600 transition-colors" href="#">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}