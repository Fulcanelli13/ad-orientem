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
// The historical 10 October crosswalk has 24 canonical entrances.
 // New Rosary & Chaplets links are discovery aliases, not a new prayer corpus.
const chapletsStart=families.indexOf("chaplets:Object.freeze(");
const chapletsEnd=families.indexOf("eucharistic:Object.freeze(",chapletsStart);
assert.ok(chapletsStart>=0&&chapletsEnd>chapletsStart,"Chaplets discovery family missing");
const chapletDiscovery=[...families.slice(chapletsStart,chapletsEnd).matchAll(/\['own','([^']+)'/g)].map(m=>m[1]);
assert.deepEqual(chapletDiscovery,["pray.rosary","pray.rosary_methods","pray.divine_mercy","pray.five_wounds","pray.precious_blood"]);
const historicalSource=families.slice(0,chapletsStart)+families.slice(chapletsEnd);
const livePrayerIds=[...historicalSource.matchAll(/\['(?:own|external)','([^']+)',L\('/g)].map(m=>m[1]);
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
sameIds(livePrayerIds,crosswalk.prayer.map(x=>x.id),"Prayer 24 historical entrances");
// 10 October audit stays immutable; P1 adds exactly one new, separate public child.
sameIds(liveFormationIds.filter(id=>id!=="learn.mass_explorer"),crosswalk.formation.map(x=>x.id),"Formation 15 historical launchers");
assert.ok(liveFormationIds.includes("learn.mass_explorer"),"New Mass Explorer must be a distinct route");
sameIds(scenarioIdSet,crosswalk.apostolate.scenarios.map(x=>x.id),"Apostolate 36 scenarios");
sameIds(liveEdges,crosswalk.apostolate.handoff_edges.map(x=>x.from+"->"+x.to),"Apostolate scenario handoffs");
assert.equal(crosswalk.apostolate.skills.length,9);
assert.equal(crosswalk.cross_surface_handoff_types.length,15);
assert.equal(livePrayerIds.length,24);
assert.equal(liveFormationIds.length,16);
assert.equal(scenarioIdSet.size,36);
assert.equal(liveEdges.length,72);
const current=Object.groupBy?Object.groupBy(crosswalk.apostolate.handoff_edges,x=>x.status):crosswalk.apostolate.handoff_edges.reduce((r,x)=>(r[x.status]??=[],r[x.status].push(x),r),{});
assert.equal((current.ROUTER_EXCLUDES_CALENDAR||[]).length,2);
assert.equal((current.PRAY_TARGET_NOT_IN_PUBLIC_ROUTE_REGISTRY||[]).length,0);
for(const id of ["apostolate:AQ01->pray.rosary","apostolate:AQ07->pray.eternal_rest","apostolate:HS05->pray.eternal_rest","apostolate:HS06->pray.eternal_rest"])
 assert.ok(liveEdges.includes(id),"Repaired source-owned Prayer handoff missing: "+id);
assert.match(apostolate,/\["learn","pray","find","mass"\]\.includes\(surface\)/,"Apostolate Calendar exclusion has changed; reevaluate flagged findings");
assert.ok(crosswalk.navigation.formation.landing_views.some(v=>v.id==="questions"&&v.gated?.includes("learn.apologetics")));
assert.ok(crosswalk.navigation.formation.landing_views.some(v=>v.id==="questions"&&v.gated?.includes("learn.church_crisis")));
for(const x of crosswalk.prayer)assert.ok(x.primary_entrance&&x.content_owner==="pray");
for(const x of crosswalk.formation)assert.ok(x.primary_view&&x.canonical_owner);
console.log("Pray/Formation IA static parity OK: 24 historical Prayer entrances + 3 Rosary/Chaplet discovery aliases, 15 legacy Formation + Mass Explorer, 36 Apostolate, 72 scenario handoffs, 2 unresolved Calendar router blocks; 4 repaired Prayer handoffs awaiting phone verification");
