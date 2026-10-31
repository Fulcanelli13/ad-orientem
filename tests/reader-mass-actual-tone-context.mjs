import assert from "node:assert/strict";
import {deriveActualMassMusicToneContext} from "../src/mass/reader-mass-actual-tone-context.js";
import {adaptV346ResolvedMass} from "../src/mass/host-adapter.js";
import {resolve1962CommonMassTone} from "../src/mass/reader-mass-1962-tone-family.js";
import {projectMassSungDialogue} from "../src/mass/reader-mass-sung-dialogue-pairs.js";

const legacy=(date,extras={})=>({
 date,canStart:true,celebrationType:"CALENDAR",
 requestedCelebrationId:"mass_of_day",celebrationId:"mass_of_day",
 calendarDay:{id:"legacy-display-only",title:"Host context must not classify tones"},
 insertedRites:[],conditions:[],...extras
});
const canonical=(date,id,path,rank,extra={})=>({
 status:"ready",date,day:{main:{id,rank,...extra}},
 proper:{status:"ready",data:{sourcePath:path,introit:{lat:"Donor witnessed"}}}
});
const properly=path=>({status:"READY",data:{sourcePath:path,introit:{lat:"Source text"}}});
const matrix=[
 ["sunday","2026-10-11","tempora:Pent20-0:2:g","Tempora/Pent20-0",2,null,"SUNDAY","SOLEMN"],
 ["advent sunday","2026-11-29","tempora:Adv1-0:1:v","Tempora/Adv1-0","I classis",null,"SUNDAY","SOLEMN"],
 ["lenten sunday","2026-03-22","tempora:Quad5-0:1:v","Tempora/Quad5-0",1,null,"SUNDAY","SOLEMN"],
 ["weekday","2026-10-12","tempora:Pent20-1:4:g","Tempora/Pent20-1",4,null,"FERIA","FERIAL"],
 ["marian feast","2026-10-07","sancti:10-07:2:w","Sancti/10-07",2,null,"FESTIVE_MASS","SOLEMN"],
 ["christmas vigil","2026-12-24","sancti:12-24:1:v","Sancti/12-24",1,null,"VIGIL","SOLEMN"],
 ["holy thursday","2026-04-02","tempora:Quad6-4:1:w","Tempora/Quad6-4",1,null,"HOLY_THURSDAY_MASS","SOLEMN"],
 ["octave explicit","2026-04-06","tempora:Pasc0-1:1:w","Tempora/Pasc0-1",1,
   {principalLiturgicalKind:"OCTAVE_DAY"},"WITHIN_APPROVED_OCTAVE","SOLEMN"],
];
for(const [label,date,id,path,rank,meta,expectedKind,expectedFamily] of matrix){
 const input=legacy(date),day=canonical(date,id,path,rank,meta??{});
 const selected=properly(path);
 const ctx=deriveActualMassMusicToneContext({
  legacy:input,calendarResolution:day,selectedProper:selected
 });
 assert.ok(ctx,label+" did not get source context");
 assert.equal(ctx.sourcePrincipalId,id);
 assert.equal(ctx.celebrationKind,expectedKind,label);
 assert.equal(ctx.liturgicalClass,Number(id.split(":").at(-2)));
 assert.equal(ctx.evidence,"SAME_DATE_CANONICAL_PRINCIPAL_AND_SELECTED_PROPER");
 const bridged=adaptV346ResolvedMass(input,{
  proper:selected,form:"SOLEMN",calendarResolution:day
 });
 assert.deepEqual(bridged.provenance.musicToneContext,ctx,label+" bridge mismatch");
 const tone=resolve1962CommonMassTone({resolvedMass:bridged});
 assert.equal(tone.family,expectedFamily,label+" 1962 family");
 assert.equal(tone.status,"RUBRICAL_FAMILY_RESOLVED");
 assert.equal(tone.musicEncoded,false);
 const preface=projectMassSungDialogue({
  eventId:"PREFACE_DIALOGUE",form:"SOLEMN",resolvedMass:bridged,
  massPlan:{dismissal:"ITE_MISSA_EST"}
 });
 assert.equal(preface.toneSelection.toneFamily,expectedFamily);
 assert.equal(preface.toneSelection.matchedResponseFamily,expectedFamily);
 assert.equal(preface.exchanges.length,3);
 assert.equal(preface.toneSelection.celebrant,"NOTATION_NOT_APPROVED");
 assert.equal(preface.toneSelection.response,"NOTATION_NOT_APPROVED");
}
const date="2026-10-11",id="tempora:Pent20-0:2:g",path="Tempora/Pent20-0";
const day=canonical(date,id,path,2),base=legacy(date),proper=properly(path);
const obtain=(l=base,d=day,p=proper,options={})=>
 deriveActualMassMusicToneContext({legacy:l,calendarResolution:d,
  selectedProper:p,...options});
assert.equal(obtain(legacy(date,{celebrationType:"VOTIVE",
 requestedCelebrationId:"holy_rosary",celebrationId:"holy_rosary"})),null,
 "Selected votive Mass must not inherit Sunday Common tone");
assert.equal(obtain(legacy(date,{celebrationType:"REQUIEM",
 requestedCelebrationId:"requiem",celebrationId:"requiem"})),null);
assert.equal(obtain(base,day,proper,{overlays:["REQUIEM"]}),null);
assert.equal(obtain(base,day,proper,{distinctRite:"EASTER_VIGIL"}),null);
assert.equal(obtain(legacy(date,{canStart:false})),null);
assert.equal(obtain(base,day,properly("Sancti/10-07")),null,
 "Unrelated Proper never inherits the Calendar family");
assert.equal(obtain(base,{...day,proper:properly("Sancti/10-07")}),null,
 "Calendar owner Proper must also match");
assert.equal(obtain(base,{...day,date:"2026-10-12"}),null);
assert.equal(obtain(base,{...day,status:"failed"}),null);
assert.equal(obtain(base,{...day,proper:{status:"loading"}}),null);
assert.equal(obtain(base,{...day,day:{main:{...day.day.main,id:"tempora:Pent20-1:2:g"}}}),null,
 "A weekday ID cannot masquerade as observed Sunday");
assert.equal(obtain(base,{...day,day:{main:{...day.day.main,rank:3}}}),null,
 "Contradictory principal rank cannot authorize solemnity");
assert.equal(obtain(base,{...day,day:{main:{...day.day.main,
 principalLiturgicalKind:"FERIA"}}}),null,
 "Conflicting typed liturgical kind cannot override Sunday source day");
assert.equal(obtain(base,{...day,day:{main:{id:"unknown:2026-10-11:2:g",rank:2}}}),null);
assert.equal(obtain(base,canonical(date,"sancti:10-11:4:w","Sancti/10-11",4),
 properly("Sancti/10-11")),null,"IV-class candidate must be held");
const octave=canonical("2026-04-06","tempora:Pasc0-1:1:w","Tempora/Pasc0-1",1);
assert.equal(obtain(legacy("2026-04-06"),octave,
 properly("Tempora/Pasc0-1")),null,
 "Easter octave may not be treated as an ordinary weekday");
const souls=legacy("2026-11-02");
const soulsDay=canonical(souls.date,"sancti:11-02m1:1:b","Sancti/11-02m1",1);
const soulsProper=properly("Sancti/11-02m1");
assert.equal(obtain(souls,soulsDay,soulsProper),null,
 "All Souls is Requiem, not an I-class festive tone");
const soulsAdapted=adaptV346ResolvedMass(souls,{
 form:"SOLEMN",proper:soulsProper,calendarResolution:soulsDay});
assert.equal(soulsAdapted.provenance.musicToneContext,null);
assert.equal(resolve1962CommonMassTone({resolvedMass:soulsAdapted}).family,"FERIAL");
// Direct Solemn Mass/Low Mass axis must remain independent of ceremony
// chosen. A source-owned calendar Mass retains its rubrical family in LOW,
// but the Schola dialogue has NO sung projection in LOW form.
const low=adaptV346ResolvedMass(base,{proper,calendarResolution:day,form:"LOW"});
assert.equal(resolve1962CommonMassTone({resolvedMass:low}).family,"SOLEMN");
assert.equal(projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",
 resolvedMass:low,form:"LOW"}),null);
console.log("PASS M04 canonical actual 1962 Mass->source Proper->tone family, seasonal/votive/Requiem strict guards");
