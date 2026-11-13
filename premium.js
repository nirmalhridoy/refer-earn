import { auth, db, onAuthStateChanged, doc, onSnapshot } from "./firebase.js";

/* Premium layer. It only ADDS / adjusts things; your existing app.js logic is untouched. */

const $ = (id) => document.getElementById(id);
const safe = (name, fn) => { try { fn(); } catch (e) { console.error("premium:", name, e); } };
const money = (n) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} ৳`;
let userData = null;

const style = document.createElement("style");
style.textContent = `
  .pm-hide{display:none!important}

  /* ---- header buttons: Menu / Refresh / Logout / Search (icon on top, label below) ---- */
  .header .container{flex-wrap:wrap}
  .header-actions{flex:1 1 100%}
  #pmHeaderBtns{display:flex;align-items:stretch;gap:10px;margin-left:auto}
  .pm-hbtn,#pmHeaderBtns .quick-nav-trigger{min-width:104px;box-sizing:border-box}
  .pm-hbtn{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;flex:0 0 auto;
    padding:7px 13px 8px;color:var(--secondary,#D4AF37);cursor:pointer;
    background:linear-gradient(145deg,rgba(217,174,81,.22),rgba(217,174,81,.08));
    border:2px solid var(--secondary,#D4AF37);border-radius:12px;
    box-shadow:0 0 0 3px rgba(217,174,81,.1),0 6px 18px rgba(217,174,81,.25);
    transition:transform .15s ease,border-color .15s ease;-webkit-tap-highlight-color:transparent}
  .pm-hbtn:hover{border-color:#fff;transform:translateY(-2px)}
  .pm-hbtn:active{transform:scale(.95)}
  .pm-hb-ico{font-size:33px;line-height:1}
  .pm-hb-lbl{font-size:19.5px;font-weight:700;white-space:nowrap;letter-spacing:.2px}
  .pm-hbtn-danger{color:#fecaca;border-color:#ef4444;
    background:linear-gradient(145deg,rgba(239,68,68,.3),rgba(239,68,68,.1));
    box-shadow:0 0 0 3px rgba(239,68,68,.1),0 6px 18px rgba(239,68,68,.28)}

  /* ---- search ---- */
  .pm-search-overlay{position:fixed;inset:0;z-index:99996;display:flex;justify-content:center;align-items:flex-start;
    padding:90px 16px 16px;background:rgba(3,5,14,.82);backdrop-filter:blur(5px)}
  .pm-search-panel{width:100%;max-width:640px;max-height:80vh;display:flex;flex-direction:column;
    padding:20px;border:3px solid var(--secondary,#D4AF37);border-radius:22px;
    background:linear-gradient(160deg,#17214a,#0b1022);box-shadow:0 20px 60px rgba(0,0,0,.6)}
  .pm-search-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .pm-search-title{font-size:33px;font-weight:700;color:var(--secondary,#D4AF37)}
  #pmSearchInput{width:100%;height:56px;padding:0 16px;margin-bottom:12px;font-size:24px;color:#fff;
    background:rgba(5,8,22,.8);border:3px solid rgba(217,174,81,.5);border-radius:14px;outline:none}
  #pmSearchInput:focus{border-color:var(--secondary,#D4AF37)}
  #pmSearchList{overflow-y:auto;display:flex;flex-direction:column;gap:8px}
  .pm-search-item{display:block;width:100%;text-align:left;padding:14px 16px;font-size:28px;font-weight:700;
    color:var(--text-light,#D6DCEA);background:rgba(255,255,255,.04);border:2px solid transparent;border-radius:12px}
  .pm-search-item:hover,.pm-search-item:active{color:#fff;border-color:var(--secondary,#D4AF37);background:rgba(217,174,81,.12)}
  .pm-search-empty{padding:18px;text-align:center;font-size:26px;color:var(--text-muted,#A9B2C9)}

  /* ---- profile extras ---- */
  .pm-pinfo-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:16px}
  .pm-pinfo{display:flex;align-items:center;gap:12px;min-width:0;padding:16px;border:2px solid rgba(212,175,55,.4);border-radius:18px;background:linear-gradient(145deg,var(--card2,#161F36),var(--bg2,#0C1120));box-shadow:0 8px 20px rgba(0,0,0,.35)}
  .pm-pinfo-ico{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:54px;height:54px;font-size:28px;border-radius:14px;background:rgba(212,175,55,.14);border:2px solid rgba(212,175,55,.45)}
  .pm-pinfo > div{min-width:0}
  .pm-pinfo small{display:block;font-size:22.5px;font-weight:600;color:var(--text-muted,#A9B2C9)}
  .pm-pinfo b{display:block;font-size:28px;line-height:1.3;color:#fff;word-break:break-all}
  .pm-pinfo-gold b{color:var(--secondary,#D4AF37)}
  @media (max-width:560px){.pm-pinfo-grid{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

/* ===== 1. Header: Menu, Refresh, Logout, Search — in the empty space at the top right ===== */
function buildHeader() {
  const container = document.querySelector(".header .container");
  const actions = document.querySelector(".header-actions");
  const trigger = document.querySelector(".quick-nav-trigger");
  const logout = $("logoutBtn");
  const old = $("refreshBtn");
  if (!container || $("pmHeaderBtns")) return;
  if (old) old.classList.add("pm-hide"); // removed from Quick Actions (element kept for its handler)

  const mk = (id, ico, lbl) => {
    const b = document.createElement("button");
    b.type = "button"; b.id = id; b.className = "pm-hbtn";
    b.innerHTML = `<span class="pm-hb-ico">${ico}</span><span class="pm-hb-lbl">${lbl}</span>`;
    return b;
  };
  const group = document.createElement("div");
  group.id = "pmHeaderBtns";
  if (trigger) group.appendChild(trigger);

  const refresh = mk("pmRefreshBtn", "🔄", "Refresh");
  refresh.addEventListener("click", () => { if (old) old.click(); else location.reload(); });
  group.appendChild(refresh);

  if (logout) {
    logout.className = "pm-hbtn pm-hbtn-danger";
    logout.innerHTML = '<span class="pm-hb-ico">🚪</span><span class="pm-hb-lbl">Logout</span>';
    group.appendChild(logout);
  }

  const search = mk("pmSearchBtn", "🔍", "Search");
  search.addEventListener("click", openSearch);
  group.appendChild(search);

  container.insertBefore(group, actions || null);

  const sync = () => { const h = logout ? logout.hidden : false; refresh.hidden = h; search.hidden = h; };
  if (logout) new MutationObserver(sync).observe(logout, { attributes: true, attributeFilter: ["hidden"] });
  sync();
}

/* ===== 2. Extra nav links: "Bonus" -> RANK & BONUS, "Board" -> Leaderboard ===== */
function navLinks() {
  const add = (href, txt, afterHref) => {
    const a0 = document.querySelector(`.nav a[href="${afterHref}"]`);
    if (!a0 || document.querySelector(`.nav a[href="${href}"]`)) return;
    const a = document.createElement("a");
    a.href = href; a.textContent = txt;
    a0.insertAdjacentElement("afterend", a);
  };
  const info = document.querySelector("#rankSection .rank-info-card");
  if (info) {
    info.id = "rankBonus";
    const h = document.querySelector(".header");
    info.style.scrollMarginTop = ((h ? h.offsetHeight : 200) + 20) + "px";
  }
  add("#rankBonus", "Bonus", "#rankSection");
  add("#leaderboard", "Board", "#referralTeam");
}

/* ===== Search: pick where you want to go ===== */
const KEYS = {
  dashboard: "dashboard balance income ড্যাশবোর্ড ব্যালেন্স আয়",
  profile: "profile edit প্রোফাইল",
  referral: "referral link copy রেফারেল লিংক",
  statisticsSection: "statistics stats পরিসংখ্যান",
  referralTeam: "team টিম লেভেল",
  taskHub: "task tasks কাজ টাস্ক",
  dailySpin: "bonus spin lucky daily বোনাস স্পিন",
  rankSection: "rank progress র‍্যাংক",
  rankBonus: "rank bonus র‍্যাংক বোনাস",
  referralContest: "contest কন্টেস্ট",
  walletActivitySection: "wallet activity ওয়ালেট",
  withdraw: "withdraw টাকা তোলা উইথড্র",
  withdrawHistorySection: "withdraw history উইথড্র হিস্টোরি",
  taskHistorySection: "task history approved",
  transactionSection: "transaction লেনদেন",
  notifications: "notification নোটিফিকেশন",
  leaderboard: "leaderboard board লিডারবোর্ড",
  support: "support help সাপোর্ট সাহায্য",
  rejectedTaskSection: "rejected reject বাতিল",
  activityListSection: "recent activity",
  accountStatusSection: "account status",
  activation: "activation অ্যাক্টিভেশন active",
  commission: "commission কমিশন level",
  referralHistorySection: "referral history",
  broadcast: "broadcast",
  contact: "contact যোগাযোগ",
  faq: "faq প্রশ্ন"
};
function searchItems() {
  const items = [];
  document.querySelectorAll(".quick-nav-link").forEach((a) => {
    items.push({ target: a.dataset.target, title: a.textContent.trim().replace(/^[\d-]+\.\s*/, "") });
  });
  [["commission", "💰 Referral Commission"], ["rankBonus", "🎖️ Rank & Bonus"], ["referralHistorySection", "📜 Referral History"],
   ["broadcast", "📢 Broadcast"], ["contact", "📞 Contact"], ["faq", "❓ FAQ"]]
    .forEach(([t, title]) => { if (!items.some((i) => i.target === t)) items.push({ target: t, title }); });
  return items;
}
function renderSearch(q) {
  const list = $("pmSearchList");
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const res = searchItems().filter((i) => {
    const hay = (i.title + " " + (KEYS[i.target] || "")).toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
  list.innerHTML = res.length
    ? res.map((i) => `<button type="button" class="pm-search-item" data-t="${i.target}">${i.title.replace(/</g, "&lt;")}</button>`).join("")
    : `<div class="pm-search-empty">কিছু পাওয়া যায়নি। অন্য শব্দ লিখুন।</div>`;
}
function closeSearch() { const o = $("pmSearchOverlay"); if (o) o.classList.add("pm-hide"); }
function openSearch() {
  let o = $("pmSearchOverlay");
  if (!o) {
    o = document.createElement("div");
    o.id = "pmSearchOverlay";
    o.className = "pm-search-overlay pm-hide";
    o.innerHTML = `<div class="pm-search-panel">
      <div class="pm-search-head"><div class="pm-search-title">🔍 Search</div><button type="button" class="close-btn" id="pmSearchClose">✕</button></div>
      <input id="pmSearchInput" type="text" placeholder="কোথায় যেতে চান? (যেমন: withdraw, task, bonus)" autocomplete="off">
      <div id="pmSearchList"></div></div>`;
    document.body.appendChild(o);
    o.addEventListener("click", (e) => { if (e.target === o) closeSearch(); });
    $("pmSearchClose").addEventListener("click", closeSearch);
    $("pmSearchInput").addEventListener("input", (e) => renderSearch(e.target.value));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSearch(); });
    $("pmSearchList").addEventListener("click", (e) => {
      const b = e.target.closest(".pm-search-item");
      if (!b) return;
      const el = document.getElementById(b.dataset.t);
      closeSearch();
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    });
  }
  $("pmSearchInput").value = "";
  renderSearch("");
  o.classList.remove("pm-hide");
  setTimeout(() => $("pmSearchInput").focus(), 60);
}

/* ===== 3. Lamp switch while logged in: only the light turns on/off, no form ===== */
function lampGuard() {
  const handle = (e) => {
    const b = e.target.closest && e.target.closest("#lampChainBtn");
    if (!b || !auth.currentUser) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const chain = $("lampChain"), stage = $("lampStage"), card = $("authCard");
    if (chain && !chain.classList.contains("chain-pulling")) {
      chain.classList.add("chain-pulling");
      setTimeout(() => chain.classList.remove("chain-pulling"), 600);
    }
    if (stage) stage.classList.toggle("lamp-on");
    if (card) card.hidden = true;
  };
  document.addEventListener("click", handle, true);
  document.addEventListener("keydown", handle, true);
}

/* ===== My Profile: details that were missing (real data from your database) ===== */
function profileExtras() {
  const sec = $("profile");
  if (!sec || $("pmProfileExtras")) return;
  const box = sec.querySelector(".container") || sec;
  box.insertAdjacentHTML("beforeend", `
    <div class="pm-pinfo-grid" id="pmProfileExtras">
      <div class="pm-pinfo" id="pmUidCard" style="cursor:pointer" title="Tap to copy"><span class="pm-pinfo-ico">🆔</span><div><small id="pmUidLabel">User ID (tap to copy)</small><b id="pmUid">--</b></div></div>
      <div class="pm-pinfo"><span class="pm-pinfo-ico">🎖️</span><div><small>Current Rank</small><b id="pmRank">--</b></div></div>
      <div class="pm-pinfo pm-pinfo-gold"><span class="pm-pinfo-ico">👛</span><div><small>Wallet Balance</small><b id="pmWallet">--</b></div></div>
      <div class="pm-pinfo pm-pinfo-gold"><span class="pm-pinfo-ico">📈</span><div><small>Total Earnings</small><b id="pmEarn">--</b></div></div>
    </div>`);
  $("pmUidCard").addEventListener("click", async () => {
    if (!userData || !userData.uid) return;
    try { await navigator.clipboard.writeText(userData.uid); } catch {}
    const l = $("pmUidLabel");
    l.textContent = "Copied ✓";
    setTimeout(() => { l.textContent = "User ID (tap to copy)"; }, 1300);
  });
}
function renderExtras(d) {
  if (!$("pmProfileExtras")) return;
  $("pmUid").textContent = d.uid || "--";
  $("pmRank").textContent = d.rank || "Starter";
  $("pmWallet").textContent = money(d.walletBalance);
  $("pmEarn").textContent = money(d.totalIncome);
}

/* ===== 6. Lucky Spin: inactive accounts CAN spin now; only frozen accounts are blocked ===== */
function spinGuard() {
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("#spinBtn");
    if (!b || !userData || !userData.isFrozen) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const m = $("warningMessage"), d = $("warningDialog");
    if (m && d) { m.textContent = "আপনার Account Frozen করা আছে।"; d.classList.remove("hidden"); }
  }, true);
}

/* Red debug box: only the false "app.js did not finish loading" warning is removed.
   A real "[JS Error]" box is never removed. */
let firebaseAnswered = false;
function dropFalseAlarm() {
  if (!firebaseAnswered) return;
  Array.from(document.body.children).forEach((el) => {
    const t = el.textContent || "";
    if (t.includes("সাইটে একটা Error ধরা পড়েছে") && t.includes("[সতর্কতা]") && !t.includes("[JS Error]")) el.remove();
  });
}
let alarmRaf = 0;
function watchAlarm() {
  new MutationObserver(() => {
    if (alarmRaf) return;
    alarmRaf = requestAnimationFrame(() => { alarmRaf = 0; dropFalseAlarm(); });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
}

function init() {
  safe("header", buildHeader);
  safe("navLinks", navLinks);
  safe("profile", profileExtras);
  safe("lamp", lampGuard);
  safe("spinGuard", spinGuard);
  safe("alarm", watchAlarm);
  onAuthStateChanged(auth, (user) => {
    firebaseAnswered = true;
    dropFalseAlarm();
    if (user) {
      onSnapshot(doc(db, "users", user.uid), (snap) => {
        if (!snap.exists()) return;
        userData = snap.data();
        renderExtras(userData);
      });
    } else {
      userData = null;
    }
  });
}
init();

/* Other parts load AFTER the page is ready, each separately. */
function bootRest() {
  ["./premium2.js", "./premium3.js", "./premium4.js"].forEach((f) =>
    import(f).catch((e) => console.error(f, e)));
}
if (document.readyState === "complete") setTimeout(bootRest, 150);
else window.addEventListener("load", () => setTimeout(bootRest, 150));
