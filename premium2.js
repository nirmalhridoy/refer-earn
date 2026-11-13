import {
  auth, db, onAuthStateChanged,
  doc, collection, query, where, orderBy, limit, onSnapshot, runTransaction, serverTimestamp,
  USERS, ACTIVATIONS, RANK_LEVELS, LEVEL_COMMISSIONS, TASK_PLATFORMS
} from "./firebase.js";

/* Premium upgrade, part 2 — imported by premium.js. Existing app.js code is untouched. */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => `৳${Math.round(Number(n) || 0).toLocaleString("en-US")}`;
const hide = (el) => el && el.classList.add("pm-hide");

const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "premium2.css";
document.head.appendChild(css);

let uid = null;
let userData = null;
let unsubs = [];

/* =============== RANK STYLES (names/thresholds/bonuses come from RANK_LEVELS) =============== */
const RANK_STYLE = {
  Starter: { c1: "#CBD5E1", c2: "#64748B", icon: "🌱" },
  Bronze: { c1: "#F0B27A", c2: "#8B5A2B", icon: "🥉" },
  Silver: { c1: "#F1F5F9", c2: "#8B95A5", icon: "🥈" },
  Gold: { c1: "#FFE27A", c2: "#C9961A", icon: "🥇" },
  Platinum: { c1: "#E0F2FE", c2: "#6FB1D3", icon: "💠" },
  Diamond: { c1: "#A5F3FC", c2: "#2563EB", icon: "💎" },
  Master: { c1: "#E9D5FF", c2: "#7E22CE", icon: "👑" },
  Grandmaster: { c1: "#FCA5A5", c2: "#B91C1C", icon: "🏅" },
  Elite: { c1: "#FDE047", c2: "#A16207", icon: "⚡" },
  Champion: { c1: "#FDBA74", c2: "#C2410C", icon: "🏆" },
  Legend: { c1: "#FB923C", c2: "#9A3412", icon: "🔥" },
  Mythic: { c1: "#C4B5FD", c2: "#4338CA", icon: "🌌" },
  Supreme: { c1: "#F9A8D4", c2: "#BE185D", icon: "🌟" },
  Immortal: { c1: "#D1D5DB", c2: "#111827", icon: "♛" },
  Conqueror: { c1: "#86EFAC", c2: "#15803D", icon: "⚔️" },
  Ultimate: { c1: "#FFF3C4", c2: "#D4AF37", icon: "👑" }
};
const rs = (name) => RANK_STYLE[name] || RANK_STYLE.Starter;
function rankBadge(name, cls = "") {
  const s = rs(name);
  return `<span class="rk-badge ${cls}" style="--c1:${s.c1};--c2:${s.c2}">${s.icon}</span>`;
}
function rankChip(name) {
  const s = rs(name);
  return `<span class="rk-chip" style="--c1:${s.c1};--c2:${s.c2}">${s.icon} ${esc(name)}</span>`;
}

/* =============== 5. LEADERBOARDS =============== */
function avatar(u, extra = "") {
  const initial = esc(((u.name || "?").trim().charAt(0) || "?").toUpperCase());
  if (u.photoURL) {
    return `<img class="lb-avatar ${extra}" src="${esc(u.photoURL)}" alt="" loading="lazy" data-i="${initial}" onerror="this.outerHTML='<span class=&quot;lb-avatar lb-avatar-ph ${extra}&quot;>'+this.dataset.i+'</span>'">`;
  }
  return `<span class="lb-avatar lb-avatar-ph ${extra}">${initial}</span>`;
}
const userCode = (u) => u.referralCode || (u.uid ? u.uid.slice(0, 8) : "--");

function liveBar(text) {
  return `<div class="lb-live-bar"><span><i class="lb-dot"></i>Live · real-time</span><span>${text}</span></div>`;
}

function renderLive(el, docs) {
  if (!docs.length) { el.innerHTML = `<div class="lb-empty">🏆 এখনো কোনো ডেটা নেই।</div>`; return; }
  const top = docs.slice(0, 3);
  const medal = ["🥇", "🥈", "🥉"];
  const podium = top.map((u, i) => `
    <div class="lb-top lb-p${i + 1} ${u.uid === uid ? "lb-me" : ""}">
      <div class="lb-top-rank">${medal[i]}<b>#${i + 1}</b></div>
      ${avatar(u, "lb-avatar-lg")}
      <div class="lb-name">${esc(u.name || "User")}${u.uid === uid ? " (You)" : ""}</div>
      <div class="lb-id">ID: ${esc(userCode(u))}</div>
      ${rankChip(u.rank || "Starter")}
      <div class="lb-score"><b>${Number(u.contestReferralCount) || 0}</b><small>Contest Referrals</small></div>
    </div>`).join("");
  const rest = docs.slice(3).map((u, i) => `
    <div class="lb-row ${u.uid === uid ? "lb-me" : ""}">
      <span class="lb-pos">#${i + 4}</span>
      ${avatar(u)}
      <div class="lb-info"><div class="lb-name">${esc(u.name || "User")}${u.uid === uid ? " (You)" : ""}</div><div class="lb-id">ID: ${esc(userCode(u))}</div></div>
      <div class="lb-score-sm"><b>${Number(u.contestReferralCount) || 0}</b><small>Referrals</small></div>
    </div>`).join("");
  el.innerHTML = liveBar(`Updated ${new Date().toLocaleTimeString()}`) +
    `<div class="lb-podium">${podium}</div><div class="lb-list">${rest}</div>`;
}

function renderGeneral(el, docs) {
  if (!docs.length) { el.innerHTML = `<div class="lb-empty">🏆 এখনো কোনো ডেটা নেই।</div>`; return; }
  const medal = ["🥇", "🥈", "🥉"];
  const rows = docs.map((u, i) => `
    <tr class="${i < 3 ? "lb-t" + (i + 1) : ""} ${u.uid === uid ? "lb-me" : ""}">
      <td class="lb-td-pos">${i < 3 ? medal[i] : ""}<b>#${i + 1}</b></td>
      <td><div class="lb-user">${avatar(u)}<div class="lb-info"><div class="lb-name">${esc(u.name || "User")}${u.uid === uid ? " (You)" : ""}</div><div class="lb-id">ID: ${esc(userCode(u))}</div></div></div></td>
      <td>${rankChip(u.rank || "Starter")}</td>
      <td><b>${Number(u.activeReferralCount) || 0}</b></td>
      <td class="lb-money">${money(u.totalIncome)}</td>
    </tr>`).join("");
  el.innerHTML = liveBar(`Ranked by Active Referrals · ${new Date().toLocaleTimeString()}`) + `
    <div class="table-responsive"><table class="table lb-table">
      <thead><tr><th>Position</th><th>User</th><th>Rank</th><th>Active Referrals</th><th>Total Earnings</th></tr></thead>
      <tbody>${rows}</tbody></table></div>`;
}

function mountLeaderboards() {
  const liveTbody = $("contestLeaderboardTable");
  if (liveTbody) {
    const wrap = liveTbody.closest(".table-responsive");
    hide(wrap);
    const box = document.createElement("div");
    box.id = "pmLiveLb";
    box.innerHTML = `<div class="lb-empty">Loading…</div>`;
    wrap.insertAdjacentElement("afterend", box);
  }
  const genTbody = $("leaderboardTable");
  if (genTbody) {
    const wrap = genTbody.closest(".table-responsive");
    hide(wrap);
    const box = document.createElement("div");
    box.id = "pmGenLb";
    box.innerHTML = `<div class="lb-empty">Loading…</div>`;
    wrap.insertAdjacentElement("afterend", box);
  }
}

function attachLeaderboards() {
  unsubs.push(onSnapshot(query(collection(db, USERS), orderBy("contestReferralCount", "desc"), limit(10)), (snap) => {
    const docs = []; snap.forEach((d) => docs.push(d.data()));
    const el = $("pmLiveLb"); if (el) renderLive(el, docs);
  }));
  unsubs.push(onSnapshot(query(collection(db, USERS), orderBy("activeReferralCount", "desc"), limit(10)), (snap) => {
    const docs = []; snap.forEach((d) => docs.push(d.data()));
    const el = $("pmGenLb"); if (el) renderGeneral(el, docs);
  }));
}

/* =============== 6. RANK PROGRESS  +  RANK & BONUS =============== */
let activeRefs = 0;
let refsLoaded = false;

function rankInfo(n) {
  let idx = 0;
  RANK_LEVELS.forEach((r, i) => { if (n >= r.minReferrals) idx = i; });
  const current = RANK_LEVELS[idx];
  const next = RANK_LEVELS[idx + 1] || null;
  const percent = next ? Math.min(100, Math.round(((n - current.minReferrals) / (next.minReferrals - current.minReferrals)) * 100)) : 100;
  return { idx, current, next, percent };
}

function mountRank() {
  const first = document.querySelector("#rankSection .card");
  if (first && !$("pmRankPanel")) {
    hide(first);
    const p = document.createElement("div");
    p.id = "pmRankPanel";
    first.insertAdjacentElement("beforebegin", p);
  }
  const info = document.querySelector("#rankSection .rank-info-card");
  if (info && !$("pmRankGrid")) {
    const wrap = info.querySelector(".table-responsive");
    hide(wrap);
    const g = document.createElement("div");
    g.id = "pmRankGrid";
    g.className = "rb-grid";
    wrap.insertAdjacentElement("afterend", g);
    info.classList.add("rb-section");
  }
  const src = $("statActiveReferrals");
  if (src) {
    const read = () => { activeRefs = Number(src.textContent) || 0; refsLoaded = true; renderRank(); };
    new MutationObserver(read).observe(src, { childList: true, characterData: true, subtree: true });
  }
  renderRank();
}

function renderRank() {
  const panel = $("pmRankPanel");
  if (!panel) return;
  const { idx, current, next, percent } = rankInfo(activeRefs);
  const cs = rs(current.name);
  const ns = next ? rs(next.name) : cs;
  const remaining = next ? next.minReferrals - activeRefs : 0;
  panel.innerHTML = `
    <div class="rp-card" style="--c1:${cs.c1};--c2:${cs.c2};--n1:${ns.c1};--n2:${ns.c2}">
      <div class="rp-head">
        ${rankBadge(current.name, "rk-xl")}
        <div class="rp-head-text"><small>Current Rank</small><h2>${esc(current.name)}</h2><span>Active Referrals: <b>${activeRefs}</b></span></div>
        <div class="rp-percent">${percent}%</div>
      </div>
      <div class="rp-bar"><div class="rp-fill" style="width:0%" data-w="${percent}"><i></i></div></div>
      ${next ? `
      <div class="rp-next">
        ${rankBadge(next.name, "rk-md")}
        <div class="rp-next-info">
          <small>Next Rank</small><b>${esc(next.name)}</b>
          <span>আরও <b>${remaining}</b>টি Active Referral লাগবে (Target: ${next.minReferrals})</span>
        </div>
        <div class="rp-bonus"><small>Bonus</small><b>${money(next.bonus)}</b></div>
      </div>` : `<div class="rp-max">🏆 অভিনন্দন! আপনি সর্বোচ্চ Rank <b>${esc(current.name)}</b>-এ পৌঁছে গেছেন।</div>`}
      <p class="rp-note">Rank শুধুমাত্র Active Referral সংখ্যা অনুযায়ী Automatic নির্ধারিত হয়।</p>
    </div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const f = panel.querySelector(".rp-fill");
    if (f) f.style.width = f.dataset.w + "%";
  }));

  const grid = $("pmRankGrid");
  if (grid) {
    grid.innerHTML = RANK_LEVELS.map((r, i) => {
      const s = rs(r.name);
      const state = i < idx ? "done" : i === idx ? "current" : "locked";
      return `<div class="rb-card rb-${state}" style="--c1:${s.c1};--c2:${s.c2}">
        ${state === "current" ? `<span class="rb-tag">YOUR RANK</span>` : state === "done" ? `<span class="rb-tag rb-tag-done">✓ Achieved</span>` : `<span class="rb-tag rb-tag-lock">🔒 Locked</span>`}
        ${rankBadge(r.name, "rk-lg")}
        <h4>${esc(r.name)}</h4>
        <div class="rb-req">${r.minReferrals} Active Referral</div>
        <div class="rb-bonus"><small>Bonus</small><b>${money(r.bonus)}</b></div>
      </div>`;
    }).join("");
  }
  checkRankUp(idx, current);
}

function checkRankUp(idx, current) {
  if (!uid || !refsLoaded) return;
  const key = `pm_rank_idx2_${uid}`;
  let stored = null;
  try { stored = localStorage.getItem(key); } catch {}
  const storedIdx = stored === null ? null : parseInt(stored, 10);
  if (storedIdx === null || idx > storedIdx) {
    try { localStorage.setItem(key, String(idx)); } catch {}
    if (storedIdx !== null && idx > storedIdx) rankUpPopup(current);
  }
}

function rankUpPopup(r) {
  const old = $("pmRankUp"); if (old) old.remove();
  const s = rs(r.name);
  const ov = document.createElement("div");
  ov.id = "pmRankUp";
  ov.className = "reward-overlay";
  const conf = Array.from({ length: 20 }, (_, i) => `<i style="left:${(i * 5 + 3) % 100}%;animation-delay:${(i % 7) / 10}s;background:${[s.c1, s.c2, "#D4AF37", "#fff"][i % 4]}"></i>`).join("");
  ov.innerHTML = `<div class="reward-confetti">${conf}</div>
    <div class="reward-card">
      ${rankBadge(r.name, "rk-xl rk-pop")}
      <h3>🎉 Rank Up!</h3>
      <div class="reward-amount" style="font-size:52px">${esc(r.name)}</div>
      <p class="reward-sub">আপনি ${esc(r.name)} Rank অর্জন করেছেন${r.bonus > 0 ? ` — Bonus ${money(r.bonus)}` : ""}।</p>
      <button type="button" class="reward-close">OK</button>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector(".reward-close").addEventListener("click", () => ov.remove());
}

/* =============== 7. TASK HUB LOGOS =============== */
// Official logos are loaded from assets/brands/<key>.png (see README note). Until a file
// is added, a plain brand-coloured tile with the first letter is shown as a placeholder.
const BRAND_KEYS = ["facebook", "youtube", "instagram", "tiktok", "telegram"];
const SVG = {
  website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  survey: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 3h6v3H9zM9 14l2 2 4-4"/>',
  dataentry: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
  ai: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/><circle cx="12" cy="12" r="1.6"/>'
};
const platByKey = (k) => TASK_PLATFORMS.find((p) => p.key === k);

function logoHtml(key, size) {
  const p = platByKey(key) || { label: key, color: "#3B82F6" };
  if (BRAND_KEYS.includes(key)) {
    return `<span class="tl-logo tl-brand tl-${size}" style="--brand:${p.color}"><img src="assets/brands/${key}.png" alt="${esc(p.label)}" loading="lazy" onerror="this.parentNode.classList.add('tl-missing');this.remove()"><b>${esc(p.label.charAt(0))}</b></span>`;
  }
  return `<span class="tl-logo tl-gen tl-${size}" style="--brand:${p.color}"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${SVG[key] || SVG.website}</svg></span>`;
}

function proCards() {
  const grid = $("taskCategoryGrid");
  if (!grid) return;
  grid.querySelectorAll(".task-category-card:not([data-pro])").forEach((card) => {
    const key = card.dataset.key;
    const p = platByKey(key);
    if (!p) return;
    const cEl = card.querySelector(".task-category-count");
    const count = cEl ? Number(cEl.textContent) || 0 : 0;
    card.dataset.pro = "1";
    card.style.setProperty("--brand", p.color);
    card.innerHTML = `${logoHtml(key, "lg")}<div class="task-category-label">${esc(p.label)}</div><div class="tl-count ${count ? "" : "tl-zero"}"><b>${count}</b> ${count === 1 ? "Task" : "Tasks"}</div>`;
  });
}

function proListHeader() {
  const t = $("activeTaskCategoryTitle");
  if (t && !t.querySelector(".tl-logo")) {
    const p = TASK_PLATFORMS.find((x) => t.textContent.includes(x.label));
    if (p) t.innerHTML = `${logoHtml(p.key, "sm")}<span>${esc(p.label)} Tasks</span>`;
  }
  const c = $("taskListContainer");
  const active = document.querySelector(".task-category-card.category-active");
  if (c && active) {
    c.querySelectorAll(".task-platform-icon:not([data-pro])").forEach((el) => {
      el.dataset.pro = "1";
      el.innerHTML = logoHtml(active.dataset.key, "sm");
    });
  }
}

function mountTaskHub() {
  const grid = $("taskCategoryGrid");
  if (grid) { new MutationObserver(() => { proCards(); proListHeader(); }).observe(grid, { childList: true }); proCards(); }
  const t = $("activeTaskCategoryTitle");
  if (t) new MutationObserver(proListHeader).observe(t, { childList: true, characterData: true, subtree: true });
  const c = $("taskListContainer");
  if (c) new MutationObserver(proListHeader).observe(c, { childList: true });
  proListHeader();
}

/* =============== 8. ACTIVATION PAYMENT FORM =============== */
const BD_PHONE = /^01[3-9]\d{8}$/;
const TRX_RE = /^[A-Z0-9]{6,20}$/;
let actRequests = [];
let submitting = false;

function payLogo(m) {
  const cls = m === "Nagad" ? "pm-nagad" : "pm-bkash";
  const file = m === "Nagad" ? "nagad" : "bkash";
  return `<span class="pay-logo ${cls}"><img src="assets/brands/${file}.png" alt="${m}" loading="lazy" onerror="this.remove()"><b>${m.charAt(0)}</b></span>`;
}

function syncMethodUI() {
  const sel = $("paymentMethod");
  if (!sel) return;
  document.querySelectorAll(".pay-method").forEach((b) => b.classList.toggle("pay-method-on", b.dataset.m === sel.value));
}

function mountActivation() {
  const sel = $("paymentMethod");
  if (!sel) return;
  const card = sel.closest(".card");
  card.classList.add("pay-form-card");
  hide(sel.closest(".form-group"));
  if (![...sel.options].some((o) => o.value === "Nagad")) return;
  sel.value = "Nagad";

  card.insertAdjacentHTML("afterbegin", `
    <div class="pay-title">💳 Payment Details</div>
    <div class="pay-label">Payment Method</div>
    <div class="pay-methods">
      <button type="button" class="pay-method" data-m="bKash">${payLogo("bKash")}<span class="pay-m-text"><b>bKash</b><small>Send Money</small></span><i class="pay-check">✓</i></button>
      <button type="button" class="pay-method" data-m="Nagad">${payLogo("Nagad")}<span class="pay-m-text"><b>Nagad</b><small>Send Money</small></span><i class="pay-check">✓</i></button>
    </div>`);
  card.querySelectorAll(".pay-method").forEach((b) => b.addEventListener("click", () => {
    sel.value = b.dataset.m;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    syncMethodUI();
  }));
  [300, 1500].forEach((t) => setTimeout(syncMethodUI, t));
  syncMethodUI();

  const sender = $("senderNumber"), trx = $("transactionId");
  sender.setAttribute("inputmode", "numeric"); sender.setAttribute("maxlength", "11"); sender.setAttribute("autocomplete", "tel");
  trx.setAttribute("maxlength", "20"); trx.setAttribute("autocapitalize", "characters"); trx.setAttribute("autocomplete", "off");
  sender.closest(".form-group").insertAdjacentHTML("beforeend", `<div class="field-msg" id="msgSender"></div>`);
  trx.closest(".form-group").insertAdjacentHTML("beforeend", `<div class="field-msg" id="msgTrx"></div>`);

  const vSender = () => {
    const v = sender.value.trim(); const m = $("msgSender");
    if (!v) { sender.classList.remove("ok", "bad"); m.textContent = ""; return false; }
    const ok = BD_PHONE.test(v);
    sender.classList.toggle("ok", ok); sender.classList.toggle("bad", !ok);
    m.textContent = ok ? "✓ সঠিক নাম্বার" : "১১ ডিজিটের সঠিক নাম্বার দিন (01XXXXXXXXX)";
    m.className = "field-msg " + (ok ? "msg-ok" : "msg-bad");
    return ok;
  };
  const vTrx = () => {
    const v = trx.value.trim().toUpperCase(); const m = $("msgTrx");
    if (!v) { trx.classList.remove("ok", "bad"); m.textContent = ""; return false; }
    const ok = TRX_RE.test(v);
    trx.classList.toggle("ok", ok); trx.classList.toggle("bad", !ok);
    m.textContent = ok ? "✓ সঠিক ফরম্যাট" : "৬–২০ অক্ষরের Transaction ID দিন (শুধু অক্ষর ও সংখ্যা)";
    m.className = "field-msg " + (ok ? "msg-ok" : "msg-bad");
    return ok;
  };
  sender.addEventListener("input", vSender);
  trx.addEventListener("input", vTrx);

  const old = $("activationBtn");
  const label = old.textContent.trim();
  const btn = old.cloneNode(true);
  old.replaceWith(btn);
  btn.className = "pay-submit";
  btn.innerHTML = `<span class="pay-btn-label">🔐 ${esc(label)}</span>`;
  btn.addEventListener("click", () => submitActivation(btn, label, vSender, vTrx));

  card.insertAdjacentHTML("beforebegin", `<div class="card act-status-card pm-hide" id="actStatusCard"></div>`);
}

function confirmBox(title, msg) {
  return new Promise((resolve) => {
    $("confirmTitle").textContent = title;
    $("confirmMessage").textContent = msg;
    const d = $("confirmDialog"), y = $("confirmYesBtn"), n = $("confirmNoBtn");
    d.classList.remove("hidden");
    const done = (v) => { d.classList.add("hidden"); y.removeEventListener("click", ys); n.removeEventListener("click", ns); resolve(v); };
    const ys = () => done(true), ns = () => done(false);
    y.addEventListener("click", ys); n.addEventListener("click", ns);
  });
}
function dlg(kind, msg) {
  const ids = { success: ["successMessage", "successDialog"], error: ["errorMessage", "errorDialog"], warning: ["warningMessage", "warningDialog"] }[kind];
  $(ids[0]).textContent = msg; $(ids[1]).classList.remove("hidden");
}

async function submitActivation(btn, label, vSender, vTrx) {
  if (submitting) return;
  if (!uid || !userData) { dlg("warning", "আপনার তথ্য লোড হচ্ছে, ২-৩ সেকেন্ড পরে আবার চাপুন।"); return; }
  if (userData.isActive) { dlg("warning", "আপনার অ্যাকাউন্ট ইতিমধ্যে অ্যাক্টিভ আছে।"); return; }
  if (actRequests.some((r) => r.status === "pending")) { dlg("warning", "আপনার একটি অ্যাক্টিভেশন রিকোয়েস্ট ইতিমধ্যে Pending আছে।"); return; }

  const method = $("paymentMethod").value;
  const sender = $("senderNumber").value.trim();
  const trx = $("transactionId").value.trim().toUpperCase();
  if (!sender || !trx) { dlg("warning", "সব ফিল্ড পূরণ করুন।"); vSender(); vTrx(); return; }
  if (!vSender()) { dlg("warning", "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (যেমন 01XXXXXXXXX)।"); return; }
  if (!vTrx()) { dlg("warning", "সঠিক Transaction ID দিন (৬–২০ অক্ষর, শুধু অক্ষর ও সংখ্যা)।"); return; }

  const ok = await confirmBox("অ্যাক্টিভেশন রিকোয়েস্ট নিশ্চিত করুন",
    `${method} নাম্বারে ${sender} থেকে ১২৫ টাকা Send Money করেছেন এবং Transaction ID "${trx}" সঠিক তো?`);
  if (!ok) return;

  submitting = true;
  btn.disabled = true;
  btn.classList.add("pay-loading");
  btn.innerHTML = `<span class="pay-spin"></span><span class="pay-btn-label">Submitting…</span>`;
  try {
    const lockRef = doc(db, "activationTrx", trx);
    const reqRef = doc(collection(db, ACTIVATIONS));
    await runTransaction(db, async (tx) => {
      const lock = await tx.get(lockRef);
      if (lock.exists()) {
        const l = lock.data();
        if (l.uid !== uid) throw new Error("DUP_TRX");
        const oldReq = await tx.get(doc(db, ACTIVATIONS, l.requestId));
        if (!(oldReq.exists() && oldReq.data().status === "rejected")) throw new Error("DUP_TRX");
      }
      tx.set(reqRef, {
        uid, name: userData.name, method, senderNumber: sender, transactionId: trx,
        status: "pending", requestedAt: serverTimestamp(), processedAt: null, adminNote: ""
      });
      tx.set(lockRef, { uid, trxId: trx, requestId: reqRef.id, method, createdAt: serverTimestamp() });
    });
    $("senderNumber").value = ""; $("transactionId").value = "";
    ["senderNumber", "transactionId"].forEach((i) => $(i).classList.remove("ok", "bad"));
    ["msgSender", "msgTrx"].forEach((i) => { $(i).textContent = ""; });
    try { localStorage.removeItem("refer_earn_activation_draft"); } catch {}
    dlg("success", "আপনার অ্যাক্টিভেশন রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাই করার পর ১-১৫ মিনিটের মধ্যে অ্যাকাউন্ট অ্যাক্টিভ হবে।");
  } catch (err) {
    if (err.message === "DUP_TRX") dlg("error", "এই Transaction ID দিয়ে ইতিমধ্যে একটি রিকোয়েস্ট জমা হয়েছে। সঠিক নতুন Transaction ID দিন।");
    else dlg("error", err.message);
  } finally {
    submitting = false;
    btn.disabled = false;
    btn.classList.remove("pay-loading");
    btn.innerHTML = `<span class="pay-btn-label">🔐 ${esc(label)}</span>`;
  }
}

function renderActStatus() {
  const box = $("actStatusCard");
  if (!box) return;
  if (!actRequests.length) { box.classList.add("pm-hide"); return; }
  box.classList.remove("pm-hide");
  const map = {
    pending: ["⏳ Pending", "as-pending", "অ্যাডমিন আপনার পেমেন্ট যাচাই করছে। সাধারণত ১-১৫ মিনিট লাগে।"],
    approved: ["✅ Approved", "as-ok", "আপনার অ্যাক্টিভেশন সম্পন্ন হয়েছে।"],
    rejected: ["❌ Rejected", "as-bad", "তথ্য যাচাই করে আবার সঠিক তথ্য দিয়ে রিকোয়েস্ট করুন।"]
  };
  const fmt = (t) => t && t.toDate ? t.toDate().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "--";
  const latest = actRequests[0];
  const m = map[latest.status] || map.pending;
  box.innerHTML = `
    <div class="as-head"><h3>📍 Activation Request Status</h3><span class="as-badge ${m[1]}">${m[0]}</span></div>
    <p class="as-msg">${m[2]}</p>
    <div class="as-list">${actRequests.slice(0, 3).map((r) => `
      <div class="as-item"><span>${esc(r.method)} · ${esc(r.transactionId)}</span><span>${fmt(r.requestedAt)} · ${esc(r.status)}</span></div>`).join("")}</div>`;
}

function attachActivationStatus() {
  unsubs.push(onSnapshot(query(collection(db, ACTIVATIONS), where("uid", "==", uid)), (snap) => {
    actRequests = [];
    snap.forEach((d) => actRequests.push(d.data()));
    actRequests.sort((a, b) => (b.requestedAt?.toMillis?.() || 0) - (a.requestedAt?.toMillis?.() || 0));
    renderActStatus();
  }));
}

/* =============== 9. REFERRAL COMMISSION EXPLAINER =============== */
const LV_COLORS = ["#22C55E", "#38BDF8", "#A78BFA", "#F59E0B", "#F472B6"];

function mountCommission() {
  const card = $("commission");
  if (!card || $("pmCommission")) return;
  const wrap = card.querySelector(".table-responsive");
  const ex = card.querySelector(".commission-example-box");
  hide(wrap); hide(ex);
  const L = LEVEL_COMMISSIONS;
  const letters = ["E", "D", "C", "B", "A"]; // Level 1..5 receivers when F activates

  const structure = L.map((amt, i) => `
    <div class="cm-level" style="--lc:${LV_COLORS[i]}"><span class="cm-lv-badge">Level ${i + 1}</span><b>${money(amt)}</b></div>`).join("");

  const nodes = ["A", "B", "C", "D", "E"].map((l, i) => {
    const lvl = 5 - i; // A=5 ... E=1
    return `<div class="cm-node" style="--lc:${LV_COLORS[lvl - 1]}">
      <span class="cm-letter">${l}</span><span class="cm-lvl">Level ${lvl}</span><span class="cm-amt">${money(L[lvl - 1])}</span></div><span class="cm-arrow"></span>`;
  }).join("") + `<div class="cm-node cm-new"><span class="cm-letter">F</span><span class="cm-lvl">Activates ✓</span><span class="cm-amt">New User</span></div>`;

  const receives = letters.map((l, i) => `
    <div class="cm-recv" style="--lc:${LV_COLORS[i]}"><span class="cm-letter sm">${l}</span><span><b>${l}</b> receives <b>${money(L[i])}</b></span><span class="cm-lv-badge">Level ${i + 1}</span></div>`).join("");

  const rows = letters.map((l, i) => `<tr><td><b>${l}</b></td><td><span class="cm-lv-badge" style="--lc:${LV_COLORS[i]}">Level ${i + 1}</span></td><td class="lb-money">${money(L[i])}</td></tr>`).join("");

  const html = `
  <div id="pmCommission">
    <h4 class="cm-h">Commission Structure</h4>
    <div class="cm-levels">${structure}</div>

    <h4 class="cm-h">Visual Example — A → B → C → D → E → F</h4>
    <div class="cm-flow">${nodes}</div>
    <p class="cm-caption">F Active হলে Commission উপরের (Upline) দিকে যায়: E, D, C, B, A।</p>

    <h4 class="cm-h">Commission Distribution</h4>
    <div class="cm-recv-grid">${receives}</div>
    <div class="table-responsive cm-table"><table class="table"><thead><tr><th>Commission Receiver</th><th>Level</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table></div>

    <div class="cm-how">
      <h4>ℹ️ How Referral Commission Works</h4>
      <ol>
        <li>একজন নতুন User Referral Link দিয়ে Registration করবে।</li>
        <li>নতুন User-এর Account Active হলে Commission Process শুরু হবে।</li>
        <li>তার Upline-এর প্রথম ৫টি Level-এর Active Eligible User-দের নির্ধারিত Commission দেওয়া হবে।</li>
        <li>প্রত্যেক Level-এর Commission নির্ধারিত Amount অনুযায়ী বিতরণ হবে।</li>
        <li>Commission-এর প্রতিটি Transaction History-তে সংরক্ষণ হবে।</li>
      </ol>
      <div class="cm-note">⚠️ শুধু Active এবং Eligible User-ই Commission পাবে। একই Activation Event থেকে Duplicate Commission দেওয়া হয় না।</div>
    </div>
  </div>`;
  const sub = card.querySelector(".rank-info-subtitle");
  (sub || card.querySelector("h3")).insertAdjacentHTML("afterend", html);
}

/* =============== lifecycle =============== */
function detach() { unsubs.forEach((u) => { try { u(); } catch {} }); unsubs = []; }

function safe(name, fn) { try { fn(); } catch (e) { console.error("premium2:", name, e); } }

function init() {
  onAuthStateChanged(auth, (user) => {
    detach();
    if (user) {
      uid = user.uid;
      unsubs.push(onSnapshot(doc(db, USERS, uid), (s) => { if (s.exists()) userData = s.data(); }));
      safe("leaderboards", attachLeaderboards);
      safe("activationStatus", attachActivationStatus);
      safe("rank", renderRank);
    } else {
      uid = null; userData = null; actRequests = [];
    }
  });
  safe("leaderboardsUI", mountLeaderboards);
  safe("rank", mountRank);
  safe("taskHub", mountTaskHub);
  safe("activation", mountActivation);
  safe("commission", mountCommission);
}

init();
