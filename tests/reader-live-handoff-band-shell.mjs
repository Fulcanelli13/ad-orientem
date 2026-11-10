import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {LIVE_HANDOFF_REFERENCE_ANCHORS} from "../src/mass/reader-live-handoff-source-crosswalk.js";
import {
  LIVE_BAND_SNAP_HEIGHTS,LIVE_BAND_ACTION_REFERENCES,
  liveBandSourceGate,liveBandHeightForReference,
  normalizeLiveBandPreference,snapLiveBandHeight,
  approvedStageBPlanSvg,mountLiveHandoffBand,
} from "../src/mass/reader-live-handoff-band.js";
import {LIVE_HANDOFF_SOURCE_POINTS,projectLiveHandoffPlanPosition}
  from "../src/mass/reader-live-handoff-geometry.js";

function native65(){
  const cards=LIVE_HANDOFF_REFERENCE_ANCHORS.map((anchor,i)=>({
    sectionId:anchor.expectedNativeId,sequence:i+1,title:anchor.referenceTitle,
    sourceSectionId:anchor.sourceKey.startsWith("AO.CANON.")
      ?"AO.CARD.014":anchor.sourceKey,
    provenance:anchor.sourceKey.startsWith("AO.CANON.")
      ?{canonSegmentId:anchor.sourceKey}:{},
    paragraphs:[{id:"REAL_"+String(i+1),sourceCueIds:["AO.SM.C"+String(i+1).padStart(4,"0")]}],
    blocks:[{blockId:"AO.SM.B"+String(i+1).padStart(3,"0")}],
  }));
  return {structureOwner:"SOURCE_FIRST_LIVE_CURATED_65_REVIEW",
    presentationMode:"LIVE",corpusFamily:"SUNG",totalCards:65,cards};
}
test("the band is gated by the exact actual 65 native source cuts",()=>{
  const model=native65(),before=JSON.stringify(model);
  for(let i=0;i<65;i++){
    const gate=liveBandSourceGate({model,currentCard:model.cards[i]});
    assert.equal(gate.ok,true,"C"+(i+1)+" should resolve");
    assert.equal(gate.reference.referenceId,"C"+String(i+1).padStart(2,"0"));
    assert.equal(gate.reference.nativeCardId,model.cards[i].sectionId);
  }
  assert.equal(JSON.stringify(model),before,"visual gate must never alter source model");
});
test("MISSAL, source variants, outside-Mass and unrecognised cards fail closed",()=>{
  const model=native65();
  assert.equal(liveBandSourceGate({model,currentCard:model.cards[0],mode:"MISSAL"}).reason,"NOT_LIVE_MODE");
  assert.equal(liveBandSourceGate({model,currentCard:{sectionId:"ASPERGES"}}).ok,false);
  assert.equal(liveBandSourceGate({model,currentCard:null}).reason,"NATIVE_CURRENT_CARD_REQUIRED");
  const missing=native65();missing.cards=missing.cards.slice(0,-1);
  assert.equal(liveBandSourceGate({model:missing,currentCard:missing.cards[0]}).ok,false);
  const extra=native65();extra.cards.push({...extra.cards[0],sectionId:"REAL_ADDITIONAL_PRAYER",sequence:66});
  assert.equal(liveBandSourceGate({model:extra,currentCard:extra.cards[0]}).ok,false);
  assert.deepEqual(LIVE_HANDOFF_REFERENCE_ANCHORS.map(x=>x.expectedNativeId),
    native65().cards.map(x=>x.sectionId));
});
test("adaptive action cards, persisted manual snaps and reset have separate semantics",()=>{
  assert.deepEqual([...LIVE_BAND_SNAP_HEIGHTS],[96,230,340,460]);
  for(const ref of LIVE_BAND_ACTION_REFERENCES)
    assert.equal(liveBandHeightForReference(ref),420,ref);
  assert.equal(liveBandHeightForReference("C01"),230);
  for(const value of LIVE_BAND_SNAP_HEIGHTS)
    assert.equal(liveBandHeightForReference("C38",value),value);
  assert.equal(snapLiveBandHeight(100),96);
  assert.equal(snapLiveBandHeight(251),230);
  assert.equal(snapLiveBandHeight(390),340);
  assert.equal(snapLiveBandHeight(451),460);
  assert.equal(normalizeLiveBandPreference("adaptive"),null);
  assert.equal(normalizeLiveBandPreference("223"),null);
});
test("static preview has the final approved east-facing geometry, not obsolete rail",()=>{
  const rail=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.RAIL);
  const altar=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.CENTER);
  const nave=projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS.AISLE_M);
  assert.deepEqual([...LIVE_HANDOFF_SOURCE_POINTS.RAIL],[300,268]);
  assert.ok(nave.x<rail.x && rail.x<altar.x);
  const svg=approvedStageBPlanSvg();
  assert.match(svg,/viewBox="0 0 600 600"/);
  assert.ok(svg.includes('x1="'+rail.x.toFixed(1)+'"'));
  assert.doesNotMatch(svg,/>YOU<|>STAND<|>PRIEST<|dotted/i);
});
test("release reader keeps existing two rails and independent Schola code",()=>{
  const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
  const entry=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
  const band=readFileSync(new URL("../src/mass/reader-live-handoff-band.js",import.meta.url),"utf8");
  assert.match(dom,/class="ao-rail ao-rail-left"/);
  assert.match(dom,/class="ao-rail ao-rail-right"/);
  assert.match(entry,/mountLiveHandoffBand\(/);
  assert.match(band,/PREVIEW_NOT_REQUESTED/);
  assert.doesNotMatch(band,/activateForCard|reachLiturgicalBoundary|setSchola/);
});
test("feature stays unmounted by default without accessing a document",()=>{
  assert.equal(mountLiveHandoffBand({enabled:false}).mounted,false);
});
