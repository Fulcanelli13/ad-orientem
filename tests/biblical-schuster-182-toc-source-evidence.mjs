import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const json=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const toc=json("data/explore/biblical-schuster-182-chapter-toc-evidence.v1.json");
const fam=json("data/explore/biblical-schuster-knecht-source-family-review.v1.json");
const bible=json("data/explore/biblical-73-book-event-denominator-audit.v1.json");
assert.equal(toc.schema,"AO_SCHUSTER_COMPLETE_TOC_MODERN_EDITION_EVIDENCE_V1");
assert.equal(toc.policy.contentsOnly,true);
assert.equal(toc.policy.notHistorical1925Text,true);
assert.equal(toc.textOwnership.printedAuthorProseCopied,false);
assert.equal(toc.textOwnership.aiNarratives,false);
assert.equal(toc.textOwnership.translationGenerated,false);
assert.equal(toc.chapters.length,182);
assert.equal(toc.chapters.filter(c=>c.testament==="OT").length,86);
assert.equal(toc.chapters.filter(c=>c.testament==="NT").length,96);
assert.equal(new Set(toc.chapters.map(c=>c.id)).size,182);
assert.deepEqual(toc.witness.pdfContentsPageIndices,[4,5,6,7,8,9]);
function roman(n){let s="";for(const [v,r]of [[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]])while(n>=v){s+=r;n-=v;}return s;}
for(const part of ["OT","NT"]){
  const items=toc.chapters.filter(c=>c.testament===part);
  for(const [i,row] of items.entries()){
    assert.equal(row.chapterNumber,i+1);
    assert.equal(row.romanChapter,roman(i+1));
    assert.equal(row.id,"schuster:toc:32nd:"+part+":"+roman(i+1));
    assert.ok(row.topicHeading.length>2);
    assert.equal(row.contentImportStatus,"NOT_ALLOWED_FROM_MODERN_REPRINT");
    assert.equal(row.evidence.historical1925Comparison,"NOT_PERFORMED");
    assert.equal(row.evidence.printedTextPageImagesInspected,false);
    if(i)assert.ok(row.printedStartPage>=items[i-1].printedStartPage,"Page order "+row.id);
    if(row.printedEndPageEstimate!==null)assert.ok(row.printedEndPageEstimate>=row.printedStartPage);
  }
}
assert.equal(toc.chapters.find(c=>c.id==="schuster:toc:32nd:OT:XXVIII").topicHeading,"Job's Patience");
assert.equal(toc.chapters.find(c=>c.id==="schuster:toc:32nd:OT:XLVII").topicHeading,"Ruth's Affection for Her Mother-in-Law");
assert.equal(toc.chapters.find(c=>c.id==="schuster:toc:32nd:NT:XCVI").topicHeading,"Last Years of the Apostles");
const french=fam.witnesses.find(w=>w.id==="SCHUSTER-FR-1887-COUISSINIER");
assert.ok(french?.digitalEbookListingUrl?.includes("iuUejjayBWEC"));
assert.equal(fam.counts.french1887PrintedPageImagesVerified,0);
assert.equal(fam.counts.modernEnglishTocChaptersVisual,182);
assert.equal(fam.modernEditionFullTocPath,"data/explore/biblical-schuster-182-chapter-toc-evidence.v1.json");
assert.equal(fam.counts.sourceParagraphsApproved,0);
assert.equal(bible.bookCount,73);
console.log("Schuster evidence: all 182 modern-preview headings indexed, 86/96 split, French 1887 access linked, no historical prose certified.");
