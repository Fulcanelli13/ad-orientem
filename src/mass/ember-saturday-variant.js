// 1962 Roman Missal: Ember Saturday extended-reading choice, distinct from
// Low / Sung / Solemn Mass and from the selected commemorative oration sets.
// This is a source-order gate: it NEVER invents Latin, French, gestures,
// source-section identities or the normal Pauline Epistle.
const freeze=Object.freeze;
const SEPTEMBER_SATURDAY="Tempora/093-6";
const SEPTEMBER_DATE="2026-09-26";
export const SEPTEMBER_EMBER_LONG_SOURCE_ORDER=freeze([
  "LectioL1","GradualeL1","OratioL1",
  "LectioL2","GradualeL2","OratioL2",
  "LectioL3","GradualeL3","OratioL3",
  "LectioL4","GradualeL4","OratioL4",
  "LectioL5","OratioL5",
]);
export const SEPTEMBER_EMBER_SHORT_SOURCE_ORDER=freeze([
  "LectioL1","GradualeL1","OratioL1",
]);

function sourcePath(mass){
  const proper=mass?.proper?.data??mass?.proper??null;
  return String(proper?.sourcePath??mass?.proper?.sourcePath??"");
}
function strictFullSequence(sequence){
  const ids=sequence.map(node=>String(node?.sourceSectionId??""));
  if(ids.length!==SEPTEMBER_EMBER_LONG_SOURCE_ORDER.length ||
    ids.some((id,index)=>id!==SEPTEMBER_EMBER_LONG_SOURCE_ORDER[index]))
    throw new Error("EMBER_SEPT26_LONG_SOURCE_ORDER_UNCERTIFIED");
  if(sequence.some((node,index)=>node?.sourceOrderIndex!==index ||
    node?.orderAuthority!=="SOURCE_ORDER"))
    throw new Error("EMBER_SEPT26_SOURCE_NODE_IDENTITY_DRIFT");
}

export function select1962SeptemberEmberSaturdayVariant(resolvedMass,sequence){
  if(!Array.isArray(sequence))throw new TypeError("Ember source-order sequence required");
  const selection=resolvedMass?.emberSaturdaySelection??null;
  const september=resolvedMass?.date===SEPTEMBER_DATE &&
    sourcePath(resolvedMass)===SEPTEMBER_SATURDAY &&
    (resolvedMass?.overlays??[]).includes("EMBER_LESSONS");
  // A request for a September variant on another Proper/date is never valid.
  if(!september){
    if(selection!=null)throw new Error("EMBER_SATURDAY_VARIANT_SOURCE_DATE_UNSUPPORTED");
    return freeze({form:null,authority:null,sequence:freeze([...sequence])});
  }
  strictFullSequence(sequence);
  // Until an explicit celebration-context selector is wired to the user,
  // the complete long form is the only safe fallback. We must never
  // assume a nonconventual Mass or Ordination was ruled out.
  if(selection==null)return freeze({
    form:"LONG",authority:"SAFE_SOURCE_LONG_DEFAULT",
    sequence:freeze([...sequence]),contextCertified:false,
  });
  if(typeof selection!=="object"||Array.isArray(selection) ||
    !["LONG","SHORT"].includes(selection.form))
    throw new Error("EMBER_SATURDAY_VARIANT_EXPLICIT_LONG_OR_SHORT_REQUIRED");
  if(selection.form==="SHORT"){
    if(typeof selection.isConventual!=="boolean"||
       typeof selection.ordinations!=="boolean")
      throw new Error("EMBER_SHORT_REQUIRES_EXPLICIT_CONVENTUAL_AND_ORDINATION_CONTEXT");
    // Independently recorded host/celebration facts cannot be overridden
    // by self-declared false flags in the option payload.
    const conventualHost=resolvedMass?.provenance?.conventualMass===true;
    const ordinationHost=resolvedMass?.provenance?.ordinationMass===true;
    if(selection.isConventual||selection.ordinations||
      conventualHost||ordinationHost)
      throw new Error("EMBER_SHORT_FORBIDDEN_FOR_CONVENTUAL_OR_ORDINATIONS");
  }
  const kept=selection.form==="SHORT"
    ?sequence.slice(0,SEPTEMBER_EMBER_SHORT_SOURCE_ORDER.length)
    :sequence;
  const expected=selection.form==="SHORT"
    ?SEPTEMBER_EMBER_SHORT_SOURCE_ORDER
    :SEPTEMBER_EMBER_LONG_SOURCE_ORDER;
  if(kept.some((node,index)=>node.sourceSectionId!==expected[index]))
    throw new Error("EMBER_VARIANT_SOURCE_ORDER_DRIFT");
  return freeze({
    form:selection.form,authority:"EXPLICIT_CELEBRATION_CONTEXT",
    sequence:freeze([...kept]),contextCertified:selection.form==="SHORT",
  });
}
