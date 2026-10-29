import {calendarCustomHistoricalVariants} from "../calendar/customs-22-regional-variants.js";
// Customs is an independent read-model over existing canonical records.
// Historical observations are *not* promoted into published customs.
export const CUSTOMS_YEAR_GROUPS=Object.freeze([
  ["advent","Advent","Avent"],
  ["christmas","Christmas","Noël"],
  ["epiphany","Epiphany","Épiphanie"],
  ["february","February feasts","Fêtes de février"],
  ["march","March feasts","Fêtes de mars"],
  ["holy-week","Holy Week","Semaine sainte"],
  ["easter","Easter","Pâques"],
  ["eastertide","Eastertide","Temps pascal"],
  ["may","The month of Mary","Mois de Marie"],
  ["june","June feasts","Fêtes de juin"],
  ["corpus-christi","Corpus Christi","Fête-Dieu"],
  ["sacred-heart","Sacred Heart","Sacré-Cœur"],
  ["july","July feasts","Fêtes de juillet"],
  ["august","August and the Assumption","Août et l’Assomption"],
  ["november","Holy Souls and November","Âmes du purgatoire et novembre"]
]);
const A=value=>Array.isArray(value)?value:[];
const S=value=>String(value??"").trim();
const unique=rows=>[...new Set(rows)];
export function createCustomsLibrary({customs,temporal,archive,sources,p0,p1,frCopy,historical}={}){
  if(customs?.schema==null||temporal?.schema!=="AO_CUSTOMS_TEMPORAL_PROJECTION_V1"||
     archive?.schema!=="AO_CUSTOMS_WEISER_REFERENCE_INDEX_V1")throw Error("Customs corpus incomplete");
  const customRows=A(customs.customs),timeRows=A(temporal.records),researchRows=A(archive.records);
  const ids=customRows.map(x=>S(x.custom_id));
  if(new Set(ids).size!==ids.length||new Set(timeRows.map(x=>x.custom_id)).size!==ids.length||
     ids.some(id=>!timeRows.some(x=>x.custom_id===id)))throw Error("Customs temporal coverage is incomplete");
  if(researchRows.length!==568||new Set(researchRows.map(x=>x.id)).size!==568)
    throw Error("Weiser reference index not reconciled: expected 568 distinct locators");
  const timeById=new Map(timeRows.map(x=>[x.custom_id,x]));
  const srcById=new Map(A(sources?.sources).map(x=>[x.id,x]));
  const guidanceById=new Map([...A(p0?.entries),...A(p1?.entries)].map(x=>[x.custom_id,x]));
  const frenchById=new Map(A(frCopy?.entries).map(x=>[x.custom_id,x]));
  const historyRows=A(historical?.entries);
  const historyById=new Map(historyRows.map(x=>[x.custom_id,x]));
  if(historical?.schema!=="AO_CUSTOMS_HISTORICAL_FOLIOS_V1"||
     historyRows.length!==27||historyById.size!==27)
    throw Error("27 source-bounded historical folios are required");
  for(const h of historyRows){
    if(!ids.includes(h.custom_id)||!S(h.history_en)||!S(h.history_fr))
      throw Error("Historical folio without canonical identity or both languages");
    const attestedIds=new Set(A(customs.attestations).filter(a=>a.custom_id===h.custom_id).flatMap(a=>A(a.source_ids)));
    if(!A(h.source_ids).length||A(h.source_ids).some(id=>!attestedIds.has(id)||!srcById.has(id)))
      throw Error("Historical folio source not attached to canonical record: "+h.custom_id);
  }

  const attestationsById=new Map();
  for(const att of A(customs.attestations)){
    const id=S(att.custom_id);
    if(!ids.includes(id))throw Error("Orphaned custom attestation: "+id);
    if(!attestationsById.has(id))attestationsById.set(id,[]);
    attestationsById.get(id).push(att);
  }
  const items=customRows.map(c=>{
    const id=c.custom_id,guidance=guidanceById.get(id)||null,french=frenchById.get(id)||null,hist=historyById.get(id)||null;
    const attestations=attestationsById.get(id)||[];
    const citations=unique([...attestations.flatMap(a=>A(a.source_ids)),...A(guidance?.source_ids)])
      .map(sourceId=>srcById.get(sourceId)).filter(Boolean);
    return Object.freeze({
      ...c, id, guidance,temporal:timeById.get(id),history:hist,
      attestations:Object.freeze(attestations),sources:Object.freeze(citations),
      title_en:S(guidance?.title_en)||S(c.name),
      title_fr:S(guidance?.title_fr)||S(french?.title_fr)||null,
      description_en:S(guidance?.description_en)||S(c.canonical_statement),
      description_fr:S(guidance?.description_fr)||S(french?.description_fr)||null,
      meaning_en:S(guidance?.meaning_en)||null,meaning_fr:S(guidance?.meaning_fr)||null,
      how_en:S(guidance?.how_en)||null,how_fr:S(guidance?.how_fr)||null,
      caution_fr:S(guidance?.caution_fr)||S(french?.caution_fr)||null
    });
  });
  const byId=new Map(items.map(x=>[x.id,x]));
  const research=researchRows.map(r=>Object.freeze({
    ...r,canonical: r.existing_custom_id?byId.get(r.existing_custom_id)||null:null
  }));
  return Object.freeze({
    items:Object.freeze(items),research:Object.freeze(research),
    byId,byResearchId:new Map(research.map(x=>[x.id,x])),
    published:items.filter(x=>x.publication_state==="PUBLISHED").length,
    contextOnly:items.filter(x=>x.publication_state==="CONTEXT_ONLY").length,
    provenance:archive.source,
    stats:Object.freeze({canonical:items.length,research:research.length,
      researchByTriage:Object.freeze(research.reduce((out,r)=>{
        out[r.original_triage]=(out[r.original_triage]||0)+1;return out;
      },{}))})
  });
}
export function selectCustoms(library,{view="year",group=null,query=""}={}){
  const q=S(query).toLocaleLowerCase();
  return library.items.filter(c=>{
    if(view==="year"&&!(c.temporal?.group&&c.temporal.group!=="life"))return false;
    if(view==="life"&&c.temporal?.group!=="life")return false;
    if(group&&c.temporal?.group!==group)return false;
    if(!q)return true;
    const terms=[c.id,c.name,c.family,c.title_en,c.title_fr,c.description_en,c.description_fr,
      c.temporal?.calendar_hint,c.temporal?.group];
    // Historical variations are searchable by their parent record only, never
    // surfaced as new canonical Customs cards or as Calendar events.
    for(const fr of [false,true]){
      for(const v of calendarCustomHistoricalVariants(c.id,{fr})){
        terms.push(v.title,v.history,v.context_or_practice,...v.geography);
      }
    }
    return terms.some(x=>S(x).toLocaleLowerCase().includes(q));
  });
}
export function selectResearch(library,{query="",triage="",chapter=0}={}){
  const q=S(query).toLocaleLowerCase();
  return library.research.filter(r=>(!triage||r.original_triage===triage)&&
    (!chapter||r.chapter===Number(chapter))&&
    (!q||[r.id,r.title,r.source_family,r.original_triage,r.canonical?.name]
      .some(x=>S(x).toLocaleLowerCase().includes(q))));
}
