import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 approvedMassExplorerStudies,massExplorerStudyForBlock,massExplorerApprovedStudyHtml,
 MASS_EXPLORER_STUDY_PUBLICATION_VERSION
} from "../src/learn/mass-explorer-study-publication.js";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";

const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const guides=load("data/presentation/guide-registry.v1.json");
const sung=load("data/presentation/reader-text-sung.v1.json");
const french=load("data/presentation/reader-french-ordinary.v1.json");
const formation=load("data/learn/mass-formation-campion.v1.json");
const manifest=load("data/learn/mass-explorer-approved-studies.v1.json");
const readings=load("data/learn/mass-explorer-prayer-readings.v1.json");
const emptyCatalog=buildMassExplorerCatalog(guides,sung,french,formation,readings,manifest);
assert.equal(manifest.schema,MASS_EXPLORER_STUDY_PUBLICATION_VERSION);
assert.equal(manifest.status,"NO_APPROVED_STUDIES");
assert.deepEqual(manifest.entries,[]);
assert.equal(emptyCatalog.approvedStudyByBlock.size,0);
assert.equal(emptyCatalog.explanatoryReadingByBlock.size,84,
 "Existing 84 bilingual short explanations must survive the release gate");
assert.equal(emptyCatalog.byBlock.size,96);
assert.equal(emptyCatalog.sequence.length,32);
assert.ok(!massExplorerMomentHtml(emptyCatalog,"AO.CARD.014",{blockId:"AO.SM.B051"}).includes('id="ao-mx-deep-study"'));
assert.ok(!massExplorerMomentHtml(emptyCatalog,"AO.CARD.017",{blockId:"AO.SM.B055"}).includes('data-ao-mx-jump="deep-study"'));
assert.equal(approvedMassExplorerStudies(null,emptyCatalog,formation).size,0);
assert.equal(approvedMassExplorerStudies({...manifest,status:"RELEASED_FOR_MASS_EXPLORER"},emptyCatalog,formation).size,0);

const approved={
 schema:MASS_EXPLORER_STUDY_PUBLICATION_VERSION,
 status:"RELEASED_FOR_MASS_EXPLORER",scope:"FORMATION_ONLY",
 release_id:"AO-MX-STUDY-2026-10-16-TEST001",reviewed_by:"Fixture editorial reviewer",
 approved_on:"2026-10-16",
 entries:[{
  id:"AO.FORM.CANON.DEEP.02",stage_id:"MF05",block_ids:["AO.SM.B051"],
  profile:"ORDINARY_SUNG",use:"FORMATION_ONLY",
  review_status:"APPROVED_FOR_MASS_EXPLORER",
  content_type:"ORIGINAL_EDITORIAL_PARAPHRASE",
  rights_basis:"APP_OWNED_ORIGINAL_PROSE",
  reviewed_by:"Fixture editorial reviewer",reviewed_on:"2026-10-16",
  rights_reviewed_by:"Fixture rights reviewer",rights_reviewed_on:"2026-10-16",
  claim_ids:["MF05-C01"],
  title:{en:"A theological study of the offering",fr:"Une étude théologique de l’offrande"},
  lead:{
   en:"This fixture illustrates a manually approved study that remains tied to the original Missal prayer rather than to research-only claims.",
   fr:"Cet exemple illustre une étude approuvée manuellement qui demeure liée à la prière originale du Missel plutôt qu’aux thèses de recherche."
  },
  sections:[{
   heading:{en:"What the prayer requests",fr:"Ce que demande la prière"},
   body:{
    en:"The consecration must be distinguished from the preparatory petition. This fixture deliberately reuses only an already published doctrinal claim and adds no historical source quote.",
    fr:"La consécration doit être distinguée de la demande préparatoire. Cet exemple ne renvoie qu’à une affirmation doctrinale déjà publiée et n’ajoute aucune citation historique."
   },
   claim_ids:["MF05-C01"]
  }]
 }]
};
const valid=approvedMassExplorerStudies(approved,emptyCatalog,formation);
assert.equal(valid.size,1);
assert.equal(massExplorerStudyForBlock(valid,"AO.SM.B051")?.id,approved.entries[0].id);
assert.equal(massExplorerStudyForBlock(valid,"AO.SM.B055"),null);
for(const fr of [true,false]){
 const html=massExplorerApprovedStudyHtml(valid.get("AO.SM.B051"),{french:fr,sourceTitle:"MF05"});
 assert.match(html,/data-ao-mx-anchor="deep-study"/);
 assert.match(html,/data-ao-mx-study-owner="AO.FORM.CANON.DEEP.02"/);
 assert.match(html,fr?/Ce que demande/:/What the prayer/);
 assert.doesNotMatch(html,/Gihr|Le Brun|Benedict XVI|P0 research/);
}
const published=buildMassExplorerCatalog(guides,sung,french,formation,readings,approved);
assert.equal(published.explanatoryReadingByBlock.size,84,
 "Long-form approval must never overwrite the 84 original short readings");
assert.equal(published.publishedPrayerContextByBlock.size,19,
 "Existing 19 precise published prayer contexts must be preserved");
const html=massExplorerMomentHtml(published,"AO.CARD.014",{blockId:"AO.SM.B051"});
assert.match(html,/data-ao-mx-jump="deep-study"/);
assert.match(html,/data-ao-mx-study-owner="AO.FORM.CANON.DEEP.02"/);
assert.match(html,/data-ao-mx-cue=/,"Canonical text must remain primary owner");
assert.match(html,/Guide explanation/,"Existing original Guide must remain visible");
assert.equal((html.match(/data-ao-mx-study-owner=/g)||[]).length,1);
assert.doesNotMatch(massExplorerMomentHtml(published,"AO.CARD.014",{blockId:"AO.SM.B050"}),/data-ao-mx-jump="deep-study"/);
assert.match(html,/data-ao-mx-text-reading="AO.SM.B051"/,
 "The existing short source-grounded explanation is still displayed");
assert.match(html,/data-ao-mx-published-claim="MF05-C01"/,
 "Previously published Formation claim remains visible");
assert.match(html,/<details class="aoMXDeepStudy"/,
 "Full commentary must be optional and collapsed by default");
assert.doesNotMatch(html,/<details class="aoMXDeepStudy"[^>]+ open/,
 "Deep study should not add a large expanded panel on mobile");

const clone=JSON.parse(JSON.stringify(approved));
const bad=[
 x=>{x.status="NO_APPROVED_STUDIES"},
 x=>{x.approved_on=null},
 x=>{x.reviewed_by=""},
 x=>{x.release_id=null},
 x=>{x.entries[0].review_status="EDITORIAL_DRAFT_NOT_RELEASED"},
 x=>{x.entries[0].profile="LOW"},
 x=>{x.entries[0].stage_id="MF04"},
 x=>{x.entries[0].block_ids=["AO.SM.B052"]},
 x=>{x.entries[0].block_ids=["AO.SM.B051","AO.SM.B052"]},
 x=>{x.entries[0].claim_ids=["AO.V3.0163.U001"]},
 x=>{x.entries[0].claim_ids=["MF05-C01","MF04-C01"]},
 x=>{x.entries[0].rights_basis="RESEARCH_ONLY"},
 x=>{x.entries[0].rights_reviewed_by=null},
 x=>{x.entries[0].lead.fr=""},
 x=>{x.entries[0].sections[0].body.fr="Non"},
 x=>{x.entries[0].sections[0].claim_ids=["MF05-C03"]},
 x=>{x.entries.push(JSON.parse(JSON.stringify(x.entries[0])))}
];
for(const [index,mutation] of bad.entries()){
 const copy=JSON.parse(JSON.stringify(clone));
 mutation(copy);
 assert.equal(approvedMassExplorerStudies(copy,emptyCatalog,formation).size,0,"Invalid release scenario "+index);
}
const unsafe=JSON.parse(JSON.stringify(approved));
unsafe.entries[0].lead.en="<script>untrusted</script> "+unsafe.entries[0].lead.en;
const escaped=approvedMassExplorerStudies(unsafe,emptyCatalog,formation);
assert.equal(escaped.size,1);
const safeHtml=massExplorerApprovedStudyHtml(escaped.get("AO.SM.B051"));
assert.ok(safeHtml.includes("&lt;script&gt;"));
assert.ok(!safeHtml.includes("<script>"));
const live=readFileSync(new URL("../src/learn/mass-explorer.js",import.meta.url),"utf8");
const ritual=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.doesNotMatch(live,/mass-formation-canon-deep-exemplar|mass-explorer-editorial-bridge|mass-formation-canon-two-major/);
assert.doesNotMatch(ritual,/mass-explorer-study-publication|mass-formation-canon-deep/);
console.log("PASS Canon study approval boundary: empty public release, strict P1 claim ownership, reversible bilingual projection, 17 fail-closed mutation cases, original LIVE/Missal unaffected.");
