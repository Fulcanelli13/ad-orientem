/**
 * Read-only study projection of a selected Calendar day's already-resolved
 * 1962 Proper. No second Mass/Proper resolver, no duplicated source texts.
 *
 * Source and rubrical certification are delegated to Calendar's existing
 * printable-Proper gate; the LIVE/Simple/Missal reader is never involved.
 */
import {assessPrintableProper} from "../calendar/print-proper.js";

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
 const audit=assessPrintableProper(resolution,{
   language,massForm:"MISSA_CANTATA_SIMPLE"
 });
 if(!audit.ok||!audit.proper?.sourcePath)return null;
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
export function selectedCalendarProperSlotHtml(slot,projection,{french=false}={}){
 const rows=projection?.schema===MASS_EXPLORER_SELECTED_PROPER_VERSION&&
  projection.language===(french?"fr":"en")&&
  Object.hasOwn(SLOT_KINDS,slot)?projection.slotRows.get(slot):null;
 if(!rows?.length)return "";
 return '<div class="aoMXSelectedProper" data-ao-mx-calendar-proper="'+escape(slot)+'"'+
    ' data-ao-mx-calendar-date="'+escape(projection.date)+'">'+
    '<p class="aoMXProperProvenance">'+escape(french?
     "Propre du jour sélectionné dans le Calendrier · messe chantée ordinaire":
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
     "Texte du Propre attesté par le Calendrier · source : ":
     "Calendar-verified Proper text · source: ")+escape(projection.sourcePath)+'</p>'+
    '<p class="aoMXQuiet">'+escape(french?
     "La messe votive, de Requiem ou d’une autre fête effectivement célébrée peut utiliser un propre différent. Celui-ci n’est pas substitué au propre du lecteur de Messe.":
     "A votive, Requiem or other actually celebrated Mass may use a different Proper. This does not replace the Mass reader's selected Proper.")+'</p>'+
    '</div>';
}
