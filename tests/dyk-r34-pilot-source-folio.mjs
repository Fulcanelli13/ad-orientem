import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dykPilotSourceFolioModel,dykPilotSourceFolioMarkup,
  createDykPilotSourceFolioOwner} from "../src/home/dyk-pilot-source-folio.js";

const r34=JSON.parse(readFileSync(
  "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
const pilot=r34.records.filter(x=>x.lane==="all-souls-november-2");
assert.equal(pilot.length,7);
const check=new Set();
for(const candidate of pilot){
  for(const language of ["en","fr"]){
    const model=dykPilotSourceFolioModel(r34,candidate.id,language);
    assert.ok(model,"Missing exact fact source model: "+candidate.id+"/"+language);
    assert.equal(model.sourceId,candidate.source_id);
    assert.equal(model.language,language);
    assert.equal(model.fact,candidate.pilot_home_copy[language]);
    assert.equal(model.sourceUrl,candidate.pilot_source_folio.url);
    assert.equal(model.reviewOnly,true);
    assert.equal(model.readOnly,true);
    assert.match(model.sourceLocation,model.sourceType==="ROMAN_RITUS"?/Ritus servandus, § IX\.2/:/31[1-4]/);
    const html=dykPilotSourceFolioMarkup(model);
    assert.match(html,/role="dialog" aria-modal="true"/);
    assert.match(html,/data-dyk-source-close/);
    assert.match(html,/data-dyk-original-source/);
    assert.match(html,/rel="noopener noreferrer"/);
    assert.match(html,/Not published|Non publié/);
    assert.ok(html.includes(model.fact));
    assert.ok(html.includes(model.sourceId));
    assert.ok(html.includes(model.sourceUrl.replaceAll("&","&amp;")));
    assert.ok(!html.includes("data-home-dyk-open"),"Must not silently replace live Home teaser");
    check.add(candidate.id+"/"+language);
  }
}
assert.equal(check.size,14,"Seven bilingual source folios");
assert.equal(dykPilotSourceFolioModel(r34,"DYK-DOES-NOT-EXIST","en"),null);
assert.equal(dykPilotSourceFolioModel(r34,"G219","en"),null);
assert.equal(dykPilotSourceFolioModel(r34,"DYK-UM01-001","en"),null,"Non-pilot source must not enter editorial pilot");
assert.equal(dykPilotSourceFolioModel({...r34,status:"PUBLISHED"},"DYK-UM02-014"),null);
assert.equal(dykPilotSourceFolioModel({...r34,records:[]},"DYK-UM02-014"),null);
assert.equal(dykPilotSourceFolioMarkup({...dykPilotSourceFolioModel(r34,pilot[0].id),sourceUrl:"javascript:alert(1)"}),"");
const injected={...dykPilotSourceFolioModel(r34,pilot[0].id),fact:'<img src=x onerror="alert(1)">'};
const guarded=dykPilotSourceFolioMarkup(injected);
assert.ok(!guarded.includes("<img"));
assert.ok(guarded.includes("&lt;img"));

let added=null,removed=false,focused=false,restored=false;
const closer={focus(){focused=true;}};
const originalLink={focus(){}};
const shade={};
const handlers={};
const simulated={
  innerHTML:"",
  querySelector(selector){
    return ({"[data-dyk-source-shade]":shade,"[data-dyk-source-close]":closer,
      "[data-dyk-original-source]":originalLink})[selector]||null;
  },
  addEventListener(type,fn){handlers[type]=fn;},
  remove(){removed=true;added=null;},
};
const win={document:{
  body:{appendChild(node){added=node;}},
  createElement(){return simulated;},
  activeElement:closer,
}};
const owner=createDykPilotSourceFolioOwner(win,{loadSelection:async()=>r34});
assert.equal(owner.status().published,false);
assert.equal(await owner.open({factId:pilot[0].id,language:"fr",trigger:{focus(){restored=true;}}}),true);
assert.equal(added,simulated);
assert.ok(simulated.innerHTML.includes("Le saviez-vous"));
assert.equal(focused,true);
assert.equal(owner.status().visible,true);
let prevented=false;
handlers.keydown({key:"Escape",preventDefault(){prevented=true;}});
assert.equal(prevented,true);
assert.equal(removed,true);
assert.equal(restored,true);
assert.equal(owner.status().visible,false);
assert.equal(await owner.open({factId:"DYK-DOES-NOT-EXIST"}),false);
assert.equal(owner.status().visible,false);

console.log("PASS seven R34 read-only source folios: 14 EN/FR models, exact source IDs/pages, safe markup, modal close, zero live publication");
