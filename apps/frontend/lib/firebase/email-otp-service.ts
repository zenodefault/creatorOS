import { auth } from './init';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendSignInLinkToEmail } from 'firebase/auth';

// Generate a random 6-digit OTP
export const generateOTP = (): string => {
 return Math.floor(100000 + Math.random() * 90000).toString();
};

// Store OTP in session storage with expiration
export const storeOTP = (email: string, otp: string, expirationMinutes: number = 10): void => {
  const expirationTime = Date.now() + (expirationMinutes * 60 * 100);
  const otpData = {
    otp,
    expiration: expirationTime
  };
  sessionStorage.setItem(`email_otp_${email}`, JSON.stringify(otpData));
};

// Validate OTP from session storage
export const validateOTP = (email: string, otp: string): boolean => {
  const storedDataStr = sessionStorage.getItem(`email_otp_${email}`);
  if (!storedDataStr) {
    return false;
  }

  try {
    const storedData = JSON.parse(storedDataStr);
    const currentTime = Date.now();
    
    // Check if OTP is expired
    if (currentTime > storedData.expiration) {
      sessionStorage.removeItem(`email_otp_${email}`);
      return false;
    }
    
    // Check if OTP matches
    return storedData.otp === otp;
  } catch (error) {
    console.error('Error validating OTP:', error);
    return false;
  }
};

// Clear OTP from session storage after successful verification
export const clearOTP = (email: string): void => {
  sessionStorage.removeItem(`email_otp_${email}`);
};

// Send OTP to email using a backend service
export const sendEmailOTP = async (email: string): Promise<void> => {
  // Generate OTP
  const otp = generateOTP();
  
  // Store OTP in session storage
  storeOTP(email, otp);
  
  try {
    // Make the actual API call to your backend
    const response = await fetch('/api/send-email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send OTP');
    }
    
    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};