import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  getAuth,
  getReactNativePersistence,
  GoogleAuthProvider,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getApp, getApps, initializeApp as initializeFirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDca8KD7nkcIRUyB0bYIRLDLgK8txX-4LQ",
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

export function watchFirebaseUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogleCredential(
  idToken: string,
  accessToken?: string,
) {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
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
  await signOut(auth);
}
