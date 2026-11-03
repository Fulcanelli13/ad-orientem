/**
 * Production gate for 11 original owner-assigned 2026 artworks.
 * This reads the actual 53-date editorial source and rejects any changed
 * painter, physical painting, principal, mass Proper or public image identity.
 * It DOES NOT claim native bytes, frameless crop or offline release approvals.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {
 APPROVED_2026_OTHER_DATE_PREVIEWS,extraApproved2026HomeArtwork
} from "../src/home/approved-2026-other-date-previews.js";
import {approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";
import {APPROVED_CLASS_I_2026} from "../src/calendar/approved-class-i-heroes-2026.js";
const source=JSON.parse(readFileSync(new URL("../data/artwork/2026-prior-date-artwork-evidence.v1.json",import.meta.url),"utf8"));
const rows=Object.values(APPROVED_2026_OTHER_DATE_PREVIEWS);
assert.equal(source.days.length,365);
assert.equal(rows.length,11,"Only the 11 exact frozen date-image releases belong here");
assert.equal(new Set(rows.map(x=>x.date)).size,11);
assert.ok(!rows.some(x=>APPROVED_CLASS_I_2026.some(c=>c.date===x.date)));
const canonicalizeArtist=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/gi,"").toLowerCase();
for(const row of rows){
 const editorial=source.days.find(x=>x.date===row.date);
 assert.ok(editorial?.selection,"An unpublished source lead cannot become an approved image "+row.date);
 assert.equal(row.principalId,editorial.principalId);
 assert.equal(row.title,editorial.selection.title,"Exact selected painting title changed "+row.date);
 assert.equal(canonicalizeArtist(row.artist),canonicalizeArtist(editorial.selection.artist),
  "Exact approved painter changed "+row.date);
 assert.equal(row.editorialBasis,editorial.selection.editorialBasis);
 if(editorial.selection.artworkId){
  assert.equal(row.artworkId,editorial.selection.artworkId);
  assert.equal(row.workIdIsDateSelectionOnly,false);
 }else{
  assert.equal(row.artworkId,"frozen-date:"+row.date);
  assert.equal(row.workIdIsDateSelectionOnly,true);
 }
 assert.match(row.properPath,/^(Sancti|Tempora)\//);
 assert.ok(row.collectionIdentity&&row.file&&row.rightsTier);
 assert.ok(["MET_CC0","CMA_CC0","COMMONS_PD_ART"].includes(row.rightsTier));
 const hash=createHash("md5").update(row.file.replaceAll(" ","_")).digest("hex");
 assert.equal(row.storagePrefix,hash.slice(0,2),"Commons physical file bucket mismatch");
 const chosen=extraApproved2026HomeArtwork(row.date,row.principalId,row.properPath);
 assert.ok(chosen,"Missing named source for "+row.date);
 assert.equal(chosen.title,row.title);
 assert.equal(chosen.artist,row.artist);
 assert.equal(chosen.artworkId,row.artworkId);
 assert.equal(chosen.imageStatus,"REMOTE_APPROVED_EXACT_WORK_PREVIEW_NOT_OFFLINE_CERTIFIED");
 assert.equal(chosen.selectionKind,"PREVIOUSLY_APPROVED_FROZEN_DATE_EXACT_WORK_PREVIEW");
 assert.match(chosen.image,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\//);
 assert.match(chosen.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.ok(chosen.rights);
 assert.equal(extraApproved2026HomeArtwork(row.date,"wrong-id",row.properPath),null);
 assert.equal(extraApproved2026HomeArtwork(row.date,row.principalId,row.properPath+"-wrong"),null);
 const state={
  route:"home",selectedDate:row.date,resolving:false,
  resolution:{date:row.date,status:"ready",day:{main:{id:row.principalId}},
   proper:{status:"ready",sourcePath:row.properPath,data:{sourcePath:row.properPath}}}
 };
 const hero=approved2026HomeArtwork(state);
 assert.equal(hero?.artworkId,row.artworkId);
 assert.equal(hero?.image,chosen.image);
 const missing={...state,resolution:{...state.resolution,date:"2026-02-01"}};
 assert.equal(approved2026HomeArtwork(missing),null);
 const wrong={...state,resolution:{...state.resolution,day:{main:{id:"sancti:wrong"}}}};
 assert.equal(approved2026HomeArtwork(wrong),null);
 const incomplete={...state,resolution:{...state.resolution,proper:{status:"loading"}}};
 assert.equal(approved2026HomeArtwork(incomplete),null);
}
for(const mass of [1,2,3]){
 const art=extraApproved2026HomeArtwork("2026-12-25",
  "sancti:12-25m"+mass+":1:w","Sancti/12-25m"+mass);
 assert.equal(art?.title,"Adoration of the Shepherds");
 assert.equal(art?.artworkId,"cma-143644");
}
assert.equal(extraApproved2026HomeArtwork("2026-12-25",
 "sancti:12-25m4:1:w","Sancti/12-25m4"),null);
assert.equal(extraApproved2026HomeArtwork("2026-12-25",
 "sancti:12-25m2:1:w","Sancti/12-25m4"),null);
const exactObjectExamples={
 "2026-04-01":"1997.167",
 "2026-05-14":"21.84",
 "2026-05-31":"1960.79",
 "2026-06-29":"2023.389",
 "2026-12-08":"1959.189",
 "2026-12-25":"1968.100"
};
for(const [date,accession] of Object.entries(exactObjectExamples)){
 assert.ok(APPROVED_2026_OTHER_DATE_PREVIEWS[date].collectionIdentity.includes(accession));
}
const thursday=APPROVED_CLASS_I_2026.find(x=>x.date==="2026-04-02");
const may27=APPROVED_CLASS_I_2026.find(x=>x.date==="2026-05-27");
assert.equal(thursday.artworkId,may27.artworkId);
assert.equal(thursday.image,may27.image);
assert.equal(thursday.editorialApproval,"LATER_USER_EXPRESSED_STRONG_PREFERENCE_20261030");
assert.match(thursday.image,/Champaigne_Petite_C/);
for(const held of ["2026-10-25","2026-11-29"]){
 const r=APPROVED_CLASS_I_2026.find(x=>x.date===held);
 assert.equal(r.image,null,"Held high feast must never be unheld by bulk previews");
 assert.equal(APPROVED_2026_OTHER_DATE_PREVIEWS[held],undefined);
}
console.log("PASS "+rows.length+" exact frozen-date originals, 53-date provenance, PDF rights distinctions, updated Holy Thursday; 2 held feasts preserved");
