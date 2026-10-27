import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  compileDailyFormulation,availableFormulations,
  normalizedDailySelections,dailyTimerSnapshot,DAILY_FORMULATION_SCHEMA
} from "../src/pray/daily-formulation-engine.js";
import {
  MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381
} from "../src/pray/traditional-pray-data.js";

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
    noSource:witness("noSource","en","A purported historical prayer with no source link.",{sourceUrl:null})
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
  profiles:{"en:morning:short":{steps:[{id:"a",type:"prayer",variants:["noSource"]}]}}
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

assert.equal(MORNING_PRAYER_SEQUENCE_V381.length,11,"Canonical morning reader is unchanged");
assert.equal(EVENING_PRAYER_SEQUENCE_V381.length,13,"Canonical evening reader is unchanged");
const runtime=readFileSync("src/pray/traditional-pray-runtime.js","utf8");
assert.ok(runtime.includes("guidedDailyCards(S.daypart)"),"Existing guided daily reader must remain the source owner");
assert.ok(!runtime.includes("daily-formulation-engine.js"),"Unapproved historical content must not enter the public reader by accident");

console.log("PASS daily formulation engine: source-language protection, approvals, composite dedup, alternatives, nightly complementary prayers, 11/13 baseline and inert timer");
