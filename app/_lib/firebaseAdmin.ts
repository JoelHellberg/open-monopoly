"use server";

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
);
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

async function initFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL:
        "https://monopolywebgame-default-rtdb.europe-west1.firebasedatabase.app",
    });
  }
}

export async function getAuthAdmin() {
  initFirebaseAdmin();
  return getAuth();
}

export async function getFirestoreAdmin() {
  initFirebaseAdmin();
  return getFirestore();
}

export async function getRTDBAdmin() {
  initFirebaseAdmin();
  return getDatabase();
}
