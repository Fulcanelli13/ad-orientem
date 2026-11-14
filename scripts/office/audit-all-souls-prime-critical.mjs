#!/usr/bin/env node
/**
 * Phase L: the 1960 Roman All Souls Office's Prime after-Martyrology prayer.
 * This compares the PINNED source strings in all three languages, not merely
 * card counts. It intentionally does not change a single liturgical word.
 *
 * A mismatch in recipient group, incomplete Martyrology, or uncertain
 * source-rights attribution blocks publication for the entire Office hour.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
import {createHash} from "node:crypto";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {sourceCellHasMissingTranslation} from "../../src/office/research-reader.js";

const sha256=s=>createHash("sha256").update(s,"utf8").digest("hex");
const plain=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("æ","ae").replaceAll("œ","oe").replaceAll("Æ","AE").replaceAll("Œ","OE")
  .replace(/\s+/g," ").toLowerCase();
const validate=(doc,lang)=>{
  if(doc?.schema!=="ao.office.source-cells.v1"||
     doc?.date!=="2026-11-02"||doc?.hour!=="PRIME"||
     doc?.language!==lang||doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
     doc?.status!=="STRUCTURED_UNVERIFIED"||doc?.publishable!==false||
     !Array.isArray(doc.sections))
    throw Error("OFFICE_L_INVALID_SOURCE:"+lang);
  const indices=new Set(doc.sections.map(s=>s.sourceCellId));
  if(indices.size!==doc.sections.length)throw Error("OFFICE_L_SOURCE_DUPLICATE_ID:"+lang);
  for(const id of ["Prima4","Prima5","Prima6"])
    if(!indices.has(id))throw Error("OFFICE_L_SOURCE_MISSING_ID:"+lang+":"+id);
  return doc;
};
const find=(d,id)=>d.sections.find(s=>s.sourceCellId===id);
const normalizedSpan=(text,re)=>re.test(plain(text));
export const PRIME_LITURGICAL_WITNESSES=Object.freeze({
  1960: "https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien",
  romanMartyrologyChanges1960:
    "https://isidore.co/divinum/www/horas/Help/Rubrics/Variationes%20in%20Martyrologio%20Romano%20(AAS%2052,%201960).pdf",
  martyrologyHistoricalRule1930:
    "https://librinostri.catholica.cz/download/MartyrRom1930-r.pdf",
  independentHistoricalRuleNotComplete1960Edition:true,
  printedMartyrologyFor2026_11_03FullyCollated:false,
  printedRomanPrayerFor2026_11_02FullyCollated:false,
});
export function auditAllSoulsPrime({latin,english,french}={}){
  for(const [d,lang] of [[latin,"la"],[english,"en"],[french,"fr"]])
    validate(d,lang);
  const cells={latin:find(latin,"Prima5"),english:find(english,"Prima5"),
    french:find(french,"Prima5")};
  const v=Object.values(cells);
  if(v.some(c=>sourceCellHasMissingTranslation(c.text)||!c.text.trim()||
    c.semantic?.role!=="MARTYROLOGY"||
    c.semantic?.latinSourceCellId!=="Prima5"))
    throw Error("OFFICE_L_MARTYROLOGY_SOURCE_UNRESOLVED");
  const headings=Object.fromEntries(Object.entries(cells).map(([lang,c])=>
    [lang,c.text.split("\n")[0]]));
  const lengths=Object.fromEntries(Object.entries(cells).map(([lang,c])=>[lang,c.text.length]));
  const hashes=Object.fromEntries(Object.entries(cells).map(([lang,c])=>[lang,sha256(c.text)]));
  // These test the underlying SOURCE text's intended beneficiaries.
  const latinAllFaithful=normalizedSpan(cells.latin.text,/animas omnium fidelium qui ex hoc/);
  const frenchAllFaithful=normalizedSpan(cells.french.text,/ames de tous les fideles qui sont sortis de ce monde/);
  const englishCongregation=normalizedSpan(cells.english.text,
    /brethren of our congregation, kinsfolk, and benefactors/);
  // Misleading variant even if all three language cells parse and render.
  const recipientScopeMismatch=latinAllFaithful&&frenchAllFaithful&&englishCongregation;
  // The prepared Martyrology may include dynamic material. A heading such as
  // Martyrologe {anticipé} does not certify the actual 3 November entry,
  // Moon/Luna or 1961 updates.
  const martyrologyCalendarDate="2026-11-03";
  const result={
    schema:"ao.office.all-souls-prime-critical-review.v1",
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    officeDate:"2026-11-02",hour:"PRIME",
    prayerSourceCellId:"Prima5",martyrologyCalendarDate,
    sourceRoles:{openingPrayer:"Prima4",martyrologyAndSecondPrayer:"Prima5",conclusion:"Prima6"},
    witnesses:PRIME_LITURGICAL_WITNESSES,
    recipientScope:{latinAllFaithful,frenchAllFaithful,englishCongregation,
      mismatch:recipientScopeMismatch,
      englishVariantFromRomanProperEstablished:false},
    sourceCellHeadings:headings,sourceCellTextLengths:lengths,sourceCellSha256:hashes,
    martyrologySourceContainsMarker:Object.fromEntries(Object.entries(cells).map(
      ([lang,c])=>[lang,/\{(?:anticip[ée]|anticipatur|anticipated)\}/iu.test(c.text)])),
    martyrologyNeedsCorrectNextDayReading:true,
    martyrology2026_11_03TextVerified:false,
    martyrology1961VariationAppliedAndVerified:false,
    primeCollectComparedAgainstPrintedRomanProper:false,
    englishRecipientScopeReviewedAndApproved:false,
    frenchTextReviewedAndApproved:false,
    readyForPublicReader:false,published:0,
  };
  return Object.freeze(result);
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--candidate"||args[2]!=="--report")
    throw Error("USAGE: --candidate <research-directory> --report <path>");
  const root=resolve(args[1]),dest=resolve(args[3]);
  const read=l=>JSON.parse(readFileSync(join(root,"2026-11-02","prime",l+".research.json"),"utf8"));
  const result=auditAllSoulsPrime({latin:read("la"),english:read("en"),french:read("fr")});
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(result,null,2)+"\n");
  console.log("OFFICE_L_PRIME",JSON.stringify({
    recipientScope:result.recipientScope,
    martyrologyDate:result.martyrologyCalendarDate,
    headings:result.sourceCellHeadings,lengths:result.sourceCellTextLengths,
    printedTextVerified:false,published:0,
  }));
  // Do not allow drift to make the known mismatch silently disappear.
  // If source data changes, reviewer must inspect the new source before
  // altering this status or adding a corrected version.
  if(!result.recipientScope.mismatch)
    throw Error("OFFICE_L_EXPECTED_PRIME_SOURCE_REVIEW_DRIFT");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(error){console.error(error?.stack??String(error));process.exitCode=1}
}
