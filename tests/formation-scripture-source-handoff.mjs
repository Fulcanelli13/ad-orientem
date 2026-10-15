import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {formationSourceScriptureContext,formationSourceBibleMarkup}
 from "../src/learn/formation-scripture-source.js";
import {parseScriptureContext} from "../src/scripture/context.js";

const packets=[
 "formation-canonical-synthesis-batch1-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch2-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch3-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch6-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch7-2026-10-09.v1.json",
 "formation-crisis-sourcefirst-batch8-2026-10-09.v1.json"
];
let encountered=0,linked=0,eligiblePackets=0;
const all=new Map();
for(const filename of packets){
 const data=JSON.parse(readFileSync(new URL("../data/learn/"+filename,import.meta.url),"utf8"));
 assert.equal(data.publication_allowed,false,
   "These Formation dossier source packs are not approved public teaching: "+filename);
 assert.ok(data.dossiers.length>=10&&Array.isArray(data.source_registry));
 let count=0;
 for(const source of data.source_registry){
  encountered++;
  const bridge=formationSourceScriptureContext(source);
  if(!bridge)continue;
  count++;linked++;
  assert.equal(bridge.originalSourceUrl,source.url);
  assert.equal(bridge.interpretationCertified,false);
  assert.equal(bridge.editionCertified,false);
  assert.ok(parseScriptureContext(bridge.reference),"Shared Catholic reader must parse "+bridge.reference);
  assert.equal(formationSourceBibleMarkup(source,{french:true}).includes("Contexte"),true);
  assert.equal(formationSourceBibleMarkup(source,{french:false}).includes("Context"),true);
  assert.equal(formationSourceBibleMarkup(source).includes(source.url),false,
   "Original URL belongs to the existing external source link, never duplicate it");
  all.set(filename+":"+source.id,bridge.reference);
 }
 if(count)eligiblePackets++;
}
assert.ok(encountered>300,"Formation source inventory unexpectedly shrank");
assert.ok(linked>=25,"The existing Catholic Bible witnesses should yield a meaningful batch of safely linked passages");
assert.equal(eligiblePackets>=3,true,"This is a cross-packet integration, not one isolated case");

// Exact known source identities from distinct canonical dossier research groups.
const sample=(file,id)=>{
 const corpus=JSON.parse(readFileSync(new URL("../data/learn/"+file,import.meta.url),"utf8"));
 return corpus.source_registry.find(row=>row.id===id);
};
const phase4="formation-canonical-sourcefirst-batch4-2026-10-09.v1.json";
const phase5="formation-canonical-sourcefirst-batch5-2026-10-09.v1.json";
const phase6="formation-crisis-sourcefirst-batch6-2026-10-09.v1.json";
assert.equal(formationSourceScriptureContext(sample(phase4,"BIBLE-JN")).reference,"John 14:6–11");
assert.equal(formationSourceScriptureContext(sample(phase5,"BIBLE-1COR11")).reference,"1 Corinthians 11:23–32");
assert.equal(formationSourceScriptureContext(sample(phase5,"BIBLE-2MAC15")).reference,"2 Maccabees 15:12–16");
assert.equal(formationSourceScriptureContext(sample(phase6,"HEB8")).reference,"Hebrews 8:6–13");
// This specific source registry lists two disjoint Romans groups: no single
// contiguous passage may replace the source's original dual citation.
assert.equal(formationSourceScriptureContext(sample(phase6,"BIB-ROM11-SOURCE")),null);
assert.equal(formationSourceScriptureContext(sample(phase4,"BIBLE-COR")),null);
const failures=[
 {id:"x",url:"https://jw.org/en/bible-teachings/bible-verses/john-1-1/",locator:"v. 1"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5",locator:""},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5",locator:"vv. 27–28 and 31"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5",locator:"vv. 27–28, 30–31"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5",locator:"Luke 5:1–3"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5",locator:"Matthew 6:5–6"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/5?q=1",locator:"v. 5"},
 {id:"x",url:"https://bible.usccb.org/bible/matthew/29",locator:"v. 1"},
 {id:"x",url:"https://www.vatican.va/content/pius-xii/en/encyclicals/...",locator:"Romans 12:1"},
 {id:"x",url:"https://bible.usccb.org/bible/unknown/5",locator:"v. 1"},
];
for(const row of failures){
 assert.equal(formationSourceScriptureContext(row),null,
  "Unrelated, discontinuous, unlocated or impossible biblical sources must fail closed");
 assert.equal(formationSourceBibleMarkup(row),"");
}
const runtime=readFileSync(new URL("../src/learn/formation-recovery-review.js",import.meta.url),"utf8");
assert.match(runtime,/formationSourceBibleMarkup\(s,\{french:isFr\(win\)\}\)/);
assert.match(runtime,/const link=sourceReferenceSafeUrl\(s\?\.url\)/,
 "Source link must be derived from the original source URL through shared HTTPS validation");
assert.match(runtime,/href="'\+esc\(link\)\+'"/,
 "The original HTTPS source hyperlink must remain visible alongside the in-app Scripture reader");
console.log("PASS Formation Bible handoff: "+linked+" exact source-bound passages across "+eligiblePackets+
 " packets from "+encountered+" total source identities; other citations left external");
