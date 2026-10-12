#!/usr/bin/env node
// Conservative page-cluster triage. Never infer approved 1962 use from shared chant wording.
import {readFileSync,writeFileSync} from "node:fs";
const root="data/geography/research/";
const read=name=>JSON.parse(readFileSync(root+name+".v1.json","utf8"));
const evidence=read("mass-1962-full-pdf-ocr-100-source-candidates-20261011");
const sourcePaths=[...new Set(evidence.anchors.map(a=>a.sourcePath))];
const rows=sourcePaths.map(path=>{
 const anchors=evidence.anchors.filter(a=>a.sourcePath===path);
 const found=anchors.filter(a=>a.candidateCount>0);
 const candidates=[...new Set(found.flatMap(a=>a.pageCandidates))].sort((a,b)=>a-b);
 const clusters=[];
 for(const start of candidates){
  const nearby=found.filter(a=>a.pageCandidates.some(p=>p>=start&&p<=start+2));
  const sections=[...new Set(nearby.map(a=>a.sourceSection))];
  const uniqueSections=[...new Set(nearby.filter(a=>a.candidateCount===1).map(a=>a.sourceSection))];
  if(sections.length<2||uniqueSections.length===0)continue;
  const score=nearby.reduce((n,a)=>n+(a.matchStrengthWords||0)+((a.candidateCount===1)?3:0),0);
  clusters.push({pdfPageStart:start,pdfPageEnd:start+2,
   distinctSourceSections:sections,distinctSectionsCount:sections.length,
   uniquePageAnchorSections:uniqueSections,score,
   status:"POSSIBLE_SAME_FORMULARY_PAGE_CLUSTER_NOT_PRINTED_EDITION_CERTIFIED"});
 }
 clusters.sort((a,b)=>b.score-a.score||b.distinctSectionsCount-a.distinctSectionsCount||a.pdfPageStart-b.pdfPageStart);
 const used=[],selected=[];
 for(const x of clusters){
  if(used.some(n=>Math.abs(n-x.pdfPageStart)<=2))continue;
  selected.push(x);used.push(x.pdfPageStart);
  if(selected.length===3)break;
 }
 return {sourcePath:path,anchors:anchors.length,searchableCandidateAnchors:found.length,
  sourceSectionsFoundOnAnyPdfPage:[...new Set(found.map(a=>a.sourceSection))],
  pageClusterCandidates:selected,
  recommendedReviewMethod:selected.length?"PRINTED_PAGE_VISUAL_CHECK_REQUIRED":
    found.length?"NEEDS_HEADER_OR_INHERITANCE_REVIEW":"NO_DIRECT_LATIN_PAGE_EVIDENCE",
  missalEditionEligible:null,calendarIdentityChecked:false,fullLatinCompared:false,
  biblicalEditionCompared:false,approvedForApp:false};
});
const tally=(fn)=>rows.filter(fn).length;
const data={schema:"MASS_1962_PRINTED_OCR_MULTI_SECTION_CLUSTER_TRIAGE_V1",date:"2026-10-11",
 inputConcordance:"data/geography/research/mass-1962-full-pdf-ocr-100-source-candidates-20261011.v1.json",
 sourcePdfUrl:evidence.sourcePdfUrl,sourcePdfSHA256:evidence.sourcePdfSHA256,pdfPages:evidence.stats.pdfPages,
 algorithm:"Require at least two distinct matching section names inside three consecutive PDF pages and at least one section match exclusive to a single PDF page; ranked by anchor length and singularity. This ranks printed-page review locations, NOT assigned 1962 liturgical formularies.",
 stats:{sourcePaths:rows.length,pathsWithAnyOCRAnchor:tally(r=>r.searchableCandidateAnchors>0),
  pathsWithMultiSectionPageClusters:tally(r=>r.pageClusterCandidates.length>0),
  pathsWithoutMultiSectionClusters:tally(r=>r.pageClusterCandidates.length===0),
  totalTopThreeClusterCandidates:rows.reduce((n,r)=>n+r.pageClusterCandidates.length,0),
  visuallyPageChecked:0,editionCertified:0,releaseApproved:0},
 rows,publicationStatus:"RESEARCH_ONLY"};
if(rows.length!==100||data.stats.visuallyPageChecked!==0)throw Error("Unexpected cohort");
writeFileSync(root+"mass-1962-printed-page-cluster-review-queue-20261011.v1.json",JSON.stringify(data,null,2)+"\n");
console.log(JSON.stringify(data.stats));
