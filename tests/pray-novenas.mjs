import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOVENA_CORPUS_V3 } from "../src/pray/novena-corpus.js";
import { NOVENA_CORPUS_V4, NOVENA_CORPUS_V4_IDS, NOVENA_CORPUS_V4_VERSION } from "../src/pray/novena-corpus-v4.js";
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
assert.equal(bodyCount,79,"Expected 75 recovered N3 source bodies plus four completed target prayers");

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
assert.deepEqual(sot.novenas.map(x=>x.id),completeExpected,"NOVENA_SOT_V1 target order diverged from production corpus");
assert.ok(sot.novenas.every(x=>x.playable===true&&x.french_text_status&&!/MISSING/i.test(x.french_text_status)),"NOVENA_SOT_V1 lost playable/French parity");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/French parity means the \*\*actual prayer body\*\*/,"Novena freeze doc lost prayer-body French parity rule");
assert.match(readFileSync("docs/NOVENA-SOT-V1.md","utf8"),/A seventeenth novena is \*\*not\*\* appended casually/,"Novena freeze doc lost sixteen-target boundary");

const runtime=readFileSync("src/pray/novena-runtime.js","utf8");
const styles=readFileSync("src/pray/novena-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/44\.0-bilingual-novenas-v1/);
assert.match(runtime,/NOVENA_CORPUS_V4 as CORPUS/,"Novenas runtime is not consuming completed V4 corpus");
assert.match(runtime,/pray\.novenas/,"Novenas route is not registered");
assert.match(runtime,/data-n1-mode/,"Guided\/Simple control disappeared");
assert.match(runtime,/class="aoP435930Back" data-n1-back/,"Novena header lost donor Back control");
assert.match(runtime,/class="aoP435930Close" data-n1-close/,"Novena header lost donor Close control");
assert.match(runtime,/data-ao-inline-asset-id="ao-ui-back"/,"Novena header lost canonical Back utility artwork");
assert.match(runtime,/data-ao-inline-asset-id="ao-ui-close"/,"Novena header lost canonical Close utility artwork");
assert.match(runtime,/noCompletionTracking:true/,"Novenas privacy rule for completion tracking changed");
assert.match(runtime,/noIntentStorage:true/,"Novenas privacy rule for intentions changed");
assert.match(runtime,/TRADUCTION FRANÇAISE · ALIGNÉE SUR LA SOURCE/,"French editorial translation provenance label disappeared");
assert.match(runtime,/TEXTE FRANÇAIS TRADITIONNEL/,"Traditional French witness label disappeared");
assert.match(runtime,/Revenir au français/,"French\/English prayer witness toggle lost return path");
assert.match(runtime,/calendarStatus/,"calendar-aware Novena status disappeared");
assert.match(runtime,/novenaStatusFor/,"Novenas stopped consuming shared Calendar intelligence date semantics");
assert.doesNotMatch(runtime,/function easter\(/,"Novenas reintroduced a private Easter calculator");
assert.doesNotMatch(runtime,/function windowFor\(/,"Novenas reintroduced private novena date-window logic");
assert.match(runtime,/canonicalReuse:\{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true\}/,"canonical prayer reuse contract changed");
assert.match(styles,/aoN1Hero/);
assert.match(styles,/aoN1StageRail/);
assert.match(browser,/import "\.\/novena-runtime\.js";/,"PRAY browser owner no longer installs Novenas");
assert.match(assets,/"pray\.novenas"\s*:\s*"ao-rich-novenas"/,"Novenas lost canonical V4 asset identity");

console.log("PASS complete 16-target bilingual Novenas corpus with French prayer-body parity");
