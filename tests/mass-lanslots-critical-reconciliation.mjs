// Research-only verification of Lanslots' doctrinal and historical source-critical warnings.
// Run: node tests/mass-lanslots-critical-reconciliation.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const review=load("data/research/mass-lanslots-1897-doctrinal-historical-critical-review.v1.json");
const boundaries=load("data/research/mass-lanslots-1897-chapter-ocr-boundaries.v1.json");
const live=load("data/research/mass-lanslots-1897-source-first39-map.v1.json");
const micro=load("data/research/mass-fr-gueranger-microguide-batch02.v1.json");
const sung=load("data/presentation/reader-text-sung.v1.json");
const ownerIds=new Set(live.rows.map(x=>x.sectionId));
const frenchIds=new Set(micro.items.map(x=>x.id));
const allCues=new Map(sung.blocks.flatMap(x=>x.units.map(u=>[u.cue_id,u.latin||""])));
assert.equal(review.count,10,"10 verified/flagged critical issues expected");
assert.equal(review.records.length,10);
assert.equal(new Set(review.records.map(x=>x.id)).size,10,"IDs must be unique");
for(const record of review.records){
  assert.equal(record.publication,"BLOCKED","not published "+record.id);
  assert.equal(record.originalImageAndIndependentFrenchApproved,false,"review not complete");
  assert(record.authorArgument?.length>40&&record.criticalAnalysis?.length>40&&record.frenchSubstantiveDraft?.length>40,"substantive source/assessment/french required");
  const chapter=boundaries.records.find(x=>x.chapter===record.chapter);
  assert(chapter,"missing chapter "+record.chapter);
  assert(record.originalOcr.webLineStart>=chapter.webOcrHeadingLine,"invalid original line start "+record.id);
  assert(chapter.webOcrNextHeadingLineExclusive===null||record.originalOcr.webLineEnd<chapter.webOcrNextHeadingLineExclusive,"invalid original line end "+record.id);
  for(const id of record.sourceFirstOwnerIds)assert(ownerIds.has(id),"unknown live owner "+id);
  for(const id of record.existingGuerangerOverlaps)assert(frenchIds.has(id),"unknown Guéranger source "+id);
  for(const id of record.independentAuthorityIds)assert(review.independentAuthorities[id]?.url?.startsWith("https://"),"unknown primary authority "+id);
}
const inspiration=review.records.find(x=>x.id==="L1897-DISC-01");
assert(inspiration.independentAuthorityIds.includes("PD"));
assert(inspiration.independentAuthorityIds.includes("DAS"));
assert(inspiration.independentAuthorityIds.includes("DV"));
const angel=review.records.find(x=>x.id==="L1897-DISC-02");
assert.equal(angel.classification,"CONTESTED_EXEGESIS");
assert(angel.existingGuerangerOverlaps.includes("FRG44"));
const commixture=review.records.find(x=>x.id==="L1897-DISC-03");
assert(commixture.existingGuerangerOverlaps.includes("FRG57"));
const joseph=review.records.find(x=>x.id==="L1897-DISC-10");
assert.equal(joseph.exactSourceCue,"AO.SM.C0159");
assert.equal(joseph.sourceFirstOwnerIds[0],"AO.CANON.03");
assert.equal(joseph.independentAuthorityIds[0],"SRC62JOSEPH");
assert(allCues.get("AO.SM.C0159")?.includes("beati Ioseph"),"1962 St Joseph insertion missing from source");
assert(joseph.criticalAnalysis.includes("8 December 1962"));
console.log("PASS: 10 historically/source-critical cases; original OCR ranges, Guéranger crosslinks, 1962 Canon Joseph amendment, no public promotion.");
