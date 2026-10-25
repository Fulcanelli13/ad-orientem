/** Read-only extracts from canonical module owners. No independent theological copy. */
const safeUrl = url => {try{const u=new URL(url);return u.protocol==='https:'?u.href:null;}catch{return null;}};
const pick = (v,lang) => v && (v[lang]??v.en??null);
export async function readAskChurchDigest(target, {lang='en',situation=null}={}) {
 const id=String(target?.id||'');
 if(id.startsWith('apostolate:')){
  const key=id.split(':')[1],prefix=key.slice(0,2);
  const moduleByPrefix={AQ:'corpus',HS:'hs-corpus',FH:'fh-corpus',TF:'tf-corpus',DV:'dv-corpus',WC:'wc-corpus'};
  const fieldByPrefix={AQ:'APOSTOLATE_AQ_SCENARIOS',HS:'APOSTOLATE_HS_SCENARIOS',FH:'APOSTOLATE_FH_SCENARIOS',TF:'APOSTOLATE_TF_SCENARIOS',DV:'APOSTOLATE_DV_SCENARIOS',WC:'APOSTOLATE_WC_SCENARIOS'};
  if(!moduleByPrefix[prefix])return null;
  const corpus=await import('../apostolate/'+moduleByPrefix[prefix]+'.js');
  const found=corpus[fieldByPrefix[prefix]]?.find(x=>x.id===key&&x.publication==='READY');
  if(!found)return null;
  const {APOSTOLATE_SOURCES}=await import('../apostolate/source-registry.js');
  return {
   title:pick(found.title,lang),
   text:pick(found.text,lang),
   detail:pick(found.explanation,lang),
   sourceStatus:'READY_IN_RUNTIME_SOT',
   owner:'Apostolate',
   sources:(found.sourceIds||[]).map(ref=>APOSTOLATE_SOURCES[ref]).filter(x=>x&&safeUrl(x.url)).map(x=>({label:x.work,locator:x.locator,url:safeUrl(x.url)})).slice(0,4)
  };
 }
 if(id==='pray.confession'){
  const {CONFESSION_PATHS,CONFESSION_SOURCE_LINKS}=await import('../pray/confession-paths.js');
  const path=situation==='confession_return'?'returning':'regular';
  const source=CONFESSION_PATHS[path];
  return {
   title:lang==='fr'?source.titleFr:source.titleEn,
   text:lang==='fr'?source.descriptionFr:source.descriptionEn,
   detail:null,owner:'Prayer · Confession preparation',sourceStatus:'SOURCE_DECLARED',
   sources:CONFESSION_SOURCE_LINKS.map(s=>({label:lang==='fr'?s.labelFr:s.label,url:safeUrl(lang==='fr'?s.urlFr:s.url)})).filter(x=>x.url)
  };
 }
 if(id.startsWith('learn.')){
  const {LEARN_LAYOUT}=await import('./presentation.js');
  const items=LEARN_LAYOUT.sections.flatMap(s=>s.items);
  const item=items.find(x=>x.id===id);
  if(!item)return null;
  const i=lang==='fr'?1:0;
  return {title:item.title?.[i]||item.title?.[0]||id,text:item.description?.[i]||item.description?.[0]||'',detail:null,owner:'Formation',sourceStatus:'MODULE_DESCRIPTION',sources:[]};
 }
 return null;
}
