import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ESSENTIAL_HOLY_CARD_IDS_V1} from "../src/pray/essential-holy-card-parts.js";
import {claudeHolyCard,claudeHolyCardCase,CLAUDE_HOLY_CARD_FAMILY} from "../src/pray/claude-holy-card.js";
const read=x=>readFileSync(x,"utf8");
const originalCss=read("tests/fixtures/claude-prayer/holy-card.app-ui.css");
const originalJs=read("tests/fixtures/claude-prayer/holy-card.app-ui.js");
const styles=read("src/pray/claude-holy-card-styles.js");
const runtime=read("src/pray/presentation-runtime.js");
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
test("Source pinned from original Claude HTML — actual case, lace, Y-flip, initial",()=>{
 assert.match(originalCss,/\.fan\{display:grid;grid-template-columns:repeat\(3,1fr\)/);
 assert.match(originalCss,/\.lace\.flip \.inner\{transform:rotateY\(180deg\)/);
 assert.match(originalCss,/transition:transform \.5s ease/);
 assert.match(originalCss,/\.face\.back \.ini/);
 assert.match(originalJs,/state:\{flip:false\}/);
 assert.match(originalJs,/data-a="flip"/);
 assert.match(styles,/transform:rotateY\(180deg\)/);
 assert.match(styles,/transition:transform \.5s ease/);
 assert.match(styles,/--hc-init/);
 assert.equal(CLAUDE_HOLY_CARD_FAMILY,"ao-claude-holy-card-v1");
});
test("All 32 F01 source records render a reversible card with exact source text",()=>{
 const p=PRAY_CANONICAL_DATA_V435930.prayers;
 const caseHtml=claudeHolyCardCase({prayers:p,esc:escape,title:"Essential Prayers"});
 assert.equal((caseHtml.match(/data-p435930-lib-open=/g)||[]).length,32);
 assert.match(caseHtml,/aoClaudeHolyFan/);
 for(const id of ESSENTIAL_HOLY_CARD_IDS_V1){
  const record=p[id],face=record.fr?"fr":"en";
  const card=claudeHolyCard({id,p:record,face,esc:escape});
  assert.match(card,/aoClaudeHolyLace/);
  assert.match(card,/aoClaudeHolyFront/);
  assert.match(card,/aoClaudeHolyBack/);
  assert.match(card,/aoClaudeHolyBackScroll/);
  assert.match(card,/data-p435930-essential-card-turn/);
  assert.doesNotMatch(card,/<img /); // no arbitrary art source
  assert.ok(record[face]);
 }
});
test("Both means true Latin plus current vernacular; unavailable sources are never invented",()=>{
 const rec=PRAY_CANONICAL_DATA_V435930.prayers.foundations_hail_mary;
 const card=claudeHolyCard({id:"foundations_hail_mary",p:rec,face:"both",vernacular:"fr",esc:escape});
 assert.match(card,/class="aoClaudeHolyLatinText"/);
 assert.match(card,/lang="la"/);
 assert.match(card,/lang="fr"/);
 assert.ok(card.includes(escape(rec.la.slice(0,20))));
 const eng=PRAY_CANONICAL_DATA_V435930.prayers.marian_consecration_immaculate_heart;
 const englishOnly=claudeHolyCard({id:"marian_consecration_immaculate_heart",p:eng,face:"both",vernacular:"fr",esc:escape});
 assert.doesNotMatch(englishOnly,/aoClaudeHolyLatinText/);
});
test("F01 reader routes use the Claude object, not a flat sheet",()=>{
 assert.match(runtime,/claudeHolyCard\(\{id,p,face:chosen/);
 assert.match(runtime,/claudeHolyCardCase\(\{ids:ESSENTIAL_HOLY_CARD_IDS_V1/);
 assert.match(runtime,/data-p435930-essential-card-turn/);
 assert.match(runtime,/data-p435930-essential-aa/);
 assert.match(runtime,/installClaudeHolyBackFocus\(card\)/);
 assert.match(runtime,/ESSENTIAL_HOLY_CARD_IDS_V1.indexOf\(id\)/);
});
