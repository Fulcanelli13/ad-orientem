import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";

// Snapshot/shape regression only. No claim of browser, design, theological or rights acceptance.
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const text=path=>readFileSync(resolve(root,path),"utf8");
const audit=JSON.parse(text("data/geography/research/explore-folio-editorial-readiness-20261031.v1.json"));
const view=text("src/find/explore-presentation.js");
const styles=text("src/find/heritage-style.js");
const ids=(rows,key)=>new Set(rows.map(x=>x[key]));
assert.equal(audit.schema,"AO_EXPLORE_EDITORIAL_READINESS_AUDIT_V1");
assert.equal(audit.status,"READ_ONLY_RECONCILIATION_NOT_A_PUBLICATION_PERMISSION");
for(const [name,count] of [["places","canonical_places"],["shrines","shrines"],["relics","relics"],["apparitions","apparitions"]]){
  assert.equal(audit[name].length,audit.coverage[count],name+" snapshot integrity");
}
assert.equal(ids(audit.places,"place_id").size,audit.places.length,"one audited row per Place");
assert.equal(ids(audit.shrines,"shrine_id").size,audit.shrines.length,"one audited row per shrine");
assert.equal(ids(audit.relics,"relic_id").size,audit.relics.length,"one audited row per relic");
assert.equal(ids(audit.apparitions,"apparition_id").size,audit.apparitions.length,"one audited row per apparition");
const placeIds=ids(audit.places,"place_id");
for(const row of [...audit.shrines,...audit.relics,...audit.apparitions]){
  assert(placeIds.has(row.place_id),"all reviewed subjects must refer to an existing canonical Place");
}
assert.equal(audit.shrines.filter(x=>x.published_detailed_guide).length,audit.coverage.shrines_with_published_guide);
assert.equal(audit.shrines.filter(x=>x.category==="MARIAN").length,audit.coverage.marian_shrines);
assert.equal(audit.relics.filter(x=>x.verified_exact_subject_photos>0).length,audit.coverage.relics_with_approved_exact_subject_photos);
assert(audit.saints.every(x=>x.live_biography===false),"research-only Saints must not become a fictional published biography");
assert(audit.shrines.every(x=>x.primary_devotional_subject_media_review==="NOT_YET_CERTIFIED_AT_SUBJECT_SCOPE"),
 "no approved building cover may be counted as a certified Marian/relic subject image");

// Keep focused source-owned user-facing hierarchy: a published sourced opening
// followed by exact Sacred Treasures, before long text chapters.
const early=view.indexOf("if(hasEditorialIntro&&hasTreasures)html+=renderPlaceSacredTreasures(profile,vm.language)");
const fullStory=view.indexOf("if(visibleChapters.length)");
const fallback=view.indexOf("if(!hasEditorialIntro&&hasTreasures)html+=renderPlaceSacredTreasures(profile,vm.language)");
assert(early>0&&fullStory>early&&fallback>fullStory,"foliated treasure/story ordering");
assert(view.includes("gallery.some(photo=>photo.subject_relic_id"),"gallery heading requires exact subject binding");
assert(view.includes("if(arr(profile.tlm).length){"),"TLM section requires an exact linked Place venue");
assert(!view.includes("No TLM venue is currently linked to this exact Place."),"no empty unlinked TLM accordion");
assert(styles.includes("repeat(auto-fit,minmax(min(100%,320px),1fr))"),"one treasure should span the readable folio width");

// Published guide copy must be pilgrim-facing, not implementation instructions.
const guidePaths=["france","france-r67","ireland","world-marian-r1","global-saints-r1","global-marian-b2"]
  .map(name=>"data/shrines/illustrated-place-guides-"+name+".v1.json");
const guides=guidePaths.flatMap(path=>JSON.parse(text(path)).guides);
assert.equal(guides.length,33,"All published guide corpora must be present");
const editorialLeak=/\b(?:the app|the application|this app|our app|the reader|no live Mass time is generated here)\b|l['’]application/i;
let paragraphCount=0;
for(const guide of guides){
  assert.equal(guide.publication,"PUBLISHED");
  for(const section of guide.sections??[]){
    for(const paragraph of section.paragraphs??[]){
      paragraphCount++;
      for(const lang of ["en","fr"]){
        assert(paragraph[lang]?.trim(),guide.place_id+" missing "+lang+" paragraph");
        assert(/^https:\/\/[^\s]+$/.test(paragraph.source_url),guide.place_id+" missing paragraph source");
        assert(!editorialLeak.test(paragraph[lang]),guide.place_id+" has editorial-instruction prose ("+lang+")");
      }
    }
  }
  for(const lang of ["en","fr"]){
    assert(!editorialLeak.test(guide.visit?.[lang]??""),guide.place_id+" has an editorial visit instruction");
  }
}
assert.equal(paragraphCount,127,"The 33-guide corpus has unexpectedly changed size");
const journey= view.indexOf('data-explore-place-journeys data-explore-place-chapter="journeys"');
const guide= view.indexOf('if(hasGuide)html+=illustratedGuideHtml(profile,vm.language)');
assert(journey>guide,"Documented journeys must come after the shrine narrative and pilgrimage guide");
assert(view.includes('data-explore-place-jump="journeys"'),"Existing journey chapter must be reachable from chapter nav");
assert(view.includes("hasEditorialIntro?'':' data-explore-place-chapter"),"Published opening must own a unique story anchor");

console.log("Explore editorial/folio contract: snapshot and source ordering OK (browser QA remains required)");
