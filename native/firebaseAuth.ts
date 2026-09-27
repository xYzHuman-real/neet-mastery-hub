import AsyncStorage from "@react-native-async-storage/async-storage";

const API_KEY = "AIzaSyDca8KD7nkcIRUyB0bYIrLDLgK8txX-4LQ";
const AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";
const GOOGLE_REQUEST_URI = "https://buzneet.firebaseapp.com/__/auth/handler";
const SESSION_KEY = "buzneet-firebase-session-v1";

export type FirebaseAccount = {
  localId?: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  idToken?: string;
  refreshToken?: string;
  expiresIn?: string;
};

type FirebaseErrorPayload = {
  error?: {
    message?: string;
  };
};

class FirebaseAuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FirebaseAuthError";
    this.code = code;
  }
}

function mapFirebaseCode(message: string) {
  switch (message) {
    case "EMAIL_EXISTS":
      return "auth/email-already-in-use";
    case "EMAIL_NOT_FOUND":
      return "auth/user-not-found";
    case "INVALID_PASSWORD":
    case "INVALID_LOGIN_CREDENTIALS":
      return "auth/invalid-credential";
    case "WEAK_PASSWORD":
      return "auth/weak-password";
    case "INVALID_EMAIL":
      return "auth/invalid-email";
    case "TOO_MANY_ATTEMPTS_TRY_LATER":
    case "TOO_MANY_ATTEMPTS_TRY_LATER :":
      return "auth/too-many-requests";
    case "OPERATION_NOT_ALLOWED":
      return "auth/operation-not-allowed";
    case "USER_DISABLED":
      return "auth/user-disabled";
    default:
      return "auth/unknown";
  }
}

async function request<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${AUTH_BASE}/${path}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as T & FirebaseErrorPayload;

  if (!response.ok || data.error) {
    const message = data.error?.message || "AUTH_REQUEST_FAILED";
    throw new FirebaseAuthError(mapFirebaseCode(message), message);
  }

  return data;
}

async function saveSession(account: FirebaseAccount) {
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      idToken: account.idToken || "",
      refreshToken: account.refreshToken || "",
      expiresIn: account.expiresIn || "",
      localId: account.localId || "",
      email: account.email || "",
      displayName: account.displayName || "",
      photoUrl: account.photoUrl || "",
    }),
  );
}

export async function signInWithGoogleCredential(
  idToken: string,
  accessToken?: string,
) {
  const credential = accessToken
    ? `access_token=${encodeURIComponent(accessToken)}&providerId=google.com`
    : `id_token=${encodeURIComponent(idToken)}&providerId=google.com`;

  const account = await request<FirebaseAccount>("accounts:signInWithIdp", {
    postBody: credential,
    requestUri: GOOGLE_REQUEST_URI,
    returnIdpCredential: true,
    returnSecureToken: true,
  });

  await saveSession(account);
  return account;
}

export async function signInWithEmail(email: string, password: string) {
  const account = await request<FirebaseAccount>("accounts:signInWithPassword", {
    email: email.trim(),
    password,
    returnSecureToken: true,
  });

  await saveSession(account);
  return account;
}

export async function createEmailAccount(
  name: string,
  email: string,
  password: string,
) {
  const account = await request<FirebaseAccount>("accounts:signUp", {
    email: email.trim(),
    password,
    returnSecureToken: true,
  });

  if (name.trim() && account.idToken) {
    const updated = await request<FirebaseAccount>("accounts:update", {
      idToken: account.idToken,
      displayName: name.trim(),
      returnSecureToken: true,
    });
    Object.assign(account, updated);
  }

  await saveSession(account);
  return account;
}

export async function resetPassword(email: string) {
  await request("accounts:sendOobCode", {
    requestType: "PASSWORD_RESET",
    email: email.trim(),
  });
}

export function watchFirebaseUser(
  callback: (user: { displayName?: string; email?: string; photoURL?: string } | null) => void,
) {
  let active = true;

  AsyncStorage.getItem(SESSION_KEY)
    .then((raw) => {
      if (!active) return;
      if (!raw) {
        callback(null);
        return;
      }

      try {
        const session = JSON.parse(raw) as FirebaseAccount;
        callback({
          displayName: session.displayName || undefined,
          email: session.email || undefined,
          photoURL: session.photoUrl || undefined,
        });
      } catch {
        callback(null);
      }
    })
    .catch(() => {
      if (active) callback(null);
    });

  return () => {
    active = false;
  };
}

export async function logoutFirebase() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
