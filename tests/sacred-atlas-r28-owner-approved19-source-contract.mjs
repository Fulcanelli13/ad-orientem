import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const manifest=read("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const originals=read("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json");
const triage=read("data/geography/research/sacred-atlas-round26-existing21-cover-triage-20261104.v1.json");
const seed=read("data/geography/seed-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
assert.equal(manifest.schema,"AO_SACRED_ATLAS_R28_OWNER_APPROVED_19_EXACT_ORIGINALS_V1");
assert.equal(manifest.source_export_schema,"AO_SACRED_ATLAS_UNDECIDED66_USER_EDITORIAL_REVIEW_EXPORT_V1");
assert.equal(manifest.source_export_sha256,"8b04c4cc71a15aba4b326dc4af42ff29b2d8bba13c675b5d600bd59af200773a");
assert.equal(manifest.imported_export_timestamp,"2026-11-04T20:11:36.906Z");
assert.equal(manifest.publication,"FROZEN_OWNER_EDITORIAL_ONLY_NOT_YET_RIGHTS_OR_RELEASE_CLEARED");
assert.equal(seed.places.length,530);
assert.equal(covers.items.length,379);
assert.equal(gallery.items.length,42);
assert.equal(manifest.counts.approved_exact_source_preferences,19);
assert.equal(manifest.counts.place_holds,1);
assert.equal(manifest.counts.unreviewed_places,3);
assert.equal(manifest.counts.reviewed_places,20);
assert.equal(manifest.counts.total_places,23);
assert.equal(manifest.counts.rejected_alternative_files,3);
assert.equal(manifest.counts.cover_photos_published,0);
assert.equal(manifest.decisions.length,19);
assert.equal(manifest.unreviewed_places.length,3);
assert.equal(manifest.held_places.length,1);
assert.equal(new Set(manifest.decisions.map(x=>x.place_id)).size,19);
const old=new Map(originals.places.map(x=>[x.place_id,x]));
const tri=new Map(triage.rows.map(x=>[x.place_id,x]));
const approvedIds=new Set(covers.items.map(x=>x.place_id));
const selected=new Map(manifest.decisions.map(x=>[x.place_id,x]));
const expectedFromSubmittedExport=[
 ["place:PL:lichen-marian-basilica","8b0763b7f61a150002a67fb922ee73313ff866f4"],
 ["place:IT:duomo-sant-eusebio-vercelli","1e8136251bb5358a20aeff94d34ba37aabda9dd8"],
 ["place:LB:monastery-saint-maron-annaya","cbbc1453e184a199a83dc180d4cb4e9b4a8ea27b"],
 ["place:US:lourdes-grotto-emmitsburg","844f5fb1ad049a5453dc16510ef77945858cffcd"],
 ["place:US:la-salette-attleboro","d6c3d7b90a68559bac6ff19b78f65dd6d1af54de"],
 ["place:BR:fortaleza-fatima-sanctuary","74dd57d62b88145f4cf35bd6b1f701f7b0691e5b"],
 ["place:US:san-francisco-de-asis-ranchos-taos","d562a1a66e2bcd66d3ec53cf6e11f9c38fd5e48f"],
 ["place:BE:banneux","bacc80be857c1689ae1fca8d46346647b67a8532"],
 ["place:AU:penrose-park","8367d762e2a9efe784906b578e496581c3fe2388"],
 ["place:US:seton-emmitsburg","e31963c204e0ba5b02e7adfec023e8675b19ffbf"],
 ["place:DE:bettbrunn-st-salvator","3db0527ad91762278fc216ea2645bac93d98caf3"],
 ["place:MX:ocotlan-basilica-tlaxcala","3b47c02e363b29cc343dd093a684f0453c1fca36"],
 ["place:FR:basilique-saint-bernard-fontaine-les-dijon","ef3bc7801bed7968cfe5fa647d1ece3bf07188fe"],
 ["place:DE:friedhofskirche-st-michael-altoetting","2950c29a57538bb91cfdf42b1c949a3135d98481"],
 ["place:KR:haemi-martyrs-shrine-main-church","bea18eccc347cc5e12944f6b90799bfcf54f08e8"],
 ["place:PH:national-shrine-of-saint-joseph-mandaue","26216b5898aaeea361917b282c2ffdb1d8938306"],
 ["place:DE:basilika-st-clemens-hannover","fe0a6223ade25863bce9df55dbf91ddaae2e809a"],
 ["place:MX:guadalupe-zacatecas-historic-sanctuary","78bb4b950e86f494cb1416684675d4ba01681e13"],
 ["place:UY:montevideo-gruta-lourdes-national-shrine","7e9cca69029aba119a4ced44cb07e7c12e1b5027"]
];
for(const [id,hash] of expectedFromSubmittedExport)assert.equal(selected.get(id)?.original_sha1,hash,"Exact owner-approved SHA-1 changed for "+id);
for(const x of manifest.decisions){
 const p=old.get(x.place_id),t=tri.get(x.place_id);
 assert.ok(p&&t&&!approvedIds.has(x.place_id),"Must be uncovered canonical Place");
 assert.equal(x.place_name,p.name);
 assert.equal(x.country,p.country);
 assert.equal(x.editorial_approval,true);
 assert.equal(x.editorial_decision,"APPROVED_FIRST_CHOICE_2026_11_04");
 assert.equal(x.source_role,"COVER_CANDIDATE");
 assert.ok(x.original_sha1.match(/^[a-f0-9]{40}$/));
 assert.equal(x.original_byte_previously_verified,true);
 assert.ok(x.prior_original_byte_evidence.startsWith("ROUND22_")||x.prior_original_byte_evidence.startsWith("ROUND24_"));
 assert.equal(x.release_rights_passed,false);
 assert.equal(x.original_current_revision_passed,false);
 assert.equal(x.third_party_rights_passed,false);
 assert.equal(x.visual_mobile_crop_passed,false);
 assert.equal(x.derivative_file_present,false);
 assert.equal(x.publication_authorized,false);
 const photo=p.images.filter(i=>i.sha1===x.original_sha1&&i.role==="COVER_CANDIDATE");
 assert.equal(photo.length,1,"Only exact source hash may be owner selected");
 const i=photo[0];
 assert.equal(x.exact_original_file,i.file);
 assert.equal(x.original_commons_page,i.url);
 assert.equal(x.original_bytes,i.bytes);
 assert.deepEqual(x.pixel_dimensions,[i.width,i.height]);
 assert.equal(x.source_author,i.author);
 assert.equal(x.license_claim,i.license);
 assert.equal(x.license_url,i.license_url);
 assert.equal(x.prior_original_byte_evidence,i.proof);
 assert.ok(t.sourceList.some(s=>s.original_sha1===i.sha1&&s.role==="COVER_CANDIDATE"));
}
const haemi=selected.get("place:KR:haemi-martyrs-shrine-main-church");
const rejects=["4bb160a87827df08afa9712fd2ba919d9d172844","12fce24b20e6edb782e94537e08a55332e262cc4","a83702a485259a911d2fbeb6c75b46ebad7f49fd"];
assert.deepEqual(haemi.rejected_alternatives_sha1,rejects);
assert.ok(rejects.every(id=>old.get(haemi.place_id).images.some(x=>x.sha1===id&&x.sha1!==haemi.original_sha1)));
assert.deepEqual(manifest.held_places.map(x=>x.place_id),["place:DE:aachener-dom-four-textiles"]);
assert.deepEqual(manifest.unreviewed_places.map(x=>x.place_id).sort(),[
 "place:CL:sanctuary-of-our-lady-of-la-tirana-chile",
 "place:FR:saint-louis-de-gonzague-pau",
 "place:NZ:pukekaraka-otaki"
].sort());
const all23=new Set([...manifest.decisions.map(x=>x.place_id),...manifest.held_places.map(x=>x.place_id),...manifest.unreviewed_places.map(x=>x.place_id)]);
assert.equal(all23.size,23);
assert.deepEqual([...all23].sort(),[...old.keys()].sort());
assert.equal(selected.get("place:MX:guadalupe-zacatecas-historic-sanctuary").pixel_dimensions[0],1032,"Keep user-approved undersized original, flag it");
assert.deepEqual(selected.get("place:LB:monastery-saint-maron-annaya").pixel_dimensions,[null,null],"Do not invent unverified dimensions");
console.log("R28 OWNER CHOICES LOCKED: 19 approved original SHA1, 1 hold, 3 unreviewed, 3 rejected Haemi alternatives; publication remains 379/530.");
