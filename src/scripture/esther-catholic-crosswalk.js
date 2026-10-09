/**
 * Esther: a complete, source-collated rearrangement from Ronald Conte's
 * author-maintained CPDV order to Douay–Rheims Challoner's 16-chapter order.
 * Single-verse equivalences only. This is not doctrinal certification.
 *
 * Internal source comparison: all 274 CPDV verses cover all 275 Douay–Rheims
 * verses exactly once; CPDV 7:14 joins Douay 4:12 and 4:13.
 * This is NOT the Hebrew-only/Protestant shorter Esther.
 */
const blocks=[
 [1,1,11,11,1],[2,1,6,12,0],[3,1,22,1,0],
 [4,1,23,2,0],[5,1,13,3,0],
 [6,1,7,13,0],[6,8,9,3,6],
 [7,1,9,4,0],[7,10,11,15,-8],
 [7,12,14,4,-2],[7,15,15,4,-1],
 [7,16,16,15,-15],[7,17,19,4,-2],
 [7,20,30,13,-12],
 [8,1,19,14,0],
 [9,1,16,15,3],[9,17,30,5,-16],
 [10,1,14,6,0],[11,1,10,7,0],[12,1,12,8,0],
 [13,1,24,16,0],[13,25,29,8,-12],
 [14,1,32,9,0],
 [15,1,13,10,0],[15,14,14,11,-13]
];
export const ESTHER_SOURCE_BLOCKS=Object.freeze(blocks.map(([cpdvChapter,first,last,douayChapter,offset])=>
 Object.freeze({cpdvChapter,first,last,douayChapter,offset})));
function cpToDr(ch,v){
 const seg=ESTHER_SOURCE_BLOCKS.find(x=>x.cpdvChapter===ch && x.first<=v && v<=x.last);
 if(!seg)return null;
 if(ch===7&&v===14)return Object.freeze({book:"Esther",chapter:4,verseStart:12,verseEnd:13});
 return Object.freeze({book:"Esther",chapter:seg.douayChapter,verseStart:v+seg.offset,verseEnd:v+seg.offset});
}
const cpIndex=new Map(),drIndex=new Map();
for(const b of ESTHER_SOURCE_BLOCKS)for(let verse=b.first;verse<=b.last;verse++){
 const cpKey=b.cpdvChapter+":"+verse;
 if(cpIndex.has(cpKey))throw Error("Repeated CPDV Esther source coordinate");
 const target=cpToDr(b.cpdvChapter,verse);
 cpIndex.set(cpKey,target);
 for(let dr=target.verseStart;dr<=target.verseEnd;dr++){
  const key=target.chapter+":"+dr;
  if(drIndex.has(key))throw Error("Repeated Douay Esther coordinate "+key);
  drIndex.set(key,Object.freeze({book:"Esther",chapter:b.cpdvChapter,verseStart:verse,verseEnd:verse}));
 }
}
if(cpIndex.size!==274||drIndex.size!==275)
 throw Error("Esther collation must cover all Catholic source verses (274 ↔ 275)");
export const ESTHER_CROSSWALK_STATUS=Object.freeze({
 cpExtracted:274,drExtracted:275,
 split:"CPDV 7:14 ↔ Douay 4:12–13",
 provenance:"CPDV author-maintained master vs pinned Catholic Douay–Rheims Challoner source",
 alignment:"all-single-verses-collated-in-Catholic-source-order",
 theologicalApproval:"not-implied"
});
export function estherParallelVerse(reference,fromEdition,toEdition){
 if(reference?.book!=="Esther"||reference?.verseStart!==reference?.verseEnd)return null;
 if(fromEdition==="cpdv-2009"&&toEdition==="dr-challoner")
  return cpIndex.get(reference.chapter+":"+reference.verseStart)??null;
 if(fromEdition==="dr-challoner"&&toEdition==="cpdv-2009")
  return drIndex.get(reference.chapter+":"+reference.verseStart)??null;
 return null;
}
export function estherCrosswalkCoverage(){
 return Object.freeze({cpdv:cpIndex.size,douayRheims:drIndex.size});
}
