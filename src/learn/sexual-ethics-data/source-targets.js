/*
 * The canonical Scripture source has a book-index URL; a citation to a
 * specific passage must not send the reader only to that index.
 * New Advent's chapter pages carry English and Latin witnesses. They do
 * not provide a verified verse-fragment anchor, so preserve the visible
 * verse locator without pretending the link selects individual verses.
 */
const CHAPTER_BOOKS=Object.freeze({
  Mt:"mat",Mk:"mar",Lk:"luk",Rom:"rom",
  "1 Cor":"1co","1 Thess":"1th",Ex:"exo",Gen:"gen"
});
const CHAPTER_REF=/^(Mt|Mk|Lk|Rom|1 Cor|1 Thess|Ex|Gen)\s+(\d{1,3}):(\d+(?:[\u2013-]\d+)?)$/;
export function cseSourceTargets(sourceId,locator,source,{french=false}={}){
  const original=String(locator||"").trim();
  const base=String((french&&source?.canonical_url_fr)||source?.canonical_url||"");
  if(sourceId!=="SCR")return Object.freeze([{url:base,locator:original,scope:"document",witness:null}]);
  const parts=original.split(";").map(s=>s.trim()).filter(Boolean);
  if(!parts.length)return Object.freeze([{url:base,locator:original,scope:"index",witness:null}]);
  const chapters=parts.map(part=>{
    const match=CHAPTER_REF.exec(part);
    if(!match||Number(match[2])<1||Number(match[2])>150)return null;
    return {url:`https://www.newadvent.org/bible/${CHAPTER_BOOKS[match[1]]}${match[2].padStart(3,"0")}.htm`,
      locator:part,scope:"chapter",witness:"New Advent · chapter in Latin and English"};
  });
  // Fail closed: never silently discard an unrecognised Scripture citation.
  if(chapters.some(value=>!value))
    return Object.freeze([{url:base,locator:original,scope:"index",witness:null}]);
  return Object.freeze(chapters.map(x=>Object.freeze(x)));
}
