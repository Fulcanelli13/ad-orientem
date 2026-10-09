import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOVENA_CORPUS_V3 } from "../src/pray/novena-corpus.js";
import { NOVENA_CORPUS_V4, NOVENA_CORPUS_V4_IDS, NOVENA_CORPUS_V4_VERSION, NOVENA_START_KIND } from "../src/pray/novena-corpus-v4.js";
import { NOVENA_SOURCE_HOLDS, NOVENA_TARGET_IDS, NOVENA_TARGET_REGISTRY_V1 } from "../src/calendar/devotional-registry.js";

const donorExpected=[
  "holy_ghost","christmas","corpus_christi","sacred_heart",
  "immaculate_conception","annunciation","assumption","seven_sorrows",
  "st_joseph","holy_souls","perpetual_help","st_therese"
];
const completeExpected=[
  ...donorExpected,
  "st_anthony_nine_tuesdays","christ_the_king","immaculate_heart","st_michael"
];

assert.deepEqual(Object.keys(NOVENA_CORPUS_V3),donorExpected,"Frozen N3 English donor identity/order changed");
assert.equal(NOVENA_CORPUS_V4_VERSION,"bilingual-16-target-v1");
assert.deepEqual(NOVENA_CORPUS_V4_IDS,completeExpected,"Complete novena corpus identity/order changed");
assert.equal(NOVENA_TARGET_IDS.length,16,"Novena registry must remain 16 targets");
assert.equal(Object.keys(NOVENA_TARGET_REGISTRY_V1).length,16);
assert.deepEqual(Object.keys(NOVENA_SOURCE_HOLDS),[],"Completed novena corpus must have no unresolved source holds");
assert.ok(Object.values(NOVENA_TARGET_REGISTRY_V1).every(x=>x.playable===true&&x.availability==="PLAYABLE_BILINGUAL_SOURCE_LOCKED"),"All 16 novenas must be playable bilingual targets");
const traditionalStartIds=new Set(["holy_ghost","christmas","corpus_christi","sacred_heart","immaculate_conception","christ_the_king"]);
for(const [id,n] of Object.entries(NOVENA_CORPUS_V4)){
  assert.equal(
    n.startKind,
    traditionalStartIds.has(id)?NOVENA_START_KIND.TRADITIONAL:NOVENA_START_KIND.SUGGESTED,
    id+" start authority changed"
  );
}
assert.equal(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.immaculate_heart.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.st_michael.startKind,NOVENA_START_KIND.SUGGESTED);
assert.equal(NOVENA_CORPUS_V4.christ_the_king.startKind,NOVENA_START_KIND.TRADITIONAL);
assert.match(NOVENA_CORPUS_V4.st_michael.traditionalStart.en,/Suggested feast preparation/);
assert.match(NOVENA_CORPUS_V4.immaculate_heart.traditionalStart.en,/Suggested feast preparation/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.traditionalStart.en,/Suggested feast preparation/);
assert.ok(NOVENA_CORPUS_V4.st_michael.historySources.some(x=>/Raccolta/.test(x.label)),"St Michael lost the Raccolta novena authority witness");
assert.ok(NOVENA_CORPUS_V4.christ_the_king.historySources.some(x=>/1955/.test(x.label)),"Christ the King lost the pre-conciliar feast-preparation witness");


let bodyCount=0;
for(const id of completeExpected){
  const n=NOVENA_CORPUS_V4[id];
  assert.equal(n.id,id,id+" identity changed");
  assert.equal(n.days.length,9,id+" no longer has exactly nine prayer occasions");
  assert.ok(n.title?.en&&n.title?.fr,id+" lost bilingual title");
  assert.ok(n.history?.en&&n.history?.fr,id+" lost bilingual history");
  assert.ok(n.meaning?.en&&n.meaning?.fr,id+" lost bilingual meaning");
  assert.ok(n.how?.en&&n.how?.fr,id+" lost bilingual how-to-pray guidance");
  assert.ok(n.calendar?.precision,id+" lost calendar authority metadata");
  assert.ok(n.source?.work&&n.source?.url,id+" lost source provenance");
  assert.ok(n.frenchTextStatus&&!/MISSING/i.test(n.frenchTextStatus),id+" has no declared French prayer-body provenance");

  const bodies=[];
  for(const key of ["repeatText","opening","churchPrayer","ejaculation","sharedClosingText"]){
    if(n[key])bodies.push([key,n[key]]);
  }
  n.days.forEach((d,i)=>{if(d.text)bodies.push([`days[${i}].text`,d.text]);});
  assert.ok(bodies.length>=1,id+" has no source prayer body");
  for(const [path,body] of bodies){
    bodyCount+=1;
    assert.equal(typeof body,"object",id+" "+path+" is not bilingual");
    assert.ok(String(body.en||"").trim().length>20,id+" "+path+" lost English source text");
    assert.ok(String(body.fr||"").trim().length>20,id+" "+path+" lost French prayer text");
    assert.notEqual(body.fr,body.en,id+" "+path+" French body silently equals English");
    assert.doesNotMatch(body.fr,/French source text is not yet source-locked|texte source français n’est pas encore verrouillé/i,id+" "+path+" retained placeholder French");
  }
}
assert.equal(bodyCount,91,"Frozen V4 corpus source-body unit count changed");

assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.en,/burial of St Anthony on the Tuesday following his death/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.fr,/inhumation solennelle de saint Antoine le mardi/);
assert.ok(!/died on a Tuesday|mourut un mardi/.test(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.en+" "+NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.history.fr));
assert.ok(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.historySources.some(x=>x.url==="https://www.messagerdesaintantoine.com/node/5972"));
assert.ok(NOVENA_CORPUS_V4.christ_the_king.historySources.some(x=>x.url==="https://www.spiritualite-chretienne.com/s_coeur/priere_a.html"));
assert.equal(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.calendar.type,"NINE_TUESDAYS_BEFORE_FIXED_FEAST");
assert.equal(NOVENA_CORPUS_V4.christ_the_king.calendar.type,"LAST_SUNDAY_RELATIVE");
assert.equal(NOVENA_CORPUS_V4.immaculate_heart.calendar.startDay,13);
assert.equal(NOVENA_CORPUS_V4.st_michael.calendar.startDay,20);
assert.match(NOVENA_CORPUS_V4.christ_the_king.frenchTextStatus,/SOURCE_LOCKED/);
assert.match(NOVENA_CORPUS_V4.st_michael.frenchTextStatus,/SOURCE_LOCKED/);
assert.match(NOVENA_CORPUS_V4.immaculate_heart.frenchTextStatus,/TRADITIONAL_FRENCH_WITNESS/);
assert.match(NOVENA_CORPUS_V4.st_anthony_nine_tuesdays.frenchTextStatus,/EDITORIAL_TRANSLATION/);

const canonicalData=readFileSync("src/pray/canonical-data.js","utf8");
for(const id of ["foundations_our_father","foundations_hail_mary","foundations_glory_be","litany_loreto_1962"]){
  const start=canonicalData.indexOf(`"id":"${id}"`);
  assert.ok(start>=0,id+" canonical prayer disappeared");
  const slice=canonicalData.slice(start,start+14000);
  const fr=slice.match(/"fr":"((?:\\.|[^"])*)"/);
  assert.ok(fr&&fr[1].length>40,id+" lost its French canonical prayer body");
}
const sot=JSON.parse(readFileSync("data/pray/novena-sot.v1.json","utf8"));
assert.equal(sot.version,"NOVENA_SOT_V1");
assert.equal(sot.status,"FROZEN");
assert.equal(sot.target_count,16);
assert.equal(sot.playable_count,16);
assert.equal(sot.french_body_parity,"16/16");
assert.equal(sot.source_holds,0);
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.french_world_witness,"https://www.messagerdesaintantoine.com/node/5972");
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.original_prayer_witness_date,1966);
assert.ok(sot.global_rules.some(x=>/TRADITIONAL_START or SUGGESTED_START/.test(x)),"SOT lost start-authority rule");
for(const row of sot.novenas){
  assert.equal(row.start_kind,traditionalStartIds.has(row.id)?"TRADITIONAL_START":"SUGGESTED_START",row.id+" SOT start_kind diverged");
}
assert.equal(sot.recovered_targets.christ_the_king.start_kind,"TRADITIONAL_START");
assert.equal(sot.recovered_targets.st_anthony_nine_tuesdays.start_kind,"SUGGESTED_START");
assert.equal(sot.recovered_targets.immaculate_heart.start_kind,"SUGGESTED_START");
assert.equal(sot.recovered_targets.st_michael.start_kind,"SUGGESTED_START");
assert.deepEqual(sot.novenas.map(x=>x.id),completeExpected,"NOVENA_SOT_V1 target order diverged from production corpus");
assert.ok(sot.novenas.every(x=>x.playable===true&&x.french_text_status&&!/MISSING/i.test(x.french_text_status)),"NOVENA_SOT_V1 lost playable/French parity");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/French parity means the \*\*actual prayer body\*\*/,"Novena freeze doc lost prayer-body French parity rule");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/A seventeenth novena is \*\*not\*\* appended casually/,"Novena freeze doc lost sixteen-target boundary");

const runtime=readFileSync("src/pray/novena-runtime.js","utf8");
const styles=readFileSync("src/pray/novena-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/44\.0-bilingual-novenas-v1/);
assert.doesNotMatch(runtime,/CURATED CORE · V4|NOYAU SÉLECTIONNÉ · V4|V4 is deliberately frozen|source-of-truth version|V4 · \$\{items\.length\}/,"Novenas leaked internal versioning/governance language into the UI");
assert.match(runtime,/TRADITIONAL NOVENAS/,"Novenas overview lost its user-facing collection label");
assert.match(runtime,/bilingual sourced novenas/,"Novenas overview lost sourced bilingual summary");
assert.match(runtime,/NOVENA_CORPUS_V4 as CORPUS/,"Novenas runtime is not consuming completed V4 corpus");
assert.match(runtime,/pray\.novenas/,"Novenas route is not registered");
assert.doesNotMatch(runtime,/function injectHome|aoN1InsertedSection|MutationObserver/,"Novenas regained DOM-based PRAY hub injection");
assert.match(runtime,/OPEN_OPTS\.returnFamily/,"Novenas no longer return to their owning PRAY family");
assert.match(runtime,/openFamily\?\.\(OPEN_OPTS\.returnFamily\)/,"Novenas family return is not delegated to the canonical PRAY owner");

assert.match(runtime,/data-n1-mode/,"Guided\/Simple control disappeared");
assert.match(runtime,/class="aoP435930Back" data-n1-back/,"Novena header lost donor Back control");
assert.match(runtime,/class="aoP435930Home" data-n1-home/,"Novena header lost explicit global Home control");
assert.doesNotMatch(runtime,/data-n1-close/,"Novena header regressed to ambiguous Close control");
// The live artwork is resolved through n1UiIcon(id), so the literal asset attribute
// is generated at render time rather than embedded verbatim in head().
assert.match(runtime,/resolveCanonicalAssetUrl\(id\)/,"Novena header lost canonical asset resolution");
assert.match(runtime,/n1UiIcon\('ao-ui-back'\)/,"Novena header lost canonical Back utility artwork");
assert.match(runtime,/n1UiIcon\('ao-nav-home'\)/,"Novena header lost canonical Home utility artwork");
assert.match(runtime,/function goHome\(\)/,"Novena global Home action is missing");
assert.match(runtime,/if\(N\.screen===\'day\'\).*N\.screen=\'detail\'/,"Novena Back no longer returns Day to Novena detail");
assert.match(runtime,/if\(N\.screen===\'detail\'\).*N\.screen=\'overview\'/,"Novena Back no longer returns detail to Novena overview");
assert.match(runtime,/noCompletionTracking:true/,"Novenas privacy rule for completion tracking changed");
assert.match(runtime,/noIntentStorage:true/,"Novenas privacy rule for intentions changed");
assert.match(runtime,/TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE/,"French editorial translation provenance label disappeared");
assert.match(runtime,/TEXTE FRANÇAIS TRADITIONNEL/,"Traditional French witness label disappeared");
assert.match(runtime,/Revenir au français/,"French\/English prayer witness toggle lost return path");
assert.match(runtime,/calendarStatus/,"calendar-aware Novena status disappeared");
assert.match(runtime,/Traditional start/,"Novena detail lost Traditional start label");
assert.match(runtime,/Suggested start/,"Novena detail lost Suggested start label");
assert.match(runtime,/NOVENA_START_KIND/,"Novena runtime stopped consuming start authority metadata");
assert.match(runtime,/novenaStatusFor/,"Novenas stopped consuming shared Calendar intelligence date semantics");
assert.doesNotMatch(runtime,/function easter\(/,"Novenas reintroduced a private Easter calculator");
assert.doesNotMatch(runtime,/function windowFor\(/,"Novenas reintroduced private novena date-window logic");
assert.match(runtime,/canonicalReuse:\{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true\}/,"canonical prayer reuse contract changed");
assert.match(styles,/aoN1Hero/);
assert.match(styles,/aoN1StageRail/);
assert.match(browser,/import "\.\/novena-runtime\.js";/,"PRAY browser owner no longer installs Novenas");
assert.match(assets,/"pray\.novenas"\s*:\s*"ao-rich-novenas"/,"Novenas lost canonical V4 asset identity");

console.log("PASS complete 16-target bilingual Novenas corpus with French prayer-body parity");
