// Breviarium Romanum 1961 (1960 rubrics): source-owned Holy Week Matins and Lauds.
// This is a seasonal PRAY journey, not the pre-1955 anticipated candle service.
// All Latin/English/French sources and Psalter dependencies ship locally; never
// redirect to an external office or silently substitute a post-1970 text.
import {PRAY_CANONICAL_DATA_V435930} from "./canonical-data.js";

const freeze=Object.freeze;
const DAYS=freeze(["Quad6-4","Quad6-5","Quad6-6"]);
const PSALMS=freeze([
  freeze([68,69,70,71,72,73,74,75,76]),
  freeze([2,21,26,37,39,53,58,87,93]),
  freeze([4,14,15,23,26,29,53,75,87]),
]);
const LAUDS=freeze([
  freeze([50,89,35,224,146]),
  freeze([50,142,84,225,147]),
  freeze([50,91,63,226,150]),
]);
const DAY_NAMES=freeze({
  la:freeze(["Feria Quinta in Cena Domini","Feria Sexta in Parasceve","Sabbato Sancto"]),
  en:freeze(["Holy Thursday","Good Friday","Holy Saturday"]),
  fr:freeze(["Jeudi saint","Vendredi saint","Samedi saint"]),
});
const URN="b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0";
const cache=new Map();
function sourceUrl(rel,base=import.meta.url){return new URL("../../data/pray/tenebrae-1960-source/"+rel,base)}
async function fetchText(url,fetchImpl){
  const key=String(url);
  if(cache.has(key))return cache.get(key);
  const pending=(async()=>{
    const r=await fetchImpl(url);
    if(!r?.ok)throw new Error("Tenebrae local source missing: "+key);
    return r.text();
  })();
  cache.set(key,pending);
  try{return await pending}catch(error){cache.delete(key);throw error}
}
async function fetchJson(url,fetchImpl){
  const key=String(url);
  if(cache.has(key))return cache.get(key);
  const pending=(async()=>{
    const r=await fetchImpl(url);
    if(!r?.ok)throw new Error("Tenebrae local Psalter missing: "+key);
    return r.json();
  })();
  cache.set(key,pending);
  try{return await pending}catch(error){cache.delete(key);throw error}
}
function sourceSections(raw){
  const sections=new Map(),parts=[...String(raw).matchAll(/^\[([^\]\n]+)\][^\n]*\r?\n/gm)];
  for(let i=0;i<parts.length;i++){
    const m=parts[i],until=i+1<parts.length?parts[i+1].index:raw.length;
    if(!sections.has(m[1]))sections.set(m[1],raw.slice(m.index+m[0].length,until).trim());
  }
  return sections;
}
function rubricLine(raw){
  let s=String(raw??"").trim();
  if(!s)return null;
  // Divinum Officium leaves contain variant lines for older rites.
  // Only unqualified lines and 1960-specific lines may reach the UI.
  if(/^\(sed rubrica (?:tridentina|monastica|cisterciensis|1955)/i.test(s))return null;
  if(/^\(rubrica /i.test(s))return null;
  if(/^\(sed rubrica 1960\)/i.test(s))s=s.replace(/^\(sed rubrica 1960\)\s*/i,"");
  if(/^\(sed rubrica /i.test(s))return null;
  if(s.startsWith("&Gloria"))return null; // 1960 rubric 230: substitute full response; no Gloria Patri.
  if(s.startsWith("!"))return s.replace(/^!\s*/,"").trim();
  if(s.startsWith("$")||s.startsWith("@")||s.startsWith("&"))return null;
  if(s==="_")return null;
  return s;
}
function cleanSection(value){
  return String(value??"").split(/\r?\n/).map(rubricLine).filter(Boolean).join("\n").trim();
}
function antiphons(section,withPsalm=false){
  const lines=String(section??"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const output=[];
  for(const raw of lines){
    if(/^\(sed rubrica (?:tridentina|monastica|cisterciensis|1955)/i.test(raw))continue;
    const line=rubricLine(raw);
    if(!line)continue;
    const match=line.match(/^(.*?)(?:;;(\d+)(?:\(([^)]+)\))?)?$/);
    if(!match)continue;
    const v=match[1].trim(),num=match[2]?Number(match[2]):null;
    if(!v)continue;
    if(output.some(x=>x.text===v))continue;
    if(withPsalm&&num==null)throw new Error("Tenebrae Matins antiphon missing psalm reference");
    output.push(freeze({text:v,psalm:num,sourceRange:match[3]??null}));
  }
  return output;
}
function psalmBody(psalms,id,{through=null}={}){
  const value=psalms?.[String(id)];
  if(typeof value!=="string"||value.length<50)throw new Error("Tenebrae psalm dependency missing "+id);
  let lines=value.trim().split(/\r?\n/);
  if(through!=null)lines=lines.filter(line=>{
    const m=line.match(/^\s*\d+:(\d+)(?:[a-z])?\b/);
    return !m||Number(m[1])<=through;
  });
  if(lines.length<5)throw new Error("Tenebrae psalm incomplete "+id);
  return lines.join("\n");
}
function resolveOfficeCollect(local,thursday,dayIndex){
  let oratio=local.get(dayIndex===2?"Oratio 2":"Oratio")??local.get("Oratio");
  if(dayIndex===0){
    // In the 1960 Triduum the 1955/other-edition Psalm 50 instruction
    // in this DO block is omitted. Christus factus est, silent Pater and
    // final collect are represented as separate reader steps.
    const acclamation=String(oratio??"").split(/\r?\n/).find(x=>/^v\.\s*Christus/i.test(x));
    if(!acclamation)throw new Error("Tenebrae source Christus factus est absent");
    return acclamation.replace(/^v\.\s*/,"").trim();
  }
  const match=String(oratio??"").match(/^@Tempora\/Quad6-4[\w:]*(?::s\/)([^/]+)\/([^/]+)\//);
  if(!match)throw new Error("Tenebrae final Christus factus est unresolved source reference");
  const base=resolveOfficeCollect(thursday,thursday,0);
  if(!base.includes(match[1]))throw new Error("Tenebrae edition macro substitution not present in source");
  return base.replace(match[1],match[2]);
}
function collectPrayer(local,thursday){
  let text=local.get("Oratio Matutinum");
  if(String(text??"").trim().startsWith("@Tempora/Quad6-4")){
    text=thursday.get("Oratio Matutinum");
  }
  const chosen=String(text??"").split(/\r?\n/).find(x=>/^v\.\s*/.test(x));
  if(!chosen)throw new Error("Tenebrae prayer has no source-resolved collect");
  return chosen.replace(/^v\.\s*/,"");
}
function line(id,kind,text,notes=null){
  const clean=String(text??"").trim();
  if(!clean||/^[@$&]/m.test(clean))throw new Error(id+" contains unresolved or empty source text");
  return freeze({id,kind,text:clean,notes});
}
function buildLocal({dayIndex,hour,locale,daySource,thursdaySource,psalms}){
  const local=sourceSections(daySource),thursday=sourceSections(thursdaySource);
  const rows=[],push=(id,kind,value,meta)=>rows.push(line(id,kind,value,meta));
  if(hour==="MATINS"){
    const ants=antiphons(local.get("Ant Matutinum"),true);
    if(ants.length!==9)throw new Error(locale+" "+DAYS[dayIndex]+" Matins expects nine antiphons");
    for(let nocturn=0;nocturn<3;nocturn++){
      for(let p=1;p<=3;p++){
        const i=nocturn*3+p-1,id=PSALMS[dayIndex][i],ant=ants[i];
        if(ant.psalm!==id)throw new Error("Matins psalm mismatch in original proper "+id);
        push("M.N"+(nocturn+1)+".P"+p,"PSALM",ant.text+"\n\n"+psalmBody(psalms,id)+"\n\n"+ant.text,{psalm:id,nocturn:nocturn+1});
      }
      push("M.N"+(nocturn+1)+".VERSUM","VERSICLE",cleanSection(local.get("Nocturn "+(nocturn+1)+" Versum")),{nocturn:nocturn+1});
      for(let k=1;k<=3;k++){
        const i=nocturn*3+k;
        push("M.LESSON"+i,"LESSON",cleanSection(local.get("Lectio"+i)),{nocturn:nocturn+1});
        // The upstream &Gloria marker is deliberately not rendered; rubric
        // 230 requires repetition of the whole response during Passiontide.
        push("M.RESP"+i,"RESPONSORY",cleanSection(local.get("Responsory"+i)),{nocturn:nocturn+1});
      }
    }
  }else if(hour==="LAUDS"){
    const ants=antiphons(local.get("Ant Laudes"));
    if(ants.length!==5)throw new Error(locale+" "+DAYS[dayIndex]+" Lauds expects five antiphons");
    for(let i=0;i<5;i++){
      const id=LAUDS[dayIndex][i],ant=ants[i];
      push("L.P"+(i+1),"PSALM",ant.text+"\n\n"+psalmBody(psalms,id,{through:id===226?27:null})+"\n\n"+ant.text,{psalm:id,canticle:id>=200});
    }
    push("L.VERSUM","VERSICLE",cleanSection(local.get("Versum 2")));
    const ben=cleanSection(local.get("Ant 2"));
    push("L.BENEDICTUS","CANTICLE",ben+"\n\n"+psalmBody(psalms,231)+"\n\n"+ben,{psalm:231});
    push("L.CHRISTUS","ANTIPHON",resolveOfficeCollect(local,thursday,dayIndex));
    const p=PRAY_CANONICAL_DATA_V435930.prayers.foundations_our_father;
    push("L.PATER","PRAYER",p[locale]??p.en,{saidSilently:true});
    push("L.COLLECT","COLLECT",collectPrayer(local,thursday));
  }else throw new TypeError("Unknown Tenebrae Office "+hour);
  if(rows.length!==(hour==="MATINS"?30:10))throw new Error("Unexpected Tenebrae hour length");
  return rows;
}
export function compileTenebraeHour({dayIndex=0,hour="MATINS",sourceByLocale,thursdayByLocale,psalmsByLocale}={}){
  if(!Number.isInteger(dayIndex)||dayIndex<0||dayIndex>2)throw new RangeError("Tenebrae day index must be 0..2");
  const local={};
  for(const locale of ["la","en","fr"]){
    local[locale]=buildLocal({
      dayIndex,hour,locale,
      daySource:sourceByLocale?.[locale],
      thursdaySource:thursdayByLocale?.[locale],
      psalms:psalmsByLocale?.[locale],
    });
  }
  const ids=local.la.map(x=>x.id);
  for(const locale of ["en","fr"])if(ids.join()!==local[locale].map(x=>x.id).join())throw new Error("Tenebrae multilingual source alignment failed");
  const steps=ids.map((id,i)=>freeze({
    id,kind:local.la[i].kind,latin:local.la[i].text,
    en:local.en[i].text,fr:local.fr[i].text,
    metadata:local.la[i].notes,
  }));
  return freeze({
    schema:"ao.tenebrae.1960.hour-reader.v1",
    dayIndex,hour,
    textsCompleteForSourceDerivedReading:true,
    printEditionCriticallyCertified:false,
    parishRitualCeremonyCertified:false,
    mode:"RUBRICS_1960_MATINS_LAUDS",
    steps:freeze(steps),sourceRevision:URN,
    attribution:"© 2026 Divinum Officium; MIT licensed source, locally integrated",
  });
}
export async function loadTenebraeHour({dayIndex=0,hour="MATINS",fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("Tenebrae fetch required");
  const names=Object.freeze(["la","en","fr"]);
  const all=await Promise.all(names.map(async locale=>{
    const [raw,thu,...packs]=await Promise.all([
      fetchText(sourceUrl(locale+"/"+DAYS[dayIndex]+".txt",baseUrl),fetchImpl),
      fetchText(sourceUrl(locale+"/Quad6-4.txt",baseUrl),fetchImpl),
      ...[1,2,3].map(n=>fetchJson(sourceUrl(locale+"/psalms-0"+n+".json",baseUrl),fetchImpl)),
    ]);
    const merged=Object.assign({},...packs.map(x=>{
      if(x?.sourceCommit!==URN||x?.locale!==locale)throw new Error("Tenebrae Psalter version mismatch");
      return x.psalms;
    }));
    return {locale,raw,thu,psalms:merged};
  }));
  return compileTenebraeHour({
    dayIndex,hour,
    sourceByLocale:Object.fromEntries(all.map(x=>[x.locale,x.raw])),
    thursdayByLocale:Object.fromEntries(all.map(x=>[x.locale,x.thu])),
    psalmsByLocale:Object.fromEntries(all.map(x=>[x.locale,x.psalms])),
  });
}
export const TENEBRAE_DAY_NAMES=DAY_NAMES;
export const TENEBRAE_EXPECTED_PSALMS=freeze({matins:PSALMS,lauds:LAUDS});
export function resetTenebraeSourceCache(){cache.clear()}
