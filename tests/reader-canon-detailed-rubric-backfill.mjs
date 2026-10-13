import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCanonDetailedRubricBackfill,createCanonDetailedRubricEditorialController}
  from "../src/mass/reader-canon-detailed-rubric-backfill.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const witnesses={
 backfill:read("../data/research/mass-canon-42-detailed-rubric-editorial-backfill-20261013.json"),
 canonData:read("../data/presentation/reader-canon-rubric-review.v1.json"),
 gapData:read("../data/research/mass-canon-14-rubric-registry-gap-audit-20261013.json"),
 triggerAudit:read("../data/research/mass-canon-62-source-trigger-audit-20261013.json"),
 frenchReview:read("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json"),
};
const audit=validateCanonDetailedRubricBackfill(witnesses);
assert.equal(audit.sourceGaps,42);
assert.equal(audit.candidateCoverage,42);
assert.equal(audit.newlyPublished,0);
assert.equal(audit.pendingPublicationApprovals,42);
assert.equal(audit.publishedDetailedCues,13);
assert.deepEqual(audit.anchorClasses,{SOURCE_LATIN_WORDS:40,ORDERED_NON_TEXT_CEREMONY:2});
assert.equal(audit.rows.length,42);
const seen=new Set();
for(const row of audit.rows){
 assert.ok(!seen.has(row.cueId),row.cueId+": duplicate rubric owner");seen.add(row.cueId);
 assert.equal(row.canPublish,false);
 assert.equal(row.publishable,false);
 assert.ok(row.draftFrenchRubric.length>15,row.cueId+": no substantive French candidate");
 assert.ok(row.sourceUrls.every(url=>url.startsWith("https://")),row.cueId+": source links absent");
 assert.equal(row.actor,"PRIEST");
 assert.ok(/^AO\.CANON\.R62\.\d{3}$/.test(row.actionId));
}
const c0180=audit.rows.find(x=>x.cueId==="AO.SM.C0180");
assert.equal(c0180.latinAnchor,"Haec quotiescumque feceritis");
assert.equal(c0180.stageIds.length,3,
 "Latin word anchor and separately witnessed ordered actions must coexist");
const c0205=audit.rows.find(x=>x.cueId==="AO.SM.C0205");
assert.equal(c0205.formOwnedStages.length,1);
assert.equal(c0205.formOwnedStages[0].solemnActor,"DEACON_WHEN_REQUIRED");
assert.equal(c0205.formOwnedStages[0].solemnMinisterActionId,"AO.CANON.MIN.008");
const c0175=audit.rows.find(x=>x.cueId==="AO.SM.C0175");
assert.match(c0175.draftFrenchRubric,/à la messe solennelle, le diacre le découvre lorsque cela est nécessaire/,
 "No universal celebrant-only chalice uncovering claim");
assert.ok(!seen.has("AO.SM.C0155"),"Existing published rubric cue must never be replaced");
assert.ok(!seen.has("AO.SM.C0174"),"Existing multi-stage Host rubric must not be backfilled");
assert.ok(!seen.has("AO.SM.C0181"),"Existing chalice rubric must not be duplicated");
for(const noUniqueAction of ["AO.SM.C0159","AO.SM.C0163","AO.SM.C0207"])
 assert.ok(!seen.has(noUniqueAction),"Do not invent a priest action at "+noUniqueAction);
const controller=createCanonDetailedRubricEditorialController(witnesses);
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const preview=controller.project("AO.SM.C0150",{editorialPreview:true,form});
 assert.equal(preview.previewEnabled,true);
 assert.equal(preview.candidate.cueId,"AO.SM.C0150");
 assert.equal(preview.candidate.isObservedNow,false);
 assert.equal(preview.candidate.formReviewRequired,true);
 assert.equal(preview.candidate.canPublish,false);
 assert.equal(preview.candidate.actorClock,"INDEPENDENT_OBSERVATION_REQUIRED");
}
assert.equal(controller.project("AO.SM.C0150").candidate,null,"Must never leak French copy to live");
assert.equal(controller.project("AO.SM.C0150",{editorialPreview:true,form:"UNSUPPORTED"}).candidate,null);
assert.equal(controller.project("AO.SM.C0155",{editorialPreview:true}).candidate,null);
assert.equal(controller.project("AO.SM.C0207",{editorialPreview:true}).candidate,null);
const m=structuredClone(witnesses);m.backfill.items[0].cueId="AO.SM.C0174";
assert.throws(()=>validateCanonDetailedRubricBackfill(m),/ownership drift/);
const n=structuredClone(witnesses);n.backfill.items[0].publication="PUBLISHED";
assert.throws(()=>validateCanonDetailedRubricBackfill(n),/linkage drift/);
const x=structuredClone(witnesses);x.backfill.items[0].sourceActionId="AO.CANON.R62.002";
assert.throws(()=>validateCanonDetailedRubricBackfill(x),/linkage drift/);
const y=structuredClone(witnesses);y.backfill.items[0].latinAnchor="wrong";
assert.throws(()=>validateCanonDetailedRubricBackfill(y),/linkage drift/);
const z=structuredClone(witnesses);z.backfill.items[0].editorialState="APPROVED";
assert.throws(()=>validateCanonDetailedRubricBackfill(z),/linkage drift/);
const inaccurateOwner=structuredClone(witnesses);
inaccurateOwner.backfill.items.find(x=>x.cueId==="AO.SM.C0205").formOwnedStages=[];
assert.throws(()=>validateCanonDetailedRubricBackfill(inaccurateOwner),/stage actor ownership/);
const released=structuredClone(witnesses);released.frenchReview.rows[0].reviewState="PUBLISHED";
assert.throws(()=>validateCanonDetailedRubricBackfill(released),/linkage drift/);
console.log("PASS: 42/42 source-linked Canon published-detail gaps staged for review; 13 existing untouched; 0 published; no live gesture inference.");
