/**
 * Visible Mass P7: read-only, strictly Sung cue projection.
 *
 * Scene and camera remain photographic. Source-owned cue, actor, station and
 * gesture records are linked by exact IDs; no verbal-substring inference, new
 * 1962 claims, bell-count guesses or global congregation-posture commands.
 * LOW, SOLEMN and SPECIAL are distinct owners and explicitly fail closed.
 */
export const VISIBLE_MASS_P7_VERSION="visible-mass-p7-source-cue-sample-v1";
export const VISIBLE_MASS_P7_OWNERS=Object.freeze({
  text:"data/presentation/reader-text-sung.v1.json",
  priest:"data/presentation/reader-rubric-events.v1.json",
  position:"data/presentation/reader-priest-positions.v1.json",
  faithful:"data/presentation/reader-gestures.v1.json",
  posture:"src/mass/reader-posture-profile.js",
  guide:"data/presentation/guide-registry.v1.json",
  solemn:"data/mass/solemn-mass-profile.v1.json"
});
export const VISIBLE_MASS_P7_FORM_GATES=Object.freeze({
  SUNG:"CERTIFIED_SAMPLED_CUES",
  LOW:"NO_ALIGNED_CUE_PROJECTION",
  SOLEMN:"SEPARATE_CERTIFIED_GRAPH_NOT_PROJECTED",
  SPECIAL:"BRANCH_SPECIFIC_PENDING"
});
const samples=Object.freeze([
  ["C0001","001",null],["C0084","007",null],
  ["C0111","010",null],["C0115","010",null],["C0119","010",null],
  ["C0122","010","INCENSE_ENABLED"],["C0161","014",null],
  ["C0174","015",null],["C0181","016",null],["C0202","018",null],
  ["C0222","021",null],["C0242","024",null],["C0246","025",null],
  ["C0263","029","BLESSING_ALLOWED"],["C0273","030","LAST_GOSPEL_PRESENT"]
]);
function check(cond,msg){if(!cond)throw new Error("Visible Mass P7: "+msg);}
export function projectVisibleMassP7({textCorpus,rubricEvents,priestPositions,faithfulGestures,guideRegistry},form="SUNG"){
  check(form==="SUNG","unreconciled ritual form cannot inherit Sung cues");
  check(textCorpus?.schema==="ao-reader-text-corpus-v1" && textCorpus.form==="SUNG" &&
    Array.isArray(textCorpus.blocks),"original Sung source corpus required");
  check(rubricEvents?.schema==="ao-reader-rubric-events-v1" &&
    rubricEvents.status==="SOURCE_BACKED_OVERLAY" && Array.isArray(rubricEvents.items),
    "source-backed priest rubric owner required");
  check(priestPositions?.schema==="ao-r17-reader-priest-positions-v1" &&
    Array.isArray(priestPositions.items),"original priest station registry required");
  check(faithfulGestures?.schema==="ao-r17-reader-gestures-v1" &&
    Array.isArray(faithfulGestures.items),"original faithful gesture registry required");
  check(guideRegistry?.schema==="ao-r17-guide-registry-v1" &&
    guideRegistry.status==="RECOVERED_CONTINUITY_CERTIFIED" &&
    guideRegistry.entryCount===32,"original certified Guide required");
  const cueMap=new Map();
  for(const block of textCorpus.blocks){
    for(const unit of block.units||[]){
      check(!cueMap.has(unit.cue_id),"duplicate source cue "+unit.cue_id);
      cueMap.set(unit.cue_id,{block,unit});
    }
  }
  const records=samples.map(([short,macro,condition])=>{
    const cueId="AO.SM."+short,guideId="AO.CARD."+macro,src=cueMap.get(cueId);
    check(Boolean(src),"missing exact source cue "+cueId);
    check(src.block.Macro_ID==="AO.SM.M"+macro,"source macro/Guide mismatch "+cueId);
    check(Boolean(guideRegistry.entries[guideId]),"missing Guide "+guideId);
    const priestEvents=rubricEvents.items.filter(e=>e.cueId===cueId)
      .map(e=>Object.freeze({id:e.id,actor:e.actor,kind:e.kind,
        label:e.label,authorityClass:e.authorityClass}));
    const stationEvents=priestPositions.items.filter(e=>e.cueId===cueId)
      .map(e=>Object.freeze({station:e.station,condition:e.condition}));
    const faithful=faithfulGestures.items.filter(e=>e.cueId===cueId)
      .map(e=>Object.freeze({action:e.action,scope:e.scope,condition:e.condition}));
    check(priestEvents.length+stationEvents.length+faithful.length>0,
      "cue has no matched source-backed display event "+cueId);
    if(short==="C0174")check(priestEvents.some(e=>e.label==="ELEVATES HOST")&&
      priestEvents.some(e=>e.kind==="BELL"),"Host elevation source missing");
    if(short==="C0181")check(priestEvents.some(e=>e.label==="ELEVATES CHALICE")&&
      priestEvents.some(e=>e.kind==="BELL"),"Chalice elevation source missing");
    if(short==="C0246")check(stationEvents.some(e=>e.station==="COMMUNION_RAIL"),
      "communion rail location not sourced");
    if(short==="C0273")check(faithful.some(e=>e.action==="Genuflect"),
      "Last Gospel genuflection not sourced");
    return Object.freeze({cueId,guideId,condition,
      sourceBlockId:src.block.Block_ID,
      sourceTitle:src.block.Title,
      sourceUnit:src.unit,
      guideTitle:guideRegistry.entries[guideId].moment,
      priestEvents:Object.freeze(priestEvents),
      stationEvents:Object.freeze(stationEvents),
      faithfulEvents:Object.freeze(faithful),
      sourceStatus:"SOURCE_OWNED_SELECTED_CUE",
      audiencePostureAuthority:"LOCAL_CUSTOM_NOT_UNIVERSAL_1962",
      photographCeremonyProof:false});
  });
  check(records.length===15&&new Set(records.map(x=>x.cueId)).size===15,
    "15 unique exact source events required");
  return Object.freeze({
    schema:"AO_VISIBLE_MASS_P7_CEREMONIAL_READ_ONLY_BRIDGE_V1",
    status:"RESEARCH_PREVIEW_NOT_RITUAL_READER",
    sourceOwners:VISIBLE_MASS_P7_OWNERS,
    approvedForm:"SUNG",formGates:VISIBLE_MASS_P7_FORM_GATES,
    records:Object.freeze(records),
    guideCoverage:32,subsetOfFullSungCues:true,
    roleOfPhotographs:"CONTEXTUAL_GENUINE_PHOTOS_ONLY",
    publishesLowOrSolemnCueParity:false,
    publishesUniversalFaithfulPosture:false,
    publishesSpecialRites:false,
    modifiesMassReader:false
  });
}
