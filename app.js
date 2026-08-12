import {
  auth, db, provider,
  onAuthStateChanged, signInWithPopup, signOut,
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, getDocs,
  query, where, orderBy, limit,
  serverTimestamp, increment, onSnapshot, runTransaction,
  Timestamp,
  USERS, WITHDRAWS, ACTIVATIONS, TRANSACTIONS, BROADCAST, NOTIFICATIONS,
  TASKS, TASK_SUBMISSIONS,
  RANK_LEVELS
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");
const appEl = $("app");

const walletBalanceEl = $("walletBalance");
const todayIncomeEl = $("todayIncome");
const totalIncomeEl = $("totalIncome");
const userRankEl = $("userRank");

const totalReferralsEl = $("totalReferrals");
const activeReferralsEl = $("activeReferrals");
const pendingRequestsEl = $("pendingRequests");
const completedTasksEl = $("completedTasks");

const copyReferralBtn = $("copyReferralBtn");
const shareBtn = $("shareBtn");
const refreshBtn = $("refreshBtn");
const leaderboardBtn = $("leaderboardBtn");

const accountStatusEl = $("accountStatus");
const joinDateEl = $("joinDate");
const referralCodeEl = $("referralCode");
const userIdEl = $("userId");

const profilePhotoEl = $("profilePhoto");
const profileNameEl = $("profileName");
const profileEmailEl = $("profileEmail");
const profilePhoneEl = $("profilePhone");
const profileDistrictEl = $("profileDistrict");
const editProfileBtn = $("editProfileBtn");

const referralLinkEl = $("referralLink");
const copyLinkBtn = $("copyLinkBtn");
const referralProgressEl = $("referralProgress");
const progressReferralEl = $("progressReferral");

const leaderboardTableEl = $("leaderboardTable");

const currentRankEl = $("currentRank");
const rankProgressBarEl = $("rankProgressBar");
const nextRankEl = $("nextRank");

const activityListEl = $("activityList");

const paymentMethodEl = $("paymentMethod");
const senderNumberEl = $("senderNumber");
const transactionIdEl = $("transactionId");
const activationBtn = $("activationBtn");
const activationActiveCardEl = $("activationActiveCard");
const activationFormWrapperEl = $("activationFormWrapper");

const withdrawAmountEl = $("withdrawAmount");
const withdrawMethodEl = $("withdrawMethod");
const withdrawNumberEl = $("withdrawNumber");
const withdrawBtn = $("withdrawBtn");
const withdrawWalletBalanceEl = $("withdrawWalletBalance");
const withdrawActiveReferralsEl = $("withdrawActiveReferrals");
const withdrawInsufficientCard = $("withdrawInsufficientCard");
const withdrawInsufficientBalanceEl = $("withdrawInsufficientBalance");
const withdrawFormCard = $("withdrawFormCard");
const withdrawRequirementStatusEl = $("withdrawRequirementStatus");
const withdrawTaskRequirementStatusEl = $("withdrawTaskRequirementStatus");

const withdrawHistoryEl = $("withdrawHistory");
const transactionHistoryEl = $("transactionHistory");
const walletHistoryEl = $("walletHistory");
const broadcastBoxEl = $("broadcastBox");
const notificationListEl = $("notificationList");

const editProfileModal = $("editProfileModal");
const closeProfileModal = $("closeProfileModal");
const editNameEl = $("editName");
const editPhoneEl = $("editPhone");
const editDistrictEl = $("editDistrict");
const editPhotoEl = $("editPhoto");
const editPhotoPreviewEl = $("editPhotoPreview");
const saveProfileBtn = $("saveProfileBtn");

const copyModal = $("copyModal");
const copyReferralInputEl = $("copyReferralInput");
const copyNowBtn = $("copyNowBtn");
const closeCopyModal = $("closeCopyModal");

const userInfoModal = $("userInfoModal");
const modalUIDEl = $("modalUID");
const modalEmailEl = $("modalEmail");
const modalStatusEl = $("modalStatus");
const modalRankEl = $("modalRank");
const modalBalanceEl = $("modalBalance");
const closeUserInfo = $("closeUserInfo");

const imagePreviewModal = $("imagePreviewModal");
const previewImageEl = $("previewImage");
const closePreview = $("closePreview");

const taskSubmitModal = $("taskSubmitModal");
const taskSubmitTitleEl = $("taskSubmitTitle");
const taskSubmitInstructionEl = $("taskSubmitInstruction");
const taskScreenshotInput = $("taskScreenshotInput");
const taskScreenshotPreviewEl = $("taskScreenshotPreview");
const taskProfileLinkLabelEl = $("taskProfileLinkLabel");
const taskProfileLinkInput = $("taskProfileLinkInput");
const taskSubmitTaskIdEl = $("taskSubmitTaskId");
const taskSubmitPlatformEl = $("taskSubmitPlatform");
const taskSubmitBtn = $("taskSubmitBtn");
const closeTaskSubmitModal = $("closeTaskSubmitModal");

const facebookTaskListEl = $("facebookTaskList");
const youtubeTaskListEl = $("youtubeTaskList");
const facebookTaskCounterEl = $("facebookTaskCounter");
const youtubeTaskCounterEl = $("youtubeTaskCounter");

const confirmDialog = $("confirmDialog");
const confirmTitleEl = $("confirmTitle");
const confirmMessageEl = $("confirmMessage");
const confirmYesBtn = $("confirmYesBtn");
const confirmNoBtn = $("confirmNoBtn");

const successDialog = $("successDialog");
const successMessageEl = $("successMessage");
const successOkBtn = $("successOkBtn");

const errorDialog = $("errorDialog");
const errorMessageEl = $("errorMessage");
const errorOkBtn = $("errorOkBtn");

const warningDialog = $("warningDialog");
const warningMessageEl = $("warningMessage");
const warningOkBtn = $("warningOkBtn");

const loadingDialog = $("loadingDialog");

const toastEl = $("toast");
const toastTitleEl = $("toastTitle");
const toastMessageEl = $("toastMessage");
const toastCloseBtn = $("toastCloseBtn");

const globalLoadingEl = $("globalLoading");

const networkStatusEl = $("networkStatus");
const networkDotEl = $("networkDot");
const networkTextEl = $("networkText");

const scrollTopBtn = $("scrollTopBtn");
const sessionStatusEl = $("sessionStatus");
const sessionUserEl = $("sessionUser");

const currentUIDInput = $("currentUID");
const currentReferralCodeInput = $("currentReferralCode");
const currentUserEmailInput = $("currentUserEmail");

const dailyBonusStatusEl = $("dailyBonusStatus");
const spinBtn = $("spinBtn");
const spinWheelEl = $("spinWheel");
const spinResultEl = $("spinResult");
const spinStatusEl = $("spinStatus");

const DAILY_LOGIN_BONUS = 5;
const SPIN_REWARDS = [0, 1, 2, 3, 4, 5];
const SPIN_SEGMENT_ANGLE = 360 / SPIN_REWARDS.length;

const WITHDRAW_TIERS = { 350: 3, 700: 6, 1400: 12, 2800: 24 };
const MIN_WITHDRAW_AMOUNT = 350;

let currentUser = null;
let currentUserData = null;
let subscriptions = [];
let toastTimer = null;
let pendingActivationCount = 0;
let pendingWithdrawCount = 0;
let isSpinning = false;
let selectedPhotoBase64 = null;
let selectedTaskScreenshotBase64 = null;

let facebookTasks = [];
let youtubeTasks = [];
let mySubmissions = {};

function openModal(el) {
  el.classList.remove("hidden");
}

function closeModalEl(el) {
  el.classList.add("hidden");
}

function showGlobalLoading(show) {
  globalLoadingEl.classList.toggle("hidden", !show);
}

function showActionLoading(show) {
  loadingDialog.classList.toggle("hidden", !show);
}

function showToast(title, message, type) {
  const colors = { success: "#22C55E", error: "#DC2626", warning: "#FACC15", info: "#38BDF8" };
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "🔔" };
  toastTitleEl.textContent = title;
  toastMessageEl.textContent = message;
  toastEl.style.borderLeftColor = colors[type] || colors.info;
  toastEl.querySelector(".toast-icon").textContent = icons[type] || icons.info;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), 4000);
}

toastCloseBtn.addEventListener("click", () => toastEl.classList.add("hidden"));

function showSuccess(message) {
  successMessageEl.textContent = message;
  openModal(successDialog);
}

function showError(message) {
  errorMessageEl.textContent = message;
  openModal(errorDialog);
}

function showWarning(message) {
  warningMessageEl.textContent = message;
  openModal(warningDialog);
}

successOkBtn.addEventListener("click", () => closeModalEl(successDialog));
errorOkBtn.addEventListener("click", () => closeModalEl(errorDialog));
warningOkBtn.addEventListener("click", () => closeModalEl(warningDialog));

function showConfirm(title, message) {
  return new Promise((resolve) => {
    confirmTitleEl.textContent = title;
    confirmMessageEl.textContent = message;
    openModal(confirmDialog);

    function cleanup() {
      closeModalEl(confirmDialog);
      confirmYesBtn.removeEventListener("click", onYes);
      confirmNoBtn.removeEventListener("click", onNo);
    }
    function onYes() { cleanup(); resolve(true); }
    function onNo() { cleanup(); resolve(false); }

    confirmYesBtn.addEventListener("click", onYes);
    confirmNoBtn.addEventListener("click", onNo);
  });
}

function formatCurrency(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString("en-US")} ৳`;
}

function getTodayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "--";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRankInfo(referralCount) {
  let current = RANK_LEVELS[0];
  let next = RANK_LEVELS[RANK_LEVELS.length - 1];

  for (let i = 0; i < RANK_LEVELS.length; i++) {
    if (referralCount >= RANK_LEVELS[i].minReferrals) {
      current = RANK_LEVELS[i];
      next = RANK_LEVELS[i + 1] || RANK_LEVELS[i];
    }
  }

  const isMax = current.name === RANK_LEVELS[RANK_LEVELS.length - 1].name;
  const range = next.minReferrals - current.minReferrals;
  const progressInRange = referralCount - current.minReferrals;
  const percent = isMax ? 100 : Math.min(100, Math.round((progressInRange / range) * 100));

  return { current, next, percent, isMax };
}

function generateReferralCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return "RE" + num;
}

async function generateUniqueReferralCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateReferralCode();
    const q = query(collection(db, USERS), where("referralCode", "==", code));
    const snap = await getDocs(q);
    exists = !snap.empty;
  }
  return code;
}

async function ensureUserDocument(firebaseUser) {
  const userRef = doc(db, USERS, firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const referralCode = await generateUniqueReferralCode();
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    let referredBy = null;

    if (refCode && refCode !== referralCode) {
      const q = query(collection(db, USERS), where("referralCode", "==", refCode), limit(1));
      const refSnap = await getDocs(q);
      if (!refSnap.empty) referredBy = refCode;
    }

    await setDoc(userRef, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || "Refer Earn User",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      phone: "",
      district: "",
      referralCode,
      referredBy,
      isActive: false,
      isFrozen: false,
      walletBalance: 0,
      totalIncome: 0,
      referralEarnings: 0,
      activeReferralCount: 0,
      rank: "Starter",
      lastLoginBonusDate: null,
      lastSpinDate: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  } else {
    await updateDoc(userRef, { lastActive: serverTimestamp() });
  }

  return userRef;
}

async function claimDailyLoginBonus(uid) {
  const today = getTodayDateStr();
  const userRef = doc(db, USERS, uid);

  try {
    const claimed = await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      const data = snap.data();
      if (!data || data.lastLoginBonusDate === today) return false;

      transaction.update(userRef, {
        walletBalance: increment(DAILY_LOGIN_BONUS),
        totalIncome: increment(DAILY_LOGIN_BONUS),
        lastLoginBonusDate: today
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid,
        type: "daily_login_bonus",
        amount: DAILY_LOGIN_BONUS,
        description: "Daily Login Bonus",
        status: "completed",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid,
        title: "Daily Login Bonus",
        message: `আজকের Login Bonus হিসেবে ৳${DAILY_LOGIN_BONUS} আপনার Wallet-এ যোগ হয়েছে।`,
        type: "success",
        isRead: false,
        createdAt: serverTimestamp()
      });

      return true;
    });

    if (claimed) {
      showToast("Daily Bonus", `আজকের ৳${DAILY_LOGIN_BONUS} Login Bonus পেয়েছেন!`, "success");
    }
  } catch (err) {
    console.error("Daily bonus error:", err.message);
  }
}

function getRequiredTaskList() {
  return [...facebookTasks, ...youtubeTasks].filter((t) => t.required);
}

function getIncompleteRequiredTasks() {
  return getRequiredTaskList().filter((t) => {
    const sub = mySubmissions[t.id];
    return !sub || sub.status !== "completed";
  });
}

function areRequiredTasksCompleted() {
  return getIncompleteRequiredTasks().length === 0;
}

function renderUserData(data) {
  currentUserData = data;

  walletBalanceEl.textContent = formatCurrency(data.walletBalance);
  totalIncomeEl.textContent = formatCurrency(data.totalIncome);

  accountStatusEl.textContent = data.isFrozen
    ? "Frozen"
    : data.isActive
      ? "Active"
      : pendingActivationCount > 0
        ? "Pending Activation"
        : "Inactive";

  joinDateEl.textContent = formatDate(data.createdAt);
  referralCodeEl.textContent = data.referralCode || "--------";
  userIdEl.textContent = data.uid.slice(0, 10) + "...";

  profilePhotoEl.src = data.photoURL || "assets/user.png";
  profileNameEl.textContent = data.name || "Refer Earn User";
  profileEmailEl.textContent = data.email || "";
  profilePhoneEl.textContent = data.phone || "Not Set";
  profileDistrictEl.textContent = data.district || "Not Set";

  const referralLink = `${window.location.origin}${window.location.pathname}?ref=${data.referralCode}`;
  referralLinkEl.value = referralLink;

  currentUIDInput.value = data.uid;
  currentReferralCodeInput.value = data.referralCode;
  currentUserEmailInput.value = data.email;

  sessionUserEl.textContent = data.name;
  sessionStatusEl.classList.remove("hidden");

  modalUIDEl.textContent = data.uid;
  modalEmailEl.textContent = data.email;
  modalStatusEl.textContent = data.isFrozen ? "Frozen" : data.isActive ? "Active" : "Inactive";
  modalBalanceEl.textContent = formatCurrency(data.walletBalance);

  activationActiveCardEl.classList.toggle("hidden", !data.isActive);
  activationFormWrapperEl.classList.toggle("hidden", data.isActive);

  const today = getTodayDateStr();

  dailyBonusStatusEl.textContent = data.lastLoginBonusDate === today
    ? "✅ আজকের ৳" + DAILY_LOGIN_BONUS + " Bonus সংগ্রহ করা হয়েছে।"
    : "প্রতিদিন Login করলে ৳" + DAILY_LOGIN_BONUS + " Bonus স্বয়ংক্রিয়ভাবে যোগ হয়।";

  const alreadySpunToday = data.lastSpinDate === today;
  spinBtn.disabled = alreadySpunToday || isSpinning;
  spinStatusEl.textContent = alreadySpunToday
    ? "আজকের Lucky Spin সম্পন্ন হয়েছে। আগামীকাল আবার চেষ্টা করুন।"
    : "প্রতিদিন ১ বার Spin করার সুযোগ পাবেন।";

  updateWithdrawUI();
}

function renderRankUI(referralCount) {
  const { current, next, percent, isMax } = getRankInfo(referralCount);

  userRankEl.textContent = current.name;
  currentRankEl.textContent = current.name;
  nextRankEl.textContent = isMax ? "Max Rank" : next.name;

  rankProgressBarEl.style.width = percent + "%";
  rankProgressBarEl.textContent = percent + "%";

  referralProgressEl.style.width = percent + "%";
  referralProgressEl.textContent = percent + "%";

  modalRankEl.textContent = current.name;
}

function updateWithdrawUI() {
  if (!currentUserData) return;

  const balance = currentUserData.walletBalance || 0;
  const activeCount = currentUserData.activeReferralCount || 0;

  withdrawWalletBalanceEl.textContent = formatCurrency(balance);
  withdrawActiveReferralsEl.textContent = activeCount;

  const eligible = balance >= MIN_WITHDRAW_AMOUNT;
  withdrawInsufficientCard.classList.toggle("hidden", eligible);
  withdrawFormCard.classList.toggle("hidden", !eligible);
  withdrawInsufficientBalanceEl.textContent = formatCurrency(balance);

  if (!eligible) return;

  const selectedAmount = Number(withdrawAmountEl.value);
  const requiredReferrals = WITHDRAW_TIERS[selectedAmount] || 0;
  const meetsReferralReq = activeCount >= requiredReferrals;
  const meetsBalanceReq = balance >= selectedAmount;

  if (!meetsBalanceReq) {
    withdrawRequirementStatusEl.innerHTML = `<span class="badge badge-danger">❌ এই Amount-এর জন্য যথেষ্ট Wallet Balance নেই</span>`;
  } else if (!meetsReferralReq) {
    withdrawRequirementStatusEl.innerHTML = `<span class="badge badge-warning">⚠️ এই Amount-এর জন্য ${requiredReferrals}টি Active Referral প্রয়োজন, আপনার আছে ${activeCount}টি</span>`;
  } else {
    withdrawRequirementStatusEl.innerHTML = `<span class="badge badge-success">✅ Referral শর্ত পূরণ হয়েছে</span>`;
  }

  const incompleteTasks = getIncompleteRequiredTasks();
  if (incompleteTasks.length === 0) {
    withdrawTaskRequirementStatusEl.innerHTML = `<span class="badge badge-success">✅ সকল Required Task সম্পন্ন হয়েছে</span>`;
  } else {
    const names = incompleteTasks.map((t) => t.taskName).join(", ");
    withdrawTaskRequirementStatusEl.innerHTML = `<span class="badge badge-danger">❌ অসম্পূর্ণ Required Task: ${names}</span>`;
  }
}

function listenUserDoc(uid) {
  const userRef = doc(db, USERS, uid);
  const unsub = onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    renderUserData(data);

    if (!subscriptions.referralsAttached) {
      subscriptions.referralsAttached = true;
      attachReferralListener(data.referralCode);
      attachTodayIncomeListener(uid);
    }
  });
  subscriptions.push(unsub);
}

function attachReferralListener(referralCode) {
  const q = query(collection(db, USERS), where("referredBy", "==", referralCode));
  const unsub = onSnapshot(q, (snap) => {
    let activeCount = 0;
    snap.forEach((d) => { if (d.data().isActive) activeCount++; });

    totalReferralsEl.textContent = snap.size;
    activeReferralsEl.textContent = activeCount;
    progressReferralEl.textContent = activeCount;

    renderRankUI(activeCount);
  });
  subscriptions.push(unsub);
}

function attachTodayIncomeListener(uid) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startTimestamp = Timestamp.fromDate(startOfDay);

  const q = query(
    collection(db, TRANSACTIONS),
    where("uid", "==", uid),
    where("createdAt", ">=", startTimestamp)
  );

  const unsub = onSnapshot(q, (snap) => {
    let sum = 0;
    snap.forEach((d) => {
      const t = d.data();
      if (["referral_bonus", "activation_bonus", "admin_credit", "daily_login_bonus", "lucky_spin", "rank_bonus", "facebook_task_reward", "youtube_task_reward"].includes(t.type)) {
        sum += Number(t.amount) || 0;
      }
    });
    todayIncomeEl.textContent = formatCurrency(sum);
  });
  subscriptions.push(unsub);
}

function transactionRow(t) {
  const statusClass = t.status === "completed" ? "badge-success" : t.status === "pending" ? "badge-warning" : "badge-danger";
  const amountSign = Number(t.amount) >= 0 ? "+" : "";
  return `<tr>
    <td>${formatDate(t.createdAt)}</td>
    <td>${t.type.replace(/_/g, " ")}</td>
    <td>${amountSign}${formatCurrency(t.amount)}</td>
    <td><span class="badge ${statusClass}">${t.status}</span></td>
  </tr>`;
}

function attachTransactionsListener(uid) {
  const q = query(collection(db, TRANSACTIONS), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(50));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    completedTasksEl.textContent = docs.filter((t) => t.status === "completed").length;

    transactionHistoryEl.innerHTML = docs.length
      ? docs.map(transactionRow).join("")
      : `<tr><td colspan="4">No Transactions Found</td></tr>`;

    walletHistoryEl.innerHTML = docs.length
      ? docs.slice(0, 8).map((t) => `
        <div class="card">
          <strong>${t.type.replace(/_/g, " ")}</strong>
          <p>${t.description || ""}</p>
          <p>${Number(t.amount) >= 0 ? "+" : ""}${formatCurrency(t.amount)} • ${formatDate(t.createdAt)}</p>
        </div>`).join("")
      : `<div class="card">No Wallet Activity</div>`;

    activityListEl.innerHTML = docs.length
      ? docs.slice(0, 5).map((t) => `
        <div class="card">
          <strong>${t.type.replace(/_/g, " ")}</strong> — ${Number(t.amount) >= 0 ? "+" : ""}${formatCurrency(t.amount)}
          <p>${formatDate(t.createdAt)}</p>
        </div>`).join("")
      : `<div class="card">No Activity Found</div>`;
  });
  subscriptions.push(unsub);
}

function attachWithdrawListener(uid) {
  const q = query(collection(db, WITHDRAWS), where("uid", "==", uid), orderBy("requestedAt", "desc"), limit(50));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    pendingWithdrawCount = docs.filter((w) => w.status === "pending").length;
    updatePendingRequests();

    withdrawHistoryEl.innerHTML = docs.length
      ? docs.map((w) => {
          const statusClass = w.status === "approved" ? "badge-success" : w.status === "pending" ? "badge-warning" : "badge-danger";
          return `<tr>
            <td>${formatDate(w.requestedAt)}</td>
            <td>${formatCurrency(w.amount)}</td>
            <td><span class="badge ${statusClass}">${w.status}</span></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="3">No Withdraw History</td></tr>`;
  });
  subscriptions.push(unsub);
}

function attachActivationListener(uid) {
  const q = query(collection(db, ACTIVATIONS), where("uid", "==", uid), orderBy("requestedAt", "desc"), limit(1));
  const unsub = onSnapshot(q, (snap) => {
    pendingActivationCount = 0;
    snap.forEach((d) => { if (d.data().status === "pending") pendingActivationCount = 1; });
    updatePendingRequests();

    if (currentUserData) {
      accountStatusEl.textContent = currentUserData.isFrozen
        ? "Frozen"
        : currentUserData.isActive
          ? "Active"
          : pendingActivationCount > 0
            ? "Pending Activation"
            : "Inactive";
    }
  });
  subscriptions.push(unsub);
}

function updatePendingRequests() {
  pendingRequestsEl.textContent = pendingActivationCount + pendingWithdrawCount;
}

function attachLeaderboardListener() {
  const q = query(collection(db, USERS), orderBy("totalIncome", "desc"), limit(10));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    leaderboardTableEl.innerHTML = docs.length
      ? docs.map((u, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td>${u.name}</td>
          <td>${u.activeReferralCount || 0}</td>
        </tr>`).join("")
      : `<tr><td colspan="3">No Leaderboard Data</td></tr>`;
  });
  subscriptions.push(unsub);
}

function attachNotificationsListener(uid) {
  const q = query(collection(db, NOTIFICATIONS), where("uid", "in", [uid, "all"]), orderBy("createdAt", "desc"), limit(30));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    notificationListEl.innerHTML = docs.length
      ? docs.map((n) => `
        <div class="card">
          <strong>${n.title}</strong>
          <p>${n.message}</p>
          <p>${formatDate(n.createdAt)}</p>
        </div>`).join("")
      : `<div class="card">No notifications.</div>`;
  });
  subscriptions.push(unsub);
}

function attachBroadcastListener() {
  const q = query(collection(db, BROADCAST), orderBy("createdAt", "desc"), limit(1));
  const unsub = onSnapshot(q, (snap) => {
    if (snap.empty) {
      broadcastBoxEl.innerHTML = "No broadcast available.";
      return;
    }
    const b = snap.docs[0].data();
    broadcastBoxEl.innerHTML = `<strong>${b.title}</strong><p>${b.message}</p>`;
  });
  subscriptions.push(unsub);
}

function taskStatusBadge(sub) {
  if (!sub) return `<span class="badge badge-warning">Incomplete</span>`;
  if (sub.status === "pending") return `<span class="badge badge-info">Under Review</span>`;
  if (sub.status === "completed") return `<span class="badge badge-success">Completed</span>`;
  return `<span class="badge badge-danger">Rejected</span>`;
}

function renderTaskSection(platform) {
  const list = platform === "facebook" ? facebookTasks : youtubeTasks;
  const container = platform === "facebook" ? facebookTaskListEl : youtubeTaskListEl;
  const counterEl = platform === "facebook" ? facebookTaskCounterEl : youtubeTaskCounterEl;
  const icon = platform === "facebook" ? "📘" : "▶️";

  let unreadCount = 0;

  container.innerHTML = list.length
    ? list.map((t) => {
        const sub = mySubmissions[t.id];
        const isCompleted = sub && sub.status === "completed";
        const isPending = sub && sub.status === "pending";
        const canSubmit = !sub || sub.status === "rejected";
        if (canSubmit) unreadCount++;

        return `<div class="task-card">
          <div class="task-card-top">
            <span class="task-platform-icon">${icon}</span>
            <div>
              <h4>${t.taskName}</h4>
              <p>${t.instruction || ""}</p>
            </div>
            ${t.required ? '<span class="badge badge-warning task-required-badge">Required</span>' : ""}
          </div>
          <div class="task-card-footer">
            <a href="${t.taskLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-xs">Open Link</a>
            <span class="task-reward">৳${t.reward}</span>
            ${taskStatusBadge(sub)}
            ${canSubmit ? `<button type="button" class="btn btn-primary btn-xs task-submit-open-btn" data-task-id="${t.id}" data-platform="${platform}">Submit</button>` : ""}
          </div>
        </div>`;
      }).join("")
    : `<div class="card">এই মুহূর্তে কোনো ${platform === "facebook" ? "Facebook" : "YouTube"} Task নেই।</div>`;

  counterEl.textContent = unreadCount;

  container.querySelectorAll(".task-submit-open-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const taskId = btn.dataset.taskId;
      const taskPlatform = btn.dataset.platform;
      const task = (taskPlatform === "facebook" ? facebookTasks : youtubeTasks).find((t) => t.id === taskId);
      if (task) openTaskSubmitModal(task, taskPlatform);
    });
  });
}

function openTaskSubmitModal(task, platform) {
  taskSubmitTitleEl.textContent = task.taskName;
  taskSubmitInstructionEl.textContent = task.instruction || "";
  taskSubmitTaskIdEl.value = task.id;
  taskSubmitPlatformEl.value = platform;
  taskProfileLinkLabelEl.textContent = platform === "facebook" ? "Facebook Profile Link / User ID" : "YouTube Channel Link / User ID";
  taskProfileLinkInput.value = "";
  taskScreenshotInput.value = "";
  taskScreenshotPreviewEl.classList.add("hidden");
  selectedTaskScreenshotBase64 = null;
  openModal(taskSubmitModal);
}

closeTaskSubmitModal.addEventListener("click", () => closeModalEl(taskSubmitModal));

taskScreenshotInput.addEventListener("change", () => {
  const file = taskScreenshotInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showWarning("সঠিক Image ফাইল Select করুন।");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 500;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = Math.round(height * (maxSize / width));
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round(width * (maxSize / height));
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      selectedTaskScreenshotBase64 = canvas.toDataURL("image/jpeg", 0.55);
      taskScreenshotPreviewEl.src = selectedTaskScreenshotBase64;
      taskScreenshotPreviewEl.classList.remove("hidden");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

taskSubmitBtn.addEventListener("click", async () => {
  const taskId = taskSubmitTaskIdEl.value;
  const platform = taskSubmitPlatformEl.value;
  const profileLink = taskProfileLinkInput.value.trim();
  const task = (platform === "facebook" ? facebookTasks : youtubeTasks).find((t) => t.id === taskId);

  if (!task) {
    showError("Task খুঁজে পাওয়া যায়নি।");
    return;
  }
  if (!selectedTaskScreenshotBase64) {
    showWarning("Screenshot Upload করা বাধ্যতামূলক।");
    return;
  }
  if (!profileLink) {
    showWarning("Profile Link অথবা User ID দিন।");
    return;
  }

  taskSubmitBtn.disabled = true;

  try {
    showActionLoading(true);

    const submissionRef = doc(db, TASK_SUBMISSIONS, `${currentUser.uid}_${taskId}`);
    await setDoc(submissionRef, {
      uid: currentUser.uid,
      name: currentUserData.name,
      email: currentUserData.email,
      taskId,
      taskName: task.taskName,
      platform,
      taskLink: task.taskLink,
      reward: task.reward,
      required: task.required,
      screenshotBase64: selectedTaskScreenshotBase64,
      profileLink,
      submittedAt: serverTimestamp(),
      status: "pending",
      reviewedAt: null,
      reviewedBy: "",
      rejectReason: ""
    });

    closeModalEl(taskSubmitModal);
    showSuccess("আপনার Task Submission জমা হয়েছে। অ্যাডমিন যাচাই করার পর Reward যোগ হবে।");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
    taskSubmitBtn.disabled = false;
  }
});

function attachTasksListeners(uid) {
  const facebookUnsub = onSnapshot(
    query(collection(db, TASKS), where("platform", "==", "facebook"), where("isActive", "==", true), orderBy("createdAt", "desc")),
    (snap) => {
      facebookTasks = [];
      snap.forEach((d) => facebookTasks.push({ id: d.id, ...d.data() }));
      renderTaskSection("facebook");
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(facebookUnsub);

  const youtubeUnsub = onSnapshot(
    query(collection(db, TASKS), where("platform", "==", "youtube"), where("isActive", "==", true), orderBy("createdAt", "desc")),
    (snap) => {
      youtubeTasks = [];
      snap.forEach((d) => youtubeTasks.push({ id: d.id, ...d.data() }));
      renderTaskSection("youtube");
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(youtubeUnsub);

  const submissionsUnsub = onSnapshot(
    query(collection(db, TASK_SUBMISSIONS), where("uid", "==", uid)),
    (snap) => {
      mySubmissions = {};
      snap.forEach((d) => { mySubmissions[d.data().taskId] = d.data(); });
      renderTaskSection("facebook");
      renderTaskSection("youtube");
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(submissionsUnsub);
}

function attachAllListeners(uid) {
  subscriptions = [];
  subscriptions.referralsAttached = false;
  listenUserDoc(uid);
  attachTransactionsListener(uid);
  attachWithdrawListener(uid);
  attachActivationListener(uid);
  attachLeaderboardListener();
  attachNotificationsListener(uid);
  attachBroadcastListener();
  attachTasksListeners(uid);
}

function detachAllListeners() {
  subscriptions.forEach((unsub) => { if (typeof unsub === "function") unsub(); });
  subscriptions = [];
}

onAuthStateChanged(auth, async (user) => {
  showGlobalLoading(true);

  if (user) {
    currentUser = user;
    await ensureUserDocument(user);
    await claimDailyLoginBonus(user.uid);
    attachAllListeners(user.uid);

    loginBtn.hidden = true;
    logoutBtn.hidden = false;
    appEl.hidden = false;
  } else {
    currentUser = null;
    currentUserData = null;
    detachAllListeners();

    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    appEl.hidden = true;
    sessionStatusEl.classList.add("hidden");
  }

  showGlobalLoading(false);
});

loginBtn.addEventListener("click", async () => {
  try {
    showGlobalLoading(true);
    await signInWithPopup(auth, provider);
  } catch (err) {
    showError(err.message);
  } finally {
    showGlobalLoading(false);
  }
});

logoutBtn.addEventListener("click", async () => {
  const confirmed = await showConfirm("Logout", "Are you sure you want to logout?");
  if (confirmed) {
    await signOut(auth);
    showToast("Logged Out", "You have been logged out successfully.", "info");
  }
});

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const temp = document.createElement("textarea");
    temp.value = text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    return true;
  }
}

copyReferralBtn.addEventListener("click", () => {
  copyReferralInputEl.value = referralLinkEl.value;
  openModal(copyModal);
});

copyNowBtn.addEventListener("click", async () => {
  await copyText(copyReferralInputEl.value);
  showToast("Copied", "Referral link copied to clipboard.", "success");
  closeModalEl(copyModal);
});

closeCopyModal.addEventListener("click", () => closeModalEl(copyModal));

copyLinkBtn.addEventListener("click", async () => {
  await copyText(referralLinkEl.value);
  showToast("Copied", "Referral link copied to clipboard.", "success");
});

shareBtn.addEventListener("click", async () => {
  const link = referralLinkEl.value;
  if (navigator.share) {
    try {
      await navigator.share({ title: "Refer Earn", text: "Join Refer Earn using my referral link!", url: link });
    } catch {}
  } else {
    await copyText(link);
    showToast("Copied", "Sharing not supported, link copied instead.", "info");
  }
});

refreshBtn.addEventListener("click", () => {
  showToast("Refreshing", "Reloading your latest data...", "info");
  setTimeout(() => window.location.reload(), 600);
});

leaderboardBtn.addEventListener("click", () => {
  $("leaderboard").scrollIntoView({ behavior: "smooth" });
});

withdrawAmountEl.addEventListener("change", updateWithdrawUI);

editProfileBtn.addEventListener("click", () => {
  editNameEl.value = currentUserData.name || "";
  editPhoneEl.value = currentUserData.phone || "";
  editDistrictEl.value = currentUserData.district || "";
  editPhotoEl.value = "";
  selectedPhotoBase64 = null;
  editPhotoPreviewEl.src = currentUserData.photoURL || "assets/user.png";
  openModal(editProfileModal);
});

closeProfileModal.addEventListener("click", () => closeModalEl(editProfileModal));

editPhotoEl.addEventListener("change", () => {
  const file = editPhotoEl.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showWarning("সঠিক Image ফাইল Select করুন।");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 300;
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxSize) {
        height = Math.round(height * (maxSize / width));
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round(width * (maxSize / height));
        height = maxSize;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      selectedPhotoBase64 = canvas.toDataURL("image/jpeg", 0.7);
      editPhotoPreviewEl.src = selectedPhotoBase64;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

saveProfileBtn.addEventListener("click", async () => {
  const name = editNameEl.value.trim();
  const phone = editPhoneEl.value.trim();
  const district = editDistrictEl.value.trim();

  if (!name) {
    showWarning("Full name is required.");
    return;
  }

  const updateData = { name, phone, district };
  if (selectedPhotoBase64) {
    updateData.photoURL = selectedPhotoBase64;
  }

  try {
    showActionLoading(true);
    await updateDoc(doc(db, USERS, currentUser.uid), updateData);
    closeModalEl(editProfileModal);
    showSuccess("Profile updated successfully.");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

profilePhotoEl.style.cursor = "pointer";
profilePhotoEl.addEventListener("click", () => {
  previewImageEl.src = profilePhotoEl.src;
  openModal(imagePreviewModal);
});

closePreview.addEventListener("click", () => closeModalEl(imagePreviewModal));

walletBalanceEl.style.cursor = "pointer";
walletBalanceEl.addEventListener("click", () => openModal(userInfoModal));
closeUserInfo.addEventListener("click", () => closeModalEl(userInfoModal));

document.querySelectorAll(".copy-number-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    await copyText(btn.dataset.number);
    showToast("কপি হয়েছে", "নম্বর কপি হয়েছে", "success");
  });
});

activationBtn.addEventListener("click", async () => {
  if (currentUserData.isActive) {
    showWarning("আপনার অ্যাকাউন্ট ইতিমধ্যে অ্যাক্টিভ আছে।");
    return;
  }
  if (pendingActivationCount > 0) {
    showWarning("আপনার একটি অ্যাক্টিভেশন রিকোয়েস্ট ইতিমধ্যে Pending আছে।");
    return;
  }

  const method = paymentMethodEl.value;
  const senderNumber = senderNumberEl.value.trim();
  const transactionId = transactionIdEl.value.trim();
  const bdPhoneRegex = /^01[3-9]\d{8}$/;

  if (!senderNumber || !transactionId) {
    showWarning("সব ফিল্ড পূরণ করুন।");
    return;
  }
  if (!bdPhoneRegex.test(senderNumber)) {
    showWarning("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।");
    return;
  }

  const confirmed = await showConfirm(
    "অ্যাক্টিভেশন রিকোয়েস্ট নিশ্চিত করুন",
    `${method} নাম্বারে ${senderNumber} থেকে ১২৫ টাকা Send Money করেছেন এবং Transaction ID "${transactionId}" সঠিক তো?`
  );
  if (!confirmed) return;

  activationBtn.disabled = true;

  try {
    showActionLoading(true);
    await addDoc(collection(db, ACTIVATIONS), {
      uid: currentUser.uid,
      name: currentUserData.name,
      method,
      senderNumber,
      transactionId,
      status: "pending",
      requestedAt: serverTimestamp(),
      processedAt: null,
      adminNote: ""
    });

    senderNumberEl.value = "";
    transactionIdEl.value = "";
    showSuccess("আপনার অ্যাক্টিভেশন রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাই করার পর ১-১৫ মিনিটের মধ্যে অ্যাকাউন্ট অ্যাক্টিভ হবে।");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
    activationBtn.disabled = false;
  }
});

withdrawBtn.addEventListener("click", async () => {
  if (!currentUserData.isActive) {
    showWarning("Withdraw করার জন্য আপনার Account Active থাকতে হবে।");
    return;
  }

  if (currentUserData.isFrozen) {
    showWarning("আপনার Account Frozen করা আছে, তাই Withdraw করা যাচ্ছে না।");
    return;
  }

  if (pendingWithdrawCount > 0) {
    showWarning("আপনার একটি Withdraw Request ইতিমধ্যে Pending আছে। সেটি প্রসেস না হওয়া পর্যন্ত নতুন Request দেওয়া যাবে না।");
    return;
  }

  const amount = Number(withdrawAmountEl.value);
  const method = withdrawMethodEl.value;
  const accountNumber = withdrawNumberEl.value.trim();
  const bdPhoneRegex = /^01[3-9]\d{8}$/;

  if (!WITHDRAW_TIERS[amount]) {
    showWarning("সঠিক একটি Withdraw Amount Select করুন।");
    return;
  }

  const requiredReferrals = WITHDRAW_TIERS[amount];
  const activeCount = currentUserData.activeReferralCount || 0;

  if ((currentUserData.walletBalance || 0) < MIN_WITHDRAW_AMOUNT) {
    showWarning(`Withdraw করার জন্য Wallet Balance কমপক্ষে ৳${MIN_WITHDRAW_AMOUNT} হতে হবে।`);
    return;
  }

  if (amount > currentUserData.walletBalance) {
    showWarning("এই Amount Withdraw করার জন্য যথেষ্ট Wallet Balance নেই।");
    return;
  }

  if (activeCount < requiredReferrals) {
    showWarning(`এই Amount Withdraw করতে ${requiredReferrals}টি Active Referral প্রয়োজন, আপনার আছে ${activeCount}টি।`);
    return;
  }

  if (!areRequiredTasksCompleted()) {
    const names = getIncompleteRequiredTasks().map((t) => t.taskName).join(", ");
    showWarning(`Withdraw করার আগে নিচের Required Task সম্পূর্ণ করুন: ${names}`);
    return;
  }

  if (!accountNumber) {
    showWarning("Mobile Number দিন।");
    return;
  }
  if (!bdPhoneRegex.test(accountNumber)) {
    showWarning("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।");
    return;
  }

  const confirmed = await showConfirm(
    "Withdraw নিশ্চিত করুন",
    `${method} নাম্বার ${accountNumber}-এ ${formatCurrency(amount)} Withdraw করতে চান? Approval Time: সকাল ৬টা থেকে রাত ১২টা। Payment সম্পন্ন হতে ১-১৫ মিনিট সময় লাগতে পারে।`
  );
  if (!confirmed) return;

  withdrawBtn.disabled = true;

  try {
    showActionLoading(true);

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS, currentUser.uid);
      const userSnap = await transaction.get(userRef);
      const freshData = userSnap.data();
      const balance = freshData.walletBalance || 0;

      if (amount > balance) {
        throw new Error("Insufficient wallet balance.");
      }
      if ((freshData.activeReferralCount || 0) < requiredReferrals) {
        throw new Error("Active referral requirement not met.");
      }

      transaction.update(userRef, { walletBalance: increment(-amount) });

      const withdrawRef = doc(collection(db, WITHDRAWS));
      transaction.set(withdrawRef, {
        uid: currentUser.uid,
        name: currentUserData.name,
        email: currentUserData.email,
        amount,
        method,
        accountNumber,
        walletBalanceAtRequest: balance,
        activeReferralCountAtRequest: freshData.activeReferralCount || 0,
        status: "pending",
        requestedAt: serverTimestamp(),
        processedAt: null,
        adminNote: ""
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid: currentUser.uid,
        type: "withdraw",
        amount: -amount,
        description: `Withdraw request via ${method}`,
        status: "pending",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid: currentUser.uid,
        title: "Withdraw Request Submitted",
        message: `আপনার ${formatCurrency(amount)} Withdraw Request জমা হয়েছে। Admin যাচাই করে Approve করবেন।`,
        type: "info",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    withdrawNumberEl.value = "";
    showSuccess("আপনার Withdraw Request সফলভাবে জমা হয়েছে। Admin যাচাই করার পর Payment Process করবেন।");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
    withdrawBtn.disabled = false;
  }
});

spinBtn.addEventListener("click", async () => {
  if (isSpinning) return;

  const today = getTodayDateStr();
  if (currentUserData.lastSpinDate === today) {
    showWarning("আজকের Lucky Spin ইতিমধ্যে সম্পন্ন হয়েছে।");
    return;
  }

  isSpinning = true;
  spinBtn.disabled = true;
  spinResultEl.textContent = "";

  const rewardIndex = Math.floor(Math.random() * SPIN_REWARDS.length);
  const reward = SPIN_REWARDS[rewardIndex];
  const segmentCenter = rewardIndex * SPIN_SEGMENT_ANGLE + (SPIN_SEGMENT_ANGLE / 2);
  const extraSpins = 5 * 360;
  const targetRotation = extraSpins + (360 - segmentCenter);

  spinWheelEl.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.32, 1.15)";
  spinWheelEl.style.transform = `rotate(${targetRotation}deg)`;

  setTimeout(async () => {
    try {
      const userRef = doc(db, USERS, currentUser.uid);

      const granted = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(userRef);
        const data = snap.data();
        if (data.lastSpinDate === today) return false;

        transaction.update(userRef, {
          walletBalance: increment(reward),
          totalIncome: increment(reward),
          lastSpinDate: today
        });

        const txnRef = doc(collection(db, TRANSACTIONS));
        transaction.set(txnRef, {
          uid: currentUser.uid,
          type: "lucky_spin",
          amount: reward,
          description: "Lucky Spin Reward",
          status: "completed",
          createdAt: serverTimestamp()
        });

        const notifRef = doc(collection(db, NOTIFICATIONS));
        transaction.set(notifRef, {
          uid: currentUser.uid,
          title: "Lucky Spin",
          message: reward > 0
            ? `Lucky Spin থেকে আপনি ৳${reward} জিতেছেন!`
            : "আজকের Lucky Spin-এ এবার কোনো Reward আসেনি, কাল আবার চেষ্টা করুন।",
          type: reward > 0 ? "success" : "info",
          isRead: false,
          createdAt: serverTimestamp()
        });

        return true;
      });

      if (granted) {
        spinResultEl.textContent = reward > 0
          ? `🎉 আপনি ৳${reward} জিতেছেন!`
          : "😔 এবার কোনো Reward আসেনি। কাল আবার চেষ্টা করুন।";

        if (reward > 0) {
          showSuccess(`অভিনন্দন! আপনি Lucky Spin থেকে ৳${reward} জিতেছেন।`);
        } else {
          showToast("Lucky Spin", "এবার কোনো Reward আসেনি। কাল আবার চেষ্টা করুন।", "info");
        }
      } else {
        showWarning("আজকের Lucky Spin ইতিমধ্যে সম্পন্ন হয়েছে।");
      }
    } catch (err) {
      showError(err.message);
    } finally {
      isSpinning = false;
      spinBtn.disabled = currentUserData.lastSpinDate === today;
    }
  }, 4200);
});

window.addEventListener("online", () => {
  networkStatusEl.classList.remove("offline");
  networkStatusEl.classList.add("online");
  networkDotEl.textContent = "🟢";
  networkTextEl.textContent = "Online";
});

window.addEventListener("offline", () => {
  networkStatusEl.classList.remove("online");
  networkStatusEl.classList.add("offline");
  networkDotEl.textContent = "🔴";
  networkTextEl.textContent = "Offline";
});

window.addEventListener("scroll", () => {
  scrollTopBtn.hidden = window.scrollY < 400;
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
