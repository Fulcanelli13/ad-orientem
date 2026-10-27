import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  compileDailyFormulation,availableFormulations,
  normalizedDailySelections,dailyTimerSnapshot,DAILY_FORMULATION_SCHEMA
} from "../src/pray/daily-formulation-engine.js";
import {
  MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381
} from "../src/pray/traditional-pray-data.js";
import {createDailySessionTimer,sessionClockLabel} from "../src/pray/daily-session-timer.js";
import {createDailyFormulationPreferenceStore} from "../src/pray/daily-formulation-preferences.js";
import {APPROVED_DAILY_FORMULATION_MANIFEST_V1} from "../src/pray/daily-approved-formulations.js";

const witness=(id,language,text,options={})=>({
  id,language,text,kind:"historical",releaseStatus:"cleared",
  sourceLabel:"Source edition 1911, printed p. 2",
  sourceUrl:"https://en.wikisource.org/wiki/Example",...options
});
const manifest={
  witnesses:{
    opening:witness("opening","en","Prayer of adoration and thanksgiving, complete and unchanged."),
    offering:witness("offering","en","O God, I offer the prayers, works and sufferings of this day."),
    alternative:witness("alternative","en","A completely different historically sourced Morning Offering."),
    night:witness("night","en","Visit, O Lord, the dwelling and preserve those who rest therein."),
    antiphon:witness("antiphon","en","Save us, O Lord, waking; and keep us, sleeping."),
    french:witness("french","fr","Mon Dieu, je Vous remercie et Vous offre ma journée."),
    pending:witness("pending","en","A text not yet approved for public redistribution.",{releaseStatus:"research"}),
    "no-source":witness("no-source","en","A purported historical prayer with no source link.",{sourceUrl:null})
  },
  profiles:{
    "en:morning:short":{steps:[
      {id:"adoration",type:"prayer",title:"Adoration",variants:["opening"]},
      {id:"thanksgiving",type:"prayer",title:"Thanksgiving",variants:["opening"]},
      {id:"offering",type:"prayer",title:"Offering",variants:["offering","alternative"]},
    ]},
    "en:morning:complete":{steps:[
      {id:"adoration",type:"prayer",variants:["opening"]},
      {id:"offering",type:"prayer",variants:["offering","alternative"]},
      {id:"reflection",type:"silence",cue:"Pause silently"}
    ]},
    "en:evening:short":{steps:[
      {id:"examen",type:"examination",cue:"Review your day without recording sins"},
      {id:"protection",type:"prayer",variants:["night","antiphon"],multiple:true,required:true}
    ]},
    "fr:morning:short":{steps:[{id:"offrande",type:"prayer",variants:["french"]}]}
  }
};

const p=compileDailyFormulation(manifest);
assert.equal(p.schema,DAILY_FORMULATION_SCHEMA);
assert.equal(p.key,"en:morning:short");
assert.equal(p.stages.length,2,"One printed prayer fulfilling two purposes appears once");
assert.deepEqual(p.stages[0].coveredSlots,["adoration","thanksgiving"]);
assert.equal(p.stages[1].text,manifest.witnesses.offering.text,"Complete prayer must be retained");
assert.equal(p.advance,"manual-only");

const chosen=compileDailyFormulation(manifest,{
  selection:{offering:"alternative"}
});
assert.equal(chosen.stages[1].witnessId,"alternative");
assert.equal(chosen.stages[1].text,manifest.witnesses.alternative.text);
assert.equal(availableFormulations(manifest,{
  language:"en",daypart:"morning",length:"short",stepId:"offering"
}).length,2);
assert.deepEqual(availableFormulations(manifest,{
  language:"en",daypart:"morning",length:"short",stepId:"nonsense"
}),[]);

const night=compileDailyFormulation(manifest,{
  daypart:"evening",length:"short",
  selection:{protection:["night","antiphon"]}
});
assert.deepEqual(night.stages.map(x=>x.type),["examination","prayer","prayer"]);
assert.deepEqual(night.stages.filter(x=>x.type==="prayer").map(x=>x.witnessId),["night","antiphon"]);
assert.equal(night.stages[0].editorial,true);
assert.throws(()=>compileDailyFormulation(manifest,{
  daypart:"evening",selection:{protection:[]}
}),/Required prayer slot cannot be empty/);
assert.throws(()=>compileDailyFormulation(manifest,{
  selection:{offering:["offering","alternative"]}
}),/single-choice/);
assert.throws(()=>compileDailyFormulation(manifest,{
  selection:{offering:"pending"}
}),/Unregistered formulation/);
assert.throws(()=>compileDailyFormulation(manifest,{
  selection:{offering:"french"}
}),/Unregistered formulation/);

const unreleased={...manifest,
  profiles:{"en:morning:short":{steps:[{id:"a",type:"prayer",variants:["pending"]}]}}
};
assert.throws(()=>compileDailyFormulation(unreleased),/not cleared for publication/);
assert.equal(compileDailyFormulation(unreleased,{research:true}).stages[0].witnessId,"pending");
const wrongLang={...manifest,
  profiles:{"en:morning:short":{steps:[{id:"a",type:"prayer",variants:["french"]}]}}
};
assert.throws(()=>compileDailyFormulation(wrongLang),/cannot be translated by fallback/);
const missingSource={...manifest,
  profiles:{"en:morning:short":{steps:[{id:"a",type:"prayer",variants:["no-source"]}]}}
};
assert.throws(()=>compileDailyFormulation(missingSource),/lacks source URL/);
assert.throws(()=>compileDailyFormulation(manifest,{length:"abridged"}),/Unsupported daily prayer length/);
assert.throws(()=>compileDailyFormulation(manifest,{daypart:"noon"}),/Unsupported daily prayer daypart/);

const french=compileDailyFormulation(manifest,{language:"fr"});
assert.equal(french.stages[0].language,"fr");
assert.equal(french.stages[0].text,manifest.witnesses.french.text);
assert.deepEqual(normalizedDailySelections({
  offering:"alternative",protection:["night","night","antiphon"],
  invalid:"spaces not permitted",email:"private@example.com"
}),{offering:"alternative",protection:["night","antiphon"]});

assert.deepEqual(dailyTimerSnapshot({nowMs:0}),{
  elapsedMs:0,targetMs:null,atTarget:false,running:false,
  autoAdvance:false,truncatePrayer:false
});
const before=dailyTimerSnapshot({nowMs:299999,startedMs:0,running:true,targetMinutes:5});
assert.equal(before.atTarget,false);
const after=dailyTimerSnapshot({nowMs:300001,startedMs:0,running:true,targetMinutes:5});
assert.equal(after.atTarget,true);
assert.equal(after.autoAdvance,false);
assert.equal(after.truncatePrayer,false);
const paused=dailyTimerSnapshot({nowMs:999999,accumulatedMs:120000,running:false});
assert.equal(paused.elapsedMs,120000);
assert.throws(()=>dailyTimerSnapshot({nowMs:10,startedMs:11,running:true}),/Invalid running timer start/);

// Timer is deliberately ephemeral and owns no prayer-stage navigation.
let fakeNow=1000;
const timer=createDailySessionTimer({clock:()=>fakeNow});
assert.equal(timer.snapshot().elapsedMs,0);
assert.equal(timer.snapshot().running,false);
assert.equal(timer.setTarget(5).targetMs,300000);
assert.equal(timer.start().running,true);
fakeNow+=60000;
assert.equal(timer.snapshot().elapsedMs,60000);
assert.equal(sessionClockLabel(timer.snapshot().elapsedMs),"01:00");
timer.start(); // repeated clicks cannot reset the elapsed clock
fakeNow+=5000;
assert.equal(timer.pause().elapsedMs,65000);
fakeNow+=30000; // paused, even if the wall/monotonic clock continues
assert.equal(timer.snapshot().elapsedMs,65000);
timer.start();fakeNow+=235000;
assert.equal(timer.snapshot().elapsedMs,300000);
assert.equal(timer.snapshot().atTarget,true);
assert.equal(timer.snapshot().autoAdvance,false);
assert.equal(timer.snapshot().truncatePrayer,false);
assert.equal(timer.reset().elapsedMs,0);
assert.equal(timer.snapshot().targetMs,300000,"Reset preserves selected gentle target");
assert.throws(()=>timer.setTarget(3),/Unsupported prayer session duration/);
const badClock=createDailySessionTimer({clock:()=>-1});
assert.throws(()=>badClock.start(),/Invalid monotonic time/);

// Remember ONLY source IDs for the currently released language/profile.
// Withdrawn, missing and uncleared forms must not revive from saved settings.
const entries=new Map();
const storage={
 getItem:key=>entries.get(key)??null,
 setItem:(key,value)=>{entries.set(key,value)},
 removeItem:key=>{entries.delete(key)}
};
const preferences=createDailyFormulationPreferenceStore({storage});
assert.equal(preferences.save(manifest,{
 language:"en",daypart:"morning",length:"short",
 selection:{offering:"alternative"}
}).saved,true);
assert.deepEqual(preferences.load(manifest,{
 language:"en",daypart:"morning",length:"short"
}),{offering:"alternative"});
const persisted=JSON.stringify([...entries.values()]);
assert.ok(persisted.includes("alternative"));
assert.ok(!persisted.includes(manifest.witnesses.alternative.text),"Prayers must not be saved");
assert.ok(!persisted.includes("examen"),"Do not store spiritual/reflection entries");
assert.deepEqual(preferences.load(manifest,{
 language:"fr",daypart:"morning",length:"short"
}),{},"Source choices must not leak into other languages");
assert.deepEqual(preferences.load(manifest,{
 language:"en",daypart:"morning",length:"complete"
}),{},"Short/Complete stored independently");
const reject=preferences.save(manifest,{selection:{offering:"pending"}});
assert.equal(reject.saved,false);
assert.equal(preferences.save(manifest,{selection:{offering:"bad token"}}).saved,false);
assert.equal(preferences.save(manifest,{selection:{offering:["offering"]}}).saved,false);
assert.deepEqual(preferences.load(manifest),{offering:"alternative"},"Rejected choice preserves existing preference");
const noRelease={...manifest,witnesses:{
 ...manifest.witnesses,
 alternative:{...manifest.witnesses.alternative,releaseStatus:"research"}
}};
assert.deepEqual(preferences.load(noRelease),{},"Withdrawn source must not be loaded");
assert.equal(preferences.save(noRelease,{selection:{offering:"alternative"}}).saved,false);
assert.deepEqual(preferences.load(manifest),{offering:"alternative"});
// Imported/corrupt settings must never be re-emitted as sensitive free text.
entries.set(preferences.key,JSON.stringify({version:1,profiles:{
 "en:morning:short":{offering:"alternative",freeform:"I confessed a private matter"},
 "fr:morning:short":{offrande:"french"},
 "other:notes:private":{confession:"private journal"}
}}));
assert.equal(preferences.save(manifest,{
 language:"en",daypart:"morning",length:"short",selection:{offering:"offering"}
}).saved,true);
const sanitized=entries.get(preferences.key);
assert.ok(!sanitized.includes("I confessed a private matter"));
assert.ok(!sanitized.includes("private journal"));
assert.ok(!sanitized.includes("freeform"));
assert.ok(!sanitized.includes("other:notes:private"));
assert.ok(sanitized.includes("fr:morning:short"),"Known language profile preserved");
assert.equal(preferences.clear({language:"en",daypart:"morning",length:"short"}),true);
assert.deepEqual(preferences.load(manifest),{});
assert.equal(preferences.save(manifest,{selection:{offering:"offering"}}).saved,true);
assert.equal(preferences.clear(),true);
assert.equal(entries.size,0);
const unavailable=createDailyFormulationPreferenceStore();
assert.equal(unavailable.save(manifest,{selection:{offering:"alternative"}}).saved,false);
assert.deepEqual(unavailable.load(manifest),{});

assert.equal(MORNING_PRAYER_SEQUENCE_V381.length,11,"Canonical morning reader is unchanged");
assert.equal(EVENING_PRAYER_SEQUENCE_V381.length,13,"Canonical evening reader is unchanged");
const runtime=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
assert.ok(runtime.includes("guidedDailyCards(S.daypart)"),"Existing guided daily reader must remain the source owner");
assert.equal(Object.keys(APPROVED_DAILY_FORMULATION_MANIFEST_V1.witnesses).length,0,
 "No historical texts are cleared for public reader in this draft");
assert.equal(Object.keys(APPROVED_DAILY_FORMULATION_MANIFEST_V1.profiles).length,0,
 "No historical profile is approved in this draft");
assert.ok(runtime.includes("dailyReleasedFormOptions(prayerId,S.daypart,lang)"),
 "Future formulation tabs must be routed through explicit source gate");
assert.ok(runtime.includes('data-tp381-daily-form'),
 "Release-gated choice buttons must be wired");
assert.ok(runtime.includes("dailyFormPreferenceStore()"),
 "Only validated local formulation IDs should be persisted");
const dailyMarkup=runtime.slice(runtime.indexOf("function renderMorningEvening()"),runtime.indexOf("const HYMN_KEYS"));
assert.ok(dailyMarkup.indexOf("renderDailyGuided(rows)")<dailyMarkup.indexOf("dailyTimerControls()"),
 "Prayer must remain visually before optional timer controls on phones");
assert.ok(runtime.includes('data-tp381-timer-toggle'),"Reader should expose the opt-in timer disclosure");
assert.ok(runtime.includes('data-tp381-timer-control'),"Reader should wire timer controls");
assert.ok(runtime.includes('data-tp381-timer-target'),"Reader should wire gentle target choices");
assert.ok(runtime.includes('DAILY_SESSION_CLOCK'),"Reader must own only an ephemeral session clock");

const timerClickStart=runtime.indexOf('if(b.hasAttribute("data-tp381-timer-toggle"))');
const timerClickEnd=runtime.indexOf("if(b.dataset.tp381Daypart)",timerClickStart);
assert.ok(timerClickStart>=0 && timerClickEnd>timerClickStart);
assert.ok(!runtime.slice(timerClickStart,timerClickEnd).includes("S.dailyStep"),
  "Clock operations must never change prayer progress");
assert.ok(runtime.includes("if(next!==S.daypart)resetDailySessionTimer()"),
  "A different Morning or Evening session must not inherit the previous timer");
assert.ok(runtime.includes("if(S.route===\"pray.morning_evening\")resetDailySessionTimer()"),
  "Leaving the guided reader must release the timer");
const timerStyle=readFileSync("src/pray/traditional-pray-styles.js","utf8");
assert.ok(timerStyle.includes(".aoDailyClockPanel"),"Session timer controls require scoped styling");

assert.ok(!runtime.includes('compileDailyFormulation('),"Unapproved historical text compiler must not alter the live prayer reader");

console.log("PASS daily formulation engine: source gate, preference IDs, no released texts, nightly combinations, 11/13 baseline, opt-in timer");
