// Maps verified Canon rubric triggers to precise source text spans.
// The normalised key is used ONLY for matching. Nothing changes the
// 1962 Latin string, its cross marks, spaces or accentuation.
const WORD="SOURCE_LATIN_WORDS";
const SOURCE_TYPES=new Set([
 WORD,"ORDERED_NON_TEXT_CEREMONY","PERSISTENT_SOURCE_STATE",
 "OBSERVED_ANTICIPATORY_EVENT",
]);
function foldSource(source){
  const letters=[],offsets=[];
  let utf16=0;
  for(const char of String(source??"")){
    const start=utf16;utf16+=char.length;
    const decomposed=char.toLowerCase().normalize("NFD");
    for(const part of decomposed){
      if(/\p{M}/u.test(part))continue;
      const replacement=part==="æ"?"ae":part==="œ"?"oe":part;
      for(const one of replacement){
        if(/[a-z0-9]/.test(one)){
          letters.push(one);offsets.push([start,utf16]);
        }
      }
    }
  }
  return Object.freeze({key:letters.join(""),offsets:Object.freeze(offsets)});
}
function safeSourceSpan(source,folded,fragment){
  const pattern=foldSource(fragment).key;
  if(!pattern)return null;
  const pos=folded.key.indexOf(pattern);
  if(pos<0||folded.key.indexOf(pattern,pos+1)>=0)return null;
  const start=folded.offsets[pos]?.[0];
  const end=folded.offsets[pos+pattern.length-1]?.[1];
  if(!Number.isInteger(start)||!Number.isInteger(end)||end<=start)
    return null;
  return Object.freeze({trigger:fragment,start,end,
    sourceText:source.slice(start,end),sourceCharactersUnchanged:true});
}
export function resolveCanonLatinWordAnchors({
  sourceLatin,anchorKind,anchorLatin,
}={}){
  const kind=String(anchorKind??"");
  if(!SOURCE_TYPES.has(kind))
    return Object.freeze({status:"UNKNOWN_ANCHOR_TYPE",spans:Object.freeze([])});
  if(kind!==WORD)
    return Object.freeze({status:"NON_TEXT_SOURCE_EVENT",spans:Object.freeze([])});
  if(typeof sourceLatin!=="string"||!sourceLatin.trim() ||
     typeof anchorLatin!=="string"||!anchorLatin.trim())
    return Object.freeze({status:"LATIN_TEXT_OR_ANCHOR_MISSING",spans:Object.freeze([])});
  const original=sourceLatin;
  const fragmentList=anchorLatin.split(/\s*\/\s*/).map(s=>s.trim()).filter(Boolean);
  if(!fragmentList.length)
    return Object.freeze({status:"LATIN_TEXT_OR_ANCHOR_MISSING",spans:Object.freeze([])});
  const folded=foldSource(original);
  const spans=fragmentList.map(fragment=>safeSourceSpan(original,folded,fragment));
  if(spans.some(x=>!x))
    return Object.freeze({status:"MISSING_OR_AMBIGUOUS_LATIN_ANCHOR",spans:Object.freeze([])});
  for(let i=1;i<spans.length;i++){
    if(spans[i].start<=spans[i-1].end)
      return Object.freeze({status:"NON_SEQUENTIAL_LATIN_ANCHORS",spans:Object.freeze([])});
  }
  return Object.freeze({status:"WORD_MATCH_EXACT",spans:Object.freeze(spans)});
}
