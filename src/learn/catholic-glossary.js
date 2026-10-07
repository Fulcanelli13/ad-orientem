import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

export const CATHOLIC_GLOSSARY_VERSION="catholic-glossary-v1";
export const CATHOLIC_GLOSSARY_ROUTE="learn.glossary";
export const CATHOLIC_GLOSSARY_ROOT_ID="ao-catholic-glossary-root";

const SALVAGE_URL=new URL("../../data/reference/catholic-glossary-catholic-life-salvage.v1.json",import.meta.url);
const CAMPION_URL=new URL("../../data/reference/catholic-glossary-campion.v1.json",import.meta.url);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const stateOf=win=>win?.AO_RUNTIME_V8?.store?.getState?.()??{};
const isFr=win=>stateOf(win)?.language==="fr"||String(win?.document?.documentElement?.lang||"").toLowerCase().startsWith("fr");
const L=(win,en,fr)=>isFr(win)?(fr||en):en;
const pick=(win,value)=>typeof value==="string"?value:String(isFr(win)?(value?.fr??value?.en??""):(value?.en??value?.fr??""));
const uiIcon=id=>{const url=resolveCanonicalAssetUrl(id);return url?'<span aria-hidden="true" style="display:inline-block;width:18px;height:18px;background:currentColor;-webkit-mask:url(\''+esc(url)+'\') center/contain no-repeat;mask:url(\''+esc(url)+'\') center/contain no-repeat"></span>':"";};

function css(){return [
"#"+CATHOLIC_GLOSSARY_ROOT_ID+"{position:fixed;inset:0 0 calc(var(--ao-global-ribbon-h,68px) + var(--safe-bottom,0px)) 0;z-index:14973;background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#eee9df));overflow:auto;font-family:var(--ao-font-body,var(--font-body,Georgia,serif))}",
"#"+CATHOLIC_GLOSSARY_ROOT_ID+" *{box-sizing:border-box}.aoGTop{position:sticky;top:0;z-index:4;display:grid;grid-template-columns:42px 1fr 42px;gap:8px;align-items:center;padding:11px 14px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 94%,transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--border,rgba(255,255,255,.12))}.aoGTop button{width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:10px;background:var(--surface-1,#101821);color:inherit}.aoGTop div{text-align:center}.aoGTop small{display:block;color:var(--liturgical,#c9ad78);font:.63rem/1.2 var(--ao-font-display,Georgia,serif);letter-spacing:.12em}.aoGTop strong{display:block;font:600 1rem/1.2 var(--ao-font-display,Georgia,serif)}",
".aoGWrap{width:min(850px,100%);margin:0 auto;padding:18px 15px 44px}.aoGIntro{color:var(--muted,#9ba5b1);line-height:1.5;margin:0 0 13px}.aoGSearch{width:100%;height:44px;padding:0 12px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:10px;background:var(--surface-1,#101821);color:inherit;font:inherit;outline:none}.aoGSearch:focus{border-color:var(--liturgical,#c9ad78)}.aoGMeta{margin:9px 0 14px;color:var(--muted,#9ba5b1);font-size:.74rem}",
".aoGEntry{padding:14px 0;border-top:1px solid var(--border,rgba(255,255,255,.11))}.aoGEntry h2{margin:0 0 4px;font:600 1.05rem/1.2 var(--ao-font-display,Georgia,serif)}.aoGLatin{color:var(--liturgical,#c9ad78);font-style:italic;font-size:.8rem}.aoGCat{display:inline-block;margin:0 0 7px;color:var(--muted,#9ba5b1);font:.64rem/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase}.aoGEntry p{margin:4px 0;line-height:1.5}.aoGSources{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}.aoGSources a{display:inline-flex;padding:5px 8px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:999px;color:var(--liturgical,#c9ad78);font:.66rem/1.2 var(--ao-font-ui,system-ui,sans-serif);text-decoration:none}.aoGEmpty{padding:24px 0;color:var(--muted,#9ba5b1)}"
].join("");}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  return response.json();
}
async function loadData(fetchImpl=globalThis.fetch){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const [salvage,campion]=await Promise.all([
    readJson(fetchImpl,SALVAGE_URL,"glossary salvage"),
    readJson(fetchImpl,CAMPION_URL,"Campion glossary")
  ]);
  if(salvage?.status!=="CANONICAL_REFERENCE_ANNEX"||campion?.schema!=="ao-catholic-glossary-campion-v1")throw new Error("Invalid Catholic glossary data");
  return {salvage,campion};
}
function sourceMap(data){
  const all=[...(data?.salvage?.sources??[]),...(data?.campion?.sources??[])];
  return Object.fromEntries(all.map(s=>[s.source_id??s.id,s]));
}
function entries(data){
  const campion=(data?.campion?.entries??[]).map(e=>({
    id:"CAMPION:"+e.id,
    category:e.category,
    term:e.term,
    definition:e.definition,
    latin:e.term?.latin??"",
    sourceIds:e.sources??[],
    campionPages:e.campion_pages??[]
  }));
  const salvage=Object.entries(data?.salvage?.domains??{}).flatMap(([domain,claims])=>(claims??[]).map(claim=>({
    id:"SALVAGE:"+claim.claim_id,
    category:domain.replace("REFERENCE.CATHOLIC_GLOSSARY.","").replaceAll("_"," "),
    term:{en:claim.stage_title,fr:claim.stage_title},
    definition:{en:claim.text,fr:claim.text},
    latin:"",
    sourceIds:claim.source_ids??[],
    campionPages:[]
  })));
  return [...campion,...salvage];
}
function top(win){return '<style data-ao-glossary-style>'+css()+'</style><header class="aoGTop"><button type="button" data-ao-g-back aria-label="'+esc(L(win,"Back","Retour"))+'">'+uiIcon("ao-ui-back")+'</button><div><small>REFERENCE</small><strong>'+esc(L(win,"Catholic Glossary","Glossaire catholique"))+'</strong></div><button type="button" data-ao-g-close aria-label="'+esc(L(win,"Close","Fermer"))+'">'+uiIcon("ao-ui-close")+'</button></header>';}

export function createCatholicGlossaryRuntime(win=globalThis,{fetchImpl=globalThis.fetch}={}){
  const state={data:null,query:"",loading:null,returnFocus:null};
  const root=()=>win?.document?.getElementById?.(CATHOLIC_GLOSSARY_ROOT_ID)??null;
  async function ensureData(){if(state.data)return state.data;if(!state.loading)state.loading=loadData(fetchImpl).then(d=>{state.data=d;return d}).finally(()=>{state.loading=null});return state.loading;}
  function ensureRoot(){
    const doc=win?.document;if(!doc?.body)return null;
    let node=root();if(node)return node;
    node=doc.createElement("section");node.id=CATHOLIC_GLOSSARY_ROOT_ID;node.dataset.aoCatholicGlossaryOwner=CATHOLIC_GLOSSARY_VERSION;node.setAttribute("role","region");node.setAttribute("aria-label","Catholic Glossary");
    node.addEventListener("click",event=>{const b=event.target?.closest?.("button");if(!b)return;if(b.matches("[data-ao-g-close],[data-ao-g-back]")){event.preventDefault();close(true);}});
    node.addEventListener("input",event=>{if(event.target?.matches?.("[data-ao-g-search]")){state.query=String(event.target.value??"");renderResults(node);}});
    doc.body.append(node);return node;
  }
  function renderResults(node){
    if(!node||!state.data)return false;
    const sources=sourceMap(state.data),all=entries(state.data),q=state.query.trim().toLowerCase();
    const filtered=!q?all:all.filter(e=>[pick(win,e.term),pick(win,e.definition),e.latin,e.category].join(" ").toLowerCase().includes(q));
    const cards=filtered.map(e=>{
      const src=(e.sourceIds??[]).map(id=>sources[id]).filter(Boolean).map(s=>'<a href="'+esc(s.canonical_url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+' ↗</a>').join("");
      const pages=e.campionPages?.length?'Campion pp. '+e.campionPages.join(", "):"";
      return '<article class="aoGEntry"><span class="aoGCat">'+esc(e.category)+'</span><h2>'+esc(pick(win,e.term))+'</h2>'+(e.latin?'<div class="aoGLatin">'+esc(e.latin)+'</div>':"")+'<p>'+esc(pick(win,e.definition))+'</p>'+(pages?'<p class="aoGMeta">'+esc(pages)+'</p>':"")+'<div class="aoGSources">'+src+'</div></article>';
    }).join("");
    const meta=node.querySelector("[data-ao-g-meta]");if(meta)meta.textContent=filtered.length+" / "+all.length+" "+L(win,"entries","entrées");
    const results=node.querySelector("[data-ao-g-results]");if(results)results.innerHTML=cards||'<div class="aoGEmpty">'+esc(L(win,"No matching entry.","Aucune entrée correspondante."))+'</div>';
    return true;
  }
  function render(focusSearch=true){
    const node=ensureRoot();if(!node||!state.data)return false;
    node.innerHTML=top(win)+'<main class="aoGWrap"><p class="aoGIntro">'+esc(L(win,"Search liturgical terms, sacred objects, church furnishings and traditional Roman vocabulary. Each entry keeps its source links.","Recherchez les termes liturgiques, objets sacrés, éléments d’église et le vocabulaire romain traditionnel. Chaque entrée conserve ses liens de source."))+'</p><input class="aoGSearch" data-ao-g-search type="search" value="'+esc(state.query)+'" placeholder="'+esc(L(win,"Search the glossary…","Rechercher dans le glossaire…"))+'"><div class="aoGMeta" data-ao-g-meta></div><div data-ao-g-results></div></main>';
    renderResults(node);
    node.hidden=false;node.removeAttribute("aria-hidden");
    if(focusSearch)queueMicrotask(()=>{const input=node.querySelector("[data-ao-g-search]");input?.focus?.({preventScroll:true});if(input?.setSelectionRange){const n=input.value.length;input.setSelectionRange(n,n);}});
    return true;
  }
  async function open(opts={}){
    state.returnFocus=opts.trigger??win?.document?.activeElement??null;
    if(typeof opts.query==="string")state.query=opts.query;
    try{await ensureData()}catch(error){const node=ensureRoot();if(node)node.innerHTML=top(win)+'<main class="aoGWrap"><div class="aoGEmpty">'+esc(String(error?.message??error))+'</div></main>';return false;}
    win?.document?.body?.classList?.add?.("aoCatholicGlossaryOpen");return render(true);
  }
  function close(returnToLearn=false){const node=root();try{node?.querySelector?.(":focus")?.blur?.()}catch{}node?.remove?.();win?.document?.body?.classList?.remove?.("aoCatholicGlossaryOpen");if(returnToLearn)Promise.resolve().then(()=>win?.AO_LEARN_APP_V1?.open?.());else try{state.returnFocus?.focus?.({preventScroll:true})}catch{}state.returnFocus=null;return true;}
  function status(){return Object.freeze({version:CATHOLIC_GLOSSARY_VERSION,installed:true,open:Boolean(root()),query:state.query,entries:state.data?entries(state.data).length:0});}
  return Object.freeze({version:CATHOLIC_GLOSSARY_VERSION,open,close,render,status});
}

export function ensureCatholicGlossaryRegistry(win=globalThis){
  if(win?.AO_MODULES?.__aoCatholicGlossaryV1)return win.AO_MODULES;
  const base=win?.AO_MODULES;if(!base)return null;
  const runtime=win.AO_CATHOLIC_GLOSSARY_V1||createCatholicGlossaryRuntime(win);win.AO_CATHOLIC_GLOSSARY_V1=runtime;
  const definition=Object.freeze({id:CATHOLIC_GLOSSARY_ROUTE,type:"module",domain:"learn",category:"reference",title:"Catholic Glossary"});
  const wrapper={...base,__aoCatholicGlossaryV1:true,
    get(id){return id===CATHOLIC_GLOSSARY_ROUTE?definition:base.get?.(id)||null;},
    resolve(id){if(id===CATHOLIC_GLOSSARY_ROUTE)return {ok:true,input:id,id,defaults:{},chain:[id],definition};return base.resolve?.(id);},
    async open(id,opts={}){if(id===CATHOLIC_GLOSSARY_ROUTE)return {ok:await runtime.open(opts),input:String(id),canonicalId:id,type:"module",domain:"learn",options:opts,aliasChain:[id],error:null};return base.open?.(id,opts);},
    list(filter={}){const prior=[...(base.list?.(filter)||[])].filter(item=>item?.id!==CATHOLIC_GLOSSARY_ROUTE);if((!filter.type||filter.type==="module")&&(!filter.domain||String(filter.domain).toLowerCase()==="learn"))prior.push(definition);return prior;}
  };
  win.AO_MODULES=wrapper;win.AO_MODULE_REGISTRY_V36=wrapper;return wrapper;
}

export function installCatholicGlossaryModule(win=globalThis){
  if(!win)return false;
  if(!win.AO_CATHOLIC_GLOSSARY_V1)win.AO_CATHOLIC_GLOSSARY_V1=createCatholicGlossaryRuntime(win);
  ensureCatholicGlossaryRegistry(win);
  return win.AO_CATHOLIC_GLOSSARY_V1;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installCatholicGlossaryModule(window);
