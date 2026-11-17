import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  Auth,
  UserCredential
} from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCjzdg4RJIooL91zf_8YDxvbjLrUxC-Uv8",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "the-vichaar-council.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "the-vichaar-council",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "the-vichaar-council.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "792124450135",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:792124450135:web:ff70d2f4ee6e17a8844a12",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-TPJBGTCXKM"
};

// Safe client-side app initialization
export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Client-side Firebase Auth instance
export function getFirebaseAuth(): Auth {
  const app = getFirebaseApp();
  return getAuth(app);
}

// Configured Google Auth Provider
export function getGoogleAuthProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });
  return provider;
}

/**
 * Triggers Google Sign-In with Firebase popup.
 * Returns user details and ID token.
 */
export async function signInWithGoogleFirebase(): Promise<{
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  idToken: string;
}> {
  const auth = getFirebaseAuth();
  const provider = getGoogleAuthProvider();

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const user = result.user;
    const idToken = await user.getIdToken();

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      idToken
    };
  } catch (error: any) {
    // If popup is blocked by the user's browser, provide clear actionable guidance
    if (error.code === "auth/popup-blocked") {
      throw new Error("Sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
    }
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google Sign-In was cancelled.");
    }
    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn("Firebase sign out warning:", err);
  }
}
