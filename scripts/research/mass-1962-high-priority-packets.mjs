#!/usr/bin/env node
// RESEARCH ONLY. Prepare exact source-section evidence packets for every 1962 HIGH review case.
import {readFileSync, writeFileSync} from "node:fs";
const base="data/geography/research/";
const read=x=>JSON.parse(readFileSync(base+x,"utf8"));
const queue=read("mass-1962-edition-certification-priority-queue-20261011.v1.json");
const seasonal=read("mass-seasonal-bulk-source-audit-20261011.v1.json");
const sanctoral=read("mass-sanctoral-bulk-source-audit-20261011.v1.json");
const old=read("mass-1962-105-source-path-chant-index-20261011.v1.json");
const source=new Map([...seasonal.rows,...sanctoral.rows].map(x=>[x.sourcePath,x]));
const oldByPath=new Map();
for(const x of old.rows){if(!oldByPath.has(x.sourcePath)) oldByPath.set(x.sourcePath,[]);oldByPath.get(x.sourcePath).push(x);}
const high=queue.rows.filter(x=>x.priority==="HIGH");
const chant=/^(Introitus|Graduale(?:L\d+|P)?|Tractus|Alleluia|Sequentia|Offertorium|Communio)/i;
const extraordinary=/^(GradualeL\d+|GradualeP|Tractus|Alleluia|Sequentia)/i;
const evidence=high.map(row=>{
  const recent=source.get(row.sourcePath),earlier=oldByPath.get(row.sourcePath)||[];
  if(Boolean(recent)===Boolean(earlier.length))throw Error("Invalid ownership "+row.sourcePath);
  if(recent && !recent.sourceBlobVerified)throw Error("Unverified upstream blob "+row.sourcePath);
  const sectionEvidence=(recent?.sections||[]).filter(x=>chant.test(x.section)).map(x=>({
    originalSection:x.section,
    sourceLatinIncipit:x.initialLatin,
    rawBibleNoteCandidates:x.bibleNoteCandidates,
    rawReferenceDirectives:x.referenceDirectives,
    isSpecialChantSection:extraordinary.test(x.section),
    biblicalWordMatchVerified:false,
    printed1962SectionVerified:false,
    editionEligibilityVerified:false
  }));
  const witnessPositions=earlier.map(x=>({
    originalSection:x.sourceSection,
    sourceSlot:x.properSlot,
    sourceLatinIncipit:x.latinIncipit,
    rawBibleNoteCandidates:x.sourceBiblicalAnnotations,
    rawReferenceDirectives:x.inheritanceDirectives,
    sourceStatus:x.sourceStatus,
    biblicalWordMatchVerified:false,
    printed1962SectionVerified:false,
    editionEligibilityVerified:false
  }));
  const notes=[...sectionEvidence.flatMap(x=>x.rawBibleNoteCandidates),...witnessPositions.flatMap(x=>x.rawBibleNoteCandidates)];
  const directives=[...sectionEvidence.flatMap(x=>x.rawReferenceDirectives),...witnessPositions.flatMap(x=>x.rawReferenceDirectives)];
  return {
    sourcePath:row.sourcePath,sourceBlobSha:row.sourceBlobSha,sourceUrl:row.sourceUrl,
    priority:"HIGH",priorityReasons:row.reasons,
    sourceObservationType:row.sourceObservationType,
    sectionEvidence,witnessPositions,
    rawNoteOccurrences:notes.length,
    rawDirectiveOccurrences:directives.length,
    reviewRequired:["CHECK_1962_MISSAL_EDITION_AND_CALENDAR","COMPARE_ACTUAL_LATIN_CHANT_ORDER","FOLLOW_INHERITANCE_WITH_SECTION_CYCLE_DETECTION","VERIFY_VERSE_WITH_CLEMENTINE_AND_CRAMPON","CHECK_APPLICABLE_ALLELUIA_TRACT_SEQUENCE_VARIANTS"],
    publicationStatus:"RESEARCH_ONLY_NOT_CERTIFIED",publishable:false
  };
});
if(evidence.length!==100||new Set(evidence.map(x=>x.sourcePath)).size!==100)throw Error("Expected exactly 100 distinct priority sources");
const all=evidence.flatMap(x=>x.sectionEvidence);
const out={schema:"MASS_1962_HIGH_PRIORITY_100_SOURCE_EVIDENCE_PACKETS_V1",date:"2026-10-11",
 disclaimer:"One row per high-priority upstream source path. The raw sources are inspectable, but no source receives an automatic 1962-calendar or biblical-text approval. A section marked GradualeP/Tractus/GradualeL is a raw named section, not the selected celebration chant.",
 sourceQueue:"data/geography/research/mass-1962-edition-certification-priority-queue-20261011.v1.json",
 preliminaryPrintedComparison:"data/geography/research/mass-1962-contextual-primary-witness-pilot-20261011.v1.json",
 stats:{
   highPriorityPaths:evidence.length,fullyEditionCertified:0,
   withExtractedSectionEvidence:evidence.filter(x=>x.sectionEvidence.length).length,
   withFourSlotWitnessEvidence:evidence.filter(x=>x.witnessPositions.length).length,
   candidateChantSectionOccurrences:all.length,
   specialSectionOccurrences:all.filter(x=>x.isSpecialChantSection).length,
   rawBibleNoteCandidates:evidence.reduce((n,x)=>n+x.rawNoteOccurrences,0),
   rawReferenceDirectives:evidence.reduce((n,x)=>n+x.rawDirectiveOccurrences,0),
   editionCertified:0,publicationApproved:0
 },rows:evidence};
writeFileSync(base+"mass-1962-high-priority-100-evidence-packets-20261011.v1.json",JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify(out.stats));
