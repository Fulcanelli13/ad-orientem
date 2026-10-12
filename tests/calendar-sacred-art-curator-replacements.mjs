import assert from "node:assert/strict";
import{readFileSync}from"node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const review=read("data/calendar/sacred-art-curator-decisions-20261011.v1.json");
const source=read("data/calendar/sacred-art-user-refusal-replacements.v1.json");
const arts=read("data/calendar/sacred-art-candidates.v1.json").artworks;
const crosswalk=read("data/calendar/sacred-art-editorial-crosswalk.v1.json");
const byArt=new Map(arts.map(a=>[a.id,a]));
const byRefusal=new Set(review.refusals.map(r=>r.targetId+"|"+r.artworkId));
assert.equal(source.schema,"AO_SACRED_ART_USER_REFUSAL_REPLACEMENTS_V1");
assert.equal(source.leads.length,14);
assert.deepEqual(source.userRefusalCounts,{"devotion.adoration":13,"devotion.st-joseph":16,"scripture.healing-paralytic":1});
for(const l of source.leads){
 assert.ok(/^https:\/\//.test(l.museumObjectUrl),"Source provenance link required");
 assert.ok(l.medium.includes("oil")||l.medium==="painting on canvas");
 assert.ok(l.curatorialReason.length>25);
 assert.equal(l.publicationApproval,false);
 assert.equal(l.artisticApproval,false);
 assert.equal(l.observed1962DateApproved,false);
 assert.ok(["devotion.adoration","devotion.st-joseph","scripture.healing-paralytic"].includes(l.targetId));
}
const direct=source.leads.filter(l=>l.targetId==="devotion.adoration"&&l.iconographyRelation==="DIRECT_HOST_ADORATION");
assert.deepEqual(direct.map(x=>x.id),["met-438434"]);
for(const[id,expectedTag,sha]of[
 ["met-438434","adoration-of-host","973f73b66952bf34619cc75c6f6bfb38109a8877e95b48655605576c552ad934"],
 ["met-437527","glorification-eucharist","521b3051abc5f86aa0d069f884fb731cbd339160f1667d8472ee6b35dc72ca65"]]){
 const a=byArt.get(id);
 assert.ok(a,"Reconciled museum art missing: "+id);
 assert.equal(a.acquisition?.originalSha256,sha);
 assert.equal(a.acquisition?.artifactId,11707214604);
 assert.equal(a.review.artistic,"PENDING_HUMAN_CURATOR");
 assert.equal(a.tags.artCuratorApproval,false);
 assert.equal(a.tags.phoneHeroCropApproval,false);
 assert.ok(a.tags.iconography.includes(expectedTag));
 assert.ok(crosswalk.exactIconography["devotion.adoration"].includes(expectedTag));
 assert.ok(!review.approvals.some(x=>x.artworkId===id),"Never declare new unreviewed art approved");
 assert.ok(!byRefusal.has("devotion.adoration|"+id));
}
assert.ok(source.leads.some(l=>l.id==="national-gallery-ng5931"&&l.iconographyRelation==="JOHN_5_BETHESDA_NOT_MATTHEW_9_CAPERNAUM"),
 "Biblical Gospel episode distinction must remain explicit");
assert.ok(source.leads.some(l=>l.id==="louvre-mi-304"&&l.museumObjectUrl.includes("cl010053084")),
 "Preserve Notre-Dame Paris Bon Boullogne replacement lead");
for(const [subject,id] of [["calendar.holy-thursday","met-459131"],["calendar.saint-joseph","cma-160143"]])
 assert.ok(review.selections.some(x=>x.targetId===subject&&x.artworkId===id),"Keep earlier accepted art selections");
console.log("PASS: 14 museum leads, 2 hashed Met Eucharist images, no curator/rights/day promotion");
