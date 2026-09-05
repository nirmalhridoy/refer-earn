import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
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

setPersistence(auth, browserLocalPersistence);

provider.setCustomParameters({
  prompt: "select_account"
});

const USERS = "users";
const WITHDRAWS = "withdrawRequests";
const ACTIVATIONS = "activationRequests";
const TRANSACTIONS = "transactions";
const BROADCAST = "broadcast";
const NOTIFICATIONS = "notifications";
const TASKS = "tasks";
const TASK_SUBMISSIONS = "taskSubmissions";
const CONTESTS = "contests";

const ADMIN_EMAILS = [
  "antorahmed0185@gmail.com"
];

const RANK_LEVELS = [
  { name: "Starter", minReferrals: 0, bonus: 0 },
  { name: "Bronze", minReferrals: 1, bonus: 5 },
  { name: "Silver", minReferrals: 5, bonus: 25 },
  { name: "Gold", minReferrals: 10, bonus: 50 },
  { name: "Platinum", minReferrals: 25, bonus: 125 },
  { name: "Diamond", minReferrals: 50, bonus: 250 },
  { name: "Master", minReferrals: 100, bonus: 500 },
  { name: "Grandmaster", minReferrals: 500, bonus: 2500 },
  { name: "Legend", minReferrals: 1000, bonus: 5000 }
];

const LEVEL_COMMISSIONS = [75, 25, 10, 5, 1];
const TASK_REWARD_DEFAULT = 5;

const PHONE_AUTH_DOMAIN = "referearn.app";

const TASK_PLATFORMS = [
  { key: "facebook", icon: "📘", label: "Facebook", color: "#1877F2" },
  { key: "youtube", icon: "▶️", label: "YouTube", color: "#FF0000" },
  { key: "instagram", icon: "📸", label: "Instagram", color: "#C13584" },
  { key: "tiktok", icon: "🎵", label: "TikTok", color: "#000000" },
  { key: "telegram", icon: "💬", label: "Telegram", color: "#26A5E4" },
  { key: "website", icon: "🌐", label: "Website Visit", color: "#7C3AED" },
  { key: "search", icon: "🔎", label: "Search Tasks", color: "#3B82F6" },
  { key: "survey", icon: "📝", label: "Survey", color: "#16A34A" },
  { key: "dataentry", icon: "📊", label: "Data Entry", color: "#F59E0B" },
  { key: "ai", icon: "🤖", label: "AI / Micro Tasks", color: "#6366F1" }
];

const WITHDRAW_REQUIRED_APPROVED_TASKS = 20;

export {
  app,
  auth,
  db,
  provider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  TASKS,
  TASK_SUBMISSIONS,
  CONTESTS,
  ADMIN_EMAILS,
  RANK_LEVELS,
  LEVEL_COMMISSIONS,
  TASK_REWARD_DEFAULT,
  PHONE_AUTH_DOMAIN,
  TASK_PLATFORMS,
  WITHDRAW_REQUIRED_APPROVED_TASKS
};
