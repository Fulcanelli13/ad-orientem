import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
import {approvedMassExplorerStudies,massExplorerApprovedStudyHtml} from "../src/learn/mass-explorer-study-publication.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const data=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const draft=data("data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json");
const manifest=data("data/learn/mass-explorer-approved-studies.v1.json");
const formation=data("data/learn/mass-formation-campion.v1.json");
const catalog=buildMassExplorerCatalog(
 data("data/presentation/guide-registry.v1.json"),
 data("data/presentation/reader-text-sung.v1.json"),
 data("data/presentation/reader-french-ordinary.v1.json"),formation,manifest);
assert.equal(draft.status,"EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED");
assert.equal(draft.certification.human_reviewed,false);
assert.equal(draft.certification.formal_rights_reviewed,false);
assert.equal(draft.certification.eligible_to_promote_to_release_manifest,false);
assert.deepEqual(draft.studies.map(s=>s.block_ids[0]),["AO.SM.B051","AO.SM.B055"]);
assert.deepEqual(draft.studies.map(s=>s.stage_id),["MF05","MF06"]);
assert.equal(draft.studies.reduce((n,s)=>n+s.sections.length,0),10);
assert.equal(catalog.approvedStudyByBlock.size,0,"No source unilaterally promotes draft material");
const claims=new Set(formation.stages.flatMap(s=>s.claims.map(c=>c.id)));
for(const s of draft.studies){
 assert.equal(s.review_status,"DRAFT_AWAITING_EDITORIAL_APPROVAL");
 assert.equal(s.content_type,"ORIGINAL_EDITORIAL_PARAPHRASE");
 assert.ok(s.title.en.length>=12&&s.title.fr.length>=12);
 assert.ok(s.lead.en.length>=35&&s.lead.fr.length>=35);
 for(const row of s.sections){
  assert.ok(row.heading.en.length>=8&&row.heading.fr.length>=8);
  assert.ok(row.body.en.length>=75&&row.body.fr.length>=75);
  assert.ok(row.claim_ids.every(id=>s.claim_ids.includes(id)&&claims.has(id)));
 }
 const bound=formation.stages.find(x=>x.id===s.stage_id);
 assert.ok(s.claim_ids.every(id=>bound.claims.some(c=>c.id===id)));
}
const hypothetical={
 schema:"ao-mass-explorer-study-publication-v1",scope:"FORMATION_ONLY",
 status:"RELEASED_FOR_MASS_EXPLORER",release_id:"AO-MX-STUDY-2026-10-16-TEST002",
 reviewed_by:"Fixture editorial reviewer",approved_on:"2026-10-16",
 entries:draft.studies.map(s=>({...s,
  review_status:"APPROVED_FOR_MASS_EXPLORER",rights_basis:"APP_OWNED_ORIGINAL_PROSE",
  reviewed_by:"Fixture editorial reviewer",reviewed_on:"2026-10-16",
  rights_reviewed_by:"Fixture rights reviewer",rights_reviewed_on:"2026-10-16"
 }))
};
const simulated=approvedMassExplorerStudies(hypothetical,catalog,formation);
assert.equal(simulated.size,2,"Both candidate studies must pass technical publication gate after genuine review");
for(const id of ["AO.SM.B051","AO.SM.B055"]){
 const s=simulated.get(id);
 assert.ok(s);
 const html=massExplorerApprovedStudyHtml(s);
 assert.equal((html.match(/class="aoMXDeepSection"/g)||[]).length,5);
 assert.match(html,/data-ao-mx-study-owner=/);
}
const publicHtml=massExplorerMomentHtml(catalog,"AO.CARD.014",{blockId:"AO.SM.B051"});
assert.doesNotMatch(publicHtml,/data-ao-mx-study-owner/,"No P2 approval recorded in real public manifest");
const review=resolve(root,"artifacts/p2-first-two-review/index.html");
const html=readFileSync(review,"utf8");
assert.match(html,/ao-candidate-pages/);
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,430,768,1280]){
  const page=await browser.newPage({viewport:{width,height:860},isMobile:width<=430,hasTouch:width<=430});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(review).href,{waitUntil:"load"});
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B051"]').count(),1);
  assert.equal(await page.locator("[data-ao-candidate-section]").count(),5);
  await page.locator('[data-block="AO.SM.B055"]').click();
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B055"]').count(),1);
  await page.locator('[data-lang="fr"]').click();
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B055"]').count(),1);
  assert.match(await page.locator(".aoCandidateTag").innerText(),/NON PUBLIÉE/);
  await page.locator('[data-block="AO.SM.B051"]').click();
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B051"]').count(),1);
  const overflow=await page.evaluate(()=>{const el=document.querySelector("#ao-mass-explorer-root");return el.scrollWidth-el.clientWidth});
  assert.ok(overflow<=2,"horizontal overflow at "+width+"px: "+overflow);
  assert.deepEqual(errors,[],width+"px page errors");
  await page.close();
 }
}finally{await browser.close();}
console.log("PASS: two complete English/French study candidates; simulated release would allow two after real sign-off; public release remains zero. Responsive 320–1280.");
