import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {CONFESSION_PATHS,confessionExtendedSections,confessionExaminationCards,confessionRiteCards,confessionAfterCards} from "../src/pray/confession-paths.js";
import {ADORATION_FOUR_OPTIONAL_SOURCE_IDS} from "../src/pray/adoration-four-purpose-options.js";
import {JOSEPH_SEVEN_PRAYERS_B24,JOSEPH_SEVEN_CLOSURE_B24,JOSEPH_SEVEN_STEP_COUNT_B24,josephSevenStepAt} from "../src/pray/st-joseph-seven-sorrows-joys-b24.js";
import {FIVE_WOUNDS_CHAPLET_V1,fiveWoundsStep,fiveWoundsGroupProgress} from "../src/pray/five-wounds-chaplet.v1.js";
import {PRECIOUS_BLOOD_MYSTERIES_V1,PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1,PRECIOUS_BLOOD_TOTALS_V1,preciousBloodPrayerAt} from "../src/pray/precious-blood-chaplet.v1.js";
import {divineMercySteps,mercyStepText} from "../src/pray/devotional-methods-v1.js";

const canonical=DATA.prayers;
const source=(id)=>{const p=canonical[id];assert.ok(p,"Missing canonical source: "+id);return p;};
const allFaces=(id)=>{const p=source(id);for(const language of ["en","fr"]){const face=prayerSourceFacesV1(p,language);assert.ok(face.vernacular||face.latin,id+" blank in "+language);if(face.vernacular)assert.equal(face.vernacular,p[face.vernacularLanguage]);}};
const onlySource=(x,id)=>assert.ok(typeof x==="string"&&x.trim().length>0,"Missing text: "+id);

// Confession: verify all three entire examination paths in BOTH existing languages
// and the priest-only rite guidance. These are preparatory cards, not an app confession.
assert.deepEqual(Object.keys(CONFESSION_PATHS).sort(),["general","regular","returning"]);
let examinationCards=0,riteCards=0;
for(const [locale,witness] of [["en",DATA.exam],["fr",DATA.examFr]]){
 assert.equal(witness.sections.length,10,locale+" Ten Commandments");
 for(const path of Object.keys(CONFESSION_PATHS)){
  const sections=confessionExtendedSections(witness.sections,{path,french:locale==="fr"});
  const cards=confessionExaminationCards(path,sections);
  assert.ok(cards.length>=5,locale+" "+path+" examination stages");
  for(const card of cards){
   onlySource(card.id,locale+" "+path+" card id");
   if(card.kind==="questions"){
    onlySource(card.title,locale+" "+path+" question title");
    assert.ok(card.questions.length>0&&card.questions.every(q=>typeof q==="string"&&q.trim()),"Missing examination prompt");
   }else{
    onlySource(card[locale==="fr"?"bodyFr":"bodyEn"],locale+" "+path+" reflection");
   }
  }
  examinationCards+=cards.length;
  const rite=confessionRiteCards(path);
  assert.ok(rite.length>=3,"Missing rite rehearsal");
  for(const card of rite){
   onlySource(card[locale],locale+" "+path+" rite title");
   onlySource(card[locale==="fr"?"bodyFr":"bodyEn"],locale+" "+path+" rite explanation");
   if(card.role==="priest"&&card.latin)onlySource(card.latin,"priest-only Latin excerpt");
  }
  riteCards+=rite.length;
 }
 for(const card of confessionAfterCards())onlySource(card[locale==="fr"?"bodyFr":"bodyEn"],locale+" post-Confession guidance");
}
for(const id of ["sacrament_come_holy_spirit","sacrament_act_of_contrition","foundations_glory_be"])allFaces(id);

// Adoration: source-owned Seven-prayer Treasury and optional Four Ends have
// source text in the original corpus rather than invented stage translations.
const treasury=["foundations_prayer_of_adoration","adoration_anima_christi","adoration_spiritual_communion","adoration_lord_i_am_not_worthy","benediction_o_salutaris","benediction_tantum_ergo","adoration_litany_blessed_sacrament"];
for(const id of treasury)allFaces(id);
assert.deepEqual(Object.keys(ADORATION_FOUR_OPTIONAL_SOURCE_IDS).sort(),["adoration","petition","reparation"]);
let fourSources=0;
for(const ids of Object.values(ADORATION_FOUR_OPTIONAL_SOURCE_IDS)){
 for(const id of ids){
  const p=source(id);allFaces(id);
  assert.ok(p.provenance?.url,"Four Ends historical option needs an actual source URL: "+id);
  fourSources++;
 }
}
assert.equal(fourSources,3);

// Seven Sorrows/Joys: the seven original *English-only* supplications must
// remain untouched while repeated canonical Our Father/Ave/Gloria are trilingual.
assert.equal(JOSEPH_SEVEN_STEP_COUNT_B24,8);
assert.equal(JOSEPH_SEVEN_PRAYERS_B24.length,7);
for(let i=0;i<7;i++){
 const step=josephSevenStepAt(i,canonical);
 assert.equal(step.type,"pair");
 assert.equal(step.repetitions.length,3);
 assert.equal(step.prayer.sourceTextEn,JOSEPH_SEVEN_PRAYERS_B24[i].sourceTextEn);
 onlySource(step.prayer.sourceTextEn,"Joseph supplication "+i);
 for(const rec of step.repetitions)for(const k of ["en","fr","la"])assert.equal(rec[k],source(rec.id)[k]);
}
assert.equal(josephSevenStepAt(7,canonical).closure,JOSEPH_SEVEN_CLOSURE_B24);
for(const key of ["antiphon","versicle","response","collect"])onlySource(JOSEPH_SEVEN_CLOSURE_B24[key],"Joseph final "+key);

// Five Wounds: thirty consecutive source-backed beads, 5 groups of 5 Gloria
// plus an Ave; prove all 90 exact EN/FR/LA displayed prayer faces.
assert.equal(FIVE_WOUNDS_CHAPLET_V1.length,30);
for(let i=0;i<30;i++){
 const progress=fiveWoundsGroupProgress(i);
 assert.equal(progress.group,Math.floor(i/6)+1);
 for(const language of ["en","fr","la"]){
  const step=fiveWoundsStep(i,language);
  assert.ok(step,"Five Wounds missing "+i+" "+language);
  assert.equal(step.text,source(step.prayerId)[language]);
 }
}

// Precious Blood: the selected preference never manufactures French historical
// responses, nor Latin for its 1910 English-only concluding prayer.
assert.equal(PRECIOUS_BLOOD_MYSTERIES_V1.length,7);
assert.equal(PRECIOUS_BLOOD_TOTALS_V1.pater,33);
assert.equal(PRECIOUS_BLOOD_TOTALS_V1.gloria,7);
let bloodTextFaces=0;
for(let i=0;i<7;i++){
 for(const language of ["en","fr","la"]){
  const mystery=PRECIOUS_BLOOD_MYSTERIES_V1[i];
  for(let pos=0;pos<=mystery.pater+1;pos++){
   const prayer=preciousBloodPrayerAt(i,pos,language);
   assert.ok(prayer&&prayer.text?.trim(),"Precious Blood missing "+i+"/"+pos+" "+language);
   if(prayer.kind==="versicle"){
    assert.equal(prayer.language,language==="en"?"en":"la","Source must be marked as the historical language");
    assert.equal(prayer.text,PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1.repeatedResponse[prayer.language]);
   }else{
    assert.equal(prayer.language,language);
    assert.equal(prayer.text,source(prayer.sourceId)[language]);
   }
   bloodTextFaces++;
  }
 }
}
onlySource(PRECIOUS_BLOOD_HISTORICAL_PRAYERS_V1.closingBloodPrayerEn,"1910 English-only conclusion");

// Mercy: preserve all 62 ordinary prayer steps and the optional 63rd,
// with a real English and French text on every stage.
for(const includeClosing of [false,true]){
 const steps=divineMercySteps({includeClosing});
 assert.equal(steps.length,includeClosing?63:62);
 for(const [i,step] of steps.entries())for(const language of ["en","fr"])onlySource(mercyStepText(step,language),"Mercy "+i+" "+language);
}

// Reader-level proof of the previously hidden mixed-source language exception.
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const blood=runtime.slice(runtime.indexOf("function renderPreciousBlood(){"),runtime.indexOf("function renderLittleCrown(){"));
assert.ok(blood.includes('data-ao-blood-mixed-source-language'));
assert.ok(blood.includes("sourceLanguageNotice+contents"),"Mixed historic text label must actually be visible in the stage");
assert.ok(blood.includes("s.latin||fr?hist.opening.la:hist.opening.en"),"Historical opening Latin remains original in French");
assert.ok(blood.includes("const closingEng=hist.closingBloodPrayerEn"),"1910 English conclusion remains original, even in Latin mode");
assert.ok(blood.includes("lang=\"en\""),"English-only conclusion must be labelled English");
assert.ok(runtime.includes("function renderConfession()")&&runtime.includes("function renderAdoration()"));
console.log("PASS · all Confession paths in EN/FR, Seven Adoration Treasury prayers, three Four Ends historical sources, eight Joseph steps, 30×3 Five Wounds faces, "+bloodTextFaces+" Precious Blood positions, and 62/63 Mercy steps source-checked without invented translations");
