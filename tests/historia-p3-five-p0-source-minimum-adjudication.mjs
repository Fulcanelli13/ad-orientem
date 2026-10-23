import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const doc=read("data/research/historia-salutis-p3-five-p0-source-minimum-adjudication-20261023.v1.json");
const proof=read(doc.proof.path);
const fullAudit=read(doc.seamAudit.path);
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const books=["Genesis","Exodus","John","Acts","Revelation"];
const atlas=buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries);
assert.equal(doc.schema,"ao.historia.p3.five-critical-hinges-source-minimum-options.v1");
assert.equal(doc.status,"SOURCE_BOUND_COMPARATIVE_RESEARCH_ONLY_NO_ADOPTED_PASSAGE_CHANGES");
assert.equal(doc.policies.canonicalSourcePassagesModified,false);
assert.equal(doc.policies.recommendedOptionsNotFinalApprovals,true);
assert.equal(doc.policies.noHistoricalCoordinates,true);
assert.equal(doc.policies.noNewBibleReaderOrAtlas,true);
assert.equal(doc.policies.nonScripturalGenreHeadingMustBeExplicitlyLabeled,true);
assert.equal(doc.headings.totalHinges,5);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(proof.movements.length,37);
assert.equal(atlas.length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(doc.textWitnesses.length,15);
assert.deepEqual(doc.textWitnesses.map(x=>x.edition+"|"+x.book),
 editions.flatMap(ed=>books.map(book=>ed+"|"+book)));
const map=new Map();
for(const ed of editions)for(const book of books){
 const row=doc.textWitnesses.find(r=>r.edition===ed&&r.book===book);
 assert.ok(row?.sha&&row.path==="data/scripture/witness/"+ed+"/"+book+".json");
 const src=read(row.path);
 assert.equal(src.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 assert.equal(src.editionId,ed);
 assert.equal(src.book,book);
 assert.equal(row.sourceStatus,src.sourceStatus);
 map.set(ed+"|"+book,new Map(src.verses.map(([ch,v,text])=>[ch+":"+v,text])));
}
function wordsFor(refs,ed){
 let verses=0,words=0,seen=new Set();
 for(const ref of refs){
  const p=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref);
  assert.ok(p,"Original source coordinate malformed "+ref);
  const index=map.get(ed+"|"+p[1]);assert.ok(index,"Witness unavailable "+ed+" "+p[1]);
  for(let v=+p[3];v<=+(p[4]||p[3]);v++){
   const key=p[1]+" "+p[2]+":"+v;
   assert.ok(!seen.has(key),"No duplicate verses in a single option: "+key);
   seen.add(key);
   const verse=index.get(p[2]+":"+v);
   assert.ok(verse?.trim(),"Unattested source in "+ed+": "+key);
   words+=verse.trim().split(/\s+/).length;verses++;
  }
 }
 return {verseEntries:verses,sourceWords:words,validated:true};
}
assert.deepEqual(doc.options.map(x=>x.hinge),
 ["HS-HINGE-02","HS-HINGE-08","HS-HINGE-28","HS-HINGE-33","HS-HINGE-34"]);
const optionCounts=[3,1,3,2,3];
for(let i=0;i<doc.options.length;i++){
 const q=doc.options[i],seam=fullAudit.betweenMovementSeams.find(x=>x.id===q.hinge);
 assert.ok(seam,"Unknown high-severity source hinge");
 assert.equal(seam.priority,"P0");
 assert.equal(q.fromMovement,seam.fromMovement);
 assert.equal(q.toMovement,seam.toMovement);
 assert.equal(q.firstSelectedAfter,seam.toFirstSelectedSource);
 assert.equal(q.lastSelectedBefore,seam.fromLastSelectedSource);
 assert.equal(q.selectionNotApplied,true);
 assert.equal(q.sourceDeskAcceptedAsFinal,false);
 assert.equal(q.printEditionCollationApproved,false);
 assert.equal(q.theologicalApproval,false);
 assert.equal(q.oralLiteraryApproval,false);
 assert.equal(q.noAutoPublication,true);
 assert.equal(q.choices.length,optionCounts[i]);
 assert.ok(q.causalNeed.length>=60);
 assert.ok(q.requiredNonSourceContext.length>=60);
 const owner=proof.movements.find(x=>x.id===q.destination)?.beats.find(b=>b.id===q.ownerBeat);
 assert.ok(owner,"No invented new Historia owner or beat");
 for(const option of q.choices){
  assert.equal(option.sourceStatus,"EXACT_UNCOLLATED_CATHOLIC_WITNESS");
  assert.equal(option.publicationApproved,false);
  assert.equal(option.oralValidated,false);
  assert.ok(option.reason.length>=75);
  for(const ed of editions){
   assert.deepEqual(option.measurements[ed],wordsFor(option.refs,ed),
    "Original source budgets cannot be guessed or shared across language witnesses: "+option.id+" "+ed);
  }
 }
}
const get=(hinge,id)=>doc.options.find(q=>q.hinge===hinge).choices.find(q=>q.id===id);
const ark=get("HS-HINGE-02","ARK_EXISTING_P3_TRIAL");
assert.deepEqual(ark.refs,["Genesis 6:9–14","Genesis 6:17–22"]);
assert.equal(ark.measurements["dr-challoner"].verseEntries,12);
assert.equal(ark.measurements["dr-challoner"].sourceWords,285);
assert.deepEqual(get("HS-HINGE-02","ARK_MORE_AGGRESSIVE_SEVEN_VERSES").refs,
 ["Genesis 6:9","Genesis 6:13–14","Genesis 6:17–19","Genesis 6:22"]);
assert.equal(get("HS-HINGE-02","ARK_MORE_AGGRESSIVE_SEVEN_VERSES").measurements["dr-challoner"].verseEntries,7);
assert.deepEqual(proof.movements.find(m=>m.id==="HS-M03").beats.find(b=>b.id==="HS-CF-01").readthroughTrial.refs,ark.refs);
const firstborn=get("HS-HINGE-08","FIRSTBORN_TWO_VERSES");
assert.deepEqual(firstborn.refs,["Exodus 12:29–30"]);
assert.equal(firstborn.measurements["dr-challoner"].verseEntries,2);
assert.deepEqual(proof.movements.find(m=>m.id==="HS-M08").beats.find(b=>b.id==="H20-01").afterSelectedReadthroughTrial.refs,firstborn.refs);
const burial=get("HS-HINGE-28","JOHN_BURIAL_FIVE_VERSES");
const side=get("HS-HINGE-28","PIERCED_SIDE_SEPARATE_WITNESS");
assert.deepEqual(burial.refs,["John 19:38–42"]);
assert.deepEqual(side.refs,["John 19:31–37"]);
assert.equal(burial.measurements["dr-challoner"].verseEntries,5);
assert.equal(side.measurements["dr-challoner"].verseEntries,7);
assert.deepEqual(proof.movements.find(m=>m.id==="HS-M28").beats.find(b=>b.id==="HS-CF-06").readthroughTrial.refs,burial.refs);
assert.deepEqual(proof.movements.find(m=>m.id==="HS-M28").beats.find(b=>b.id==="H64-01").afterSelectedReadthroughTrial.refs,side.refs);
assert.equal(get("HS-HINGE-28","JOHN_COMPLETE_AFTER_DEATH").measurements["dr-challoner"].sourceWords,
 side.measurements["dr-challoner"].sourceWords+burial.measurements["dr-challoner"].sourceWords);
const rome=get("HS-HINGE-33","ROME_ARRIVAL_AND_FULL_AUDIENCE");
assert.deepEqual(rome.refs,["Acts 28:16","Acts 28:17–22"]);
assert.equal(rome.measurements["dr-challoner"].verseEntries,7);
const m34=proof.movements.find(m=>m.id==="HS-M34");
assert.deepEqual(m34.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").map(b=>b.reference),
 ["Acts 19:21","Acts 28:16","Acts 28:17–22"]);
assert.deepEqual(get("HS-HINGE-34","VISION_GENRE_HEADING_ONLY").refs,[]);
assert.deepEqual(get("HS-HINGE-34","OPEN_HEAVENLY_VISION").refs,["Revelation 4:1–2"]);
assert.deepEqual(get("HS-HINGE-34","JOHN_PATMOS_AND_THRONE").refs,
 ["Revelation 1:9–11","Revelation 4:1–2"]);
assert.equal(proof.movements.find(m=>m.id==="HS-M35").beats.find(b=>b.id==="HS-P3-CF-14").reference,"Revelation 4:1–2");
assert.ok(!proof.movements.find(m=>m.id==="HS-M35").beats.some(b=>b.kind==="SCRIPTURE"&&b.refs.some(r=>r.startsWith("Revelation 1:9"))));
assert.deepEqual(doc.headings.preferredOrNeededSourceVerseCounts,
 {genesisArk:12,passover:2,johnBurial:5,romeArrivalAndAudience:7,actsToRevelationGenreLabel:0});
// Count-equality alone cannot establish content identity: assert the five actual
// causal/genre anchors in every original Catholic witness at their verse keys.
for(const ed of editions){
 const src=(book,chapter,verse)=>map.get(ed+"|"+book).get(chapter+":"+verse);
 const french=ed==="crampon-1923";
 assert.match(src("Genesis",6,14),french?/arche/i:/ark/i);
 assert.match(src("Genesis",6,18),french?/alliance/i:/covenant/i);
 assert.match(src("Exodus",12,29),french?/premiers.nés/i:/firstborn/i);
 assert.match(src("Exodus",12,30),french?/Pharaon/i:/Pharaoh|Pharao/i);
 assert.match(src("John",19,34),french?/sang/i:/blood/i);
 assert.match(src("John",19,34),french?/eau/i:/water/i);
 assert.match(src("John",19,38),french?/Joseph.*Arimathie/i:/Joseph.*Arimathea/i);
 assert.match(src("John",19,42),french?/déposèrent Jésus/i:/laid Jesus|placed Jesus/i);
 assert.match(src("Acts",28,16),/Rome/i);
 assert.match(src("Acts",28,22),french?/entendre/i:/hear/i);
 assert.match(src("Revelation",1,9),/Patmos/i);
 assert.match(src("Revelation",4,2),french?/trône/i:/throne/i);
}
assert.equal(doc.options.every(q=>q.choices.every(c=>c.publicationApproved===false)),true);
console.log("PASS Historia five P0 source-economy decisions: 12 unapproved options, 15 Catholic source witness files, original-source word counts, no publication, no altered 93 source units or 151 Atlas objects.");
