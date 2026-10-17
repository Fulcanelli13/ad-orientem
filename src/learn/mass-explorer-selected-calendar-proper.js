/**
 * Read-only study projection of a selected Calendar day's already-resolved
 * 1962 Proper. No second Mass/Proper resolver, no duplicated source texts.
 *
 * Source and rubrical certification are delegated to Calendar's existing
 * printable-Proper gate; the LIVE/Simple/Missal reader is never involved.
 */
import {assessPrintableProper,assessResolvedProperTextSections} from "../calendar/print-proper.js";
import {MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION} from "../mass/preflight-study-proper.js";

export const MASS_EXPLORER_SELECTED_PROPER_VERSION="ao-mass-explorer-calendar-proper-v1";
const SLOT_KINDS=Object.freeze({
 INTROIT:["introit"],
 COLLECT_SET:["collect"],
 EPISTLE_OR_LESSON:["epistle"],
 GRADUAL:["gradual"],
 ALLELUIA_TRACT_SEQUENCE:["alleluia","tract","sequence"],
 GOSPEL:["gospel"],
 OFFERTORY:["offertory"],
 SECRET_SET:["secret"],
 PREFACE:["preface"],
 COMMUNION:["communion"],
 POSTCOMMUNION_SET:["postcommunion"]
});
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[c]));

export function selectedCalendarProperProjection(calendarState,{french=false}={}){
 const selectedDate=calendarState?.selectedDate;
 const resolution=calendarState?.resolution;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(selectedDate??""))||
    selectedDate!==resolution?.date||resolution?.status!=="ready"||
    !resolution?.day?.main)
   return null;

 // Mass Explorer's canonical source is SUNG. This applies the SAME
 // form-specific commemoration adjudication as the existing print UI.
 // Votive, Requiem, alternate observed Mass and special rites are not
 // inferred from a Calendar date.
 const language=french?"fr":"en";
 const english=assessPrintableProper(resolution,{
   language:"en",massForm:"MISSA_CANTATA_SIMPLE"
 });
 const frenchProper=assessPrintableProper(resolution,{
   language:"fr",massForm:"MISSA_CANTATA_SIMPLE"
 });
 // A complete English Proper must not imply the French one is ready (or
 // vice versa). Both language editions and provenance must pass the SAME gate.
 if(!english.ok||!frenchProper.ok||
    !english.proper?.sourcePath||
    english.proper.sourcePath!==frenchProper.proper?.sourcePath)return null;
 const audit=french?frenchProper:english;
 const slotRows=new Map();
 for(const [slot,kinds] of Object.entries(SLOT_KINDS)){
  const rows=audit.sections.filter(row=>kinds.includes(row.kind));
  if(rows.length&&rows.every(row=>row.latin&&row.vernacular))
   slotRows.set(slot,rows.map(row=>Object.freeze({...row})));
 }
 return Object.freeze({
  schema:MASS_EXPLORER_SELECTED_PROPER_VERSION,
  owner:"SELECTED_CALENDAR_DAY_SUNG_NOT_OBSERVED_MASS",
  date:selectedDate,
  title:String((french?audit.proper.nameFr:audit.proper.name)||
    resolution.day.main.title||""),
  sourcePath:String(audit.proper.sourcePath),
  language,slotRows,
  slotsAvailable:slotRows.size
 });
}
/**
 * A preflight choice supersedes the Calendar day only when explicit. A
 * blocked choice masks Calendar-day text rather than mislabelling it.
 */
export function selectedPreflightMassProperProjection(selection,{french=false}={}){
 if(selection===null||selection===undefined)return null;
 const blocked=reason=>Object.freeze({
  schema:MASS_EXPLORER_SELECTED_PROPER_VERSION,
  owner:"EXPLICIT_ALTERNATE_MASS_BLOCKED",date:selection?.date??null,
  sourcePath:null,title:null,language:french?"fr":"en",
  slotRows:new Map(),slotsAvailable:0,reason
 });
 if(selection.schema!==MASS_EXPLORER_PREFLIGHT_PROPER_SELECTION||
    selection.selection!=="EXPLICIT_ALTERNATE_MASS"||
    selection.ready!==true)return blocked(selection.reason||"SELECTED_MASS_NOT_VERIFIED");
 const english=assessResolvedProperTextSections(selection.proper,{language:"en"});
 const frenchProper=assessResolvedProperTextSections(selection.proper,{language:"fr"});
 if(!english.ok||!frenchProper.ok||
    english.proper?.sourcePath!==selection.sourcePath||
    frenchProper.proper?.sourcePath!==selection.sourcePath)
   return blocked("BILINGUAL_SELECTED_MASS_SOURCE_INCOMPLETE");
 const audit=french?frenchProper:english,slotRows=new Map();
 for(const [slot,kinds] of Object.entries(SLOT_KINDS)){
  const rows=audit.sections.filter(row=>kinds.includes(row.kind));
  if(rows.length&&rows.every(row=>row.latin&&row.vernacular))
   slotRows.set(slot,rows.map(row=>Object.freeze({...row})));
 }
 return Object.freeze({
  schema:MASS_EXPLORER_SELECTED_PROPER_VERSION,
  owner:"EXPLICIT_PREFLIGHT_MASS",date:selection.date,
  sourceDate:selection.sourceDate,
  sourcePath:selection.sourcePath,title:selection.title,
  language:french?"fr":"en",slotRows,slotsAvailable:slotRows.size,
  isObservedSource:selection.isObservedSource===true,
  rubricalPermission:selection.rubricalPermission
 });
}
export function selectedCalendarProperSlotHtml(slot,projection,{french=false}={}){
 const rows=projection?.schema===MASS_EXPLORER_SELECTED_PROPER_VERSION&&
  projection.language===(french?"fr":"en")&&
  Object.hasOwn(SLOT_KINDS,slot)?projection.slotRows.get(slot):null;
 if(!rows?.length)return "";
 return '<div class="aoMXSelectedProper" data-ao-mx-calendar-proper="'+escape(slot)+'"'+
    ' data-ao-mx-calendar-date="'+escape(projection.date)+'"'+
    ' data-ao-mx-proper-owner="'+escape(projection.owner)+'">'+
    '<p class="aoMXProperProvenance">'+escape(french?
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "Propre de la Messe choisie dans la préparation · messe chantée":
       "Propre du jour sélectionné dans le Calendrier · messe chantée ordinaire":
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "Proper of the explicitly selected Mass · Sung Mass":
       "Selected Calendar day Proper · ordinary Sung Mass")+
     ' · '+escape(projection.date)+' · '+escape(projection.title)+'</p>'+
    rows.map(row=>
      '<section class="aoMXProperPrayer">'+
      '<h3>'+escape(row.title)+'</h3>'+
      '<p class="aoMXLatin" lang="la">'+escape(row.latin)+'</p>'+
      '<p class="aoMXTranslation" lang="'+(french?"fr":"en")+'">'+escape(row.vernacular)+'</p>'+
      '</section>'
    ).join("")+
    '<p class="aoMXQuiet">'+escape(french?
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "Texte du Propre choisi à la préparation · source : ":
       "Texte du Propre attesté par le Calendrier · source : ":
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "Preflight-selected Proper text · source: ":
       "Calendar-verified Proper text · source: ")+escape(projection.sourcePath)+'</p>'+
    '<p class="aoMXQuiet">'+escape(french?
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "Ceci décrit uniquement le Propre choisi à la préparation ; aucune autorisation rubricale supplémentaire n’est certifiée et le lecteur de Messe demeure indépendant.":
       "La messe votive, de Requiem ou d’une autre fête effectivement célébrée peut utiliser un propre différent. Celui-ci n’est pas substitué au propre du lecteur de Messe.":
     projection.owner==="EXPLICIT_PREFLIGHT_MASS"?
       "This displays the Proper chosen in pre-Mass preparation. It does not certify separate rubrical permission or alter the actual Mass reader.":
       "A votive, Requiem or other actually celebrated Mass may use a different Proper. This does not replace the Mass reader's selected Proper.")+'</p>'+
    '</div>';
}
