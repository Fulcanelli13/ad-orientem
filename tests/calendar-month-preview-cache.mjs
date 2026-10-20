import assert from "node:assert/strict";
import {MONTH_PREVIEW_CACHE_SCHEMA,readMonthPreview,writeMonthPreview} from "../src/calendar/month-preview-cache.js";

assert.equal(MONTH_PREVIEW_CACHE_SCHEMA,"ao-calendar-month-preview-v1");
const data=new Map();
const storage={
  getItem:key=>data.get(key)??null,
  setItem:(key,value)=>{data.set(key,value)},
};
const base=new Date(2026,8,27,12);
const rows=Array.from({length:42},(_,i)=>{
  const d=new Date(base);d.setDate(base.getDate()+i);
  const date=[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  return {date,title:"Canonical resolved date "+date,rank:"III class",colour:"White",tier:3,
    cycle:i%2?"sanctorale":"temporale",accent:"#eee",commemorationCount:0};
});
const when=Date.parse("2026-10-20T00:00:00Z");
assert.equal(writeMonthPreview(storage,"2026-10","en","resolver-a",rows.slice(0,41),{now:when}),false,"Incomplete month must not cache");
assert.equal(readMonthPreview(storage,"2026-10","en","resolver-a",{now:when}),null);
assert.equal(writeMonthPreview(storage,"2026-10","en","resolver-a",rows,{now:when}),true);
const saved=readMonthPreview(storage,"2026-10","en","resolver-a",{now:when+1000});
assert.equal(saved.size,42);
assert.equal(saved.get("2026-10-03")?.cycle,"temporale");
assert.equal(readMonthPreview(storage,"2026-10","fr","resolver-a",{now:when}),null,"Never display English preview as French");
assert.equal(readMonthPreview(storage,"2026-10","en","resolver-b",{now:when}),null,"Source revision changes invalidate cache");
assert.equal(readMonthPreview(storage,"2026-10","en","resolver-a",{now:when+15*86400000}),null,"Old previews expire");
assert.equal(writeMonthPreview(storage,"2026-10","en","resolver-a",rows.map((x,i)=>({...x,date:rows[0].date})),{now:when}),false,"Duplicate date rows are rejected");
assert.equal(writeMonthPreview({setItem:()=>{throw Error("blocked")}},"2026-10","en","resolver-a",rows,{now:when}),false,"Storage denial is nonfatal");
assert.equal(readMonthPreview({getItem:()=>{throw Error("blocked")}},"2026-10","en","resolver-a",{now:when}),null);
console.log("PASS: Month preview cache accepts only bounded, complete, language/revision-matched canonical summaries");
