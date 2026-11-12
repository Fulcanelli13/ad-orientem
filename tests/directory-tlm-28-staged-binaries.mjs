import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {attachApprovedDirectoryMedia,eligibleVenueImage} from "../src/find/directory-card.js";

// Committed research images are NOT approved publication assets.
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const meta=read("data/directory/research/tlm-28-release-candidates-20261112.v1.json");
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const approved=read("data/directory/approved-venue-media.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const licenseUrls={
 "CC-BY-3.0":"https://creativecommons.org/licenses/by/3.0/",
 "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
 "CC-BY-SA-2.5":"https://creativecommons.org/licenses/by-sa/2.5/",
 "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
 "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/",
 "CC0-1.0":"https://creativecommons.org/publicdomain/zero/1.0/"
};
assert.equal(meta.schema,"AO_TLM_28_VERIFIED_WEBP_TRANSFER_AND_APPROVAL_GATES_V1");
assert.equal(meta.state,"BINARY_COMMITTED_STAGING_ONLY_NOT_APPROVED_FOR_DIRECTORY_CARDS");
assert.equal(meta.entries.length,28);
assert.equal(meta.summary.git_blob_sha1_verified,28);
assert.equal(meta.summary.production_registry_changes,0);
assert.equal(index.records.length,2580);
const byAnchor=new Map(index.records.map(x=>[x[0],x]));
const byLabel=new Map(matrix.rows.map(x=>[x[0],x]));
const byWitness=new Map(witnesses.records.map(x=>[x.cl2_anchor,x]));
const existing=new Set(approved.items.map(x=>x.venue_id));
const linked=new Set(geo.directoryPlaceLinks.map(x=>x.venue_id));
let totalBytes=0;
const anchors=new Set(),venues=new Set(),approvedPaths=new Set();
for(const rec of meta.entries){
 const id=rec.cl2_anchor,venue=rec.venue_id,site=byAnchor.get(id);
 assert.ok(site,"Missing CL2 site: "+id);
 assert.ok(site[1].includes(venue),"CL2 source identity changed for "+id);
 assert.ok(!anchors.has(id)&&!venues.has(venue),"Duplicate CL2 or venue");
 anchors.add(id);venues.add(venue);
 const mat=byLabel.get(site[5]),w=byWitness.get(id);
 assert.equal(w?.category||mat?.[1],"DIOCESAN_OR_PARISH_CONTEXT");
 assert.equal(w?.visual_lane||mat?.[4],"DIOCESAN_PHOTO");
 // The stage snapshot remains immutable even when a separate approved release is published.
 assert.ok(!linked.has(venue),"An existing Place link would conflict");
 const promoted=approved.items.filter(x=>x.venue_id===venue);
 assert.ok(promoted.length<=1,"Multiple approved covers for "+venue);
 const released=promoted[0];
 if(released){
  assert.equal(released.asset_path,rec.approved_asset_path,"Promoted cover path must be exact");
  assert.equal(released.source_url,rec.source_url,"Promoted source must match the archival witness");
  assert.equal(released.source_sha1,rec.source_sha1,"Promoted source hash must match archival record");
  assert.equal(released.credit,rec.credit,"Promoted photographer mismatch");
  assert.equal(released.license,rec.license,"Promoted licence mismatch");
  assert.equal(released.status,"APPROVED");
  assert.equal(eligibleVenueImage(released,venue),true,"Promoted record must pass release gate");
 }
 assert.equal(rec.status,"STAGED_NOT_APPROVED");
 for(const k of ["publication_approved","rights_verified","subject_verified","crop_reviewed"])
  assert.equal(rec[k],false,"Research was prematurely promoted: "+id+"."+k);
 const relative="assets/staged/directory-photo-recovery-20261111/"+id+".webp";
 assert.equal(rec.package_asset_path,relative);
 assert.match(rec.approved_asset_path,/^assets\/approved\/directory-media\/[A-Z0-9-]+\.webp$/);
 assert.ok(!approvedPaths.has(rec.approved_asset_path),"Competing approved asset path");
 approvedPaths.add(rec.approved_asset_path);
 assert.equal(existsSync(new URL("../"+rec.approved_asset_path,import.meta.url)),Boolean(released),
  "Approved asset must exist if and only if exact approved venue record exists");
 const bytes=readFileSync(new URL("../"+relative,import.meta.url));
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length,"WebP RIFF size mismatch: "+id);
 assert.equal(createHash("sha256").update(bytes).digest("hex"),rec.derivative_sha256);
 assert.equal(createHash("sha1").update(Buffer.from("blob "+bytes.length+"\0")).update(bytes).digest("hex"),rec.git_blob_sha1);
 totalBytes+=bytes.length;
 assert.ok(rec.width>=500&&rec.height>=500,"Insufficient image dimensions");
 assert.equal(licenseUrls[rec.license],rec.license_url,"Invalid exact CC licence label/URL");
 assert.match(rec.source_url,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
 assert.match(rec.site_evidence_url,/^https:\/\//);
 assert.match(rec.source_sha1,/^[a-f0-9]{40}$/);
 for(const field of ["credit","alt_en","alt_fr","changes_en","changes_fr"])
  assert.ok(rec[field]?.trim(),"Missing bilingual photo source field "+id+" "+field);
 assert.equal(eligibleVenueImage(rec,venue),false,"Unapproved photo passed production gate");
 const item=attachApprovedDirectoryMedia([{kind:"TLM_VENUE",source_id:venue}],{
  approved:[],gallery:[],venueApproved:approved.items,directoryPlaceLinks:geo.directoryPlaceLinks
 })[0];
 assert.equal(item.cover_media?.asset_path,released?.asset_path,
  "Only an explicitly approved exact venue photo may populate the Directory card "+id);
}
assert.equal(totalBytes,6523548,"Unexpected 28-photo asset-byte census");
assert.equal(meta.summary.publication_approved,0);
console.log("PASS 28/28 preserved CL2 staging witnesses, independent approved-release paths, exact-venue links, CC metadata, binary hashes and safe publication gates");