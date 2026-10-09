// Source-first discovery across the currently public Formation routes and
// the existing Glossary. This is a routing index, never a second text owner.
export const REFERENCE_INDEX_URL=new URL("../../data/app/public-reference-discovery.v1.json",import.meta.url);
export const DISCOVERY_SURFACES=Object.freeze([
 Object.freeze({id:"home",en:"Today & Scripture",fr:"Aujourd'hui et Écriture",terms:"today gospel evangelium evangile évangile scripture bible daily jour",description:["The current liturgical day and Gospel","Jour liturgique et Évangile"]}),
 Object.freeze({id:"mass",en:"Mass reader",fr:"Missel et Messe",terms:"mass missa messe missal missel latin rubrics live",description:["Prepare for and follow the Roman Mass","Préparer et suivre la Messe romaine"]}),
 Object.freeze({id:"pray",en:"Prayer & devotions",fr:"Prières et dévotions",terms:"pray prier prayer priere prière rosary rosaire chapelet stations novena neuvaine adoration confession angelus",description:["Rosary, novenas, Stations and Prayer Library","Rosaire, neuvaines, Chemin de croix et prières"]}),
 Object.freeze({id:"calendar",en:"Liturgical Calendar",fr:"Calendrier liturgique",terms:"calendar calendrier feast fete fête holy day saint solemnity solemnité dimanche sunday",description:["Celebrations, feasts and devotional dates","Célébrations, fêtes et dates de dévotion"]}),
 Object.freeze({id:"find",en:"Sacred places & traditional Mass locations",fr:"Lieux sacrés et messes traditionnelles",terms:"find explorer explore sanctuary sanctuaire shrine pilgrimage pelerinage pèlerinage apparition relic relique tlm latin mass église",description:["Shrines, pilgrimages, relics and Mass locations","Sanctuaires, pèlerinages, reliques et lieux de Messe"]}),
 Object.freeze({id:"apostolate",en:"Apostolate & practical scenarios",fr:"Apostolat et situations pratiques",terms:"apostolate apostolat help aider answer réponse conversation defend faith défendre foi",description:["Practise responding and helping others","S'exercer à répondre et à aider autrui"]})
]);
const ALIASES=Object.freeze({
 "learn.catechism":"st pius x saint pie x catechisme catechism doctrine catéchisme foi faith",
 "learn.catechism.daily":"daily catechism daily study etude quotidienne étude quotidienne",
 "learn.sexual_ethics":"morality moralite moralité sexual sex mariage chastete chasteté contraception abortion avortement",
 "learn.spiritual_life":"oraison mental prayer examen spiritual direction vie spirituelle",
 "learn.mass":"roman mass traditional liturgy missa messe liturgie",
 "learn.serve_mass.responses":"altar server acolyte servant messe reponses réponses",
 "learn.latin":"latin grammar grammar missa pronunciation langue latine",
 "learn.glossary":"dictionary latin term concept definition dictionnaire glossaire reference référence",
 "learn.rites.matrimony":"wedding mariage fiancé fiançailles bridal spouse epoux époux",
 "learn.rites.sick":"viaticum viatique extreme unction onction malade dying",
 "learn.rites.baptism":"godparents parrain marraine urgence emergency bapteme baptême",
 "learn.rites.first_communion":"eucharist eucharistie first holy communion",
 "learn.rites.confirmation":"chrism chreme chrême sponsor",
 "learn.rites.holy_orders":"ordination prêtre priest deacon diacre",
 "learn.scapular":"carmel carmelite scapulaire scapular marian"
});
export function normalizeDiscovery(text){
 return String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[æÆ]/g,"ae").replace(/[œŒ]/g,"oe").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
}
const searchText=x=>normalizeDiscovery(x.filter(Boolean).join(" "));
const score=(q,title,other)=>{
 const t=normalizeDiscovery(title),v=searchText(other),words=q.split(" ").filter(Boolean);
 if(!words.every(word=>(t+" "+v).includes(word)))return -1;
 if(t===q)return 0;
 if(t.startsWith(q))return 1;
 if(t.includes(q))return 2;
 return 3;
};
export function searchDiscovery(query,{sections=[],referenceEntries=[],limit=25}={}){
 const q=normalizeDiscovery(query);
 if(q.length<2)return Object.freeze([]);
 const all=[];
 for(const section of sections){
  const familyScore=score(q,section.title?.[0],[section.title?.[1],...(section.description??[])]);
  if(familyScore>=0)all.push({id:section.id,kind:"family",title:section.title,subtitle:section.description,score:familyScore+2,group:"formation"});
  for(const item of section.items??[]){
   const rank=score(q,item.title?.[0],[item.title?.[1],...(item.description??[]),ALIASES[item.id],...section.title]);
   if(rank>=0)all.push({id:item.id,kind:"module",title:item.title,subtitle:item.description,score:rank,group:"formation",familyId:section.id});
  }
 }
 for(const surface of DISCOVERY_SURFACES){
  const rank=score(q,surface.en,[surface.fr,surface.terms,...surface.description]);
  if(rank>=0)all.push({id:surface.id,kind:"surface",title:[surface.en,surface.fr],subtitle:surface.description,score:rank+3,group:"application"});
 }
 for(const ref of referenceEntries){
  if(!["concept","lexeme","phrase"].includes(ref?.kind)||!ref?.id)continue;
  const rank=score(q,ref.en,[ref.fr,ref.la]);
  if(rank>=0)all.push({id:ref.id,kind:"reference",referenceKind:ref.kind,title:[ref.en,ref.fr||ref.en],subtitle:ref.la?[ref.la,ref.la]:null,score:rank+4,group:"reference"});
 }
 return Object.freeze(all.sort((a,b)=>a.score-b.score||a.title[0].localeCompare(b.title[0])).slice(0,Math.min(40,Math.max(1,limit))).map(x=>Object.freeze(x)));
}
let pending=null;
export function loadReferenceDiscovery(win=globalThis){
 if(!pending){
  const fetcher=win?.fetch?.bind(win)||globalThis.fetch?.bind(globalThis);
  if(!fetcher)return Promise.reject(new Error("Discovery fetch unavailable"));
  pending=Promise.resolve(fetcher(REFERENCE_INDEX_URL)).then(response=>{
   if(!response?.ok)throw Error("Reference index unavailable");
   return response.json();
  }).then(data=>{
   if(data?.schema!=="AO_PUBLIC_REFERENCE_DISCOVERY_V1"||!Array.isArray(data.entries))
     throw Error("Unexpected reference discovery index");
   return Object.freeze(data.entries);
  }).catch(error=>{pending=null;throw error});
 }
 return pending;
}
