export const VERSION = "nonmass-d3-d6-convergence-v3";
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
  if (n === 3) return "in-confessional";
  return "after";
}

export function normalizeStoredPrayState(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const next = JSON.parse(JSON.stringify(raw));
  if (next.adoration && typeof next.adoration === "object") delete next.adoration.presence;
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
function L(win,en,fr){return isFrench(win)?fr:en}
function element(win,tag,className,text){
  const node=win.document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined&&text!==null)node.textContent=text;
  return node;
}
function scrubPersistedAdoration(win){
  try{
    const raw=win.localStorage?.getItem?.(PRAY_STORAGE_KEY);
    if(!raw)return false;
    const parsed=JSON.parse(raw);
    const normalized=normalizeStoredPrayState(parsed);
    if(JSON.stringify(parsed)===JSON.stringify(normalized))return false;
    win.localStorage.setItem(PRAY_STORAGE_KEY,JSON.stringify(normalized));
    return true;
  }catch{return false}
}
function sourceFamilyRows(win){
  return isFrench(win)
    ? [
      ["Livres liturgiques et base 1962","Missel romain de 1962, Rubriques générales de 1960 et sources normatives applicables."],
      ["Calendrier et Propre","L’autorité liturgique est distinguée du fournisseur numérique des données."],
      ["Écriture","Les éditions et la provenance sont indiquées par langue dans le lecteur biblique."],
      ["Commentaire","Les commentaires patristiques ou traditionnels restent attribués à leurs auteurs et éditions."],
      ["Doctrine et catéchisme","Les textes doctrinaux gardent leur corpus et leur niveau d’autorité propres."],
      ["Prières et méthodes dévotionnelles","Les témoins historiques et manuels traditionnels ne sont pas présentés comme loi liturgique."],
      ["Autorités des programmes","Premier vendredi et premier samedi distinguent l’autorité du programme des sources de leurs composants."],
      ["Art sacré","Artiste, œuvre, collection et droits sont conservés lorsqu’ils sont connus."],
    ]
    : [
      ["Liturgical books & 1962 basis","The 1962 Roman Missal, 1960 General Rubrics and applicable normative sources control liturgical claims."],
      ["Calendar & Proper data","Liturgical authority is kept distinct from the digital provider supplying data."],
      ["Scripture","Edition and provenance are identified by language in the Scripture reader."],
      ["Commentary","Patristic and traditional commentary remains attributed to its author and edition."],
      ["Doctrine & Catechism","Doctrinal texts retain their own corpus and authority level."],
      ["Prayer & devotional methods","Historical witnesses and traditional manuals are not presented as liturgical law."],
      ["Programme authorities","First Friday and First Saturday keep programme authority distinct from component sources."],
      ["Sacred art","Artist, work, collection and rights are retained where known."],
    ];
}
function buildSourcesAbout(win){
  const frag=win.document.createDocumentFragment();

  const sourceSection=element(win,"section","aoSetSection aoD6Sources");
  sourceSection.appendChild(element(win,"h2","",L(win,"Sources","Sources")));
  const group=element(win,"div","aoSetGroup");
  sourceFamilyRows(win).forEach(row=>{
    const details=element(win,"details","aoD6SourceFamily");
    details.append(element(win,"summary","",row[0]),element(win,"p","",row[1]));
    group.appendChild(details);
  });
  sourceSection.appendChild(group);frag.appendChild(sourceSection);

  const keySection=element(win,"section","aoSetSection");
  keySection.appendChild(element(win,"h2","",L(win,"How provenance is labelled","Comment la provenance est indiquée")));
  const keyGroup=element(win,"div","aoSetGroup aoD6Key");
  (isFrench(win)
    ? ["Source officielle / normative","Source liturgique de 1962","Témoin historique","Méthode dévotionnelle traditionnelle","Guide éditorial Ad Orientem","Traduction / adaptation"]
    : ["Official / governing source","1962 liturgical source","Historical witness","Traditional devotional source","Ad Orientem editorial guidance","Translation / adaptation"]
  ).forEach(value=>keyGroup.appendChild(element(win,"p","",value)));
  keySection.appendChild(keyGroup);frag.appendChild(keySection);

  const aboutSection=element(win,"section","aoSetSection");
  aboutSection.appendChild(element(win,"h2","",L(win,"About Ad Orientem","À propos d’Ad Orientem")));
  const aboutGroup=element(win,"div","aoSetGroup aoD6AboutGroup");
  const version=canonicalAppVersion(win)||L(win,"Current release","Version actuelle");
  const rows=isFrench(win)
    ? [["Version de l’application",version],["Confidentialité","Les réglages et la progression sont conservés localement sauf indication contraire. Les péchés ne sont pas enregistrés."],["Licences et remerciements","Les textes et œuvres tiers conservent leurs notices de source et de licence."]]
    : [["Application version",version],["Privacy","Settings and progress are stored locally unless a feature says otherwise. Sins are not recorded."],["Licences & acknowledgements","Third-party texts and artworks retain their source and licence notices."]];
  rows.forEach(row=>{
    const div=element(win,"div","aoD6AboutRow");
    div.append(element(win,"b","",row[0]),element(win,"span","",row[1]));
    aboutGroup.appendChild(div);
  });
  aboutSection.appendChild(aboutGroup);frag.appendChild(aboutSection);
  return frag;
}

function patchAboutSettings(win){
  const doc=win.document;
  const state=win.AO_RUNTIME_V8?.store?.getState?.()??null;

  // Production currently renders Settings as the core Home settings sheet.
  if(state?.homeSheet==="settings"){
    const sheet=[...doc.querySelectorAll(".homeSheet")].find(node=>
      node.querySelector("[data-setting-form],[data-setting-follow],[data-setting-scale]") ||
      /settings|réglages/i.test(String(node.textContent||""))
    );
    if(!sheet)return false;
    const currentVersion=String(canonicalAppVersion(win)||"");
    const existing=sheet.querySelector(".aoD6SettingsSupplement");
    if(existing?.querySelector(".aoD6Sources") && existing.dataset.aoD6Version===currentVersion)return false;
    existing?.remove?.();
    const supplement=element(win,"div","aoD6SettingsSupplement");
    supplement.dataset.aoD6Settings="core-home-sheet";
    supplement.dataset.aoD6Version=currentVersion;
    supplement.append(
      element(win,"div","aoSetIntro",L(
        win,
        "Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.",
        "Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent."
      )),
      buildSourcesAbout(win)
    );
    sheet.appendChild(supplement);
    return true;
  }

  // Compatibility path for a future/extracted Settings owner.
  const root=doc.getElementById("ao-settings-v4359");
  if(!root||root.hidden)return false;
  const route=doc.documentElement.dataset.aoSettingsRoute;
  const wrap=root.querySelector(".aoSetWrap");
  if(!wrap)return false;
  if(wrap.dataset.aoD6About==="1"&&wrap.querySelector(".aoD6Sources"))return false;
  const rendered=String(wrap.textContent||"");
  const looksLikeAbout=/sources|provenance|about ad orientem|à propos d.?ad orientem|source/i.test(rendered);
  let settingsStateText="";
  try{
    const api=win.AO_SETTINGS_V4359;
    const state=typeof api?.state==="function"?api.state():api?.state;
    settingsStateText=JSON.stringify(state??{});
  }catch{}
  const stateLooksAbout=/about-sources|\/settings\/about-sources/i.test(settingsStateText);
  if(route!=="/settings/about-sources"&&win.__AO_D6_ABOUT_ROUTE_ACTIVE!==true&&!stateLooksAbout&&!looksLikeAbout)return false;
  wrap.dataset.aoD6About="1";
  wrap.innerHTML="";
  wrap.append(
    element(win,"div","aoSetIntro",L(
      win,
      "Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.",
      "Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent."
    )),
    buildSourcesAbout(win)
  );
  return true;
}
function installSettingsHook(win){
  const api=win.AO_SETTINGS_V4359;
  if(!api||api.__aoD6RouteHooked||typeof api.open!=="function")return false;
  const original=api.open.bind(api);
  const wrapped=function(route,...rest){
    win.__AO_D6_ABOUT_ROUTE_ACTIVE=String(route)==="/settings/about-sources";
    const result=original(route,...rest);
    win.queueMicrotask(()=>patchAboutSettings(win));
    return result;
  };
  try{api.open=wrapped;api.__aoD6RouteHooked=true;return true}catch{return false}
}
function installStyles(win){
  if(win.document.getElementById("ao-nonmass-d6-style"))return;
  const style=element(win,"style");
  style.id="ao-nonmass-d6-style";
  style.textContent=[
    ".aoD6SourceFamily{padding:12px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09))}",
    ".aoD6SourceFamily:last-child{border-bottom:0}.aoD6SourceFamily summary{font-weight:650;cursor:pointer}",
    ".aoD6SourceFamily p{margin:8px 0 0;color:var(--muted,#b3bac0);font-size:.74rem;line-height:1.45}",
    ".aoD6Key p,.aoD6AboutRow{margin:0;padding:10px 13px;border-bottom:1px solid var(--border,rgba(255,255,255,.09));font-size:.75rem}",
    ".aoD6AboutRow{display:grid;gap:4px}.aoD6AboutRow span{color:var(--muted,#b3bac0);line-height:1.4}",
  ].join("");
  win.document.head.appendChild(style);
}

export function installNonMassConvergence({win=globalThis}={}){
  if(!win?.document)return null;
  if(win.AO_NON_MASS_D3_D6_CONVERGENCE)return win.AO_NON_MASS_D3_D6_CONVERGENCE;
  // D6 is now owned by AO_SETTINGS_APP_V1. Historical Settings hooks remain
  // donor evidence only and are never activated by the production convergence layer.
  scrubPersistedAdoration(win);
  let scheduled=false;
  const reconcile=()=>{
    scrubPersistedAdoration(win);
  };
  const schedule=()=>{
    if(scheduled)return;
    scheduled=true;
    win.queueMicrotask(()=>{scheduled=false;reconcile()});
  };
  const observer=new win.MutationObserver(schedule);
  observer.observe(win.document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["class","hidden","data-ao-settings-route","data-ao-release"]});
  win.addEventListener("click",schedule,true);
  win.addEventListener("pageshow",schedule);
  if(win.document.readyState==="loading")win.document.addEventListener("DOMContentLoaded",schedule,{once:true});
  const releaseTimers=[100,500,1200].map(ms=>win.setTimeout?.(schedule,ms)).filter(x=>x!=null);
  const api=Object.freeze({
    version:VERSION,
    confessionPhaseForStage,
    normalizeStoredPrayState,
    humanSourceStatus,
    canonicalAppVersion:()=>canonicalAppVersion(win),
    reconcile,
    status:()=>Object.freeze({
      prayDomainOwner:win.AO_PRAY_APP_V1?.status?.().routeOwner??"modular-pray-v1",
      presentationOwner:win.AO_PRAY_APP_V1?.status?.().presentationOwner??(win.AO_PRAY_V435930?"AO_PRAY_V435930":null),
      adorationOwner:"AO_PRAY_V435930+D3",
      benedictionOwner:"AO_PRAY_V435930+D4",
      confessionOwner:"AO_PRAY_V435930+D5",
      settingsOwner:win.AO_SETTINGS_APP_V1?.status?.()?.installed===true?"AO_SETTINGS_APP_V1":null,
      appVersion:canonicalAppVersion(win),
      adorationPresencePersistence:"session-only",
      confessionExamStorage:"read-only",
      d3:"integrated-on-modular-pray",
      d4:"integrated-on-modular-pray",
      d5:"integrated-on-modular-pray",
      d6:win.AO_SETTINGS_APP_V1?.status?.()?.installed===true?"integrated-on-modular-settings":"settings-modular-owner-unavailable",
    }),
    dispose:()=>{
      observer.disconnect();
      win.removeEventListener?.("click",schedule,true);
      win.removeEventListener?.("pageshow",schedule);
      releaseTimers.forEach(id=>win.clearTimeout?.(id));
    },
  });
  win.AO_NON_MASS_D3_D6_CONVERGENCE=api;
  reconcile();
  return api;
}
