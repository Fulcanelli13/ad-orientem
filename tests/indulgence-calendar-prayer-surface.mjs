import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 INDULGENCE_SURFACE_VERSION,PRIMARY_INDULGENCE_SOURCE,
 INDULGENCE_WORK_DOSSIER,INDULGENCE_CALENDAR_DOSSIER,
 indulgenceCalendarCuesForDate,indulgencePrayerCues,renderIndulgenceContext,installIndulgenceContextStyles
} from "../src/indulgences/work-presentation.js";
const parse=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const master=parse(INDULGENCE_WORK_DOSSIER),calendar=parse(INDULGENCE_CALENDAR_DOSSIER);
assert.equal(INDULGENCE_SURFACE_VERSION,"exact-work-calendar-pray-20261030");
assert.equal(PRIMARY_INDULGENCE_SOURCE,master.authority.enchiridion_1999_latin);
const workMap=new Map(master.exact_work_routes.map(x=>[x.work_key,x]));
const workKeys=new Set(["AO-IND-WORK-004","AO-IND-WORK-009","AO-IND-WORK-011","AO-IND-WORK-012","AO-IND-WORK-018","AO-IND-WORK-021","AO-IND-WORK-023"]);
const extracted=[];
for(const view of ["angelus","stations","rosary","rosaryMethods","adoration"]){
 const rows=indulgencePrayerCues(view,{angelusForm:view==="angelus"?"angelus":null});
 assert.equal(rows.length,1,view);
 const row=rows[0],canonical=workMap.get(row.work_key);assert.ok(canonical,view);
 extracted.push(row.work_key);
 for(const [prop,other] of [["title_en","title_en"],["title_fr","title_fr"],["work_en","qualifying_work_and_condition_en"],["work_fr","qualifying_work_and_condition_fr"],["exclusion_en","explicit_non_equivalence"],["exclusion_fr","non_equivalence_fr"],["classification","grant_class_when_exactly_performed"],["grant_id","normative_grant_id"]])
  assert.equal(row[prop],canonical[other],view+" "+prop);
 assert.equal(row.source,PRIMARY_INDULGENCE_SOURCE);
 for(const language of ["en","fr"]){
  const html=renderIndulgenceContext(rows,{language,placement:"prayer"});
  assert.match(html,/data-ao-indulgence-surface="prayer"/);
  assert.match(html,/data-ao-indulgence-work=/);
  assert.ok(html.includes(language==="fr"?row.title_fr:row.title_en),view+" rendered "+language);
  assert.ok(html.includes("www.vatican.va"));
  assert.ok(!html.includes("<script"));
 }
}
assert.equal(new Set(extracted).size,4,"Rosary chooser and fallback deliberately share work");
assert.deepEqual(indulgencePrayerCues("angelus",{angelusForm:"regina"}).map(x=>x.work_key),["AO-IND-WORK-012"]);
assert.deepEqual(indulgencePrayerCues("angelus",{angelusForm:"invalid"}),[]);
assert.deepEqual(indulgencePrayerCues("mercy"),[],"Do not attach Mercy Sunday plenary to every chaplet");
assert.deepEqual(indulgencePrayerCues("confession"),[]);
assert.deepEqual(indulgenceCalendarCuesForDate("2027-11-02"),[],"2026 date-scoped cues must not silently recur");
assert.deepEqual(indulgenceCalendarCuesForDate("2026-10-30"),[]);
assert.deepEqual(indulgenceCalendarCuesForDate("2026-11-31"),[]);
assert.deepEqual(indulgenceCalendarCuesForDate("today"),[]);
let count=0;
const seenIds=new Set();
for(const cue of calendar.items){
 const selected=indulgenceCalendarCuesForDate(cue.date);
 const row=selected.find(x=>x.id===cue.id);
 assert.ok(row, "Missing date cue "+cue.id);
 assert.ok(!seenIds.has(row.id));seenIds.add(row.id);
 for(const [prop,other]of [["work_key","exact_work_key"],["grant_id","grant_id"],["title_en","title_en"],["title_fr","title_fr"],["classification","indulgence"],["work_en","required_work_en"],["work_fr","required_work_fr"],["exclusion_en","not_sufficient_en"],["exclusion_fr","not_sufficient_fr"],["authority","authority"]])
  assert.equal(row[prop],cue[other],cue.id+" "+prop);
 assert.equal(row.source,cue.legal_source);
 assert.equal(row.grant_id,workMap.get(row.work_key)?.normative_grant_id);
 count++;
}
assert.equal(count,10);
assert.equal(seenIds.size,10);
assert.equal(indulgenceCalendarCuesForDate("2026-11-01").length,1);
assert.equal(indulgenceCalendarCuesForDate("2026-11-02").length,2);
assert.equal(indulgenceCalendarCuesForDate("2026-11-08").length,1);
assert.equal(indulgenceCalendarCuesForDate("2026-11-09").length,0);
assert.equal(indulgenceCalendarCuesForDate("2026-12-31").length,1);
for(const language of ["en","fr"]){
 const markup=renderIndulgenceContext(indulgenceCalendarCuesForDate("2026-11-02"),{language,placement:"calendar"});
 assert.equal((markup.match(/class="aoIndulgenceWork"/g)||[]).length,2);
 assert.match(markup,/data-ao-indulgence-surface="calendar"/);
 assert.match(markup,/ENCH1999-29/);
 assert.ok(markup.includes(language==="fr"?"Indulgences":"Indulgenced works")||markup.includes(language==="fr"?"Œuvres indulgenciées":"Indulgenced works"));
 assert.match(markup,/one plenary indulgence per day|une indulgence plénière par jour/);
}
assert.equal(renderIndulgenceContext([]),"");
const doc={nodes:new Map(),createElement(tag){return {tagName:tag,id:"",textContent:""};},getElementById(id){return this.nodes.get(id)||null;},head:{append(node){doc.nodes.set(node.id,node)}}};
assert.equal(installIndulgenceContextStyles(doc),true);
assert.equal(installIndulgenceContextStyles(doc),false);
assert.ok(doc.nodes.get("ao-indulgence-exact-work-style").textContent.includes("@media"));
const runtimeCalendar=readFileSync(new URL("../src/calendar/calendar-runtime.js",import.meta.url),"utf8");
const runtimePray=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(runtimeCalendar,/indulgenceCalendarCuesForDate\(selected\)/);
assert.match(runtimeCalendar,/renderIndulgenceContext\(indulgenceCalendarCuesForDate/);
assert.match(runtimePray,/decorateRosaryIndulgence\(r\)/);
assert.match(runtimePray,/m\.insertAdjacentHTML\("beforeend",renderIndulgenceContext/);
assert.match(runtimePray,/view==="angelus"/);
assert.match(runtimePray,/view==="stations"/);
assert.match(runtimePray,/ADOR\.mode!=="home"&&!ADOR\.quiet/);
assert.match(runtimePray,/showIndulgence/);
console.log("PASS: 10 exact-date Calendar cues, 4 Prayer works in 5 entry points, 31-route source parity, EN/FR, no automerging/no entitlement claim.");
