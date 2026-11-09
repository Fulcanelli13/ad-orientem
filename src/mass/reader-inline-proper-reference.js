// Deliberately bounded inline Gregorian *reference preview* for 7 July 2026.
// The three GABC bodies are exact copied research transcriptions from our
// existing 1,195-record 1961 GregoBase/Solesmes archive. They are CC0 text.
// No published-score approval, Gregorian recording, source alias or new reader card.
// The same renderer can support independently selected chants on other dates.
import {createOfflineChantEngraver} from "./reader-chant-engraver.js";
import {schola1961OriginalFacsimile} from "./reader-schola-original-facsimile.js";
import {ALL_SAINTS_REFERENCE_SCORES} from "./reader-inline-all-saints-reference.js";
import {EPIPHANY_REFERENCE_SCORES} from "./reader-inline-epiphany-reference.js";
import {IMMACULATE_CONCEPTION_REFERENCE_SCORES} from "./reader-inline-immaculate-reference.js";
import {createProperReferenceRegistry,PROPER_REFERENCE_LABELS} from "./reader-inline-proper-registry.js";
import {participationReferenceScoresForParagraph} from "./reader-participation-reference-scores.js";
import {prefaceCelebrantInlineScoresForParagraph} from "./reader-preface-celebrant-inline-reference.js";
import {gospelCanonPaxLeaderScoresForParagraph} from "./reader-gospel-canon-pax-leader-reference.js";
import {resolveOrationAmenSourceHandoff} from "./reader-oration-amen-source-handoff.js";
import {sourceBoundFestiveOrationAmenScores} from "./reader-oration-festive-amen-reference.js";
import {sourceBoundOldSolemnOrationAmenScores} from "./reader-oration-old-solemn-amen-reference.js";
import {resolveOrationAmenTonePolicy} from "./reader-oration-amen-tone-policy.js";
import {twoGreetingTransferCandidates,GREETING_TRANSFER_EXPLICIT_SELECTION} from "./reader-two-greeting-transfer-candidates.js";
import {
  sourceBoundOrdinaryReferenceScores,ordinaryMovementAtSourceParagraph,
  offlineOrdinarySettingChoices
} from "./reader-inline-ordinary-reference.js";

export const JULY07_REFERENCE_NOTATION_SCHEMA="ao-reader-july07-reference-notation-v1";
// The original printed Introit GABC includes a distinct conditional "T. P."
// Alleluia flourish. Do not chant that Eastertide-only insert in July.
// Keep the source archive immutable; this extracts a dated *display* reading.
export function nonPaschalJulyIntroitGabc(row){
 const raw=String(row?.gabc??"");
 if(row?.key!=="INTROIT")return raw;
 const marker="<i>T. P.</i>", psalm="<i>Ps.</i>";
 const start=raw.indexOf(marker);
 if(start<0||raw.indexOf(marker,start+1)!==-1)throw Error("JULY07_TP_BOUNDARY_NOT_UNIQUE");
 const end=raw.indexOf(psalm,start+marker.length);
 if(end<0||!raw.slice(0,start).includes("(::)")||
    !raw.slice(end).includes("Gló")||!raw.slice(end).includes("E(j)"))
  throw Error("JULY07_OPTIONAL_PASCHAL_EXTRACTION_NOT_SAFE");
 return raw.slice(0,start)+raw.slice(end);
}
export const JULY07_REFERENCE_GABC=Object.freeze([{"key":"INTROIT","id":"GREGOBASE-48","sourceId":48,"part":"in","incipit":"Sacerdotes tui","folio":"[35]","sha256":"edf2d86594bba08d30130e47f9bd04890f633a326eec9ec2f67823f85a831777","sourceUrl":"https://gregobase.selapa.net/chant.php?id=48","gabc":"(c4) SA(fff)cer(dfe)dó(ef/ghf)tes(dfe) tu(ef'g)i,(g) *(,) Dó(gjj)mi(hg)ne,(gv.ff/ded.) (;) ín(g.h!iwj)du(hg)ant(gd~) ju(fh)stí(ghfg)ti(gv.df!gvFE'f)am,(fe..) (;) et(f) san(e!fw!gh)cti(g) tu(hggef)i(fe__) ex(e!fw!gh)súl(gh~)tent :(g.) (:) pro(gj)pter(j) Da(j.h!iwjij)vid(ji__) (,) ser(ij/klk)vum(j_i~) tu(j.h!iw!jvI'HG'h)um,(hg..) (;) non(gh) a(g.h!iwj)vér(jjjhhg~)tas(g.) fá(ghgh)ci(fg_[oh:h]F'_[oh:h]ED'e)em(e[ll:1]d..) (;) Chri(de!f!gwh)sti(gv.fhGF'g) tu(egff)i.(fe..) (::) <i>T. P.</i> Al(e)le(f)lú(gh){ia},(g.) (;) al(gh)le(g.h!iwjjvIH'G)lú(ge/fgF~'E~){ia}.(e.) (::) <i>Ps.</i> Me(g)mén(hj~)to(j) Dó(k)mi(j)ne(j) Da(ih)vid :(jjj) *(:) et(ig) o(hj~)mnis(j) man(j)su(j)e(j)tú(jji)di(hg)nis(h') e(i)jus.(gh..) (::) Gló(g)ri(hj)a(j) Pa(j)tri.(j) (::) <eu>E(j) u(jji) o(hg) u(h') a(i) e.</eu>(gh..) (::)"},{"key":"GRADUAL","id":"GREGOBASE-415","sourceId":415,"part":"gr","incipit":"Sacerdotes ejus (Grad.)","folio":"[36]","sha256":"5bc5f9de688c1de1dc1a33f7b1ce40015f321cdff7c38bbed374148aaad8ea08","sourceUrl":"https://gregobase.selapa.net/chant.php?id=415","gabc":"(c4) SA(c)cer(d)dó(ixdh'!iv)tes(h.) *() e(ixhihghGF.hiHG'hw!ivHGhi)jus(h.) (;) ín(hjh___!iwjj)du(kvJH)am(h.) (,) sa(hg/h!jjjhhg)lu(hggf)tá(hf/gh/jhjvGE'fvDC')(,)(d!ff/ghF'Eghffe)ri :(ge/ghgff/ded.) (:) et(d!ff) san(gf~)cti(f) e(f!hgh)jus(hjh___!iwjjvIHih..) (;) ex(h)sul(hg~)ta(h!jjh)ti(f)ó(ghF'Dfff_d)ne(d.) (;) ex(d)sul(dh~)tá(h_g/jj)bunt.(ixhv.gh!ivF'D//ff/g_[oh:h]f/g_[oh:h]f/gff/ded.) (::) <sp>V/</sp>. Il(dh)luc(h) pro(g)dú(gh/jhi)cam(g.) (,) cor(fh/jhhg~)nu(g.) Da(fh!jvHG'h)vid :(h./jjh/jjgjvvh_[oh:h]i_[oh:h]h._[oh:h]) (:) pa(gh)rá(j_0kvJH'jvGF'//hghhghv.)(,)(k_[uh:l]lJ'IH)vi(ixhihih'/!ivHG'gfg.) (;) lu(f)cér(ghghk_[hl:1]jkvJHjjh)(,)(ixgih/ig.fg'h!jjhhgh)nam(ixhf/!hig/!ff/ded.) (:) Chri(dfED'fvED.//de!fg/hjIH'hgh.)(,)(ixfh!ivGF'E//f!gwh'!iv)sto(hg..) (,) * me(ixhiG'Fh!jjvH'G)o.(hghF'Efg..) (,) (d!ewf!gv.fhGF'ED'ewfd.1) (::)"},{"key":"ALLELUIA","id":"GREGOBASE-1187","sourceId":1187,"part":"al","incipit":"Juravit Dominus","folio":"[37]","sha256":"bba316ec64fed01860a893e5ecb810141e14ed501a0759481958f6ef1002db2a","sourceUrl":"https://gregobase.selapa.net/chant.php?id=1187","gabc":"(c4) AL(cd~)le(de/ge/fee[ll:1]d)lú(eg//fhgefdc!ee){ia}.(d.) <clear>*(;) <i>ij.</i>(ixhh/gihghggvF'ED.) (,) (cd/ede//g_[uh:l]hfefg.) (,) (hvGF'EdfED.c!efd.1) (::) <sp>V/</sp>. Ju(dh)rá(ixh_g/hiHG'h)vit(f_e) Dó(ef!gvFE)mi(de)nus,(e.) (;) et(eg!hv_GF) non(e[ll:1]dd) pae(c)ni(ef/gf)té(e[ll:1]d)bit(cd) e(dee[ll:1]d)um :(d.) (:) Tu(cd) es(d) sa(ef!gh)cér(egFE'e[ll:1]d~)dos(d.) (,) in(hhghvGF'gvF'ED.) ae(ef!gh)tér(egFE'e[ll:1]d~)num,(d.) (;) se(dede)cún(c)dum(e) ór(ixgh/igh./egF'ED.)(,)(ixce!gh/igh./egF'ED'dc~)di(c!ef)nem(e[ll:1]d..) (;) * Mel(cd)chí(de/ge/fee[ll:1]d)se(eg//fhgefdc!ee)dech.(d.) (;) (ixhh/gihghggvF'ED.) (,) (cd/ede//g_[uh:l]hfefg.) (,) (hvGF'EdfED.c!efd.1) (::)"}].map(row=>Object.freeze({
 ...row,sourceStatus:"RESEARCH_TRANSCRIPTION_NOT_MUSICALLY_CERTIFIED",
 publicScoreApproved:false,
 gabc:"name: "+row.incipit+";\noffice-part: "+row.part+";\nsource: Graduale Romanum 1961 p. "+row.folio+";\n%%\n"+nonPaschalJulyIntroitGabc(row)
})));

// Scores are immutable archive transcriptions. The source-owned registry is
// data-driven and can select any future verified Proper-to-score binding.
const properReferenceRegistry=createProperReferenceRegistry({
 scores:[...JULY07_REFERENCE_GABC,...ALL_SAINTS_REFERENCE_SCORES,...EPIPHANY_REFERENCE_SCORES,...IMMACULATE_CONCEPTION_REFERENCE_SCORES]
});
export const PROPER_REFERENCE_REGISTRY_STATUS=Object.freeze({
 schema:properReferenceRegistry.schema,
 scoreCount:properReferenceRegistry.scoreCount,
 bindingCount:properReferenceRegistry.bindingCount
});
export const JULY07_REFERENCE_CSS=String.raw`
.ao-proper-reference-notation{display:block;width:100%;min-width:0;margin:11px 0 8px;padding:9px 0 5px;border-top:1px solid rgba(218,196,156,.22);font-style:normal;max-width:100%;overflow:hidden}
.ao-proper-reference-tone-note{display:block;margin:7px 0;padding:4px 0;color:var(--ao-muted,#b1aa9c);font:500 11px/1.5 var(--ao-font-ui,system-ui,sans-serif);max-width:100%;overflow-wrap:anywhere}
.ao-proper-reference-label{display:block;font:600 10px/1.5 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.035em;color:var(--ao-muted,#b1aa9c);margin-bottom:6px}
.ao-proper-reference-staff{display:block;min-width:0;width:100%;box-sizing:border-box;padding:7px 3px;border-radius:4px;background:#fff;color:#211d18}
.ao-proper-reference-staff svg{display:block;max-width:100%;height:auto}
.ao-proper-reference-staff svg :is(path,polygon,polyline,line,text){fill:currentColor}
.ao-reader-shell[data-mode="MISSAL"] .ao-proper-reference-staff{color:#211d18}
.ao-proper-reference-error{font:italic 12px/1.5 var(--ao-font-liturgical,Georgia,serif);color:var(--ao-muted)}
.ao-proper-reference-expand{display:inline-block;min-height:38px;margin:1px 0 5px;padding:6px 8px;border:1px solid rgba(210,194,162,.3);border-radius:5px;background:transparent;color:var(--ao-text,#eee);font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.ao-proper-reference-expand:focus-visible{outline:2px solid var(--ao-mass-accent,#aabed3);outline-offset:2px}
.ao-proper-reference-zoom{border:0;padding:0;width:min(97vw,1080px);max-width:none;max-height:95dvh;border-radius:12px;background:#0b1018;color:#ece9e1}
.ao-proper-reference-zoom::backdrop{background:rgba(0,0,0,.9)}
.ao-proper-reference-zoom header{display:flex;align-items:center;justify-content:space-between;padding:12px 15px;border-bottom:1px solid #ffffff22;font:500 15px/1.4 Georgia,serif}
.ao-proper-reference-zoom header button{border:0;background:transparent;color:inherit;min-width:44px;min-height:44px;font-size:24px;cursor:pointer}
.ao-proper-reference-zoom .ao-proper-reference-scroll{max-height:76dvh;overflow:auto}
.ao-proper-reference-zoom .ao-proper-reference-wide{box-sizing:border-box;min-width:840px;width:max(840px,100%);padding:14px;background:#fff;color:#211d18}
.ao-proper-reference-zoom .ao-proper-reference-wide svg{display:block;max-width:100%;height:auto}
.ao-proper-reference-zoom .ao-proper-reference-wide svg :is(path,polygon,polyline,line,text){fill:currentColor}
.ao-proper-reference-zoom[data-reference-zoom-mode="fit"] .ao-proper-reference-wide{min-width:0;width:100%}
.ao-proper-reference-zoom[data-reference-zoom-mode="large"] .ao-proper-reference-wide{min-width:840px;width:max(840px,100%)}
.ao-proper-reference-zoom .ao-proper-reference-scroll{overscroll-behavior:contain}
.ao-proper-reference-zoom .ao-proper-reference-provenance{
 margin:0;padding:9px 15px;color:#c4bfb6;font:500 12px/1.45 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-proper-reference-zoom-tools{
 display:flex;flex-wrap:wrap;gap:9px;align-items:center;padding:6px 15px 12px;
 color:#eee7db;font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-proper-reference-zoom-tools button,.ao-proper-reference-zoom-tools a{
 display:inline-flex;align-items:center;justify-content:center;min-height:44px;
 padding:7px 11px;border:1px solid #ffffff55;border-radius:6px;
 color:#eee7db;background:transparent;text-decoration:none;cursor:pointer
}
.ao-proper-reference-zoom-tools button:focus-visible,.ao-proper-reference-zoom-tools a:focus-visible{
 outline:2px solid #d6caa6;outline-offset:2px
}
.ao-ordinary-printed-source{
 grid-column:2;grid-row:3;justify-self:start;display:inline-flex;align-items:center;
 min-height:40px;color:var(--ao-muted,#c8c3b9);text-decoration:underline;
 text-underline-offset:3px;font:500 11px/1.4 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-ordinary-printed-source:focus-visible{outline:2px solid var(--ao-mass-accent,#aabed3)}
@media(max-width:480px){.ao-proper-reference-zoom{width:100vw;height:100dvh;max-height:none;border-radius:0}}

/* Claude A/C presentation: embedded dark-ink staff, not a boxed research widget. */
.ao-proper-reference-notation{
 display:grid;grid-template-columns:22px minmax(0,1fr);
 gap:2px 6px;min-width:0;width:100%;max-width:100%;
 box-sizing:border-box;margin:9px 0 14px;padding:10px 0 8px;
 border-top:1px solid rgba(206,190,220,.11);
 background:transparent;border-radius:0;box-shadow:none;overflow:hidden
}
.ao-proper-reference-mark{
 grid-column:1;grid-row:1;align-self:start;color:#d58a80;
 font:500 22px/1.5 var(--ao-font-liturgical,Georgia,serif)
}
.ao-proper-reference-expand{
 grid-column:2;grid-row:1;display:block;min-width:0;width:100%;
 min-height:44px;margin:0;padding:0;border:0;
 background:transparent;color:inherit;text-align:left;cursor:zoom-in;
 border-radius:0;font:inherit
}
.ao-proper-reference-expand:focus-visible{
 outline:2px solid var(--ao-mass-accent,#aabed3);outline-offset:2px
}
.ao-proper-reference-staff{
 display:block;width:100%;min-width:0;min-height:48px;
 padding:0;border:0;border-radius:0;box-shadow:none;
 background:transparent!important;color:var(--ao-text-primary,#eee4d8)
}
.ao-proper-reference-staff svg{
 display:block;width:100%;max-width:100%;height:auto;color:inherit;
 /* Exsurge paints some score glyphs with explicit black SVG attributes.
    Normalize those actual pixels to warm liturgical ink on the dark reader. */
 filter:brightness(0) invert(.9)
}
.ao-proper-reference-label{
 grid-column:2;grid-row:2;display:block;min-width:0;
 margin:2px 0 0;padding:0;letter-spacing:.015em;
 font:500 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-muted,#aaa79f);overflow-wrap:anywhere
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph>.ao-proper-reference-notation{
 grid-column:1 / -1;grid-row:2
}
.ao-reader-shell[data-mode="MISSAL"] .ao-proper-reference-staff{
 color:var(--ao-text-primary,#e9e4d9)
}
.ao-reader-shell[data-mode="MISSAL"] .ao-proper-reference-mark{
 color:var(--ao-missal-rubric-red,#df7e80)
}
.ao-proper-reference-toggle{
 grid-column:1;grid-row:2;display:block;align-self:center;
 min-width:28px;min-height:28px;margin:0;padding:2px;
 background:transparent;border:0;border-radius:3px;
 color:var(--ao-muted,#aaa79f);
 font:600 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);
 cursor:pointer
}
.ao-proper-reference-toggle:focus-visible{
 outline:2px solid var(--ao-mass-accent,#aabed3)
}
.ao-proper-reference-notation[data-reference-view="text"]{
 border-top:0;margin:0;padding:2px 0
}
.ao-proper-reference-notation[data-reference-view="text"] .ao-proper-reference-mark,
.ao-proper-reference-notation[data-reference-view="text"] .ao-proper-reference-expand{
 display:none!important
}
.ao-proper-reference-error{grid-column:2}
.ao-proper-reference-zoom .ao-proper-reference-wide{
 background:#0b1018;color:#ece9e1
}
.ao-proper-reference-zoom .ao-proper-reference-wide svg{
 filter:brightness(0) invert(.9)
}
@media(max-width:480px){
 .ao-proper-reference-notation{
  grid-template-columns:19px minmax(0,1fr);gap:2px 4px
 }
 .ao-proper-reference-mark{font-size:20px}
}
/* Source-bound Kyriale setting choice is next to the prayer, never buried in
   the Schola dock. No melody is silently assigned to a local celebration. */
.ao-ordinary-inline-choice{
 display:flex;flex-direction:column;gap:4px;min-width:0;width:100%;
 margin:7px 0 12px;padding:8px 0;border-top:1px solid rgba(206,190,220,.11);
 font:500 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-muted,#aaa79f)
}
.ao-ordinary-inline-choice select{
 box-sizing:border-box;display:block;min-width:0;width:100%;
 max-width:100%;min-height:40px;padding:8px 22px 8px 8px;
 background:transparent;color:var(--ao-text,#ece6d9);
 border:1px solid rgba(206,190,220,.25);border-radius:5px;
 font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-ordinary-inline-choice select option{background:#171e29;color:#eee}
.ao-ordinary-inline-choice select:focus-visible{outline:2px solid var(--ao-mass-accent)}
.ao-reader-shell[data-mode="MISSAL"] .ao-ordinary-inline-choice{grid-column:1/-1}
.ao-ordinary-setting-suite{
 display:block;box-sizing:border-box;width:100%;max-width:100%;min-height:44px;
 margin:0 0 12px;padding:9px 11px;text-align:left;
 border:1px solid rgba(206,190,220,.28);border-radius:6px;
 color:var(--ao-text,#ece6d9);background:rgba(206,190,220,.07);
 font:600 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer
}
.ao-ordinary-setting-suite:focus-visible{outline:2px solid var(--ao-mass-accent)}
.ao-reader-shell[data-mode="MISSAL"] .ao-ordinary-setting-suite{grid-column:1/-1}
`;

// The selected 1962 Proper and its exact source-owned paragraph authorize
// notation, not a date-specific renderer or an incipit/title search.
export function referenceScoresForParagraph(input={}){
 return properReferenceRegistry.select(input);
}

export function createDatedProperNotationPreview({
 root,enabled=null,engraverFactory=createOfflineChantEngraver,
 onOrdinarySelection=null,onOrdinaryMassSelection=null
}={}){
 if(!root?.querySelectorAll)throw new TypeError("Mass reader root required");
 const doc=root.ownerDocument;
 const query=String(doc?.defaultView?.location?.search??"");
 // Source-bound Gregorian references are visible by default at the actual
 // 65-card Mass passage in Sung/Solemn celebrations. They retain their
 // conspicuous provisional labels and never imply musical approval.
 // ?chant_preview=0 is an explicit text-only override; the in-reader
 // preferences toggle still supports turning notation off/on at any time.
 const requestedPreview=new URLSearchParams(query).get("chant_preview");
 let active=enabled===null?requestedPreview!=="0":enabled===true;
 let entries=[],toneNotes=[],ordinaryChoosers=[],orationAmenHandoffs=[],generation=0,modal=null,modalEngraver=null,returnFocus=null;
 function closeZoom(){
  if(modal?.open)modal.close();
  modalEngraver?.destroy();modalEngraver=null;
  modal?.remove();modal=null;
  if(returnFocus?.isConnected)returnFocus.focus?.();
  returnFocus=null;
 }
 async function zoom(score,button){
  closeZoom();returnFocus=button;
  const dialog=doc.createElement("dialog");dialog.className="ao-proper-reference-zoom";
  modal=dialog;
  const head=doc.createElement("header"),title=doc.createElement("span");
  title.textContent=(score.incipit??score.sourceName)+" · Gregorian notation";
  dialog.dataset.referenceZoomMode="fit";
  const close=doc.createElement("button");close.type="button";close.textContent="×";
  close.setAttribute("aria-label","Close enlarged Gregorian notation");
  close.addEventListener("click",closeZoom);head.append(title,close);
  const scroll=doc.createElement("div");scroll.className="ao-proper-reference-scroll";
  const wide=doc.createElement("div");wide.className="ao-proper-reference-wide";
  wide.setAttribute("role","img");wide.setAttribute("aria-label",(score.incipit??score.sourceName)+" · enlarged Gregorian notation");
  const provenance=doc.createElement("p");
  provenance.className="ao-proper-reference-provenance";
  provenance.textContent="Research transcription · not musically certified or evidence of the chant sung at this Mass.";
  const tools=doc.createElement("div");tools.className="ao-proper-reference-zoom-tools";
  const size=doc.createElement("button");size.type="button";
  size.dataset.referenceZoomSize="";
  size.textContent="Large print · scroll";
  size.setAttribute("aria-label","Enlarge the score; scroll horizontally to read");
  size.setAttribute("aria-pressed","false");
  size.addEventListener("click",()=>{
    const large=dialog.dataset.referenceZoomMode!=="large";
    dialog.dataset.referenceZoomMode=large?"large":"fit";
    size.textContent=large?"Fit screen":"Large print · scroll";
    size.setAttribute("aria-pressed",String(large));
    size.setAttribute("aria-label",large?"Fit the Gregorian score to screen width":
      "Enlarge the score; scroll horizontally to read");
    const frame=doc.defaultView?.requestAnimationFrame;
    if(frame)frame(()=>{void modalEngraver?.reflow?.()});
    else void modalEngraver?.reflow?.();
  });
  tools.append(size);
  const original=score.kind==="ORDINARY_RESEARCH"?
    schola1961OriginalFacsimile(score.movement,score.settingId):null;
  if(original?.originalEditionPdf?.startsWith("https://")){
    const sourceLink=doc.createElement("a");sourceLink.dataset.referenceZoomOriginal="";
    sourceLink.href=original.originalEditionPdf;
    sourceLink.target="_blank";sourceLink.rel="noopener noreferrer";
    sourceLink.textContent="Original 1961 printed page · "+original.printedPages.join(", ");
    tools.append(sourceLink);
  }
  if(typeof score.sourceUrl==="string"&&score.sourceUrl.startsWith("https://")){
    const transcription=doc.createElement("a");
    transcription.dataset.referenceZoomTranscription="";
    transcription.href=score.sourceUrl;
    transcription.target="_blank";transcription.rel="noopener noreferrer";
    transcription.textContent="Transcription source";
    tools.append(transcription);
  }
  scroll.append(wide);dialog.append(head,provenance,tools,scroll);doc.body.append(dialog);
  dialog.addEventListener("cancel",e=>{e.preventDefault();closeZoom()});
  dialog.addEventListener("click",e=>{if(e.target===dialog)closeZoom()});
  dialog.showModal?.();close.focus();
  try{
   modalEngraver=engraverFactory({viewport:wide,document:doc});
   modalEngraver.observe?.();await modalEngraver.engrave(score.gabc);
  }catch{if(modal===dialog)closeZoom()}
 }
 function setEnabled(next){
  const value=next===true;
  if(active===value)return active;
  active=value;
  if(!active)clear();
  return active;
 }
 function clear(){
  ++generation;
  closeZoom();
  for(const e of entries){e.engraver?.destroy();e.host.remove()}
  for(const n of toneNotes)n.remove();
  for(const c of ordinaryChoosers)c.remove();
  entries=[];toneNotes=[];ordinaryChoosers=[];orationAmenHandoffs=[];
 }
 function render({mode="LIVE",form,resolvedMass,massPlan=null,paragraphs=[],selectedSettings={}}={}){
  clear();
  if(!active||!["LIVE","MISSAL"].includes(mode)||
   !["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(String(form??"").toUpperCase()))return 0;
  const g=generation;
  // Separate second research opt-in: ?chant_preview=1&greeting_transfer=1961.
  // Does not certify this 1961 oration melody at the two other Mass locations.
  const greetingRequest=new URLSearchParams(query).get("greeting_transfer")==="1961";
  const researchSettings=greetingRequest?
    {...selectedSettings,GREETING_TRANSFER_SOURCE:GREETING_TRANSFER_EXPLICIT_SELECTION}:
    selectedSettings;
  const unique=new Map(),byCue=new Map();
  for(const p of paragraphs){
   for(const cueId of p.sourceCueIds??[]){
    if(byCue.has(cueId))byCue.set(cueId,null);
    else byCue.set(cueId,p);
   }
   const id=String(p.id??"");
   if(!id||unique.has(id)){unique.set(id,null);continue}
   unique.set(id,p);
  }
  for(const node of root.querySelectorAll(".ao-reader-paragraph[data-paragraph-id],.ao-reader-paragraph[data-cue-id]")){
   const p=(node.dataset.paragraphId&&unique.get(node.dataset.paragraphId))||
     (node.dataset.cueId&&byCue.get(node.dataset.cueId));
   if(!p)continue;
   const oration=resolveOrationAmenSourceHandoff({paragraph:p,paragraphs,form,resolvedMass});
   if(oration.status==="SOURCE_ORATION_AND_TONE_CERTIFIED_SCORE_PENDING")
    orationAmenHandoffs.push(oration);
   const tone=resolveOrationAmenTonePolicy({paragraph:p,paragraphs,form,resolvedMass,selectedSettings});
   if(tone.note){
    const note=doc.createElement("small");note.className="ao-proper-reference-tone-note";
    note.dataset.orationToneStatus=tone.status;
    note.textContent=String(selectedSettings?.LANGUAGE??selectedSettings?.language??"en").toLowerCase().startsWith("fr")?
     tone.note.fr:tone.note.en;
    node.append(note);toneNotes.push(note);
   }
   const anchor=ordinaryMovementAtSourceParagraph({paragraph:p,form,resolvedMass});
   if(anchor && typeof onOrdinarySelection==="function"){
     const movement=anchor.movement;
     const choices=offlineOrdinarySettingChoices(movement);
     if(choices.length){
       const chooser=doc.createElement("label");
       chooser.className="ao-ordinary-inline-choice";
       chooser.dataset.ordinaryReferenceChooser=movement;
       const hint=doc.createElement("span");
       hint.textContent="Gregorian notation · select a "+movement.replaceAll("_"," ").toLowerCase()+" reference (not a claim of local singing)";
       const select=doc.createElement("select");
       select.setAttribute("aria-label","Select source-indexed "+movement.replaceAll("_"," ")+" Gregorian melody");
       const empty=doc.createElement("option");
       empty.value="";empty.textContent="Select a setting to show its notation";
       select.append(empty);
       for(const choice of choices){
         const option=doc.createElement("option");
         option.value=choice.id;
         option.textContent=choice.title+" · research transcription";
         select.append(option);
       }
       const chosen=String(selectedSettings?.[movement]??"");
       if(chosen && !choices.some(c=>c.id===chosen)){
         const unavailable=doc.createElement("option");
         unavailable.value=chosen;
         unavailable.textContent="Other local setting · score not yet available";
         select.append(unavailable);
       }
       select.value=chosen;
       select.addEventListener("change",()=>{
         onOrdinarySelection({movement,settingId:select.value});
       });
       chooser.append(hint,select);
       // Make the setting discoverable before the Latin opening cue.
       // Appending it after the whole bilingual paragraph hid it below
       // the initial viewport, a path the programmatic M45 test bypassed.
       const openingText=node.querySelector(":scope > .ao-line-primary");
       if(openingText)node.insertBefore(chooser,openingText);
       else node.prepend(chooser);
       ordinaryChoosers.push(chooser);
       // A numbered Kyriale Mass can have matching archived movements.
       // Do NOT infer their selection from the initial Kyrie dropdown.
       // Offer a separate conscious action, only where complete GABCs exist.
       if(movement==="KYRIE" && chosen.startsWith("MASS_") &&
          typeof onOrdinaryMassSelection==="function"){
         const others=["GLORIA","SANCTUS_BENEDICTUS","AGNUS_DEI"].filter(part=>
           offlineOrdinarySettingChoices(part).some(item=>item.id===chosen));
         if(others.length){
           const apply=doc.createElement("button");
           apply.type="button";apply.className="ao-ordinary-setting-suite";
           apply.dataset.ordinaryMassSuite=chosen;
           const massName=choices.find(item=>item.id===chosen)?.title??chosen;
           apply.textContent="Use "+massName+" for "+others.length+
             " other available Ordinary score"+(others.length===1?"":"s");
           apply.title="Explicitly replace the other Ordinary source selections; "+
             "Credo remains independent. Research notation, not evidence of local singing.";
           apply.setAttribute("aria-label",apply.textContent+
             ". Credo is separate. Replace other Ordinary research examples; no sung performance is inferred.");
           apply.addEventListener("click",()=>onOrdinaryMassSelection({settingId:chosen}));
           if(openingText)node.insertBefore(apply,openingText);
           else node.append(apply);
           ordinaryChoosers.push(apply);
         }
       }
     }
   }
   const scores=referenceScoresForParagraph({paragraph:p,resolvedMass,form});
   const ordinary=sourceBoundOrdinaryReferenceScores({
    paragraph:p,form,resolvedMass,selectedSettings
   });
   const participatory=participationReferenceScoresForParagraph({
    paragraph:p,paragraphs,form,resolvedMass,massPlan,selectedSettings
   });
   const celebrantPreface=prefaceCelebrantInlineScoresForParagraph({
    paragraph:p,paragraphs,form,resolvedMass
   });
   const otherCelebrant=gospelCanonPaxLeaderScoresForParagraph({
    paragraph:p,paragraphs,form,resolvedMass,selectedSettings
   });
   const orationScores=sourceBoundFestiveOrationAmenScores({
    paragraph:p,paragraphs,form,resolvedMass,selectedSettings
   });
   const oldSolemnScores=sourceBoundOldSolemnOrationAmenScores({
    paragraph:p,paragraphs,form,resolvedMass,selectedSettings
   });
   const greetingCandidates=twoGreetingTransferCandidates({
    paragraph:p,paragraphs,form,resolvedMass,selectedSettings:researchSettings
   });
   for(const score of [...scores,...ordinary,...participatory,...celebrantPreface,...otherCelebrant,...orationScores,...oldSolemnScores,...greetingCandidates]){
    const host=doc.createElement("span");host.className="ao-proper-reference-notation";
    host.dataset.referenceScore=score.id;
    host.dataset.approved="false";
    if(score.kind==="ORDINARY_RESEARCH"){
      host.dataset.referenceOrdinaryMovement=score.movement;
      host.dataset.referenceOrdinarySetting=score.settingId;
    }
    const title=doc.createElement("small");title.className="ao-proper-reference-label";
    const category=score.sourceCueIds?.length?
      (score.kind==="CELEBRANT_INTONATION"?"Intonation":"Response"):
      PROPER_REFERENCE_LABELS[score.key]??"Chant";
    title.textContent=score.kind==="ORDINARY_RESEARCH"
      ?score.title+" · local setting · research transcription, 1961 review pending"
      :score.sourceContextCertified===false
        ?"1961 · NOT source-certified for this Mass"
        :category+" · 1961 review pending";
    title.title=score.kind==="ORDINARY_RESEARCH"
      ?"Locally selected Kyriale example, not certified as the melody sung at this Mass. No approval of notes, neumes, rhythm or underlay."
      :score.sourceContextCertified===false
        ?"A reference transcription, not verified as this Mass's music."
        :"1961 reference transcription awaiting independent editorial musical review.";
    const staff=doc.createElement("span");staff.className="ao-proper-reference-staff";
    staff.setAttribute("role","img");
    staff.setAttribute("aria-label",(score.incipit??score.sourceName)+
      (score.sourceContextCertified===false?
       " · Gregorian reference melody; use at this Mass location NOT verified":
       " · Gregorian square notation, archival transcription pending editorial comparison"));
    const expand=doc.createElement("button");expand.type="button";
    expand.className="ao-proper-reference-expand";
    expand.title="Tap the Gregorian staff to enlarge";
    expand.setAttribute("aria-label","Enlarge Gregorian notation for "+(score.incipit??score.sourceName));
    expand.addEventListener("click",e=>{e.stopPropagation();void zoom(score,expand)});
    const mark=doc.createElement("span");
    mark.className="ao-proper-reference-mark";
    mark.textContent=score.kind==="CELEBRANT_INTONATION"?"℣":
      /^\s*℟/.test(score.sourceLatin??"")?"℟":
      /^\s*℣/.test(score.sourceLatin??"")?"℣":"♫";
    mark.setAttribute("aria-hidden","true");
    expand.append(staff);
    host.dataset.referenceView="notation";
    const viewToggle=doc.createElement("button");viewToggle.type="button";
    viewToggle.className="ao-proper-reference-toggle";
    viewToggle.textContent="Aa";
    viewToggle.setAttribute("aria-label","Show text without Gregorian notation");
    viewToggle.setAttribute("aria-pressed","true");
    viewToggle.addEventListener("click",event=>{
      event.stopPropagation();
      const notation=host.dataset.referenceView==="notation";
      host.dataset.referenceView=notation?"text":"notation";
      viewToggle.textContent=notation?"♫":"Aa";
      viewToggle.setAttribute("aria-pressed",String(!notation));
      viewToggle.setAttribute("aria-label",notation?
        "Show Gregorian notation":"Show text without Gregorian notation");
    });
    host.append(mark,expand,title,viewToggle);
    if(score.kind==="ORDINARY_RESEARCH"){
      const original=schola1961OriginalFacsimile(score.movement,score.settingId);
      if(original?.originalEditionPdf?.startsWith("https://")){
        const source=doc.createElement("a");
        source.className="ao-ordinary-printed-source";
        source.dataset.ordinaryPrintedSource=score.settingId;
        source.href=original.originalEditionPdf;
        source.target="_blank";source.rel="noopener noreferrer";
        source.textContent="View original 1961 printed notation · p. "+original.printedPages.join(", ");
        host.append(source);
      }
    }
    // A/C: LIVE translations follow the sung staff, not precede it.
    // MISSAL keeps the two bilingual columns in grid row 1 with this
    // single full-width staff in grid row 2.
    const translation=node.querySelector(":scope > .ao-line-secondary");
    if(translation)node.insertBefore(host,translation);
    else node.append(host);
    const entry={host,score,engraver:null};entries.push(entry);
    try{
     const engraver=engraverFactory({viewport:staff,document:doc});
     entry.engraver=engraver;engraver.observe?.();
     void engraver.engrave(score.gabc).then(ok=>{
      if(g!==generation||!host.isConnected)return;
      if(ok)host.dataset.referenceReady="true";
      else host.dataset.referenceReady="false";
     }).catch(()=>{
      if(g===generation&&host.isConnected){
       host.dataset.referenceReady="false";
       const err=doc.createElement("span");err.className="ao-proper-reference-error";
       err.textContent="Notation unavailable; original Mass text remains above.";host.append(err);
      }
     });
    }catch{
     host.dataset.referenceReady="false";
    }
   }
  }
  return entries.length;
 }
 return Object.freeze({render,clear,destroy:clear,setEnabled,
  get enabled(){return active},
  state:()=>Object.freeze({enabled:active,mounted:entries.length,
   rendered:entries.filter(e=>e.host.dataset.referenceReady==="true").length,
   orationAmenSourceReady:orationAmenHandoffs.length,
   orationAmenMusicPending:orationAmenHandoffs.length>0,
   orationAmenUnscoredNotes:toneNotes.length})});
}
