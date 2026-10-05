import assert from "node:assert/strict";
import { projectSourceFirst48Presentation, SOURCE_FIRST_48_TARGETS } from "../src/mass/reader-live-product48.js";

const targetIds=Object.keys(SOURCE_FIRST_48_TARGETS);
function targetCard(sourceId,sequence){
  const config=SOURCE_FIRST_48_TARGETS[sourceId];
  const blockIds=config.groups.flatMap(group=>group.blocks);
  const paragraphs=blockIds.map((id,index)=>Object.freeze({
    id:"CUE-"+id,
    kind:"TEXT",
    primary:id,
    secondary:null,
    sourceCueIds:Object.freeze(["AO.SM.C"+String(1000+sequence*20+index).padStart(4,"0")]),
  }));
  const blocks=blockIds.map((id,index)=>Object.freeze({
    blockId:id,title:id,properSlot:null,stateOnly:false,firstParagraphIndex:index,paragraphCount:1,
  }));
  return Object.freeze({
    schema:"ao-reader-section-card-v1",
    sectionId:sourceId,
    sourceSectionId:sourceId,
    sequence,
    sourceSequence:sequence,
    guideSequence:sequence,
    title:"Source "+sourceId,
    part:"Mass",
    macroId:"AO.SM.M"+String(sequence).padStart(2,"0"),
    paragraphs:Object.freeze(paragraphs),
    blocks:Object.freeze(blocks),
    eventIds:Object.freeze([]),
    provenance:Object.freeze({canonicalTextMutation:false}),
  });
}

const cards=[];
for(let i=1;i<=39;i++){
  const sourceId=targetIds[i-1]??("AO.SOURCE."+String(i).padStart(3,"0"));
  if(targetIds.includes(sourceId))cards.push(targetCard(sourceId,i));
  else cards.push(Object.freeze({
    schema:"ao-reader-section-card-v1",
    sectionId:sourceId,
    sourceSectionId:sourceId,
    sequence:i,
    sourceSequence:i,
    guideSequence:i,
    title:"Card "+i,
    part:"Mass",
    macroId:"AO.SM.M"+String(Math.min(i,30)).padStart(2,"0"),
    paragraphs:Object.freeze([{id:"P"+i,kind:"TEXT",primary:"Card "+i,sourceCueIds:Object.freeze([])}]),
    blocks:Object.freeze([]),
    eventIds:Object.freeze([]),
    provenance:Object.freeze({canonicalTextMutation:false}),
  }));
}
const sourceModel=Object.freeze({
  schema:"ao-mass-reader-model-v1",
  presentationMode:"LIVE",
  corpusFamily:"SUNG",
  structureOwner:"SOURCE_FIRST_LIVE",
  totalCards:39,
  cards:Object.freeze(cards),
  cardBySequence:n=>cards[Number(n)-1]??null,
  previousCard:id=>{
    const i=cards.findIndex(x=>x.sectionId===id);
    return i>0?cards[i-1]:null;
  },
  nextCard:id=>{
    const i=cards.findIndex(x=>x.sectionId===id);
    return i>=0&&i<cards.length-1?cards[i+1]:null;
  },
});

const projected=projectSourceFirst48Presentation(sourceModel);
assert.equal(projected.totalCards,48);
assert.equal(projected.sourceModelTotalCards,39);
assert.equal(projected.structureOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
assert.equal(projected.sourceStructureOwner,"SOURCE_FIRST_LIVE");
assert.equal(projected.historicalV183ExpectedCards,48);
assert.equal(projected.historicalV183IdentityClaim,false);
assert.equal(projected.productParity48,true);
assert.equal(projected.sourceAuthorityModel,sourceModel);
assert.deepEqual(projected.cards.map(x=>x.sequence),Array.from({length:48},(_,i)=>i+1));

const expectedCounts={
  "AO.CARD.010":3,
  "AO.CARD.020":4,
  "AO.CARD.022":2,
  "AO.CARD.023":3,
  "AO.CARD.029":2,
};
for(const [sourceId,count] of Object.entries(expectedCounts)){
  const children=projected.cards.filter(x=>x.sourceSectionId===sourceId);
  assert.equal(children.length,count,sourceId+" decomposition count changed");
  assert.ok(children.every(x=>x.productPresentation48===true));
  assert.ok(children.every(x=>x.historicalV183IdentityClaim===false));
  const actualBlocks=children.flatMap(x=>x.blocks.map(b=>b.blockId));
  const expectedBlocks=SOURCE_FIRST_48_TARGETS[sourceId].groups.flatMap(g=>g.blocks);
  assert.deepEqual(actualBlocks,expectedBlocks,sourceId+" block coverage changed");
  assert.equal(new Set(actualBlocks).size,actualBlocks.length,sourceId+" duplicated a source block");
}

assert.equal(projected.cards.filter(x=>x.productPresentation48===true).length,14);
assert.equal(projected.cards.filter(x=>!x.productPresentation48).length,34);
assert.equal(projected.nextCard(projected.cards[0].sectionId),projected.cards[1]);
assert.equal(projected.previousCard(projected.cards[47].sectionId),projected.cards[46]);

const simple={...sourceModel,presentationMode:"SIMPLE"};
assert.equal(projectSourceFirst48Presentation(simple),simple,"non-LIVE presentation was decompressed");
const low={...sourceModel,corpusFamily:"LOW"};
assert.equal(projectSourceFirst48Presentation(low),low,"Low Mass was incorrectly given the Sung 48-step presentation");

console.log("PASS source-first LIVE product parity: 39 source steps project to 48 visible steps without historical-ID claims.");
