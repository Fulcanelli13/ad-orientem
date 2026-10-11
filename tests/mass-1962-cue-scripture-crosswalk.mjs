import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const d=read("data/geography/research/mass-1962-cue-scripture-crosswalk-20261011.v1.json");
const a=read(d.sourcePaths.sung),b=read(d.sourcePaths.low);
const R1=read("data/geography/research/mass-scripture-source-extractions-20261011.v1.json");
const R2=read("data/geography/research/mass-scripture-fortescue-order-extract-20261011.v1.json");
const R3=read("data/geography/research/mass-scripture-primary-controls-batch02-20261011.v1.json");
const R4=read("data/geography/research/mass-alphonsus-volume-xiii-two-journeys-20261011.v1.json");
const norm=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replaceAll("æ","ae").replaceAll("œ","oe").replace(/[^a-z0-9]+/g," ").trim();
const index=corpus=>new Map(corpus.blocks.flatMap(block=>(block.units||[]).map(cue=>[cue.cue_id,{cue,block}])));
const sung=index(a),low=index(b),known=new Set([...R1.records,...R2.records,...R3.dossiers,...R4.dujardinMeditativeStations,...R4.alphonsusPassageClaims].map(row=>row.id));
assert.equal(d.schema,"MASS_1962_SOURCE_CUE_SCRIPTURE_CROSSWALK_V1");
assert.equal(d.status,"1962_REPO_LATIN_CUE_CHECKED_BIBLE_AND_HISTORY_NOT_CERTIFIED");
assert.equal(d.records.length,45);
assert.equal(new Set(d.records.map(row=>row.id)).size,45);
assert.equal(new Set(d.records.map(row=>row.cueId)).size,41);
assert.ok(d.records.every(row=>row.priorResearchIds.every(id=>known.has(id))),"Every secondary claim reference must exist");
assert.deepEqual(d.records.filter(row=>!row.priorResearchIds.length).map(row=>row.cueId),["AO.SM.C0079"],"Only explicitly named Isaiah event relies just on Roman text");
assert.ok(d.records.every(row=>row.proof.sungLatinMatched&&row.proof.lowLatinMatched));
assert.ok(d.records.every(row=>!row.publicationGate.readyForProduction&&!row.publicationGate.independentMissalFacsimileVerified&&!row.publicationGate.scriptureOriginalEditionVerified));
assert.ok(d.records.every(row=>{
 const x=sung.get(row.cueId),y=low.get(row.cueId);
 return x&&y&&x.block.Block_ID===row.blockId&&y.block.Block_ID===row.blockId
   &&x.block.Branch_Status===row.liturgicalBranch
   &&y.block.Branch_Status===row.liturgicalBranch
   &&norm(x.cue.latin).includes(norm(row.latinPhraseAnchor))
   &&norm(y.cue.latin).includes(norm(row.latinPhraseAnchor))
}),"Every claimed Latin phrase must be present at identical source-owned cue in both form corpora");
assert.ok(d.records.filter(row=>row.cueId==="AO.SM.C0186").length===3);
assert.deepEqual(d.records.filter(row=>row.cueId==="AO.SM.C0186").map(row=>row.scriptureResearchReference),["Genesis 4:4","Genesis 22:1–19","Genesis 14:18–20; Hebrews 7"]);
assert.ok(d.records.some(row=>row.cueId==="AO.SM.C0179"&&row.evidenceClass==="ROMAN_FORMULA_NOT_VERBATIM_GOSPEL"));
assert.ok(d.records.some(row=>row.cueId==="AO.SM.C0122"&&row.liturgicalBranch==="CONDITIONAL_1962"));
assert.equal(d.variableProperSlots.length,11);
const actual=a.blocks.filter(block=>block.Proper_Slot).map(block=>({blockId:block.Block_ID,slot:block.Proper_Slot,cueIds:block.units.map(cue=>cue.cue_id)}));
assert.deepEqual(d.variableProperSlots.map(row=>({blockId:row.blockId,slot:row.slot,cueIds:row.cueIds})),actual);
assert.ok(d.variableProperSlots.every(row=>row.universalBibleRef===null));
assert.ok(d.variableProperSlots.filter(row=>row.readerResolution==="EXISTING_EXACT_SOURCE_PATH_AND_LATIN_INCIPIT_VERIFICATION").map(row=>row.slot).join(",")==="EPISTLE_OR_LESSON,GOSPEL");
const properIndex=read("data/mass/scripture-reading-witness-register.v1.json");
const feastIndex=read("data/mass/scripture-feast-reading-supplement.v1.json");
const segmentedIndex=read("data/mass/scripture-segmented-proper.v1.json");
const inv=d.currentProperEvidenceInventory;
assert.equal(inv.standaloneVerifiedProperPaths,105);
assert.equal(inv.witnessedProperPathSlotPairs,210);
assert.equal(inv.segmentedDiscontinuousReadingCount,15);
assert.equal(inv.segmentedSlotDistribution.GOSPEL,4);
assert.equal(inv.segmentedSlotDistribution.EPISTLE_OR_LESSON,11);
assert.equal(inv.uniqueProperPathCount,105);
assert.equal(inv.baseRegisterExplicitHeldSlots,5);
assert.equal(inv.allTheseReferencesRequireResolvedLatinText,true);
assert.ok(inv.denominatorCaution.includes("NOT the count of all days"));
console.log("PASS Mass 1962 cue/Bible research crosswalk: 45 exact Low/Sung Latin phrase locations, 41 stable cues, 11 separately resolved Proper slots.");
