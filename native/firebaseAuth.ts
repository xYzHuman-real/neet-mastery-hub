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
import {
  GoogleOneTapSignIn,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

let googleConfigured = false;

export function watchFirebaseUser(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuth(), callback);
}

function configureGoogle() {
  if (googleConfigured) return;
  GoogleOneTapSignIn.configure({
    webClientId: "autoDetect",
    scopes: ["email", "profile"],
  });
  googleConfigured = true;
}

export async function signInWithGoogle() {
  configureGoogle();
  await GoogleOneTapSignIn.checkPlayServices();

  let response = await GoogleOneTapSignIn.signIn();

  if (!isSuccessResponse(response)) {
    response = await GoogleOneTapSignIn.presentExplicitSignIn();
  }

  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error("Google sign-in was cancelled or no ID token was returned.");
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  const result = await signInWithCredential(getAuth(), credential);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(getAuth(), email.trim(), password);
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
    await GoogleOneTapSignIn.signOut();
  } catch {
    // A Firebase email/password account may not have a Google session.
  }
  await signOut(getAuth());
}
