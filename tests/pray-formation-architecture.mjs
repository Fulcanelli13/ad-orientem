import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const root=new URL("../",import.meta.url);
const load=async path=>readFile(new URL(path,root),"utf8");
const crosswalk=JSON.parse(await load("data/app/pray-formation-ia-crosswalk.2026-10-10.v1.json"));
const pray=await load("src/pray/presentation-runtime.js");
const learn=await load("src/learn/presentation.js");
const apostolate=await load("src/apostolate/browser-entry.js");
const families=pray.slice(pray.indexOf("function prayFamilies(){"),pray.indexOf("function prayFamilyDoor"));
assert.ok(families,"Prayer family source must exist");
const livePrayerIds=[...families.matchAll(/\['(?:own|external)','([^']+)',L\('/g)].map(m=>m[1]);
assert.ok(families.includes("direct:'pray.library'"),"Prayer Library direct launcher must exist");
livePrayerIds.push("pray.library");
const sourceFormation=learn.slice(learn.indexOf("export const LEARN_LAYOUT"),learn.indexOf("export const LEARN_MODULE_IDS"));
const liveFormationIds=[...sourceFormation.matchAll(/id:"(learn\.[^"]+)",type:"/g)].map(m=>m[1]);
const sources=[
"src/apostolate/corpus.js","src/apostolate/hs-corpus.js","src/apostolate/fh-corpus.js",
"src/apostolate/tf-corpus.js","src/apostolate/dv-corpus.js","src/apostolate/wc-corpus.js"
];
const scenarioIdSet=new Set(),liveEdges=[];
for(const path of sources){
  const source=await load(path);
  const segments=[...source.matchAll(/id:"((?:AQ|HS|FH|TF|DV|WC)\d\d)"/g)].map(m=>({id:m[1],index:m.index}));
  for(let i=0;i<segments.length;i++){
    const record=segments[i];
    assert.ok(!scenarioIdSet.has(record.id),"Duplicate scenario "+record.id);
    scenarioIdSet.add(record.id);
    const chunk=source.slice(record.index,i+1<segments.length?segments[i+1].index:source.length);
    for(const m of chunk.matchAll(/(?:formation|owned)\("([^"]+)","([^"]+)"/g))
      liveEdges.push("apostolate:"+record.id+"->"+m[2]);
  }
}
const sameIds=(actual,expected,label)=>{
 assert.deepEqual([...actual].sort(),[...expected].sort(),label+" IDs must match current source");
 assert.equal(new Set(expected).size,expected.length,label+" duplicated mapping");
};
sameIds(livePrayerIds,crosswalk.prayer.map(x=>x.id),"Prayer 23 entrances");
sameIds(liveFormationIds,crosswalk.formation.map(x=>x.id),"Formation 15 launchers");
sameIds(scenarioIdSet,crosswalk.apostolate.scenarios.map(x=>x.id),"Apostolate 36 scenarios");
sameIds(liveEdges,crosswalk.apostolate.handoff_edges.map(x=>x.from+"->"+x.to),"Apostolate scenario handoffs");
assert.equal(crosswalk.apostolate.skills.length,9);
assert.equal(crosswalk.cross_surface_handoff_types.length,15);
assert.equal(livePrayerIds.length,23);
assert.equal(liveFormationIds.length,15);
assert.equal(scenarioIdSet.size,36);
assert.equal(liveEdges.length,72);
const current=Object.groupBy?Object.groupBy(crosswalk.apostolate.handoff_edges,x=>x.status):crosswalk.apostolate.handoff_edges.reduce((r,x)=>(r[x.status]??=[],r[x.status].push(x),r),{});
assert.equal((current.ROUTER_EXCLUDES_CALENDAR||[]).length,2);
assert.equal((current.PRAY_TARGET_NOT_IN_PUBLIC_ROUTE_REGISTRY||[]).length,4);
assert.match(apostolate,/\["learn","pray","find","mass"\]\.includes\(surface\)/,"Apostolate Calendar exclusion has changed; reevaluate flagged findings");
assert.ok(crosswalk.navigation.formation.landing_views.some(v=>v.id==="questions"&&v.gated?.includes("learn.apologetics")));
assert.ok(crosswalk.navigation.formation.landing_views.some(v=>v.id==="questions"&&v.gated?.includes("learn.church_crisis")));
for(const x of crosswalk.prayer)assert.ok(x.primary_entrance&&x.content_owner==="pray");
for(const x of crosswalk.formation)assert.ok(x.primary_view&&x.canonical_owner);
console.log("Pray/Formation IA static parity OK: 23 Prayer, 15 Formation, 36 Apostolate, 72 scenario handoffs, 6 priority link findings");
