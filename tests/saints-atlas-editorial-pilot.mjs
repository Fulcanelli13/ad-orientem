import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const shrineSot=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const audit=read("data/saints/legacy-shrine-name-audit-20261015.v1.json");
const pilot=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
assert.equal(audit.schema,"ao.saints.precanonical-shrine-name-audit.v1");
assert.equal(audit.scope,"RESEARCH_ONLY_NOT_APP_VISIBLE");
assert.equal(pilot.publication,"RESEARCH_ONLY_NOT_APP_VISIBLE");
assert(shrineSot.shrines.length>=audit.counts.shrine_records,"Source snapshot must not lose historical shrine records; later parallel shrine additions are allowed");
const originalEdges=shrineSot.shrines.flatMap(s=>(s.associated_saints||[]).map(name=>JSON.stringify([name,s.shrine_id,s.place_id,[...(s.source_ids||[])].sort()]))).sort();
const auditEdges=audit.mentions.flatMap(m=>m.shrine_associations.map(link=>JSON.stringify([m.name_literal,link.shrine_id,link.place_id,[...link.source_ids].sort()]))).sort();
assert.deepEqual(auditEdges,originalEdges,"Every existing name-shrine-place-source association must be preserved");
assert.equal(auditEdges.length,audit.counts.association_edges);
assert.equal(new Set(audit.mentions.map(x=>x.name_literal)).size,audit.counts.distinct_name_strings);
assert(audit.mentions.every(m=>m.identity_status==="UNRECONCILED_NAME_STRING"));
const shrineById=new Map(shrineSot.shrines.map(s=>[s.shrine_id,s]));
const seenIds=new Set();
for(const p of pilot.people){
 assert(!seenIds.has(p.saint_id),"Duplicate proposed person ID");seenIds.add(p.saint_id);
 assert(["CANONIZED_SAINT","BEATIFIED_NOT_CANONIZED"].includes(p.recognition_status));
 if(p.recognition_status==="BEATIFIED_NOT_CANONIZED")assert(p.saint_id.startsWith("blessed:"));
 assert(p.why_honoured.en.length>=55&&p.why_honoured.fr.length>=55,"Lead with why the person is holy in both languages");
 assert.equal(p.biography_facts.length,3);
 assert.deepEqual(p.biography_facts.map(f=>f.kind),["holy_witness","concrete_action","spiritual_legacy"]);
 assert(p.place_links.length>0);
 for(const fact of [p.why_honoured,...p.biography_facts]){
  assert(fact.en.length>=35&&fact.fr.length>=35&&fact.source_ids.length>0);
  for(const id of fact.source_ids)assert(pilot.sources[id]?.url?.startsWith("https://www.vatican.va/"),"Citation must resolve to recorded Holy See source");
 }
 for(const link of p.place_links){
  const shrine=shrineById.get(link.shrine_id);
  assert(shrine&&shrine.place_id===link.place_id);
  assert(shrine.associated_saints.includes(p.legacy_source_name));
  assert.deepEqual(link.source_ids,shrine.source_ids||[]);
  assert.equal(link.relation_kind,"SHRINE_ASSOCIATION_ONLY");
  assert.equal(link.coordinates,"INHERIT_EXISTING_PLACE_GEO_GATE");
 }
 assert.deepEqual(p.calendar_1962_keys,[],"Do not invent 1962 feasts");
 assert.deepEqual(p.approved_artwork_ids,[],"No unapproved art");
 assert.equal(p.publication,"EDITORIAL_REVIEW_ONLY");
}
assert.equal(pilot.people.length,6);
assert.equal(pilot.people.filter(p=>p.recognition_status==="BEATIFIED_NOT_CANONIZED").length,1);
console.log("PASS: source-preserving saint census and six holiness-first editorial pilot profiles");


const cross=read("data/saints/cross-module-source-reconciliation-20261015.v1.json");
const relicSot=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const novenaSot=read("data/pray/novena-sot.v1.json");
const relicIds=new Set(relicSot.subjects.map(x=>x.subject_id));
const novenaIds=new Set(novenaSot.novenas.map(x=>x.id));
assert.equal(cross.schema,"ao.saints.cross-module-source-reconciliation.v1");
assert.equal(cross.rows.length,audit.mentions.length);
assert.equal(cross.counts.shrine_name_strings,cross.rows.length);
assert.equal(cross.counts.shrine_source_edges,originalEdges.length);
const namesInAudit=new Set(audit.mentions.map(m=>m.name_literal));
const pilotIds=new Set(pilot.people.map(p=>p.saint_id));
const artSubjectIds=new Set();
const relicMatchedIds=new Set();
for(const row of cross.rows){
 assert(namesInAudit.has(row.legacy_name),"No invented legacy name");
 const original=audit.mentions.find(m=>m.name_literal===row.legacy_name);
 assert.deepEqual(
 row.shrine_places.map(x=>JSON.stringify([x.shrine_id,x.place_id,[...x.source_ids].sort()])).sort(),
 original.shrine_associations.map(x=>JSON.stringify([x.shrine_id,x.place_id,[...x.source_ids].sort()])).sort()
 );
 if(row.pilot_identity_id)assert(pilotIds.has(row.pilot_identity_id));
 for(const a of row.sacred_art_subjects){
  assert(/^SNT-(AP|EV|DC|OT)-\d\d$/.test(a.subject_id));
  assert.equal(a.approval,"RESEARCH_ONLY_NOT_SELECTED_FOR_SAINT_PROFILE");
  artSubjectIds.add(a.subject_id);
 }
 for(const x of row.relic_subjects){
  assert(relicIds.has(x.subject_id),"Relic crosslink not present in current canonical research corpus");
  relicMatchedIds.add(x.subject_id);
 }
 for(const n of row.novenas)assert(novenaIds.has(n.novena_id),"No invented novena target");
 for(const s of row.calendar_semantics)assert.equal(s.role,"SEMANTIC_CONTEXT_NOT_CERTIFIED_1962_OBSERVANCE");
}
assert.equal(artSubjectIds.size,cross.counts.distinct_art_subject_ids);
assert.equal(relicMatchedIds.size,cross.counts.distinct_relic_subject_ids);
assert.equal(cross.calendar_resolver_boundary.formal_feast_mapping_complete,false);
assert.equal(cross.not_in_legacy_shrine_names.sacred_art_subjects.length+artSubjectIds.size,75);
assert.equal(cross.not_in_legacy_shrine_names.relic_subjects.length+relicMatchedIds.size,relicSot.subjects.length);
assert(!cross.rows.some(x=>x.sacred_art_subjects.some(a=>a.approval==="APPROVED")||x.calendar_semantics.some(s=>s.role==="1962_RANK_VERIFIED")));
console.log("PASS: saint cross-module references, no invented feast/art/relic approvals");


const previewHtml=readFileSync(new URL("../previews/saints-map-holiness-first-20261015.html",import.meta.url),"utf8");
const previewJson=previewHtml.split('<script type="application/json" id="preview-source">')[1]?.split("</script>")[0];
assert(previewJson,"A source-embedded preview must be portable and auditable");
const preview=JSON.parse(previewJson);
// The standalone review HTML is a frozen phase-2 snapshot; the canonical
// pilot may gain *additive* typed roles without rewriting or relabeling
// earlier biography and physical Place evidence.
assert.equal(preview.people.length,pilot.people.length);
for(const oldProfile of preview.people){
  const current=pilot.people.find(p=>p.saint_id===oldProfile.saint_id);
  assert(current,"Standalone preview profile identity has disappeared");
  for(const key of ["legacy_source_name","display_name","recognition_status","why_honoured",
    "biography_facts","source_ids","place_links","calendar_1962_keys",
    "later_calendar_keys","approved_artwork_ids","image_state","publication"])
    assert.deepEqual(current[key],oldProfile[key],
      "Additive taxonomy must preserve old source-owned biography and Place: "+key+" "+current.saint_id);
  assert(oldProfile.further_reading_source_ids.every(id=>current.further_reading_source_ids.includes(id)),
    "New research must not erase previously reviewed source links");
}
assert.equal(preview.schema,"ao.saints.map-review.v1");
assert.equal(preview.people.length,6);
const geoSot=read("data/geography/seed-registry.v1.json");
const geoById=new Map(geoSot.places.map(x=>[x.place_id,x]));
const expectedPreviewIds=new Set(pilot.people.flatMap(p=>p.place_links.map(l=>l.place_id)));
assert.equal(preview.place_preview.length,expectedPreviewIds.size,"One preview coordinate record per physical place, never one invented pin per saint");
for(const loc of preview.place_preview){
 assert(expectedPreviewIds.has(loc.id));
 const source=geoById.get(loc.id);
 assert(source,"Place must exist in canonical geography registry");
 assert.equal(loc.lat,source.geo.lat);
 assert.equal(loc.lng,source.geo.lng);
 assert.equal(loc.indicative,!!source.geo.indicative_only);
 assert.equal(loc.geo_source,source.geo.source_url);
}
assert.equal(preview.place_preview.filter(p=>p.indicative).length,1);
assert(preview.place_preview.find(p=>p.id==="place:NZ:st-peter-chanel-russell")?.indicative,"Peter Chanel's indicative Russell coordinate cannot become an ordinary pin");
assert(previewHtml.includes("Artwork awaiting")||previewHtml.includes("artwork approval"),"Must clearly distinguish source-linked biographies from unapproved portrait imagery");
const jsBody=previewHtml.split('<script type="module">')[1]?.split("</script>")[0];
assert(jsBody,"Optional preview must include working client-side interactions");
new Function("return (async function(){"+jsBody+"})");
console.log("PASS: portable map preview syntax, existing place geometry, held indicative site, unchanged original profiles");
