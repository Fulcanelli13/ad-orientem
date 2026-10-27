/**
 * Feature-gated bridge between reviewed daily-prayer source profiles and the
 * EXISTING 11/13-card reader. It does not own UI, navigation or prayer texts.
 *
 * The official release switch is statically disabled and the manifest empty.
 * Fail-closed: a missing/uncleared/foreign-language body or malformed profile
 * causes an untouched canonical baseline, never partially rendered prayers.
 */
import {compileDailyFormulation,availableFormulations} from "./daily-formulation-engine.js";

const LANGUAGES=new Set(["en","fr","la"]);
const DAYPARTS=new Set(["morning","evening"]);
const LENGTHS=new Set(["short","complete"]);

export const DAILY_SEQUENCE_ADAPTER_SCHEMA="ao-daily-source-sequence-adapter-v1";

function releaseKey(language,daypart,length){
 if(!LANGUAGES.has(language)||!DAYPARTS.has(daypart)||!LENGTHS.has(length))
   return null;
 return language+":"+daypart+":"+length;
}
function releaseAuthorized(manifest,release,key){
 return release?.enabled===true &&
  release?.approvedProfileKeys?.[key]===true &&
  manifest?.profiles?.[key]?.releaseStatus==="approved" &&
  Array.isArray(manifest.profiles[key].steps) &&
  manifest.profiles[key].steps.length>0;
}

function makeCanonical(baseline,language,daypart,length,reason){
 return Object.freeze({
  schema:DAILY_SEQUENCE_ADAPTER_SCHEMA,mode:"canonical",
  language,daypart,length,reason,approved:false,
  rows:baseline,advance:"manual-only",historicalWholeBook:false
 });
}

/**
 * Pure boundary for conditional source release.
 *
 * Explicit `enabled=true` AND profile allowlist AND approved profile metadata
 * AND the existing engine's per-text cleared state are all necessary.
 * Reader fallback is always the original canonical array supplied by caller.
 */
export function resolveDailyReaderSequence({
 manifest,release,canonicalRows,language="en",daypart="morning",
 length="complete",selection={}
}={}){
 if(!Array.isArray(canonicalRows)||canonicalRows.length<1)
   throw new TypeError("Original canonical daily sequence is required");
 const baseline=canonicalRows;
 const key=releaseKey(language,daypart,length);
 if(!key||!releaseAuthorized(manifest,release,key))
   return makeCanonical(baseline,language,daypart,length,"not-released");
 try{
  const plan=compileDailyFormulation(manifest,{
    language,daypart,length,selection,research:false
  });
  if(plan.advance!=="manual-only"||plan.stages.length<1 ||
     !plan.stages.some(x=>x.type==="prayer"))
    return makeCanonical(baseline,language,daypart,length,"incomplete-plan");
  const rows=plan.stages.map((s,index)=>{
    if(s.type==="prayer"){
      if(!s.witnessId||typeof s.text!=="string"||!s.text.trim()||
        typeof s.sourceUrl!=="string"||!s.sourceUrl.startsWith("https://"))
        throw new RangeError("Approved sequence contains a source-less prayer");
      const stageId=s.coveredSlots[0];
      const profileStep=manifest.profiles[key].steps.find(x=>x.id===stageId);
      return Object.freeze({
        id:s.id,index,kind:"approved-source-prayer",slotId:stageId,
        title:s.title,language,text:s.text,witnessId:s.witnessId,
        sourceLabel:s.sourceLabel,sourceUrl:s.sourceUrl,
        coveredSlots:Object.freeze([...s.coveredSlots]),
        multiple:profileStep?.multiple===true
      });
    }
    return Object.freeze({
      id:s.id,index,kind:s.type==="examination"?"examination":"silence",
      title:s.title,cue:s.cue,editorial:true,sourceUrl:null
    });
  });
  if(new Set(rows.map(s=>s.id)).size!==rows.length)
    throw new RangeError("Repeated approved prayer-stage ID");
  return Object.freeze({
    schema:DAILY_SEQUENCE_ADAPTER_SCHEMA,mode:"approved",
    approved:true,language,daypart,length,key,
    rows:Object.freeze(rows),advance:"manual-only",
    historicalWholeBook:false,sourceWitnessCount:plan.sourceWitnessCount
  });
 }catch{
  // A revoked witness, cross-language source, invalid saved choice, unsafe
  // source URL or partially approved manifest never displaces canonical.
  return makeCanonical(baseline,language,daypart,length,"source-hold");
 }
}

/**
 * Resolve selectable variants for a specific released devotional slot only.
 * No source-editing UI is available for a partially approved profile.
 */
export function approvedDailySlotOptions(manifest,release,{
 language="en",daypart="morning",length="complete",slotId
}={}){
 const key=releaseKey(language,daypart,length);
 if(!key||!releaseAuthorized(manifest,release,key))return [];
 try{return availableFormulations(manifest,{
   language,daypart,length,stepId:slotId,research:false
 });}catch{return []}
}

export function dailyLengthChoices(manifest,release,{
 language="en",daypart="morning"
}={}){
 return Object.freeze(["short","complete"].filter(length=>
  releaseAuthorized(manifest,release,releaseKey(language,daypart,length))
 ));
}
