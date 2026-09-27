import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const WEB_CLIENT_ID =
  "662275162506-85ojnhl3eafr4j53jog8c0ukmte3crj1.apps.googleusercontent.com";

let googleConfigured = false;

export function watchFirebaseUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuth(), callback);
}

function configureGoogle() {
  if (googleConfigured) return;

  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    scopes: ["email", "profile"],
  });

  googleConfigured = true;
}

export async function signInWithGoogle() {
  configureGoogle();

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();

  if (response.type !== "success" || !response.data.idToken) {
    throw new Error("Google sign-in was cancelled.");
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const result = await signInWithCredential(getAuth(), credential);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(
    getAuth(),
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
    getAuth(),
    email.trim(),
    password,
  );

  if (name.trim()) {
    await updateProfile(result.user, { displayName: name.trim() });
  }

  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(getAuth(), email.trim());
}

export async function logoutFirebase() {
  try {
    await GoogleSignin.signOut();
  } catch {
    // An email/password account may not have a Google session.
  }
  await signOut(getAuth());
}
