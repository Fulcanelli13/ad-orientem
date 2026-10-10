// Date-independent selection of the Proper actually heard at Mass.
// This is a source-identified *observational* choice, not a universal rubric
// dispensation. Calendar day, source feast day and local ceremonial form are
// independent. Every displayed prayer is copied from the real DayResolver.
import {properToReaderSlots} from "./proper-reader-slots.js";

export const OBSERVED_MASS_SUNDAY_CHOICES=Object.freeze([
 "UNDECIDED","COMMEMORATE_SUNDAY","NO_SUNDAY_COMMEMORATION",
]);
const dateOnly=value=>/^\d{4}-\d\d-\d\d$/.test(String(value??"")) &&
 !Number.isNaN(new Date(value+"T12:00:00Z").getTime()) &&
 new Date(value+"T12:00:00Z").toISOString().slice(0,10)===value;
const isSunday=value=>dateOnly(value)&&new Date(value+"T12:00:00Z").getUTCDay()===0;
const required=(value,label)=>{if(!value)throw new Error("OBSERVED_MASS_"+label+"_UNAVAILABLE");return value};
const unwrap=value=>value?.data??value;
const isReady=x=>["READY","CACHED"].includes(String(x?.status??"").toUpperCase());
function prayer(value,key){
 const rows=Array.isArray(value[key+"s"])&&value[key+"s"].length?value[key+"s"]:
  (value[key]?[value[key]]:[]);
 return rows[0]??null;
}
function principalProper(proper){
 const data=unwrap(proper);
 if(!data||typeof data!=="object")throw new Error("OBSERVED_MASS_PROPER_UNAVAILABLE");
 const collect=required(prayer(data,"collect"),"COLLECT");
 const secret=required(prayer(data,"secret"),"SECRET");
 const postcommunion=required(prayer(data,"postcommunion"),"POSTCOMMUNION");
 // A celebration chosen by its source day must NOT inherit commemorations of
 // the *source* calendar day (nor those of the old actual calendar Mass).
 return Object.freeze({...data,collect,secret,postcommunion,
  collects:Object.freeze([collect]),secrets:Object.freeze([secret]),
  postcommunions:Object.freeze([postcommunion]),
  calendarCommemorations:Object.freeze([]),
  commemorations:Object.freeze([]),
  languageCoverage:null,
  composedSourceIntegrity:null,
 });
}
function orations(value){
 return ["collect","secret","postcommunion"].map(name=>required(prayer(value,name),name.toUpperCase()));
}
function validTitle(day,proper){
 return String(day?.day?.main?.title??day?.day?.main?.name??proper?.name??"").trim();
}
export async function findObservedMassSource({
 massDate,sourceDate,resolveDay,recoverProper=async value=>value,language="en",
}={}){
 if(!dateOnly(massDate)||!dateOnly(sourceDate))throw new Error("OBSERVED_MASS_DATE_INVALID");
 if(typeof resolveDay!=="function")throw new Error("OBSERVED_MASS_RESOLVER_MISSING");
 const source=await resolveDay(sourceDate);
 if(source?.status!=="ready"||!isReady(source?.proper))
   throw new Error("OBSERVED_MASS_SOURCE_DAY_NOT_READY");
 if(source?.date&&source.date!==sourceDate)throw new Error("OBSERVED_MASS_SOURCE_DATE_MISMATCH");
 const recovered=await recoverProper(source.proper);
 if(!isReady(recovered))throw new Error("OBSERVED_MASS_PROPER_NOT_READY");
 const data=principalProper(recovered);
 const sourcePath=String(data.sourcePath??recovered.sourcePath??"").trim();
 if(!sourcePath)throw new Error("OBSERVED_MASS_SOURCE_PATH_MISSING");
 const primary=properToReaderSlots(data,{language});
 if(!primary.ready)throw new Error("OBSERVED_MASS_TRANSLATION_MISSING:"+primary.missing.join(","));
 const title=validTitle(source,data);
 if(!title)throw new Error("OBSERVED_MASS_SOURCE_TITLE_MISSING");
 return Object.freeze({
  schema:"ao-observed-mass-source-v1",massDate,sourceDate,sourcePath,title,
  rank:source?.day?.main?.rank??null,
  proper:Object.freeze({status:"READY",sourcePath,data}),
  properLanguage:String(language??"en").startsWith("fr")?"fr":"en",
  sourceOwner:"DAY_RESOLVER",permissionStatus:"NOT_INDEPENDENTLY_VERIFIED",
 });
}
export async function composeObservedMassSelection(candidate,{
 baseLegacy,massDate=candidate?.massDate,
 sundayChoice="UNDECIDED",resolveDay,recoverProper=async x=>x,language="en",
}={}){
 if(candidate?.schema!=="ao-observed-mass-source-v1")throw new Error("OBSERVED_MASS_CANDIDATE_REQUIRED");
 if(!dateOnly(massDate)||candidate.massDate!==massDate||baseLegacy?.date!==massDate)
   throw new Error("OBSERVED_MASS_DATE_CHANGED");
 if(baseLegacy.canStart!==true)throw new Error("OBSERVED_MASS_HOST_PREFLIGHT_NOT_READY");
 if(!OBSERVED_MASS_SUNDAY_CHOICES.includes(sundayChoice))
   throw new Error("OBSERVED_MASS_SUNDAY_CHOICE_INVALID");
 const sunday=isSunday(massDate),different=candidate.sourceDate!==massDate;
 if(sunday&&different&&sundayChoice==="UNDECIDED")
   throw new Error("OBSERVED_MASS_SUNDAY_COMMEMORATION_UNDECIDED");
 if(sundayChoice==="COMMEMORATE_SUNDAY"&&(!sunday||!different))
   throw new Error("OBSERVED_MASS_SUNDAY_COMMEMORATION_NOT_APPLICABLE");
 const data=principalProper(candidate.proper);
 let sundaySourcePath=null;
 if(sundayChoice==="COMMEMORATE_SUNDAY"){
   if(typeof resolveDay!=="function")throw new Error("OBSERVED_MASS_RESOLVER_MISSING");
   const sundayDay=await resolveDay(massDate);
   if(sundayDay?.status!=="ready"||!isReady(sundayDay?.proper))
     throw new Error("OBSERVED_MASS_SUNDAY_SOURCE_NOT_READY");
   const sundayProper=principalProper(await recoverProper(sundayDay.proper));
   sundaySourcePath=String(sundayProper.sourcePath??sundayDay.proper.sourcePath??"").trim();
   required(sundaySourcePath,"SUNDAY_PATH");
   const [collect,secret,postcommunion]=orations(sundayProper);
   data.collects=Object.freeze([data.collect,collect]);
   data.secrets=Object.freeze([data.secret,secret]);
   data.postcommunions=Object.freeze([data.postcommunion,postcommunion]);
   data.calendarCommemorations=Object.freeze([{
    title:String(sundayDay.day?.main?.title??"Sunday"),sourcePath:sundaySourcePath,
    prayerSourcePath:sundaySourcePath,ownership:"EXPLICIT_SUNDAY_COMMEMORATION",
   }]);
 }
 const slotted=properToReaderSlots(data,{language});
 if(!slotted.ready)throw new Error("OBSERVED_MASS_COMPOSED_PROPER_INCOMPLETE:"+slotted.missing.join(","));
 const proper=Object.freeze({
   status:"READY",sourcePath:candidate.sourcePath,
   data:Object.freeze({...data,sourcePath:candidate.sourcePath}),
 });
 const id="source_date_"+candidate.sourceDate.replaceAll("-","_");
 const legacy=Object.freeze({
  ...baseLegacy,date:massDate,requestedCelebrationId:id,celebrationId:id,
  celebrationType:"VOTIVE",celebrationTitle:candidate.title,
  actualCelebration:Object.freeze({id,type:"VOTIVE",title:candidate.title}),
  properSource:candidate.sourcePath,
  // These are properties of the actual chosen Proper, not the Mass that
  // would ordinarily occur on the selected calendar date.
  gloria:typeof data.hasGloria==="boolean"?data.hasGloria:null,
  credo:typeof data.hasCredo==="boolean"?data.hasCredo:null,
  commemorations: sundaySourcePath?[{
   id:"observed-sunday",title:String(data.calendarCommemorations[0].title),
   prayerSourcePath:sundaySourcePath,sourcePath:sundaySourcePath,
  }]:[],
  votiveClass:null,
  rubricSources:Object.freeze([]),
  sourceDiagnostics:Object.freeze({
    ...(baseLegacy.sourceDiagnostics??{}),
    actualMassSelection:"OBSERVED_SOURCE_DAY",
    actualMassSourceDate:candidate.sourceDate,
    actualMassSourcePath:candidate.sourcePath,
    sundayCommemoration:sundayChoice,
    independentRubricPermission:"NOT_VERIFIED",
  }),
 });
 return Object.freeze({
  schema:"ao-observed-mass-selection-v1",massDate,sourceDate:candidate.sourceDate,
  title:candidate.title,sourcePath:candidate.sourcePath,sundayChoice,
  sundaySourcePath,proper,legacy,sourceOwned:true,
  permissionStatus:"NOT_INDEPENDENTLY_VERIFIED",
 });
}
