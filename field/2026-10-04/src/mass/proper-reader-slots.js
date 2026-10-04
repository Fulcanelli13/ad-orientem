const REQUIRED_SLOTS = Object.freeze([
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
  "GOSPEL","OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
]);
export const READER_PROPER_SLOTS = Object.freeze([
  ...REQUIRED_SLOTS.slice(0,4),
  "ALLELUIA_TRACT_SEQUENCE",
  ...REQUIRED_SLOTS.slice(4),
]);

function usable(value){
  return value && typeof value==="object" &&
    Boolean(String(value.lat??"").trim()) &&
    Boolean(String(value.en??"").trim());
}

function values(value){
  if(Array.isArray(value)) return value.filter(usable);
  return usable(value) ? [value] : [];
}

function readyEnvelope(slot,value){
  const rows=values(value);
  if(!rows.length) return Object.freeze({status:"MISSING",slot,data:null});
  return Object.freeze({
    status:"READY",
    slot,
    data:Object.freeze({
      paragraphs:Object.freeze(rows.map((row,index)=>Object.freeze({
        id:slot+"."+(index+1),
        kind:"TEXT",
        latin:String(row.lat),
        vernacular:String(row.en),
      })))
    })
  });
}

export function properToReaderSlots(proper){
  if(!proper || typeof proper!=="object") throw new TypeError("Resolved Proper object required");

  const slots={
    INTROIT:readyEnvelope("INTROIT",proper.introit),
    COLLECT_SET:readyEnvelope("COLLECT_SET",proper.collects?.length?proper.collects:proper.collect),
    EPISTLE_OR_LESSON:readyEnvelope("EPISTLE_OR_LESSON",proper.epistle),
    GRADUAL:readyEnvelope("GRADUAL",proper.gradual),
    GOSPEL:readyEnvelope("GOSPEL",proper.gospel),
    OFFERTORY:readyEnvelope("OFFERTORY",proper.offertory),
    SECRET_SET:readyEnvelope("SECRET_SET",proper.secrets?.length?proper.secrets:proper.secret),
    PREFACE:readyEnvelope("PREFACE",proper.preface),
    COMMUNION:readyEnvelope("COMMUNION",proper.communion),
    POSTCOMMUNION_SET:readyEnvelope("POSTCOMMUNION_SET",proper.postcommunions?.length?proper.postcommunions:proper.postcommunion),
  };

  // Divinum/Missale source normalization frequently carries Gradual/Tract/Alleluia
  // together in proper.gradual. Only a genuinely separate Sequence gets a second block.
  const sequenceRows=values(proper.sequence);
  slots.ALLELUIA_TRACT_SEQUENCE=sequenceRows.length
    ? readyEnvelope("ALLELUIA_TRACT_SEQUENCE",proper.sequence)
    : Object.freeze({
        status:"NOT_APPLICABLE",
        slot:"ALLELUIA_TRACT_SEQUENCE",
        reason:"No separate Sequence; Gradual/Tract/Alleluia remains in GRADUAL.",
        data:null,
      });

  const missing=REQUIRED_SLOTS.filter(slot=>slots[slot].status!=="READY");
  return Object.freeze({
    schema:"ao-reader-proper-slots-v1",
    sourcePath:proper.sourcePath??null,
    slots:Object.freeze(slots),
    missing:Object.freeze(missing),
    ready:missing.length===0,
  });
}

export function assertReaderProperReady(mapped){
  if(!mapped || mapped.schema!=="ao-reader-proper-slots-v1") throw new TypeError("Reader Proper slot map required");
  if(!mapped.ready) throw new Error("Resolved Proper is incomplete for reader: "+mapped.missing.join(", "));
  return mapped;
}
