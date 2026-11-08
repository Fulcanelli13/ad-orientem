// Display-only breathing space within canonical ordinary prayers.
// Never split source records, cue IDs, gesture owners, or the paired translations.
// The returned fragments concatenate byte-for-byte to the source display text.
export const PRAYER_READING_PARAGRAPHS_VERSION="mass-prayer-reading-paragraphs-v1";

const PRAYER_BLOCK_NUMBERS=Object.freeze([
  5,7,16,27,31,33,34,35,38,
  47,48,49,50,51,54,55,56,57,58,59,
  63,64,69,70,71,72,73,74,75,76,
  83,84,86,87,89,90,93,94,
]);
const PRAYER_BLOCKS=new Set(PRAYER_BLOCK_NUMBERS.map(number=>
  "AO.SM.B"+String(number).padStart(3,"0")));

/**
 * Insert visual paragraph opportunities at existing punctuation only.
 * Deliberately excluded: propers/readings, rubrics, dialogue responses,
 * Consecration words, chant with authored breaks, and unrelated modules.
 * No source string is trimmed, normalised or rewritten.
 */
export function readingPrayerFragments(value,{
  sourceBlockId=null,kind="TEXT",mode="MISSAL",
}={}){
  const raw=String(value??"");
  if(!["MISSAL","LIVE"].includes(String(mode).toUpperCase()) ||
     String(kind).toUpperCase()!=="TEXT" ||
     !PRAYER_BLOCKS.has(String(sourceBlockId??"")) ||
     raw.length<110 || /[\r\n]/.test(raw) ||
     /^\s*[\[℣℟]/u.test(raw))return [raw];

  const cuts=[];
  // Colon/semicolon: petitions. Sentence stops: only if the next word
  // begins with a capital, avoiding initials/abbreviations inside a clause.
  for(const match of raw.matchAll(/[:;.!?]/gu)){
    const index=match.index;
    const next=raw.slice(index+1);
    if(!/^[ \t]+\S/u.test(next))continue;
    if(/[.!?]/u.test(match[0])&&!/^[ \t]+[A-ZÀ-ÖØ-Þ]/u.test(next))continue;
    const start=cuts.at(-1)??0;
    if(raw.slice(start,index+1).trim().length<12 ||
       next.trim().length<16)continue;
    cuts.push(index+1);
    if(cuts.length>=11)break;
  }
  if(!cuts.length)return [raw];
  const parts=[],stops=[...cuts,raw.length];
  let start=0;
  for(const end of stops){parts.push(raw.slice(start,end));start=end;}
  // A section is a visual span, never a new liturgical paragraph/cue.
  if(parts.some(part=>!part.trim()))return [raw];
  return parts;
}
