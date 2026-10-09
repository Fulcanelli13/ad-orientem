import {massScriptureContextForCard} from "../mass/scripture-reading-context.js";
import {passageReference} from "../scripture/passages.js";
import {scriptureSegmentsReference} from "../scripture/segments.js";

/*
 * Calendar is a presentation of the resolved 1962 Proper, not a second
 * Scripture source. Every link uses the source-path / actual-Latin / explicit
 * citation gate already enforced in the Mass reader; unresolved slots vanish.
 */
const SLOTS=Object.freeze(["EPISTLE_OR_LESSON","GOSPEL"]);

export function calendarScriptureContexts(resolution){
  const record=resolution?.proper;
  if(record?.status!=="ready"&&record?.status!=="READY")return Object.freeze([]);
  const proper=record?.data;
  if(!proper||typeof proper!=="object")return Object.freeze([]);
  const sourcePath=String(record.sourcePath??proper.sourcePath??proper.source?.path??"").trim();
  const prepared={session:{resolvedMass:{proper:{sourcePath,data:proper}}}};
  const rows=SLOTS.map(slot=>{
    const resolved=massScriptureContextForCard({blocks:[{properSlot:slot}]},prepared);
    if(resolved?.state!=="READY"||!resolved.reference||!resolved.passage)return null;
    const canonicalReference=Array.isArray(resolved.segments)
      ?scriptureSegmentsReference(resolved.segments):passageReference(resolved.passage);
    const displayReference=canonicalReference.replace(/^([1-3])(?=[A-Z])/,"$1 ");
    return Object.freeze({
      slot,reference:displayReference,sourceReference:resolved.reference,passage:resolved.passage,
      segments:Array.isArray(resolved.segments)?resolved.segments:null,
      provenance:resolved.provenance??null,
      witnessUrl:resolved.witnessUrl??null
    });
  }).filter(Boolean);
  return Object.freeze(rows);
}
