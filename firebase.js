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
  queryEqual,
  refEqual,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection as fsCollection,
  addDoc,
  getDocs,
  query as fsQuery,
  where,
  orderBy as fsOrderBy,
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

const isAdminPage = /admin\.html$/i.test(location.pathname);
const db = getFirestore(app);

// Persistent cache is permanently disabled (it can stall in some Android/in-app browsers).
async function wipeLocalCache() { return false; }

/* ---- PERFORMANCE 2: share identical live listeners ----
   Several parts of the site listen to the same data (your user document, leaderboards, ...).
   Identical queries now share ONE connection and ONE set of database reads. */

/* ---- tags so we can tell which collection a query belongs to ---- */
function collection(...a) { const c = fsCollection(...a); try { c.__n = a[1]; } catch {} return c; }
function orderBy(...a) { const c = fsOrderBy(...a); try { c.__ob = 1; } catch {} return c; }
function query(ref, ...cons) {
  const q = fsQuery(ref, ...cons);
  try { q.__n = ref && ref.__n; q.__ob = cons.some((c) => c && c.__ob); } catch {}
  return q;
}
if (isAdminPage) {
  const l = document.createElement("link");
  l.rel = "stylesheet"; l.href = "admin-premium.css";
  document.head.appendChild(l);
}

/* ---- PERFORMANCE 3: staged loading ----
   The important data (your user document, wallet, transactions, referrals) starts immediately.
   Parts far down the page (leaderboards, contest, notifications, tasks...) start a moment later,
   so the first screen opens faster and the phone is not flooded with requests at once. */
const DEFER_MS = { contests: 1500, notifications: 1200, broadcast: 2000, tasks: 800, taskSubmissions: 800 };
function deferFor(ref) {
  if (isAdminPage || !ref || ref.type === "document") return 0;
  if (ref.__n === "users" && ref.__ob) return 2500;
  return DEFER_MS[ref.__n] || 0;
}

const sharedListeners = [];

// The old "Top Referrers" table (ordered by totalIncome) is hidden on the user site now (premium2 draws its own),
// so that listener (10 user documents with photos) is skipped to save loading time. Admin page is unaffected.
const SKIPPED_QUERY = isAdminPage ? null : query(collection(db, "users"), orderBy("totalIncome", "desc"), limit(10));

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
  const d = deferFor(ref);
  if (d) {
    let real = null, stop = false;
    const t = setTimeout(() => { if (!stop) real = shareListen(ref, next); }, d);
    return () => { stop = true; clearTimeout(t); if (real) real(); };
  }
  return shareListen(ref, next);
}

function shareListen(ref, next) {
  if (SKIPPED_QUERY && sameRef(SKIPPED_QUERY, ref)) return () => {};
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
  { key: "ai", icon: "🤖", label: "AI / Micro Tasks", color: "#6366F1" },
  { key: "microjobs", icon: "💼", label: "Microjobs", color: "#0EA5E9" },
  { key: "bonusmission", icon: "🎁", label: "Bonus Mission", color: "#F43F5E" }
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
