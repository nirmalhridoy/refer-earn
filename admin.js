import {
  auth, db, provider,
  onAuthStateChanged, signInWithPopup, signOut,
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, addDoc, getDocs,
  query, where, orderBy, limit,
  serverTimestamp, increment, onSnapshot, runTransaction, writeBatch,
  USERS, WITHDRAWS, ACTIVATIONS, TRANSACTIONS, BROADCAST, NOTIFICATIONS,
  TASKS, TASK_SUBMISSIONS,
  ADMIN_EMAILS, RANK_LEVELS, LEVEL_COMMISSIONS, TASK_PLATFORMS
} from "./firebase.js";

const $ = (id) => document.getElementById(id);

const ACTIVATION_BONUS = 50;

const adminAuthSection = $("adminAuthSection");
const accessDeniedSection = $("accessDeniedSection");
const adminApp = $("adminApp");

const adminLoginBtn = $("adminLoginBtn");
const adminLogoutBtn = $("adminLogoutBtn");
const accessDeniedLogoutBtn = $("accessDeniedLogoutBtn");
const adminRefreshBtn = $("adminRefreshBtn");

const statTotalUsers = $("statTotalUsers");
const statActiveUsers = $("statActiveUsers");
const statInactiveUsers = $("statInactiveUsers");
const statFrozenUsers = $("statFrozenUsers");
const statPendingWithdraws = $("statPendingWithdraws");
const statPendingActivations = $("statPendingActivations");
const statPendingSubmissions = $("statPendingSubmissions");
const statTodayUsers = $("statTodayUsers");
const statTodayWithdraws = $("statTodayWithdraws");
const statTodayActivations = $("statTodayActivations");
const statTotalPayout = $("statTotalPayout");

const userSearchInput = $("userSearchInput");
const userStatusFilter = $("userStatusFilter");
const userListBody = $("userListBody");
const loadMoreUsersBtn = $("loadMoreUsersBtn");

const withdrawStatusFilter = $("withdrawStatusFilter");
const withdrawListBody = $("withdrawListBody");

const activationStatusFilter = $("activationStatusFilter");
const activationListBody = $("activationListBody");

const taskPlatformSelect = $("taskPlatformSelect");
const taskNameInput = $("taskNameInput");
const taskLinkInput = $("taskLinkInput");
const taskTypeInput = $("taskTypeInput");
const taskInstructionInput = $("taskInstructionInput");
const taskRewardInput = $("taskRewardInput");
const taskRequiredInput = $("taskRequiredInput");
const taskEditId = $("taskEditId");
const taskSaveBtn = $("taskSaveBtn");
const taskCancelEditBtn = $("taskCancelEditBtn");
const taskListBody = $("taskListBody");
const taskFilterPlatform = $("taskFilterPlatform");

const submissionPlatformFilter = $("submissionPlatformFilter");
const submissionStatusFilter = $("submissionStatusFilter");
const submissionListContainer = $("submissionListContainer");

const rejectReasonModal = $("rejectReasonModal");
const rejectSubmissionId = $("rejectSubmissionId");
const rejectReasonInput = $("rejectReasonInput");
const rejectReasonSubmitBtn = $("rejectReasonSubmitBtn");
const rejectReasonCancelBtn = $("rejectReasonCancelBtn");

const screenshotViewModal = $("screenshotViewModal");
const screenshotViewImage = $("screenshotViewImage");
const closeScreenshotView = $("closeScreenshotView");

const broadcastTitleInput = $("broadcastTitleInput");
const broadcastMessageInput = $("broadcastMessageInput");
const sendBroadcastBtn = $("sendBroadcastBtn");
const broadcastHistoryList = $("broadcastHistoryList");

const adminNotificationList = $("adminNotificationList");
const adminLeaderboardTable = $("adminLeaderboardTable");

const userDetailsModal = $("userDetailsModal");
const closeUserDetailsModal = $("closeUserDetailsModal");
const udModalName = $("udModalName");
const udModalEmail = $("udModalEmail");
const udModalPhone = $("udModalPhone");
const udModalDistrict = $("udModalDistrict");
const udModalUID = $("udModalUID");
const udModalReferralCode = $("udModalReferralCode");
const udModalStatus = $("udModalStatus");
const udModalWallet = $("udModalWallet");
const udModalReferrals = $("udModalReferrals");
const udModalApprovedTasks = $("udModalApprovedTasks");
const udModalJoined = $("udModalJoined");
const udAddBalanceBtn = $("udAddBalanceBtn");
const udFreezeBtn = $("udFreezeBtn");
const udActivateBtn = $("udActivateBtn");

const addBalanceModal = $("addBalanceModal");
const addBalanceUserName = $("addBalanceUserName");
const addBalanceUID = $("addBalanceUID");
const addBalanceAmount = $("addBalanceAmount");
const addBalanceReason = $("addBalanceReason");
const addBalanceSubmitBtn = $("addBalanceSubmitBtn");
const addBalanceCancelBtn = $("addBalanceCancelBtn");

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
const scrollTopBtn = $("scrollTopBtn");

let currentAdmin = null;
let liveListeners = [];
let userListLimitValue = 25;
let allLoadedUsers = [];
let selectedUser = null;
let allTasksById = {};

function openModal(el) { el.classList.remove("hidden"); }
function closeModalEl(el) { el.classList.add("hidden"); }
function showGlobalLoading(show) { globalLoadingEl.classList.toggle("hidden", !show); }
function showActionLoading(show) { loadingDialog.classList.toggle("hidden", !show); }

function showToast(title, message, type) {
  const colors = { success: "#22C55E", error: "#DC2626", warning: "#FACC15", info: "#38BDF8" };
  const icons = { success: "✅", error: "❌", warning: "⚠️", info: "🔔" };
  toastTitleEl.textContent = title;
  toastMessageEl.textContent = message;
  toastEl.style.borderLeftColor = colors[type] || colors.info;
  toastEl.querySelector(".toast-icon").textContent = icons[type] || icons.info;
  toastEl.classList.remove("hidden");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toastEl.classList.add("hidden"), 4000);
}
toastCloseBtn.addEventListener("click", () => toastEl.classList.add("hidden"));

function showSuccess(message) { successMessageEl.textContent = message; openModal(successDialog); }
function showError(message) { errorMessageEl.textContent = message; openModal(errorDialog); }
function showWarning(message) { warningMessageEl.textContent = message; openModal(warningDialog); }

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

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) return "--";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isToday(timestamp) {
  if (!timestamp || !timestamp.toDate) return false;
  const date = timestamp.toDate();
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function getRankForCount(activeCount) {
  let current = RANK_LEVELS[0];
  for (let i = 0; i < RANK_LEVELS.length; i++) {
    if (activeCount >= RANK_LEVELS[i].minReferrals) {
      current = RANK_LEVELS[i];
    }
  }
  return current;
}

function platformInfo(key) {
  return TASK_PLATFORMS.find((p) => p.key === key) || { icon: "📋", label: key };
}

function populatePlatformDropdowns() {
  taskPlatformSelect.innerHTML = TASK_PLATFORMS.map((p) => `<option value="${p.key}">${p.icon} ${p.label}</option>`).join("");
  taskFilterPlatform.innerHTML = `<option value="all">All Platforms</option>` +
    TASK_PLATFORMS.map((p) => `<option value="${p.key}">${p.icon} ${p.label}</option>`).join("");
  submissionPlatformFilter.innerHTML = `<option value="all">All</option>` +
    TASK_PLATFORMS.map((p) => `<option value="${p.key}">${p.icon} ${p.label}</option>`).join("");
}

populatePlatformDropdowns();

function detachAllListeners() {
  liveListeners.forEach((unsub) => { if (typeof unsub === "function") unsub(); });
  liveListeners = [];
}

adminLoginBtn.addEventListener("click", async () => {
  try {
    showGlobalLoading(true);
    await signInWithPopup(auth, provider);
  } catch (err) {
    showError(err.message);
  } finally {
    showGlobalLoading(false);
  }
});

async function handleLogout() {
  const confirmed = await showConfirm("Logout", "Are you sure you want to logout from Admin Panel?");
  if (confirmed) {
    detachAllListeners();
    await signOut(auth);
    showToast("Logged Out", "You have been logged out.", "info");
  }
}

adminLogoutBtn.addEventListener("click", handleLogout);
accessDeniedLogoutBtn.addEventListener("click", handleLogout);

adminRefreshBtn.addEventListener("click", () => window.location.reload());

onAuthStateChanged(auth, (user) => {
  showGlobalLoading(true);

  const isAdmin = user && ADMIN_EMAILS.map((e) => e.toLowerCase()).includes((user.email || "").toLowerCase());

  if (user && isAdmin) {
    currentAdmin = user;

    adminAuthSection.classList.add("hidden");
    accessDeniedSection.classList.add("hidden");
    adminApp.hidden = false;

    adminLoginBtn.hidden = true;
    adminLogoutBtn.hidden = false;

    attachAllAdminListeners();
  } else if (user && !isAdmin) {
    currentAdmin = null;
    detachAllListeners();

    adminAuthSection.classList.add("hidden");
    accessDeniedSection.classList.remove("hidden");
    adminApp.hidden = true;
  } else {
    currentAdmin = null;
    detachAllListeners();

    adminAuthSection.classList.remove("hidden");
    accessDeniedSection.classList.add("hidden");
    adminApp.hidden = true;

    adminLoginBtn.hidden = false;
    adminLogoutBtn.hidden = true;
  }

  showGlobalLoading(false);
});

function attachStatsListeners() {
  const usersUnsub = onSnapshot(collection(db, USERS), (snap) => {
    let active = 0, inactive = 0, frozen = 0, today = 0;

    snap.forEach((d) => {
      const u = d.data();
      if (u.isFrozen) frozen++;
      else if (u.isActive) active++;
      else inactive++;
      if (isToday(u.createdAt)) today++;
    });

    statTotalUsers.textContent = snap.size;
    statActiveUsers.textContent = active;
    statInactiveUsers.textContent = inactive;
    statFrozenUsers.textContent = frozen;
    statTodayUsers.textContent = today;
  });
  liveListeners.push(usersUnsub);

  const withdrawsUnsub = onSnapshot(collection(db, WITHDRAWS), (snap) => {
    let pending = 0, today = 0, totalPayout = 0;

    snap.forEach((d) => {
      const w = d.data();
      if (w.status === "pending") pending++;
      if (isToday(w.requestedAt)) today++;
      if (w.status === "approved") totalPayout += Number(w.amount) || 0;
    });

    statPendingWithdraws.textContent = pending;
    statTodayWithdraws.textContent = today;
    statTotalPayout.textContent = formatCurrency(totalPayout);
  });
  liveListeners.push(withdrawsUnsub);

  const activationsUnsub = onSnapshot(collection(db, ACTIVATIONS), (snap) => {
    let pending = 0, today = 0;

    snap.forEach((d) => {
      const a = d.data();
      if (a.status === "pending") pending++;
      if (isToday(a.requestedAt)) today++;
    });

    statPendingActivations.textContent = pending;
    statTodayActivations.textContent = today;
  });
  liveListeners.push(activationsUnsub);

  const submissionsStatUnsub = onSnapshot(
    query(collection(db, TASK_SUBMISSIONS), where("status", "==", "pending")),
    (snap) => { statPendingSubmissions.textContent = snap.size; }
  );
  liveListeners.push(submissionsStatUnsub);
}

function userStatusBadge(u) {
  if (u.isFrozen) return `<span class="badge badge-danger">Frozen</span>`;
  if (u.isActive) return `<span class="badge badge-success">Active</span>`;
  return `<span class="badge badge-warning">Inactive</span>`;
}

function renderUserRows(users) {
  const search = userSearchInput.value.trim().toLowerCase();

  const filtered = users.filter((u) => {
    if (!search) return true;
    return (u.name || "").toLowerCase().includes(search) || (u.email || "").toLowerCase().includes(search) || (u.phone || "").includes(search);
  });

  userListBody.innerHTML = filtered.length
    ? filtered.map((u) => `
      <tr data-uid="${u.uid}">
        <td>
          <div class="admin-cell-user">
            <strong>${u.name || "--"}</strong>
            <span>${u.referralCode || "--"} • ${u.rank || "Starter"} • ${u.authProvider === "phone" ? "📱 Phone" : "🔵 Google"}</span>
          </div>
        </td>
        <td>${u.email || u.phone || "--"}</td>
        <td>${userStatusBadge(u)}</td>
        <td>${formatCurrency(u.walletBalance)}</td>
        <td>${u.activeReferralCount || 0}</td>
        <td>${formatDate(u.createdAt)}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-secondary btn-xs view-user-btn" data-uid="${u.uid}">View</button>
          </div>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="7">No users found.</td></tr>`;

  userListBody.querySelectorAll(".view-user-btn").forEach((btn) => {
    btn.addEventListener("click", () => openUserDetails(btn.dataset.uid));
  });
}

function attachUserListListener() {
  const existing = liveListeners.userListUnsub;
  if (existing) existing();

  const filterValue = userStatusFilter.value;
  let q;

  if (filterValue === "active") {
    q = query(collection(db, USERS), where("isActive", "==", true), where("isFrozen", "==", false), orderBy("createdAt", "desc"), limit(userListLimitValue));
  } else if (filterValue === "inactive") {
    q = query(collection(db, USERS), where("isActive", "==", false), orderBy("createdAt", "desc"), limit(userListLimitValue));
  } else if (filterValue === "frozen") {
    q = query(collection(db, USERS), where("isFrozen", "==", true), orderBy("createdAt", "desc"), limit(userListLimitValue));
  } else {
    q = query(collection(db, USERS), orderBy("createdAt", "desc"), limit(userListLimitValue));
  }

  const unsub = onSnapshot(q, (snap) => {
    allLoadedUsers = [];
    snap.forEach((d) => allLoadedUsers.push(d.data()));
    renderUserRows(allLoadedUsers);
  });

  liveListeners.userListUnsub = unsub;
  liveListeners.push(unsub);
}

userSearchInput.addEventListener("input", () => renderUserRows(allLoadedUsers));
userStatusFilter.addEventListener("change", () => {
  userListLimitValue = 25;
  attachUserListListener();
});

loadMoreUsersBtn.addEventListener("click", () => {
  userListLimitValue += 25;
  attachUserListListener();
});

async function openUserDetails(uid) {
  try {
    showActionLoading(true);
    const userSnap = await getDoc(doc(db, USERS, uid));

    if (!userSnap.exists()) {
      showError("User not found.");
      return;
    }

    const u = userSnap.data();
    selectedUser = u;

    udModalName.textContent = u.name || "--";
    udModalEmail.textContent = u.email || u.phone || "--";
    udModalPhone.textContent = u.phone || "Not Set";
    udModalDistrict.textContent = u.district || "Not Set";
    udModalUID.textContent = u.uid;
    udModalReferralCode.textContent = u.referralCode || "--";
    udModalStatus.textContent = u.isFrozen ? "Frozen" : u.isActive ? "Active" : "Inactive";
    udModalWallet.textContent = formatCurrency(u.walletBalance);
    udModalReferrals.textContent = `${u.activeReferralCount || 0} Lifetime (Withdrawable: ${u.withdrawableReferralCount || 0}) • Rank: ${u.rank || "Starter"}`;
    udModalApprovedTasks.textContent = `${u.approvedTaskCount || 0}`;
    udModalJoined.textContent = formatDate(u.createdAt);

    udFreezeBtn.textContent = u.isFrozen ? "Unfreeze User" : "Freeze User";
    udActivateBtn.textContent = u.isActive ? "Deactivate User" : "Activate User";

    openModal(userDetailsModal);
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
}

closeUserDetailsModal.addEventListener("click", () => closeModalEl(userDetailsModal));

udFreezeBtn.addEventListener("click", async () => {
  if (!selectedUser) return;

  const newFrozenState = !selectedUser.isFrozen;
  const confirmed = await showConfirm(
    newFrozenState ? "Freeze User" : "Unfreeze User",
    `Are you sure you want to ${newFrozenState ? "freeze" : "unfreeze"} ${selectedUser.name}'s account?`
  );
  if (!confirmed) return;

  try {
    showActionLoading(true);
    await updateDoc(doc(db, USERS, selectedUser.uid), { isFrozen: newFrozenState });
    closeModalEl(userDetailsModal);
    showSuccess(`User ${newFrozenState ? "frozen" : "unfrozen"} successfully.`);
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

udActivateBtn.addEventListener("click", async () => {
  if (!selectedUser) return;

  const newActiveState = !selectedUser.isActive;
  const confirmed = await showConfirm(
    newActiveState ? "Activate User" : "Deactivate User",
    `Are you sure you want to ${newActiveState ? "activate" : "deactivate"} ${selectedUser.name}'s account? This is a manual override and will not trigger referral commission.`
  );
  if (!confirmed) return;

  try {
    showActionLoading(true);
    await updateDoc(doc(db, USERS, selectedUser.uid), { isActive: newActiveState });
    closeModalEl(userDetailsModal);
    showSuccess(`User ${newActiveState ? "activated" : "deactivated"} successfully.`);
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

udAddBalanceBtn.addEventListener("click", () => {
  if (!selectedUser) return;
  addBalanceUserName.textContent = `${selectedUser.name} (${selectedUser.email || selectedUser.phone})`;
  addBalanceUID.value = selectedUser.uid;
  addBalanceAmount.value = "";
  addBalanceReason.value = "";
  closeModalEl(userDetailsModal);
  openModal(addBalanceModal);
});

addBalanceCancelBtn.addEventListener("click", () => closeModalEl(addBalanceModal));

addBalanceSubmitBtn.addEventListener("click", async () => {
  const uid = addBalanceUID.value;
  const amount = Number(addBalanceAmount.value);
  const reason = addBalanceReason.value.trim();

  if (!amount || amount <= 0) {
    showWarning("Please enter a valid amount.");
    return;
  }
  if (!reason) {
    showWarning("Please enter a reason for this balance addition.");
    return;
  }

  const confirmed = await showConfirm("Confirm Add Balance", `Add ${formatCurrency(amount)} to this user's wallet?`);
  if (!confirmed) return;

  try {
    showActionLoading(true);

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, USERS, uid);
      transaction.update(userRef, {
        walletBalance: increment(amount),
        totalIncome: increment(amount)
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid,
        type: "admin_credit",
        amount,
        description: reason,
        status: "completed",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid,
        title: "Balance Added",
        message: `${formatCurrency(amount)} has been added to your wallet. Reason: ${reason}`,
        type: "success",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    closeModalEl(addBalanceModal);
    showSuccess("Balance added successfully.");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

function withdrawStatusLabelAdmin(status) {
  if (status === "approved") return { text: "✅ Withdraw Successful", cls: "badge-success" };
  if (status === "pending") return { text: "⏳ Pending", cls: "badge-warning" };
  return { text: "❌ Rejected", cls: "badge-danger" };
}

function attachWithdrawTableListener() {
  const existing = liveListeners.withdrawUnsub;
  if (existing) existing();

  const filterValue = withdrawStatusFilter.value;
  let q;

  if (filterValue === "all") {
    q = query(collection(db, WITHDRAWS), orderBy("requestedAt", "desc"), limit(50));
  } else {
    q = query(collection(db, WITHDRAWS), where("status", "==", filterValue), orderBy("requestedAt", "desc"), limit(50));
  }

  const unsub = onSnapshot(q, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));

    withdrawListBody.innerHTML = rows.length
      ? rows.map((w) => {
          const label = withdrawStatusLabelAdmin(w.status);
          const actions = w.status === "pending"
            ? `<div class="table-actions">
                <button type="button" class="btn btn-success btn-xs withdraw-approve-btn" data-id="${w.id}">Approve</button>
                <button type="button" class="btn btn-danger btn-xs withdraw-reject-btn" data-id="${w.id}">Reject</button>
              </div>`
            : `<span class="badge ${label.cls}">${label.text}</span>`;

          return `<tr>
            <td>${formatDate(w.requestedAt)}</td>
            <td>${w.name || "--"}</td>
            <td>${formatCurrency(w.amount)}</td>
            <td>${w.approvedTaskCountAtRequest ?? "--"}</td>
            <td>${w.method}</td>
            <td>${w.accountNumber}</td>
            <td><span class="badge ${label.cls}">${label.text}</span></td>
            <td>${actions}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="8">No withdraw requests found.</td></tr>`;

    withdrawListBody.querySelectorAll(".withdraw-approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => processWithdraw(btn.dataset.id, "approved"));
    });
    withdrawListBody.querySelectorAll(".withdraw-reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => processWithdraw(btn.dataset.id, "rejected"));
    });
  });

  liveListeners.withdrawUnsub = unsub;
  liveListeners.push(unsub);
}

withdrawStatusFilter.addEventListener("change", attachWithdrawTableListener);

async function processWithdraw(withdrawId, decision) {
  const label = decision === "approved" ? "Approve" : "Reject";
  const confirmed = await showConfirm(`${label} Withdraw`, `Are you sure you want to ${label.toLowerCase()} this withdraw request?`);
  if (!confirmed) return;

  try {
    showActionLoading(true);

    const withdrawRef = doc(db, WITHDRAWS, withdrawId);
    const withdrawSnap = await getDoc(withdrawRef);

    if (!withdrawSnap.exists()) {
      showError("Withdraw request not found.");
      return;
    }

    const w = withdrawSnap.data();

    if (w.status !== "pending") {
      showWarning("This request has already been processed.");
      return;
    }

    await runTransaction(db, async (transaction) => {
      transaction.update(withdrawRef, {
        status: decision,
        processedAt: serverTimestamp()
      });

      if (decision === "rejected") {
        const userRef = doc(db, USERS, w.uid);
        transaction.update(userRef, {
          walletBalance: increment(w.amount),
          withdrawableReferralCount: increment(w.referralConsumed || 3)
        });
      }

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid: w.uid,
        title: decision === "approved" ? "Withdraw Successful" : "Withdraw Rejected",
        message: decision === "approved"
          ? `✅ Withdraw Successful! আপনার ${formatCurrency(w.amount)} Withdraw সম্পন্ন হয়েছে।`
          : `আপনার ${formatCurrency(w.amount)} Withdraw Request Reject হয়েছে এবং Amount ও Referral Wallet-এ ফেরত দেওয়া হয়েছে।`,
        type: decision === "approved" ? "success" : "error",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    showSuccess(`Withdraw request ${decision} successfully.`);
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
}

function attachActivationTableListener() {
  const existing = liveListeners.activationUnsub;
  if (existing) existing();

  const filterValue = activationStatusFilter.value;
  let q;

  if (filterValue === "all") {
    q = query(collection(db, ACTIVATIONS), orderBy("requestedAt", "desc"), limit(50));
  } else {
    q = query(collection(db, ACTIVATIONS), where("status", "==", filterValue), orderBy("requestedAt", "desc"), limit(50));
  }

  const unsub = onSnapshot(q, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));

    activationListBody.innerHTML = rows.length
      ? rows.map((a) => {
          const statusClass = a.status === "approved" ? "badge-success" : a.status === "pending" ? "badge-warning" : "badge-danger";
          const actions = a.status === "pending"
            ? `<div class="table-actions">
                <button type="button" class="btn btn-success btn-xs activation-approve-btn" data-id="${a.id}">Approve</button>
                <button type="button" class="btn btn-danger btn-xs activation-reject-btn" data-id="${a.id}">Reject</button>
              </div>`
            : `<span class="badge ${statusClass}">${a.status}</span>`;

          return `<tr>
            <td>${formatDate(a.requestedAt)}</td>
            <td>${a.name || "--"}</td>
            <td>${a.method}</td>
            <td>${a.senderNumber}</td>
            <td>${a.transactionId}</td>
            <td><span class="badge ${statusClass}">${a.status}</span></td>
            <td>${actions}</td>
          </tr>`;
        }).join("")
      : `<tr><td colspan="7">No activation requests found.</td></tr>`;

    activationListBody.querySelectorAll(".activation-approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => processActivation(btn.dataset.id, "approved"));
    });
    activationListBody.querySelectorAll(".activation-reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => processActivation(btn.dataset.id, "rejected"));
    });
  });

  liveListeners.activationUnsub = unsub;
  liveListeners.push(unsub);
}

activationStatusFilter.addEventListener("change", attachActivationTableListener);

async function buildReferralChain(startingReferredBy) {
  const chain = [];
  let currentCode = startingReferredBy;

  for (let level = 0; level < LEVEL_COMMISSIONS.length && currentCode; level++) {
    const refQuery = query(collection(db, USERS), where("referralCode", "==", currentCode), limit(1));
    const refSnap = await getDocs(refQuery);
    if (refSnap.empty) break;

    const ancestorDoc = refSnap.docs[0];
    chain.push({ ref: doc(db, USERS, ancestorDoc.id), uid: ancestorDoc.id });
    currentCode = ancestorDoc.data().referredBy || null;
  }

  return chain;
}

async function processActivation(activationId, decision) {
  const label = decision === "approved" ? "Approve" : "Reject";
  const confirmed = await showConfirm(`${label} Activation`, `Are you sure you want to ${label.toLowerCase()} this activation request?`);
  if (!confirmed) return;

  try {
    showActionLoading(true);

    const activationRef = doc(db, ACTIVATIONS, activationId);
    const activationSnap = await getDoc(activationRef);

    if (!activationSnap.exists()) {
      showError("Activation request not found.");
      return;
    }

    const a = activationSnap.data();

    if (a.status !== "pending") {
      showWarning("This request has already been processed.");
      return;
    }

    let referralChain = [];

    if (decision === "approved") {
      const userSnap = await getDoc(doc(db, USERS, a.uid));
      const userData = userSnap.data();
      if (userData && userData.referredBy) {
        referralChain = await buildReferralChain(userData.referredBy);
      }
    }

    await runTransaction(db, async (transaction) => {
      const ancestorSnaps = [];
      for (const item of referralChain) {
        const snap = await transaction.get(item.ref);
        ancestorSnaps.push(snap);
      }

      transaction.update(activationRef, {
        status: decision,
        processedAt: serverTimestamp()
      });

      if (decision === "approved") {
        transaction.update(doc(db, USERS, a.uid), {
          isActive: true,
          activatedAt: serverTimestamp(),
          walletBalance: increment(ACTIVATION_BONUS),
          totalIncome: increment(ACTIVATION_BONUS)
        });

        const activationBonusTxnRef = doc(collection(db, TRANSACTIONS));
        transaction.set(activationBonusTxnRef, {
          uid: a.uid,
          type: "activation_bonus",
          amount: ACTIVATION_BONUS,
          description: "Account Activation Bonus",
          status: "completed",
          createdAt: serverTimestamp()
        });

        const activatedNotifRef = doc(collection(db, NOTIFICATIONS));
        transaction.set(activatedNotifRef, {
          uid: a.uid,
          title: "Account Activated",
          message: `Your account has been successfully activated. ৳${ACTIVATION_BONUS} Activation Bonus has been added to your wallet. You can now request withdrawals.`,
          type: "success",
          isRead: false,
          createdAt: serverTimestamp()
        });

        for (let i = 0; i < referralChain.length; i++) {
          const commission = LEVEL_COMMISSIONS[i];
          const ancestorRef = referralChain[i].ref;
          const ancestorData = ancestorSnaps[i].data();

          const updateObj = {
            walletBalance: increment(commission),
            totalIncome: increment(commission),
            referralEarnings: increment(commission)
          };

          let rankBonusAmount = 0;
          let rankChangedTo = null;

          if (i === 0) {
            const newActiveCount = (ancestorData.activeReferralCount || 0) + 1;
            const newRank = getRankForCount(newActiveCount);
            const oldRankName = ancestorData.rank || "Starter";

            updateObj.activeReferralCount = newActiveCount;
            updateObj.contestReferralCount = increment(1);
            updateObj.withdrawableReferralCount = increment(1);

            if (newRank.name !== oldRankName) {
              updateObj.rank = newRank.name;
              rankChangedTo = newRank.name;
              if (newRank.bonus > 0) {
                rankBonusAmount = newRank.bonus;
                updateObj.walletBalance = increment(commission + rankBonusAmount);
                updateObj.totalIncome = increment(commission + rankBonusAmount);
              }
            }
          }

          transaction.update(ancestorRef, updateObj);

          const commissionTxnRef = doc(collection(db, TRANSACTIONS));
          transaction.set(commissionTxnRef, {
            uid: referralChain[i].uid,
            type: "referral_bonus",
            amount: commission,
            description: `Level ${i + 1} Referral Commission from ${a.name}`,
            status: "completed",
            createdAt: serverTimestamp()
          });

          const commissionNotifRef = doc(collection(db, NOTIFICATIONS));
          transaction.set(commissionNotifRef, {
            uid: referralChain[i].uid,
            title: `Level ${i + 1} Referral Commission`,
            message: `আপনি Level ${i + 1} Referral Commission হিসেবে ৳${commission} পেয়েছেন।${i === 0 ? " আপনার Withdraw-এর জন্য ১টি Active Referral যোগ হয়েছে।" : ""}`,
            type: "success",
            isRead: false,
            createdAt: serverTimestamp()
          });

          if (rankChangedTo && rankBonusAmount > 0) {
            const rankTxnRef = doc(collection(db, TRANSACTIONS));
            transaction.set(rankTxnRef, {
              uid: referralChain[i].uid,
              type: "rank_bonus",
              amount: rankBonusAmount,
              description: `Rank Upgraded to ${rankChangedTo}`,
              status: "completed",
              createdAt: serverTimestamp()
            });

            const rankNotifRef = doc(collection(db, NOTIFICATIONS));
            transaction.set(rankNotifRef, {
              uid: referralChain[i].uid,
              title: "Rank Upgrade!",
              message: `অভিনন্দন! আপনি ${rankChangedTo} Rank-এ Upgrade হয়েছেন এবং ৳${rankBonusAmount} Bonus পেয়েছেন।`,
              type: "success",
              isRead: false,
              createdAt: serverTimestamp()
            });
          }
        }
      } else {
        const rejectedNotifRef = doc(collection(db, NOTIFICATIONS));
        transaction.set(rejectedNotifRef, {
          uid: a.uid,
          title: "Activation Rejected",
          message: "Your account activation request was rejected. Please check your payment details and try again.",
          type: "error",
          isRead: false,
          createdAt: serverTimestamp()
        });
      }
    });

    showSuccess(`Activation request ${decision} successfully.`);
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
}

function resetTaskForm() {
  taskPlatformSelect.value = TASK_PLATFORMS[0].key;
  taskNameInput.value = "";
  taskLinkInput.value = "";
  taskTypeInput.value = "";
  taskInstructionInput.value = "";
  taskRewardInput.value = 5;
  taskRequiredInput.checked = false;
  taskEditId.value = "";
  taskCancelEditBtn.classList.add("hidden");
}

function taskRow(t) {
  const p = platformInfo(t.platform);
  return `<tr>
    <td>${p.icon} ${p.label}</td>
    <td>${t.taskName}</td>
    <td>${t.taskType}</td>
    <td>${formatCurrency(t.reward)}</td>
    <td>${t.required ? "Yes" : "No"}</td>
    <td><span class="badge ${t.isActive ? "badge-success" : "badge-danger"}">${t.isActive ? "Active" : "Disabled"}</span></td>
    <td>
      <div class="table-actions">
        <button type="button" class="btn btn-secondary btn-xs task-edit-btn" data-id="${t.id}">Edit</button>
        <button type="button" class="btn btn-warning btn-xs task-toggle-btn" data-id="${t.id}" data-state="${t.isActive}">${t.isActive ? "Disable" : "Enable"}</button>
        <button type="button" class="btn btn-danger btn-xs task-delete-btn" data-id="${t.id}">Delete</button>
      </div>
    </td>
  </tr>`;
}

function sortByCreatedAtDesc(arr) {
  return arr.sort((a, b) => {
    const aTime = a.createdAt && a.createdAt.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt && b.createdAt.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
}

function renderTaskList() {
  const filterValue = taskFilterPlatform.value;
  let rows = Object.values(allTasksById);
  if (filterValue !== "all") rows = rows.filter((t) => t.platform === filterValue);
  rows = sortByCreatedAtDesc(rows);

  taskListBody.innerHTML = rows.length
    ? rows.map(taskRow).join("")
    : `<tr><td colspan="7">No tasks found for this filter.</td></tr>`;

  bindTaskRowActions();
}

taskFilterPlatform.addEventListener("change", renderTaskList);

function attachTaskManagementListener() {
  const unsub = onSnapshot(collection(db, TASKS), (snap) => {
    allTasksById = {};
    snap.forEach((d) => { allTasksById[d.id] = { id: d.id, ...d.data() }; });
    renderTaskList();
  });
  liveListeners.push(unsub);
}

function bindTaskRowActions() {
  document.querySelectorAll(".task-edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const t = allTasksById[btn.dataset.id];
      if (!t) return;
      taskPlatformSelect.value = t.platform;
      taskNameInput.value = t.taskName;
      taskLinkInput.value = t.taskLink;
      taskTypeInput.value = t.taskType;
      taskInstructionInput.value = t.instruction || "";
      taskRewardInput.value = t.reward;
      taskRequiredInput.checked = !!t.required;
      taskEditId.value = t.id;
      taskCancelEditBtn.classList.remove("hidden");
      $("taskManagement").scrollIntoView({ behavior: "smooth" });
    });
  });

  document.querySelectorAll(".task-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const currentState = btn.dataset.state === "true";
      try {
        showActionLoading(true);
        await updateDoc(doc(db, TASKS, btn.dataset.id), { isActive: !currentState, updatedAt: serverTimestamp() });
        showToast("Updated", `Task ${!currentState ? "Enabled" : "Disabled"} successfully.`, "success");
      } catch (err) {
        showError(err.message);
      } finally {
        showActionLoading(false);
      }
    });
  });

  document.querySelectorAll(".task-delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const confirmed = await showConfirm("Delete Task", "Are you sure you want to delete this task? This cannot be undone.");
      if (!confirmed) return;
      try {
        showActionLoading(true);
        await deleteDoc(doc(db, TASKS, btn.dataset.id));
        showToast("Deleted", "Task deleted successfully.", "success");
      } catch (err) {
        showError(err.message);
      } finally {
        showActionLoading(false);
      }
    });
  });
}

taskSaveBtn.addEventListener("click", async () => {
  const platform = taskPlatformSelect.value;
  const name = taskNameInput.value.trim();
  const link = taskLinkInput.value.trim();
  const type = taskTypeInput.value.trim();
  const instruction = taskInstructionInput.value.trim();
  const reward = Number(taskRewardInput.value);
  const required = taskRequiredInput.checked;
  const editId = taskEditId.value;

  if (!name || !link || !type || !instruction || !reward) {
    showWarning("Task-এর সব ফিল্ড পূরণ করুন।");
    return;
  }

  try {
    showActionLoading(true);
    if (editId) {
      await updateDoc(doc(db, TASKS, editId), {
        platform, taskName: name, taskLink: link, taskType: type, instruction, reward, required, updatedAt: serverTimestamp()
      });
      showSuccess("Task Updated Successfully.");
    } else {
      await addDoc(collection(db, TASKS), {
        platform, taskName: name, taskLink: link, taskType: type, instruction, reward, required,
        isActive: true, createdBy: currentAdmin.email, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
      });
      showSuccess("Task Created Successfully.");
    }
    resetTaskForm();
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

taskCancelEditBtn.addEventListener("click", resetTaskForm);

function submissionStatusBadge(status) {
  if (status === "pending") return `<span class="badge badge-warning">Pending</span>`;
  if (status === "completed") return `<span class="badge badge-success">Completed</span>`;
  return `<span class="badge badge-danger">Rejected</span>`;
}

function attachSubmissionsListener() {
  const existing = liveListeners.submissionsUnsub;
  if (existing) existing();

  const platform = submissionPlatformFilter.value;
  const status = submissionStatusFilter.value;

  let constraints = [];
  if (platform !== "all") constraints.push(where("platform", "==", platform));
  if (status !== "all") constraints.push(where("status", "==", status));

  const q = constraints.length
    ? query(collection(db, TASK_SUBMISSIONS), ...constraints)
    : query(collection(db, TASK_SUBMISSIONS));

  const unsub = onSnapshot(q, (snap) => {
    let rows = [];
    snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      const aTime = a.submittedAt && a.submittedAt.toMillis ? a.submittedAt.toMillis() : 0;
      const bTime = b.submittedAt && b.submittedAt.toMillis ? b.submittedAt.toMillis() : 0;
      return bTime - aTime;
    });

    submissionListContainer.innerHTML = rows.length
      ? rows.map((s) => {
          const p = platformInfo(s.platform);
          return `<div class="submission-card">
          <img src="${s.screenshotBase64}" alt="Screenshot" class="submission-screenshot view-screenshot-btn" data-src="${s.screenshotBase64}">
          <div class="submission-details">
            <h4>${s.taskName} (${p.icon} ${p.label})</h4>
            <p><strong>User:</strong> ${s.name} (${s.email})</p>
            <p><strong>Profile/ID:</strong> ${s.profileLink}</p>
            <p><strong>Reward:</strong> ${formatCurrency(s.reward)} ${s.required ? "• Required" : ""}</p>
            <p><strong>Submitted:</strong> ${formatDate(s.submittedAt)}</p>
            <p><strong>Status:</strong> ${submissionStatusBadge(s.status)}</p>
            ${s.status === "rejected" && s.rejectReason ? `<p><strong>Reject Reason:</strong> ${s.rejectReason}</p>` : ""}
          </div>
          ${s.status === "pending" ? `
            <div class="submission-actions">
              <button type="button" class="btn btn-success btn-xs submission-approve-btn" data-id="${s.id}">Approve</button>
              <button type="button" class="btn btn-danger btn-xs submission-reject-btn" data-id="${s.id}">Reject</button>
            </div>` : ""}
        </div>`;
        }).join("")
      : `<div class="card">No submissions found.</div>`;

    submissionListContainer.querySelectorAll(".view-screenshot-btn").forEach((img) => {
      img.addEventListener("click", () => {
        screenshotViewImage.src = img.dataset.src;
        openModal(screenshotViewModal);
      });
    });

    submissionListContainer.querySelectorAll(".submission-approve-btn").forEach((btn) => {
      btn.addEventListener("click", () => approveSubmission(btn.dataset.id));
    });

    submissionListContainer.querySelectorAll(".submission-reject-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        rejectSubmissionId.value = btn.dataset.id;
        rejectReasonInput.value = "";
        openModal(rejectReasonModal);
      });
    });
  });

  liveListeners.submissionsUnsub = unsub;
  liveListeners.push(unsub);
}

submissionPlatformFilter.addEventListener("change", attachSubmissionsListener);
submissionStatusFilter.addEventListener("change", attachSubmissionsListener);

closeScreenshotView.addEventListener("click", () => closeModalEl(screenshotViewModal));

async function approveSubmission(submissionId) {
  const confirmed = await showConfirm("Approve Task", "Approve this task submission and add reward to the user's wallet?");
  if (!confirmed) return;

  try {
    showActionLoading(true);

    const subRef = doc(db, TASK_SUBMISSIONS, submissionId);
    const subSnap = await getDoc(subRef);

    if (!subSnap.exists()) {
      showError("Submission not found.");
      return;
    }

    const s = subSnap.data();

    if (s.status !== "pending") {
      showWarning("This submission has already been reviewed.");
      return;
    }

    await runTransaction(db, async (transaction) => {
      transaction.update(subRef, {
        status: "completed",
        reviewedAt: serverTimestamp(),
        reviewedBy: currentAdmin.email
      });

      const userRef = doc(db, USERS, s.uid);
      transaction.update(userRef, {
        walletBalance: increment(s.reward),
        totalIncome: increment(s.reward),
        approvedTaskCount: increment(1)
      });

      const txnRef = doc(collection(db, TRANSACTIONS));
      transaction.set(txnRef, {
        uid: s.uid,
        type: "task_reward",
        amount: s.reward,
        description: `Task Reward: ${s.taskName}`,
        status: "completed",
        createdAt: serverTimestamp()
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid: s.uid,
        title: "Task Approved",
        message: `আপনার "${s.taskName}" Task Approved হয়েছে এবং ৳${s.reward} Wallet-এ যোগ হয়েছে।`,
        type: "success",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    showSuccess("Task submission approved and reward added successfully.");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
}

rejectReasonCancelBtn.addEventListener("click", () => closeModalEl(rejectReasonModal));

rejectReasonSubmitBtn.addEventListener("click", async () => {
  const submissionId = rejectSubmissionId.value;
  const reason = rejectReasonInput.value.trim();

  if (!reason) {
    showWarning("Reject করার কারণ লিখা বাধ্যতামূলক।");
    return;
  }

  try {
    showActionLoading(true);

    const subRef = doc(db, TASK_SUBMISSIONS, submissionId);
    const subSnap = await getDoc(subRef);

    if (!subSnap.exists()) {
      showError("Submission not found.");
      return;
    }

    const s = subSnap.data();

    if (s.status !== "pending") {
      showWarning("This submission has already been reviewed.");
      return;
    }

    await runTransaction(db, async (transaction) => {
      transaction.update(subRef, {
        status: "rejected",
        rejectReason: reason,
        reviewedAt: serverTimestamp(),
        reviewedBy: currentAdmin.email
      });

      const notifRef = doc(collection(db, NOTIFICATIONS));
      transaction.set(notifRef, {
        uid: s.uid,
        title: "Task Rejected",
        message: `আপনার "${s.taskName}" Task Rejected হয়েছে। কারণ: ${reason}। আপনি সঠিক তথ্য দিয়ে আবার Submit করতে পারবেন।`,
        type: "error",
        isRead: false,
        createdAt: serverTimestamp()
      });
    });

    closeModalEl(rejectReasonModal);
    showSuccess("Task submission rejected successfully.");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

sendBroadcastBtn.addEventListener("click", async () => {
  const title = broadcastTitleInput.value.trim();
  const message = broadcastMessageInput.value.trim();

  if (!title || !message) {
    showWarning("Please fill in both title and message.");
    return;
  }

  const confirmed = await showConfirm("Send Broadcast", "This message will be sent to all users. Continue?");
  if (!confirmed) return;

  try {
    showActionLoading(true);

    const batch = writeBatch(db);

    const broadcastRef = doc(collection(db, BROADCAST));
    batch.set(broadcastRef, {
      title,
      message,
      createdAt: serverTimestamp(),
      createdBy: currentAdmin.email
    });

    const notifRef = doc(collection(db, NOTIFICATIONS));
    batch.set(notifRef, {
      uid: "all",
      title,
      message,
      type: "info",
      isRead: false,
      createdAt: serverTimestamp()
    });

    await batch.commit();

    broadcastTitleInput.value = "";
    broadcastMessageInput.value = "";
    showSuccess("Broadcast sent to all users successfully.");
  } catch (err) {
    showError(err.message);
  } finally {
    showActionLoading(false);
  }
});

function attachBroadcastHistoryListener() {
  const q = query(collection(db, BROADCAST), orderBy("createdAt", "desc"), limit(20));
  const unsub = onSnapshot(q, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));

    broadcastHistoryList.innerHTML = rows.length
      ? rows.map((b) => `
        <div class="card">
          <strong>${b.title}</strong>
          <p>${b.message}</p>
          <p>${formatDate(b.createdAt)} — by ${b.createdBy || "Admin"}</p>
        </div>`).join("")
      : `<div class="card">No broadcasts sent yet.</div>`;
  });
  liveListeners.push(unsub);
}

function attachAdminNotificationsListener() {
  const q = query(collection(db, NOTIFICATIONS), where("uid", "==", "all"), orderBy("createdAt", "desc"), limit(30));
  const unsub = onSnapshot(q, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));

    adminNotificationList.innerHTML = rows.length
      ? rows.map((n) => `
        <div class="card">
          <strong>${n.title}</strong>
          <p>${n.message}</p>
          <p>${formatDate(n.createdAt)}</p>
        </div>`).join("")
      : `<div class="card">No notifications yet.</div>`;
  });
  liveListeners.push(unsub);
}

function attachAdminLeaderboardListener() {
  const q = query(collection(db, USERS), orderBy("totalIncome", "desc"), limit(10));
  const unsub = onSnapshot(q, (snap) => {
    const rows = [];
    snap.forEach((d) => rows.push(d.data()));

    adminLeaderboardTable.innerHTML = rows.length
      ? rows.map((u, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td>${u.name}</td>
          <td>${u.activeReferralCount || 0}</td>
          <td>${formatCurrency(u.totalIncome)}</td>
        </tr>`).join("")
      : `<tr><td colspan="4">No leaderboard data.</td></tr>`;
  });
  liveListeners.push(unsub);
}

function attachAllAdminListeners() {
  detachAllListeners();
  attachStatsListeners();
  attachUserListListener();
  attachWithdrawTableListener();
  attachActivationTableListener();
  attachTaskManagementListener();
  attachSubmissionsListener();
  attachBroadcastHistoryListener();
  attachAdminNotificationsListener();
  attachAdminLeaderboardListener();
}

window.addEventListener("scroll", () => {
  scrollTopBtn.hidden = window.scrollY < 400;
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
