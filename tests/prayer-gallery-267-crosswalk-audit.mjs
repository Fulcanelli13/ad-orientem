import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAYER_ART_EDITORIAL_SLOTS_V1} from "../src/pray/editorial-artwork-assignments.v1.js";
import {resolvePrayerEditorialArtwork,prayerEditorialPublicationSummary} from "../src/pray/art-slot-map.v1.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const p="data/prayer/artwork-editorial-20261101/";
const audit=JSON.parse(read(p+"gallery-archive-crosswalk-267-20261103.v1.json"));
const master=JSON.parse(read(p+"curatorial-master-267-20261101.v1.json"));
const gallery=JSON.parse(read("data/artwork/research-semantic-candidates-989.v1.json"));
const norm=s=>String(s??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const k=(artist,title)=>norm(artist)+"|"+norm(title);
const galleryByWork=new Map();
for(const g of gallery.artworks){
 const key=k(g.artist,g.title);
 galleryByWork.set(key,[...(galleryByWork.get(key)||[]),g.workGroupId]);
}
assert.equal(audit.authority,"AUDIT_ONLY_NO_NEW_APPROVAL_NO_AUTOMATIC_PUBLICATION");
assert.equal(master.publicationAllowed,false);
assert.equal(audit.assignments.length,267);
assert.equal(master.assignments.length,267);
assert.equal(new Set(audit.assignments.map(x=>x.slot)).size,267);
assert.equal(gallery.artworks.length,989);
const masterById=new Map(master.assignments.map(x=>[x.slot,x]));
let matched=0,unique=0,ambiguous=0;
const groupIDs=new Set();
for(const row of audit.assignments){
 const editorial=masterById.get(row.slot);
 const compiled=PRAYER_ART_EDITORIAL_SLOTS_V1[row.slot];
 assert.ok(editorial&&compiled,"Unknown slot "+row.slot);
 assert.equal(row.kind,editorial.kind,row.slot);
 assert.equal(row.editorial.status,compiled.editorialStatus,row.slot);
 assert.equal(row.editorial.approvedOrInherited,compiled.approvedOrInherited,row.slot);
 assert.equal(row.editorial.hold,compiled.hold,row.slot);
 assert.equal(row.editorial.protectedCover,compiled.protectedCover,row.slot);
 assert.equal(row.sourceIdentity.verified,compiled.sourceIdentityVerified,row.slot);
 assert.equal(row.painting?.artist||null,compiled.selected?.artist||null,row.slot);
 assert.equal(row.painting?.title||null,compiled.selected?.title||null,row.slot);
 assert.equal(row.painting?.sourcePage||null,compiled.selected?.sourcePage||null,row.slot);
 assert.equal(row.currentRuntime.state,resolvePrayerEditorialArtwork(row.slot).state,
  "Snapshot runtime has changed; regenerate audit after image releases: "+row.slot);
 assert.equal(row.publicationEnabledByAudit,false,"Never publish from this audit");
 const expected=row.painting?(galleryByWork.get(k(row.painting.artist,row.painting.title))||[]):[];
 assert.deepEqual(row.gallery989.groupIDs,expected,"Wrong gallery match: "+row.slot);
 if(expected.length){matched++;if(expected.length===1)unique++;else ambiguous++}
 for(const id of expected)groupIDs.add(id);
 if(["EDITORIAL_HOLD","SCOPE_HOLD","PROTECTED_EXISTING_COVER","PROVISIONAL_NOT_PUBLISHED"].includes(row.currentRuntime.state))
  assert.equal(row.currentRuntime.renderedPhoto,null,"Forbidden photo release: "+row.slot);
 for(const archived of row.archive20.records){
  assert.ok(archived.module,"Missing archived provenance");
  assert.equal(row.archive20.branch,"research/approved-module-20-source-consolidation-20261102");
  assert.ok(!archived.gitBlobSHA||/^[a-f0-9]{40}$/i.test(archived.gitBlobSHA));
  assert.ok(!archived.expectedSHA256||/^[a-f0-9]{64}$/i.test(archived.expectedSHA256));
 }
}
assert.equal(audit.counts.gallery989ExactTitleArtistPositions,matched);
assert.equal(audit.counts.gallery989UniqueGroupPositions,unique);
assert.equal(audit.counts.gallery989AmbiguousGroupPositions,ambiguous);
assert.equal(audit.counts.gallery989UniqueMatchedGroupIDs,groupIDs.size);
assert.deepEqual(audit.counts.states,prayerEditorialPublicationSummary().states);
assert.equal(audit.counts.pendingDistinctWorkSourceKeys,audit.pendingDistinctWorksByPotentialReuse.length);
for(const work of audit.pendingDistinctWorksByPotentialReuse){
 assert.equal(work.publicationPermission,false);
 assert.ok(work.positionCount>0);
 assert.equal(work.slots.length,work.positionCount);
 for(const id of work.slots)assert.equal(resolvePrayerEditorialArtwork(id).state,"APPROVED_EXACT_PHOTO_PENDING");
}
console.log("PASS: 267 Prayer positions mapped; "+matched+" gallery-title matches; "+audit.counts.states.PUBLISHED_EXACT_PHOTO+" currently published matches; no research-only image publication");
