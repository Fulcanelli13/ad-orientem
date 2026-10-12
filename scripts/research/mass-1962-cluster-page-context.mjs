#!/usr/bin/env node
// Missal-wide short OCR context, for HUMAN page/heading adjudication only.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname} from "node:path";
const [pdfText,output]=process.argv.slice(2);
if(!pdfText||!output)throw Error("Usage: node mass-1962-cluster-page-context.mjs full-pdftotext.txt result.json");
const root="data/geography/research/";
const read=x=>JSON.parse(readFileSync(root+x+".v1.json","utf8"));
const cluster=read("mass-1962-printed-page-cluster-review-queue-20261011");
const hits=read("mass-1962-full-pdf-ocr-100-source-candidates-20261011");
const visuals=read("mass-1962-cmaa-visual-10-page-source-spotchecks-20261011");
const pages=readFileSync(pdfText,"utf8").split("\f");
if(!pages.at(-1).trim())pages.pop();
if(pages.length!==cluster.pdfPages)throw Error("PDF page count changed");
const normalize=s=>(s||"").replace(/([A-Za-zæœ])[-\u00ad]\s*\n\s*([A-Za-zæœ])/gi,"$1$2")
.toLowerCase().replace(/æ/g,"ae").replace(/œ/g,"oe").normalize("NFD").replace(/[\u0300-\u036f\u00ad\u0002]/g,"")
.replace(/j/g,"i").replace(/v/g,"u").replace(/[^a-z]+/g," ").replace(/\s+/g," ").trim();
const normalized=pages.map(normalize);
const checked=new Set(visuals.sourceMatches.map(x=>x.sourcePath));
const previous=new Set(["Sancti/07-01","Sancti/07-03r","Sancti/07-05","Sancti/10-07"]);
const strip=s=>s.replace(/\s+/g," ").trim();
const target=cluster.rows.filter(x=>x.pageClusterCandidates.length);
const rows=target.map(t=>{
 const anchors=hits.anchors.filter(a=>a.sourcePath===t.sourcePath&&a.candidateCount>0);
 const clusters=t.pageClusterCandidates.map(c=>{
  const matched=anchors.filter(a=>a.pageCandidates.some(p=>p>=c.pdfPageStart&&p<=c.pdfPageEnd));
  const pageNumbers=[...new Set(matched.flatMap(a=>a.pageCandidates.filter(p=>p>=c.pdfPageStart&&p<=c.pdfPageEnd)))].sort((a,b)=>a-b);
  const pageDetails=pageNumbers.map(page=>{
   const plaintext=strip(pages[page-1]);
   const text=normalized[page-1];
   const matchedAnchors=matched.filter(a=>a.pageCandidates.includes(page)).map(a=>{
    const p=a.searchPhrase||"";
    const at=p?text.indexOf(p):-1;
    return {section:a.sourceSection,matchStrengthWords:a.matchStrengthWords,
     latinAnchor:a.latinIncipit?.slice(0,130)||null,
     phrase:p,relativePosition:at>=0?Math.round(at/Math.max(text.length,1)*100):null,
     excerpt:at>=0?text.slice(Math.max(0,at-65),Math.min(text.length,at+p.length+100)):null};
   });
   return {pdfPage:page,printedPageIfStandardArabicOffset:page-81,
    topOfPageSample:plaintext.slice(0,320),
    bottomOfPageSample:plaintext.slice(-170),anchorMatches:matchedAnchors,
    printedHeadingVisuallyVerified:false};
  });
  return {pdfPageStart:c.pdfPageStart,pdfPageEnd:c.pdfPageEnd,score:c.score,
    sourceSectionCandidates:c.distinctSourceSections,uniquePageAnchorSections:c.uniquePageAnchorSections,
    pageDetails};
 });
 return {sourcePath:t.sourcePath,previouslySpotchecked:checked.has(t.sourcePath),
   previouslyDetailedPrintedComparison:previous.has(t.sourcePath),
   clusters,decision:"PENDING_PAGE_AND_CELEBRATION_ADJUDICATION",
   matchingLatinDoesNotProveFeast:true,
   full1962EditionConfirmed:false,bibleTextChecked:false,publishable:false};
});
const allPages=[...new Set(rows.flatMap(r=>r.clusters.flatMap(c=>c.pageDetails.map(p=>p.pdfPage))))].sort((a,b)=>a-b);
const data={schema:"MASS_1962_44_CLUSTER_PRINTED_PAGE_CONTEXT_V1",date:"2026-10-12",
 sourcePdfUrl:hits.sourcePdfUrl,sourcePdfSHA256:hits.sourcePdfSHA256,
 inputClustering:"data/geography/research/mass-1962-printed-page-cluster-review-queue-20261011.v1.json",
 evidenceClass:"PAGE_TEXT_SNIPPETS_TO_SUPPORT_HUMAN_PRINTED_HEADING_REVIEW_NOT_CERTIFICATION",
 scopeWarning:"An anchor is a text coincidence; even a multi-section page can be a Common or older/alternate calendar source. Scan pages must be viewed to verify actual headings. Page excerpts normalized to match words, not critical Latin reproductions.",
 stats:{clusteredSourcePaths:rows.length,previouslySpottedAmongClusters:rows.filter(x=>x.previouslySpotchecked).length,
 previouslyDetailedAmongClusters:rows.filter(x=>x.previouslyDetailedPrintedComparison).length,
 distinctCandidatePages:allPages.length,stillUnadjudicatedPaths:rows.length,
 publicationApproved:0},candidatePdfPages:allPages,rows};
if(rows.length!==44)throw Error("Expected 44 strong cluster source paths");
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(data,null,2)+"\n");
console.log(JSON.stringify(data.stats));
