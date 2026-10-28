import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 DAILY_PERSONAL_RULE_STORAGE_KEY,PERSONAL_DAILY_SOURCE_COVERAGE,
 defaultPersonalDailyPrefs,normalizePersonalDailyPrefs,loadPersonalDailyPrefs,
 savePersonalDailyPrefs,personalDailyOptions,buildPersonalDailyPlan,
 changePersonalDailyPrefs,PERSONAL_BRIEF_PRAYER_IDS
} from "../src/pray/daily-personal-rule.js";
import {DAILY_PERSONAL_PRAYER_SOURCE_V1 as CORPUS} from "../src/pray/daily-personal-prayer-source.js";
import {APPROVED_DAILY_FORMULATION_MANIFEST_V1,DAILY_APPROVED_SEQUENCE_RELEASE_V1} from "../src/pray/daily-approved-formulations.js";
import {personalDailyPrayerCard,dailyPersonalSettings,dailyPersonalList,dailyPersonalProvenance} from "../src/pray/daily-personal-prayer-view.js";

assert.deepEqual(PERSONAL_DAILY_SOURCE_COVERAGE.languages,["la","en","fr"]);
assert.equal(PERSONAL_DAILY_SOURCE_COVERAGE.manualOptions,45);
assert.equal(CORPUS.additional.length,45);
assert.equal(new Set(CORPUS.additional.map(x=>x.id)).size,45);
for(const record of CORPUS.additional){
 assert.ok(["la","en","fr"].includes(record.lang));
 assert.ok(record.sourceImageChecked===true||record.sourceWebChecked===true,"Every optional item needs verified original print/page source");
 assert.match(record.sourceUrl,/^https:\/\//);
 assert.ok(record.text.length>30);
 assert.ok(record.sourceLabel);
}
for(const [edition,morning,evening] of [["1905",10,8],["1913",11,10]]){
 for(const [part,count] of [["morning",morning],["evening",evening]]){
  for(const language of ["en","fr","la"]){
   const prefs={...defaultPersonalDailyPrefs(language),edition};
   const p=buildPersonalDailyPlan({daypart:part,prefs});
   assert.equal(p.rows.length,count,edition+" "+part+" "+language);
   assert.equal(p.rows.filter(x=>x.kind==="personal-prayer").every(x=>x.text?.length>15),true);
   assert.equal(p.rows.every(x=>x.language===language||x.kind==="personal-examen"),true);
   assert.equal(new Set(p.rows.map(x=>x.id)).size,p.rows.length);
   assert.equal(p.rows.filter(x=>x.optional).length,0);
  }
 }
}
// Personal Brief is a curated subset of complete printed prayers, never
// a separate historical edition or a truncated combined offering prayer.
for(const [edition,expectedMorning,expectedEvening] of [["1913",6,5],["1905",6,4]]){
 for(const [daypart,count] of [["morning",expectedMorning],["evening",expectedEvening]]){
  for(const language of ["en","fr","la"]){
   const fullPrefs={...defaultPersonalDailyPrefs(language),edition};
   const full=buildPersonalDailyPlan({daypart,prefs:fullPrefs});
   const briefPrefs=changePersonalDailyPrefs(fullPrefs,{action:"length",value:"brief"});
   const brief=buildPersonalDailyPlan({daypart,prefs:briefPrefs});
   assert.equal(brief.rows.length,count);
   assert.equal(brief.length,"brief");
   assert.equal(brief.brief,true);
   assert.equal(brief.expanded,false);
   const expected=PERSONAL_BRIEF_PRAYER_IDS[edition][daypart];
   assert.deepEqual(brief.rows.map(x=>x.sourceId),expected);
   assert.deepEqual(brief.rows.map(x=>x.id),full.rows.filter(x=>expected.includes(x.sourceId)).map(x=>x.id),"Subset must preserve full historical order");
   for(const card of brief.rows){
    const source=full.rows.find(x=>x.id===card.id);
    assert.equal(card.text,source.text,"No partial prayer text in Brief");
    assert.equal(card.sourceUrl,source.sourceUrl,"Source provenance cannot be lost");
   }
   assert.equal(new Set(brief.rows.map(x=>x.id)).size,count);
   assert.equal(buildPersonalDailyPlan({daypart,prefs:changePersonalDailyPrefs(briefPrefs,{action:"length",value:"full"})}).rows.length,full.rows.length);
  }
 }
}
assert.ok(PERSONAL_BRIEF_PRAYER_IDS["1913"].morning.includes("daily-prayer"),"Combined Pius X Morning offering must remain whole");
assert.ok(PERSONAL_BRIEF_PRAYER_IDS["1913"].evening.includes("examen"),"1913 Nightly Examen handoff should remain available in Brief");
assert.ok(!PERSONAL_BRIEF_PRAYER_IDS["1905"].evening.includes("examen"),"Never invent a 1905 printed examination card");
const inherited=normalizePersonalDailyPrefs({version:1,edition:"1913",language:"fr",mode:"standard",variants:{morning:{},evening:{}},extras:{morning:[],evening:[]}});
assert.equal(inherited.length,"full","Existing saved routines without length must not silently become Brief");
assert.equal(normalizePersonalDailyPrefs({...defaultPersonalDailyPrefs(),length:"unknown"}).length,"full","Unexpected personal length fails closed");
let selectedBrief=changePersonalDailyPrefs(defaultPersonalDailyPrefs("en"),{action:"extra",daypart:"evening",value:"baltimore-1889-evening-in-manus"});
assert.equal(selectedBrief.mode,"expanded");
selectedBrief=changePersonalDailyPrefs(selectedBrief,{action:"length",value:"brief"});
assert.equal(buildPersonalDailyPlan({daypart:"evening",prefs:selectedBrief}).rows.length,5,"Saved extras must not make Brief longer");
assert.equal(selectedBrief.extras.evening.length,1,"Brief must not delete saved choices");
selectedBrief=changePersonalDailyPrefs(selectedBrief,{action:"length",value:"full"});
assert.equal(buildPersonalDailyPlan({daypart:"evening",prefs:selectedBrief}).rows.length,11,"Full must restore the saved optional prayer");
const initial=defaultPersonalDailyPrefs("en");
assert.equal(initial.edition,"1913");
assert.equal(initial.mode,"standard");
assert.equal(buildPersonalDailyPlan({daypart:"evening",prefs:initial}).rows.length,10);
const english=personalDailyOptions("morning","en","1913");
assert.ok(english.some(x=>x.sourceLabel.includes("Lasance")));
assert.equal(personalDailyOptions("morning","la","1913").length,0,"Latin must not import English-language morning texts");
assert.ok(personalDailyOptions("evening","fr","1913").some(x=>x.id==="piusx-1913-jesus-joseph-mary"));
assert.ok(!personalDailyOptions("evening","fr","1905").some(x=>x.id==="piusx-1913-jesus-joseph-mary"));
const nightSourceIds=["roman-compline-latin-in-manus","roman-compline-french-in-manus","roman-compline-latin-visita-quaesumus","roman-compline-latin-salva-nos"];
for(const id of nightSourceIds){
 const item=CORPUS.additional.find(x=>x.id===id);
 assert.ok(item&&item.kind==="additional"&&item.daypart==="evening"&&item.sourceWebChecked);
 assert.equal(item.sourceContextEn.length>60,true,"Seasonal and Office context must remain attached");
 assert.ok(!CORPUS.editions["1913"].dayparts.evening.some(x=>x.id===id));
}
assert.equal(personalDailyOptions("evening","la","1913").filter(x=>x.id.startsWith("roman-compline-")).length,3);
assert.equal(personalDailyOptions("evening","fr","1913").filter(x=>x.id.startsWith("roman-compline-")).length,1);
assert.equal(personalDailyOptions("evening","en","1913").filter(x=>x.id.startsWith("roman-compline-")).length,0,"Never infer an English translation for ICRSP Latin/French source");
const baltimoreId="baltimore-1889-evening-in-manus";
const baltimore=CORPUS.additional.find(x=>x.id===baltimoreId);
assert.ok(baltimore&&baltimore.lang==="en"&&baltimore.sourceWebChecked===true);
assert.match(baltimore.sourceLabel,/Baltimore, 1889/);
assert.equal(baltimore.sourceUrl,"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Evening_Prayers");
assert.equal(baltimore.text.split("\n").length,6,"Complete historical ordinary short responsory retains all six printed lines");
assert.equal((baltimore.text.match(/Into Thy hands, O Lord, I commend my spirit\./g)||[]).length,3);
assert.match(baltimore.text,/Thou hast redeemed us, O Lord, God of truth/);
assert.match(baltimore.text,/Glory be to the Father, and to the Son, and to the Holy Ghost/);
assert.equal(personalDailyOptions("evening","en","1913").filter(x=>x.id===baltimoreId).length,1);
assert.equal(personalDailyOptions("evening","la","1913").filter(x=>x.id===baltimoreId).length,0);
assert.equal(personalDailyOptions("evening","fr","1913").filter(x=>x.id===baltimoreId).length,0);
const baltimorePrefs=changePersonalDailyPrefs(defaultPersonalDailyPrefs("en"),{action:"extra",daypart:"evening",value:baltimoreId});
const baltimorePlan=buildPersonalDailyPlan({daypart:"evening",prefs:baltimorePrefs});
assert.equal(baltimorePlan.rows.length,11);
assert.equal(baltimorePlan.rows.at(-1).sourceId,baltimoreId);
assert.equal(baltimorePlan.rows.at(-1).sourceStatus,"complete-optional-liturgical-selection");
assert.match(baltimorePlan.rows.at(-1).sourceContextEn,/not the complete Office/);
assert.equal(buildPersonalDailyPlan({daypart:"evening",prefs:defaultPersonalDailyPrefs("en")}).rows.length,10,"Opt-in English Compline excerpt cannot alter St Pius X default");

for(const language of ["la","fr"]){
 const id=language==="la"?"roman-compline-latin-in-manus":"roman-compline-french-in-manus";
 const prefs=changePersonalDailyPrefs(defaultPersonalDailyPrefs(language),{action:"extra",daypart:"evening",value:id});
 const plan=buildPersonalDailyPlan({daypart:"evening",prefs});
 assert.equal(plan.rows.length,11);
 assert.equal(plan.rows.at(-1).sourceStatus,"complete-optional-liturgical-selection");
 assert.match(plan.rows.at(-1).text,/Redemísti nos|rachetés/);
 assert.match(plan.rows.at(-1).sourceContextEn,/Passiontide/);
 assert.equal(plan.rows.at(-1).id,"personal-extra-"+id);
}

const variant=english.find(x=>x.kind==="variant"&&x.slot==="faith");
assert.ok(variant);
let prefs=changePersonalDailyPrefs(initial,{action:"variant",daypart:"morning",value:variant.id});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.find(x=>x.sourceId==="faith").text,variant.text);
prefs=changePersonalDailyPrefs(prefs,{action:"variant",daypart:"morning",value:variant.id});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.find(x=>x.sourceId==="faith").replacementId,null);
const extra=english.find(x=>x.kind==="additional");
assert.ok(extra);
prefs=changePersonalDailyPrefs(initial,{action:"extra",daypart:"morning",value:extra.id});
assert.equal(prefs.mode,"expanded");
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.length,12);
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.at(-1).text,extra.text);
const second=english.find(x=>x.kind==="additional"&&x.id!==extra.id);
prefs=changePersonalDailyPrefs(prefs,{action:"extra",daypart:"morning",value:second.id});
prefs=changePersonalDailyPrefs(prefs,{action:"move",daypart:"morning",value:second.id+"|up"});
assert.deepEqual(prefs.extras.morning,[second.id,extra.id]);
prefs=changePersonalDailyPrefs(prefs,{action:"mode",value:"standard"});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.length,11);
prefs=changePersonalDailyPrefs(prefs,{action:"mode",value:"expanded"});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs}).rows.length,13);
const french=changePersonalDailyPrefs(prefs,{action:"language",value:"fr"});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs:french}).rows.length,11,"English manual texts must fail closed when French is selected");
const latin=changePersonalDailyPrefs(prefs,{action:"language",value:"la"});
assert.equal(buildPersonalDailyPlan({daypart:"morning",prefs:latin}).rows.length,11,"English manual texts must fail closed in Latin");
let evening=changePersonalDailyPrefs(initial,{action:"extra",daypart:"evening",value:"piusx-1913-jesus-joseph-mary"});
evening=changePersonalDailyPrefs(evening,{action:"extra",daypart:"evening",value:"piusx-1913-de-profundis"});
const ep=buildPersonalDailyPlan({daypart:"evening",prefs:evening});
assert.equal(ep.rows.length,12);
assert.equal(ep.rows.at(-1).kind,"personal-legacy");
assert.equal(ep.rows.at(-1).legacyId,"dead_de_profundis");
assert.equal(ep.rows.at(-2).kind,"personal-prayer");
let memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
assert.equal(savePersonalDailyPrefs(storage,evening),true);
assert.equal(loadPersonalDailyPrefs(storage).extras.evening.length,2);
assert.ok(!memory.get(DAILY_PERSONAL_RULE_STORAGE_KEY).includes("Jesus, Joseph"));
assert.ok(!memory.get(DAILY_PERSONAL_RULE_STORAGE_KEY).includes("Our Father"));
assert.deepEqual(normalizePersonalDailyPrefs({version:2}),defaultPersonalDailyPrefs());
assert.equal(normalizePersonalDailyPrefs({...initial,extras:{morning:["attacker-id"],evening:[]}}).extras.morning.length,0);
const h={esc:x=>String(x).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;"),L:(en,fr)=>en,prayerParagraphs:t=>'<p>'+t+'</p>',source:(label,url)=>'<small>'+label+'</small>'};
const first=buildPersonalDailyPlan({daypart:"morning",prefs:initial});
const card=personalDailyPrayerCard(first.rows[1],first,h);
assert.match(card,/data-ao-personal-prayer="daily-prayer"/);
assert.match(card,/created me, made me a Christian/);
assert.match(dailyPersonalSettings(first,initial,h),/data-tp381-personal-action="language"/);
assert.match(dailyPersonalSettings(first,initial,h),/1913 · EN · Standard/,"The opening settings summary must identify the effective rule");
const briefMarkup=dailyPersonalSettings(buildPersonalDailyPlan({daypart:"morning",prefs:changePersonalDailyPrefs(initial,{action:"length",value:"brief"})}),changePersonalDailyPrefs(initial,{action:"length",value:"brief"}),h);
assert.match(briefMarkup,/data-tp381-personal-action="length"/);
assert.match(briefMarkup,/Personal Brief/);
assert.match(briefMarkup,/not a separately printed Short St Pius X/);
assert.doesNotMatch(briefMarkup,/data-tp381-personal-action="extra"/,"Brief cannot edit dormant full-routine extras");
assert.match(dailyPersonalProvenance(first.rows[1],h.L),/Latin version on tap is an editorial translation/);
const latinSource=buildPersonalDailyPlan({daypart:"morning",prefs:defaultPersonalDailyPrefs("la")}).rows[1];
assert.match(dailyPersonalProvenance(latinSource,h.L),/Editorial Latin translation · not printed Latin/);
assert.match(dailyPersonalProvenance(first.rows[0],h.L),/Traditional Latin parallel/);
const sourceExtra=buildPersonalDailyPlan({daypart:"morning",prefs:changePersonalDailyPrefs(initial,{action:"extra",daypart:"morning",value:extra.id})}).rows.at(-1);
assert.match(dailyPersonalProvenance(sourceExtra,h.L),/Optional · complete historical source-language prayer/);
const inManusPrefs=changePersonalDailyPrefs(defaultPersonalDailyPrefs("la"),{action:"extra",daypart:"evening",value:"roman-compline-latin-in-manus"});
const inManusPlan=buildPersonalDailyPlan({daypart:"evening",prefs:inManusPrefs});
const inManusCard=personalDailyPrayerCard(inManusPlan.rows.at(-1),inManusPlan,h);
assert.match(inManusCard,/Passiontide and Eastertide/);
assert.match(inManusCard,/In manus tuas/);
assert.match(dailyPersonalProvenance(inManusPlan.rows.at(-1),h.L),/Optional historical Office text/);
assert.equal(new Set(inManusPlan.rows.map(row=>row.id)).size,inManusPlan.rows.length);
assert.match(dailyPersonalList(first.rows,{...h,isFr:false}),/data-tp381-daily-card-index="0"/);
assert.equal(APPROVED_DAILY_FORMULATION_MANIFEST_V1.witnesses&&Object.keys(APPROVED_DAILY_FORMULATION_MANIFEST_V1.witnesses).length,0,"Old unapproved historical profile path must remain fail closed");
assert.equal(DAILY_APPROVED_SEQUENCE_RELEASE_V1.enabled,false,"Do not bypass historical profile approval through legacy gate");
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/buildPersonalDailyPlan\(\{daypart:S.daypart,prefs:personalDailyPrefs\(\)\}\)/);
assert.match(runtime,/data-tp381-personal-action/);
assert.match(runtime,/personalDailyPrayerCard\(row,dailyReadingPlan\(\),/);
assert.match(runtime,/dailyPersonalSettings\(plan,personalDailyPrefs\(\),/);
assert.match(runtime,/\$\{choice\}\$\{dailyPersonalSettings\(plan,personalDailyPrefs\(\),/,"Daily rule controls must be in the opening screen, before the horizon");
assert.match(runtime,/previousId=previous\[previousStep\]\?\.id/,"Updating a daily rule must retain its active prayer ID");
assert.match(runtime,/action==="length"/,"Changing routine length must restart visual progression from the opening stage");
console.log("PASS: St Pius X 1905/1913 structure, 3 languages, 45 optional texts, source-ID privacy, variants, optional order and legacy gate");
