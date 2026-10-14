// Canon inline rubric release bridge: only events already in the published
// source-backed R17 rubric registry may be used. Never promote the unapproved
// 62-action editorial/French research registry into live content.
const CUE=/^AO\.SM\.C\d{4}$/;
const SOURCE_1962="MR62_RITUS";
const LIVE_STATUS="SOURCE_BACKED_OVERLAY";
const CANON_START=150,CANON_END=207;
// Frozen published identity gate. Editorial R62 research ids never qualify.
// Review this list against data/presentation/reader-rubric-events.v1.json
// whenever a new Canon R17 item is independently approved for release.
const APPROVED_CANON_IDS=new Set([
  "AO.RUB.C0155.01",
  "AO.RUB.C0158.01",
  "AO.RUB.C0161.01",
  "AO.RUB.C0167.01",
  "AO.RUB.C0169.01",
  "AO.RUB.C0170.01",
  "AO.RUB.C0174.01",
  "AO.RUB.C0174.02",
  "AO.RUB.C0174.04",
  "AO.RUB.C0174.05",
  "AO.RUB.C0176.01",
  "AO.RUB.C0181.01",
  "AO.RUB.C0181.02",
  "AO.RUB.C0181.04",
  "AO.RUB.C0181.05",
  "AO.RUB.C0193.01",
  "AO.RUB.C0200.01",
  "AO.RUB.C0202.01",
  "AO.RUB.C0203.01"
]);
const SOLEMN_MIXED_ROLE_EVENTS=new Set(["AO.RUB.C0181.04"]);

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
  const sourceIds=Array.isArray(paragraph?.sourceCueIds)?paragraph.sourceCueIds:[];
  const ids=[...new Set(sourceIds.filter(id=>{
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
  const withheldMixedRoleEventIds=[];
  for(const cueId of ids){
    const events=registry.items.filter(x=>x.cueId===cueId &&
      APPROVED_CANON_IDS.has(x.id) &&
      x.id.startsWith("AO.RUB."+cueId.slice(-5)+".") &&
      x.actor==="PRIEST" && x.authorityClass==="1962_NORMATIVE" &&
      Array.isArray(x.sources)&&x.sources.includes(SOURCE_1962) &&
      x.kind!=="STATE" && typeof x.label==="string" && x.label.trim() &&
      Number.isInteger(x.order));
    for(const event of [...events].sort((a,b)=>a.order-b.order)){
      // The published registry combines "REPLACES AND COVERS CHALICE" as a
      // PRIEST event. At Solemn Mass covering may belong to the deacon.
      // Hide the entire composite, rather than falsely assign its ownership.
      if(String(form).toUpperCase()==="SOLEMN" &&
         SOLEMN_MIXED_ROLE_EVENTS.has(event.id)){
        withheldMixedRoleEventIds.push(event.id);
        continue;
      }
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
    withheldMixedRoleEventIds:immutable(withheldMixedRoleEventIds),
  });
}

/** Only decorate original prayer rows. Keep published ID and Solemn-actor gates. */
export function withPublishedCanonParagraphRubrics(paragraphs,registry,options={}){
  if(!Array.isArray(paragraphs))return immutable([]);
  return immutable(paragraphs.map(paragraph=>{
    const projection=publishedCanonRubricsForParagraph(paragraph,registry,options);
    return projection.rubrics.length
      ? immutable({...paragraph,publishedCanonRubrics:projection.rubrics})
      : paragraph;
  }));
}
