import { auth, db, onAuthStateChanged, doc, onSnapshot } from "./firebase.js";

/* Premium layer (slim). It only ADDS things; it does not replace your existing
   Daily Bonus / Lucky Spin / Quick Action / Profile designs. */

const $ = (id) => document.getElementById(id);
const safe = (name, fn) => { try { fn(); } catch (e) { console.error("premium:", name, e); } };
const money = (n) => `${Math.round(Number(n) || 0).toLocaleString("en-US")} ৳`;
let userData = null;

const style = document.createElement("style");
style.textContent = `
  .pm-hide{display:none!important}
  #pmTopActions{position:absolute;top:20px;right:20px;z-index:10;display:flex;align-items:center;gap:10px}
  #pmTopActions .lamp-logout-btn{position:static}
  #pmRefreshBtn{border:2px solid var(--secondary,#D4AF37)}
  .quick-actions .action-grid{grid-template-columns:repeat(3,1fr)}
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

/* 1. Refresh button: moved next to Logout (left side), removed from Quick Actions */
function moveRefresh() {
  const logout = $("logoutBtn");
  const old = $("refreshBtn");
  if (old) old.classList.add("pm-hide");
  if (!logout || $("pmTopActions")) return;
  const wrap = document.createElement("div");
  wrap.id = "pmTopActions";
  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "pmRefreshBtn";
  btn.className = "btn btn-secondary";
  btn.textContent = "🔄 Refresh";
  btn.addEventListener("click", () => {
    if (old) old.click(); // existing handler: toast + reload
    else location.reload();
  });
  logout.parentNode.insertBefore(wrap, logout);
  wrap.appendChild(btn);
  wrap.appendChild(logout);
  const sync = () => { btn.hidden = logout.hidden; };
  new MutationObserver(sync).observe(logout, { attributes: true, attributeFilter: ["hidden"] });
  sync();
}

/* 3. My Profile: add the details that were missing (real data from your database) */
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

/* 2. Lucky Spin: inactive/frozen accounts get a clear message instead of a raw permission error */
function spinGuard() {
  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("#spinBtn");
    if (!b || !userData) return;
    const msg = userData.isFrozen ? "আপনার Account Frozen করা আছে।"
      : !userData.isActive ? "Lucky Spin করতে আপনার Account Active থাকতে হবে। আগে Account Activation করুন।" : null;
    if (!msg) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const m = $("warningMessage"), d = $("warningDialog");
    if (m && d) { m.textContent = msg; d.classList.remove("hidden"); }
  }, true);
}

function init() {
  safe("refresh", moveRefresh);
  safe("profile", profileExtras);
  safe("spinGuard", spinGuard);
  onAuthStateChanged(auth, (user) => {
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

/* Load the other parts AFTER the page is ready, each one separately,
   so the main site opens faster and one failing part can never stop the rest. */
function bootRest() {
  import("./premium2.js").catch((e) => console.error("premium2:", e));
  import("./premium3.js").catch((e) => console.error("premium3:", e));
}
if (document.readyState === "complete") setTimeout(bootRest, 150);
else window.addEventListener("load", () => setTimeout(bootRest, 150));
