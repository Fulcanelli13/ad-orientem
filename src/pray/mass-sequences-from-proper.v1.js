// Prayer-side READ-ONLY projection of the appointed 1962 Mass Proper.
// These are not newly transcribed hymn bodies and never supply Gregorian scores.
import {project1962AllSoulsDiesIraeEnglishDisplayRows} from "../mass/1962-all-souls-sequence-english.js";

export const MASS_SEQUENCE_PRAYER_SCHEMA="ao-pray-mass-sequences-source-owned-v1";
export const MASS_SEQUENCE_PRAYER_WORKS=Object.freeze([
 Object.freeze({id:"mass_sequence_victimae_paschali",title:"Victimae paschali laudes",titleFr:"Victimae paschali laudes",
  date:"2026-04-05",sourcePath:"Tempora/Pasc0-0",opening:"victimae paschali laudes",minLatin:140,subject:"II"}),
 Object.freeze({id:"mass_sequence_lauda_sion",title:"Lauda Sion",titleFr:"Lauda Sion",
  date:"2026-06-04",sourcePath:"Tempora/Pent1-4",opening:"lauda sion salvatorem",minLatin:500,subject:"III"}),
 Object.freeze({id:"mass_sequence_dies_irae",title:"Dies irae",titleFr:"Dies irae",
  date:"2026-11-02",sourcePath:"Sancti/11-02m1",opening:"dies irae dies illa",minLatin:500,subject:"IX"})
]);
const byId=new Map(MASS_SEQUENCE_PRAYER_WORKS.map(x=>[x.id,x]));
const sourceText=value=>String(value??"").trim();
const normalized=value=>sourceText(value).normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
export function massSequencePrayerWork(id){return byId.get(String(id??""))??null}
export function massSequencePrayerLibraryMatches({search="",subject="all",category="all"}={}){
 if(category!=="all")return Object.freeze([]);
 const q=normalized(search);
 return Object.freeze(MASS_SEQUENCE_PRAYER_WORKS.filter(x=>
  (subject==="all"||subject===x.subject)&&
  (!q||normalized(x.title+" "+x.titleFr+" sequence séquence Mass Messe "+x.id).includes(q))));
}
function reject(reason){throw Error("MASS_SEQUENCE_SOURCE_HOLD:"+reason)}
export function projectMassSequencePrayer(id,resolved){
 const spec=massSequencePrayerWork(id);
 if(!spec)reject("UNKNOWN_WORK");
 if(resolved?.status!=="ready"||resolved?.date!==spec.date||
    resolved?.proper?.status!=="ready")reject("ACTUAL_MASS_DAY_NOT_READY");
 const proper=resolved.proper.data;
 if(proper?.sourcePath!==spec.sourcePath)reject("SELECTED_1962_PROPER_IDENTITY_MISMATCH");
 const raw=proper?.sequence;
 if(!raw||Array.isArray(raw)||typeof raw!=="object")reject("DISTINCT_SEQUENTIA_NOT_FOUND");
 const la=sourceText(raw.lat??raw.la),fr=sourceText(raw.fr);
 let en=sourceText(raw.en);
 if(spec.id==="mass_sequence_dies_irae"){
  // Reuse Mass's existing display-only correction for the English editorial note.
  const display=project1962AllSoulsDiesIraeEnglishDisplayRows(proper,
   [{latin:la,vernacular:en}],{language:"en"});
  en=sourceText(display[0]?.vernacular);
 }
 if(la.length<spec.minLatin||en.length<Math.floor(spec.minLatin*.6)||
    fr.length<Math.floor(spec.minLatin*.6))reject("COMPLETE_TRILINGUAL_TEXT_MISSING");
 if(!normalized(la).slice(0,125).includes(spec.opening))
  reject("LATIN_SEQUENCE_OPENING_MISMATCH");
 if([la,en,fr].some(s=>/(^|\n)\s*[$@]/m.test(s)))
  reject("UNRESOLVED_SOURCE_REFERENCE");
 return Object.freeze({
  schema:MASS_SEQUENCE_PRAYER_SCHEMA,id:spec.id,title:spec.title,titleFr:spec.titleFr,
  sourcePath:spec.sourcePath,sourceDate:spec.date,sourceSection:"Sequentia",
  sourceOwner:"1962_ACTUAL_SELECTED_MASS_PROPER",latin:la,english:en,french:fr,
  printed1962IndependentlyCollated:false,notationApproved:false,
  devotionalReadingOnly:true
 });
}
export async function loadMassSequencePrayer(id,{resolver=globalThis.AO_RUNTIME_V8?.resolver}={}){
 const spec=massSequencePrayerWork(id);
 if(!spec)reject("UNKNOWN_WORK");
 if(typeof resolver?.resolveDay!=="function")reject("CANONICAL_MASS_RESOLVER_UNAVAILABLE");
 const resolved=await resolver.resolveDay(spec.date);
 return projectMassSequencePrayer(id,resolved);
}
