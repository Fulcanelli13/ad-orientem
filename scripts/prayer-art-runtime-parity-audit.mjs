import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {DAILY_GUIDED_STEPS,NIGHTLY_EXAMEN_CARDS} from "../src/pray/guided-daily-cards.js";
import {CONFESSION_PATHS,confessionRiteCards,confessionAfterCards,confessionExaminationCards} from "../src/pray/confession-paths.js";
import {resolveArtworkRuntimeIdentity as resolve,PRAYER_ART_RUNTIME_IDENTITY_VERSION} from "../src/pray/artwork-runtime-identity.v1.js";
import {isEditorialArtworkPlacementApproved} from "../src/pray/artwork-approval-policy.v1.js";

/**
 * Source-linked, non-visual Prayer artwork runtime inventory.
 * Does not claim browser screenshot parity or publication-quality image assets.
 */
const read=name=>readFileSync(name,"utf8");
const editorial=JSON.parse(read("data/prayer/artwork-editorial-20261030/balanced-reuse-20261030-assignments.v2.json"));
const overlay=JSON.parse(read("data/prayer/artwork-editorial-20261030/cross-prayer-inheritance-20261030.v1.json"));
const q2=JSON.parse(read("data/prayer/artwork-editorial-20261030/decision-ledger-b01-b05.v1.json"));
const b611=JSON.parse(read("data/prayer/artwork-editorial-20261030/approved-unified-b06-b11-from-user-message.v1.json"));
const positive=new Set(["USER_APPROVED","USER_APPROVED_EXISTING_SAINTS_SELECTION","USER_APPROVED_20261030_NEW_ARTWORK_REUSE","USER_FINAL_LOCKED"]);
const sourceApprovedIds=new Set([
 ...q2.records.filter(x=>x.prayer_editorial_status==="ACCEPTED_FOR_PRAYER_REVIEW").map(x=>x.artwork_id),
 ...b611.decisions.filter(x=>x.status==="ACCEPTED_AS_SHOWN_IN_UNIFIED_REVIEW").map(x=>x.artwork_id),
 ...editorial.slots.flatMap(slot=>slot.works.filter(w=>positive.has(w.editorial)).map(w=>w.id))
]);
const placementApproved=w=>isEditorialArtworkPlacementApproved(w,{sourceArtIdApproved:sourceApprovedIds.has(w.id)});
const slots=new Map(editorial.slots.map(s=>[s.slot_id,s]));
const runtime=read("src/pray/presentation-runtime.js");
const novenaRuntime=read("src/pray/novena-runtime.js");
const traditionalRuntime=read("src/pray/traditional-pray-runtime.js");
const lazyRegistry=read("src/pray/lazy-module-registry.js");
assert.equal(slots.size,267);
assert.equal(placementApproved({id:"never",eligible:true,editorial:"NEW_CANDIDATE_NOT_USER_APPROVED"}),false,"Approval must not be substring-based");
assert.equal(placementApproved({id:"never",eligible:true,editorial:"USER_APPROVED_CROSS_PRAYER_REUSE"}),false,"Cross-prayer reuse requires an affirmatively approved work ID");
assert.ok(runtime.includes('stampArtworkRuntimeIdentity(m,'));
assert.ok(runtime.includes('stampArtworkRuntimeIdentity(shell,'));
assert.ok(novenaRuntime.includes("stampArtworkRuntimeIdentity(m,"));
assert.ok(traditionalRuntime.includes("stampArtworkRuntimeIdentity(m,"));
assert.ok(novenaRuntime.includes("function stages(n){const p=novenaPattern(n);"));
assert.ok(runtime.includes("const BEN_STAGES=["));
assert.ok(runtime.includes("const STATION_DATA="));
const rows=[];
const add=(owner,card,slotStatus="CHECK")=>{
 const {key,slot,fit,publicationReady,assetUrl}=card;
 const found=slot?slots.get(slot):null;
 if(slot && !found && !slot.startsWith("SEM-"))throw Error("Artwork slot missing from editorial blueprint: "+key+" => "+slot);
 rows.push({owner,key,slot,fit,hasEditorialSlot:!!found,approvedArtworkInSlot:!!found?.works.some(placementApproved),status:slotStatus});
 assert.equal(publicationReady,false);
 assert.equal(assetUrl,null);
 return card;
};
for(const id of Object.keys(PRAY_CANONICAL_DATA_V435930.prayers)){
 add("canonical",resolve({owner:"presentation",view:"prayerOnly",prayerId:id}));
}
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
function novenaPattern(n){return n.pattern||(n.id==="immaculate_conception"?"OPENING_DAY_COMMON_CLOSE":"STANDARD")}
function novenaStages(n){const p=novenaPattern(n);return p==="HAMMER_MARIAN"?6:p==="OPENING_DAY_COMMON_CLOSE"?5:p==="COMMON_BEFORE_REPEAT"?4:(n.sharedClosingText?5:4)}
let novenaStagesTotal=0;
for(const n of Object.values(NOVENA_CORPUS_V4)){
 assert.equal(n.days.length,9,n.id);
 add("novena-cover",resolve({owner:"novena",id:n.id,screen:"detail",day:1}));
 for(let day=1;day<=9;day++){
  add("novena-simple-day",resolve({owner:"novena",id:n.id,screen:"day",day,stage:0,mode:"simple"}),"SAME_DAY_COVER_REUSED_NOT_EXACT_SCENE");
  for(let stage=0;stage<novenaStages(n);stage++){
   add("novena-guided-stage",resolve({owner:"novena",id:n.id,screen:"day",day,stage,mode:"guided"}),"STAGE_DEPENDENT_ART_NOT_VERIFIED");
   novenaStagesTotal++;
  }
 }
}
assert.equal(novenaStagesTotal,648,"Novena pattern/stage parity changed");
for(let i=0;i<14;i++)add("stations",resolve({view:"stations",step:i}),"EXACT_EVENT");
for(let i=0;i<7;i++)add("benediction",resolve({view:"benediction",step:i}));
for(let i=0;i<7;i++)add("penitential",resolve({view:"penitential",step:i}),"EXACT_PSALM");
for(let i=0;i<7;i++)add("seven-words",resolve({view:"sevenWords",step:i}),"EXACT_WORD");
for(let i=0;i<6;i++)add("forty-hours",resolve({view:"fortyHours",step:i}),"COVER_ONLY");
for(let i=0;i<5;i++)add("first-friday",resolve({view:"firstFriday",step:i}),"PROGRAMME_SHARED_POOL");
for(let i=0;i<6;i++)add("first-saturday",resolve({view:"firstSaturday",step:i}),"PROGRAMME_SHARED_POOL");
for(const [set,count] of [["joyful",5],["sorrowful",5],["glorious",5],["luminous",5]]){
 for(let i=0;i<count;i++){
  add("first-saturday-meditation",resolve({view:"fsMeditation",set,mystery:i}),set==="luminous"?"OPTIONAL_SEMANTIC_NOT_RUNTIME_BOUND":"ROSARY_MYSTERY_EVENT");
  add("rosary-mystery-reference",resolve({view:"rosary",set,mystery:i}),set==="luminous"?"OPTIONAL_SEMANTIC_NOT_RUNTIME_BOUND":"DONOR_STEPS_STILL_DYNAMIC");
 }
}
for(const part of ["morning","evening"]){
 const cards=DAILY_GUIDED_STEPS[part];
 for(const [i,card] of cards.entries()){
  const id=card.kind==="examination"?null:card.id;
  add("traditional-daily",resolve({owner:"traditional",route:"pray.morning_evening",daypart:part,dailyStep:i,stepPrayerId:id}),"SHARED_CANONICAL_OR_EXAMEN");
 }
}
for(let i=0;i<NIGHTLY_EXAMEN_CARDS.length;i++)add("traditional-examen",resolve({owner:"traditional",route:"pray.nightly_examen",examenStep:i}),"COVER_ONLY");
assert.deepEqual(Object.keys(CONFESSION_PATHS).sort(),["general","regular","returning"]);
const pathDetails={};
for(const path of Object.keys(CONFESSION_PATHS)){
 const cards=confessionExaminationCards(path,PRAY_CANONICAL_DATA_V435930.exam.sections);
 pathDetails[path]={examination:cards.length,rite:confessionRiteCards(path).length,after:confessionAfterCards().length};
}
for(let i=0;i<4;i++)add("confession",resolve({view:"confession",step:i,path:"regular"}),"BROAD_STAGE_NOT_SUBCARD");
const blessing=resolve({view:"benediction",step:4});
assert.equal(blessing.fit,"EXACT_BLESSING_ART_MISSING");
assert.equal(resolve({view:"rosary",set:"joyful",mystery:null}).slot,"COV-pray.rosary");
assert.equal(resolve({view:"prayerOnly",prayerId:"litany_loreto_current"}).slot,"COV-litany_loreto_1962");
const holyName=resolve({owner:"traditional",route:"pray.holy_name_litany"});
assert.equal(holyName.slot,"COV-devotion_consecration_christ_king");
assert.equal(holyName.fit,"APPROVED_CHRIST_PORTRAIT_CONTEXTUAL_REUSE_NOT_EXACT_HOLY_NAME_DEPICTION");
assert.equal(holyName.publicationReady,false);
assert.ok(slots.get(holyName.slot).works.some(w=>w.eligible&&w.editorial==="USER_APPROVED"&&w.title==="Salvator Mundi"));
add("traditional-holy-name",holyName,"CONTEXTUAL_APPROVED_CHRIST_PORTRAIT_REUSE");
assert.ok(!editorial.slots.find(s=>s.slot_id==="COV-novena.st_therese").works.some(w=>w.eligible&&/USER_APPROVED|USER_FINAL_LOCK/.test(w.editorial)));
const chaplets=["pray.divine_mercy","pray.five_wounds","pray.precious_blood","pray.little_crown","prayer.seven_sorrows_chaplet"];
const absentModularRoutes=chaplets.filter(id=>![runtime,traditionalRuntime,novenaRuntime,lazyRegistry].some(src=>src.includes("'"+id+"'")||src.includes('"'+id+'"')));
const dynamicRoutes=["Angelus text units / form-specific paragraphs","Litany of Saints dynamically paginated historical witness","Rosary donor actual bead-step count and optional Luminous joins"];
assert.equal(rows.filter(x=>!x.hasEditorialSlot&&x.slot?.startsWith("SEM-")).length,10);
const count=kind=>rows.filter(x=>x.owner===kind).length;
const output={
 schema:"AO_PRAYER_RUNTIME_ARTWORK_PARITY_AUDIT_V1",
 version:PRAYER_ART_RUNTIME_IDENTITY_VERSION,
 generatedFrom:"src/pray runtime owners + canonical corpus + artwork blueprint",
 counts:{
  canonicalPrayers:count("canonical"),
  novenas:Object.keys(NOVENA_CORPUS_V4).length,
  novenaDayViews:count("novena-simple-day"),
  novenaGuidedDayStages:count("novena-guided-stage"),
  stations:count("stations"),
  benedictionSteps:count("benediction"),
  dailyPrayerSteps:count("traditional-daily"),
  nightlyExamenSteps:count("traditional-examen"),
  firstSaturdayMeditationMysteries:count("first-saturday-meditation")
 },
 confidence:"STATIC_SOURCE_INVENTORY_AND_DOM_STAGE_STAMPS_ONLY_NOT_BROWSER_OR_IMAGE_VALIDATION",
 pathDetails,
 blocked:{
  exactBenedictionBlessing:true,
  saintThereseApprovedPortrait:false,
  holyNameLitanyArtworkSlotMissing:false,
  holyNameLitanyArtworkContextualOnly:true,
  chapletRoutesNotInModularOwners:absentModularRoutes,
  dynamicStagesNotExhaustivelyEnumerated:dynamicRoutes,
  rightsAndNativePhotoQualityCertified:false,
  publishedSelectedImages:false,
  fullReaderCardImageParity:false
 },
 preservedRules:overlay.contract,
 sampleGaps:rows.filter(x=>x.fit.includes("MISSING")||x.fit==="SAINT_THERESE_UNAPPROVED_IMAGE_SOURCE").slice(0,12).map(x=>({key:x.key,slot:x.slot,fit:x.fit}))
};
assert.deepEqual(absentModularRoutes,chaplets);
console.log(JSON.stringify(output,null,2));
