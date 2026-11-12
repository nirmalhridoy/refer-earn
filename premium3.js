import { auth, onAuthStateChanged, wipeLocalCache } from "./firebase.js";

/* Premium part 3 — Screen position & state persistence (per user, never shared between users). */

const $ = (id) => document.getElementById(id);
const PREFIX = "pm_state_v1_";
const LAST_UID = "pm_last_uid";
const LEGACY_KEYS = ["refer_earn_activation_draft"]; // old key from app.js (not per-user) — cleaned on logout / user switch
const MAX_AGE = 24 * 60 * 60 * 1000;

// Draft-able fields. Passwords are NEVER stored.
const TASK_FIELDS = ["taskProfileLinkInput"];
const PROFILE_FIELDS = ["editName", "editPhone", "editDistrict"];
const FREE_FIELDS = ["taskSearchInput", "taskRewardSortSelect", "referralTreeSearch", "referralTreeLevelFilter",
  "withdrawNumber", "withdrawMethod", "senderNumber", "transactionId", "paymentMethod"];

let uid = null;
let restoring = false;

try { history.scrollRestoration = "manual"; } catch {}

const hasClass = (id, c) => { const el = $(id); return !!el && el.classList.contains(c); };
const sections = () => [...document.querySelectorAll("#home, #app > section[id]")];
const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;

function currentAnchor() {
  const probe = window.scrollY + 160;
  let best = null;
  for (const s of sections()) { if (absTop(s) <= probe) best = s; }
  return best ? { id: best.id, off: Math.round(window.scrollY - absTop(best)) } : null;
}

function collect() {
  const app = $("app");
  if (!uid || !app || app.hidden) return null;
  const st = { t: Date.now(), y: Math.round(window.scrollY), anchor: currentAnchor(), fields: {}, modal: null };
  const taskOpen = $("taskSubmitModal") && !hasClass("taskSubmitModal", "hidden");
  const profOpen = $("editProfileModal") && !hasClass("editProfileModal", "hidden");
  const take = (ids) => ids.forEach((id) => { const el = $(id); if (el && el.value !== "") st.fields[id] = el.value; });
  take(FREE_FIELDS);
  if (taskOpen) { take(TASK_FIELDS); st.modal = { type: "task", taskId: $("taskSubmitTaskId").value }; }
  else if (profOpen) { take(PROFILE_FIELDS); st.modal = { type: "profile" }; }
  const cat = document.querySelector(".task-category-card.category-active");
  if (cat) st.cat = cat.dataset.key;
  const nf = document.querySelector(".notif-filter-active");
  if (nf) st.notif = nf.dataset.filter;
  st.treeView = hasClass("treeViewTreeBtn", "tree-view-active") ? "tree" : "list";
  const tc = $("referralTreeContainer");
  st.treeLoaded = !!(tc && tc.querySelector(".table, .tree-level-group"));
  return st;
}

function save() {
  if (restoring) return;
  const st = collect();
  if (!st) return;
  try { localStorage.setItem(PREFIX + uid, JSON.stringify(st)); } catch {}
}

function clearAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function setVal(id, v) {
  const el = $(id);
  if (!el) return;
  el.value = v;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/* ---------- restore ---------- */
function restoreScroll(st, done) {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto"; // style.css uses smooth scrolling, which would fight the restore
  let ticks = 0, stable = 0, ended = false;
  const events = ["touchstart", "wheel", "mousedown", "keydown"];
  const end = () => {
    if (ended) return;
    ended = true;
    clearInterval(iv);
    events.forEach((e) => window.removeEventListener(e, end, true));
    root.style.scrollBehavior = prev;
    done();
  };
  events.forEach((e) => window.addEventListener(e, end, { capture: true, passive: true }));
  const iv = setInterval(() => {
    ticks++;
    const el = st.anchor && $(st.anchor.id);
    let target = el ? absTop(el) + st.anchor.off : st.y;
    const max = root.scrollHeight - window.innerHeight;
    target = Math.max(0, Math.min(target, max));
    if (Math.abs(window.scrollY - target) > 3) { window.scrollTo(0, target); stable = 0; }
    else stable++;
    // keep correcting while the page is still growing (data arrives from Firestore)
    if ((stable >= 8 && ticks >= 10) || ticks >= 50) end();
  }, 200);
}

function restoreTaskUi(st) {
  let n = 0, searchDone = false, modalDone = false;
  const iv = setInterval(() => {
    if (++n > 45) return clearInterval(iv);
    if (st.cat) {
      const c = document.querySelector(`.task-category-card[data-key="${st.cat}"]`);
      if (!c) return;
      if (!c.classList.contains("category-active")) { c.click(); return; }
    }
    if (!searchDone) {
      if (st.fields.taskSearchInput !== undefined && !$("taskSearchInput")) return;
      ["taskSearchInput", "taskRewardSortSelect"].forEach((id) => { if (st.fields[id] !== undefined) setVal(id, st.fields[id]); });
      searchDone = true;
    }
    if (st.modal && st.modal.type === "task" && !modalDone) {
      const btn = document.querySelector(`.task-submit-open-btn[data-task-id="${st.modal.taskId}"]`);
      if (!btn) return;
      btn.click();
      if (st.fields.taskProfileLinkInput !== undefined) setVal("taskProfileLinkInput", st.fields.taskProfileLinkInput);
      modalDone = true;
    }
    clearInterval(iv);
  }, 300);
}

function restoreProfileUi(st) {
  let n = 0;
  const iv = setInterval(() => {
    if (++n > 30) return clearInterval(iv);
    const nameEl = $("profileName");
    if (!nameEl || nameEl.textContent === "Guest User") return; // wait until profile data is loaded
    $("editProfileBtn").click();
    PROFILE_FIELDS.forEach((id) => { if (st.fields[id] !== undefined) setVal(id, st.fields[id]); });
    clearInterval(iv);
  }, 300);
}

function restoreUi(st) {
  if (st.notif && st.notif !== "all") { const b = document.querySelector(`.notif-filter-btn[data-filter="${st.notif}"]`); if (b) b.click(); }
  if (st.treeView === "tree" && $("treeViewTreeBtn")) $("treeViewTreeBtn").click();
  ["referralTreeSearch", "referralTreeLevelFilter", "withdrawNumber", "withdrawMethod", "senderNumber", "transactionId", "paymentMethod"]
    .forEach((id) => { if (st.fields[id] !== undefined) setVal(id, st.fields[id]); });
  if (st.treeLoaded && $("loadReferralTreeBtn")) $("loadReferralTreeBtn").click();
  restoreTaskUi(st);
  if (st.modal && st.modal.type === "profile") restoreProfileUi(st);
}

function readSaved() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem(PREFIX + uid) || "null"); } catch {}
  if (!st || Date.now() - st.t > MAX_AGE) return null;
  return st;
}

function startRestore() {
  const st = readSaved();
  if (!st) { restoring = false; return; }
  restoreUi(st);
  restoreScroll(st, () => { restoring = false; });
}

// Some mobile browsers reset the page to the top when the tab is brought back.
function repairIfReset() {
  if (!uid || restoring) return;
  const st = readSaved();
  if (st && st.y > 400 && window.scrollY < 80) { restoring = true; restoreScroll(st, () => { restoring = false; }); }
}

/* ---------- save triggers ---------- */
let raf = null;
window.addEventListener("scroll", () => {
  if (raf) return;
  raf = requestAnimationFrame(() => { raf = null; save(); });
}, { passive: true });
document.addEventListener("visibilitychange", () => { if (document.hidden) save(); else repairIfReset(); });
window.addEventListener("pagehide", save);
window.addEventListener("beforeunload", save);
window.addEventListener("pageshow", (e) => { if (e.persisted) repairIfReset(); });
document.addEventListener("input", () => setTimeout(save, 250), true);
document.addEventListener("click", () => setTimeout(save, 400), true);
setInterval(() => { if (!document.hidden) save(); }, 5000);

/* ---------- user isolation ---------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    let last = null;
    try { last = localStorage.getItem(LAST_UID); } catch {}
    if (last && last !== user.uid) clearAll(); // different user on this device -> drop previous user's state
    try { localStorage.setItem(LAST_UID, user.uid); } catch {}
    uid = user.uid;
    restoring = true;
    setTimeout(startRestore, 400);
  } else {
    if (uid) { // logout: drop saved state AND the cached data of that user, then reload clean
      clearAll();
      wipeLocalCache().then((did) => { if (did) setTimeout(() => location.reload(), 300); });
    }
    uid = null;
    restoring = false;
  }
});
