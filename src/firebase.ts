import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyC_u8ztC7WUnluZL__5iAvHyQPE9c2ROEg",
  authDomain: "calculator-bdda1.firebaseapp.com",
  projectId: "calculator-bdda1",
  storageBucket: "calculator-bdda1.firebasestorage.app",
  messagingSenderId: "588544470835",
  appId: "1:588544470835:web:9a7726ba790374b313d846",
  measurementId: "G-WDMLC3CT1C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app; 