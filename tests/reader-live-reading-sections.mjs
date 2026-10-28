import assert from "node:assert/strict";
import {withLiveReadingSections,omitSourceBlockForPresentation} from "../src/mass/reader-live-reading-sections.js";

const row=(id,liturgicalGroup=null)=>({id,kind:"TEXT",primary:id,liturgicalGroup});
const card={
  paragraphs:[
    row("first-line"),row("continuation"), // one source prayer, no gap
    row("next-prayer"),row("next-prayer-continuation"),
    row("collect-1","R17.ORATION.COLLECT.G0"),
    row("amen-1","R17.ORATION.COLLECT.G0"),
    row("oremus-2","R17.ORATION.COLLECT.G1"),
    row("collect-2","R17.ORATION.COLLECT.G1"),
    row("last","R17.ORATION.COLLECT.G1"),
  ],
  blocks:[
    {blockId:"AO.SM.B001",firstParagraphIndex:0,paragraphCount:2},
    {blockId:"AO.SM.B002",firstParagraphIndex:2,paragraphCount:2},
    {blockId:"AO.SM.B019",firstParagraphIndex:4,paragraphCount:5},
  ],
};
const projected=withLiveReadingSections(card);
assert.deepEqual(projected.map(p=>p.sectionBoundaryBefore),[
  null,null,"SOURCE_BLOCK",null,"SOURCE_BLOCK",null,"ORATION_GROUP",null,null
]);
assert.deepEqual(projected.map(p=>p.sourceBlockId),[
  "AO.SM.B001","AO.SM.B001","AO.SM.B002","AO.SM.B002",
  "AO.SM.B019","AO.SM.B019","AO.SM.B019","AO.SM.B019","AO.SM.B019"
]);
assert.deepEqual(projected.map(p=>p.id),card.paragraphs.map(p=>p.id),
  "Structural whitespace must not alter text order or source cue identities");
assert.equal(withLiveReadingSections(card,card.paragraphs,{mode:"MISSAL"}),card.paragraphs,
  "Missal must keep its original two-column layout");
assert.equal(withLiveReadingSections(card,card.paragraphs,{mode:"SIMPLE"}),card.paragraphs,
  "Simple mode must not inherit new LIVE spacing");
const samePrayer={
  paragraphs:[
    row("first","R17.ORATION.COLLECT.G0"),
    row("continuation","R17.ORATION.COLLECT.G0"),
  ],
  blocks:[
    {blockId:"AO.SM.B018",firstParagraphIndex:0,paragraphCount:1},
    {blockId:"AO.SM.B019",firstParagraphIndex:1,paragraphCount:1},
  ],
};
assert.equal(withLiveReadingSections(samePrayer)[1].sectionBoundaryBefore,null,
  "One prayer spanning a technical source block boundary must remain contiguous");
assert.throws(()=>withLiveReadingSections({
  paragraphs:[row("a")],
  blocks:[{blockId:"AO.SM.B001",firstParagraphIndex:1,paragraphCount:1}]
}),/Invalid source-block/);
assert.throws(()=>withLiveReadingSections(card,card.paragraphs.slice(1)),
  /changed source paragraph count/);
// The 1962 Requiem/Corpus/Holy Thursday omission deletes the final blessing
// from the displayed card but retains its canonical source record.
const closing={
 paragraphs:[row("Placeat"),row("Final Blessing"),row("Last prayer")],
 blocks:[
  {blockId:"AO.SM.B091",firstParagraphIndex:0,paragraphCount:1},
  {blockId:"AO.SM.B092",firstParagraphIndex:1,paragraphCount:1},
  {blockId:"AO.SM.B093",firstParagraphIndex:2,paragraphCount:1},
 ],
};
const omitted=omitSourceBlockForPresentation(closing,"AO.SM.B092");
assert.deepEqual(omitted.paragraphs.map(p=>p.id),["Placeat","Last prayer"]);
assert.deepEqual(omitted.blocks.map(b=>[b.blockId,b.firstParagraphIndex]),[
 ["AO.SM.B091",0],["AO.SM.B093",1],
],"The surviving block offsets must follow the displayed source paragraphs");
assert.deepEqual(omitted.planFilteredBlocks,["AO.SM.B092"]);
assert.equal(closing.blocks[2].firstParagraphIndex,2,
 "A liturgical omission must never mutate the source-owned card");
assert.deepEqual(withLiveReadingSections(omitted).map(p=>p.sourceBlockId),
 ["AO.SM.B091","AO.SM.B093"],
 "Omitted blessing may not retain a phantom reading boundary");
assert.equal(omitSourceBlockForPresentation(closing,"AO.SM.B999"),closing);
const sourceOmitted={paragraphs:[],stateOnly:true,omittedByRite:"RITUS_XIII_1_REQUIEM",
 blocks:[{blockId:"AO.SM.B092",firstParagraphIndex:null,paragraphCount:0}]};
assert.equal(omitSourceBlockForPresentation(sourceOmitted,"AO.SM.B092"),sourceOmitted,
 "A blessing already omitted by the source must not be treated as malformed");
assert.equal(omitSourceBlockForPresentation({
 paragraphs:[row("Blessing")],
 blocks:[{blockId:"AO.SM.B092",firstParagraphIndex:0,paragraphCount:1}],
},"AO.SM.B092"),null,"An omitted blessing-only card must disappear");
assert.throws(()=>omitSourceBlockForPresentation({
 paragraphs:[row("a"),row("b")],
 blocks:[
  {blockId:"AO.SM.B091",firstParagraphIndex:0,paragraphCount:2},
  {blockId:"AO.SM.B092",firstParagraphIndex:1,paragraphCount:1},
 ],
},"AO.SM.B092"),/Overlapping omitted source-block/);
console.log("LIVE reading sections: PASS — source block and separate oration spacing only, no within-prayer gaps");
