import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const lock=read("data/geography/research/sacred-atlas-r28-owner-approved19-source-lock-20261104.v1.json");
const gates=read("data/geography/research/sacred-atlas-r29-selected19-final-rights-checklist-20261104.v1.json");
const qa=read("data/geography/research/sacred-atlas-r28-owner-approved19-release-qa-20261104.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const source=readFileSync("tools/atlas/stage-sacred-atlas-r29-owner-selected-originals.py","utf8");
assert.equal(lock.schema,"AO_SACRED_ATLAS_R28_OWNER_APPROVED_19_EXACT_ORIGINALS_V1");
assert.equal(gates.schema,"AO_SACRED_ATLAS_R29_APPROVED19_FINAL_RIGHTS_GATE_V1");
assert.equal(gates.input_export_sha256,lock.source_export_sha256);
assert.equal(gates.rows.length,19);
assert.equal(new Set(gates.rows.map(x=>x.place_id)).size,19);
assert.equal(qa.rows.length,19);
assert.equal(covers.items.length,379);
assert.equal(gallery.items.length,42);
assert.equal(gates.publication_state,"NO_PHOTO_CLEARANCE_OR_RELEASE_AUTHORIZED");
const lockById=new Map(lock.decisions.map(x=>[x.place_id,x]));
const sourceById=new Map(qa.rows.map(x=>[x.place_id,x]));
const spec={
 "place:MX:guadalupe-zacatecas-historic-sanctuary":"LOW_RESOLUTION_1032x776",
 "place:LB:monastery-saint-maron-annaya":"WIDE_PANORAMA_CROP",
 "place:KR:haemi-martyrs-shrine-main-church":"MAIN_CHURCH_SUBJECT_IDENTITY",
 "place:US:la-salette-attleboro":"SEASONAL_NIGHT_SCENE",
 "place:DE:bettbrunn-st-salvator":"AUTHOR_CREDIT_AND_COMMONS_LICENSE_LINK_NEAR_IMAGE",
 "place:DE:basilika-st-clemens-hannover":"ORIGINAL_PHOTOGRAPHER_AND_EDITING_CREDIT"
};
const required=[
 "current_source_license_verified","named_photo_author_verified",
 "current_source_revision_verified","underlying_architecture_artwork_rights_verified",
 "exact_named_place_subject_verified","full_frame_mobile_crop_approved",
 "public_release_approved"];
for(const row of gates.rows){
 const original=lockById.get(row.place_id),qaRow=sourceById.get(row.place_id);
 assert.ok(original&&qaRow,"R29 review must not add unknown/previously rejected photo IDs");
 assert.equal(row.original_sha1,original.original_sha1);
 assert.equal(row.original_title,original.exact_original_file);
 assert.equal(row.special_issue,spec[row.place_id]||null);
 assert.equal(row.special_issue_accepted,false);
 if(row.place_id==="place:DE:bettbrunn-st-salvator")assert.equal(row.near_image_attribution_verified,false);
 if(row.place_id==="place:DE:basilika-st-clemens-hannover")assert.equal(row.original_photographer_and_editor_credit_verified,false);
 assert.equal(row.publication_authorized,false);
 assert.equal(row.evidence_url,null);
 assert.equal(row.source_revision_id,null);
 assert.equal(row.license_current_url,null);
 for(const k of required)assert.equal(row[k],false,"Release gate cannot preauthorize "+k);
}
assert.deepEqual(lock.held_places.map(x=>x.place_id),["place:DE:aachener-dom-four-textiles"]);
assert.equal(lock.unreviewed_places.length,3);
assert.equal(lock.decisions.length,19);
assert.ok(!source.includes("urllib")&&!source.includes("requests.get(")&&!source.includes("curl ")&&!source.includes("wget "),"Offline importer cannot fetch Wikimedia");
assert.ok(source.includes('row["original_sha1"]+".jpg"'),"Only exactly hash-addressed original bytes are accepted");
assert.ok(source.includes('hashlib.sha1(raw).hexdigest()!=row["original_sha1"]'));
assert.ok(source.includes('len(raw)!=row["original_bytes"]'));
assert.ok(source.includes('if not all(gate.get(k) is True for k in REQUIRED)'));
assert.ok(source.includes('if gate.get("special_issue") and gate.get("special_issue_accepted") is not True'));
assert.ok(source.includes('if gate.get("publication_authorized") is not True'));
assert.ok(source.includes('if not args.source_dir:'),"Default offline plan must work without a source archive");
assert.ok(source.includes('if args.apply and not ready:'),"No rights-cleared photo can be published");
assert.ok(source.includes("REVIEW_STAGING_MUST_BE_OUTSIDE_PUBLIC_REPOSITORY"));
assert.ok(source.includes("PUBLIC_ASSET_PATH_OR_PLACE_COLLISION"));
assert.ok(source.includes('temp.replace(MEDIA)'),"Canonical media registry is written only after validated binary assets");
assert.ok(source.includes('if args.apply:'),"No default app media mutation");
console.log("R29 PASS: 19 exact owner originals, 19 fail-closed rights reviews, four specific risk holds, no original bytes, no network, zero automatic media release.");
