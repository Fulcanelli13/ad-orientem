import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const text=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const read=path=>JSON.parse(text(path));
const audit=read("data/research/historia-salutis-p3-continuous-full-story-seam-audit-20261023.v1.json");
const proof=read(audit.sourceOwners.proof.path);
const manuscript=text(audit.sourceOwners.assembledDouay.path);
const chapterParts=manuscript.split(/^## (\d\d) · (.+)$/gm);
const canonicalAtlas=buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries);
const readingChapters=ATLAS_READING_CHAPTERS;
assert.equal(audit.schema,"ao.historia.p3.uninterrupted-continuous-story-seam-and-length-desk-audit.v1");
assert.equal(audit.status,"SOURCE_DERIVED_SEQUENTIAL_DESK_AUDIT_NOT_A_HUMAN_READ_ALOUD_OR_APPROVAL");
assert.equal(audit.rules.countSelectedScriptureOnly,true);
assert.equal(audit.rules.excludeEditorialConnectorsAndHeldSourceTrials,true);
assert.equal(audit.rules.notAnOralReadThrough,true);
assert.equal(audit.rules.noTheologicalApproval,true);
assert.equal(audit.rules.notUserFacingPublication,true);
assert.equal(audit.rules.noAutomaticNewHistoricalAtlasEvents,true);
assert.equal(audit.sourceOwners.sourceEdition,"dr-challoner");
assert.equal(canonicalAtlas.length,151);
assert.equal(readingChapters.length,37);
assert.equal(proof.movements.length,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(chapterParts.length,1+37*3);
assert.equal(audit.perMovementMetrics.length,37);
assert.equal(audit.betweenMovementSeams.length,36);
const ownerByVerse=new Map(),metrics=[];
for(let i=1;i<chapterParts.length;i+=3){
 const index=+chapterParts[i],title=chapterParts[i+1],body=chapterParts[i+2];
 const movement=proof.movements[index-1];
 assert.equal(movement.sequence,index);
 assert.equal(movement.title,title);
 const selected=[...body.matchAll(/\*\*⟦([1-3]?[A-Za-z]+ \d+:\d+(?:[–-]\d+)?)⟧\*\*\s*\n\s*([^\n]+)/g)].map((m)=>({
  ref:m[1],source:m[2],words:m[2].trim().split(/\s+/)
 }));
 const expected=movement.beats.filter(b=>b.kind==="SCRIPTURE").flatMap(b=>b.refs);
 assert.deepEqual(selected.map(q=>q.ref),expected,"Never rewrite original 93 source units: "+movement.id);
 for(const s of selected){
  const p=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(s.ref);
  assert.ok(p,"Invalid selected coordinate "+s.ref);
  for(let v=+p[3];v<=+(p[4]||p[3]);v++){
   const key=p[1]+" "+p[2]+":"+v;
   assert.ok(!ownerByVerse.has(key),"Duplicate canonical verse "+key);
   ownerByVerse.set(key,movement.id);
  }
 }
 const row=audit.perMovementMetrics[index-1];
 assert.equal(row.movementId,movement.id);
 assert.equal(row.title,movement.title);
 assert.deepEqual(row.originalOutlineIds,movement.originalResearchChapterIds);
 assert.equal(row.sourcePassages,selected.length);
 assert.equal(row.selectedScriptureWords,selected.reduce((a,b)=>a+b.words.length,0));
 assert.equal(row.firstPassage,selected[0].ref);
 assert.equal(row.lastPassage,selected.at(-1).ref);
 assert.equal(row.firstSourceWords,selected[0].words.slice(0,12).join(" "));
 assert.equal(row.lastSourceWords,selected.at(-1).words.slice(-12).join(" "));
 assert.equal(row.editorialContextUnits,movement.beats.filter(b=>b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE").length);
 assert.equal(row.proposedConnectorUnits,movement.beats.filter(b=>b.beforeScriptureConnectorCandidate).length);
 assert.equal(row.heldSourceCandidates,movement.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").length);
 assert.equal(row.sourceVerseDuplicated,false);
 assert.equal(row.oralReadingAccepted,false);
 assert.equal(row.publicationApproved,false);
 metrics.push(row);
}
let critical=0,p1=0,p2=0;
const classifications=new Set(["DIRECT_NARRATIVE","GENEALOGICAL_INTERVAL","HISTORICAL_INTERVAL","MISSING_CAUSAL_PASSAGE","CAUSAL_CONNECTOR","CROSS_GOSPEL_SOURCE","VISION_GENRE_BOUNDARY","DIRECT_VISION_SEQUENCE"]);
for(let i=0;i<audit.betweenMovementSeams.length;i++){
 const t=audit.betweenMovementSeams[i],left=metrics[i],right=metrics[i+1];
 assert.equal(t.id,"HS-HINGE-"+String(i+1).padStart(2,"0"));
 assert.equal(t.fromMovement,left.movementId);
 assert.equal(t.toMovement,right.movementId);
 assert.equal(t.fromLastSelectedSource,left.lastPassage);
 assert.equal(t.fromLastWords,left.lastSourceWords);
 assert.equal(t.toFirstSelectedSource,right.firstPassage);
 assert.equal(t.toFirstWords,right.firstSourceWords);
 assert.ok(classifications.has(t.seamClass));
 assert.ok(["P0","P1","P2"].includes(t.priority));
 assert.ok(t.sourceCriticalFinding.length>70);
 assert.ok(t.proposedAction.length>10);
 assert.equal(t.status,"DESK_REVIEW_HELD_NOT_ORAL_SIGNOFF");
 assert.equal(t.approved,false);
 assert.equal(t.publicationApproved,false);
 assert.equal(t.mayFillWithAIParaphrase,false);
 if(t.priority==="P0")critical++;
 if(t.priority==="P1")p1++;
 if(t.priority==="P2")p2++;
}
const rows=audit.totals;
assert.equal(rows.movements,37);
assert.equal(rows.betweenMovementTransitions,36);
assert.equal(rows.originalScriptureUnitOwners,93);
assert.equal(rows.originalSelectedPassageSpans,metrics.reduce((s,x)=>s+x.sourcePassages,0));
assert.equal(rows.originalSelectedPassageSpans,166);
assert.equal(rows.uniqueSelectedVerseKeys,ownerByVerse.size);
assert.equal(rows.uniqueSelectedVerseKeys,1129);
assert.equal(rows.selectedScriptureVerseDuplicates,0);
assert.equal(rows.selectedDouayChallonerWords,metrics.reduce((s,x)=>s+x.selectedScriptureWords,0));
assert.equal(rows.selectedDouayChallonerWords,28815);
assert.equal(rows.referenceReadingMinutesAt130Wpm,Math.round(rows.selectedDouayChallonerWords/130));
assert.equal(rows.referenceReadingMinutesAt130Wpm,222);
assert.equal(rows.hoursAt130Wpm,3);
assert.equal(rows.minutesRemainderAt130Wpm,42);
assert.equal(rows.criticalP0Transitions,critical);
assert.equal(rows.priorityP1Transitions,p1);
assert.equal(rows.priorityP2Transitions,p2);
assert.deepEqual([critical,p1,p2],[5,20,11]);
for(const [name,test] of [
 ["editorialContextUnits",b=>b.editorialContextUnits],
 ["candidateBeforeScriptureConnectors",b=>b.proposedConnectorUnits],
 ["heldSourceBridgeOwners",b=>b.heldSourceCandidates]
])assert.equal(rows[name],metrics.reduce((s,m)=>s+test(m),0));
assert.equal(rows.editorialContextUnits,29);
assert.equal(rows.candidateBeforeScriptureConnectors,9);
assert.equal(rows.heldSourceBridgeOwners,16);
assert.equal(rows.oralAndTheologicalApprovals,0);
assert.equal(rows.publicationApprovals,0);
assert.deepEqual(audit.pacingDistribution.lessThan300,
 metrics.filter(m=>m.selectedScriptureWords<300).map(m=>m.movementId));
assert.deepEqual(audit.pacingDistribution.moreThan1200,
 metrics.filter(m=>m.selectedScriptureWords>1200).map(m=>m.movementId));
assert.deepEqual(audit.pacingDistribution.longestMovements,
 [...metrics].sort((a,b)=>b.selectedScriptureWords-a.selectedScriptureWords).slice(0,6)
 .map(x=>({id:x.movementId,words:x.selectedScriptureWords})));
assert.deepEqual(audit.pacingDistribution.shortestMovements,
 [...metrics].sort((a,b)=>a.selectedScriptureWords-b.selectedScriptureWords).slice(0,6)
 .map(x=>({id:x.movementId,words:x.selectedScriptureWords})));
for(const id of ["HS-HINGE-02","HS-HINGE-08","HS-HINGE-28","HS-HINGE-33","HS-HINGE-34"]){
 const s=audit.betweenMovementSeams.find(x=>x.id===id);
 assert.equal(s.priority,"P0");
}
const current=proof.movements.find(m=>m.id==="HS-M28").beats;
assert.equal(current.find(b=>b.id==="HS-CF-06").reference,"John 19:38–42");
assert.equal(current.find(b=>b.id==="HS-CF-06").publicationApproved??false,false);
const m8=proof.movements.find(m=>m.id==="HS-M08").beats.find(b=>b.id==="H20-01");
assert.deepEqual(m8.afterSelectedReadthroughTrial.refs,["Exodus 12:29–30"]);
assert.equal(m8.afterSelectedReadthroughTrial.publicationApproved,false);
const rome=proof.movements.find(m=>m.id==="HS-M34").beats;
assert.deepEqual(rome.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").map(b=>b.reference),
 ["Acts 19:21","Acts 28:16","Acts 28:17–22"]);
assert.ok(audit.betweenMovementSeams.every(x=>x.approved===false));
console.log("PASS Historia uninterrupted desk manuscript audit: 37 movements, 36 verified passage hinges (5 P0), 28,815 exact-witness words, 1,129 nonduplicated verse keys, 3h42 at 130 wpm; no oral/print/theological approval.");
