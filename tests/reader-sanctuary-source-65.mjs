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
const originalIncenseAnimationCalls=presented.length;
for(const continuation of ["AO.SM.C0122","AO.SM.C0123","AO.SM.C0124"]){
 assert.equal(send(off,{...incense,sourceCueId:continuation}).choreography,
  "STATIC_STAGE","Incense continuation must not restart action at "+continuation);
}
assert.equal(presented.length,originalIncenseAnimationCalls,
 "Continuing source prayers must not cancel the original 16-second sequence");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121"}).choreography,
 "STATIC_STAGE","Reverse scroll within ongoing incensation must not restart it");
assert.equal(send("Offertory · Lavabo and Offering to the Trinity",{
 ...incense,sourceCueId:"AO.SM.C0125"}).choreography,"STATIC_STAGE");
assert.deepEqual(presented.at(-1),["C25",false],
 "Leaving the incensation source card must cancel pending original keyframes");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0122"}).choreography,
 "STATIC_STAGE","Re-entering a continuation must not invent a new incensation start");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121"}).choreography,
 "SOURCE_TRIGGERED","Re-entering actual C0121 must re-arm original incensation");
// Low/simple Sung *normal navigation* never sends C24: the source
// retains a state-only omitted-incense record, which visibleCardAllowed()
// excludes. A direct renderer test of the original C24 title remains
// fail-closed for animation and cannot be mistaken for a native screen.
for(const noIncense of ["LOW","MISSA_CANTATA_SIMPLE"]){
 const staticResult=send(off,{...incense,form:noIncense,
  sourceCueId:"AO.SM.C0121"});
 assert.equal(staticResult.choreography,"STATIC_STAGE",
  "No-incense forms cannot ever start original C24 motion");
 assert.equal(staticResult.card,"C24",
  "Unmodified owner's original scene bank still indexes C24");
 assert.equal(staticResult.sourceCueId,"AO.SM.C0121",
  "Test-only source cue may be recognized without triggering action");
}
assert.equal(send(off,{...incense,form:"SOLEMN",
 sourceCueId:"AO.SM.C0121"}).choreography,"SOURCE_TRIGGERED");
assert.equal(send(off,{...incense,form:"SOLEMN",requiem:true,
 sourceCueId:"AO.SM.C0121"}).choreography,"STATIC_STAGE",
 "Ritus XIII.2 allows offerings/altar incense at Requiem, but the original"+
 " routine mistakenly incenses ministers and people; do not play it");
assert.equal(send("Proclamation of the Holy Gospel",{
 form:"SOLEMN",sourceSectionId:"AO.CARD.007",
 requiem:true,sourceCueId:"AO.SM.C0084",
 certifiedSourceFocus:true}).card,"C14",
 "The Solemn Requiem Gospel retains its source scene, without ordinary"+
 " thurifer or acolyte-candle procession");
assert.equal(send(off,{...incense,sourceSectionId:"AO.CARD.009",
 sourceCueId:"AO.SM.C0121"}).choreography,"STATIC_STAGE",
 "Wrong source section may not animate incense");
assert.equal(send(off,{...incense,sourceCueId:"AO.SM.C0121",
 scholaOnly:true}).code,"CHOIR_EVENT_NOT_MASS_CUE");
assert.equal(send("Preparation for the Gospel",{form:"LOW",
 sourceSectionId:"AO.CARD.007",sourceCueId:"AO.SM.C0081",
 certifiedSourceFocus:true}).choreography,"STATIC_STAGE",
 "Priest arrival at Gospel book is not evidence for an earlier server Missal transfer");
const communionStation=send("Communion of the Faithful",{form:"SOLEMN",
 sourceSectionId:"AO.CARD.025",sourceCueId:"AO.SM.C0246",
 certifiedSourceFocus:true});
assert.equal(communionStation.choreography,"STATIC_STAGE",
 "Distribution at the rail must not invent an earlier priest walk");
assert.equal(communionStation.communionStation,"AT_RAIL_STATIC",
 "C57 source card is an at-rail station, not a physical movement clock");
assert.equal(send("Communion of the Faithful",{form:"LOW",
 sourceSectionId:"AO.CARD.025",sourceCueId:"AO.SM.C0246",
 certifiedSourceFocus:true}).communionStation,"AT_RAIL_STATIC",
 "Low Mass C57 also remains a static rail scene");
assert.equal(send("Communion of the Faithful",{form:"SOLEMN",
 sourceSectionId:"AO.CARD.024",sourceCueId:"AO.SM.C0246",
 certifiedSourceFocus:true}).communionStation,null,
 "Wrong macro cannot attach source-specific Communion paten");
assert.equal(send("Ablutions",{form:"SOLEMN",
 sourceSectionId:"AO.CARD.026",sourceCueId:"AO.SM.C0247",
 certifiedSourceFocus:true}).communionStation,null,
 "Leaving Communion distribution must clear source-owned rail-paten stage");
const returnEvent={form:"SOLEMN",sourceSectionId:"AO.CARD.025",
 sourceCueId:"AO.SM.C0246",certifiedSourceFocus:true};
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-300"}).communionReturnTriggered,false,
 "Distribution begins does not mean the priest starts returning");
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-305"})
 .communionReturnTriggered,false,
 "Independent Communion antiphon Schola cannot impersonate priest return");
const returning=send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-320"});
assert.equal(returning.choreography,"STATIC_STAGE",
 "Canonical non-text return is NOT original 12-second communion approach");
assert.equal(returning.communionStation,"PRIEST_RETURN_SOURCE_EVENT");
assert.equal(returning.communionReturnTriggered,true);
assert.equal(returning.canonicalCommunionEventId,"MC-COM-320");
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-320"})
 .communionReturnTriggered,false,"Repeated return event cannot replay path");
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-310"})
 .communionStation,"AT_RAIL_STATIC",
 "Rewind to distribution must reset the return stage");
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,canonicalCommunionEventId:"MC-COM-320"})
 .communionReturnTriggered,true,
 "Re-entering real MC-COM-320 after distribution may re-arm source return");
assert.equal(send("Ablutions",{form:"SOLEMN",
 sourceSectionId:"AO.CARD.026",sourceCueId:"AO.SM.C0247"})
 .communionStation,null,
 "After Communion return, Ablutions must reset the source stage");
assert.equal(send("Communion of the Faithful",{
 ...returnEvent,form:"MISSA_CANTATA_SIMPLE",
 canonicalCommunionEventId:"MC-COM-320"}).communionReturnTriggered,false,
 "Sung Mass must not inherit an uncertified objective event");

// Hiding the viewer for MISSAL must explicitly cancel original timers,
 // smoke/elevation FX and restore an action-free source stage.
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0181",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.016"}).choreography,"SOURCE_TRIGGERED");
assert.equal(api.clear().code,"SOURCE_VISUAL_CLEARED");
assert.deepEqual(presented.at(-1),["C38",false],
 "Clear must stop the current visual action without mutating canonical Mass");
assert.equal(glow.show,false);
assert.equal(elevClass,false);
assert.equal(api.getState().card,undefined);
assert.equal(send(chalice,{sourceCueId:"AO.SM.C0181",certifiedSourceFocus:true,
 sourceSectionId:"AO.CARD.016"}).choreography,"SOURCE_TRIGGERED",
 "Restoring LIVE must re-arm the source illustration");

// Five R20 Sunday aspersion stages are OUTSIDE the canonical 65 Cnn cards.
 // Never play Claude's entire P1 nave walk on a chant, stage navigation
 // or the faithful's acknowledgement of having been sprinkled.
const asp=(stage,records,extra={})=>api.present({
 type:"AO_SANCTUARY_CUE_V1",version:1,sourceRiteId:"ASPERGES",
 form:"SOLEMN",riteStageId:stage,sourceRecordIds:records,
 observedSprinkled:false,scholaOnly:false,...extra
});
assert.equal(asp("ASP-R01",["ASP-010"]).card,"P1");
assert.deepEqual(presented.at(-1),["P1",false],
 "Initial Asperges must show the original scene without invented movement");
assert.equal(asp("ASP-R02",["ASP-020","ASP-030"]).choreography,"STATIC_STAGE");
assert.equal(asp("ASP-R02",["ASP-020","ASP-030"],
 {scholaOnly:true}).code,"CHOIR_EVENT_NOT_MASS_CUE");
assert.equal(asp("ASP-R03",["ASP-040"]).sprinkling,"NONE",
 "Receiving the prayer card cannot imply being sprinkled");
assert.equal(asp("ASP-R03",["ASP-040"],{observedSprinkled:true}).sprinkling,
 "EXPLICIT_PERSONAL_OBSERVATION");
assert.equal(asp("ASP-R03",["ASP-040"],{observedSprinkled:true}).sprinkling,
 "NONE","Repeated projection must not invent a second physical observation");
assert.equal(asp("ASP-R02",["ASP-020","ASP-030"],
 {observedSprinkled:true}).code,"PERSONAL_SPRINKLING_STAGE_REQUIRED");
assert.equal(asp("ASP-R04",["ASP-050"]).choreography,"STATIC_STAGE");
assert.equal(asp("ASP-R05",["ASP-060"]).card,"P1");
assert.equal(asp("ASP-R05",["ASP-030"]).code,
 "ASPERGES_NATIVE_STAGE_SOURCE_REQUIRED");
assert.equal(asp("ASP-R03",["ASP-040"],{form:"LOW"}).code,
 "ASPERGES_SUNG_FORM_REQUIRED");
assert.equal(send("Introit",{form:"LOW"}).card,"C05");

assert.ok(bridge.includes("stageSedilia(card,form)"));
assert.ok(bridge.includes("sungSedilia=new Set("));
assert.ok(bridge.includes("clearSediliaPlacement()"));
assert.ok(bridge.includes("a.x=3.71;"));
assert.ok(bridge.includes("DONOR_SEDILIA_REVIEW_HOLD"),
 "Unapproved sedilia art may not be characterized as complete");
assert.ok(!bridge.includes("SEDILIA_VISIBLE_BENT_LEGS") &&
  !bridge.includes('shoe.setAttribute("cx","34.4")'),
 "Owner-rejected white trousers, floating legs and moved shoe must not return");
assert.ok(bridge.includes("acolyte.x=2.36;acolyte.z=1.8;"));
assert.equal(html.includes("stageSedilia(card,form)"),false,
 "Original 3D church and camera may not be modified to fix seated sprites");
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
