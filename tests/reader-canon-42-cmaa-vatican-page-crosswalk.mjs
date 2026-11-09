import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCanon42ApprovalQueue} from "../tools/mass-canon-42-approval-queue.mjs";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const data=load("../data/research/mass-canon-42-cmaa-vatican-printed-page-evidence-20261109.v1.json");
const original={
 promotion:load("../data/research/mass-canon-42-rubric-promotion-review-20261013.json"),
 firstPass:load("../data/research/mass-canon-first-pass-19-ritus-source-review-20261013.json"),
 complex:load("../data/research/mass-canon-complex-23-ritus-source-review-20261013.json"),
 printed:load("../data/research/mass-canon-29-printed-page-witness-crosswalk-20261014.json")
};
const offset=load("../data/research/mass-canon-c0190-critical-cross-offset-20261109.v1.json");
const scan={
 62:{page:"LIX",url:"https://gregobase.selapa.net/sources/42/62.png"},
 63:{page:"LX",url:"https://gregobase.selapa.net/sources/42/63.png"},
 64:{page:"LXI",url:"https://gregobase.selapa.net/sources/42/64.png"},
 65:{page:"LXII",url:"https://gregobase.selapa.net/sources/42/65.png"}
};
const specific={
 "AO.CANON.R62.028":[63,64],
 "AO.CANON.R62.030":[63,64],
 "AO.CANON.R62.031":[64],
 "AO.CANON.R62.032":[64],
 "AO.CANON.R62.033":[64]
};
function expectedPages(row){
 const section=row.sourceSection;
 if(specific[row.actionId])return specific[row.actionId];
 if(section==="VIII.1"||section==="VIII.1–2")return [62,63];
 if(["VIII.3","VIII.4","VIII.5"].includes(section))return [63];
 if(section==="VIII.7")return [63,64];
 if(["IX.1","IX.2","IX.3"].includes(section))return [64];
 if(section==="X.1")return [64,65];
 throw Error("Unexpected original Ritus source section "+row.actionId+" "+section);
}
function check(witness){
 assert.equal(witness.schema,"ao-canon-42-cmaa-vatican-1962-printed-page-crosswalk-v1");
 assert.equal(witness.status,"FOUR_CMAA_CREDITED_1962_VATICAN_LABELED_SCANS_LOCATED_CRITICAL_GLYPH_AND_TITLE_PROVENANCE_SIGNOFF_OPEN");
 assert.deepEqual(witness.counts,{
  total:42,firstPass:19,complex:23,sourceSectionImagePageLocated:42,
  distinctImages:4,independentOriginalEditionAuth:0,
  independentlyCollatedExactActionGlyphs:0,independentFrenchEnglishCopyApprovals:0,
  actualActorClockAcceptances:0,newlyPublishedLiveRubrics:0,
  editionInternalTitlePagesInspected:1,editionInternalDatedDecreesInspected:1,
  independentPhysicalVolumeAuthentications:0,gestureClockApprovals:0
 });
 assert.equal(witness.provenance.sourceLabel,"1962 - Vatican - Missale Romanum");
 assert.equal(witness.provenance.scanCredit,"Scans courtesy of the Church Music Association of America");
 assert.equal(witness.provenance.originalPrintedEditionAuthentication,"PENDING");
 assert.equal(witness.provenance.independentlyIdentifiedExactImagedPhysicalVolume,false);

 assert.equal(witness.provenance.originalVolumeTitleAndColophonPagesNotInspectedInThisScanSet,false);
 assert.equal(witness.provenance.originalVolumeTitlePageInspectedInSameScanSeries,true);
 assert.equal(witness.provenance.originalVolume1962DecreeInspectedInSameScanSeries,true);
 assert.equal(witness.provenance.originalVolumeColophonInspectedInSameScanSeries,false);
 assert.equal(witness.provenance.verifiedSinglePhysicalCopyIdentity,false);
 const internal=witness.provenance.internalEditionEvidence;
 assert.equal(internal.scannedTitleImage,"https://gregobase.selapa.net/sources/42/0.png");
 assert.equal(internal.titlePrinted,"MISSALE ROMANUM — EDITIO TYPICA");
 assert.equal(internal.scannedDecreeImage,"https://gregobase.selapa.net/sources/42/2.png");
 assert.equal(internal.decreeHead,"DECRETUM");
 assert.equal(internal.decreePrintedDate,"ROMAE_DIE_23_IUNII_1962");
 assert.equal(internal.decreePublishingAndPrintingStatement,
  "VATICANA_EDITORIALIS_DOMUS_TYPIS_ITIDEM_VATICANIS");
 assert.equal(internal.sameGregoBaseSourceId,42);
 assert.equal(internal.directCanonSourceImage,"https://gregobase.selapa.net/sources/42/64.png");
 assert.equal(internal.sourceContinuity,"SAME_NUMBERED_GREGOBASE_SCAN_SERIES");
 assert.equal(internal.notProven,
  "EXACT_PHYSICAL_VOLUME_COLATION_AND_INDEPENDENT_LIBRARY_HOLDING_MATCH");
 assert.equal(internal.editionInternalEvidence,"TITLE_PLUS_1962_DECREE_IN_SAME_SOURCE_SERIES");
 assert.equal(witness.provenance.independentlyCertifiedExactRubricGlyphTranscription,"PENDING");
 assert.equal(witness.provenance.catalogueUrl,
  "https://gregobase.selapa.net/source.php?id=42&images=1&index=2");
 assert.equal(witness.sourcePages?.length,4);
 for(let k=0;k<4;k++){
  const page=witness.sourcePages[k],n=62+k;
  assert.equal(page.siteImageIndex,n);
  assert.equal(page.printedRomanPage,scan[n].page);
  assert.equal(page.imageUrl,scan[n].url);
  assert.equal(page.sourceCategory,"DIRECT_PRINTED_LATIN_PAGE_IMAGE");
 }
 assert.equal(witness.rows.length,42);
 const one=original.firstPass.rows.map(x=>({...x,track:"FIRST_PASS_19"}));
 const two=original.complex.rows.map(x=>({...x,track:"COMPLEX_23"}));
 const source=new Map([...one,...two].map(x=>[x.actionId,x]));
 const promo=new Map(original.promotion.decisions.map(x=>[x.candidateActionId,x]));
 const seenId=new Set(),seenCue=new Set();
 let first=0,complex=0;
 for(const row of witness.rows){
  const o=source.get(row.actionId),p=promo.get(row.actionId);
  assert.ok(o&&p,"No Canon source owner "+row.actionId);
  assert.ok(!seenCue.has(row.cueId)&&!seenId.has(row.actionId),"Duplicate owner "+row.actionId);
  seenId.add(row.actionId);seenCue.add(row.cueId);
  assert.equal(row.cueId,o.cueId);
  assert.equal(row.section,o.sourceSection);
  assert.equal(row.existingReviewGate,p.reviewGate);
  assert.equal(row.reviewTrack,o.track);
  assert.equal(row.issueClass,o.issueClass??null);
  if(row.reviewTrack==="FIRST_PASS_19")first++;else if(row.reviewTrack==="COMPLEX_23")complex++;
  else throw Error("Unknown review track");
  assert.deepEqual(row.photographedRitusPages.map(x=>x.siteImageIndex),expectedPages(o));
  for(const page of row.photographedRitusPages){
   const ref=scan[page.siteImageIndex];
   assert.ok(ref);
   assert.equal(page.printedRomanPage,ref.page);
   assert.equal(page.imageUrl,ref.url);
   assert.equal(page.locationLevel,"RITUS_SECTION_IMAGE_PAGE_NOT_INDIVIDUAL_GESTURE_GLYPH_CERTIFIED");
  }
  assert.equal(row.sectionReference,"https://gregobase.selapa.net/source.php?id=42&images=1&index=2");
  assert.equal(row.photoSourceLabel,"1962 - Vatican - Missale Romanum");
  assert.equal(row.scanCredit,"Church Music Association of America (as credited by GregoBase)");
  assert.equal(row.originalVaticanEditionTitleLeafLinkedToTheseExactScans,false);
  assert.equal(row.printEditionAuthenticatedByIndependentColophonReview,false);
  assert.equal(row.actionLevelLatinGlyphComparison,"NOT_COMPLETED");
  assert.equal(row.independentBilingualEditorialApproval,"NOT_GRANTED");
  assert.equal(row.actorAndMinisterClockVerified,false);
  assert.equal(row.canPublish,false);
  assert.equal(row.publication,"SOURCE_RESEARCH_ONLY_NO_LIVE_TEXT");
 }
 assert.equal(first,19);
 assert.equal(complex,23);
 assert.equal(seenId.size,42);
 assert.equal(seenCue.size,42);
 assert.deepEqual([...seenId].sort(),[...source.keys()].sort());
 const c=witness.rows.find(x=>x.cueId==="AO.SM.C0190");
 assert.equal(c.actionId,"AO.CANON.R62.044");
 assert.equal(c.section,"IX.1");
 assert.deepEqual(c.photographedRitusPages.map(x=>x.printedRomanPage),["LXI"]);
 assert.equal(c.printedPageLXI,scan[64].url);
 assert.equal(c.canonicalDonorToken,"coelésti");
 assert.equal(c.corroboratedWitnessSpelling,"cælesti / caelesti");
 assert.equal(c.donorWordBoundaryBeforeTokenUtf16,18);
 assert.equal(c.donorWordBoundaryBeforeTokenUtf16,offset.proposedOnly.utf16Boundary);
 assert.equal(c.criticalAnchorReference,"data/research/mass-canon-c0190-critical-cross-offset-20261109.v1.json");
 assert.equal(c.exactPrintedCrossGlyphCertification,"PENDING_HIGH_RES_IMAGE_AND_INDEPENDENT_EDITORIAL_CHECK");
 assert.equal(c.sourceInstructionSignRelativeToTokens,"AFTER_BENEDICTIONE_BEFORE_CAELESTI");
 assert.equal(witness.c0190.printedRomanPage,"LXI");
 assert.equal(witness.c0190.siteImageIndex,64);
 assert.equal(witness.c0190.documentedSelfSign,true);
 assert.match(witness.c0190.visualPrintedGlyphStatus,/CRITICAL_GLYPH_STILL_PENDING/);
 assert.equal(witness.c0190.printedMarkObservedRelativeToLatin,
  "BETWEEN_BENEDICTIONE_AND_CAELESTI_IN_IX1_PAGE_LXI");
 assert.equal(witness.c0190.printedSelfSignDescriptionObserved,
  "SEIPSUM_SIGNAT_A_FRONTE_AD_PECTUS_SINISTRA_INFRA_PECTUS");
 assert.equal(witness.c0190.printedMarkShapeAtCurrentResolution,
  "EXACT_TYPOGRAPHICAL_GLYPH_SHAPE_NOT_INDEPENDENTLY_CERTIFIED");
 assert.equal(witness.c0190.originalPrintedEditionAuthentication,
  "IN_SERIES_TITLE_AND_DECREE_INSPECTED_INDEPENDENT_VOLUME_AUTHENTICATION_OPEN");
 assert.equal(witness.c0190.independentGestureClockApproval,false);
 assert.equal(witness.c0190.livePublicationAllowed,false);
 for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const q=buildCanon42ApprovalQueue({...original,form,editorialPreview:true});
  assert.equal(q.counts.total,42);
  assert.equal(q.counts.livePublished,0);
  assert.equal(q.publicationReady,0);
  assert.ok(q.rows.every(x=>x.canPublish===false&&x.liveText===null&&x.priestActionNow===null));
 }
 return {sourceActions:seenId.size,scannedRomanPages:["LIX","LX","LXI","LXII"],
  printedSourceTitleAuthentication:"PENDING",individuallyCertifiedActionGlyphs:0,
  newlyPublishedLiveRubrics:0};
}
const result=check(data);
const reject=mutate=>{
 const copy=structuredClone(data);mutate(copy);
 assert.throws(()=>check(copy));
};
reject(x=>x.rows.pop());
reject(x=>x.rows[0].actionId="AO.CANON.R62.999");
reject(x=>x.rows[0].cueId=x.rows[1].cueId);
reject(x=>x.rows[0].photographedRitusPages[0].siteImageIndex=90);
reject(x=>x.rows[0].printEditionAuthenticatedByIndependentColophonReview=true);
reject(x=>x.rows[0].actionLevelLatinGlyphComparison="COMPLETE");
reject(x=>x.provenance.originalPrintedEditionAuthentication="CERTIFIED");
reject(x=>x.provenance.internalEditionEvidence.scannedDecreeImage="https://gregobase.selapa.net/sources/42/3.png");
reject(x=>x.provenance.internalEditionEvidence.decreePrintedDate="1961");
reject(x=>x.provenance.originalVolumeColophonInspectedInSameScanSeries=true);
reject(x=>x.provenance.verifiedSinglePhysicalCopyIdentity=true);
reject(x=>x.c0190.printedMarkObservedRelativeToLatin="AFTER_CAELESTI");
reject(x=>x.c0190.independentGestureClockApproval=true);
reject(x=>x.c0190.livePublicationAllowed=true);
reject(x=>x.provenance.independentlyIdentifiedExactImagedPhysicalVolume=true);
reject(x=>x.rows[0].actorAndMinisterClockVerified=true);
reject(x=>x.rows[0].canPublish=true);
reject(x=>x.rows.find(a=>a.cueId==="AO.SM.C0190").donorWordBoundaryBeforeTokenUtf16=17);
reject(x=>x.rows.find(a=>a.cueId==="AO.SM.C0190").exactPrintedCrossGlyphCertification="GRANTED");
console.log("MASS_CANON_CMAA_SOURCE_PAGE_CROSSWALK="+JSON.stringify(result));
console.log("PASS: 42/42 Canon owners mapped; same GregoBase series photographed Editio typica title, decree dated 23 June 1962 and Ritus IX.1 LXI; original physical copy/critical glyph, copy and action clock signoffs withheld; 0 LIVE publication.");
