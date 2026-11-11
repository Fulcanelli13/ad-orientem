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
let depth=0,end=-1,quoted=false,escape=false;
for(let i=0;i<source.length;i++){
 const char=source[i];
 if(quoted){
   if(escape)escape=false;
   else if(char==="\\")escape=true;
   else if(char==='"')quoted=false;
   continue;
 }
 if(char==='"'){quoted=true;continue}
 if(char==="{")depth++;
 else if(char==="}"&&--depth===0){end=i+1;break}
}
assert.ok(end>0,"Original sanctuary data object was not found");
const D=JSON.parse(source.slice(0,end));
const cards=D.cards.filter(c=>/^C\d{2}$/.test(c.id));
assert.equal(cards.length,65);
const presented=[],listeners={},st={form:"sung",solemn:false,inc:true};
let glowVisible=true,elevClass=true;
const glow={show:true,el:{classList:{contains:name=>name==="glow"}}};
const engine={bbs:[glow],vp:{classList:{
 remove:name=>{if(name==="elev")elevClass=false}
}}};
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
 M3:{eng:engine,show:(card,animate)=>{
  presented.push([card.id,animate]);
  if(card.id==="C36"||card.id==="C38"){
   glow.show=!animate;elevClass=!animate;
  }
 }},
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
 .choreography,"STATIC_STAGE","Wrong canonical source section cannot trigger Host elevation");
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.015"}).choreography,"SOURCE_TRIGGERED");
assert.deepEqual(presented.at(-1),["C36",true]);
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.015"}).choreography,"STATIC_STAGE");
const beforeExit=presented.length;
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0175",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.015"}).choreography,"STATIC_STAGE");
assert.equal(presented.length,beforeExit+1,
 "Leaving exact elevation cue must command a source-static visual hold");
assert.deepEqual(presented.at(-1),["C36",false]);
assert.equal(glow.show,false,
 "Source-exited elevation must not leave the original glowing visual active");
assert.equal(elevClass,false,
 "Source-exited elevation must remove the original elevation stage class");
assert.equal(send(elevation,{sourceCueId:"AO.SM.C0174",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.015"}).choreography,"SOURCE_TRIGGERED",
 "Reverse scroll into the same source rubric must replay the elevation");
assert.deepEqual(presented.at(-1),["C36",true]);
// The original 30-macro source model owns these as distinct canonical
// sections despite the LIVE UI showing AO.CANON.06 / AO.CANON.07.
const chalice="Words of Consecration and Elevation · Chalice";
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0181",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.016"}).choreography,"SOURCE_TRIGGERED");
assert.deepEqual(presented.at(-1),["C38",true]);
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0182",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.016"}).choreography,"STATIC_STAGE");
assert.equal(glow.show,false,"Chalice glow persists after source cue exit");
assert.equal(elevClass,false,"Chalice elevation stage remains active after cue exit");
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0181",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.016"}).choreography,"SOURCE_TRIGGERED");
assert.deepEqual(presented.at(-1),["C38",true]);
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0181",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.015"}).choreography,"STATIC_STAGE",
 "A Host macro cue must not masquerade as the Chalice elevation");
// Source-first Offertory incensation: the original C24 animation starts
// only at the priest's incense action, never at the Schola Offertory antiphon
// or at the initial blessing of incense. All other forms fail closed.
const off="Offertory · Incensation";
const incense={form:"MISSA_CANTATA_INCENSE",sourceSectionId:"AO.CARD.010",
 certifiedSourceFocus:true};
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0120"}).choreography,
 "STATIC_STAGE","Incense blessing must not start altar incensation");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121"}).choreography,
 "SOURCE_TRIGGERED");
assert.deepEqual(presented.at(-1),["C24",true]);
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121"}).choreography,
 "STATIC_STAGE","Same focused priest cue must not restart animation");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0122"}).choreography,
 "STATIC_STAGE");
assert.deepEqual(presented.at(-1),["C24",false],
 "Leaving the source-owned incense cue must cancel pending animation");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121"}).choreography,
 "SOURCE_TRIGGERED","Reverse scroll must re-arm incense");
assert.equal(send(off,{...incense,form:"LOW",
 sourceCueId:"AO.SM.C0121"}).choreography,"STATIC_STAGE",
 "Low Mass may never trigger incensation");
assert.equal(send(off,{...incense,form:"MISSA_CANTATA_SIMPLE",
 sourceCueId:"AO.SM.C0121"}).choreography,"STATIC_STAGE",
 "Simple sung Mass without incense may never trigger incensation");
assert.equal(send(off,{...incense,form:"SOLEMN",
 sourceCueId:"AO.SM.C0121"}).choreography,"SOURCE_TRIGGERED");
assert.equal(send(off,{...incense,sourceSectionId:"AO.CARD.009",
 sourceCueId:"AO.SM.C0121"}).choreography,"STATIC_STAGE",
 "Wrong source section may not animate incense");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121",
 scholaOnly:true}).code,"CHOIR_EVENT_NOT_MASS_CUE");
assert.equal(send("Preparation for the Gospel",{form:"LOW",
 sourceSectionId:"AO.CARD.007",sourceCueId:"AO.SM.C0081",
 certifiedSourceFocus:true}).choreography,"STATIC_STAGE",
 "Priest arrival at Gospel book is not evidence for an earlier server Missal transfer");
assert.equal(send("Communion of the Faithful",{form:"SOLEMN",
 sourceSectionId:"AO.CARD.025",sourceCueId:"AO.SM.C0246",
 certifiedSourceFocus:true}).choreography,"STATIC_STAGE",
 "Distribution at the rail must not invent an earlier priest walk");

assert.equal(send("Introit",{form:"LOW"}).card,"C05");
assert.ok(bridge.includes("stageSungSediliaAcolyte(card)"));
assert.ok(bridge.includes("singerSedilia=new Set("));
assert.equal(html.includes("stageSungSediliaAcolyte"),false,
  "Acolyte correction is an adapter, never a mutation of Claude's original visuals");
assert.equal(st.form,"low");
assert.ok(rebuilds>=2,"All forms reuse the original renderer's mount path");
assert.equal(send("At the Foot of the Altar · Introibo",{form:"LOW"}).card,"C01");
assert.equal(send("Gloria · Opening",{form:"LOW"}).card,"C07");
assert.equal(send("Credo · Opening",{form:"LOW"}).card,"C16");
assert.equal(send("Introit",{form:"SOLEMN"}).card,"C05");
assert.equal(st.solemn,true);
console.log("PASS original full visual SHA, 65 cards, Low/Sung/Solemn, independent Schola, source-only choreography and preserved camera gesture surface");

const manifest=JSON.parse(read("../assets/mass/live-sanctuary/original-gitblobs.v1.json"));
assert.equal(manifest.originalIconCount,65);
assert.equal(Object.keys(manifest.originalIconGitBlobs).length,65);
for(const [name,hash] of Object.entries(manifest.originalIconGitBlobs)){
 const file=readFileSync(new URL("../assets/mass/live-sanctuary/icons/"+
   encodeURIComponent(name),import.meta.url));
 const actual=createHash("sha1").update(Buffer.from("blob "+file.length+"\0"))
   .update(file).digest("hex");
 assert.equal(actual,hash,"Owner source icon changed: "+name);
}
console.log("PASS all 65 exact original icon Git blobs retained");
