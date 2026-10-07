export const READER_GESTURE_MATRIX_SCHEMA="ao-mass-gesture-matrix-v1";
export const READER_GESTURE_MATRIX_FILE="../mass/gesture-matrix.v1.json";

const ACTORS=new Set(["PRIEST","FAITHFUL"]);

function cueNumber(value){
  const m=String(value??"").match(/^AO\.SM\.C(\d{4})$/);
  return m?Number(m[1]):null;
}

function freezeItem(raw){
  return Object.freeze({
    id:String(raw.id),
    cueId:String(raw.cueId),
    actor:String(raw.actor),
    gesture:String(raw.gesture),
    label:String(raw.label),
    triggerLatin:raw.triggerLatin==null?null:String(raw.triggerLatin),
    sequenceOrder:Number(raw.sequenceOrder??1),
    authorityClass:String(raw.authorityClass),
    runtimeProfile:String(raw.runtimeProfile??""),
    condition:raw.condition==null?null:String(raw.condition),
    sources:Object.freeze([...(raw.sources??[])].map(String)),
    campionPages:Object.freeze([...(raw.campionPages??[])].map(Number)),
    sourceRubricEventId:raw.sourceRubricEventId==null?null:String(raw.sourceRubricEventId),
    displayPrimary:raw.displayPrimary===true,
    iconKey:raw.iconKey==null?null:String(raw.iconKey),
    iconStatus:String(raw.iconStatus??"PENDING_ICON_BINDING"),
  });
}

export function validateReaderGestureMatrix(data){
  if(!data||typeof data!=="object")throw new TypeError("Gesture matrix data required");
  if(data.schema!==READER_GESTURE_MATRIX_SCHEMA)throw new Error("Unexpected gesture matrix schema");
  if(data.status!=="CANONICAL_GESTURE_SOT")throw new Error("Gesture matrix is not canonical SOT");
  if(data.invariants?.primaryRubricalAuthority!=="ROMAN_MISSAL_1962")throw new Error("1962 Missal must remain primary gesture authority");
  if(data.invariants?.campionRole!=="DISCOVERY_CORROBORATION_AND_EXPLANATORY_PROVENANCE")throw new Error("Campion authority role changed");
  if(data.invariants?.faithfulCustomAuthoritySeparate!==true)throw new Error("Faithful custom authority must remain separate");
  if(data.invariants?.canonicalTextMutationAllowed!==false)throw new Error("Gesture matrix must not mutate canonical text");
  if(data.invariants?.cardStructureMutationAllowed!==false)throw new Error("Gesture matrix must not mutate card structure");
  if(data.invariants?.iconBindingRequired!==false)throw new Error("Gesture matrix must allow deferred icons");
  if(data.invariants?.runtimeMustNotInferBySubstring!==true)throw new Error("Gesture matrix must remain exact-cue scoped");
  if(!Array.isArray(data.sources)||!data.sources.length)throw new Error("Gesture matrix sources missing");
  if(!Array.isArray(data.items)||!data.items.length)throw new Error("Gesture matrix items missing");

  const sourceIds=new Set();
  for(const source of data.sources){
    const id=String(source?.id??"");
    if(!id||sourceIds.has(id))throw new Error("Duplicate/missing gesture matrix source "+id);
    sourceIds.add(id);
    if(!source?.url&&!source?.sourceFile)throw new Error(id+": source locator missing");
  }
  for(const required of ["MR62_RITUS","CAMPION_1954","CURRENT_SUNG_BLUEPRINT"]){
    if(!sourceIds.has(required))throw new Error(required+" gesture source missing");
  }

  const ids=new Set();
  const primaryPriestByCue=new Map();
  const items=data.items.map(freezeItem);
  for(const item of items){
    if(!/^GM\.[PF]\.C\d{4}\.\d{2}$/.test(item.id)||ids.has(item.id))throw new Error("Invalid/duplicate gesture matrix id "+item.id);
    ids.add(item.id);
    if(cueNumber(item.cueId)==null)throw new Error(item.id+": invalid cue");
    if(!ACTORS.has(item.actor))throw new Error(item.id+": invalid actor");
    if(!item.gesture||!item.label)throw new Error(item.id+": gesture/label missing");
    if(!Number.isInteger(item.sequenceOrder)||item.sequenceOrder<1)throw new Error(item.id+": invalid sequence order");
    if(!item.sources.length||item.sources.some(id=>!sourceIds.has(id)))throw new Error(item.id+": unresolved source");
    if(item.campionPages.length&&!item.sources.includes("CAMPION_1954"))throw new Error(item.id+": Campion pages without Campion source");
    if(item.actor==="PRIEST"&&item.authorityClass.startsWith("1962_")&&!item.sources.includes("MR62_RITUS"))throw new Error(item.id+": 1962 priest gesture without MR62 source");
    if(item.actor==="FAITHFUL"&&item.authorityClass==="1962_NORMATIVE")throw new Error(item.id+": faithful cue may not masquerade as priest rubric");
    if(item.displayPrimary&&item.actor==="PRIEST"){
      if(primaryPriestByCue.has(item.cueId))throw new Error(item.cueId+": multiple primary priest gestures");
      primaryPriestByCue.set(item.cueId,item.id);
    }
  }

  return Object.freeze({
    schema:data.schema,
    version:String(data.version??""),
    itemCount:items.length,
    priestCount:items.filter(x=>x.actor==="PRIEST").length,
    faithfulCount:items.filter(x=>x.actor==="FAITHFUL").length,
    campionBackedCount:items.filter(x=>x.campionPages.length).length,
    primaryPriestCueCount:primaryPriestByCue.size,
    items:Object.freeze(items),
  });
}

function byCue(items){
  const map=new Map();
  for(const item of items){
    const list=map.get(item.cueId)??[];
    list.push(item);
    map.set(item.cueId,list);
  }
  for(const [cueId,list] of map){
    map.set(cueId,Object.freeze([...list].sort((a,b)=>a.sequenceOrder-b.sequenceOrder||a.id.localeCompare(b.id))));
  }
  return map;
}

function priestAction(item){
  if(!item)return null;
  return Object.freeze({
    label:item.label,
    action:item.label,
    iconKey:item.iconKey,
    cueId:item.cueId,
    trigger:item.triggerLatin,
    sourceGestureId:item.id,
    authorityClass:item.authorityClass,
    sources:item.sources,
    campionPages:item.campionPages,
    owner:"GESTURE_MATRIX_SOT",
    transient:true,
  });
}

export function createReaderGestureMatrixController({data=null}={}){
  if(!data)return Object.freeze({
    schema:"ao-reader-gesture-matrix-controller-v1",
    supported:false,
    reason:"GESTURE_MATRIX_NOT_LOADED",
    audit:null,
    project:cueId=>Object.freeze({
      supported:false,
      reason:"GESTURE_MATRIX_NOT_LOADED",
      cueId:cueId??null,
      priest:Object.freeze([]),
      faithful:Object.freeze([]),
      primaryPriestAction:null,
    }),
  });
  const audit=validateReaderGestureMatrix(data);
  const map=byCue(audit.items);
  function project(cueId){
    const id=String(cueId??"");
    if(cueNumber(id)==null)return Object.freeze({
      supported:true,
      reason:id?"UNKNOWN_OR_SYNTHETIC_CUE":null,
      cueId:id||null,
      priest:Object.freeze([]),
      faithful:Object.freeze([]),
      primaryPriestAction:null,
    });
    const rows=map.get(id)??Object.freeze([]);
    const priest=Object.freeze(rows.filter(x=>x.actor==="PRIEST"));
    const faithful=Object.freeze(rows.filter(x=>x.actor==="FAITHFUL"));
    const primary=priest.find(x=>x.displayPrimary&&x.condition==null)??null;
    return Object.freeze({
      supported:true,
      reason:null,
      cueId:id,
      priest,
      faithful,
      primaryPriestAction:priestAction(primary),
    });
  }
  return Object.freeze({
    schema:"ao-reader-gesture-matrix-controller-v1",
    supported:true,
    reason:null,
    audit,
    project,
  });
}
