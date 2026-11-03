// Reproduce the annual musical review packet. No score becomes public here.
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {index1961GradualeGabc} from "../../src/mass/reader-proper-gabc-bulk-join.js";
import {buildSelected2026ScoreVerificationWorklist}
 from "../../src/mass/reader-schola-2026-release-worklist.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=join(root,".tmp","schola-1962-selected-annual");
const load=async p=>JSON.parse(await readFile(p,"utf8"));
const archive=index1961GradualeGabc(await Promise.all(
 Array.from({length:6},(_,i)=>load(join(root,
  "data/mass/chant-corpus/gr1961-proper-"+
  String(i+1).padStart(3,"0")+".json")))));
const [annualReport,fullSourceCrosswalk,preGospelReview]=await Promise.all([
 "2026-selected-gabc-coverage.json",
 "2026-selected-full1049-inline-crosswalk.json",
 "2026-selected-pregospel-source-queue.json"
].map(file=>load(join(dir,file))));
const packet=buildSelected2026ScoreVerificationWorklist({
 fullSourceCrosswalk,preGospelReview,annualReport,archive,perFamily:12
});
await mkdir(dir,{recursive:true});
await writeFile(join(dir,"2026-score-verification-all-leads.json"),
 JSON.stringify({schema:packet.schema,status:packet.status,provenance:packet.provenance,
  counters:packet.counters,allReviewLeads:packet.allReviewLeads,
  exceptions:packet.exceptions,publication:packet.publication},null,2)+"\n");
await writeFile(join(dir,"2026-score-verification-pre-gospel-batch02-24.json"),
 JSON.stringify({schema:packet.schema,status:packet.status,provenance:packet.provenance,
  counters:packet.counters,batch:packet.preGospelBatch,
  publication:packet.publication},null,2)+"\n");
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pretty={in:"Introit",gr:"Gradual",al:"Alleluia",
 tr:"Tract",of:"Offertory",co:"Communion"};
const rows=packet.preGospelBatch.map((x,i)=>[
 '<article class="item" id="candidate-'+(i+1)+'">',
 '<div class="eyebrow">'+escapeHtml(pretty[x.part])+' · Research only</div>',
 '<h2>'+(i+1)+'. '+escapeHtml(x.scoreId)+'</h2>',
 '<p class="score-info">'+x.sourceOccurrenceCount+' calendar occurrences · '+
 x.distinctSelectedSources+' distinct formularies · Graduale Romanum 1961 p. '+
 escapeHtml(x.printed1961Folio??"unrecorded")+'</p>',
 '<p class="incipit">'+escapeHtml(x.occurrences[0]?.latinOpening)+'</p>',
 '<p><a target="_blank" rel="noopener noreferrer" href="'+escapeHtml(x.sourceUrl)+
 '">Original score transcription and edition references</a></p>',
 '<button type="button" class="render" data-index="'+i+'">Render score from original GABC</button>',
 '<div class="notation" data-notation="'+i+'" hidden></div>',
 '<details><summary>Original archived GABC and exact source hash</summary>',
 '<p class="hash">'+escapeHtml(x.scoreGabcSha256)+'</p><pre>'+escapeHtml(x.originalGabc)+
 '</pre></details>',
 '<details><summary>Selected 2026 dates and source owners</summary><pre>'+
 escapeHtml(x.occurrences.map(o=>o.date+'  '+o.sourcePath+' → '+o.sourceOwner).join("\n"))+
 '</pre></details>',
 '<p class="hold">Not approved: full Latin-syllable parity, pitch/neume facsimile, '+
 'source variant, reader cue ownership and musical sign-off remain outstanding.</p>',
 '</article>'
]).join("\n");
const source=JSON.stringify(packet.preGospelBatch.map(x=>({
 scoreId:x.scoreId,gabc:x.originalGabc
}))).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");
const exsurge=await readFile(join(root,"assets/vendor/exsurge/exsurge.min.js"),"utf8");
if(exsurge.length<5000||!exsurge.includes("exsurge"))
 throw Error("OFFLINE_EXSURGE_REVIEW_ASSET_MISSING");
const reviewJavaScript=[
 "(()=>{'use strict';",
 "const items=JSON.parse(document.getElementById('ao-scores').textContent);",
 "for(const button of document.querySelectorAll('button.render')){",
 "button.addEventListener('click',async()=>{",
 "const index=Number(button.dataset.index),entry=items[index];",
 "const host=document.querySelector('[data-notation=\"'+index+'\"]');",
 "if(!entry||!host)return;",
 "if(!host.hidden){host.hidden=true;return}host.hidden=false;",
 "if(host.dataset.rendered)return;",
 "host.textContent='Rendering original GABC transcription…';",
 "try{const lib=window.exsurge,ctx=new lib.ChantContext();",
 "const mappings=lib.Gabc.createMappingsFromSource(ctx,entry.gabc);",
 "const score=new lib.ChantScore(ctx,mappings,true);",
 "await new Promise((ok,bad)=>{try{if(typeof score.performLayoutAsync==='function')",
 "score.performLayoutAsync(ctx,ok,bad);else{score.performLayout(ctx);ok()}}catch(e){bad(e)}});",
 "await new Promise((ok,bad)=>{try{score.layoutChantLines(ctx,",
 "Math.max(200,host.clientWidth-16),ok)}catch(e){bad(e)}});",
 "const svg=score.createSvgNode(ctx);if(!svg)throw Error('svg unavailable');",
 "svg.setAttribute('aria-label','Research-only notation for '+entry.scoreId);",
 "host.replaceChildren(svg);host.dataset.rendered='yes';",
 "}catch(e){host.textContent='Notation preview failed; inspect the original GABC and score link.'}",
 "});}})();"
].join("\n");
const html=[
 '<!doctype html><html lang="en"><head><meta charset="utf-8">',
 '<meta name="viewport" content="width=device-width, initial-scale=1">',
 '<title>Ad Orientem · 24 pre-Gospel Gregorian scores · Editorial verification</title>',
 '<style>',
 ':root{color-scheme:dark;background:#10151e;color:#e9e4d8;font:15px system-ui,sans-serif}',
 '*{box-sizing:border-box}main{max-width:980px;margin:auto;padding:24px}',
 'h1,h2,.incipit{font-family:Georgia,serif;font-weight:400}',
 'h1{font-size:clamp(32px,5vw,48px)}h2{margin:5px 0;font-size:24px}',
 'p{line-height:1.55}a{color:#b2c8e7}',
 '.intro{max-width:780px;color:#b9c0c9}.stats{display:flex;flex-wrap:wrap;gap:10px}',
 '.stats>span{padding:10px;border:1px solid #53606d;border-radius:8px}',
 '.item{padding:22px 0;border-bottom:1px solid #3d4651}',
 '.eyebrow{font-size:11px;text-transform:uppercase;color:#cd978d;letter-spacing:.12em}',
 '.score-info,.hold{font-size:13px;color:#aeb4bf}.hold{color:#e5ab9e}',
 '.incipit{font-size:19px}button{color:#faf5ec;background:#29425d;',
 'border:1px solid #66829e;padding:12px;cursor:pointer;border-radius:6px}',
 '.notation{padding:14px 4px;background:#1a212a;margin-top:15px;overflow:auto}',
 '.notation svg{max-width:100%;height:auto}',
 '.notation svg :is(path,polygon,polyline,line,text){fill:currentColor}',
 'details{margin:13px 0}summary{cursor:pointer;color:#bfcad5}',
 'pre{background:#090e14;padding:12px;white-space:pre-wrap;overflow-wrap:anywhere;',
 'font-size:11px;line-height:1.5}.hash{font:11px monospace;overflow-wrap:anywhere}',
 '</style></head><body><main>',
 '<header><div class="eyebrow">Ad Orientem · Schola · Editorial dossier</div>',
 '<h1>Gregorian score verification · Batch 02</h1>',
 '<p class="intro">Original 1961 GABC matched to actual 2026 calendar-selected 1962 Latin sources.',
 ' These 24 pre-Gospel scores are prioritised for printed musical facsimile and full Latin verification.',
 ' <strong>None are approved or in the public reader.</strong></p>',
 '<p class="stats"><span>'+packet.counters.uniqueScoreCandidates+' distinct candidates</span>',
 '<span>'+packet.counters.sourceScoreOccurrences+' selected-source occurrences</span>',
 '<span>'+packet.preGospelBatch.length+' to verify</span><span>0 newly published</span></p>',
 '<p class="intro">12 Gradual and 12 Alleluia.',
 ' No Tract currently passes the exact unique-source score gate.</p></header>',
 rows,
 '<footer class="intro">Preview renders original GABC, not certified musical notation.',
 ' Musical approval and exact 65-card ownership are separate release gates.</footer>',
 '<script type="application/json" id="ao-scores">'+source+'</script>',
 '<script>'+exsurge.replace(/<\/script/gi,"<\\/script")+'</script>',
 '<script>'+reviewJavaScript+'</script>',
 '</main></body></html>'
].join("\n");
await writeFile(join(dir,"2026-score-verification-pre-gospel-batch02-24.html"),html);
console.log("SELECTED_2026_MUSICAL_REVIEW_BATCH "+JSON.stringify({
 totalCandidates:packet.counters.uniqueScoreCandidates,
 totalOccurrences:packet.counters.sourceScoreOccurrences,
 byFamily:packet.counters.byFamily,
 selectedBatch:packet.counters.preGospelBatchScoreCount,
 quotas:packet.counters.preGospelBatchFamilyQuotas,
 newPublicScores:0
}));
