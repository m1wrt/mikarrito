import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA001qNfQFy-Z2OUTtCQq29RYlQZvHcUHw",
  authDomain: "mikarrito-8076d.firebaseapp.com",
  projectId: "mikarrito-8076d",
  storageBucket: "mikarrito-8076d.firebasestorage.app",
  messagingSenderId: "353382490545",
  appId: "1:353382490545:web:d9d3b6f5539c93dbe59d90",
  measurementId: "G-N43TGP1GFD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

// Messaging
export const getMessagingInstance = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export { RecaptchaVerifier, signInWithPhoneNumber, getToken, onMessage };
