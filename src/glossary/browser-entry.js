
const VERSION="glossary-runtime-v1";
const ROUTE_ID="learn.glossary";
const ROOT_ID="ao-glossary-root";
const NAV_URL=new URL("../../data/glossary/glossary-navigation-sot.v1.json",import.meta.url);
const CONCEPT_URLS=[
  new URL("../../data/glossary/concepts-001-150.v1.json",import.meta.url),
  new URL("../../data/glossary/concepts-151-300.v1.json",import.meta.url),
  new URL("../../data/glossary/concepts-301-450.v1.json",import.meta.url)
];
const SOURCE_URL=new URL("../../data/glossary/source-registry.v1.json",import.meta.url);
const LEXEME_URL=new URL("../../data/glossary/lexemes.v1.json",import.meta.url);
const PHRASE_URL=new URL("../../data/glossary/phrases.v1.json",import.meta.url);

export const GLOSSARY_ROUTE_ID=ROUTE_ID;
export const GLOSSARY_DEFINITION=Object.freeze({
  id:ROUTE_ID,type:"reference",domain:"learn",category:"formation-reference",
  title:"Catholic Glossary & Latin Reference"
});

const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const norm=v=>String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replaceAll("æ","ae").replaceAll("œ","oe").toLowerCase().trim();
const appState=win=>win?.AO_RUNTIME_V8?.store?.getState?.()??{};
const isFr=win=>appState(win)?.language==="fr";
const L=(win,en,fr)=>isFr(win)?fr:en;
const root=win=>win?.document?.getElementById?.(ROOT_ID)??null;

async function fetchJson(win,url){
  const f=win?.fetch?.bind(win)||globalThis.fetch?.bind(globalThis);
  if(!f)throw new Error("FETCH_UNAVAILABLE");
  const r=await f(url);
  if(!r?.ok)throw new Error("HTTP_"+String(r?.status||"ERR"));
  return r.json();
}

function css(){
  return [
    "#"+ROOT_ID+"{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14955;background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));overflow:auto;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}",
    "#"+ROOT_ID+" *{box-sizing:border-box}#"+ROOT_ID+"[hidden]{display:none!important}",
    ".aoGlossTop{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:9px;align-items:center;padding:calc(10px + var(--safe-top,0px)) 14px 10px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 94%,transparent);backdrop-filter:blur(16px);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.12)))}",
    ".aoGlossTop button{width:44px;height:44px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:999px;background:var(--surface-1,#101821);color:inherit;font-size:18px}",
    ".aoGlossTopTitle{text-align:center;min-width:0}.aoGlossTopTitle small{display:block;color:var(--muted,#9ba5b1);font:.61rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.12em}.aoGlossTopTitle strong{display:block;margin-top:3px;font:600 1rem/1.2 var(--font-display,Georgia,serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".aoGlossWrap{width:min(840px,100%);margin:0 auto;padding:18px 14px 44px}.aoGlossHero{padding:10px 0 18px}.aoGlossHero h1{margin:5px 0 8px;font:500 clamp(2rem,7vw,3rem)/1.04 var(--font-display,Georgia,serif)}.aoGlossHero p{margin:0;color:var(--muted,#9ba5b1);line-height:1.5}.aoGlossKicker{color:var(--liturgical,#c9ad78);font:.65rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.13em;text-transform:uppercase}",
    ".aoGlossSearch{margin:4px 0 18px}.aoGlossSearch input{width:100%;height:48px;border:1px solid var(--border,rgba(255,255,255,.16));border-radius:12px;background:var(--surface-1,#101821);color:inherit;padding:0 14px;font:inherit}.aoGlossSearch input:focus{outline:2px solid var(--liturgical,#c9ad78)}.aoGlossHint{margin:6px 2px 0;color:var(--muted,#9ba5b1);font-size:.72rem}",
    ".aoGlossGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.aoGlossCard,.aoGlossTerm{width:100%;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:14px;background:var(--surface-1,#101821);color:inherit;text-align:left}.aoGlossCard{min-height:108px;padding:14px}.aoGlossCard small,.aoGlossTerm small{display:block;color:var(--liturgical,#c9ad78);font:.62rem/1.2 var(--font-display,Georgia,serif);letter-spacing:.07em;text-transform:uppercase}.aoGlossCard strong{display:block;margin-top:7px;font:600 1rem/1.25 var(--font-display,Georgia,serif)}.aoGlossCard p{margin:6px 0 0;color:var(--muted,#9ba5b1);font-size:.78rem;line-height:1.35}",
    ".aoGlossSections,.aoGlossTerms{display:grid;gap:8px}.aoGlossSection{width:100%;padding:14px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.12));background:transparent;color:inherit;text-align:left}.aoGlossSection strong{display:block;font:600 1rem/1.25 var(--font-display,Georgia,serif)}.aoGlossSection span{display:block;margin-top:5px;color:var(--muted,#9ba5b1);font-size:.78rem}.aoGlossTerm{padding:12px 13px}.aoGlossTerm strong{display:block;margin-top:4px;font:600 .98rem/1.25 var(--font-display,Georgia,serif)}.aoGlossTerm em{display:block;margin-top:4px;color:var(--muted,#9ba5b1);font-style:normal;font-size:.78rem}",
    ".aoGlossDetail{position:fixed;inset:0;z-index:14980;background:rgba(0,0,0,.56);display:flex;align-items:flex-end;justify-content:center}.aoGlossDetailCard{width:min(720px,100%);max-height:84vh;overflow:auto;border:1px solid var(--border,rgba(255,255,255,.15));border-radius:20px 20px 0 0;background:var(--ao-bg-canvas,var(--bg,#080c12));padding:18px 16px 32px}.aoGlossDetailHead{display:flex;justify-content:space-between;gap:12px}.aoGlossDetailHead h2{margin:5px 0 2px;font:500 1.8rem/1.1 var(--font-display,Georgia,serif)}.aoGlossDetailHead button{width:40px;height:40px;border:1px solid var(--border,rgba(255,255,255,.15));border-radius:999px;background:var(--surface-1,#101821);color:inherit}.aoGlossLatin{color:var(--liturgical,#c9ad78);font-style:italic}.aoGlossMeta{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}.aoGlossBadge{padding:4px 7px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:999px;color:var(--muted,#9ba5b1);font-size:.67rem}.aoGlossDefinition{margin:16px 0 0;font:600 1.02rem/1.5 var(--ao-font-body,var(--font-body,Georgia,serif))}.aoGlossExplanation{margin:10px 0 0;color:var(--muted,#b5bdc6);font-size:.9rem;line-height:1.58}.aoGlossPending{margin:14px 0;padding:12px;border-left:2px solid var(--liturgical,#c9ad78);color:var(--muted,#9ba5b1);line-height:1.45}.aoGlossSources{margin-top:18px;border-top:1px solid var(--border,rgba(255,255,255,.12));padding-top:14px}.aoGlossSources a{display:block;padding:8px 0;color:var(--liturgical,#c9ad78);text-decoration:none;border-bottom:1px solid rgba(255,255,255,.06);font-size:.8rem}",
    ".aoGlossEmpty{padding:22px 0;color:var(--muted,#9ba5b1);text-align:center}@media(max-width:560px){.aoGlossGrid{grid-template-columns:1fr}.aoGlossWrap{padding-left:12px;padding-right:12px}}"
  ].join("");
}

function categoryCount(c){return c.sections.reduce((n,s)=>n+s.entry_numbers.length,0)}
function categoryById(data,id){return data.nav.categories.find(x=>x.id===id)||null}
function sectionById(c,id){return c?.sections?.find(x=>x.id===id)||null}

export function createGlossaryRuntime(win=globalThis){
  const state={open:false,loaded:false,loading:false,error:"",view:"categories",categoryId:null,sectionId:null,latinStage:null,query:"",detailId:null,detailType:"concept",contextIds:[],origin:"learn",data:null,unsub:null,lastLanguage:null};

  async function load(){
    if(state.loaded)return state.data;
    state.loading=true;
    try{
      const all=await Promise.all([fetchJson(win,NAV_URL),...CONCEPT_URLS.map(u=>fetchJson(win,u)),fetchJson(win,SOURCE_URL),fetchJson(win,LEXEME_URL),fetchJson(win,PHRASE_URL)]);
      const nav=all[0],sourcesDoc=all[4],lexemeDoc=all[5],phraseDoc=all[6],entries=all.slice(1,4).flatMap(x=>x.entries);
      const lexemes=lexemeDoc.items||[],phrases=phraseDoc.items||[];
      state.data={
        nav,entries,lexemes,phrases,
        byId:new Map(entries.map(x=>[x.id,x])),
        lexemeById:new Map(lexemes.map(x=>[x.id,x])),
        phraseById:new Map(phrases.map(x=>[x.id,x])),
        sources:new Map(sourcesDoc.sources.map(x=>[x.id,x]))
      };
      state.loaded=true;state.error="";
    }catch(e){state.error=String(e?.message||e)}
    finally{state.loading=false}
    return state.data;
  }

  function ensureRoot(){
    const d=win?.document;if(!d?.body)return null;
    let n=root(win);if(n)return n;
    n=d.createElement("section");n.id=ROOT_ID;n.dataset.aoGlossaryOwner=VERSION;n.setAttribute("role","region");n.setAttribute("aria-label","Catholic Glossary");
    n.addEventListener("click",onClick);n.addEventListener("input",onInput);n.addEventListener("keydown",onKey);
    d.body.append(n);return n;
  }

  function attach(){
    if(state.unsub)return;
    const store=win?.AO_RUNTIME_V8?.store;if(typeof store?.subscribe!=="function")return;
    state.lastLanguage=isFr(win)?"fr":"en";
    state.unsub=store.subscribe(()=>{const x=isFr(win)?"fr":"en";if(x!==state.lastLanguage){state.lastLanguage=x;if(state.open)queueMicrotask(render)}});
  }

  function title(){
    if(!state.data)return L(win,"Glossary","Glossaire");
    if(state.view==="context")return L(win,"Terms used here","Termes utilisés ici");
    if(state.view==="lexemes")return L(win,"Core Latin Lexicon","Lexique latin essentiel");
    if(state.view==="lexemeStage")return L(win,"Latin · Stage "+state.latinStage,"Latin · Étape "+state.latinStage);
    if(state.view==="phrases")return L(win,"Liturgical Phrasebook","Recueil de formules liturgiques");
    if(state.view==="section"){const c=categoryById(state.data,state.categoryId),s=sectionById(c,state.sectionId);return isFr(win)?s?.label?.fr:s?.label?.en}
    if(state.view==="category"){const c=categoryById(state.data,state.categoryId);return isFr(win)?c?.label?.fr:c?.label?.en}
    return L(win,"Glossary","Glossaire");
  }

  function top(){
    return '<header class="aoGlossTop"><button type="button" data-gloss-back aria-label="'+esc(L(win,"Back","Retour"))+'">←</button><div class="aoGlossTopTitle"><small>AD ORIENTEM</small><strong>'+esc(title()||L(win,"Glossary","Glossaire"))+'</strong></div><span></span></header>';
  }

  function searchBox(){
    return '<div class="aoGlossSearch"><input type="search" data-gloss-search value="'+esc(state.query)+'" placeholder="'+esc(L(win,"Search English, French or Latin","Rechercher en anglais, français ou latin"))+'" autocomplete="off"><div class="aoGlossHint">'+esc(L(win,"Search checks English, French, Latin and canonical IDs.","La recherche vérifie l’anglais, le français, le latin et les identifiants canoniques."))+'</div></div>';
  }

  function termButton(e){
    return '<button class="aoGlossTerm" type="button" data-gloss-entry="'+esc(e.id)+'"><small>'+esc(e.id+" · "+e.temporal_layer)+'</small><strong>'+esc(isFr(win)?e.labels.fr:e.labels.en)+'</strong>'+(e.labels.la?'<em>'+esc(e.labels.la)+'</em>':'')+'</button>';
  }

  function searchResults(){
    const q=norm(state.query);
    const rows=q?state.data.entries.filter(e=>norm([e.id,e.labels.en,e.labels.fr,e.labels.la,e.short_definition?.en,e.short_definition?.fr,e.explanation?.en,e.explanation?.fr].join(" ")).includes(q)).slice(0,80):[];
    return '<div class="aoGlossTerms">'+(rows.length?rows.map(termButton).join(""):'<div class="aoGlossEmpty">'+esc(L(win,"No matching term.","Aucun terme correspondant."))+'</div>')+'</div>';
  }

  function categoriesView(){
    const cards=state.data.nav.categories.map(c=>'<button class="aoGlossCard" type="button" data-gloss-category="'+esc(c.id)+'"><small>'+categoryCount(c)+' '+esc(L(win,"terms","termes"))+'</small><strong>'+esc(isFr(win)?c.label.fr:c.label.en)+'</strong><p>'+esc(c.sections.map(s=>isFr(win)?s.label.fr:s.label.en).join(" · "))+'</p></button>').join("");
    return top()+'<main class="aoGlossWrap"><section class="aoGlossHero"><div class="aoGlossKicker">'+esc(L(win,"Reference","Référence"))+'</div><h1>'+esc(L(win,"Catholic Glossary & Latin Reference","Glossaire catholique & référence latine"))+'</h1><p>'+esc(L(win,"Browse by subject or search directly. Doctrine, 1962 usage, current law, history and Latin remain distinct.","Parcourez par sujet ou recherchez directement. Doctrine, usage de 1962, droit actuel, histoire et latin restent distincts."))+'</p></section>'+searchBox()+(state.query?searchResults():'<div class="aoGlossGrid">'+cards+'</div>')+'</main>';
  }

  function categoryView(){
    const c=categoryById(state.data,state.categoryId);if(!c)return categoriesView();
    const rows=c.sections.map(s=>'<button class="aoGlossSection" type="button" data-gloss-section="'+esc(s.id)+'"><strong>'+esc(isFr(win)?s.label.fr:s.label.en)+'</strong><span>'+s.entry_numbers.length+' '+esc(L(win,"terms","termes"))+'</span></button>').join("");
    return top()+'<main class="aoGlossWrap">'+searchBox()+(state.query?searchResults():'<div class="aoGlossSections">'+rows+'</div>')+'</main>';
  }

  function sectionView(){
    const c=categoryById(state.data,state.categoryId),s=sectionById(c,state.sectionId);if(!s)return categoryView();
    const rows=s.entry_numbers.map(n=>state.data.byId.get("G"+String(n).padStart(3,"0"))).filter(Boolean);
    return top()+'<main class="aoGlossWrap">'+searchBox()+(state.query?searchResults():'<div class="aoGlossTerms">'+rows.map(termButton).join("")+'</div>')+'</main>';
  }

  function contextView(){
    const rows=state.contextIds.map(id=>state.data.byId.get(id)).filter(Boolean);
    return top()+'<main class="aoGlossWrap"><div class="aoGlossKicker">'+esc(L(win,"Context reference","Référence contextuelle"))+'</div><p class="aoGlossHint">'+esc(L(win,"These are the glossary terms linked from the screen you were using.","Voici les termes du glossaire liés à l’écran que vous consultiez."))+'</p><div class="aoGlossTerms">'+rows.map(termButton).join("")+'</div></main>';
  }

  function detail(){
    const e=state.data?.byId?.get(state.detailId);if(!e)return "";
    const c=categoryById(state.data,e.primary_category),s=sectionById(c,e.browse_section);
    const links=(e.source_ids||[]).map(id=>state.data.sources.get(id)).filter(Boolean);
    const sourceHtml=links.map(x=>'<a href="'+esc(x.canonical_url)+'" target="_blank" rel="noopener noreferrer">'+esc(x.title||x.id)+'</a>').join("");
    const shortDef=isFr(win)?e.short_definition?.fr:e.short_definition?.en;
    const explanation=isFr(win)?e.explanation?.fr:e.explanation?.en;
    const body=shortDef&&explanation
      ? '<div class="aoGlossDefinition">'+esc(shortDef)+'</div><div class="aoGlossExplanation">'+esc(explanation)+'</div>'
      : '<div class="aoGlossPending">'+esc(L(win,"Canonical terminology and source ownership are locked. Sourced explanatory text is not yet available for this entry.","La terminologie canonique et les sources sont verrouillées. Le texte explicatif sourcé n’est pas encore disponible pour cette entrée."))+'</div>';
    return '<div class="aoGlossDetail" data-gloss-overlay><article class="aoGlossDetailCard" role="dialog" aria-modal="true"><div class="aoGlossDetailHead"><div><div class="aoGlossKicker">'+esc(e.id)+'</div><h2>'+esc(isFr(win)?e.labels.fr:e.labels.en)+'</h2>'+(e.labels.la?'<div class="aoGlossLatin">'+esc(e.labels.la)+'</div>':'')+'</div><button type="button" data-gloss-close aria-label="'+esc(L(win,"Close","Fermer"))+'">×</button></div><div class="aoGlossMeta"><span class="aoGlossBadge">'+esc(e.temporal_layer)+'</span><span class="aoGlossBadge">'+esc(isFr(win)?c?.label?.fr:c?.label?.en)+'</span><span class="aoGlossBadge">'+esc(isFr(win)?s?.label?.fr:s?.label?.en)+'</span></div>'+body+'<section class="aoGlossSources"><h3>'+esc(L(win,"Sources","Sources"))+'</h3>'+sourceHtml+'</section></article></div>';
  }

  function render(){
    const n=ensureRoot();if(!n||!state.open)return false;
    let body;
    if(state.loading)body=top()+'<main class="aoGlossWrap"><div class="aoGlossEmpty">'+esc(L(win,"Loading glossary…","Chargement du glossaire…"))+'</div></main>';
    else if(state.error)body=top()+'<main class="aoGlossWrap"><div class="aoGlossEmpty">'+esc(state.error)+'</div></main>';
    else body=state.view==="context"?contextView():state.view==="section"?sectionView():state.view==="category"?categoryView():categoriesView();
    n.innerHTML="<style>"+css()+"</style>"+body+(state.detailId?detail():"");
    n.hidden=false;n.removeAttribute("aria-hidden");return true;
  }

  function onInput(e){
    const input=e.target?.closest?.("[data-gloss-search]");if(!input)return;
    state.query=input.value||"";render();
    const x=root(win)?.querySelector?.("[data-gloss-search]");
    if(x){const p=x.value.length;queueMicrotask(()=>{try{x.focus({preventScroll:true});x.setSelectionRange(p,p)}catch{}})}
  }

  function onClick(e){
    const t=e.target?.closest?.("button");if(!t)return;
    if(t.dataset.glossCategory){state.categoryId=t.dataset.glossCategory;state.view="category";state.query="";render();root(win)?.scrollTo?.(0,0);return}
    if(t.dataset.glossSection){state.sectionId=t.dataset.glossSection;state.view="section";state.query="";render();root(win)?.scrollTo?.(0,0);return}
    if(t.dataset.glossEntry){state.detailId=t.dataset.glossEntry;render();return}
    if(t.matches("[data-gloss-close]")){state.detailId=null;render();return}
    if(t.matches("[data-gloss-back]")){back();return}
  }

  function onKey(e){if(e.key!=="Escape")return;if(state.detailId){state.detailId=null;render()}else back()}

  function back(){
    if(state.view==="context"){close(false);return true}
    if(state.view==="section"){state.view="category";state.sectionId=null;state.query="";render();return true}
    if(state.view==="category"){state.view="categories";state.categoryId=null;state.query="";render();return true}
    close(state.origin==="learn");return true;
  }

  async function open(opts={}){
    state.open=true;state.view="categories";state.categoryId=null;state.sectionId=null;state.latinStage=null;state.query=String(opts.query||"");state.detailId=null;state.detailType="concept";state.contextIds=[];state.origin=String(opts.origin||"learn");
    ensureRoot();attach();state.loading=!state.loaded;render();
    await load();state.loading=false;
    if(opts.categoryId&&categoryById(state.data,opts.categoryId)){state.categoryId=opts.categoryId;state.view="category"}
    if(opts.entryId&&state.data?.byId?.has(opts.entryId))state.detailId=opts.entryId;
    render();return true;
  }

  async function openEntry(id){return open({entryId:String(id||"")})}
  async function openTerms(ids=[],opts={}){
    await open({...opts,origin:"context"});
    const rows=[...new Set(ids.map(String))].map(id=>state.data.byId.get(id)).filter(Boolean);
    if(rows.length===1){state.detailId=rows[0].id;render();return true}
    if(rows.length){state.contextIds=rows.map(x=>x.id);state.view="context";state.query="";render();return true}
    return false;
  }

  function search(q){
    const z=norm(q);if(!state.loaded||!z)return [];
    return state.data.entries.filter(e=>norm([e.id,e.labels.en,e.labels.fr,e.labels.la,e.short_definition?.en,e.short_definition?.fr,e.explanation?.en,e.explanation?.fr].join(" ")).includes(z));
  }

  function close(returnToLearn=false){
    const n=root(win);try{n?.querySelector?.(":focus")?.blur?.()}catch{}n?.remove?.();
    state.open=false;state.detailId=null;state.query="";state.contextIds=[];
    if(returnToLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());
    return true;
  }

  function status(){return Object.freeze({version:VERSION,installed:true,open:Boolean(state.open&&root(win)),loaded:state.loaded,entries:state.data?.entries?.length||0,lexemes:state.data?.lexemes?.length||0,phrases:state.data?.phrases?.length||0,categories:state.data?.nav?.categories?.length||0,view:state.view,detailId:state.detailId,detailType:state.detailType})}
  return Object.freeze({version:VERSION,open,openEntry,openTerms,search,close,back,render,status});
}

export function ensureGlossaryRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoGlossaryV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_GLOSSARY_V1||createGlossaryRuntime(win);win.AO_GLOSSARY_V1=runtime;
  const wrapper={...base,__aoGlossaryV1:true,
    get(id){return id===ROUTE_ID?GLOSSARY_DEFINITION:base.get?.(id)||null},
    resolve(id){if(id===ROUTE_ID)return {ok:true,input:id,id,defaults:{},chain:[id],definition:GLOSSARY_DEFINITION};return base.resolve?.(id)},
    async open(id,opts={}){if(id===ROUTE_ID)return {ok:await runtime.open({...opts,origin:"learn"})!==false,input:String(id),canonicalId:id,type:"reference",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts)},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(x=>x?.id!==ROUTE_ID);if((!filter.type||filter.type==="reference")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(GLOSSARY_DEFINITION);return prior}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installGlossaryModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_GLOSSARY_V1)win.AO_GLOSSARY_V1=createGlossaryRuntime(win);
  ensureGlossaryRegistry(win);
  return win.AO_GLOSSARY_V1;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installGlossaryModule(window);
