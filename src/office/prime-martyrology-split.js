/**
 * Research-only presentation boundary within All Souls Prime's single
 * source-owned Prima5 cell. The Latin/vernacular are cut independently
 * at the corresponding source-attested "In memoria aeterna" versicle,
 * NEVER by line number or inferred line-to-line translation.
 *
 * This is not an Office edition or a rewrite of the Martyrology. The
 * original source cell, id, text, and order remain intact in normalized
 * source documents and are exactly reconstructible from these two parts.
 */
const fold=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("æ","ae").replaceAll("Æ","AE").replaceAll("œ","oe")
  .toLowerCase().trim();
export const OFFICE_PRIME_SOURCE_BOUNDARY="ao.office.prime-martyrology-source-boundary.v1";
const ANCHORS=Object.freeze({
  la:/^[℣v]\.?\s*in memoria aeterna erunt justi\b/u,
  en:/^[℣v]\.?\s*the just shall be in everlasting remembrance\b/u,
  fr:/^[℣v]\.?\s*en souvenir eternel seront les justes\b/u,
});
const PRAYER_MARKERS=Object.freeze({
  la:/\bdeus,?\s+veniae\s+largitor\b/u,
  en:/\bo god\s+the giver of pardon\b/u,
  fr:/\bo dieu,?\s+qui donnez le pardon\b/u,
});
export function splitAllSoulsPrimeMartyrologyCell(text,language){
  if(!Object.hasOwn(ANCHORS,language)||typeof text!=="string")
    throw Error("OFFICE_PRIME_SPLIT_LANGUAGE_OR_TEXT_INVALID");
  // Normalizer retains significant line boundaries. Never silently repair
  // spelling, remove lines or trim a source cell to manufacture a boundary.
  const lines=text.split("\n");
  const matches=[];
  for(let i=0;i<lines.length;i++)
    if(ANCHORS[language].test(fold(lines[i])))matches.push(i);
  if(matches.length!==1||matches[0]===0||matches[0]===lines.length-1){
    // The pinned composer can transform punctuation and glyphs. Report only
    // bounded nearby candidate verses, never silently guess a boundary.
    // This diagnostic is needed to reconcile an exact live source witness.
    const candidates=lines.map((line,index)=>({line,index})).filter(({line})=>
      /memori|souvenir|remembrance|venia|pardon|justi|iusti/u.test(fold(line)))
      .slice(-8).map(({line,index})=>({index,text:line.slice(0,110)}));
    throw Error("OFFICE_PRIME_SPLIT_VERSICLE_BOUNDARY_AMBIGUOUS:"+
      language+":matches="+matches.length+":candidates="+JSON.stringify(candidates));
  }
  const boundary=matches[0];
  const martyrology=lines.slice(0,boundary).join("\n");
  const postPrayer=lines.slice(boundary).join("\n");
  if(!martyrology.trim()||!PRAYER_MARKERS[language].test(fold(postPrayer)))
    throw Error("OFFICE_PRIME_SPLIT_PRAYER_OR_READING_MISSING:"+language);
  if(martyrology+"\n"+postPrayer!==text)
    throw Error("OFFICE_PRIME_SPLIT_SOURCE_TEXT_MODIFIED");
  return Object.freeze({martyrology,postPrayer,boundaryLine:boundary,
    totalLines:lines.length,sourceTextFullyPreserved:true});
}
export function primeSplitRequired({date,hour,role,sourceCellId}={}){
  return date==="2026-11-02"&&hour==="PRIME"&&
    role==="MARTYROLOGY"&&sourceCellId==="Prima5";
}
