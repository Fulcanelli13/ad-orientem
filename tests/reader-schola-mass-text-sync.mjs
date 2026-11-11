import {test} from "node:test";
import assert from "node:assert/strict";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {createScholaFollowClock,scholaGabcSyllables} from "../src/mass/reader-schola-notation-follow.js";
import {normalizeScholaLatin,scholaMassTextAnchors,
 createScholaMassTextSynchronizer} from "../src/mass/reader-schola-mass-text-sync.js";

const gloria=offlineKyrialeResearchScore("GLORIA","MASS_08");
const credo=offlineKyrialeResearchScore("CREDO","CREDO_03");
const kyrie=offlineKyrialeResearchScore("KYRIE","MASS_08");
assert.ok(gloria?.gabc&&credo?.gabc&&kyrie?.gabc);

test("source-exact Gloria VIII links two successive Mass paragraphs to one GABC cursor",()=>{
 const aligned=scholaMassTextAnchors(gloria.gabc,[
  {id:"GLORIA.INTONATION",latin:"Glória in excélsis Deo."},
  {id:"GLORIA.SCHOLA",latin:"Et in terra pax homínibus bonæ voluntátis."}
 ]);
 assert.equal(aligned.anchors.length,2);
 assert.ok(aligned.anchors[0].start<aligned.anchors[1].start);
 assert.ok(aligned.anchors[1].sourceSyllableOffset>=0);
 assert.ok(aligned.syllables.length>100);
});

test("Credo III uses the same source-cursor mapping, not a second phrase timer",()=>{
 const aligned=scholaMassTextAnchors(credo.gabc,[
  {id:"CREDO.INTONATION",latin:"Credo in unum Deum."},
  {id:"CREDO.SCHOLA",latin:"Patrem omnipotentem, factorem caeli et terrae."}
 ]);
 assert.equal(aligned.anchors.length,2);
 assert.ok(aligned.anchors[0].start<aligned.anchors[1].start);
 assert.equal(normalizeScholaLatin("cæli, Jésu"),"caeliiesu");
});

test("unknown vernacular or mismatched Latin does not move the Mass scroll",()=>{
 const plan=scholaMassTextAnchors(gloria.gabc,[
  {id:"wrong",latin:"Glory to God in the highest, and peace to his people."}
 ]);
 assert.equal(plan.anchors.length,0);
 assert.equal(scholaMassTextAnchors("",[{id:"a",latin:"Gloria in excelsis"}]).anchors.length,0);
});

test("reader follows precise matched source glyph while preserving paragraph and source cue",()=>{
 const latin="Glória in excélsis Deo.";
 const node={nodeType:3,textContent:latin};
 const element={textContent:latin,childNodes:[node],
  getBoundingClientRect:()=>({top:160,height:22})};
 const paragraph={
  hidden:false,isConnected:true,dataset:{kind:"TEXT",paragraphId:"AO.SM.C0053"},
  querySelectorAll:()=>[element]
 };
 const body={querySelectorAll:()=>[paragraph]};
 const reader={
  scrollTop:0,clientHeight:300,dataset:{},ownerDocument:{
   createRange:()=>{
    let offset=0;
    return {setStart:(_node,at)=>{offset=at},
     setEnd:()=>{},getBoundingClientRect:()=>({top:160+offset*2,height:20})};
   }
  },
  querySelector:s=>s==='[data-role="paragraphs"]'?body:null,
  querySelectorAll:()=>[],
  getBoundingClientRect:()=>({top:10,height:300})
 };
 const follow=createScholaMassTextSynchronizer({reader,gabc:gloria.gabc});
 const first=scholaGabcSyllables(gloria.gabc).findIndex(p=>p.identity==="gloria");
 // Source splits Gloria into multiple syllables; use the first note-bearing word.
 const pos=Math.max(0,first);
 assert.equal(follow.follow(pos),true);
 assert.equal(reader.dataset.scholaTextFollowParagraph,"AO.SM.C0053");
 assert.equal(reader.dataset.scholaTextFollowIndex,String(pos));
 assert.ok(reader.scrollTop>0);
 follow.destroy();
 assert.equal(reader.dataset.scholaTextFollowIndex,undefined);
});

test("an inactive or unapproved-score state never scrolls the Mass",()=>{
 const reader={querySelectorAll:()=>[],dataset:{},querySelector:()=>null};
 const follow=createScholaMassTextSynchronizer({
  reader,gabc:credo.gabc,enabled:()=>false
 });
 assert.equal(follow.follow(0),false);
 assert.equal(reader.dataset.scholaTextFollowIndex,undefined);
});

test("pause and manual seeking preserve one Schola syllable cursor without any priest clock",()=>{
 let callback=null,events=[];
 const clock=createScholaFollowClock({
  schedule:fn=>{callback=fn;return 1},cancel:()=>{callback=null},
  onStep:event=>events.push(event)
 });
 assert.equal(clock.start(8),true);
 assert.deepEqual(events.map(x=>x.index),[0]);
 clock.pause();
 assert.equal(clock.getState().paused,true);
 assert.equal(callback,null);
 clock.seek(5);
 assert.equal(clock.getState().index,5);
 assert.equal(clock.getState().running,false);
 assert.equal(events.at(-1).origin,"manual");
 clock.resume();
 assert.equal(clock.getState().paused,false);
 assert.equal(clock.getState().running,true);
 assert.equal(typeof callback,"function");
 callback();
 assert.equal(clock.getState().index,6);
 clock.destroy();
 assert.equal(clock.getState().destroyed,true);
});
