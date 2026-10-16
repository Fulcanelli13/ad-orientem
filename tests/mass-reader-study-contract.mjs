import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {currentMassExplorerStudyTarget} from "../src/learn/mass-reader-study-bridge.js";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
import {massMapHtml} from "../src/learn/mass-map.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const json=path=>JSON.parse(read(path));
const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}},readerPreferences:{mode:"LIVE",language:"en"}};
const baseCard={sectionId:"AO.LIVE.010",sourceSectionId:"AO.CARD.010",guideSequence:10,
  sequence:24,blocks:[{blockId:"AO.SM.B031"}]};
const mock=(card,{cue="AO.SM.C0111",connected=true}={})=>({
 root:{isConnected:connected},getCurrentCard:()=>card,getActiveCue:()=>cue,
 getPresentationMode:()=>"LIVE",
});
const target=currentMassExplorerStudyTarget(mock(baseCard),prepared);
assert.equal(target?.momentKey,"AO.CARD.010");
assert.equal(target?.blockId,"AO.SM.B031");
assert.equal(target?.cueId,"AO.SM.C0111");
assert.equal(target?.readerCardId,"AO.LIVE.010");
assert.equal(target?.sourceSectionId,"AO.CARD.010");
assert.equal(target?.presentationMode,"LIVE");
assert.equal(target?.provenance,"R17_CURRENT_CANONICAL_SUNG_CONTEXT");
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,blocks:[]}),prepared)?.blockId,null,
  "Do not fabricate a selected source block from the Guide or card number");
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,blocks:[{blockId:"AO.SM.B029"},{blockId:"AO.SM.B031"}]}),prepared)?.blockId,null,
  "Ambiguous split live card blocks must not select a random source block");
for(const form of ["LOW","SOLEMN","","UNKNOWN"]){
 assert.equal(currentMassExplorerStudyTarget(mock(baseCard),{
   ...prepared,session:{resolvedMass:{form}}}),null,"Uncertified form should fail closed: "+form);
}
assert.equal(currentMassExplorerStudyTarget(mock(baseCard,{connected:false}),prepared),null);
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,sourceSectionId:"ASP-R01",guideSequence:null}),prepared),null);
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,sourceSectionId:"AO.CARD.013",guideSequence:10}),prepared),null);
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,sourceSectionId:"AO.MASS.999",guideSequence:31}),prepared),null);
assert.equal(currentMassExplorerStudyTarget(mock({...baseCard,guideSequence:15,sourceSectionId:"AO.CARD.015"}),prepared)?.momentKey,"AO.CARD.015");
const catalog=buildMassExplorerCatalog(json("data/presentation/guide-registry.v1.json"),
  json("data/presentation/reader-text-sung.v1.json"),json("data/presentation/reader-french-ordinary.v1.json"));
const map=massMapHtml(catalog,{readerContext:true});
assert.match(map,/data-ao-mx-return-mass/);
assert.doesNotMatch(map,/data-ao-mx-open-mass/);
const article=massExplorerMomentHtml(catalog,"AO.CARD.010",{readerContext:true});
assert.doesNotMatch(article,/data-ao-mx-study/,"Active reader must not launch unowned Learn parent");
assert.match(article,/data-ao-mx-current="AO.CARD.010"/);
assert.match(read("src/mass/browser-entry.js"),/installReaderMassExplorerStudy\(previewState\.preview,prepared/);
assert.match(read("src/learn/mass-explorer.js"),/data-ao-mx-origin=mass/);
console.log("PASS Native Mass → study: certified 30-stage owner, 48/65/67-safe source IDs, native reader overlay, unsupported form fail-closed");
