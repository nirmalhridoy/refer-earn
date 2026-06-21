import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "antorahmed0185@gmail.com";

let realtimeInterval = null;

window.db = db;
window.auth = auth;
window.ADMIN_EMAIL = ADMIN_EMAIL;
const ADMIN_EMAIL = "antorahmed0185@gmail.com";

let realtimeInterval = null;

function isAdmin(user){
  return user && user.email === ADMIN_EMAIL;
}

function setStatus(text){
  const el = document.getElementById("adminStatus");
  if(el) el.innerText = text;
}

async function startAdminPanel(){
  await loadDashboard();
  await loadPending();
  await loadAnalytics();
  await loadNotifications();

  if(realtimeInterval) clearInterval(realtimeInterval);

  realtimeInterval = setInterval(async () => {
    await loadDashboard();
    await loadPending();
    await loadAnalytics();
    await loadNotifications();
  }, 30000);
}

onAuthStateChanged(auth, (user) => {
  if(!user){
    setStatus("Not Logged In");
    return;
  }

  if(!isAdmin(user)){
    setStatus("Access Denied");
    signOut(auth);
    return;
  }

  setStatus("Admin Active");
  startAdminPanel();
});
async function loadDashboard(){
  const usersSnap = await getDocs(collection(db, "users"));

  let totalUsers = 0;
  let activeUsers = 0;
  let totalBalance = 0;

  usersSnap.forEach(docSnap => {
    const data = docSnap.data();
    totalUsers++;

    if(data.active === true){
      activeUsers++;
    }

    totalBalance += data.balance || 0;
  });

  const totalUsersEl = document.getElementById("totalUsers");
  const activeUsersEl = document.getElementById("activeUsers");
  const totalBalanceEl = document.getElementById("totalBalance");

  if(totalUsersEl) totalUsersEl.innerText = totalUsers;
  if(activeUsersEl) activeUsersEl.innerText = activeUsers;
  if(totalBalanceEl) totalBalanceEl.innerText = totalBalance;
}
async function loadPending(){
  const activationSnap = await getDocs(collection(db, "activationRequests"));
  const withdrawSnap = await getDocs(collection(db, "withdrawRequests"));
  const supportSnap = await getDocs(collection(db, "supportTickets"));

  let pendingActivation = 0;
  let pendingWithdraw = 0;
  let openTickets = 0;

  activationSnap.forEach(docSnap => {
    if(docSnap.data().status === "pending"){
      pendingActivation++;
    }
  });

  withdrawSnap.forEach(docSnap => {
    if(docSnap.data().status === "pending"){
      pendingWithdraw++;
    }
  });

  supportSnap.forEach(docSnap => {
    if(docSnap.data().status === "open"){
      openTickets++;
    }
  });

  const actEl = document.getElementById("pendingActivation");
  const withEl = document.getElementById("pendingWithdraw");
  const supportEl = document.getElementById("supportCount");

  if(actEl) actEl.innerText = pendingActivation;
  if(withEl) withEl.innerText = pendingWithdraw;
  if(supportEl) supportEl.innerText = openTickets;
    }
async function approveWithdraw(id){
  const ref = doc(db, "withdrawRequests", id);
  const snap = await getDoc(ref);

  if(!snap.exists()) return;

  const data = snap.data();

  if(data.status !== "pending") return;

  await updateDoc(ref, {
    status: "approved"
  });
}

async function rejectWithdraw(id){
  const ref = doc(db, "withdrawRequests", id);
  const snap = await getDoc(ref);

  if(!snap.exists()) return;

  const data = snap.data();

  if(data.status !== "pending") return;

  await updateDoc(ref, {
    status: "rejected"
  });
}
async function approveActivation(id, uid){
  const userRef = doc(db, "users", uid);
  const reqRef = doc(db, "activationRequests", id);

  const userSnap = await getDoc(userRef);
  const reqSnap = await getDoc(reqRef);

  if(!userSnap.exists() || !reqSnap.exists()) return;

  const userData = userSnap.data();

  if(userData.active === true) return;

  await updateDoc(userRef, {
    active: true,
    balance: (userData.balance || 0) + 50
  });

  await updateDoc(reqRef, {
    status: "approved"
  });
}

async function rejectActivation(id){
  const ref = doc(db, "activationRequests", id);
  const snap = await getDoc(ref);

  if(!snap.exists()) return;

  if(snap.data().status !== "pending") return;

  await updateDoc(ref, {
    status: "rejected"
  });
}
async function approveTask(id, uid){
  const userRef = doc(db, "users", uid);
  const taskRef = doc(db, "taskSubmissions", id);

  const userSnap = await getDoc(userRef);
  const taskSnap = await getDoc(taskRef);

  if(!userSnap.exists() || !taskSnap.exists()) return;

  const userData = userSnap.data();
  const taskData = taskSnap.data();

  if(taskData.status !== "pending") return;

  await updateDoc(userRef, {
    balance: (userData.balance || 0) + 5
  });

  await updateDoc(taskRef, {
    status: "approved"
  });
}

async function rejectTask(id){
  const ref = doc(db, "taskSubmissions", id);
  const snap = await getDoc(ref);

  if(!snap.exists()) return;

  if(snap.data().status !== "pending") return;

  await updateDoc(ref, {
    status: "rejected"
  });
}
async function sendAnnouncement(message){
  if(!message) return;

  await addDoc(collection(db, "notifications"), {
    type: "announcement",
    message: message,
    createdAt: Date.now()
  });
}

async function sendUserNotification(uid, message){
  if(!uid || !message) return;

  await addDoc(collection(db, "notifications"), {
    type: "user",
    uid: uid,
    message: message,
    createdAt: Date.now()
  });
}

async function loadNotifications(){
  const snap = await getDocs(collection(db, "notifications"));

  const countEl = document.getElementById("notificationCount");

  if(countEl){
    countEl.innerText = snap.size;
  }
}
async function systemHealthCheck(){
  try{
    const user = auth.currentUser;

    if(!user){
      return false;
    }

    if(user.email !== ADMIN_EMAIL){
      return false;
    }

    return true;
  }catch(e){
    return false;
  }
}

function adminLog(message){
  console.log("ADMIN LOG:", message);
}

window.addEventListener("error", (e) => {
  adminLog(e.message || "Unknown error");
});

window.addEventListener("unhandledrejection", (e) => {
  adminLog(e.reason || "Promise error");
});

setInterval(() => {
  systemHealthCheck().then(ok => {
    if(ok){
      adminLog("System OK");
    }
  });
}, 120000);
function forceRefresh(){
  location.reload();
}

async function clearCache(){
  if("caches" in window){
    const keys = await caches.keys();
    keys.forEach(key => caches.delete(key));
  }
}

function logoutAdmin(){
  signOut(auth);
}

async function systemShutdown(enable){
  await addDoc(collection(db, "systemControl"), {
    shutdown: enable,
    time: Date.now()
  });
}

function startRealtimeSync(){
  if(realtimeInterval) clearInterval(realtimeInterval);

  realtimeInterval = setInterval(async () => {
    await loadDashboard();
    await loadPending();
    await loadNotifications();
  }, 15000);
}

function stopRealtimeSync(){
  if(realtimeInterval) clearInterval(realtimeInterval);
}

function forceUpdateUI(){
  loadDashboard();
  loadPending();
  loadNotifications();
    }
