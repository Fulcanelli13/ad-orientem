// Canon inline rubric release bridge: only events already in the published
// source-backed R17 rubric registry may be used. Never promote the unapproved
// 62-action editorial/French research registry into live content.
const CUE=/^AO\.SM\.C\d{4}$/;
const SOURCE_1962="MR62_RITUS";
const LIVE_STATUS="SOURCE_BACKED_OVERLAY";
const CANON_START=150,CANON_END=207;
const ordinal=id=>CUE.test(String(id??""))?Number(String(id).slice(-4)):null;
const immutable=x=>Object.freeze(x);

export function publishedCanonRubricsForParagraph(paragraph,registry,{
  form="MISSA_CANTATA_SIMPLE",
}={}){
  if(registry?.schema!=="ao-reader-rubric-events-v1" ||
     registry?.status!==LIVE_STATUS ||
     registry?.authority!=="PRESENTATION_RUBRIC_DETAIL_ONLY" ||
     !Array.isArray(registry.items))
    return immutable({status:"UNVERIFIED_REGISTRY",paragraphId:String(paragraph?.id??""),
      rubrics:immutable([])});
  const ids=[...new Set((paragraph?.sourceCueIds??[]).filter(id=>{
    const n=ordinal(id);return n!=null&&n>=CANON_START&&n<=CANON_END;
  }))];
  const allowed=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
  if(!allowed.has(String(form).toUpperCase()))
    return immutable({status:"FORM_NOT_APPROVED",paragraphId:String(paragraph?.id??""),
      rubrics:immutable([])});
  const normativeSource=registry.sources?.find(source=>source.id===SOURCE_1962);
  const sourceUrl=typeof normativeSource?.url==="string" &&
    /^https:\/\//.test(normativeSource.url) ? normativeSource.url : null;
  const entries=[];
  for(const cueId of ids){
    const events=registry.items.filter(x=>x.cueId===cueId &&
      x.actor==="PRIEST" && x.authorityClass==="1962_NORMATIVE" &&
      Array.isArray(x.sources)&&x.sources.includes(SOURCE_1962) &&
      x.kind!=="STATE" && typeof x.label==="string" && x.label.trim() &&
      Number.isInteger(x.order));
    for(const event of [...events].sort((a,b)=>a.order-b.order)){
      entries.push(immutable({
        id:event.id,sourceCueId:cueId,actor:"PRIEST",
        shortAction:event.label,latinTrigger:event.triggerLat??null,
        sourceId:SOURCE_1962,sourceUrl,order:event.order,
        review:"EXISTING_PUBLISHED_R17_1962_RUBRIC",
        // Source order is NOT proof that the priest is doing it right now.
        observedNow:false,
      }));
    }
  }
  return immutable({
    status:entries.length?"PUBLISHED_SOURCE_MATCH":"NO_CERTIFIED_INLINE_RUBRIC",
    paragraphId:String(paragraph?.id??""),
    rubrics:immutable(entries),
  });
}

/** Add certified actions to existing rows, without synthetic prayer or scroll cues. */
export function withPublishedCanonParagraphRubrics(paragraphs,registry,options={}){
  if(!Array.isArray(paragraphs))return immutable([]);
  return immutable(paragraphs.map(paragraph=>{
    const result=publishedCanonRubricsForParagraph(paragraph,registry,options);
    return result.rubrics.length
      ? immutable({...paragraph,publishedCanonRubrics:result.rubrics})
      : paragraph;
  }));
}
