import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {h4DykReviewEnabled,h4DykReviewMarkup,h7DykReviewDirectFact} from "../src/home/dyk-r34-h4-review.js";
import {dykPilotSourceFolioModel} from "../src/home/dyk-pilot-source-folio.js";

const read=()=>JSON.parse(readFileSync(
  "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
const d=read();
assert.equal(d.status,"EDITORIAL_SELECTION_NOT_LIVE");
assert.equal(d.records.filter(x=>x.lane==="all-souls-november-2").length,7);
const location=(search)=>({location:{search}});
assert.equal(h4DykReviewEnabled(location("")),false,"Review must not open on default Home");
assert.equal(h4DykReviewEnabled(location("?aoDykR34Review=0")),false);
assert.equal(h4DykReviewEnabled(location("?aoDykR34Review=true")),false);
assert.equal(h4DykReviewEnabled(location("?aoDykR34Review=1")),true);
assert.equal(h4DykReviewEnabled(location("?aoDykR34Review=1&aoTodayH4=0")),true,
  "Flag detection itself is separate from view selection");
assert.equal(h7DykReviewDirectFact(location("?aoDykFact=DYK-UM02-014"),d),null,
  "A fact ID without explicit review consent must never display");
assert.equal(h7DykReviewDirectFact(location("?aoDykR34Review=0&aoDykFact=DYK-UM02-014"),d),null);
assert.equal(h7DykReviewDirectFact(location("?aoDykR34Review=1&aoDykFact=G219"),d),null);
assert.equal(h7DykReviewDirectFact(location("?aoDykR34Review=1&aoDykFact=DYK-NOT-REVIEWED"),d),null);
assert.equal(h7DykReviewDirectFact(location("?aoDykR34Review=1&aoDykFact=DYK-UM02-014"),{...d,status:"PUBLISHED"}),null);
for(const candidate of d.records.filter(x=>x.lane==="all-souls-november-2")){
  assert.equal(h7DykReviewDirectFact(location("?aoDykR34Review=1&aoDykFact="+candidate.id),d),candidate.id,
    "Every verified QA card needs an exact direct review link");
}
assert.equal(h4DykReviewMarkup({...d,status:"PUBLISHED"},"en"),"");
assert.equal(h4DykReviewMarkup({...d,records:[]},"en"),"");
for(const lang of ["en","fr"]){
  const html=h4DykReviewMarkup(d,lang);
  assert.equal((html.match(/class="aoDykR34PreviewButton"/g)||[]).length,7);
  assert.match(html,/data-dyk-r34-review/);
  assert.match(html,/Not published|Non publié/);
  assert.doesNotMatch(html,/data-home-dyk-open/,"QA may not replace the public six-card control");
  assert.doesNotMatch(html,/<script/i,"Cannot inject scripts through source copy");
  for(const row of d.records.filter(x=>x.lane==="all-souls-november-2")){
    const id=row.id;
    assert.ok(html.includes('data-dyk-r34-source="'+id+'"'),"No exact review target "+id);
    const model=dykPilotSourceFolioModel(d,id,lang);
    assert.ok(model?.sourcePageUrl.endsWith("#page="+row.pilot_source_folio.pdf_pages_1based[0]));
  }
}
const home=readFileSync("src/home/browser-entry.js","utf8");
assert.match(home,/new URLSearchParams\(win\?\.location\?\.search\|\|""\)\.get\("aoDykR34Review"\)==="1"/);
assert.match(home,/import\("\.\/dyk-r34-h4-review\.js"\)/);
assert.ok(!readFileSync("src/home/today-h4-view.js","utf8").includes("dyk-r34-h4-review"),
  "Approved H7 markup must remain unchanged");
console.log("PASS H7 R34 review contract: default inaccessible, exact 7 EN/FR QA records, no Home redesign or publication");
