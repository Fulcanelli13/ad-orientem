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
    const guide=first.custom_guidance??null;
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
      title_fr:guide?.title_fr??null,
      subtitle:clean(custom.family),
      summary:guide?.description_en??custom.canonical_statement,
      summary_fr:guide?.description_fr??null,
      place_id:null,
      address:null,
      geo:null,
      map_publishable:false,
      map_state:"NOT_MAPPED",
      facts:Object.freeze([
        {label:"Period",value:clean(custom.period_label)},
        {label:"Documented examples",value:String(attestations.length)},
      ].filter(fact=>fact.value)),
      sections:Object.freeze([
        ...(guide?[
          {label:"Meaning",label_fr:"Sens",title:"",body:guide.meaning_en,body_fr:guide.meaning_fr},
          {label:"Optional observance",label_fr:"Pratique facultative",title:"",body:guide.how_en,body_fr:guide.how_fr}
        ]:[]),
        ...(custom.guardrail?[{label:"Pastoral context",label_fr:"Contexte pastoral",title:"",body:custom.guardrail,body_fr:guide?.caution_fr??null}]:[]),
        ...novenaSections,
      ]),
      attestation_examples:Object.freeze(examples),
      source_links:Object.freeze(dedupe(attestations.flatMap(item=>list(item.source_links)),source=>source.url||source.id)),
      actions:Object.freeze(dedupe(attestations.flatMap(item=>list(item.actions)).filter(action=>action?.novena_id),action=>action.novena_id)),
      note:"Locations identify documented examples, not an exclusive national ownership or a claim that all local Catholics observe the practice.",
      note_fr:"Ces lieux correspondent à des exemples documentés ; ils ne signifient pas que cette pratique est observée partout dans la région.",
      custom_guidance:guide,
      search_text:[...attestations.map(item=>clean(item.search_text)),guide?.title_fr,guide?.description_en,guide?.description_fr].filter(Boolean).join(" ").toLowerCase(),
      raw:Object.freeze({custom,attestations:attestations.map(item=>item.raw?.attestation).filter(Boolean)}),
    });
  }));
}

export function countCanonicalTraditions(items){
  return new Set(list(items).filter(item=>item?.kind==="CUSTOM_ATTESTATION")
    .map(item=>clean(item.raw?.custom?.custom_id)).filter(Boolean)).size;
}
