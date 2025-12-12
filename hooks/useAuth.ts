'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../lib/firebase/init';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  resetPassword,
  setupRecaptcha,
  sendOTP,
  verifyOTP,
  getCurrentUser,
  isAuthenticated,
  signInWithGoogle as signInWithGoogleService,
  sendEmailVerification,
  completeEmailSignIn,
  sendEmailOTP,
  verifyEmailOTP
} from '../lib/firebase/auth-service';

type AuthContextType = {
  user: User | null;
  loading: boolean;
 signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  setupRecaptcha: (recaptchaContainer: string | HTMLElement) => any;
  sendOTP: (phoneNumber: string, recaptchaVerifier: any) => Promise<any>;
  verifyOTP: (confirmationResult: any, otp: string) => Promise<void>;
  sendEmailOTP: (email: string) => Promise<void>;
  verifyEmailOTP: (email: string, otp: string) => Promise<boolean>;
  sendEmailVerification: (email: string) => Promise<void>;
  completeEmailSignIn: (email: string) => Promise<any>;
  getCurrentUser: () => User | null;
  isAuthenticated: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

 const signIn = async (email: string, password: string) => {
    const user = await signInWithEmail(email, password);
    setUser(user);
  };

  const signUp = async (email: string, password: string) => {
    const user = await signUpWithEmail(email, password);
    setUser(user);
 };

  const handleSendEmailOTP = async (email: string) => {
      await sendEmailOTP(email);
    };
  
    const handleVerifyEmailOTP = async (email: string, otp: string) => {
      return await verifyEmailOTP(email, otp);
    };
  
    const handleSendEmailVerification = async (email: string) => {
      await sendEmailVerification(email);
    };
  
    const handleCompleteEmailSignIn = async (email: string) => {
      return await completeEmailSignIn(email);
   };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleSignInWithGoogle = async () => {
    const user = await signInWithGoogleService();
    setUser(user);
  };

  const value = {
      user,
      loading,
      signIn,
      signUp,
      signOut: handleSignOut,
      signInWithGoogle: handleSignInWithGoogle,
      resetPassword: (email: string) => resetPassword(email),
      setupRecaptcha,
      sendOTP,
      verifyOTP,
      sendEmailOTP: handleSendEmailOTP,
      verifyEmailOTP: handleVerifyEmailOTP,
      sendEmailVerification: handleSendEmailVerification,
      completeEmailSignIn: handleCompleteEmailSignIn,
      getCurrentUser,
      isAuthenticated
    };

  // Return JSX element
 return React.createElement(
    AuthContext.Provider,
    { value: value },
    children
 );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}