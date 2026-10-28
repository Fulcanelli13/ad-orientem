/*
 * Research-only Divine Office reader presentation. Reuses Pray/Tenebrae's
 * section vocabulary and reader shell; deliberately NOT registered as a route.
 * All upstream material is normalized plaintext, escaped again at rendering.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_RESEARCH_READER_VERSION="ao.office.research-reader.v1";
const TITLES=Object.freeze({
  OPENING:["Opening","Ouverture"],
  PSALMODY:["Psalmody","Psalmodie"],
  CHAPTER_HYMN_VERSE:["Chapter · Hymn · Versicle","Capitule · Hymne · Verset"],
  GOSPEL_CANTICLE:["Gospel canticle","Cantique évangélique"],
  CANTICLE:["Canticle","Cantique"],
  LESSON_OR_ABSOLUTION:["Lesson or absolution","Leçon ou absolution"],
  RESPONSORY:["Responsory","Répons"],
  INVITATORY:["Invitatory","Invitatoire"],
  HYMN:["Hymn","Hymne"],
  PRAYER:["Prayers","Prières"],
  CONCLUSION:["Conclusion","Conclusion"],
  NOCTURN:["Nocturn","Nocturne"],
  SOURCE_SECTION:["Source section","Section source"],
});
const HOUR_NAMES=Object.freeze({
  MATINS:["Matins","Matines"],LAUDS:["Lauds","Laudes"],
  PRIME:["Prime","Prime"],TERCE:["Terce","Tierce"],SEXT:["Sext","Sexte"],
  NONE:["None","None"],VESPERS:["Vespers","Vêpres"],COMPLINE:["Compline","Complies"],
});
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lines=value=>esc(value).replace(/\n/g,"<br>");
const label=(en,fr,locale)=>locale==="fr"?fr:en;
const required=(ok,code)=>{if(!ok)throw new Error("OFFICE_RESEARCH_READER_"+code)};
const blank=value=>typeof value==="string"&&value.trim().length>0;

/**
 * Read-only contract for paired, source-aligned *research* material.
 * No document is asserted to be liturgically complete or authoritative.
 */
export function validateResearchOfficePair({latin,translation,locale="en"}={}){
  required(locale==="en"||locale==="fr","LOCALE_INVALID");
  for(const document of [latin,translation]){
    required(document?.schema==="ao.office.source-cells.v1","SCHEMA_INVALID");
    required(document?.status==="STRUCTURED_UNVERIFIED"&&document?.publishable===false,"PUBLICATION_GATE");
    required(document?.verification?.rubrical===false&&document?.verification?.languageCompleteness===false,
      "UNVERIFIED_GATE");
    required(document?.sourceRevision===DIVINUM_OFFICIUM_PIN,"SOURCE_PIN_MISMATCH");
    required(Array.isArray(document?.sections)&&document.sections.length>0,"SECTIONS_MISSING");
    required(blank(document?.headline),"HEADLINE_MISSING");
  }
  required(latin.language==="la"&&translation.language===locale,"LANGUAGE_MISMATCH");
  required(latin.date===translation.date&&latin.hour===translation.hour&&latin.sourceRevision===translation.sourceRevision,
    "SOURCE_CONTEXT_MISMATCH");
  required(Object.hasOwn(HOUR_NAMES,latin.hour),"HOUR_INVALID");
  required(latin.sections.length===translation.sections.length,"SECTION_COUNT_MISMATCH");
  for(let i=0;i<latin.sections.length;i++){
    const a=latin.sections[i],b=translation.sections[i];
    required(a?.index===i+1&&b?.index===i+1,"SECTION_ORDER_INVALID");
    required(blank(a?.sourceCellId)&&blank(b?.sourceCellId)&&blank(a?.text)&&blank(b?.text),
      "SOURCE_TEXT_MISSING");
    required(Number.isInteger(a.sourceIndex)&&Number.isInteger(b.sourceIndex),"SOURCE_INDEX_MISSING");
    required(a.semantic?.latinSourceCellId===a.sourceCellId&&
      b.semantic?.latinSourceCellId===a.sourceCellId&&
      a.semantic?.role===b.semantic?.role&&
      Object.hasOwn(TITLES,a.semantic?.role??""),"SEMANTIC_ALIGNMENT_INVALID");
  }
  return Object.freeze({date:latin.date,hour:latin.hour,language:locale,count:latin.sections.length,
    witness:latin.sourceRevision});
}

/** This is plain inert HTML; any interactive navigation is standard in-page anchors. */
export function renderOfficeResearchReader({latin,translation,locale="en",mode="parallel"}={}){
  const info=validateResearchOfficePair({latin,translation,locale});
  required(["parallel","latin","vernacular"].includes(mode),"MODE_INVALID");
  const heading=HOUR_NAMES[info.hour][locale==="fr"?1:0];
  const nav=latin.sections.map((section,i)=>{
    const role=section.semantic.role, title=TITLES[role][locale==="fr"?1:0];
    return '<a href="#ao-office-section-'+(i+1)+'" class="aoOfficeResearchJump">'+
      esc(title)+' <span aria-hidden="true">·</span> '+(i+1)+'</a>';
  }).join("");
  const sections=latin.sections.map((section,i)=>{
    const other=translation.sections[i],role=section.semantic.role;
    const title=TITLES[role][locale==="fr"?1:0];
    const latinText=mode!=="vernacular"?'<div class="aoOfficeResearchText aoTenebPrayer" lang="la">'+lines(section.text)+'</div>':"";
    const vernText=mode!=="latin"?'<div class="aoOfficeResearchText aoTenebPrayer" lang="'+locale+'">'+lines(other.text)+'</div>':"";
    return '<section class="aoOfficeResearchSection aoTenebReading" id="ao-office-section-'+(i+1)+'"'+
      ' data-office-role="'+esc(role)+'" data-source-cell-la="'+esc(section.sourceCellId)+'"'+
      ' data-source-cell-vernacular="'+esc(other.sourceCellId)+'" aria-labelledby="ao-office-title-'+(i+1)+'">'+
      '<header class="aoOfficeResearchSectionHeading"><h3 id="ao-office-title-'+(i+1)+'">'+esc(title)+'</h3>'+
      '<span class="aoOfficeResearchPosition">'+(i+1)+' / '+info.count+'</span></header>'+
      '<div class="aoOfficeResearchColumns'+(mode==="parallel"?" parallel":" single")+'">'+
      (mode==="vernacular"?"":'<div class="aoOfficeResearchColumn"><p class="aoOfficeResearchLanguage">Latin</p>'+latinText+'</div>')+
      (mode==="latin"?"":'<div class="aoOfficeResearchColumn"><p class="aoOfficeResearchLanguage">'+
      esc(locale==="fr"?"Français":"English")+'</p>'+vernText+'</div>')+'</div></section>';
  }).join("");
  return '<main class="aoP435930Body aoTenebBody aoOfficeResearch" data-office-research-only="true"'+
    ' data-office-hour="'+esc(info.hour)+'" data-office-mode="'+esc(mode)+'">'+
    '<section class="aoTenebIntro aoOfficeResearchIntro"><small>BREVIARIUM ROMANUM · 1960</small>'+
    '<h2>'+esc(heading)+'</h2><p>'+esc(latin.date)+' · '+esc(latin.headline)+'</p></section>'+
    '<p class="aoOfficeResearchWarning" role="note">'+esc(label(
      "Research preview only · source alignment checked, liturgical and translation review pending.",
      "Aperçu de recherche uniquement · alignement vérifié, révision liturgique et linguistique en attente.",locale))+'</p>'+
    '<nav class="aoOfficeResearchNavigation" aria-label="'+esc(label("Office sections","Sections de l’Office",locale))+'">'+nav+'</nav>'+
    sections+
    '<details class="aoTenebSource aoOfficeResearchProvenance"><summary>'+esc(label(
      "Liturgical source and verification status","Source liturgique et état de vérification",locale))+'</summary>'+
    '<p>Divinum Officium · Rubrics 1960 - 1960 · '+esc(info.witness)+'</p>'+
    '<p>'+esc(label("Texts are not yet independently verified against a printed Breviary.",
      "Textes non encore collationnés indépendamment avec un bréviaire imprimé.",locale))+'</p>'+
    '<p>'+esc(label("Original numbered source cells are retained; omitted ferial preces markers are recorded separately.",
      "Les cellules sources d’origine sont conservées ; les mentions des prières fériales omises restent consignées séparément.",locale))+
    '</p></details></main>';
}
