#!/usr/bin/env node
// Research-only 1962 review queue. No Missal edition, Bible verse, or publication certification.
import {readFileSync,writeFileSync} from "node:fs";
const load=x=>JSON.parse(readFileSync(x,"utf8"));
const base="data/geography/research/";
const inventory=load(base+"mass-latin-upstream-directory-census-20261011.v1.json");
const source105=load(base+"mass-1962-105-source-path-chant-index-20261011.v1.json");
const seasonal=load(base+"mass-seasonal-bulk-source-audit-20261011.v1.json");
const saints=load(base+"mass-sanctoral-bulk-source-audit-20261011.v1.json");
const originals=new Map();
for(const row of source105.rows) {
 if(!originals.has(row.sourcePath)) originals.set(row.sourcePath,[]);
 originals.get(row.sourcePath).push(row);
}
const newlyExtracted=new Map([...seasonal.rows,...saints.rows].map(x=>[x.sourcePath,x]));
const slotsRx=/^(Introitus|Graduale(?:L\d+|P)?|Tractus|Alleluia|Sequentia|Offertorium|Communio)/i;
const specialRx=/^(GradualeL\d+|GradualeP|Tractus|Alleluia|Sequentia)/i;
const classify=row=>{
 const previous=originals.get(row.sourcePath)||[];
 const extracted=newlyExtracted.get(row.sourcePath);
 if((previous.length>0)===(extracted!==undefined)) throw Error("Ambiguous or missing observation for "+row.sourcePath);
 const sections=extracted?.sections||[];
 const chant=sections.filter(x=>slotsRx.test(x.section));
 const special=chant.filter(x=>specialRx.test(x.section));
 const noteLines=chant.reduce((n,x)=>n+x.bibleNoteCandidates.length,0);
 const refs=sections.flatMap(x=>x.referenceDirectives);
 const missing=previous.filter(x=>x.sourceStatus==="SECTION_ABSENT").length;
 const inherited=previous.filter(x=>x.inheritanceDirectives?.length).length;
 const closed=previous.filter(x=>x.sourceStatus==="NOT_ANNOTATED").length;
 const reasons=[];
 if(missing)reasons.push("WITNESSED_SECTION_ABSENT");
 if(inherited)reasons.push("WITNESSED_CHANT_INHERITANCE");
 if(closed)reasons.push("WITNESSED_CHANT_UNANNOTATED");
 if(refs.length)reasons.push("HAS_RAW_REFERENCE_DIRECTIVES");
 if(special.length)reasons.push("SPECIAL_CHANT_SECTIONS");
 if(sections.length===0&&extracted)reasons.push("NO_EXTRACTABLE_SECTIONS");
 if(row.sourcePath==="Sancti/10-07")reasons.push("PRINTED_FEAST_VOTIVE_VARIANT_WITNESSED");
 if(/\/[^/]+[a-z]$/.test(row.sourcePath))reasons.push("FILENAME_SUFFIX_VARIANT_CANDIDATE");
 if(!reasons.length)reasons.push("GENERAL_1962_EDITION_GATE");
 const critical=reasons.some(x=>["WITNESSED_SECTION_ABSENT","SPECIAL_CHANT_SECTIONS","PRINTED_FEAST_VOTIVE_VARIANT_WITNESSED"].includes(x));
 return {sourcePath:row.sourcePath,sourceUrl:row.sourceUrl,sourceBlobSha:row.sourceBlobSha,
  sourceObservationType:previous.length?"FOUR_SLOT_105":"ALL_SECTIONS_947",
  sourceFolder:row.sourcePath.split("/")[0],priority:critical?"HIGH":(reasons.length>1||refs.length||inherited?"MEDIUM":"BASELINE"),
  reasons,rawObservations:{fourSlotWitnessCount:previous.length,chantSectionCandidateCount:chant.length,
    specializedSectionCount:special.length,sectionCount:sections.length,rawReferenceDirectiveCount:refs.length,
    rawChantNoteLineCount:noteLines,missingWitnessSlotCount:missing},
  is1962Eligible:null,calendarCelebrationIdentity:null,wholeMissalTextCompared:false,
  bibleTextCompared:false,frenchCramponCompared:false,approvedForApp:false};
};
const rows=inventory.sourceFiles.map(classify).sort((a,b)=>
 ["HIGH","MEDIUM","BASELINE"].indexOf(a.priority)-["HIGH","MEDIUM","BASELINE"].indexOf(b.priority)
 || a.sourcePath.localeCompare(b.sourcePath));
if(rows.length!==1052||new Set(rows.map(x=>x.sourcePath)).size!==1052)throw Error("Incomplete 1052 file census");
const tally=p=>rows.filter(x=>x.priority===p).length;
const reasons=[...new Set(rows.flatMap(x=>x.reasons))].sort().map(reason=>({reason,count:rows.filter(x=>x.reasons.includes(reason)).length}));
const out={schema:"MASS_1962_EDITION_CERTIFICATION_SOURCE_QUEUE_V1",date:"2026-10-11",
 disclaimer:"Source presence is not 1962 eligibility. Priority is a deterministic editorial triage, not an assertion of feast assignment, scriptural authorship, or publication accuracy.",
 provenance:["data/geography/research/mass-latin-upstream-directory-census-20261011.v1.json",
 "data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json",
 "data/geography/research/mass-seasonal-bulk-source-audit-20261011.v1.json",
 "data/geography/research/mass-sanctoral-bulk-source-audit-20261011.v1.json"],
 stats:{sourcePaths:rows.length,high:tally("HIGH"),medium:tally("MEDIUM"),baseline:tally("BASELINE"),
  previouslyWitnessed:rows.filter(x=>x.sourceObservationType==="FOUR_SLOT_105").length,
  sectionExtracted:rows.filter(x=>x.sourceObservationType==="ALL_SECTIONS_947").length,
  certifiedEligibility:0,appApproved:0},reasonCounts:reasons,rows};
const output=base+"mass-1962-edition-certification-priority-queue-20261011.v1.json";
writeFileSync(output,JSON.stringify(out,null,2)+"\n");
console.log(JSON.stringify({stats:out.stats,reasonCounts:out.reasonCounts}));
