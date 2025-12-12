import {
  signInWithEmailAndPassword,
   createUserWithEmailAndPassword,
   signOut,
   sendPasswordResetEmail,
   RecaptchaVerifier,
   signInWithPhoneNumber,
   GoogleAuthProvider,
   signInWithPopup,
   Auth,
   User,
   sendSignInLinkToEmail,
    signInWithEmailLink,
    isSignInWithEmailLink
 } from 'firebase/auth';
 import { auth } from './init';
 import { FirebaseError } from 'firebase/app';
 import { sendEmailOTP as sendEmailOTPService, validateOTP, clearOTP } from './email-otp-service';
 
 // Email/Password Authentication
 export const signInWithEmail = async (email: string, password: string) => {
   try {
     const userCredential = await signInWithEmailAndPassword(auth, email, password);
     return userCredential.user;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 export const signUpWithEmail = async (email: string, password: string) => {
   try {
     const userCredential = await createUserWithEmailAndPassword(auth, email, password);
     return userCredential.user;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 export const signOutUser = async () => {
   try {
     await signOut(auth);
  } catch (error) {
     throw handleAuthError(error);
  }
 };

 export const resetPassword = async (email: string) => {
   try {
     await sendPasswordResetEmail(auth, email);
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 // OTP Authentication
 export const setupRecaptcha = (recaptchaContainer: string | HTMLElement) => {
   if (typeof window !== 'undefined') {
     // @ts-ignore - RecaptchaVerifier is not typed in the Firebase SDK
     return new RecaptchaVerifier(recaptchaContainer, {
       'size': 'invisible',
       'callback': (response: string) => {
         // reCAPTCHA solved, allow signInWithPhoneNumber.
         console.log('reCAPTCHA verified');
       },
       'expired-callback': () => {
         // Response expired. Ask user to solve reCAPTCHA again.
         console.log('reCAPTCHA expired');
       }
     }, auth);
   }
 };

 export const sendOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
   try {
     // Format phone number with + and country code (for demo, assuming US)
     const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
     
     const confirmationResult = await signInWithPhoneNumber(auth, formattedPhoneNumber, recaptchaVerifier);
     return confirmationResult;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 export const verifyOTP = async (confirmationResult: any, otp: string) => {
   try {
     const userCredential = await confirmationResult.confirm(otp);
     return userCredential.user;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 // Email OTP Authentication
  export const sendEmailOTP = async (email: string) => {
    try {
      await sendEmailOTPService(email);
    } catch (error) {
      throw handleAuthError(error);
    }
  };

 export const verifyEmailOTP = async (email: string, otp: string) => {
   try {
     const isValid = validateOTP(email, otp);
     if (!isValid) {
       throw new Error('Invalid or expired OTP');
     }
     
     // Clear the OTP after successful verification
     clearOTP(email);
     
     return isValid;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 // Helper function to handle Firebase authentication errors
 const handleAuthError = (error: unknown) => {
   if (error instanceof FirebaseError) {
     switch (error.code) {
       case 'auth/user-not-found':
         return new Error('No user found with this email address.');
       case 'auth/wrong-password':
         return new Error('Incorrect password. Please try again.');
       case 'auth/invalid-email':
         return new Error('Invalid email address format.');
       case 'auth/email-already-in-use':
         return new Error('Email address is already in use.');
       case 'auth/weak-password':
         return new Error('Password is too weak. Please use at least 6 characters.');
       case 'auth/too-many-requests':
         return new Error('Too many requests. Please try again later.');
       case 'auth/invalid-phone-number':
         return new Error('Invalid phone number format.');
       case 'auth/quota-exceeded':
         return new Error('SMS quota exceeded. Please try again later.');
       default:
         return new Error(error.message || 'Authentication failed. Please try again.');
     }
   }
   return new Error('An unexpected error occurred during authentication.');
 };

 // Get current user
 export const getCurrentUser = (): User | null => {
   return auth.currentUser;
 };

 // Google Authentication
 export const signInWithGoogle = async () => {
   try {
     const provider = new GoogleAuthProvider();
     const userCredential = await signInWithPopup(auth, provider);
     return userCredential.user;
   } catch (error) {
     throw handleAuthError(error);
   }
 };

 // Check if user is authenticated
 export const isAuthenticated = (): boolean => {
   return auth.currentUser !== null;
 };

 // Email Verification using Firebase's built-in email link authentication
 export const sendEmailVerification = async (email: string) => {
   try {
     const actionCodeSettings = {
       url: `${window.location.origin}/login`, // Redirect to login after clicking the link
       handleCodeInApp: true,
     };
     
     await sendSignInLinkToEmail(auth, email, actionCodeSettings);
     // Save the email locally so we know which email to verify when the link is clicked
     window.localStorage.setItem('emailForSignIn', email);
  } catch (error) {
     throw handleAuthError(error);
  }
 };

 // Complete the sign-in process using the email link
 export const completeEmailSignIn = async (email: string) => {
   try {
     // Complete the sign-in process
     const result = await signInWithEmailLink(auth, email, window.location.href);
     
     // Clean up the URL by removing the email action code
     const newUrl = window.location.protocol + '//' +
                    window.location.host +
                    window.location.pathname;
     window.history.replaceState({}, document.title, newUrl);
     
     return result.user;
   } catch (error) {
     throw handleAuthError(error);
  }
 };