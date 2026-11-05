// Deliberately bounded inline Gregorian *reference preview* for 7 July 2026.
// The three GABC bodies are exact copied research transcriptions from our
// existing 1,195-record 1961 GregoBase/Solesmes archive. They are CC0 text.
// No published-score approval, Gregorian recording, source alias or new reader card.
// The same renderer can support independently selected chants on other dates.
import {createOfflineChantEngraver} from "./reader-chant-engraver.js";
import {ALL_SAINTS_REFERENCE_SCORES} from "./reader-inline-all-saints-reference.js";
import {createProperReferenceRegistry,PROPER_REFERENCE_LABELS} from "./reader-inline-proper-registry.js";
import {participationReferenceScoresForParagraph} from "./reader-participation-reference-scores.js";

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
 scores:[...JULY07_REFERENCE_GABC,...ALL_SAINTS_REFERENCE_SCORES]
});
export const PROPER_REFERENCE_REGISTRY_STATUS=Object.freeze({
 schema:properReferenceRegistry.schema,
 scoreCount:properReferenceRegistry.scoreCount,
 bindingCount:properReferenceRegistry.bindingCount
});
export const JULY07_REFERENCE_CSS=String.raw`
.ao-proper-reference-notation{display:block;width:100%;min-width:0;margin:11px 0 8px;padding:9px 0 5px;border-top:1px solid rgba(218,196,156,.22);font-style:normal;max-width:100%;overflow:hidden}
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
@media(max-width:480px){.ao-proper-reference-zoom{width:100vw;height:100dvh;max-height:none;border-radius:0}}
`;

// The selected 1962 Proper and its exact source-owned paragraph authorize
// notation, not a date-specific renderer or an incipit/title search.
export function referenceScoresForParagraph(input={}){
 return properReferenceRegistry.select(input);
}

export function createDatedProperNotationPreview({
 root,enabled=null,engraverFactory=createOfflineChantEngraver
}={}){
 if(!root?.querySelectorAll)throw new TypeError("Mass reader root required");
 const doc=root.ownerDocument;
 const query=String(doc?.defaultView?.location?.search??"");
 const active=enabled===null?new URLSearchParams(query).get("chant_preview")==="1":enabled===true;
 let entries=[],generation=0,modal=null,modalEngraver=null,returnFocus=null;
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
  title.textContent=(score.incipit??score.sourceName)+" · original 1961 reference";
  const close=doc.createElement("button");close.type="button";close.textContent="×";
  close.setAttribute("aria-label","Close enlarged Gregorian notation");
  close.addEventListener("click",closeZoom);head.append(title,close);
  const scroll=doc.createElement("div");scroll.className="ao-proper-reference-scroll";
  const wide=doc.createElement("div");wide.className="ao-proper-reference-wide";
  wide.setAttribute("role","img");wide.setAttribute("aria-label",(score.incipit??score.sourceName)+" · enlarged Gregorian notation");
  scroll.append(wide);dialog.append(head,scroll);doc.body.append(dialog);
  dialog.addEventListener("cancel",e=>{e.preventDefault();closeZoom()});
  dialog.addEventListener("click",e=>{if(e.target===dialog)closeZoom()});
  dialog.showModal?.();close.focus();
  try{
   modalEngraver=engraverFactory({viewport:wide,document:doc});
   modalEngraver.observe?.();await modalEngraver.engrave(score.gabc);
  }catch{if(modal===dialog)closeZoom()}
 }
 function clear(){
  ++generation;
  closeZoom();
  for(const e of entries){e.engraver?.destroy();e.host.remove()}
  entries=[];
 }
 function render({mode="LIVE",form,resolvedMass,paragraphs=[],selectedSettings={}}={}){
  clear();
  if(!active||!["LIVE","MISSAL"].includes(mode))return 0;
  const g=generation;
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
   const scores=referenceScoresForParagraph({paragraph:p,resolvedMass,form});
   const participatory=participationReferenceScoresForParagraph({
    paragraph:p,paragraphs,form,resolvedMass,selectedSettings
   });
   for(const score of [...scores,...participatory]){
    const host=doc.createElement("span");host.className="ao-proper-reference-notation";
    host.dataset.referenceScore=score.id;
    host.dataset.approved="false";
    const title=doc.createElement("small");title.className="ao-proper-reference-label";
    title.textContent=(score.sourceCueIds?.length?
      (score.kind==="CELEBRANT_INTONATION"?"Celebrant intonation":"Sung response"):
      PROPER_REFERENCE_LABELS[score.key])+
     " · 1961 reference transcription · review pending";
    const staff=doc.createElement("span");staff.className="ao-proper-reference-staff";
    staff.setAttribute("role","img");
    staff.setAttribute("aria-label",(score.incipit??score.sourceName)+" · Gregorian square notation, archival transcription pending editorial comparison");
    const expand=doc.createElement("button");expand.type="button";
    expand.className="ao-proper-reference-expand";expand.textContent="Enlarge notation";
    expand.setAttribute("aria-label","Enlarge Gregorian notation for "+(score.incipit??score.sourceName));
    expand.addEventListener("click",e=>{e.stopPropagation();void zoom(score,expand)});
    host.append(title,expand,staff);node.append(host);
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
 return Object.freeze({render,clear,destroy:clear,enabled:active,
  state:()=>Object.freeze({enabled:active,mounted:entries.length,
   rendered:entries.filter(e=>e.host.dataset.referenceReady==="true").length})});
}
