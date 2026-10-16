/*
 * Read-only, selection-scoped reverse links. A day, feast name, verse overlap,
 * or source-path resemblance is NEVER sufficient to select a Mass Proper.
 * The canonical 1962 Calendar's selected resolution and Mass reading source
 * gate jointly own the identity. No reading cache or static feast crosswalk.
 */
import {calendarScriptureContexts} from "./scripture-handoff.js";
import {scripturePassage} from "../scripture/catalogue.js";

const DATE=/^\d{4}-\d{2}-\d{2}$/;
const SLOTS=new Set(["EPISTLE_OR_LESSON","GOSPEL"]);
export function selectedCalendarScriptureObjects(snapshot){
 const date=snapshot?.selectedDate,res=snapshot?.resolution,proper=res?.proper;
 if(!DATE.test(String(date||""))||snapshot?.resolving||res?.date!==date||
    (proper?.status!=="ready"&&proper?.status!=="READY")||!proper?.data)
   return Object.freeze([]);
 const sourcePath=String(proper.sourcePath??proper.data.sourcePath??proper.data.source?.path??"").trim();
 if(!sourcePath)return Object.freeze([]);
 const readings=calendarScriptureContexts(res);
 const output=[];
 for(const reading of readings){
   if(!SLOTS.has(reading.slot)||!reading.provenance||!reading.reference)continue;
   const coordinates=Array.isArray(reading.segments)&&reading.segments.length
     ?reading.segments:[reading.passage];
   if(coordinates.some(p=>!p?.book||!Number.isInteger(p.chapter)))continue;
   const passages=Object.freeze(coordinates.map(p=>scripturePassage(p)));
   const slot=reading.slot;
   const objectId=date+":"+slot+":"+encodeURIComponent(sourcePath);
   const label=slot==="GOSPEL"
     ?["Gospel","Évangile"]:["Epistle / Lesson","Épître / Lecture"];
   output.push(Object.freeze({
     id:"calendarReading:"+objectId,
     source:"calendarReading",objectId,
     passage:passages[0],passages,
     reference:reading.reference,
     segments:Array.isArray(reading.segments)?Object.freeze([...passages]):null,
     relation:"SELECTED_1962_PROPER_SOURCE_VERIFIED",
     title:Object.freeze({
       en:"Selected 1962 Mass · "+label[0]+" · "+date,
       fr:"Messe de 1962 sélectionnée · "+label[1]+" · "+date
     }),
     description:Object.freeze({
       en:"Current Calendar selection only. The exact Proper source and Latin reading were checked; this is not a claim about a different local or votive Mass.",
       fr:"Uniquement la sélection actuelle du Calendrier. Le Propre et le texte latin sont vérifiés ; ceci ne prétend pas représenter une autre Messe locale ou votive."
     }),
     target:Object.freeze({
       type:"calendarReading",date,slot,sourcePath,
       reference:reading.reference,provenance:reading.provenance
     })
   }));
 }
 return Object.freeze(output);
}
export function matchingSelectedCalendarScriptureObject(snapshot,target){
 if(target?.type!=="calendarReading"||!DATE.test(String(target.date||""))||
    !SLOTS.has(target.slot)||!target.sourcePath||!target.reference)return null;
 return selectedCalendarScriptureObjects(snapshot).find(item=>
   item.target.date===target.date&&item.target.slot===target.slot&&
   item.target.sourcePath===target.sourcePath&&
   item.target.reference===target.reference&&
   item.target.provenance===target.provenance)??null;
}
