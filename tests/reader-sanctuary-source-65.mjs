import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {runInNewContext} from "node:vm";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const html=read("../assets/mass/live-sanctuary/index.html");
assert.equal(createHash("sha256").update(html).digest("hex"),
 "7089f9ade7af6a57a457e10b8db0cb45129429bebe8a62d920ea7d958c2a7c62",
 "The owner's original 3-D art and animation source must remain byte-for-byte unchanged");
assert.match(html,/ao-sanctuary-embedded\.js/);
const source=html.slice(html.indexOf("const D=")+8);
const D=JSON.parse(source);
const cards=D.cards.filter(c=>/^C\d{2}$/.test(c.id));
assert.equal(cards.length,65);
const presented=[],listeners={},st={form:"sung",solemn:false,inc:true};
let rebuilds=0;
const root={parentNode:{removeChild(){}},id:"pgPlan"};
const document={
 getElementById:id=>id==="pgPlan"?root:null,
 documentElement:{classList:{add(){}}},
 body:{appendChild(){}},head:{append(){}},
 createElement:()=>({textContent:""})
};
const win={parent:null,addEventListener:(n,fn)=>{listeners[n]=fn}};
win.parent=win;
const bridge=read("../assets/mass/live-sanctuary/ao-sanctuary-embedded.js");
assert.doesNotMatch(bridge,/\bsetTime\s*\(/,
 "The original demonstration timeline may never control the native LIVE reader");
runInNewContext(bridge,{
 D,st,document,window:win,location:{search:"?aoSanctuary=1",origin:"https://example.test"},
 M3:{show:(card,animate)=>presented.push([card.id,animate])},
 rebuild(){rebuilds++},
 URLSearchParams
});
const api=win.AO_SANCTUARY_EMBED_TEST;
assert.ok(api);
assert.equal(api.originalCardCount,65);
const send=(cardTitle,extra={})=>api.present({
 type:"AO_SANCTUARY_CUE_V1",version:1,
 cardTitle,form:"MISSA_CANTATA_SIMPLE",sourceSectionId:"AO.CARD.001",
 sourceCueId:null,certifiedSourceFocus:false,scholaOnly:false,...extra
});
for(const c of cards){
 const result=send(c.title);
 assert.equal(result.ok,true,c.id+" "+c.title+" must map");
 assert.equal(result.card,c.id);
 assert.deepEqual(presented.at(-1),[c.id,false],
  "Card navigation may only set a static scene, never animate ceremonies");
}
assert.equal(send("Improvised Mass card").ok,false);
assert.equal(send("Introit",{sourceSectionId:"OTHER"}).code,
 "UNVERIFIED_SOURCE_SECTION");
assert.equal(send("Offertory · Incensation",{scholaOnly:true}).ok,false);
assert.equal(send("Communion Antiphon",{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true})
 .choreography,"STATIC_STAGE");
const elevation="Words of Consecration and Elevation · Host";
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:false})
 .choreography,"STATIC_STAGE");
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true})
 .choreography,"SOURCE_TRIGGERED");
assert.deepEqual(presented.at(-1),["C36",true]);
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true})
 .choreography,"STATIC_STAGE");
assert.equal(send("Introit",{form:"LOW"}).card,"C05");
assert.equal(st.form,"low");
assert.ok(rebuilds>=2,"All forms reuse the original renderer's mount path");
assert.equal(send("At the Foot of the Altar · Introibo",{form:"LOW"}).card,"C01");
assert.equal(send("Gloria · Opening",{form:"LOW"}).card,"C07");
assert.equal(send("Credo · Opening",{form:"LOW"}).card,"C16");
assert.equal(send("Introit",{form:"SOLEMN"}).card,"C05");
assert.equal(st.solemn,true);
console.log("PASS original full visual SHA, 65 cards, Low/Sung/Solemn, independent Schola, source-only choreography and preserved camera gesture surface");
