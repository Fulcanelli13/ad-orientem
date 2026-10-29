import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {readerPilotEnabled,LORETO_SOURCE_IDS,splitLoretoSource,pilotLoretoRows,renderPilotLoreto} from "../src/pray/prayer-reader-design-pilot.js";

assert.equal(readerPilotEnabled({location:{search:""}}),false);
assert.equal(readerPilotEnabled({location:{search:"?aoPrayerReadersPilot=1"}}),true);
assert.equal(readerPilotEnabled({location:{search:"?aoPrayerReadersPilot=0"}}),false);
assert.deepEqual(LORETO_SOURCE_IDS,["litany_loreto_1962","litany_loreto_current"]);
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;");
const L=(en)=>en;
for(const id of LORETO_SOURCE_IDS){
 const rec=PRAY_CANONICAL_DATA_V435930.prayers[id];
 assert.ok(rec,"Required source identity missing: "+id);
 for(const lang of ["en","fr","la"]){
  assert.ok(rec[lang]?.length>100);
  const lines=splitLoretoSource(rec[lang]);
  assert.equal(lines.map(x=>x.raw).join("\n"),rec[lang],"No original prayer line, gap, or punctuation may be changed: "+id+" "+lang);
  assert.ok(lines.filter(x=>x.kind==="pair").length>40,"Leader/response pairs must originate from actual printed text");
  const markup=pilotLoretoRows(rec[lang],{esc,L,group:true});
  assert.equal((markup.match(/aoReaderPilotLitanyPair/g)||[]).length,lines.filter(x=>x.kind==="pair").length);
  for(const item of lines.filter(x=>x.kind==="pair")){
   assert.equal(item.leader+" — "+item.response,item.raw,"Exact source punctuation must survive");
   assert.ok(markup.includes(esc(item.leader))&&markup.includes(esc(item.response)));
  }
  const page=renderPilotLoreto({record:rec,id,language:lang,group:true,
   head:t=>"<header>"+t+"</header>",L,esc,sourceLine:()=>"<details>Verified source</details>",
   libraryContextMarkup:()=>"<details>Reader guide</details>"
  });
  assert.match(page,/data-p435930-pilot-loreto-language="la"/);
  assert.match(page,/data-p435930-pilot-loreto-form="litany_loreto_current"/);
  assert.match(page,/data-p435930-pilot-loreto-form="litany_loreto_1962"/);
  assert.match(page,/data-p435930-lib-back/);
  assert.match(page,/data-ao-reader-design-pilot="litany"/);
  assert.match(page,/class="aoReaderPilotRailHead"/,"Litany must name invocation and response rails");
  assert.match(page,/aoReaderPilotCommunal/,"Group mode uses the distinct communal rail treatment");
 }
}
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.ok(runtime.includes("if(PRAYER_READER_PILOT_ENABLED&&LORETO_SOURCE_IDS.includes(LIB.open))"),"Loreto source routing must remain gated");
assert.ok(runtime.includes("data-p435930-pilot-focus"),"single-prayer focus must be explicit");
assert.ok(runtime.includes("PILOT_LORETO_GROUP=selected==='group'"),"communal role labels optional");
for(const mode of ["individual","group"])assert.match(renderPilotLoreto({
 record:PRAY_CANONICAL_DATA_V435930.prayers.litany_loreto_1962,id:"litany_loreto_1962",
 language:"en",group:false,head:t=>t,L,esc,sourceLine:()=>"",libraryContextMarkup:()=>""
}),new RegExp('data-p435930-pilot-loreto-group="'+mode+'"'));
assert.ok(runtime.includes("LIB.language=language"),"language face must use an available source");
assert.ok(runtime.includes("if(!['en','fr','la'].includes(language)||!P(LIB.open)?.[language])return"),"missing translations must fail closed");
console.log("PASS Reader UX pilot: 2 Loreto source identities × 3 complete languages, exact lines retained, gated F01/F03 presentation");
