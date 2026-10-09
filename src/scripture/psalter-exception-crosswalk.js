/**
 * Catholic Psalter exceptions: source-span crosswalk only.
 * CPDV is numbered to its original-author page; Douay–Rheims to Challoner.
 * Other Psalm verses still require a documented per-passage collation.
 *
 * A span means that the verse's wording belongs within that one contiguous
 * region of the opposite edition; it is not proof of word-for-word identity.
 */
import {psalterIdentityVerse} from "./psalter-identity-crosswalk.js";
import {psalterRemainderParallelVerse} from "./psalter-remainder-crosswalk.js";
const ENTRIES=[
 // Psalm 13: Douay verse 3 contains the wording split into CPDV verses 3–6.
 [13,1,1,1],[13,2,2,2],[13,3,3,3],[13,4,3,3],
 [13,5,3,3],[13,6,3,3],[13,7,4,4],[13,8,5,5],
 [13,9,6,6],[13,10,7,7],
 // Psalm 42: CPDV 4 shares part of Douay 5; CPDV 5 includes Douay 5–6.
 [42,1,1,1],[42,2,2,2],[42,3,3,3],[42,4,4,5],[42,5,5,6],
 // Psalm 92: CPDV 1 is a superscription not present as a Douay verse.
 [92,2,1,1],[92,3,1,1],[92,4,2,2],[92,5,3,3],[92,6,4,4],[92,7,5,5],
 // Psalm 150: terminal CPDV 6 is included in Douay 5, Douay 6 is empty.
 [150,1,1,1],[150,2,2,2],[150,3,3,3],[150,4,4,4],
 [150,5,5,5],[150,6,5,5]
];
export const PSALTER_SOURCE_REGIONS=Object.freeze(ENTRIES.map(([chapter,cpdvVerse,douayStart,douayEnd])=>
 Object.freeze({chapter,cpdvVerse,douayStart,douayEnd})));
const cpMap=new Map(),drMap=new Map();
for(const entry of PSALTER_SOURCE_REGIONS){
 const {chapter,cpdvVerse,douayStart,douayEnd}=entry,key=chapter+":"+cpdvVerse;
 if(cpMap.has(key))throw Error("Repeated CPDV Psalm source verse "+key);
 cpMap.set(key,Object.freeze({book:"Psalms",chapter,verseStart:douayStart,verseEnd:douayEnd}));
 for(let v=douayStart;v<=douayEnd;v++){
  const drKey=chapter+":"+v,prior=drMap.get(drKey)||[];
  if(!prior.includes(cpdvVerse))drMap.set(drKey,[...prior,cpdvVerse]);
 }
}
for(const [key,values] of drMap){
 const [chapter]=key.split(":").map(Number);
 const min=Math.min(...values),max=Math.max(...values);
 if(max-min+1!==values.length)throw Error("Non-contiguous Psalter equivalent "+key);
 drMap.set(key,Object.freeze({book:"Psalms",chapter,verseStart:min,verseEnd:max}));
}
export const PSALTER_EXCEPTION_STATUS=Object.freeze({
 chapters:Object.freeze([13,42,92,150]),
 sourceReview:"actual CPDV author master and Douay–Rheims Catholic witness",
 unmappedCpdv:Object.freeze(["92:1"]),
 unmappedDouay:Object.freeze(["150:6 (empty third-party slot)"]),
 otherChapters:"133 SOURCE-ALIGNED CHAPTERS + 254 VERIFIED VERSES IN 13 MORE; 53 STILL BLOCKED"
});
export function psalterParallelVerse(reference,from,to){
 if(reference?.book!=="Psalms"||reference.verseStart!==reference.verseEnd)return null;
 const key=reference.chapter+":"+reference.verseStart;
 if(from==="cpdv-2009"&&to==="dr-challoner")return cpMap.get(key)??psalterIdentityVerse(reference,from,to)??psalterRemainderParallelVerse(reference,from,to);
 if(from==="dr-challoner"&&to==="cpdv-2009")return drMap.get(key)??psalterIdentityVerse(reference,from,to)??psalterRemainderParallelVerse(reference,from,to);
 return null;
}
