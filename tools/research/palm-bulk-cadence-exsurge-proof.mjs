// Research-only: source-anchored Palm cadence WINDOWS, not complete verses.
// Use the exact pinned offline Exsurge bundle already owned by Schola PR #1749.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const [vendorPath,registryPath,ps23Path,ps46Path,medialPath,lexicalAuditPath,completePath,masterPath]=process.argv.slice(2);
if(!vendorPath||!registryPath||!ps23Path||!ps46Path||!medialPath||!lexicalAuditPath||!completePath||!masterPath)
 throw new Error('Usage: node palm-bulk-cadence-exsurge-proof.mjs VENDOR REGISTRY SOURCE23 SOURCE46 MEDIAL_FLEX_REGISTRY ACCENT_AUDIT NINE_COMPLETE_RESEARCH MASTER_17_CASES');
const bundle=fs.readFileSync(vendorPath,'utf8');
const v=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const raw23=fs.readFileSync(ps23Path,'utf8'),raw46=fs.readFileSync(ps46Path,'utf8');
const medial=JSON.parse(fs.readFileSync(medialPath,'utf8'));
const audit=JSON.parse(fs.readFileSync(lexicalAuditPath,'utf8'));
const complete=JSON.parse(fs.readFileSync(completePath,'utf8'));
const master=JSON.parse(fs.readFileSync(masterPath,'utf8'));
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
assert.equal(medial.medials.length,17);
assert.equal(medial.flex.length,2);
assert.ok(raw23.includes(medial.sources.ps23MedialSource));
assert.ok(raw46.includes(medial.sources.ps46MedialSource));
assert.ok(raw23.includes(medial.sources.ps23FlexSource));
const medialViews=[];
for(const row of [...medial.medials,...medial.flex]){
 const gabc=row.provisionalGabcEndingOnly;
 assert.equal(gabc.split('%%').length,2);
 assert.equal(row.editorApproved??row.pitchEditorApproved,false);
 const ctx=new api.ChantContext();
 const mappings=api.Gabc.createMappingsFromSource(ctx,gabc);
 assert.ok(mappings.length>=2,row.id+' missing medial or flex notation');
 const score=new api.ChantScore(ctx,mappings,true);
 score.performLayout(ctx);
 const viewports=[];
 for(const width of [260,420,800]){
  await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
  const svg=score.createSvgTree(ctx);
  assert.equal(svg.name,'svg',row.id+' missing SVG');
  assert.ok(svg.children.length>0&&score.lines.length>0,row.id+' empty score');
  viewports.push({width,systems:score.lines.length,svgChildren:svg.children.length});
 }
 assert.ok(viewports[0].systems>=viewports[2].systems,row.id+' wrap regression');
 medialViews.push({id:row.id,kind:row.sourceMedialLatin?'MEDIANT':'FLEX',mappings:mappings.length,viewports});
}
assert.equal(medialViews.length,19);
assert.equal(v.cases.filter(x=>!x.gabcEndingExcerpt).length,2);
assert.equal(audit.counts.obviousLexicalMismatch,13);
assert.equal(audit.batch31CorrectiveUnderlayReview.proposals.length,11);
assert.equal(audit.batch31CorrectiveUnderlayReview.excluded.length,6);
const correctedViews=[];
for(const proposal of audit.batch31CorrectiveUnderlayReview.proposals){
 assert.equal(proposal.automaticPublicationAllowed,false);
 assert.equal(proposal.musicalEditorApproved,false);
 assert.equal(proposal.sourceToneVariantIndependentlyConfirmed,false);
 assert.equal(proposal.proposedGabcEndingOnly.split('%%').length,2);
 const ctx=new api.ChantContext();
 const mapped=api.Gabc.createMappingsFromSource(ctx,proposal.proposedGabcEndingOnly);
 assert.ok(mapped.length>=2,proposal.id+' lacks notation');
 const score=new api.ChantScore(ctx,mapped,true);
 score.performLayout(ctx);
 const views=[];
 for(const width of [260,420,800]){
  await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(error){reject(error)}});
  const svg=score.createSvgTree(ctx);
  assert.equal(svg.name,'svg',proposal.id);
  assert.ok(svg.children.length>0&&score.lines.length>0,proposal.id+' empty corrected SVG');
  views.push({width,systems:score.lines.length,svgChildren:svg.children.length});
 }
 assert.ok(views[0].systems>=views[2].systems,proposal.id+' layout regression');
 correctedViews.push({id:proposal.id,parsedMappings:mapped.length,views});
}
assert.equal(correctedViews.length,11);
assert.equal(complete.scoreCases.length,9);
assert.equal(complete.counts.productionAssignments,0);
assert.equal(complete.approvalGates.productionReaderEligible,false);
const completeViews=[];
for(const row of complete.scoreCases){
 assert.equal(row.releaseAllowed,false);
 assert.equal(row.musicalFormulaEditorApproved,false);
 assert.equal(row.noReaderIntegration,true);
 assert.equal(row.gabcResearchOnly.split('%%').length,2);
 assert.equal(row.gabcResearchOnly.split('*(:)').length,2);
 const ctx=new api.ChantContext();
 const maps=api.Gabc.createMappingsFromSource(ctx,row.gabcResearchOnly);
 assert.ok(maps.length>=10,row.id+' GABC empty or broken');
 const score=new api.ChantScore(ctx,maps,true);
 score.performLayout(ctx);
 const viewports=[];
 for(const width of [260,420,800]){
  await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
  const svg=score.createSvgTree(ctx);
  assert.equal(svg.name,'svg',row.id);
  assert.ok(svg.children.length>0&&score.lines.length>0,row.id+' empty full verse');
  viewports.push({width,systems:score.lines.length,svgChildren:svg.children.length});
 }
 assert.ok(viewports[0].systems>=viewports.at(-1).systems,row.id+' width reflow');
 completeViews.push({id:row.id,parsedMappings:maps.length,views:viewports});
}
assert.equal(completeViews.length,9);
const flexDrafts=master.batch33RemainingEightReview.twoPsalm23FlexGabcCandidates.candidates;
assert.equal(flexDrafts.length,2);
assert.equal(master.batch33RemainingEightReview.scoreCoverageAfterTwoFlexDrafts.completeExperimentalGabcCases,11);
const flexDraftViews=[];
for(const row of flexDrafts){
 assert.equal(row.productionScoreApproved,false);
 assert.equal(row.editorialAccentCertified,false);
 assert.equal(row.actualSourcePrintedFullVerseWithPitches,false);
 const gabc=row.gabcResearchOnly;
 assert.equal(gabc.split('%%').length,2);
 assert.equal(gabc.split('+(h)').length,2);
 assert.equal(gabc.split('*(:)').length,2);
 const ctx=new api.ChantContext();
 const maps=api.Gabc.createMappingsFromSource(ctx,gabc);
 assert.ok(maps.length>=10,row.id+' missing flexed note groups');
 const score=new api.ChantScore(ctx,maps,true);
 score.performLayout(ctx);
 const views=[];
 for(const width of [260,420,800]){
   await new Promise((resolve,reject)=>{try{score.layoutChantLines(ctx,width,resolve)}catch(e){reject(e)}});
   const svg=score.createSvgTree(ctx);
   assert.equal(svg.name,'svg',row.id+' flexed');
   assert.ok(svg.children.length>0&&score.lines.length>0,row.id+' missing notated staff');
   views.push({width,systems:score.lines.length,svgChildren:svg.children.length});
 }
 assert.ok(views[0].systems>=views.at(-1).systems,row.id+' poor wrap');
 flexDraftViews.push({id:row.id,notes:maps.length,views});
}
assert.equal(flexDraftViews.length,2);
console.log('AO_PALM_15_CADENCE_RENDER_RESULT:'+JSON.stringify({
 schema:'ao-palm-bulk-source-cadence-real-exsurge-v1',
 conclusion:'15_PARTIAL_CADENCE_SNIPPETS_SVG_RENDERED_NOT_FULL_PSALM_SCORES_OR_MUSICALLY_APPROVED',
 batch:v.batch,originalRawSourcesUnchanged:true,checksums:{ps23:sha(raw23),ps46:sha(raw46)},
 sourceApproval:false,fullVerseGabcScoresCreated:0,
 printedPsalm46OpeningTextStillQuarantined:true,editoriallyAccepted:0,runtimeScoreAssignments:0,
 snippetCount:results.length,medialAndFlexSnippetCount:medialViews.length,
 totalViewportChecks:3*(results.length+medialViews.length+correctedViews.length+completeViews.length+flexDraftViews.length),
 completeFlexedProvisionalVerseCount:flexDraftViews.length,
 fullProvisionalVerseCount:completeViews.length,
 repairedMedialCount:correctedViews.length,viewportsTested:[260,420,800],
 individualResults:results,medialAndFlexResults:medialViews,correctedMedialResults:correctedViews,
 completeResearchVerseResults:completeViews,completeFlexedResearchVerseResults:flexDraftViews
}));
