// Explicitly gated editorial QA only. Not a public Formation route or publication approval.
// The records load from their canonical research JSON files; this view does not duplicate the answer corpus.
export const RECOVERY_REVIEW_VERSION = "FORMATION_RECOVERY_REVIEW_V1";
export const RECOVERY_REVIEW_ROOT = "ao-formation-recovery-review";
const PACKS = Object.freeze([
  ["BAQ questions","biblical-patristic-and-sedevacantist-question-supplement.v1.json"],
  ["BAQ answers","biblical-patristic-answers.v1.json"],
  ["Sedevacantism","sedevacantism-preconciliar-debates.v1.json"],
  ["Contemporary I","contemporary-controversies-source-pack.v1.json"],
  ["Contemporary II","contemporary-controversies-batch2-source-pack.v1.json"],
  ["Contemporary III · drafted","contemporary-controversies-bulk-21-debates-2026-10-08.v1.json"],
  ["Traditional Mass I","traditional-mass-objections-026-050-recovered.v1.json"],
  ["Traditional Mass II","traditional-mass-objections-051-065-reconciled.v1.json"],
  ["Traditionis custodes","traditionis-custodes-debates.v1.json"],
  ["Apologetics dossiers","apologetics-canonical.v1.json"],
  ["Church Crisis dossiers","church-crisis-canonical.v1.json"]
]);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick = (win,en,fr) => isFr(win) ? fr : en;
const isFr = win => win?.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr" ||
  win?.document?.documentElement?.lang === "fr";
const asText = (value,win) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return isFr(win) ? value.fr || value.en || "" : value.en || value.fr || "";
  return "";
};
const slug = text => String(text||"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const kind = k => ({
  answer_paragraphs:"Answer",short_answer:"Short answer",paragraphs:"Paragraphs",
  sedevacantist_case:"Sedevacantist case",critical_assessment:"Critical assessment",
  positions:"Positions & objections",objections:"Objections & replies",
  traditional_argument:"Traditional Catholic argument",argument:"Argument",objection:"Objection",
  response:"Response",rebuttal:"Rebuttal",reply:"Reply",challenge:"Challenge",
  fr_executive_summary:"French executive summary · editorial",verification_notes:"Verification notes · editorial",
  counterargument:"Counterargument"
}[k] || String(k).replace(/_/g," "));
export const RECOVERY_REVIEW_SECTION_KEYS = Object.freeze(["answer_paragraphs","short_answer",
  "sedevacantist_case","positions","critical_assessment","objections","paragraphs",
  "traditional_argument","reply","rebuttal","fr_executive_summary","verification_notes"]);
export const RECOVERY_REVIEW_CHILD_KEYS = Object.freeze(["paragraphs","argument","objection",
  "challenge","response","reply","rebuttal","counterargument","short_answer"]);
const sectionsFor = (r) => {
  if(!r) return [];
  const order = RECOVERY_REVIEW_SECTION_KEYS;
  return order.filter(k=>r[k] && (!Array.isArray(r[k]) || r[k].length)).map(k=>({label:kind(k),body:r[k]}));
};
const css = [
  "#ao-formation-recovery-review{position:fixed;inset:0;overflow:auto;z-index:16510;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4da);font:1rem/1.62 var(--ao-font-body,Georgia,serif)}",
  "#ao-formation-recovery-review[hidden]{display:none!important}#ao-formation-recovery-review *{box-sizing:border-box}",
  "#ao-formation-recovery-review .rrTop{position:sticky;top:0;z-index:2;display:grid;grid-template-columns:48px 1fr 48px;gap:10px;align-items:center;padding:calc(10px + var(--safe-top,0px)) 12px 10px;background:var(--ao-bg-canvas,#080c12);border-bottom:1px solid var(--ao-rule,#3d3d40)}",
  "#ao-formation-recovery-review .rrTop strong{text-align:center;font:600 .9rem var(--ao-font-ui,system-ui)}",
  "#ao-formation-recovery-review button{cursor:pointer;color:inherit}",
  "#ao-formation-recovery-review .rrTop button{min-height:44px;border:1px solid var(--ao-rule,#3d3d40);border-radius:9px;background:transparent;font-size:1.2rem}",
  "#ao-formation-recovery-review main{max-width:760px;margin:auto;padding:19px 16px 60px}",
  "#ao-formation-recovery-review h1{font:500 clamp(1.5rem,5vw,2.2rem)/1.25 var(--ao-font-display,Georgia,serif);margin:8px 0 17px}",
  "#ao-formation-recovery-review h2{font:500 1.16rem/1.3 var(--ao-font-display,Georgia,serif);margin:24px 0 12px}",
  "#ao-formation-recovery-review p{margin:0 0 12px}",
  "#ao-formation-recovery-review .rrMuted{font:.77rem/1.5 var(--ao-font-ui,system-ui);color:var(--ao-text-muted,#a9a5a0)}",
  "#ao-formation-recovery-review .rrWarning{border-left:2px solid var(--liturgical,#c9ad78);padding:9px 12px;margin:12px 0 18px;color:var(--ao-text-muted,#bdb6ab);font:.78rem/1.5 var(--ao-font-ui,system-ui)}",
  "#ao-formation-recovery-review .rrFields{display:grid;gap:9px;margin:12px 0}",
  "#ao-formation-recovery-review input,#ao-formation-recovery-review select{width:100%;min-height:46px;padding:10px 12px;color:inherit;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,#3d3d40);border-radius:10px;font:1rem var(--ao-font-ui,system-ui)}",
  "#ao-formation-recovery-review .rrList{display:grid;gap:9px;margin-top:15px}",
  "#ao-formation-recovery-review .rrTabs{display:flex;gap:9px;margin:14px 0}",
  "#ao-formation-recovery-review .rrTabs button{padding:10px 12px;min-height:44px;border:1px solid var(--ao-rule,#3d3d40);background:transparent;border-radius:10px;font:.82rem var(--ao-font-ui,system-ui)}",
  "#ao-formation-recovery-review .rrTabs button[aria-pressed=true]{border-color:var(--liturgical,#c9ad78)}",
  "#ao-formation-recovery-review .rrList button{text-align:left;padding:13px 14px;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,#3d3d40);border-radius:11px;font:1rem/1.4 var(--ao-font-body,Georgia,serif)}",
  "#ao-formation-recovery-review .rrList small{display:block;font:.7rem var(--ao-font-ui,system-ui);color:var(--ao-text-muted,#a9a5a0);margin-bottom:5px}",
  "#ao-formation-recovery-review .rrSources{display:flex;gap:5px 12px;flex-wrap:wrap;font:.72rem/1.6 var(--ao-font-ui,system-ui);margin:4px 0 15px}",
  "#ao-formation-recovery-review .rrSources a{color:var(--liturgical,#c9ad78);text-decoration:underline;overflow-wrap:anywhere}",
  "#ao-formation-recovery-review .rrNode{margin:12px 0 17px}",
  "#ao-formation-recovery-review .rrNode>h3{margin:12px 0 8px;font:500 .94rem var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c9ad78)}",
  "#ao-formation-recovery-review .rrRole{color:var(--ao-text-muted,#a9a5a0);font:.7rem var(--ao-font-ui,system-ui);letter-spacing:.04em;margin-bottom:4px}",
  "@media(max-width:420px){#ao-formation-recovery-review main{padding:15px 12px 50px}}"
].join("\n");

export function buildRecoveryReviewRows(packs) {
  const byName = name => packs.find(x=>x.label===name)?.doc;
  const questions=byName("BAQ questions") || {},answers=byName("BAQ answers") || {};
  const answerMap=new Map((answers.answers||[]).map(x=>[x.question_id,x]));
  const out=[];
  function push(label,entries,reg,make) {
    for(const raw of entries||[]) out.push({...make(raw),bank:label,raw,sourceRegistry:new Map((reg||[]).map(s=>[s.id,s]))});
  }
  push("BAQ",(questions.questions||[]),answers.source_registry,raw=>({
    id:raw.id,owner:raw.canonical_owner,title_en:raw.question,
    title_fr:raw.question_fr||answerMap.get(raw.id)?.question_fr||null,
    content:answerMap.get(raw.id)||null,qaStatus:answerMap.has(raw.id)?"ANSWER_DRAFT":"QUESTION_ONLY"}));
  const sdv=byName("Sedevacantism")||{};
  push("Sedevacantism",sdv.debates,sdv.source_registry,raw=>({
    id:raw.id,owner:raw.canonical_owner,title_en:raw.title,title_fr:raw.title_fr,content:raw,qaStatus:"DRAFT"}));
  for(const [label,field] of [["Contemporary I","cases"],["Contemporary II","cases"],
   ["Traditional Mass I","records"],["Traditional Mass II","records"],["Traditionis custodes","debates"]]){
    const x=byName(label)||{};
    push(label,x[field],x.source_registry,raw=>({
      id:raw.id || raw.slug,owner:raw.canonical_owner||null,
      title_en:raw.question||raw.question_original||raw.title?.en||raw.title,
      title_fr:raw.question_fr||raw.title?.fr||null,content:raw,qaStatus:"DRAFT"}));
  }
  if(out.length!==102 || new Set(out.map(x=>x.id)).size!==102)throw new Error("Recovery source corpus is not the frozen 102-record inventory");
  return out;
}

export function buildContemporaryDraftRows(packs) {
  const doc=packs.find(x=>x.label==="Contemporary III · drafted")?.doc;
  if(!doc || doc.cases?.length!==21 || doc.public_release!==false)
    throw new Error("New contemporary draft corpus missing or unexpectedly approved");
  const ids=new Set();
  return doc.cases.map(raw=>{
    if(ids.has(raw.id) || !raw.canonical_owner || raw.paragraphs?.length!==4)
      throw new Error("Invalid new contemporary draft record: "+raw.id);
    ids.add(raw.id);
    return {id:raw.id,owner:raw.canonical_owner,title_en:raw.title.en,title_fr:raw.title.fr,
      bank:"Contemporary III · drafted",raw,content:raw,qaStatus:"NEW_UNPUBLISHED_DRAFT",
      sourceRegistry:new Map(raw.source_registry.map(x=>[x.id,{...x,title:x.scope||x.id}]))};
  });
}

export function buildRecoveryDossierCoverage(rows,packs) {
  const apo=packs.find(p=>p.label==="Apologetics dossiers")?.doc?.dossiers||[];
  const crisis=packs.find(p=>p.label==="Church Crisis dossiers")?.doc?.dossiers||[];
  if(apo.length!==60 || crisis.length!==81)throw new Error("Canonical Formation dossier inventory has changed");
  const owners=new Map([...apo,...crisis].map(d=>[d.id,[]]));
  if(owners.size!==141)throw new Error("Duplicate canonical dossier identifiers");
  const external=[];
  for(const record of rows){
    const target=owners.get(record.owner);
    if(target)target.push(record);
    else external.push(record);
  }
  const dossiers=[
    ...apo.map(d=>({...d,corpus:"apologetics",research:owners.get(d.id)})),
    ...crisis.map(d=>({...d,corpus:"crisis",research:owners.get(d.id)}))
  ];
  return Object.freeze({dossiers,external,covered:dossiers.filter(d=>d.research.length).length,
    linked:dossiers.reduce((n,d)=>n+d.research.length,0)});
}

export function createFormationRecoveryReview(win=globalThis) {
  const state={open:false,view:"list",mode:"dossiers",corpus:"all",dossierId:null,returnTo:"list",id:null,bank:"all",query:"",rows:[],dossiers:[],external:[],error:"",loading:false};
  const root=()=>win?.document?.getElementById?.(RECOVERY_REVIEW_ROOT);
  const selected=()=>state.rows.find(x=>x.id===state.id);
  const ttl=r=>isFr(win)?r.title_fr||r.title_en:r.title_en;
  const sourceLinks=(ids,map)=>{
    const seen=[...new Set(ids||[])];
    if(!seen.length)return '<p class="rrMuted">Editorial source review required</p>';
    return '<nav class="rrSources" aria-label="Original sources">'+seen.map(id=>{
      const s=map.get(id);
      if(!s?.url?.startsWith("https://"))return '<span class="rrMuted">Unresolved source '+esc(id)+'</span>';
      return '<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer" title="'+esc(s.title||id)+'">'+esc(s.title||id)+'</a>';
    }).join("")+'</nav>';
  };
  const renderNode=(value,map,depth=0)=>{
    if(value===null || value===undefined || depth>8)return "";
    if(Array.isArray(value))return value.map(x=>'<div class="rrNode">'+renderNode(x,map,depth+1)+'</div>').join("");
    if(typeof value==="string")return '<p>'+esc(value)+'</p>';
    if(typeof value!=="object")return "";
    const text=isFr(win)?value.text_fr||asText(value.text,win)||value.text_en:
      asText(value.text,win)||value.text_en||value.text_fr;
    const claimText=text||value.finding||value.note||value.summary||"";
    const role=value.role||value.proponent||value.attributed_to||value.voice||"";
    let html=role?'<div class="rrRole">'+esc(role)+'</div>':"";
    if(claimText){
      html+='<p>'+esc(claimText)+'</p>'+(Array.isArray(value.source_ids)?sourceLinks(value.source_ids,map):"");
    }else if(Array.isArray(value.source_ids))html+=sourceLinks(value.source_ids,map);
    const childFields=RECOVERY_REVIEW_CHILD_KEYS;
    for(const k of childFields)if(value[k] && (Array.isArray(value[k])||typeof value[k]==="object")){
      html+='<div class="rrNode"><h3>'+esc(kind(k))+'</h3>'+renderNode(value[k],map,depth+1)+'</div>';
    }
    if(!text&&!html)html='<p class="rrMuted">No substantive text in this record.</p>';
    return html;
  };
  const dossierRows=()=>{
    const q=state.query.toLowerCase().trim();
    const selected=state.dossiers.filter(x=>(state.corpus==="all"||x.corpus===state.corpus)&&
      [x.id,x.title,x.family,...x.research.map(y=>y.title_en)].some(v=>String(v||"").toLowerCase().includes(q)));
    return selected.map(x=>'<button type="button" data-rr-dossier="'+esc(x.id)+'"><small>'+
      esc(x.id)+' · '+esc(x.family)+' · '+esc(x.research.length+' linked research '+(x.research.length===1?'record':'records'))+
      '</small>'+esc(x.title)+'</button>').join("")||
      '<p class="rrMuted">'+esc(pick(win,"No matching dossiers.","Aucun dossier correspondant."))+'</p>';
  };
  const dossierDetail=()=>{
    const d=state.dossiers.find(x=>x.id===state.dossierId);
    if(!d)return listView();
    return '<div class="rrMuted">'+esc(d.id)+' · '+esc(d.family)+'</div><h1>'+esc(d.title)+'</h1>'+
      '<div class="rrWarning">'+esc(pick(win,"This is an unpublished editorial dossier index. Associated research is not a certified completed answer.",
        "Index éditorial non publié. La recherche associée n’est pas une réponse complète certifiée."))+'</div>'+
      '<h2>'+esc(pick(win,"Associated original research","Recherches originales associées"))+' ('+d.research.length+')</h2>'+
      (d.research.length?'<div class="rrList">'+d.research.map(x=>
        '<button type="button" data-rr-id="'+esc(x.id)+'"><small>'+esc(x.id)+' · '+esc(x.bank)+'</small>'+
        esc(ttl(x))+'</button>').join("")+'</div>':
        '<p class="rrMuted">'+esc(pick(win,"No direct research entry in the recovered 102 records or the 21 new unpublished controversy drafts. Other research may exist elsewhere.",
        "Aucune entrée directe dans les 102 dossiers récupérés. D’autres recherches peuvent exister ailleurs."))+'</p>');
  };
  const listRows=()=>{
    const q=state.query.toLowerCase().trim();
    const hits=state.rows.filter(x=>(state.bank==="all"||x.bank===state.bank)&&
      [x.id,x.owner,x.title_en,x.title_fr].some(v=>String(v||"").toLowerCase().includes(q)));
    return hits.map(x=>'<button type="button" data-rr-id="'+esc(x.id)+'"><small>'+esc(x.id)+' · '+
      esc(x.owner||"external owner")+' · '+esc(x.bank)+'</small>'+esc(ttl(x))+'</button>').join("")||
      '<p class="rrMuted">'+esc(pick(win,"No matching records.","Aucun résultat."))+'</p>';
  };
  const listView=()=>{
    const dossierMode=state.mode==="dossiers";
    return '<div class="rrMuted">'+esc(pick(win,"Editorial research only · not published",
      "Recherche éditoriale · non publiée"))+'</div>'+
      '<h1>'+esc(pick(win,"Formation recovery by topic","Récupération par sujet"))+'</h1>'+
      '<p class="rrWarning">'+esc(pick(win,
      "Research links are not an approval of the text. Empty dossiers here mean no record in this recovered pack, not that the question was never researched.",
      "Ces liens ne valent pas approbation. Un dossier vide ici signifie seulement qu’aucune entrée de cette collection n’y est associée."))+'</p>'+
      '<div class="rrMuted">'+esc(state.dossiers.filter(x=>x.research.length).length)+' / 141 '+
      esc(pick(win,"dossiers have editorial research drafts; 5 legacy records belong elsewhere.",
      "dossiers ont un projet de recherche ; 5 archives relèvent d’autres modules."))+'</div>'+
      '<div class="rrTabs" role="group" aria-label="Review mode">'+
      [['dossiers',pick(win,"Dossiers (141)","Dossiers (141)")],
       ['records',pick(win,"Research (123)","Recherches (102)")]].map(([value,label])=>
       '<button type="button" data-rr-mode="'+value+'" aria-pressed="'+(state.mode===value)+'">'+esc(label)+'</button>').join("")+
      '</div>'+
      '<div class="rrFields"><input data-rr-search type="search" value="'+esc(state.query)+
      '" placeholder="'+esc(dossierMode?pick(win,"Search dossiers and their questions","Rechercher les dossiers et questions"):
        pick(win,"Search 102 research records","Rechercher les 102 recherches"))+'">'+
      (dossierMode?'<select data-rr-corpus aria-label="Dossier collection">'+
       [['all',pick(win,"All dossiers","Tous les dossiers")],
        ['apologetics',pick(win,"Apologetics","Apologétique")],
        ['crisis',pick(win,"Church Crisis","Crise de l’Église")]].map(([value,label])=>
        '<option value="'+value+'"'+(state.corpus===value?" selected":"")+'>'+esc(label)+'</option>').join("")+'</select>':
       '<select data-rr-bank aria-label="Research bank">'+
        ["all",...new Set(state.rows.map(x=>x.bank))].map(v=>'<option value="'+esc(v)+'"'+
        (state.bank===v?" selected":"")+'>'+esc(v==="all"?pick(win,"All banks","Toutes les collections"):v)+'</option>').join("")+
       '</select>')+'</div><div class="rrList" data-rr-list>'+(dossierMode?dossierRows():listRows())+'</div>';
  };
  const detailView=()=>{
    const x=selected();if(!x)return listView();
    const qSource=x.bank==="BAQ"?x.raw?.question_provenance_ids||[]:
      x.content?.question_provenance_ids||x.content?.question_source_ids||[];
    let html='<div class="rrMuted">'+esc(x.id)+' · '+esc(x.owner||"external owner")+' · '+esc(x.bank)+'</div>'+
      '<h1>'+esc(ttl(x))+'</h1><div class="rrWarning">'+esc(pick(win,
      "Unpublished draft. Compare every argument with its original context before approving.",
      "Brouillon non publié. Vérifier chaque argument dans son contexte original avant approbation."))+'</div>';
    if(qSource.length)html+='<h2>'+esc(pick(win,"Question provenance","Sources de la question"))+'</h2>'+
      sourceLinks(qSource,x.bank==="BAQ"?new Map((state.questionSources||[]).map(y=>[y.id,y])):x.sourceRegistry);
    if(!x.content)return html+'<p class="rrMuted">'+esc(pick(win,"No answer draft is registered.",
      "Aucun projet de réponse enregistré."))+'</p>';
    const sections=sectionsFor(x.content);
    if(!sections.length)return html+'<p class="rrMuted">Draft structure requires manual review.</p>';
    return html+sections.map(s=>'<section><h2>'+esc(s.label)+'</h2>'+renderNode(s.body,x.sourceRegistry)+'</section>').join("");
  };
  function ensure(){
    const doc=win?.document;if(!doc?.body)return null;
    let el=root();if(el)return el;
    el=doc.createElement("section");el.id=RECOVERY_REVIEW_ROOT;el.setAttribute("role","region");
    el.setAttribute("aria-label","Formation editorial recovery review");
    el.addEventListener("click",e=>{
      const b=e.target?.closest?.("button");if(!b)return;
      if(b.hasAttribute("data-rr-back")){e.preventDefault?.();if(state.view==="detail"){state.view=state.returnTo;state.id=null;paint();}
        else if(state.view==="dossier-detail"){state.view="list";state.dossierId=null;paint();}else close();return;}
      if(b.hasAttribute("data-rr-home")){e.preventDefault?.();close();win?.AO_APP_SHELL_V1?.navigate?.("home");return;}
      if(b.dataset.rrMode){e.preventDefault?.();state.mode=b.dataset.rrMode;state.view="list";state.query="";paint();return;}
      if(b.dataset.rrDossier){e.preventDefault?.();state.dossierId=b.dataset.rrDossier;state.view="dossier-detail";paint();root()?.scrollTo?.(0,0);return;}
      if(b.dataset.rrId){e.preventDefault?.();state.returnTo=state.view;state.id=b.dataset.rrId;state.view="detail";paint();root()?.scrollTo?.(0,0);}
    });
    el.addEventListener("input",e=>{if(e.target?.hasAttribute?.("data-rr-search")){state.query=e.target.value;const n=root()?.querySelector?.("[data-rr-list]");if(n)n.innerHTML=state.mode==="dossiers"?dossierRows():listRows();}});
    el.addEventListener("change",e=>{
      if(e.target?.hasAttribute?.("data-rr-bank"))state.bank=e.target.value;
      else if(e.target?.hasAttribute?.("data-rr-corpus"))state.corpus=e.target.value;
      else return;
      const n=root()?.querySelector?.("[data-rr-list]");
      if(n)n.innerHTML=state.mode==="dossiers"?dossierRows():listRows();
    });
    el.addEventListener("keydown",e=>{if(e.key==="Escape"){e.preventDefault?.();
      if(state.view==="detail"){state.view=state.returnTo;state.id=null;paint();}
      else if(state.view==="dossier-detail"){state.view="list";state.dossierId=null;paint();}
      else close();}});
    doc.body.append(el);return el;
  }
  function paint(){
    const el=ensure();if(!el||!state.open)return false;
    el.lang=isFr(win)?"fr":"en";
    const inner=state.loading?'<p class="rrMuted">Loading original source files…</p>':
      state.error?'<p class="rrWarning">'+esc(state.error)+'</p>':state.view==="list"?listView():state.view==="dossier-detail"?dossierDetail():detailView();
    el.innerHTML='<style>'+css+'</style><header class="rrTop"><button type="button" data-rr-back aria-label="Back">‹</button>'+
      '<strong>'+esc(pick(win,"Source review · Unpublished","Examen des sources · Non publié"))+'</strong>'+
      '<button type="button" data-rr-home aria-label="Home">⌂</button></header><main>'+inner+'</main>';
    return true;
  }
  async function open(){
    if(!ensure())return false;
    state.open=true;state.loading=true;state.error="";paint();
    try {
      if(!win?.fetch)throw new Error("Fetch unavailable.");
      const docs=await Promise.all(PACKS.map(async([label,file])=>{
        const response=await win.fetch(new URL("data/learn/"+file,win.document.baseURI));
        if(!response.ok)throw new Error(file+" ("+response.status+")");
        return {label,doc:await response.json()};
      }));
      state.rows=[...buildRecoveryReviewRows(docs),...buildContemporaryDraftRows(docs)];
      const coverage=buildRecoveryDossierCoverage(state.rows,docs);
      state.dossiers=coverage.dossiers;
      state.external=coverage.external;
      state.questionSources=docs.find(x=>x.label==="BAQ questions")?.doc?.source_registry||[];
      state.error="";
    }catch(error){
      state.error="Research files unavailable: "+String(error?.message||error);
    }finally{state.loading=false;paint();}
    return !state.error;
  }
  function close(){
    const el=root();try{el?.querySelector?.(":focus")?.blur?.();}catch{}
    el?.remove?.();state.open=false;state.view="list";state.id=null;state.dossierId=null;return true;
  }
  function status(){return Object.freeze({version:RECOVERY_REVIEW_VERSION,open:state.open,
    researchRecords:state.rows.length,newContemporaryDrafts:state.rows.filter(x=>x.bank==="Contemporary III · drafted").length,canonicalDossiers:state.dossiers.length,coveredDossiers:state.dossiers.filter(d=>d.research.length).length,externalRecords:state.external.length,loading:state.loading,error:state.error,public:false});}
  return Object.freeze({open,close,paint,status});
}
export function installFormationRecoveryReview(win=globalThis) {
  if(!win?.AO_FORMATION_RECOVERY_REVIEW_V1)win.AO_FORMATION_RECOVERY_REVIEW_V1=createFormationRecoveryReview(win);
  return win.AO_FORMATION_RECOVERY_REVIEW_V1;
}
