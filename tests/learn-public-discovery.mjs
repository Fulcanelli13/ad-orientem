import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {LEARN_LAYOUT,LEARN_MODULE_IDS,renderLearnPresentation,learnDiscoveryMarkup} from "../src/learn/presentation.js";
import {searchDiscovery,normalizeDiscovery,DISCOVERY_SURFACES,loadReferenceDiscovery,loadFormationContentDiscovery} from "../src/learn/discovery.js";

const raw=JSON.parse(readFileSync("data/app/public-reference-discovery.v1.json","utf8"));
assert.equal(raw.schema,"AO_PUBLIC_REFERENCE_DISCOVERY_V1");
assert.equal(raw.entries.length,880);
const kinds=raw.entries.reduce((a,x)=>(a[x.kind]=(a[x.kind]||0)+1,a),{});
assert.deepEqual(kinds,{concept:450,lexeme:350,phrase:80});
assert.equal(new Set(raw.entries.map(x=>x.id)).size,880);
for(const record of raw.entries){
 assert.ok(existsSync(record.source),"Missing original Glossary source "+record.id);
 const original=JSON.parse(readFileSync(record.source,"utf8"));
 const item=(original.entries??original.items)?.[record.source_index];
 assert.equal(item?.id,record.id,"stale or misindexed Glossary record: "+record.id);
}
assert.equal(LEARN_MODULE_IDS.length,15);
const q=(text,limit=25)=>searchDiscovery(text,{sections:LEARN_LAYOUT.sections,referenceEntries:raw.entries,limit});
const term=q("grâce");
assert.ok(term.some(x=>x.kind==="reference"&&x.id==="G001"),"French accented doctrine must reach the original concept");
assert.ok(q("gratia").some(x=>x.id==="G001"),"Latin spelling must find original concept");
assert.ok(q("gRaCe").some(x=>x.id==="G001"),"English mixed case must resolve");
assert.ok(q("rosaIrE").some(x=>x.kind==="surface"&&x.id==="pray"),"Rosary must lead to canonical Pray destination");
assert.ok(q("first communion").some(x=>x.kind==="module"&&x.id==="learn.rites.first_communion"));
assert.ok(q("catéchisme").some(x=>x.kind==="module"&&x.id==="learn.catechism"));
assert.ok(q("mariage").some(x=>x.kind==="module"&&x.id==="learn.rites.matrimony"));
assert.ok(q("liturgie").some(x=>x.kind==="family"&&x.id==="liturgy-tradition"));
assert.ok(q("sanctuaire").some(x=>x.kind==="surface"&&x.id==="find"));
assert.ok(q("adoration").some(x=>x.kind==="surface"&&x.id==="pray"));
assert.equal(normalizeDiscovery("Æther Œuvre Grâce"),"aether oeuvre grace");
assert.equal(q("x").length,0,"short queries should not open a broad unhelpful results list");
const disallowed=["learn.apologetics","learn.church_crisis","learn.catholic_life","learn.seasonal_rites"];
for(const keyword of ["apologetics","sedevacantism","modernism","church crisis","troisième secret de Fatima"]){
 assert.ok(!q(keyword).some(x=>disallowed.includes(x.id)),keyword+" would expose unpublished dossiers");
}
for(const r of DISCOVERY_SURFACES) assert.ok(["home","mass","pray","calendar","find","apostolate"].includes(r.id));
const fakeWin={document:{getElementById:()=>null}};
const state={language:"en",selectedDate:"",resolution:null};
const mock={dataset:{},lang:"",innerHTML:""};
assert.equal(renderLearnPresentation(mock,state,fakeWin,{discoveryQuery:"gratia",referenceEntries:raw.entries,referenceStatus:"ready"}),true);
assert.match(mock.innerHTML,/data-ao-learn-discovery-search/);
assert.match(mock.innerHTML,/data-ao-learn-reference-id="G001"/);
assert.match(mock.innerHTML,/data-ao-learn-reference-kind="concept"/);
assert.match(mock.innerHTML,/data-ao-learn-module="learn.glossary"/);
assert.ok(!mock.innerHTML.includes('data-ao-learn-module="learn.apologetics"'));
const french={...state,language:"fr"};
const html=learnDiscoveryMarkup(french,fakeWin,{query:"grâce",referenceEntries:raw.entries,referenceStatus:"ready"});
assert.match(html,/Grâce/);
assert.match(html,/Définition/);
assert.match(html,/data-ao-learn-reference-id="G001"/);
const hostile=learnDiscoveryMarkup(state,fakeWin,{query:'"><img onerror=alert(1)>',referenceEntries:raw.entries,referenceStatus:"ready"});
assert.doesNotMatch(hostile,/<img/);
assert.ok(mock.innerHTML.length<65000,"search must not render 880 results at once");
let requested=0;
const loaded=await loadReferenceDiscovery({fetch:async url=>{requested++;assert.ok(String(url).includes("/data/app/public-reference-discovery.v1.json"));return{ok:true,json:async()=>raw};}});
assert.equal(loaded.length,880);
assert.equal(requested,1);
const again=await loadReferenceDiscovery({fetch:async()=>{throw Error("duplicate fetch") }});
assert.equal(again,loaded);
const owner=readFileSync("src/learn/browser-entry.js","utf8");
assert.match(owner,/open\(\{origin:"learn",[\s\S]*opts\?\.entryId/);
assert.match(owner,/opts\?\.lexemeId/);
assert.match(owner,/opts\?\.phraseId/);
assert.match(owner,/state\.discoveryQuery/);
assert.match(owner,/\["home","mass","pray","calendar","find","apostolate"\]/);
assert.doesNotMatch(owner,/LEARN_MODULE_IDS\.push/);

const content=JSON.parse(readFileSync("data/app/formation-discovery-content.v1.json","utf8"));
assert.equal(content.schema,"AO_FORMATION_DISCOVERY_CONTENT_V1");
assert.equal(content.entries.length,687);
assert.deepEqual(content.counts,{topic:50,question:150,spiritual:14,latin:40,catechism:433});
assert.equal(new Set(content.entries.map(row=>row.id)).size,687,"Formation discovery duplicates a content owner");
const cq=text=>searchDiscovery(text,{sections:LEARN_LAYOUT.sections,referenceEntries:raw.entries,
  contentEntries:content.entries,limit:40});
for(const [term,id,kind] of [["CSE123","CSE123","question"],["SEX-CORE-35","SEX-CORE-35","topic"],
  ["SL01","SL01","spiritual"],["latin:40","latin:40","latin"],["PX1912-Q001","PX1912-Q001","catechism"],["PX1912-Q433","PX1912-Q433","catechism"]]){
 assert.ok(cq(term).some(row=>row.kind==="content"&&row.id===id&&row.contentKind===kind),
   "Missing direct canonical search destination "+id);
}
assert.ok(cq("vie intérieure").some(row=>row.id==="SL01"),"French spiritual lesson search failed");
assert.ok(cq("contraception").some(row=>row.id==="SEX-CORE-17"),"Sexual Ethics topic search failed");
assert.equal(content.entries.some(row=>/^(?:APOL-|CR-)/.test(row.id)),false,
  "Unapproved 141-dossier research must not enter global discovery index");
const searchHtml=learnDiscoveryMarkup(state,fakeWin,{query:"CSE123",referenceEntries:raw.entries,
  referenceStatus:"ready",contentEntries:content.entries,contentStatus:"ready"});
assert.match(searchHtml,/data-ao-learn-content-id="CSE123"/);
assert.match(searchHtml,/data-ao-learn-content-kind="question"/);
assert.match(searchHtml,/data-ao-learn-module="learn.sexual_ethics"/);

const nativeWitness=JSON.parse(readFileSync("data/learn/ltfaith-pius-x-en-witness-index.v1.json","utf8"));
const guided=JSON.parse(readFileSync("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json","utf8"));
assert.equal(nativeWitness.entries.length,433);
assert.equal(guided.lessons.length,55);
const owners=new Map(guided.lessons.flatMap(l=>l.primaryCatechismQuestionNumbers.map(n=>[n,l])));
assert.equal(owners.size,433);
const indexedCatechism=content.entries.filter(x=>x.kind==="catechism");
assert.equal(indexedCatechism.length,433);
for(const witness of nativeWitness.entries){
 const item=indexedCatechism.find(x=>x.questionNumber===witness.q);
 assert.ok(item,"Missing native Catechism question "+witness.q);
 assert.equal(item.route,"learn.catechism");
 assert.equal(item.id,"PX1912-Q"+String(witness.q).padStart(3,"0"));
 assert.equal(item.title[0],witness.q_stem,"Catechism question text differs from pinned English witness");
 assert.equal(item.title[1],witness.q_stem,"French original must not be invented from an English witness");
 assert.equal(item.titleLanguage,"en","Missing honest witness-language provenance");
 assert.equal(item.lessonRef,owners.get(witness.q)?.displayLessonId);
 assert.ok(item.terms.includes(owners.get(witness.q)?.title?.fr),"French study-family keyword missing");
}
assert.equal(content.entries.some(x=>x.id.startsWith("LTF-")),false,
 "Uncertified 55-lesson guided Catechism must not be published through discovery");
assert.ok(cq("question 433").some(x=>x.id==="PX1912-Q433"));
assert.ok(cq("création").every(x=>x.kind!=="content"||x.contentKind!=="catechism"||x.titleLanguage!=="fr"),
 "Search should not claim translated question text");
const catechismMarkup=learnDiscoveryMarkup(french,fakeWin,{query:"PX1912-Q433",referenceEntries:raw.entries,
 referenceStatus:"ready",contentEntries:content.entries,contentStatus:"ready"});
assert.match(catechismMarkup,/data-ao-learn-content-id="PX1912-Q433"/);
assert.match(catechismMarkup,/data-ao-learn-module="learn.catechism"/);
assert.match(catechismMarkup,/titre anglais/);

let contentRequests=0;
const loadedContent=await loadFormationContentDiscovery({fetch:async url=>{
 contentRequests++;
 assert.ok(String(url).includes("/data/app/formation-discovery-content.v1.json"));
 return {ok:true,json:async()=>content};
}});
assert.equal(loadedContent.length,687);
assert.equal(contentRequests,1);
assert.equal(await loadFormationContentDiscovery({fetch:async()=>{throw Error("content refetch");}}),loadedContent);
const ownerDeep=readFileSync("src/learn/browser-entry.js","utf8");
assert.match(ownerDeep,/registry\.open\(id,opts\)/,"Module launch drops search deep-link options");
assert.match(ownerDeep,/contentKind==="spiritual"/);
assert.match(ownerDeep,/contentKind==="question"/);
assert.match(ownerDeep,/contentKind==="catechism"/);
assert.match(ownerDeep,/openNativeCatechismQuestion/);
assert.match(ownerDeep,/opts\?\.lessonNumber/);
console.log("PASS 15 Formation launchers, 880 Glossary references, 687 search entries including 433 native Catechism questions; unpublished guided lessons remain gated");

