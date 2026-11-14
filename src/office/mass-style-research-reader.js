/**
 * Divine Office Phase F — Mass-reader visual grammar applied to exact,
 * source-aligned Office cells. This is a research preview ONLY, not a Pray
 * route. DO NOT promote this renderer by itself: the documents are not
 * independently certified.
 *
 * Office cells remain atomic: their Latin and vernacular line breaks are not
 * presumed verse-aligned. LIVE highlights individual LATIN source lines and
 * presents the full translated cell separately; MISSAL displays both full
 * source cells in parallel, without manufacturing verse correspondence.
 */
import {validateResearchOfficePair} from "./research-reader.js";
import {primeSplitRequired,splitAllSoulsPrimeMartyrologyCell} from "./prime-martyrology-split.js";

export const OFFICE_MASS_RESEARCH_VERSION="ao.office.mass-style-research.v1";
export const OFFICE_HOURS=Object.freeze([
  ["MATINS","Matins","Matines"],
  ["LAUDS","Lauds","Laudes"],
  ["PRIME","Prime","Prime"],
  ["TERCE","Terce","Tierce"],
  ["SEXT","Sext","Sexte"],
  ["NONE","None","None"],
  ["VESPERS","Vespers","Vêpres"],
  ["COMPLINE","Compline","Complies"],
]);
const ROLE_LABELS=Object.freeze({
  OPENING:["Opening","Ouverture"],PSALMODY:["Psalmody","Psalmodie"],
  CHAPTER_HYMN_VERSE:["Chapter · Hymn · Versicle","Capitule · Hymne · Verset"],
  GOSPEL_CANTICLE:["Gospel canticle","Cantique évangélique"],
  CANTICLE:["Canticle","Cantique"],
  LESSON_OR_ABSOLUTION:["Lesson / absolution","Leçon / absolution"],
  RESPONSORY:["Responsory","Répons"],
  INVITATORY:["Invitatory","Invitatoire"],HYMN:["Hymn","Hymne"],
  PRAYER:["Prayer","Oraison"],CONCLUSION:["Conclusion","Conclusion"],
  NOCTURN:["Nocturn","Nocturne"],
  LESSON_WITH_BLESSING:["Lesson / blessing","Leçon / bénédiction"],
  MATINS_PREPARATION:["Matins preparation","Préparation des matines"],
  MARIAN_ANTIPHON:["Marian antiphon","Antienne mariale"],
  MARTYROLOGY:["Martyrology","Martyrologe"],
  POST_MARTYROLOGY_PRAYER:["Versicle and prayer","Verset et oraison"],
  PRIME_CHAPTER_OFFICE:["Chapter office","Office du chapitre"],
  RUBRICAL_NOTE:["Rubric","Rubrique"],
  VERSICLE_RESPONSE:["Versicle / response","Verset / répons"],
  SOURCE_SECTION:["Source section","Section source"],
});
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lo=(en,fr,locale)=>locale==="fr"?fr:en;
const attributes=(attrs)=>Object.entries(attrs).map(([key,value])=>' '+key+'="'+esc(value)+'"').join("");
const lines=s=>String(s).split("\n");
const scriptureLine=s=>/^(?:\d{1,3}(?::\d+(?:-\d+)?)?\s|[℣℟]\.?\s|Ant\.\s|Psalmus\s)/iu.test(s);
const par=(line,i,card)=>{
  const cls="ao-reader-paragraph aoOfficeLiveParagraph";
  const aria=scriptureLine(line)?"VERSE":"TEXT";
  return '<p class="'+cls+'" data-office-line="'+i+'" data-source-cell="'+esc(card.sourceCellId)+
    '" data-line-kind="'+aria+'" data-active="'+(i===0?"true":"false")+'" lang="la">'+
    esc(line||" ")+'</p>';
};

/**
 * Most source cells map to one card. One explicit source-attested exception:
 * All Souls Prime Prima5 contains the anticipated Martyrology AND the
 * following versicle and prayer. Present two navigable PARTS of that same
 * immutable source cell, with exact reversibility, instead of omitting the
 * mandatory prayer whenever the reading is omitted outside choir.
 */
export function projectOfficeMassStyleCards({latin,translation,locale="en"}={}){
  const ctx=validateResearchOfficePair({latin,translation,locale});
  const projected=[];
  for(let i=0;i<latin.sections.length;i++){
    const s=latin.sections[i],t=translation.sections[i];
    const role=s.semantic.role;
    const label=ROLE_LABELS[role]?.[locale==="fr"?1:0];
    if(!label)throw Error("OFFICE_MASS_STYLE_UNCLASSIFIED_ROLE");
    const add=(r,title,a,b,part="WHOLE_SOURCE_CELL")=>{
      projected.push(Object.freeze({
        id:s.sourceCellId+(part==="WHOLE_SOURCE_CELL"?"":":"+part),
        index:projected.length,sourceIndex:s.sourceIndex,
        translationSourceIndex:t.sourceIndex,
        sourceCellId:s.sourceCellId,vernacularSourceCellId:t.sourceCellId,
        sourcePart:part,role:r,title,latin:a,vernacular:b,
        latinLines:Object.freeze(lines(a)),
        // Never claim source-cell PARTS are line-aligned across languages.
        translationAlignment:part==="WHOLE_SOURCE_CELL"?
          "SOURCE_CELL_ONLY":"SOURCE_ATTESTED_SEGMENT_ONLY",
      }));
    };
    if(primeSplitRequired({date:ctx.date,hour:ctx.hour,role,
       sourceCellId:s.sourceCellId})){
      const a=splitAllSoulsPrimeMartyrologyCell(s.text,"la");
      const b=splitAllSoulsPrimeMartyrologyCell(t.text,locale);
      // Exact original text must remain reconstructible independently for
      // each language. Latin and translation have different line counts.
      if(a.martyrology+"\n"+a.postPrayer!==s.text||
         b.martyrology+"\n"+b.postPrayer!==t.text)
        throw Error("OFFICE_MASS_PRIME_SOURCE_RECONSTRUCTION_FAILED");
      add("MARTYROLOGY",lo("Martyrology reading","Lecture du martyrologe",locale),
        a.martyrology,b.martyrology,"MARTYROLOGY_READING");
      add("POST_MARTYROLOGY_PRAYER",lo("Versicle and prayer","Verset et oraison",locale),
        a.postPrayer,b.postPrayer,"POST_MARTYROLOGY_PRAYER");
    }else add(role,label,s.text,t.text);
  }
  const cards=projected;
  return Object.freeze({version:OFFICE_MASS_RESEARCH_VERSION,context:ctx,
    cards:Object.freeze(cards)});
}
export function moveOfficeCard({index=0,total,delta=0}={}){
  if(!Number.isInteger(total)||total<1||!Number.isInteger(index)||
    index<0||index>=total||![ -1,0,1].includes(delta))
    throw Error("OFFICE_MASS_NAV_INVALID");
  return Math.max(0,Math.min(total-1,index+delta));
}
const headName=(hour,locale)=>OFFICE_HOURS.find(h=>h[0]===hour)?.[locale==="fr"?2:1]??hour;
const slug=(date,hour,locale)=>
  date+"-"+hour.toLowerCase()+"-"+locale+".html";
function hourMenu(date,selected,locale,availableHours){
  return OFFICE_HOURS.filter(([id])=>availableHours.includes(id)).map(([id,en,fr])=>
    '<a class="aoOfficeHourChoice" href="'+slug(date,id,locale)+'" data-office-hour-link="'+id+
    '" '+(selected===id?'aria-current="page"':'')+'>'+esc(locale==="fr"?fr:en)+'</a>').join("");
}
function renderCard(card,locale){
  const sourceAttrs=attributes({
    "data-office-card":card.index,
    "data-office-role":card.role,
    "data-source-cell-la":card.sourceCellId,
    "data-source-cell-vernacular":card.vernacularSourceCellId,
    "data-office-translation-alignment":card.translationAlignment,
    "data-office-source-part":card.sourcePart,
  });
  return '<article class="aoOfficeMassCard"'+sourceAttrs+' '+(card.index===0?'':'hidden')+'>'+
    '<header class="aoOfficeCardHead"><span class="aoOfficeCardKicker">'+esc(card.role.replaceAll("_"," "))+'</span>'+
    '<h2 class="ao-prayer-title">'+esc(card.title)+'</h2>'+
    (card.sourcePart==="MARTYROLOGY_READING"?
      '<button type="button" class="aoOfficeSkipMartyrology" data-office-omit-martyrology '+
      'aria-label="'+esc(lo("Outside choir: omit Martyrology reading, continue with versicle and prayer",
        "Hors du chœur : omettre le martyrologe, continuer avec le verset et l’oraison",locale))+'">'+
      esc(lo("Outside choir · Continue to prayer","Hors du chœur · Aller à l’oraison",locale))+
      '</button>':"")+'</header>'+
    '<div class="aoOfficeLiveFace" data-office-face="LIVE" >'+
    '<div class="aoOfficeLatinLines ao-prayer-body" lang="la">'+
    card.latinLines.map((line,i)=>par(line,i,card)).join("")+'</div>'+
    '<section class="aoOfficeFullTranslation" lang="'+locale+'" aria-label="'+esc(lo("Full source-cell translation","Traduction de la cellule entière",locale))+'">'+
    '<div class="aoOfficeTranslationHeading">'+esc(lo("Translation of this section","Traduction de cette section",locale))+'</div>'+
    '<div class="aoOfficeSourceText">'+esc(card.vernacular)+'</div></section></div>'+
    '<div class="aoOfficeMissalFace" data-office-face="MISSAL" hidden>'+
    '<div class="aoOfficeMissalCols"><section lang="la" aria-label="Latin">'+
    '<div class="aoOfficeLanguageLabel">LATIN</div><div class="aoOfficeSourceText">'+esc(card.latin)+'</div></section>'+
    '<section lang="'+locale+'" aria-label="'+esc(lo("English","Français",locale))+'">'+
    '<div class="aoOfficeLanguageLabel">'+esc(lo("ENGLISH","FRANÇAIS",locale))+'</div>'+
    '<div class="aoOfficeSourceText">'+esc(card.vernacular)+'</div></section></div></div>'+
    '</article>';
}
export function renderOfficeMassStyleResearchReader({
  latin,translation,locale="en",
  availableHours=OFFICE_HOURS.map(x=>x[0]),
  availableDates=[latin?.date],
  availableLocales=["en","fr"],
}={}){
  const {cards,context}=projectOfficeMassStyleCards({latin,translation,locale});
  if(!Array.isArray(availableHours)||!availableHours.includes(context.hour)||
    availableHours.some(h=>!OFFICE_HOURS.some(x=>x[0]===h))||
    !Array.isArray(availableDates)||!availableDates.includes(context.date)||
    availableDates.some(d=>typeof d!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(d))||
    !Array.isArray(availableLocales)||!availableLocales.includes(locale)||
    availableLocales.some(l=>!["en","fr"].includes(l)))
    throw Error("OFFICE_MASS_RESEARCH_NAV_CONTEXT_INVALID");
  const h=headName(context.hour,locale);
  const first=cards[0];
  const progress=cards.map((c,i)=>'<button type="button" data-office-jump="'+i+
    '" class="aoOfficeProgressSegment" aria-label="'+esc(c.title)+'" aria-current="'+(i===0?"step":"false")+'"></button>').join("");
  const title=String(latin.headline).split("\n")[0];
  return '<main class="ao-reader-shell aoOfficeMassReader" data-office-research-only="true"'+
    attributes({"data-office-hour":context.hour,"data-office-date":context.date,
      "data-office-mode":"LIVE","data-office-locale":locale,"data-office-total":cards.length,
      "data-office-card-index":"0","data-office-published":"false",
      "data-office-chant-enabled":"false"})+'>'+
    '<header class="ao-reader-top-ribbon">'+
    '<button type="button" class="ao-reader-top-action" data-office-hours-toggle aria-haspopup="true" aria-expanded="false" aria-label="'+
      esc(lo("Choose an Office hour","Choisir une heure",locale))+'">‹</button>'+
    '<button type="button" class="ao-section-jump" data-office-sections-toggle aria-haspopup="true" aria-expanded="false">'+
      '<span data-office-section-title>'+esc(first.title)+'</span> <span class="ao-section-caret">⌄</span></button>'+
    '<button type="button" class="ao-reader-top-action" data-office-settings-toggle aria-haspopup="true" aria-expanded="false" aria-label="'+
      esc(lo("Reader settings","Réglages du lecteur",locale))+'">⚙</button></header>'+
    '<div class="aoOfficeRibbonMenus">'+
    '<nav class="aoOfficeHourMenu" data-office-hours-menu hidden aria-label="'+esc(lo("Canonical hours","Heures canoniales",locale))+'">'+
      hourMenu(context.date,context.hour,locale,availableHours)+'</nav>'+
    '<nav class="ao-section-menu aoOfficeSectionMenu" data-office-sections-menu hidden aria-label="'+
      esc(lo("Office sections","Sections de l’Office",locale))+'">'+
      cards.map(c=>'<button type="button" data-office-section-select="'+c.index+'">'+esc(c.title)+'</button>').join("")+'</nav>'+
    '<section class="ao-mass-prefs aoOfficePrefs" data-office-settings-menu hidden aria-label="'+esc(lo("Reader settings","Réglages du lecteur",locale))+'">'+
      '<h2>'+esc(lo("Reader settings","Réglages du lecteur",locale))+'</h2>'+
      '<div class="aoOfficeModeControls" role="group" aria-label="Reading mode">'+
        '<button type="button" data-office-mode-select="LIVE" aria-pressed="true">LIVE</button>'+
        '<button type="button" data-office-mode-select="MISSAL" aria-pressed="false">MISSAL</button></div>'+
      '<div class="aoOfficeLocaleControls" role="group" aria-label="Translation">'+
        availableLocales.map(l=>'<a href="'+slug(context.date,context.hour,l)+'"'+
          (locale===l?' aria-current="page"':'')+'>'+l.toUpperCase()+'</a>').join("")+
        (availableLocales.includes("en")?"":'<span class="aoOfficeLocaleUnavailable" aria-disabled="true" title="English translation requires source review">EN review</span>')+
        (availableLocales.includes("fr")?"":'<span class="aoOfficeLocaleUnavailable" aria-disabled="true" title="French source incomplete">FR incomplete</span>')+
        '</div>'+
      '<div class="aoOfficeDateChoice" aria-label="'+esc(lo("Pilot dates","Dates de recherche",locale))+'">'+
      availableDates.map(d=>'<a href="'+slug(d,context.hour,locale)+'"'+
        (d===context.date?' aria-current="page"':'')+'>'+d+'</a>').join("")+'</div>'+
      '<label class="aoOfficeFontControl">'+esc(lo("Text size","Taille du texte",locale))+
        ' <input type="range" min="0.85" max="1.3" step="0.05" value="1" data-office-font-size></label></section></div>'+
    '<div class="ao-state-ribbon aoOfficeStateRibbon"><span class="aoOfficeObserved">'+
      esc(h)+' · '+esc(title)+'</span><span class="aoOfficeEdition">ROMAN 1960 · '+esc(context.date)+'</span>'+
      '<span class="aoOfficeModeLabel" data-office-mode-label>LIVE · '+locale.toUpperCase()+'</span></div>'+
    '<div class="ao-progress-track aoOfficeProgressTop"><span data-office-progress-width style="width:'+100/cards.length+'%"></span></div>'+
    '<section class="ao-reader-stage aoOfficeMassStage" aria-label="'+esc(h)+'">'+
      '<div class="aoOfficeRail aoOfficeRailLeft" aria-hidden="true"><span data-office-source-role>'+
      esc(first.role.replaceAll("_"," "))+'</span></div>'+
      '<div class="ao-card-viewport aoOfficeMassViewport" data-office-card-scroll tabindex="0" aria-label="Office prayer text">'+
        cards.map(c=>renderCard(c,locale)).join("")+'</div>'+
    '</section>'+
    '<nav class="ao-reader-nav aoOfficeBottomNav" aria-label="'+esc(lo("Office card navigation","Navigation de l’Office",locale))+'">'+
      '<button type="button" data-office-nav="-1" aria-label="'+esc(lo("Previous card","Carte précédente",locale))+'" disabled>‹</button>'+
      '<div class="aoOfficeCardPosition"><span data-office-card-title>'+esc(first.title)+'</span>'+
        '<small data-office-position>1 / '+cards.length+'</small>'+
        '<div class="aoOfficeCardProgress">'+progress+'</div></div>'+
      '<button type="button" data-office-nav="1" aria-label="'+esc(lo("Next card","Carte suivante",locale))+'"'+
        (cards.length===1?" disabled":"")+'>›</button></nav>'+
    '<div class="aoOfficeVerificationNote" role="note">'+esc(lo(
      "RESEARCH PREVIEW · Not approved for liturgical publication. No chant scores.",
      "APERÇU DE RECHERCHE · Non approuvé pour publication liturgique. Aucune partition.",
    locale))+'</div>'+
    '</main>';
}
