import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectSacredGuideEvidence,sacredGuideRevision,reviewedSacredGuideForReader,
  buildReviewedSacredGuideCorpus,resolveSacredGuideBatchAuthorization} from "../src/find/sacred-guide-review-release.js";
import {publishedPlaceIntro} from "../src/find/place-editorial-reuse.js";
import {renderPlaceEditorialOpening} from "../src/find/place-editorial-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ranges=["57-66","67-76","77-86","87-96","97-106","107-116","117-126",
  "127-136","137-146","147-156","157-166","167-176","177-188","189-200",
  "201-212","213-224"];
const wave2=ranges.flatMap(r=>read("data/shrines/research/sacred-atlas-wave2-guides"+r+"-20261110.v1.json").guides);
const wave1=["first10-extended-guides","guides11-20","guides21-30","guides31-43","guides44-56"]
 .flatMap(r=>read("data/shrines/research/sacred-atlas-wave1-"+r+"-20261105.v1.json").guides);
const publishedFiles=["france","france-r67","global-marian-b2","global-saints-r1","ireland","world-marian-r1"];
const published=publishedFiles.flatMap(n=>read("data/shrines/illustrated-place-guides-"+n+".v1.json").guides)
 .filter(g=>g.publication==="PUBLISHED");
const seed=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const canonicalSources=read("data/shrines/source-registry.v1.json").sources;
const researchSupplement=read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json");
const dateReconciliation=read("data/shrines/research/sacred-atlas-source-date-reconciliation-20261111.v1.json");
const claimResearchLedger=read("data/shrines/research/sacred-atlas-source-claim-reconciliation-20261111.v1.json");
assert.equal(claimResearchLedger.state,"RESEARCH_ONLY_NO_EDITOR_APPROVAL_NO_RELEASE");
assert.equal(claimResearchLedger.paragraphs.length,672);
assert.ok(wave2.find(g=>g.draft_order===97).sections.every(sec=>!sec.paragraphs.some(p=>p.source_url.includes("svata-hora.cz"))),"Svatá Hora draft must not cite the domain now redirecting to commercial accommodation");
assert.ok(wave2.find(g=>g.draft_order===97).research_source_ids.length>=2);
assert.match(wave2.find(g=>g.draft_order===86).sections.find(s=>s.id==="identity").paragraphs[0].en,/healing as miraculous/);
assert.equal(claimResearchLedger.summary.currentUniqueCoreResearchChecks,396);
assert.equal(claimResearchLedger.summary.onlyCitationScope,276);
assert.equal(claimResearchLedger.summary.newCoreResearchChecksSinceLastPass,59);
assert.equal(claimResearchLedger.summary.currentUniqueCoreResearchChecks+claimResearchLedger.summary.onlyCitationScope,672);
assert.equal(claimResearchLedger.summary.editorialApprovals,0);
assert.equal(claimResearchLedger.summary.ownerAuthorizations,0);
assert.ok(claimResearchLedger.paragraphs.every(r=>r.full_paragraph_certified===false&&r.french_second_editor_approved===false&&r.owner_authorized===false&&r.release_state==="HOLD_PENDING_EDITOR_AND_OWNER"));
assert.equal(dateReconciliation.paragraph_date_evidence.length,48);
assert.equal(dateReconciliation.summary.original_date_flags,48);
assert.ok(dateReconciliation.paragraph_date_evidence.every(r=>r.full_paragraph_verified===false&&r.second_editor_approved===false&&r.owner_release_authorized===false));
assert.equal(researchSupplement.state,"RESEARCH_ONLY_NOT_RELEASED");
assert.ok(researchSupplement.sources.every(s=>s.scope==="RESEARCH_ONLY"&&s.place_id&&
  !canonicalSources.some(c=>c.id===s.id)));
const sources=[...canonicalSources,...researchSupplement.sources];
const drafts=[...wave1,...wave2],byPlace=new Map(seed.shrines.map(s=>[s.place_id,s]));

const scopedChecks=researchSupplement.paragraph_research_checks||[];
assert.equal(scopedChecks.length,93,"All 93 first-pass source paragraph checks must remain intact");
assert.equal(new Set(scopedChecks.map(r=>r.place_id)).size,31,
  "All 31 first-pass source-reviewed guides must remain distinct");
const draftById=new Map(drafts.map(g=>[g.place_id,g]));
const researchById=new Map(researchSupplement.sources.map(s=>[s.id,s]));
const canonicalById=new Map(canonicalSources.map(s=>[s.id,s]));
const seenCheckedSections=new Set();
for(const row of scopedChecks){
  assert.equal(row.source_to_claim_second_editor_approved,false,
    "A research source check must not impersonate substantive editor signoff");
  assert.equal(row.owner_release_authorized,false,
    "A research source check must not authorize publication");
  const draft=draftById.get(row.place_id);
  const section=draft?.sections.find(s=>s.id===row.section_id);
  const researchEvidence=researchById.get(row.source_id);
  const canonicalEvidence=canonicalById.get(row.source_id);
  const evidence=researchEvidence||canonicalEvidence;
  assert.ok(draft&&section&&evidence,"Orphan research paragraph/source reference");
  if(researchEvidence){
    assert.equal(researchEvidence.scope,"RESEARCH_ONLY");
    assert.equal(researchEvidence.release_approved,false);
    assert.equal(researchEvidence.place_id,row.place_id,"Wrong-site historical source link");
    assert.ok(draft.research_source_ids?.includes(row.source_id),
      "Research source missing from draft source list");
  }else{
    const canonicalShrine=seed.shrines.find(s=>s.place_id===row.place_id);
    assert.ok(canonicalShrine?.source_ids.includes(row.source_id),
      "Canonical source not assigned to the same physical shrine");
  }
  assert.equal(section.paragraphs[0].source_id,row.source_id);
  assert.equal(section.paragraphs[0].source_url,row.source_url);
  assert.equal(evidence.url,row.source_url);
  assert.ok(draft.bibliography_urls.includes(row.source_url),
    "Paragraph evidence is missing from its guide bibliography");
  const key=row.place_id+":"+row.section_id;
  assert.ok(!seenCheckedSections.has(key),"Duplicate paragraph evidence check");
  seenCheckedSections.add(key);
}

assert.equal(wave1.length,56);
assert.equal(wave2.length,168);
assert.equal(drafts.length,224);
assert.equal(new Set(drafts.map(g=>g.place_id)).size,224);
assert.equal(published.length,33);
assert.equal(buildReviewedSacredGuideCorpus(drafts,seed.shrines,sources,[],published).guides.length,0,
 "No approval: no content enters the published-Place folio format");
const hard=["CANONICAL_ID_MISMATCH","NOT_RESEARCH_DRAFT","BROKEN_CANONICAL_SOURCE_LINK",
  "MISSING_BILINGUAL_PARAGRAPH","EXPECTED_THREE_SECTIONS","MISSING_SECTION_TITLE"];
const diagnoses=drafts.map(g=>inspectSacredGuideEvidence(g,byPlace.get(g.place_id),sources));
for(const d of diagnoses){
  const bad=d.issues.filter(x=>hard.includes(x));
  assert.deepEqual(bad,[],"Malformed draft "+d.place_id+": "+bad.join(","));
  assert.equal(d.evidence_alignment_verified,false);
  assert.equal(d.publication_ready,false);
}
const geographicOnly=diagnoses.filter(x=>x.issues.includes("GEOGRAPHIC_LOCATOR_NOT_HISTORICAL_EVIDENCE"));
const identityOnly=diagnoses.filter(x=>x.issues.includes("SOURCE_METADATA_LIMITED_TO_SITE_IDENTITY"));


const poondiOfficial=wave2.find(x=>x.draft_order===202);
assert.ok(poondiOfficial&&poondiOfficial.research_source_ids.length===2);
assert.ok(!inspectSacredGuideEvidence(poondiOfficial,byPlace.get(poondiOfficial.place_id),sources).issues
  .includes("BROKEN_CANONICAL_SOURCE_LINK"),"Place-bound research references should validate");
const borrowedSource=researchSupplement.sources.find(x=>x.place_id!==poondiOfficial.place_id);
const malicious={...poondiOfficial,research_source_ids:[borrowedSource.id],
  bibliography_urls:[borrowedSource.url],sections:poondiOfficial.sections.map(sec=>({...sec,
    paragraphs:sec.paragraphs.map(p=>({...p,source_id:borrowedSource.id,source_url:borrowedSource.url}))}))};
assert.ok(inspectSacredGuideEvidence(malicious,byPlace.get(malicious.place_id),sources).issues
  .includes("BROKEN_CANONICAL_SOURCE_LINK"),"Another Place cannot lend its historical citation");
const editorialProse=diagnoses.filter(x=>x.issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
assert.equal(editorialProse.length,0,"Wave-2 visitor copy still contains internal Atlas/guide/profile instructions");
const wave1Editorial=wave1.filter(g=>inspectSacredGuideEvidence(g,byPlace.get(g.place_id),sources)
  .issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
assert.equal(wave1Editorial.length,0,"Wave-1 visitor copy still contains implementation or photo-curation instructions");

for(const n of [69,70,72,73,75,76]){
  const g=wave2.find(x=>x.draft_order===n);
  assert.ok(g);
  assert.ok(!inspectSacredGuideEvidence(g,byPlace.get(g.place_id),sources).issues
    .includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"),
    "Bilingual editorial rewrite did not remove guidance memo language from "+g.place_id);
}

// A complete *synthetic test approval* proves schema compatibility and the
// existing rendering path; it is never stored in data or treated as authorization.
const kevelaer=wave2.find(g=>g.place_id==="place:DE:kevelaer-gnadenkapelle");
assert.ok(kevelaer);
const fake={
  place_id:kevelaer.place_id,revision:sacredGuideRevision(kevelaer),
  decision:"APPROVED_FOR_PUBLICATION",source_to_claim_checked:true,
  english_reviewed:true,french_reviewed:true,ecclesial_identity_checked:true,
  owner_release_authorized:true,editor:"TEST_FIXTURE_ONLY",reviewed_on:"2026-11-11",
  official_url:"https://www.wallfahrt-kevelaer.de/wallfahrt/kirchen-und-kapellen/gnadenkapelle",
  region_en:"Kevelaer · Germany",region_fr:"Kevelaer · Allemagne",
  paragraph_evidence:kevelaer.sections.flatMap(s=>s.paragraphs.map((p,i)=>({
    key:s.id+":"+i,checked:true,source_url:p.source_url,editor_note:"SYNTHETIC_TEST_NOT_A_FACT_CHECK",
  }))),
};
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),sources,null),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),sources,{
 ...fake,owner_release_authorized:false}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),sources,{
 ...fake,revision:"fnv1a32-stale"}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),sources,{
 ...fake,paragraph_evidence:fake.paragraph_evidence.slice(1)}),null);
// Negative fixtures are synthetic, so editorial cleanup can reduce real
// issue counts to zero without causing a test regression.
const testLocator={id:"TEST_GEO_ONLY",url:"https://mapcarta.com/W123456",
 directness:"SECONDARY",contribution:"Map location only"};
const fakeGeoGuide={...kevelaer,sections:kevelaer.sections.map(sec=>({
 ...sec,paragraphs:sec.paragraphs.map(p=>({
 ...p,source_id:testLocator.id,source_url:testLocator.url,
 }))}))};
const fakeGeoShrine={...byPlace.get(kevelaer.place_id),source_ids:[testLocator.id]};
assert.ok(inspectSacredGuideEvidence(fakeGeoGuide,fakeGeoShrine,[testLocator])
 .issues.includes("GEOGRAPHIC_LOCATOR_NOT_HISTORICAL_EVIDENCE"));
const fakeMapGuide={...kevelaer,sections:kevelaer.sections.map((sec,i)=>
  i===0?{...sec,paragraphs:sec.paragraphs.map(p=>({...p,en:p.en+" Add a map pin and GPX file for this route."}))}:sec)};
assert.ok(inspectSacredGuideEvidence(fakeMapGuide,byPlace.get(kevelaer.place_id),sources)
  .issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
const fakeAppGuide={...kevelaer,sections:kevelaer.sections.map((sec,i)=>
  i===0?{...sec,paragraphs:sec.paragraphs.map(p=>({...p,en:p.en+" The app does not certify miracles."}))}:sec)};
assert.ok(inspectSacredGuideEvidence(fakeAppGuide,byPlace.get(kevelaer.place_id),sources)
  .issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
const fakeEditorialGuide={...kevelaer,sections:kevelaer.sections.map((sec,i)=>
 i===0?{...sec,paragraphs:sec.paragraphs.map(p=>({
  ...p,en:p.en+" The Atlas should invent a helpful historical fact.",
 }))}:sec)};
assert.ok(inspectSacredGuideEvidence(fakeEditorialGuide,byPlace.get(kevelaer.place_id),sources)
 .issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
assert.equal(reviewedSacredGuideForReader(fakeEditorialGuide,
 byPlace.get(kevelaer.place_id),sources,{
 ...fake,revision:sacredGuideRevision(fakeEditorialGuide)}),null);
const rendered=reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),sources,fake);
assert.ok(rendered&&rendered.publication==="PUBLISHED");
assert.equal(rendered.sections.length,3);
assert.equal(rendered.gallery.length,0);
assert.equal(rendered.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
// A wholly synthetic, owner-authorised partial review may omit precisely
// identified held sections. This never releases any unreviewed research copy.
const partialEvidence=fake.paragraph_evidence.map((e,i)=>i===1?
  {...e,checked:false,hold_reason:"UNVERIFIED_HISTORICAL_CLAIM"}:e);
const partialReview={...fake,release_scope:"PARTIAL_VERIFIED_SECTIONS",
  hold_policy:"OMIT_UNVERIFIED_PARAGRAPHS",verified_paragraphs_only:true,
  paragraph_evidence:partialEvidence};
const partialRendered=reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,partialReview);
assert.ok(partialRendered&&partialRendered.publication==="PUBLISHED");
assert.equal(partialRendered.sections.length,2);
assert.ok(!partialRendered.sections.some(s=>s.id===kevelaer.sections[1].id));
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...partialReview,owner_release_authorized:false}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...partialReview,hold_policy:null}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...fake,paragraph_evidence:partialEvidence}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...partialReview,paragraph_evidence:partialEvidence.map(e=>e.checked===false?
    {...e,hold_reason:""}:e)}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...partialReview,paragraph_evidence:fake.paragraph_evidence}),null);
assert.equal(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,{...fake,paragraph_evidence:fake.paragraph_evidence.map((e,i)=>i===0?
    {...e,source_url:"https://example.com/borrowed-source"}:e)}),null);
// Synthetic fixture only: a single exact-revision owner batch decision works
// for pre-reviewed EN/FR evidence without 224 separate owner toggles.
const unsignedFake={...fake,owner_release_authorized:false};
const testOwnerBatch={kind:"OWNER_EXACT_REVISION_BATCH",authorized:true,
  owner:"SYNTHETIC_OWNER_FIXTURE",authorized_on:"2026-11-11",
  approved_revisions:[{place_id:kevelaer.place_id,revision:sacredGuideRevision(kevelaer)}]};
const effectiveFixture=resolveSacredGuideBatchAuthorization([unsignedFake],testOwnerBatch);
assert.equal(effectiveFixture.length,1);
assert.equal(effectiveFixture[0].owner_release_authorized,true);
assert.ok(reviewedSacredGuideForReader(kevelaer,byPlace.get(kevelaer.place_id),
  sources,effectiveFixture[0]));
assert.throws(()=>resolveSacredGuideBatchAuthorization([unsignedFake],
  {...testOwnerBatch,authorized:false}),/INVALID_OWNER_BATCH_AUTHORIZATION/);
assert.throws(()=>resolveSacredGuideBatchAuthorization([unsignedFake],
  {...testOwnerBatch,approved_revisions:[{place_id:kevelaer.place_id,
    revision:"fnv1a32-stale"}]}),/UNREVIEWED_OR_STALE_BATCH_GUIDE/);
assert.throws(()=>resolveSacredGuideBatchAuthorization([{...unsignedFake,
  source_to_claim_checked:false}],testOwnerBatch),/UNREVIEWED_OR_STALE_BATCH_GUIDE/);
assert.throws(()=>resolveSacredGuideBatchAuthorization([unsignedFake],
  {...testOwnerBatch,approved_revisions:[...testOwnerBatch.approved_revisions,
    ...testOwnerBatch.approved_revisions]}),/DUPLICATE_OR_INVALID_BATCH_GUIDE_REVISION/);

assert.ok(rendered.sections.every(s=>s.paragraphs.every(p=>p.en&&p.fr&&p.source_url)));
const intro=publishedPlaceIntro(kevelaer.place_id,[{guides:[rendered]}]);
assert.ok(intro&&intro.introduction.en&&intro.introduction.fr);
assert.match(renderPlaceEditorialOpening(intro,"en"),/THE STORY/);
assert.match(renderPlaceEditorialOpening(intro,"fr"),/L.HISTOIRE/);
assert.throws(()=>buildReviewedSacredGuideCorpus([kevelaer],seed.shrines,sources,
 [fake],[{place_id:kevelaer.place_id,publication:"PUBLISHED"}]),/ALREADY_PUBLISHED_PLACE/);
assert.throws(()=>buildReviewedSacredGuideCorpus([kevelaer],seed.shrines,sources,
 [fake,fake],published),/DUPLICATE_OR_INVALID_REVIEW_ID/);

// An illustrated map locator is not acceptable historical evidence.
const poondi=wave2.find(x=>x.place_id==="place:IN:basilica-of-our-lady-of-lourdes-poondi");
assert.ok(poondi);
const poondiFake={...fake,place_id:poondi.place_id,revision:sacredGuideRevision(poondi),
 paragraph_evidence:poondi.sections.map(s=>({
   key:s.id+":0",checked:true,source_url:testLocator.url,editor_note:"SYNTHETIC_ONLY",
 }))};
assert.equal(reviewedSacredGuideForReader(poondi,byPlace.get(poondi.place_id),sources,poondiFake),null,
 "Mapcarta locator must not be accepted as sentence-by-sentence historical evidence");

// Public loader may only load six existing banks and the separate approved-only bank; drafts are
// never fetched in the background or included just because they were authored.
const dataService=readFileSync(new URL("../src/find/explore-data-service.js",import.meta.url),"utf8");
const approvedBank=read("data/shrines/illustrated-place-guides-reviewed-bilingual.v1.json");
const reviewDecisions=read("data/shrines/research/sacred-atlas-bilingual-guide-editorial-decisions.v1.json");
const effectiveReviews=resolveSacredGuideBatchAuthorization(
  reviewDecisions.reviews,reviewDecisions.owner_batch_authorization);
const validatedReleased=buildReviewedSacredGuideCorpus(drafts,seed.shrines,sources,
  effectiveReviews,published);
assert.deepEqual(approvedBank.guides,validatedReleased.guides,
  "Public bank must equal exactly the editor-and-owner approved corpus");
assert.equal(approvedBank.guides.length,effectiveReviews.filter(r=>
  r.decision==="APPROVED_FOR_PUBLICATION"&&r.owner_release_authorized===true).length,
  "Every published guide must have a genuine exact-revision approval");
assert.match(dataService,/illustratedReviewedBilingual:moduleUrl/);
assert.match(dataService,/fetchJson\(EXPLORE_DATA_URLS\.illustratedReviewedBilingual/);
assert.doesNotMatch(dataService,/sacred-atlas-wave[12]-/);
assert.match(dataService,/filter\(row=>row\?\.publication==="PUBLISHED"\)/);
console.log("PASS: 224 unpublished drafts remain private; 56 Wave-1 + 168 Wave-2 source checks;"+
  " "+geographicOnly.length+" locator-only, "+identityOnly.length+" site-identity-only,"+
  " "+editorialProse.length+" meta-instruction copy diagnoses;"+
  " approved-only existing EN/FR folio adapter, source checks, image gate and version locks");

// Consolidated, fail-closed full-corpus preflight: this is one mechanical audit
// of ALL 224 guide drafts, not 224 second-editor decisions or publication approvals.
// The review matrix stores exact revisions so even one content change invalidates
// the matching check until the batch preflight is refreshed.
{
  const matrices=[
    read("data/shrines/research/sacred-atlas-bulk-preflight-wave1-20261111.v1.json"),
    read("data/shrines/research/sacred-atlas-bulk-preflight-wave2-20261111.v1.json")
  ];
  const reviewRows=matrices.flatMap(m=>m.guides);
  assert.deepEqual(matrices.map(m=>m.guides.length),[56,168]);
  assert.equal(reviewRows.length,224);
  assert.equal(new Set(reviewRows.map(g=>g.place_id)).size,224);
  assert.equal(reviewRows.reduce((n,g)=>n+g.sections.length,0),672);
  const researchByKey=new Map(claimResearchLedger.paragraphs.map(r=>[r.place_id+"|"+r.section_id,r]));
  assert.equal(researchByKey.size,672,"Unique paragraph research records");
  for(const g of reviewRows)for(const s of g.sections){
    const r=researchByKey.get(g.place_id+"|"+s.section_id);
    assert.ok(r,"Missing research register paragraph");
    assert.equal(r.guide_revision,g.revision);
    assert.equal(r.source_url,s.source_url);
    assert.equal(r.priority,s.editorial_review_priority);
    assert.equal(r.source_id??null,s.source_id??null);
  }
  assert.deepEqual(matrices.map(m=>m.summary.paragraphs),[168,504]);
  assert.equal(matrices.reduce((n,m)=>n+m.summary.high_priority_paragraphs,0),
    reviewRows.flatMap(g=>g.sections).filter(s=>s.editorial_review_priority==="TARGETED_SOURCE_REVIEW").length,
    "Priority summary must equal actual paragraph-level review priorities");
  assert.equal(matrices.reduce((n,m)=>n+m.summary.checked_first_pass,0),93);
  assert.equal(matrices.reduce((n,m)=>n+m.summary.scoped_only,0),579);
  for(const m of matrices){
    assert.equal(m.state,"RESEARCH_ONLY_NO_SOURCE_TO_CLAIM_CERTIFICATION");
    assert.equal(m.summary.invalid.length,0);
  }
  const allSources=new Map(sources.map(s=>[s.id,s]));
  const byPlace=new Map(drafts.map(g=>[g.place_id,g]));
  for(const row of reviewRows){
    const original=byPlace.get(row.place_id);
    assert.ok(original,"Orphan full-corpus review Place: "+row.place_id);
    assert.equal(row.revision,sacredGuideRevision(original),"Stale guide version: "+row.place_id);
    assert.equal(row.publication_authorized,false);
    assert.equal(row.sections.length,3);
    for(const entry of row.sections){
      const paragraph=original.sections.find(s=>s.id===entry.section_id)
        ?.paragraphs?.[entry.paragraph_index];
      assert.ok(paragraph,"Missing reviewed paragraph: "+row.place_id);
      assert.equal(paragraph.source_id??null,entry.source_id??null);
      assert.equal(paragraph.source_url,entry.source_url);
      assert.equal(entry.automated_citation_link_pass,true);
      assert.equal(entry.second_editor_approved,false);
      assert.equal(entry.owner_publication_authorized,false);
      if(entry.source_id){
        const src=allSources.get(entry.source_id);
        assert.equal(src?.url,entry.source_url);
        assert.ok(byPlace.get(row.place_id).research_source_ids?.includes(entry.source_id)||
          seed.shrines.find(s=>s.place_id===row.place_id)?.source_ids.includes(entry.source_id));
      }else{
        assert.ok(original.bibliography_urls.includes(entry.source_url),
          "Unscoped Wave-1 bibliography reference");
      }
    }
  }
  // Publication is an independent editor-and-owner approval pathway.
  assert.deepEqual(approvedBank.guides,validatedReleased.guides);
  console.log("PASS full Sacred Atlas corpus preflight: 224 draft guides / "+
    "672 source-scoped EN/FR paragraphs / 93 earlier research prechecks / "+
    "579 additional mechanical checks / approval-only publication gate.");
}
