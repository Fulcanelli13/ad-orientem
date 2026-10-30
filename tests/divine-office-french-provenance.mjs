import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {
  K_CELLS,K_PROVENANCE,inspectRecoveredFrenchHour,
  checkPrimeRecipientScope
} from "../scripts/office/audit-recovered-french-allsouls.mjs";
const hour="PRIME";
const ids=Object.keys(K_CELLS[hour]);
const doc=(language,{missing=false}={})=>({
  schema:"ao.office.source-cells.v1",date:"2026-11-02",hour,language,
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"STRUCTURED_UNVERIFIED",publishable:false,
  sections:ids.map((id,i)=>({
    index:i+1,sourceIndex:i+1,sourceCellId:id,
    text:language==="fr"?
      (missing?(i===0?"special is missing":"1 is missing"):
        "Oraison pour les âmes des fidèles défunts. "+id):
      language==="la"?"Oratio pro omnibus fidelibus defunctis. "+id:
        "Prayer for the souls of the faithful departed. "+id,
    semantic:{latinSourceCellId:id,role:"PRAYER"},
  })),
});
test("the K register identifies exactly eleven restored source IDs",()=>{
  assert.equal(Object.values(K_CELLS).flatMap(Object.keys).length,11);
  assert.equal(K_PROVENANCE.sourceRevision,DIVINUM_OFFICIUM_PIN);
  assert.equal(K_PROVENANCE.projectLicense,"MIT");
  assert.equal(K_PROVENANCE.oldPrintedWitnessRubricsMatch1960,false);
});
test("recovered cells preserve all original IDs and do not pass editorial approval",()=>{
  const result=inspectRecoveredFrenchHour({
    hour,baseline:doc("fr",{missing:true}),candidate:doc("fr"),
    latin:doc("la"),english:doc("en"),
  });
  assert.equal(result.length,3);
  assert.deepEqual(result.map(x=>x.sourceCellId),ids);
  assert.deepEqual(result.map(x=>x.upstreamFrenchSection),
    ["Oratio mortuorum2","#Martyrologium","Conclusio"]);
  assert.equal(result.every(x=>!x.canPublish&&!x.historicalProperTextMatched&&
    !x.reviewedByHuman&&!x.sourceRightsAttributionAudited),true);
});
test("missing or shuffled French cells cannot be reported recovered",()=>{
  const args={hour,baseline:doc("fr",{missing:true}),candidate:doc("fr"),
    latin:doc("la"),english:doc("en")};
  assert.throws(()=>inspectRecoveredFrenchHour({...args,
    candidate:{...args.candidate,sections:args.candidate.sections.slice().reverse()}
  }),/SOURCE_ID_DRIFT/);
  assert.throws(()=>inspectRecoveredFrenchHour({...args,
    candidate:{...args.candidate,sections:args.candidate.sections.map((s,i)=>i===0?{...s,text:"special is missing"}:s)}
  }),/RECOVERY_INCOMPLETE/);
  assert.throws(()=>inspectRecoveredFrenchHour({...args,
    baseline:{...args.baseline,sourceRevision:"untrusted"}
  }),/SOURCE_INVALID/);
});
test("known source Prime post-Martyrology recipient-group mismatch is flagged, never automatically fixed",()=>{
  const x=checkPrimeRecipientScope({
    latinProper:"v. Deus, véniæ largítor: ut ánimas ómnium fidélium qui ex hoc sǽculo transiérunt",
    englishProper:"v. O God: that thou grant the brethren of our congregation, kinsfolk, and benefactors",
    frenchProper:"v. Ô Dieu: aux âmes de tous les fidèles qui sont sortis de ce monde",
  });
  assert.equal(x.scopeMismatchCandidate,true);
  assert.equal(x.englishCorrectionApproved,false);
  assert.equal(x.printedProperReviewNeeded,true);
  const no=checkPrimeRecipientScope({latinProper:"Deus",englishProper:"God",frenchProper:"Dieu"});
  assert.equal(no.scopeMismatchCandidate,false);
});
