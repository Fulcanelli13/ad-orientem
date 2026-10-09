import assert from "node:assert/strict";
import { CATHOLIC_BOOK_IDS } from "../src/scripture/canon.js";
import { mapHistoricalBookName, normalizeScrollmapperSource } from "../tools/scripture/normalize-scrollmapper.mjs";
assert.equal(CATHOLIC_BOOK_IDS.length,73);
assert.equal(mapHistoricalBookName("I Samuel"),"1Samuel");
assert.equal(mapHistoricalBookName("II Maccabees"),"2Maccabees");
assert.equal(mapHistoricalBookName("III John"),"3John");
assert.equal(mapHistoricalBookName("Song of Solomon"),"SongOfSongs");
assert.equal(mapHistoricalBookName("Revelation of John"),"Revelation");
for(const held of ["Prayer of Manasses","I Esdras","II Esdras","Additional Psalm","Laodiceans"])assert.equal(mapHistoricalBookName(held),null);
assert.equal(mapHistoricalBookName("Gospel of Thomas"),null);
const sample={books:[{name:"Luke",chapters:[
 {chapter:1,verses:[{verse:1,text:"FIXTURE ONLY"},{verse:2,text:""},{verse:3,text:"FIXTURE ONLY"},{verse:4,text:""}]},
 {chapter:2,verses:[{verse:1,text:"FIXTURE ONLY"}]}
]}, {name:"Additional Psalm",chapters:[{chapter:1,verses:[{verse:1,text:"HELD"}]}]}]};
const audited=normalizeScrollmapperSource(sample,"dr-challoner",{requireCompleteCanon:false});
assert.equal(audited.bookCount,1);
assert.deepEqual(audited.held,["Additional Psalm"]);
assert.deepEqual(audited.internalBlankSlots,[{book:"Luke",chapter:1,verse:2}]);
assert.deepEqual(audited.trailingBlankSlots,[{book:"Luke",chapter:1,verse:4}]);
assert.equal(audited.status,"RESEARCH_ONLY_HAS_UNRESOLVED_EMPTY_VERSES");
assert.throws(()=>normalizeScrollmapperSource(sample,"dr-challoner"),/Expected all 73/);
assert.throws(()=>normalizeScrollmapperSource({books:[{name:"Unrecognized",chapters:[]}]},
 "dr-challoner",{requireCompleteCanon:false}),/Unrecognized source book/);
assert.throws(()=>normalizeScrollmapperSource({books:[sample.books[0],sample.books[0]]},
 "dr-challoner",{requireCompleteCanon:false}),/Duplicate Catholic book/);
console.log("Historical Catholic Bible source normalization contracts passed");
