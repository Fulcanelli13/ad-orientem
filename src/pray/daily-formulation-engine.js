/**
 * Daily prayer formulation engine.
 *
 * A text-agnostic, side-effect-free compatibility layer for the existing
 * Morning 11 / Evening 13 reader. This module does not import or publish
 * historical prayer text. The real PRAY owner remains responsible for
 * rendering, navigation, language, and source-text publication.
 *
 * Public rendering must use only editorially released full-text witnesses.
 * Research-only witnesses can be inspected using explicit research mode,
 * never silently promoted to defaults.
 */
const DAYPARTS = new Set(["morning","evening"]);
const LANGUAGES = new Set(["en","fr","la"]);
const LENGTHS = new Set(["short","complete"]);

export const DAILY_FORMULATION_SCHEMA="ad-orientem-daily-formulations-v1";

function validSlug(value){
  return typeof value==="string" && /^[a-z][a-z0-9_.:-]*$/.test(value);
}
function requireSlug(value,label){
  if(!validSlug(value))throw new TypeError(label+" must be a stable slug");
  return value;
}
function requireChoice(condition,explanation){
  if(!condition)throw new RangeError(explanation);
}
function readProfile(manifest,{language,daypart,length}){
  if(!manifest || typeof manifest!=="object" || !manifest.witnesses || !manifest.profiles)
    throw new TypeError("An explicit source-bound manifest is required");
  requireChoice(LANGUAGES.has(language),"Unsupported daily prayer language");
  requireChoice(DAYPARTS.has(daypart),"Unsupported daily prayer daypart");
  requireChoice(LENGTHS.has(length),"Unsupported daily prayer length");
  const key=[language,daypart,length].join(":");
  const profile=manifest.profiles[key];
  if(!profile || !Array.isArray(profile.steps) || !profile.steps.length)
    throw new RangeError("No certified daily prayer profile: "+key);
  return {key,profile};
}

function resolveWitness(manifest,id,language,{research}){
  requireSlug(id,"Prayer witness ID");
  const witness=manifest.witnesses[id];
  if(!witness || typeof witness!=="object" || witness.id!==id)
    throw new RangeError("Unregistered daily prayer text: "+id);
  if(witness.language!==language)
    throw new RangeError("A historical text cannot be translated by fallback: "+id);
  if(!["historical","canonical"].includes(witness.kind))
    throw new RangeError("Invalid prayer witness kind: "+id);
  if(typeof witness.text!=="string" || !witness.text.trim())
    throw new RangeError("Complete prayer body missing: "+id);
  // The default is fail-closed. A printed historical source or a review
  // proposal does not by itself authorize public redistribution.
  if(witness.releaseStatus!=="cleared" && !research)
    throw new RangeError("Prayer text is not cleared for publication: "+id);
  if(witness.kind==="historical"){
    if(typeof witness.sourceLabel!=="string" || !witness.sourceLabel.trim())
      throw new RangeError("Historical prayer lacks source label: "+id);
    let url;
    try{url=new URL(witness.sourceUrl)}catch{throw new RangeError("Historical prayer lacks source URL: "+id)}
    if(url.protocol!=="https:")throw new RangeError("Historical source requires HTTPS: "+id);
  }
  return witness;
}

function chosenIds(step, selection){
  const choices=step.variants;
  if(!Array.isArray(choices)||!choices.length || new Set(choices).size!==choices.length)
    throw new RangeError("Each prayer slot needs distinct candidate IDs");
  const input=selection?.[step.id];
  if(step.multiple===true){
    // Only optional complementary prayers may be selected together.
    const ids=Array.isArray(input)?input:input===undefined?[choices[0]]:[input];
    if(!ids.length && step.required)throw new RangeError("Required prayer slot cannot be empty: "+step.id);
    if(!ids.every(id=>choices.includes(id)))throw new RangeError("Unregistered formulation selection: "+step.id);
    return [...new Set(ids)];
  }
  if(Array.isArray(input))throw new RangeError("A single-choice slot cannot select multiple texts: "+step.id);
  const id=input===undefined?choices[0]:input;
  if(!choices.includes(id))throw new RangeError("Unregistered formulation selection: "+step.id);
  return [id];
}

/**
 * Builds a recitation plan of COMPLETE source-owned prayer bodies.
 * Never shortens a prayer, invents a translation, or repeats a selected
 * composite source in two stages. Does not start a timer or persist data.
 */
export function compileDailyFormulation(manifest,{
  language="en",daypart="morning",length="short",selection={},
  research=false
}={}){
  const {key,profile}=readProfile(manifest,{language,daypart,length});
  if(selection===null || typeof selection!=="object" || Array.isArray(selection))
    throw new TypeError("Saved formulation selections must be keyed by slot");
  const rendered=[],seen=new Map(),slots=new Set();
  for(const step of profile.steps){
    requireSlug(step?.id,"Devotional step ID");
    if(slots.has(step.id))throw new RangeError("Duplicate stage identifier: "+step.id);
    slots.add(step.id);
    if(step.type==="examination" || step.type==="silence"){
      rendered.push({
        id:step.id,type:step.type,title:step.title??step.id,
        cue:step.cue??"",sourceIds:[],
        // Meditation guidance is not presented as a historical prayer.
        editorial:true
      });
      continue;
    }
    if(step.type!=="prayer")throw new RangeError("Unexpected devotional step type");
    const ids=chosenIds(step,selection);
    for(const id of ids){
      const witness=resolveWitness(manifest,id,language,{research});
      if(seen.has(id)){
        seen.get(id).coveredSlots.push(step.id);
        continue;
      }
      const item={
        id:step.id+"::"+id,type:"prayer",
        title:step.title??step.id,text:witness.text,
        witnessId:id,language,
        kind:witness.kind,sourceLabel:witness.sourceLabel||null,
        sourceUrl:witness.sourceUrl||null,
        coveredSlots:[step.id],editorial:false
      };
      seen.set(id,item);
      rendered.push(item);
    }
  }
  if(!rendered.length)throw new RangeError("No daily prayer steps selected");
  return Object.freeze({
    schema:DAILY_FORMULATION_SCHEMA,key,language,daypart,length,
    stages:Object.freeze(rendered),sourceWitnessCount:seen.size,
    // Step navigation is always explicit. The timer never changes this.
    advance:"manual-only",historicalWholeBook:false
  });
}

export function availableFormulations(manifest,{
  language="en",daypart="morning",length="short",stepId,research=false
}={}){
  const {profile}=readProfile(manifest,{language,daypart,length});
  const step=profile.steps.find(s=>s.id===stepId);
  if(!step || step.type!=="prayer")return [];
  return step.variants.map(id=>{
    const p=resolveWitness(manifest,id,language,{research});
    return {id,title:p.displayTitle||p.sourceLabel||id,
      sourceLabel:p.sourceLabel||null,sourceUrl:p.sourceUrl||null,
      language:p.language,kind:p.kind};
  });
}

export function normalizedDailySelections(value){
  // Pure normalized preference snapshot: no storage, no dates,
  // no examination answers, no sensitive content.
  if(value===null || typeof value!=="object" || Array.isArray(value))
    return Object.freeze({});
  const out={};
  for(const [slot,ids] of Object.entries(value)){
    if(!validSlug(slot))continue;
    if(typeof ids==="string" && validSlug(ids))out[slot]=ids;
    else if(Array.isArray(ids) && ids.length<=8 && ids.every(validSlug))
      out[slot]=[...new Set(ids)];
  }
  return Object.freeze(out);
}

export function dailyTimerSnapshot({
  nowMs,startedMs=null,accumulatedMs=0,running=false,targetMinutes=null
}={}){
  // This is a clock *read model*. It intentionally owns no intervals,
  // storage, alerts, automatic completion, or navigation side effects.
  requireChoice(Number.isFinite(nowMs)&&nowMs>=0,"A nonnegative current timestamp is required");
  requireChoice(Number.isFinite(accumulatedMs)&&accumulatedMs>=0,"Elapsed duration must be nonnegative");
  if(running)requireChoice(Number.isFinite(startedMs)&&startedMs<=nowMs,"Invalid running timer start");
  if(targetMinutes!==null)requireChoice([5,10,15,20].includes(targetMinutes),"Unsupported gentle target");
  const elapsedMs=Math.round(accumulatedMs+(running?nowMs-startedMs:0));
  const targetMs=targetMinutes===null?null:targetMinutes*60*1000;
  return Object.freeze({
    elapsedMs,targetMs,atTarget:targetMs!==null&&elapsedMs>=targetMs,
    running,autoAdvance:false,truncatePrayer:false
  });
}
