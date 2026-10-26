// Research-only Scripture reading seam detection. Derive from the existing P3 proof;
// no duplicate narrative owner, no inferred event chronology or fabricated words.
function parse(ref){
 const m=typeof ref==="string"&&ref.match(/^([1-3]?[A-Za-z]+)\s+(\d+):(\d+)(?:[–-](?:(\d+):)?(\d+))?$/);
 if(!m)return null;
 return {reference:ref,book:m[1],startChapter:+m[2],startVerse:+m[3],
  endChapter:+(m[4]||m[2]),endVerse:+(m[5]||m[3])};
}
function selectedSources(movement){
 return (movement?.beats||[]).filter(b=>b.kind==="SCRIPTURE").flatMap(b=>b.refs||[]);
}
export function inspectHistoriaReadingBoundary(previousMovement,nextMovement){
 const previous=selectedSources(previousMovement),next=selectedSources(nextMovement);
 if(!previous.length||!next.length)return null;
 const from=parse(previous.at(-1)),to=parse(next[0]);
 if(!from||!to)throw Error("Unparseable research Scripture reading seam");
 const result={fromMovementId:previousMovement.id,toMovementId:nextMovement.id,
  previousSelectedReference:from.reference,nextSelectedReference:to.reference,
  sameWitnessBook:from.book===to.book,kind:"",significantOmission:false,unapprovedContextRequired:false};
 if(from.book!==to.book){
  result.kind="INDEPENDENT_BOOK_TRANSITION";
  return result;
 }
 if(to.startChapter<from.endChapter||
    to.startChapter===from.endChapter&&to.startVerse<=from.endVerse){
  result.kind="SAME_BOOK_BACKTRACK_OR_OVERLAP";
  result.unapprovedContextRequired=true;
  return result;
 }
 if(to.startChapter===from.endChapter){
  const omitted=to.startVerse-from.endVerse-1;
  result.kind=omitted>0?"SAME_CHAPTER_VERSES_OMITTED":"ADJACENT_VERSES";
  result.significantOmission=omitted>0;
  if(omitted>0)result.omittedRange=from.book+" "+from.endChapter+":"+(from.endVerse+1)+"–"+(to.startVerse-1);
  return result;
 }
 const chaptersBetween=to.startChapter-from.endChapter-1;
 result.kind=chaptersBetween>0?"ENTIRE_INTERVENING_CHAPTERS_UNSELECTED":"NEXT_CHAPTER_SOURCE_TRANSITION";
 result.significantOmission=chaptersBetween>0;
 if(chaptersBetween>0)result.omittedChapterSpan=from.book+" "+(from.endChapter+1)+
  (chaptersBetween>1?"–"+(to.startChapter-1):"");
 return result;
}
export function inspectHistoriaReadingSeams(movements){
 if(!Array.isArray(movements))throw Error("Expected source-owned Historia movement array");
 return movements.slice(1).map((m,i)=>inspectHistoriaReadingBoundary(movements[i],m));
}
// These are source-selected passage boundaries, not an archaeological, chronology,
// or event identity judgment. The burial gap is special: both selections are in
// different chapters, and the existing independently owned source-bridge controls
// what may be shown between them.
export function explicitHistoriaBurialHold(seam){
 return Boolean(seam?.fromMovementId==="HS-M28"&&seam?.toMovementId==="HS-M29"&&
  seam.previousSelectedReference==="John 19:17–30"&&seam.nextSelectedReference==="John 20:1–3");
}
