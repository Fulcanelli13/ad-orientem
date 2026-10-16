import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateGuideRegistry} from "../src/mass/reader-guide.js";
import {massFormationScriptureHtmlForAnchorIds} from "../src/learn/mass-formation-scripture-context.js";
import {
  MASS_MOMENTS_CURATED_LINKS,
  massMomentStudyLinks,massMomentStudyKeys,
  massMomentsStudyListHtml,massMomentStudyDetailHtml,massMomentExistingGuideSections
} from "../src/learn/mass-moments-study.js";
const guides=JSON.parse(readFileSync(new URL("../data/presentation/guide-registry.v1.json",import.meta.url),"utf8"));
const formation=JSON.parse(readFileSync(new URL("../data/learn/mass-formation-campion.v1.json",import.meta.url),"utf8"));
validateGuideRegistry(guides);
const titles=Object.fromEntries(formation.stages.map(s=>[s.id,s.title.en]));
const keys=massMomentStudyKeys(guides);
assert.equal(keys.length,32);
assert.equal(new Set(keys).size,32);
assert.equal(keys[0],"PRE.ASPERGES");
assert.equal(keys[1],"AO.CARD.001");
assert.equal(keys[30],"AO.CARD.030");
assert.equal(keys[31],"POST.MASS");
for(const fr of [false,true]){
 const html=massMomentsStudyListHtml(guides,{french:fr});
 assert.equal((html.match(/data-ao-mf-moment="/g)||[]).length,32);
 assert.ok(html.includes(fr?"Avant la Messe":"Before Mass"));
 assert.ok(html.includes('data-ao-mf-moment="AO.CARD.015"'));
 assert.ok(!html.includes("sourceLinks"));
}
for(const key of keys){
 const guide=guides.entries[key];
 const sections=massMomentExistingGuideSections(guide);
 assert.ok(sections.length>0,"Existing guidance should show a substantive passage: "+key);
 assert.ok(sections.length<=3);
 assert.ok(sections.every(s=>guide.long.includes(s.text)));
 assert.ok(sections.every(s=>!s.text.includes("\n\nSources\n")),"No generic bibliography promoted to a certified passage");
 const html=massMomentStudyDetailHtml(guides,key,{stageTitles:titles});
 assert.ok(html.includes('data-ao-mf-moment-detail="'+key+'"'));
 assert.ok(html.includes(guide.moment.replace(/&/g,"&amp;")));
 assert.ok(html.includes("Existing Sung Mass guidance"));
 assert.ok(!html.includes("How this developed"),"Long historical comparisons remain withheld");
 assert.ok(!html.includes("https://"),"Do not auto-publish the broad Guide source links");
 assert.ok(!html.includes("verified author claims"));
 const context=massMomentStudyLinks(key);
 if(context.stageId){
  assert.ok(titles[context.stageId],key+" linked to an unknown stage");
  assert.ok(html.includes('data-ao-mf-related-stage="'+context.stageId+'"'));
 }else assert.ok(!html.includes("data-ao-mf-related-stage"));
 assert.equal((html.match(/data-ao-mass-formation-anchor=/g)||[]).length,context.scriptureAnchorIds.length);
}
assert.ok(massMomentStudyDetailHtml(guides,"AO.CARD.017",{stageTitles:titles}).includes("Genesis 14:18–20"));
assert.ok(massMomentStudyDetailHtml(guides,"AO.CARD.030",{stageTitles:titles}).includes("only when prescribed"));
assert.equal(massMomentStudyDetailHtml(guides,"NOT_A_GUIDE"),"");
assert.equal(massMomentStudyLinks("NOT_A_GUIDE").stageId,null);
assert.throws(()=>massFormationScriptureHtmlForAnchorIds(["MFS404"]),/Unknown/);
assert.equal(massFormationScriptureHtmlForAnchorIds([]),"");
for(const [key,links] of Object.entries(MASS_MOMENTS_CURATED_LINKS)){
 assert.ok(guides.entries[key],key);
 assert.ok(!links.stageId||titles[links.stageId],key);
}
const js=readFileSync(new URL("../src/learn/mass-formation.js",import.meta.url),"utf8");
for(const token of ["loadGuideRegistry({fetchImpl})","data-ao-mf-open-moments","data-ao-mf-related-stage",
  "data-ao-mf-moment-prev","data-ao-mf-moment-next","massMomentsStudyListHtml","massMomentStudyDetailHtml"]){
 assert.ok(js.includes(token),"Mass Formation lost navigation wiring: "+token);
}
console.log("PASS Mass moments: all 32 existing Guide IDs, restrained copy, bilingual view, exact Scripture and Formation links.");
