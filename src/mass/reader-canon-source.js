export const CANON_SOURCE_SCHEMA="ao-reader-canon-source-map-v1";
export const CANON_SOURCE_FILE="reader-canon-source-map.v1.json";

function sourceUrl(baseUrl){return new URL("../../data/presentation/"+CANON_SOURCE_FILE,baseUrl);}

export async function loadCanonSourceMap({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const url=sourceUrl(baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load Canon source map ("+(response?.status??"network")+")");
  const data=await response.json();
  validateCanonSourceMap(data);
  return Object.freeze({data,url:String(url)});
}

function freezeSegment(raw){
  return Object.freeze({
    id:String(raw.id),
    sequence:Number(raw.sequence),
    title:String(raw.title),
    blockIds:Object.freeze([...(raw.blockIds??[])].map(String)),
    eventIds:Object.freeze([...(raw.eventIds??[])].map(String)),
    cueStart:String(raw.cueStart),
    cueEnd:String(raw.cueEnd),
  });
}

export function validateCanonSourceMap(map,{sungCorpus=null,sectionMap=null}={}){
  if(!map || typeof map!=="object")throw new TypeError("Canon source map required");
  if(map.schema!==CANON_SOURCE_SCHEMA)throw new Error("Unexpected Canon source-map schema");
  if(map.status!=="CERTIFIED_SOURCE_FIRST")throw new Error("Canon source map is not certified");
  if(map.authority!=="PRESENTATION_STRUCTURE_ONLY")throw new Error("Canon source map may not claim canonical text authority");
  if(map.invariants?.canonicalTextMutationAllowed!==false)throw new Error("Canon source map must forbid text mutation");
  if(!Array.isArray(map.segments) || map.segments.length!==14)throw new Error("Canon source map must contain 14 sourced prayer segments");

  const segments=map.segments.map(freezeSegment).sort((a,b)=>a.sequence-b.sequence);
  const ids=new Set(), blocks=new Set(), events=new Set();
  for(let i=0;i<segments.length;i++){
    const s=segments[i];
    if(s.sequence!==i+1)throw new Error("Canon segment sequence must be contiguous");
    if(!/^AO\.CANON\.\d{2}$/.test(s.id) || ids.has(s.id))throw new Error("Invalid/duplicate Canon segment id "+s.id);
    ids.add(s.id);
    if(s.blockIds.length!==1)throw new Error(s.id+": exactly one canonical prayer block required");
    for(const b of s.blockIds){
      if(blocks.has(b))throw new Error("Duplicate Canon block "+b);
      blocks.add(b);
    }
    for(const e of s.eventIds){
      if(events.has(e))throw new Error("Duplicate Canon event "+e);
      events.add(e);
    }
  }

  const expectedBlocks=Array.from({length:14},(_,i)=>"AO.SM.B"+String(47+i).padStart(3,"0"));
  if(JSON.stringify([...blocks])!==JSON.stringify(expectedBlocks))throw new Error("Canon block coverage must be exactly B047-B060");

  if(sungCorpus){
    const byBlock=new Map((sungCorpus.blocks??[]).map(b=>[b.Block_ID,b]));
    for(const s of segments){
      const block=byBlock.get(s.blockIds[0]);
      if(!block)throw new Error(s.id+": missing corpus block "+s.blockIds[0]);
      const cues=(block.units??[]).map(u=>u.cue_id);
      if(cues[0]!==s.cueStart || cues.at(-1)!==s.cueEnd)throw new Error(s.id+": cue range does not match canonical block");
    }
  }

  if(sectionMap){
    const canon=(sectionMap.ordinarySungSections??[]).filter(x=>Number(x.sequence)>=14 && Number(x.sequence)<=18);
    const expectedEvents=canon.flatMap(x=>x.eventIds??[]);
    if(JSON.stringify([...events])!==JSON.stringify(expectedEvents))throw new Error("Canon source map event coverage differs from canonical 14-18 section coverage");
  }

  const host=segments.find(s=>s.blockIds.includes("AO.SM.B052"));
  const chalice=segments.find(s=>s.blockIds.includes("AO.SM.B053"));
  if(host?.cueEnd!=="AO.SM.C0174")throw new Error("Host elevation cue gate changed");
  if(chalice?.cueEnd!=="AO.SM.C0181")throw new Error("Chalice elevation cue gate changed");

  return Object.freeze({
    status:map.status,
    segments:Object.freeze(segments),
    blockCount:blocks.size,
    eventCount:events.size,
    historical48Required:Boolean(map.historicalV183Compatibility?.requiredForRelease),
  });
}

export function createCanonSourceResolver(map,options={}){
  const audit=validateCanonSourceMap(map,options);
  const byCue=new Map();
  const byEvent=new Map();
  const cueNumber=id=>Number(String(id).match(/C(\d+)$/)?.[1]??NaN);
  for(const segment of audit.segments){
    for(const eventId of segment.eventIds)byEvent.set(eventId,segment);
    const start=cueNumber(segment.cueStart), end=cueNumber(segment.cueEnd);
    for(let n=start;n<=end;n++)byCue.set("AO.SM.C"+String(n).padStart(4,"0"),segment);
  }
  return Object.freeze({
    ...audit,
    segmentForCue:cueId=>byCue.get(String(cueId??""))??null,
    segmentForEvent:eventId=>byEvent.get(String(eventId??""))??null,
  });
}
