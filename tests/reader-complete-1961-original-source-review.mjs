// Complete 1961 Gregorian source ingestion: no new GABC, no fake notation.
import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {buildFull1961SourceStudy,FULL_SCORE_STUDY_SCHEMA,
 FULL_SCORE_STUDY_SEQUENCE_LEADS} from "../scripts/schola/complete-1961-source-catalogue.mjs";
const root=new URL("../",import.meta.url);
const file=p=>readFileSync(new URL(p,root));
const parse=p=>JSON.parse(file(p).toString("utf8"));
const sourceIndex=parse("data/mass/chant-corpus/gr1961-proper-index.json");
const batches=sourceIndex.batches.map(({path,contentSha256,bytes})=>{
 const raw=file(path);
 assert.equal(raw.length,bytes,path);
 assert.equal(createHash("sha256").update(raw).digest("hex"),contentSha256,path);
 return JSON.parse(raw.toString("utf8"));
});
const baseline=buildFull1961SourceStudy({batches});
const scores=new Map(baseline.entries.map(x=>[x.id,x]));

test("the full existing 1961 bank has 1195 Proper, 20 Ordinary and five imported Sequences",()=>{
 assert.equal(baseline.schema,FULL_SCORE_STUDY_SCHEMA);
 assert.equal(baseline.counts.originalProperGabc,1195);
 assert.equal(baseline.counts.existingOrdinaryGabc,20);
 assert.equal(baseline.counts.importedSequenceGabc,5);
 assert.equal(baseline.counts.sourceGabcTotal,1220);
 assert.equal(scores.size,1220);
 assert.deepEqual(Object.fromEntries(Object.entries(baseline.counts.byRole)
  .filter(([name])=>["INTROIT","GRADUAL","ALLELUIA","TRACT","OFFERTORY","COMMUNION"].includes(name))
  .sort(([a],[b])=>a.localeCompare(b))),{
   ALLELUIA:284,COMMUNION:225,GRADUAL:189,
   INTROIT:229,OFFERTORY:185,TRACT:83
 });
 const ordinary=baseline.entries.filter(s=>s.category==="ORDINARY");
 assert.equal(ordinary.filter(s=>s.role==="GLORIA").length,3);
 assert.equal(ordinary.filter(s=>s.role==="CREDO").length,1);
 for(const x of ordinary){
  assert.match(x.settingId,/^(MASS_\d\d|CREDO_\d\d)$/);
  assert.ok(x.gabc.includes("%%")&&x.gabc.includes("(::)"));
  assert.equal(x.publication,"RESEARCH_ONLY_NOT_MUSICALLY_APPROVED");
 }
 assert.equal(baseline.counts.selected2026.matched,false);
 assert.equal(baseline.publication.automaticMassSettingSelection,false);
 assert.equal(baseline.publication.publicScores,0);
 assert.equal(baseline.publication.musicalApprovals,0);
});
test("Proper GABC and SHA exactly preserve the archive's original musical characters",()=>{
 for(const batch of batches)for(const src of batch.items){
  const item=scores.get(src.id);
  assert.equal(item.category,"PROPER");
  assert.equal(item.role,{
   in:"INTROIT",gr:"GRADUAL",al:"ALLELUIA",tr:"TRACT",
   of:"OFFERTORY",co:"COMMUNION"
  }[src.officePart]);
  assert.equal(item.sourceUrl,src.sourceUrl);
  assert.ok(item.gabc.endsWith(src.gabc),src.id);
  assert.equal(item.originalGabcSha256,src.sha256);
 }
});
test("five 1961 Sequences preserve complete pinned original GregoBase source GABC",()=>{
 assert.equal(FULL_SCORE_STUDY_SEQUENCE_LEADS.length,5);
 assert.equal(baseline.counts.separateUnimportedSequenceLeads,0);
 assert.deepEqual(FULL_SCORE_STUDY_SEQUENCE_LEADS.map(x=>x.sourceId).sort((a,b)=>a-b),
  [68,308,681,1086,1198]);
 const found=baseline.entries.filter(x=>x.category==="SEQUENCE");
 assert.equal(found.length,5);
 for(const sequence of FULL_SCORE_STUDY_SEQUENCE_LEADS){
  const row=scores.get("GREGOBASE-"+sequence.sourceId);
  const original=file("data/mass/chant-corpus/gr1961-sequence-"+sequence.sourceId+".gabc");
  const raw=original.toString("utf8");
  const gitBlob=createHash("sha1").update("blob "+original.length+"\0").update(original).digest("hex");
  assert.equal(sequence.scoreImported,true);
  assert.equal(sequence.sourceBlobSha1,gitBlob);
  assert.equal(row.sourceBlobSha1,gitBlob);
  assert.equal(row.gabc,raw);
  assert.equal(row.originalGabcSha256,createHash("sha256").update(original).digest("hex"));
  assert.equal(row.role,"SEQUENCE");
  assert.equal(row.category,"SEQUENCE");
  assert.equal(row.sourceUrl,sequence.sourceUrl);
  assert.equal(row.folio,sequence.folio);
  assert.deepEqual(row.sourceMatch2026,[]);
  assert.equal(row.publication,"RESEARCH_ONLY_NOT_MUSICALLY_APPROVED");
  assert.match(sequence.sourceUrl,/^https:\/\/gregobase\.selapa\.net\/chant\.php\?id=\d+$/);
 }
});
const first=baseline.entries.find(x=>x.category==="PROPER");
function mockSelected(item=first){
 return {
  schema:"ao-schola-2026-selected-full-1049-source-gabc-review-v1",
  status:"ANNUAL_CALENDAR_SELECTED_1049_SOURCE_REVIEW_ONLY",
  counters:{calendarDays:365,approvedPublicScores:0},
  provenance:{pinnedLatinSourceFiles:1049},
  publication:{publicScores:0},
  matchedReviewOccurrences:[{
   date:"2026-11-11",principalId:"tempora:example",
   sourcePath:"Tempora/Pent24-3",sourceOwner:"Tempora/Pent24-3",
   sourceSection:"Introitus",part:item.part,
   scoreId:item.id,sourceUrl:item.sourceUrl,
   scoreGabcSha256:item.originalGabcSha256,
   selectedParagraphId:"AO.PROPER.2026-11-11.IN",
   pinned1962SourceBlobSha:"a".repeat(40),
   status:"UNIQUE_1962_SOURCE_AND_SCORE_HASH_REVIEW_ONLY",
   publicScore:false
  }]
 };
}
test("source-owned selected Mass matching remains a dated evidence annotation only",()=>{
 const joined=buildFull1961SourceStudy({batches,selected2026:mockSelected()});
 assert.deepEqual(joined.counts.selected2026,{occurrences:1,distinctScores:1,matched:true});
 const matched=joined.entries.find(x=>x.id===first.id);
 assert.equal(matched.sourceMatch2026.length,1);
 assert.equal(matched.sourceMatch2026[0].date,"2026-11-11");
 assert.equal(matched.sourceMatch2026[0].sourceOwner,"Tempora/Pent24-3");
 assert.equal(matched.publication,"RESEARCH_ONLY_NOT_MUSICALLY_APPROVED");
 assert.equal(joined.publication.publicScores,0);
 assert.ok(joined.entries.filter(x=>x.category==="ORDINARY").every(x=>x.sourceMatch2026.length===0),
  "Ordinary Kyriale may never be automatically chosen by calendar source");
});
test("changing source role, score hash, programme approval or edition is rejected",()=>{
 const badRole=mockSelected();badRole.matchedReviewOccurrences[0].part="of";
 assert.throws(()=>buildFull1961SourceStudy({batches,selected2026:badRole}),
  /SOURCE_OR_ROLE_DRIFT/);
 const badHash=mockSelected();badHash.matchedReviewOccurrences[0].scoreGabcSha256="f".repeat(64);
 assert.throws(()=>buildFull1961SourceStudy({batches,selected2026:badHash}),
  /SOURCE_OR_ROLE_DRIFT/);
 const fakeApproval=mockSelected();fakeApproval.publication.publicScores=1;
 assert.throws(()=>buildFull1961SourceStudy({batches,selected2026:fakeApproval}),
  /CROSSWALK_INVALID/);
 const mutation=structuredClone(batches);mutation[0].items[0].gabc+="(g)";
 assert.throws(()=>buildFull1961SourceStudy({batches:mutation}),/HASH_DRIFT/);
});
test("offline HTML uses vendored Exsurge; no drawn substitute or generated Mass setting",()=>{
 const html=file("tools/mass/complete-1961-source-review-template.html").toString("utf8");
 assert.match(html,/__SOURCE_CATALOGUE_JSON__/);
 assert.match(html,/__VENDORED_EXSURGE_JS__/);
 assert.match(html,/createMappingsFromSource\(ctx,score\.gabc\)/);
 assert.match(html,/No setting is assigned automatically/);
 assert.match(html,/No scores on this page are approved/);
 assert.doesNotMatch(html,/setScholaProgress|setInterval\(|playNote\(|oscillator/i);
});
