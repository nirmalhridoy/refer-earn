import {
  auth, db, onAuthStateChanged, doc, onSnapshot, collection, query, where, getDocs,
  USERS, TRANSACTIONS, RANK_LEVELS, WITHDRAW_REQUIRED_APPROVED_TASKS
} from "./firebase.js";

/* Premium part 4 — income cards, rank cards in Statistics, Account Status colours,
   Withdrawal form (always visible, submit only when eligible). */

const $ = (id) => document.getElementById(id);
const safe = (name, fn) => { try { fn(); } catch (e) { console.error("premium4:", name, e); } };
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} ৳`;

const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "premium4.css";
document.head.appendChild(css);

let uid = null;
let userData = null;
let activeRefs = 0;
let unsubUser = null;

/* ---------- 4. Dashboard: Active Income & Passive Income ---------- */
const ACTIVE_TYPES = ["task_reward", "daily_login_bonus", "lucky_spin"];
const PASSIVE_TYPES = ["referral_bonus", "rank_bonus"];

function addIncomeCards() {
  const grid = document.querySelector("#dashboard .dashboard-grid");
  if (!grid || $("pmActiveIncome")) return;
  const html = `
    <div class="card pm-income-card pm-income-active"><h3>🧑‍💻 Active Income</h3><h2 id="pmActiveIncome">0 ৳</h2><p class="pm-card-note">Task + Daily Bonus + Spin</p></div>
    <div class="card pm-income-card pm-income-passive"><h3>🌐 Passive Income</h3><h2 id="pmPassiveIncome">0 ৳</h2><p class="pm-card-note">Commission + Rank Bonus</p></div>`;
  const after = $("dashBonusEarnings") && $("dashBonusEarnings").closest(".card");
  if (after) after.insertAdjacentHTML("afterend", html);
  else grid.insertAdjacentHTML("beforeend", html);
}

async function computeIncome() {
  if (!uid) return;
  let active = 0, passive = 0;
  try {
    const m = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
    const one = async (types) => {
      const s = await m.getAggregateFromServer(
        query(collection(db, TRANSACTIONS), where("uid", "==", uid), where("type", "in", types)),
        { t: m.sum("amount") });
      return Number(s.data().t) || 0;
    };
    [active, passive] = await Promise.all([one(ACTIVE_TYPES), one(PASSIVE_TYPES)]);
  } catch {
    try {
      const s = await getDocs(query(collection(db, TRANSACTIONS), where("uid", "==", uid)));
      s.forEach((d) => {
        const x = d.data(); const a = Number(x.amount) || 0;
        if (a <= 0) return;
        if (ACTIVE_TYPES.includes(x.type)) active += a;
        else if (PASSIVE_TYPES.includes(x.type)) passive += a;
      });
    } catch (e) { console.error("income:", e); return; }
  }
  if ($("pmActiveIncome")) $("pmActiveIncome").textContent = fmt(active);
  if ($("pmPassiveIncome")) $("pmPassiveIncome").textContent = fmt(passive);
}
let incomeTimer = null, lastTotal = null;
function scheduleIncome(total) {
  if (total === lastTotal) return;
  lastTotal = total;
  clearTimeout(incomeTimer);
  incomeTimer = setTimeout(computeIncome, 600);
}

/* ---------- 5. Statistics: Rank Progress & Next Rank Progress ---------- */
function rankInfo(n) {
  let idx = 0;
  RANK_LEVELS.forEach((r, i) => { if (n >= r.minReferrals) idx = i; });
  const current = RANK_LEVELS[idx];
  const next = RANK_LEVELS[idx + 1] || null;
  const percent = next ? Math.min(100, Math.round(((n - current.minReferrals) / (next.minReferrals - current.minReferrals)) * 100)) : 100;
  return { current, next, percent };
}
function addStatCards() {
  const grid = document.querySelector("#statisticsSection .stats-grid");
  if (!grid || $("pmStatRank")) return;
  grid.insertAdjacentHTML("beforeend", `
    <div class="stat-card pm-stat-rank"><h3>🎖️ Rank Progress</h3><h2 id="pmStatRank">--</h2><p class="pm-card-note" id="pmStatRankBonus">--</p></div>
    <div class="stat-card pm-stat-next"><h3>🚀 Next Rank Progress</h3><h2 id="pmStatNext">--</h2><p class="pm-card-note" id="pmStatNextNote">--</p>
      <div class="progress pm-mini"><div id="pmStatNextBar" class="progress-bar" style="width:0%">0%</div></div></div>`);
  const src = $("statActiveReferrals");
  if (src) {
    const read = () => { activeRefs = Number(src.textContent) || 0; renderStatCards(); };
    new MutationObserver(read).observe(src, { childList: true, characterData: true, subtree: true });
    read();
  }
}
function renderStatCards() {
  if (!$("pmStatRank")) return;
  const { current, next, percent } = rankInfo(activeRefs);
  $("pmStatRank").textContent = current.name;
  $("pmStatRankBonus").textContent = `Bonus ৳${Number(current.bonus).toLocaleString("en-US")}`;
  if (next) {
    $("pmStatNext").textContent = next.name;
    $("pmStatNextNote").textContent = `আরও ${next.minReferrals - activeRefs}টি Active Referral • Bonus ৳${Number(next.bonus).toLocaleString("en-US")}`;
  } else {
    $("pmStatNext").textContent = "Max Rank 🏆";
    $("pmStatNextNote").textContent = "আপনি সর্বোচ্চ Rank-এ আছেন";
  }
  const bar = $("pmStatNextBar");
  bar.style.width = percent + "%";
  bar.textContent = percent + "%";
}

/* ---------- 7. Account Status: colour by state ---------- */
function statusColours() {
  const el = $("accountStatus");
  if (!el) return;
  const set = () => {
    const t = (el.textContent || "").toLowerCase();
    const s = t.includes("frozen") ? "frozen" : t.includes("pending") ? "pending" : t.includes("inactive") ? "inactive" : t.includes("active") ? "active" : "";
    if (el.dataset.s !== s) el.dataset.s = s;
  };
  new MutationObserver(set).observe(el, { childList: true, characterData: true, subtree: true });
  set();
}

/* ---------- 10. Withdrawal: form always visible, submit only when eligible ---------- */
const NEED_BALANCE = 350;
const NEED_REF = 3;

function unmet() {
  const d = userData || {};
  const out = [];
  const bal = Number(d.walletBalance) || 0;
  const tasks = Number(d.cycleTaskCount) || 0;
  const refs = Number(d.withdrawableReferralCount) || 0;
  if (bal < NEED_BALANCE) out.push(`Wallet Balance: ৳${bal} / ৳${NEED_BALANCE}`);
  if (tasks < WITHDRAW_REQUIRED_APPROVED_TASKS) out.push(`New Task: ${tasks} / ${WITHDRAW_REQUIRED_APPROVED_TASKS}`);
  if (refs < NEED_REF) out.push(`New Active Referral: ${refs} / ${NEED_REF}`);
  if (d.isFrozen) out.push("আপনার Account Frozen করা আছে");
  else if (!d.isActive) out.push("Account Active নয় — আগে Account Activation করুন");
  return out;
}

function renderWdNotice() {
  const box = $("pmWdNotice");
  const btn = $("withdrawBtn");
  if (!box) return;
  if (!userData) { box.className = "pm-wd-notice"; box.innerHTML = ""; return; }
  const miss = unmet();
  if (miss.length) {
    box.className = "pm-wd-notice bad";
    box.innerHTML = `<b>🔒 এখনো Withdraw করা যাবে না — এই শর্তগুলো বাকি আছে:</b><ul>${miss.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>`;
  } else {
    box.className = "pm-wd-notice ok";
    box.innerHTML = "<b>✅ অভিনন্দন! আপনি এখন Withdraw করার জন্য যোগ্য।</b>";
  }
  if (btn) btn.classList.toggle("pm-wd-locked", miss.length > 0);
}

function mountWithdraw() {
  const card = $("withdrawFormCard");
  if (!card || $("pmWdNotice")) return;
  card.classList.add("pay-form-card", "pm-wd-card");
  const keep = () => { if (card.classList.contains("hidden")) card.classList.remove("hidden"); };
  new MutationObserver(keep).observe(card, { attributes: true, attributeFilter: ["class"] });
  keep();

  card.insertAdjacentHTML("afterbegin", '<div class="pay-title">💸 Withdraw Request</div>');
  const cond = card.querySelector(".withdraw-condition-box");
  if (cond) cond.insertAdjacentHTML("afterend", '<div id="pmWdNotice" class="pm-wd-notice"></div>');

  const sel = $("withdrawMethod");
  const num = $("withdrawNumber");
  if (sel) {
    const grp = sel.closest(".form-group");
    grp.classList.add("pm-hide");
    const logo = (m) => `<span class="pay-logo ${m === "Nagad" ? "pm-nagad" : "pm-bkash"}"><img src="assets/brands/${m === "Nagad" ? "nagad" : "bkash"}.png" alt="${m}" loading="lazy" onerror="this.remove()"><b>${m.charAt(0)}</b></span>`;
    grp.insertAdjacentHTML("beforebegin", `
      <div class="pay-label">Payment Method</div>
      <div class="pay-methods" id="pmWdMethods">
        <button type="button" class="pay-method" data-m="Nagad">${logo("Nagad")}<span class="pay-m-text"><b>Nagad</b><small>Withdraw</small></span><i class="pay-check">✓</i></button>
        <button type="button" class="pay-method" data-m="bKash">${logo("bKash")}<span class="pay-m-text"><b>bKash</b><small>Withdraw</small></span><i class="pay-check">✓</i></button>
      </div>`);
    const syncM = () => document.querySelectorAll("#pmWdMethods .pay-method").forEach((b) => b.classList.toggle("pay-method-on", b.dataset.m === sel.value));
    if ([...sel.options].some((o) => o.value === "Nagad")) sel.value = "Nagad";
    document.querySelectorAll("#pmWdMethods .pay-method").forEach((b) => b.addEventListener("click", () => {
      sel.value = b.dataset.m;
      sel.dispatchEvent(new Event("change", { bubbles: true }));
      syncM();
    }));
    syncM();
    [300, 1500].forEach((t) => setTimeout(syncM, t));
  }
  if (num) { num.setAttribute("inputmode", "numeric"); num.setAttribute("maxlength", "11"); num.setAttribute("autocomplete", "tel"); }

  const btn = $("withdrawBtn");
  if (btn) {
    btn.classList.add("pay-submit");
    btn.innerHTML = `<span class="pay-btn-label">💸 ${esc(btn.textContent.trim())}</span>`;
  }

  // Not eligible -> don't submit; show exactly what is missing.
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("#withdrawBtn");
    if (!b || !userData) return;
    const miss = unmet();
    if (!miss.length) return; // eligible: your existing withdraw logic runs as before
    e.preventDefault();
    e.stopImmediatePropagation();
    renderWdNotice();
    const m = $("warningMessage"), d = $("warningDialog");
    if (m && d) {
      m.style.whiteSpace = "pre-line";
      m.textContent = "Withdraw করা যাচ্ছে না। এই শর্তগুলো পূরণ করুন:\n\n• " + miss.join("\n• ");
      d.classList.remove("hidden");
    }
  }, true);
  renderWdNotice();
}

/* ---------- lifecycle ---------- */
function init() {
  onAuthStateChanged(auth, (user) => {
    if (unsubUser) { unsubUser(); unsubUser = null; }
    if (user) {
      uid = user.uid;
      unsubUser = onSnapshot(doc(db, USERS, uid), (s) => {
        if (!s.exists()) return;
        userData = s.data();
        scheduleIncome(userData.totalIncome);
        renderWdNotice();
      });
    } else {
      uid = null; userData = null; lastTotal = null;
    }
  });
  safe("incomeCards", addIncomeCards);
  safe("statCards", addStatCards);
  safe("statusColours", statusColours);
  safe("withdraw", mountWithdraw);
}
init();
