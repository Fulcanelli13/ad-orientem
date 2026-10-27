// Research-only: source-anchored Palm cadence WINDOWS, not complete verses.
// Use the exact pinned offline Exsurge bundle already owned by Schola PR #1749.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const [vendorPath,registryPath,ps23Path,ps46Path]=process.argv.slice(2);
if(!vendorPath||!registryPath||!ps23Path||!ps46Path)
 throw new Error('Usage: node palm-bulk-cadence-exsurge-proof.mjs VENDOR REGISTRY SOURCE23 SOURCE46');
const bundle=fs.readFileSync(vendorPath,'utf8');
const v=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const raw23=fs.readFileSync(ps23Path,'utf8'),raw46=fs.readFileSync(ps46Path,'utf8');
const sha=s=>createHash('sha256').update(s).digest('hex');
assert.ok(bundle.length>200000,'Existing pinned local Exsurge required');
assert.equal(sha(raw23),v.evidence.ps23.originalSha256);
assert.equal(sha(raw46),v.evidence.ps46.originalSha256);
assert.ok(raw23.includes(v.evidence.ps23.cadenceSource));
assert.ok(raw46.includes(v.evidence.ps46.cadenceSource));
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(bundle,sandbox,{filename:'exsurge.min.js',timeout:6000});
const api=sandbox.exsurge;
assert.ok(api?.Gabc?.createMappingsFromSource&&api.ChantScore&&api.ChantContext);
const cadenceCases=v.cases.filter(x=>x.gabcEndingExcerpt);
assert.equal(cadenceCases.length,15);
const results=[];
for(const row of cadenceCases){
 assert.equal(row.completeVerseNotCreated,true);
 assert.equal(row.neumeUnderlayHumanApproved,false);
 assert.equal(row.releaseEligible,false);
 const ctx=new api.ChantContext();
 const mappings=api.Gabc.createMappingsFromSource(ctx,row.gabcEndingExcerpt);
 assert.ok(mappings.length>=3,row.id+' malformed GABC');
 const score=new api.ChantScore(ctx,mappings,true);
 score.performLayout(ctx);
 const widths=[];
 for(const width of [260,420,800]){
  await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
  const svg=score.createSvgTree(ctx);
  assert.equal(svg.name,'svg',row.id);
  assert.ok(svg.children.length>0,row.id+' empty score');
  assert.ok(score.lines.length>0,row.id+' missing staff');
  widths.push({width,systems:score.lines.length,svgChildren:svg.children.length});
 }
 assert.ok(widths[0].systems>=widths.at(-1).systems,row.id+' unexpected width reflow');
 results.push({id:row.id,psalm:row.psalm,endClass:row.textWindowSyllables.length===4?'paroxy':'proparoxy',
  mappings:mappings.length,widths});
}
assert.equal(results.length,15);
assert.equal(v.cases.filter(x=>!x.gabcEndingExcerpt).length,2);
console.log('AO_PALM_15_CADENCE_RENDER_RESULT:'+JSON.stringify({
 schema:'ao-palm-bulk-source-cadence-real-exsurge-v1',
 conclusion:'15_PARTIAL_CADENCE_SNIPPETS_SVG_RENDERED_NOT_FULL_PSALM_SCORES_OR_MUSICALLY_APPROVED',
 batch:v.batch,originalRawSourcesUnchanged:true,checksums:{ps23:sha(raw23),ps46:sha(raw46)},
 sourceApproval:false,fullVerseGabcScoresCreated:0,
 printedPsalm46OpeningTextStillQuarantined:true,editoriallyAccepted:0,runtimeScoreAssignments:0,
 snippetCount:results.length,viewportsTested:[260,420,800],individualResults:results
}));
