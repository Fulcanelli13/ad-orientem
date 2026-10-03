// R17 reader event-state projection.
// This module may use the legacy runtime ONLY as a locator for current canonical MC-* identity.
// State values themselves come from modular R17 event data. Unsourced channels fail closed.

import { resolveMomentState } from "./reader-state.js";

export const READER_EVENT_FILES=Object.freeze([
  "mc-events-01.v1.json","mc-events-02.v1.json","mc-events-03.v1.json",
  "mc-events-04.v1.json","mc-events-05.v1.json","mc-events-06.v1.json",
]);

const RESPONSE_ACTORS=new Set(["LITURGICAL_RESPONDERS","SERVERS","FAITHFUL"]);
const INCARNATUS_EVENTS=new Set(["MC-CRD-025","MC-CRD-045"]);

function eventUrl(file,baseUrl){
  return new URL("../../data/mass/"+file,baseUrl);
}

async function readJson(fetchImpl,url){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load canonical Mass events ("+(response?.status??"network")+")");
  return response.json();
}

export async function loadCanonicalReaderEvents({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloads=await Promise.all(READER_EVENT_FILES.map(file=>readJson(fetchImpl,eventUrl(file,baseUrl))));
  const events=payloads.flatMap(payload=>payload?.events??[]);
  const seen=new Set();
  for(const event of events){
    if(!event?.id || !/^MC-[A-Z0-9-]+$/.test(event.id))throw new Error("Invalid canonical event identity");
    if(seen.has(event.id))throw new Error("Duplicate canonical event "+event.id);
    seen.add(event.id);
  }
  return Object.freeze(events.map(event=>Object.freeze({...event})));
}

export function buildCanonicalEventIndex(events){
  if(!Array.isArray(events))throw new TypeError("Canonical event array required");
  const index=new Map();
  for(const event of events){
    if(!event?.id)throw new Error("Canonical event missing id");
    if(index.has(event.id))throw new Error("Duplicate canonical event "+event.id);
    index.set(event.id,event);
  }
  return index;
}

function speechValue(event){
  return event?.voice?.speechAudibility ?? event?.voice?.audibility ?? null;
}

function voiceLabel(value){
  const raw=String(value??"").toUpperCase();
  return ({
    NONE:"SILENT",
    SILENT_ACTION:"SILENT",
    EFFECTIVELY_INAUDIBLE:"SILENT",
    LOW_VOICE:"LOW VOICE",
    SPOKEN_AUDIBLE:"AUDIBLE",
    SUNG:"SUNG",
    ELEVATED_VOICE:"ELEVATED VOICE",
    MIXED:"MIXED",
  })[raw] ?? raw.replaceAll("_"," ");
}

export function projectNativeEventChannels(event){
  if(!event?.id)throw new TypeError("Canonical event required");

  const priestVoice=event.actor==="PRIEST" && speechValue(event)
    ? Object.freeze({
        label:voiceLabel(speechValue(event)),
        value:String(speechValue(event)).toUpperCase(),
        owner:"R17_CANONICAL_EVENT",
        canonicalEventId:event.id,
      })
    : null;

  const response=RESPONSE_ACTORS.has(String(event.actor??"").toUpperCase())
      && event.contentRef
      && !["NONE","SILENT_ACTION"].includes(String(speechValue(event)??"").toUpperCase())
    ? Object.freeze({
        label:"RESPOND",
        contentRef:event.contentRef,
        eventTitle:event.title??null,
        owner:"R17_CANONICAL_EVENT",
        canonicalEventId:event.id,
        transient:true,
      })
    : null;

  let gesture=null;
  if(INCARNATUS_EVENTS.has(event.id)){
    const guarded=resolveMomentState({
      id:"INCARNATUS",
      semantic:"INCARNATUS",
      posture:null,
      gesture:null,
    });
    gesture=Object.freeze({
      label:"GENUFLECT",
      type:guarded.gesture?.type??"GENUFLECT",
      transient:true,
      owner:"R17_CERTIFIED_E21",
      canonicalEventId:event.id,
    });
  }

  return Object.freeze({
    canonicalEventId:event.id,
    priestVoice,
    response,
    gesture,
    // These two channels are intentionally not inferred from title/phase heuristics.
    posture:null,
    priestPosition:null,
    ownership:Object.freeze({
      priestVoice:priestVoice ? "R17_NATIVE" : "LEGACY_FALLBACK",
      response:response ? "R17_NATIVE" : "LEGACY_FALLBACK",
      gesture:gesture ? "R17_NATIVE" : "LEGACY_FALLBACK",
      posture:"LEGACY_PENDING_SOURCE_EXTRACTION",
      priestPosition:"LEGACY_PENDING_SOURCE_EXTRACTION",
    }),
    provenance:Object.freeze({
      sourceMomentRefs:Object.freeze([...(event.sourceMomentRefs??[])]),
      eventActor:event.actor??null,
      eventVoice:event.voice??null,
      contentRef:event.contentRef??null,
    }),
  });
}

export function createNativeEventStateController(events){
  const index=buildCanonicalEventIndex(events);
  let current=null;

  function project(eventId){
    if(!eventId)return null;
    const event=index.get(String(eventId));
    if(!event)return null;
    current=projectNativeEventChannels(event);
    return current;
  }

  return Object.freeze({
    project,
    get:()=>current,
    has:eventId=>index.has(String(eventId)),
    count:index.size,
  });
}

const EVENT_ID_KEYS=new Set(["canonicalEventId","currentEventId","eventId","activeEventId"]);

export function extractCanonicalEventId(input,{maxDepth=4}={}){
  const seen=new Set();
  function walk(value,depth,key=null){
    if(depth>maxDepth || value==null)return null;
    if(typeof value==="string"){
      const raw=value.trim();
      if(/^MC-[A-Z0-9-]+$/.test(raw) && (EVENT_ID_KEYS.has(key)||depth===0))return raw;
      return null;
    }
    if(typeof value!=="object" || seen.has(value))return null;
    seen.add(value);

    for(const k of EVENT_ID_KEYS){
      const hit=walk(value[k],depth+1,k);
      if(hit)return hit;
    }
    for(const k of ["current","active","event","cursor","state","reader","runtime"]){
      const hit=walk(value[k],depth+1,k);
      if(hit)return hit;
    }
    return null;
  }
  return walk(input,0,null);
}
