import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {createScholaFollowClock,scholaGabcSyllables,scholaKyrieSourceOccurrences} from "../src/mass/reader-schola-notation-follow.js";
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

test("every original 1962 Sung Gloria and Credo paragraph aligns across the ENTIRE source score",()=>{
 const corpus=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
 for(const {label,block,score} of [
  {label:"GLORIA",block:"AO.SM.B016",score:gloria},
  {label:"CREDO",block:"AO.SM.B027",score:credo}
 ]){
  const owned=corpus.blocks.find(b=>b.Block_ID===block);
  assert.ok(owned?.units?.length,label);
  const [first,second]=owned.units;
  assert.equal(first.clock,"PUBLIC_TEXT",label);
  assert.equal(second.clock,"SCHOLA_PUBLIC",label);
  const rows=[{
   id:first.cue_id+"+"+second.cue_id,
   latin:first.latin+" "+second.latin
  },...owned.units.filter(u=>u.clock==="SCHOLA_PUBLIC"&&u!==second)
    .map(u=>({id:u.cue_id,latin:u.latin}))];
  const map=scholaMassTextAnchors(score.gabc,rows);
  const fullLength=scholaGabcSyllables(score.gabc)
    .map(s=>normalizeScholaLatin(s.label)).join("").length;
  assert.equal(map.anchors.length,rows.length,label+" missing source cue mapping");
  assert.equal(map.anchors[0].start,0,label+" must begin at source note 1");
  assert.equal(map.anchors.at(-1).end,fullLength,label+" must reach Amen without omissions");
  assert.equal(map.anchors.reduce((sum,p)=>sum+p.end-p.start,0),fullLength,
    label+" source underlay must be fully covered without inferred words");
  for(let i=1;i<map.anchors.length;i++)
   assert.equal(map.anchors[i-1].end,map.anchors[i].start,label+" discontinuity");
 }
});

test("isolated repeated Gloria wording is not assigned to an arbitrary occurrence",()=>{
 const plan=scholaMassTextAnchors(gloria.gabc,[{id:"isolated",latin:"Iesu Christe."}]);
 assert.equal(plan.anchors.length,0);
});

test("Kyrie VIII ninefold 1962 text uses the ORIGINAL source-notated repeat instructions",()=>{
 const original=scholaGabcSyllables(kyrie.gabc);
 const played=scholaKyrieSourceOccurrences(kyrie.gabc);
 assert.equal(original.length,27,"original Kyrie VIII has four notated invocations");
 assert.equal(played.length,60,"the printed iij./ij. instructions expand to nine source invocations");
 assert.equal(new Set(played.map(x=>x.sourceIndex)).size,original.length);
 assert.ok(played.some(x=>x.repeatPass===3));
 const corpus=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
 const block=corpus.blocks.find(x=>x.Block_ID==="AO.SM.B015");
 const rows=block.units.filter(u=>u.clock==="SCHOLA_PUBLIC")
   .map(u=>({id:u.cue_id,latin:u.latin}));
 assert.equal(rows.length,9);
 const plan=scholaMassTextAnchors(kyrie.gabc,rows,{trackId:"KYRIE"});
 assert.equal(plan.anchors.length,9,"all nine canonical Kyrie text cues must map");
 const length=plan.syllables.map(s=>normalizeScholaLatin(s.label)).join("").length;
 assert.equal(plan.anchors[0].start,0);
 assert.equal(plan.anchors.at(-1).end,length);
 assert.equal(plan.anchors.reduce((sum,x)=>sum+x.end-x.start,0),length);
 assert.equal(plan.anchors[2].end,plan.anchors[3].start);
 // Repetition uses old printed noteheads; a repeated occurrence has a
 // distinct performance coordinate but the same source-neume index.
 assert.equal(played[0].sourceIndex,played[7].sourceIndex);
 assert.notEqual(played[0].index,played[7].index);
});
test("an isolated Kyrie cue cannot guess which of nine invocations it represents",()=>{
 const alone=scholaMassTextAnchors(kyrie.gabc,
   [{id:"one",latin:"Kýrie, eléison."}],{trackId:"KYRIE"});
 assert.equal(alone.anchors.length,0);
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

test("the priest's intonation cannot be selected by the Schola follow clock",()=>{
 const callbacks=[],pending=[];
 const clock=createScholaFollowClock({
  schedule:fn=>{pending.push(fn);return pending.length},
  cancel:()=>{},
  onStep:event=>callbacks.push(event.index)
 });
 assert.equal(clock.start(196,{index:9,minimumIndex:9}),true);
 assert.equal(clock.getState().index,9);
 assert.equal(clock.getState().minimum,9);
 assert.equal(clock.seek(0),true);
 assert.equal(clock.getState().index,9);
 assert.equal(clock.shift(-100),true);
 assert.equal(clock.getState().index,9);
 assert.equal(callbacks.at(-1),9);
 assert.equal(clock.seek(19),true);
 assert.equal(clock.getState().index,19);
 clock.destroy();
});
