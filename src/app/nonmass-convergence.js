export const VERSION = "nonmass-d3-d6-convergence-v2";
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
  if (n === 2) return "examination";
  if (n >= 3 && n <= 6) return "in-confessional";
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

function element(win, tag, className, text) {
  const node = win.document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function button(win, text, attrs, className) {
  const node = element(win, "button", className || "", text);
  node.type = "button";
  Object.entries(attrs || {}).forEach(function (entry) {
    node.setAttribute(entry[0], String(entry[1]));
  });
  return node;
}

function closeVisibleLegacy(win) {
  try { win.AO_V37_SHELL?.close?.(); } catch {}
  try { win.AO_EUCHARISTIC_V354?.close?.(); } catch {}
  try { win.AO_TRADITION_V383?.close?.({ restore: false }); } catch {}
}

function prayerReturnContext() {
  return { surface: "domain", domain: "pray" };
}

function openPrayer(win, id) {
  closeD3(win, false);
  return Boolean(win.AOTraditionalPrayerBook?.openPrayer?.(id, { returnContext: prayerReturnContext() }));
}

function openHistoricalMethod(win, id) {
  closeD3(win, false);
  return Boolean(win.AO_TRADITION_V383?.open?.(id, { returnContext: prayerReturnContext() }));
}

function openBenediction(win) {
  try { win.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, "exposed"); } catch {}
  closeD3(win, false);
  return Boolean(win.AOTraditionalPrayerBook?.openModule?.("benediction", { returnContext: prayerReturnContext() }));
}

function d3Root(win) {
  let root = win.document.getElementById("ao-d3-adoration");
  if (root) return root;
  root = element(win, "section", "aoD3Root");
  root.id = "ao-d3-adoration";
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  win.document.body.appendChild(root);
  return root;
}

function d3State(win) {
  if (!win.__AO_D3_STATE) {
    win.__AO_D3_STATE = { view: "home", depth: "simple", holyStep: 0, fourStep: 0 };
  }
  return win.__AO_D3_STATE;
}

function presence(win) {
  try {
    return win.sessionStorage?.getItem?.(ADORATION_SESSION_KEY) === "exposed" ? "exposed" : "reserved";
  } catch {
    return "reserved";
  }
}

function setPresence(win, value) {
  const next = value === "exposed" ? "exposed" : "reserved";
  try { win.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, next); } catch {}
  scrubPersistedAdoration(win);
  renderD3(win);
}

function d3Header(win, title, subtitle) {
  const head = element(win, "header", "aoD3Head");
  const back = button(win, "←", { "data-ao-d3-back": "1", "aria-label": L(win, "Back", "Retour") }, "aoD3Icon");
  const identity = element(win, "div", "aoD3Identity");
  const small = element(win, "small", "", L(win, "PRAY · EUCHARISTIC LIFE", "PRIER · VIE EUCHARISTIQUE"));
  const h = element(win, "h1", "", title);
  identity.append(small, h);
  if (subtitle) identity.appendChild(element(win, "p", "", subtitle));
  const close = button(win, "×", { "data-ao-d3-close": "1", "aria-label": L(win, "Close", "Fermer") }, "aoD3Icon");
  head.append(back, identity, close);
  return head;
}

function d3Card(win, mode, kicker, title, copy) {
  const b = button(win, "", { "data-ao-d3-mode": mode }, "aoD3Card");
  b.append(
    element(win, "small", "", kicker),
    element(win, "b", "", title),
    element(win, "span", "", copy)
  );
  return b;
}

function d3PrayerButton(win, id, label) {
  return button(win, label, { "data-ao-d3-prayer": id }, "aoD3Secondary");
}

function renderD3Home(win, root) {
  root.appendChild(d3Header(
    win,
    L(win, "Adoration & Visit", "Adoration et visite"),
    L(win, "Choose the situation that is actually before you", "Choisissez la situation réellement présente")
  ));
  const main = element(win, "main", "aoD3Body");
  const intro = element(
    win,
    "p",
    "aoD3Lead",
    L(
      win,
      "Private visits, silent adoration and the public rite of Exposition and Benediction are kept distinct. The app follows the situation; it does not manufacture a rite.",
      "Les visites privées, l’adoration silencieuse et le rite public de l’Exposition et de la Bénédiction restent distincts. L’application suit la situation ; elle ne fabrique pas de rite."
    )
  );
  const grid = element(win, "div", "aoD3Grid");
  grid.append(
    d3Card(
      win,
      "visit",
      L(win, "PRIVATE", "PRIVÉ"),
      L(win, "Visit to the Blessed Sacrament", "Visite au Saint-Sacrement"),
      L(win, "Simple visit or a sourced traditional method", "Visite simple ou méthode traditionnelle sourcée")
    ),
    d3Card(
      win,
      "adoration",
      L(win, "PRIVATE / EXPOSED", "PRIVÉ / EXPOSÉ"),
      L(win, "Adoration", "Adoration"),
      L(win, "Silence first · optional guided methods", "Silence d’abord · méthodes guidées facultatives")
    ),
    d3Card(
      win,
      "benediction",
      L(win, "PUBLIC RITE", "RITE PUBLIC"),
      L(win, "Exposition & Benediction", "Exposition et Bénédiction"),
      L(win, "Follow the service actually being celebrated", "Suivre l’office réellement célébré")
    ),
    d3Card(
      win,
      "treasury",
      L(win, "TEXTS", "TEXTES"),
      L(win, "Eucharistic Treasury", "Trésor eucharistique"),
      L(win, "Shared sourced prayer corpus · no duplicate texts", "Corpus commun de prières sourcées · aucun doublon")
    )
  );
  main.append(intro, grid);
  root.appendChild(main);
}

function depthSwitcher(win, state) {
  const box = element(win, "div", "aoD3Depth");
  box.setAttribute("role", "group");
  box.setAttribute("aria-label", L(win, "Depth", "Profondeur"));
  ["simple", "guided"].forEach(function (mode) {
    const b = button(
      win,
      mode === "simple" ? L(win, "Simple", "Simple") : L(win, "Guided", "Guidé"),
      { "data-ao-d3-depth": mode, "aria-pressed": state.depth === mode ? "true" : "false" },
      state.depth === mode ? "active" : ""
    );
    box.appendChild(b);
  });
  return box;
}

function renderVisit(win, root, state) {
  root.appendChild(d3Header(win, L(win, "Visit to the Blessed Sacrament", "Visite au Saint-Sacrement")));
  const main = element(win, "main", "aoD3Body");
  main.appendChild(depthSwitcher(win, state));
  if (state.depth === "simple") {
    const sequence = element(win, "ol", "aoD3Sequence");
    [
      L(win, "Arrive and become recollected.", "Arrivez et recueillez-vous."),
      L(win, "Adore and make an act of faith.", "Adorez et faites un acte de foi."),
      L(win, "Give thanks and speak simply to Our Lord.", "Rendez grâce et parlez simplement à Notre-Seigneur."),
      L(win, "Present repentance, needs and petitions.", "Présentez votre repentir, vos besoins et vos demandes."),
      L(win, "Finish in silence rather than filling every moment with text.", "Terminez dans le silence plutôt que de remplir chaque instant de texte.")
    ].forEach(function (copy) { sequence.appendChild(element(win, "li", "", copy)); });
    const actions = element(win, "div", "aoD3Actions");
    actions.append(
      d3PrayerButton(win, "foundations_act_of_faith", L(win, "Act of Faith", "Acte de foi")),
      d3PrayerButton(win, "adoration_spiritual_communion", L(win, "Spiritual Communion", "Communion spirituelle"))
    );
    main.append(sequence, actions);
  } else {
    const note = element(
      win,
      "p",
      "aoD3Lead",
      L(
        win,
        "Use an actual historical devotional method rather than an invented timer sequence.",
        "Utilisez une véritable méthode dévotionnelle historique plutôt qu’une séquence chronométrée inventée."
      )
    );
    const actions = element(win, "div", "aoD3Actions");
    actions.append(
      button(win, L(win, "Lasance · guided historical method", "Lasance · méthode historique guidée"), { "data-ao-d3-historical": "pray.adoration" }, "aoD3Primary"),
      button(win, L(win, "Baltimore · historical Visit", "Baltimore · visite historique"), { "data-ao-d3-historical": "pray.visit_blessed_sacrament" }, "aoD3Secondary")
    );
    main.append(note, actions);
  }
  root.appendChild(main);
}

const HOLY_STEPS = Object.freeze([
  ["Gethsemane", "Place yourself with Our Lord in Gethsemane. Read or recall the Gospel scene, then stop adding words."],
  ["Reparation", "Acknowledge sin beginning with your own need for mercy. Make reparation without turning prayer into self-accusation."],
  ["Intercession", "Pray for the Church, priests, the suffering and those entrusted to you."],
  ["Surrender", "Place one fear, duty or suffering before God and accept His will without pretending the difficulty is unreal."],
  ["Final silence", "Put the phone down. Finish with silence and, when ready to leave, a brief act of love."]
]);

const FOUR_STEPS = Object.freeze([
  ["Adoration", "Adore God for who He is, not first for what He gives."],
  ["Thanksgiving", "Give thanks for creation, redemption, the Eucharist and concrete graces."],
  ["Reparation", "Acknowledge sin and offer reparation for offences against God."],
  ["Petition", "Present the needs of the Church, others and yourself."],
  ["Return to silence", "The method is finished. Stop adding material and remain in simple adoration."]
]);

function guidedStep(win, state, kind, rows) {
  const index = kind === "holy" ? state.holyStep : state.fourStep;
  const row = rows[Math.max(0, Math.min(rows.length - 1, index))];
  const wrap = element(win, "section", "aoD3Guided");
  const rail = element(win, "div", "aoD3MiniRail");
  rows.forEach(function (item, i) {
    const dot = element(win, "span", i === index ? "active" : "", String(i + 1));
    dot.setAttribute("aria-label", item[0]);
    rail.appendChild(dot);
  });
  const card = element(win, "article", "aoD3GuideCard");
  card.append(
    element(win, "small", "", (index + 1) + " / " + rows.length),
    element(win, "h2", "", L(win, row[0], row[0])),
    element(win, "p", "", L(win, row[1], row[1]))
  );
  const nav = element(win, "div", "aoD3Nav");
  const prev = button(win, "← " + L(win, "Previous", "Précédent"), { "data-ao-d3-step-prev": kind }, "aoD3Secondary");
  prev.disabled = index === 0;
  const next = button(
    win,
    index === rows.length - 1 ? L(win, "Return to Adoration", "Revenir à l’adoration") : L(win, "Continue", "Continuer") + " →",
    { "data-ao-d3-step-next": kind },
    "aoD3Primary"
  );
  nav.append(prev, next);
  wrap.append(rail, card, nav);
  return wrap;
}

function presenceBar(win) {
  const active = presence(win);
  const box = element(win, "section", "aoD3Presence");
  box.appendChild(element(win, "small", "", L(win, "SACRAMENTAL SITUATION · THIS SESSION ONLY", "SITUATION SACRAMENTELLE · CETTE SESSION UNIQUEMENT")));
  const group = element(win, "div", "aoD3PresenceButtons");
  [["reserved", L(win, "Reserved", "Réservé")], ["exposed", L(win, "Exposed", "Exposé")]].forEach(function (entry) {
    group.appendChild(button(
      win,
      entry[1],
      { "data-ao-d3-presence": entry[0], "aria-pressed": active === entry[0] ? "true" : "false" },
      active === entry[0] ? "active" : ""
    ));
  });
  box.appendChild(group);
  return box;
}

function renderAdoration(win, root, state) {
  root.appendChild(d3Header(win, L(win, "Adoration", "Adoration")));
  const main = element(win, "main", "aoD3Body");
  main.appendChild(presenceBar(win));
  const exposed = presence(win) === "exposed";
  const notice = element(
    win,
    "p",
    "aoD3Lead",
    exposed
      ? L(
          win,
          "The Blessed Sacrament is exposed. Follow Scripture, Eucharistic prayer, sacred song and silence. If the public service moves to Benediction, the public rite takes priority.",
          "Le Saint-Sacrement est exposé. Suivez l’Écriture, la prière eucharistique, le chant sacré et le silence. Si l’office public passe à la Bénédiction, le rite public a priorité."
        )
      : L(
          win,
          "Silence is the default. You do not need to complete a sequence. Optional guidance is available when it helps recollection.",
          "Le silence est le point de départ. Vous n’avez pas à accomplir une séquence. Un guide facultatif est disponible lorsqu’il aide au recueillement."
        )
  );
  main.appendChild(notice);
  const actions = element(win, "div", "aoD3Actions");
  actions.append(
    button(win, L(win, "Gethsemane Holy Hour", "Heure Sainte à Gethsémani"), { "data-ao-d3-method": "holy" }, "aoD3Primary"),
    button(win, L(win, "Four Ends", "Quatre fins"), { "data-ao-d3-method": "four" }, "aoD3Secondary"),
    d3PrayerButton(win, "foundations_prayer_of_adoration", L(win, "Short Act of Adoration", "Court acte d’adoration")),
    d3PrayerButton(win, "adoration_spiritual_communion", L(win, "Spiritual Communion", "Communion spirituelle"))
  );
  if (exposed) {
    actions.appendChild(button(win, L(win, "Follow Benediction", "Suivre la Bénédiction"), { "data-ao-d3-benediction": "1" }, "aoD3Primary"));
  }
  main.appendChild(actions);
  root.appendChild(main);
}

function renderGuided(win, root, state, kind) {
  root.appendChild(d3Header(
    win,
    kind === "holy" ? L(win, "Gethsemane Holy Hour", "Heure Sainte à Gethsémani") : L(win, "Four Ends", "Quatre fins")
  ));
  const main = element(win, "main", "aoD3Body");
  main.appendChild(presenceBar(win));
  if (presence(win) === "exposed") {
    main.appendChild(element(
      win,
      "p",
      "aoD3Lead",
      L(
        win,
        "Public worship always outranks this private guide. Stop the guide when clergy lead the service or Benediction begins.",
        "Le culte public a toujours priorité sur ce guide privé. Arrêtez le guide lorsque le clergé conduit l’office ou lorsque la Bénédiction commence."
      )
    ));
  }
  main.appendChild(guidedStep(win, state, kind, kind === "holy" ? HOLY_STEPS : FOUR_STEPS));
  root.appendChild(main);
}

function renderTreasury(win, root) {
  root.appendChild(d3Header(win, L(win, "Eucharistic Treasury", "Trésor eucharistique")));
  const main = element(win, "main", "aoD3Body");
  main.appendChild(element(
    win,
    "p",
    "aoD3Lead",
    L(
      win,
      "These links reuse the canonical Prayer Book records. Service-linked hymns are labelled separately from private prayer.",
      "Ces liens réutilisent les notices canoniques du Livre de prières. Les hymnes liés à l’office sont distingués des prières privées."
    )
  ));
  const groups = [
    [
      L(win, "Private prayer", "Prière privée"),
      [
        ["foundations_prayer_of_adoration", L(win, "Act of Adoration", "Acte d’adoration")],
        ["adoration_anima_christi", "Anima Christi"],
        ["adoration_spiritual_communion", L(win, "Spiritual Communion", "Communion spirituelle")],
        ["adoration_litany_blessed_sacrament", L(win, "Litany of the Blessed Sacrament", "Litanies du Saint-Sacrement")]
      ]
    ],
    [
      L(win, "Communion-related", "Lié à la Communion"),
      [["adoration_lord_i_am_not_worthy", "Domine, non sum dignus"]]
    ],
    [
      L(win, "Public / service-linked", "Public / lié à l’office"),
      [
        ["benediction_o_salutaris", "O Salutaris Hostia"],
        ["benediction_tantum_ergo", "Tantum Ergo"],
        ["benediction_divine_praises", L(win, "Divine Praises", "Louanges divines")]
      ]
    ]
  ];
  groups.forEach(function (group) {
    const section = element(win, "section", "aoD3TreasuryGroup");
    section.appendChild(element(win, "h2", "", group[0]));
    const list = element(win, "div", "aoD3Actions");
    group[1].forEach(function (entry) { list.appendChild(d3PrayerButton(win, entry[0], entry[1])); });
    section.appendChild(list);
    main.appendChild(section);
  });
  root.appendChild(main);
}

function renderD3(win) {
  const root = d3Root(win);
  if (!root.classList.contains("open")) return;
  const state = d3State(win);
  root.innerHTML = "";
  if (state.view === "home") renderD3Home(win, root);
  else if (state.view === "visit") renderVisit(win, root, state);
  else if (state.view === "adoration") renderAdoration(win, root, state);
  else if (state.view === "holy") renderGuided(win, root, state, "holy");
  else if (state.view === "four") renderGuided(win, root, state, "four");
  else if (state.view === "treasury") renderTreasury(win, root);
  else renderD3Home(win, root);
}

function openD3(win) {
  closeVisibleLegacy(win);
  const state = d3State(win);
  state.view = "home";
  state.depth = "simple";
  const root = d3Root(win);
  root.classList.add("open");
  root.setAttribute("aria-hidden", "false");
  win.document.body.classList.add("aoD3Open");
  renderD3(win);
  win.queueMicrotask(function () { root.querySelector("button")?.focus?.(); });
  return true;
}

function closeD3(win, restore = true) {
  const root = win.document.getElementById("ao-d3-adoration");
  if (root) {
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
  }
  win.document.body.classList.remove("aoD3Open");
  if (restore) win.queueMicrotask(function () { win.AO_V37_SHELL?.openDomain?.("pray"); });
}

function oldPrayerState(win) {
  try { return win.AOTraditionalPrayerBook?.getState?.() || null; } catch { return null; }
}

function makeMacroRail(win, labels, active, attr) {
  const rail = element(win, "div", attr === "d4" ? "aoD4StageRail" : "aoD5PhaseRail");
  rail.dataset[attr === "d4" ? "aoD4StageRail" : "aoD5PhaseRail"] = "1";
  labels.forEach(function (entry) {
    const span = element(win, "span", entry[0] === active ? "active" : "", entry[1]);
    span.dataset.phase = entry[0];
    if (entry[0] === active) span.setAttribute("aria-current", "step");
    rail.appendChild(span);
  });
  return rail;
}

function confessionExamData(win) {
  if (isFrench(win)) {
    return [
      ["1 · Dieu d’abord", ["Ai-je négligé la prière ou rejeté sciemment la foi ?", "Ai-je placé la superstition, la divination, l’argent ou l’approbation humaine au-dessus de la confiance en Dieu ?"]],
      ["2 · Révérence", ["Ai-je employé le nom de Dieu avec mépris ou fait un faux serment ?", "Ai-je traité les choses sacrées sans respect ?"]],
      ["3 · Culte et repos", ["Ai-je manqué délibérément la Messe du dimanche ou un jour d’obligation sans raison grave ?", "Ai-je empêché sans nécessité d’autres personnes d’accomplir leur devoir religieux ou de prendre un repos raisonnable ?"]],
      ["4 · Famille et autorité", ["Ai-je négligé le soin, le respect ou les responsabilités justes dans ma famille ?", "Ai-je abusé de mon autorité, manipulé quelqu’un ou exigé une obéissance injuste ?"]],
      ["5 · Vie et charité", ["Ai-je volontairement fait du tort à quelqu’un, encouragé la violence ou choisi la vengeance ?", "Ai-je négligé le soin raisonnable de la vie et de la santé, ou l’aide que j’avais le devoir de donner ?"]],
      ["6 · Chasteté et fidélité", ["Ai-je librement choisi des actes contraires à la chasteté, la pornographie ou l’infidélité ?", "Ai-je traité une personne comme un objet au lieu de respecter sa dignité ?"]],
      ["7 · Justice", ["Ai-je volé, trompé, retenu un juste salaire ou mal employé un bien qui m’était confié ?", "Ai-je refusé de réparer un dommage matériel alors que je le pouvais ?"]],
      ["8 · Vérité", ["Ai-je menti, calomnié, médit injustement ou trahi une confidence ?", "Ai-je omis de corriger une fausseté ou de réparer une réputation que j’avais lésée ?"]],
      ["9 · Pureté du cœur", ["Ai-je volontairement entretenu des désirs contraires à la fidélité et à la chasteté ?", "Je distingue une pensée ou tentation non voulue du choix délibéré de l’entretenir."]],
      ["10 · Détachement", ["Ai-je laissé l’envie ou l’avidité gouverner mes choix ?", "Ai-je regretté le bien d’autrui ou négligé la générosité selon mes moyens ?"]]
    ];
  }
  return [
    ["1 · God first", ["Have I neglected prayer or knowingly rejected the faith?", "Have I placed superstition, divination, money or approval above trust in God?"]],
    ["2 · Reverence", ["Have I used God’s name contemptuously or sworn falsely?", "Have I treated sacred things irreverently?"]],
    ["3 · Worship and rest", ["Have I deliberately missed Sunday Mass or a binding holy day without a serious reason?", "Have I needlessly prevented others from worship or reasonable rest?"]],
    ["4 · Family and authority", ["Have I neglected care, respect or just responsibilities within my family?", "Have I misused authority, manipulated another person or demanded unjust obedience?"]],
    ["5 · Life and charity", ["Have I deliberately harmed someone, encouraged violence or chosen revenge?", "Have I neglected reasonable care for life and health, or help I was responsible for giving?"]],
    ["6 · Chastity and fidelity", ["Have I freely chosen sexual acts contrary to chastity, pornography or infidelity?", "Have I treated another person as an object rather than respected their dignity?"]],
    ["7 · Justice", ["Have I stolen, cheated, withheld just payment or misused property entrusted to me?", "Have I refused to repair financial harm when able?"]],
    ["8 · Truth", ["Have I lied, slandered, gossiped unjustly or betrayed a confidence?", "Have I failed to correct a falsehood or restore a reputation I harmed?"]],
    ["9 · Purity of heart", ["Have I deliberately cultivated desires contrary to fidelity and chastity?", "Distinguish an unwanted thought or temptation from a deliberate choice to entertain it."]],
    ["10 · Detachment", ["Have I allowed envy or greed to govern my choices?", "Have I resented another person’s good or neglected generosity within my means?"]]
  ];
}

function buildConfessionExam(win) {
  const surface = element(win, "section", "aoD5ExamSurface");
  surface.dataset.aoD5ExamSurface = "1";
  surface.appendChild(element(
    win,
    "p",
    "aoD5ExamIntro",
    L(
      win,
      "Review freely chosen actions and omissions since your last Confession. These prompts are for reflection only; nothing is selected, scored or stored.",
      "Repassez devant Dieu les actes et omissions librement choisis depuis votre dernière confession. Ces questions servent seulement à la réflexion ; rien n’est sélectionné, noté ou enregistré."
    )
  ));
  confessionExamData(win).forEach(function (section) {
    const details = element(win, "details", "aoD5ExamSection");
    details.appendChild(element(win, "summary", "", section[0]));
    const list = element(win, "ul", "");
    section[1].forEach(function (prompt) { list.appendChild(element(win, "li", "", prompt)); });
    details.appendChild(list);
    surface.appendChild(details);
  });
  surface.appendChild(element(
    win,
    "p",
    "aoD5Privacy",
    L(
      win,
      "Enough: when the examination is sufficient, stop examining and move to contrition. No sin list or certainty score is created.",
      "Assez : lorsque l’examen est suffisant, cessez d’examiner et passez à la contrition. Aucune liste de péchés ni aucun score de certitude n’est créé."
    )
  ));
  return surface;
}

function patchConfession(win) {
  const root = win.document.getElementById("aoPrayerBookRoot");
  const state = oldPrayerState(win);
  if (!root?.classList.contains("open") || state?.view !== "confession") return;
  const stage = Number(state.confStep || 0);
  const phase = confessionPhaseForStage(stage);
  const stageKey = String(stage);
  if (root.dataset.aoD5PatchedStage === stageKey && root.querySelector("[data-ao-d5-phase-rail]")) return;
  root.dataset.aoD5Integrated = "1";
  root.querySelectorAll(".pbProgress").forEach(function (node) { node.hidden = true; node.setAttribute("aria-hidden", "true"); });
  root.querySelectorAll(".pbFlowCard .pbKicker").forEach(function (node) { node.hidden = true; });
  // D5 owns the visible five-phase navigation. Hide any exact donor N / M counter
  // so the old eight-step presentation cannot compete with the macro rail.
  root.querySelectorAll(".pbFlowCard *").forEach(function (node) {
    if (/^\s*\d+\s*\/\s*\d+\s*$/.test(String(node.textContent || ""))) {
      node.hidden = true;
      node.setAttribute("aria-hidden", "true");
      node.dataset.aoD5LegacyCounter = "hidden";
    }
  });
  // Some donor builds render the N / 8 counter as a bare text node rather than
  // a dedicated element. Remove only standalone counter text so the five-phase
  // D5 navigation remains the sole visible progress model.
  const flowCard = root.querySelector(".pbFlowCard");
  if (flowCard) {
    const scrub = function (node) {
      Array.from(node.childNodes || []).forEach(function (child) {
        if (child.nodeType === 3) {
          if (/^\s*\d+\s*\/\s*\d+\s*$/.test(String(child.nodeValue || ""))) {
            child.nodeValue = "";
          }
          return;
        }
        scrub(child);
      });
    };
    scrub(flowCard);
  }
  const existingRail = root.querySelector("[data-ao-d5-phase-rail]");
  if (existingRail) existingRail.remove();
  const anchor = root.querySelector(".pbHero") || root.querySelector(".lab-view-head,.pbTop");
  if (anchor) {
    const labels = isFrench(win)
      ? [["doctrine", "Doctrine"], ["prepare", "Préparer"], ["examination", "Examen"], ["in-confessional", "Au confessionnal"], ["after", "Après"]]
      : [["doctrine", "Doctrine"], ["prepare", "Prepare"], ["examination", "Examination"], ["in-confessional", "In Confessional"], ["after", "After"]];
    anchor.insertAdjacentElement("afterend", makeMacroRail(win, labels, phase, "d5"));
  }

  const exam = root.querySelector(".pbInfoDetails");
  if (exam) {
    exam.hidden = true;
    exam.setAttribute("aria-hidden", "true");
    exam.querySelectorAll("input").forEach(function (node) { node.remove(); });
  }
  root.querySelectorAll("[data-ao-d5-exam-surface]").forEach(function (node) { node.remove(); });
  if (stage === 2) {
    const examSurface = buildConfessionExam(win);
    const rail = root.querySelector("[data-ao-d5-phase-rail]");
    if (rail) rail.insertAdjacentElement("afterend", examSurface);
    else (root.querySelector(".pbHero") || root.querySelector(".pbTop"))?.insertAdjacentElement("afterend", examSurface);
  }

  const card = root.querySelector(".pbFlowCard");
  if (card) {
    if (stage === 0) {
      card.innerHTML = "";
      card.append(
        element(win, "h2", "", L(win, "What the Church teaches", "Ce qu’enseigne l’Église")),
        element(win, "p", "", L(
          win,
          "The penitent approaches the sacrament with contrition, confession and satisfaction; sacramental absolution belongs to the priest. Ad Orientem assists preparation but never judges validity or simulates absolution.",
          "Le pénitent approche le sacrement avec contrition, confession et satisfaction ; l’absolution sacramentelle appartient au prêtre. Ad Orientem aide à la préparation mais ne juge jamais la validité et ne simule jamais l’absolution."
        ))
      );
    } else if (stage === 1) {
      card.innerHTML = "";
      card.append(
        element(win, "h2", "", L(win, "Prepare before God", "Se préparer devant Dieu")),
        element(win, "p", "", L(
          win,
          "Become recollected, ask for light, recall approximately how long it has been since your last Confession, and prepare sufficiently without chasing absolute certainty.",
          "Recueillez-vous, demandez la lumière, rappelez-vous approximativement depuis combien de temps remonte votre dernière confession et préparez-vous suffisamment sans rechercher une certitude absolue."
        )),
        d3PrayerButton(win, "sacrament_come_holy_spirit", L(win, "Prayer for light", "Prière pour demander la lumière"))
      );
      card.querySelector("[data-ao-d3-prayer]")?.setAttribute("data-ao-d5-prayer", "sacrament_come_holy_spirit");
      card.querySelector("[data-ao-d3-prayer]")?.removeAttribute("data-ao-d3-prayer");
    } else if (stage === 2) {
      card.innerHTML = "";
      card.append(
        element(win, "h2", "", L(win, "Examine your conscience", "Examinez votre conscience")),
        element(win, "p", "", L(
          win,
          "Read the prompts slowly. They are questions for reflection, not boxes to tick. Stop when the examination is sufficient and move to contrition.",
          "Lisez lentement les questions. Ce sont des points de réflexion, non des cases à cocher. Arrêtez lorsque l’examen est suffisant et passez à la contrition."
        )),
        element(win, "p", "aoD5Privacy", L(
          win,
          "Nothing in the examination is stored as a sin list or converted into a score.",
          "Rien dans l’examen n’est enregistré comme liste de péchés ni transformé en score."
        ))
      );
    } else if (stage === 3) {
      card.innerHTML = "";
      card.append(
        element(win, "h2", "", L(win, "In the confessional", "Au confessionnal")),
        element(win, "p", "", L(
          win,
          "Begin simply if useful: “Bless me, Father, for I have sinned…” is customary, not mandatory. Confess remembered grave sins by kind and number. If the exact number is genuinely uncertain, give the best truthful estimate and say that you are estimating. Then confess other sins you wish to bring.",
          "Commencez simplement si cela vous aide : « Mon Père, bénissez-moi parce que j’ai péché… » est une formule d’usage, non obligatoire. Confessez les péchés graves dont vous vous souvenez selon leur espèce et leur nombre. Si le nombre exact est réellement incertain, donnez votre meilleure estimation sincère et précisez qu’il s’agit d’une estimation. Confessez ensuite les autres péchés que vous souhaitez accuser."
        )),
        element(win, "p", "aoD5PutAway", L(
          win,
          "Put the phone away for the sacrament itself. Listen to the priest, receive the penance, make your Act of Contrition when directed, and attend to absolution.",
          "Rangez le téléphone pour le sacrement lui-même. Écoutez le prêtre, recevez la pénitence, faites l’Acte de contrition lorsqu’il vous y invite et soyez attentif à l’absolution."
        ))
      );
    }
  }

  const walker = win.document.createTreeWalker(root, win.NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(function (node) {
    node.nodeValue = String(node.nodeValue || "")
      .replace(/by kind and approximate number/gi, "by kind and number")
      .replace(/selon leur espèce et leur nombre approximatif/gi, "selon leur espèce et leur nombre");
  });
  root.dataset.aoD5PatchedStage = stageKey;
}

function benedictionPhase(stage) {
  if (stage <= 0) return "exposition";
  if (stage === 1) return "adoration";
  if (stage >= 6) return "reposition";
  return "benediction";
}

function patchBenediction(win) {
  const root = win.document.getElementById("aoPrayerBookRoot");
  const state = oldPrayerState(win);
  if (!root?.classList.contains("open") || state?.view !== "benediction") return;
  const stage = Number(state.benedictionStep || 0);
  const stageKey = String(stage);
  if (root.dataset.aoD4PatchedStage === stageKey && root.querySelector("[data-ao-d4-stage-rail]")) return;
  root.dataset.aoD4Integrated = "1";
  root.querySelectorAll(".pbProgress").forEach(function (node) { node.hidden = true; node.setAttribute("aria-hidden", "true"); });
  const existingRail = root.querySelector("[data-ao-d4-stage-rail]");
  if (existingRail) existingRail.remove();
  const anchor = root.querySelector(".lab-view-head,.pbTop");
  if (anchor) {
    const labels = isFrench(win)
      ? [["exposition", "Exposition"], ["adoration", "Adoration"], ["benediction", "Bénédiction"], ["reposition", "Reposition"]]
      : [["exposition", "Exposition"], ["adoration", "Adoration"], ["benediction", "Benediction"], ["reposition", "Reposition"]];
    anchor.insertAdjacentElement("afterend", makeMacroRail(win, labels, benedictionPhase(stage), "d4"));
  }
  const card = root.querySelector(".pbFlowCard");
  if (card && !card.querySelector("[data-ao-d4-note]")) {
    const note = element(win, "p", "aoD4Note");
    note.dataset.aoD4Note = "1";
    if (stage === 0) {
      note.textContent = L(win, "If O Salutaris is actually used here, sing or pray it with the church; otherwise follow the approved service being celebrated.", "Si O Salutaris est effectivement utilisé ici, chantez-le ou priez-le avec l’assemblée ; sinon suivez l’office approuvé réellement célébré.");
    } else if (stage === 1) {
      note.textContent = L(win, "This period is open-ended. Follow the Scripture, prayer, sacred music and silence actually being used; do not advance merely because the app has a next button.", "Cette période est de durée libre. Suivez l’Écriture, la prière, la musique sacrée et le silence réellement utilisés ; n’avancez pas simplement parce que l’application possède un bouton Suivant.");
    } else if (stage === 3) {
      note.textContent = L(win, "Minister: versicle and collect. All: response. Do not race ahead of the public rite.", "Ministre : verset et oraison. Tous : répons. Ne devancez pas le rite public.");
    } else if (stage === 4) {
      note.textContent = L(win, "Stop interacting with the phone and receive the Eucharistic blessing.", "Cessez d’interagir avec le téléphone et recevez la bénédiction eucharistique.");
    } else if (stage === 5) {
      note.textContent = L(win, "The placement of the Divine Praises depends on the approved service and local jurisdiction. Follow what is actually being celebrated.", "La place des Louanges divines dépend de l’office approuvé et de la juridiction locale. Suivez ce qui est réellement célébré.");
    } else if (stage >= 6) {
      note.textContent = L(win, "Reposition is the actual return of the Blessed Sacrament to the tabernacle. The service does not end merely because the blessing has occurred.", "La reposition est le retour effectif du Saint-Sacrement au tabernacle. L’office ne se termine pas simplement parce que la bénédiction a eu lieu.");
    } else {
      note.textContent = L(win, "Follow the actual public service; the app is a companion, not the celebrant.", "Suivez l’office public réel ; l’application est un compagnon, non le célébrant.");
    }
    card.prepend(note);
  }
  try {
    win.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, stage >= 6 ? "reserved" : "exposed");
  } catch {}
  root.dataset.aoD4PatchedStage = stageKey;
}

function sourceFamilyRows(win) {
  return isFrench(win)
    ? [
        ["Livres liturgiques et base 1962", "Missel romain de 1962, Rubriques générales de 1960 et sources normatives applicables."],
        ["Calendrier et Propre", "L’autorité liturgique est distinguée du fournisseur numérique des données."],
        ["Écriture", "Les éditions et la provenance sont indiquées par langue dans le lecteur biblique."],
        ["Commentaire", "Les commentaires patristiques ou traditionnels restent attribués à leurs auteurs et éditions."],
        ["Doctrine et catéchisme", "Les textes doctrinaux gardent leur corpus et leur niveau d’autorité propres."],
        ["Prières et méthodes dévotionnelles", "Les témoins historiques et manuels traditionnels ne sont pas présentés comme loi liturgique."],
        ["Autorités des programmes", "Premier vendredi et premier samedi distinguent l’autorité du programme des sources de leurs composants."],
        ["Art sacré", "Artiste, œuvre, collection et droits sont conservés lorsqu’ils sont connus."]
      ]
    : [
        ["Liturgical books & 1962 basis", "The 1962 Roman Missal, 1960 General Rubrics and applicable normative sources control liturgical claims."],
        ["Calendar & Proper data", "Liturgical authority is kept distinct from the digital provider supplying data."],
        ["Scripture", "Edition and provenance are identified by language in the Scripture reader."],
        ["Commentary", "Patristic and traditional commentary remains attributed to its author and edition."],
        ["Doctrine & Catechism", "Doctrinal texts retain their own corpus and authority level."],
        ["Prayer & devotional methods", "Historical witnesses and traditional manuals are not presented as liturgical law."],
        ["Programme authorities", "First Friday and First Saturday keep programme authority distinct from component sources."],
        ["Sacred art", "Artist, work, collection and rights are retained where known."]
      ];
}

function patchAboutSettings(win) {
  const root = win.document.getElementById("ao-settings-v4359");
  if (!root || root.hidden) return;
  if (win.document.documentElement.dataset.aoSettingsRoute !== "/settings/about-sources") return;
  const wrap = root.querySelector(".aoSetWrap");
  if (!wrap || wrap.dataset.aoD6About === "1") return;
  wrap.dataset.aoD6About = "1";
  wrap.innerHTML = "";

  wrap.appendChild(element(
    win,
    "div",
    "aoSetIntro",
    L(
      win,
      "Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.",
      "Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent."
    )
  ));

  const sourceSection = element(win, "section", "aoSetSection aoD6Sources");
  sourceSection.appendChild(element(win, "h2", "", L(win, "Sources", "Sources")));
  const group = element(win, "div", "aoSetGroup");
  sourceFamilyRows(win).forEach(function (row) {
    const details = element(win, "details", "aoD6SourceFamily");
    details.append(element(win, "summary", "", row[0]), element(win, "p", "", row[1]));
    group.appendChild(details);
  });
  sourceSection.appendChild(group);
  wrap.appendChild(sourceSection);

  const keySection = element(win, "section", "aoSetSection");
  keySection.appendChild(element(win, "h2", "", L(win, "How provenance is labelled", "Comment la provenance est indiquée")));
  const keyGroup = element(win, "div", "aoSetGroup aoD6Key");
  (isFrench(win)
    ? ["Source officielle / normative", "Source liturgique de 1962", "Témoin historique", "Méthode dévotionnelle traditionnelle", "Guide éditorial Ad Orientem", "Traduction / adaptation"]
    : ["Official / governing source", "1962 liturgical source", "Historical witness", "Traditional devotional source", "Ad Orientem editorial guidance", "Translation / adaptation"]
  ).forEach(function (value) { keyGroup.appendChild(element(win, "p", "", value)); });
  keySection.appendChild(keyGroup);
  wrap.appendChild(keySection);

  const aboutSection = element(win, "section", "aoSetSection");
  aboutSection.appendChild(element(win, "h2", "", L(win, "About Ad Orientem", "À propos d’Ad Orientem")));
  const aboutGroup = element(win, "div", "aoSetGroup aoD6AboutGroup");
  const version = canonicalAppVersion(win) || L(win, "Current release", "Version actuelle");
  const rows = isFrench(win)
    ? [
        ["Version de l’application", version],
        ["Confidentialité", "Les réglages et la progression sont conservés localement sauf indication contraire. Les péchés ne sont pas enregistrés."],
        ["Licences et remerciements", "Les textes et œuvres tiers conservent leurs notices de source et de licence."]
      ]
    : [
        ["Application version", version],
        ["Privacy", "Settings and progress are stored locally unless a feature says otherwise. Sins are not recorded."],
        ["Licences & acknowledgements", "Third-party texts and artworks retain their source and licence notices."]
      ];
  rows.forEach(function (row) {
    const div = element(win, "div", "aoD6AboutRow");
    div.append(element(win, "b", "", row[0]), element(win, "span", "", row[1]));
    aboutGroup.appendChild(div);
  });
  aboutSection.appendChild(aboutGroup);
  wrap.appendChild(aboutSection);
}

function installStyles(win) {
  if (win.document.getElementById("ao-nonmass-d3-d6-style")) return;
  const style = element(win, "style");
  style.id = "ao-nonmass-d3-d6-style";
  style.textContent = [
    "body.aoD3Open{overflow:hidden}",
    ".aoD3Root{display:none;position:fixed;inset:0;z-index:2147483150;background:var(--bg,#080c12);color:var(--text,#f3efe8);overflow:auto;padding-bottom:calc(78px + env(safe-area-inset-bottom,0px));font-family:var(--font-body,system-ui,sans-serif)}",
    ".aoD3Root.open{display:block}",
    ".aoD3Head{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;align-items:center;padding:calc(9px + env(safe-area-inset-top,0px)) 10px 9px;background:color-mix(in srgb,var(--bg,#080c12) 94%,transparent);border-bottom:1px solid var(--border,rgba(255,255,255,.12));backdrop-filter:blur(14px)}",
    ".aoD3Icon{width:42px;height:42px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:50%;background:var(--surface-1,#141a20);color:inherit;font-size:18px}",
    ".aoD3Identity{text-align:center;min-width:0}.aoD3Identity small{display:block;color:var(--liturgical,#c6a66b);font:700 .55rem/1.1 var(--font-display,system-ui);letter-spacing:.12em}.aoD3Identity h1{margin:3px 0 0;font:650 1.05rem/1.15 var(--font-display,system-ui)}.aoD3Identity p{margin:3px 0 0;color:var(--muted,#b8c0c7);font-size:.67rem}",
    ".aoD3Body{width:min(720px,100%);margin:0 auto;padding:18px 13px 34px}.aoD3Lead{margin:0 0 14px;color:var(--muted,#b8c0c7);font-size:.82rem;line-height:1.5}",
    ".aoD3Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.aoD3Card{min-height:128px;padding:14px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:15px;background:var(--surface-1,#141a20);color:inherit;text-align:left}.aoD3Card small{display:block;color:var(--liturgical,#c6a66b);font-size:.58rem;letter-spacing:.08em}.aoD3Card b{display:block;margin-top:8px;font:650 .94rem/1.25 var(--font-display,system-ui)}.aoD3Card span{display:block;margin-top:6px;color:var(--muted,#b8c0c7);font-size:.72rem;line-height:1.4}",
    ".aoD3Depth,.aoD3PresenceButtons,.aoD3Actions,.aoD3Nav{display:flex;gap:7px;flex-wrap:wrap}.aoD3Depth{margin-bottom:15px}.aoD3Depth button,.aoD3PresenceButtons button,.aoD3Primary,.aoD3Secondary{min-height:38px;padding:8px 11px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:10px;background:var(--surface-2,#10151a);color:inherit;font:650 .72rem/1.2 var(--font-display,system-ui)}.aoD3Depth button.active,.aoD3PresenceButtons button.active,.aoD3Primary{border-color:var(--liturgical,#c6a66b);background:var(--liturgical-soft,rgba(198,166,107,.12))}",
    ".aoD3Sequence{margin:4px 0 16px;padding-left:22px;color:var(--text,#f3efe8)}.aoD3Sequence li{margin:0 0 9px;line-height:1.45}",
    ".aoD3Presence{margin:0 0 15px;padding:11px 12px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:12px}.aoD3Presence small{display:block;margin-bottom:8px;color:var(--liturgical,#c6a66b);font-size:.56rem;letter-spacing:.08em}",
    ".aoD3Guided{display:grid;gap:12px}.aoD3MiniRail{display:flex;gap:5px}.aoD3MiniRail span{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:50%;color:var(--muted,#b8c0c7);font-size:.65rem}.aoD3MiniRail span.active{border-color:var(--liturgical,#c6a66b);color:var(--text,#f3efe8)}.aoD3GuideCard{padding:16px;border-left:2px solid var(--liturgical,#c6a66b);background:var(--liturgical-soft,rgba(198,166,107,.08));border-radius:0 12px 12px 0}.aoD3GuideCard small{color:var(--muted,#b8c0c7)}.aoD3GuideCard h2{margin:6px 0 8px;font-size:1rem}.aoD3GuideCard p{margin:0;line-height:1.5}",
    ".aoD3TreasuryGroup{margin:0 0 20px}.aoD3TreasuryGroup h2{margin:0 0 9px;color:var(--liturgical,#c6a66b);font-size:.74rem;letter-spacing:.06em;text-transform:uppercase}",
    ".aoD4StageRail,.aoD5PhaseRail{display:grid;gap:5px;padding:9px 12px 0}.aoD4StageRail{grid-template-columns:repeat(4,minmax(0,1fr))}.aoD5PhaseRail{grid-template-columns:repeat(5,minmax(0,1fr))}.aoD4StageRail span,.aoD5PhaseRail span{padding:7px 4px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;text-align:center;color:var(--muted,#b8c0c7);font-size:.59rem}.aoD4StageRail span.active,.aoD5PhaseRail span.active{border-color:var(--liturgical,#c6a66b);background:var(--liturgical-soft,rgba(198,166,107,.1));color:var(--text,#f3efe8)}",
    ".aoD4Note,.aoD5Privacy,.aoD5PutAway{margin:0 0 12px;padding:10px 11px;border-left:2px solid var(--liturgical,#c6a66b);background:var(--liturgical-soft,rgba(198,166,107,.08));color:var(--muted,#b8c0c7);font-size:.74rem;line-height:1.45}",
    ".aoD5ExamSurface{margin:12px 13px 16px;padding:12px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:14px;background:var(--surface-1,#141a20)}.aoD5ExamIntro{margin:0 0 10px;color:var(--muted,#b8c0c7);font-size:.75rem;line-height:1.45}.aoD5ExamSection{margin:7px 0;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:11px;padding:0 11px}.aoD5ExamSection summary{cursor:pointer;padding:10px 0;font-weight:650}.aoD5ExamSection ul{margin:0 0 11px;padding-left:20px}.aoD5ExamSection li{margin:5px 0;color:var(--muted,#b8c0c7);font-size:.76rem;line-height:1.4}",
    ".aoD6SourceFamily{padding:12px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09))}.aoD6SourceFamily:last-child{border-bottom:0}.aoD6SourceFamily summary{font-weight:650;cursor:pointer}.aoD6SourceFamily p{margin:8px 0 0;color:var(--muted,#b3bac0);font-size:.74rem;line-height:1.45}",
    ".aoD6Key p,.aoD6AboutRow{margin:0;padding:10px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09));font-size:.75rem}.aoD6Key p:last-child,.aoD6AboutRow:last-child{border-bottom:0}.aoD6AboutRow{display:grid;gap:4px}.aoD6AboutRow span{color:var(--muted,#b3bac0);line-height:1.4}",
    "@media(max-width:560px){.aoD3Grid{grid-template-columns:1fr}.aoD4StageRail span,.aoD5PhaseRail span{font-size:.52rem;padding:6px 2px}}"
  ].join("");
  win.document.head.appendChild(style);
}

function installRouting(win) {
  if (win.__AO_D3_ROUTING_INSTALLED) return;
  win.__AO_D3_ROUTING_INSTALLED = true;

  const originalOpenModule = win.AO_V37_SHELL?.openModule?.bind(win.AO_V37_SHELL);
  if (originalOpenModule) {
    win.AO_V37_SHELL.openModule = function (id, method) {
      if (id === "pray.adoration") return Promise.resolve({ ok: openD3(win), canonicalId: id, type: "module", domain: "pray", options: { method }, error: null });
      return originalOpenModule(id, method);
    };
  }

  const oldEucharisticOpen = win.AO_EUCHARISTIC_V354?.open?.bind(win.AO_EUCHARISTIC_V354);
  if (oldEucharisticOpen) {
    win.AO_EUCHARISTIC_V354.open = function (route) {
      if (route === "adoration") return openD3(win);
      return oldEucharisticOpen.apply(null, arguments);
    };
  }

  win.addEventListener("click", function (event) {
    const target = event.target?.closest?.(
      "[data-v37-open='pray.adoration'],[data-v383-open='pray.adoration'],[data-ao354-open='adoration'],[data-ao354-ador]"
    );
    if (!target || target.closest("#ao-d3-adoration")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openD3(win);
  }, true);
}

function reconcile(win) {
  scrubPersistedAdoration(win);
  patchConfession(win);
  patchBenediction(win);
  patchAboutSettings(win);
}

export function installNonMassConvergence({ win = globalThis } = {}) {
  if (!win?.document) return null;
  if (win.AO_NON_MASS_D3_D6_CONVERGENCE) return win.AO_NON_MASS_D3_D6_CONVERGENCE;

  installStyles(win);
  scrubPersistedAdoration(win);
  installRouting(win);

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    win.queueMicrotask(function () {
      scheduled = false;
      reconcile(win);
    });
  }

  win.addEventListener("click", function (event) {
    const root = event.target?.closest?.("#ao-d3-adoration");
    if (root) {
      const mode = event.target.closest?.("[data-ao-d3-mode]")?.dataset?.aoD3Mode;
      const state = d3State(win);
      if (mode) {
        if (mode === "benediction") { openBenediction(win); return; }
        state.view = mode;
        renderD3(win);
        return;
      }
      const depth = event.target.closest?.("[data-ao-d3-depth]")?.dataset?.aoD3Depth;
      if (depth) {
        state.depth = depth === "guided" ? "guided" : "simple";
        renderD3(win);
        return;
      }
      const p = event.target.closest?.("[data-ao-d3-presence]")?.dataset?.aoD3Presence;
      if (p) { setPresence(win, p); return; }
      const method = event.target.closest?.("[data-ao-d3-method]")?.dataset?.aoD3Method;
      if (method === "holy" || method === "four") {
        state.view = method;
        if (method === "holy") state.holyStep = 0;
        else state.fourStep = 0;
        renderD3(win);
        return;
      }
      const historical = event.target.closest?.("[data-ao-d3-historical]")?.dataset?.aoD3Historical;
      if (historical) { openHistoricalMethod(win, historical); return; }
      const prayer = event.target.closest?.("[data-ao-d3-prayer]")?.dataset?.aoD3Prayer;
      if (prayer) { openPrayer(win, prayer); return; }
      if (event.target.closest?.("[data-ao-d3-benediction]")) { openBenediction(win); return; }
      const prev = event.target.closest?.("[data-ao-d3-step-prev]")?.dataset?.aoD3StepPrev;
      if (prev === "holy") { state.holyStep = Math.max(0, state.holyStep - 1); renderD3(win); return; }
      if (prev === "four") { state.fourStep = Math.max(0, state.fourStep - 1); renderD3(win); return; }
      const next = event.target.closest?.("[data-ao-d3-step-next]")?.dataset?.aoD3StepNext;
      if (next === "holy") {
        if (state.holyStep >= HOLY_STEPS.length - 1) state.view = "adoration";
        else state.holyStep += 1;
        renderD3(win);
        return;
      }
      if (next === "four") {
        if (state.fourStep >= FOUR_STEPS.length - 1) state.view = "adoration";
        else state.fourStep += 1;
        renderD3(win);
        return;
      }
      if (event.target.closest?.("[data-ao-d3-close]")) { closeD3(win, true); return; }
      if (event.target.closest?.("[data-ao-d3-back]")) {
        if (state.view === "home") closeD3(win, true);
        else if (state.view === "holy" || state.view === "four") { state.view = "adoration"; renderD3(win); }
        else { state.view = "home"; renderD3(win); }
        return;
      }
    }

    const d5Prayer = event.target?.closest?.("[data-ao-d5-prayer]")?.dataset?.aoD5Prayer;
    if (d5Prayer) {
      event.preventDefault();
      event.stopImmediatePropagation();
      win.AOTraditionalPrayerBook?.openPrayer?.(d5Prayer, { returnContext: prayerReturnContext() });
      return;
    }

    const old = oldPrayerState(win);
    if (old?.view === "benediction" && event.target?.closest?.("[data-pb-ben-next]") && Number(old.benedictionStep || 0) >= 6) {
      try { win.sessionStorage?.setItem?.(ADORATION_SESSION_KEY, "reserved"); } catch {}
    }
    schedule();
  }, true);

  const observer = new win.MutationObserver(schedule);
  observer.observe(win.document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "hidden", "data-ao-settings-route"],
  });

  const api = Object.freeze({
    version: VERSION,
    confessionPhaseForStage,
    normalizeStoredPrayState,
    humanSourceStatus,
    canonicalAppVersion: function () { return canonicalAppVersion(win); },
    openAdoration: function () { return openD3(win); },
    reconcile: function () { reconcile(win); },
    status: function () {
      return Object.freeze({
        prayDomainOwner: Boolean(win.AO_V37_SHELL) ? "AO_V37_SHELL" : null,
        adorationOwner: "D3_CONVERGENCE_OVER_V383",
        benedictionOwner: Boolean(win.AOTraditionalPrayerBook) ? "AOTraditionalPrayerBook+D4" : null,
        confessionOwner: Boolean(win.AOTraditionalPrayerBook) ? "AOTraditionalPrayerBook+D5" : null,
        settingsOwner: Boolean(win.AO_SETTINGS_V4359),
        appVersion: canonicalAppVersion(win),
        adorationPresencePersistence: "session-only",
        confessionExamStorage: "read-only",
        d3: "integrated-on-current-owner",
        d4: "integrated-on-current-owner",
        d5: "integrated-on-current-owner",
        d6: "integrated-on-settings",
      });
    },
  });

  win.AO_NON_MASS_D3_D6_CONVERGENCE = api;
  reconcile(win);
  return api;
}
