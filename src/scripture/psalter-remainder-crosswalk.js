/**
 * Complete evidence-backed verse-coordinate map of the 13 previously blocked
 * Catholic Psalms. Original CPDV author master versus pinned Douay–Rheims.
 * Audit: audit-remaining-catholic-psalms.mjs (2026-10-09).
 *
 * All thirteen have identical numbered verse sets; only these 254 discrete
 * coordinates pass a conservative direct/neighbor/context lexical test.
 * The other 53 remain blocked. This is not a theological approval of either
 * translation or its wording.
 */
const PAIRS=Object.freeze([
 [16,[1,2,3,4,5,6,8,9,11,12,14,15]],
 [64,[1,2,3,4,5,6,8,9,10,11,12]],
 [73,[1,2,3,4,6,7,8,9,10,11,12,14,15,16,17,18,19,20,21,23]],
 [75,[1,2,4,6,7,9,10,12,13]],
 [76,[1,2,3,4,6,7,9,11,12,14,16,17,18,19,20,21]],
 [77,[1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28,33,34,35,36,40,41,42,43,44,46,47,48,49,50,52,53,54,55,56,57,58,59,60,61,62,63,64,65,67,68,69,70,71,72]],
 [88,[1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,32,33,34,35,36,38,40,42,43,44,46,47,48,49,50,51,52,53]],
 [101,[1,2,3,4,5,6,7,9,10,11,12,15,16,17,18,19,20,21,22,23,24,25,26,27]],
 [108,[1,2,3,4,5,6,7,8,9,13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30,31]],
 [111,[1,2,3,4,5,7,9,10]],
 [115,[2,3,4,5,6,7,8,9,10]],
 [120,[1,2,3,4,5,6,7]],
 [137,[1,2,3,4,5,7]],
]);
const entries=new Map();
for(const [chapter,verses] of PAIRS){
 if(entries.has(chapter))throw Error("Repeated source-aligned Psalm chapter");
 entries.set(chapter,new Set(verses));
}
export const PSALTER_REMAINDER_VERIFIED=Object.freeze(Object.fromEntries(PAIRS.map(
 ([chapter,verses])=>[chapter,Object.freeze(verses)])));
export const PSALTER_REMAINDER_STATUS=Object.freeze({
 chapters:13,alignedVerses:254,unresolvedVerses:53,
 review:"two Catholic witnesses: conservative verse and neighbor matching",
 doctrinalCertification:"NOT_CLAIMED",
 fullTextRelease:"NOT_CLAIMED"
});
if(entries.size!==13||[...entries.values()].reduce((n,x)=>n+x.size,0)!==254)
 throw Error("Incomplete Catholic Psalter final source map");
export function psalterRemainderParallelVerse(reference,from,to){
 if(reference?.book!=="Psalms"||reference.verseStart!==reference.verseEnd)return null;
 if(!(["cpdv-2009","dr-challoner"].includes(from)&&
 ["cpdv-2009","dr-challoner"].includes(to)&&from!==to))return null;
 if(!entries.get(reference.chapter)?.has(reference.verseStart))return null;
 return Object.freeze({book:"Psalms",chapter:reference.chapter,
   verseStart:reference.verseStart,verseEnd:reference.verseStart});
}
