import fs from "node:fs";
import path from "node:path";
import {execFileSync} from "node:child_process";
import {pathToFileURL} from "node:url";

export function compareIckspScheduleSnapshots(baseline,live,{checkedAt=new Date().toISOString()}={}){
  const older=Array.isArray(baseline?.records)?baseline.records:[];
  const current=Array.isArray(live?.records)?live.records:[];
  const historicIds=new Set(older.map(s=>s.schedule_id).filter(Boolean));
  const liveIds=new Set(current.map(s=>s.schedule_id).filter(Boolean));
  const missing=[...historicIds].filter(id=>!liveIds.has(id)).sort();
  const added=[...liveIds].filter(id=>!historicIds.has(id)).sort();
  const sourceSlot=id=>String(id).match(/-(\d+)-1$/)?.[1]??null;
  const uniqueSlotMap=(ids)=>{
    const counts=new Map();
    for(const id of ids){
      const slot=sourceSlot(id);
      if(slot!==null)counts.set(slot,(counts.get(slot)??0)+1);
    }
    return new Map(ids.map(id=>[sourceSlot(id),id])
      .filter(([slot])=>slot!==null&&counts.get(slot)===1));
  };
  const beforeSlots=uniqueSlotMap(missing),afterSlots=uniqueSlotMap(added);
  const remapped=[...beforeSlots.entries()].filter(([slot])=>afterSlots.has(slot))
    .map(([source_slot,old_id])=>({source_slot,old_id,new_id:afterSlots.get(source_slot)}))
    .sort((a,b)=>Number(a.source_slot)-Number(b.source_slot));
  const remappedOldIds=new Set(remapped.map(x=>x.old_id));
  const remappedNewIds=new Set(remapped.map(x=>x.new_id));
  const drift=missing.length>0||added.length>0||older.length!==current.length;
  return {
    schema:"AO_ICKSP_LIVE_SCHEDULE_DRIFT_REVIEW_V1",
    checked_at:checkedAt,provider:"ICKSP",
    baseline_count:older.length,live_count:current.length,
    missing_baseline_schedule_ids:missing,
    new_live_schedule_ids:added,
    same_source_slot_identity_changes:remapped,
    unmatched_baseline_ids:missing.filter(id=>!remappedOldIds.has(id)),
    unmatched_live_ids:added.filter(id=>!remappedNewIds.has(id)),
    drift_detected:drift,
    source_identity_diff_requires_review:true,
    publication_authorized:false,
    recheck_required:drift,
  };
}

export function writeIckspDriftReport({
  baseline,live,outputPath="data/directory/generated/icksp/schedule-drift-review.v1.json",
}={}){
  const report=compareIckspScheduleSnapshots(baseline,live);
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,JSON.stringify(report,null,2)+"\n");
  const level=report.drift_detected?"REVIEW":"PASS";
  console.log("ICKSP live schedule source comparison: "+level+
    " — baseline "+report.baseline_count+", live "+report.live_count+
    ", missing IDs "+report.missing_baseline_schedule_ids.length+
    ", new IDs "+report.new_live_schedule_ids.length+
    ". No source schedule rows automatically merged.");
  if(report.drift_detected){
    console.warn("ICKSP same-slot renamed source identities: "+
      JSON.stringify(report.same_source_slot_identity_changes.slice(0,30)));
    console.warn("ICKSP unresolved source slots (require exact official witness review): "+
      JSON.stringify(report.unmatched_baseline_ids.slice(0,30)));
  }
  return report;
}

const invoked=process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url;
if(invoked){
  const file="data/directory/generated/icksp/schedules.v1.json";
  const baseline=JSON.parse(execFileSync("git",["show","HEAD:"+file],{encoding:"utf8"}));
  const live=JSON.parse(fs.readFileSync(file,"utf8"));
  writeIckspDriftReport({baseline,live});
}
