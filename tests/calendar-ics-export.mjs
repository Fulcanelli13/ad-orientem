import assert from "node:assert/strict";
import {serialize1962CalendarMonth,calendarMonthIcsFilename} from "../src/calendar/export-ics.js";

const encoder=new TextEncoder();
const resolved=(date,{title="Saint Théodore, évêque; et martyr — Dominica longa",language="en",status="ready",withProper=true}={})=>({
  status,date,day:{main:{title,rank:"III class",color:"White"},commemorations:[{title:"Saint Agnès, vierge",titleFr:"Sainte Agnès, vierge"}]},
  proper:{status:withProper?"ready":"unavailable",data:withProper?{
    name:title,nameFr:"Saint Théodore, évêque; martyr — fête d’épreuve",rank:"III class",
    color:"White",sourcePath:"Sancti/01-15",
  }:null},
  colourPlan:{primary:"White",massColor:"White"}
});
const month=(id,options={})=>{
  const [y,m]=id.split("-").map(Number);
  const n=new Date(Date.UTC(y,m,0)).getUTCDate();
  return Array.from({length:n},(_,i)=>resolved(id+"-"+String(i+1).padStart(2,"0"),options));
};
const fixtureTime=new Date("2026-10-09T12:40:00Z");
const eng=serialize1962CalendarMonth("2026-10",month("2026-10"),{language:"en",now:fixtureTime});
assert.match(eng,/^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/);
assert.match(eng,/DTSTAMP:20261009T124000Z/);
assert.equal((eng.match(/BEGIN:VEVENT/g)||[]).length,31);
assert.equal((eng.match(/END:VEVENT/g)||[]).length,31);
assert.match(eng,/DTSTART;VALUE=DATE:20261001\r\nDTEND;VALUE=DATE:20261002/);
assert.match(eng,/DTSTART;VALUE=DATE:20261031\r\nDTEND;VALUE=DATE:20261101/);
assert.equal(calendarMonthIcsFilename("2026-10"),"ad-orientem-1962-2026-10.ics");
assert.doesNotMatch(eng,/\b(?:DTSTART:2026|TZID=|LOCATION:|RRULE:|VALARM)\b/);
assert.match(eng,/not a Mass schedule/);
assert.doesNotMatch(eng,/(?<!\r)\n/,"iCalendar must use CRLF");
const lines=eng.split("\r\n").filter(Boolean);
assert.ok(lines.every(x=>encoder.encode(x).length<=75),"RFC5545 line must not exceed 75 UTF-8 octets");
const unfolded=eng.replace(/\r\n[ \t]/g,"");
assert.match(unfolded,/SUMMARY:Saint Théodore\\, évêque\\; et martyr/);
assert.match(unfolded,/Commemorations: Saint Agnès\\, vierge/);
assert.match(unfolded,/UID:ao-1962-general-20261007@calendar\.invalid/);

const french=serialize1962CalendarMonth("2028-02",month("2028-02"),{language:"fr",now:fixtureTime});
assert.equal((french.match(/BEGIN:VEVENT/g)||[]).length,29);
assert.match(french,/DTSTART;VALUE=DATE:20280229\r\nDTEND;VALUE=DATE:20280301/);
assert.match(french.replace(/\r\n[ \t]/g,""),/SUMMARY:Saint Théodore\\, évêque\\; martyr/);
assert.match(french.replace(/\r\n[ \t]/g,""),/Commémorations : Sainte Agnès\\, vierge/);
assert.ok(french.split("\r\n").filter(Boolean).every(x=>encoder.encode(x).length<=75));

assert.equal((serialize1962CalendarMonth("2027-02",month("2027-02"),{now:fixtureTime}).match(/BEGIN:VEVENT/g)||[]).length,28);
for(const [why,modify] of [
  ["missing day",rows=>rows.pop()],
  ["failed day",rows=>rows[5].status="failed"],
  ["missing Proper",rows=>{rows[7].proper.status="unavailable";rows[7].proper.data=null}],
  ["wrong date",rows=>rows[1].date="2026-11-02"],
  ["duplicate",rows=>rows[1].date=rows[0].date],
  ["missing rank",rows=>{rows[0].proper.data.rank="";rows[0].day.main.rank=""}],
]){
  const rows=month("2026-10");modify(rows);
  assert.throws(()=>serialize1962CalendarMonth("2026-10",rows),undefined,why);
}
assert.throws(()=>serialize1962CalendarMonth("2026-13",month("2026-10")));
assert.throws(()=>serialize1962CalendarMonth("2026-10",month("2026-10"),{language:"la"}));
console.log("PASS 1962 all-day monthly .ics: 31/29/28 entries, UTF-8 line folding, EN/FR, exclusive DTEND, stable UIDs, fail-closed partials");
