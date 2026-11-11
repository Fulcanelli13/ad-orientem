import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectSacredGuideEvidence,sacredGuideRevision,reviewedSacredGuideForReader,
  buildReviewedSacredGuideCorpus} from "../src/find/sacred-guide-review-release.js";
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
const sources=read("data/shrines/source-registry.v1.json").sources;
const drafts=[...wave1,...wave2],byPlace=new Map(seed.shrines.map(s=>[s.place_id,s]));
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


const editorialProse=diagnoses.filter(x=>x.issues.includes("EDITORIAL_INSTRUCTIONS_IN_VISITOR_COPY"));
assert.equal(editorialProse.length,0,"Wave-2 visitor copy still contains internal Atlas/guide/profile instructions");

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
assert.deepEqual(approvedBank.guides,[],"No public stories before substantive release review");
assert.deepEqual(reviewDecisions.reviews,[],"No synthetic approvals may persist");
assert.match(dataService,/illustratedReviewedBilingual:moduleUrl/);
assert.match(dataService,/fetchJson\(EXPLORE_DATA_URLS\.illustratedReviewedBilingual/);
assert.doesNotMatch(dataService,/sacred-atlas-wave[12]-/);
assert.match(dataService,/filter\(row=>row\?\.publication==="PUBLISHED"\)/);
console.log("PASS: 224 unpublished drafts remain private; 56 Wave-1 + 168 Wave-2 source checks;"+
  " "+geographicOnly.length+" locator-only, "+identityOnly.length+" site-identity-only,"+
  " "+editorialProse.length+" meta-instruction copy diagnoses;"+
  " approved-only existing EN/FR folio adapter, source checks, image gate and version locks");
