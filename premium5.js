/* Premium part 5 — sequential numbering, menu, frames, withdraw-condition text. */
const $ = (id) => document.getElementById(id);
const safe = (n, fn) => { try { fn(); } catch (e) { console.error("premium5:", n, e); } };

const css = document.createElement("link");
css.rel = "stylesheet";
css.href = "premium5.css?v=4";
document.head.appendChild(css);

const EMO = {
  quickActionsSection: "⚡", dashboard: "🏠", statisticsSection: "📊", dailySpin: "🎁",
  accountStatusSection: "📄", profile: "👤", referral: "🔗", referralTeam: "🌳",
  referralHistorySection: "📜", referralContest: "🏆", leaderboard: "🥇", rankSection: "📈",
  activityListSection: "🕒", taskHub: "📋", taskHistorySection: "✅", rejectedTaskSection: "❌",
  activation: "🔐", withdraw: "💸", withdrawHistorySection: "📜", transactionSection: "🧾",
  walletActivitySection: "👛", broadcast: "📢", notifications: "🔔", support: "🆘",
  contact: "📞", faq: "❓"
};
const NUM_RE = /^\s*\d+(?:\s*[-–]\s*\d+)?\s*[.)]\s*/;
const EMOJI_START = /^\p{Extended_Pictographic}/u;
const H3_WANTED = [/RANK\s*&\s*BONUS/i, /REFERRAL COMMISSION/i, /Withdraw Payment Proof/i, /সমস্যার ধরন/, /^\W*Support Team/i, /প্রিমিয়াম সুবিধা|Premium Benefits/i];

function baseText(el) {
  if (el.querySelector(":scope > .pm5-no") && el.dataset.pm5t) return el.dataset.pm5t;
  return el.textContent.replace(NUM_RE, "").trim();
}
const ICON_RE = /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*\uFE0F?)\s*/u;
const H3_EMO = [[/সমস্যার ধরন/, "🧩"], [/Support Team/i, "👥"], [/Withdraw Payment Proof/i, "📸"]];

function collect() {
  const out = [];
  document.querySelectorAll("#app h2.section-title, #app .rank-info-card > h3, #app #commission > h3, #app .benefits-card > h3, #app #support h3, #app #withdraw h3").forEach((el) => {
    if (el.id === "contestTitle" || el.closest(".modal, .hidden-modal")) return;
    const base = baseText(el);
    if (el.tagName === "H3" && !H3_WANTED.some((r) => r.test(base))) return;
    out.push({ el, base });
  });
  return out;
}

function numberAndMenu() {
  const items = collect();
  const links = [];
  items.forEach((it, i) => {
    const n = String(i + 1).padStart(2, "0");
    let label = it.base;
    if (it.el.closest("#broadcast")) label = label.replace(/^\W*Broadcast/i, "📢 Notice");
    let icon = "", rest = label;
    const m = label.match(ICON_RE);
    if (m) { icon = m[1]; rest = label.slice(m[0].length); }
    else {
      const host0 = it.el.tagName === "H2" ? it.el.closest("section") : it.el.closest(".card");
      icon = (host0 && EMO[host0.id]) || ((H3_EMO.find((x) => x[0].test(label)) || [])[1]) || "⭐";
    }
    const key = n + "|" + icon + "|" + rest;
    if (!it.el.querySelector(":scope > .pm5-no") || it.el.dataset.pm5Key !== key) {
      it.el.textContent = "";
      const b = document.createElement("span");
      b.className = "pm5-no"; b.textContent = n;
      const ic = document.createElement("span");
      ic.className = "pm5-ico"; ic.textContent = icon;
      it.el.append(b, ic, document.createTextNode(rest));
      it.el.dataset.pm5t = it.base;
      it.el.dataset.pm5Key = key;
    }
    it.el.classList.add(it.el.tagName === "H2" ? "pm5-h2" : "pm5-h3");

    const host = it.el.tagName === "H2" ? it.el.closest("section") : it.el.closest(".card");
    if (host && !host.id) host.id = "pm5-c" + n;
    const target = host ? host.id : "";
    const text = icon + " " + rest;
    if (target) links.push({ n, text, target });
  });

  document.querySelectorAll("#app section > .container").forEach((c) => {
    if (c.querySelector(":scope > h2.section-title")) c.classList.add("pm5-frame");
  });

  const list = document.querySelector("#quickNavOverlay .quick-nav-list");
  if (list) {
    const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const html = links.map((l) => `<a href="#${l.target}" class="quick-nav-link" data-target="${l.target}"><b class="pm5-menu-no">${l.n}</b><span>${esc(l.text)}</span></a>`).join("");
    if (list.dataset.pm5 !== html) { list.innerHTML = html; list.dataset.pm5 = html; }
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest("#quickNavOverlay .quick-nav-link");
  if (!a) return;
  e.preventDefault();
  const t = document.getElementById(a.dataset.target);
  const ov = $("quickNavOverlay");
  if (ov) ov.classList.add("hidden");
  if (t) setTimeout(() => t.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
}, true);

/* Withdraw: "+ 3 New Active Referral" is shown only after balance and tasks are met. */
function wdCondition() {
  const box = document.querySelector(".withdraw-condition-box span");
  const item = $("eligReferralItem");
  if (!box || !item) return;
  if (!box.querySelector(".pm5-refreq")) {
    box.innerHTML = 'প্রয়োজন: 10টি New Task <span class="pm5-refreq">+ 3টি New Active Referral</span>';
  }
  const sync = () => box.querySelector(".pm5-refreq").classList.toggle("show", item.style.visibility === "visible");
  if (!item.dataset.pm5) {
    item.dataset.pm5 = "1";
    new MutationObserver(sync).observe(item, { attributes: true, attributeFilter: ["style"] });
  }
  sync();
}

function tagProgress() {
  const bar = $("referralProgress");
  const card = bar && bar.closest(".card");
  if (card) card.classList.add("pm5-refprog");
}

let t = null;
function run() {
  const ap = $("app");
  document.body.classList.toggle("pm5-guest", !!(ap && ap.hasAttribute("hidden")));
  safe("number", numberAndMenu);
  safe("wd", wdCondition);
  safe("prog", tagProgress);
}
function schedule() { clearTimeout(t); t = setTimeout(run, 350); }

run();
new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
const appEl = $("app");
if (appEl) new MutationObserver(run).observe(appEl, { attributes: true, attributeFilter: ["hidden"] });
[800, 2500].forEach((ms) => setTimeout(run, ms));
