import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {CLAUDE_BENEDICTION_RAIL,claudeBenedictionRail} from "../src/pray/claude-benediction-altar-card.js";
import {claudeAltarBilingualRows} from "../src/pray/claude-altar-card.js";
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const css=readFileSync("src/pray/claude-benediction-altar-styles.js","utf8");
const original=readFileSync("tests/fixtures/claude-prayer/altar-card.app-ui.css","utf8");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
test("Claude original actual altar double-ruled geometry and 320px stacked bilingual",()=>{
 assert.match(original,/\.acard\{flex:1;min-width:0;display:flex;flex-direction:column;border:3px double/);
 assert.match(original,/\.stg\{flex:0 0 40px/);
 assert.match(original,/\.two \.ln\{grid-template-columns:1\.3em 1fr 1fr/);
 assert.match(original,/body\.w320 \.two \.ln\{grid-template-columns:1\.2em 1fr/);
 assert.match(css,/border:3px double var\(--claude-ink2\)/);
 assert.match(css,/grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/);
 assert.match(css,/@media\(max-width:359px\)/);
});
test("Seven base stages and Blessing V own the rail; the public rite stage owner remains",()=>{
 const titles=["Exposition","Adoration","Tantum Ergo","Versicle & collect","Blessing","Divine Praises","Reposition"];
 const stages=CLAUDE_BENEDICTION_RAIL.map((x,i)=>[x.id,titles[i],titles[i]]);
 assert.deepEqual(CLAUDE_BENEDICTION_RAIL.map(x=>x.roman),["I","II","III","IV","V","VI","VII"]);
 const html=claudeBenedictionRail(stages,4,{esc});
 assert.equal((html.match(/data-p435930-ben-step=/g)||[]).length,7);
 assert.match(html,/class="cu key" aria-current="step"/);
 // Advancing to Divine Praises must never claim that the priest's
 // external blessing was completed by the app.
 const afterBlessing=claudeBenedictionRail(stages,5,{esc});
 assert.match(afterBlessing,/data-p435930-ben-step="4" class=" key"/);
 assert.doesNotMatch(afterBlessing,/data-p435930-ben-step="4" class="dn key"/);

 assert.match(runtime,/claudeBenedictionRail\(stages,i,\{esc\}\)/);
 assert.match(runtime,/aoClaudeAltarCard/);
 assert.match(runtime,/const plateCaption=baseIndex>=0/);
 assert.doesNotMatch(runtime,/const plateCode=/,
  "Draft plate identifiers must never appear as published artwork metadata");
 assert.doesNotMatch(runtime,/ordinalEn\+' stage · plate '/,
  "The rite header must name the actual stage, not a nonexistent plate");
 assert.match(runtime,/aoClaudeExternalBlessing/);
 assert.match(runtime,/benedictionVersiclesForDate/);
 assert.match(runtime,/Stop interacting with the phone/);
 assert.match(runtime,/data-ao-benediction-final/);
});
test("Actual chant and versicles retain canonical witnesses and independently focusable source beats",()=>{
 assert.match(runtime,/benedictionSungStanzas\(/);
 assert.match(runtime,/aoRiteChantStanza/);
 assert.match(runtime,/aoRiteLiturgicalBeat/);
 assert.match(runtime,/sourceLine\(p\)/);
 assert.match(css,/aoRiteChantLatin/);
 assert.match(css,/aoRiteChantVernacular/);
});

test("Refuse false bilingual rows where one witness has an unmatched blank line",()=>{
 const exact=claudeAltarBilingualRows({
  latin:"Versiculus\n\nOratio",
  vernacular:"Versicle\n\nPrayer",
  esc,language:"en"
 });
 assert.match(exact,/aoClaudeAltarGap/);
 assert.equal((exact.match(/aoClaudeAltarRow/g)||[]).length,2);
 const invalid=claudeAltarBilingualRows({
  latin:"Versiculus\n\nOratio",
  vernacular:"Versicle\nUnrelated insertion\nPrayer",
  esc,language:"en"
 });
 assert.equal(invalid,null,"Mismatched source sections must use the canonical fallback");
 assert.equal(claudeAltarBilingualRows({
  latin:"One\nTwo",vernacular:"One",esc
 }),null);
});
