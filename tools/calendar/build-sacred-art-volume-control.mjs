#!/usr/bin/env node
/** Whole-program batch control, not a publication or artwork approval pipeline.
 * Converts one 451-artwork source ledger + 76 research records + 77 P0 dates
 * into five 100-work packets and one report. No network or image downloads.
 */
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join} from "node:path";
import {sourceGate} from "./acquire-sacred-art-bulk.mjs";
const root=new URL("../../",import.meta.url);
const read=p=>JSON.parse(readFileSync(new URL(p,root),"utf8"));
const intake=read("data/research/sacred-art-bulk-source-intake-451-20261020.v1.json");
const research=read("data/research/sacred-art-open-source-recovery-76-20261020.v1.json");
const latest=read("data/research/sacred-art-class-i-53-current-date-decisions-overlay-20261020.v1.json");
const p0=read("data/research/sacred-art-p0-77-calendar-lock-reconciliation-20261020.v1.json");
const media=read("data/calendar/sacred-art-certified-media.v1.json");
assert.equal(intake.works.length,451);
assert.equal(research.records.length,76);
assert.equal(latest.records.length,53);
assert.equal(p0.records.length,77);
assert.deepEqual(media.media,[],"Source tracking may not claim production releases");
const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const p0Index=new Map();
for(const row of p0.records){
 if(row.rank==="I")continue;
 for(const id of [...(row.oldAudit?.artworkIds||[]),...(row.stricterEditorial?.primaryArtworkIds||[])]){
  if(!p0Index.has(id))p0Index.set(id,new Set());
  p0Index.get(id).add(row.date);
 }
}
const classIKey=new Map();
for(const day of latest.records){
 const key=norm(day.selectedArtwork.title)+"|"+norm(day.selectedArtwork.artist);
 if(!classIKey.has(key))classIKey.set(key,new Set());
 classIKey.get(key).add(day.date);
 for(const id of day.catalogReview.possibleOriginalKeys.map(x=>x.artworkId)){
  if(!p0Index.has(id))p0Index.set(id,new Set());
  p0Index.get(id).add(day.date);
 }
}
const recoverById=new Map(research.records.map(x=>[x.artworkId,x]));
const rank={SOURCE_ACQUIRE_BATCH:0,RESEARCH_SOURCE_BATCH:1,ACCEPTED_NO_DIRECT_SOURCE:2,
 HOLD_PRADO:3,HOLD_CURATOR:4,HOLD_EXCLUDED:5,HOLD_CANONICAL_ALIAS:6};
const records=intake.works.map((x,index)=>{
 const gate=sourceGate(x),task=recoverById.get(x.id);
 const lane=["MET","COMMONS","CLEVELAND","HOLD_NGA_DEDICATED_BATCH"].includes(gate)?"SOURCE_ACQUIRE_BATCH":
  gate==="HOLD_PRADO_SOURCE_POLICY"?"HOLD_PRADO":
  gate==="HOLD_REJECTED"?"HOLD_EXCLUDED":
  gate==="HOLD_NOT_APPROVED"?"HOLD_CURATOR":
  gate==="HOLD_CANONICAL_ALIAS_REUSE"?"HOLD_CANONICAL_ALIAS":
  task?"RESEARCH_SOURCE_BATCH":"ACCEPTED_NO_DIRECT_SOURCE";
 const lookupKey=norm(x.title)+"|"+norm(x.artist);
 const dates=[...new Set([...(p0Index.get(x.id)||[]),...(classIKey.get(lookupKey)||[])])].sort();
 return {artworkId:x.id,title:x.title,artist:x.artist,originalCatalogueIndex:index,
  lane,provider:x.provider,sourceGate:gate,sourceObjectPage:x.sourceObjectUrl||null,
  sourcePage:x.sourceUrl||null,
  historicArtworkRatingOrChoiceFrozen:true,productionImageCertified:false,
  inSourceResearch76:!!task,recoveryLane:task?.lane||null,
  p0DatePossibleLinks:dates,exactPhysicalObjectJoinCertified:false};
}).sort((a,b)=>rank[a.lane]-rank[b.lane]||
  (b.p0DatePossibleLinks.length>0)-(a.p0DatePossibleLinks.length>0)||
  a.artworkId.localeCompare(b.artworkId));
assert.equal(new Set(records.map(x=>x.artworkId)).size,451);
assert(records.every(x=>!x.productionImageCertified&&!x.exactPhysicalObjectJoinCertified));
const packets=Array.from({length:Math.ceil(records.length/100)},(_,i)=>{
 const items=records.slice(i*100,(i+1)*100);
 const counts={};for(const x of items)counts[x.lane]=(counts[x.lane]||0)+1;
 return {packetNumber:i+1,count:items.length,sourceLaneCounts:counts,records:items};
});
assert.deepEqual(packets.map(x=>x.count),[100,100,100,100,51]);
const lanes={};for(const x of records)lanes[x.lane]=(lanes[x.lane]||0)+1;
assert.equal(lanes.SOURCE_ACQUIRE_BATCH,103);
assert.equal(lanes.HOLD_PRADO,31);
assert.equal(lanes.HOLD_EXCLUDED,68);
const outDir=process.argv[2]||"artifacts/sacred-art-volume-control";
mkdirSync(outDir,{recursive:true});
const output={schema:"AO_SACRED_ART_HIGH_VOLUME_CONTROL_V1",asOf:"2026-10-20",
 counts:{catalogueWorks:451,packets:5,packetSize:100,sourceReadyInExistingPipeline:103,
  existingPhotoTechnicalQA:96,nonFlaggedPhotoTechnicalQA:64,
  existingSourceResearch:76,classIDateSelections:53,
  classIDatesWithoutObjectUrl:latest.records.filter(x=>!x.sourceObject.url).length,
  majorClassIIStrictMatches:13,majorClassIIPending:11,
  studioPublicationsApproved:0,byLane:lanes},
 policy:{sourceAndResearchCountsOverlap:true, photoQA96IsLatestCompletedPriorRunNotNewPublication:true,
  noAutomaticArtworkSelection:true,noPradoImagesOrMirrors:true,
  noPermissionRequests:true,noPaidLicences:true,
  doNotAutoPromotePhotoWithoutIdentityRightsAndPhoneQA:true},
 packets};
writeFileSync(join(outDir,"bulk-control-451.json"),JSON.stringify(output,null,2)+"\n");
const csv=s=>'"'+String(s??"").replace(/"/g,'""')+'"';
writeFileSync(join(outDir,"bulk-control-451.csv"),
 ["packet,artworkId,title,artist,lane,sourceGate,recoveryLane,possibleP0DateLinks,sourcePage"].concat(
 packets.flatMap(x=>x.records.map(r=>[x.packetNumber,r.artworkId,r.title,r.artist,r.lane,r.sourceGate,
  r.recoveryLane||"",r.p0DatePossibleLinks.join(";"),r.sourcePage||""].map(csv).join(",")))).join("\n")+"\n");
const e=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rows=packets.flatMap(p=>p.records.map(x=>"<tr><td>"+p.packetNumber+"</td><td>"+e(x.title)+
 "</td><td>"+e(x.artist)+"</td><td>"+e(x.lane)+"</td><td>"+
 e(x.p0DatePossibleLinks.join("; "))+"</td><td>"+(x.sourcePage?'<a href="'+e(x.sourcePage)+'">Source</a>':"—")+"</td></tr>")).join("");
const page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · 451 artwork batches</title>'+
 '<style>body{background:#090d13;color:#e2ded4;font:14px Georgia;margin:25px}p{color:#bcb6ad}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #43464b;padding:9px;text-align:left}th{position:sticky;top:0;background:#141e2a}a{color:#aecbdd}</style>'+
 '<h1>451 artworks · five 100-work source and curation packets</h1><p>Bulk technical source processing for 103 qualifying routes, 76 separate discovery records, and current Class I / major Class II priority links. The research populations overlap. No artwork approval or photographic certification is implied.</p>'+
 '<p>Source-acquisition shards: ten × 50 with five concurrent. Recovery discovery: 50 + 26 concurrently. Manual review only for exact painting, image rights, quality exceptions, mobile crop and unresolved specific feast association.</p><table><thead><tr><th>Wave</th><th>Artwork</th><th>Artist</th><th>Work lane</th><th>P0 candidate dates</th><th>Source</th></tr></thead><tbody>'+rows+'</tbody></table></html>';
writeFileSync(join(outDir,"bulk-control-451.html"),page);
console.log(JSON.stringify(output.counts));
