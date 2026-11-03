import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {prayerSourceFacesV1} from "../src/pray/prayer-source-faces.v1.js";
import {HOLY_NAME_LITANY_V381,SACRED_HYMNS_V381,TRADITIONAL_PRAY_SOURCES_V381} from "../src/pray/traditional-pray-data.js";
import {ICRSP_SEASONAL_HYMNS_V1,ICRSP_SEASONAL_HYMN_IDS_V1} from "../src/pray/icrsp-seasonal-hymns.v1.js";
import {GOOD_DEATH_DYING_V384,GOOD_DEATH_DYING_SOURCES_V384} from "../src/pray/good-death-data.js";
import {JOSEPH_LITANY_1909_V1,JOSEPH_LITANY_2021_V1} from "../src/pray/st-joseph-litany-1909.v1.js";
import {DYING_COMPANION_STAGES,nextDyingCompanionStage} from "../src/pray/dying-companion-flow.js";

const original=readFileSync(new URL("../src/pray/traditional-pray-runtime.js",import.meta.url),"utf8");
const prayerData=PRAY_CANONICAL_DATA_V435930.prayers;
let locale="en";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nl=v=>esc(v).replace(/\n/g,"<br>");
const letters=v=>String(v??"").replace(/<br\s*\/?>/gi,"").replace(/<[^>]+>/g,"")
 .replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#039;/g,"'")
 .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s/g,"").normalize("NFC");
const contains=(html,exact,label)=>assert.ok(letters(html).includes(letters(exact)),label+" actual source body not visible");
function slice(a,b){
 const start=original.indexOf(a),end=original.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,"Actual renderer missing "+a);
 return original.slice(start,end);
}
const source=(label,url)=>'<details data-source><summary>'+esc(label)+'</summary><a>'+esc(url||"")+'</a></details>';
const S={hymn:"te_deum",hymnLang:null,litanyMode:"full",litanyStep:0,
 goodDeathStep:0,goodDeathJosephEdition:"1909",dying:"now",hopeFrenchEdition:"published"};
const env={S,esc,nl,prayerSourceFacesV1,PRAY_CANONICAL_DATA_V435930,
 data:()=>({prayers:prayerData}),
 isFr:()=>locale==="fr",L:(en,fr)=>locale==="fr"?(fr||en):en,
 prayerTitle:(p,id)=>locale==="fr"?(p.titleFr||p.title||id):(p.title||id),
 head:title=>'<header><h1>'+esc(title)+'</h1></header>',
 source,traditionalContextGuide:()=>"",
 GOOD_DEATH_DYING_V384,GOOD_DEATH_DYING_SOURCES_V384,
 JOSEPH_LITANY_1909_V1,JOSEPH_LITANY_2021_V1,
 HOLY_NAME_LITANY_V381,SACRED_HYMNS_V381,ICRSP_SEASONAL_HYMNS_V1,ICRSP_SEASONAL_HYMN_IDS_V1,
 TRADITIONAL_PRAY_SOURCES_V381,DYING_COMPANION_STAGES,nextDyingCompanionStage,
 choirLitanyLineParts:text=>[{kind:"leader",raw:text}],
 goodDeathPurposePicker:()=>'<nav data-ao-purpose-picker></nav>',
 prayerRows:rows=>'<nav data-ao-prayer-handoff>'+rows.map(([id,title])=>'<button data-tp381-prayer="'+esc(id)+'">'+esc(title)+'</button>').join('')+'</nav>',
 uiIcon:()=>"",sourceLabel:()=>"",
 };
const before=slice("const prayerParagraphs=","const data=()=>");
const canonical=slice("function existingLatinSwitch(","function prayerRows(");
const sourced=slice("function sourcedPrayerCard(","const HEART_STAGES=");
const hymns=slice("const HYMN_KEYS=","function traditionalContextGuide(");
const holy=slice("const HOLY_NAME_SECTION_LABELS=","function renderNightlyExamen(){");
const stageList=slice("const GOOD_DEATH_STAGES=Object.freeze([","// B11: source-owned Good Death choices");
const good=slice("function renderGoodDeath(){","function dyingCompanionStepNav(");
const bedside=slice("function dyingCompanionStepNav(","function renderPrayer(){");
const api=new Function("env","with(env){\n"+[before,canonical,sourced,hymns,holy,stageList,good,bedside].join("\n")+
 "\nreturn {renderHymns,renderHolyName,renderGoodDeath,renderDyingCompanion,GOOD_DEATH_STAGES,holyNameSections,HYMN_KEYS};}")(env);
let checks=0;
// Holy Name: seven real source sections, both vernacular editions and
// original Latin, in guided and full readers. No invented invocations.
for(const l of ["en","fr"]){
 locale=l;
 const vern=api.holyNameSections(HOLY_NAME_LITANY_V381[l]);
 const latin=api.holyNameSections(HOLY_NAME_LITANY_V381.la);
 assert.equal(vern.length,7);assert.equal(latin.length,7);
 for(let i=0;i<7;i++){
  S.litanyMode="guided";S.litanyStep=i;
  const html=api.renderHolyName();
  assert.ok(html.includes('data-ao-devo-card="holy-name-'+(i+1)+'"'));
  assert.ok(html.includes('data-face-v lang="'+l+'"'));
  assert.ok(html.includes('data-face-la lang="la" hidden'));
  contains(html,vern[i],"Holy Name "+l+"/"+i);
  contains(html,latin[i],"Holy Name LA/"+i);
  checks++;
 }
 S.litanyMode="full";const full=api.renderHolyName();
 contains(full,HOLY_NAME_LITANY_V381[l],"Holy Name full "+l);
 contains(full,HOLY_NAME_LITANY_V381.la,"Holy Name full Latin");
 checks++;
}
// Eleven original hymn witnesses. The eight seasonal sources are not
// silently granted missing historical French/English translations.
const allHymns={...SACRED_HYMNS_V381,...ICRSP_SEASONAL_HYMNS_V1};
assert.equal(api.HYMN_KEYS.length,11);
for(const key of api.HYMN_KEYS){
 const h=allHymns[key];assert.ok(h?.la?.trim());
 for(const requested of ["en","fr","la"]){
  locale=requested==="fr"?"fr":"en";
  S.hymn=key;S.hymnLang=requested;
  const actual=ICRSP_SEASONAL_HYMNS_V1[key]?(h[requested]?requested:"la"):requested;
  const html=api.renderHymns();
  assert.ok(html.includes('data-ao-devo-card="hymn-'+key+'"'));
  contains(html,h[actual],"Hymn "+key+"/"+actual);
  if(actual==="la")assert.ok(html.includes('class="aoTP381Reader" lang="la"'));
  else{
   assert.ok(html.includes('data-face-v lang="'+actual+'"'));
   assert.ok(html.includes('data-face-la lang="la" hidden'));
   contains(html,h.la,"Hymn original Latin "+key);
  }
  assert.ok(!html.includes("undefined"),"Do not display empty source metadata "+key);
  checks++;
 }
}
// Good Death: nine genuine independent prayers; default 1909 St Joseph
// invocations plus explicitly separate 2021 edition, never interchanged.
assert.equal(api.GOOD_DEATH_STAGES.length,9);
for(const l of ["en","fr"]){
 locale=l;
 for(let i=0;i<9;i++){
  S.goodDeathStep=i;S.goodDeathJosephEdition="1909";
  const [id]=api.GOOD_DEATH_STAGES[i];
  const rec=id==="aspirations"?GOOD_DEATH_DYING_V384.aspirations:
   id==="devotion_litany_st_joseph"?JOSEPH_LITANY_1909_V1:prayerData[id];
  assert.ok(rec,"Unowned Good Death text "+id);
  const html=api.renderGoodDeath();
  assert.ok(html.includes('data-ao-devo-card="good-death-'+id+'"'));
  contains(html,prayerSourceFacesV1(rec,l).vernacular,"Good Death "+id+"/"+l);
  if(rec.la)contains(html,rec.la,"Good Death Latin "+id);
  assert.ok(html.includes("data-tp381-route=\"pray.dying_companion\""));
  checks++;
 }
 S.goodDeathStep=0;S.goodDeathJosephEdition="2021";
 const expanded=api.renderGoodDeath();
 contains(expanded,JOSEPH_LITANY_2021_V1[l],"2021 St Joseph edition/"+l);
 assert.ok(expanded.includes("data-ao-joseph-source-status"));
 checks++;
}
// At the bedside, only genuine prayers are recited in the two prayer stages.
// First card is calling the priest and medical help, not simulated rites.
for(const l of ["en","fr"]){
 locale=l;
 S.dying="now";let html=api.renderDyingCompanion();
 assert.ok(html.includes("data-ao-bedside-medical-warning"));
 assert.ok(html.includes("data-ao-bedside-direct"));
 assert.ok(!html.includes("data-tp381-priest-absolve"),"No simulated priestly sacrament");
 checks++;
 S.dying="pray";html=api.renderDyingCompanion();
 contains(html,GOOD_DEATH_DYING_V384.aspirations[l],"Bedside aspirations/"+l);
 for(const id of ["sacrament_act_of_contrition","foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love","foundations_hail_mary","adoration_anima_christi"])
  assert.ok(html.includes('data-tp381-prayer="'+id+'"'),"Missing direct canonical bedside prayer "+id);
 checks++;
 S.dying="commend";html=api.renderDyingCompanion();
 contains(html,GOOD_DEATH_DYING_V384.proficiscere[l],"Proficiscere/"+l);
 contains(html,GOOD_DEATH_DYING_V384.proficiscere.la,"Proficiscere original Latin");
 for(const id of ["dead_eternal_rest_singular","dead_de_profundis"])
  assert.ok(html.includes('data-tp381-prayer="'+id+'"'),"Missing deceased suffrage "+id);
 assert.ok(html.includes("data-ao-proficiscere-witness-status"));
 checks++;
}
console.log("PASS · "+checks+" original-source-to-rendered-card checks: Holy Name 7+full × EN/FR/Latin, 11 hymns × requested EN/FR/LA with genuine Latin fallback, Good Death 9 prayers × EN/FR + two distinct St Joseph litany editions, Dying Companion three bedside stages × EN/FR with real source texts and no sacramental simulation");
