import assert from "node:assert/strict";
import {withLiveReadingSections} from "../src/mass/reader-live-reading-sections.js";

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
console.log("LIVE reading sections: PASS — source block and separate oration spacing only, no within-prayer gaps");
