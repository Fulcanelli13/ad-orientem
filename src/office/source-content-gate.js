/**
 * Source-text congruence gate for the 1960 Roman Office research pilot.
 *
 * A parsed and nonempty translation can still say something different from
 * its Latin cell. Report known source defects without editing the original.
 * This is deliberately a narrow, evidenced, fail-closed condition rather
 * than an automated theological translation validator.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

const normalized=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("æ","ae").replaceAll("Æ","AE")
  .replace(/\s+/g," ").toLowerCase();
const find=(doc,id)=>doc?.sections?.find(s=>s.sourceCellId===id);
export const OFFICE_SOURCE_CONTENT_GATE_VERSION="ao.office.content-gate.v1";

export function officeTranslationContentBlockers({latin,translation}={}){
  if(!latin||!translation||
    latin.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    translation.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    latin.date!==translation.date||latin.hour!==translation.hour)
    throw Error("OFFICE_CONTENT_GATE_CONTEXT_OR_PIN_INVALID");
  const blockers=[];
  // This is a concrete Latin/English *text* contradiction, not a special
  // exemption for a single pilot date. The same pairing can recur in future
  // years (including when All Souls is transferred from a Sunday).
  // Restrict the gate to the attested Prime Prima5 pairing and the exact
  // beneficiary phrases: never infer that an unrelated collect is wrong.
  if(latin.hour==="PRIME"&&latin.language==="la"&&
    translation.language==="en"){
    const l=find(latin,"Prima5"),e=find(translation,"Prima5");
    if(!l||!e)throw Error("OFFICE_CONTENT_GATE_PRIMA5_MISSING");
    const L=normalized(l.text),E=normalized(e.text);
    if(/animas omnium fidelium qui ex hoc/.test(L)&&
      /brethren of our congregation, kinsfolk, and benefactors/.test(E))
      blockers.push(Object.freeze({
        date:latin.date,hour:latin.hour,language:"en",
        latinSourceCellId:l.sourceCellId,translationSourceCellId:e.sourceCellId,
        reason:"EN_PRIME_RECIPIENT_SCOPE_MISMATCH",
        editorialResolution:"NEEDS_PRINTED_1960_ROMAN_PROPER_AND_SOURCE_VERIFIED_ENGLISH",
        resolved:false,canPublish:false,
      }));
  }
  return Object.freeze(blockers);
}
