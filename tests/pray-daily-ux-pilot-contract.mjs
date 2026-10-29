import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {guidedDailyCards} from "../src/pray/guided-daily-cards.js";
import {dailyUxPilotEnabled,renderDailyUxModes,renderDailyUxContinuous,renderDailyBookPills,renderDailyReaderOptions,DAILY_BOOK_FAMILY_RELEASE,DAILY_UX_PILOT_SCHEMA} from "../src/pray/daily-ux-pilot.js";
const L=(en)=>en;
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
assert.equal(DAILY_UX_PILOT_SCHEMA,"ao-daily-ux-pilot-v1");
assert.equal(dailyUxPilotEnabled(""),false);
assert.equal(dailyUxPilotEnabled("?aoDailyUxPilot=1"),true);
assert.equal(dailyUxPilotEnabled("?aoDailyUxPilot=0"),false);
const morning=guidedDailyCards("morning"),evening=guidedDailyCards("evening");
assert.equal(morning.length,11);
assert.equal(evening.length,13);
for(const rows of [morning,evening]){
 const actual=renderDailyUxContinuous({rows,renderRow:row=>'<article data-source="'+esc(row.id)+'">CANONICAL '+esc(row.id)+'</article>',titleFor:r=>r.title,esc,L});
 assert.equal((actual.match(/class="aoDailyUxStage"/g)||[]).length,rows.length);
 assert.equal((actual.match(/data-tp381-flow-jump=/g)||[]).length,rows.length);
 assert.equal((actual.match(/data-source="/g)||[]).length,rows.length);
 assert.ok(rows.every((row,i)=>actual.includes('data-ao-daily-source-id="'+row.id+'" data-ao-daily-position="'+i+'"')));
 assert.doesNotMatch(actual,/data-completed|data-passed|mark.?done|localStorage/i);
}

assert.deepEqual(DAILY_BOOK_FAMILY_RELEASE.map(x=>[x.id,x.status]),[
 ["piusx","released"],["lasance","partial"],["moran","partial"],["blessed-be-god","partial"]
]);
for(const edition of ["1913","1905"]){
 const top=renderDailyBookPills({edition,L,esc});
 assert.match(top,/class="aoDailyBookSelector"/);
 assert.equal((top.match(/data-tp381-personal-action="edition"/g)||[]).length,2,
  "Only two source-cleared St Pius X editions may be switched directly");
 assert.equal((top.match(/class="aoDailyBookPill aoDailyBookPillPending"/g)||[]).length,3,
  "The three research-only books are not functional editions");
 assert.match(top,new RegExp('data-tp381-personal-value="'+edition+'" aria-pressed="true"'));
 for(const name of ["Lasance","Moran","Blessed Be God"])assert.ok(top.includes(name));
 assert.doesNotMatch(top,/data-tp381-personal-value="lasance"|data-tp381-personal-value="moran"/i);
}
assert.throws(()=>renderDailyBookPills({edition:"lasance",L,esc}),RangeError);
const reading=renderDailyReaderOptions({mode:"continuous",L,esc});
assert.match(reading,/<details class="aoDailyReadingOptions">/);
assert.match(reading,/data-tp381-daily-presentation="continuous"/);

const modes=renderDailyUxModes({mode:"continuous",L,esc});
assert.equal((modes.match(/data-tp381-daily-presentation=/g)||[]).length,3);
assert.match(modes,/data-tp381-daily-presentation="continuous" aria-pressed="true"/);
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/const DAILY_UX_PILOT_ENABLED=dailyUxPilotEnabled/);
assert.match(runtime,/renderDailyBookPills\(\{edition:prefs.edition,L,esc\}\)/);
assert.match(runtime,/renderDailyReaderOptions\(\{mode:S.dailyMode,L,esc\}\)/);
assert.match(runtime,/showEdition:!DAILY_UX_PILOT_ENABLED/);
assert.match(runtime,/return renderDailyUxContinuous\(\{rows,renderRow:dailyStageBody,titleFor:dailyUxRowTitle,esc,L\}\)/);
assert.match(runtime,/const body=step===total\?"":dailyStageBody\(row\)/);
assert.match(runtime,/S\.dailyMode!=="continuous"/);
assert.match(runtime,/target\.scrollIntoView\(\{block:"start",behavior:"auto"\}\)/);
assert.match(runtime,/installSequentialDevotionalReader/);
assert.match(runtime,/dailyHorizonMarkup\(rows.length\)/);
console.log("PASS daily UX pilot: 11/13 source identities; card and continuous share the same text-owner renderer, no completion inference");
