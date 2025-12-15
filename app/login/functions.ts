import {
  signInWithPopup,
  AuthProvider,
  UserCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../_lib/firebase";
import { createSession } from "../_lib/session";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithProvider(googleProvider);

    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential?.accessToken;
    const user = result.user;
    if (user.email) await createSession(user.email);
    window.location.href = "/";

    console.log(user);
  } catch (error: any) {
    console.error(error.code, error.message);
  }
}

async function signInWithProvider(
  provider: AuthProvider
): Promise<UserCredential> {
  return await signInWithPopup(auth, provider);
}
