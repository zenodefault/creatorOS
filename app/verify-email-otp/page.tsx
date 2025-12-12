'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Mail, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmailOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { sendEmailOTP, verifyEmailOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle countdown for resending OTP
 useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && isOTPSent) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      // Reset countdown to allow resending
      setCountdown(0);
    }
    return () => clearTimeout(timer);
  }, [countdown, isOTPSent]);

  // Send OTP when component mounts
  useEffect(() => {
    if (email && !isOTPSent) {
      handleSendOTP();
    }
 }, [email]);

  const handleSendOTP = async () => {
    if (!email) {
      setError('Email address is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendEmailOTP(email);
      setIsOTPSent(true);
      setCountdown(30);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000); // Hide success message after 3 seconds
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    await handleSendOTP();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
 };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
 };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const isValid = await verifyEmailOTP(email, otpCode);
      if (isValid) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/onboarding/welcome'); // Redirect to onboarding welcome page
        }, 2000);
      } else {
        setError('Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-display antialiased text-gray-900 min-h-screen flex flex-col">
      <div className="relative flex min-h-screen w-full flex-col justify-center items-center overflow-hidden bg-gradient-to-br from-background-light via-[#e0e7ff] to-[#f0fdf4] py-10 px-4 dark:from-[#101322] dark:to-[#1a1d30]">
        {/* Decorative abstract blobs for depth behind glass card */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-primary/20 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-secondary/10 blur-3xl -z-10"></div>
        
        {/* Main Card Container */}
        <div className="bg-white/75 backdrop-blur-lg border border-white/50 shadow-[0_8px_32px_0_rgba(68,97,238,0.15)] w-full max-w-[480px] rounded-2xl p-8 sm:p-12 relative z-10 transition-all duration-300 dark:bg-[#1a1d30]/80 dark:border-[#ffffff]/10">
          {/* Back Button */}
          <div className="mb-6">
            <Link
              href="/signup"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Signup
            </Link>
          </div>

          {/* Logo / Brand Area */}
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <Mail className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111218] mb-2">Verify Your Email</h1>
            <p className="text-[#616889] text-sm font-normal">Enter the 6-digit code sent to <span className="font-semibold">{email}</span></p>
          </div>

          {/* OTP Input Fields */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#111218] mb-3">Enter 6-digit code</label>
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-2xl rounded-xl border-2 border-gray-200 bg-white/80 text-[#111218] focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                />
              ))}
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || countdown > 0}
                className="text-sm font-medium text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
              
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={loading || otp.some(d => d === '')}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="text-green-600 w-5 h-5 flex-shrink-0" />
              <p className="text-green-800 text-sm">Email verified successfully! Redirecting...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}