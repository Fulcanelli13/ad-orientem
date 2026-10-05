import { canonicalAssetIdForLearnRoute, getCanonicalAsset, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export const LEARN_PRESENTATION_VERSION="modular-learn-presentation-v1";
export const LEARN_DONOR_RELEASE="43.59.30";

export const LEARN_LAYOUT=Object.freeze({
  kicker:Object.freeze(["FORMATION","FORMATION"]),
  title:Object.freeze(["Learn","Apprendre"]),
  intro:Object.freeze([
    "Formation is gathered here: daily recall, systematic Catechism study and understanding the Roman Mass.",
    "La formation est rassemblée ici : rappel quotidien, étude systématique du Catéchisme et compréhension de la Messe romaine."
  ]),
  sections:Object.freeze([
    Object.freeze({title:Object.freeze(["Daily formation","Formation quotidienne"]),items:Object.freeze([
      Object.freeze({id:"learn.catechism.daily",type:"programme",featured:true,title:Object.freeze(["Daily Catechism","Catéchisme quotidien"]),description:Object.freeze(["Ten questions each day: new material, review and weak points.","Dix questions chaque jour : nouveautés, révision et points faibles."])})
    ])}),
    Object.freeze({title:Object.freeze(["Courses & study","Parcours & étude"]),items:Object.freeze([
      Object.freeze({id:"learn.mass",type:"module",featured:true,title:Object.freeze(["Understand the Mass","Comprendre la Messe"]),description:Object.freeze(["A guided course through the order, meaning, history and roles of the Roman Mass.","Un parcours guidé sur l’ordre, le sens, l’histoire et les rôles de la Messe romaine."])}),
      Object.freeze({id:"learn.catechism",type:"module",featured:false,title:Object.freeze(["Traditional Catechism","Catéchisme traditionnel"]),description:Object.freeze(["The complete Catechism of St Pius X: browse, search and study.","Le Catéchisme complet de saint Pie X : parcourir, rechercher et étudier."])})
    ])}),
    Object.freeze({title:Object.freeze(["Today in context","Le jour en contexte"]),items:Object.freeze([
      Object.freeze({id:"today.gospel",type:"reference",featured:false,title:Object.freeze(["Today’s Gospel","Évangile du jour"]),description:Object.freeze(["Read the appointed Gospel with context and commentary.","Lire l’Évangile assigné avec contexte et commentaire."])}),
      Object.freeze({id:"today.saint",type:"reference",featured:false,title:Object.freeze(["Saint of the Day","Saint du jour"]),description:Object.freeze(["Identity, artwork, biography and sources for today’s observance.","Identité, œuvre, biographie et sources de l’observance du jour."])})
    ])})
  ])
});

export const LEARN_MODULE_IDS=Object.freeze(LEARN_LAYOUT.sections.flatMap(section=>section.items.map(item=>item.id)));

const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const assetMask=(assetId,className="aoLearnControlIcon")=>{
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span class="${className}" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url(\'${esc(url)}\') center/contain no-repeat;mask:url(\'${esc(url)}\') center/contain no-repeat"></span>`;
};
const isFr=state=>state?.language==="fr";
const pick=(pair,state)=>pair[isFr(state)?1:0];

function contextLabel(state,win){
  const rawDate=state?.selectedDate||"";
  const day=state?.resolution?.day?.main;
  const title=isFr(state)?(day?.titleFr||day?.nameFr||day?.title||day?.name||""):(day?.title||day?.name||"");
  let date=rawDate;
  try{date=rawDate?(win?.AO_DISPLAY_DATE?.(rawDate)||rawDate):"";}catch{}
  return [date,title].filter(Boolean).join(" · ");
}

function typeLabel(item,state){
  if(item.type==="programme")return isFr(state)?"Guidé":"Guided";
  if(item.type==="reference")return isFr(state)?"Référence":"Reference";
  return "Module";
}

function iconMarkup(item,win){
  const assetId=canonicalAssetIdForLearnRoute(item?.id);
  const asset=assetId?getCanonicalAsset(assetId):null;
  if(!asset)return "";
  const embedded=win?.document?.getElementById?.(assetId)??null;
  if(!embedded)return "";
  return `<svg class="aoLearnModIcon" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" focusable="false"><use href="#${esc(assetId)}"></use></svg>`;
}

function cardMarkup(item,state,win){
  const assetId=canonicalAssetIdForLearnRoute(item?.id);
  const icon=iconMarkup(item,win);
  return `<article class="aoLearnModCard ${item.featured?"featured":""}">
    <button type="button" class="aoLearnModCardMain ${icon?"iconized":""}" data-ao-learn-module="${esc(item.id)}" data-ao-learn-card="${esc(item.id)}"${assetId?` data-ao-asset-id="${esc(assetId)}"`:""}>
      ${icon}<span class="type">${esc(typeLabel(item,state))}</span>
      <strong>${esc(pick(item.title,state))}</strong>
      <p>${esc(pick(item.description,state))}</p>
    </button>
  </article>`;
}

export function learnPresentationCss(){
  return `
#ao-learn-modular-root{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14950;background:var(--bg,#080c12);color:var(--text,#e9e4d9);overflow:auto;overscroll-behavior:contain;font-family:var(--font-body,Georgia,serif)}
#ao-learn-modular-root *{box-sizing:border-box}#ao-learn-modular-root[hidden]{display:none!important}
.aoLearnModTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:46px minmax(0,1fr) 46px;align-items:center;gap:10px;padding:calc(10px + var(--safe-top,0px)) max(12px,env(safe-area-inset-right)) 10px max(12px,env(safe-area-inset-left));background:color-mix(in srgb,var(--bg,#080c12) 94%,transparent);backdrop-filter:blur(18px);border-bottom:1px solid var(--border,rgba(255,255,255,.12))}
.aoLearnModTop button{width:44px;height:44px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:50%;background:var(--surface-1,#101821);color:var(--text,#e9e4d9);font-size:20px}.aoLearnModTopTitle{min-width:0;text-align:center}.aoLearnModTopTitle small{display:block;color:var(--muted,#9ba5b1);font:.61rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.13em}.aoLearnModTopTitle strong{display:block;margin-top:3px;font:600 1rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.035em}.aoLearnModTopSpacer{width:44px;height:44px}
.aoLearnModWrap{width:min(760px,100%);margin:0 auto;padding:18px 14px 42px}.aoLearnModHero{padding:18px 2px 24px}.aoLearnModHero .kicker{color:var(--liturgical,#c9ad78);font:.67rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.14em}.aoLearnModHero h1{margin:7px 0 9px;font:500 clamp(2rem,8vw,3.35rem)/1.03 var(--font-display,Georgia,serif)}.aoLearnModHero p{max-width:680px;margin:0;color:var(--muted,#9ba5b1);font-size:1rem;line-height:1.5}.aoLearnModContext{margin-top:12px;color:var(--muted,#9ba5b1);font-size:.76rem}.aoLearnModError{margin:0 0 16px;padding:11px 12px;border:1px solid var(--liturgical-border,rgba(201,173,120,.38));border-radius:12px;background:var(--liturgical-soft,rgba(201,173,120,.08));font-size:.82rem}
.aoLearnModSection{padding:18px 0;border-top:1px solid var(--border,rgba(255,255,255,.1))}.aoLearnModSectionHead{margin:0 0 10px}.aoLearnModSectionHead h2{margin:0;font:600 1rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.02em}.aoLearnModGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.aoLearnModCard{min-width:0;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:15px;background:var(--surface-1,#101821);overflow:hidden}.aoLearnModCard.featured{border-color:var(--liturgical-border,rgba(201,173,120,.4));background:linear-gradient(145deg,var(--liturgical-soft,rgba(201,173,120,.08)),var(--surface-1,#101821))}
.aoLearnModCardMain{position:relative;width:100%;min-height:112px;padding:13px 13px 14px;border:0;background:transparent;color:var(--text,#e9e4d9);text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:6px}.aoLearnModCardMain.iconized{padding-left:61px}.aoLearnModCardMain>.aoLearnModIcon{position:absolute;left:13px;top:15px;width:36px;height:36px;color:var(--liturgical,#c9ad78)}.aoLearnModCardMain .type{color:var(--liturgical,#c9ad78);font:.61rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.09em;text-transform:uppercase}.aoLearnModCardMain strong{font:600 1rem/1.22 var(--font-display,Georgia,serif)}.aoLearnModCardMain p{margin:0;color:var(--muted,#9ba5b1);font-size:.82rem;line-height:1.4}.aoLearnModCardMain:hover,.aoLearnModCardMain:focus-visible{outline:none;background:rgba(255,255,255,.025)}.aoLearnModCardMain:focus-visible{box-shadow:inset 0 0 0 2px var(--liturgical,#c9ad78)}
@media(max-width:430px){.aoLearnModWrap{padding-left:12px;padding-right:12px}.aoLearnModGrid{grid-template-columns:1fr}.aoLearnModCardMain{min-height:96px}.aoLearnModHero{padding-top:14px}.aoLearnModHero h1{font-size:2.35rem}}
`;
}

export function renderLearnPresentation(root,state,win,{error=""}={}){
  if(!root)return false;
  const langFr=isFr(state);
  root.dataset.aoLearnPresentationOwner=LEARN_PRESENTATION_VERSION;
  root.lang=langFr?"fr":"en";
  root.innerHTML=`<style data-ao-learn-style>${learnPresentationCss()}</style>
    <header class="aoLearnModTop">
      <button type="button" data-ao-learn-home aria-label="${esc(langFr?"Retour à l’accueil":"Back to Home")}">${assetMask("ao-ui-back")}</button>
      <div class="aoLearnModTopTitle"><small>AD ORIENTEM</small><strong>${esc(pick(LEARN_LAYOUT.title,state))}</strong></div>
      <span class="aoLearnModTopSpacer" aria-hidden="true"></span>
    </header>
    <main class="aoLearnModWrap">
      <section class="aoLearnModHero"><div class="kicker">${esc(pick(LEARN_LAYOUT.kicker,state))}</div><h1>${esc(pick(LEARN_LAYOUT.title,state))}</h1><p>${esc(pick(LEARN_LAYOUT.intro,state))}</p><div class="aoLearnModContext">${esc(contextLabel(state,win))}</div></section>
      ${error?`<div class="aoLearnModError" role="status">${esc(error)}</div>`:""}
      ${LEARN_LAYOUT.sections.map(section=>`<section class="aoLearnModSection"><div class="aoLearnModSectionHead"><h2>${esc(pick(section.title,state))}</h2></div><div class="aoLearnModGrid">${section.items.map(item=>cardMarkup(item,state,win)).join("")}</div></section>`).join("")}
    </main>`;
  return true;
}
