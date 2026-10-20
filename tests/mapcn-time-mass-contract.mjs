import assert from "node:assert/strict";
import {test} from "node:test";
import {buildTimeMassBoard,validTimeMassDate} from "../src/find/mapcn-time-mass-board.js";
import {renderTimeMassPanel} from "../src/find/mapcn-time-mass-presentation.js";

const sample=(id,raw,verification={},source=true)=>({
 kind:"TLM_VENUE",source_id:id,title:"Chapel "+id,subtitle:"Port Louis · MU",
 eyebrow:"ICKSP",geo:{lat:-20,lng:57,approximate:true},
 raw:{venue:{venue_id:id,contact:{schedule_url:["https://example.org/chapel"]}},
  sources:source?[{source_id:"src:"+id,title:"Institute timetable",url:"https://example.org/timetable",
    authority:"PRIMARY",source_type:"COMMUNITY_OFFICIAL"}]:[],
  ministries:[{schedules:raw==null?[]:[{service_type:"MASS",payload:{raw},
    source_ids:source?["src:"+id]:[],verification}]}]},
 source_links:[{title:"Venue source",url:"https://example.org/chapel"}],
});
const verified={state:"OFFICIAL_VERIFIED",checked_at:"2026-10-10T00:00:00Z",review_due_at:"2026-12-01T23:59:59Z"};
const stale={state:"OFFICIAL_VERIFIED",checked_at:"2026-01-01T00:00:00Z",review_due_at:"2026-02-01T23:59:59Z"};
const projection={byLens:{tlm:[
 sample("within","Sundays 09:00; holidays consult bulletin",verified),
 sample("overdue","Sundays 10:00",stale),
 sample("uncertain","First Friday after notice",{state:"UNKNOWN"},false),
 sample("listed",null,{},false)
]}};
const board=(options={})=>buildTimeMassBoard({projection,asOf:"2026-10-21",date:"2026-10-21",...options});
test("Time & Mass uses only joined canonical directory records, never synthesized services",()=>{
 const m=board();
 assert.equal(m.total,4);
 assert.equal(m.matched,4);
 assert.equal(m.counts.SOURCE_REVIEW_CURRENT,1);
 assert.equal(m.counts.REVIEW_DUE,1);
 assert.equal(m.counts.RAW_UNCONFIRMED,1);
 assert.equal(m.counts.LISTING_ONLY,1);
 assert.equal(m.authoritativeDay,false);
 assert.equal(m.computedNextMass,false);
 const current=m.rows.find(x=>x.id==="within");
 assert.match(current.raw,/consult bulletin/);
 assert.equal(current.source.url,"https://example.org/timetable");
 assert.equal(current.source.exact,true);
 assert.equal(current.indicative,true);
 assert.ok(!("nextMass" in current)&&!("openNow" in current));
});
test("Date drives 1962 season but never filters by a supposed Mass occurrence",()=>{
 const oct=board(),dec=board({date:"2026-12-25"});
 assert.notEqual(oct.season,dec.season);
 assert.equal(dec.season,"Christmas");
 assert.equal(oct.matched,dec.matched);
 assert.equal(dec.rows.find(x=>x.id==="within").raw,oct.rows.find(x=>x.id==="within").raw);
 assert.equal(dec.authoritativeDay,false);
});
test("Search and evidence selectors operate on source-owned fields",()=>{
 assert.equal(board({query:"Port Louis"}).matched,4);
 assert.equal(board({query:"ICKSP",evidence:"REVIEW_DUE"}).matched,1);
 assert.equal(board({query:"not found"}).matched,0);
 assert.equal(board({evidence:"LISTING_ONLY"}).matched,1);
});
test("Invalid calendar dates fail closed",()=>{
 assert.equal(validTimeMassDate("2026-02-30"),false);
 assert.equal(validTimeMassDate("2026-12-25"),true);
 assert.throws(()=>board({date:"2030-02-31"}));
});
test("Bilingual UI and source attribution retained; no availability claims",()=>{
 const m=board(),html=renderTimeMassPanel({board:m,language:"en",filters:{timeMassEvidence:"ALL"}});
 assert.match(html,/data-explore-time-mass-panel/);
 assert.match(html,/type="date"/);
 assert.match(html,/Read supporting schedule source/);
 assert.match(html,/Sundays 09:00; holidays consult bulletin/);
 assert.match(html,/not promises that Mass is celebrated today/);
 assert.doesNotMatch(html,/data-explore-time-mass-next|open-now|NEXT MASS/);
 const french=renderTimeMassPanel({board:board({language:"fr"}),language:"fr"});
 assert.match(french,/Temps liturgique et messes/);
 assert.match(french,/Aucune source|Consulter la source/);
});
test("Untrusted schedule prose cannot inject HTML or attributes",()=>{
 const evil=sample("evil",'<img src=x onerror=alert(1)>',verified);
 const m=buildTimeMassBoard({projection:{byLens:{tlm:[evil]}},asOf:"2026-10-21",date:"2026-10-21"});
 const html=renderTimeMassPanel({board:m});
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.match(html,/&lt;img src=x onerror=alert\(1\)&gt;/);
});
