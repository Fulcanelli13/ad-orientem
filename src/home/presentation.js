import { removeExcludedLegacyHomeArtwork } from "./legacy-art-exclusions.js";
import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { buildHomeEnrichers, renderHomeEnrichersToString } from "./enrichers.js";
import { formatDisplayDate } from "../app/date-format.js";
import { scriptureContextCapsule } from "../scripture/context.js";
import { TODAY_V2_CSS } from "./today-v2-styles.js";
import { buildTodayV2Sections, renderTodayV2Sections } from "./today-v2-sections.js";

export const HOME_PRESENTATION_VERSION="modular-home-presentation-v1";

const COPY={
  en:{
    brand:"AD ORIENTEM",subtitle:"1962 Roman Mass companion",prepare:"Prepare",followMass:"Follow Mass",
    giveThanks:"Give thanks",aroundMass:"Around the Mass",holyGospel:"Holy Gospel",exploreGospel:"Explore Gospel",
    todaysMass:"Today’s Mass",todaysMassHint:"Propers · readings · liturgical information",openMass:"Open today’s Mass",openSelectedMass:"Open Mass for selected day",
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
    todaysMass:"Messe du jour",todaysMassHint:"Propres · lectures · informations liturgiques",openMass:"Ouvrir la Messe du jour",openSelectedMass:"Ouvrir la Messe du jour choisi",
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
function introitIncipit(proper){
  // The Latin incipit comes exclusively from the resolved Proper; a
  // Gregorian title or historical feast association is never guessed.
  const raw=proper?.introit?.lat;
  if(typeof raw!=="string")return null;
  const first=raw.split(/\r?\n/).map(s=>s.trim()).find(Boolean)||"";
  if(!first)return null;
  if(first.length<=90)return first;
  return first.slice(0,90).replace(/\s+\S*$/,"").trim()+"…";
}
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
    const offset=i-selected.getDay(),d=new Date(selected);d.setDate(d.getDate()+offset);const key=iso(d);
    return{date:key,day:fmt.format(d).replace(".",""),number:String(d.getDate()),selected:key===dateIso,today:key===today};
  });
}

export function buildHomeViewModel(state,win=globalThis){
  const language=state.language==="fr"?"fr":"en",date=parseIso(state.selectedDate),locale=language==="fr"?"fr-FR":"en-GB";
  const resolution=state.resolution,day=resolution?.day??null,proper=resolution?.proper?.status==="ready"?resolution.proper.data:null;
  const calendarFailed=resolution?.status==="failed";
  const celebration=(proper?(language==="fr"?(proper.nameFr||proper.name||day?.main?.title):(proper.name||day?.main?.title)):day?.main?.title)
    ||tr(language,calendarFailed?"calendarUnavailable":"loading");
  // Rank belongs to the observed 1962 day, not the Proper reused at Mass.
  const rankValue=day?.main?.rank!=null?String(day.main.rank):(proper?.rank||"");
  const rawColour=resolution?.colourPlan?.label||day?.main?.color||"";
  const colourMapFr={Green:"Vert",Violet:"Violet",Purple:"Violet",Red:"Rouge",White:"Blanc",Black:"Noir",Rose:"Rose"};
  const gospelText=localizedText(proper?.gospel,language),reference=gospelRef(gospelText);
  const stamped=resolution?.date??day?.date??null;
  const resolvedForSelection=Boolean(!state.resolving&&resolution?.status!=="failed"&&(!stamped||stamped===state.selectedDate)&&day?.main);
  const observedTitle=resolvedForSelection?(day?.main?.title||celebration):celebration;
  const properTitle=resolvedForSelection&&proper?
    ((language==="fr"?(proper.nameFr||proper.name):proper.name)||"").trim(): "";
  const massFormularyName=properTitle&&properTitle!==observedTitle?properTitle:null;
  const massIntroit=resolvedForSelection?introitIncipit(proper):null;
  const formularies=day?.massOptions?.length>1?day.massOptions.map(o=>({index:o.index,label:o.label||o.title||`${tr(language,"formulary")} ${o.index+1}`,selected:o.index===day.formularyIndex})):[];
  return{
    language,dateIso:state.selectedDate,todayIso:iso(new Date()),isToday:state.selectedDate===iso(new Date()),
    weekday:new Intl.DateTimeFormat(locale,{weekday:"long"}).format(date),
    dateLong:formatDisplayDate(date),
    celebration,observedTitle,massFormularyName,massIntroit,resolvedForSelection,rank:rankValue?`${tr(language,"rank")} · ${rankValue}`:"",
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
  const homeCalendar=buildTodayV2Sections(state,vm,enrichers);
  const season=vm.language==="fr"?homeCalendar.period.fr:homeCalendar.period.en;
  const coverage=currentProper?.languageCoverage?.[vm.language];
  const translationStatus=coverage&&!coverage.complete?`<div class="statusCard warning contentIntegrity"><strong>${vm.language==="fr"?"Traduction du Propre incomplète":"Proper translation incomplete"}</strong><span>${esc(`${coverage.available}/${coverage.expected} · ${coverage.missing.join(", ")}`)}</span></div>`:"";
  const browsingNotice=!vm.isToday
    ?'<div class="aoTodayV2SelectedDayNotice" data-home-selected-day="'+esc(vm.dateIso)+'" role="status"><span>'+
      esc(vm.language==="fr"?"Vous consultez le "+vm.dateLong+" · ce n’est pas aujourd’hui":"Viewing "+vm.dateLong+" · not today")+
      '</span><button type="button" data-home-restore-today>'+esc(vm.language==="fr"?"Revenir à aujourd’hui":"Return to today")+'</button></div>'
    :"";
  const week=vm.week.map(c=>`<button class="dayCell${c.selected?" selected":""}${c.today?" today":""}${c.selected&&vm.resolvedForSelection?" aoVerifiedDay":" aoUnresolvedDay"}" data-date="${esc(c.date)}" aria-pressed="${c.selected}"><span>${esc(c.day)}</span><b>${esc(c.number)}</b><i class="aoWeekColour" aria-hidden="true"></i></button>`).join("");
  // Historic commemorations have ONE public surface: the source-labelled
  // "Also honoured today" section, not a repeated Mass-header meta line.
  const meta=[vm.rank,vm.colour?`${t("colour")} · ${vm.colour}`:"",vm.formularyLabel].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join("");
  const chooser=vm.formularies.length?`<div class="formularyChooser" role="group" aria-label="${esc(t("formulary"))}">${vm.formularies.map(x=>`<button data-formulary="${x.index}" class="${x.selected?"selected":""}" aria-pressed="${x.selected}">${esc(x.label)}</button>`).join("")}</div>`:"";
  // Artwork is mounted into its own DOM island by renderHome.
  // Donor markup must not rebalance the Home/Mass hero structure.
  const resume=readNativeMassResume(win);
  const resumeMeta=resume?[
    resume.date?formatDisplayDate(resume.date):"",
    resume.stepNumber?String(resume.stepNumber):"",
  ].filter(Boolean).join(" · "):"";
  return `<style data-ao-today-v2-style>${TODAY_V2_CSS}</style><main class="homeScreen aoTodayV2" data-home-language="${vm.language}" data-ao-asset-id="${canonicalAssetIdForSurface("home")||""}" data-ao-home-presentation-owner="${HOME_PRESENTATION_VERSION}">
<header class="homeHeader aoTodayV2Header"><div class="brandRow"><div class="brandMark aoBrandEmblem" aria-hidden="true"></div><div class="brandText"><div class="brandName">${esc(t("brand"))}</div><div class="brandSub">${esc(t("subtitle"))}</div></div><button type="button" class="iconButton aoTodayV2PrayerJump" data-home-prayer-jump aria-label="${esc(vm.language==="fr"?"Accéder aux prières de ce jour":"Jump to prayer through the day")}" title="${esc(vm.language==="fr"?"Prières de ce jour":"Prayer through the day")}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></button><button type="button" class="iconButton homeUtilityButton" data-home-settings aria-label="${esc(vm.language==="fr"?"Réglages":"Settings")}">${assetIcon("ao-ui-settings")}</button></div>
<nav class="aoTodayV2Tabs aoTcmLens" aria-label="Calendar views"><button type="button" data-home-calendar-today aria-current="page">${esc(vm.isToday?(vm.language==="fr"?"Aujourd’hui":"Today"):(vm.language==="fr"?"Jour choisi":"Selected day"))}</button><button type="button" data-home-calendar data-home-calendar-view="picker">${esc(vm.language==="fr"?"Mois":"Month")}</button><button type="button" data-home-calendar data-home-calendar-view="year">${esc(vm.language==="fr"?"Année":"Year")}</button></nav><div class="aoTodayV2CalendarInline" data-home-calendar-inline hidden aria-label="${esc(vm.language==="fr"?"Calendrier liturgique":"Liturgical calendar")}"></div>${browsingNotice}<div class="dateNavigator"><button class="iconButton" data-nav="previous" aria-label="${esc(t("previousDay"))}">${assetIcon("ao-ui-previous")}</button><button class="dateTitle" data-nav="today"><span>${esc(vm.weekday)}</span><b>${esc(vm.dateLong)}</b></button><button class="iconButton" data-nav="next" aria-label="${esc(t("nextDay"))}">${assetIcon("ao-ui-next")}</button></div><div class="dateRail" aria-label="Week">${week}</div><div class="aoHomeCalendarAccess" hidden><button type="button" class="aoHomeCalendarAction" data-home-calendar aria-label="${esc(vm.language==="fr"?"Ouvrir le calendrier liturgique complet":"Open full liturgical calendar")}">${assetIcon("ao-nav-calendar")}<span>${esc(vm.language==="fr"?"Calendrier complet":"Full Calendar")}</span>${assetIcon("ao-ui-next")}</button></div></header>
<section class="celebrationBlock aoEditorialHero aoTodayV2Frontispiece"><div class="aoTodayV2Art"><div class="aoTodayV2ArtSource" data-ao-home-art-slot><div class="aoTodayV2NoArt" aria-label="Artwork awaiting editorial approval"></div></div></div><div class="aoTodayV2HeroActions"><div class="aoTodayV2DayIdentity"><span class="eyebrow aoEditorialKicker">${esc(vm.language==="fr"?"CALENDRIER ROMAIN · 1962":"ROMAN CALENDAR · 1962")}</span><h1 class="aoEditorialTitle">${esc(vm.observedTitle)}</h1></div><div class="metaLine aoEditorialMeta">${meta}</div><button type="button" class="aoTodayV2SeasonMicro" data-home-calendar data-home-calendar-view="year" aria-label="${esc(vm.language==="fr"?"Voir le temps liturgique dans l’année":"View the liturgical season in Calendar")}">${esc(season)} <span aria-hidden="true">›</span></button>${vm.massFormularyName?`<div class="aoTodayV2ActualFormulary"><span>${esc(vm.language==="fr"?"MESSE DU JOUR":"MASS FORMULARY")}</span><strong>${esc(vm.massFormularyName)}</strong></div>`:""}${vm.massIntroit?`<div class="aoTodayV2Introit"><span>INTROIT</span><em lang="la">${esc(vm.massIntroit)}</em></div>`:""}${chooser}${vm.loading?'<div class="loadingLine"><span></span>'+esc(t("loading"))+"</div>":""}<section class="aoTodayV2Mass">
<div class="sectionLabel">${esc(t("aroundMass"))}</div>
${resume?
`<button type="button" class="aoTodayV2PrimaryMass phaseButton primary aoEditorialPrimary" data-resume-mass data-ao-resume-owner="${resume.source}">
<span>${esc(vm.language==="fr"?"Messe en cours":"Mass in progress")}${resumeMeta?" · "+esc(resumeMeta):""}</span><b>${esc(vm.language==="fr"?"Reprendre la messe":"Resume Mass")} →</b></button>`:
`<button type="button" class="aoTodayV2PrimaryMass phaseButton primary aoEditorialPrimary" data-home-mass-entry>
<b>${esc(vm.isToday?t("openMass"):t("openSelectedMass"))} →</b></button>`}
<div class="aoTodayV2SecondaryMass"><button type="button" data-action="prepare">${esc(t("prepare"))}</button><button type="button" data-action="thanks">${esc(t("giveThanks"))}</button></div>
</section></div></section>
${status}${translationStatus}
${renderTodayV2Sections(homeCalendar,vm)}
<div class="aoTodayExploreFoot"><button type="button" data-home-find><strong>${esc(vm.language==="fr"?"Explorer les lieux sacrés":"Explore sacred places")}</strong><small>${esc(vm.language==="fr"?"Messes traditionnelles, sanctuaires et pèlerinages":"Traditional Masses, shrines and pilgrimages")}</small></button><button type="button" data-home-calendar data-home-calendar-view="day"><strong>${esc(vm.language==="fr"?"Coutumes au fil de l’année":"Traditions through the year")}</strong><small>${esc(vm.language==="fr"?"Consulter les coutumes et leurs sources dans le calendrier":"Read customs and their sources in Calendar")}</small></button></div>
<div class="homeSpacer"></div></main>`;
}

export function reconcileTodayHero(root){
  const screen=root?.querySelector?.(".homeScreen")??root;
  const hero=screen?.querySelector?.(".aoTodayV2Frontispiece");
  const actions=screen?.querySelector?.(".aoTodayV2HeroActions");
  const mass=screen?.querySelector?.(".aoTodayV2Mass");
  if(!hero||!actions||!mass)return false;
  // Enforce one authored structural parent after legacy home rehydration.
  // No new state, listener or duplicate Mass button is created.
  if(!hero.contains(actions))hero.append(actions);
  if(!actions.contains(mass))actions.append(mass);
  return hero.contains(mass);
}

export function renderHome(root,state,win=globalThis){
  if(!root||state?.route!=="home")return false;
  root.innerHTML=renderHomeToString(state,win);
  const slot=root.querySelector?.("[data-ao-home-art-slot]");
  if(slot){
    const language=state?.language==="fr"?"fr":"en";
    let art="";
    try{art=win?.AO_PHASE1_ART?.homeMarkup?.(state,language)||""}
    catch(error){win?.console?.warn?.("Approved Today artwork unavailable",error)}
    if(art)slot.innerHTML=art;
    // Legacy art is not curatorial approval; remove known rejected painter/ID selections.
    removeExcludedLegacyHomeArtwork(slot);
    // Donor fallback labels are not approved sacred paintings; retain the
    // devotional typographic hero but do not reserve an empty image column.
    const hasArt=Boolean(slot.querySelector("img[src],picture source[srcset],video[poster],canvas"));
    const hero=root.querySelector(".aoTodayV2Frontispiece");
    hero?.classList?.toggle("aoTodayV2ArtMissing",!hasArt);
    if(!hasArt)slot.innerHTML='<div class="aoTodayV2NoArt" aria-label="No reviewed artwork for this celebration"></div>';
  }
  reconcileTodayHero(root);
  return true;
}
