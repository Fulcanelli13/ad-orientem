import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { buildHomeEnrichers, renderHomeEnrichersToString } from "./enrichers.js";
import { formatDisplayDate } from "../app/date-format.js";
import { scriptureContextCapsule } from "../scripture/context.js";

export const HOME_PRESENTATION_VERSION="modular-home-presentation-v1";

const COPY={
  en:{
    brand:"AD ORIENTEM",subtitle:"1962 Roman Mass companion",prepare:"Prepare",followMass:"Follow Mass",
    giveThanks:"Give thanks",aroundMass:"Around the Mass",holyGospel:"Holy Gospel",exploreGospel:"Explore Gospel",
    todaysMass:"Today’s Mass",todaysMassHint:"Propers · readings · liturgical information",openMass:"Open today’s Mass",
    more:"More",moreHint:"Settings · preparation · thanksgiving",openMore:"Open more",rank:"Rank",colour:"Colour",
    properUnavailable:"Proper unavailable",properUnavailableBody:"The fixed Ordinary remains available. Feast-specific texts could not be loaded.",
    calendarUnavailable:"Calendar unavailable",calendarUnavailableBody:"The liturgical day could not be resolved. Try again when a source connection is available.",
    loading:"Resolving the liturgical day…",previousDay:"Previous day",nextDay:"Next day",english:"EN",french:"FR",
    noGospel:"The appointed Gospel is unavailable.",
    formulary:"Formulary",commemorations:"Commemorations"
  },
  fr:{
    brand:"AD ORIENTEM",subtitle:"Compagnon de la Messe romaine de 1962",prepare:"Se préparer",followMass:"Suivre la Messe",
    giveThanks:"Action de grâces",aroundMass:"Autour de la Messe",holyGospel:"Saint Évangile",exploreGospel:"Explorer l’Évangile",
    todaysMass:"Messe du jour",todaysMassHint:"Propres · lectures · informations liturgiques",openMass:"Ouvrir la Messe du jour",
    more:"Plus",moreHint:"Réglages · préparation · action de grâces",openMore:"Ouvrir plus",rank:"Classe",colour:"Couleur",
    properUnavailable:"Propre indisponible",properUnavailableBody:"L’Ordinaire fixe reste disponible. Les textes propres à la fête n’ont pas pu être chargés.",
    calendarUnavailable:"Calendrier indisponible",calendarUnavailableBody:"Le jour liturgique n’a pas pu être résolu. Réessayez lorsqu’une source est disponible.",
    loading:"Résolution du jour liturgique…",previousDay:"Jour précédent",nextDay:"Jour suivant",english:"EN",french:"FR",
    noGospel:"L’Évangile assigné est indisponible.",
    formulary:"Formulaire",commemorations:"Commémorations"
  }
};

function tr(language,key){return COPY[language]?.[key]??COPY.en[key]??key;}
const R17_ACTIVE_MASS_STORAGE_KEY="ao-r17-active-mass-v1";
export function readNativeMassResume(win=globalThis){
  try{
    const raw=win?.localStorage?.getItem?.(R17_ACTIVE_MASS_STORAGE_KEY);
    if(!raw)return null;
    const record=JSON.parse(raw);
    const resumable=Boolean(
      record &&
      (record.state==="active"||record.state==="suspended") &&
      record.schema &&
      record.session?.resolvedMass &&
      record.readerPreferences
    );
    if(!resumable)return null;
    const sequence=Number(record.readerPosition?.sequence);
    return Object.freeze({
      available:true,
      source:"R17_NATIVE",
      date:record.session?.resolvedMass?.date??record.session?.date??null,
      sectionId:record.readerPosition?.sectionId??null,
      stepNumber:Number.isInteger(sequence)&&sequence>0?sequence:null,
    });
  }catch{return null;}
}
function esc(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function assetIcon(assetId,className="aoHomeAssetIcon"){
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return "";
  return `<span class="${className}" data-ao-asset-id="${esc(assetId)}" aria-hidden="true" style="display:inline-block;width:1em;height:1em;background:currentColor;-webkit-mask:url(\'${esc(url)}\') center/contain no-repeat;mask:url(\'${esc(url)}\') center/contain no-repeat"></span>`;
}
function parseIso(value){return new Date(`${value}T12:00:00`);}
function iso(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;}
function localizedText(text,language){return !text?"":((language==="fr"?text.fr:text.en)||"");}
function gospelRef(text){return text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).find(x=>/\b\d{1,3}:\d/.test(x))??null;}
function excerpt(text,reference,max=220){
  const joined=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
    .filter(x=>x!==reference).filter(x=>!/^(Continuation|Suite|Sequéntia|Évangile)/i.test(x))
    .join(" ").replace(/\s+/g," ").trim();
  if(!joined)return "";
  if(joined.length<=max)return joined;
  return joined.slice(0,max).replace(/\s+\S*$/,"").trim()+"…";
}
function weekCells(dateIso,language){
  const selected=parseIso(dateIso),today=iso(new Date());
  const fmt=new Intl.DateTimeFormat(language==="fr"?"fr-FR":"en-GB",{weekday:"short"});
  return Array.from({length:7},(_,i)=>{
    const offset=i-3,d=new Date(selected);d.setDate(d.getDate()+offset);const key=iso(d);
    return{date:key,day:fmt.format(d).replace(".",""),number:String(d.getDate()),selected:offset===0,today:key===today};
  });
}

export function buildHomeViewModel(state,win=globalThis){
  const language=state.language==="fr"?"fr":"en",date=parseIso(state.selectedDate),locale=language==="fr"?"fr-FR":"en-GB";
  const resolution=state.resolution,day=resolution?.day??null,proper=resolution?.proper?.status==="ready"?resolution.proper.data:null;
  const calendarFailed=resolution?.status==="failed";
  const celebration=(proper?(language==="fr"?(proper.nameFr||proper.name||day?.main?.title):(proper.name||day?.main?.title)):day?.main?.title)
    ||tr(language,calendarFailed?"calendarUnavailable":"loading");
  const rankValue=proper?.rank||(day?.main?String(day.main.rank):"");
  const rawColour=resolution?.colourPlan?.label||day?.main?.color||"";
  const colourMapFr={Green:"Vert",Violet:"Violet",Purple:"Violet",Red:"Rouge",White:"Blanc",Black:"Noir",Rose:"Rose"};
  const gospelText=localizedText(proper?.gospel,language),reference=gospelRef(gospelText);
  const formularies=day?.massOptions?.length>1?day.massOptions.map(o=>({index:o.index,label:o.label||o.title||`${tr(language,"formulary")} ${o.index+1}`,selected:o.index===day.formularyIndex})):[];
  return{
    language,dateIso:state.selectedDate,
    weekday:new Intl.DateTimeFormat(locale,{weekday:"long"}).format(date),
    dateLong:formatDisplayDate(date),
    celebration,rank:rankValue?`${tr(language,"rank")} · ${rankValue}`:"",
    colour:language==="fr"?(colourMapFr[rawColour]||rawColour):rawColour,
    loading:Boolean(state.resolving),calendarFailed,
    properStatus:resolution?.proper?.status==="ready"?"ready":resolution?.proper?.status==="failed"?"failed":"idle",
    properMessage:resolution?.proper?.status==="failed"?tr(language,"properUnavailableBody"):null,
    gospelReference:reference,gospelExcerpt:proper?(excerpt(gospelText,reference)||tr(language,"noGospel")):tr(language,"noGospel"),
    massHint:tr(language,"todaysMassHint"),
    formularyLabel:formularies.length?`${tr(language,"formulary")} ${(day?.formularyIndex??0)+1}/${formularies.length}`:null,
    formularies,
    commemorationLabel:day?.commemorations?.length?`${tr(language,"commemorations")} · ${day.commemorations.map(x=>x.title||x.name).join(" · ")}`:null,
    week:weekCells(state.selectedDate,language),
  };
}


export function renderHomeToString(state,win=globalThis){
  const vm=buildHomeViewModel(state,win),t=k=>tr(vm.language,k);
  const status=vm.calendarFailed?`<div class="statusCard error"><strong>${esc(t("calendarUnavailable"))}</strong><span>${esc(t("calendarUnavailableBody"))}</span></div>`
    :vm.properStatus==="failed"?`<div class="statusCard warning"><strong>${esc(t("properUnavailable"))}</strong><span>${esc(vm.properMessage)}</span></div>`:"";
  const currentProper=state.resolution?.proper?.status==="ready"?state.resolution.proper.data:null;
  const enrichers=buildHomeEnrichers(state,win);
  const coverage=currentProper?.languageCoverage?.[vm.language];
  const translationStatus=coverage&&!coverage.complete?`<div class="statusCard warning contentIntegrity"><strong>${vm.language==="fr"?"Traduction du Propre incomplète":"Proper translation incomplete"}</strong><span>${esc(`${coverage.available}/${coverage.expected} · ${coverage.missing.join(", ")}`)}</span></div>`:"";
  const week=vm.week.map(c=>`<button class="dayCell${c.selected?" selected":""}${c.today?" today":""}" data-date="${esc(c.date)}" aria-pressed="${c.selected}"><span>${esc(c.day)}</span><b>${esc(c.number)}</b></button>`).join("");
  const meta=[vm.rank,vm.colour?`${t("colour")} · ${vm.colour}`:"",vm.formularyLabel,vm.commemorationLabel].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join("");
  const chooser=vm.formularies.length?`<div class="formularyChooser" role="group" aria-label="${esc(t("formulary"))}">${vm.formularies.map(x=>`<button data-formulary="${x.index}" class="${x.selected?"selected":""}" aria-pressed="${x.selected}">${esc(x.label)}</button>`).join("")}</div>`:"";
  const art=win?.AO_PHASE1_ART?.homeMarkup?.(state,vm.language)||"";
  const resume=readNativeMassResume(win);
  const resumeMeta=resume?[
    resume.date?formatDisplayDate(resume.date):"",
    resume.stepNumber?String(resume.stepNumber):"",
  ].filter(Boolean).join(" · "):"";
  return `<main class="homeScreen" data-home-language="${vm.language}" data-ao-asset-id="${canonicalAssetIdForSurface("home")||""}" data-ao-home-presentation-owner="${HOME_PRESENTATION_VERSION}">
<header class="homeHeader"><div class="brandRow"><div class="brandMark aoBrandEmblem" aria-hidden="true"></div><div class="brandText"><div class="brandName">${esc(t("brand"))}</div><div class="brandSub">${esc(t("subtitle"))}</div></div><button type="button" class="iconButton homeUtilityButton" data-home-settings aria-label="${esc(vm.language==="fr"?"Réglages":"Settings")}">${assetIcon("ao-ui-settings")}</button></div>
<div class="dateNavigator"><button class="iconButton" data-nav="previous" aria-label="${esc(t("previousDay"))}">${assetIcon("ao-ui-previous")}</button><button class="dateTitle" data-nav="today"><span>${esc(vm.weekday)}</span><b>${esc(vm.dateLong)}</b></button><button class="iconButton" data-nav="next" aria-label="${esc(t("nextDay"))}">${assetIcon("ao-ui-next")}</button></div><div class="dateRail" aria-label="Week">${week}</div></header>
<section class="celebrationBlock"><div class="eyebrow">${esc(vm.weekday)}</div><h1>${esc(vm.celebration)}</h1><div class="metaLine">${meta}</div>${chooser}${art}${vm.loading?'<div class="loadingLine"><span></span>'+esc(t("loading"))+"</div>":""}</section>
${status}${translationStatus}
${resume?`<button class="resumeCard" data-resume-mass data-ao-resume-owner="${resume.source}"><span>${vm.language==="fr"?"Messe en cours":"Mass in progress"}</span><b>${vm.language==="fr"?"Reprendre":"Resume"}</b>${resumeMeta?`<small>${esc(resumeMeta)}</small>`:""}</button>`:""}
<section class="homeSection aroundMass"><div class="sectionLabel">${esc(t("aroundMass"))}</div><div class="phaseActions"><button class="phaseButton secondary" data-action="prepare"><span>Ⅰ</span><b>${esc(t("prepare"))}</b></button><button class="phaseButton primary" data-home-mass-entry><span>Ⅱ</span><b>${esc(t("followMass"))}</b></button><button class="phaseButton secondary" data-action="thanks"><span>Ⅲ</span><b>${esc(t("giveThanks"))}</b></button></div></section>
<section class="contentCard gospelCard"><div class="cardKicker">${esc(t("holyGospel"))}</div>${vm.gospelReference?`<div class="scriptureRef">${esc(vm.gospelReference)}</div>`:""}<p>${esc(vm.gospelExcerpt)}</p>${vm.gospelReference?scriptureContextCapsule(vm.gospelReference,{french:vm.language==="fr"}):""}<button class="textAction" data-action="gospel">${esc(t("exploreGospel"))} <span>${assetIcon("ao-ui-next")}</span></button></section>
<section class="contentCard aoHomeScriptureLink"><div class="cardKicker">${esc(vm.language==="fr"?"SAINTE ÉCRITURE":"SACRED SCRIPTURE")}</div><p>${esc(vm.language==="fr"?"Lire et rechercher dans la Bible catholique traditionnelle ; conserver des signets.":"Read and explore the traditional Catholic Bible; keep bookmarks.")}</p><button type="button" class="textAction" data-home-scripture>${esc(vm.language==="fr"?"Ouvrir la Sainte Écriture":"Open Sacred Scripture")} <span>${assetIcon("ao-ui-next")}</span></button></section>
${renderHomeEnrichersToString(enrichers,state,win)}
<section class="contentCard findCard"><div><div class="cardKicker">${esc(vm.language==="fr"?"EXPLORER":"EXPLORE")}</div><p>${esc(vm.language==="fr"?"Messes traditionnelles, sanctuaires, coutumes et pèlerinages — un seul atlas sourcé.":"Traditional Masses, shrines, customs and pilgrimages — one source-backed atlas.")}</p><button type="button" class="textAction aoHomeCustomsAtlasLink" data-home-customs-atlas>${esc(vm.language==="fr"?"Ouvrir l’Atlas des coutumes":"Open Customs Atlas")} ${assetIcon("ao-ui-next")}</button></div><button class="roundAction" data-home-find aria-label="${esc(vm.language==="fr"?"Ouvrir Explore":"Open Explore")}">${assetIcon("ao-ui-next")}</button></section>
<div class="homeSpacer"></div></main>`;
}

export function renderHome(root,state,win=globalThis){
  if(!root||state?.route!=="home")return false;
  root.innerHTML=renderHomeToString(state,win);
  return true;
}
