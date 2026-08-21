import {
  auth, db, provider,
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, getDocs,
  query, where, orderBy, limit,
  serverTimestamp, increment, onSnapshot, runTransaction,
  Timestamp,
  USERS, WITHDRAWS, ACTIVATIONS, TRANSACTIONS, BROADCAST, NOTIFICATIONS,
  TASKS, TASK_SUBMISSIONS, CONTESTS,
  RANK_LEVELS, LEVEL_COMMISSIONS, PHONE_AUTH_DOMAIN
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

const authCard = $("authCard");
const authTabLogin = $("authTabLogin");
const authTabSignup = $("authTabSignup");
const loginPanel = $("loginPanel");
const signupPanel = $("signupPanel");
const loginBtn = $("loginBtn");
const signupGoogleBtn = $("signupGoogleBtn");
const loginPhoneInput = $("loginPhoneInput");
const loginPasswordInput = $("loginPasswordInput");
const phoneLoginBtn = $("phoneLoginBtn");
const signupPhoneInput = $("signupPhoneInput");
const signupPasswordInput = $("signupPasswordInput");
const phoneSignupBtn = $("phoneSignupBtn");
const logoutBtn = $("logoutBtn");
const appEl = $("app");

const walletBalanceEl = $("walletBalance");
const todayIncomeEl = $("todayIncome");
const totalIncomeEl = $("totalIncome");
const userRankEl = $("userRank");

const totalReferralsEl = $("totalReferrals");
const activeReferralsEl = $("activeReferrals");
const availableReferralStatEl = $("availableReferralStat");
const pendingRequestsEl = $("pendingRequests");
const completedTasksEl = $("completedTasks");

const copyReferralBtn = $("copyReferralBtn");
const shareBtn = $("shareBtn");
const refreshBtn = $("refreshBtn");
const leaderboardBtn = $("leaderboardBtn");

const accountStatusEl = $("accountStatus");
const joinDateEl = $("joinDate");
const referralCodeEl = $("referralCode");

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

const withdrawMethodEl = $("withdrawMethod");
const withdrawNumberEl = $("withdrawNumber");
const withdrawBtn = $("withdrawBtn");
const withdrawWalletBalanceEl = $("withdrawWalletBalance");
const withdrawAvailableReferralEl = $("withdrawAvailableReferral");
const withdrawInsufficientCard = $("withdrawInsufficientCard");
const withdrawInsufficientBalanceEl = $("withdrawInsufficientBalance");
const withdrawFormCard = $("withdrawFormCard");
const withdrawReferralStatusEl = $("withdrawReferralStatus");
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

const referralTreeSearchInput = $("referralTreeSearch");
const referralTreeLevelFilter = $("referralTreeLevelFilter");
const treeViewListBtn = $("treeViewListBtn");
const treeViewTreeBtn = $("treeViewTreeBtn");
const loadReferralTreeBtn = $("loadReferralTreeBtn");
const referralTreeContainer = $("referralTreeContainer");
const referralHistoryTableEl = $("referralHistoryTable");

const contestActiveCard = $("contestActiveCard");
const contestNoneCard = $("contestNoneCard");
const contestTitleEl = $("contestTitle");
const contestStatusBadgeEl = $("contestStatusBadge");
const contestDescriptionEl = $("contestDescription");
const contestStartDateEl = $("contestStartDate");
const contestEndDateEl = $("contestEndDate");
const contestProgressBarEl = $("contestProgressBar");
const contestPrizeListEl = $("contestPrizeList");
const contestMyRankEl = $("contestMyRank");
const contestLeaderboardTableEl = $("contestLeaderboardTable");
const contestHistoryContainerEl = $("contestHistoryContainer");

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

const dailyBonusStatusEl = $("dailyBonusStatus");
const dailyBonusBtn = $("dailyBonusBtn");
const spinBtn = $("spinBtn");
const spinWheelEl = $("spinWheel");
const spinResultEl = $("spinResult");
const spinStatusEl = $("spinStatus");

const quickNavBtn = $("quickNavBtn");
const quickNavOverlay = $("quickNavOverlay");
const closeQuickNav = $("closeQuickNav");
const quickNavReferralLink = $("quickNavReferralLink");
const quickNavCopyBtn = $("quickNavCopyBtn");

const DAILY_LOGIN_BONUS = 5;
const REGISTRATION_BONUS = 5;
const SPIN_REWARDS = [0, 1, 2, 3, 4, 5];
const SPIN_SEGMENT_ANGLE = 360 / SPIN_REWARDS.length;

const WITHDRAW_AMOUNT = 350;
const REQUIRED_NEW_REFERRAL = 3;
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

let currentUser = null;
let currentUserData = null;
let subscriptions = [];
let toastTimer = null;
let pendingActivationCount = 0;
let pendingWithdrawCount = 0;
let isSpinning = false;
let selectedPhotoBase64 = null;
let selectedTaskScreenshotBase64 = null;
let pendingSignupPhone = null;

let facebookTasks = [];
let youtubeTasks = [];
let mySubmissions = {};

let referralTreeData = [];
let currentTreeView = "list";

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

/* ==============================
   AUTH TAB SWITCH
============================== */

authTabLogin.addEventListener("click", () => {
  authTabLogin.classList.add("auth-tab-active");
  authTabSignup.classList.remove("auth-tab-active");
  loginPanel.classList.remove("hidden");
  signupPanel.classList.add("hidden");
});

authTabSignup.addEventListener("click", () => {
  authTabSignup.classList.add("auth-tab-active");
  authTabLogin.classList.remove("auth-tab-active");
  signupPanel.classList.remove("hidden");
  loginPanel.classList.add("hidden");
});

function phoneToPseudoEmail(phone) {
  return `${phone}@${PHONE_AUTH_DOMAIN}`;
}

function friendlyAuthError(err) {
  const code = err.code || "";
  if (code.includes("email-already-in-use")) return "এই Phone Number দিয়ে ইতিমধ্যে একটি Account আছে। Login করুন।";
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Phone Number অথবা Password ভুল হয়েছে।";
  if (code.includes("user-not-found")) return "এই Phone Number দিয়ে কোনো Account পাওয়া যায়নি। Sign Up করুন।";
  if (code.includes("weak-password")) return "Password কমপক্ষে ৬ অক্ষরের হতে হবে।";
  if (code.includes("popup-closed-by-user")) return "Google Login বাতিল করা হয়েছে।";
  return err.message || "একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।";
}

async function handleGoogleAuth() {
  try {
    showGlobalLoading(true);
    await signInWithPopup(auth, provider);
  } catch (err) {
    showGlobalLoading(false);
    showError(friendlyAuthError(err));
  }
}

loginBtn.addEventListener("click", handleGoogleAuth);
signupGoogleBtn.addEventListener("click", handleGoogleAuth);

phoneSignupBtn.addEventListener("click", async () => {
  const phone = signupPhoneInput.value.trim();
  const password = signupPasswordInput.value;

  if (!BD_PHONE_REGEX.test(phone)) {
    showWarning("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।");
    return;
  }
  if (!password || password.length < 6) {
    showWarning("Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
    return;
  }

  phoneSignupBtn.disabled = true;

  try {
    showGlobalLoading(true);
    pendingSignupPhone = phone;
    await createUserWithEmailAndPassword(auth, phoneToPseudoEmail(phone), password);
  } catch (err) {
    pendingSignupPhone = null;
    showGlobalLoading(false);
    showError(friendlyAuthError(err));
  } finally {
    phoneSignupBtn.disabled = false;
  }
});

phoneLoginBtn.addEventListener("click", async () => {
  const phone = loginPhoneInput.value.trim();
  const password = loginPasswordInput.value;

  if (!BD_PHONE_REGEX.test(phone)) {
    showWarning("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।");
    return;
  }
  if (!password) {
    showWarning("Password দিন।");
    return;
  }

  phoneLoginBtn.disabled = true;

  try {
    showGlobalLoading(true);
    await signInWithEmailAndPassword(auth, phoneToPseudoEmail(phone), password);
  } catch (err) {
    showGlobalLoading(false);
    showError(friendlyAuthError(err));
  } finally {
    phoneLoginBtn.disabled = false;
  }
});

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

async function claimRegistrationBonus(uid) {
  const userRef = doc(db, USERS, uid);
  try {
    await runTransaction(db, async (transaction) => {
      const snap = await transaction.get(userRef);
      const data = snap.data();
      if (!data || data.registrationBonusGiven) return;

      transaction.update(userRef, {
        walletBalance: increment(REGISTRATION_BONUS),
        totalIncome: increment(REGISTRATION_BONUS),
        registrationBonusGiven: true
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid,
        type: "registration_bonus",
        amount: REGISTRATION_BONUS,
        description: "Registration Welcome Bonus",
        status: "completed",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid,
        title: "Welcome Bonus",
        message: `Registration সফল হয়েছে! স্বাগতম বোনাস হিসেবে ৳${REGISTRATION_BONUS} আপনার Wallet-এ যোগ হয়েছে।`,
        type: "success",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    showToast("Welcome Bonus", `Registration Bonus ৳${REGISTRATION_BONUS} পেয়েছেন!`, "success");
  } catch (err) {
    console.error("Registration bonus error:", err.message);
  }
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

    const isPhoneUser = !!pendingSignupPhone;
    const phoneNumber = pendingSignupPhone || "";
    pendingSignupPhone = null;

    await setDoc(userRef, {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || (isPhoneUser ? `User ${phoneNumber.slice(-4)}` : "Refer Earn User"),
      email: isPhoneUser ? "" : (firebaseUser.email || ""),
      photoURL: firebaseUser.photoURL || "",
      phone: phoneNumber,
      district: "",
      authProvider: isPhoneUser ? "phone" : "google",
      referralCode,
      referredBy,
      isActive: false,
      isFrozen: false,
      walletBalance: 0,
      totalIncome: 0,
      referralEarnings: 0,
      activeReferralCount: 0,
      contestReferralCount: 0,
      withdrawableReferralCount: 0,
      rank: "Starter",
      registrationBonusGiven: false,
      lastLoginBonusDate: null,
      lastSpinDate: null,
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });

    claimRegistrationBonus(firebaseUser.uid);
  } else {
    updateDoc(userRef, { lastActive: serverTimestamp() });
  }

  return userRef;
}

async function claimDailyLoginBonus(uid) {
  const today = getTodayDateStr();
  const userRef = doc(db, USERS, uid);

  try {
    dailyBonusBtn.disabled = true;

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
    } else {
      showWarning("আজকের Bonus ইতিমধ্যে সংগ্রহ করা হয়েছে।");
    }
  } catch (err) {
    showError(err.message);
  } finally {
    dailyBonusBtn.disabled = currentUserData ? currentUserData.lastLoginBonusDate === today : false;
  }
}

dailyBonusBtn.addEventListener("click", () => {
  if (!currentUser) return;
  claimDailyLoginBonus(currentUser.uid);
});

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

  profilePhotoEl.src = data.photoURL || "assets/user.png";
  profileNameEl.textContent = data.name || "Refer Earn User";
  profileEmailEl.textContent = data.email || data.phone || "";
  profilePhoneEl.textContent = data.phone || "Not Set";
  profileDistrictEl.textContent = data.district || "Not Set";

  const referralLink = `${window.location.origin}${window.location.pathname}?ref=${data.referralCode}`;
  referralLinkEl.value = referralLink;
  quickNavReferralLink.value = referralLink;

  sessionUserEl.textContent = data.name;
  sessionStatusEl.classList.remove("hidden");

  modalUIDEl.textContent = data.uid;
  modalEmailEl.textContent = data.email || data.phone || "";
  modalStatusEl.textContent = data.isFrozen ? "Frozen" : data.isActive ? "Active" : "Inactive";
  modalBalanceEl.textContent = formatCurrency(data.walletBalance);

  activationActiveCardEl.classList.toggle("hidden", !data.isActive);
  activationFormWrapperEl.classList.toggle("hidden", data.isActive);

  const today = getTodayDateStr();
  const bonusClaimedToday = data.lastLoginBonusDate === today;

  dailyBonusStatusEl.textContent = bonusClaimedToday
    ? "✅ আজকের ৳" + DAILY_LOGIN_BONUS + " Bonus সংগ্রহ করা হয়েছে।"
    : "প্রতিদিন ১ ক্লিকে ৳" + DAILY_LOGIN_BONUS + " Bonus সংগ্রহ করুন।";
  dailyBonusBtn.disabled = bonusClaimedToday;
  dailyBonusBtn.textContent = bonusClaimedToday ? "Claimed" : `Claim ৳${DAILY_LOGIN_BONUS}`;

  const alreadySpunToday = data.lastSpinDate === today;
  spinBtn.disabled = alreadySpunToday || isSpinning;
  spinStatusEl.textContent = alreadySpunToday
    ? "আজকের Lucky Spin সম্পন্ন হয়েছে। আগামীকাল আবার চেষ্টা করুন।"
    : "প্রতিদিন ১ বার Spin করার সুযোগ পাবেন।";

  availableReferralStatEl.textContent = data.withdrawableReferralCount || 0;

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
  const availableReferral = currentUserData.withdrawableReferralCount || 0;

  withdrawWalletBalanceEl.textContent = formatCurrency(balance);
  withdrawAvailableReferralEl.textContent = availableReferral;

  const eligible = balance >= WITHDRAW_AMOUNT;
  withdrawInsufficientCard.classList.toggle("hidden", eligible);
  withdrawFormCard.classList.toggle("hidden", !eligible);
  withdrawInsufficientBalanceEl.textContent = formatCurrency(balance);

  if (!eligible) return;

  if (availableReferral >= REQUIRED_NEW_REFERRAL) {
    withdrawReferralStatusEl.innerHTML = `<span class="badge badge-success">✅ 3 NEW Active Referral Requirement Met</span>`;
  } else {
    withdrawReferralStatusEl.innerHTML = `<span class="badge badge-warning">❌ 3 NEW Active Referral Required (আছে ${availableReferral}টি)</span>`;
  }

  const incompleteTasks = getIncompleteRequiredTasks();
  if (incompleteTasks.length === 0) {
    withdrawTaskRequirementStatusEl.innerHTML = `<span class="badge badge-success">✅ সকল Required Task সম্পন্ন</span>`;
  } else {
    const names = incompleteTasks.map((t) => t.taskName).join(", ");
    withdrawTaskRequirementStatusEl.innerHTML = `<span class="badge badge-danger">❌ Required Task Incomplete: ${names}</span>`;
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
      if (["referral_bonus", "activation_bonus", "admin_credit", "daily_login_bonus", "lucky_spin", "rank_bonus", "facebook_task_reward", "youtube_task_reward", "contest_prize", "registration_bonus"].includes(t.type)) {
        sum += Number(t.amount) || 0;
      }
    });
    todayIncomeEl.textContent = formatCurrency(sum);
  });
  subscriptions.push(unsub);
}

function withdrawStatusLabel(status) {
  if (status === "approved") return { text: "✅ Withdraw Successful", cls: "badge-success" };
  if (status === "pending") return { text: "⏳ Pending", cls: "badge-warning" };
  return { text: "❌ Rejected", cls: "badge-danger" };
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
          const label = withdrawStatusLabel(w.status);
          return `<tr>
            <td>${formatDate(w.requestedAt)}</td>
            <td>${formatCurrency(w.amount)}</td>
            <td><span class="badge ${label.cls}">${label.text}</span></td>
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

function sortByCreatedAtDesc(arr) {
  return arr.sort((a, b) => {
    const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
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
    query(collection(db, TASKS), where("platform", "==", "facebook"), where("isActive", "==", true)),
    (snap) => {
      facebookTasks = [];
      snap.forEach((d) => facebookTasks.push({ id: d.id, ...d.data() }));
      facebookTasks = sortByCreatedAtDesc(facebookTasks);
      renderTaskSection("facebook");
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(facebookUnsub);

  const youtubeUnsub = onSnapshot(
    query(collection(db, TASKS), where("platform", "==", "youtube"), where("isActive", "==", true)),
    (snap) => {
      youtubeTasks = [];
      snap.forEach((d) => youtubeTasks.push({ id: d.id, ...d.data() }));
      youtubeTasks = sortByCreatedAtDesc(youtubeTasks);
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

async function loadReferralTree() {
  if (!currentUserData) return;

  loadReferralTreeBtn.disabled = true;
  loadReferralTreeBtn.textContent = "Loading...";
  referralTreeContainer.innerHTML = `<div class="card">Team Loading...</div>`;

  try {
    let currentLevelCodes = [currentUserData.referralCode];
    referralTreeData = [];

    for (let level = 1; level <= 5; level++) {
      if (currentLevelCodes.length === 0) break;

      const levelUsers = [];
      for (let i = 0; i < currentLevelCodes.length; i += 10) {
        const batch = currentLevelCodes.slice(i, i + 10);
        const q = query(collection(db, USERS), where("referredBy", "in", batch));
        const snap = await getDocs(q);
        snap.forEach((d) => levelUsers.push(d.data()));
      }

      levelUsers.forEach((u) => referralTreeData.push({ ...u, level }));
      currentLevelCodes = levelUsers.map((u) => u.referralCode);
    }

    renderReferralTree();
    renderReferralHistory();

    if (referralTreeData.length === 0) {
      showToast("Team", "আপনার এখনো কোনো Referral Team Member নেই।", "info");
    }
  } catch (err) {
    showError(err.message);
    referralTreeContainer.innerHTML = `<div class="card">Team Load করতে সমস্যা হয়েছে।</div>`;
  } finally {
    loadReferralTreeBtn.disabled = false;
    loadReferralTreeBtn.textContent = "Load My Team";
  }
}

function renderReferralTree() {
  const search = referralTreeSearchInput.value.trim().toLowerCase();
  const levelFilter = referralTreeLevelFilter.value;

  const filtered = referralTreeData.filter((u) => {
    if (levelFilter !== "all" && String(u.level) !== levelFilter) return false;
    if (search && !(u.name || "").toLowerCase().includes(search)) return false;
    return true;
  });

  if (filtered.length === 0) {
    referralTreeContainer.innerHTML = `<div class="card">কোনো Team Member পাওয়া যায়নি। "Load My Team" বাটনে ক্লিক করুন।</div>`;
    return;
  }

  if (currentTreeView === "list") {
    referralTreeContainer.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr><th>Level</th><th>Name</th><th>Referral Code</th><th>Status</th><th>Joined</th></tr></thead><tbody>${
      filtered.map((u) => `<tr>
        <td>Level ${u.level}</td>
        <td>${u.name}</td>
        <td>${u.referralCode}</td>
        <td>${u.isActive ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-warning">Inactive</span>'}</td>
        <td>${formatDate(u.createdAt)}</td>
      </tr>`).join("")
    }</tbody></table></div>`;
  } else {
    let html = "";
    for (let level = 1; level <= 5; level++) {
      const levelUsers = filtered.filter((u) => u.level === level);
      if (levelUsers.length === 0) continue;

      html += `<div class="tree-level-group" style="margin-left:${(level - 1) * 20}px">
        <h4 class="tree-level-title">Level ${level} (${levelUsers.length})</h4>
        ${levelUsers.map((u) => `<div class="tree-node">${u.isActive ? "🟢" : "⚪"} ${u.name} <span class="text-muted">(${u.referralCode})</span></div>`).join("")}
      </div>`;
    }
    referralTreeContainer.innerHTML = html || `<div class="card">কোনো ফলাফল নেই।</div>`;
  }
}

function renderReferralHistory() {
  const level1 = referralTreeData.filter((u) => u.level === 1);

  referralHistoryTableEl.innerHTML = level1.length
    ? level1.map((u) => {
        const commission = u.isActive ? LEVEL_COMMISSIONS[0] : 0;
        const statusBadge = u.isActive
          ? '<span class="badge badge-success">Active</span>'
          : '<span class="badge badge-warning">Pending</span>';

        return `<tr>
          <td>${u.name}</td>
          <td>${u.referralCode}</td>
          <td>${formatDate(u.createdAt)}</td>
          <td>${u.activatedAt ? formatDate(u.activatedAt) : "--"}</td>
          <td>${formatCurrency(commission)}</td>
          <td>${statusBadge}</td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="6">কোনো Referral History নেই। "Load My Team" বাটনে ক্লিক করুন।</td></tr>`;
}

loadReferralTreeBtn.addEventListener("click", loadReferralTree);
referralTreeSearchInput.addEventListener("input", renderReferralTree);
referralTreeLevelFilter.addEventListener("change", renderReferralTree);

treeViewListBtn.addEventListener("click", () => {
  currentTreeView = "list";
  treeViewListBtn.classList.add("tree-view-active");
  treeViewTreeBtn.classList.remove("tree-view-active");
  renderReferralTree();
});

treeViewTreeBtn.addEventListener("click", () => {
  currentTreeView = "tree";
  treeViewTreeBtn.classList.add("tree-view-active");
  treeViewListBtn.classList.remove("tree-view-active");
  renderReferralTree();
});

function formatDateOnly(timestamp) {
  if (!timestamp || !timestamp.toDate) return "--";
  return timestamp.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function renderContestCard(contests) {
  const activeContest = contests.find((c) => !c.isEnded);

  if (!activeContest) {
    contestActiveCard.classList.add("hidden");
    contestNoneCard.classList.remove("hidden");
    return;
  }

  contestActiveCard.classList.remove("hidden");
  contestNoneCard.classList.add("hidden");

  const now = Date.now();
  const start = activeContest.startDate && activeContest.startDate.toMillis ? activeContest.startDate.toMillis() : now;
  const end = activeContest.endDate && activeContest.endDate.toMillis ? activeContest.endDate.toMillis() : now;

  let percent = 0;
  let statusText = "Upcoming";
  let statusClass = "badge-warning";

  if (now < start) {
    percent = 0;
    statusText = "Upcoming";
    statusClass = "badge-warning";
  } else if (now > end) {
    percent = 100;
    statusText = "Ending Soon";
    statusClass = "badge-danger";
  } else {
    percent = Math.round(((now - start) / (end - start)) * 100);
    statusText = "Active";
    statusClass = "badge-success";
  }

  contestTitleEl.textContent = activeContest.title;
  contestDescriptionEl.textContent = activeContest.description || "";
  contestStartDateEl.textContent = formatDateOnly(activeContest.startDate);
  contestEndDateEl.textContent = formatDateOnly(activeContest.endDate);
  contestProgressBarEl.style.width = percent + "%";
  contestProgressBarEl.textContent = percent + "%";
  contestStatusBadgeEl.textContent = statusText;
  contestStatusBadgeEl.className = "badge " + statusClass;

  contestPrizeListEl.innerHTML = (activeContest.prizes || []).map((p) =>
    `<span class="contest-prize-item">🏆 Rank ${p.rank}: ৳${p.amount}</span>`
  ).join("");
}

function renderContestHistory(contests) {
  const ended = contests.filter((c) => c.isEnded);

  contestHistoryContainerEl.innerHTML = ended.length
    ? ended.map((c) => `
      <div class="contest-history-item">
        <h4>${c.title} <span class="text-muted">(${formatDateOnly(c.startDate)} - ${formatDateOnly(c.endDate)})</span></h4>
        ${(c.winners || []).length
          ? c.winners.map((w) => `<div class="contest-winner-row"><span>🏅 Rank ${w.rank} — ${w.name}</span><span>${w.count} Referrals • ৳${w.prize}</span></div>`).join("")
          : `<p class="text-muted">কোনো Winner নির্ধারিত হয়নি।</p>`
        }
      </div>`).join("")
    : `<p class="text-muted">এখনো কোনো Contest শেষ হয়নি।</p>`;
}

function attachContestListener() {
  const q = query(collection(db, CONTESTS), orderBy("startDate", "desc"), limit(10));
  const unsub = onSnapshot(q, (snap) => {
    const contests = [];
    snap.forEach((d) => contests.push({ id: d.id, ...d.data() }));
    renderContestCard(contests);
    renderContestHistory(contests);
  });
  subscriptions.push(unsub);
}

function attachContestLeaderboardListener(uid) {
  const q = query(collection(db, USERS), orderBy("contestReferralCount", "desc"), limit(10));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    contestLeaderboardTableEl.innerHTML = docs.length
      ? docs.map((u, i) => `
        <tr${u.uid === uid ? ' style="background:rgba(37,99,235,.15)"' : ""}>
          <td>#${i + 1}</td>
          <td>${u.name}</td>
          <td>${u.contestReferralCount || 0}</td>
        </tr>`).join("")
      : `<tr><td colspan="3">No Data</td></tr>`;

    const myIndex = docs.findIndex((u) => u.uid === uid);
    contestMyRankEl.textContent = myIndex >= 0
      ? `#${myIndex + 1} (${docs[myIndex].contestReferralCount || 0} Referrals)`
      : "Top 10-এ নেই";
  });
  subscriptions.push(unsub);
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
  attachContestListener();
  attachContestLeaderboardListener(uid);
}

function detachAllListeners() {
  subscriptions.forEach((unsub) => { if (typeof unsub === "function") unsub(); });
  subscriptions = [];
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await ensureUserDocument(user);
    attachAllListeners(user.uid);

    loginPanel.classList.remove("hidden");
    signupPanel.classList.add("hidden");
    authCard.hidden = true;
    logoutBtn.hidden = false;
    appEl.hidden = false;
  } else {
    currentUser = null;
    currentUserData = null;
    detachAllListeners();

    authCard.hidden = false;
    logoutBtn.hidden = true;
    appEl.hidden = true;
    sessionStatusEl.classList.add("hidden");
  }

  showGlobalLoading(false);
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
      await navigator.share({ title: "Refer Earn & Microjob", text: "Join Refer Earn & Microjob using my referral link!", url: link });
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

  if (!senderNumber || !transactionId) {
    showWarning("সব ফিল্ড পূরণ করুন।");
    return;
  }
  if (!BD_PHONE_REGEX.test(senderNumber)) {
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

  const accountNumber = withdrawNumberEl.value.trim();
  const method = withdrawMethodEl.value;

  const balance = currentUserData.walletBalance || 0;
  const availableReferral = currentUserData.withdrawableReferralCount || 0;

  if (balance < WITHDRAW_AMOUNT) {
    showWarning(`Withdraw করার জন্য Wallet Balance কমপক্ষে ৳${WITHDRAW_AMOUNT} হতে হবে।`);
    return;
  }
  if (availableReferral < REQUIRED_NEW_REFERRAL) {
    showWarning(`Withdraw করতে ${REQUIRED_NEW_REFERRAL}টি NEW Active Referral প্রয়োজন, আপনার আছে ${availableReferral}টি।`);
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
  if (!BD_PHONE_REGEX.test(accountNumber)) {
    showWarning("সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।");
    return;
  }

  const confirmed = await showConfirm(
    "Withdraw নিশ্চিত করুন",
    `${method} নাম্বার ${accountNumber}-এ ৳${WITHDRAW_AMOUNT} Withdraw করতে চান? Approval Time: সকাল ৬টা থেকে রাত ১২টা। Payment সম্পন্ন হতে ১-১৫ মিনিট সময় লাগতে পারে।`
  );
  if (!confirmed) return;

  withdrawBtn.disabled = true;

  try {
    showActionLoading(true);

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS, currentUser.uid);
      const userSnap = await transaction.get(userRef);
      const freshData = userSnap.data();
      const freshBalance = freshData.walletBalance || 0;
      const freshAvailable = freshData.withdrawableReferralCount || 0;

      if (freshBalance < WITHDRAW_AMOUNT) {
        throw new Error("Insufficient wallet balance.");
      }
      if (freshAvailable < REQUIRED_NEW_REFERRAL) {
        throw new Error("NEW Active Referral requirement not met.");
      }

      transaction.update(userRef, {
        walletBalance: increment(-WITHDRAW_AMOUNT),
        withdrawableReferralCount: increment(-REQUIRED_NEW_REFERRAL)
      });

      const withdrawRef = doc(collection(db, WITHDRAWS));
      transaction.set(withdrawRef, {
        uid: currentUser.uid,
        name: currentUserData.name,
        email: currentUserData.email,
        amount: WITHDRAW_AMOUNT,
        method,
        accountNumber,
        walletBalanceAtRequest: freshBalance,
        referralConsumed: REQUIRED_NEW_REFERRAL,
        status: "pending",
        requestedAt: serverTimestamp(),
        processedAt: null,
        adminNote: ""
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid: currentUser.uid,
        type: "withdraw",
        amount: -WITHDRAW_AMOUNT,
        description: `Withdraw request via ${method}`,
        status: "pending",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid: currentUser.uid,
        title: "Withdraw Request Submitted",
        message: `আপনার ৳${WITHDRAW_AMOUNT} Withdraw Request জমা হয়েছে। Status: ⏳ Pending। Admin যাচাই করে Approve করবেন।`,
        type: "info",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    withdrawNumberEl.value = "";
    showSuccess("আপনার Withdraw Request সফলভাবে জমা হয়েছে। বর্তমান Status: ⏳ Pending।");
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

document.querySelectorAll(".password-toggle-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "🙈";
    } else {
      input.type = "password";
      btn.textContent = "👁";
    }
  });
});

quickNavBtn.addEventListener("click", () => {
  quickNavReferralLink.value = referralLinkEl.value;
  quickNavOverlay.classList.remove("hidden");
});

closeQuickNav.addEventListener("click", () => quickNavOverlay.classList.add("hidden"));

quickNavOverlay.addEventListener("click", (e) => {
  if (e.target === quickNavOverlay) quickNavOverlay.classList.add("hidden");
});

quickNavCopyBtn.addEventListener("click", async () => {
  await copyText(quickNavReferralLink.value);
  showToast("Copied", "Referral link copied to clipboard.", "success");
});

document.querySelectorAll(".quick-nav-link").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.getElementById(link.dataset.target);
    quickNavOverlay.classList.add("hidden");
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth" }), 200);
  });
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
