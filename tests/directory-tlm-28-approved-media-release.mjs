import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {attachApprovedDirectoryMedia,eligibleVenueImage,eligibleRenderedDirectoryImage,
 renderDirectoryVenueCard,DIRECTORY_CARD_STYLE} from "../src/find/directory-card.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const sha256=b=>createHash("sha256").update(b).digest("hex");
const enc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const pkg=read("data/directory/research/tlm-28-release-candidates-20261112.v1.json");
const release=read("data/directory/research/tlm-28-reviewed-publication-release-20261112.v1.json");
const registry=read("data/directory/approved-venue-media.v1.json");
const physical=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const siteWitnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const geo=read("data/geography/seed-registry.v1.json");

assert.equal(pkg.schema,"AO_TLM_28_VERIFIED_WEBP_TRANSFER_AND_APPROVAL_GATES_V1");
assert.equal(release.schema,"AO_TLM_28_EXACT_DIOCESAN_PHOTO_RELEASE_V1");
assert.equal(registry.schema,"AO_APPROVED_TLM_VENUE_MEDIA_V1");
assert.equal(physical.records.length,2580);
assert.equal(pkg.entries.length,28);
assert.equal(release.records.length,28);
assert.equal(registry.items.length,30);
assert.equal(new Set(registry.items.map(x=>x.venue_id)).size,30,"No duplicate approved venue image");
assert.deepEqual([release.counts.new_venue_photos,release.counts.unchanged_prior_venue_photos,
 release.counts.proposed_total_venue_photos],[28,2,30]);
for(const key of ["new_pins","new_place_records","new_mass_claims","new_ownership_claims"])
 assert.equal(release.counts[key],0,"Photo approval must not invent geography or liturgy");

const rowByAnchor=new Map(physical.records.map(r=>[r[0],r]));
const sourceLabel=new Map(matrix.rows.map(r=>[r[0],r]));
const exactWitness=new Map(siteWitnesses.records.map(r=>[r.cl2_anchor,r]));
const repoByVenue=new Map(registry.items.map(r=>[r.venue_id,r]));
const releases=new Map(release.records.map(r=>[r.cl2_anchor,r]));
const linked=new Set(geo.directoryPlaceLinks.map(x=>x.venue_id));
const witnessTiers=new Map();
assert.equal(new Set(pkg.entries.map(x=>x.cl2_anchor)).size,28);
const licenseUrls=Object.freeze({
 "CC0-1.0":"https://creativecommons.org/publicdomain/zero/1.0/",
 "CC-BY-3.0":"https://creativecommons.org/licenses/by/3.0/",
 "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
 "CC-BY-SA-2.5":"https://creativecommons.org/licenses/by-sa/2.5/",
 "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
 "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/",
});
const allAssets=new Set();
for(const candidate of pkg.entries){
 const site=rowByAnchor.get(candidate.cl2_anchor),summary=releases.get(candidate.cl2_anchor);
 assert.ok(site,"Unknown CL2 physical site "+candidate.cl2_anchor);
 assert.ok(site[1].includes(candidate.venue_id),"Wrong Directory source ID");
 assert.ok(summary&&summary.venue_id===candidate.venue_id,"Research source identity changed");
 const category=exactWitness.get(candidate.cl2_anchor)?.category||sourceLabel.get(site[5])?.[1];
 const lane=exactWitness.get(candidate.cl2_anchor)?.visual_lane||sourceLabel.get(site[5])?.[4];
 assert.equal(category,"DIOCESAN_OR_PARISH_CONTEXT","Only diocesan/host church receives these photos");
 assert.equal(lane,"DIOCESAN_PHOTO");
 assert.ok(!linked.has(candidate.venue_id),"Exact canonical Place images must retain priority");
 assert.equal(candidate.publication_approved,false,"Original candidate audit must stay immutable");
 assert.equal(candidate.status,"STAGED_NOT_APPROVED");
 const img=repoByVenue.get(candidate.venue_id);
 assert.ok(img&&eligibleVenueImage(img,candidate.venue_id),"Approved exact image failed renderer gate");
 assert.equal(img.source_url,candidate.source_url.replaceAll("\x27","%27"),"URL must encode literal apostrophes for Directory reader");
 assert.equal(img.source_sha1,candidate.source_sha1);
 assert.equal(img.source_sha1_verification,candidate.source_sha1_verification);
 assert.equal(img.derivative_sha256,candidate.derivative_sha256);
 assert.equal(img.credit,candidate.credit);
 assert.equal(img.asset_path,candidate.approved_asset_path);
 assert.equal(img.license,candidate.license);
 assert.equal(img.license_url,licenseUrls[img.license]);
 assert.equal(img.alt_en,summary.editorial_alt_refinement?.alt_en??candidate.alt_en);
 assert.equal(img.alt_fr,summary.editorial_alt_refinement?.alt_fr??candidate.alt_fr);
 assert.equal(img.changes_en,candidate.changes_en);
 assert.equal(img.changes_fr,candidate.changes_fr);
 assert.equal(img.site_evidence_url,candidate.site_evidence_url);
 assert.equal(img.width,candidate.width);
 assert.equal(img.height,candidate.height);
 assert.equal(img.orientation,candidate.height>candidate.width?"portrait":"landscape");
 assert.equal(img.rights_verified,true);
 assert.equal(img.subject_verified,true);
 assert.equal(img.crop_reviewed,true);
 assert.ok(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(img.source_url));
 assert.ok(img.site_evidence_url.startsWith("https://"));
 assert.ok(img.alt_en.length>25&&img.alt_fr.length>25);
 assert.ok(img.changes_en.length>30&&img.changes_en.includes("WebP"),"Preserve accurate source-specific change disclosure");
 assert.ok(img.changes_fr.length>30&&img.changes_fr.includes("WebP"),"Preserve accurate French modification disclosure");
 assert.ok(!allAssets.has(img.asset_path));
 allAssets.add(img.asset_path);
 assert.equal(summary.asset_path,img.asset_path);
 assert.equal(summary.derivative_sha256,img.derivative_sha256);
 const staged=readFileSync(new URL("../"+candidate.package_asset_path,import.meta.url));
 const published=readFileSync(new URL("../"+img.asset_path,import.meta.url));
 assert.equal(staged.length,published.length);
 assert.equal(sha256(staged),img.derivative_sha256,"Staged WebP SHA-256 mismatch");
 assert.equal(sha256(published),img.derivative_sha256,"Approved WebP SHA-256 mismatch");
 assert.equal(published.toString("ascii",0,4),"RIFF");
 assert.equal(published.toString("ascii",8,12),"WEBP");
 const stub={kind:"TLM_VENUE",source_id:candidate.venue_id,item_id:"tlm:"+candidate.venue_id,
  title:site[2],subtitle:site[4],site_category:{category,visual_lane:lane,
  classification_basis:exactWitness.has(candidate.cl2_anchor)?"EXACT_FIRST_PARTY_VENUE_WITNESS":"SOURCE_REPORTED"},
  community_id:"OTHER",source_links:[],sections:[]};
 const [matched,similar]=attachApprovedDirectoryMedia([stub,{...stub,source_id:"wrong-"+candidate.venue_id}],
  {venueApproved:registry.items,directoryPlaceLinks:geo.directoryPlaceLinks});
 assert.equal(matched.cover_media?.asset_path,img.asset_path,"Exact venue image join failed");
 assert.equal(matched.place_id,undefined,"Venue-only media must not create a Sacred Place");
 assert.equal(eligibleRenderedDirectoryImage(matched.cover_media,matched),true);
 assert.equal(similar.cover_media,undefined,"Similar-named/other venue inherited a photo");
 for(const language of ["en","fr"]){
  const html=renderDirectoryVenueCard(matched,language);
  assert.match(html,/data-visual-kind="photo"/);
  assert.ok(html.includes('src="'+img.asset_path+'"'));
  assert.ok(html.includes('alt="'+enc(language==="fr"?img.alt_fr:img.alt_en)+'"'));
 }
 witnessTiers.set(img.source_sha1_verification,(witnessTiers.get(img.source_sha1_verification)||0)+1);
}
assert.deepEqual([...witnessTiers.values()].sort((a,b)=>a-b),[3,12,13],"Do not misreport provenance: 12 archive originals, 3 Commons metadata checks and 13 historical-only checks");
assert.ok(!pkg.entries.some(x=>x.cl2_anchor==="RG-A1C02A9EC71D"),"Lewiston conflicting address remains held");
assert.ok(DIRECTORY_CARD_STYLE.includes("object-fit:contain;object-position:center"),"Images must retain the full frame on phone");
console.log("PASS TLM 28 exact diocesan covers: 28 source-locked SHA-256-matched WebPs, EN/FR cards, proper licences, no invented Place/ministry/schedules");
