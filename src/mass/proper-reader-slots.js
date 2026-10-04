const REQUIRED_SLOTS = Object.freeze([
  "INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
  "GOSPEL","OFFERTORY","SECRET_SET","PREFACE","COMMUNION","POSTCOMMUNION_SET"
]);
export const READER_PROPER_SLOTS = Object.freeze([
  ...REQUIRED_SLOTS.slice(0,4),
  "ALLELUIA_TRACT_SEQUENCE",
  ...REQUIRED_SLOTS.slice(4),
]);

function vernacularValue(value,language="en"){
  if(!value || typeof value!=="object")return "";
  const lang=String(language??"en").toLowerCase();
  const preferred=lang.startsWith("fr") ? value.fr : value.en;
  return String(preferred ?? value.en ?? value.fr ?? value.vernacular ?? value.translation ?? "").trim();
}

function usable(value,language="en"){
  return value && typeof value==="object" &&
    Boolean(String(value.lat??value.la??"").trim()) &&
    Boolean(vernacularValue(value,language));
}

function values(value,language="en"){
  if(Array.isArray(value)) return value.filter(row=>usable(row,language));
  return usable(value,language) ? [value] : [];
}

function readyEnvelope(slot,value,{language="en"}={}){
  const rows=values(value,language);
  if(!rows.length) return Object.freeze({status:"MISSING",slot,data:null});
  return Object.freeze({
    status:"READY",
    slot,
    data:Object.freeze({
      paragraphs:Object.freeze(rows.map((row,index)=>Object.freeze({
        id:slot+"."+(index+1),
        kind:"TEXT",
        latin:String(row.lat??row.la),
        vernacular:vernacularValue(row,language),
      })))
    })
  });
}

export function properToReaderSlots(proper,{language="en"}={}){
  if(!proper || typeof proper!=="object") throw new TypeError("Resolved Proper object required");
  const locale=String(language??"en").toLowerCase().startsWith("fr") ? "fr" : "en";
  const opts={language:locale};

  const slots={
    INTROIT:readyEnvelope("INTROIT",proper.introit,opts),
    COLLECT_SET:readyEnvelope("COLLECT_SET",proper.collects?.length?proper.collects:proper.collect,opts),
    EPISTLE_OR_LESSON:readyEnvelope("EPISTLE_OR_LESSON",proper.epistle,opts),
    GRADUAL:readyEnvelope("GRADUAL",proper.gradual,opts),
    GOSPEL:readyEnvelope("GOSPEL",proper.gospel,opts),
    OFFERTORY:readyEnvelope("OFFERTORY",proper.offertory,opts),
    SECRET_SET:readyEnvelope("SECRET_SET",proper.secrets?.length?proper.secrets:proper.secret,opts),
    PREFACE:readyEnvelope("PREFACE",proper.preface,opts),
    COMMUNION:readyEnvelope("COMMUNION",proper.communion,opts),
    POSTCOMMUNION_SET:readyEnvelope("POSTCOMMUNION_SET",proper.postcommunions?.length?proper.postcommunions:proper.postcommunion,opts),
  };

  // Divinum/Missale source normalization frequently carries Gradual/Tract/Alleluia
  // together in proper.gradual. Only a genuinely separate Sequence gets a second block.
  const sequenceRows=values(proper.sequence,locale);
  slots.ALLELUIA_TRACT_SEQUENCE=sequenceRows.length
    ? readyEnvelope("ALLELUIA_TRACT_SEQUENCE",proper.sequence,opts)
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
