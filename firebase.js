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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  terminate,
  clearIndexedDbPersistence,
  queryEqual,
  refEqual,
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
  onSnapshot as fsOnSnapshot,
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

/* ---- PERFORMANCE 1: local data cache (IndexedDB) ----
   On repeat visits the dashboard, wallet, tasks etc. appear instantly from the device cache,
   then update from the server. Not used on the admin page. If the browser doesn't support it,
   we silently fall back to the normal Firestore setup. */
let db;
let persistentCacheOn = false;
const ENABLE_PERSISTENT_CACHE = false; // kept off: can stall in some Android/in-app browsers
const isAdminPage = /admin\.html$/i.test(location.pathname);
try {
  if (isAdminPage || !ENABLE_PERSISTENT_CACHE) throw new Error("cache off");
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
  });
  persistentCacheOn = true;
} catch {
  db = getFirestore(app);
}

/* On logout the cached data of that user is wiped from the device (user-data isolation). */
async function wipeLocalCache() {
  if (!persistentCacheOn) return false;
  try {
    await terminate(db);
    await clearIndexedDbPersistence(db);
    return true;
  } catch {
    return false;
  }
}

/* ---- PERFORMANCE 2: share identical live listeners ----
   Several parts of the site listen to the same data (your user document, leaderboards, ...).
   Identical queries now share ONE connection and ONE set of database reads. */
const sharedListeners = [];

function sameRef(a, b) {
  try {
    if (a.type === "document" || b.type === "document") {
      return a.type === b.type && refEqual(a, b);
    }
    return queryEqual(a, b);
  } catch {
    return false;
  }
}

function onSnapshot(ref, next, ...rest) {
  if (typeof next !== "function" || rest.length > 0) {
    return fsOnSnapshot(ref, next, ...rest); // observer/option forms: untouched behaviour
  }
  let entry = sharedListeners.find((e) => sameRef(e.ref, ref));
  if (!entry) {
    entry = { ref, subs: new Set(), last: null, unsub: null };
    const e = entry;
    e.unsub = fsOnSnapshot(
      ref,
      (snap) => {
        e.last = snap;
        [...e.subs].forEach((s) => { try { s.next(snap); } catch (err) { console.error(err); } });
      },
      (err) => console.error("Firestore listener error:", err)
    );
    sharedListeners.push(e);
  }
  const sub = { next };
  const e = entry;
  if (e.last) {
    const snap = e.last;
    setTimeout(() => { if (e.subs.has(sub)) { try { next(snap); } catch (err) { console.error(err); } } }, 0);
  }
  e.subs.add(sub);
  return () => {
    e.subs.delete(sub);
    if (e.subs.size === 0) {
      try { e.unsub(); } catch {}
      const i = sharedListeners.indexOf(e);
      if (i > -1) sharedListeners.splice(i, 1);
    }
  };
}

const provider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch(() => {});

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
  { name: "Silver", minReferrals: 2, bonus: 10 },
  { name: "Gold", minReferrals: 3, bonus: 15 },
  { name: "Platinum", minReferrals: 5, bonus: 25 },
  { name: "Diamond", minReferrals: 10, bonus: 50 },
  { name: "Master", minReferrals: 15, bonus: 75 },
  { name: "Grandmaster", minReferrals: 20, bonus: 100 },
  { name: "Elite", minReferrals: 25, bonus: 125 },
  { name: "Champion", minReferrals: 30, bonus: 150 },
  { name: "Legend", minReferrals: 40, bonus: 200 },
  { name: "Mythic", minReferrals: 50, bonus: 250 },
  { name: "Supreme", minReferrals: 75, bonus: 375 },
  { name: "Immortal", minReferrals: 100, bonus: 500 },
  { name: "Conqueror", minReferrals: 250, bonus: 1250 },
  { name: "Ultimate", minReferrals: 500, bonus: 2500 }
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

const WITHDRAW_REQUIRED_APPROVED_TASKS = 10;

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
  wipeLocalCache,
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
