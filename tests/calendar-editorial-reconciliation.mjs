import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarObservanceAlias} from "../src/calendar/observance-title.js";

const registry=JSON.parse(readFileSync(new URL("../data/calendar/1962-editorial-reconciliation-2024-2027.v1.json",import.meta.url),"utf8"));
assert.equal(registry.schema,"AO_CALENDAR_1962_EDITORIAL_CROSSWALK_V1");
assert.equal(registry.status,"TRIAGE_NOT_LITURGICAL_CERTIFICATION");
assert.equal(registry.totals.flags,132);
assert.equal(registry.totals.year2024+registry.totals.year2027,132);

const counts=new Map([
  ["generic_feria",55],["saturday_bvm_mass_title",24],
  ["saint_variants",32],["major_title_variants",6],
  ["commemoration_count",9],["pentecost_vigil_mislabel",2],
  ["bibiana_mislabel",2],["paul_latin_only",1],
  ["advent_saturday_wording",1],
]);
const displayCorrected=new Set([
  "generic_feria","saturday_bvm_mass_title","pentecost_vigil_mislabel",
  "bibiana_mislabel","paul_latin_only","advent_saturday_wording",
]);
const seen=new Set();
let addressed=0,stillOpen=0;
for(const group of registry.groups){
  assert.ok(counts.has(group.key),"Unexpected editorial owner: "+group.key);
  assert.equal(group.count,counts.get(group.key),group.key+": historical count changed");
  assert.equal(group.dates.length,group.count,group.key+": lost dated provenance");
  assert.equal(new Set(group.dates).size,group.count,group.key+": duplicate date");
  assert.ok(group.reason?.length>30,group.key+": missing original-audit reason");
  for(const date of group.dates){
    assert.match(date,/^202[47]-\d{2}-\d{2}$/,group.key+": malformed date "+date);
    assert.ok(!seen.has(date),date+": appears in multiple historical categories");
    seen.add(date);
  }
  if(displayCorrected.has(group.key)){
    assert.ok(/CORRECTED|GUARDED/.test(group.status),group.key+": corrected headline status regressed");
    addressed+=group.count;
  }else{
    assert.ok(/REVIEW|PENDING|NOT_CLEARED/.test(group.status),group.key+": uncertified historical flags wrongly closed");
    stillOpen+=group.count;
  }
}
assert.equal(seen.size,registry.totals.flags);
assert.equal(addressed,85);
assert.equal(stillOpen,47);
const current=registry.currentReaudit;
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.year2024,65);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.year2027,62);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.total,127);
assert.equal(current.editorialFlagsCurrentlyDetectedFromRawSource.genericFeria,55);
assert.equal(current.archivedFlagsNotComparableAsSimpleRemainingCount,132);
assert.equal(current.historicCalendarHeadlineCorrections,addressed);
assert.equal(current.archivedUnclearedFlagsAfterDisplayWork,stillOpen);
assert.equal(current.principalRankColourNewUnclassifiedConflicts,0);
assert.equal(current.currentChristKingSundayCommemorations,0);
assert.equal(current.alternativeRogationMassCertified,false);
assert.equal(current.allPropersCertified,false);
assert.match(current.workflow,/\/actions\/runs\/37958564284$/);
assert.deepEqual(current.feriaReconciliation.historical,55);
assert.equal(current.feriaReconciliation.observedTemporaleWeekday,53);
assert.equal(current.feriaReconciliation.observedEpiphanyProperWithoutTemporale,2);
assert.equal(current.feriaReconciliation.resumedEpiphanyWeekdaysAfterPentecost,6);
assert.equal(current.feriaReconciliation.dateOnlyPatches,0);
console.log("PASS Calendar editorial historical 132-date worklist: 85 source-backed display headlines, 47 open; newer raw-source audit 127");
const adjudications=registry.remaining47Adjudications;
assert.equal(adjudications.status,"ACCEPTED_BOUNDED_HISTORICAL_REVIEW_PR_767");
const remainingOwners=new Map([
  ["saints","saint_variants"],["major","major_title_variants"],
  ["commemorations","commemoration_count"]
]);
const adjudicatedDates=new Set();
let saintAliases=0,saintEquivalents=0,majorEquivalent=0,commRestored=0,commExisting=0,commApostolic=0;
for(const [field,original] of remainingOwners){
  const entries=adjudications[field];
  const actual=entries.flatMap(x=>x.dates).sort();
  const historical=registry.groups.find(x=>x.key===original).dates.slice().sort();
  assert.deepEqual(actual,historical,field+": decisions do not cover the original flagged dates exactly");
  for(const entry of entries){
    assert.match(entry.canonicalId,/^(sancti|tempora):/,field+": no canonical source ID");
    assert.ok(entry.rationale?.length>32,field+": empty historical/adjudication evidence");
    for(const date of entry.dates){
      assert.ok(!adjudicatedDates.has(date),date+": duplicated adjudication");
      adjudicatedDates.add(date);
      if(field==="saints"){
        if(entry.disposition==="SOURCE_ID_BILINGUAL_ALIAS")saintAliases++;
        else if(entry.disposition.startsWith("APPROVED_"))saintEquivalents++;
        else assert.fail("Unadjudicated saint case "+date);
      }else if(field==="major"){
        assert.match(entry.disposition,/^APPROVED_/,date+": invalid major day/Mass disposition");
        majorEquivalent++;
      }else{
        if(entry.disposition==="RESTORED_BARBARA_PR_767")commRestored++;
        else if(entry.disposition==="RESTORED_INSEPARABLE_APOSTOLIC_PR_767")commApostolic++;
        else if(/^(PRESENT_|PRESENT_RESTORED)/.test(entry.disposition))commExisting++;
        else assert.fail("Unadjudicated commemoration case "+date);
        assert.ok(entry.expectedCommemorated?.length,date+": missing Mass commemoration owner");
      }
    }
  }
}
assert.equal(adjudicatedDates.size,47);
assert.deepEqual([saintAliases,saintEquivalents,majorEquivalent,commExisting,commApostolic,commRestored],[4,28,6,3,4,2]);
assert.equal(adjudications.actualMassPrayerDefectDates,6);
assert.equal(adjudications.restoredInseparableApostolicDates,4);
for(const [id,date,en,fr] of [
  ["sancti:05-16:3:w","2024-05-16","St Ubald","Saint Ubald"],
  ["sancti:06-12:3:w","2024-06-12","St John of Sahagún","Saint Jean de Sahagún"],
  ["sancti:06-12:3:w","2027-06-12","St John of Sahagún","Saint Jean de Sahagún"],
  ["sancti:10-03:3:w","2024-10-03","St Thérèse of the Child Jesus","Sainte Thérèse de l’Enfant-Jésus"],
]){
  const resolution={status:"ready",date,day:{main:{id,title:"donor-short-name"}}};
  assert.equal(calendarObservanceAlias(resolution,"en"),en,date+": English saint alias");
  assert.equal(calendarObservanceAlias(resolution,"fr"),fr,date+": French saint alias");
}
assert.equal(calendarObservanceAlias({status:"ready",date:"2024-05-16",day:{main:{id:"sancti:05-16:4:w"}}},"en"),"St Ubald",
  "Identity-backed display intentionally covers the same feast ID independent of class if source confirms");
assert.equal(current.allPropersCertified,false,"This bounded review must never certify every Mass Proper");
const final=registry.post767Final;
assert.equal(final.originalHistoricalFlagDates,132);
assert.equal(final.dateCasesAdjudicatedThisBatch,47);
assert.equal(final.historicallyUnadjudicatedCases,0);
assert.equal(final.historicalHeadlineCorrectionsPriorToPR767,85);
assert.equal(final.additionalSourceIDBilingualHeadlineCorrections,4);
assert.equal(final.cumulativeHeadlineCorrections,89);
assert.equal(final.historicalFlagsAcceptedWithoutAdditionalHeadline,43);
assert.equal(final.acceptedShortTitleVariants,28);
assert.equal(final.acceptedDayVersusFormularyTitles,6);
assert.equal(final.commemorationCasesRepairedAtSharedMassSource,6);
assert.equal(final.commemorationCasesPreviouslyResolved,3);
assert.equal(final.apostolicMissingPrayerCasesRepairedUnderOneConclusion,4);
assert.equal(final.stBarbaraMissingCommemorationCasesRepaired,2);
assert.match(final.mergeCommit,/^[a-f0-9]{40}$/);
assert.equal(final.sourceWitnessRankColourNovelConflicts,0);
assert.equal(final.fullProperTextCertification,false);
assert.equal(final.explicitVioletRogationMassCertified,false);
assert.equal(final.contextualSourceCoverageGapClosed,false);
console.log("PASS 132 historical Calendar discrepancy dates: 89 headline corrections, 43 accepted without a new headline; 47 newly adjudicated including six true Mass-text repairs; 0 unadjudicated historical flags; full Proper certification remains open");
