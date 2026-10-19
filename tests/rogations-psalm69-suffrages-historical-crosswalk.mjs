import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {buildReconciliation,normalizeLatin} from "../tools/mass/reconcile-annexed-text-owners.mjs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const report=read("../data/mass/rogation-psalm69-suffrages-historical-crosswalk.v1.json");
const payload=read("../data/presentation/reader-rogations.v1.json");
const graph=read("../data/mass/special-days-extension.v1.3.json").graphs.ROG;
const card=buildRogationsPayload({graph,payload}).cards.find(x=>x.id==="ROG-R04");
const canon=buildReconciliation().ordinaryReuseCandidates;
assert.equal(report.status,"SOURCE_WITNESS_PARALLELS_NO_PRODUCTION_TRANSLATION_PROMOTION");
assert.equal(card.paragraphs.length,35);
assert.deepEqual(card.paragraphs.slice(0,3).map(x=>x.id),["ROG-R04-PN","ROG-R04-V","ROG-R04-R"]);
assert.equal(card.paragraphs[0].voice,"SILENT");
assert.equal(report.psalm.length,8);
assert.equal(report.suffrages.length,24);
assert.equal(report.summary.analyzedLatinRows,32);
assert.equal(report.summary.psalmSubstantiveVersesWithEnFrCandidates,7);
assert.equal(report.summary.psalmDoxologyAbbreviatedInHistoricalEnFr,1);
assert.equal(report.summary.doxologyExactLatinPRAYCandidate,1);
assert.equal(report.summary.suffrageEnFrHistoricalPairs,22);
assert.equal(report.summary.suffrageMissingFromBothHistoricalAtThisPoint,2);
assert.equal(report.summary.suffrageAlreadyOwnedOrdinaryFormulaCandidates,2);
assert.equal(report.summary.fullyApprovedEnglishRows,0);
assert.equal(report.summary.fullyApprovedFrenchRows,0);
assert.equal(report.summary.additionalCertifiedExactOrdinaryOrPRAYMatches,0);
assert.equal(report.summary.confirmedNewTranslationsNeeded,0);
assert.equal(report.scope.psalterNumbering,"PSALM_LXIX_VULGATE_69_MODERN_HEBREW_70");
for(let i=0;i<8;i++){
  const meta=report.psalm[i],row=card.paragraphs[i+3];
  assert.equal(meta.rowId,"ROG-R04-PS"+(i+1));
  assert.equal(meta.sourcePath,"postLitany.psalm69."+i);
  assert.equal(row.id,meta.rowId);
  assert.equal(row.latin,payload.postLitany.psalm69[i]);
  assert.equal(row.sourceRecordId,"ROG-PS-010");
  assert.ok(row.latin.startsWith(meta.latinIncipit));
  assert.equal(meta.englishWitness.complete,i<7);
  assert.equal(meta.frenchWitness.complete,i<7);
  assert.equal(meta.englishWitness.renderedLine,i===7?340:339);
  if(i<7){
    assert.deepEqual(meta.frenchWitness.renderedLines,[1012+i]);
    assert.equal(meta.approvedVernacularOwner,null);
  }else{
    assert.deepEqual(meta.frenchWitness.renderedLines,[1019,1020,1021]);
    assert.equal(meta.sharedPrayOwnerCandidate,"foundations_glory_be");
    assert.equal(meta.exactNormalizedLatinWithPRAY,true);
    assert.equal(normalizeLatin(row.latin),
      normalizeLatin(PRAY_CANONICAL_DATA_V435930.prayers.foundations_glory_be.la),
      "Full Rogation doxology already has exact Latin and trilingual PRAY candidate");
    assert.ok(PRAY_CANONICAL_DATA_V435930.prayers.foundations_glory_be.en);
    assert.ok(PRAY_CANONICAL_DATA_V435930.prayers.foundations_glory_be.fr);
  }
}
for(let i=0;i<24;i++){
  const meta=report.suffrages[i],row=card.paragraphs[i+11];
  assert.equal(meta.rowId,"ROG-R04-S"+(i+1));
  assert.equal(meta.sourcePath,"postLitany.suffrages."+i+".1");
  assert.equal(row.id,meta.rowId);
  assert.equal(row.latin,payload.postLitany.suffrages[i][1]);
  assert.equal(row.kind,payload.postLitany.suffrages[i][0]);
  assert.equal(meta.sourceKind,row.kind);
  assert.equal(row.sourceRecordId,"ROG-PS-010");
  assert.equal(meta.translationAdoption,"BLOCKED_PENDING_CONTEXT_EDITION_RIGHTS");
  if(i<22){
    assert.equal(meta.historicalPairing,"EN_FR_POSITION_AND_ROLE_ALIGNED_PENDING_EDITION");
    assert.ok(meta.englishWitness?.url.includes("oldid=12282621"));
    assert.ok(meta.frenchWitness?.url.includes("oldid=14794744"));
    assert.equal(meta.frenchWitness.renderedLine,1077+i);
    assert.equal(meta.frenchWitness.originalLatinLine,1022+i);
    assert.equal(meta.englishWitness.renderedLine,i<10?341:342);
    assert.equal(meta.canonicalOrdinaryCueCandidate,undefined);
  }else{
    assert.equal(meta.historicalPairing,"ABSENT_AT_THIS_HISTORICAL_POSITION");
    assert.equal(meta.englishWitness,null);
    assert.equal(meta.frenchWitness,null);
    const cue=i===22?"AO.SM.C0034":"AO.SM.C0035";
    assert.equal(meta.canonicalOrdinaryCueCandidate,cue);
    assert.ok(canon.some(x=>x.rite==="ROGATIONS_PROCESSION"&&
      x.path==="postLitany.suffrages."+i+".1"&&x.cues.some(y=>y.id===cue)),
      "Do not misclassify existing Ordinary wording as an untranslated suffrage");
  }
  assert.ok(!Object.hasOwn(meta,"englishText")&&!Object.hasOwn(meta,"frenchText"),
    "Never turn a historical locator index into another translation owner");
}
assert.deepEqual(report.suffrages.slice(22).map(x=>x.rowId),["ROG-R04-S23","ROG-R04-S24"]);
assert.equal(payload.postLitany.suffrages[22][1],"Dominus vobiscum.");
assert.equal(payload.postLitany.suffrages[23][1],"Et cum spiritu tuo.");
assert.equal(report.publication.sourceLanguageTranslationCopied,false);
assert.equal(report.publication.canonLatinUntouched,true);
assert.equal(report.publication.rightsReviewRequired,true);
assert.equal(report.publication.printFacsimileCollationRequired,true);
assert.equal(report.priorOwnerCensus.otherOwnerCandidates,150);
console.log("PASS 32 Rogation Psalm/suffrage rows: 7+1 Psalm EN/FR, 22 historic pairs, 2 existing Ordinary responses, no duplicate translations or reader changes.");
