import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
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

export async function saveRemoteState(state: SharedState): Promise<void> {
  try {
    await setDoc(doc(db, STATE_DOC), state);
  } catch (e) {
    console.error('Remote state save failed:', e);
  }
}

export function subscribeRemoteState(onState: (state: SharedState) => void): () => void {
  const unsub = onSnapshot(doc(db, STATE_DOC), (snap) => {
    if (snap.exists()) {
      onState(snap.data() as SharedState);
    }
  });
  return unsub;
}
