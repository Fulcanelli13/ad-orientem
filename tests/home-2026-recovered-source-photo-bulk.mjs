/* All 365 dates retain one authoritative 1962 observed-principal source.
 * Source release is separate from the work selection and photo-crop review.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {SELECTED_2026_RECOVERED_SOURCE_PREVIEWS,
 recovered2026SelectedSourcePreview} from "../src/home/approved-2026-recovered-photo-previews.js";
import {approved2026HomeArtwork} from "../src/home/approved-dated-artwork-2026.js";
import {ANNUAL_HOME_ARTWORK_DAYS_2026} from "../src/home/annual-home-artwork-2026.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const prior=read("data/artwork/2026-prior-date-artwork-evidence.v1.json");
const triage=read("data/artwork/home-2026-27-frozen-selected-release-triage.v1.json");
const census=read("data/artwork/home-2026-annual-release-census.v1.json");
const norm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const fresh=Object.values(SELECTED_2026_RECOVERED_SOURCE_PREVIEWS);
assert.equal(fresh.length,3);
assert.equal(new Set(fresh.map(x=>x.date)).size,3);
assert.equal(Object.keys(ANNUAL_HOME_ARTWORK_DAYS_2026).length,365);
assert.equal(census.days.length,365);
assert.equal(census.exceptions.length,228);
assert.equal(census.counts.totalProposedMapped,137);
assert.equal(census.counts.pendingOrHeld,228);
assert.equal(census.counts.DATE_SELECTED_IMAGE_UNRELEASED,20);
assert.equal(triage.counts.REMOTE_EXACT_WORK_PREVIEW_RECOVERED_NOT_OFFLINE_CERTIFIED,3);
for(const row of fresh){
 const day=prior.days.find(x=>x.date===row.date);
 assert.ok(day?.selection,"Frozen date selection unavailable "+row.date);
 assert.equal(day.principalId,row.principalId);
 assert.equal(norm(day.selection.title),norm(row.title));
 assert.equal(norm(day.selection.artist),norm(row.artist));
 assert.equal(day.selection.editorialBasis,row.editorialBasis);
 assert.ok(row.imageWidth>=2000&&row.imageHeight>=2000,"Poor source original: "+row.date);
 assert.match(row.licenceUrl,/^https:\/\/(?:creativecommons\.org\/licenses\/by\/4\.0\/|commons\.wikimedia\.org\/wiki\/Commons:Reuse_of_PD-Art_photographs)$/);
 const art=recovered2026SelectedSourcePreview(row.date,row.principalId,row.properPath);
 assert.ok(art);
 assert.equal(art.selectionKind,"FROZEN_2026_EXACT_WORK_REMOTE_SOURCE_RECOVERY");
 assert.equal(art.imageStatus,"REMOTE_FROZEN_EXACT_WORK_SOURCE_PREVIEW_NOT_OFFLINE_CERTIFIED");
 assert.ok(art.rights.includes(row.imageLicence));
 assert.equal(art.licenceUrl,row.licenceUrl);
 assert.ok(art.source.includes(encodeURIComponent(row.file)));
 assert.ok(art.image.includes("Special:Redirect/file/"));
 const state={selectedDate:row.date,route:"home",resolving:false,
  resolution:{date:row.date,status:"ready",day:{main:{id:row.principalId}},
   proper:{status:"ready",sourcePath:row.properPath}}};
 assert.deepEqual(approved2026HomeArtwork(state),art);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,day:{main:{id:"wrong"}}}}),null);
 assert.equal(approved2026HomeArtwork({...state,resolution:{...state.resolution,proper:{status:"ready",sourcePath:"Sancti/not-correct"}}}),null);
 assert.equal(recovered2026SelectedSourcePreview(row.date,row.principalId,"other"),null);
 assert.equal(census.days.find(x=>x.date===row.date)?.status,"RECOVERED_FROZEN_DATE_SOURCE_PREVIEW_MAPPED");
 assert.ok(triage.rows.some(x=>x.date===row.date&&x.decision==="REMOTE_EXACT_WORK_PREVIEW_RECOVERED_NOT_OFFLINE_CERTIFIED"));
}
for(const date of ["2026-10-25","2026-11-29","2026-04-03","2026-04-04","2026-03-08","2026-05-29"]){
 assert.equal(SELECTED_2026_RECOVERED_SOURCE_PREVIEWS[date],undefined,"Held/rejected source falsely released "+date);
}
assert.equal(fresh.find(x=>x.date==="2026-03-01")?.sourcePhotographer,"Matthieu.lett.ube");
assert.equal(fresh.find(x=>x.date==="2026-03-01")?.imageLicence,"CC BY 4.0");
console.log("PASS 3 exact recovered Class I source previews, 365 date ledger preserved, 137 mapped, 228 exceptions");
