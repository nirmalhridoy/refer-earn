import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  runTransaction,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnP9QJgg6d874QB-a4meFbprLMEufRzuY",
  authDomain: "refer-earn-73e38.firebaseapp.com",
  projectId: "refer-earn-73e38",
  storageBucket: "refer-earn-73e38.firebasestorage.app",
  messagingSenderId: "323369987305",
  appId: "1:323369987305:web:7c8eead19bff6454f4d478",
  measurementId: "G-Z0WLNVH8YZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: "select_account"
});

const USERS = "users";
const WITHDRAWS = "withdrawRequests";
const ACTIVATIONS = "activationRequests";
const TRANSACTIONS = "transactions";
const BROADCAST = "broadcast";
const NOTIFICATIONS = "notifications";

const ADMIN_EMAILS = [
  "antorahmed0185@gmail.com"
];

const RANK_LEVELS = [
  { name: "Starter", minReferrals: 0 },
  { name: "Bronze", minReferrals: 5 },
  { name: "Silver", minReferrals: 15 },
  { name: "Gold", minReferrals: 30 },
  { name: "Platinum", minReferrals: 50 },
  { name: "Diamond", minReferrals: 100 }
];

export {
  app,
  auth,
  db,
  provider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  onSnapshot,
  runTransaction,
  writeBatch,
  arrayUnion,
  arrayRemove,
  Timestamp,
  USERS,
  WITHDRAWS,
  ACTIVATIONS,
  TRANSACTIONS,
  BROADCAST,
  NOTIFICATIONS,
  ADMIN_EMAILS,
  RANK_LEVELS
};
