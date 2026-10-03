// PRE_GOSPEL_SEQUENCE compiler.
// Structural rule: preserve the parsed source section order exactly.
// Numeric suffixes are identifiers only and MUST NOT be used to pair/reorder nodes.

const SECTION_TYPES=Object.freeze([
  [/^OratioL\d+$/,"ORATION"],
  [/^LectioL\d+$/,"LESSON"],
  [/^GradualeL\d+$/,"GRADUAL"],
  [/^TractusL\d+$/,"TRACT"],
  [/^AlleluiaL\d+$/,"ALLELUIA"],
  [/^SequentiaL\d+$/,"SEQUENCE"],
]);

function typeFor(sectionId){
  const id=String(sectionId??"");
  for(const [pattern,type] of SECTION_TYPES){
    if(pattern.test(id)) return type;
  }
  return null;
}

function normalizedOrder(source){
  if(!source || !Array.isArray(source.order)) return [];
  return source.order.map(String).filter(id=>id!=="__TOP__");
}

function recognizedOrder(source){
  return normalizedOrder(source).filter(id=>typeFor(id));
}

function hasPayload(source,id){
  if(!source) return false;
  const map=source.map;
  if(map instanceof Map){
    const value=map.get(id);
    return Array.isArray(value) ? value.some(x=>String(x??"").trim()) : Boolean(String(value??"").trim());
  }
  if(map && typeof map==="object"){
    const value=map[id];
    return Array.isArray(value) ? value.some(x=>String(x??"").trim()) : Boolean(String(value??"").trim());
  }
  return false;
}

function assertUnique(ids,label){
  const seen=new Set();
  for(const id of ids){
    if(seen.has(id)) throw new Error(label+": duplicate source section "+id);
    seen.add(id);
  }
}

function sameArray(a,b){
  return a.length===b.length && a.every((value,index)=>value===b[index]);
}

function chooseStructuralLanguage(sources){
  for(const language of ["la","en","fr"]){
    if(recognizedOrder(sources?.[language]).length) return language;
  }
  return null;
}

function sourceRef(sourcePath,sectionId){
  const prefix=String(sourcePath??"DIVINUM").replace(/:+$/,"");
  return prefix+":"+sectionId;
}

export function compilePreGospelSequenceFromSources({
  sources,
  sourcePath="DIVINUM",
  requireSequence=false,
}={}){
  if(!sources || typeof sources!=="object") throw new TypeError("Parsed Proper sources required");

  const structuralLanguage=chooseStructuralLanguage(sources);
  if(!structuralLanguage){
    if(requireSequence) throw new Error("PRE_GOSPEL_SEQUENCE required but no ordered extended-reading sections were found");
    return Object.freeze({
      schema:"ao-pre-gospel-source-order-v1",
      orderAuthority:"SOURCE_ORDER",
      structuralLanguage:null,
      sourcePath,
      sourceOrder:Object.freeze([]),
      sequence:Object.freeze([]),
    });
  }

  const structuralIds=recognizedOrder(sources[structuralLanguage]);
  assertUnique(structuralIds,structuralLanguage+" order");

  // If another language exposes structural IDs, it must expose the same structural
  // order. Missing translations are allowed in the maps; structural drift is not.
  for(const language of ["la","en","fr"]){
    if(language===structuralLanguage) continue;
    const ids=recognizedOrder(sources[language]);
    if(!ids.length) continue;
    assertUnique(ids,language+" order");
    if(!sameArray(ids,structuralIds)){
      throw new Error(
        "PRE_GOSPEL_SEQUENCE structural order mismatch: "+
        structuralLanguage+"=["+structuralIds.join(",")+"] "+
        language+"=["+ids.join(",")+"]"
      );
    }
  }

  const sequence=structuralIds.map((sectionId,index)=>{
    const payloadLanguages=["la","en","fr"].filter(language=>hasPayload(sources[language],sectionId));
    if(payloadLanguages.length===0){
      throw new Error(sectionId+": source-order node has no payload in any language");
    }
    return Object.freeze({
      id:"PRE_GOSPEL."+String(index+1).padStart(2,"0")+"."+sectionId,
      type:typeFor(sectionId),
      sourceSectionId:sectionId,
      sourceOrderIndex:index,
      orderAuthority:"SOURCE_ORDER",
      structuralLanguage,
      payloadRef:sectionId,
      payloadLanguages:Object.freeze(payloadLanguages),
      sourceRef:sourceRef(sourcePath,sectionId),
    });
  });

  if(requireSequence && sequence.length===0){
    throw new Error("PRE_GOSPEL_SEQUENCE required but compiled empty");
  }

  return Object.freeze({
    schema:"ao-pre-gospel-source-order-v1",
    orderAuthority:"SOURCE_ORDER",
    structuralLanguage,
    sourcePath,
    sourceOrder:Object.freeze([...structuralIds]),
    sequence:Object.freeze(sequence),
  });
}

export function assertSourceOrderedPreGospelSequence(compiled){
  if(!compiled || compiled.schema!=="ao-pre-gospel-source-order-v1"){
    throw new TypeError("ao-pre-gospel-source-order-v1 required");
  }
  if(compiled.orderAuthority!=="SOURCE_ORDER") throw new Error("PRE_GOSPEL_SEQUENCE is not source-order authoritative");
  if(!Array.isArray(compiled.sequence) || !Array.isArray(compiled.sourceOrder)){
    throw new Error("PRE_GOSPEL_SEQUENCE source-order arrays required");
  }
  if(compiled.sequence.length!==compiled.sourceOrder.length){
    throw new Error("PRE_GOSPEL_SEQUENCE source-order denominator changed");
  }
  for(let index=0;index<compiled.sequence.length;index++){
    const node=compiled.sequence[index];
    if(node.sourceOrderIndex!==index) throw new Error(node.id+": sourceOrderIndex changed");
    if(node.sourceSectionId!==compiled.sourceOrder[index]) throw new Error(node.id+": source section order changed");
    if(node.orderAuthority!=="SOURCE_ORDER") throw new Error(node.id+": node lost SOURCE_ORDER authority");
  }
  return compiled;
}

export function preGospelManifestFields(compiled){
  assertSourceOrderedPreGospelSequence(compiled);
  return Object.freeze({
    preGospelSequence:compiled.sequence,
    preGospelSequenceProvenance:Object.freeze({
      schema:compiled.schema,
      orderAuthority:compiled.orderAuthority,
      structuralLanguage:compiled.structuralLanguage,
      sourcePath:compiled.sourcePath,
      sourceOrder:compiled.sourceOrder,
    }),
  });
}

export function assertPreGospelSourceOrderProof(sequence,provenance){
  if(!provenance || provenance.schema!=="ao-pre-gospel-source-order-v1"){
    throw new Error("PRE_GOSPEL_SEQUENCE source-order provenance is required");
  }
  if(provenance.orderAuthority!=="SOURCE_ORDER"){
    throw new Error("PRE_GOSPEL_SEQUENCE provenance lost SOURCE_ORDER authority");
  }
  if(!Array.isArray(sequence) || !Array.isArray(provenance.sourceOrder)){
    throw new Error("PRE_GOSPEL_SEQUENCE and sourceOrder arrays required");
  }
  if(sequence.length!==provenance.sourceOrder.length){
    throw new Error("PRE_GOSPEL_SEQUENCE source-order denominator mismatch");
  }
  for(let index=0;index<sequence.length;index++){
    const node=sequence[index];
    if(node?.orderAuthority!=="SOURCE_ORDER"){
      throw new Error("PRE_GOSPEL_SEQUENCE["+index+"] lacks SOURCE_ORDER authority");
    }
    if(node?.sourceOrderIndex!==index){
      throw new Error("PRE_GOSPEL_SEQUENCE["+index+"] sourceOrderIndex mismatch");
    }
    if(node?.sourceSectionId!==provenance.sourceOrder[index]){
      throw new Error("PRE_GOSPEL_SEQUENCE["+index+"] does not preserve source order");
    }
  }
  return provenance;
}

export function withCompiledPreGospelSequence(manifest,{
  sources,
  sourcePath="DIVINUM",
}={}){
  if(!manifest || typeof manifest!=="object") throw new TypeError("Proper manifest object required");
  const compiled=compilePreGospelSequenceFromSources({
    sources,
    sourcePath,
    requireSequence:true,
  });
  const fields=preGospelManifestFields(compiled);
  return Object.freeze({
    ...manifest,
    ...fields,
    requirements:Object.freeze({
      ...(manifest.requirements??{}),
      preGospelSequence:true,
      preGospelSourceOrder:true,
    }),
  });
}
