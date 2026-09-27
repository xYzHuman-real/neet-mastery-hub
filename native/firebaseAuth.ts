import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getApps,
  getApp,
  getReactNativePersistence,
  GoogleAuthProvider,
  initializeApp,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { initializeApp as initializeFirebaseApp } from "firebase/app";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const firebaseConfig = {
  apiKey: "AIzaSyDca8KD7nkcIRUyB0bYIrLDLgK8txX-4LQ",
  authDomain: "buzneet.firebaseapp.com",
  projectId: "buzneet",
  storageBucket: "buzneet.firebasestorage.app",
  messagingSenderId: "662275162506",
  appId: "1:662275162506:android:32df1c3b3fcb6103fb8873",
};

const firebaseApp = getApps().length
  ? getApp()
  : initializeFirebaseApp(firebaseConfig);

const auth =
  Platform.OS === "web"
    ? getAuth(firebaseApp)
    : initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

const WEB_CLIENT_ID =
  "662275162506-85ojnhl3eafr4j53jog8c0ukmte3crj1.apps.googleusercontent.com";

let googleConfigured = false;

export function watchFirebaseUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

function configureGoogle() {
  if (googleConfigured || Platform.OS === "web") return;

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ["email", "profile"],
  });

  googleConfigured = true;
}

export async function signInWithGoogle() {
  if (Platform.OS === "web") {
    const { signInWithPopup } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  configureGoogle();

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();

  if (response.type !== "success" || !response.data.idToken) {
    throw new Error("Google sign-in was cancelled.");
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  return result.user;
}

export async function createEmailAccount(
  name: string,
  email: string,
  password: string,
) {
  const result = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  if (name.trim()) {
    await updateProfile(result.user, { displayName: name.trim() });
  }

  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function logoutFirebase() {
  if (Platform.OS !== "web") {
    try {
      await GoogleSignin.signOut();
    } catch {
      // Email/password accounts may not have a Google session.
    }
  }

  await signOut(auth);
}
