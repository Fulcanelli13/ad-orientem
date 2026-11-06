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
const p95=read("data/geography/research/directory-p95-first-two-photo-covers.v1.json");
const p95ByPlace=new Map(p95.photos.map(x=>[x.place_id,x]));
const p102=read("data/geography/research/directory-p102-three-approved-covers.v1.json");
const p102ByPlace=new Map(p102.photos.map(x=>[x.place_id,x]));
const p106=read("data/geography/research/directory-p106-four-approved-covers.v1.json");
const p106ByPlace=new Map(p106.photos.map(x=>[x.place_id,x]));
const p107Stage=read("data/directory/research/p107-four-webp-stage-audit.v1.json");
const p107Final=read("data/directory/research/p107-jihlava-final-image-editorial-qa.v1.json");
assert.ok(approved.items.length>=31+p95.photos.length+p102.photos.length+p106.photos.length,"Historical shrine, P95/P102/P106 approved covers must remain intact as later covers are released");
const finder=read("data/geography/research/photo-finder-20261030/decisions.json");
const finderCredits=readFileSync("data/geography/research/photo-finder-20261030/credits.csv","utf8").split("\n");
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
  if(item.source_place_ref==="APPROVED_GALLERY_COVER_REUSE_20261031"){
    assert.match(item.asset_path,/^assets\/approved\/place-gallery\/[a-zA-Z0-9_.-]+\.webp$/);
    assert.match(item.source_sha1,/^[a-f0-9]{40}$/);
    assert.match(item.derivative_sha256,/^[a-f0-9]{64}$/);
    const original=existingGallery.items.find(x=>x.media_id===item.gallery_media_id&&x.place_id===item.place_id);
    assert.ok(original&&original.status==="APPROVED"&&original.kind==="PHOTO"&&original.rights_verified&&original.subject_verified&&original.crop_reviewed);
    for(const key of ["asset_path","source_url","source_sha1","derivative_sha256","credit","license","license_url","width","height"])
      assert.equal(item[key],original[key],"Gallery cover must retain source-approved "+key);
  }else{
    assert.match(item.asset_path,/^assets\/approved\/place-media\/[a-zA-Z0-9_.-]+\.webp$/);
  }
  assert.ok(["PUBLIC_DOMAIN","CC0-1.0","CC-BY-2.0","CC-BY-2.5","CC-BY-3.0","CC-BY-4.0","CC-BY-SA-2.0","CC-BY-SA-2.5","CC-BY-SA-3.0","CC-BY-SA-4.0","PEXELS_LICENSE"].includes(item.license),
    "Only independently confirmed freely reusable site photos may be published");
  assert.equal(item.license_url,item.license==="PEXELS_LICENSE"
    ? "https://www.pexels.com/license/"
    : item.license==="PUBLIC_DOMAIN"
    ? "https://creativecommons.org/publicdomain/mark/1.0/"
    : item.license==="CC0-1.0"
      ? "https://creativecommons.org/publicdomain/zero/1.0/"
      : "https://creativecommons.org/licenses/"+(item.license.startsWith("CC-BY-SA-")?"by-sa/":"by/")+item.license.split("-").at(-1)+"/");
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
  }else if(p95ByPlace.has(item.place_id)){
    const c=p95ByPlace.get(item.place_id);
    assert.equal(item.source_url,c.commons_source_page);
    assert.equal(item.credit,c.creator);
    assert.equal(item.license,c.license);
    assert.equal(item.source_sha1,c.original_sha1);
    assert.equal(item.derivative_sha256,c.derivative_sha256);
    assert.ok(geography.directoryPlaceLinks.some(x=>x.place_id===item.place_id&&x.venue_id===c.venue_id&&x.relationship==="LOCATED_AT"&&x.confidence==="CONFIRMED"));
  }else if(p102ByPlace.has(item.place_id)){
    const c=p102ByPlace.get(item.place_id);
    assert.equal(item.source_url,c.source_url);
    assert.equal(item.credit,c.credit);
    assert.equal(item.license,c.license);
    assert.equal(item.source_sha1,c.source_sha1);
    assert.equal(item.derivative_sha256,c.derivative_sha256);
    assert.ok(geography.directoryPlaceLinks.some(x=>x.place_id===item.place_id&&x.venue_id===c.venue_id&&x.relationship==="LOCATED_AT"&&x.confidence==="CONFIRMED"));
  }else if(p106ByPlace.has(item.place_id)){
    const c=p106ByPlace.get(item.place_id);
    assert.equal(item.source_url,c.source_url);
    assert.equal(item.credit,c.credit);
    assert.equal(item.license,c.license);
    assert.equal(item.source_sha1,c.source_sha1);
    assert.equal(item.derivative_sha256,c.sha256);
    assert.ok(geography.directoryPlaceLinks.some(x=>x.place_id===item.place_id&&x.venue_id===c.venue_id&&x.confidence==="CONFIRMED"&&x.relationship==="LOCATED_AT"));
  }else if(item.source_place_ref==="AO-P104-309-SITE"){
    assert.equal(item.place_id,"place:CZ:st-ignatius-jihlava",
      "P107 final editorial clearance applies to Jihlava alone");
    assert.equal(p107Final.status,"PRIMARY_EDITORIAL_ACCEPTED_RELEASE_IN_SEPARATE_PR");
    assert.equal(p107Final.site,item.place_id);
    assert.equal(p107Final.checks.exact_physical_structure,true);
    assert.equal(p107Final.checks.full_frame_no_crop,true);
    assert.equal(p107Final.checks.source_page_author_license_checked,true);
    const c=p107Stage.records.find(r=>r.place_id===item.place_id);
    assert.ok(c&&c.no_crop&&c.native_jpeg_decode);
    assert.equal(item.source_url,c.source_url);
    assert.equal(item.source_sha1,c.original_sha1_verified);
    assert.equal(item.derivative_sha256,c.staged_sha256);
    assert.equal(item.credit,c.photographer);
    assert.equal(item.license,c.license);
    assert.equal(item.license_url,c.license_url);
    assert.ok(geography.directoryPlaceLinks.some(x=>x.place_id===item.place_id
      &&x.venue_id===p107Final.directory_venue_id&&x.confidence==="CONFIRMED"
      &&x.relationship==="LOCATED_AT"),
      "Only the original confirmed Jihlava church may receive the P107 image");
  }else if(item.source_place_ref==="APPROVED_GALLERY_COVER_REUSE_20261031"){
    const approvedGalleryItem=existingGallery.items.find(x=>x.media_id===item.gallery_media_id&&x.place_id===item.place_id);
    assert.ok(approvedGalleryItem);
    assert.equal(item.derivative_sha256,approvedGalleryItem.derivative_sha256);
  }else if(item.source_place_ref==="COMMONS_NOTRE_DAME_PARIS_2026_EXACT_SITE"){
    assert.equal(item.place_id,"place:FR:notre-dame-paris");
    assert.equal(item.credit,"Chabe01");
    assert.equal(item.source_sha1,"6524c0f5eaf0f0ddaae7d669a8cdf7d1123cf3c5");
    assert.equal(item.asset_path,"assets/approved/place-media/FR-notre-dame-paris-2026.webp");
    assert.equal(item.license,"CC-BY-SA-4.0");
  }else if(item.source_place_ref==="PHOTO_FINDER_2026-10-30_PD_SELF_R1"){
    // A previously selected Commons PD-self photo may be published only after
    // separate source-revision, original-byte and derivative proof. Never
    // treat the historic "Public domain" export label as authorization.
    const manifest=read("data/geography/research/sacred-atlas-round11-pd-self-selected-cover-manifest-20261104.v1.json");
    const evidence=read("data/geography/research/sacred-atlas-round11-pd-self-source-evidence-20261104.v1.json");
    const source=manifest.rows.find(x=>x.place_id===item.place_id);
    const proof=evidence.published.find(x=>x.place_id===item.place_id);
    assert.ok(source&&proof&&evidence.current_exact_sha1_original_bytes_pd_self_and_revision_verified_for_published,
      "PD-self source requires independent current-rights and original-byte evidence");
    assert.equal(source.commons_file,finder.decisions[item.place_id]?.files?.[0]);
    assert.equal(source.original_sha1,item.source_sha1);
    assert.equal(source.expected_revision_id,proof.source_revision_id);
    assert.equal(item.source_sha1,proof.source_sha1);
    assert.equal(item.derivative_sha256,proof.derivative_sha256);
    assert.equal(item.asset_path,proof.asset_path);
    assert.equal(proof.rights_template,"PD-self");
    assert.equal(item.license,"PUBLIC_DOMAIN");
    assert.equal(item.license_url,"https://creativecommons.org/publicdomain/mark/1.0/");
    assert.equal(item.credit,proof.current_artist);
    assert.ok(item.review_method.includes("original source bytes"),
      "Exact-source PD-self and original-file audit must be recorded");
    assert.match(item.asset_path,/^assets\/approved\/place-media\/pf-[a-f0-9]{22}\.webp$/);
  }else if(item.source_place_ref==="PHOTO_FINDER_2026-10-30_R1"){
    assert.match(item.asset_path,/^assets\/approved\/place-media\/pf-[a-f0-9]{22}\.webp$/);
    const decision=finder.decisions[item.place_id];
    assert.ok(decision&&decision.files.length>0&&decision.none===false,
      "Photo Finder selection must be an explicit canonical Place editorial choice");
    const title=decodeURIComponent(new URL(item.source_url).pathname.slice("/wiki/".length)).replaceAll("_"," ");
    assert.equal(title,decision.files[0],"Exact selected first photo must be the released source");
    assert.ok(finderCredits.some(line=>line.startsWith('"'+item.place_id+'","1","main"')
      &&line.includes('"'+item.source_sha1+'"')),
      "Original SHA1 must appear in the source-credit export under the same chosen Place");
    assert.ok(item.review_method.includes("Photo Finder editorial selection"));
  }else if(item.source_place_ref==="DIRECT_PEXELS_FLICKR_BATCH_TWO_20261105"){
    const manifest=read("data/geography/research/sacred-atlas-direct-source-batch-two-20261105.v1.json");
    const proof=read("data/geography/research/sacred-atlas-direct-source-batch-two-report-20261105.v1.json");
    const browser=read("data/geography/research/sacred-atlas-pexels-primary-source-manual-audit-20261105.v1.json");
    assert.equal(manifest.schema,"AO_SACRED_ATLAS_DIRECT_SOURCE_BATCH_TWO_V1");
    assert.equal(proof.schema,"AO_SACRED_ATLAS_DIRECT_SOURCE_BATCH_TWO_REPORT_V1");
    assert.equal(proof.attempted,4);
    assert.equal(proof.admitted_on_pr_branch+proof.held,4);
    assert.equal(proof.main_published_by_this_workflow,0);
    const source=manifest.items.find(x=>x.place_id===item.place_id);
    const reviewed=proof.approved.find(x=>x.place_id===item.place_id);
    assert.ok(source&&reviewed,"New image must be in exact manifest and original/derivative evidence");
    assert.equal(item.source_url,source.source_page);
    assert.equal(item.credit,source.credit);
    assert.equal(item.license,source.license);
    assert.equal(item.license_url,source.license_url);
    assert.equal(item.alt_en,source.subject_en);
    assert.equal(item.alt_fr,source.subject_fr);
    assert.equal(item.source_sha1,reviewed.source_original_sha1);
    assert.equal(item.derivative_sha256,reviewed.derivative_sha256);
    assert.equal(item.asset_path,reviewed.asset_path);
    assert.match(reviewed.source_original_sha1,/^[a-f0-9]{40}$/);
    assert.match(reviewed.derivative_sha256,/^[a-f0-9]{64}$/);
    assert.equal(reviewed.source_image_url,source.source_image_url);
    if(source.source_type==="pexels"){
      assert.equal(item.license,"PEXELS_LICENSE");
      assert.match(source.source_page,/^https:\/\/www\.pexels\.com\/photo\/[a-z0-9-]+-\d+\/$/);
      assert.match(source.source_image_url,/^https:\/\/images\.pexels\.com\/photos\/\d+\//);
      const audited=browser.rows.find(x=>x.place_id===item.place_id);
      assert.ok(audited&&audited.source_page===source.source_page&&audited.photo_id===source.source_id&&
        audited.original_image_url===source.source_image_url&&audited.photographer===source.credit&&
        audited.site_subject===source.title_probe&&audited.license_url===source.license_url&&
        audited.free_download_displayed&&audited.photographer_name_and_site_subject_both_checked&&
        audited.licence_permits_websites_and_apps&&!audited.publication_authorized_by_this_ledger,
        "Pexels subject and per-photo rights must be independently verified on primary pages");
    }else{
      assert.equal(source.source_type,"flickr");
      assert.equal(item.license,"CC-BY-SA-2.0");
      assert.match(reviewed.source_page_sha256,/^[a-f0-9]{64}$/);
    }
  }else if(item.source_place_ref==="DIRECT_OPEN_PHOTO_FIVE_20261105"){
    // New legally reusable photos acquired directly from WordPress Photo
    // Directory/Flickr are a separate, source-audited intake cohort.
    // The historic R58/R59 and Photo Finder choices remain unchanged.
    const manifest=read("data/geography/research/sacred-atlas-direct-open-photo-five-20261105.v1.json");
    const proof=read("data/geography/research/sacred-atlas-direct-open-photo-five-release-report-20261105.v1.json");
    assert.equal(manifest.schema,"AO_SACRED_ATLAS_DIRECT_OPEN_PHOTO_BATCH_V1");
    assert.equal(proof.schema,"AO_SACRED_ATLAS_DIRECT_OPEN_PHOTO_FIVE_REPORT_V1");
    assert.equal(proof.attempted,5);
    assert.equal(proof.admitted_on_branch+proof.held,5);
    assert.equal(proof.main_published_by_this_job,0);
    const source=manifest.items.find(x=>x.place_id===item.place_id);
    const accepted=proof.accepted.find(x=>x.place_id===item.place_id);
    assert.ok(source&&accepted,"Direct-source photo requires exact Site and original byte evidence");
    assert.equal(item.source_url,source.source_page);
    assert.equal(item.credit,source.credit);
    assert.equal(item.license,source.license==="CC0"?"CC0-1.0":source.license);
    assert.equal(item.license_url,source.license_url);
    assert.equal(item.asset_path,accepted.asset);
    assert.equal(item.source_sha1,accepted.original_sha1);
    assert.equal(item.derivative_sha256,accepted.derivative_sha256);
    assert.equal(item.alt_en,source.subject_en);
    assert.equal(item.alt_fr,source.subject_fr);
    assert.match(accepted.rights_proof_sha256,/^[a-f0-9]{64}$/);
    assert.ok(source.independent_site&&source.depiction);
    assert.ok(item.review_method.includes("PR visual review required before merge"),
      "Do not falsely substitute source metadata for final visual acceptance");
  }else{
    const c=shrineCandidates.get(item.place_id)||b2Candidates.get(item.place_id);
    assert.ok(c&&c.image_review_state==="EDITORIALLY_ACCEPTED_EXACT_SITE_AND_FULL_FRAME_20261021",
      "New shrine photo lacks exact-source and visual approval");
    assert.equal(item.source_url,c.source_url);
    assert.equal(item.credit,c.credit);
    assert.equal(item.license,c.license);
  }
  const asset=readFileSync(item.asset_path);
  assert.ok(asset.length>(item.source_place_ref==="PHOTO_FINDER_2026-10-30_R1"?3000:50000),"Approved WebP must contain verified nonempty image bytes");
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
