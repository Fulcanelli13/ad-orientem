#!/usr/bin/env node
/**
 * Phase K: inspect each All Souls French source cell recovered by the
 * reversible punctuation overlay. The raw upstream files are the source
 * witness only, NOT an independent historical printed Breviary.
 *
 * No source text is edited and no review status is upgraded to certified.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {dirname,resolve,join} from "node:path";
import {fileURLToPath} from "node:url";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {sourceCellHasMissingTranslation} from "../../src/office/research-reader.js";

export const K_CELLS=Object.freeze({
  PRIME:Object.freeze({Prima4:"Oratio mortuorum2",Prima5:"#Martyrologium",Prima6:"Conclusio"}),
  TERCE:Object.freeze({Tertia4:"Oratio mortuorum",Tertia5:"Conclusio"}),
  SEXT:Object.freeze({Sexta4:"Oratio mortuorum",Sexta5:"Conclusio"}),
  NONE:Object.freeze({Nona4:"Oratio mortuorum",Nona5:"Conclusio"}),
  COMPLINE:Object.freeze({Completorium6:"Oratio mortuorum1",Completorium7:"Conclusio"}),
});
export const K_PROVENANCE=Object.freeze({
  sourceRevision:DIVINUM_OFFICIUM_PIN,
  originalFrench:"web/www/horas/Francais/Sancti/11-02.txt",
  originalFrenchGitBlob:"83205d6cf8fbbdefb9b6c1c9c7848a6049203e63",
  frenchCommon:"web/www/horas/Francais/Commune/C9.txt",
  frenchCommonGitBlob:"8e07a47b8e725ee6d5e06a6f9621e22b4075f734",
  projectLicense:"MIT",
  pinnedLicense:"LICENSE",
  projectDiscussion:"https://github.com/DivinumOfficium/divinum-officium/discussions/5071",
  printedWitnessCandidate:"Le Bréviaire Romain, latin-français, Labergerie, 1934",
  printedWitnessUrl:"https://www.liberius.net/livre.php?id_livre=1439",
  oldPrintedWitnessRubricsMatch1960:false,
  rightsStatus:"PROJECT_MIT_AND_MAINTAINER_STATEMENT_FOUND_REVIEW_ATTRIBUTION",
});
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const compact=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replaceAll("æ","ae").replaceAll("œ","oe").replace(/[’‘]/g,"'").replace(/\s+/g," ").trim();
const prefix=s=>String(s??"").split("\n")[0].slice(0,110);
function validated(doc,language,hour){
  if(doc?.schema!=="ao.office.source-cells.v1"||doc?.date!=="2026-11-02"||
    doc?.hour!==hour||doc?.language!==language||
    doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    doc?.status!=="STRUCTURED_UNVERIFIED"||doc?.publishable!==false||
    !Array.isArray(doc.sections)||!doc.sections.length)
    throw Error("OFFICE_K_SOURCE_INVALID:"+hour+":"+language);
  return doc;
}
/** The review entry cannot be turned into an editorial approval by a parser. */
export function inspectRecoveredFrenchHour({hour,baseline,candidate,latin,english}={}){
  const expected=K_CELLS[hour];
  if(!expected)throw Error("OFFICE_K_HOUR_INVALID");
  validated(baseline,"fr",hour);validated(candidate,"fr",hour);
  validated(latin,"la",hour);validated(english,"en",hour);
  const first=baseline.sections.map(x=>x.sourceCellId);
  const second=candidate.sections.map(x=>x.sourceCellId);
  if(JSON.stringify(first)!==JSON.stringify(second)||
    first.length!==latin.sections.length||first.length!==english.sections.length)
    throw Error("OFFICE_K_SOURCE_ID_DRIFT");
  const list=[];
  for(const [id,upstreamSection] of Object.entries(expected)){
    const idx=first.indexOf(id);
    if(idx<0)throw Error("OFFICE_K_EXPECTED_ID_NOT_FOUND:"+id);
    const b=baseline.sections[idx],f=candidate.sections[idx],
      l=latin.sections[idx],e=english.sections[idx];
    if(!sourceCellHasMissingTranslation(b.text))
      throw Error("OFFICE_K_EXPECTED_MISSING_BASELINE:"+id);
    if(sourceCellHasMissingTranslation(f.text)||!f.text.trim())
      throw Error("OFFICE_K_RECOVERY_INCOMPLETE:"+id);
    if(!l.text.trim()||!e.text.trim()||
      f.semantic?.latinSourceCellId!==l.sourceCellId||
      e.semantic?.latinSourceCellId!==l.sourceCellId)
      throw Error("OFFICE_K_TRI_LANGUAGE_ALIGNMENT_INVALID:"+id);
    const lf=compact(f.text), ll=compact(l.text),le=compact(e.text);
    const identicalLatin=lf.length>=40&&lf===ll;
    const identicalEnglish=lf.length>=40&&lf===le;
    list.push(Object.freeze({
      hour,sourceCellId:id,latinSourceCellId:l.sourceCellId,
      upstreamFrenchSection:upstreamSection,sourceRole:f.semantic.role,
      originalFrenchStatus:"UPSTREAM_PLACEHOLDER",candidateFrenchStatus:"GENERATED_NONPLACEHOLDER",
      originalFrenchSha256:hash(b.text),candidateFrenchSha256:hash(f.text),
      latinSha256:hash(l.text),englishSha256:hash(e.text),
      candidateLength:f.text.length,latinLength:l.text.length,englishLength:e.text.length,
      frenchIncipit:prefix(f.text),latinIncipit:prefix(l.text),
      latinLanguageBleedRisk:identicalLatin,englishLanguageBleedRisk:identicalEnglish,
      // Passage comparison against the historical printed Office remains
      // entirely separate from checking the source engine's code behaviour.
      historicalProperTextMatched:false,reviewedByHuman:false,
      scopeTranslationApproved:false,sourceRightsAttributionAudited:false,
      canPublish:false,
    }));
  }
  return list;
}
/**
 * Source-leaf comparison is a useful risk signal: the Latin 11-02.txt and
 * the English 11-02.txt appear to give different recipient groups after
 * "Deus, veniae largitor". This is a textual finding for a reviewer, not a
 * machine-issued translation correction.
 */
export function checkPrimeRecipientScope({latinProper,englishProper,frenchProper}={}){
  const l=compact(latinProper),e=compact(englishProper),f=compact(frenchProper);
  const latinAllFaithful=/animas omnium fidelium qui ex hoc/.test(l);
  const englishCongregation=/brethren of our congregation, kinsfolk, and benefactors/.test(e);
  const frenchAllFaithful=/ames de tous les fideles qui sont sortis de ce monde/.test(f);
  return Object.freeze({
    id:"OFFICE_PRIME_POST_MARTYROLOGY_RECIPIENT_SCOPE",
    latinAllFaithful,englishCongregation,frenchAllFaithful,
    scopeMismatchCandidate:latinAllFaithful&&englishCongregation&&frenchAllFaithful,
    printedProperReviewNeeded:true,englishCorrectionApproved:false,
  });
}
function section(file,heading){
  const c=readFileSync(file,"utf8");
  const start=c.indexOf("\n["+heading+"]");
  if(start<0)throw Error("OFFICE_K_PROPER_SECTION_NOT_FOUND:"+heading);
  const content=c.slice(start+heading.length+3).split(/\n\[[^\]]+\]/,1)[0];
  return content;
}
function main(){
  const args=process.argv.slice(2);
  if(args.length!==8||args[0]!=="--baseline"||args[2]!=="--candidate"||
    args[4]!=="--upstream"||args[6]!=="--report")
    throw Error("USAGE: --baseline path --candidate path --upstream path --report path");
  const base=resolve(args[1]),cand=resolve(args[3]),upstream=resolve(args[5]),dest=resolve(args[7]);
  const read=(root,hour,lang)=>JSON.parse(readFileSync(
    join(root,"2026-11-02",hour.toLowerCase(),lang+".research.json"),"utf8"));
  const cells=Object.keys(K_CELLS).flatMap(hour=>inspectRecoveredFrenchHour({
    hour,baseline:read(base,hour,"fr"),candidate:read(cand,hour,"fr"),
    latin:read(cand,hour,"la"),english:read(cand,hour,"en"),
  }));
  if(cells.length!==11)throw Error("OFFICE_K_RECOVERY_COUNT_WRONG");
  const sourceRoot=join(upstream,"web/www/horas");
  const latinProper=section(join(sourceRoot,"Latin/Sancti/11-02.txt"),"Special Prima");
  const englishProper=section(join(sourceRoot,"English/Sancti/11-02.txt"),"Special Prima");
  const frenchProper=section(join(sourceRoot,"Francais/Sancti/11-02.txt"),"Special Prima");
  const primeScope=checkPrimeRecipientScope({latinProper,englishProper,frenchProper});
  const report={
    schema:"ao.office.french-source-provenance-review.v1",provenance:K_PROVENANCE,
    date:"2026-11-02",officesAudited:5,sourceCellsAudited:cells.length,
    candidateNonPlaceholderCells:cells.filter(x=>x.candidateFrenchStatus==="GENERATED_NONPLACEHOLDER").length,
    latinLanguageBleedCandidates:cells.filter(x=>x.latinLanguageBleedRisk).length,
    englishLanguageBleedCandidates:cells.filter(x=>x.englishLanguageBleedRisk).length,
    primeScope,entries:cells,
    independentlyCheckedPrintedTextCells:0,verifiedTranslationCells:0,
    textSuitableForPublicDeployment:false,published:0,
  };
  mkdirSync(dirname(dest),{recursive:true});
  writeFileSync(dest,JSON.stringify(report,null,2)+"\n","utf8");
  console.log("OFFICE_K_RECOVERED_CELLS",JSON.stringify({
    count:cells.length,offices:report.officesAudited,
    latinBleed:report.latinLanguageBleedCandidates,
    englishBleed:report.englishLanguageBleedCandidates,
    primeScopeMismatchCandidate:primeScope.scopeMismatchCandidate,
    textCertified:0,published:0,
  }));
  for(const x of cells)console.log("OFFICE_K_CELL",JSON.stringify({
    hour:x.hour,id:x.sourceCellId,latinId:x.latinSourceCellId,
    upstreamFrenchSection:x.upstreamFrenchSection,sourceRole:x.sourceRole,
    frenchIncipit:x.frenchIncipit,latinIncipit:x.latinIncipit,
    latinLanguageBleedRisk:x.latinLanguageBleedRisk,
  }));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(error){console.error(error?.stack??String(error));process.exitCode=1}
}
