import assert from "node:assert/strict";
import { massCalendarPreflightContext } from "../src/mass/calendar-preflight-context.js";
const mass={
 date:"2026-10-11",canStart:true,
 celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",celebrationType:"CALENDAR",
 calendarDay:{id:"TEMP.XX",title:"XX Sunday after Pentecost",rank:"II class"},
 proper:{data:{name:"XX Sunday after Pentecost",color:"Green",
  gospel:{reference:"John 4:46–53",lat:"Long Gospel text must never replace its reference"}}}
};
const calendar={
 selectedDate:"2026-10-11",resolving:false,
 resolution:{date:"2026-10-11",status:"ready",
  day:{main:{id:"tempora:XX",title:"XX Sunday after Pentecost",rank:"II class",color:"Green"}},
  proper:{status:"ready",data:{name:"XX Sunday after Pentecost",color:"Green"}},
  colourPlan:{massColor:"Green"}
 }
};
const original=JSON.stringify({mass,calendar});
const normal=massCalendarPreflightContext(mass,calendar,"en");
assert.equal(normal.date,"2026-10-11");
assert.equal(normal.calendar.source,"1962_RESOLVER");
assert.equal(normal.calendar.title,"XX Sunday after Pentecost");
assert.equal(normal.calendar.rank,"II class");
assert.equal(normal.calendar.colour,"Green");
assert.equal(normal.actual.title,"XX Sunday after Pentecost");
assert.equal(normal.actual.colour,"Green");
assert.equal(normal.actual.gospel,"John 4:46–53");
assert.equal(normal.actual.kind,"CALENDAR");
assert.equal(normal.differs,false);
assert.equal(normal.openable,true);
assert.equal(normal.season,"After Pentecost");
const french=massCalendarPreflightContext(mass,calendar,"fr");
assert.equal(french.fr,true);
assert.ok(french.season.includes("Pentecôte"));
const votive={...mass,celebrationId:"holy_rosary",requestedCelebrationId:"holy_rosary",
 celebrationType:"VOTIVE",celebrationTitle:"Our Lady of the Holy Rosary",
 proper:{data:{name:"Our Lady of the Holy Rosary",color:"White",gospel:{reference:"Luke 1:26–38"}}}};
const chosen=massCalendarPreflightContext(votive,calendar,"en");
assert.equal(chosen.calendar.title,"XX Sunday after Pentecost");
assert.equal(chosen.calendar.colour,"Green");
assert.equal(chosen.actual.title,"Our Lady of the Holy Rosary");
assert.equal(chosen.actual.colour,"White");
assert.equal(chosen.actual.gospel,"Luke 1:26–38");
assert.equal(chosen.differs,true);
assert.equal(chosen.actual.kind,"VOTIVE");
const alternate={...votive,date:"2026-10-11",
 sourceDiagnostics:{actualMassSelection:"OBSERVED_SOURCE_DAY",actualMassSourceDate:"2026-10-07"}};
const other=massCalendarPreflightContext(alternate,calendar);
assert.equal(other.date,"2026-10-11","Real Mass date must not change to source feast date");
assert.equal(other.sourceDate,"2026-10-07");
assert.equal(other.calendar.title,normal.calendar.title,"Calendar must not display selected votive as observed Sunday");
const req={...mass,celebrationId:"requiem",celebrationType:"REQUIEM",
 celebrationTitle:"Requiem",proper:{data:{name:"Requiem",color:"Black"}}};
const requiem=massCalendarPreflightContext(req,calendar);
assert.equal(requiem.calendar.colour,"Green");
assert.equal(requiem.actual.colour,"Black");
assert.equal(requiem.actual.kind,"REQUIEM");
const stale={...calendar,selectedDate:"2026-10-10"};
const staleResult=massCalendarPreflightContext(votive,stale);
assert.equal(staleResult.calendar.source,"MASS_HOST_CALENDAR");
assert.equal(staleResult.calendar.colour,null);
assert.equal(staleResult.openable,false);
const wrong={...calendar,resolution:{...calendar.resolution,date:"2026-10-10"}};
assert.equal(massCalendarPreflightContext(votive,wrong).calendar.source,"MASS_HOST_CALENDAR");
const loading={...calendar,resolving:true};
assert.equal(massCalendarPreflightContext(votive,loading).calendar.source,"MASS_HOST_CALENDAR");
const absent=massCalendarPreflightContext({...votive,calendarDay:null},stale);
assert.equal(absent.calendar.source,"PENDING");
assert.equal(absent.calendar.title,null);
assert.equal(absent.actual.colour,"White");
const distinct=massCalendarPreflightContext({...mass,exceptionalProfile:"good-friday-1962",
 celebrationTitle:"Good Friday liturgy",proper:{data:{color:"Black"}}},calendar);
assert.equal(distinct.actual.kind,"GOOD_FRIDAY");
assert.equal(distinct.differs,true,"Good Friday is not a generic Calendar Mass");
assert.equal(JSON.stringify({mass,calendar}),original,"Projection must be read-only");
console.log("PASS Mass liturgical context: day/selected Proper distinct, 1962 resolver, votive, Requiem, alternative source, FR, stale locks");
