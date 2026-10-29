import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const research=read("data/geography/research/place-media-candidates-r58.v1.json");
const curated=read("data/geography/major-places-editorial.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const approved=read("data/geography/approved-place-media.v1.json");
const editorialReview=read("data/geography/research/place-media-publication-review-r58.v1.json");
assert.equal(editorialReview.schema,"AO_EXPLORE_PLACE_MEDIA_PUBLICATION_REVIEW_V1");
assert.equal(editorialReview.counts.approved,10);
assert.equal(editorialReview.counts.needs_replacement,8);
assert.equal(editorialReview.counts.held_license,2);
assert.equal(editorialReview.counts.coverage,20);
assert.ok(editorialReview.approved.every(x=>approved.items.some(item=>item.place_id===x.place_id)),
 "All ten original R58 approvals must remain published");
const excluded=[...editorialReview.needs_replacement,...editorialReview.held].map(x=>x.place_id);
assert.equal(new Set(excluded).size,10);
const r59=read("data/geography/research/place-media-candidates-r59.v1.json");
assert.ok(editorialReview.held.every(x=>{
 const historic=r59.candidates.find(y=>y.place_id===x.place_id);
 return historic&&!approved.items.some(item=>item.place_id===x.place_id&&
   item.source_url===historic.source_page_url);
}),"The historical R59 held photos must remain unpublished, even when a different later photo is independently cleared");
assert.ok(editorialReview.needs_replacement.every(x=>r59.candidates.some(y=>y.place_id===x.place_id)),
 "All eight R58 quality holds must be replaced only by R59 curated sources");

assert.equal(research.schema,"AO_EXPLORE_PLACE_MEDIA_RESEARCH_V1");
assert.equal(curated.schema,"AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1");
assert.equal(approved.schema,"AO_APPROVED_PLACE_MEDIA_V1");
const legacyIds=new Set([...editorialReview.approved,...editorialReview.needs_replacement].map(x=>x.place_id));
assert.equal(legacyIds.size,18,"Original R58/R59 photo cohort must remain distinct and intact");
assert.equal(approved.items.filter(x=>legacyIds.has(x.place_id)).length,18,
 "The original ten plus eight replacement approved photographs must be preserved");
assert.equal(approved.items.length,32,"Six additional independently reviewed exact-shrine photos must be approved");
const shrineRecovery=read("data/geography/research/shrine-seven-photo-recovery-20261021.v1.json");
const shrineCandidates=new Map(shrineRecovery.candidates.map(x=>[x.place_id,x]));
const b2Candidates=new Map(read("data/geography/research/explore-major-marian-b2-photo-candidates.v1.json").candidates.map(x=>[x.place_id,x]));
const existingGallery=read("data/geography/approved-place-gallery.v1.json");
const pontmain=existingGallery.items.find(x=>x.media_id==="pontmain-east-facade-2016");
const approvedIds=new Set();
for(const item of approved.items){
  assert.ok(!approvedIds.has(item.place_id));approvedIds.add(item.place_id);
  assert.equal(item.status,"APPROVED");
  assert.ok(item.rights_verified&&item.subject_verified&&item.crop_reviewed);
  assert.match(item.asset_path,/^assets\/approved\/place-media\/[a-zA-Z0-9_.-]+\.webp$/);
  assert.ok(["PUBLIC_DOMAIN","CC0","CC-BY-SA-2.0","CC-BY-SA-3.0","CC-BY-SA-4.0"].includes(item.license),
    "Only independently confirmed freely reusable site photos may be published");
  assert.equal(item.license_url,item.license==="PUBLIC_DOMAIN"
    ? "https://creativecommons.org/publicdomain/mark/1.0/"
    : item.license==="CC0"?"https://creativecommons.org/publicdomain/zero/1.0/"
    : "https://creativecommons.org/licenses/by-sa/"+item.license.split("-").at(-1)+"/");
  if(legacyIds.has(item.place_id)){
    assert.equal(item.license,"CC-BY-SA-4.0","Original cohort licence must never be loosened");
  }
  assert.ok(item.source_sha1&&item.derivative_sha256);
  assert.ok(item.changes_en&&item.changes_fr&&item.alt_en&&item.alt_fr);
  assert.ok(Number(item.width)>=640&&Number(item.height)>=480);
  assert.equal(item.orientation,item.height>item.width?"portrait":"landscape");
  const related=research.candidates.find(row=>row.place_id===item.place_id);
  const upgraded=r59.candidates.find(row=>row.place_id===item.place_id);
  if(legacyIds.has(item.place_id)){
    assert.equal(item.source_url,upgraded?.source_page_url||related?.source_page_url,
      "Historical approved image must match its exact original R58/R59 Commons source");
  }else if(item.place_id==="place:FR:pontmain"){
    assert.equal(item.source_url,pontmain?.source_url,
      "Pontmain hero is reused from an independently approved and site-matched gallery image");
    assert.equal(item.derivative_sha256,pontmain?.derivative_sha256,
      "Pontmain hero and gallery must have identical source-reviewed photograph bytes");
  }else if(item.place_id==="place:US:st-alphonsus-baltimore"){
    const stage=read("data/geography/research/directory-st-alphonsus-photo-stage-20261029.v1.json");
    const editorial=read("data/geography/research/directory-st-alphonsus-photo-editorial-20261029.v1.json");
    const approval=editorial.approved_source_assets.find(x=>x.decision==="APPROVE_HERO");
    const selected=stage.records.find(x=>x.asset_path.endsWith("/"+approval.stage_filename));
    assert.equal(item.source_url,selected.source_url);
    assert.equal(item.source_sha1,approval.source_sha1);
    assert.equal(item.derivative_sha256,approval.derivative_sha256);
    assert.equal(item.credit,selected.credit);
    assert.equal(item.license,"CC-BY-SA-4.0");
  }else{
    const c=shrineCandidates.get(item.place_id)||b2Candidates.get(item.place_id);
    assert.ok(c&&c.image_review_state==="EDITORIALLY_ACCEPTED_EXACT_SITE_AND_FULL_FRAME_20261021",
      "New shrine photo lacks exact-source and visual approval");
    assert.equal(item.source_url,c.source_url);
    assert.equal(item.credit,c.credit);
    assert.equal(item.license,c.license);
  }
  const asset=readFileSync(item.asset_path);
  assert.ok(asset.length>50000,"Approved file must contain image bytes");
  assert.equal(asset.toString("ascii",0,4),"RIFF","Optimized asset must be WebP");
  assert.equal(asset.toString("ascii",8,12),"WEBP","Optimized asset must be WebP");
  assert.equal(createHash("sha256").update(asset).digest("hex"),item.derivative_sha256,
    "Approved photo bytes must match source stage report for "+item.place_id);
}
for(const held of research.held){
 const historic=r59.candidates.find(x=>x.place_id===held.place_id);
 assert.ok(historic&&!approved.items.some(item=>item.place_id===held.place_id&&item.source_url===historic.source_page_url),
  "Historical held photograph may not be published through a separate source review");
}
assert.equal(research.candidates.length,18);
assert.equal(research.held.length,2);

const ids=new Set(curated.items.map(x=>x.place_id));
const known=new Set(geography.places.map(x=>x.place_id));
const seen=new Set();
for(const entry of [...research.candidates,...research.held]){
  assert.ok(ids.has(entry.place_id)&&known.has(entry.place_id),"Unknown canonical site "+entry.place_id);
  assert.ok(!seen.has(entry.place_id),"Duplicate image subject "+entry.place_id);
  seen.add(entry.place_id);
  assert.match(entry.source_page_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
}
assert.deepEqual([...ids].sort(),[...seen].sort(),"Every in-focus site needs an explicit reviewed target or hold");
for(const entry of research.candidates){
  assert.equal(entry.status,"STAGE_ONLY_LICENSE_API_RECHECK_REQUIRED");
  assert.equal(entry.expected_license,"CC BY-SA 4.0");
  assert.equal(entry.publication_approved,false);
  assert.equal(entry.subject_crop_reviewed,false);
  assert.match(entry.license_url,/^https:\/\/creativecommons\.org\/licenses\/by-sa\/4\.0\//);
  assert.ok(entry.alt_en&&entry.alt_fr&&entry.commons_title.startsWith("File:"));
}
assert.deepEqual(new Set(research.held.map(x=>x.place_id)),new Set([
  "place:MU:pere-laval-sainte-croix","place:GB:walsingham-catholic-shrine"
]));
const stagingScript=readFileSync("tools/stage-place-media.py","utf8");
assert.match(stagingScript,/STAGED_NOT_APPROVED/);
assert.match(stagingScript,/rights|license|LicenseUrl|LicenseShortName/i);
assert.doesNotMatch(stagingScript,/APPROVED\.write_text|APPROVED\.open\(/,
  "Importer must not write directly into the publication registry");
console.log("PASS Explore R58+59: historical first ten preserved, eight exact-photo upgrades, two holds");
