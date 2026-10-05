import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export const SETTINGS_PRESENTATION_VERSION="modular-settings-presentation-v1";

const COPY={
  en:{
    settings:"Settings",preferences:"Preferences",close:"Close Settings",back:"Back to Settings",language:"Language",
    mass:"Mass",massHint:"Preferences used when a new Mass session is prepared.",massForm:"Mass form",sung:"Sung Mass",low:"Low Mass",
    follow:"Follow",live:"LIVE",simple:"Simple",missal:"Missal",text:"Text",oriented:"Oriented",parallel:"Parallel",
    participation:"Participation",quiet:"Quiet",group:"Responses",postureProfile:"Posture profile",followCongregation:"Follow congregation",
    myLocal:"My local",oconnell:"O’Connell 1962 Community",traditionalWalsh:"Traditional Walsh",gestureProfile:"Gesture guidance",
    essential:"Essential",guided:"Guided 1962",traditional:"Traditional",faithfulCommunion:"Faithful receive Communion",
    secondConfiteor:"Second Confiteor",joinSecondConfiteor:"Join the second Confiteor",sundayAsperges:"Sunday Asperges",
    structuralLocked:"Structural Mass settings are locked while the current Mass is in progress.",display:"Display & accessibility",
    textSize:"Text size",normal:"Normal",large:"Large",reduceMotion:"Reduce motion",reduceMotionHint:"Limit non-essential transitions.",
    haptics:"Haptics",hapticsHint:"Physical feedback for supported controls.",liveHaptics:"Haptics remain off while Mass is in progress.",
    localPractice:"Local practice",resetPostures:"Reset local postures",sourcesAbout:"Sources & About",sourcesHint:"Source families, provenance labels, application version, privacy and acknowledgements.",
    contentAudit:"Bilingual content audit",advanced:"Advanced",sourcesIntro:"Sources are grouped by what they control. Exact prayer, commentary and calendar claims keep contextual attribution where they appear.",
    sources:"Sources",provenance:"How provenance is labelled",about:"About Ad Orientem",appVersion:"Application version",privacy:"Privacy",
    privacyBody:"Settings and progress are stored locally unless a feature says otherwise. Sins are not recorded.",licences:"Licences & acknowledgements",
    licencesBody:"Third-party texts and artworks retain their source and licence notices.",currentRelease:"Current release"
  },
  fr:{
    settings:"Réglages",preferences:"Préférences",close:"Fermer les réglages",back:"Retour aux réglages",language:"Langue",
    mass:"Messe",massHint:"Préférences utilisées lors de la préparation d’une nouvelle session de Messe.",massForm:"Forme de Messe",sung:"Messe chantée",low:"Messe basse",
    follow:"Suivre",live:"LIVE",simple:"Simple",missal:"Missel",text:"Texte",oriented:"Orienté",parallel:"Parallèle",
    participation:"Participation",quiet:"Discrète",group:"Réponses",postureProfile:"Profil de postures",followCongregation:"Suivre l’assemblée",
    myLocal:"Ma pratique locale",oconnell:"O’Connell 1962 Community",traditionalWalsh:"Traditional Walsh",gestureProfile:"Guidage des gestes",
    essential:"Essentiel",guided:"Guidé 1962",traditional:"Traditionnel",faithfulCommunion:"Communion des fidèles",
    secondConfiteor:"Second Confiteor",joinSecondConfiteor:"Participer au second Confiteor",sundayAsperges:"Asperges du dimanche",
    structuralLocked:"Les réglages structurels de la Messe sont verrouillés pendant la Messe en cours.",display:"Affichage et accessibilité",
    textSize:"Taille du texte",normal:"Normale",large:"Grande",reduceMotion:"Réduire les animations",reduceMotionHint:"Limiter les transitions non essentielles.",
    haptics:"Retour haptique",hapticsHint:"Retour physique sur les contrôles compatibles.",liveHaptics:"Le retour haptique reste désactivé pendant la Messe en cours.",
    localPractice:"Pratique locale",resetPostures:"Réinitialiser les postures locales",sourcesAbout:"Sources et à propos",sourcesHint:"Familles de sources, provenance, version de l’application, confidentialité et remerciements.",
    contentAudit:"Audit bilingue du contenu",advanced:"Avancé",sourcesIntro:"Les sources sont regroupées selon ce qu’elles contrôlent. Les prières, commentaires et affirmations calendaires gardent leur attribution contextuelle là où ils apparaissent.",
    sources:"Sources",provenance:"Comment la provenance est indiquée",about:"À propos d’Ad Orientem",appVersion:"Version de l’application",privacy:"Confidentialité",
    privacyBody:"Les réglages et la progression sont conservés localement sauf indication contraire. Les péchés ne sont pas enregistrés.",licences:"Licences et remerciements",
    licencesBody:"Les textes et œuvres tiers conservent leurs notices de source et de licence.",currentRelease:"Version actuelle"
  }
};

const SOURCE_FAMILIES={
  en:[
    ["Liturgical books & 1962 basis","The 1962 Roman Missal, 1960 General Rubrics and applicable normative sources control liturgical claims."],
    ["Calendar & Proper data","Liturgical authority is kept distinct from the digital provider supplying data."],
    ["Scripture","Edition and provenance are identified by language in the Scripture reader."],
    ["Commentary","Patristic and traditional commentary remains attributed to its author and edition."],
    ["Doctrine & Catechism","Doctrinal texts retain their own corpus and authority level."],
    ["Prayer & devotional methods","Historical witnesses and traditional manuals are not presented as liturgical law."],
    ["Programme authorities","First Friday and First Saturday keep programme authority distinct from component sources."],
    ["Sacred art","Artist, work, collection and rights are retained where known."],
  ],
  fr:[
    ["Livres liturgiques et base 1962","Missel romain de 1962, Rubriques générales de 1960 et sources normatives applicables."],
    ["Calendrier et Propre","L’autorité liturgique est distinguée du fournisseur numérique des données."],
    ["Écriture","Les éditions et la provenance sont indiquées par langue dans le lecteur biblique."],
    ["Commentaire","Les commentaires patristiques ou traditionnels restent attribués à leurs auteurs et éditions."],
    ["Doctrine et catéchisme","Les textes doctrinaux gardent leur corpus et leur niveau d’autorité propres."],
    ["Prières et méthodes dévotionnelles","Les témoins historiques et manuels traditionnels ne sont pas présentés comme loi liturgique."],
    ["Autorités des programmes","Premier vendredi et premier samedi distinguent l’autorité du programme des sources de leurs composants."],
    ["Art sacré","Artiste, œuvre, collection et droits sont conservés lorsqu’ils sont connus."],
  ]
};

const PROVENANCE={
  en:["Official / governing source","1962 liturgical source","Historical witness","Traditional devotional source","Ad Orientem editorial guidance","Translation / adaptation"],
  fr:["Source officielle / normative","Source liturgique de 1962","Témoin historique","Méthode dévotionnelle traditionnelle","Guide éditorial Ad Orientem","Traduction / adaptation"]
};

const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const assetIcon=(assetId,className="aoSetModIcon")=>{
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span class="${className}" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url(\'${esc(url)}\') center/contain no-repeat;mask:url(\'${esc(url)}\') center/contain no-repeat"></span>`;
};
const t=(lang,key)=>COPY[lang]?.[key]??COPY.en[key]??key;

export function canonicalSettingsAppVersion(win=globalThis){
  return win?.AO_RELEASE_AUTHORITY_V4359?.version || win?.document?.documentElement?.dataset?.aoRelease || null;
}

export function buildSettingsViewModel(win=globalThis,{route="main",live=false}={}){
  const state=win?.AO_RUNTIME_V8?.store?.getState?.()??{};
  const settings=state?.settings??{};
  const language=state?.language==="fr"?"fr":"en";
  const form=String(settings.massForm??"sung").toLowerCase();
  const follow=String(settings.followMode??"vox").toLowerCase();
  return Object.freeze({
    route:route==="about-sources"?"about-sources":"main",language,live:Boolean(live),
    version:canonicalSettingsAppVersion(win)||t(language,"currentRelease"),
    haptics:Boolean(win?.AO_HAPTICS_V4319?.isEnabled?.()),
    settings:Object.freeze({
      massForm:form==="low"||form.includes("low")?"low":"sung",
      followMode:["missal","simple"].includes(follow)?follow:"vox",
      textMode:settings.textMode==="parallel"?"parallel":"oriented",
      participationMode:settings.participationMode==="group"?"group":"quiet",
      textScale:settings.textScale==="large"?"large":"normal",
      reducedMotion:Boolean(settings.reducedMotion),
      faithfulCommunion:settings.faithfulCommunion!==false,
      secondConfiteor:Boolean(settings.secondConfiteor),
      joinSecondConfiteor:Boolean(settings.joinSecondConfiteor),
      sundayAsperges:settings.sundayAsperges!==false,
      massPostureProfile:String(settings.massPostureProfile??"FOLLOW_CONGREGATION"),
      massGestureProfile:String(settings.massGestureProfile??"GUIDED_1962"),
    })
  });
}

function segments(label,attr,items,active,{structural=false}={}){
  return `<div class="aoSetModGroup"><div class="aoSetModLabel">${esc(label)}</div><div class="aoSetModSegments" role="group" aria-label="${esc(label)}">${items.map(([value,text])=>`<button type="button" ${attr}="${esc(value)}"${structural?' data-setting-structural="true"':""} class="${active===value?"active":""}">${esc(text)}</button>`).join("")}</div></div>`;
}
function toggle(label,hint,attr,on,{structural=false,disabled=false}={}){
  return `<button type="button" class="aoSetModToggle" ${attr}="${on?"0":"1"}" aria-pressed="${on?"true":"false"}"${structural?' data-setting-structural="true"':""}${disabled?' disabled aria-disabled="true"':""}><span><b>${esc(label)}</b>${hint?`<small>${esc(hint)}</small>`:""}</span><i class="${on?"on":""}" aria-hidden="true"></i></button>`;
}
function sourceMarkup(vm){
  const {language}=vm;
  return `<div class="aoSetModIntro">${esc(t(language,"sourcesIntro"))}</div>
<section class="aoSetModSection"><h2>${esc(t(language,"sources"))}</h2><div class="aoSetModCard">${SOURCE_FAMILIES[language].map(([title,body])=>`<details class="aoSetModSource"><summary>${esc(title)}</summary><p>${esc(body)}</p></details>`).join("")}</div></section>
<section class="aoSetModSection"><h2>${esc(t(language,"provenance"))}</h2><div class="aoSetModCard aoSetModKey">${PROVENANCE[language].map(value=>`<p>${esc(value)}</p>`).join("")}</div></section>
<section class="aoSetModSection"><h2>${esc(t(language,"about"))}</h2><div class="aoSetModCard aoSetModAbout"><div><b>${esc(t(language,"appVersion"))}</b><span data-settings-app-version>${esc(vm.version)}</span></div><div><b>${esc(t(language,"privacy"))}</b><span>${esc(t(language,"privacyBody"))}</span></div><div><b>${esc(t(language,"licences"))}</b><span>${esc(t(language,"licencesBody"))}</span></div></div></section>`;
}
function mainMarkup(vm){
  const l=vm.language,s=vm.settings;
  return `${vm.live?`<div class="aoSetModNotice" role="status">${esc(t(l,"structuralLocked"))}</div>`:""}
<section class="aoSetModSection"><h2>${esc(t(l,"language"))}</h2>${segments(t(l,"language"),"data-setting-language",[["en","English"],["fr","Français"]],l)}</section>
<section class="aoSetModSection"><h2>${esc(t(l,"mass"))}</h2><p class="aoSetModHint">${esc(t(l,"massHint"))}</p>
${segments(t(l,"massForm"),"data-setting-form",[["sung",t(l,"sung")],["low",t(l,"low")]],s.massForm,{structural:true})}
${segments(t(l,"follow"),"data-setting-follow",[["vox",t(l,"live")],["simple",t(l,"simple")],["missal",t(l,"missal")]],s.followMode)}
${segments(t(l,"text"),"data-setting-text",[["oriented",t(l,"oriented")],["parallel",t(l,"parallel")]],s.textMode)}
${segments(t(l,"participation"),"data-setting-participation",[["quiet",t(l,"quiet")],["group",t(l,"group")]],s.participationMode)}
${segments(t(l,"postureProfile"),"data-setting-posture-profile",[["FOLLOW_CONGREGATION",t(l,"followCongregation")],["MY_LOCAL",t(l,"myLocal")],["OCONNELL_1962_COMMUNITY",t(l,"oconnell")],["TRADITIONAL_WALSH",t(l,"traditionalWalsh")]],s.massPostureProfile)}
${segments(t(l,"gestureProfile"),"data-setting-gesture-profile",[["ESSENTIAL",t(l,"essential")],["GUIDED_1962",t(l,"guided")],["TRADITIONAL",t(l,"traditional")]],s.massGestureProfile)}
<div class="aoSetModCard">${toggle(t(l,"faithfulCommunion"),"","data-setting-faithful-communion",s.faithfulCommunion,{structural:true})}${toggle(t(l,"secondConfiteor"),"","data-setting-second-confiteor",s.secondConfiteor,{structural:true})}${toggle(t(l,"joinSecondConfiteor"),"","data-setting-join-confiteor",s.joinSecondConfiteor,{structural:true})}${toggle(t(l,"sundayAsperges"),"","data-sunday-asperges",s.sundayAsperges,{structural:true})}</div></section>
<section class="aoSetModSection"><h2>${esc(t(l,"display"))}</h2>${segments(t(l,"textSize"),"data-setting-scale",[["normal",t(l,"normal")],["large",t(l,"large")]],s.textScale)}<div class="aoSetModCard">${toggle(t(l,"reduceMotion"),t(l,"reduceMotionHint"),"data-setting-motion",s.reducedMotion)}${toggle(t(l,"haptics"),vm.live?t(l,"liveHaptics"):t(l,"hapticsHint"),"data-setting-haptics",vm.haptics,{disabled:vm.live})}</div></section>
<section class="aoSetModSection"><h2>${esc(t(l,"localPractice"))}</h2><div class="aoSetModCard"><button type="button" class="aoSetModAction" data-reset-postures>${esc(t(l,"resetPostures"))}</button></div></section>
<section class="aoSetModSection"><button type="button" class="aoSetModNav" data-settings-sources><span><b>${esc(t(l,"sourcesAbout"))}</b><small>${esc(t(l,"sourcesHint"))}</small></span><strong aria-hidden="true">${assetIcon("ao-ui-next")}</strong></button></section>
<section class="aoSetModSection"><h2>${esc(t(l,"advanced"))}</h2><div class="aoSetModCard"><button type="button" class="aoSetModAction aoContentAuditLaunch" data-content-audit-v8>${esc(t(l,"contentAudit"))}</button></div></section>`;
}

export function settingsCss(rootId="ao-settings-modular-root"){
  return `#${rootId}{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14970;background:#080c12;color:#e9e4d9;overflow:auto;overscroll-behavior:contain;font-family:Georgia,serif}html.aoAppLive #${rootId}{inset:0;z-index:2147483300}#${rootId} *{box-sizing:border-box}.aoSetModTop{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:10px;padding:calc(10px + var(--safe-top,0px)) 12px 10px;background:rgba(8,12,18,.96);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.11)}.aoSetModTop button{width:44px;height:44px;border:1px solid rgba(255,255,255,.14);border-radius:11px;background:#0e161f;color:#e9e4d9;font-size:18px}.aoSetModTop div{text-align:center;min-width:0}.aoSetModTop small{display:block;color:#9da7b0;font-size:10px;letter-spacing:.13em;text-transform:uppercase}.aoSetModTop h1{margin:2px 0 0;font-size:19px;font-weight:500}.aoSetModBody{width:min(720px,100%);margin:0 auto;padding:14px 14px 48px}.aoSetModNotice,.aoSetModIntro{margin:4px 0 16px;padding:12px 13px;border:1px solid rgba(219,185,116,.28);border-radius:12px;background:rgba(219,185,116,.07);font-size:13px;line-height:1.45}.aoSetModIntro{border-color:rgba(255,255,255,.1);background:#0d141c;color:#b4bdc5}.aoSetModSection{padding:15px 0;border-top:1px solid rgba(255,255,255,.09)}.aoSetModSection:first-of-type{border-top:0}.aoSetModSection h2{margin:0 0 10px;font-size:16px;font-weight:500}.aoSetModHint{margin:-4px 0 12px;color:#9da7b0;font-size:12px;line-height:1.4}.aoSetModGroup{margin:0 0 12px}.aoSetModLabel{margin:0 0 6px;color:#aab3bb;font-size:11px;text-transform:uppercase;letter-spacing:.08em}.aoSetModSegments{display:grid;grid-template-columns:repeat(auto-fit,minmax(108px,1fr));gap:6px}.aoSetModSegments button,.aoSetModAction,.aoSetModNav{min-height:44px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:#0e161f;color:#e9e4d9;padding:9px 11px}.aoSetModSegments button.active{border-color:rgba(224,198,138,.58);background:rgba(224,198,138,.11)}.aoSetModCard{overflow:hidden;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:#0c131b}.aoSetModToggle{width:100%;min-height:54px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:0;border-bottom:1px solid rgba(255,255,255,.08);background:transparent;color:#e9e4d9;text-align:left}.aoSetModToggle:last-child{border-bottom:0}.aoSetModToggle span{min-width:0}.aoSetModToggle b,.aoSetModToggle small{display:block}.aoSetModToggle b{font-size:14px}.aoSetModToggle small{margin-top:3px;color:#97a1aa;font-size:11px;line-height:1.35}.aoSetModToggle i{width:34px;height:20px;border-radius:99px;background:#26313b;position:relative;flex:none}.aoSetModToggle i:after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#d9d5cb;transition:transform .16s}.aoSetModToggle i.on{background:rgba(224,198,138,.48)}.aoSetModToggle i.on:after{transform:translateX(14px)}.aoSetModToggle:disabled{opacity:.55}.aoSetModAction{width:100%;border:0;border-radius:0;background:transparent;text-align:left}.aoSetModNav{width:100%;display:flex;align-items:center;justify-content:space-between;text-align:left}.aoSetModNav span{min-width:0}.aoSetModNav b,.aoSetModNav small{display:block}.aoSetModNav small{margin-top:4px;color:#97a1aa;font-size:11px;line-height:1.35}.aoSetModSource{padding:12px 13px;border-bottom:1px solid rgba(255,255,255,.08)}.aoSetModSource:last-child{border-bottom:0}.aoSetModSource summary{font-weight:650;cursor:pointer}.aoSetModSource p{margin:8px 0 0;color:#aab3bb;font-size:12px;line-height:1.45}.aoSetModKey p,.aoSetModAbout>div{margin:0;padding:10px 13px;border-bottom:1px solid rgba(255,255,255,.08);font-size:12px}.aoSetModKey p:last-child,.aoSetModAbout>div:last-child{border-bottom:0}.aoSetModAbout>div{display:grid;gap:4px}.aoSetModAbout span{color:#aab3bb;line-height:1.4}@media(max-width:480px){.aoSetModBody{padding:8px 12px 36px}.aoSetModSegments{grid-template-columns:repeat(2,minmax(0,1fr))}.aoSetModSection{padding:13px 0}}`;
}

export function renderSettingsToString(win=globalThis,{route="main",live=false}={}){
  const vm=buildSettingsViewModel(win,{route,live});
  const l=vm.language,about=vm.route==="about-sources";
  return `<style>${settingsCss()}</style><header class="aoSetModTop"><button type="button" ${about?"data-settings-main":"data-settings-close"} aria-label="${esc(about?t(l,"back"):t(l,"close"))}">${about?assetIcon("ao-ui-back"):assetIcon("ao-ui-close")}</button><div><small>${esc(about?t(l,"sourcesAbout"):t(l,"preferences"))}</small><h1>${esc(about?t(l,"sourcesAbout"):t(l,"settings"))}</h1></div><button type="button" data-settings-close aria-label="${esc(t(l,"close"))}">${assetIcon("ao-ui-close")}</button></header><main class="aoSetModBody">${about?sourceMarkup(vm):mainMarkup(vm)}</main>`;
}
