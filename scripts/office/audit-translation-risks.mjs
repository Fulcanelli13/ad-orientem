#!/usr/bin/env node
/**
 * High-volume tri-language risk screening, not theological/translation proof.
 * All three source cells remain intact and private to CI scratch.
 * Reports only counts, source IDs and limited structural risk indicators.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join,dirname} from "node:path";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {sourceCellHasMissingTranslation} from "../../src/office/research-reader.js";

const tidy=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .toLowerCase().replace(/\s+/g," ").trim();
export function triLanguageRisks({latin,english,french}={}){
  const docs=[latin,english,french];
  if(docs.some((d,i)=>d?.schema!=="ao.office.source-cells.v1"||
    d?.language!==["la","en","fr"][i]||
    d?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    d?.status!=="STRUCTURED_UNVERIFIED"||d?.publishable!==false||
    !Array.isArray(d.sections)||!d.sections.length))
    throw Error("OFFICE_TRANSLATION_RISK_SOURCE_INVALID");
  if(docs.some(d=>d.date!==latin.date||d.hour!==latin.hour))
    throw Error("OFFICE_TRANSLATION_RISK_CONTEXT_MISMATCH");
  if(docs.some(d=>d.sections.length!==latin.sections.length))
    throw Error("OFFICE_TRANSLATION_RISK_CELL_COUNT_MISMATCH");
  const risk=[];
  for(let i=0;i<latin.sections.length;i++){
    const [a,b,c]=docs.map(d=>d.sections[i]);
    if(docs.some(d=>d.sections[i].index!==a.index||
      d.sections[i].semantic?.latinSourceCellId!==a.sourceCellId))
      throw Error("OFFICE_TRANSLATION_RISK_ALIGNMENT_INVALID:"+i);
    const reference=tidy(a.text),e=tidy(b.text),f=tidy(c.text);
    const bodyBytes=[a,b,c].map(x=>x.text.length);
    for(const [language,value,cell] of [["en",e,b],["fr",f,c]]){
      const placeholder=sourceCellHasMissingTranslation(cell.text);
      const sameLatin=reference.length>=150&&value===reference;
      const sameOther=value.length>=150&&(language==="en"?f:e)===value;
      const ratio=value.length/Math.max(1,reference.length);
      const extremeRatio=reference.length>=160&&(ratio<0.30||ratio>3.5);
      if(placeholder||sameLatin||sameOther||extremeRatio){
        risk.push({
          date:latin.date,hour:latin.hour,language,
          latinSourceCellId:a.sourceCellId,translationSourceCellId:cell.sourceCellId,
          reason:[placeholder?"UPSTREAM_PLACEHOLDER_MISSING_TEXT":null,
            sameLatin?"LONG_CELL_IDENTICAL_TO_LATIN":null,
            sameOther?"LONG_CELL_IDENTICAL_TO_OTHER_TRANSLATION":null,
            extremeRatio?"EXTREME_LENGTH_RATIO":null].filter(Boolean),
          lengths:{latin:bodyBytes[0],translation:cell.text.length},
          translationToLatinRatio:Number(ratio.toFixed(3)),
          sourceRole:a.semantic?.role??"UNCLASSIFIED",
          sourceHeadings:{latin:a.text.split("\n",1)[0].slice(0,85),
            translation:cell.text.split("\n",1)[0].slice(0,85)},
          review:"PENDING_HUMAN_SOURCE_COLLATION",
          isDefiniteTranslationError:false,
        });
      }
    }
  }
  return {
    date:latin.date,hour:latin.hour,
    sourceCellCount:latin.sections.length,localeCellsScreened:latin.sections.length*2,
    flags:risk,flagCount:risk.length,
    manualTranslationReviewRequired:true,translationCertified:false,
  };
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==4||args[0]!=="--out"||args[2]!=="--report")
    throw Error("USAGE: --out directory --report path");
  const root=resolve(args[1]),dest=resolve(args[3]);
  const manifest=JSON.parse(readFileSync(join(root,"normalized-manifest.json"),"utf8"));
  if(manifest?.schema!=="ao.office.normalization-audit.v1"||
    manifest.published!==0||manifest.liturgicallyVerified!==0)
    throw Error("OFFICE_TRANSLATION_RISK_MANIFEST_INVALID");
  const groups=[...new Set(manifest.records.map(r=>r.date+":"+r.hour))].sort();
  const quarantined=[],data=[];
  for(const group of groups){
    const [date,hour]=group.split(":");
    const read=l=>JSON.parse(readFileSync(join(root,date,hour.toLowerCase(),l+".research.json"),"utf8"));
    const docs={latin:read("la"),english:read("en"),french:read("fr")};
    try{data.push(triLanguageRisks(docs));}
    catch(error){
      // Never coerce different numbers of Latin, English and French source
      // cells into aligned translations. Isolate the entire Office hour.
      if(!/OFFICE_TRANSLATION_RISK_(?:CELL_COUNT_MISMATCH|ALIGNMENT_INVALID)/.test(String(error)))
        throw error;
      quarantined.push({date,hour,reason:"SOURCE_ALIGNMENT_UNVERIFIED",
        sectionCounts:{la:docs.latin.sections.length,en:docs.english.sections.length,fr:docs.french.sections.length},
        allTranslationsRequireManualReview:true});
    }
  }
  const report={
    schema:"ao.office.translation-risk-screening.v1",
    sourceRevision:DIVINUM_OFFICIUM_PIN,
    dateCount:new Set(data.map(d=>d.date)).size,
    trilingualHourCount:groups.length,
    structurallyScreenedHourCount:data.length,
    quarantinedSourceHourCount:quarantined.length,
    quarantinedSourceHours:quarantined,
    alignedLatinCells:data.reduce((s,x)=>s+x.sourceCellCount,0),
    translationCellsScreened:data.reduce((s,x)=>s+x.localeCellsScreened,0),
    flaggedTranslationCells:data.reduce((s,x)=>s+x.flagCount,0),
    groupsWithFlags:data.filter(d=>d.flagCount).length,
    // Does not infer correctness or any entitlement to publish.
    flags:data.flatMap(x=>x.flags),verifiedTranslations:0,
    printedProperTextCollations:0,published:0,canPublish:false,
  };
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+"\n","utf8");
  for(const flag of report.flags){
    // Publish only short incipits/identifiers for the six suspected errors;
    // substantive text remains in ephemeral pinned source files in CI.
    console.log("OFFICE_TRANSLATION_FLAG",JSON.stringify(flag));
  }
  console.log("OFFICE_TRANSLATION_RISK_SUMMARY",JSON.stringify({
    trilingualHours:report.trilingualHourCount,
    alignedHours:report.structurallyScreenedHourCount,
    quarantinedHours:report.quarantinedSourceHourCount,
    alignedLatinCells:report.alignedLatinCells,
    translationCellsScreened:report.translationCellsScreened,
    flaggedCells:report.flaggedTranslationCells,
    groupsWithFlags:report.groupsWithFlags,
    verifiedTranslations:0,published:0,
  }));
}
if(process.argv[1]&&new URL("file://"+resolve(process.argv[1])).href===import.meta.url){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1;}
}
