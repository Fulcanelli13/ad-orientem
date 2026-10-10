import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMassReaderModel } from "../src/mass/reader-model.js";
import { projectSourceFirst48Presentation, SOURCE_FIRST_48_TARGETS } from "../src/mass/reader-live-product48.js";
import {guideForPresentationCard} from "../src/mass/reader-guide.js";

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
const lowModeModel={...sourceModel,corpusFamily:"LOW"};
assert.equal(projectSourceFirst48Presentation(lowModeModel),lowModeModel,"Low Mass was incorrectly given the Sung 48-step presentation");

console.log("PASS source-first LIVE product parity: 39 source steps project to 48 visible steps without historical-ID claims.");


// Real production-data integration: prove that the product projection is a
// presentation-only decomposition of the certified 39-step Sung LIVE model.
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const lowCorpus=load("../data/presentation/reader-text-low.v1.json");
const sungCorpus=load("../data/presentation/reader-text-sung.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const canonSourceMap=load("../data/presentation/reader-canon-source-map.v1.json");
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus Rosarii","Introit of the Rosary"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale","Gradual"),
  alleluia_tract:t("Alleluia","Alleluia"),
  sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const resolvedMass={
  schema:"ao-resolved-mass-v2",
  date:"2026-10-04",
  form:"MISSA_CANTATA_INCENSE",
  presentationMode:"LIVE",
  actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
  calendarCelebration:{id:"Tempora/Pent18-0",type:"CALENDAR"},
  explicitlySelectedCelebration:true,
  proper:{status:"READY",data:proper,sourcePath:"Sancti/10-07"},
  overlays:["VOTIVE_PROPER"],
  precedingRites:[],
  followingActions:[],
  distinctRite:null,
};
const realSource=createMassReaderModel({
  resolvedMass,sectionMap,lowCorpus,sungCorpus,canonSourceMap
});
assert.equal(realSource.totalCards,39);
assert.equal(realSource.structureOwner,"SOURCE_FIRST_LIVE");
const real48=projectSourceFirst48Presentation(realSource);
assert.equal(real48.totalCards,48);
assert.equal(real48.sourceModelTotalCards,39);
assert.equal(real48.sourceAuthorityModel,realSource);
assert.equal(real48.cardForEvent,undefined,
  "presentation model leaked source-model event routing as though split cards owned events");

const sourceBlocks=realSource.cards.flatMap(card=>card.blocks.map(block=>block.blockId));
const productBlocks=real48.cards.flatMap(card=>card.blocks.map(block=>block.blockId));
assert.deepEqual(productBlocks,sourceBlocks,
  "48-step projection changed, duplicated or reordered canonical block coverage");
assert.equal(new Set(productBlocks).size,productBlocks.length,
  "48-step projection duplicated a canonical block");


// Full source-coverage release gate: the final Per omnia / Amen B061 must not
// disappear between the Canon source-first projection and its 48-card product.
const canonicalBlocks=sungCorpus.blocks.map(b=>b.Block_ID);
assert.deepEqual(sourceBlocks,canonicalBlocks,
  "39-step LIVE omits or reorders a canonical Sung source block");
assert.deepEqual(productBlocks,canonicalBlocks,
  "48-step LIVE omits or reorders a canonical Sung source block");
const canonConclusion=real48.cards.find(card=>card.sectionId==="AO.CANON.14");
assert.ok(canonConclusion,"The Canon conclusion card disappeared");
assert.deepEqual(canonConclusion.blocks.map(b=>b.blockId),["AO.SM.B060","AO.SM.B061"]);
const lastCues=canonConclusion.paragraphs.flatMap(p=>p.sourceCueIds??[]);
assert.ok(lastCues.includes("AO.SM.C0206"),"Per omnia absent from LIVE Canon conclusion");
assert.ok(lastCues.includes("AO.SM.C0207"),"Congregation Amen absent from LIVE Canon conclusion");
assert.equal(real48.cards.filter(c=>c.blocks.some(b=>b.blockId==="AO.SM.B061")).length,1,
  "Canon Amen is duplicated on LIVE cards");
assert.ok(!real48.cards.find(c=>c.sectionId==="AO.CARD.019")?.blocks.some(b=>b.blockId==="AO.SM.B061"),
  "The Canon Amen was incorrectly moved to the Pater Noster card");

const sourceParagraphs=realSource.cards.flatMap(card=>card.paragraphs.map(p=>p.id));
const productParagraphs=real48.cards.flatMap(card=>card.paragraphs.map(p=>p.id));
assert.deepEqual(productParagraphs,sourceParagraphs,
  "48-step projection changed, duplicated or reordered reader paragraphs");

for(const card of real48.cards.filter(x=>x.productPresentation48===true)){
  assert.deepEqual(card.eventIds,[],
    card.sectionId+" falsely claimed canonical event ownership");
  assert.ok(Array.isArray(card.sourceEventIds),
    card.sectionId+" lost parent source-event provenance");
  assert.equal(card.historicalV183IdentityClaim,false);
}

const realCounts=Object.fromEntries(Object.keys(SOURCE_FIRST_48_TARGETS).map(sourceId=>[
  sourceId,real48.cards.filter(card=>card.sourceSectionId===sourceId).length
]));
assert.deepEqual(realCounts,{
  "AO.CARD.010":3,
  "AO.CARD.020":4,
  "AO.CARD.022":2,
  "AO.CARD.023":3,
  "AO.CARD.029":2,
});
assert.deepEqual(
  real48.cards.filter(card=>card.sourceSectionId==="AO.CARD.020").map(card=>card.blocks.map(b=>b.blockId)),
  [["AO.SM.B064"],["AO.SM.B065"],["AO.SM.B066"],["AO.SM.B067"]],
  "Libera/Pax ambiguity was resolved by guessing historical adjacency instead of isolating source blocks"
);
assert.deepEqual(
  real48.cards.filter(card=>card.sourceSectionId==="AO.CARD.023").map(card=>card.blocks.map(b=>b.blockId)),
  [["AO.SM.B074"],["AO.SM.B075"],["AO.SM.B076"]],
  "Priest Communion ambiguity was resolved by guessing historical adjacency instead of isolating source blocks"
);
assert.equal(real48.sourceAuthorityModel.cardForEvent("MC-CNS-010")?.card?.sectionId,"AO.CANON.06",
  "39-step source model stopped owning canonical event routing");

console.log("PASS real source-first 48 integration: all canonical blocks/paragraphs preserved once; event authority remains on 39-step source model.");

\n// 48-card Guide binding does not silently certify 48 independent rubrics:
 // all cards have a source Guide; Canon/product subdivisions declare inheritance.
const guideRegistry=load("../data/presentation/guide-registry.v1.json");
const guideBindings=real48.cards.map(card=>({card,guide:guideForPresentationCard(guideRegistry,card)}));
assert.equal(guideBindings.length,48);
assert.ok(guideBindings.every(({guide})=>guide?.sourceLinks&&guide?.sourceLine),"LIVE 48 has an unbound or unsourced Guide");
assert.equal(new Set(guideBindings.map(({guide})=>guide.presentationCardId)).size,48,"LIVE card titles or identities were lost");
for(const {card,guide} of guideBindings){
  const split=card.productPresentation48===true||card.liveSourceSegment===true;
  assert.equal(guide.coverage,split?"INHERITED_MACRO_CONTEXT":"REGISTERED_MACRO_CONTEXT",card.sectionId);
  if(split){
    assert.equal(guide.moment,card.title,"Split LIVE Guide cannot show its parent title as this card's own title");
    assert.ok(guide.sourceMoment,"Split LIVE Guide lost its wider-rite context");
    assert.ok(guide.sourceMoment!==guide.moment||card.title===guide.sourceMoment);
  }
}
assert.equal(guideBindings.filter(({guide})=>guide.coverage==="INHERITED_MACRO_CONTEXT").length,28);
console.log("PASS all 48 LIVE Guide bindings: 28 explicit source-macro inheritances, unchanged rubric sources.");
