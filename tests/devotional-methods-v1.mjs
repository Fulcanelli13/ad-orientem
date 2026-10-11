import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MERCY_PRAYERS,MERCY_WITNESSES,divineMercySteps,mercyStepText,rosaryPlan,rosaryJourney,rosaryJourneyAt,rosaryJourneyEvents,rosaryJourneyTransition,createContinuousRosaryBridge,ROSARY_METHODS} from "../src/pray/devotional-methods-v1.js";
const base=divineMercySteps();
assert.equal(base.length,62,"4 opening + 5*(1+10) + 3 concluding prayers");
assert.deepEqual(base.slice(0,4).map(x=>x.key),["cross","pater","ave","creed"]);
assert.equal(base.filter(x=>x.key==="offering").length,5);
assert.equal(base.filter(x=>x.key==="invocation").length,50);
assert.equal(base.filter(x=>x.key==="trisagion").length,3);
assert.deepEqual(base.filter(x=>x.key==="invocation").map(x=>x.decade).filter((x,i)=>i%10===0),[1,2,3,4,5]);
assert.equal(base[base.length-1].key,"trisagion");
assert.equal(divineMercySteps({includeClosing:true}).length,63);
assert.equal(divineMercySteps({includeClosing:true}).at(-1).key,"closing");
assert.equal(new Set(base.map(x=>x)).size,62,"Distinct immutable steps required");
assert.ok(base.every(Object.isFrozen));
assert.ok(Object.values(MERCY_PRAYERS).every(x=>x.en.length>20&&x.fr.length>20));
assert.match(mercyStepText(base.find(x=>x.key==="offering"),"fr"),/Père Éternel/);
assert.match(mercyStepText(base.find(x=>x.key==="invocation"),"en"),/sorrowful Passion/);
assert.ok(MERCY_WITNESSES.en.startsWith("https://www.vaticannews.va/"));
assert.ok(MERCY_WITNESSES.fr.startsWith("https://www.vaticannews.va/"));
const short=rosaryPlan({decades:5,set:"sorrowful"});
assert.deepEqual(short.ids,["sor1","sor2","sor3","sor4","sor5"]);
const long=rosaryPlan({decades:15});
assert.equal(long.ids.length,15);
assert.deepEqual(long.ids.slice(0,5),["joy1","joy2","joy3","joy4","joy5"]);
assert.deepEqual(long.ids.slice(10),["glo1","glo2","glo3","glo4","glo5"]);
assert.equal(long.canonicalOwner,"AO_ROSARY_V381");
const journey=rosaryJourney();
assert.equal(journey.length,15);
const events=rosaryJourneyEvents();
assert.equal(events.length,32,"One opening + 15 mystery announcements + 15 decade prayers + one conclusion");
assert.equal(events.filter(x=>x.kind==="opening").length,1);
assert.equal(events.filter(x=>x.kind==="conclusion").length,1);
assert.equal(events.filter(x=>x.kind==="decade").length,15);
assert.equal(events[0].kind,"opening");
assert.equal(events.at(-1).kind,"conclusion");
assert.equal(events.find(x=>x.id==="sor1").number,6);
assert.equal(events.find(x=>x.id==="glo1").number,11);
assert.equal(rosaryJourneyTransition(events,0).previous,null);
assert.equal(rosaryJourneyTransition(events,events.length-1).complete,true);
assert.equal(rosaryJourneyTransition(events,-1),null);
assert.equal(rosaryJourneyEvents({decades:5}).length,12);
assert.equal(createContinuousRosaryBridge(null).supported,false);
const sets=[],starts=[];
const bridge=createContinuousRosaryBridge({state:()=>({}),steps:()=>[],setStep:()=>true},{
 selectSet:s=>{sets.push(s);return true},
 beginSet:m=>{starts.push(m.id);return true}
});
assert.equal(bridge.supported,true);
assert.equal(bridge.advance(),false,"No advance before start");
assert.equal(bridge.start(),true);
assert.equal(bridge.start(),false,"Cannot repeat opening");
for(let i=1;i<15;i++)assert.equal(bridge.advance(),true);
assert.deepEqual(sets,["joyful","sorrowful","glorious"]);
assert.deepEqual(starts,journey.map(m=>m.id));
assert.equal(bridge.state().index,14);
assert.equal(bridge.advance(),true,"Final completion");
assert.equal(bridge.state().finished,true);
assert.equal(bridge.advance(),false,"No second conclusion");
const denied=createContinuousRosaryBridge({state:()=>({}),steps:()=>[],setStep:()=>true},{selectSet:()=>false,beginSet:()=>true});
assert.equal(denied.start(),false);
assert.equal(denied.state().started,false);
assert.ok(journey.every(Object.isFrozen));
assert.deepEqual(journey.map(x=>x.number),Array.from({length:15},(_,i)=>i+1));
assert.deepEqual(journey.map(x=>x.localMystery),[1,2,3,4,5,1,2,3,4,5,1,2,3,4,5]);
assert.equal(journey[4].next,"sor1");
assert.equal(journey[5].previous,"joy5");
assert.equal(journey[9].next,"glo1");
assert.equal(journey[10].previous,"sor5");
assert.equal(journey[14].next,null);
assert.equal(journey[14].isFinal,true);
assert.equal(rosaryJourneyAt(journey,-1),null);
assert.equal(rosaryJourneyAt(journey,15),null);
assert.equal(rosaryJourney({decades:5,set:"glorious"}).length,5);
assert.equal(ROSARY_METHODS.dominican.status,"canonical-active");
assert.equal(ROSARY_METHODS.montfort.status,"adapted-active");
assert.equal(rosaryPlan({method:"montfort"}).readyForLive,true);
assert.equal(rosaryPlan({method:"dominican"}).readyForLive,true);
assert.equal(rosaryPlan({method:"ordinary"}).readyForLive,true);
assert.equal(rosaryPlan({method:"dominican",decades:15}).readyForLive,false);
assert.equal(rosaryPlan({method:"montfort",decades:15}).readyForLive,false);
assert.equal(Object.keys(ROSARY_METHODS).length,5);
assert.throws(()=>rosaryPlan({decades:10}));
assert.throws(()=>rosaryPlan({method:"made-up"}));
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
for(const a of ["pray.divine_mercy","renderMercy()","data-p435930-mercy-next","data-p435930-mercy-prev","data-p435930-mercy-closing","data-p435930-mercy-guide","data-p435930-mercy-open","data-p435930-rosary-methods","renderRosaryMethods()"])
 assert.ok(runtime.includes(a),"Missing native chaplet integration: "+a);
assert.match(runtime,/else if\(id==='pray\.rosary'\)/,"Original Rosary canonical route must survive");
assert.match(runtime,/launchRosaryPlayer/,"Original Rosary must retain donor");
for(const marker of ["data-p435930-rosary-fifteen","function launchFifteenRosary()","ROSARY_FIFTEEN.active","api.setMysterySet?.(set)","nextSteps.findIndex","nextSteps.findLastIndex"]){
 assert.ok(runtime.includes(marker),"Missing live fifteen-decade transition: "+marker);
}
assert.match(runtime,/launchTraditionalRosaryMethod\('ordinary'\)/,"The canonical five-decade launch must remain separate");
const packedManifest=JSON.parse(readFileSync("data/presentation/startup-thin-shell.v1.json","utf8"));
const donorBundle=readFileSync(packedManifest.pack.file,"utf8");
assert.match(donorBundle,/setMysterySet:\(set,\{step=0\}=\{\}\)=>/,"Canonical runtime must expose in-place mystery-set switching");
assert.match(donorBundle,/\['joyful','sorrowful','glorious'\]\.includes\(set\)/,"Reject nontraditional sets in 15-decade API");
assert.match(donorBundle,/S\.rosarySet=set;[\s\S]{0,100}labRosarySteps\(set\)/,"Reuse canonical Rosary data and render path");

for(const marker of ["data-p435930-rosary-method-launch","function launchTraditionalRosaryMethod(method)","api.setMethod(method)"]){
 assert.ok(runtime.includes(marker),"Method picker not integrated: "+marker);
}
assert.match(donorBundle,/setMethod:\(method\)=>/,"Method setting must be owned by the canonical donor");
const extracted=donorBundle.match(/function labRosarySteps\(set\)\{([\s\S]*?)\n\}\nfunction labRosaryDevotionalStep/);
assert.ok(extracted,"Canonical step builder must remain extractable");
const compileSteps=new Function("S","labRosaryIds","AO_ROSARY_DEPTH","AO_MONTFORT_FRUITS",
 "return function labRosarySteps(set){"+extracted[1]+"\n}");
const mockIds=set=>Array.from({length:5},(_,i)=>({joyful:"joy",sorrowful:"sor",glorious:"glo"})[set]+(i+1));
const expectedIds=["joy","sor","glo"].flatMap(prefix=>Array.from({length:5},(_,i)=>prefix+(i+1)));
for(const id of expectedIds)assert.ok(donorBundle.includes(id+":["),"Missing Montfort mystery fruit "+id);
const fruits=Object.fromEntries(expectedIds.map(id=>[id,["grâce","grace"]]));
const build=method=>compileSteps({rosaryMethod:method,rosaryForm:"standard",rosaryFatima:true},
 mockIds,{},fruits)("joyful");
const normal=build("ordinary"),dom=build("dominican"),mont=build("montfort");
assert.equal(normal.length,78,"Unchanged normal five-decade reader");
assert.deepEqual(normal.slice(0,3).map(x=>x.key),["sign","credo","pater"]);
assert.equal(normal.at(-1).kind,"conclusion");
assert.equal(dom.length,74,"Dominican opening and conclusion replace, not repeat, standard prayers");
assert.deepEqual(dom.slice(0,4).map(x=>x.kind),["prayer","dominican-opening","prayer","mystery"]);
assert.equal(dom.at(-1).kind,"dominican-conclusion");
assert.equal(dom.filter(x=>x.key==="credo").length,0);
assert.equal(dom.filter(x=>x.key==="ave").length,50);
assert.equal(mont.length,89,"Montfort opening plus offering and fruit petition per decade");
assert.equal(mont.filter(x=>x.kind==="montfort-opening").length,1);
assert.equal(mont.filter(x=>x.kind==="montfort-offering").length,5);
assert.equal(mont.filter(x=>x.kind==="montfort-fruit").length,5);
assert.equal(mont.filter(x=>x.key==="ave"&&x.bead>0).length,50);
for(const set of ["joyful","sorrowful","glorious"]){
 const steps=compileSteps({rosaryMethod:"montfort",rosaryForm:"standard",rosaryFatima:true},mockIds,{},fruits)(set);
 assert.equal(steps.filter(x=>x.kind==="montfort-offering").length,5);
 assert.equal(steps.filter(x=>x.kind==="montfort-fruit").length,5);
}
assert.ok(donorBundle.indexOf("rosary-dom-collect")<donorBundle.indexOf("rosary-dom-assistance"),"Dominican closing order");
assert.match(donorBundle,/AO_ROSARY_METHOD_SOURCE\.montfort/,"Original French source link must be retained");

console.log("PASS Divine Mercy 62 canonical prayers, optional 63rd, full 15 mystery Rosary plan, source-gated method selection");
