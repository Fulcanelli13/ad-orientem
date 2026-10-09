
(()=>{'use strict';
const VERSION='36.0-canonical-module-registry';
const COLLECTION={
  prayerBook:'collection.traditional_prayer_book',
  baltimore:'collection.baltimore_1888',
  lasance:'collection.lasance_1911',
  piusX:'collection.pius_x_1912'
};
const DEFINITIONS={
  'today.calendar':{id:'today.calendar',type:'reference',domain:'today',category:'liturgical-context',title:'Calendar',action:'nav.calendar',contexts:['today','reference']},
  'today.saint':{id:'today.saint',type:'reference',domain:'today',category:'liturgical-context',title:'Saint of the Day',action:'nav.saint',contexts:['today','reference']},
  'today.gospel':{id:'today.gospel',type:'reference',domain:'today',category:'scripture',title:'Gospel',action:'scripture.gospel',contexts:['today','mass','learn']},

  'mass.current':{id:'mass.current',type:'module',domain:'mass',category:'today',title:'Today’s Mass',action:'nav.today-mass',contexts:['today','mass']},
  'mass.follow':{id:'mass.follow',type:'module',domain:'mass',category:'during',phase:'during',title:'Follow Mass',action:'mass.follow-safe',contexts:['today','mass']},
  'mass.change':{id:'mass.change',type:'module',domain:'mass',category:'today',title:'Change Mass',action:'celebration.change',contexts:['mass']},
  'mass.prepare':{id:'mass.prepare',type:'module',domain:'mass',category:'before',phase:'before',title:'Before Mass',action:'mass.prepare',contexts:['today','mass','programme.first_friday','pray-link'],methods:['standard',COLLECTION.baltimore]},
  'mass.intentions':{id:'mass.intentions',type:'module',domain:'mass',category:'before',phase:'before',title:'Mass Intentions',action:'trad.intentions',contexts:['mass','mass.prepare'],methods:[COLLECTION.baltimore]},
  'mass.communion_prepare':{id:'mass.communion_prepare',type:'module',domain:'mass',category:'before',phase:'before',title:'Preparation for Holy Communion',action:'mass.communion-prepare',contexts:['mass','mass.prepare'],methods:['standard',COLLECTION.lasance]},
  'mass.four_ends':{id:'mass.four_ends',type:'module',domain:'mass',category:'during',phase:'during',title:'The Four Ends of the Mass',action:'trad.four-ends',contexts:['mass','pray.adoration'],methods:[COLLECTION.lasance]},
  'mass.thanksgiving':{id:'mass.thanksgiving',type:'module',domain:'mass',category:'after',phase:'after',title:'Thanksgiving after Mass',action:'mass.thanksgiving',contexts:['today','mass','programme.first_friday','pray-link'],methods:['standard',COLLECTION.lasance]},
  'mass.leonine':{id:'mass.leonine',type:'module',domain:'mass',category:'after',phase:'after',title:'Leonine Prayers after Low Mass',action:'prayer.record',actionArg:'mass_devotion_leonine',contexts:['mass','pray-link'],sourceCollection:COLLECTION.prayerBook},

  'pray.library':{id:'pray.library',type:'module',domain:'pray',category:'library',title:'Prayer Library',action:'prayerbook.open',contexts:['pray','search'],sourceCollection:COLLECTION.prayerBook},
  'pray.rosary':{id:'pray.rosary',type:'module',domain:'pray',category:'marian',title:'Holy Rosary',action:'prayerbook.module',actionArg:'rosary',contexts:['pray','programme.first_saturday'],sourceCollection:COLLECTION.prayerBook},
  'pray.confession':{id:'pray.confession',type:'module',domain:'pray',category:'confession',title:'Confession',action:'pray.confession',contexts:['pray','programme.first_saturday'],methods:['standard',COLLECTION.lasance],sourceCollection:COLLECTION.prayerBook},
  'pray.angelus_regina':{id:'pray.angelus_regina',type:'module',domain:'pray',category:'daily-prayer',title:'Angelus / Regina Cæli',action:'prayerbook.module',actionArg:'angelus',contexts:['pray','today'],sourceCollection:COLLECTION.prayerBook},
  'pray.stations':{id:'pray.stations',type:'module',domain:'pray',category:'passion',title:'Stations of the Cross',action:'prayerbook.module',actionArg:'stations',contexts:['pray'],sourceCollection:COLLECTION.prayerBook},
  'pray.benediction':{id:'pray.benediction',type:'module',domain:'pray',category:'eucharistic',title:'Benediction',action:'prayerbook.module',actionArg:'benediction',contexts:['pray','pray.adoration'],sourceCollection:COLLECTION.prayerBook},
  'pray.adoration':{id:'pray.adoration',type:'module',domain:'pray',category:'eucharistic',title:'Adoration',action:'eucharistic.open',actionArg:'adoration',contexts:['pray','today-recommendation','programme.first_friday']},

  'programme.first_friday':{id:'programme.first_friday',type:'programme',domain:'pray',category:'sacred-heart-reparation',title:'First Friday',action:'eucharistic.open',actionArg:'first-friday',contexts:['pray','today-when-relevant'],uses:['mass.prepare','mass.follow','mass.thanksgiving','pray.adoration']},
  'programme.first_saturday':{id:'programme.first_saturday',type:'programme',domain:'pray',category:'marian',title:'First Saturday',action:'eucharistic.open',actionArg:'first-saturday',contexts:['pray','today-when-relevant'],uses:['pray.confession','mass.follow','pray.rosary','programme.first_saturday_meditation']},
  'programme.first_saturday_meditation':{id:'programme.first_saturday_meditation',type:'programme-step',domain:'pray',category:'marian',title:'First Saturday Meditation',action:'eucharistic.open',actionArg:'meditation',contexts:['programme.first_saturday']},

  'learn.mass':{id:'learn.mass',type:'module',domain:'learn',category:'liturgy',title:'Understand the Mass',action:'learn.mass',contexts:['learn']},
  'learn.catechism':{id:'learn.catechism',type:'module',domain:'learn',category:'catechism',title:'Traditional Catechism',action:'learn.catechism',contexts:['learn','learn.catechism.daily'],sourceCollection:COLLECTION.piusX},
  'learn.catechism.daily':{id:'learn.catechism.daily',type:'programme',domain:'learn',category:'catechism',title:'Daily Catechism',action:'learn.daily-catechism',contexts:['today','learn'],uses:['learn.catechism'],ownsCorpus:false},

  'utility.sources':{id:'utility.sources',type:'utility',domain:'utility',category:'about',title:'Sources',action:'nav.sources',contexts:['about']},
  'utility.settings':{id:'utility.settings',type:'utility',domain:'utility',category:'settings',title:'Settings',action:'nav.settings',contexts:['utility']},

  [COLLECTION.prayerBook]:{id:COLLECTION.prayerBook,type:'collection',domain:null,title:'Traditional Prayer Book',navigation:false,providesFor:['pray.library','pray.rosary','pray.confession','pray.angelus_regina','pray.stations','pray.benediction','mass.leonine']},
  [COLLECTION.baltimore]:{id:COLLECTION.baltimore,type:'collection',domain:null,title:'Baltimore Manual 1888',navigation:false,providesFor:['mass.prepare','mass.intentions']},
  [COLLECTION.lasance]:{id:COLLECTION.lasance,type:'collection',domain:null,title:'Lasance 1911',navigation:false,providesFor:['mass.communion_prepare','mass.four_ends','mass.thanksgiving','pray.confession']},
  [COLLECTION.piusX]:{id:COLLECTION.piusX,type:'collection',domain:null,title:'Catechism of St Pius X 1912',navigation:false,providesFor:['learn.catechism','learn.catechism.daily']}
};

const ALIASES={
  'today':'mass.current',
  'today-mass':'mass.current','mass-current':'mass.current','mass-details':'mass.current',
  'follow':'mass.follow','follow-mass':'mass.follow','mass-follow':'mass.follow',
  'change-mass':'mass.change','mass-change':'mass.change',
  'prepare':'mass.prepare','before-mass':'mass.prepare','mass-preparation':'mass.prepare',
  'MASS_PREP_BALT_1888':{id:'mass.prepare',defaults:{method:COLLECTION.baltimore}},
  'offer-this-mass':'mass.intentions','mass-intentions':'mass.intentions',
  'MASS_OFFER_BALT_1888':{id:'mass.intentions',defaults:{method:COLLECTION.baltimore}},
  'prepare-communion':'mass.communion_prepare','communion-preparation':'mass.communion_prepare',
  'COMM_PREP_LAS_1911':{id:'mass.communion_prepare',defaults:{method:COLLECTION.lasance}},
  'four-ends':'mass.four_ends','mass-four-ends':'mass.four_ends',
  'MASS_FOUR_ENDS_LAS_1911':{id:'mass.four_ends',defaults:{method:COLLECTION.lasance}},
  'thanks':'mass.thanksgiving','after-mass':'mass.thanksgiving','mass-thanksgiving':'mass.thanksgiving',
  'COMM_THANKS_LAS_1911':{id:'mass.thanksgiving',defaults:{method:COLLECTION.lasance}},
  'leonine':'mass.leonine','leonine-prayers':'mass.leonine','mass_devotion_leonine':'mass.leonine',

  'prayers':'pray.library','prayer-book':'pray.library','prayer-library':'pray.library',
  'rosary':'pray.rosary','holy-rosary':'pray.rosary',
  'confession':'pray.confession',
  'CONFESSION_LAS_1911':{id:'pray.confession',defaults:{method:COLLECTION.lasance}},
  'angelus':'pray.angelus_regina','regina-caeli':'pray.angelus_regina','angelus-regina':'pray.angelus_regina',
  'stations':'pray.stations','stations-of-the-cross':'pray.stations',
  'benediction':'pray.benediction',
  'adoration':'pray.adoration',
  'first-friday':'programme.first_friday','first-saturday':'programme.first_saturday','first-saturday-meditation':'programme.first_saturday_meditation',

  'learn':'learn.mass','understand-mass':'learn.mass',
  'catechism':'learn.catechism','traditional-catechism':'learn.catechism',
  'daily-catechism':'learn.catechism.daily','today.daily-catechism':'learn.catechism.daily',

  'calendar':'today.calendar','saint':'today.saint','saint-of-day':'today.saint','gospel':'today.gospel',
  'sources':'utility.sources','settings':'utility.settings'
};

const cssEscape=value=>globalThis.CSS?.escape?CSS.escape(String(value)):String(value).replace(/[^a-zA-Z0-9_-]/g,c=>`\\${c}`);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const runtime=()=>globalThis.AO_RUNTIME_V8||null;
const store=()=>runtime()?.store||null;
function dispatch(action){const s=store();if(!s?.dispatch)return false;s.dispatch(action);return true}
function nav(dest){return !!globalThis.AO_NAV_V25?.open?.(dest)}
async function prayerBookModule(id,returnContext=null){return !!globalThis.AOTraditionalPrayerBook?.openModule?.(id,returnContext?{returnContext}:{})}
async function prayerRecord(id,returnContext=null){return !!globalThis.AOTraditionalPrayerBook?.openPrayer?.(id,returnContext?{returnContext}:{})}
function traditional(id,returnContext=null){if(returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(returnContext);if(globalThis.AO_TRAD_V352?.open)return !!globalThis.AO_TRAD_V352.open(id);if(globalThis.AO_TRAD_V26?.open)return !!globalThis.AO_TRAD_V26.open(id);return false}
function eucharistic(id,returnContext=null){if(returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(returnContext);return !!globalThis.AO_EUCHARISTIC_V354?.open?.(id)}
function scriptureGospel(returnContext=null){const root=document.getElementById('app');if(!root)return false;if(returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(returnContext);const route=store()?.getState?.()?.route||'home';root.dispatchEvent(new CustomEvent('ao:open-scripture',{bubbles:true,detail:{kind:'gospel',returnRoute:route==='scripture'?'home':route}}));globalThis.AO_NAV_V362?.markCoreRoute?.('scripture');return true}
function navWithReturn(dest,returnContext=null){if(returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(returnContext);return nav(dest)}
function openLearn(api,options={},returnContext=null){if(!api?.open)return false;if(returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(returnContext);const clean={...options};delete clean.returnContext;api.open(clean);return true}

function normalizeAliasEntry(entry){return typeof entry==='string'?{id:entry,defaults:{}}:{id:entry?.id||'',defaults:{...(entry?.defaults||{})}}}
function resolve(input){let id=String(input||'').trim(),defaults={},chain=[],seen=new Set();if(!id)return {ok:false,input,id:'',defaults,chain,error:'EMPTY_ID'};for(let depth=0;depth<16;depth++){
  if(DEFINITIONS[id])return {ok:true,input:String(input),id,defaults,chain,definition:DEFINITIONS[id]};
  const raw=ALIASES[id];if(!raw)return {ok:false,input:String(input),id,defaults,chain,error:'UNKNOWN_ID'};
  if(seen.has(id))return {ok:false,input:String(input),id,defaults,chain,error:'ALIAS_CYCLE'};
  seen.add(id);chain.push(id);const a=normalizeAliasEntry(raw);defaults={...a.defaults,...defaults};id=a.id;
 }
 return {ok:false,input:String(input),id,defaults,chain,error:'ALIAS_DEPTH'}
}

async function run(def,options={}){
 const a=def.action,arg=def.actionArg;
 switch(a){
  case 'nav.calendar': return navWithReturn('calendar',options.returnContext);
  case 'nav.saint': return navWithReturn('saint',options.returnContext);
  case 'nav.sources': return navWithReturn('sources',options.returnContext);
  case 'nav.settings': return navWithReturn('settings',options.returnContext);
  case 'nav.today-mass': return navWithReturn('today-mass',options.returnContext)||!!globalThis.AO_CELEBRATION_API?.openPreflight?.();
  case 'scripture.gospel': return scriptureGospel(options.returnContext);
  case 'mass.follow-safe':
    if(options.returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(options.returnContext);
    return !!globalThis.AO_CELEBRATION_API?.openPreflight?.();
  case 'store.enter-live':
    /* Compatibility-only internal action. UI entry is fail-closed through mass.follow-safe. */
    return false;
  case 'celebration.change':
    if(options.returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(options.returnContext);
    return !!globalThis.AO_CELEBRATION_API?.openChangeMass?.();
  case 'mass.prepare':
    if(options.method===COLLECTION.baltimore)return traditional('MASS_PREP_BALT_1888',options.returnContext);
    if(options.returnContext)return !!globalThis.AO_NAV_V362?.openCore?.('prepare',options.returnContext);
    return dispatch({type:'enter-prepare'});
  case 'trad.intentions': return traditional('MASS_OFFER_BALT_1888',options.returnContext);
  case 'mass.communion-prepare':
    if(options.method===COLLECTION.lasance)return traditional('COMM_PREP_LAS_1911',options.returnContext);
    if(options.returnContext){if(!globalThis.AO_NAV_V362?.openCore?.('prepare',options.returnContext))return false;dispatch({type:'prepare-communion',value:true});return true}
    if(!dispatch({type:'enter-prepare'}))return false;dispatch({type:'prepare-communion',value:true});return true;
  case 'trad.four-ends': return traditional('MASS_FOUR_ENDS_LAS_1911',options.returnContext);
  case 'mass.thanksgiving':
    if(options.method===COLLECTION.lasance)return traditional('COMM_THANKS_LAS_1911',options.returnContext);
    if(options.returnContext)return !!globalThis.AO_NAV_V362?.openCore?.('thanksgiving',options.returnContext);
    return dispatch({type:'enter-thanksgiving'});
  case 'prayer.record': return prayerRecord(arg,options.returnContext);
  case 'prayerbook.open': {const fn=globalThis.AOTraditionalPrayerBook?.open;if(!fn)return false;const r=fn(options.returnContext?{returnContext:options.returnContext}:{});return r===false?false:true;}
  case 'prayerbook.module': return prayerBookModule(arg,options.returnContext);
  case 'pray.confession':
    if(options.method===COLLECTION.lasance)return traditional('CONFESSION_LAS_1911',options.returnContext);
    return prayerBookModule('confession',options.returnContext);
  case 'eucharistic.open': return eucharistic(arg,options.returnContext);
  case 'learn.mass': return openLearn(globalThis.AO_UNDERSTAND_MASS,{},options.returnContext);
  case 'learn.catechism': return openLearn(globalThis.AO_TRADITIONAL_CATECHISM,options,options.returnContext);
  case 'learn.daily-catechism':
    if(options.returnContext)globalThis.AO_NAV_V362?.setExternalReturn?.(options.returnContext);
    return !!globalThis.AO_DAILY_CATECHISM?.open?.();
  default:return false;
 }
}

async function open(input,options={}){
 const r=resolve(input);if(!r.ok)return {ok:false,input:String(input||''),canonicalId:null,error:r.error,aliasChain:r.chain};
 const def=r.definition;if(def.navigation===false||def.type==='collection')return {ok:false,input:String(input),canonicalId:r.id,error:'NON_NAVIGABLE_COLLECTION',aliasChain:r.chain};
 const merged={...r.defaults,...options};
 try{const opened=await run(def,merged);return {ok:!!opened,input:String(input),canonicalId:r.id,type:def.type,domain:def.domain,options:merged,aliasChain:r.chain,error:opened?null:'HANDLER_UNAVAILABLE'}}catch(error){return {ok:false,input:String(input),canonicalId:r.id,type:def.type,domain:def.domain,options:merged,aliasChain:r.chain,error:String(error?.message||error)}}
}

function aliasCycles(){const cycles=[];for(const start of Object.keys(ALIASES)){let id=start,seen=[];for(let i=0;i<20;i++){if(DEFINITIONS[id])break;const raw=ALIASES[id];if(!raw)break;const next=normalizeAliasEntry(raw).id;const pos=seen.indexOf(id);if(pos>=0){cycles.push([...seen.slice(pos),id]);break}seen.push(id);id=next}}return cycles}
function duplicateRenderers(){const map=new Map();for(const d of Object.values(DEFINITIONS)){if(!d.action||d.type==='collection')continue;const key=`${d.action}:${d.actionArg||''}`;if(!map.has(key))map.set(key,[]);map.get(key).push(d.id)}return [...map.entries()].filter(([,ids])=>ids.length>1).map(([renderer,ids])=>({renderer,ids}))}
function brokenReferences(){const out=[];for(const d of Object.values(DEFINITIONS)){for(const key of ['uses','providesFor'])for(const ref of d[key]||[])if(!DEFINITIONS[ref])out.push({from:d.id,field:key,to:ref});for(const m of d.methods||[])if(m!=='standard'&&!DEFINITIONS[m])out.push({from:d.id,field:'methods',to:m});if(d.sourceCollection&&!DEFINITIONS[d.sourceCollection])out.push({from:d.id,field:'sourceCollection',to:d.sourceCollection})}return out}
function unresolvedAliases(){const out=[];for(const id of Object.keys(ALIASES)){const r=resolve(id);if(!r.ok)out.push({alias:id,error:r.error,chain:r.chain})}return out}
function canonicalForElement(el){if(!el)return null;const d=el.dataset||{};
 if(d.action){const map={prepare:'mass.prepare',follow:'mass.follow',thanks:'mass.thanksgiving','today-mass':'mass.current',gospel:'today.gospel'};if(map[d.action])return map[d.action]}


 if(d.v261Adapter){const r=resolve(d.v261Adapter);if(r.ok)return r.id}
 if(d.ao354Open){const map={adoration:'pray.adoration','first-friday':'programme.first_friday','first-saturday':'programme.first_saturday',meditation:'programme.first_saturday_meditation'};if(map[d.ao354Open])return map[d.ao354Open]}
 if(d.ao354Launch){const map={adoration:'pray.adoration','first-friday':'programme.first_friday','first-saturday':'programme.first_saturday'};if(map[d.ao354Launch])return map[d.ao354Launch]}
 if(d.v25Destination){const map={prayers:'pray.library',calendar:'today.calendar',saint:'today.saint',settings:'utility.settings',sources:'utility.sources','today-mass':'mass.current'};if(map[d.v25Destination])return map[d.v25Destination]}
 if(d.dcOpen!==undefined)return 'learn.catechism.daily';
 return null
}
function auditDOM(root=document){const selector='[data-action],[data-v261-adapter],[data-ao354-open],[data-ao354-launch],[data-v25-destination],[data-dc-open]';const nodes=[...root.querySelectorAll(selector)],mapped=[],unmapped=[];for(const el of nodes){const id=canonicalForElement(el),row={tag:el.tagName?.toLowerCase()||'',text:(el.textContent||'').trim().replace(/\s+/g,' ').slice(0,90),canonicalId:id};(id?mapped:unmapped).push(row)}return {launcherCount:nodes.length,mappedCount:mapped.length,unmappedCount:unmapped.length,mapped,unmapped}}
function qa(){const defs=Object.values(DEFINITIONS),byType=defs.reduce((m,d)=>(m[d.type]=(m[d.type]||0)+1,m),{}),domains=defs.reduce((m,d)=>{if(d.domain)m[d.domain]=(m[d.domain]||0)+1;return m},{}),cycles=aliasCycles(),broken=brokenReferences(),badAliases=unresolvedAliases(),dupes=duplicateRenderers();return {version:VERSION,canonicalCount:defs.length,aliasCount:Object.keys(ALIASES).length,byType,domains,aliasCycles:cycles,brokenReferences:broken,unresolvedAliases:badAliases,duplicateRendererOwners:dupes,pass:!cycles.length&&!broken.length&&!badAliases.length}}

const API={version:VERSION,definitions:Object.freeze({...DEFINITIONS}),aliases:Object.freeze({...ALIASES}),collections:Object.freeze({...COLLECTION}),get:id=>{const r=resolve(id);return r.ok?{...r.definition}:null},resolve,open,list:(filter={})=>Object.values(DEFINITIONS).filter(d=>(!filter.type||d.type===filter.type)&&(!filter.domain||d.domain===filter.domain)).map(d=>({...d})),canonicalForElement,auditDOM,qa};
globalThis.AO_MODULES=API;
globalThis.AO_MODULE_REGISTRY_V36=API;
})();

