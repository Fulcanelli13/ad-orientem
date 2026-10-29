#!/usr/bin/env node
/**
 * The recovered French 2026-11-01 II Vespers is a separately-generated
 * candidate. Check source-scoped full antiphon/collect against independent
 * ICKSP published Sunday text, and check the prayer sequence/Latin alignment.
 *
 * Comparators are NOT an authenticated 1961 French printed Breviary;
 * DO NOT certify locale, appointment, versicle text, rights or publication.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {DIVINUM_OFFICIUM_PIN} from "../../src/app/source-transport-compat.js";
import {collateAllSaintsVespersTranslation} from "../../src/office/vespers-translation-collation.js";
import {officeTranslationContentBlockers} from "../../src/office/source-content-gate.js";
import {CANDIDATE_COHORT} from "./generate-french-vespers-recovery-candidate.mjs";

const FRENCH_ANTIPHON=
  "Jésus, se retournant et la voyant, dit : Aie confiance, ma fille, ta foi t’a sauvée. Alléluia.";
const FRENCH_COLLECT=
  "Pardonnez, nous vous en supplions, Seigneur, les offenses de vos peuples ; afin que, par votre bonté, nous soyons délivrés des liens des péchés que notre fragilité nous a fait commettre.";
const clean=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replaceAll("œ","oe").replaceAll("æ","ae").toLowerCase()
  .replace(/[^a-z0-9]+/g," ").trim();
const read=(root,locale)=>JSON.parse(readFileSync(join(root,"2026-11-01","vespers",locale+".research.json"),"utf8"));
const cells=doc=>doc.sections.filter(s=>s.semantic?.role==="PRAYER"||
  /^Vespera(?:8|9|10)$/.test(s.sourceCellId));
const kinds=doc=>doc.sections.map(x=>x.sourceCellId);
const matched=(a,b)=>JSON.stringify(kinds(a))===JSON.stringify(kinds(b));

export function auditRestoredFrenchVespers({baseline,candidate}={}){
  if(!baseline||!candidate)throw Error("OFFICE_FR_RECOVERY_AUDIT_INPUT_MISSING");
  const la=read(baseline,"la"),en=read(baseline,"en"),original=read(baseline,"fr");
  const laCandidate=read(candidate,"la"),enCandidate=read(candidate,"en"),fr=read(candidate,"fr");
  for(const doc of [la,en,original,laCandidate,enCandidate,fr]){
    if(doc?.schema!=="ao.office.source-cells.v1"||doc?.date!=="2026-11-01"||
      doc?.hour!=="VESPERS"||doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
      doc?.status!=="STRUCTURED_UNVERIFIED"||doc?.publishable!==false)
      throw Error("OFFICE_FR_RECOVERY_SOURCE_CONTEXT_OR_PIN_INVALID");
  }
  if(!matched(la,laCandidate)||!matched(en,enCandidate)||
    JSON.stringify(la)!==JSON.stringify(laCandidate)||
    JSON.stringify(en)!==JSON.stringify(enCandidate))
    throw Error("OFFICE_FR_RECOVERY_LATIN_ENGLISH_MUTATED");
  const sameFrenchCellIDs=matched(original,fr);
  const sameTrilingualIDs=matched(la,fr);
  // The source-native ID schemes are different: Latin Vespera9 maps
  // to French/English Vespera10. The normalizer records the actual
  // Latin counterpart on each section, preserving BOTH original IDs.
  const canonicalLatinAlignment=fr.sections.length===la.sections.length&&
    fr.sections.every((section,i)=>
      section.index===la.sections[i]?.index&&
      section.semantic?.latinSourceCellId===la.sections[i]?.sourceCellId);
  const sameFrenchAndEnglishNativeIds=matched(en,fr);
  // The original French has TEN cells (one empty of the Sunday proper).
  // The correction fills Vespera10; the other NINE remain byte-identical.
  const originalFrenchCellsPreserved=matched(original,fr)&&
    original.sections.every((section,i)=>
      section.sourceCellId==="Vespera10"||
      fr.sections[i]?.text===section.text);
  const dedicatedCommemorationCellRestored=originalFrenchCellsPreserved&&
    fr.sections.find(s=>s.sourceCellId==="Vespera10")?.text!==
      original.sections.find(s=>s.sourceCellId==="Vespera10")?.text;
  const sourceChanged=fr.sections.some((s,i)=>s.text!==original.sections[i]?.text);
  const changedSourceCellIds=fr.sections.filter((s,i)=>
    s.text!==original.sections[i]?.text).map(s=>s.sourceCellId);
  const changedOnlyPrayerCells=changedSourceCellIds.every(id=>
    /^Vespera(?:8|9|10)$/.test(id));
  const oldScope=officeTranslationContentBlockers({latin:la,translation:original});
  const recoveredScope=officeTranslationContentBlockers({latin:laCandidate,translation:fr});
  const translation=collateAllSaintsVespersTranslation(fr);
  const segments=cells(fr);
  const heading=segments.flatMap(s=>s.text.split("\n")).findIndex(line=>
    /^(?:commemoratio|commemoration|commemoraison|memoire)\b/.test(clean(line)));
  const body=clean(segments.flatMap(s=>s.text.split("\n")).slice(heading+1).join("\n"));
  const antiphon=clean(FRENCH_ANTIPHON),collect=clean(FRENCH_COLLECT);
  const antIndex=body.indexOf(antiphon),collectIndex=body.indexOf(collect);
  const sundayAntiphonMatchesICKSP=antIndex>=0;
  const sundayCollectMatchesICKSP=collectIndex>=0;
  const fullTextOrderMatches=heading>=0&&antIndex>=0&&collectIndex>antIndex;
  // Text-only positions in this source span; do not assert French
  // versicle/response exact textual correspondence from punctuation alone.
  const between=fullTextOrderMatches?body.slice(antIndex+antiphon.length,collectIndex):"";
  const containsVersicleAndResponse=
    /(dirig|priere|oration)/.test(between)&&
    /(encens|presence|consp)/.test(between);
  return Object.freeze({
    schema:"ao.office.french-vespers-restored-candidate-review.v1",
    cohort:CANDIDATE_COHORT,sourceRevision:DIVINUM_OFFICIUM_PIN,
    date:"2026-11-01",hour:"VESPERS",
    sourceChanged,sameFrenchCellIDs,sameTrilingualIDs,
    canonicalLatinAlignment,sameFrenchAndEnglishNativeIds,
    originalFrenchCellsPreserved,dedicatedCommemorationCellRestored,
    changedSourceCellIds,changedOnlyPrayerCells,
    originalSemanticBlockers:oldScope.map(x=>x.reason),
    restoredSemanticBlockers:recoveredScope.map(x=>x.reason),
    sourceHeadingLocated:heading>=0,
    originalSourceTranslationPass:false,
    newTranslationBoundedIncipientCheck:translation.componentOrderMatched,
    fullSundayAntiphonMatchesIndependentICKSP:sundayAntiphonMatchesICKSP,
    fullSundayCollectMatchesIndependentICKSP:sundayCollectMatchesICKSP,
    antiphonBeforeCollect:fullTextOrderMatches,
    interveningVersicleAndResponseSignals:containsVersicleAndResponse,
    // Independent witnesses: CMAA Diurnale 2009 printed pp 195-196,
    // 274 (Latin) and ICKSP French XXIII Sunday text (FR antiphon/collect).
    witnesses:Object.freeze({
      latinPrintedDiurnale:"https://media.churchmusicassociation.org/books/breviarium5x8.pdf",
      frenchSundayPublishedText:"https://icrspfrance.fr/textes-liturgiques.php?article=a0245_ancien",
      french1934SundayFirstVespersOnly:"https://liberius.net/livres/Le_breviaire_romain_-_Propre_du_temps_%28Fascicule_14%29_000001193.pdf"
    }),
    frenchVersicleAndResponseIndependentlyPrintedCompared:false,
    original1961PrintedFrenchBreviaryCertified:false,
    entireLiturgicalOfficeHistoricallyCertified:false,
    officeAppointmentIndependentlyCertified:false,
    sourceRightsForPublicationApproved:false,
    repairedCandidateIsNotPublishedBaseline:true,
    translationPublicationAuthorized:false,
    canPublish:false,published:0
  });
}
function main(){
  const a=process.argv.slice(2);
  if(a.length!==6||a[0]!=="--baseline"||a[2]!=="--candidate"||a[4]!=="--report")
    throw Error("USAGE: --baseline path --candidate path --report path");
  const candidate=resolve(a[3]),report=resolve(a[5]),baseline=resolve(a[1]);
  if(candidate===baseline)throw Error("OFFICE_FR_RECOVERY_BASELINE_IS_CANDIDATE");
  const provenance=JSON.parse(readFileSync(join(candidate,"research-restoration-provenance.json"),"utf8"));
  if(provenance.schema!==CANDIDATE_COHORT||provenance.published!==0||
    provenance.sourceFixAppliedOnlyInScratch!==true||
    provenance.canonicalBaselineUnmodified!==true)
    throw Error("OFFICE_FR_RECOVERY_PROVENANCE_INVALID");
  const review=auditRestoredFrenchVespers({baseline,candidate});
  mkdirSync(dirname(report),{recursive:true});
  writeFileSync(report,JSON.stringify(review,null,2)+"\n","utf8");
  console.log("OFFICE_FR_VESPERS_RESTORED_REVIEW",JSON.stringify({
    canonicalLatinAlignment:review.canonicalLatinAlignment,
    localeNativeIdsAligned:review.sameFrenchAndEnglishNativeIds,
    nineUnaffectedFrenchCellsPreserved:review.originalFrenchCellsPreserved,
    restoredVespera10Text:review.dedicatedCommemorationCellRestored,
    changed:review.changedSourceCellIds,
    antiphon:review.fullSundayAntiphonMatchesIndependentICKSP,
    collect:review.fullSundayCollectMatchesIndependentICKSP,
    properOrder:review.antiphonBeforeCollect,
    sourceBlockersBefore:review.originalSemanticBlockers,
    sourceBlockersAfter:review.restoredSemanticBlockers,
    sourceIdSequences:{
      latin:read(baseline,"la").sections.map(s=>s.sourceCellId),
      frenchBaseline:read(baseline,"fr").sections.map(s=>s.sourceCellId),
      frenchCandidate:read(candidate,"fr").sections.map(s=>s.sourceCellId),
      english:read(baseline,"en").sections.map(s=>s.sourceCellId)
    },
    frenchCellHeaders:{
      baseline:read(baseline,"fr").sections.map(s=>({id:s.sourceCellId,
        head:s.text.split("\n")[0].slice(0,45)})),
      candidate:read(candidate,"fr").sections.map(s=>({id:s.sourceCellId,
        head:s.text.split("\n")[0].slice(0,45)}))
    },
    printed1961Certified:false,published:0
  }));
  if(!review.dedicatedCommemorationCellRestored||
    !review.originalFrenchCellsPreserved||!review.canonicalLatinAlignment||
    !review.sameFrenchAndEnglishNativeIds||!review.sameFrenchCellIDs||
    review.changedSourceCellIds.length!==1||
    review.changedSourceCellIds[0]!=="Vespera10"||
    !review.changedOnlyPrayerCells||!review.sourceChanged||
    !review.originalSemanticBlockers.includes("FR_VESPERS_SUNDAY_COMMEMORATION_INCOMPLETE")||
    review.restoredSemanticBlockers.length!==0||
    !review.fullSundayAntiphonMatchesIndependentICKSP||
    !review.fullSundayCollectMatchesIndependentICKSP||
    !review.antiphonBeforeCollect||
    !review.newTranslationBoundedIncipientCheck||
    review.published!==0)
    throw Error("OFFICE_FR_VESPERS_RESTORED_SOURCE_COLLATION_INCOMPLETE");
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{main()}catch(e){console.error(e?.stack??String(e));process.exitCode=1}
}
