// M44: Actual vendored Exsurge renderer vs independently counted 1961 original print.
// This checks renderer output / SVG, not a self-rendered GABC masquerading as print.
// Running without --evidence is a CI regression; optional output is an ephemeral
// research artifact. No publication, MIDI, audio or score approval.
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {extractKyrieXviNoteSignAttachments} from "../src/mass/reader-kyriale-research-sign-attachments.js";
import {sourceBoundOrdinaryReferenceScores} from "../src/mass/reader-inline-ordinary-reference.js";

const printed=JSON.parse(readFileSync(new URL(
 "../data/research/mass-music-m43-kyrie-xvi-original-printed-noteheads.v1.json",
 import.meta.url),"utf8"));
const originalGabc=offlineKyrialeResearchScore("KYRIE","MASS_16");
assert.equal(originalGabc?.scoreId,"GREGOBASE-545");
assert.equal(originalGabc.scoreApproved,false);
const originalPrintCounts=printed.originalPrintedGroupCountsReadFromFacsimile
 .map(x=>x.printedNoteheadCountManuallyCounted);
assert.equal(originalPrintCounts.length,27);
assert.equal(originalPrintCounts.reduce((a,b)=>a+b,0),40);
const vendor=readFileSync(new URL("../assets/vendor/exsurge/exsurge.min.js",import.meta.url),"utf8");
assert.ok(vendor.length>250000);
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(vendor,sandbox,{timeout:10000,filename:"exsurge.min.js"});
const api=sandbox.exsurge;
assert.equal(typeof api?.Gabc?.createMappingsFromSource,"function");
assert.equal(typeof api?.ChantScore?.prototype?.createSvg,"function");
assert.equal(typeof api?.Note,"function");
const context=new api.ChantContext();
const mappings=api.Gabc.createMappingsFromSource(context,originalGabc.gabc);
assert.ok(mappings.length>=4,"Actual Exsurge mappings can combine multiple printed note groups");
const score=new api.ChantScore(context,mappings,true);
score.performLayout(context);
const notes=score.notes.filter(n=>n instanceof api.Note);
const semanticNoteRecords=notes.map((n,i)=>({
 sourceNoteOrdinal:i+1,
 staffPosition:n.staffPosition,
 noteShape:String(n.shape),
 neumeType:n.neume?.constructor?.name??"UNKNOWN",
 isVirga:Boolean(n.shape===api.NoteShape.Virga),
 isInclined:Boolean(n.shape===api.NoteShape.Inclinatum),
 hasMora:Boolean(n.morae?.length),
 moraCount:n.morae?.length??0,
 episemaCount:n.episemata?.length??0,
 glyphCode:n.glyphVisualizer?.glyphCode??null
}));
const sourceSigns=extractKyrieXviNoteSignAttachments(originalGabc.gabc);
const rendererSemantics={
  actualExsurgeNoteCount:notes.length,
  actualExsurgeMoraCount:notes.reduce((n,x)=>n+(x.morae?.length??0),0),
  actualExsurgeEpisemaCount:notes.reduce((n,x)=>n+(x.episemata?.length??0),0),
  actualExsurgeVirgaCount:notes.filter(n=>n.shape===api.NoteShape.Virga).length,
  actualExsurgeInclinedNoteCount:notes.filter(n=>n.shape===api.NoteShape.Inclinatum).length,
  sourceGabcSignCount:sourceSigns.signOccurrences.length,
  expectedPrintedCount:printed.sourceVersusOriginalPrintCountCheck.printedNoteheadsIndependentlyCounted,
  printedFinalSix:printed.sourceVersusOriginalPrintCountCheck.closingSonPrintedNoteheads,
  independentlyVerifiedFromOriginalPrint:true,
  renderedToPhysicalPageVisuallyCertified:false
};
assert.equal(rendererSemantics.actualExsurgeNoteCount,rendererSemantics.expectedPrintedCount,
 "Exsurge rendered note count must match 40 independently identified printed notes");
assert.equal(rendererSemantics.sourceGabcSignCount,11);
assert.equal(notes.length,40);
assert.equal(rendererSemantics.actualExsurgeMoraCount,4,"Original print has four mora dots");
assert.equal(rendererSemantics.actualExsurgeEpisemaCount,3,"Original print has three horizontal episemata");
assert.equal(rendererSemantics.actualExsurgeVirgaCount,1,"Original print has one Virga-shaped terminal note");
assert.equal(rendererSemantics.actualExsurgeInclinedNoteCount,3,"Original print has three terminal diamonds");
assert.deepEqual(Array.from(semanticNoteRecords.slice(-6),x=>x.isVirga),
 [false,false,true,false,false,false]);
assert.deepEqual(Array.from(semanticNoteRecords.slice(-6),x=>x.isInclined),
 [false,false,false,true,true,true]);
assert.equal(semanticNoteRecords.at(-1).moraCount,1,"Terminal dot must attach to final diamond");
const layoutReports=[];
const widths=[304,374,720];
const outputs=[];
for(const width of widths){
 await new Promise((ok,fail)=>{
   try{score.layoutChantLines(context,width,ok)}catch(error){fail(error)}
 });
 const svg=score.createSvg(context);
 const tree=score.createSvgTree(context);
 assert.ok(svg.startsWith("<svg"),"Exsurge emitted no SVG root at "+width);
 assert.ok(svg.includes("staffLine"),"Exsurge emitted no staff grid at "+width);
 assert.equal(tree.name,"svg");
 assert.ok(tree.children.length>0);
 assert.ok(score.lines.length>=1);
 layoutReports.push({viewportPx:width,svgBytes:svg.length,
  svgLineCount:score.lines.length,renderWidth:score.bounds.width,
  renderHeight:score.bounds.height,hasStaffLines:true});
 outputs.push({width,svg});
}
const selected={
 paragraph:{kind:"TEXT",id:"AO.SM.C0044",sourceCueIds:["AO.SM.C0044"],
  sourceBlockId:"AO.SM.B015",primary:"canonical Latin Kyrie"},
 form:"SOLEMN",resolvedMass:{},selectedSettings:{KYRIE:"MASS_16"}
};
const access=sourceBoundOrdinaryReferenceScores(selected);
assert.equal(access.length,1);
assert.equal(access[0].gabc,originalGabc.gabc);
assert.equal(access[0].publicScoreApproved,false);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...selected,selectedSettings:{}}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...selected,form:"LOW"}),[]);
assert.deepEqual(sourceBoundOrdinaryReferenceScores({...selected,
 resolvedMass:{provenance:{isRequiem:true}}}),[]);
const report={
 schema:"ao-schola-m44-original-1961-to-exsurge-renderer-semantic-audit-v1",
 scoreId:"GREGOBASE-545",
 setting:"MASS_16",
 originalPrintedSourceUrl:printed.original1961PrintedWitness.originalPdf,
 originalPhysicalPrintSha256:printed.original1961PrintedWitness.originalPdfSha256,
 originalPrintedPage:56,
 originalPrintEvidenceArtifact:printed.original1961PrintedWitness.cropManifestArtifact,
 printedHeadCountsByGroup:originalPrintCounts,
 sourceGabcUnchanged:true,
 readerRuntimeUnchanged:true,
 audio:false,certifiedScore:false,
 userSelectedExampleOnly:true,
 rendererOwner:"assets/vendor/exsurge/exsurge.min.js",
 sourceSemanticNotes:semanticNoteRecords,
 rendererSemantics,layoutReports,
 caveat:"SVG generated by Exsurge is not an independent printed witness. Semantic counts compare with separately observed original 1961 physical print. Visual neume parity requires side-by-side original-and-SVG review and qualified editorial approval."
};
const outputAt=process.argv.indexOf("--evidence");
if(outputAt>=0){
 const dir=resolve(process.argv[outputAt+1]??".tmp/schola-m44-render");
 mkdirSync(dir,{recursive:true});
 for(const item of outputs)writeFileSync(resolve(dir,`kyrie-xvi-exsurge-${item.width}px.svg`),item.svg,"utf8");
 writeFileSync(resolve(dir,"manifest.json"),JSON.stringify(report,null,2)+"\n","utf8");
}
console.log("M44_EXSURGE_SEMANTICS",JSON.stringify(rendererSemantics));
console.log("M44_EXSURGE_ENDING",JSON.stringify(semanticNoteRecords.slice(-8)));
console.log("M44_EXSURGE_LAYOUTS",JSON.stringify(layoutReports));
console.log("PASS M44: actual offline Exsurge SVG at 304/374/720px compared with independent original 1961 print counts and selection boundaries");
