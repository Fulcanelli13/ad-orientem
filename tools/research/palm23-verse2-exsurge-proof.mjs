// Exact research GABC -> pinned existing Schola Exsurge engine.
// This proves parse/layout/render at phone/tablet/desktop widths, not musical correctness.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';

const [vendorPath,sourcePath,candidatePath,manifestPath]=process.argv.slice(2);
if(!vendorPath||!sourcePath||!candidatePath||!manifestPath)
  throw new Error('Usage: node tools/research/palm23-verse2-exsurge-proof.mjs VENDOR SOURCE CANDIDATE MANIFEST');
const raw=readFileSync(sourcePath,'utf8');
const candidate=readFileSync(candidatePath,'utf8');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
assert.equal(manifest.schema,'ao-palm23-v2-provisional-gabc-source-transfer-review-v1');
assert.equal(manifest.target.psalm,23);
assert.equal(manifest.target.liturgicalLine,2);
assert.equal(createHash('sha256').update(raw,'utf8').digest('hex'),
  '06537463e71d320e5134ac84a7cb0bc70579169cd3c509883caf9eb98cdc9be2',
  'Original Psalm23 GABC source SHA drifted');
assert.ok(raw.includes('2. Nam(h) ip(h)se...(h)'),'Printed second-verse opening cue');
assert.ok(candidate.includes('Nam(h) ip(h)se(h)'), 'Candidate uses same h reciting pitch');
assert.ok(!candidate.includes('DO(f)mi(gh)'), 'Cannot apply first-verse intonation to verse 2');
assert.equal(candidate.split('%%').length,2);
assert.equal(candidate.split('*(:)').length,2);
assert.ok(candidate.includes('fir(h)má(g)vit(f)'), 'Track hypothesized cadence for human review');

const body=candidate.slice(candidate.indexOf('(c4)'));
const segments=body.split('*(:)');
const notes=s=>[...s.matchAll(/([\p{L}]+[.,;!?]?)\(([^)]+)\)/gu)]
  .map(m=>({syllable:m[1],pitchGroup:m[2]}));
assert.deepEqual(segments.map(s=>notes(s).length),[13,11]);
const noteRows=[manifest.cadenceMappings.medial,manifest.cadenceMappings.termination];
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z ]/g,' ').replace(/\s+/g,' ').trim();
for(let i=0;i<2;i++){
  const v=notes(segments[i]);
  for(let n=0;n<v.length;n++){
    assert.equal(normalize(v[n].syllable),normalize(noteRows[i][n][0]));
    assert.equal(v[n].pitchGroup,noteRows[i][n][1]);
  }
}
assert.equal(manifest.release.musicEditorReviewed,false);
assert.equal(manifest.release.exsurgeParsed,true,'Native parser proof must be recorded');
assert.equal(manifest.release.exsurgeRendered,true,'Prior pinned Exsurge SVG evidence must be linked');
assert.equal(manifest.nativeRenderProof.runId,40454771798);
assert.equal(manifest.nativeRenderProof.candidateSha256,createHash('sha256').update(candidate,'utf8').digest('hex'));
assert.equal(manifest.nativeRenderProof.sourceSha256,createHash('sha256').update(raw,'utf8').digest('hex'));
assert.equal(manifest.release.nativePhoneDeviceAccepted,false);
assert.equal(manifest.release.scorePublicationAllowed,false);

const bundle=readFileSync(vendorPath,'utf8');
assert.ok(bundle.length>200000,'Must use existing pinned local Exsurge bundle');
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{timeout:6000,filename:'exsurge.min.js'});
const api=sandbox.exsurge;
assert.ok(api?.Gabc?.createMappingsFromSource&&api.ChantContext&&api.ChantScore);
const candidateForParsing=candidate;
const originalForParsing=raw.replace('\n%%\n%%\r\n','\n%%\n');
assert.equal((originalForParsing.match(/%%/g)||[]).length,1);

async function inspect(gabc,label){
  const context=new api.ChantContext();
  const mappings=api.Gabc.createMappingsFromSource(context,gabc);
  assert.ok(mappings.length>5,label+' has no note-bearing mappings');
  const score=new api.ChantScore(context,mappings,true);
  score.performLayout(context);
  const viewports=[];
  for(const width of [260,420,800]){
    await new Promise((resolve,reject)=>{
      try{score.layoutChantLines(context,width,resolve)}catch(e){reject(e)}
    });
    const svg=score.createSvgTree(context);
    assert.equal(svg.name,'svg');
    assert.ok(svg.children.length>0,'SVG must contain notation');
    assert.ok(score.lines.length>0,'At least one staff required');
    viewports.push({width,systems:score.lines.length,svgChildren:svg.children.length});
  }
  assert.ok(viewports[0].systems>=viewports[2].systems,'Mobile layout should not have fewer systems');
  return {label,parsedMappings:mappings.length,viewports};
}
const originalResult=await inspect(originalForParsing,'original_Psalm23_first_verse_and_cue');
const candidateResult=await inspect(candidateForParsing,'provisional_Psalm23_verse2_reconstructed_not_approved');
const report={
  schema:'ao-palm23-v2-real-exsurge-proof-v1',
  status:'NATIVE_EXSURGE_SVG_RENDER_PROOF_ONLY_NOT_MUSICAL_APPROVAL',
  printedEdition:'Graduale Romanum 1961 p143**',
  engine:'existing Schola pinned Exsurge bundle',
  sourceOriginalSHA256:createHash('sha256').update(raw,'utf8').digest('hex'),
  candidateSHA256:createHash('sha256').update(candidate,'utf8').digest('hex'),
  musicalUnderlayCertified:false,
  editorialAccentCorrectnessCertified:false,
  sourceOwnerApproved:false,
  scholaOwnerApproved:false,
  productionScoreAssignments:0,
  originalResult,candidateResult
};
console.log('AO_PALM23_V2_RENDER_RESULT:'+JSON.stringify(report));
