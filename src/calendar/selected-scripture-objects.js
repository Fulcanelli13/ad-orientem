/*
 * Read-only, selection-scoped reverse links. A day, feast name, verse overlap,
 * or source-path resemblance is NEVER sufficient to select a Mass Proper.
 * The canonical 1962 Calendar's selected resolution and Mass reading source
 * gate jointly own the identity. No reading cache or static feast crosswalk.
 */
import {calendarScriptureContexts} from "./scripture-handoff.js";
import {scripturePassage} from "../scripture/catalogue.js";
import {NATIVE_RITE_SCRIPTURE_READINGS} from "../mass/scripture-native-rite-index.js";
import {calendarRiteSlot} from "./native-rite-scripture-handoff.js";

const DATE=/^\d{4}-\d{2}-\d{2}$/;
const SLOTS=new Set(["EPISTLE_OR_LESSON","GOSPEL",
  ...NATIVE_RITE_SCRIPTURE_READINGS.map(row=>calendarRiteSlot(row.stateId))]);
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
   const label=reading.kind==="NATIVE_RITE_READING"
     ?[reading.label.en,reading.label.fr]
     :slot==="GOSPEL"?["Gospel","Évangile"]:["Epistle / Lesson","Épître / Lecture"];
   const native=reading.kind==="NATIVE_RITE_READING";
   output.push(Object.freeze({
     id:"calendarReading:"+objectId,
     source:"calendarReading",objectId,
     passage:passages[0],passages,
     reference:reading.reference,
     segments:Array.isArray(reading.segments)?Object.freeze([...passages]):null,
     relation:native?"SELECTED_1962_NATIVE_RITE_BIBLICAL_RECORD":"SELECTED_1962_PROPER_SOURCE_VERIFIED",
     title:Object.freeze({
       en:(native?reading.groupLabel.en:"Selected 1962 Mass")+" · "+label[0]+" · "+date,
       fr:(native?reading.groupLabel.fr:"Messe de 1962 sélectionnée")+" · "+label[1]+" · "+date
     }),
     description:Object.freeze({
       en:native
         ?"Linked to the selected 1962 native rite's source record; the Mass reader separately verifies its rendered Latin. Not an authorization of another Mass or local rite."
         :"Current Calendar selection only. The exact Proper source and Latin reading were checked; this is not a claim about a different local or votive Mass.",
       fr:native
         ?"Lié à l'enregistrement source du rite de 1962 sélectionné ; le lecteur de la messe vérifie séparément le latin affiché. N'autorise aucune autre messe ni rite local."
         :"Uniquement la sélection actuelle du Calendrier. Le Propre et le texte latin sont vérifiés ; ceci ne prétend pas représenter une autre Messe locale ou votive."
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
