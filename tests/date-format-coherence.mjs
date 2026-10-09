import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DISPLAY_DATE_FORMAT, formatDisplayDate, parseDisplayDate } from "../src/app/date-format.js";

assert.equal(DISPLAY_DATE_FORMAT,"DD/MM/YYYY");
assert.equal(formatDisplayDate("2026-10-07"),"07/10/2026");
assert.equal(formatDisplayDate("2026-01-02"),"02/01/2026");
assert.equal(formatDisplayDate(new Date(2026,9,7,12)),"07/10/2026");
assert.equal(formatDisplayDate("7/10/2026"),"07/10/2026");
assert.equal(parseDisplayDate("07/10/2026"),"2026-10-07");
assert.equal(parseDisplayDate("7-10-2026"),"2026-10-07");
assert.equal(parseDisplayDate("31/02/2026"),null);

const read=path=>readFile(new URL("../"+path,import.meta.url),"utf8");
const readCalendarDateOwner=async()=>{
  const entry=await read("src/calendar/browser-entry.js");
  if(!entry.includes('import("./calendar-runtime.js")'))return entry;
  assert.match(entry,/ensureCalendarRuntime/);
  return read("src/calendar/calendar-runtime.js");
};
const [app,home,enrichers,calendar,learn,pray,novenas]=await Promise.all([
  read("src/app/browser-entry.js"),
  read("src/home/presentation.js"),
  read("src/home/enrichers.js"),
  readCalendarDateOwner(),
  read("src/learn/presentation.js"),
  read("src/pray/presentation-runtime.js"),
  read("src/pray/novena-runtime.js"),
]);

assert.match(app,/installDateFormat\(globalThis\)/);
assert.match(home,/formatDisplayDate\(date\)/);
assert.match(home,/resume\.date\?formatDisplayDate\(resume\.date\)/);
assert.match(enrichers,/formatDisplayDate\(best\.d\)/);
assert.match(calendar,/const longDate=id=>displayDate\(id\)/);
assert.match(calendar,/const shortDate=id=>displayDate\(id\)/);
assert.match(calendar,/Date in DD\/MM\/YYYY format/);
assert.match(learn,/rawDate\?formatDisplayDate\(rawDate\)/);
assert.match(pray,/formatDisplayDate\(d\)/);
assert.match(pray,/placeholder="DD\/MM\/YYYY"/);
assert.doesNotMatch(pray,/type="date" data-p435930-fs-confession/);
assert.match(novenas,/function fmt\(d\)\{return formatDisplayDate\(d\)\}/);

for(const [name,source] of [["home",home],["calendar",calendar],["learn",learn],["pray",pray],["novenas",novenas]]){
  assert.doesNotMatch(source,/day:['"](?:numeric|2-digit)['"],month:['"]long['"],year:['"]numeric['"]/,`${name} reintroduced a prose-style full date instead of DD/MM/YYYY`);
}

console.log("Canonical user-visible date format DD/MM/YYYY: OK");
