import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {loadTenebraeHour,compileTenebraeHour,TENEBRAE_EXPECTED_PSALMS,resetTenebraeSourceCache} from "../src/pray/tenebrae-1960.js";
import {renderTenebraeBody} from "../src/pray/tenebrae-presentation.js";

resetTenebraeSourceCache();
let sourceReads=0;
const localFetch=async url=>{
 sourceReads++;
 let content=null;
 try{content=readFileSync(url,"utf8")}catch{}
 return {
  ok:content!==null,status:content===null?404:200,
  text:async()=>content,
  json:async()=>JSON.parse(content)
 };
};
let full=0;
for(let day=0;day<3;day++){
 for(const hour of ["MATINS","LAUDS"]){
  const model=await loadTenebraeHour({dayIndex:day,hour,fetchImpl:localFetch});
  assert.equal(model.schema,"ao.tenebrae.1960.hour-reader.v1");
  assert.equal(model.dayIndex,day);
  assert.equal(model.hour,hour);
  assert.equal(model.steps.length,hour==="MATINS"?32:10);
  assert.equal(model.textsCompleteForSourceDerivedReading,true);
  assert.equal(model.printEditionCriticallyCertified,false);
  assert.equal(model.parishRitualCeremonyCertified,false);
  assert.ok(model.steps.every(x=>x.latin.length>10&&x.en.length>10&&x.fr.length>10));
  assert.ok(model.steps.every(x=>!/^[@$&]/m.test(x.latin+"\n"+x.en+"\n"+x.fr)),"Unresolved DO internal marker displayed");
  if(hour==="MATINS"){
   assert.equal(model.steps.filter(x=>x.kind==="PSALM").length,9);
   assert.equal(model.steps.filter(x=>x.kind==="LESSON").length,9);
   assert.equal(model.steps.filter(x=>x.kind==="RESPONSORY").length,9);
   assert.equal(model.steps.filter(x=>x.kind==="VERSICLE").length,3);
   assert.deepEqual(model.steps.filter(x=>x.kind==="PSALM").map(x=>x.metadata.psalm),TENEBRAE_EXPECTED_PSALMS.matins[day]);
   assert.ok(model.steps.filter(x=>x.kind==="LESSON").every(x=>x.latin.length>150));
   assert.ok(model.steps.filter(x=>x.kind==="RESPONSORY").every(x=>x.latin.length>90));
   assert.ok(model.steps.find(x=>x.id==="M.COLLECT").latin.includes("Réspice"));
   assert.ok(model.steps.find(x=>x.id==="M.PATER").en.includes("Our Father"));
   assert.ok(model.steps.every(x=>!x.latin.includes("&Gloria")),"Wrong Passiontide doxology");
  }else{
   assert.deepEqual(model.steps.filter(x=>x.kind==="PSALM").map(x=>x.metadata.psalm),TENEBRAE_EXPECTED_PSALMS.lauds[day]);
   assert.equal(model.steps.filter(x=>x.kind==="PSALM").length,5);
   assert.equal(model.steps.find(x=>x.id==="L.BENEDICTUS").metadata.psalm,231);
   assert.ok(model.steps.find(x=>x.id==="L.BENEDICTUS").latin.includes("Benedíctus"));
   assert.ok(model.steps.find(x=>x.id==="L.PATER").fr.includes("Notre Père"));
   assert.ok(model.steps.find(x=>x.id==="L.COLLECT").latin.includes("Réspice"));
   assert.ok(model.steps.find(x=>x.id==="L.CHRISTUS").latin.includes("Christus"));
   if(day===1)assert.ok(model.steps.find(x=>x.id==="L.CHRISTUS").latin.includes("mortem autem crucis"));
   if(day===2){
    const cant=model.steps.find(x=>x.metadata?.psalm===226);
    assert.ok(cant.latin.includes("32:27"));
    assert.ok(!cant.latin.includes("32:28"));
    assert.ok(model.steps.find(x=>x.id==="L.CHRISTUS").latin.includes("propter quod"));
   }
  }
  const html=renderTenebraeBody({day,hour,index:0,data:model,french:day===1,face:"vernacular"});
  assert.ok(html.includes("aoTenebReading")&&html.includes('data-p435930-tenebrae-day="2"'));
  assert.ok(html.includes(model.steps[0][day===1?"fr":"en"].slice(0,16).replace(/&/g,"&amp;")));
  assert.ok(!html.includes("data-ao-replace-all"));
  full++;
 }
}
assert.equal(full,6);
assert.ok(sourceReads>=9&&sourceReads<=45,"Local source caching not applied: "+sourceReads);
const failed=renderTenebraeBody({error:"Source missing"});
assert.ok(failed.includes('role="alert"')&&!failed.includes('data-tenebrae-section'));
await assert.rejects(()=>loadTenebraeHour({dayIndex:0,hour:"VESPERS",fetchImpl:localFetch}),/Unknown Tenebrae Office/);
console.log("Tenebrae full source-native reader: PASS — 6/6 aligned LAT/EN/FR offices; 32 Matins + 10 Lauds steps daily, original Psalter/canticles, 1960 timing and edition holds.");
