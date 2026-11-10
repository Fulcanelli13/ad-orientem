// Offline editorial gallery for nine research-only Kyrie VIII source cues.
// Produced only as a GitHub Actions artifact, never inside GitHub Pages.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {reviewKyrieVIIICantorTurns} from "../../src/mass/reader-kyrie-viii-cantor-turns-review.js";
import {buildKyrieVIIIReviewManifest} from "./prepare-kyrie-viii-review-manifest.mjs";
import {buildKyrieVIIIThreeWitnessNeumeLedger} from "./kyrie-viii-three-witness-neume-ledger.mjs";
import {buildKyrieVIIIOpeningPitchInventory} from "./kyrie-viii-opening-pitch-inventory.mjs";
const dir=process.argv[2]?resolve(process.argv[2]):"";
if(!dir)throw new Error("Pass proof-image directory");
const report=JSON.parse(readFileSync(join(dir,"proof.json"),"utf8"));
const manifest=buildKyrieVIIIReviewManifest();
const sungCorpus=JSON.parse(readFileSync(new URL("../../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const turns=reviewKyrieVIIICantorTurns({corpus:sungCorpus});
const ledger=buildKyrieVIIIThreeWitnessNeumeLedger({corpus:sungCorpus});
assert.equal(ledger.reviewUnits,45);
assert.equal(ledger.printedComparisonTasks,135);
assert.equal(ledger.comparisonTasksCertified,0);
const opening=buildKyrieVIIIOpeningPitchInventory({corpus:sungCorpus});
assert.equal(opening.pitchNoteheads,25);
assert.equal(opening.encodedAccidentalGlyphs,2);
assert.equal(opening.printVerifiedNoteheads,0);
assert.equal(report.status,"RESEARCH_NOT_APPROVED");
assert.equal(report.publicScores,0);
assert.equal(report.sourceId,"GREGOBASE-1184");
assert.equal(report.sourceGabcSha256,manifest.verifiedResearchGabcSha256);
assert.equal(manifest.candidates.length,9);
assert.equal(manifest.approvedScores,0);
assert.equal(turns.status,"RUBRICALLY_MAPPED_MUSICAL_PROOF_NOT_APPROVED");
assert.equal(turns.finalCueId,"AO.SM.C0052");
assert.equal(turns.subphrases.length,3);
assert.equal(report.captures.length,18);
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
 .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const auditHtml=ledger.phrases.map(p=>{
 const rows=p.units.map(unit=>'<tr><td>'+unit.id+'</td><td><code>'+
  esc(unit.rawGabc)+'</code></td><td>'+esc(unit.kind.replace(/_/g," ").toLowerCase())+
  '</td><td>Pending 3/3 print comparisons</td></tr>').join("");
 return '<details><summary>Melody '+p.phrase+' / 4 — '+esc(p.role.replace(/_/g," "))+
  ' · '+p.musicalSourceUnits+' source marks</summary><p>Applies to source cues '+
  esc(p.originalCueIds.join(", "))+'; 1961 printed '+esc(p.folios.join(" / "))+
  '</p><div class="tableWrap"><table><thead><tr><th>Source mark</th><th>GABC token</th>'+
  '<th>Kind</th><th>Printed comparison status</th></tr></thead><tbody>'+
  rows+'</tbody></table></div></details>';
}).join("");
const witnessHtml=ledger.witnesses.map(w=>
 '<li><strong>'+esc(w.edition)+'</strong> — '+esc(w.pages.join("–"))+
 ': '+w.images.map((url,i)=>'<a href="'+esc(url)+'" rel="noopener noreferrer" target="_blank">'+
  'scan '+(i+1)+'</a>').join(" · ")+'</li>').join("");
const openingInventoryHtml='<section aria-label="Opening Kyrie notehead inventory">'+
 '<h2>Opening Kyrie: 25 source notes and 2 flat signs</h2>'+
 '<p>These are <strong>GABC-encoded noteheads</strong>, not pitch positions verified from an original print. '+
 'The two <code>gx</code> signs represent flats at staff position g and MUST NOT be counted as sung g notes. '+
 'The third and fifth groups contain the two alteration glyphs. All historical note-by-note comparisons remain pending.</p>'+
 '<div class="tableWrap"><table><thead><tr><th>Source mark</th><th>Text / role</th>'+
 '<th>Original GABC</th><th>Encoded pitches</th><th>Alterations</th><th>Print proof</th></tr>'+
 '</thead><tbody>'+opening.groups.map(g=>'<tr><td>'+esc(g.unitId)+'</td><td>'+
 esc(g.lyricFragment)+'</td><td><code>'+esc(g.sourceGabc)+'</code></td><td>'+
 esc(g.notes.map(n=>n.gabcPitch).join(' '))+' ('+g.noteheads+')</td><td>'+
 esc(g.accidentals.map(a=>a.symbol+' '+a.type).join(', ')||'none')+
 '</td><td>NOT CERTIFIED</td></tr>').join('')+
 '</tbody></table></div><p>Original printed source: <a href="'+
 esc(opening.groups[0].originalPrintUrl)+'">Graduale Romanum 1961 p. 28*</a> · '+
 '<a href="'+esc(opening.groups[0].secondWitnessUrl)+'">Liber Usualis 1961 p. 37</a>. '+
 'No notehead, flat, neume or rhythmic sign is yet classified as independently print-verified.</p></section>';
const cards=manifest.candidates.map((score,i)=>{
 const views=report.captures.filter(c=>c.cueId===score.sourceCueId)
  .sort((a,b)=>a.width-b.width);
 assert.deepEqual(views.map(v=>v.width),[320,390],"Widths missing for "+score.sourceCueId);
 for(const v of views){
  assert.equal(v.gabcSha256,score.gabcSha256);
  assert.equal(v.latin,score.sourceLatin);
  assert.equal(v.sourceLine,score.sourceLine);
  assert.equal(v.mapped,true);
  assert.deepEqual(v.folios,score.facsimileFolios);
  assert.match(v.filename,/^C\d{4}-(320|390)\.png$/);
  assert.ok(readFileSync(join(dir,v.filename)).subarray(0,8).equals(
   Buffer.from([137,80,78,71,13,10,26,10])),"Invalid PNG "+v.filename);
 }
 const role=i<3?"Opening Kyrie":i<6?"Christe":i<8?"Returning Kyrie":"Final distinct Kyrie";
 const images=views.map(v=>'<figure><figcaption>'+v.width+'px · '+v.syllables+
  ' syllables · exact SVG mapping</figcaption><img src="'+esc(v.filename)+
  '" width="'+(v.width-24)+'" alt="Source notation '+esc(v.cueId)+
  ' at '+v.width+'px"></figure>').join("");
 const parts=i===8?'<p><strong>Final starred turns:</strong> '+
  turns.subphrases.map(t=>esc(t.owner.replace(/_/g," ").toLowerCase())).join(" / ")+
  '. All remain inside source cue C0052, not three new invocations.</p>':"";
 return '<details id="cue-'+i+'" '+(i===0?'open':'')+'><summary><strong>'+(i+1)+
  '. '+esc(score.sourceLatin)+'</strong><span>'+esc(role)+' · '+
  esc(score.sourceCueId)+'</span></summary>'+
  '<p class="meta">1961 print '+esc(score.facsimileFolios.join(" / "))+ ' · musical line '+
  (score.sourceLine+1)+'/4 · GABC SHA-256: <code>'+esc(score.gabcSha256)+
  '</code></p>'+parts+'<div class="images">'+images+'</div></details>';
}).join("");
const css=[
 ':root{color-scheme:dark}*{box-sizing:border-box}',
 'body{margin:0;background:#101a20;color:#eef1eb;font:15px/1.55 system-ui,sans-serif}',
 'main{max-width:1020px;margin:auto;padding:28px}',
 'h1{font:600 37px Georgia,serif;margin:0 0 10px}',
 'a{color:#98d7e3}.kicker{font-size:11px;letter-spacing:.15em;text-transform:uppercase}',
 '.warn{border-left:3px solid #d6b072;background:#29241a;padding:15px 20px;margin:20px 0}',
 '.nav{display:flex;flex-wrap:wrap;gap:8px;margin:20px 0}',
 '.nav a{background:#263e42;border-radius:6px;padding:7px 12px;text-decoration:none;color:#e5eff0}',
 'details{border-bottom:1px solid #405258;padding:12px 0 25px}',
 'summary{cursor:pointer;font-size:20px;padding:12px 0}',
 'summary span{font-size:12px;color:#b3c9cc;margin-left:12px}',
 '.meta{overflow-wrap:anywhere;color:#b8d2d4;font-size:12px}',
 '.images{display:flex;gap:18px;flex-wrap:wrap}',
 'figure{margin:0;padding:10px;background:#f6f2e9;color:#18232a;border-radius:7px}',
 'table{border-collapse:collapse;width:100%;min-width:680px;font-size:12px}th,td{text-align:left;padding:6px;border-bottom:1px solid #405258}.tableWrap{overflow:auto}td code{overflow-wrap:anywhere}',
 'figcaption{font-size:12px;margin-bottom:6px}',
 'figure img{display:block;max-width:100%;height:auto}',
 'footer{margin:30px 0 10px}code{font-size:11px}',
 '@media print{body{background:white;color:black}details{break-inside:avoid}figure{border:1px solid #aaa}}'
].join("");
const html='<!doctype html><html lang="en"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta name="robots" content="noindex,nofollow"><title>Kyrie VIII — research score gallery</title>'+
 '<style>'+css+'</style></head><body><main><header>'+
 '<p class="kicker">Ad Orientem · Schola source verification</p><h1>Kyrie VIII · De Angelis</h1>'+
 '<p>Nine original Mass cues · Four printed melodies · 18 real phone score proofs</p>'+
 '<div class="warn"><strong>UNAPPROVED RESEARCH ONLY.</strong> This offline dossier is not '+
 'part of the public Mass reader. All nine notation excerpts remain blocked; '+
 'no choir performance or exact timing is observed.</div>'+
 '<p>1961 printed source: <a href="https://gregobase.selapa.net/sources/2/905.png">'+
 'folio 28*</a> and <a href="https://gregobase.selapa.net/sources/2/906.png">'+
 'folio 29*</a>. The original prints are linked, not embedded.</p>'+ 
 '<p><strong>Three historical printed witnesses</strong> (separate printed editions, not three independent GABC transcriptions):</p><ul>'+witnessHtml+'</ul></header>'+
 '<nav class="nav" aria-label="Source cues">'+manifest.candidates.map((s,i)=>
 '<a href="#cue-'+i+'">'+(i+1)+'</a>').join("")+'</nav>'+
 '<section aria-label="Musical source mark review"><h2>45 GABC source marks · 135 printed-witness checks pending</h2>'+ 
 '<p>The first Kyrie intonation asterisk is distinct from the two performer handoff marks in the final Kyrie. No pitch, neume, mora or episema is certified by the existence of these source tokens.</p>'+auditHtml+'</section>'+ 
 openingInventoryHtml+
 '<section>'+cards+'</section><footer><strong>Verified:</strong> 18/18 offline Exsurge renderings; '+
 '18/18 exact lyric mappings (320px and 390px). <strong>Not yet certified:</strong> '+
 'neume-by-neume pitches, episemata, rhythmic signs, and editorial publication permission. '+
 'The three starred performer turns in the final Kyrie remain under the single ninth Mass cue.'+
 '</footer></main></body></html>';
writeFileSync(join(dir,"index.html"),html,"utf8");
writeFileSync(join(dir,"README.txt"),
 "RESEARCH ONLY — not musical approval. Open index.html locally. 18 PNG evidence images. Printed source is linked externally, not included.\n");
console.log("SCHOLA_KYRIE_VIII_VISUAL_GALLERY_PASS 9 invocations 18 PNG standalone HTML, approved 0");
