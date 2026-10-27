// 1962 All Souls is a Mass for the Dead even when the host selects the
// CALENDAR Mass of the day, rather than its generic REQUIEM category.
// Source-bound only: never infer Requiem conditions from November 2 alone.
// Missal 1960 §402 and Ritus servandus XIII.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
export const ALL_SOULS_1962_FORMULARIES=Object.freeze([
 "Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"
]);

export function is1962AllSoulsCalendarMass(resolvedMass,proper=null){
 const r=resolvedMass??{};
 const p=proper?.data??proper??r.proper?.data??r.proper??{};
 const date=String(r.date??"");
 const id=String(r.calendarDay?.id??"");
 const path=String(p.sourcePath??proper?.sourcePath??"");
 return /^\d{4}-11-02$/.test(date)&&id==="sancti:11-02m1:1:b"&&
   path==="Sancti/11-02m1"&&
   [null,"","mass_of_day"].includes(r.requestedCelebrationId??null)&&
   [null,"","mass_of_day"].includes(r.celebrationId??null)&&
   ["CALENDAR","MASS_OF_DAY",""].includes(String(r.celebrationType??"").toUpperCase());
}

export function allSouls1962RequiemOverlay(resolvedMass,proper=null){
 return is1962AllSoulsCalendarMass(resolvedMass,proper)
   ?Object.freeze(["REQUIEM"]):Object.freeze([]);
}

// Authoritative second/third Masses use the SAME source parser as the
// existing Calendar Proper, not hand-translated text or copied first-Mass
// orations. The 1960 §402 three Masses share Common ex C9, Requiem Preface
// and Sequence; each has its own appointed orations and readings.
// These three source files are present in the pinned host for la/en/fr.
// Never substitute the first Mass when a second/third source fails.
import {trilingualParsedProperSection} from "./reader-proper-runtime-recovery.js";
import {properToReaderSlots} from "./proper-reader-slots.js";

const REQUIRED_SECTIONS=Object.freeze({
 introit:"Introitus",collect:"Oratio",epistle:"Lectio",
 gradual:"Graduale",sequence:"Sequentia",gospel:"Evangelium",
 offertory:"Offertorium",secret:"Secreta",communion:"Communio",
 postcommunion:"Postcommunio",
});
const LABELS=Object.freeze({
 2:Object.freeze({en:"All Souls — Second Mass",fr:"Commémoration des fidèles défunts — deuxième messe"}),
 3:Object.freeze({en:"All Souls — Third Mass",fr:"Commémoration des fidèles défunts — troisième messe"}),
});
const required=x=>String(x??"").trim()!=="";
export async function resolve1962AllSoulsAdditionalProper({
  calendarResolution,properResolver,massNumber
}={}){
 const number=Number(massNumber);
 if(![2,3].includes(number))throw Error("ALL_SOULS_MASS_NUMBER_UNSUPPORTED");
 const first=calendarResolution?.proper?.data;
 if(calendarResolution?.status!=="ready"||
    !/^\d{4}-11-02$/.test(String(calendarResolution.date??""))||
    calendarResolution.day?.main?.id!=="sancti:11-02m1:1:b"||
    first?.sourcePath!=="Sancti/11-02m1")
   throw Error("ALL_SOULS_CALENDAR_SOURCE_MISMATCH");
 if(typeof properResolver?.resolveSource!=="function")
   throw Error("ALL_SOULS_CANONICAL_SOURCE_RESOLVER_MISSING");
 const sourcePath=ALL_SOULS_1962_FORMULARIES[number-1];
 const parsed={};
 for(const lang of ["la","en","fr"]){
   parsed[lang]=await properResolver.resolveSource(sourcePath,lang,{
     requestedFiles:[],cacheHits:[],referencesResolved:[],
     languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
     warnings:[],errors:[],
   });
   const rule=parsed[lang]?.map?.get?.("Rule");
   const text=Array.isArray(rule)?rule.join(" "):"";
   for(const marker of ["ex C9","no Gloria","no Credo","Prefatio=Defunctorum","Sequentia"]){
     if(!text.includes(marker))throw Error("ALL_SOULS_SOURCE_RULE_MISSING:"+sourcePath+":"+lang+":"+marker);
   }
 }
 if(!required(first.preface?.lat??first.preface?.la)||
    !["en","fr"].every(lang=>required(first.preface?.[lang]))){
   throw Error("ALL_SOULS_REQUIEM_PREFACE_SOURCE_MISSING");
 }
 const text=Object.fromEntries(Object.entries(REQUIRED_SECTIONS).map(([name,section])=>
    [name,trilingualParsedProperSection(parsed,section)]));
 // Two independent biblical witnesses and distinct Latin oration verify
 // that a source reference is not silently falling back to the first Mass.
 const references={
   2:{epistle:/2\s*Mach\.?\s*12:43-46/i,gospel:/Joann\.?\s*6:37-40/i},
   3:{epistle:/Apoc\.?\s*14:13/i,gospel:/Joann\.?\s*6:51-55/i},
 };
 const witness=references[number];
 if(!witness.epistle.test(text.epistle.lat)||
    !witness.gospel.test(text.gospel.lat)||
    text.collect.lat===String(first.collects?.[0]?.lat??""))
   throw Error("ALL_SOULS_APPOINTED_READING_OR_COLLECT_CONFLICT:"+sourcePath);
 const next=Object.freeze({
   ...first,
   sourcePath,
   name:LABELS[number].en,
   nameFr:LABELS[number].fr,
   introit:text.introit,
   collect:text.collect,collects:Object.freeze([text.collect]),
   epistle:text.epistle,gradual:text.gradual,
   sequence:text.sequence,gospel:text.gospel,
   offertory:text.offertory,
   secret:text.secret,secrets:Object.freeze([text.secret]),
   communion:text.communion,
   postcommunion:text.postcommunion,postcommunions:Object.freeze([text.postcommunion]),
   // Preserve the actual authenticated Common/1960 Requiem Preface from m1.
   preface:first.preface,
   calendarCommemorations:Object.freeze([]),
   appliedCommemorations:Object.freeze([]),
   omittedCommemorations:Object.freeze([]),
   hasGloria:false,hasCredo:false,
   principalCelebrationId:calendarResolution.day.main.id,
   allSoulsSourceProof:Object.freeze({
     status:"SOURCE_VERIFIED",date:calendarResolution.date,
     sourcePath,massNumber:number,common:"Commune/C9",
     inheritedRequiemPrefaceFrom:"Sancti/11-02m1",
     sourceSections:Object.freeze(Object.values(REQUIRED_SECTIONS)),
     sourceLanguages:Object.freeze(["la","en","fr"]),
   }),
 });
 for(const language of ["en","fr"]){
   const map=properToReaderSlots(next,{language});
   if(!map.ready)throw Error("ALL_SOULS_READER_SOURCE_INCOMPLETE:"+number+":"+language+":"+map.missing.join(","));
 }
 return Object.freeze({status:"ready",sourcePath,data:next});
}
