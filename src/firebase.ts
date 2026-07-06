import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import type { SharedState } from './types';

const firebaseConfig = {
  apiKey: "AIzaSyCXCpaP8Nraked46mcTJwLER-ccvZyeTtQ",
  authDomain: "performance-dashboard001.firebaseapp.com",
  projectId: "performance-dashboard001",
  storageBucket: "performance-dashboard001.firebasestorage.app",
  messagingSenderId: "307105981853",
  appId: "1:307105981853:web:709f1b096e7c11ab4e7b74",
  measurementId: "G-9FQK5CY3WF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Authenticate anonymously so Firestore security rules (if auth-required) don't block
const auth = getAuth(app);
signInAnonymously(auth).catch((e) => {
  console.warn('Anonymous auth failed (OK if rules allow public access):', e);
});

const STATE_DOC = 'state/current';

export async function loadRemoteState(): Promise<SharedState | null> {
  try {
    const snap = await getDoc(doc(db, STATE_DOC));
    if (snap.exists()) {
      return snap.data() as SharedState;
    }
  } catch {}
  return null;
}

export async function saveRemoteState(state: SharedState): Promise<boolean> {
  try {
    await setDoc(doc(db, STATE_DOC), state);
    return true;
  } catch (e) {
    console.error('Remote state save failed:', e);
    return false;
  }
}

export function subscribeRemoteState(
  onState: (state: SharedState) => void,
  onError?: (err: Error) => void
): () => void {
  const unsub = onSnapshot(
    doc(db, STATE_DOC),
    (snap) => {
      if (snap.exists()) {
        onState(snap.data() as SharedState);
      }
    },
    (error) => {
      console.error('Firestore snapshot error:', error);
      onError?.(error);
    }
  );
  return unsub;
}
