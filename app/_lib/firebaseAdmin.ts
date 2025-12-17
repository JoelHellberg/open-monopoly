'use server';

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

async function initFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
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