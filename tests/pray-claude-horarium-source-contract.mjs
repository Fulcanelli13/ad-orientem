import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {CLAUDE_HORARIUM_BELLS,CLAUDE_HORARIUM_HOUR_LABELS,claudeHorariumClock,claudeHorariumStrokes,claudeHorariumHourFromClock} from "../src/pray/claude-horarium-clock.js";
const originalJs=readFileSync("tests/fixtures/claude-prayer/horarium.app-ui.js","utf8");
const originalCss=readFileSync("tests/fixtures/claude-prayer/horarium.app-ui.css","utf8");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const styles=readFileSync("src/pray/claude-horarium-styles.js","utf8");
test("Literal Claude Angelus hour arc and 3·3·3·9 progress source pinned",()=>{
 assert.match(originalJs,/function horarium\(h,id\)/);
 assert.match(originalJs,/const strokes=\(i,n\)/);
 assert.match(originalCss,/\.hor\{flex:0 0 auto/);
 assert.match(originalCss,/\.strokes\{flex:0 0 auto/);
 assert.deepEqual(CLAUDE_HORARIUM_BELLS,[3,3,3,9]);
 assert.deepEqual(CLAUDE_HORARIUM_HOUR_LABELS,{6:"vi",12:"xii",18:"xviii"});
});
test("Hours buttons, quadratic sun and bell groups reproduce actual Claude signature",()=>{
 for(const hour of [6,12,18]){
  const html=claudeHorariumClock(hour);
  assert.match(html,/Q150 -36 276 92/);
  assert.match(html,/viewBox="0 0 300 110"/);
  assert.equal((html.match(/data-p435930-angelus-hour=/g)||[]).length,3);
  assert.match(html,new RegExp('data-ao-claude-horarium-hour="'+hour+'"'));
 }
 assert.equal(claudeHorariumHourFromClock(7),6);
 assert.equal(claudeHorariumHourFromClock(13),12);
 assert.equal(claudeHorariumHourFromClock(19),18);
 const bars=claudeHorariumStrokes(2);
 assert.equal((bars.match(/<i aria-hidden="true"><\/i>/g)||[]).length,18);
 assert.equal((bars.match(/data-ao-bell-group=/g)||[]).length,4);
 assert.match(bars,/class="cu" data-ao-bell-group="2"/);
});
test("Canonical Angelus remains season-owned and progresses only with user navigation",()=>{
 assert.match(runtime,/const c=angelusChoice\(\),form=c.form/);
 assert.match(runtime,/angelusExactPosture\(/);
 assert.match(runtime,/angelusSaturdayVespersDate===selectedDateKey\(\)/);
 assert.match(runtime,/installAngelusCardDeck\(/);
 assert.match(runtime,/onCardChange:\(_card,index\)=>/);
 assert.match(runtime,/syncClaudeHorariumStrokes\(m,Math.max\(0,index-1\)\)/);
 assert.match(runtime,/data-p435930-angelus-hour/);
 assert.match(runtime,/claudeHorariumClock\(CLAUDE_ANGELUS_HOUR\)/);
 assert.match(styles,/height:150px/);
 assert.match(styles,/max-width:359px/);
});
