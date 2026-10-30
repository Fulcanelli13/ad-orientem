import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createMyCustomsStore, normalizeMyCustomSchedule, myCustomMatchesDate,
  MY_CUSTOMS_STORAGE_KEY,MY_CUSTOMS_SEASONS } from "../src/customs/personal-store.js";
import { calendarCustomArticleIds } from "../src/calendar/customs-read-model.js";
import { v384Dates } from "../src/calendar/traditional-year-v384.js";

const ids=calendarCustomArticleIds();
assert.equal(ids.length,36);
assert.equal(new Set(ids).size,36);
const values=new Map();
const storage={
  getItem:key=>values.get(key)??null,
  setItem:(key,value)=>values.set(key,String(value))
};
let serial=0;
const factory=()=>createMyCustomsStore({storage,canonicalIds:ids,
  now:()=>"2026-10-21T11:40:00Z",makeId:()=>"household-test-"+(++serial)});
let store=factory();
assert.equal(store.available,true);
assert.deepEqual(store.list(),[]);
assert.deepEqual(store.onDate("2026-12-04"),[]);
const annual=store.add({origin:"personal",kind:"custom",
  title:"A family anniversary devotion",body:"Our private observance",
  note:"Household only",schedule:{kind:"annual",mmdd:"12-04"}});
assert.equal(annual.origin,"personal");
assert.deepEqual(store.onDate("2026-12-04").map(x=>x.id),[annual.id]);
assert.deepEqual(store.onDate("2027-12-04").map(x=>x.id),[annual.id]);
assert.deepEqual(store.onDate("2027-12-05"),[]);
const season=store.add({origin:"personal",kind:"prayer",title:"Advent family prayer",
  body:"Lord, grant us patience.",schedule:{kind:"season",season:"advent"}});
assert.ok(store.onDate("2026-12-01").some(x=>x.id===season.id));
assert.ok(!store.onDate("2026-12-25").some(x=>x.id===season.id));
assert.equal(store.onDate("2026-12-01").find(x=>x.id===season.id).kind,"prayer");
assert.ok(store.list().find(x=>x.id===season.id).body.includes("patience"));
const adopted=store.add({origin:"canonical",customId:"ADVT-001",note:"Use on Sundays",schedule:{kind:"none"}});
assert.equal(adopted.origin,"canonical");
assert.equal(adopted.title,"","Canonical entries cannot impersonate a historical source title");
assert.equal(adopted.body,"");
assert.ok(!store.onDate("2026-12-06").some(x=>x.id===adopted.id),"Adoption alone creates no calendar alert");
assert.throws(()=>store.add({origin:"canonical",customId:"CUST-BARBARA-BRANCHES",schedule:{kind:"none"}}),/not in published corpus/);
assert.throws(()=>store.add({origin:"canonical",customId:"ADVT-001",schedule:{kind:"none"}}),/Already saved/);
const fresh=factory();
assert.equal(fresh.list().length,3,"Persistence after reload");
assert.equal(fresh.list().find(x=>x.id===adopted.id).customId,"ADVT-001");
fresh.update(annual.id,{origin:"personal",kind:"custom",title:"Another household anniversary",
  body:"Updated by me",schedule:{kind:"annual",mmdd:"04-15"}});
assert.equal(fresh.onDate("2026-12-04").some(x=>x.id===annual.id),false);
assert.ok(fresh.onDate("2027-04-15").some(x=>x.id===annual.id));
assert.throws(()=>fresh.update(adopted.id,{origin:"personal",kind:"custom",title:"Alter source",schedule:{kind:"none"}}),/Source type/);
assert.throws(()=>normalizeMyCustomSchedule({kind:"annual",mmdd:"02-30"}),/Invalid/);
assert.throws(()=>normalizeMyCustomSchedule({kind:"season",season:"invented-time"}),/Unknown/);
assert.ok(MY_CUSTOMS_SEASONS.includes("passion"));
const palm=v384Dates(2027).palm;
assert.equal(myCustomMatchesDate({schedule:{kind:"season",season:"passion"}},palm),true);
const leap=fresh.add({origin:"personal",kind:"prayer",title:"Leap day",schedule:{kind:"annual",mmdd:"02-29"}});
assert.equal(myCustomMatchesDate(leap,"2028-02-29"),true);
assert.equal(myCustomMatchesDate(leap,"2027-02-28"),false);
assert.equal(myCustomMatchesDate(leap,"2027-02-29"),false);
assert.equal(fresh.remove(adopted.id),true);
assert.equal(fresh.list().some(x=>x.id===adopted.id),false);
assert.equal(JSON.parse(values.get(MY_CUSTOMS_STORAGE_KEY)).schema,"AO_PERSONAL_CUSTOMS_PRAYERS_V1");
const corrupted=createMyCustomsStore({storage:{getItem:()=>"{not json",setItem:()=>{}},canonicalIds:ids});
assert.equal(corrupted.available,false);
assert.throws(()=>corrupted.add({origin:"personal",kind:"custom",title:"No silent overwrite"}));
const denied=createMyCustomsStore({storage:null,canonicalIds:ids});
assert.equal(denied.available,false);
const root=new URL("../",import.meta.url);
const calendar=readFileSync(new URL("src/calendar/calendar-runtime.js",root),"utf8");
const pray=readFileSync(new URL("src/pray/presentation-runtime.js",root),"utf8");
const ui=readFileSync(new URL("src/customs/personal-ui.js",root),"utf8");
assert.match(calendar,/calendarPersonalContext\(selected\)/,"Calendar personal items are date-contextual");
assert.match(calendar,/data-cal-personal-reading/,"Personal prayer body must be readable from selected Calendar day");
assert.match(calendar,/data-cal-my-customs-open/);
assert.match(pray,/data-p435930-my-customs/);
assert.match(ui,/onChange\?\.\(\)/);
assert.match(ui,/textContent/,"Personal text rendered safely as DOM text");
assert.doesNotMatch(ui,/AO_MODULES\?\.open/,"Personal practices must not invent official prayer modules");
console.log("PASS: local-only personal customs and prayers; private provenance, 1962 year matching, dates, edit/delete, corruption and entrypoints");
