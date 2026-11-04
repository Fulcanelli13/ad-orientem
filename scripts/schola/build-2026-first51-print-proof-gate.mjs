// Current first-60 source audit: 47 text-corroborated Proper scores; original-book print work.
// Built on existing first-60 review, never a new unsourced score registry.
import {readFile,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildFirst60PrintedMusicEvidence}
 from "../../src/mass/reader-proper-first60-print-proof-gate.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=join(root,".tmp/schola-1962-selected-annual");
const get=async f=>JSON.parse(await readFile(join(dir,f),"utf8"));
const [packet,latinAudit]=await Promise.all([
 get("2026-selected-proper-first60-print-review.json"),
 get("2026-first60-complete-antiphon-text-audit.json")
]);
const result=buildFirst60PrintedMusicEvidence({packet,latinAudit});
await writeFile(join(dir,"2026-first60-1961-printed-music-proof-gate.json"),
 JSON.stringify(result,null,2)+"\n");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const map=new Map(result.allScores.map(x=>[x.scoreId,x]));
const cards=result.firstTwelveForPrintComparison.map((id,i)=>{
 const x=map.get(id),score=packet.candidates.find(c=>c.scoreId===id);
 return [
 '<section class="score"><div class="eyebrow">'+esc({in:"Introit",of:"Offertory",co:"Communion"}[x.part])+
 ' · '+esc(x.selected1962Date)+' · '+x.selected2026Occurrences+' 2026 selections</div>',
 '<h2>'+(i+1)+'. '+esc(id)+'</h2>',
 '<p>Original <strong>Graduale Romanum (Solesmes 1961), p. '+
 esc(x.printedPage)+'</strong> — '+x.noteGroups.length+' note-bearing source groups.</p>',
 '<p><a href="'+esc(x.originalScorePageAndTranscription)+
 '" target="_blank" rel="noopener noreferrer">Open printed 1961 source witness and GABC transcript</a></p>',
 '<p class="summary">Selected Mass '+esc(x.selected1962Date)+' · '+esc(x.selected1962SourcePath)+
 ' (inherited from '+esc(x.sourceOwner)+').</p>',
 '<p class="latin">'+esc(score.representative.sourceLatin.split("\n")
 .filter(t=>!/^\\s*(?:Ps|Joann|Luc|Matt|Is|Prov|Dan|Act)\\s*[\d:]/i.test(t))
 .slice(0,2).join(" ").slice(0,480))+'</p>',
 '<details><summary>Inspect exact original-score GABC</summary><pre>'+
 esc(x.originalGabc)+'</pre></details>',
 '<p class="tasks">Compare printed staff pitches, neume shapes, full syllable underlay, episemata, morae and divisions; inspect each of '+
 x.noteGroups.length+' numbered groups in the existing score-collation workbench.</p>',
 '<p class="hold">All printed-music checks PENDING. No score approval, reader cue selection or setting inference.</p>',
 '</section>'
 ].join("\n");
}).join("\n");
const html=[
 '<!doctype html><html lang="en"><head><meta charset="utf-8">',
 '<meta name="viewport" content="width=device-width, initial-scale=1">',
 '<title>Ad Orientem · Original 1961 printed-note review · Batch 01</title>',
 '<style>:root{color-scheme:dark;background:#10151d;color:#e8e5df;font:15px/1.55 system-ui,sans-serif}',
 '*{box-sizing:border-box}main{max-width:980px;padding:24px;margin:auto}h1,h2{font-family:Georgia,serif;font-weight:400}',
 'h1{font-size:clamp(32px,5vw,46px)}h2{font-size:24px;margin:5px 0 8px}',
 'header{border-bottom:1px solid #4f5b6b;padding:20px 0 28px}',
 'a{color:#acc4eb}.eyebrow{letter-spacing:.1em;text-transform:uppercase;color:#e2b3a6;font-size:11px}',
 'p{max-width:850px}.score{padding:24px 0;border-bottom:1px solid #424c58}',
 '.summary{color:#bdc4cf;font-size:13px}.latin{font:18px/1.6 Georgia,serif}',
 '.tasks{color:#becbdc}.hold{color:#eba99d;font-size:13px}',
 'pre{font-size:11px;background:#0b0d11;white-space:pre-wrap;overflow-wrap:anywhere;padding:15px}',
 'details{margin:12px 0}summary{cursor:pointer;color:#b7cce4}',
 '</style></head><body><main><header>',
 '<div class="eyebrow">Ad Orientem / Gregorian musical editor / Printed 1961 Solesmes folios</div>',
 '<h1>First 12 printed-score comparison priorities</h1>',
 '<p>Ranked by actual 2026 calendar-selected uses, drawn only from the 47 current complete-antiphon text matches.',
 ' Every original GABC is SHA-256 authenticated. Compare its entire chant against the <strong>original',
 ' Solesmes printed notation</strong> before recording any music observation.</p>',
 '<p>Source matching does not establish note pitches, neumes, rhythmic marks, local chant selection',
 ' or user editorial approval. All thirteen mismatched-text scores remain excluded.</p>',
 '<p><strong>'+result.counts.noteGroups+'</strong> source groups in all 60; <strong>'+
 result.counts.textMatchedScoreNoteGroups+'</strong> within the 47 text-matched scores.',
 ' <strong>Zero</strong> have independent printed-music approval.</p>',
 '</header>',cards,
 '<footer><p>No automatic public score release. Use the canonical offline 60-score comparison',
 ' workbench to record all note-group observations and export the review evidence.</p></footer>',
 '</main></body></html>'
].join("\n");
await writeFile(join(dir,"2026-first12-original-solesmes-print-collation.html"),html);
console.log("FIRST_47_PRINTED_FACSIMILE_GATE "+JSON.stringify({
 counts:result.counts,firstTwelve:result.firstTwelveForPrintComparison
}));
