import {scriptureSegmentContext} from "../scripture/segments.js";
import {NATIVE_RITE_SCRIPTURE_READINGS} from "./scripture-native-rite-index.js";

function latin(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replaceAll("æ","ae").replaceAll("Æ","ae").replaceAll("œ","oe").replaceAll("Œ","oe")
   .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
function verifiedSource(step,row){
 if(!step||!row)return false;
 const paragraphs=step.card?.paragraphs??[];
 const id=row.paragraphId;
 const target=paragraphs.find(x=>x.id===id);
 if(!target||paragraphs.filter(x=>x.id===id).length!==1)return false;
 const expected=latin(row.latinIncipit);
 const body=latin(target.latin);
 if(expected.length<20||!body.includes(expected))return false;
 if(row.endText){
  const end=latin(row.endText);
  const all=latin(paragraphs.filter(x=>x.kind==="TEXT").map(x=>x.latin).join(" "));
  if(!all.endsWith(end))return false;
 }
 return true;
}
function entryContext(row){
 const context=scriptureSegmentContext(row.segments,{
   reference:row.reference,provenance:"NATIVE_1962_RITE_STATE_LATIN_SOURCE_BOUND"
 });
 return Object.freeze({state:"READY",...context,role:row.role,
    nativeStateId:row.stateId,witnessUrl:row.witnessUrl});
}
/**
 * Native pre-rites and distinct rites do not own Ordinary Proper slots.
 * The current source state and actually rendered Latin must both agree.
 * No fall-through to a date-based Mass Gospel inference.
 */
export function nativeRiteScriptureContext(preview,prepared){
 const plan=prepared?.session?.plan;
 if(!preview?.root||!plan)return null;
 if(plan.kind==="DISTINCT_RITE"&&plan.rite==="GOOD_FRIDAY"){
  const state=preview.getGoodFridayState?.();
  const stateId=state?.step?.recordId;
  if(!stateId)return null;
  const hit=NATIVE_RITE_SCRIPTURE_READINGS.filter(x=>x.rite==="GOOD_FRIDAY"&&x.stateId===stateId);
  if(hit.length!==1)return null;
  return verifiedSource(state,hit[0])?entryContext(hit[0]):null;
 }
 if(plan.kind==="COMPOSITE_DISTINCT_RITE"&&plan.rite==="EASTER_VIGIL"){
  // EV-MASS-700 is a Kyrie handoff, never the fifth prophecy. A previously
  // selected prophecy must not leak into the post-litany Mass projection.
  if(preview.getCompositeStage?.()!=="VIGIL_ACTIVE")return null;
  const state=preview.getEasterVigilState?.();
  const stateId=state?.step?.recordId;
  if(!/^EV-LESS-0[1-4]-READ$/.test(String(stateId)))return null;
  if(preview.root.dataset?.r17NativeRiteRecord!==stateId)return null;
  if(preview.getCurrentCard?.()?.id!==state.card?.id)return null;
  const hits=NATIVE_RITE_SCRIPTURE_READINGS.filter(x=>
    x.rite==="EASTER_VIGIL"&&x.stateId===stateId);
  if(hits.length!==1)return null;
  return verifiedSource(state,hits[0])?entryContext(hits[0]):null;
 }
 if(preview.root.dataset?.r17NativeEvent==="palm"){
  const state=preview.getPalmState?.();
  const current=preview.getCurrentCard?.();
  const hit=NATIVE_RITE_SCRIPTURE_READINGS.filter(x=>
   x.rite==="PALM_RITE"&&x.cardId===current?.id&&x.cardId===state?.card?.id);
  if(hit.length!==1)return null;
  const row=hit[0];
  const record=(state?.card?.sourceRecordIds??[]);
  if(!record.includes(row.stateId))return null;
  return verifiedSource({card:state.card},row)?entryContext(row):null;
 }
 return null;
}
