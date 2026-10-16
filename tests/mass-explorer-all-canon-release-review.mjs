import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {chromium} from "@playwright/test";
import {buildMassExplorerCatalog,massExplorerMomentHtml} from "../src/learn/mass-explorer.js";
import {approvedMassExplorerStudies} from "../src/learn/mass-explorer-study-publication.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const a=read("data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json");
const b=read("data/learn/research/mass-explorer-remaining-six-release-candidates-20261016.v1.json");
const manifest=read("data/learn/mass-explorer-approved-studies.v1.json");
const formation=read("data/learn/mass-formation-campion.v1.json");
const catalog=buildMassExplorerCatalog(
 read("data/presentation/guide-registry.v1.json"),
 read("data/presentation/reader-text-sung.v1.json"),
 read("data/presentation/reader-french-ordinary.v1.json"),formation,manifest);
const studies=[...a.studies,...b.studies].sort((x,y)=>x.id.localeCompare(y.id));
assert.equal(studies.length,8);
assert.equal(studies.reduce((n,s)=>n+s.sections.length,0),34);
assert.deepEqual(studies.flatMap(s=>s.block_ids).sort(),Array.from({length:15},(_,i)=>"AO.SM.B"+String(i+47).padStart(3,"0")));
assert.equal(catalog.approvedStudyByBlock.size,0);
const releasedIds=new Set();
for(const s of studies){
 const stage=formation.stages.find(x=>x.id===s.stage_id);
 assert.ok(stage,s.id+" has missing published stage");
 assert.equal(s.profile,"ORDINARY_SUNG");
 assert.equal(s.review_status,"DRAFT_AWAITING_EDITORIAL_APPROVAL");
 assert.equal(s.content_type,"ORIGINAL_EDITORIAL_PARAPHRASE");
 assert.ok(s.block_ids.every(id=>catalog.byBlock.get(id)?.source.Branch_Status==="NORMATIVE_1962"));
 assert.ok(s.claim_ids.every(id=>stage.claims.some(claim=>claim.id===id)));
 for(const section of s.sections){
  for(const lang of ["en","fr"]){
   assert.ok(section.heading[lang].length>=8,s.id+" "+lang+" short heading");
   assert.ok(section.body[lang].length>=75,s.id+" "+lang+" short paragraph");
   assert.ok(section.body[lang].length<=4000,s.id+" "+lang+" overlong paragraph");
  }
  assert.ok(section.claim_ids.every(id=>s.claim_ids.includes(id)));
 }
 for(const id of s.block_ids){assert.ok(!releasedIds.has(id));releasedIds.add(id)}
}
const previewManifest={
 schema:"ao-mass-explorer-study-publication-v1",
 status:"RELEASED_FOR_MASS_EXPLORER",
 scope:"FORMATION_ONLY",
 release_id:"AO-MX-STUDY-2026-10-16-TEST008",
 reviewed_by:"Synthetic only — do not publish",approved_on:"2026-10-16",
 entries:studies.map(s=>({...s,review_status:"APPROVED_FOR_MASS_EXPLORER",
  rights_basis:"APP_OWNED_ORIGINAL_PROSE",
  reviewed_by:"Synthetic fixture — not a review",reviewed_on:"2026-10-16",
  rights_reviewed_by:"Synthetic rights fixture",rights_reviewed_on:"2026-10-16"
 }))
};
const eligible=approvedMassExplorerStudies(previewManifest,catalog,formation);
assert.equal(eligible.size,15,"All eight candidates should technically map to their 15 source blocks");
assert.equal(eligible.get("AO.SM.B047"),eligible.get("AO.SM.B050"),"Opening Canon group should be a shared study owner");
assert.equal(eligible.get("AO.SM.B057"),eligible.get("AO.SM.B059"),"Concluding petitions share one study");
for(const id of releasedIds){
 const liveOwner=catalog.byBlock.get(id);
 const raw=massExplorerMomentHtml(catalog,liveOwner.key,{blockId:id});
 assert.doesNotMatch(raw,/data-ao-mx-study-owner=/,"No actual editorial publication authorization");
}
const path=resolve(root,"artifacts/p2-all-canon-candidates/index.html");
const html=readFileSync(path,"utf8");
const scriptMatch=html.match(/<script type="application\/json" id="ao-canon-data">([^]*?)<\/script>/);
assert.ok(scriptMatch);
const pages=JSON.parse(scriptMatch[1]);
assert.deepEqual(Object.keys(pages.en).sort(),[...releasedIds].sort());
assert.deepEqual(Object.keys(pages.fr).sort(),[...releasedIds].sort());
for(const s of studies)for(const id of s.block_ids)for(const lg of ["en","fr"]){
 const content=pages[lg][id];
 assert.match(content,new RegExp('data-ao-candidate-study="'+s.id.replace(/\./g,"\\.")+'"'));
 assert.equal((content.match(/data-ao-candidate-section=/g)||[]).length,s.sections.length);
 assert.ok(content.includes('data-ao-mx-cue='));
 assert.ok(content.includes('data-ao-mx-study=')||content.includes('data-ao-mx-jump='));
}
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,430,768,1280]){
  const page=await browser.newPage({viewport:{width,height:860},isMobile:width<=430,hasTouch:width<=430}),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.goto(pathToFileURL(path).href,{waitUntil:"load"});
  assert.equal(await page.locator("[data-ao-candidate-study]").count(),1);
  assert.equal(await page.locator("[data-canon-select] option").count(),8);
  await page.locator("[data-canon-select]").selectOption("AO.SM.B051");
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B051"]').count(),1);
  assert.equal(await page.locator("[data-ao-candidate-section]").count(),5);
  await page.locator("[data-canon-select]").selectOption("AO.SM.B055");
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B055"]').count(),1);
  await page.locator('[data-canon-lang="fr"]').click();
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B055"]').count(),1);
  await page.locator("[data-canon-select]").selectOption("AO.SM.B057");
  assert.equal(await page.locator('[data-ao-candidate-block="AO.SM.B057"]').count(),1);
  assert.equal(await page.locator("[data-ao-candidate-section]").count(),4);
  const overflow=await page.evaluate(()=>{const root=document.getElementById("ao-mass-explorer-root");return root.scrollWidth-root.clientWidth});
  assert.ok(overflow<=2,"Horizontal overflow at "+width+": "+overflow);
  assert.deepEqual(errors,[],"Client errors at "+width+"px");
  await page.close();
 }
}finally{await browser.close()}
console.log("PASS eight source-owned Canon candidate studies, 15 exact original blocks, 34 bilingual sections, simulated 15-block release mapping, no public approval, five responsive widths.");
