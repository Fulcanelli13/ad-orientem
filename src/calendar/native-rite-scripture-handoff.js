// Reuse the Mass native-rite Scripture authority; NEVER infer a rite or
// insert readings merely because a saint, title, or civil date is present.
// These are navigation links only. Native reader state still verifies actual
// proclaimed Latin as the user advances through Good Friday / Easter Vigil.
import {NATIVE_RITE_SCRIPTURE_READINGS} from "../mass/scripture-native-rite-index.js";
import {v384Dates} from "./traditional-year-v384.js";
import {scriptureSegmentContext} from "../scripture/segments.js";

const CONDITIONS=Object.freeze({
 GOOD_FRIDAY:Object.freeze({dateKey:"goodFriday",principal:/^tempora:Quad6-5r:1:[a-z]+$/i,
   proper:"Tempora/Quad6-5r",heading:{en:"Good Friday · Sacred readings",fr:"Vendredi saint · Lectures sacrées"}}),
 EASTER_VIGIL:Object.freeze({dateKey:"holySaturday",principal:/^tempora:Quad6-6r:1:[a-z]+$/i,
   proper:"Tempora/Quad6-6r",heading:{en:"Easter Vigil · Prophecies",fr:"Vigile pascale · Prophéties"}})
});
const ROLES=Object.freeze({
 FIRST_LESSON:["First Lesson","Première lecture"],
 SECOND_LESSON:["Second Lesson","Deuxième lecture"],
 PASSION_BEFORE_DEATH:["Passion · Before the death of Our Lord","Passion · Avant la mort de Notre-Seigneur"],
 PASSION_AFTER_DEATH:["Passion · After the death of Our Lord","Passion · Après la mort de Notre-Seigneur"],
 FIRST_PROPHECY:["First Prophecy","Première prophétie"],
 SECOND_PROPHECY:["Second Prophecy","Deuxième prophétie"],
 THIRD_PROPHECY:["Third Prophecy","Troisième prophétie"],
 FOURTH_PROPHECY:["Fourth Prophecy","Quatrième prophétie"]
});
const dateLike=value=>/^\d{4}-\d{2}-\d{2}$/.test(String(value??""));
export const calendarRiteSlot=stateId=>"NATIVE_RITE:"+stateId;

export function calendarNativeRiteScriptureContexts(resolution){
 const date=resolution?.date,main=resolution?.day?.main?.id,proper=resolution?.proper;
 if(!dateLike(date)||!main||resolution?.status!=="ready"||
    proper?.status!=="ready"||!proper?.data)return Object.freeze([]);
 const year=Number(date.slice(0,4)),dates=v384Dates(year);
 const sourcePath=String(proper.sourcePath??proper.data.sourcePath??"").trim();
 if(sourcePath!==String(main).replace(/^tempora:/i,"Tempora/").replace(/:[1-4]:[a-z]+$/i,""))
   return Object.freeze([]);
 const matches=Object.entries(CONDITIONS).filter(([,rule])=>
   date===dates[rule.dateKey]&&rule.principal.test(main)&&
   (!rule.proper||sourcePath===rule.proper));
 if(matches.length!==1)return Object.freeze([]);
 const [rite,rule]=matches[0];
 const rows=NATIVE_RITE_SCRIPTURE_READINGS.filter(x=>x.rite===rite);
 if(rows.length!==4||new Set(rows.map(x=>x.stateId)).size!==4)
   return Object.freeze([]);
 try{
   const mapped=rows.map(spec=>{
     if(!ROLES[spec.role]||!/^https:\/\//.test(spec.witnessUrl??"")||
        String(spec.latinIncipit??"").length<20)
       throw new Error("Uncertified native-rite Scripture record");
     const citation=scriptureSegmentContext(spec.segments,{reference:spec.reference,
       provenance:"REGISTERED_1962_NATIVE_RITE_STATE_BIBLICAL_READING"});
     return Object.freeze({
       slot:calendarRiteSlot(spec.stateId),
       role:spec.role,kind:"NATIVE_RITE_READING",
       label:Object.freeze({en:ROLES[spec.role][0],fr:ROLES[spec.role][1]}),
       groupLabel:rule.heading,
       reference:citation.reference,sourceReference:spec.reference,
       passage:citation.passage,segments:citation.segments,
       provenance:citation.provenance,witnessUrl:spec.witnessUrl,
       stateId:spec.stateId,rite,
       note:"Selected 1962 general-calendar day and original native-rite record. Actual rendered Latin requires the separate native reader state."
     });
   });
   return Object.freeze(mapped);
 }catch{return Object.freeze([]);}
}
