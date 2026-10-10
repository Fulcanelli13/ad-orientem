// Canonical, practice-first discovery. Underlying attestations remain owned by
// the Customs Atlas and retain their original IDs for Place pages and map proofs.
const list=value=>Array.isArray(value)?value:[];
const clean=value=>String(value??"").trim();
const dedupe=(values,key)=>[...new Map(list(values).filter(Boolean).map(value=>[key(value),value])).values()];

export function groupTraditionsForBrowse(items,{includeNovenaContext=false}={}){
  const groups=new Map();
  const output=[];
  for(const item of list(items)){
    if(item?.kind!=="CUSTOM_ATTESTATION"){
      if(includeNovenaContext)output.push(item);
      continue;
    }
    const custom=item?.raw?.custom;
    const id=clean(custom?.custom_id);
    if(!id){output.push(item);continue;}
    if(!groups.has(id)){
      const group={custom,attestations:[],first:item};
      groups.set(id,group);
      output.push(group);
    }
    groups.get(id).attestations.push(item);
  }
  return Object.freeze(output.map(entry=>{
    if(!entry?.attestations)return entry;
    const {custom,attestations,first}=entry;
    const examples=attestations.map(item=>Object.freeze({
      attestation_id:item.source_id,
      title:clean(item.subtitle)||"Documented context",
      body:clean(item.raw?.attestation?.evidence_note),
      period:clean(item.raw?.attestation?.period_label),
      place_id:item.place_id??null,
      source_links:item.source_links,
    }));
    const novenaSections=dedupe(
      attestations.flatMap(item=>list(item.sections).filter(section=>section?.label==="Related novena")),
      section=>clean(section.title)+"|"+clean(section.body)
    );
    return Object.freeze({
      item_id:"tradition:custom:"+custom.custom_id,
      source_id:custom.custom_id,
      lens:"traditions",
      kind:"CANONICAL_CUSTOM",
      eyebrow:"CUSTOM · "+clean(custom.family).toUpperCase(),
      status:first.status,
      title:custom.name,
      subtitle:clean(custom.family),
      summary:custom.canonical_statement,
      place_id:null,
      address:null,
      geo:null,
      map_publishable:false,
      map_state:"NOT_MAPPED",
      facts:Object.freeze([
        {label:"Class",value:clean(custom.custom_class).replaceAll("_"," ")},
        {label:"Period",value:clean(custom.period_label)},
        {label:"Documented examples",value:String(attestations.length)},
      ].filter(fact=>fact.value)),
      sections:Object.freeze([
        ...(custom.guardrail?[{label:"Pastoral context",title:"",body:custom.guardrail}]:[]),
        ...novenaSections,
      ]),
      attestation_examples:Object.freeze(examples),
      source_links:Object.freeze(dedupe(attestations.flatMap(item=>list(item.source_links)),source=>source.url||source.id)),
      actions:Object.freeze(dedupe(attestations.flatMap(item=>list(item.actions)).filter(action=>action?.novena_id),action=>action.novena_id)),
      note:"Locations identify documented examples, not an exclusive national ownership or a claim that all local Catholics observe the practice.",
      search_text:attestations.map(item=>clean(item.search_text)).join(" ").toLowerCase(),
      raw:Object.freeze({custom,attestations:attestations.map(item=>item.raw?.attestation).filter(Boolean)}),
    });
  }));
}

export function countCanonicalTraditions(items){
  return new Set(list(items).filter(item=>item?.kind==="CUSTOM_ATTESTATION")
    .map(item=>clean(item.raw?.custom?.custom_id)).filter(Boolean)).size;
}
