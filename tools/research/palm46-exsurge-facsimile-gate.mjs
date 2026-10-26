// Research-only executable proof: REAL Exsurge parsing and multiwidth SVG layout.
// The runtime vendor is read from the pinned existing Schola owner commit;
// no forked musical engine, no score publication and no synthesized performance.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const [vendorPath,originalPath,reviewPath]=process.argv.slice(2);
if(!vendorPath||!originalPath||!reviewPath)
  throw new Error('Usage: node tools/research/palm46-exsurge-facsimile-gate.mjs EXSURGE_BUNDLE ORIGINAL_GABC REVIEW_GABC');
const rawBuffer=readFileSync(originalPath);
const raw=rawBuffer.toString('utf8');
const sourceSha=createHash('sha256').update(rawBuffer).digest('hex');
assert.equal(sourceSha,'eb13e9eadcfeebca7e5fa0617f6cbb6c9823464ff88af2995952ab21ca8717a0','Archived source altered');
assert.ok(raw.includes('O(f)mnes(gh) gen(h)tes,(h)'),'Original historical error no longer visible');
const proposed=readFileSync(reviewPath,'utf8');
const changes=[
 ['name:Omnes gentes, plaudite manibus (nova lat.);','name:Omnes populi, plaudite manibus (Psalmus 46, provisional);'],
 ['transcriber:Simone Sanavio;\n','transcriber:Simone Sanavio;\ncommentary: Ad Orientem research-only corrected opening underlay - NOT editorially certified or published;\n'],
 ['\n%%\n%%\r\n','\n%%\n'],
 ['O(f)mnes(gh) gen(h)tes,(h)','O(f)mnes(gh) pó(h)pu(h)li,(h)']
];
let expected=raw;
for(const [before,after] of changes){
  assert.equal(expected.split(before).length,2,'Exactly one expected source token must be present');
  expected=expected.replace(before,after);
}
assert.equal(proposed,expected,'Notated derivative modified bytes outside the four reviewed substitutions');
assert.equal((proposed.match(/%%/g)||[]).length,1,'Provisional GABC requires one header/body delimiter');
assert.ok(proposed.includes('O(f)mnes(gh) pó(h)pu(h)li,(h)'),'Must add third reciting tone h');
const vendor=readFileSync(vendorPath,'utf8');
assert.ok(vendor.length>200000,'Must use real pinned offline Exsurge bundle');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(vendor,sandbox,{timeout:6000,filename:'exsurge.min.js'});
const api=sandbox.exsurge;
assert.ok(api?.Gabc?.createMappingsFromSource&&api?.ChantContext&&api?.ChantScore,'Expected Exsurge parser and renderer');
async function checkScore(gabc,label){
  const ctx=new api.ChantContext();
  const mappings=api.Gabc.createMappingsFromSource(ctx,gabc);
  assert.ok(mappings.length>=6,label+' has no parsed note/lyric mappings');
  const score=new api.ChantScore(ctx,mappings,true);
  score.performLayout(ctx);
  const views=[];
  for(const width of [260,420,800]){
    await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
    const svg=score.createSvgTree(ctx);
    assert.equal(svg.name,'svg',label+' not valid SVG');
    assert.ok(svg.children.length>0,label+' empty SVG');
    assert.ok(score.lines.length>0,label+' missing visible score lines');
    views.push({width,systems:score.lines.length,svgChildren:svg.children.length});
  }
  assert.ok(views[0].systems>=views[2].systems,'Phone layout must not show fewer systems than desktop');
  return {label,mappings:mappings.length,views};
}
// Original requires only temporary duplicated-delimiter normalization for parsing.
// It is never rewritten into the source archive.
const origNormalized=raw.replace('\n%%\n%%\r\n','\n%%\n');
const originalResult=await checkScore(origNormalized,'archived_wrong_text_reference');
const candidateResult=await checkScore(proposed,'provisional_five_syllable_corrected_1961_psalm46');
const report={
  schema:'ao-palm46-real-exsurge-proof-v1',
  outcome:'REAL_GABC_SVG_RENDER_SUCCESS_NOT_EDITORIAL_APPROVAL',
  originalSha256:sourceSha,
  ownerBundle:'feature/chant-score-pilot-20261026 at pinned revision',
  sourcePage:'1961 Graduale Romanum, 144**',
  textChange:'Omnes gentes => Omnes populi, with 1 added h tenor',
  originalResult,candidateResult,
  reviewedMelody:false,fullPsalmTextVerified:false,roman1962RuntimeApproved:false
};
console.log('AO_PALM46_RENDER_RESULT:'+JSON.stringify(report));
