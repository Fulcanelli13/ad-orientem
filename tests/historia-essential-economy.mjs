import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const audit=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-necessity-audit.v1.json",import.meta.url),"utf8"));
const spine=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-main-spine-consolidation.v1.json",import.meta.url),"utf8"));
const economy=JSON.parse(readFileSync(
 new URL("../data/research/historia-salutis-v18-essential-verse-economy.v1.json",import.meta.url),"utf8"));

assert.equal(economy.schema,"ao.historia.v18.essential-verse-economy.v1");
assert.equal(economy.status,"EDITORIAL_PROVISIONAL_VERSE_COORDINATES_ONLY");
assert.deepEqual(economy.counts,{essential:93,edited:30,protected:31,unchanged:22,editionCorrections:2,priorContinuityRestorations:1,literaryContinuityExpansions:6,literaryContextRebalances:1});
assert.equal(economy.decisions.length,93);
assert.equal(economy.canonical.originalV18Chapters,78);
assert.equal(economy.canonical.originalV18Segments,217);
assert.equal(economy.canonical.secondExtendedBibleExperience,false);

function decodeBibleSequence(raw,baseBook="",baseChapter=0){
 let book=baseBook,chapter=baseChapter;
 const parts=[],notes=[];
 for(let part of raw.replaceAll("—","–").split(/[,;]/)){
  part=part.trim();
  if(!part)continue;
  const bookMatch=part.match(/^((?:[1-3]\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(?=\d+:)/);
  if(bookMatch){book=bookMatch[1].replace(/\s+/g,"");part=part.slice(bookMatch[0].length);}
  const chapterMatch=part.match(/^(\d+):/);
  if(chapterMatch){chapter=Number(chapterMatch[1]);part=part.slice(chapterMatch[0].length);}
  const verseMatch=part.match(/^(\d+)([a-d])?(?:[–-](?:(\d+):)?(\d+)([a-d])?)?$/i);
  assert.ok(verseMatch&&book&&chapter,
   "Unreadable original or selected verse notation: "+raw+" fragment "+part);
  const endChapter=verseMatch[3]?Number(verseMatch[3]):chapter;
  const end=verseMatch[4]?Number(verseMatch[4]):Number(verseMatch[1]);
  assert.ok(endChapter>=chapter&&
   (endChapter>chapter||end>=Number(verseMatch[1])),"Reversed reading: "+raw);
  if(verseMatch[2]||verseMatch[5])notes.push("PART_VERSE_NO_EDITORIAL_CERTIFICATION");
  parts.push({book,chapter,start:Number(verseMatch[1]),endChapter,end});
 }
 return {parts,book,chapter,notes};
}
const original=new Map(),v18=new Map();
let lastBook="",lastChapter=0;
for(const u of audit.units){
 original.set(u.unitId,u);
 const r=decodeBibleSequence(u.sourceReferenceOriginal,lastBook,lastChapter);
 lastBook=r.book;lastChapter=r.chapter;
 v18.set(u.unitId,r);
}
const witnessCache=new Map();
function witness(edition,book){
 const id=edition+":"+book;
 if(!witnessCache.has(id)){
  const data=JSON.parse(readFileSync(
   new URL("../data/scripture/witness/"+edition+"/"+book+".json",import.meta.url),"utf8"));
  assert.equal(data.editionId,edition);
  const chapters=new Map();
  for(const [ch,v] of data.verses){
   if(!chapters.has(ch))chapters.set(ch,new Set());
   chapters.get(ch).add(v);
  }
  witnessCache.set(id,chapters);
 }
 return witnessCache.get(id);
}
function coords(piece,edition){
 const result=[],chapters=witness(edition,piece.book);
 for(let chapter=piece.chapter;chapter<=piece.endChapter;chapter++){
  const verses=chapters.get(chapter);
  assert.ok(verses&&verses.size,
   "Missing Catholic witness: "+edition+" "+piece.book+" "+chapter);
  const start=chapter===piece.chapter?piece.start:1;
  const end=chapter===piece.endChapter?piece.end:Math.max(...verses);
  for(let verse=start;verse<=end;verse++){
   assert.ok(verses.has(verse),
    "Missing verse "+edition+" "+piece.book+" "+chapter+":"+verse);
   result.push(piece.book+":"+chapter+":"+verse);
  }
 }
 return result;
}
const priorCorrection=JSON.parse(readFileSync(new URL("../data/research/historia-salutis-v18-part-ii-correction-delta.v1.json",import.meta.url),"utf8"));
const continuityExpansions=new Map([
 ["H11-02",["Genesis:15:9","Genesis:15:10","Genesis:15:13","Genesis:15:14"]],
 ["H13-01",["Genesis:22:3","Genesis:22:4","Genesis:22:5"]],
 ["H16-03",["Genesis:41:25","Genesis:41:26","Genesis:41:27","Genesis:41:28","Genesis:41:29","Genesis:41:30",
            "Genesis:41:33","Genesis:41:34","Genesis:41:35","Genesis:41:36"]],
 ["H22-01",["Exodus:19:1","Exodus:19:2"]],
 ["H30-01",Array.from({length:9},(_,i)=>"1Samuel:16:"+(i+1))],
 ["H33-01",Array.from({length:7},(_,i)=>"2Samuel:7:"+(i+1))],
 ["H39-01",["2Kings:17:3","2Kings:17:4"]]
]);
const seen=new Set(),stats={edited:0,protected:0,unchanged:0,editionCorrections:0,priorContinuityRestorations:0,literaryContinuityExpansions:0,literaryContextRebalances:0,halfVerses:0},books=new Set();
let originalVerseCount=0,selectedVerseCount=0;
for(const decision of economy.decisions){
 assert.ok(!seen.has(decision.unitId),"No duplicated v18 identity");
 seen.add(decision.unitId);
 const owner=original.get(decision.unitId);
 assert.ok(owner&&owner.disposition==="A","No B/C/D content may be promoted by compression");
 assert.equal(decision.originalV18SourceReference,owner.sourceReferenceOriginal);
 assert.ok(spine.movements.some(m=>m.id===decision.movementId&&
  m.indispensable.sourceUnitIds.includes(decision.unitId)));
 assert.equal(decision.reviewApproved,false);
 assert.equal(decision.approvedForProduction,false);
 assert.equal(decision.sourceTextCollatedAgainstPrintedEditions,false);
 const source=v18.get(decision.unitId),v18Codes=[];
 const editionRepair=decision.selectionStatus==="EDITION_AWARE_REFERENCE_CORRECTION";
 const seamRepair=decision.selectionStatus==="PRIOR_SOURCE_CONTINUITY_RESTORED";
 const literaryExpansion=decision.selectionStatus==="LITERARY_CONTINUITY_EXPANSION";
 const rebalanced=decision.selectionStatus==="LITERARY_CONTEXT_REBALANCED";
 for(const piece of source.parts){
  if(editionRepair){
   assert.ok(["H15-02","H68-04"].includes(decision.unitId));
   v18Codes.push(...coords(piece,"crampon-1923"));
  }else{
   const cp=coords(piece,"cpdv-2009"),dr=coords(piece,"dr-challoner");
   assert.deepEqual(cp,dr,"Edition coordinates must be verified separately");
   v18Codes.push(...cp);
  }
 }
 const universe=new Set(v18Codes),chosen=[];
 for(const excerpt of decision.proposedSelectedReferences){
  const s=decodeBibleSequence(excerpt,source.book,source.chapter);
  for(const piece of s.parts){
   books.add(piece.book);
   const cp=coords(piece,"cpdv-2009"),dr=coords(piece,"dr-challoner");
   assert.deepEqual(cp,dr,"Selected CPDV/Douay coordinates differ");
   chosen.push(...cp);
  }
 }
 const chosenSet=new Set(chosen);
 assert.equal(chosenSet.size,chosen.length,"No repeated principal excerpt verse");
 let prior=-1;
 for(const code of chosen){
  if(literaryExpansion||rebalanced){
   const extras=new Set(continuityExpansions.get(decision.unitId)||[]);
   assert.ok(extras.size,"Every enlargement beyond v18 must be enumerated exactly");
   for(const k of chosen)assert.ok(universe.has(k)||extras.has(k),
      "Unauthorized Scripture expansion: "+decision.unitId+" "+k);
   const outside=chosen.filter(k=>!universe.has(k));
   assert.deepEqual([...new Set(outside)].sort(),[...extras].sort(),
      "Only the documented source verses may expand an old v18 selection");
  }else if(!editionRepair&&!seamRepair){
   assert.ok(universe.has(code),"Selection lies outside original v18: "+
    decision.unitId+" "+code);
   const order=v18Codes.indexOf(code);
   assert.ok(order>prior,"Out-of-order principal extraction: "+decision.unitId);
   prior=order;
  }
 }
 originalVerseCount+=v18Codes.length;
 selectedVerseCount+=chosen.length;
 if(decision.selectionStatus==="PROPOSED_CURATED_TRIM"){
  stats.edited++;
  assert.ok(chosen.length<v18Codes.length,
   "Every editorial trim must actually reduce Scripture verse count: "+decision.unitId);
  assert.equal(decision.omittedVersesMustBeVisible,true);
 }else if(decision.selectionStatus==="DOCTRINAL_OR_NARRATIVE_FULL_PASSAGE_LOCK"){
  stats.protected++;
  assert.equal(chosen.length,v18Codes.length,"Protected biblical reading must remain complete");
 }else if(rebalanced){
  stats.literaryContextRebalances++;
  assert.equal(decision.unitId,"H39-01");
  assert.ok(chosen.length<v18Codes.length);
  assert.deepEqual(decision.proposedSelectedReferences,["2Kings 17:3–8","2Kings 17:13–18"]);
  assert.equal(decision.omittedVersesMustBeVisible,true);
  assert.equal(decision.literaryBatch,"MOVEMENTS_10_19_DESK_READING");
 }else if(literaryExpansion){
  stats.literaryContinuityExpansions++;
  assert.ok(chosen.length>v18Codes.length);
  assert.ok(["MOVEMENTS_01_09_DESK_READING","MOVEMENTS_10_19_DESK_READING"].includes(decision.literaryBatch),"Literary expansions must be attributed to a reviewed batch");
  assert.equal(decision.approvedForProduction,false);
 }else if(seamRepair){
  stats.priorContinuityRestorations++;
  assert.equal(decision.unitId,"H21-03");
  const old=priorCorrection.chapters.find(x=>x.chapterId==="H21").units.find(x=>x.unitId==="H21-03");
  const allowed=new Set(old.principalReadings.flatMap(z=>decodeBibleSequence(z).parts.flatMap(p=>coords(p,"cpdv-2009"))));
  for(const code of chosen)assert.ok(allowed.has(code),
   "Sea-crossing correction may only use verses previously defended in the eight-chapter source pass");
  assert.deepEqual(decision.proposedSelectedReferences,
   ["Exodus 14:5–10","Exodus 14:13–16","Exodus 14:19–23","Exodus 14:26–31"]);
  assert.equal(chosen.length,21);
  assert.equal(decision.priorHighRiskResearch.noPriorResearchDeleted,true);
 }else if(editionRepair){
  stats.editionCorrections++;
  assert.equal(decision.originalReferenceEditionWorkingHypothesis,"crampon-1923");
  assert.equal(decision.originalEditionIndependentlyCertified,false);
  const expected=decision.unitId==="H15-02"?["Genesis 32:22–32"]:["Acts 7:54–59"];
  assert.deepEqual(decision.proposedSelectedReferences,expected);
  assert.equal(chosen.length,decision.unitId==="H15-02"?11:6,
   "Edition-specific boundary normalization must retain the complete scene");
  assert.equal(v18Codes.length,decision.unitId==="H15-02"?11:7,
   "Crampon's full scene has edition-dependent verse numbering");
 }else{
  stats.unchanged++;
  assert.equal(decision.selectionStatus,"ORIGINAL_V18_SCOPE_RETAINED_PENDING_INDIVIDUAL_LITERARY_CHECK");
  assert.equal(chosen.length,v18Codes.length);
 }
 if(decision.halfVerseNotationInOriginal){
  stats.halfVerses++;
  assert.ok(source.notes.length,"Need an original half-verse source citation");
 }
}
assert.equal(seen.size,93);
assert.deepEqual(stats,{edited:30,protected:31,unchanged:22,editionCorrections:2,priorContinuityRestorations:1,literaryContinuityExpansions:6,literaryContextRebalances:1,halfVerses:1});
assert.ok(selectedVerseCount<originalVerseCount);
assert.ok(originalVerseCount-selectedVerseCount>80,"No fake compression reported");
for(const [id,status] of [["H22-02","DOCTRINAL_OR_NARRATIVE_FULL_PASSAGE_LOCK"],
 ["H53-01","DOCTRINAL_OR_NARRATIVE_FULL_PASSAGE_LOCK"],
 ["H53-02","DOCTRINAL_OR_NARRATIVE_FULL_PASSAGE_LOCK"],
 ["H60-01","DOCTRINAL_OR_NARRATIVE_FULL_PASSAGE_LOCK"],
 ["H58-04","PROPOSED_CURATED_TRIM"],
 ["H70-01","PROPOSED_CURATED_TRIM"]])
 assert.equal(economy.decisions.find(x=>x.unitId===id).selectionStatus,status);
assert.ok(books.has("John")&&books.has("Acts")&&books.has("Exodus"));
assert.equal(economy.verification.coordinateChecks,"ALL_93_PASS_SCRIPTURE_CONTRACTS_AFTER_M10_M19_CORRECTIONS");
assert.equal(economy.verification.targetCPDVAndDouaySourceCoordinatePresenceVerified,true);
assert.equal(economy.verification.originalPrintedEditionAttested,false);
assert.equal(economy.comparativeScriptureEconomy.originalNominalVerseUnits,originalVerseCount);
assert.equal(economy.comparativeScriptureEconomy.proposedNominalVerseUnits,selectedVerseCount);
assert.equal(economy.comparativeScriptureEconomy.comparableOriginalVerseUnits,1189);
assert.equal(economy.comparativeScriptureEconomy.comparableSelectedVerseUnits,1069);
assert.equal(economy.comparativeScriptureEconomy.comparableActualVerseUnitReductions,120);
assert.equal(economy.comparativeScriptureEconomy.comparableReductionRatePct,10.1);
assert.deepEqual(economy.verification.batch01_09.sourceContinuityFixes,
 ["H11-02","H13-01","H16-03","H21-03"]);
assert.equal(economy.verification.batch01_09.approved,false);
assert.ok(economy.decisions.filter(x=>x.literaryBatch==="MOVEMENTS_01_09_DESK_READING")
 .every(x=>x.bothCatholicEditionVersePresenceVerified===true));
assert.ok(economy.decisions.filter(x=>x.literaryBatch==="MOVEMENTS_10_19_DESK_READING")
 .every(x=>x.bothCatholicEditionVersePresenceVerified===true),
 "All revised original/selected source spans must have passed both Catholic witnesses");
assert.equal(economy.verification.batch10_19.contractsPassed,true);
assert.equal(economy.verification.batch10_19.approved,false);
assert.deepEqual(economy.verification.batch10_19.sourceContinuityExpansions,
 ["H22-01","H30-01","H33-01"]);
assert.deepEqual(economy.verification.batch10_19.sourceSpanRebalances,["H39-01"]);
assert.deepEqual(economy.verification.batch10_19.trims,
 ["H35-02","H36-02","H43-02"]);
assert.equal(economy.verification.batch10_19.approved,false);
assert.equal(economy.verification.fullLiteraryReadAloud,false);
assert.equal(economy.verification.CatholicEditorialApproval,false);
assert.equal(economy.verification.translationRightsApproval,false);
console.log("PASS Historia essentials: 93 v18 units; 30 proposed trims, 31 locked, 22 baseline, 2 edition corrections, 1 prior seam repair, 6 literary expansions and 1 historical-source rebalance; "+originalVerseCount+" -> "+selectedVerseCount+" verse units checked in CPDV and Douay; literary/text approval HELD");
