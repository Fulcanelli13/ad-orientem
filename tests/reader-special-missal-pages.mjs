import assert from "node:assert/strict";
import {specialRiteNextPosture,showSpecialRiteMissalPostureHint}
  from "../src/mass/reader-special-missal-pages.js";

const card=(id,posture,actorScope="ALL_FAITHFUL",extra={})=>
  ({id,posture,actorScope,...extra});
const hint=(current,next,opts={})=>
  specialRiteNextPosture({current,next,...opts});

assert.equal(hint(card("ROG-R01","STAND"),card("ROG-R02","KNEEL"))?.label,"Kneel",
  "Rogations must prepare faithful for sourced kneeling at Litany");
assert.equal(hint(card("ROG-R01","STAND"),card("ROG-R02","KNEEL"),
  {language:"fr"})?.label,"À genoux");
assert.equal(hint(card("GF-1","STAND"),card("GF-2","KNEEL",{personalOnly:false})),
  null,"Malformed actor-scope cannot supply a congregational cue");
assert.equal(hint(card("ASP-R01","STAND"),
  card("ASP-R02","STAND")),null,"No cue if posture unchanged");
assert.equal(hint(card("ASP-R02","STAND"),card("ASP-R03","KNEEL","FAITHFUL_RECIPIENT")),
  null,"Recipient-only action is not the congregation's kneeling");
assert.equal(hint(card("PALM-R03","STAND"),
  card("PALM-R04","PROCESSIONAL","FAITHFUL_PARTICIPATING")),null,
  "No procession instruction without explicit personal participation");
assert.equal(hint(card("PALM-R03","STAND"),
  card("PALM-R04","PROCESSIONAL","FAITHFUL_PARTICIPATING"),
  {participating:true})?.label,"Join procession");
assert.equal(hint(card("CND-R04","STAND"),
  card("CND-R05","PROCESSIONAL","FAITHFUL_WITH_CANDLE_PARTICIPATING"),
  {participating:true,language:"fr"})?.label,"Suivre la procession");
assert.equal(hint(card("CND-R04","STAND"),
  card("CND-R05","PROCESSIONAL","FAITHFUL_WITH_CANDLE_PARTICIPATING"),
  {participating:false}),null,
  "Nonparticipant must not be told to join Candlemas procession");
for(const posture of ["LOCAL","LOCAL_REVERENT","LOCAL_OR_STAND",
  "ORDINARY_PROFILE","INHERIT","STAND_OR_LOCAL"]){
  assert.equal(hint(card("R1","STAND"),card("R2",posture)),null,
    "Unresolved local posture "+posture+" became a synthetic instruction");
}
assert.equal(hint(card("EV-FIRE","STAND"),
  card("EV-PROC","KNEEL","MINISTERS")),null,
  "A minister-only blessing cannot become a lay gesture");
assert.equal(hint(card("EV-FIRE","STAND"),
  card("EV-FIRE2","KNEEL","ALL_FAITHFUL",{personalOnly:true})),null,
  "Personal-only action unexpectedly became congregational");
assert.equal(hint(card("GF-1","STAND"),card("GF-2","KNEEL"),
  {mode:"LIVE"}),null,"No rite-stage book hint in LIVE");
assert.equal(hint(card("GF-1","STAND"),card("GF-2","KNEEL"),
  {mode:"SIMPLE"}),null,"No rite-stage book hint in SIMPLE");

const attrs={};
const button={
  dataset:attrs,title:"",
  setAttribute(key,value){this[key]=value},
};
const host={querySelector:()=>button};
assert.equal(showSpecialRiteMissalPostureHint(host,{label:"Kneel"},
  {language:"en"}),true);
assert.equal(attrs.nextPosture,"Kneel");
assert.match(button["aria-label"],/Next page.*Kneel/);
assert.equal(showSpecialRiteMissalPostureHint(host,null,{language:"fr"}),false);
assert.equal("nextPosture" in attrs,false);
assert.equal(button["aria-label"],"Page suivante");
assert.equal(showSpecialRiteMissalPostureHint(null,null),false);

console.log("PASS special rite Missal stage cues: exact actor scope, personal/procession opt-in, localized manual page boundary");
