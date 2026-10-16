import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validatePrayerReadingPilot,prayerReadingEditorialPreviewHtml,prayerReadingEditorialPreviewCss,
 validateMassTransitionReadingPilot,massTransitionEditorialPreviewHtml,
 validateRomanCanonReadingPilot,romanCanonEditorialPreviewHtml,
 validateCommunionReadingPilot,communionEditorialPreviewHtml,
 validateConclusionReadingPilot,conclusionEditorialPreviewHtml}
 from "../src/learn/mass-prayer-reading-pilot.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const pilot=read("data/learn/research/mass-formation-offertory-prayer-reading-pilot-20261016.v1.json");
const sung=read("data/presentation/reader-text-sung.v1.json");
const formation=read("data/learn/mass-formation-campion.v1.json");
const accepted=validatePrayerReadingPilot(pilot,sung,formation);
assert.equal(accepted.ok,true,accepted.reason);
assert.equal(accepted.readings.length,8);
assert.equal(pilot.status,"EDITORIAL_DRAFT_NOT_RELEASED");
assert.deepEqual(accepted.readings.map(x=>x.block_id),Array.from({length:8},
  (_,i)=>"AO.SM.B"+String(i+31).padStart(3,"0")));
for(const lang of [false,true]){
 const html=prayerReadingEditorialPreviewHtml(accepted,{french:lang});
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,8);
 assert.match(html,/data-ao-formation-editorial-only/);
 assert.match(html,lang?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.match(html,lang?/Psaume 25/:/Psalm 25|Ps 25/);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
   "Preview must not embed a ritual or published app navigation");
}
assert.match(prayerReadingEditorialPreviewCss(),/max-width:430px/);
const alter=change=>{
 const copy=JSON.parse(JSON.stringify(pilot));change(copy);return validatePrayerReadingPilot(copy,sung,formation)};
assert.equal(alter(x=>{x.status="RELEASED_FOR_FORMATION"}).ok,false,
 "P1 excerpt release status must not authorize unpublished prayer commentaries");
assert.equal(alter(x=>{x.scope="MASS_RITUAL"}).ok,false);
assert.equal(alter(x=>{x.entries[0].text_anchor_en="New unverified history"}).ok,false);
assert.equal(alter(x=>{x.entries[0].block_id="AO.SM.B047"}).ok,false);
assert.equal(alter(x=>{x.entries[0].stage_id="MF04"}).ok,false);
assert.equal(alter(x=>{x.entries[0].scripture_within_text=["Revelation 22:18"]}).ok,false);
assert.equal(alter(x=>{x.entries[0].reading.fr=""}).ok,false);
assert.equal(alter(x=>{x.entries[0].id=x.entries[1].id}).ok,false);
assert.equal(alter(x=>{x.entries.splice(2,1)}).ok,false);
assert.equal(validatePrayerReadingPilot(pilot,{blocks:[]},formation).ok,false);
assert.doesNotMatch(readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8"),
 /mass-prayer-reading-pilot/,
 "Do not import editorial commentary into live ceremonial reader");
const nextPilot=read("data/learn/research/mass-formation-orate-preface-reading-pilot-20261016.v1.json");
const guide=read("data/presentation/guide-registry.v1.json");
const next=validateMassTransitionReadingPilot(nextPilot,sung,formation,guide);
assert.equal(next.ok,true,next.reason);
assert.deepEqual(next.readings.map(x=>x.block_id),
 ["AO.SM.B039","AO.SM.B041","AO.SM.B042","AO.SM.B043","AO.SM.B044","AO.SM.B046"]);
assert.deepEqual(next.withheld.map(x=>x.block_id),["AO.SM.B040","AO.SM.B045"]);
assert.deepEqual(next.withheld.map(x=>x.proper_slot),["SECRET_SET","PREFACE"]);
for(const lg of [false,true]){
 const html=massTransitionEditorialPreviewHtml(next,{french:lg});
 assert.match(html,/data-ao-formation-editorial-only/);
 assert.match(html,lg?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,6);
 assert.equal((html.match(/data-ao-formation-proper-held=/g)||[]).length,2);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
  "Transition editorial preview must not offer in-ritual actions");
 assert.match(html,lg?/Préface/:/Preface/);
}
assert.equal(next.readings.reduce((count,row)=>count+row.scripture_within_text.length,0),0,
 "No unapproved inferred Bible parallels or quoted verses may be introduced");
const mutateNext=change=>{
 const copy=JSON.parse(JSON.stringify(nextPilot));
 change(copy);
 return validateMassTransitionReadingPilot(copy,sung,formation,guide);
};
for(const [title,change] of [
 ["invalid release promotion",p=>{p.status="RELEASED_FOR_FORMATION"}],
 ["incorrect moment",p=>{p.entries[1].moment_id="AO.CARD.010"}],
 ["Canon collision",p=>{p.entries[2].block_id="AO.SM.B047"}],
 ["wrong theme",p=>{p.entries[2].stage_id="MF03"}],
 ["unpublished prayer wording",p=>{p.entries[0].text_anchor_en="Revelation 22:18"}],
 ["new Scripture claim",p=>{p.entries[0].scripture_within_text=["Psalm 112"]}],
 ["missing French reading",p=>{p.entries[5].reading.fr=""}],
 ["duplicate id",p=>{p.entries[0].id=p.entries[1].id}],
 ["missing study",p=>{p.entries.pop()}],
 ["variable Secret accidentally included",p=>{p.entries[0].block_id="AO.SM.B040"}],
 ["variable Preface accidentally included",p=>{p.entries[0].block_id="AO.SM.B045"}],
 ["hold removed",p=>{p.withheld_variable_propers.pop()}],
 ["hold incorrectly labelled",p=>{p.withheld_variable_propers[0].proper_slot="PREFACE"}],
 ["hold misleading",p=>{p.withheld_variable_propers[1].reason=""}]
]){
 assert.equal(mutateNext(change).ok,false,title+" must fail closed");
}
assert.equal(validateMassTransitionReadingPilot(nextPilot,{blocks:[]},formation,guide).ok,false);
assert.equal(validateMassTransitionReadingPilot(nextPilot,sung,formation,{entries:{}}).ok,false);
assert.doesNotMatch(readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8"),
 /mass-prayer-reading-pilot/,
 "The native Mass reader must remain study-free");
const canonDraft=read("data/learn/research/mass-formation-roman-canon-reading-pilot-20261016.v1.json");
const canonAccepted=validateRomanCanonReadingPilot(canonDraft,sung,formation,guide);
assert.equal(canonAccepted.ok,true,canonAccepted.reason);
assert.equal(canonAccepted.readings.length,15);
assert.deepEqual(canonAccepted.readings.map(x=>x.block_id),
 Array.from({length:15},(_,i)=>"AO.SM.B"+String(47+i).padStart(3,"0")));
assert.deepEqual(canonAccepted.readings.filter(x=>x.stage_id==="MF05").map(x=>x.block_id),
 ["AO.SM.B052","AO.SM.B053"],"Consecration blocks must map to original MF05");
assert.deepEqual(canonAccepted.readings.find(x=>x.block_id==="AO.SM.B055").mentioned_biblical_persons_in_text,
 ["Abel","Abraham","Melchisedech"]);
assert.equal(canonAccepted.readings.reduce((n,x)=>n+x.scripture_within_text.length,0),0,
 "Do not invent Bible reference IDs in Canon before P0 research");
for(const fr of [false,true]){
 const html=romanCanonEditorialPreviewHtml(canonAccepted,{french:fr});
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,15);
 assert.match(html,/data-ao-formation-editorial-only/);
 assert.match(html,fr?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.match(html,fr?/Melchisédech|Melchisedech/:/Melchisedech/);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
  "The Roman Canon draft is never a ritual action");
}
const changeCanon=action=>{
 const copy=JSON.parse(JSON.stringify(canonDraft));action(copy);
 return validateRomanCanonReadingPilot(copy,sung,formation,guide);
};
for(const [description,change] of [
 ["unapproved release",x=>{x.status="RELEASED_FOR_FORMATION"}],
 ["wrong Guide moment",x=>{x.entries[6].moment_id="AO.CARD.015"}],
 ["wrong Canon boundary",x=>{x.entries[7].block_id="AO.SM.B055"}],
 ["wrong thematic study",x=>{x.entries[5].stage_id="MF04"}],
 ["source text invented",x=>{x.entries[2].text_anchor_en="New scriptural source"}],
 ["unapproved biblical verse",x=>{x.entries[8].scripture_within_text=["Genesis 14:18"]}],
 ["biblical attribution",x=>{x.entries[8].mentioned_biblical_persons_in_text.push("Moses")}],
 ["missing source person",x=>{x.entries[8].mentioned_biblical_persons_in_text.pop()}],
 ["French omitted",x=>{x.entries[10].observe.fr=""}],
 ["duplicate record",x=>{x.entries[0].id=x.entries[1].id}],
 ["missing Roman Canon text",x=>{x.entries.pop()}]
]){
 assert.equal(changeCanon(change).ok,false,description+" must fail closed");
}
assert.equal(validateRomanCanonReadingPilot(canonDraft,{blocks:[]},formation,guide).ok,false);
assert.equal(validateRomanCanonReadingPilot(canonDraft,sung,formation,{entries:{}}).ok,false);
const communionDraft=read("data/learn/research/mass-formation-communion-prayer-reading-pilot-20261016.v1.json");
const communionValidated=validateCommunionReadingPilot(communionDraft,sung,formation,guide);
assert.equal(communionValidated.ok,true,communionValidated.reason);
assert.equal(communionValidated.readings.length,23);
assert.deepEqual(communionValidated.readings.map(x=>x.block_id),
 Array.from({length:23},(_,i)=>"AO.SM.B"+String(i+62).padStart(3,"0")));
assert.equal(communionValidated.readings.filter(x=>x.branch==="NORMATIVE_FIXED_TEXT").length,20);
assert.deepEqual(communionValidated.readings.filter(x=>x.branch==="OPTIONAL_LOCAL_OLDER_CUSTOM").map(x=>x.block_id),
 ["AO.SM.B077","AO.SM.B078","AO.SM.B079"],"The three older/local branch prayers must not be normative");
assert.deepEqual(communionValidated.withheld.map(x=>x.block_id),["AO.SM.B085"]);
assert.equal(communionValidated.withheld[0].proper_slot,"COMMUNION");
assert.equal(communionValidated.readings.reduce((n,x)=>n+x.scripture_within_text.length,0),0,
 "No inferred Bible passages may be promoted into P2 as verified source references");
assert.deepEqual(communionValidated.readings.filter(x=>x.stage_id==="MF07").map(x=>x.block_id),
 ["AO.SM.B069","AO.SM.B070","AO.SM.B071","AO.SM.B072","AO.SM.B073","AO.SM.B074","AO.SM.B075","AO.SM.B076"]);
assert.deepEqual(communionValidated.readings.filter(x=>x.stage_id==="MF08").map(x=>x.block_id),
 ["AO.SM.B083","AO.SM.B084"]);
for(const fr of [false,true]){
 const html=communionEditorialPreviewHtml(communionValidated,{french:fr});
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,23);
 assert.equal((html.match(/class="aoFRPilotOptional"/g)||[]).length,3);
 assert.equal((html.match(/data-ao-formation-proper-held=/g)||[]).length,1);
 assert.match(html,fr?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.match(html,fr?/USAGE LOCAL\/ANCIEN FACULTATIF/:/OPTIONAL OLDER\/LOCAL CUSTOM/);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
  "No ritual-reader or publicly activated study surfaces");
}
const invalidCommunion=mutate=>{
 const copy=JSON.parse(JSON.stringify(communionDraft));
 mutate(copy);
 return validateCommunionReadingPilot(copy,sung,formation,guide);
};
for(const [name,mutate] of [
 ["draft released",x=>{x.status="RELEASED_FOR_FORMATION"}],
 ["wrong Pater moment",x=>{x.entries[0].moment_id="AO.CARD.020"}],
 ["wrong priest/faithful teaching",x=>{x.entries[12].stage_id="MF01"}],
 ["wrong source block",x=>{x.entries[12].block_id="AO.SM.B081"}],
 ["unpublished Pater text",x=>{x.entries[1].text_anchor_en="New unverified text"}],
 ["unapproved Psalm link",x=>{x.entries[13].scripture_within_text=["Psalm 115:4"]}],
 ["Confiteor falsely normative",x=>{x.entries[15].branch="NORMATIVE_FIXED_TEXT"}],
 ["Confiteor custom deleted",x=>{x.entries.splice(16,1)}],
 ["Confiteor source status overwritten",x=>{x.entries[15].source_status="NORMATIVE_1962"}],
 ["priest threefold prayer relabelled",x=>{x.entries[11].branch="OPTIONAL_LOCAL_OLDER_CUSTOM"}],
 ["proper Communion text added",x=>{x.entries[20].block_id="AO.SM.B085"}],
 ["proper Communion hold missing",x=>{x.withheld_variable_propers=[]}],
 ["proper hold mislabeled",x=>{x.withheld_variable_propers[0].proper_slot="POSTCOMMUNION_SET"}],
 ["French commentary missing",x=>{x.entries[20].reading.fr=""}],
 ["extra draft entry",x=>{x.entries.push(x.entries[0])}]
]){
 assert.equal(invalidCommunion(mutate).ok,false,name+" must be rejected");
}
assert.equal(validateCommunionReadingPilot(communionDraft,{blocks:[]},formation,guide).ok,false);
assert.equal(validateCommunionReadingPilot(communionDraft,sung,formation,{entries:{}}).ok,false);
const conclusionDraft=read("data/learn/research/mass-formation-conclusion-prayer-reading-pilot-20261016.v1.json");
const conclusionValid=validateConclusionReadingPilot(conclusionDraft,sung,formation,guide);
assert.equal(conclusionValid.ok,true,conclusionValid.reason);
assert.deepEqual(conclusionValid.readings.map(r=>r.block_id),
 ["AO.SM.B086","AO.SM.B087","AO.SM.B089","AO.SM.B090","AO.SM.B091","AO.SM.B092","AO.SM.B093","AO.SM.B094","AO.SM.B095"]);
assert.deepEqual(conclusionValid.withheld.map(r=>r.block_id),["AO.SM.B088"]);
assert.equal(conclusionValid.withheld[0].proper_slot,"POSTCOMMUNION_SET");
assert.deepEqual(conclusionValid.readings.filter(r=>r.conditionality==="DISMISSAL_FORM_DEPENDENT").map(r=>r.block_id),
 ["AO.SM.B089","AO.SM.B090"]);
assert.deepEqual(conclusionValid.readings.filter(r=>r.conditionality==="BLESSING_MAY_BE_OMITTED").map(r=>r.block_id),
 ["AO.SM.B092"]);
assert.deepEqual(conclusionValid.readings.filter(r=>r.conditionality==="LAST_GOSPEL_MAY_BE_OMITTED").map(r=>r.block_id),
 ["AO.SM.B093","AO.SM.B094","AO.SM.B095"]);
assert.equal(conclusionValid.readings.reduce((n,r)=>n+r.scripture_within_text.length,0),0);
for(const fr of [false,true]){
 const html=conclusionEditorialPreviewHtml(conclusionValid,{french:fr});
 assert.equal((html.match(/data-ao-formation-prayer-block=/g)||[]).length,9);
 assert.equal((html.match(/class="aoFRPilotConditional"/g)||[]).length,6);
 assert.equal((html.match(/data-ao-formation-proper-held=/g)||[]).length,1);
 assert.match(html,fr?/ÉBAUCHE ÉDITORIALE/:/EDITORIAL DRAFT/);
 assert.match(html,fr?/DERNIER ÉVANGILE PARFOIS OMIS/:/LAST GOSPEL MAY BE OMITTED/);
 assert.doesNotMatch(html,/data-ao-r17|data-ao-mass-reader|data-ao-mx-study/,
  "This is editorial research material, not a Mass/Formation public route");
}
const invalidConclusion=mutate=>{
 const copy=JSON.parse(JSON.stringify(conclusionDraft));
 mutate(copy);
 return validateConclusionReadingPilot(copy,sung,formation,guide);
};
for(const [name,fn] of [
 ["draft prematurely released",x=>{x.status="RELEASED_FOR_FORMATION"}],
 ["wrong Guide moment",x=>{x.entries[0].moment_id="AO.CARD.028"}],
 ["wrong published source",x=>{x.entries[1].block_id="AO.SM.B088"}],
 ["wrong theme",x=>{x.entries[2].stage_id="MF05"}],
 ["invented public wording",x=>{x.entries[7].text_anchor_en="John Chapter 44"}],
 ["uncertified verse citation",x=>{x.entries[8].scripture_within_text=["John 1:14"]}],
 ["variant dismissal claimed universal",x=>{x.entries[3].conditionality="STANDARD_FIXED"}],
 ["blessing claimed universal",x=>{x.entries[5].conditionality="STANDARD_FIXED"}],
 ["Last Gospel claimed universal",x=>{x.entries[8].conditionality="STANDARD_FIXED"}],
 ["no Postcommunion hold",x=>{x.withheld_variable_propers=[]}],
 ["wrong Postcommunion slot",x=>{x.withheld_variable_propers[0].proper_slot="COMMUNION"}],
 ["missing French reading",x=>{x.entries[8].observe.fr=""}],
 ["duplicate entry ID",x=>{x.entries[1].id=x.entries[0].id}],
 ["missing finale",x=>{x.entries.pop()}]
]){
 assert.equal(invalidConclusion(fn).ok,false,name+" must fail closed");
}
assert.equal(validateConclusionReadingPilot(conclusionDraft,{blocks:[]},formation,guide).ok,false);
assert.equal(validateConclusionReadingPilot(conclusionDraft,sung,formation,{entries:{}}).ok,false);
// Complete second-half coverage: every original B031–B095 source block must
// be either a reviewed-only fixed-text draft or an explicit Mass-specific Proper
// hold. No source block may disappear, duplicate, or become default Proper text.
const publishedSourceBlocks=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
const studies=[...accepted.readings,...next.readings,...canonAccepted.readings,
 ...communionValidated.readings,...conclusionValid.readings];
const held=[...next.withheld,...communionValidated.withheld,...conclusionValid.withheld];
const studyIds=studies.map(r=>r.block_id),heldIds=held.map(r=>r.block_id);
assert.equal(studies.length,61);
assert.equal(held.length,4);
assert.equal(new Set(studyIds).size,61,"Duplicated prayer study source");
assert.equal(new Set(heldIds).size,4,"Duplicated variable Proper hold");
assert.equal(studyIds.filter(id=>heldIds.includes(id)).length,0,
 "A variable Proper can never also be published as a fixed-text study");
const total=Array.from({length:65},(_,i)=>"AO.SM.B"+String(i+31).padStart(3,"0"));
assert.deepEqual([...studyIds,...heldIds].sort(),total.sort(),
 "All B031–B095 originals must be accounted for without fabricating variable Proper text");
for(const sourceId of heldIds){
 assert.ok(publishedSourceBlocks.get(sourceId)?.Proper_Slot,
  "Every hold must be an actual variable Proper slot: "+sourceId);
}
for(const sourceId of studyIds){
 assert.equal(publishedSourceBlocks.get(sourceId)?.Proper_Slot,null,
  "Fixed-text drafts cannot replace variable Proper: "+sourceId);
}
assert.equal(studies.filter(r=>r.branch==="OPTIONAL_LOCAL_OLDER_CUSTOM").length,3);
console.log("PASS P2 editorial pilot: 61 bilingual prayer readings, 4 held Propers, 3 optional Communion customs; complete B031–B095 coverage; closing texts retain dismissal/blessing/Last Gospel exceptions and John Incarnation wording");
