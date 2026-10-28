#!/usr/bin/env node
/**
 * Phase I — All Souls' exceptional collects, independent 1960 rule §248.
 *
 * Authority: ICRSP France, Rubriques du Bréviaire (1960) §248:
 * https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien
 * Prime and Compline collects ordinarily do not change, but the Office
 * of all the Faithful Departed is an explicit exception.
 *
 * Source comparison is a NEGATIVE control on accidentally reusing the next
 * day's ordinary prayers. Distinction alone is NOT a proper-text collation.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join,dirname} from "node:path";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";

export const OFFICE_PRAYER_EXCEPTION_SOURCE=Object.freeze({
  source:"Institut du Christ Roi Souverain Prêtre — Rubriques du Bréviaire (1960)",
  url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0149_ancien",
  rubric:"248",printedRubricChecked:true,
  requirement:"Prime and Compline prayers have a specific All Souls exception; do not reuse ordinary collect automatically.",
});
const digest=text=>createHash("sha256").update(text,"utf8").digest("hex");
export function compareExceptionCollect({souls,ordinary,hour}={}){
  if(!["PRIME","COMPLINE"].includes(hour))
    throw Error("OFFICE_EXCEPTION_HOUR_UNSUPPORTED");
  for(const [doc,date] of [[souls,"2026-11-02"],[ordinary,"2026-11-03"]]){
    if(doc?.schema!=="ao.office.source-cells.v1"||
      doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
      doc?.date!==date||doc?.hour!==hour||doc?.language!=="la"||
      doc?.status!=="STRUCTURED_UNVERIFIED"||doc?.publishable!==false||
      !Array.isArray(doc.sections)||!doc.sections.length)
      throw Error("OFFICE_EXCEPTION_SOURCE_INVALID:"+date+":"+hour);
  }
  const prayerCell=doc=>{
    const candidates=doc.sections.filter(s=>s.semantic?.role==="PRAYER"||
      /^(?:Oratio|Oratió)\b/i.test(s.text));
    if(candidates.length!==1 || !candidates[0].text.trim())
      throw Error("OFFICE_EXCEPTION_PRAYER_AMBIGUOUS:"+doc.date+":"+hour);
    return candidates[0];
  };
  const a=prayerCell(souls),b=prayerCell(ordinary);
  const comparable=a.text.normalize("NFC").trim()!==b.text.normalize("NFC").trim();
  return Object.freeze({
    hour,exceptionDate:souls.date,controlDate:ordinary.date,
    printedRule:"248",sourceRevision:DIVINUM_OFFICIUM_PIN,
    exceptionSourceCellId:a.sourceCellId,controlSourceCellId:b.sourceCellId,
    exceptionTextSha256:digest(a.text),controlTextSha256:digest(b.text),
    distinctFromFollowingOrdinaryCollect:comparable,
    requiresManualPrintedProperCollation:true,
    correctProperTextIndependentlyCertified:false,
    translatedTextVerified:false,publishable:false,
  });
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==6||args[0]!=="--souls"||args[2]!=="--main"||args[4]!=="--report")
    throw Error("USAGE: --souls directory --main directory --report file");
  const soulsRoot=resolve(args[1]),ordinaryRoot=resolve(args[3]),dest=resolve(args[5]);
  const read=(root,date,hour)=>JSON.parse(
    readFileSync(join(root,date,hour.toLowerCase(),"la.research.json"),"utf8"));
  const checks=["PRIME","COMPLINE"].map(hour=>compareExceptionCollect({
    hour,souls:read(soulsRoot,"2026-11-02",hour),
    ordinary:read(ordinaryRoot,"2026-11-03",hour),
  }));
  const result={
    schema:"ao.office.all-souls-exception-collect-audit.v1",
    witness:OFFICE_PRAYER_EXCEPTION_SOURCE,
    comparisons:checks,
    distinctCompared:checks.filter(x=>x.distinctFromFollowingOrdinaryCollect).length,
    total:checks.length,
    printedProperTextFullyCollated:false,
    translatedTextsCertified:0,published:0,canPublish:false,
  };
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(result,null,2)+"\n","utf8");
  console.log("OFFICE_ALL_SOULS_PRAYER_EXCEPTION",JSON.stringify(result));
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
