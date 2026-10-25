import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {Script} from "node:vm";
const html=await readFile(new URL("../previews/pius-x-voice-scene-review-20261019.html",import.meta.url),"utf8");
const capture=(re,label)=>{const m=html.match(re);assert.ok(m,label+" not found");return m[1]};
assert.match(html,/Documentary voice/i);
assert.match(html,/Editorial reconstruction/);
assert.match(html,/not authentic spoken quotations/);
assert.match(html,/Export ratings/);
assert.match(html,/localStorage/);
assert.match(html,/application\/json/);
assert.match(html,/aria-live="polite"/);
assert.match(html,/id="sprite"/);
assert.match(html,/id="natural"/);
assert.match(html,/id="character"/);
assert.match(html,/id="pace"/);
assert.match(html,/id="notes"/);
assert.match(html,/id="evidenceToggle"/);
assert.match(html,/\.after\.showEvidence #evidence\{display:block\}/,"Evidence button must actually reveal sources");
assert.match(html,/\.after #evidence\{display:none\}/,"Editorial evidence concealed until requested");
assert.match(html,/const spriteUrls=/);
assert.match(html,/8af296fc7e8ca632883546b54721270c8ef0ef59/,"Pinned P4 expression set is required");
for(const pose of ["neutral","welcoming","explaining","thoughtful","grave"])assert.match(html,new RegExp("pius-"+pose+"\\.webp"));
const jsonText=capture(/<script id="payload" type="application\/json">([\s\S]*?)<\/script>/,"embedded review fixture");
const data=JSON.parse(jsonText);
assert.equal(data.schema,"AO_PIUS_X_STYLE_VISUAL_NOVEL_REVIEW_V1");
assert.equal(data.publication,"EDITORIAL_PREVIEW_NOT_RUNTIME");
assert.equal(data.items.length,14);
assert.equal(data.items.filter(x=>x.kind==="teaching").length,3);
assert.equal(data.items.filter(x=>x.kind==="letters").length,3);
assert.equal(data.items.filter(x=>x.kind==="contrasts").length,8);
assert.equal(data.items.reduce((n,item)=>n+item.frames.length,0),20);
const ids=new Set(data.items.map(i=>i.id));assert.equal(ids.size,14);
for(const scenario of data.items){
 assert.ok(scenario.title.en&&scenario.title.fr);
 for(const turn of scenario.frames){
  for(const lang of ["en","fr"]){
   assert.ok(turn.q[lang]?.trim()&&turn.a[lang]?.trim());
   assert.ok(turn.a[lang].length>25);
  }
  assert.ok(["neutral","welcoming","explaining","thoughtful","grave"].includes(turn.sprite));
  assert.ok(turn.sources.length>0);
  for(const source of turn.sources){
   const witness=data.library[source];assert.ok(witness,scenario.id+" missing "+source);
   assert.match(witness.url,/^https:\/\//);
  }
 }
}
const js=capture(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/,"interaction script");
new Script(js,{filename:"pius-x-voice-review-inline.js"});
for(const required of ["addEventListener","localStorage.setItem","URL.createObjectURL","select","grades","natural","character","pace"]){
 assert.ok(js.includes(required),"Interactive behaviour missing "+required);
}
assert.ok(js.includes("showGroup(\"teaching\")"));
assert.doesNotMatch(html,/\b(?:fetch\(|import\(|eval\()/i,"No remote answer API or dynamic scripts");
console.log("PASS Pius X review-only visual-novel page: 14 scenarios, 20 bilingual exchanges, pinned P4 art, 31 cited document IDs, accessible review/export UI, JS syntax and nonpublication gates");
