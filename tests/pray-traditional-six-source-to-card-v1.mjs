import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {SACRED_HEART_DEVOTIONS_V382,COMMUNION_TREASURY_V383,MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381} from "../src/pray/traditional-pray-data.js";
import {B01_FULL_GRACE_1888,B01_SHORT_GRACE_CATECHISM,B01_PIUS_X_1905_CONTRITION,B01_FRENCH_HOPE_TRADITION} from "../src/pray/icksp-batch01-public.v1.js";
import {GOLDEN_ARROW_REPARATION_V1} from "../src/pray/icksp-golden-arrow-reparation.v1.js";
import {NIGHTLY_EXAMEN_CARDS,guidedDailyCards,clampPrayerCardStep} from "../src/pray/guided-daily-cards.js";
import {defaultPersonalDailyPrefs,buildPersonalDailyPlan} from "../src/pray/daily-personal-rule.js";
import {personalDailyPrayerCard} from "../src/pray/daily-personal-prayer-view.js";

const code=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const lib=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const personal=readFileSync(new URL("../src/pray/daily-personal-prayer-view.js",import.meta.url),"utf8");
const canonical=PRAY_CANONICAL_DATA_V435930.prayers;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const plain=x=>String(x??"").replace(/<br\s*\/?>/gi," ").replace(/<[^>]*>/g," ")
 .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#039;/g,"'")
 .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g,"").normalize("NFC");
const visible=(html,text,label)=>assert.ok(plain(html).includes(plain(text)),label+" original missing from rendered card");
function section(source,start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a,"Actual renderer not found: "+start);
 return source.slice(a,b);
}
let language="en",checks=0;
const S={hopeFrenchEdition:"published",mealStep:0,mealForm:"short",examenStep:0,
 examenContrition:"standard",returnToDaily:false,sacredHeart:"litany",
 communion:"before",communionStep:0};
const env={
 S,esc,nl,prayerSourceFacesV1,
 isFr:()=>language==="fr",L:(en,fr)=>language==="fr"?(fr||en):en,
 data:()=>({prayers:canonical}),
 prayerTitle:(p,id)=>language==="fr"?(p.titleFr||p.title||id):(p.title||id),
 head:title=>'<h1>'+esc(title)+'</h1>',
 source:(label,url)=>'<details data-original-source><summary>'+esc(label)+'</summary><span>'+esc(url)+'</span></details>',
 traditionalContextGuide:()=>"",
 guidedCardFrame:({id,title,body})=>'<section data-guided-card="'+esc(id)+'"><h2>'+esc(title)+'</h2>'+body+'</section>',
 clampPrayerCardStep,NIGHTLY_EXAMEN_CARDS,
 B01_FULL_GRACE_1888,B01_SHORT_GRACE_CATECHISM,B01_PIUS_X_1905_CONTRITION,B01_FRENCH_HOPE_TRADITION,
 GOLDEN_ARROW_REPARATION_V1,SACRED_HEART_DEVOTIONS_V382,COMMUNION_TREASURY_V383,
 communionPurposePicker:()=>'<section data-source-purpose-control></section>'
};
const actual=[
 section(code,"const prayerParagraphs=","const data=()=>"),
 section(code,"function existingLatinSwitch(","function prayerRows("),
 section(code,"function renderNightlyExamen(){","function renderMealPrayers(){"),
 section(code,"function renderMealPrayers(){","function sourcedPrayerCard("),
 section(code,"function sourcedPrayerCard(","const HEART_STAGES="),
 section(code,"const HEART_STAGES=","const COMMUNION_BEFORE="),
 section(code,"const COMMUNION_BEFORE=","function massFolioPrayerStages()"),
 section(code,"function communionStages(){","function communionPurposePicker("),
 section(code,"function renderCommunionTreasury(){","const GOOD_DEATH_STAGES=")
].join("\n");
const r=new Function("env","with(env){"+actual+
 "\nreturn {prayerCard,sourcedPrayerCard,renderMealPrayers,renderNightlyExamen,renderSacredHeart,renderCommunionTreasury,COMMUNION_BEFORE,COMMUNION_AFTER};}")(env);
// The canonical library has specialised Holy Card and choir UI; this bounded
// test uses its actual ordinary prayerBlock branch, not a blanket UI claim.
const originalLibrary=new Function("env","with(env){"+
 section(lib,"function prayerBlock(id,opts={}){","function selectedDateKey(){")+
 "\nreturn prayerBlock;}")({
 ...env,P:id=>canonical[id],lang:()=>language,view:"home",
 callout:msg=>'<p>'+msg+'</p>',
 ESSENTIAL_HOLY_CARD_IDS_V1:[],CHOIR_SOURCE_IDS:[],PRAYER_LIBRARY_LATIN_PREF:{active:false},
 sourceLine:p=>'<small data-source-id="'+esc(p.id)+'"></small>',
 prayerScriptureOrigin:()=>null,scriptureContextCapsule:()=>"",
 nl
});
for(const p of Object.values(canonical)){
 for(const lang of ["en","fr"]){
  language=lang;
  const face=prayerSourceFacesV1(p,lang),html=originalLibrary(p.id,{record:p});
  visible(html,face.vernacular||face.latin,"Library "+p.id+" "+lang);
  if(face.vernacular&&face.latin){
   visible(html,face.latin,"Library Latin "+p.id);
   assert.ok(html.includes('data-face-v lang="'+face.vernacularLanguage+'"'));
   assert.ok(html.includes('data-face-la lang="la" hidden'));
  }else assert.ok(!html.includes('data-p435930-flip'),"False Latin language switch: "+p.id);
  if(face.fallback)assert.ok(html.includes("aoP435930SourceLanguageNotice"));
  checks++;
 }
}
assert.equal(Object.keys(canonical).length,48);
assert.equal(canonical.marian_consecration_immaculate_heart.fr,undefined);
// Actual source selection and card output across the two daily Prayer routines,
// three source languages and 1905/1913 manual edition choices.
for(const daypart of ["morning","evening"]){
 const legacy=daypart==="morning"?MORNING_PRAYER_SEQUENCE_V381:EVENING_PRAYER_SEQUENCE_V381;
 assert.deepEqual(guidedDailyCards(daypart).map(x=>x.id),legacy.map(x=>x[0]));
 for(const lang of ["en","fr","la"]){
  language=lang==="fr"?"fr":"en";
  for(const edition of ["1905","1913"]){
   const plan=buildPersonalDailyPlan({daypart,prefs:{...defaultPersonalDailyPrefs(lang),edition}});
   assert.ok(plan.rows.length>=3);
   for(const row of plan.rows.filter(x=>x.kind==="personal-prayer")){
    const html=personalDailyPrayerCard(row,{...plan,direct:true},{
     esc,L:env.L,prayerParagraphs:v=>'<p>'+nl(v)+'</p>',source:env.source
    });
    assert.ok(html.includes('lang="'+row.language+'"'),"Daily original language missing "+row.id);
    if(row.text)visible(html,row.text,"Daily "+daypart+"/"+edition+"/"+lang+"/"+row.id);
    else assert.ok(html.includes("Exact text unavailable")||html.includes("Texte exact indisponible"));
    if(row.text&&row.latinText&&lang!=="la"&&row.text!==row.latinText){
     assert.ok(html.includes('data-face-la lang="la" hidden'));
     visible(html,row.latinText,"Daily Latin "+row.id);
    }
    checks++;
   }
  }
 }
}
assert.ok(personal.includes('data-face-v lang='));
assert.ok(personal.includes('data-face-la lang="la" hidden'));
assert.ok(code.includes('aoTP381Reader" lang='),"Released daily source face has no language label");
// Nightly Examen: actual reader stages, both real language bodies and distinct
// closing source choices, with the 1905 Italian witness labelled editorial.
for(const lang of ["en","fr"]){
 language=lang;
 for(let i=0;i<NIGHTLY_EXAMEN_CARDS.length;i++){
  S.examenStep=i;S.returnToDaily=false;S.examenContrition="standard";
  const html=r.renderNightlyExamen();
  visible(html,NIGHTLY_EXAMEN_CARDS[i][lang==="fr"?"bodyFr":"bodyEn"],"Examen "+lang+"/"+i);
  if(i===4){
   visible(html,canonical.sacrament_act_of_contrition[lang],"Canonical Act of Contrition");
   S.examenContrition="piusx";
   const historical=r.renderNightlyExamen();
   visible(historical,B01_PIUS_X_1905_CONTRITION[lang],"Historical Catechism contrition");
   assert.ok(historical.includes("data-ao-b01-contrition-source-status"));
  }
  checks++;
 }
}
// Grace at meals: before and three after-meal alternative complete witnesses.
for(const lang of ["en","fr"]){
 language=lang;S.mealStep=0;S.mealForm="short";
 visible(r.renderMealPrayers(),canonical.foundations_grace_before_meals[lang],"Grace before "+lang);
 checks++;
 for(const [mode,rec] of [
  ["short",canonical.foundations_grace_after_meals],
  ["catechism",B01_SHORT_GRACE_CATECHISM],
  ["full",B01_FULL_GRACE_1888]
 ]){
  S.mealStep=1;S.mealForm=mode;
  const html=r.renderMealPrayers();
  visible(html,rec[lang],"Grace after "+mode+"/"+lang);
  assert.ok(html.includes('data-ao-devo-card="meal-after"'));
  checks++;
 }
}
// Communion Treasury: 7 preparation + 4 thanksgiving positions, both user
// languages, with original Latin on every applicable source.
for(const lang of ["en","fr"]){
 language=lang;
 for(const phase of ["before","after"]){
  S.communion=phase;
  const stages=phase==="before"?r.COMMUNION_BEFORE:r.COMMUNION_AFTER;
  assert.equal(stages.length,phase==="before"?7:4);
  for(let i=0;i<stages.length;i++){
   S.communionStep=i;
   const id=stages[i][0],rec=canonical[id]||COMMUNION_TREASURY_V383[id];
   assert.ok(rec,"Unknown source "+id);
   const html=r.renderCommunionTreasury();
   assert.ok(html.includes('data-ao-devo-card="communion-'+phase+'-'+id+'"'));
   visible(html,rec[lang],"Communion "+id+"/"+lang);
   if(rec.la)visible(html,rec.la,"Communion Latin "+id);
   checks++;
  }
 }
}
// Sacred Heart: independent, complete Litany, Pius XI Act, Golden Arrow
// and Human-Race Consecration, without conflating their historical editions.
const heart={litany:SACRED_HEART_DEVOTIONS_V382.litany,
 reparation:canonical.sacred_heart_short_prayer,
 golden_arrow:GOLDEN_ARROW_REPARATION_V1,
 consecration:SACRED_HEART_DEVOTIONS_V382.humanRaceConsecration};
for(const lang of ["en","fr"]){
 language=lang;
 for(const [stage,rec] of Object.entries(heart)){
  S.sacredHeart=stage;
  const html=r.renderSacredHeart();
  assert.ok(html.includes('data-ao-devo-card="heart-'+stage+'"'));
  visible(html,rec[lang],"Sacred Heart "+stage+"/"+lang);
  if(rec.la)visible(html,rec.la,"Sacred Heart Latin "+stage);
  assert.ok(html.includes("data-ao-heart-direct-choices"));
  checks++;
 }
}
console.log("PASS · "+checks+" original-source-to-visible-card checks across 6 Prayer routes: Library 48×2, Morning/Evening 1905/1913 × EN/FR/LA, Examen 5×2, Meals 4×2, Communion 11×2 and Sacred Heart 4×2; Latin source identities and historical edition holds preserved");
