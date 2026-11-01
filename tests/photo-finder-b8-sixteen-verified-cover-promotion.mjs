import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const record=read("data/geography/research/photo-finder-20261030/releases/b8-main-promotion-20261101.v1.json");
const source=read("data/geography/research/photo-finder-20261030/releases/b8-verification-report.json");
const approved=read("data/geography/approved-place-media.v1.json");
const decisions=read("data/geography/research/photo-finder-20261030/decisions.json");
assert.equal(record.schema,"AO_PHOTO_FINDER_B8_EXISTING_VERIFIED_ORIGINALS_TO_MAIN_V1");
assert.deepEqual([record.planned,record.source_verified,record.held,record.promoted],[20,16,4,16]);
assert.equal(record.source_commit,"2d9a2b5a92b7ec435656fed901b908d29d3a49db");
assert.equal(source.media_records.length,16);
assert.equal(source.exceptions.length,4);
assert.ok(approved.items.length>=168);
assert.equal(new Set(approved.items.map(x=>x.place_id)).size,approved.items.length);
const map=new Map(approved.items.map(x=>[x.place_id,x]));
for(const item of record.images){
 const m=map.get(item.place_id);
 assert.ok(m,"B8 source-verified selected cover omitted from app registry: "+item.place_id);
 assert.equal(m.asset_path,item.asset_path);
 assert.equal(m.source_sha1,item.source_sha1);
 assert.equal(m.derivative_sha256,item.derivative_sha256);
 assert.equal(m.license,item.license);assert.equal(m.credit,item.credit);
 assert.ok(m.status==="APPROVED"&&m.rights_verified&&m.subject_verified&&m.crop_reviewed);
 const original=source.media_records.find(r=>r.item.place_id===item.place_id);
 assert.deepEqual(m,original.item,"No edit to B8 verified asset record");
 const rank1=decisions.decisions[item.place_id]?.files?.[0];
 assert.equal(decodeURIComponent(m.source_url.replace("https://commons.wikimedia.org/wiki/","")).replaceAll("_"," "),rank1);
 const bytes=readFileSync(new URL("../"+m.asset_path,import.meta.url));
 assert.equal(createHash("sha256").update(bytes).digest("hex"),m.derivative_sha256,"Exact byte transfer from B8 source branch required");
}
for(const held of record.held_candidates){
 assert.ok(!record.images.some(x=>x.place_id===held.place_id),"Held source cannot be auto-promoted");
}
assert.equal(record.no_new_user_editorial_selection,true);
assert.equal(record.no_new_photo_search,true);
console.log("PASS 16 rank-1 user-selected B8 Place photos copied byte-identically; four source holds preserved");
