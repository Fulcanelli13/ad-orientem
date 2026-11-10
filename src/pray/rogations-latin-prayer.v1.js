/**
 * Prayer presents the EXISTING R25 Mass/Rogations Latin source, never a
 * new transcription or a synthesized English/French 1962 edition.
 * Source owner: data/presentation/reader-rogations.v1.json.
 * Physical printed-edition collation and French liturgical text remain held.
 */
export const ROGATIONS_PRAYER_SOURCE_URL=new URL("../../data/presentation/reader-rogations.v1.json",import.meta.url).href;
export const ROGATIONS_PRAYER_READING_STATUS="R25_LATIN_CORPUS_REUSED__PRINT_EDITION_UNCOLLATED";
const freeze=Object.freeze;
const nonempty=v=>typeof v==="string"&&Boolean(v.trim());
const assert=(ok,what)=>{if(!ok)throw Error("Rogations Latin source incomplete: "+what)};
const cleanRow=(v,kind="TEXT")=>freeze({kind,latin:v.trim()});
const pairRows=(items,what)=>items.map((pair,i)=>{
 assert(Array.isArray(pair)&&pair.length===2&&["VERSICLE","RESPONSE","TEXT"].includes(pair[0])&&nonempty(pair[1]),what+" #"+i);
 return cleanRow(pair[1],pair[0]);
});
const textRows=(items,what)=>items.map((v,i)=>{
 assert(nonempty(v),what+" #"+i);return cleanRow(v);
});
const stage=(id,en,fr,rows,scope)=>freeze({id,title:freeze({en,fr}),rows:freeze(rows),scope});
const slices=(list,size)=>Array.from({length:Math.ceil(list.length/size)},(_,i)=>list.slice(i*size,(i+1)*size));
export function rogationsLatinPrayerStages(payload){
 assert(payload?.schema==="ao-r25-rogations-payload-v1","source schema");
 assert(payload?.status==="SOURCE_PINNED_1962_ROGATION_CORPUS","R25 source status");
 assert(payload?.authority?.rule?.includes("not doubled"),"1960/1962 non-doubling constraint");
 const o=payload.opening||{},p=payload.postLitany||{};
 for(const key of ["antiphon","psalm","gloria","repeat"])assert(nonempty(o[key]),"Exsurge "+key);
 assert(o.repeat===o.antiphon,"original antiphon repeat");
 assert(Array.isArray(payload.litanyBeforeProcession)&&payload.litanyBeforeProcession.length===18,"18 opening Litany entries");
 assert(Array.isArray(payload.processionLitany)&&payload.processionLitany.length===112,"112 procession entries");
 assert(payload.processionLitany[0]?.startsWith("Sancta Maria, ora pro nobis."),"procession at Sancta Maria");
 assert(Array.isArray(p.psalm69)&&p.psalm69.length===8,"complete R25 Psalm 69 segment");
 assert(Array.isArray(p.suffrages)&&p.suffrages.length===24,"24 suffrage entries");
 assert(Array.isArray(p.orations)&&p.orations.length===10,"10 concluding orations");
 assert(Array.isArray(p.final)&&p.final.length===7,"7 concluding responses");
 for(const key of ["pater","versicle","response"])assert(nonempty(p[key]),"post-Litany "+key);
 const opening=textRows([o.antiphon,o.psalm,o.gloria,o.repeat],"opening");
 const kneeling=pairRows(payload.litanyBeforeProcession,"kneeling litany");
 const procession=textRows(payload.processionLitany,"procession litany");
 const psalm=[
  cleanRow(p.pater),cleanRow(p.versicle,"VERSICLE"),cleanRow(p.response,"RESPONSE"),
  ...textRows(p.psalm69,"Psalm 69")
 ];
 const suffrages=pairRows(p.suffrages,"suffrages");
 const orations=textRows(p.orations,"orations");
 const conclusion=pairRows(p.final,"conclusion");
 const processStages=slices(procession,16).map((rows,i)=>stage(
  "procession-"+(i+1),
  "Procession · invocations "+(i+1)+"/7",
  "Procession · invocations "+(i+1)+"/7",rows,
  i===0?"PROCESSION_BEGINS_SANCTA_MARIA":"PROCESSIONAL_LITANY"));
 const prayer=freeze([
  stage("exsurge","Exsurge, Domine","Exsurge, Domine",opening,"BEFORE_LITANY"),
  stage("kneeling","Kyrie · opening invocations","Kyrie · invocations initiales",kneeling,"KNEELING"),
  ...processStages,
  stage("pater-psalm","Our Father · Psalm 69","Notre Père · Psaume 69",psalm,"POST_LITANY"),
  stage("suffrages","Versicles and responses","Versets et répons",suffrages,"POST_LITANY"),
  ...slices(orations,5).map((rows,i)=>stage(
   "collects-"+(i+1),
   "Concluding orations "+(i+1)+"/2",
   "Oraisons finales "+(i+1)+"/2",rows,"POST_LITANY_COLLECTS")),
  stage("conclusion","Final responses","Répons conclusifs",conclusion,"POST_LITANY")
 ]);
 assert(prayer.length===14,"14 distinct Latin reading sections");
 assert(prayer.reduce((n,s)=>n+s.rows.length,0)===186,"all 186 source entries preserved");
 assert(prayer.every(s=>s.rows.every(r=>nonempty(r.latin))),"no missing Latin prayer text");
 return prayer;
}
export async function loadRogationsLatinPrayer({
 fetcher=globalThis.fetch?.bind(globalThis)
}={}){
 if(typeof fetcher!=="function")throw Error("Rogations source fetch unavailable");
 const response=await fetcher(ROGATIONS_PRAYER_SOURCE_URL,{cache:"force-cache"});
 if(!response?.ok)throw Error("Pinned R25 Rogations data unavailable");
 const payload=await response.json();
 return freeze({sourceUrl:ROGATIONS_PRAYER_SOURCE_URL,
  printedEditionCertified:false,
  frenchLiturgicalEditionAvailable:false,
  status:ROGATIONS_PRAYER_READING_STATUS,
  stages:rogationsLatinPrayerStages(payload)});
}
