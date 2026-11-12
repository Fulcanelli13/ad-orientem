// M47: actual Exsurge SVG notehead identities and conservative source mapping.
// The SVG comes from the pinned engine, not a hand-drawn mock score.
// A small fake DOM is used only to exercise the pure mapper without JSDOM.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {offlineKyrialeResearchScore} from '../src/mass/reader-kyriale-research-gabc.js';
import {compileKyrieXviAudition} from '../src/mass/reader-schola-kyrie-research-audition.js';
import {mapExsurgeSvgNoteheads,createExsurgeNoteheadFollower} from
 '../src/mass/reader-schola-exsurge-notehead-follow.js';
const src=offlineKyrialeResearchScore('KYRIE','MASS_16');
const compiled=compileKyrieXviAudition(src.gabc);
assert.equal(src?.scoreId,'GREGOBASE-545');
assert.equal(src?.scoreApproved,false);
assert.equal(compiled.sourceNoteCount,40);
assert.equal(compiled.performance.length,81);
assert.equal(compiled.performance[0].sourceNoteOrdinal,1);
assert.equal(compiled.performance[9].sourceNoteOrdinal,1,
  'First Kyrie must revisit printed note-1 for the second invocation');
assert.equal(compiled.performance.at(-1).sourceNoteOrdinal,40);
const vendor=readFileSync(new URL('../assets/vendor/exsurge/exsurge.min.js',import.meta.url),'utf8');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(vendor,sandbox,{timeout:10000});
const api=sandbox.exsurge,ctx=new api.ChantContext();
const score=new api.ChantScore(ctx,api.Gabc.createMappingsFromSource(ctx,src.gabc),true);
score.performLayout(ctx);
const rendered=[];
for(const width of [304,374,720]){
 await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
 const svg=score.createSvg(ctx);
 const uses=[...svg.matchAll(/<use\b[^>]*>/g)].map(m=>m[0])
  .filter(tag=>/\bclass="[^"]*\bnote\b[^"]*"/.test(tag)&&/\bid="note-\d+"/.test(tag));
 assert.equal(uses.length,40,'Actual renderer changed its notehead count at '+width);
 const records=uses.map(tag=>{
  const attr=name=>tag.match(new RegExp('(?:^|\\s)'+name+'="([^"]*)"'))?.[1]??null;
  return {id:attr('id'),sourceIndex:attr('source-index'),
    elementIndex:attr('element-index'),href:attr('xlink:href')??attr('href')};
 });
 assert.deepEqual(records.map(x=>x.id),Array.from({length:40},(_,i)=>'note-'+(i+1)));
 assert.ok(records.every(x=>x.href?.startsWith('#')));
 assert.ok(records.every((x,i)=>i===0||Number(x.sourceIndex)>Number(records[i-1].sourceIndex)));
 rendered.push({width,records});
}
function fakeSvg(records){
 const nodes=records.map(r=>({
  id:r.id,dataset:{},
  getAttribute:key=>key==='source-index'?r.sourceIndex:
   key==='element-index'?r.elementIndex:
   key==='xlink:href'?r.href:key==='href'?null:null,
  getAttributeNS:()=>r.href,
  removeAttribute(key){if(key==='data-schola-notehead-active')delete this.dataset.scholaNoteheadActive;},
  closest:selector=>selector==='g.ChantNotationElement'?{}:null,
  getBoundingClientRect:()=>({width:6,height:6,top:0,bottom:6,left:0,right:6})
 }));
 return {classList:{contains:key=>key==='Exsurge'},
  querySelectorAll:selector=>selector==='use.note[id^="note-"]'?nodes:[],
  nodes};
}
const first=fakeSvg(rendered[0].records);
assert.equal(mapExsurgeSvgNoteheads(first,compiled).length,40);
const staff={dataset:{},
  querySelector:sel=>sel==='svg'?staff.current:null,
  getBoundingClientRect:()=>({width:0,height:0}),
  current:first};
const follow=createExsurgeNoteheadFollower({staff,compiled});
assert.equal(follow.paint(1),true);
assert.deepEqual(first.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true').map(n=>n.id),['note-1']);
assert.equal(follow.paint(38),true);
assert.deepEqual(first.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true').map(n=>n.id),['note-38']);
assert.equal(follow.paint(1),true);
assert.deepEqual(first.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true').map(n=>n.id),['note-1']);
const second=fakeSvg(rendered[1].records);staff.current=second;
assert.equal(follow.paint(40),true,'Reflow must bind newly minted SVG glyphs');
assert.deepEqual(second.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true').map(n=>n.id),['note-40']);
assert.deepEqual(first.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true'),[],
 'Stale replaced SVG must not retain active note marker');
assert.equal(follow.paint(0),false);
assert.deepEqual(second.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true'),[]);
const short=fakeSvg(rendered[1].records.slice(0,39));
staff.current=short;
assert.equal(follow.paint(6),false,'A missing notehead must fail closed');
assert.equal(staff.dataset.scholaNoteheadsMapped,'false');
assert.deepEqual(short.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true'),[]);
const duplicate=fakeSvg(rendered[2].records.map((r,i)=>i===24?{...r,id:'note-24'}:r));
assert.equal(mapExsurgeSvgNoteheads(duplicate,compiled).length,0,'Duplicate note ID must fail closed');
const shuffled=fakeSvg([...rendered[2].records].reverse());
assert.equal(mapExsurgeSvgNoteheads(shuffled,compiled).length,0,'Reordered source ordinals must fail closed');
const nonmonotonic=fakeSvg(rendered[2].records.map((r,i)=>i===4?{...r,sourceIndex:'1'}:r));
assert.equal(mapExsurgeSvgNoteheads(nonmonotonic,compiled).length,0);
const final=fakeSvg(rendered[2].records);staff.current=final;
assert.equal(follow.paint(6),true);
assert.equal(follow.getState().glyphCount,40);
assert.equal(staff.dataset.scholaActiveNotehead,'6');
follow.destroy();
assert.deepEqual(final.nodes.filter(n=>n.dataset.scholaNoteheadActive==='true'),[]);
assert.equal(follow.paint(1),false);
assert.equal(follow.getState().destroyed,true);
console.log('PASS M47: 40 actual Exsurge source note IDs at 304/374/720, 81 playback events, exact glyph cursor, repeats, reflow, missing/duplicate/order fail-closed');
