export const READER_RUBRIC_EVENTS_SCHEMA="ao-reader-rubric-events-v1";
export const READER_RUBRIC_EVENTS_FILE="reader-rubric-events.v1.json";

const ACTORS=new Set(["PRIEST","SERVER","DEACON","SUBDEACON","SCHOLA","FAITHFUL"]);
const KINDS=new Set(["ACTION","GESTURE","STATE","BELL"]);

function sourceUrl(baseUrl){return new URL("../../data/presentation/"+READER_RUBRIC_EVENTS_FILE,baseUrl);}

export async function loadReaderRubricEvents({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const url=sourceUrl(baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load reader rubric events ("+(response?.status??"network")+")");
  const data=await response.json();
  validateReaderRubricEvents(data);
  return Object.freeze({data,url:String(url)});
}

function cueNumber(value){
  const m=String(value??"").match(/^AO\.SM\.C(\d{4})$/);
  return m?Number(m[1]):null;
}

function freezeEvent(raw){
  return Object.freeze({
    id:String(raw.id),
    cueId:String(raw.cueId),
    order:Number(raw.order),
    actor:String(raw.actor),
    kind:String(raw.kind),
    label:String(raw.label),
    triggerLat:raw.triggerLat==null?null:String(raw.triggerLat),
    iconKey:raw.iconKey==null?null:String(raw.iconKey),
    displayPrimary:raw.displayPrimary===true,
    authorityClass:String(raw.authorityClass),
    sources:Object.freeze([...(raw.sources??[])].map(String)),
    campionPages:Object.freeze([...(raw.campionPages??[])].map(Number)),
    presentationOwner:raw.presentationOwner==null?null:String(raw.presentationOwner),
    stateKey:raw.stateKey==null?null:String(raw.stateKey),
    stateValue:raw.stateValue==null?null:Boolean(raw.stateValue),
    endCueId:raw.endCueId==null?null:String(raw.endCueId),
  });
}

export function validateReaderRubricEvents(data){
  if(!data||typeof data!=="object")throw new TypeError("Reader rubric-event data required");
  if(data.schema!==READER_RUBRIC_EVENTS_SCHEMA)throw new Error("Unexpected reader rubric-event schema");
  if(data.status!=="SOURCE_BACKED_OVERLAY")throw new Error("Rubric-event overlay is not source-backed");
  if(data.authority!=="PRESENTATION_RUBRIC_DETAIL_ONLY")throw new Error("Rubric-event overlay may not claim canonical text authority");
  if(data.invariants?.canonicalTextMutationAllowed!==false)throw new Error("Rubric-event overlay must forbid canonical text mutation");
  if(data.invariants?.frozenDonorRegistryMutationAllowed!==false)throw new Error("Rubric-event overlay must preserve the frozen donor registry");
  if(data.invariants?.cardStructureMutationAllowed!==false)throw new Error("Rubric-event overlay must preserve card structure");
  if(data.invariants?.primaryAuthority!=="ROMAN_MISSAL_1962")throw new Error("1962 Missal must remain rubric-event primary authority");
  if(data.invariants?.campionRole!=="DISCOVERY_AND_EXPLANATORY_PROVENANCE_ONLY")throw new Error("Campion may not become normative rubric authority");
  if(!Array.isArray(data.sources)||!data.sources.length)throw new Error("Rubric-event source registry missing");
  const sourceIds=new Set();
  for(const source of data.sources){
    const id=String(source?.id??"");
    if(!id||sourceIds.has(id))throw new Error("Duplicate/missing rubric-event source "+id);
    sourceIds.add(id);
    if(!source?.url)throw new Error(id+": source URL missing");
  }
  if(!sourceIds.has("MR62_RITUS"))throw new Error("1962 Ritus source missing");
  if(!sourceIds.has("CAMPION_1954"))throw new Error("Campion provenance source missing");
  if(!Array.isArray(data.items)||!data.items.length)throw new Error("Rubric-event items missing");

  const ids=new Set();
  const primaryByCue=new Map();
  const items=data.items.map(freezeEvent);
  for(const item of items){
    if(!/^AO\.RUB\.C\d{4}\.\d{2}$/.test(item.id)||ids.has(item.id))throw new Error("Invalid/duplicate rubric-event id "+item.id);
    ids.add(item.id);
    if(cueNumber(item.cueId)==null)throw new Error(item.id+": invalid cue id");
    if(!Number.isInteger(item.order)||item.order<1)throw new Error(item.id+": invalid order");
    if(!ACTORS.has(item.actor))throw new Error(item.id+": invalid actor "+item.actor);
    if(!KINDS.has(item.kind))throw new Error(item.id+": invalid kind "+item.kind);
    if(!item.label)throw new Error(item.id+": label missing");
    if(!item.sources.length||item.sources.some(id=>!sourceIds.has(id)))throw new Error(item.id+": unresolved source");
    if(item.authorityClass.startsWith("1962_")&&!item.sources.includes("MR62_RITUS"))throw new Error(item.id+": 1962 authority without MR62 source");
    if(item.kind==="STATE"&&!item.stateKey)throw new Error(item.id+": stateKey required");
    if(item.endCueId&&cueNumber(item.endCueId)==null)throw new Error(item.id+": invalid end cue");
    if(item.displayPrimary&&item.actor==="PRIEST"&&item.kind!=="STATE"){
      if(primaryByCue.has(item.cueId))throw new Error(item.cueId+": multiple primary priest rubric events");
      primaryByCue.set(item.cueId,item.id);
    }
  }

  return Object.freeze({
    schema:data.schema,
    version:String(data.version??""),
    itemCount:items.length,
    sourceCount:sourceIds.size,
    primaryPriestCueCount:primaryByCue.size,
    items:Object.freeze(items),
  });
}

function eventMap(items){
  const map=new Map();
  for(const item of items){
    const list=map.get(item.cueId)??[];
    list.push(item);
    map.set(item.cueId,list);
  }
  for(const [cueId,list] of map)map.set(cueId,Object.freeze([...list].sort((a,b)=>a.order-b.order)));
  return map;
}

function activeStateMap(items,cueId){
  const current=cueNumber(cueId);
  if(current==null)return Object.freeze({});
  const out=new Map();
  const stateEvents=items
    .filter(item=>item.kind==="STATE"&&cueNumber(item.cueId)<=current)
    .sort((a,b)=>cueNumber(a.cueId)-cueNumber(b.cueId)||a.order-b.order);
  for(const item of stateEvents){
    const end=item.endCueId?cueNumber(item.endCueId):null;
    if(end!=null&&current>end)continue;
    if(item.stateValue===false)out.delete(item.stateKey);
    else out.set(item.stateKey,Object.freeze({
      key:item.stateKey,
      value:item.stateValue,
      owner:"R17_RUBRIC_EVENT_OVERLAY",
      sourceEventId:item.id,
      cueId:item.cueId,
      endCueId:item.endCueId,
      authorityClass:item.authorityClass,
    }));
  }
  return Object.freeze(Object.fromEntries(out));
}

function displayAction(item){
  if(!item)return null;
  return Object.freeze({
    label:item.label,
    action:item.label,
    iconKey:item.iconKey,
    trigger:item.triggerLat,
    cueId:item.cueId,
    sourceEventId:item.id,
    authorityClass:item.authorityClass,
    sources:item.sources,
    campionPages:item.campionPages,
    owner:"R17_RUBRIC_EVENT_OVERLAY",
    transient:true,
  });
}

export function createReaderRubricEventController({data=null}={}){
  if(!data)return Object.freeze({
    schema:"ao-reader-rubric-event-controller-v1",
    supported:false,
    reason:"RUBRIC_EVENT_OVERLAY_NOT_LOADED",
    audit:null,
    project:cueId=>Object.freeze({
      supported:false,
      reason:"RUBRIC_EVENT_OVERLAY_NOT_LOADED",
      cueId:cueId??null,
      events:Object.freeze([]),
      activeStates:Object.freeze({}),
      primaryPriestAction:null,
    }),
  });

  const audit=validateReaderRubricEvents(data);
  const byCue=eventMap(audit.items);
  function project(cueId){
    const id=String(cueId??"");
    if(cueNumber(id)==null)return Object.freeze({
      supported:true,
      reason:id?"UNKNOWN_OR_SYNTHETIC_CUE":null,
      cueId:id||null,
      events:Object.freeze([]),
      activeStates:Object.freeze({}),
      primaryPriestAction:null,
    });
    const events=byCue.get(id)??Object.freeze([]);
    const primary=events.find(item=>item.actor==="PRIEST"&&item.displayPrimary&&item.kind!=="STATE")??null;
    return Object.freeze({
      supported:true,
      reason:null,
      cueId:id,
      events,
      activeStates:activeStateMap(audit.items,id),
      primaryPriestAction:displayAction(primary),
    });
  }
  return Object.freeze({
    schema:"ao-reader-rubric-event-controller-v1",
    supported:true,
    reason:null,
    audit,
    project,
  });
}
