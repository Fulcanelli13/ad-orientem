#!/usr/bin/env node
/**
 * Merge both 50/26 Commons discovery shards into ONE 76-artwork exceptions queue.
 * Sources are candidates, not identified originals or licensed production photos.
 * Never writes approved-media registries or acquires files.
 */
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const input=process.argv[2]||"artifacts/qa-discovery-76";
const output=process.argv[3]||"artifacts/qa-discovery-merged";
const root="sacred-art-76-open-source-discovery-";
const load=n=>JSON.parse(readFileSync(join(input,root+n,"results.json"),"utf8"));
const entries=[load(0),load(1)];
assert.deepEqual(entries.map(x=>x.shard),[0,1],"Both discovery shards must be present");
assert.deepEqual(entries.map(x=>x.records.length),[50,26],"Incomplete 76-work discovery");
for(const e of entries)assert(e.pradoCandidatesAccepted===0&&e.productionReleased===0,"Unauthorized source release");
const records=entries.flatMap(x=>x.records);
assert.equal(new Set(records.map(x=>x.artworkId)).size,76,"Missing or repeated artwork");
const sortKey=x=>x.discoveryStatus==="POTENTIAL_OPEN_LICENCE_MATCHES_FOR_QA"?0:
  x.discoveryStatus==="SOURCE_ALREADY_IDENTIFIED_FOR_IMAGE_QA"?1:
  x.discoveryStatus==="HOLD_REQUEST_ERROR"?2:
  x.discoveryStatus==="HOLD_NO_EXACT_OPEN_CANDIDATE"?3:
  x.discoveryStatus==="HOLD_PRADO_SOURCE_POLICY"?4:5;
records.sort((a,b)=>sortKey(a)-sortKey(b)||a.artworkId.localeCompare(b.artworkId));
for(const x of records){
 assert(x.productionCertified===false&&x.approvedArtworkIntact===true,"Automated release or choice mutation");
 for(const c of x.candidates||[]){
  assert(c.productionEligible===false&&c.originalPhysicalIdentityConfirmed===false,
    "Discovery cannot certify original or publication");
  assert(!/(museodelprado|prado)/i.test(c.filePage||""),"Prado source in candidate");
 }
}
const counts={};
for(const x of records)counts[x.discoveryStatus]=(counts[x.discoveryStatus]||0)+1;
const totalCandidates=records.reduce((n,x)=>n+(x.candidates||[]).length,0);
const result={schema:"AO_SACRED_ART_76_MERGED_DISCOVERY_REVIEW_V1",
 asOf:"2026-10-20",sourceShards:[0,1],
 counts:{works:records.length,eligibleFileCandidates:totalCandidates,byStatus:counts,
  editorialRatingsChanged:0,productionCertified:0},
 policy:{neverPublishAutomatically:true,photoLicensesNotIndependentlyCertified:true,
  paintingIdentityNotVerifiedBySearch:true,noPradoOrMirrors:true,
  noPaidLicensesOrPermissions:true},records};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"discovery-76-ranked.json"),JSON.stringify(result,null,2)+"\n");
const q=v=>'"'+String(v??"").replace(/"/g,'""')+'"';
const csv=["priority,artworkId,title,artist,status,candidateCount,sourcePage,photoLicenseClaim,requiresObjectMatch"];
for(const x of records){
 const first=(x.candidates||[])[0];
 csv.push([sortKey(x),x.artworkId,x.title,x.artist,x.discoveryStatus,
  (x.candidates||[]).length,first?.filePage||"",first?.photoRightsDeclared||"",
  "YES"].map(q).join(","));
}
writeFileSync(join(output,"discovery-76-ranked.csv"),csv.join("\n")+"\n");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cards=records.map(x=>'<tr><td>'+sortKey(x)+'</td><td>'+esc(x.title)+
 '</td><td>'+esc(x.artist)+'</td><td>'+esc(x.discoveryStatus)+
 '</td><td>'+String((x.candidates||[]).length)+'</td><td>'+
 (x.candidates||[]).map(c=>'<div><a href="'+esc(c.filePage)+'">'+esc(c.commonsTitle||"Source")+
 '</a> · '+esc(c.photoRightsDeclared)+' · '+esc(c.image?.width)+"×"+esc(c.image?.height)+
 ' · <strong>identity unverified</strong></div>').join("")+'</td></tr>').join("");
const page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Ad Orientem · 76 source candidates</title>'+
 '<style>body{background:#090d13;color:#e7e0d3;font:14px/1.5 Georgia;margin:25px}p{color:#b7afa2}table{border-collapse:collapse;width:100%}th,td{border-bottom:1px solid #464749;padding:9px;text-align:left;vertical-align:top}a{color:#baccda}th{position:sticky;top:0;background:#18202a}</style>'+
 '<h1>76 paintings · one consolidated source-discovery review</h1><p>'+records.length+
 ' research records; '+totalCandidates+' candidate source files. No photo is certified or publishable. Prado sources remain excluded.</p>'+
 '<table><thead><tr><th>Priority</th><th>Painting</th><th>Artist</th><th>Disposition</th><th>Source leads</th><th>Source and rights evidence</th></tr></thead><tbody>'+cards+'</tbody></table></html>';
writeFileSync(join(output,"discovery-76-ranked.html"),page);
console.log(JSON.stringify(result.counts));
