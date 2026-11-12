import {
  auth, db, onAuthStateChanged,
  doc, collection, onSnapshot, runTransaction, increment, serverTimestamp,
  USERS, TRANSACTIONS, NOTIFICATIONS
} from "./firebase.js";

import "./premium2.js";
import "./premium3.js";

/* Premium upgrade layer — loads AFTER app.js. Existing app.js code is untouched. */

const $ = (id) => document.getElementById(id);
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "premium.css";
document.head.appendChild(link);

const DAILY_BONUS = 5;
const DAILY_CLAIMS = "dailyClaims";
const SPIN_RESULTS = "spinResults";

const SEGMENTS = [
  { label: "৳0", reward: 0, color: "#1B2650" },
  { label: "৳1", reward: 1, color: "#C9A24B" },
  { label: "৳2", reward: 2, color: "#2F4FD6" },
  { label: "৳3", reward: 3, color: "#B88A2E" },
  { label: "৳4", reward: 4, color: "#1F3399" },
  { label: "৳5", reward: 5, color: "#E3BE6A" },
  { label: "🎁", gift: true, color: "#6D28D9" }
];
const SEG_ANGLE = 360 / SEGMENTS.length;

let uid = null;
let userData = null;
let unsubUser = null;
let isSpinning = false;
let wheelRotation = 0;
let dailyBtn, spinBtn;

function todayStr() { return new Date().toISOString().slice(0, 10); }
function money(n) { return `${Math.round(Number(n) || 0).toLocaleString("en-US")} ৳`; }
function fmtDate(ts) {
  if (!ts || !ts.toDate) return "--";
  const d = ts.toDate();
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function randInt(max) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
}
function showDialog(kind, msg) {
  const map = { warning: ["warningMessage", "warningDialog"], error: ["errorMessage", "errorDialog"] };
  const [m, d] = map[kind];
  $(m).textContent = msg;
  $(d).classList.remove("hidden");
}

/* ---------- 1. QUICK ACTIONS ---------- */
function upgradeQuickActions() {
  const items = [
    ["copyReferralBtn", "🔗", "Copy Referral Link"],
    ["shareBtn", "📤", "Share Referral Link"],
    ["refreshBtn", "🔄", "Refresh"],
    ["leaderboardBtn", "🏆", "View Leaderboard"]
  ];
  items.forEach(([id, icon, text]) => {
    const b = $(id);
    if (b) b.innerHTML = `<span class="qa-icon">${icon}</span><span class="qa-text">${text}</span>`;
  });
}

/* ---------- Reward popup (daily bonus / spin / gift box) ---------- */
function showReward({ icon, title, amount, sub, gift }) {
  const old = $("rewardOverlay");
  if (old) old.remove();
  const ov = document.createElement("div");
  ov.id = "rewardOverlay";
  ov.className = "reward-overlay";
  const confetti = amount > 0 ? Array.from({ length: 22 }, (_, i) =>
    `<i style="left:${(i * 4.5 + randInt(30)) % 100}%;animation-delay:${(randInt(60) / 100).toFixed(2)}s;background:${["#D4AF37", "#F1D7A0", "#2F4FD6", "#1E9E6B"][i % 4]}"></i>`
  ).join("") : "";
  ov.innerHTML = `
    <div class="reward-confetti">${confetti}</div>
    <div class="reward-card">
      ${gift ? `<div class="gb" id="gbBox"><div class="gb-lid"></div><div class="gb-body"></div><div class="gb-glow"></div></div>`
             : `<div class="reward-icon">${icon}</div>`}
      <h3>${title}</h3>
      <div class="reward-amount ${gift ? "reward-hidden" : ""}" id="rewardAmount">${amount > 0 ? "+" : ""}৳${amount}</div>
      <p class="reward-sub ${gift ? "reward-hidden" : ""}" id="rewardSub">${sub}</p>
      <button type="button" class="reward-close" id="rewardClose">OK</button>
    </div>`;
  document.body.appendChild(ov);
  $("rewardClose").addEventListener("click", () => ov.remove());
  if (gift) {
    const box = $("gbBox");
    box.classList.add("shake");
    setTimeout(() => { box.classList.remove("shake"); box.classList.add("open"); }, 1000);
    setTimeout(() => {
      $("rewardAmount").classList.remove("reward-hidden");
      $("rewardSub").classList.remove("reward-hidden");
    }, 1700);
  }
}

/* ---------- 2. DAILY LOGIN BONUS ---------- */
function upgradeDailyBonus() {
  const old = $("dailyBonusBtn");
  if (!old) return;
  dailyBtn = old.cloneNode(true); // drops old app.js click handler
  old.replaceWith(dailyBtn);
  dailyBtn.classList.add("daily-claim-btn");
  dailyBtn.innerHTML = `<span>🎁</span><span id="dailyBtnText">Claim ৳${DAILY_BONUS}</span>`;
  const info = document.querySelector(".daily-bonus-info");
  if (info && !$("dailyAmountChip")) {
    info.insertAdjacentHTML("afterbegin", `<span class="bonus-amount-chip" id="dailyAmountChip">৳${DAILY_BONUS} Daily Bonus</span>`);
  }
  dailyBtn.addEventListener("click", claimDaily);
}

async function claimDaily() {
  if (!uid || !userData) return;
  const today = todayStr();
  if (userData.lastLoginBonusDate === today) { showDialog("warning", "আজকের Bonus ইতিমধ্যে সংগ্রহ করা হয়েছে।"); return; }
  dailyBtn.disabled = true;
  try {
    await runTransaction(db, async (tx) => {
      const userRef = doc(db, USERS, uid);
      const claimRef = doc(db, DAILY_CLAIMS, `${uid}_${today}`);
      const u = await tx.get(userRef);
      const c = await tx.get(claimRef);
      if (c.exists() || (u.data() || {}).lastLoginBonusDate === today) throw new Error("ALREADY_CLAIMED");
      tx.update(userRef, {
        walletBalance: increment(DAILY_BONUS),
        totalIncome: increment(DAILY_BONUS),
        lastLoginBonusDate: today
      });
      tx.set(claimRef, { uid, date: today, amount: DAILY_BONUS, createdAt: serverTimestamp() });
      tx.set(doc(collection(db, TRANSACTIONS)), {
        uid, type: "daily_login_bonus", amount: DAILY_BONUS,
        description: "Daily Login Bonus", status: "completed", createdAt: serverTimestamp()
      });
      tx.set(doc(collection(db, NOTIFICATIONS)), {
        uid, title: "Daily Login Bonus",
        message: `আজকের Login Bonus হিসেবে ৳${DAILY_BONUS} আপনার Wallet-এ যোগ হয়েছে।`,
        type: "success", isRead: false, createdAt: serverTimestamp()
      });
    });
    showReward({ icon: "🎁", title: "Daily Bonus Claimed!", amount: DAILY_BONUS, sub: "আপনার Wallet-এ যোগ হয়েছে।" });
  } catch (err) {
    if (err.message === "ALREADY_CLAIMED") showDialog("warning", "আজকের Bonus ইতিমধ্যে সংগ্রহ করা হয়েছে।");
    else showDialog("error", err.message);
  } finally {
    syncButtons();
  }
}

/* ---------- 3. LUCKY SPIN (7 segments incl. Gift Box) ---------- */
function buildWheel() {
  const wheel = $("spinWheel");
  if (!wheel) return;
  const stops = SEGMENTS.map((s, i) => `${s.color} ${(i * SEG_ANGLE).toFixed(3)}deg ${((i + 1) * SEG_ANGLE).toFixed(3)}deg`).join(",");
  wheel.style.background = `conic-gradient(${stops})`;
  wheel.innerHTML = SEGMENTS.map((s, i) => {
    const center = i * SEG_ANGLE + SEG_ANGLE / 2;
    return `<span class="spin-seg ${s.gift ? "spin-seg-gift" : ""}" style="transform:translate(-50%,-50%) rotate(${center}deg) translateY(calc(var(--wheel) * -0.34))">${s.label}</span>`;
  }).join("") + `<span class="spin-hub">★</span>`;
}

function upgradeSpin() {
  const old = $("spinBtn");
  if (!old) return;
  spinBtn = old.cloneNode(true);
  old.replaceWith(spinBtn);
  spinBtn.className = "spin-now-btn";
  spinBtn.innerHTML = `<span class="spin-btn-icon">🎡</span><span id="spinBtnText">Spin Now</span>`;
  spinBtn.addEventListener("click", doSpin);
  buildWheel();
}

async function doSpin() {
  if (isSpinning || !uid || !userData) return;
  const today = todayStr();
  if (!userData.isActive) { showDialog("warning", "Lucky Spin করতে আপনার Account Active থাকতে হবে।"); return; }
  if (userData.isFrozen) { showDialog("warning", "আপনার Account Frozen করা আছে।"); return; }
  if (userData.lastSpinDate === today) { showDialog("warning", "আজকের Lucky Spin ইতিমধ্যে সম্পন্ন হয়েছে।"); return; }

  isSpinning = true;
  spinBtn.disabled = true;
  $("spinResult").textContent = "";

  // Result is decided and SAVED first; the animation only plays what was saved.
  const segIndex = randInt(SEGMENTS.length);
  const seg = SEGMENTS[segIndex];
  const giftReward = seg.gift ? randInt(6) : null;
  const reward = seg.gift ? giftReward : seg.reward;

  try {
    await runTransaction(db, async (tx) => {
      const userRef = doc(db, USERS, uid);
      const spinRef = doc(db, SPIN_RESULTS, `${uid}_${today}`);
      const u = await tx.get(userRef);
      const s = await tx.get(spinRef);
      if (s.exists() || (u.data() || {}).lastSpinDate === today) throw new Error("ALREADY_SPUN");
      tx.update(userRef, {
        walletBalance: increment(reward),
        totalIncome: increment(reward),
        lastSpinDate: today
      });
      tx.set(spinRef, {
        uid, date: today, segmentIndex: segIndex, segment: seg.gift ? "gift_box" : `reward_${seg.reward}`,
        giftBox: !!seg.gift, reward, createdAt: serverTimestamp()
      });
      tx.set(doc(collection(db, TRANSACTIONS)), {
        uid, type: "lucky_spin", amount: reward,
        description: seg.gift ? "Lucky Spin Gift Box Reward" : "Lucky Spin Reward",
        status: "completed", createdAt: serverTimestamp()
      });
      tx.set(doc(collection(db, NOTIFICATIONS)), {
        uid, title: "Lucky Spin",
        message: reward > 0 ? `Lucky Spin${seg.gift ? " (Gift Box)" : ""} থেকে আপনি ৳${reward} জিতেছেন!` : "আজকের Lucky Spin-এ এবার কোনো Reward আসেনি, কাল আবার চেষ্টা করুন।",
        type: reward > 0 ? "success" : "info", isRead: false, createdAt: serverTimestamp()
      });
    });
  } catch (err) {
    isSpinning = false;
    syncButtons();
    if (err.message === "ALREADY_SPUN") showDialog("warning", "আজকের Lucky Spin ইতিমধ্যে সম্পন্ন হয়েছে।");
    else showDialog("error", err.message);
    return;
  }

  const wheel = $("spinWheel");
  const center = segIndex * SEG_ANGLE + SEG_ANGLE / 2;
  const base = Math.ceil(wheelRotation / 360) * 360;
  wheelRotation = base + 5 * 360 + (360 - center);
  wheel.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.32, 1.05)";
  wheel.style.transform = `rotate(${wheelRotation}deg)`;

  setTimeout(() => {
    isSpinning = false;
    syncButtons();
    $("spinResult").textContent = reward > 0 ? `🎉 আপনি ৳${reward} জিতেছেন!` : "😔 এবার কোনো Reward আসেনি। কাল আবার চেষ্টা করুন।";
    if (seg.gift) {
      showReward({ gift: true, title: "🎁 Gift Box!", amount: reward, sub: reward > 0 ? "Gift Box থেকে Reward পেয়েছেন।" : "Gift Box-এ এবার কিছু নেই। কাল আবার চেষ্টা করুন।" });
    } else {
      showReward({ icon: reward > 0 ? "🎉" : "😔", title: reward > 0 ? "Congratulations!" : "Better luck tomorrow", amount: reward, sub: reward > 0 ? "Lucky Spin Reward আপনার Wallet-এ যোগ হয়েছে।" : "আগামীকাল আবার চেষ্টা করুন।" });
    }
  }, 4300);
}

/* ---------- 4. PROFILE ---------- */
function upgradeProfile() {
  const card = document.querySelector("#profile .profile-card");
  if (!card || $("profileInfoGrid")) return;
  const details = card.querySelector(".profile-details");
  details.insertAdjacentHTML("afterbegin", `<div class="profile-badges"><span class="pbadge" id="pbStatus">--</span><span class="pbadge pbadge-rank" id="pbRank">--</span></div>`);
  card.insertAdjacentHTML("afterend", `
    <div class="profile-info-grid" id="profileInfoGrid">
      <div class="pinfo"><span class="pinfo-icon">🆔</span><div><small>User ID</small><b id="piUid">--</b></div></div>
      <div class="pinfo"><span class="pinfo-icon">📧</span><div><small>Email / Mobile</small><b id="piContact">--</b></div></div>
      <div class="pinfo"><span class="pinfo-icon">📍</span><div><small>District</small><b id="piDistrict">--</b></div></div>
      <div class="pinfo"><span class="pinfo-icon">🛡️</span><div><small>Account Status</small><b id="piStatus">--</b></div></div>
      <div class="pinfo"><span class="pinfo-icon">📅</span><div><small>Joined</small><b id="piJoined">--</b></div></div>
      <div class="pinfo"><span class="pinfo-icon">🎖️</span><div><small>Current Rank</small><b id="piRank">--</b></div></div>
      <div class="pinfo pinfo-money"><span class="pinfo-icon">👛</span><div><small>Wallet Balance</small><b id="piWallet">--</b></div></div>
      <div class="pinfo pinfo-money"><span class="pinfo-icon">📈</span><div><small>Total Earnings</small><b id="piEarn">--</b></div></div>
    </div>`);
}

function renderProfile(d) {
  if (!$("profileInfoGrid")) return;
  const status = d.isFrozen ? "Frozen" : d.isActive ? "Active" : "Inactive";
  const rank = d.rank || "Starter";
  $("piUid").textContent = d.uid ? `${d.uid.slice(0, 10)}…` : "--";
  $("piUid").title = d.uid || "";
  $("piContact").textContent = d.email || d.phone || "--";
  $("piDistrict").textContent = d.district || "Not Set";
  $("piStatus").textContent = status;
  $("piJoined").textContent = fmtDate(d.createdAt);
  $("piRank").textContent = rank;
  $("piWallet").textContent = money(d.walletBalance);
  $("piEarn").textContent = money(d.totalIncome);
  const pb = $("pbStatus");
  pb.textContent = status === "Active" ? "✅ Active" : status === "Frozen" ? "❄️ Frozen" : "⏳ Inactive";
  pb.className = "pbadge " + (status === "Active" ? "pbadge-ok" : status === "Frozen" ? "pbadge-bad" : "pbadge-warn");
  $("pbRank").textContent = `🎖️ ${rank}`;
}

/* ---------- state sync ---------- */
function syncButtons() {
  if (!userData) return;
  const today = todayStr();
  if (dailyBtn) {
    const claimed = userData.lastLoginBonusDate === today;
    dailyBtn.disabled = claimed;
    const t = $("dailyBtnText");
    if (t) t.textContent = claimed ? "Claimed ✓" : `Claim ৳${DAILY_BONUS}`;
  }
  if (spinBtn && !isSpinning) {
    const spun = userData.lastSpinDate === today;
    spinBtn.disabled = spun;
    const t = $("spinBtnText");
    if (t) t.textContent = spun ? "Spun Today ✓" : "Spin Now";
  }
}

function startListening(user) {
  uid = user.uid;
  if (unsubUser) unsubUser();
  unsubUser = onSnapshot(doc(db, USERS, uid), (snap) => {
    if (!snap.exists()) return;
    userData = snap.data();
    renderProfile(userData);
    syncButtons();
  });
}

function init() {
  upgradeQuickActions();
  upgradeDailyBonus();
  upgradeSpin();
  upgradeProfile();
  onAuthStateChanged(auth, (user) => {
    if (user) startListening(user);
    else {
      if (unsubUser) unsubUser();
      unsubUser = null; uid = null; userData = null;
    }
  });
}

init();
