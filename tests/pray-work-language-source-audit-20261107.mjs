/**
 * Stage 3: language/body coverage and existing-reader wiring for 36 work identities.
 * No changes to prayer texts or reader code. This is SOURCE evidence, not a
 * browser-e2e or first-edition historical authentication.
 * node tests/pray-work-language-source-audit-20261107.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname,join} from "node:path";
import {NOVENA_CORPUS_V4,NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {SACRED_HEART_DEVOTIONS_V382,HOLY_NAME_LITANY_V381,COMMUNION_TREASURY_V383,SACRED_HYMNS_V381,
 MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381} from "../src/pray/traditional-pray-data.js";
import {ICRSP_SEASONAL_HYMNS_V1} from "../src/pray/icrsp-seasonal-hymns.v1.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const r=JSON.parse(read("data/pray/prayer-work-identity-registry-20261106.v1.json"));
const byId=new Map(r.works.map(x=>[x.id,x]));
const langs=["la","en","fr"];
const body=v=>typeof v==="string"&&v.trim().length>8;
const profile=v=>Object.fromEntries(langs.map(k=>[k,body(v?.[k])?"text-present":"not-in-object"]));
const rows=[],issues=[];
function add(w,type,source,extra={}){
 assert.ok(w,"Expected source work to exist in registry");
 const p={id:w.id,legacyRows:w.legacyRows,type,source,sourceKey:w.source_key,...extra};
 rows.push(p);return p;
}
const owners={
 "litany_sacred_heart":SACRED_HEART_DEVOTIONS_V382.litany,
 "consecration_human_race_sacred_heart":SACRED_HEART_DEVOTIONS_V382.humanRaceConsecration,
 "pray.holy_name_litany":HOLY_NAME_LITANY_V381,
 "communion_before_thomas":COMMUNION_TREASURY_V383.beforeThomas,
 "communion_before_ambrose":COMMUNION_TREASURY_V383.beforeAmbrose,
 "communion_after_thomas":COMMUNION_TREASURY_V383.afterThomas,
 "communion_after_bonaventure":COMMUNION_TREASURY_V383.afterBonaventure,
 "communion_en_ego":COMMUNION_TREASURY_V383.enEgo,
 "te_deum":SACRED_HYMNS_V381.te_deum,
 "ave_maris_stella":SACRED_HYMNS_V381.ave_maris_stella,
 "veni_creator":SACRED_HYMNS_V381.veni_creator
};
const traditionalRead=read("src/pray/traditional-pray-runtime.js");
const expectedRoutes=["pray.sacred_heart","pray.communion_treasury","pray.holy_name_litany","pray.sacred_hymns","pray.morning_evening"];
for(const id of expectedRoutes)assert.match(traditionalRead,new RegExp('"'+id.replaceAll(".","\\.")+'"'));
for(const [id,text]of Object.entries(owners)){
 const w=byId.get(id);assert.ok(w,"Missing traditional ID "+id);
 assert.ok(text&&typeof text==="object","Source body missing "+id);
 const languages=profile(text);
 const p=add(w,"standalone-text",w.owner_module,{languages,ownerTextSourceEvidence:"imported-source-object",
  readerContainer:id==="pray.holy_name_litany"?"pray.holy_name_litany":
   id.startsWith("communion_")?"pray.communion_treasury":
   ["te_deum","ave_maris_stella","veni_creator"].includes(id)?"pray.sacred_hymns":"pray.sacred_heart"});
 if(!Object.values(languages).includes("text-present"))issues.push({id,problem:"no direct source body across LA EN FR"});
}
for(const [id,arr]of [["daily_morning_prayer",MORNING_PRAYER_SEQUENCE_V381],["daily_evening_prayer",EVENING_PRAYER_SEQUENCE_V381]]){
 const w=byId.get(id);assert.ok(w);assert.ok(Array.isArray(arr)&&arr.length>=10,"Daily order missing required source references "+id);
 const refs=arr.map(x=>x[0]);
 const missing=refs.filter(x=>!PRAY_CANONICAL_DATA_V435930.prayers[x] && !(x==="pray.nightly_examen" && traditionalRead.includes('"pray.nightly_examen":Object.freeze(')));
 const referencedCompanions=refs.filter(x=>x==="pray.nightly_examen");
 add(w,"reference-only-daily-order",w.owner_module,{orderedRefs:refs,orderedRefsCount:refs.length,referencedCompanions,missingUnownedRefs:missing,readerContainer:"pray.morning_evening",languages:{la:"composed-from-references",en:"composed-from-references",fr:"composed-from-references"}});
 if(missing.length)issues.push({id,problem:"daily order has missing canonical ID",missing});
}
assert.equal(Object.keys(owners).length+2,13);
for(const [id,text]of Object.entries(ICRSP_SEASONAL_HYMNS_V1)){
 const w=byId.get(id);if(!w)continue; // secondary Easter recension belongs to its primary work
 const recensions=w.editions.map(e=>ICRSP_SEASONAL_HYMNS_V1[e.id]).filter(Boolean);
 assert.ok(recensions.length>=1);
 const editions=recensions.map(h=>({id:h.id,languageText:profile(h),sourceUrl:h.sourceUrl||null,
  englishEdition:h.englishSource?.url||null,frenchEdition:h.frenchSource?.url||null,office:h.office,season:h.season}));
 add(w,"source-hymn",w.owner_module,{editions,languageText:profile(text),readerContainer:"pray.sacred_hymns"});
 if(editions.some(e=>e.languageText.la!=="text-present"))issues.push({id,problem:"Latin seasonal hymn missing"});
}
const novenaIds=[...NOVENA_CORPUS_V4_IDS];
assert.equal(novenaIds.length,16,"Historical 16 novenas changed");
for(const id of novenaIds){
 const w=byId.get(id),n=NOVENA_CORPUS_V4[id];assert.ok(w&&n,"Novena source missing "+id);
 const days=Array.isArray(n.days)?n.days:[];
 const repeat=profile(n.repeatText),daily=Object.fromEntries(langs.map(lang=>[lang,days.filter(d=>body(d.text?.[lang])).length]));
 const bodyBasis=Object.fromEntries(langs.map(lang=>[lang,repeat[lang]==="text-present"?"repeated-proper":
   daily[lang]===9?"nine-day-specific-propers":daily[lang]>0?"partial-day-specific-propers":
   "no-independent-proper-detected"]));
 const source=n.source||{};
 add(w,"novena-programme",w.owner_module,{form:n.form,days:days.length,
  bodyBasis,repeatText:repeat,properDayTextCounts:daily,
  sourceWork:source.work||source.edition||null,sourceUrl:source.url||null,
  frenchTextStatus:n.frenchTextStatus||null,readerContainer:"novena-reader"});
 if(days.length!==9)issues.push({id,problem:"nine-day programme missing days",days:days.length});
 if(bodyBasis.en==="no-independent-proper-detected")issues.push({id,problem:"no EN proper detected; inspect reuse of commonPrayer or other owners"});
 if(bodyBasis.fr==="no-independent-proper-detected")issues.push({id,problem:"no FR proper detected; inspect existing source or missing language"});
}
const selected=r.works.filter(w=>w.owner_module==="src/pray/traditional-pray-data.js"||
w.owner_module==="src/pray/icrsp-seasonal-hymns.v1.js"||
w.owner_module==="src/pray/novena-corpus-v4.js");
const expected=selected.map(w=>w.id).sort(),actual=rows.map(x=>x.id).sort();
assert.deepEqual(actual,expected,"Audit must cover all 36 selected registry works");
const report={schema:"ao.pray.language-source-evidence-20261107.v1",
 scope:"Repository source text presence and programmed references; NOT browser rendering, translation parity, copyright or print certification",
 assessedWorks:rows.length,novenaCount:novenaIds.length,directTraditionalObjects:Object.keys(owners).length,
 dailyOrders:2,seasonalWorkRecords:rows.filter(x=>x.type==="source-hymn").length,
 programmeBodyCoverage:rows.filter(x=>x.type==="novena-programme").map(x=>({id:x.id,form:x.form,days:x.days,en:x.bodyBasis.en,fr:x.bodyBasis.fr,la:x.bodyBasis.la})),
 traditionalLanguagePresence:rows.filter(x=>x.type==="standalone-text").map(x=>({id:x.id,...x.languages})),
 seasonalLanguagePresence:rows.filter(x=>x.type==="source-hymn").map(x=>({id:x.id,...x.languageText,editions:x.editions.map(e=>({id:e.id,...e.languageText}))})),
 flaggedForReview:issues,
 rows};
const snapshot=JSON.parse(read("data/pray/prayer-work-language-evidence-20261107.v1.json"));
assert.equal(snapshot.schema,report.schema,"Source evidence snapshot schema mismatch");
assert.deepEqual(snapshot.rows,report.rows,"Recorded source evidence is stale or prayer corpus changed; re-audit before publishing");
assert.deepEqual(snapshot.flaggedForReview,report.flaggedForReview,"Review issues have changed without recorded approval");
for(const row of rows){
 const linked=byId.get(row.id)?.sourceBodyEvidence;
 assert.ok(linked&&linked.type===row.type,"Work lacks source audit pointer: "+row.id);
 assert.equal(linked.auditRef,"data/pray/prayer-work-language-evidence-20261107.v1.json#"+row.id);
}
console.log("AO_PRAY_STAGE3_REPORT_BEGIN");
console.log(JSON.stringify(report));
console.log("AO_PRAY_STAGE3_REPORT_END");
assert.equal(rows.length,36);
assert.equal(issues.filter(x=>x.problem.includes("missing canonical ID")||x.problem.includes("missing days")||x.problem.includes("Latin seasonal hymn missing")).length,0,
 "Source structure is inconsistent for required sections");
console.log("Stage 3 source-language assessment PASS: source presence only; browser visibility remains unverified.");
