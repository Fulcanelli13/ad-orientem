// Rule-based Explore checks.
//
// These replace frozen totals ("257 shrine pins", "38 customs", "31 photos").
// A frozen total breaks every time a properly sourced record is added, which
// forces the test to be edited, and an edited-to-pass test stops protecting
// anything. Each rule below instead states *why* a record may be published and
// checks that property on every record, so:
//   - adding a correctly sourced record keeps the suite green with no test edit;
//   - a record that lacks provenance, a licence, a file or a canonical Place
//     fails with a message naming that exact record.
// The rules re-derive expectations from the raw seed files, never from the
// projection under test, so a projection that drops or duplicates records fails.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolveApprovedPlaceMedia } from "../../src/find/place-profiles.js";

const arr=value=>Array.isArray(value)?value:[];
const httpsUrl=value=>/^https?:\/\/\S+$/.test(String(value??""));

// Every input record appears exactly once in its lens, and nothing else does.
export function assertLossless(label,items,inputIds){
  const ids=arr(items).map(item=>item.source_id);
  const dupes=ids.filter((id,i)=>ids.indexOf(id)!==i);
  assert.deepEqual(dupes,[],label+": projected the same source record twice");
  const expected=new Set(inputIds);
  const missing=[...expected].filter(id=>!ids.includes(id));
  const invented=ids.filter(id=>!expected.has(id));
  assert.deepEqual(missing,[],label+": source records silently dropped");
  assert.deepEqual(invented,[],label+": projected records with no source row");
}

// A map pin is publishable only if its coordinates are the canonical Place's
// coordinates and the record behind it cites at least one clickable source.
export function assertPinsAreCanonicalAndSourced(label,items,places,{requireSource=true}={}){
  const placeMap=new Map(arr(places).map(place=>[place.place_id,place]));
  const problems=[];
  for(const item of arr(items).filter(item=>item.map_publishable)){
    const place=placeMap.get(item.place_id);
    if(!place){problems.push(item.source_id+": pin has no canonical Place");continue;}
    if(item.geo?.lat!==Number(place.geo?.lat)||item.geo?.lng!==Number(place.geo?.lng))
      problems.push(item.source_id+": pin moved away from canonical Place coordinates");
    if(requireSource&&!arr(item.source_links).some(link=>httpsUrl(link.url)))
      problems.push(item.source_id+": pin published without a clickable source");
  }
  assert.deepEqual(problems,[],label+": map pins must be canonical and sourced");
}

// The pin gate is applied consistently in both directions: every record whose
// canonical Place passes the gate is mapped, and no other record is.
export function assertGateConsistent(label,items,places,gate){
  const placeMap=new Map(arr(places).map(place=>[place.place_id,place]));
  const wrong=arr(items).filter(item=>{
    const place=placeMap.get(item.place_id);
    const eligible=Boolean(place)&&gate(place.geo,place?.address?.country_code);
    return eligible!==Boolean(item.map_publishable);
  }).map(item=>item.source_id+(item.map_publishable?" mapped without passing":" passes but was not mapped"));
  assert.deepEqual(wrong,[],label+": map pin gate applied inconsistently");
}

// Every approved photograph passes the publication gate, belongs to a known
// Place, is the exact file that was reviewed (checksum) and has the recorded
// pixel size. A photo count cannot detect a swapped or missing file; this can.
export function assertApprovedMedia(registry,places,{root="."}={}){
  const placeIds=new Set(arr(places).map(place=>place.place_id));
  const seen=new Set();
  const problems=[];
  for(const item of arr(registry.items)){
    const id=item.place_id;
    if(seen.has(id))problems.push(id+": more than one approved photograph");
    seen.add(id);
    if(!placeIds.has(id))problems.push(id+": photograph for an unknown Place");
    if(!resolveApprovedPlaceMedia([item],id))problems.push(id+": fails licence/rights/alt-text publication gate");
    const file=root+"/"+item.asset_path;
    if(!existsSync(file)){problems.push(id+": approved file missing on disk ("+item.asset_path+")");continue;}
    const bytes=readFileSync(file);
    if(item.derivative_sha256&&createHash("sha256").update(bytes).digest("hex")!==item.derivative_sha256)
      problems.push(id+": file differs from the reviewed image (checksum)");
    const size=webpSize(bytes);
    if(size&&(size.width!==item.width||size.height!==item.height))
      problems.push(id+": recorded "+item.width+"x"+item.height+" but file is "+size.width+"x"+size.height);
  }
  assert.deepEqual(problems,[],"approved place media must be verifiable");
}

function webpSize(bytes){
  if(bytes.toString("ascii",0,4)!=="RIFF"||bytes.toString("ascii",8,12)!=="WEBP")return null;
  const chunk=bytes.toString("ascii",12,16);
  if(chunk==="VP8X")return {width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3)};
  if(chunk==="VP8 ")return {width:bytes.readUInt16LE(26)&0x3fff,height:bytes.readUInt16LE(28)&0x3fff};
  if(chunk==="VP8L"){const bits=bytes.readUInt32LE(21);return {width:(bits&0x3fff)+1,height:((bits>>14)&0x3fff)+1};}
  return null;
}
