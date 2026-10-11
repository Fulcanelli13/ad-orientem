// Exact non-rendered cue ledger for the 1962 Ordinary Sung source.
// The certified source records an ACTION/STATE, but intentionally gives no
// Latin or English paragraph. This is NOT authorization to activate an icon,
// voice, posture or cinematic at the nearest displayed line. In particular,
// public Schola chant is not the private priest's synchronization clock.
// Keep source identities intact for future event/real-rite alignment.
const rows=[
  // Canonical Proper source-slot clocks, distinct from the resolved text.
  ["AO.SM.C0042","AO.SM.B014","INTROIT","PROPER_BLOCK_ASYNC"],
  ["AO.SM.C0043","AO.SM.B014","INTROIT","PROPER_BLOCK_ASYNC"],
  ["AO.SM.C0075","AO.SM.B020","EPISTLE_OR_LESSON","PROPER_BLOCK_ACTION"],
  ["AO.SM.C0077","AO.SM.B021","GRADUAL","PROPER_BLOCK_ASYNC"],
  ["AO.SM.C0086","AO.SM.B026","GOSPEL","PROPER_BLOCK_ACTION"],
  ["AO.SM.C0109","AO.SM.B030","OFFERTORY","PROPER_BLOCK_ASYNC"],
  ["AO.SM.C0134","AO.SM.B040","SECRET_SET","PROPER_BLOCK_ACTION"],
  ["AO.SM.C0144","AO.SM.B045","PREFACE","PROPER_BLOCK_ACTION"],
  ["AO.SM.C0249","AO.SM.B085","COMMUNION","PROPER_BLOCK_ASYNC"],
  ["AO.SM.C0250","AO.SM.B085","COMMUNION","PROPER_BLOCK_ACTION"],
  ["AO.SM.C0256","AO.SM.B088","POSTCOMMUNION_SET","PROPER_BLOCK_ACTION"],
  // Conditional priest/servers at sedilia while the Schola is chanting.
  // Neither side can be inferred merely from the current Gloria/Credo verse.
  ["AO.SM.C0276","AO.SM.B016",null,"SEDILIA_STATE_CONDITIONAL"],
  ["AO.SM.C0277","AO.SM.B016",null,"SEDILIA_STATE_CONDITIONAL"],
  ["AO.SM.C0278","AO.SM.B027",null,"SEDILIA_STATE_CONDITIONAL"],
  ["AO.SM.C0279","AO.SM.B027",null,"SEDILIA_STATE_CONDITIONAL"],
];
export const ORDINARY_SUNG_SOURCE_ONLY_CUES=Object.freeze(rows.map(
  ([cueId,blockId,properSlot,classification])=>Object.freeze({
    cueId,blockId,properSlot,classification,
    visibility:"NO_PRAYER_PARAGRAPH",
    runtimePolicy:"REQUIRE_INDEPENDENT_SOURCE_EVENT_TRIGGER",
    automatedIconAllowed:false,
  })
));
const EXPECTED_REFERENCES=28;

/**
 * Cross-check all 6 source registries against original source and actual
 * reader paragraphs. Every uncoupled registry reference must be classified,
 * and every classification must correspond to a real source-only record.
 * Cannot silently turn an unrendered priest action into a Schola paragraph.
 */
export function auditOrdinarySungSourceOnlyCues({sungCorpus,sourceModel,registries}={}){
  if(!Array.isArray(sungCorpus?.blocks)||!Array.isArray(sourceModel?.cards))
    throw new TypeError("Certified sung source and source-first LIVE model required");
  const byCue=new Map();
  for(const block of sungCorpus.blocks){
    for(const unit of block.units??[]){
      if(byCue.has(unit.cue_id))throw new Error("Repeated canonical cue "+unit.cue_id);
      byCue.set(unit.cue_id,{unit,block});
    }
  }
  const rendered=new Set(sourceModel.cards.flatMap(c=>c.paragraphs.flatMap(p=>p.sourceCueIds??[])));
  const expected=new Map(ORDINARY_SUNG_SOURCE_ONLY_CUES.map(x=>[x.cueId,x]));
  if(expected.size!==15)throw new Error("Source-only ledger changed without reconciliation");
  const seen=new Map();
  let references=0;
  for(const family of ["gestures","responses","postures","positions","voices","actions"]){
    const items=registries?.[family]?.items;
    if(!Array.isArray(items))throw new TypeError("Missing "+family+" source registry");
    for(const item of items){
      const id=item.cueId;
      if(!id || rendered.has(id))continue;
      const spec=expected.get(id);
      if(!spec)throw new Error(family+": unclassified hidden source cue "+id);
      const original=byCue.get(id);
      if(!original || original.block.Block_ID!==spec.blockId ||
         (original.block.Proper_Slot??null)!==spec.properSlot ||
         String(original.unit.latin??"").trim() ||
         String(original.unit.english??"").trim())
        throw new Error(family+": invalid original source-only identity "+id);
      if(spec.classification==="SEDILIA_STATE_CONDITIONAL"){
        if(original.unit.type!=="state")
          throw new Error(id+": sedilia must be a source state, not prayer");
      }else if(original.unit.clock!=="PRIEST_ACTION")
        throw new Error(id+": Proper source-only cue must be priest action");
      references++;
      const owners=seen.get(id)??[];
      owners.push(family);seen.set(id,owners);
    }
  }
  if(references!==EXPECTED_REFERENCES||seen.size!==expected.size)
    throw new Error("Source-only registry changed: "+references+" refs / "+seen.size+" identities");
  return Object.freeze({
    schema:"ao-ordinary-sung-source-only-audit-v1",
    sourceOnlyCueCount:seen.size,registryReferences:references,
    classificationCounts:Object.freeze({
      properBlockCues:ORDINARY_SUNG_SOURCE_ONLY_CUES.filter(x=>x.properSlot!==null).length,
      conditionalSediliaCues:ORDINARY_SUNG_SOURCE_ONLY_CUES.filter(x=>x.properSlot===null).length,
    }),
    entries:Object.freeze(ORDINARY_SUNG_SOURCE_ONLY_CUES.map(entry=>Object.freeze({
      ...entry,registryFamilies:Object.freeze([...(seen.get(entry.cueId)??[])]),
    }))),
  });
}