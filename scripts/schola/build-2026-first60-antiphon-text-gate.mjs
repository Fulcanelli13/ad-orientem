// Re-run directly after the immutable first-60 packet has been generated.
// No score source is modified; report concrete textual holds before print review.
import {readFile,writeFile} from "node:fs/promises";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {auditFirst60CompleteAntiphonText}
 from "../../src/mass/reader-proper-first60-antiphon-text.js";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dir=join(root,".tmp","schola-1962-selected-annual");
const source="2026-selected-proper-first60-print-review.json";
const original=JSON.parse(await readFile(join(dir,source),"utf8"));
const audit=auditFirst60CompleteAntiphonText({packet:original});
await writeFile(join(dir,"2026-first60-complete-antiphon-text-audit.json"),
 JSON.stringify(audit,null,2)+"\n");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rows=audit.textDifferenceHolds.map((x,i)=>[
 '<article class="case"><div class="head"><h2>'+String(i+1)+'. '+
 esc(x.scoreId)+'</h2><span>'+esc(x.part.toUpperCase())+' · '+esc(x.status)+'</span></div>',
 '<p><a href="'+esc(x.sourceUrl)+'" target="_blank" rel="noopener noreferrer">'+
 'Open original score transcription and printed witnesses</a> · 1961 folio '+
 esc(x.original1961Page??"unknown")+'</p>',
 '<dl><dt>Selected 1962</dt><dd>'+esc(x.selected1962Date)+' · '+
 esc(x.selected1962SourcePath)+' → '+esc(x.original1962Owner)+'</dd></dl>',
 '<div class="compare"><div><h3>GABC antiphon (normalized text)</h3><p>'+
 esc(x.evidence.originalGabcAntiphonNormalized)+'</p></div>',
 '<div><h3>Selected 1962 antiphon (normalized text)</h3><p>'+
 esc(x.evidence.selected1962AntiphonNormalized)+'</p></div></div>',
 '<p class="reason">First difference at word '+x.evidence.firstDifferingWord+
 '. Hold the score and verify which printed variant, source text or reader form is authentic.</p>',
 '</article>'
]).join("\n");
const summary=Object.entries(audit.counts.byFamily).map(([key,v])=>
 '<span>'+esc({in:"Introit",of:"Offertory",co:"Communion"}[key])+
 ': <strong>'+v.exact+'/20</strong> exact antiphon texts</span>').join("\n");
const html=[
 '<!doctype html><html lang="en"><head><meta charset="utf-8">',
 '<meta name="viewport" content="width=device-width,initial-scale=1">',
 '<title>Ad Orientem · First 60 Gregorian antiphon text audit</title>',
 '<style>:root{color-scheme:dark;background:#10151c;color:#e8e2d9;font:15px/1.5 system-ui,sans-serif}',
 '*{box-sizing:border-box}main{margin:auto;max-width:1040px;padding:28px 16px}',
 'h1,h2,h3{font-family:Georgia,serif;font-weight:400}h1{font-size:clamp(29px,4vw,44px)}',
 '.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.13em;color:#b7bdcf}',
 '.subtitle{max-width:850px;color:#bfc3cb}',
 '.summary{display:flex;flex-wrap:wrap;gap:14px;margin:18px 0 28px}',
 '.summary span{padding:12px;border:1px solid #596474;border-radius:8px}',
 '.case{padding:22px 0;border-top:1px solid #515562}',
 '.head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between}',
 '.head h2{margin:0}.head span{font-size:12px;color:#e4afa2}',
 'h3{font-size:18px;margin:0}.compare{display:grid;grid-template-columns:1fr 1fr;gap:15px}',
 '.compare>div{background:#202735;padding:15px;border-radius:8px;min-width:0}',
 '.compare p{font:17px/1.58 Georgia,serif;overflow-wrap:break-word}',
 'a{color:#b5d0f7}.reason{color:#e0aa9e;font-size:13px}',
 'dt{color:#a5b2c1;font-size:12px}dd{margin:0}',
 '@media(max-width:700px){.compare{grid-template-columns:1fr}}',
 '</style></head><body><main>',
 '<header><div class="eyebrow">Ad Orientem · authenticated GABC text QA</div>',
 '<h1>First 60 Gregorian Propers · complete antiphon text audit</h1>',
 '<p class="subtitle"><strong>'+audit.counts.fullAntiphonLexicalEqual+
 '</strong> normalized antiphon texts correspond exactly to the selected 1962 Latin.',
 ' <strong>'+audit.counts.literalDifferenceHolds+
 '</strong> score texts have differences requiring source adjudication.',
 ' These checks concern lexical correspondence only, not complete syllable-to-note underlay,',
 ' printed pitches, neumes or liturgical setting selection.</p>',
 '<div class="summary">'+summary+'</div></header>',
 '<h2>Source-text discrepancies — must remain unpublished</h2>',
 rows,
 '<footer class="subtitle">Original score GABC is never rewritten or automatically promoted.',
 ' The canonical first-60 music collation workbench remains the separate printed-neume review tool.</footer>',
 '</main></body></html>'
].join("\n");
await writeFile(join(dir,"2026-first60-complete-antiphon-text-exceptions.html"),html);
console.log("GREGORIAN_FIRST60_COMPLETE_ANTIPHON_TEXT_QA "+
 JSON.stringify({...audit.counts,
 heldScoreIds:audit.textDifferenceHolds.map(x=>x.scoreId)}));
if(audit.counts.audited!==60||audit.counts.fullAntiphonLexicalEqual+
  audit.counts.literalDifferenceHolds!==60||
  audit.publication.publicReaderScores!==0)
 throw Error("ORIGINAL_FIRST60_TEXT_AUDIT_CENSUS_OR_PUBLICATION_DRIFT");
