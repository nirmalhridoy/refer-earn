import {
  auth, db, provider,
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updatePassword, reauthenticateWithCredential, EmailAuthProvider,
  doc, setDoc, getDoc, updateDoc,
  collection, addDoc, getDocs,
  query, where, orderBy, limit,
  serverTimestamp, increment, onSnapshot, runTransaction,
  Timestamp,
  USERS, WITHDRAWS, ACTIVATIONS, TRANSACTIONS, BROADCAST, NOTIFICATIONS,
  TASKS, TASK_SUBMISSIONS, CONTESTS,
  RANK_LEVELS, LEVEL_COMMISSIONS, PHONE_AUTH_DOMAIN,
  TASK_PLATFORMS, WITHDRAW_REQUIRED_APPROVED_TASKS
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
const approvedTaskStatEl = $("approvedTaskStat");
const pendingRequestsEl = $("pendingRequests");

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
const changePasswordBtn = $("changePasswordBtn");

const changePasswordModal = $("changePasswordModal");
const closeChangePasswordModal = $("closeChangePasswordModal");
const currentPasswordInput = $("currentPasswordInput");
const newPasswordInput = $("newPasswordInput");
const confirmPasswordInput = $("confirmPasswordInput");
const submitChangePasswordBtn = $("submitChangePasswordBtn");

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
const withdrawApprovedTasksEl = $("withdrawApprovedTasks");
const withdrawFormCard = $("withdrawFormCard");

const withdrawTimelineCard = $("withdrawTimelineCard");
const timelineStatusText = $("timelineStatusText");

const totalWithdrawnAmountEl = $("totalWithdrawnAmount");
const totalPendingAmountEl = $("totalPendingAmount");

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

const taskCategoryGrid = $("taskCategoryGrid");
const taskListArea = $("taskListArea");
const taskListContainer = $("taskListContainer");
const activeTaskCategoryTitle = $("activeTaskCategoryTitle");
const taskCategoryCounter = $("taskCategoryCounter");
const taskHistoryContainer = $("taskHistoryContainer");

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

const mobileBottomNav = $("mobileBottomNav");

const notifFilterBtns = document.querySelectorAll(".notif-filter-btn");

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

let allActiveTasks = [];
let mySubmissions = {};
let activeCategory = "facebook";
let taskSearchText = "";
let taskRewardSort = "none";

let notifPersonal = [];
let notifBroadcastAll = [];
let currentNotifFilter = "all";

let referralTreeData = [];
let currentTreeView = "list";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

/* ==============================================
   PREMIUM UI: Injected Styles (Skeleton + Micro-interactions)
============================================== */

(function injectPremiumStyles() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes premiumShimmer {
      0% { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .skeleton-line {
      height: 14px;
      border-radius: 6px;
      margin-bottom: 10px;
      background: linear-gradient(90deg, rgba(255,255,255,.04) 25%, rgba(255,255,255,.09) 37%, rgba(255,255,255,.04) 63%);
      background-size: 800px 100%;
      animation: premiumShimmer 1.4s ease-in-out infinite;
    }
    .skeleton-line:last-child { margin-bottom: 0; }
    .skeleton-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px;
      margin-bottom: 12px;
    }
    .premium-welcome-banner {
      background: linear-gradient(135deg, rgba(37,99,235,.18), rgba(56,189,248,.10));
      border: 1px solid rgba(56,189,248,.3);
      border-radius: var(--radius);
      padding: 18px 22px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
    }
    .premium-welcome-banner h3 {
      font-size: 17px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .premium-welcome-banner p {
      font-size: 12.5px;
      color: var(--text-light);
    }
    .premium-welcome-emoji { font-size: 28px; }
    .task-filter-bar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }
    .task-filter-bar input,
    .task-filter-bar select {
      height: 46px;
      padding: 0 14px;
      background: var(--bg2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text);
      font-size: 13px;
    }
    .task-filter-bar input { flex: 2; min-width: 160px; }
    .task-filter-bar select { flex: 1; min-width: 140px; }
    .wallet-group-title {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .5px;
      margin: 18px 0 10px;
    }
    .wallet-group-title:first-child { margin-top: 0; }
    .rank-remaining-text {
      margin-top: 10px;
      font-size: 13px;
      color: var(--secondary);
      font-weight: 600;
    }
    .btn { transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; }
    .btn:active:not(:disabled) { transform: scale(.96); }
    .card { transition: transform .2s ease, box-shadow .2s ease; }
    .stat-card:hover, .task-card:hover { transform: translateY(-3px); }
    .toast { animation: toastSlideIn .3s ease; }
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .notif-filter-btn { transition: var(--transition); }
  `;
  document.head.appendChild(style);
})();

function skeletonBlock(lines) {
  let html = `<div class="skeleton-card">`;
  for (let i = 0; i < lines; i++) {
    const width = i === 0 ? "60%" : i % 2 === 0 ? "85%" : "100%";
    html += `<div class="skeleton-line" style="width:${width}"></div>`;
  }
  html += `</div>`;
  return html;
}

function skeletonRows(count) {
  let html = "";
  for (let i = 0; i < count; i++) html += skeletonBlock(3);
  return html;
}

function skeletonTableRows(cols, rows) {
  let html = "";
  for (let r = 0; r < rows; r++) {
    html += `<tr>` + Array.from({ length: cols }).map(() => `<td><div class="skeleton-line" style="width:70%"></div></td>`).join("") + `</tr>`;
  }
  return html;
}

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

/* ==============================================
   PREMIUM WELCOME HEADER
============================================== */

function renderWelcomeHeader(data) {
  const hour = new Date().getHours();
  let greeting = "Good Evening";
  let emoji = "🌙";
  if (hour < 12) { greeting = "Good Morning"; emoji = "☀️"; }
  else if (hour < 17) { greeting = "Good Afternoon"; emoji = "🌤️"; }

  const dashboardContainer = document.querySelector("#dashboard .container");
  let banner = $("premiumWelcomeHeader");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "premiumWelcomeHeader";
    banner.className = "premium-welcome-banner";
    const title = dashboardContainer.querySelector(".section-title");
    title.insertAdjacentElement("afterend", banner);
  }

  const rankInfo = getRankInfo(Number(activeReferralsEl.textContent) || 0);
  const goalText = rankInfo.isMax
    ? "🏆 আপনি সর্বোচ্চ Rank-এ পৌঁছে গেছেন!"
    : `🎯 আরও ${rankInfo.next.minReferrals - (Number(activeReferralsEl.textContent) || 0)}টি Active Referral লাগবে ${rankInfo.next.name} Rank-এ যেতে`;

  banner.innerHTML = `
    <div>
      <h3>${emoji} ${greeting}, ${data.name || "User"}!</h3>
      <p>${goalText}</p>
    </div>
    <div class="premium-welcome-emoji">👋</div>
  `;
}

/* ===== TASK CATEGORY GRID ===== */

function renderTaskCategoryGrid() {
  taskCategoryGrid.innerHTML = TASK_PLATFORMS.map((p) => {
    const count = allActiveTasks.filter((t) => t.platform === p.key && (!mySubmissions[t.id] || mySubmissions[t.id].status === "rejected")).length;
    return `<div class="task-category-card ${p.key === activeCategory ? "category-active" : ""}" style="background:${p.color}" data-key="${p.key}">
      ${count > 0 ? `<span class="task-category-count">${count}</span>` : ""}
      <div class="task-category-icon">${p.icon}</div>
      <div class="task-category-label">${p.label}</div>
    </div>`;
  }).join("");

  taskCategoryGrid.querySelectorAll(".task-category-card").forEach((card) => {
    card.addEventListener("click", () => {
      activeCategory = card.dataset.key;
      renderTaskCategoryGrid();
      renderActiveTaskList();
    });
  });
}

function ensureTaskFilterBar() {
  if ($("taskFilterBar")) return;
  const bar = document.createElement("div");
  bar.id = "taskFilterBar";
  bar.className = "task-filter-bar";
  bar.innerHTML = `
    <input type="text" id="taskSearchInput" placeholder="🔍 Task নাম দিয়ে খুঁজুন...">
    <select id="taskRewardSortSelect">
      <option value="none">Sort By Reward</option>
      <option value="high">💎 High to Low</option>
      <option value="low">Low to High</option>
    </select>
  `;
  const header = taskListArea.querySelector(".task-list-area-header");
  header.insertAdjacentElement("afterend", bar);

  $("taskSearchInput").addEventListener("input", (e) => {
    taskSearchText = e.target.value.trim().toLowerCase();
    renderActiveTaskList();
  });
  $("taskRewardSortSelect").addEventListener("change", (e) => {
    taskRewardSort = e.target.value;
    renderActiveTaskList();
  });
}

function renderActiveTaskList() {
  ensureTaskFilterBar();

  const platformInfo = TASK_PLATFORMS.find((p) => p.key === activeCategory);
  activeTaskCategoryTitle.textContent = `${platformInfo.icon} ${platformInfo.label} Tasks`;

  let list = allActiveTasks.filter((t) => t.platform === activeCategory);

  if (taskSearchText) {
    list = list.filter((t) => (t.taskName || "").toLowerCase().includes(taskSearchText));
  }

  if (taskRewardSort === "high") {
    list = [...list].sort((a, b) => (b.reward || 0) - (a.reward || 0));
  } else if (taskRewardSort === "low") {
    list = [...list].sort((a, b) => (a.reward || 0) - (b.reward || 0));
  }

  let unreadCount = 0;
  const fullCategoryList = allActiveTasks.filter((t) => t.platform === activeCategory);
  fullCategoryList.forEach((t) => {
    const sub = mySubmissions[t.id];
    if (!sub || sub.status === "rejected") unreadCount++;
  });

  taskListContainer.innerHTML = list.length
    ? list.map((t) => {
        const sub = mySubmissions[t.id];
        const canSubmit = !sub || sub.status === "rejected";

        return `<div class="task-card">
          <div class="task-card-top">
            <span class="task-platform-icon">${platformInfo.icon}</span>
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
            ${canSubmit ? `<button type="button" class="btn btn-primary btn-xs task-submit-open-btn" data-task-id="${t.id}">Submit</button>` : ""}
          </div>
        </div>`;
      }).join("")
    : `<div class="card">📋 No Available Tasks<br><span style="font-size:12px;color:var(--text-muted)">${taskSearchText ? "Search অনুযায়ী কোনো Task পাওয়া যায়নি।" : "New tasks will appear when available."}</span></div>`;

  taskCategoryCounter.textContent = unreadCount;

  taskListContainer.querySelectorAll(".task-submit-open-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const task = allActiveTasks.find((t) => t.id === btn.dataset.taskId);
      if (task) openTaskSubmitModal(task);
    });
  });
}

function taskStatusBadge(sub) {
  if (!sub) return `<span class="badge badge-warning">Incomplete</span>`;
  if (sub.status === "pending") return `<span class="badge badge-info">Under Review</span>`;
  if (sub.status === "completed") return `<span class="badge badge-success">Completed</span>`;
  return `<span class="badge badge-danger">Rejected</span>`;
}

function renderTaskHistory() {
  const completed = Object.values(mySubmissions).filter((s) => s.status === "completed");

  taskHistoryContainer.innerHTML = TASK_PLATFORMS.map((p) => {
    const items = completed.filter((s) => s.platform === p.key);
    return `<div class="card task-history-toggle" data-key="${p.key}">
        <span>${p.icon} ${p.label} — <b>${items.length}</b> Approved</span>
        <span class="toggle-arrow" id="arrow-${p.key}">▸</span>
      </div>
      <div class="task-history-list hidden" id="list-${p.key}">
        ${items.length
          ? items.map((s) => `<div class="task-history-item">
              <strong>${s.taskName}</strong>
              Reward: ${formatCurrency(s.reward)} • Submitted: ${formatDate(s.submittedAt)} • Approved: ${formatDate(s.reviewedAt)}
            </div>`).join("")
          : `<div class="task-history-item">এখনো কোনো ${p.label} Task Approved হয়নি।</div>`}
      </div>`;
  }).join("");

  TASK_PLATFORMS.forEach((p) => {
    const toggle = document.querySelector(`.task-history-toggle[data-key="${p.key}"]`);
    const list = $(`list-${p.key}`);
    const arrow = $(`arrow-${p.key}`);
    if (toggle) {
      toggle.addEventListener("click", () => {
        list.classList.toggle("hidden");
        arrow.classList.toggle("arrow-open");
      });
    }
  });
}

function openTaskSubmitModal(task) {
  const platformInfo = TASK_PLATFORMS.find((p) => p.key === task.platform);
  taskSubmitTitleEl.textContent = task.taskName;
  taskSubmitInstructionEl.textContent = task.instruction || "";
  taskSubmitTaskIdEl.value = task.id;
  taskSubmitPlatformEl.value = task.platform;
  taskProfileLinkLabelEl.textContent = `${platformInfo.label} Profile Link / User ID`;
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
  const task = allActiveTasks.find((t) => t.id === taskId);

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
  taskListContainer.innerHTML = skeletonRows(3);

  const tasksUnsub = onSnapshot(
    query(collection(db, TASKS), where("isActive", "==", true)),
    (snap) => {
      allActiveTasks = [];
      snap.forEach((d) => allActiveTasks.push({ id: d.id, ...d.data() }));
      renderTaskCategoryGrid();
      renderActiveTaskList();
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(tasksUnsub);

  const submissionsUnsub = onSnapshot(
    query(collection(db, TASK_SUBMISSIONS), where("uid", "==", uid)),
    (snap) => {
      mySubmissions = {};
      snap.forEach((d) => { mySubmissions[d.data().taskId] = d.data(); });
      renderTaskCategoryGrid();
      renderActiveTaskList();
      renderTaskHistory();
      if (currentUserData) updateWithdrawUI();
    }
  );
  subscriptions.push(submissionsUnsub);
}

/* ===== AUTH ===== */

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
  if (code.includes("wrong-password") || code.includes("invalid-credential")) return "Phone Number/Password ভুল হয়েছে।";
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
      approvedTaskCount: 0,
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
  return allActiveTasks.filter((t) => t.required);
}

function getIncompleteRequiredTasks() {
  return getRequiredTaskList().filter((t) => {
    const sub = mySubmissions[t.id];
    return !sub || sub.status !== "completed";
  });
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

  changePasswordBtn.classList.toggle("hidden", data.authProvider !== "phone");

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

  approvedTaskStatEl.textContent = data.approvedTaskCount || 0;

  renderWelcomeHeader(data);
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

  let remainingEl = $("rankRemainingText");
  if (!remainingEl) {
    remainingEl = document.createElement("p");
    remainingEl.id = "rankRemainingText";
    remainingEl.className = "rank-remaining-text";
    document.querySelector("#rankSection .card").appendChild(remainingEl);
  }
  if (isMax) {
    remainingEl.textContent = "🏆 আপনি সর্বোচ্চ Rank Legend-এ পৌঁছে গেছেন!";
  } else {
    const remaining = next.minReferrals - referralCount;
    remainingEl.textContent = `🎯 আরও ${remaining}টি Active Referral লাগবে ${next.name} Rank-এ যেতে (Bonus: ৳${next.bonus})`;
  }

  if (currentUserData) renderWelcomeHeader(currentUserData);
}

function updateWithdrawUI() {
  if (!currentUserData) return;

  const balance = currentUserData.walletBalance || 0;
  const availableReferral = currentUserData.withdrawableReferralCount || 0;
  const approvedTasks = currentUserData.approvedTaskCount || 0;

  withdrawWalletBalanceEl.textContent = formatCurrency(balance);
  withdrawApprovedTasksEl.textContent = `${approvedTasks} / ${WITHDRAW_REQUIRED_APPROVED_TASKS}`;

  const balancePercent = Math.min(100, Math.round((balance / WITHDRAW_AMOUNT) * 100));
  const balanceMet = balance >= WITHDRAW_AMOUNT;
  $("eligBalanceBar").style.width = balancePercent + "%";
  $("eligBalanceBar").textContent = balancePercent + "%";
  $("eligBalanceText").textContent = `${formatCurrency(Math.min(balance, WITHDRAW_AMOUNT))}/৳${WITHDRAW_AMOUNT} ${balanceMet ? "✓" : ""}`;

  const tasksPercent = Math.min(100, Math.round((approvedTasks / WITHDRAW_REQUIRED_APPROVED_TASKS) * 100));
  const tasksMet = approvedTasks >= WITHDRAW_REQUIRED_APPROVED_TASKS;
  $("eligTasksBar").style.width = tasksPercent + "%";
  $("eligTasksBar").textContent = tasksPercent + "%";
  $("eligTasksText").textContent = `${Math.min(approvedTasks, WITHDRAW_REQUIRED_APPROVED_TASKS)}/${WITHDRAW_REQUIRED_APPROVED_TASKS} ${tasksMet ? "✓" : ""}`;

  const condition12Met = balanceMet && tasksMet;
  const eligReferralItem = $("eligReferralItem");
  eligReferralItem.style.visibility = condition12Met ? "visible" : "hidden";

  const referralPercent = Math.min(100, Math.round((availableReferral / REQUIRED_NEW_REFERRAL) * 100));
  const referralMet = availableReferral >= REQUIRED_NEW_REFERRAL;
  $("eligReferralBar").style.width = referralPercent + "%";
  $("eligReferralBar").textContent = referralPercent + "%";
  $("eligReferralText").textContent = `${Math.min(availableReferral, REQUIRED_NEW_REFERRAL)}/${REQUIRED_NEW_REFERRAL} ${referralMet ? "✓" : ""}`;

  const fullyEligible = condition12Met && referralMet;
  const finalStatusEl = $("eligibilityFinalStatus");

  if (fullyEligible) {
    finalStatusEl.className = "eligibility-final-status status-eligible";
    finalStatusEl.textContent = "🎉 You're Eligible to Withdraw";
  } else {
    const missing = [];
    if (!balanceMet) missing.push("Wallet Balance");
    if (!tasksMet) missing.push("Tasks Completed");
    if (condition12Met && !referralMet) missing.push("New Active Referrals");
    finalStatusEl.className = "eligibility-final-status status-not-eligible";
    finalStatusEl.textContent = `🔒 Not Eligible Yet — বাকি: ${missing.join(", ")}`;
  }

  withdrawFormCard.classList.toggle("hidden", !fullyEligible);
}

function renderWithdrawTimeline(status) {
  if (!status) {
    withdrawTimelineCard.classList.add("hidden");
    return;
  }
  withdrawTimelineCard.classList.remove("hidden");

  const steps = [1, 2, 3, 4];
  let activeSteps = 1;
  let statusText = "আপনার Request Submit হয়েছে।";

  if (status === "pending") {
    activeSteps = 2;
    statusText = "⏳ আপনার Withdraw Request Admin যাচাই করছে।";
  } else if (status === "approved") {
    activeSteps = 4;
    statusText = "✅ আপনার Withdraw সফলভাবে সম্পন্ন হয়েছে।";
  } else if (status === "rejected") {
    activeSteps = 1;
    statusText = "❌ আপনার Withdraw Request Reject হয়েছে। Amount ফেরত দেওয়া হয়েছে।";
  }

  steps.forEach((s) => {
    const stepEl = $(`timelineStep${s}`);
    if (stepEl) stepEl.classList.toggle("timeline-active", s <= activeSteps);
    if (s < 4) {
      const lineEl = $(`timelineLine${s}`);
      if (lineEl) lineEl.classList.toggle("timeline-active", s < activeSteps);
    }
  });

  timelineStatusText.textContent = statusText;
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

function getDateBucket(timestamp) {
  if (!timestamp || !timestamp.toDate) return "Earlier";
  const date = timestamp.toDate();
  const now = new Date();
  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (date.toDateString() === todayStr) return "Today";
  if (date.toDateString() === yesterdayStr) return "Yesterday";
  return "Earlier";
}

function renderWalletTimeline(docs) {
  if (!docs.length) {
    walletHistoryEl.innerHTML = `<div class="card">👛 No Wallet Activity Yet<br><span style="font-size:12px;color:var(--text-muted)">আপনার Wallet Transaction এখানে দেখা যাবে।</span></div>`;
    return;
  }

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  docs.slice(0, 20).forEach((t) => {
    groups[getDateBucket(t.createdAt)].push(t);
  });

  let html = "";
  ["Today", "Yesterday", "Earlier"].forEach((label) => {
    if (groups[label].length === 0) return;
    html += `<div class="wallet-group-title">${label}</div>`;
    html += groups[label].map((t) => `
      <div class="card">
        <strong>${t.type.replace(/_/g, " ")}</strong>
        <p>${t.description || ""}</p>
        <p>${Number(t.amount) >= 0 ? "+" : ""}${formatCurrency(t.amount)} • ${formatDate(t.createdAt)}</p>
      </div>`).join("");
  });

  walletHistoryEl.innerHTML = html;
}

function attachTransactionsListener(uid) {
  transactionHistoryEl.innerHTML = skeletonTableRows(4, 4);
  walletHistoryEl.innerHTML = skeletonRows(2);
  activityListEl.innerHTML = skeletonRows(2);

  const q = query(collection(db, TRANSACTIONS), where("uid", "==", uid), orderBy("createdAt", "desc"), limit(50));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    const todayStr = getTodayDateStr();
    let todaySum = 0;
    docs.forEach((t) => {
      if (t.createdAt && t.createdAt.toDate) {
        const tDateStr = t.createdAt.toDate().toISOString().slice(0, 10);
        if (tDateStr === todayStr && Number(t.amount) > 0) {
          todaySum += Number(t.amount);
        }
      }
    });
    todayIncomeEl.textContent = formatCurrency(todaySum);

    transactionHistoryEl.innerHTML = docs.length
      ? docs.map(transactionRow).join("")
      : `<tr><td colspan="4">🧾 No Transactions Yet</td></tr>`;

    renderWalletTimeline(docs);

    activityListEl.innerHTML = docs.length
      ? docs.slice(0, 5).map((t) => `
        <div class="card">
          <strong>${t.type.replace(/_/g, " ")}</strong> — ${Number(t.amount) >= 0 ? "+" : ""}${formatCurrency(t.amount)}
          <p>${formatDate(t.createdAt)}</p>
        </div>`).join("")
      : `<div class="card">📭 No Activity Found</div>`;
  });
  subscriptions.push(unsub);
}

function attachWithdrawListener(uid) {
  withdrawHistoryEl.innerHTML = skeletonTableRows(4, 3);

  const q = query(collection(db, WITHDRAWS), where("uid", "==", uid), orderBy("requestedAt", "desc"), limit(50));
  const unsub = onSnapshot(q, (snap) => {
    const docs = [];
    snap.forEach((d) => docs.push(d.data()));

    pendingWithdrawCount = docs.filter((w) => w.status === "pending").length;
    updatePendingRequests();

    let totalWithdrawn = 0;
    let totalPending = 0;
    docs.forEach((w) => {
      if (w.status === "approved") totalWithdrawn += Number(w.amount) || 0;
      if (w.status === "pending") totalPending += Number(w.amount) || 0;
    });
    totalWithdrawnAmountEl.textContent = formatCurrency(totalWithdrawn);
    totalPendingAmountEl.textContent = formatCurrency(totalPending);

    withdrawHistoryEl.innerHTML = docs.length
      ? docs.map((w) => {
          const label = withdrawStatusLabel(w.status);
          return `<tr>
            <td>${formatDate(w.requestedAt)}</td>
            <td>${formatCurrency(w.amount)}</td>
            <td>${w.method}</td>
            <td><span class="badge ${label.cls}">${label.text}</span></td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="4">💸 No Withdrawal History Yet<br><span style="font-size:11px">Your withdrawal history will appear here.</span></td></tr>`;

    renderWithdrawTimeline(docs.length > 0 ? docs[0].status : null);
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
  leaderboardTableEl.innerHTML = skeletonTableRows(3, 5);

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
      : `<tr><td colspan="3">🏆 No Leaderboard Data Yet</td></tr>`;
  });
  subscriptions.push(unsub);
}

/* ===== NOTIFICATIONS ===== */

function notificationCategory(n) {
  const title = (n.title || "").toLowerCase();
  if (title.includes("withdraw")) return "withdrawals";
  if (title.includes("rank")) return "rank";
  if (title.includes("task")) return "tasks";
  if (title.includes("bonus") || title.includes("commission") || title.includes("income") || title.includes("reward") || title.includes("welcome")) return "earnings";
  return "system";
}

function categoryIcon(cat) {
  const icons = { earnings: "💰", tasks: "📋", withdrawals: "💸", rank: "🏆", system: "🔔" };
  return icons[cat] || "🔔";
}

function updateUnreadFilterLabel() {
  const all = [...notifPersonal, ...notifBroadcastAll];
  const unreadCount = all.filter((n) => !n.isRead).length;
  const btn = document.querySelector('.notif-filter-btn[data-filter="unread"]');
  if (btn) btn.textContent = unreadCount > 0 ? `Unread (${unreadCount})` : "Unread";
}

function mergeAndRenderNotifications() {
  const all = [...notifPersonal, ...notifBroadcastAll].sort((a, b) => {
    const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });

  updateUnreadFilterLabel();

  let filtered = all;
  if (currentNotifFilter === "unread") {
    filtered = all.filter((n) => !n.isRead);
  } else if (currentNotifFilter !== "all") {
    filtered = all.filter((n) => notificationCategory(n) === currentNotifFilter);
  }

  notificationListEl.innerHTML = filtered.length
    ? filtered.map((n) => {
        const cat = notificationCategory(n);
        return `<div class="card">
        <strong>${categoryIcon(cat)} ${n.title}</strong>
        <p>${n.message}</p>
        <p>${formatDate(n.createdAt)}</p>
      </div>`;
      }).join("")
    : `<div class="card">🔔 You're All Caught Up</div>`;
}

notifFilterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    notifFilterBtns.forEach((b) => b.classList.remove("notif-filter-active"));
    btn.classList.add("notif-filter-active");
    currentNotifFilter = btn.dataset.filter;
    mergeAndRenderNotifications();
  });
});

function attachNotificationsListener(uid) {
  notificationListEl.innerHTML = skeletonRows(3);

  const personalUnsub = onSnapshot(
    query(collection(db, NOTIFICATIONS), where("uid", "==", uid), limit(50)),
    (snap) => {
      notifPersonal = [];
      snap.forEach((d) => notifPersonal.push(d.data()));
      mergeAndRenderNotifications();
    }
  );
  subscriptions.push(personalUnsub);

  const broadcastUnsub = onSnapshot(
    query(collection(db, NOTIFICATIONS), where("uid", "==", "all"), limit(50)),
    (snap) => {
      notifBroadcastAll = [];
      snap.forEach((d) => notifBroadcastAll.push(d.data()));
      mergeAndRenderNotifications();
    }
  );
  subscriptions.push(broadcastUnsub);
}

function attachBroadcastListener() {
  const q = query(collection(db, BROADCAST), orderBy("createdAt", "desc"), limit(1));
  const unsub = onSnapshot(q, (snap) => {
    if (snap.empty) {
      broadcastBoxEl.innerHTML = "📢 No broadcast available.";
      return;
    }
    const b = snap.docs[0].data();
    broadcastBoxEl.innerHTML = `<strong>${b.title}</strong><p>${b.message}</p>`;
  });
  subscriptions.push(unsub);
}

/* ===== REFERRAL TREE ===== */

async function loadReferralTree() {
  if (!currentUserData) return;

  loadReferralTreeBtn.disabled = true;
  loadReferralTreeBtn.textContent = "Loading...";
  referralTreeContainer.innerHTML = skeletonRows(3);

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
    referralTreeContainer.innerHTML = `<div class="card">🌱 No Active Referral Yet<br>Share your referral link to get started.</div>`;
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

/* ===== CONTEST ===== */

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
  contestLeaderboardTableEl.innerHTML = skeletonTableRows(3, 4);

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
      : `<tr><td colspan="3">🏆 No Contest Data Yet</td></tr>`;

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
    mobileBottomNav.classList.remove("hidden");
  } else {
    currentUser = null;
    currentUserData = null;
    detachAllListeners();

    authCard.hidden = false;
    logoutBtn.hidden = true;
    appEl.hidden = true;
    sessionStatusEl.classList.add("hidden");
    mobileBottomNav.classList.add("hidden");
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

changePasswordBtn.addEventListener("click", () => {
  currentPasswordInput.value = "";
  newPasswordInput.value = "";
  confirmPasswordInput.value = "";
  openModal(changePasswordModal);
});

closeChangePasswordModal.addEventListener("click", () => closeModalEl(changePasswordModal));

submitChangePasswordBtn.addEventListener("click", async () => {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!currentPassword) {
    showWarning("Current Password দিন।");
    return;
  }
  if (!newPassword || newPassword.length < 6) {
    showWarning("New Password কমপক্ষে ৬ অক্ষরের হতে হবে।");
    return;
  }
  if (newPassword !== confirmPassword) {
    showWarning("New Password এবং Confirm Password মিলছে না।");
    return;
  }

  submitChangePasswordBtn.disabled = true;

  try {
    showActionLoading(true);

    const credential = EmailAuthProvider.credential(
      phoneToPseudoEmail(currentUserData.phone),
      currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);

    closeModalEl(changePasswordModal);
    showSuccess("আপনার Password সফলভাবে পরিবর্তন হয়েছে।");
  } catch (err) {
    showError(friendlyAuthError(err));
  } finally {
    showActionLoading(false);
    submitChangePasswordBtn.disabled = false;
  }
});

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

  const updateData = { name, district };
  if (currentUserData.authProvider !== "phone") {
    updateData.phone = phone;
  }
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
  const approvedTasks = currentUserData.approvedTaskCount || 0;

  if (balance < WITHDRAW_AMOUNT) {
    showWarning(`Withdraw করার জন্য Wallet Balance কমপক্ষে ৳${WITHDRAW_AMOUNT} হতে হবে।`);
    return;
  }
  if (approvedTasks < WITHDRAW_REQUIRED_APPROVED_TASKS) {
    showWarning(`Withdraw করতে কমপক্ষে ${WITHDRAW_REQUIRED_APPROVED_TASKS}টি Approved Task প্রয়োজন, আপনার আছে ${approvedTasks}টি।`);
    return;
  }
  if (availableReferral < REQUIRED_NEW_REFERRAL) {
    showWarning(`Withdraw করতে ${REQUIRED_NEW_REFERRAL}টি New Active Referral প্রয়োজন, আপনার আছে ${availableReferral}টি।`);
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
      const freshApprovedTasks = freshData.approvedTaskCount || 0;

      if (freshBalance < WITHDRAW_AMOUNT) {
        throw new Error("Insufficient wallet balance.");
      }
      if (freshApprovedTasks < WITHDRAW_REQUIRED_APPROVED_TASKS) {
        throw new Error("Approved task requirement not met.");
      }
      if (freshAvailable < REQUIRED_NEW_REFERRAL) {
        throw new Error("Referral requirement not met.");
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
        approvedTaskCountAtRequest: freshApprovedTasks,
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

document.querySelectorAll(".bottom-nav-item").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".bottom-nav-item").forEach((i) => i.classList.remove("bottom-nav-active"));
    item.classList.add("bottom-nav-active");
    const target = document.getElementById(item.dataset.target);
    if (target) target.scrollIntoView({ behavior: "smooth" });
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
