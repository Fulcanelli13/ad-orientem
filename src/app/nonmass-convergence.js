export const VERSION = "nonmass-d3-d6-convergence-v1";
export const PRAY_STORAGE_KEY = "ao.pray.v435930";
export const ADORATION_SESSION_KEY = "ao.app.adoration.presence.v1";

export const CONFESSION_PHASES = Object.freeze([
  "doctrine",
  "prepare",
  "examination",
  "in-confessional",
  "after",
]);

export function confessionPhaseForStage(stage) {
  const n = Number(stage);
  if (!Number.isFinite(n) || n <= 0) return "doctrine";
  if (n === 1) return "prepare";
  if (n >= 2 && n <= 4) return "examination";
  if (n === 5) return "in-confessional";
  return "after";
}

export function normalizeStoredPrayState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const next = JSON.parse(JSON.stringify(raw));
  if (next.adoration && typeof next.adoration === "object") {
    delete next.adoration.presence;
  }
  return next;
}

export function humanSourceStatus(value, language = "en") {
  const fr = language === "fr";
  const key = String(value || "").toUpperCase();
  const map = {
    VERIFIED_PRIMARY: fr ? "Source vérifiée" : "Verified source",
    VERIFIED_SECONDARY: fr ? "Témoin historique / secondaire" : "Historical / secondary witness",
    CURRENT_RITUAL_BASELINE: fr ? "Source rituelle actuelle" : "Current ritual source",
    HISTORICAL_WITNESS: fr ? "Témoin historique" : "Historical witness",
    DEVOTIONAL_METHOD: fr ? "Méthode dévotionnelle traditionnelle" : "Traditional devotional method",
    NORMALIZED_EXISTING: fr ? "Source conservée dans le corpus" : "Source retained in the corpus",
  };
  return map[key] || (fr ? "Provenance documentée" : "Documented provenance");
}

export function canonicalAppVersion(win = globalThis) {
  return (
    win?.AO_RELEASE_AUTHORITY_V4359?.version ||
    win?.document?.documentElement?.dataset?.aoRelease ||
    null
  );
}

function isFrench(win) {
  return win?.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr";
}

function L(win, en, fr) {
  return isFrench(win) ? fr : en;
}

function scrubPersistedAdoration(win) {
  try {
    const raw = win?.localStorage?.getItem?.(PRAY_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const normalized = normalizeStoredPrayState(parsed);
    if (JSON.stringify(parsed) === JSON.stringify(normalized)) return false;
    win.localStorage.setItem(PRAY_STORAGE_KEY, JSON.stringify(normalized));
    return true;
  } catch {
    return false;
  }
}

function currentPrayView(root) {
  return root?.querySelector?.(".aoP435930Mount")?.dataset?.aoPrayView || "";
}

function activeConfessionStage(root) {
  const active = root?.querySelector?.("[data-p435930-conf-stage].active,[data-p435930-conf-stage][aria-current='step']");
  return Number(active?.dataset?.p435930ConfStage || 0);
}

function phaseRail(win, stage) {
  const active = confessionPhaseForStage(stage);
  const labels = isFrench(win)
    ? [
        ["doctrine", "Doctrine"],
        ["prepare", "Préparer"],
        ["examination", "Examen"],
        ["in-confessional", "Au confessionnal"],
        ["after", "Après"],
      ]
    : [
        ["doctrine", "Doctrine"],
        ["prepare", "Prepare"],
        ["examination", "Examination"],
        ["in-confessional", "In Confessional"],
        ["after", "After"],
      ];
  const el = win.document.createElement("div");
  el.className = "aoD5PhaseRail";
  el.dataset.aoD5PhaseRail = "1";
  labels.forEach(function (item) {
    const span = win.document.createElement("span");
    span.textContent = item[1];
    span.dataset.phase = item[0];
    if (item[0] === active) {
      span.classList.add("active");
      span.setAttribute("aria-current", "step");
    }
    el.appendChild(span);
  });
  return el;
}

function replaceText(root, replacements, win) {
  if (!root || !win?.document?.createTreeWalker) return;
  const walker = win.document.createTreeWalker(root, win.NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (node) {
    let value = node.nodeValue || "";
    replacements.forEach(function (pair) {
      value = value.replace(pair[0], pair[1]);
    });
    node.nodeValue = value;
  });
}

function patchConfession(root, win) {
  if (currentPrayView(root) !== "confession") return;
  const stage = activeConfessionStage(root);
  const oldRail = root.querySelector(".aoP435930StageRail");
  if (oldRail && !root.querySelector("[data-ao-d5-phase-rail]")) {
    oldRail.hidden = true;
    oldRail.style.display = "none";
    oldRail.setAttribute("aria-hidden", "true");
    oldRail.insertAdjacentElement("afterend", phaseRail(win, stage));
  }

  root.querySelectorAll(".aoP435930Exam label").forEach(function (label) {
    const text = label.querySelector("span")?.textContent?.trim() || label.textContent?.trim() || "";
    const item = win.document.createElement("div");
    item.className = "aoD5ExamPrompt";
    item.textContent = text;
    label.replaceWith(item);
  });
  root.querySelectorAll("[data-p435930-exam]").forEach(function (node) { node.remove(); });
  root.querySelectorAll(".aoP435930Callout.privacy").forEach(function (node) {
    if (/prompt\(s\)|question\(s\)|marqu/i.test(node.textContent || "")) node.remove();
  });

  const body = root.querySelector(".aoP435930Body");
  replaceText(body, [
    [/by kind and approximate number/gi, "by kind and number; if the exact number is genuinely uncertain, give your best truthful estimate"],
    [/selon leur espèce et leur nombre approximatif/gi, "selon leur espèce et leur nombre ; si le nombre exact est réellement incertain, donnez votre meilleure estimation sincère"],
  ], win);

  if (stage === 0 && body && !body.querySelector("[data-ao-d5-doctrine]")) {
    const details = win.document.createElement("details");
    details.dataset.aoD5Doctrine = "1";
    details.className = "aoD5Doctrine";
    const summary = win.document.createElement("summary");
    summary.textContent = L(win, "What the Church teaches", "Ce qu’enseigne l’Église");
    const p = win.document.createElement("p");
    p.textContent = L(
      win,
      "The penitent prepares with contrition, confession and satisfaction; sacramental absolution belongs to the priest. The app helps you prepare but never judges validity or simulates the sacrament.",
      "Le pénitent se prépare par la contrition, la confession et la satisfaction ; l’absolution sacramentelle appartient au prêtre. L’application aide à se préparer mais ne juge jamais la validité et ne simule pas le sacrement."
    );
    details.append(summary, p);
    body.prepend(details);
  }
}

function makeAdorationCard(win, mode, title, copy, small) {
  const b = win.document.createElement("button");
  if (mode === "benediction") b.dataset.p435930GoBen = "1";
  else b.dataset.p435930AdorMode = mode;
  const s = win.document.createElement("small");
  s.textContent = small;
  const strong = win.document.createElement("b");
  strong.textContent = title;
  const span = win.document.createElement("span");
  span.textContent = copy;
  b.append(s, strong, span);
  return b;
}

function patchAdoration(root, win) {
  if (currentPrayView(root) !== "adoration") return;
  const state = win?.AO_PRAY_V435930?.state?.() || {};
  const mode = root.querySelector("[data-p435930-ador-home]") ? "detail" : "home";
  const storedSession = win?.sessionStorage?.getItem?.(ADORATION_SESSION_KEY);

  if (mode === "home") {
    const grid = root.querySelector(".aoP435930BigGrid");
    if (!grid) return;
    grid.querySelector("[data-p435930-ador-mode='holy']")?.remove();
    grid.querySelector("[data-p435930-ador-mode='four']")?.remove();
    if (!grid.querySelector("[data-p435930-go-ben]")) {
      const treasury = grid.querySelector("[data-p435930-ador-mode='treasury']");
      const card = makeAdorationCard(
        win,
        "benediction",
        L(win, "Exposition & Benediction", "Exposition et Bénédiction"),
        L(win, "Follow the public rite actually being celebrated", "Suivre le rite public réellement célébré"),
        L(win, "Public rite", "Rite public")
      );
      if (treasury) grid.insertBefore(card, treasury);
      else grid.appendChild(card);
    }
  } else {
    const choices = root.querySelector(".aoP435930GuideChoices");
    const openMode = root.querySelector("[data-p435930-ador-four]");
    if (choices && openMode && !choices.querySelector("[data-p435930-ador-mode='holy']")) {
      const b = win.document.createElement("button");
      b.type = "button";
      b.className = "aoP435930Secondary";
      b.dataset.p435930AdorMode = "holy";
      b.textContent = L(win, "Guided Gethsemane Holy Hour", "Heure Sainte guidée à Gethsémani");
      choices.appendChild(b);
    }
  }

  const exposedButton = root.querySelector("[data-p435930-seg='exposed']");
  const reservedButton = root.querySelector("[data-p435930-seg='reserved']");
  if (!storedSession && exposedButton?.classList.contains("active") && reservedButton && !root.dataset.aoD3ResettingPresence) {
    root.dataset.aoD3ResettingPresence = "1";
    reservedButton.click();
    win?.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, "reserved");
    win.setTimeout(function () { delete root.dataset.aoD3ResettingPresence; scrubPersistedAdoration(win); }, 0);
    return;
  }

  const sessionPresence = storedSession || (state?.adoration?.presence === "exposed" ? "exposed" : "reserved");
  if (sessionPresence === "exposed") {
    root.querySelectorAll("[data-p435930-go-rosary]").forEach(function (node) {
      const container = node.closest(".aoP435930GuideNow,.aoP435930GuideChoices") || node;
      container.remove();
    });
  }
}

function patchBenediction(root, win) {
  if (currentPrayView(root) !== "benediction") return;
  root.querySelectorAll(".aoP435930Progress,.pbProgress").forEach(function (node) { node.remove(); });
  const prayerStage = root.querySelector("[data-p435930-ben-step='3'].active,[data-p435930-ben-step='3'][aria-current='step']");
  if (prayerStage) {
    const prayer = root.querySelector(".aoP435930Prayer");
    if (prayer && !prayer.querySelector("[data-ao-d4-roles]")) {
      const note = win.document.createElement("div");
      note.dataset.aoD4Roles = "1";
      note.className = "aoD4Roles";
      note.textContent = L(win, "Minister: versicle and collect · All: response", "Ministre : verset et oraison · Tous : répons");
      prayer.prepend(note);
    }
  }
}

function sourceFamilyRows(win) {
  const rows = isFrench(win)
    ? [
        ["Livres liturgiques et base 1962", "Missel romain de 1962, Rubriques générales de 1960 et sources normatives applicables."],
        ["Calendrier et Propre", "L’autorité liturgique est distinguée du fournisseur numérique des données."],
        ["Écriture", "Les éditions et la provenance sont indiquées par langue dans le lecteur biblique."],
        ["Commentaire", "Les commentaires patristiques ou traditionnels restent attribués à leurs auteurs et éditions."],
        ["Doctrine et catéchisme", "Les textes doctrinaux gardent leur corpus et leur niveau d’autorité propres."],
        ["Prières et méthodes dévotionnelles", "Les témoins historiques et manuels traditionnels ne sont pas présentés comme loi liturgique."],
        ["Autorités des programmes", "Premier vendredi et premier samedi distinguent l’autorité du programme des sources de leurs composants."],
        ["Art sacré", "Artiste, œuvre, collection et droits sont conservés lorsqu’ils sont connus."],
      ]
    : [
        ["Liturgical books & 1962 basis", "The 1962 Roman Missal, 1960 General Rubrics and applicable normative sources control liturgical claims."],
        ["Calendar & Proper data", "Liturgical authority is kept distinct from the digital provider supplying data."],
        ["Scripture", "Edition and provenance are identified by language in the Scripture reader."],
        ["Commentary", "Patristic and traditional commentary remains attributed to its author and edition."],
        ["Doctrine & Catechism", "Doctrinal texts retain their own corpus and authority level."],
        ["Prayer & devotional methods", "Historical witnesses and traditional manuals are not presented as liturgical law."],
        ["Programme authorities", "First Friday and First Saturday keep programme authority distinct from component sources."],
        ["Sacred art", "Artist, work, collection and rights are retained where known."],
      ];
  return rows;
}

function patchAboutSettings(win) {
  const root = win?.document?.getElementById?.("ao-settings-v4359");
  if (!root || root.hidden) return;
  if (win.document.documentElement.dataset.aoSettingsRoute !== "/settings/about-sources") return;
  const wrap = root.querySelector(".aoSetWrap");
  if (!wrap || wrap.dataset.aoD6About === "1") return;
  wrap.dataset.aoD6About = "1";
  wrap.innerHTML = "";

  const intro = win.document.createElement("div");
  intro.className = "aoSetIntro";
  intro.textContent = L(win, "Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.", "Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent.");
  wrap.appendChild(intro);

  const sourceSection = win.document.createElement("section");
  sourceSection.className = "aoSetSection aoD6Sources";
  const h = win.document.createElement("h2");
  h.textContent = L(win, "Sources", "Sources");
  const group = win.document.createElement("div");
  group.className = "aoSetGroup";
  sourceFamilyRows(win).forEach(function (row) {
    const details = win.document.createElement("details");
    details.className = "aoD6SourceFamily";
    const summary = win.document.createElement("summary");
    summary.textContent = row[0];
    const p = win.document.createElement("p");
    p.textContent = row[1];
    details.append(summary, p);
    group.appendChild(details);
  });
  sourceSection.append(h, group);
  wrap.appendChild(sourceSection);

  const keySection = win.document.createElement("section");
  keySection.className = "aoSetSection";
  const kh = win.document.createElement("h2");
  kh.textContent = L(win, "How provenance is labelled", "Comment la provenance est indiquée");
  const kg = win.document.createElement("div");
  kg.className = "aoSetGroup aoD6Key";
  const keys = isFrench(win)
    ? ["Source officielle / normative", "Source liturgique de 1962", "Témoin historique", "Méthode dévotionnelle traditionnelle", "Guide éditorial Ad Orientem", "Traduction / adaptation"]
    : ["Official / governing source", "1962 liturgical source", "Historical witness", "Traditional devotional source", "Ad Orientem editorial guidance", "Translation / adaptation"];
  keys.forEach(function (value) {
    const p = win.document.createElement("p");
    p.textContent = value;
    kg.appendChild(p);
  });
  keySection.append(kh, kg);
  wrap.appendChild(keySection);

  const aboutSection = win.document.createElement("section");
  aboutSection.className = "aoSetSection";
  const ah = win.document.createElement("h2");
  ah.textContent = L(win, "About Ad Orientem", "À propos d’Ad Orientem");
  const ag = win.document.createElement("div");
  ag.className = "aoSetGroup aoD6AboutGroup";
  const version = canonicalAppVersion(win) || L(win, "Current release", "Version actuelle");
  const values = isFrench(win)
    ? [
        ["Version de l’application", version],
        ["Confidentialité", "Les réglages et la progression sont conservés localement sauf indication contraire. Les péchés ne sont pas enregistrés."],
        ["Licences et remerciements", "Les textes et œuvres tiers conservent leurs notices de source et de licence."],
      ]
    : [
        ["Application version", version],
        ["Privacy", "Settings and progress are stored locally unless a feature says otherwise. Sins are not recorded."],
        ["Licences & acknowledgements", "Third-party texts and artworks retain their source and licence notices."],
      ];
  values.forEach(function (row) {
    const div = win.document.createElement("div");
    div.className = "aoD6AboutRow";
    const b = win.document.createElement("b"); b.textContent = row[0];
    const span = win.document.createElement("span"); span.textContent = row[1];
    div.append(b, span); ag.appendChild(div);
  });
  aboutSection.append(ah, ag);
  wrap.appendChild(aboutSection);
}

function installStyles(win) {
  if (!win?.document || win.document.getElementById("ao-nonmass-d3-d6-style")) return;
  const style = win.document.createElement("style");
  style.id = "ao-nonmass-d3-d6-style";
  style.textContent = [
    ".aoD5PhaseRail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;padding:8px 12px 0}",
    ".aoD5PhaseRail span{padding:7px 4px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;text-align:center;color:var(--muted,#b8c0c7);font-size:.62rem}",
    ".aoD5PhaseRail span.active{border-color:var(--liturgical,#c6a66b);color:var(--text,#f3efe8);background:var(--liturgical-soft,rgba(198,166,107,.1))}",
    ".aoD5ExamPrompt{padding:9px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.08));line-height:1.45}",
    ".aoD5Doctrine,.aoD4Roles{margin:0 0 14px;padding:11px 12px;border-left:2px solid var(--liturgical,#c6a66b);background:var(--liturgical-soft,rgba(198,166,107,.08))}",
    ".aoD6SourceFamily{padding:12px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09))}",
    ".aoD6SourceFamily:last-child{border-bottom:0}.aoD6SourceFamily summary{font-weight:650;cursor:pointer}.aoD6SourceFamily p{margin:8px 0 0;color:var(--muted,#b3bac0);font-size:.74rem;line-height:1.45}",
    ".aoD6Key p,.aoD6AboutRow{margin:0;padding:10px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09));font-size:.75rem}.aoD6Key p:last-child,.aoD6AboutRow:last-child{border-bottom:0}",
    ".aoD6AboutRow{display:grid;gap:4px}.aoD6AboutRow span{color:var(--muted,#b3bac0);line-height:1.4}",
  ].join("");
  win.document.head.appendChild(style);
}

export function installNonMassConvergence({ win = globalThis } = {}) {
  if (!win?.document?.getElementById || !win?.document?.createElement || typeof win?.MutationObserver !== "function") return null;
  if (win.AO_NON_MASS_D3_D6_CONVERGENCE) return win.AO_NON_MASS_D3_D6_CONVERGENCE;

  installStyles(win);
  scrubPersistedAdoration(win);

  let applying = false;
  function reconcile() {
    if (applying) return;
    applying = true;
    try {
      const prayRoot = win.document.getElementById("aoPray435930");
      if (prayRoot?.classList.contains("open")) {
        patchConfession(prayRoot, win);
        patchAdoration(prayRoot, win);
        patchBenediction(prayRoot, win);
      }
      patchAboutSettings(win);
      scrubPersistedAdoration(win);
    } finally {
      applying = false;
    }
  }

  win.document.addEventListener("click", function (event) {
    const target = event.target?.closest?.("button,input,[data-p435930-seg]");
    if (!target) return;
    const prayRoot = target.closest?.("#aoPray435930");
    if (prayRoot) {
      if (target.matches?.("[data-p435930-seg='reserved'],[data-p435930-seg='exposed']")) {
        win?.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, target.dataset.p435930Seg);
      }
      if (target.matches?.("[data-p435930-go-ben]")) {
        win?.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, "exposed");
      }
      if (target.matches?.("[data-p435930-ben-next]")) {
        const last = prayRoot.querySelector("[data-p435930-ben-step='6'].active,[data-p435930-ben-step='6'][aria-current='step']");
        if (last) win?.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, "reserved");
      }
      win.setTimeout(function () { scrubPersistedAdoration(win); reconcile(); }, 0);
    }
  }, true);

  const observer = new win.MutationObserver(function () { win.queueMicrotask(reconcile); });
  observer.observe(win.document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "data-ao-settings-route"] });

  const api = Object.freeze({
    version: VERSION,
    confessionPhaseForStage,
    normalizeStoredPrayState,
    humanSourceStatus,
    canonicalAppVersion: function () { return canonicalAppVersion(win); },
    reconcile,
    status: function () {
      return Object.freeze({
        prayOwner: Boolean(win.AO_PRAY_V435930),
        settingsOwner: Boolean(win.AO_SETTINGS_V4359),
        appVersion: canonicalAppVersion(win),
        adorationPresencePersistence: "session-only",
        confessionExamStorage: "read-only-prompts",
        d3: "compatibility-integrated",
        d4: "compatibility-integrated",
        d5: "compatibility-integrated",
        d6: "compatibility-integrated",
      });
    },
  });
  win.AO_NON_MASS_D3_D6_CONVERGENCE = api;
  reconcile();
  return api;
}
