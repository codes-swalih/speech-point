import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, limit as firestoreLimit, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on the client side
let app;
let db;
let auth;
let storage;

// Add console logs to debug Firebase initialization
if (typeof window !== 'undefined') {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    console.log("Firebase initialized successfully");
    
    // Check if config values are present
    console.log("Firebase config has API key:", !!firebaseConfig.apiKey);
    console.log("Firebase config has project ID:", !!firebaseConfig.projectId);
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
}

// History functions
export interface TranscriptionHistory {
  userId: string;
  transcription: string;
  summary: any; // The key points
  createdAt: Timestamp;
  title?: string;
  audioUrl?: string;
  language?: string;
}

export async function saveTranscriptionHistory(historyData: Omit<TranscriptionHistory, 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, "transcriptionHistory"), {
      ...historyData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving transcription history:", error);
    throw error;
  }
}

export async function getUserTranscriptionHistory(userId: string, limitCount = 20) {
  try {
    const q = query(
      collection(db, "transcriptionHistory"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      firestoreLimit(limitCount)  // Use firestoreLimit instead of limit
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching user transcription history:", error);
    throw error;
  }
}

export { app, db, auth, storage };