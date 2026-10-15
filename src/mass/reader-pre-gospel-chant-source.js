// Exact named chant ownership only: never infer boundaries from words or
// dates. The host's flattened Proper must equal the ordered source payloads
// in ALL three languages before the reader is allowed to split its cards.
const NAMES=Object.freeze({Graduale:"GRADUAL",Alleluia:"ALLELUIA",Tractus:"TRACT"});
const LANGUAGES=Object.freeze(["la","en","fr"]);
const cleaned=v=>String(v??"").replace(/\u00a0/g," ").replace(/\s+/gu," ").trim();
const textOf=(entry,language)=>String(entry?.[language==="la"?"lat":language]??"");
const orderOf=source=>Array.isArray(source?.order)?source.order.map(String):[];
const rowsOf=(source,id)=>{
  const raw=source?.map instanceof Map?source.map.get(id):source?.map?.[id];
  return Array.isArray(raw)?raw:null;
};
function meaningful(text){return Boolean(cleaned(text)&&!/(^|\n)\s*[$@]/m.test(String(text)));}
// Some authentic Divinum [Graduale] sections contain two chants. A
// recognized liturgical separator must be found independently in all three
// originals; its exact source text must reconstruct the host's flattened
// Proper. A mere occurrence of 'Alleluia' later in a verse is insufficient.
const DOUBLE_ALLELUIA=/(?:Allel[úu]ja|Allel[úu]ia|Alléluia),?\s+(?:Allel[úu]ja|Allel[úu]ia|Alléluia)\.?/giu;
function separateWithinGraduale(rows,language,normalizeRows){
  const raw=(rows??[]).map(String);
  const tractIndex=raw.findIndex(line=>/^!\s*Tractus\.?\s*$/iu.test(line));
  if(tractIndex>=0){
    const first=normalizeRows(raw.slice(0,tractIndex),language);
    const second=normalizeRows(raw.slice(tractIndex),language);
    if(meaningful(first)&&meaningful(second))return {kind:"TRACT",texts:[first,second]};
    return null;
  }
  const text=normalizeRows(raw,language);
  const hits=[...text.matchAll(DOUBLE_ALLELUIA)];
  if(hits.length!==1)return null;
  const at=hits[0].index;
  const gradual=text.slice(0,at).trimEnd(),alleluia=text.slice(at).trimStart();
  if(!meaningful(gradual)||!meaningful(alleluia))return null;
  return {kind:"ALLELUIA",texts:[gradual,alleluia]};
}
function certifyWithinOneSection(proper,{sources,normalizeRows,path}){
  const languages={},types=[];
  for(const language of LANGUAGES){
    const parsed=sources[language];
    const order=orderOf(parsed).filter(id=>Object.hasOwn(NAMES,id));
    if(order.length!==1||order[0]!=="Graduale")return null;
    const rows=rowsOf(parsed,"Graduale");
    if(!rows?.length)return null;
    const original=normalizeRows(rows,language);
    if(!meaningful(original)||
      cleaned(original)!==cleaned(textOf(proper.gradual,language)))return null;
    const split=separateWithinGraduale(rows,language,normalizeRows);
    if(!split)return null;
    if(cleaned(split.texts.join(" "))!==cleaned(original))return null;
    types.push(split.kind);languages[language]=split.texts;
  }
  if(types.some(type=>type!==types[0]))return null;
  const kinds=["GRADUAL",types[0]];
  const ids=kinds.map(kind=>"Graduale#"+kind);
  return Object.freeze({
    status:"SOURCE_VERIFIED_EXACT",sourceMode:"INTRA_SECTION_TRILINGUAL_BOUNDARY",
    sourcePath:path,sourceOrder:Object.freeze(ids),
    aggregateVerifiedLanguages:LANGUAGES,
    parts:Object.freeze(kinds.map((kind,i)=>Object.freeze({
      kind,sourceSectionId:ids[i],
      sourceRef:path+":"+ids[i],
      lat:languages.la[i],en:languages.en[i],fr:languages.fr[i],
    }))),
  });
}

export function certifyPreGospelChantParts(proper,{sources,normalizeRows}={}){
  if(!proper||!sources||typeof normalizeRows!=="function")return null;
  const path=String(proper.sourcePath??"").trim();
  if(!path||!proper.gradual)return null;
  const baseOrder=orderOf(sources.la).filter(id=>Object.hasOwn(NAMES,id));
  // Indexed extended-lesson GradualeL... uses a separate sequence model;
  // do not compact it into the single ordinary-Mass Gradual.
  if(baseOrder.length!==2||baseOrder[0]!=="Graduale"||
    !["Alleluia","Tractus"].includes(baseOrder[1])){
    return certifyWithinOneSection(proper,{sources,normalizeRows,path});
  }
  const order=Object.freeze(baseOrder);
  const languages={};
  for(const language of LANGUAGES){
    const parsed=sources[language];
    const ownOrder=orderOf(parsed).filter(id=>Object.hasOwn(NAMES,id));
    if(JSON.stringify(ownOrder)!==JSON.stringify(order))return null;
    const texts=[];
    for(const id of order){
      const rows=rowsOf(parsed,id);
      if(!rows?.length)return null;
      const text=normalizeRows(rows,language);
      if(!meaningful(text))return null;
      texts.push(text);
    }
    const aggregate=textOf(proper.gradual,language);
    if(!meaningful(aggregate)||cleaned(texts.join("\n"))!==cleaned(aggregate)){
      return null; // No partial heuristic fallback: leave original card intact.
    }
    languages[language]=texts;
  }
  return Object.freeze({
    status:"SOURCE_VERIFIED_EXACT",
    sourcePath:path,
    sourceOrder:order,
    aggregateVerifiedLanguages:LANGUAGES,
    parts:Object.freeze(order.map((id,index)=>Object.freeze({
      kind:NAMES[id],
      sourceSectionId:id,
      sourceRef:path+":"+id,
      lat:languages.la[index],en:languages.en[index],fr:languages.fr[index],
    }))),
  });
}

export function validatedPreGospelChantParts(proper){
  const proof=proper?.readerChantSourceProof;
  if(!proof)return null;
  if(proof.status!=="SOURCE_VERIFIED_EXACT"||
    proof.sourcePath!==proper.sourcePath ||
    !Array.isArray(proof.parts)||proof.parts.length!==2 ||
    JSON.stringify(proof.sourceOrder)!==
      JSON.stringify(proof.parts.map(p=>p.sourceSectionId)) ||
    JSON.stringify(proof.aggregateVerifiedLanguages)!==
      JSON.stringify(LANGUAGES) ||
    proof.parts[0].kind!=="GRADUAL"||
    !["ALLELUIA","TRACT"].includes(proof.parts[1].kind) ||
    !(
      (proof.parts[0].sourceSectionId==="Graduale"&&
       proof.parts[1].sourceSectionId===
         (proof.parts[1].kind==="ALLELUIA"?"Alleluia":"Tractus"))
      ||
      (proof.sourceMode==="INTRA_SECTION_TRILINGUAL_BOUNDARY"&&
       proof.parts[0].sourceSectionId==="Graduale#GRADUAL"&&
       proof.parts[1].sourceSectionId==="Graduale#"+proof.parts[1].kind)
    )){
    throw new Error("PRE_GOSPEL_UNVERIFIED_SOURCE_PARTS:"+JSON.stringify({
      currentSourcePath:proper?.sourcePath,proofSourcePath:proof?.sourcePath,
      proofStatus:proof?.status,proofMode:proof?.sourceMode,
      names:proof?.parts?.map(p=>[p.kind,p.sourceSectionId,p.sourceRef]),
      sourceOrder:proof?.sourceOrder,
      languages:proof?.aggregateVerifiedLanguages,
    }));
  }
  for(const part of proof.parts){
    if(part.sourceRef!==proper.sourcePath+":"+part.sourceSectionId)
      throw new Error("PRE_GOSPEL_CHANT_SOURCE_IDENTITY_DRIFT");
  }
  for(const language of LANGUAGES){
    const combined=proof.parts.map(p=>textOf(p,language)).join("\n");
    if(proof.parts.some(p=>!meaningful(textOf(p,language))) ||
      cleaned(combined)!==cleaned(textOf(proper.gradual,language))){
      throw new Error("PRE_GOSPEL_CHANT_TEXT_PARITY_FAILED_"+language.toUpperCase());
    }
  }
  return Object.freeze([...proof.parts]);
}
