import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const q=read("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");
const g=read("data/geography/seed-registry.v1.json");
const s=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const v10=read("data/geography/research/sacred-places-v10-b20-three-relic-shrines-release.v1.json");
assert.equal(q.schema,"AO_SACRED_GEOGRAPHY_WORLDWIDE_COVERAGE_R70_V1");
assert.equal(q.publication,"RESEARCH_ONLY");
assert.equal(q.rows.length,750);
assert.equal(new Set(q.rows.map(x=>x.candidate_id)).size,750);
assert.equal(q.counts.candidates,750);
assert.equal(q.counts.explicit_promoted+q.counts.text_hint_review+q.counts.unmatched,750);
assert.equal(q.counts.published_places,261,"R70 historical coverage snapshot must remain at its historical baseline");
assert.equal(q.counts.published_shrines,257,"The R70 source-coverage snapshot remains immutable");
assert.equal(q.counts.published_pilgrimages,240,"The R70 pilgrimage baseline remains immutable");
assert.equal(v10.new_places,3);
assert.equal(s.shrines.length,q.counts.published_shrines+v10.new_places);
assert.equal(s.pilgrimages.length,q.counts.published_pilgrimages+v10.new_places);
for(const row of v10.published_new){
 assert.equal(s.shrines.filter(x=>x.shrine_id===row.shrine_id&&x.place_id===row.place_id).length,1);
 assert.equal(s.pilgrimages.filter(x=>x.pilgrimage_id===row.pilgrimage_id&&x.destination_shrine_id===row.shrine_id).length,1);
}
const ids=new Set(g.places.map(x=>x.place_id));
for(const r of q.rows){
 assert.ok(["EXPLICIT_PROMOTED","TEXT_HINT_REVIEW","UNMATCHED"].includes(r.status));
 assert.equal(r.publish_approved,r.status==="EXPLICIT_PROMOTED");
 if(r.canonical_place_id)assert.ok(ids.has(r.canonical_place_id));
 else assert.equal(r.status,"UNMATCHED");
}
assert.equal(q.countries.reduce((n,c)=>n+c.candidates,0),750);
assert.equal(q.countries.reduce((n,c)=>n+c.promoted,0),q.counts.explicit_promoted);
assert.equal(q.countries.reduce((n,c)=>n+c.text_hint,0),q.counts.text_hint_review);
assert.equal(q.countries.reduce((n,c)=>n+c.unmatched,0),q.counts.unmatched);
console.log("PASS R70: reconciled 750 candidate evidence queue; zero automatic physical pin publication");
