// Original scanned 1961 Graduale pages, not derived music or public approval.
// URLs are GregoBase CMAA source-image pages, NOT generated score renderings.
// A scan locator is evidence of a page location, never staff/neume parity.
export const FIRST12_1961_FACSIMILE_SCHEMA=
 "ao-first12-gregorian-solesmes-1961-facsimile-locators-v1";
const original=Object.freeze([
 // id, chant family, printed folio, authenticated source-page image number.
 [782,"co","362",404],
 [918,"co","59",85],
 [403,"in","57",83],
 [1147,"of","59",85],
 [265,"of","79",105],
 [464,"co","386",428],
 [1136,"in","336",378],
 [1165,"in","360",402],
 [1271,"in","383",425],
 [475,"in","392",434],
 [182,"of","362",404],
 [648,"of","90",116]
]);
const continuations=new Map([
 // Four scores visibly continue on the next printed folio.
 [475,["393",435]],[782,["363",405]],
 [265,["80",106]],[1271,["384",426]]
]);
const source2Image=n=>"https://gregobase.selapa.net/sources/2/"+n+".png";
const entries=Object.freeze(original.map(([id,part,folio,imageNumber])=>{
 const continuation=continuations.get(id)??null;
 const scannedFolios=Object.freeze([
  Object.freeze({folio,imageNumber,url:source2Image(imageNumber)}),
  ...(continuation?[Object.freeze({folio:continuation[0],
     imageNumber:continuation[1],url:source2Image(continuation[1])})]:[])
 ]);
 if(continuation&&(Number(continuation[0])!==Number(folio)+1||
     continuation[1]!==imageNumber+1))
  throw Error("PRINTED_1961_CONTINUATION_NOT_ADJACENT");
 return Object.freeze({
  scoreId:"GREGOBASE-"+id,part,folio,
  sourceUrl:"https://gregobase.selapa.net/chant.php?id="+id,
  scanned1961PageUrl:source2Image(imageNumber),
  imageNumber,scannedFolios,
  printedFolioSpan:scannedFolios.map(x=>x.folio).join("–"),
  completeSourceSpanLocated:true,
  sourceSpanMusicallyCompared:false,
  sourceBook:"Graduale Romanum, Solesmes, 1961",
  scoreProof:"PRINT_FACSIMILE_SOURCE_LOCATED_NOT_MUSICALLY_COMPARED",
  publication:"EDITORIAL_HOLD_NOT_PUBLIC"
 });}));
const byId=new Map(entries.map(x=>[x.scoreId,x]));
export const FIRST12_1961_FACSIMILES=entries;
export function first12PrintedFacsimileForScore(score){
 if(!score||!/^GREGOBASE-\d+$/.test(score.scoreId))return null;
 const match=byId.get(score.scoreId);
 if(!match)return null;
 if(String(score.original1961Page)!==match.folio||
    score.part!==match.part||score.sourceUrl!==match.sourceUrl||
    score.publication!=="EDITORIAL_HOLD_NOT_PUBLIC"||
    score.approvedForMassReader!==false)
  throw Error("1961_PRINTED_FACSIMILE_SOURCE_OR_READER_APPROVAL_DRIFT");
 return match;
}
