import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 DAILY_PERSONAL_RULE_STORAGE_KEY,PERSONAL_DAILY_SOURCE_COVERAGE,
 defaultPersonalDailyPrefs,normalizePersonalDailyPrefs,loadPersonalDailyPrefs,
 savePersonalDailyPrefs,personalDailyOptions,buildPersonalDailyPlan,
 changePersonalDailyPrefs
} from "../src/pray/daily-personal-rule.js";
import {DAILY_PERSONAL_PRAYER_SOURCE_V1 as CORPUS} from "../src/pray/daily-personal-prayer-source.js";
import {APPROVED_DAILY_FORMULATION_MANIFEST_V1,DAILY_APPROVED_SEQUENCE_RELEASE_V1} from "../src/pray/daily-approved-formulations.js";
import {dailyPersonalPrayerCard,dailyPersonalSettings,dailyPersonalList} from "../src/pray/daily-personal-prayer-view.js";

assert.deepEqual(PERSONAL_DAILY_SOURCE_COVERAGE.languages,["la","en","fr"]);
assert.equal(PERSONAL_DAILY_SOURCE_COVERAGE.manualOptions,40);
assert.equal(CORPUS.additional.length,40);
assert.equal(new Set(CORPUS.additional.map(x=>x.id)).size,40);
for(const record of CORPUS.additional){
 assert.ok(["en","fr"].includes(record.lang));
 assert.equal(record.sourceImageChecked,true);
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
const initial=defaultPersonalDailyPrefs("en");
assert.equal(initial.edition,"1913");
assert.equal(initial.mode,"standard");
assert.equal(buildPersonalDailyPlan({daypart:"evening",prefs:initial}).rows.length,10);
const english=personalDailyOptions("morning","en","1913");
assert.ok(english.some(x=>x.sourceLabel.includes("Lasance")));
assert.equal(personalDailyOptions("morning","la","1913").length,0,"Latin cannot import English source text");
assert.ok(personalDailyOptions("evening","fr","1913").some(x=>x.id==="piusx-1913-jesus-joseph-mary"));
assert.ok(!personalDailyOptions("evening","fr","1905").some(x=>x.id==="piusx-1913-jesus-joseph-mary"));
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
const card=dailyPersonalPrayerCard(first.rows[1],first,h);
assert.match(card,/data-ao-personal-prayer="daily-prayer"/);
assert.match(card,/created me, made me a Christian/);
assert.match(dailyPersonalSettings(first,initial,h),/data-tp381-personal-action="language"/);
assert.match(dailyPersonalList(first.rows,{...h,isFr:false}),/data-tp381-daily-card-index="0"/);
assert.equal(APPROVED_DAILY_FORMULATION_MANIFEST_V1.witnesses&&Object.keys(APPROVED_DAILY_FORMULATION_MANIFEST_V1.witnesses).length,0,"Old unapproved historical profile path must remain fail closed");
assert.equal(DAILY_APPROVED_SEQUENCE_RELEASE_V1.enabled,false,"Do not bypass historical profile approval through legacy gate");
const runtime=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
assert.match(runtime,/buildPersonalDailyPlan\(\{daypart:S.daypart,prefs:personalDailyPrefs\(\)\}\)/);
assert.match(runtime,/data-tp381-personal-action/);
assert.match(runtime,/personalDailyPrayerCard\(row,dailyReadingPlan\(\),/);
assert.match(runtime,/dailyPersonalSettings\(plan,personalDailyPrefs\(\),/);
console.log("PASS: St Pius X 1905/1913 structure, 3 languages, 40 optional texts, source-ID privacy, variants, optional order and legacy gate");
