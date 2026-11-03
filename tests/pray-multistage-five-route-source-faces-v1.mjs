import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {LITTLE_CROWN_B30_BEADS,LITTLE_CROWN_B30_ASPIRATION,littleCrownStep} from "../src/pray/little-crown-b30.js";
import {renderLittleCrownB30} from "../src/pray/little-crown-presentation-b30.js";
import {SEVEN_WORDS_LOCAL_EN_1889_V1,sevenWordsLocalWitnessText} from "../src/pray/seven-words-offline-1889.v1.js";
import {parseSevenWordsHistoricalWitness} from "../src/pray/seven-words-witness.v1.js";
import {FORTY_HOURS_SOLEMN_SOURCE,FORTY_HOURS_SOLEMN_STAGES,fortySolemnAt} from "../src/pray/forty-hours-solemn.js";

const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
const filled=x=>typeof x==="string"&&x.trim().length>0;
const presentation=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");

// Little Crown: all 15 beads, with aspiration then canonically sourced
// Pater (3) or Ave (12), in all three supported languages.
assert.equal(LITTLE_CROWN_B30_BEADS.length,15);
let littleFaces=0;
for(let index=0;index<15;index++){
 for(const language of ["en","fr","la"]){
  const step=littleCrownStep(index,language);
  assert.ok(step,"Missing bead "+index+"/"+language);
  assert.equal(step.index,index);
  assert.equal(step.prayerId,index<3?"foundations_our_father":"foundations_hail_mary");
  assert.equal(step.prayerText,prayers[step.prayerId][language]);
  assert.equal(step.aspiration,LITTLE_CROWN_B30_ASPIRATION[language]);
  const html=renderLittleCrownB30({
   index,latin:language==="la",french:language==="fr",
   head:()=>"",L:(en,fr)=>language==="fr"?fr:en,
   esc:v=>String(v??""),nl:v=>String(v??"")
  });
  assert.ok(html.includes('class="aoLittleCrownPrayerText" lang="'+language+'">'+step.prayerText),
   "Little Crown does not render original "+language+" prayer at bead "+index);
  assert.ok(html.includes('class="aoLittleCrownAspiration" lang="'+language+'">'+step.aspiration),
   "Little Crown omits the exact aspiration at bead "+index);
  assert.ok(html.includes('data-p435930-crown-bead="'+index+'"'));
  littleFaces++;
 }
}

// Seven Words: retain the Baltimore Manual opening, all seven full historical
// meditations and its distinct Marian appendix, with no artificial eighth word.
const seven=SEVEN_WORDS_LOCAL_EN_1889_V1;
const parsed=parseSevenWordsHistoricalWitness(sevenWordsLocalWitnessText());
assert.equal(parsed.opening,seven.opening,"Historical opening was dropped by the parser");
assert.equal(parsed.sections.length,7,"Seven Words must remain seven");
assert.equal(parsed.appendix,seven.appendixTitle+"\n\n"+seven.appendix);
for(const [index,w] of seven.words.entries()){
 const expected=[w.utterance,seven.commonVersicles,w.meditation,w.after].join("\n\n");
 assert.equal(parsed.sections[index].text,expected,"Word "+(index+1)+" lost source paragraphs");
 assert.equal(parsed.sections[index].title,w.title);
}
const wordRenderer=presentation.slice(presentation.indexOf("async function ensureSevenWords(){"),presentation.indexOf("const FORTY_STAGES="));
assert.ok(wordRenderer.includes("SEVEN.opening=witnessed.opening"));
assert.ok(wordRenderer.includes('data-ao-seven-words-original-opening lang="en"'));
assert.ok(wordRenderer.includes("sourceWitnessParagraphs(SEVEN.opening)"));
assert.ok(wordRenderer.includes("!SEVEN.scriptureOnly&&i===0&&SEVEN.opening"));
assert.ok(wordRenderer.includes("sourceWitnessParagraphs(hist)"));
assert.ok(wordRenderer.includes('data-p435930-word-scripture'));
assert.ok(wordRenderer.includes("SEVEN.appendix"));
assert.ok(!wordRenderer.includes("</details>\\n "), "Literal slash-n must not leak into visible source disclosure");

// Forty Hours: nine stages over three days, with English and French public
// descriptions. Exact clergy-led public texts are still marked as pending.
assert.equal(FORTY_HOURS_SOLEMN_SOURCE.status,"STRUCTURE_VERIFIED_PUBLIC_TEXTS_PENDING");
assert.equal(FORTY_HOURS_SOLEMN_STAGES.length,9);
assert.deepEqual(FORTY_HOURS_SOLEMN_STAGES.map(x=>x.day),[1,1,1,1,2,2,3,3,3]);
for(let index=0;index<9;index++){
 const x=fortySolemnAt(index);
 assert.equal(x,FORTY_HOURS_SOLEMN_STAGES[index]);
 assert.ok(filled(x.titleEn)&&filled(x.titleFr)&&filled(x.bodyEn)&&filled(x.bodyFr));
 assert.equal(x.source,FORTY_HOURS_SOLEMN_SOURCE.institute);
}
const forty=presentation.slice(presentation.indexOf("const FORTY_STAGES="),presentation.indexOf("function renderLittleCrown(){"));
assert.ok(forty.includes("const FORTY_STAGES=[['Arrive'"));
assert.ok(forty.includes("FORTY_HOURS_SOLEMN_STAGES.length"));
assert.ok(forty.includes("fortySolemnAt(FORTY.solemnStep)"));
assert.ok(forty.includes("data-p435930-forty-ben"),"Actual Benediction handoff missing");
assert.ok(forty.includes("data-p435930-forty-own="),"The visitor must be able to open actual Prayer owners");
assert.ok(forty.includes("not a parish timetable or a replacement"),"Do not imply public ritual was fully captured");

// First Friday/Saturday: five and six source-backed guidance stages, with
// explicit self-reports; canonical text owners are reused rather than copied.
const monthly=presentation.slice(presentation.indexOf("const FF_STAGES="),presentation.indexOf("function mysterySetButtons(){"));
for(const language of ["en","fr","la"])assert.ok(filled(prayers.sacred_heart_short_prayer[language]),
 "Friday canonical act of reparation missing "+language);
assert.ok(monthly.includes("const FF_STAGES=[['Intention'"));
assert.ok(monthly.includes("['Finish','Terminer']];"));
assert.ok(monthly.includes("prayerBlock('sacred_heart_short_prayer'"));
assert.ok(monthly.includes("data-p435930-ff-communion"));
assert.ok(monthly.includes("const FS_STAGES=[['Intention'"));
assert.ok(monthly.includes("['15-minute meditation','Méditation de 15 min']"));
assert.ok(monthly.includes('data-p435930-own="pray.rosary"'));
assert.ok(monthly.includes("data-p435930-fs-meditate"));
for(const key of ["fs-confession","fs-communion","fs-rosary","fs-meditation"])assert.ok(monthly.includes("data-p435930-"+key));
assert.ok(presentation.includes("if(!isFirstWeekday(date,5)||!FF.intention||!FF.communion)return"));
assert.ok(presentation.includes("FS.intention&&FS.communion&&FS.rosary&&FS.meditation&&!!FS.confessionDate"));
console.log("PASS · "+littleFaces+" Little Crown prayer faces; complete Seven Words original opening, seven source meditations and appendix; nine source-scoped Forty Hours stages; 5/6 Friday/Saturday stages with canonical owners");
