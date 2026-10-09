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
const BOOK_CHAPTER_COUNTS=Object.freeze({Mt:28,Mk:16,Lk:24,Rom:16,"1 Cor":16,"1 Thess":5,Ex:40,Gen:50});
function sourceTarget(base,locator){
  try{
    const uri=new URL(base);
    if(uri.protocol!=="https:")throw new Error("Unverified source scheme");
    // Google Books links in this registry identify books, not verified
    // access to the original paragraph. Never describe them as full text.
    const catalogue=uri.hostname==="books.google.com";
    return Object.freeze({url:uri.href,locator,scope:catalogue?"catalogue":"document",witness:catalogue?"Bibliographic record / preview; complete passage not verified":null});
  }catch{return Object.freeze({url:"",locator,scope:"unverified",witness:null});}
}
export function cseSourceTargets(sourceId,locator,source,{french=false}={}){
  const original=String(locator||"").trim();
  const base=String((french&&source?.canonical_url_fr)||source?.canonical_url||"");
  if(sourceId==="ASSAULT2024" && source?.full_text_url){
    const target=sourceTarget(String(source.full_text_url),original);
    if(target.scope==="document" && new URL(target.url).hostname==="www.researchgate.net")
      return Object.freeze([Object.freeze({...target,scope:"original-full-text",witness:"Author-uploaded full article · methods, results and limitations"})]);
  }
  if(sourceId!=="SCR")return Object.freeze([sourceTarget(base,original)]);
  const parts=original.split(";").map(s=>s.trim()).filter(Boolean);
  if(!parts.length)return Object.freeze([{url:base,locator:original,scope:"index",witness:null}]);
  const chapters=parts.map(part=>{
    const match=CHAPTER_REF.exec(part);
    if(!match||Number(match[2])<1||Number(match[2])>BOOK_CHAPTER_COUNTS[match[1]])return null;
    return {url:`https://www.newadvent.org/bible/${CHAPTER_BOOKS[match[1]]}${match[2].padStart(3,"0")}.htm`,
      locator:part,scope:"chapter",witness:"New Advent · chapter in Latin and English"};
  });
  // Fail closed: never silently discard an unrecognised Scripture citation.
  if(chapters.some(value=>!value))
    return Object.freeze([{url:base,locator:original,scope:"index",witness:null}]);
  return Object.freeze(chapters.map(x=>Object.freeze(x)));
}
