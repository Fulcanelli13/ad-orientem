// R26 native Requiem reader projection and following Absolution.
// Exact fixed-text changes are data-driven. The canonical Mass graph is never mutated.

function freeze(v){return Object.freeze(v)}
function arr(v){return Array.isArray(v)?v:[]}
function upper(v){return String(v??"").trim().toUpperCase()}

export function validateRequiemRules(rules){
  if(rules?.schema!=="ao-r26-requiem-reader-rules-v1")throw new Error("Pinned R26 Requiem reader rules required");
  if(Number(rules.graphRecordCount)!==18)throw new Error("Requiem reader rules lost recovered 18-record graph coverage");
  const required=["AO.SM.B003","AO.SM.B023","AO.SM.B026","AO.SM.B037","AO.SM.B068","AO.SM.B069","AO.SM.B090","AO.SM.B092"];
  for(const id of required)if(!rules.blockPolicies?.[id])throw new Error("Requiem rule missing "+id);
  return freeze({schema:rules.schema,graphRecordCount:rules.graphRecordCount,requiredBlocks:freeze(required)});
}

function sourceSequence(card){return Number(card?.sourceSequence??card?.sequence??0)}

function paragraphCueIds(p){
  return new Set([p?.id,...arr(p?.sourceCueIds)].filter(Boolean).map(String));
}

function freezeCard(card){
  return freeze({...card,paragraphs:freeze([...arr(card.paragraphs)]),blocks:freeze([...arr(card.blocks)])});
}

function normalizeReplacement(row){
  const kind=upper(row.kind??"TEXT");
  const latin=row.latin==null?null:String(row.latin);
  const english=row.english==null?null:String(row.english);
  const dialogue=kind==="RESPONSE" || kind==="VERSICLE";
  if(!latin)throw new Error("Requiem replacement row requires Latin");
  if(dialogue){
    return freeze({
      id:String(row.id),
      kind:kind==="VERSICLE"?"TEXT":"RESPONSE",
      primary:latin,
      secondary:english,
      alternate:null,
      replaceOnToggle:false,
      sourceCueIds:freeze([...arr(row.sourceCueIds).map(String)]),
      requiemFixed:true,
    });
  }
  if(!english)throw new Error("Requiem fixed text requires vernacular primary");
  return freeze({
    id:String(row.id),
    kind,
    primary:english,
    secondary:null,
    alternate:latin,
    replaceOnToggle:true,
    sourceCueIds:freeze([...arr(row.sourceCueIds).map(String)]),
    requiemFixed:true,
  });
}

function transformCard(card,rules){
  const paragraphs=[];
  const blocks=[];
  for(const meta of arr(card.blocks)){
    const policy=rules.blockPolicies?.[meta.blockId]??null;
    if(policy?.action==="DROP_BLOCK")continue;
    if(meta.firstParagraphIndex==null || !meta.paragraphCount){
      blocks.push(freeze({...meta}));
      continue;
    }
    let rows=arr(card.paragraphs).slice(meta.firstParagraphIndex,meta.firstParagraphIndex+meta.paragraphCount);
    if(policy?.action==="DROP_CUES"){
      const drop=new Set(arr(policy.cueIds).map(String));
      rows=rows.filter(p=>![...paragraphCueIds(p)].some(id=>drop.has(id)));
    }else if(policy?.action==="REPLACE_PARAGRAPHS"){
      rows=arr(policy.paragraphs).map(normalizeReplacement);
    }
    if(!rows.length)continue;
    const first=paragraphs.length;
    paragraphs.push(...rows);
    blocks.push(freeze({...meta,firstParagraphIndex:first,paragraphCount:rows.length,requiemPolicy:policy?.reason??null}));
  }
  return freezeCard({
    ...card,
    paragraphs,
    blocks,
    requiemProjected:true,
    provenance:freeze({...card.provenance,requiemReader:"R26_SOURCE_PINNED"}),
  });
}

function rebuildModel(model,cards){
  const frozen=freeze(cards.map((card,index)=>freezeCard({...card,sequence:index+1,requiemSourceSequence:sourceSequence(card)})));
  const bySection=new Map(frozen.map(c=>[c.sectionId,c]));
  function cardBySequence(n){
    n=Number(n);return Number.isInteger(n)&&n>=1&&n<=frozen.length?frozen[n-1]:null;
  }
  function cardForEvent(eventId){
    const hit=model.cardForEvent?.(eventId);
    if(!hit)return null;
    const card=bySection.get(hit.card?.sectionId);
    if(!card)return null;
    return freeze({...hit,card,progress:freeze({index:card.sequence,total:frozen.length,label:card.sequence+" / "+frozen.length})});
  }
  function neighbor(sectionId,dir){
    const card=bySection.get(String(sectionId));
    if(!card)return null;
    return cardBySequence(card.sequence+(dir==="previous"?-1:1));
  }
  return freeze({
    ...model,
    cards:frozen,
    totalCards:frozen.length,
    structureOwner:String(model.structureOwner??"BASE_30_MACROS")+"+R26_REQUIEM",
    requiemProjected:true,
    cardBySequence,
    cardForEvent,
    previousCard:id=>neighbor(id,"previous"),
    nextCard:id=>neighbor(id,"next"),
  });
}

export function projectRequiemReaderModel(model,rules,{followingActions=[]}={}){
  validateRequiemRules(rules);
  if(!model?.cards?.length)throw new TypeError("Reader model required");
  const suppressed=new Set(arr(rules.suppressSourceSequences).map(Number));
  const hasAbsolution=arr(followingActions).map(upper).includes("REQUIEM_ABSOLUTION");
  if(hasAbsolution)suppressed.add(30);
  const cards=[];
  for(const card of model.cards){
    if(suppressed.has(sourceSequence(card)))continue;
    cards.push(transformCard(card,rules));
  }
  const projected=rebuildModel(model,cards);
  const expected=model.totalCards-(hasAbsolution?3:2);
  if(projected.totalCards!==expected)throw new Error("Requiem reader card-count projection mismatch");
  return projected;
}

export function requiemCuePolicy(rules,cueId,{form=null}={}){
  validateRequiemRules(rules);
  const policy=rules.cuePolicies?.[String(cueId??"")]??null;
  if(!policy)return null;
  const solemn=upper(form)==="SOLEMN";
  return freeze({
    reason:policy.reason??null,
    suppressFaithfulGesture:policy.suppressFaithfulGesture===true,
    omitWaterCross:policy.omitWaterCross===true,
    priestAction:policy.solemnIncenseCelebrantOnly&&solemn
      ? freeze({label:"INCENSES CELEBRANT ONLY — NOT CLERGY OR PEOPLE",owner:"R26_REQUIEM_SOURCE"})
      : null,
    suppressSolemnGospelLightsAndIncense:Boolean(policy.solemnGospelNoLightsOrIncense&&solemn),
  });
}

function validateAbsolution({graph,payload}={}){
  if(!Array.isArray(graph)||graph.length!==5)throw new Error("Recovered five-record Requiem Absolution graph required");
  if(payload?.schema!=="ao-r26-requiem-absolution-payload-v1")throw new Error("Pinned Requiem Absolution payload required");
  if(Number(payload.graphRecordCount)!==graph.length)throw new Error("Requiem Absolution graph count mismatch");
  const graphIds=new Set(graph.map(x=>x.id));
  for(const card of arr(payload.cards))for(const id of arr(card.sourceRecordIds))if(!graphIds.has(id))throw new Error("Absolution card "+card.id+" references missing "+id);
  return true;
}

function absRow(row){
  const latin=String(row?.latin??"").trim();
  if(!latin)throw new Error("Blank Requiem Absolution text row");
  return freeze({id:String(row.id),kind:String(row.kind??"TEXT"),latin,english:row.english??null,sourceRecordId:row.sourceRecordId??null});
}

export function createRequiemAbsolutionController({graph,payload,bodyPresent,burialProcession=false}={}){
  validateAbsolution({graph,payload});
  if(typeof bodyPresent!=="boolean")throw new Error("REQUIEM_ABSOLUTION_BODY_PRESENCE_REQUIRED");
  const cards=arr(payload.cards).filter(card=>{
    if(card.condition==="BODY_PRESENT")return bodyPresent;
    if(card.condition==="BODY_PRESENT_AND_BURIAL_PROCESSION")return bodyPresent&&burialProcession===true;
    return true;
  }).map(card=>freeze({...card,paragraphs:freeze(arr(card.paragraphs).map(absRow))}));
  let index=0;
  function snapshot(){
    const card=cards[index]??null;
    return freeze({
      schema:"ao-r26-requiem-absolution-state-v1",
      supported:true,index,total:cards.length,atStart:index===0,atEnd:index===cards.length-1,
      card,bodyPresent,burialProcession:Boolean(burialProcession),
      handoff:card?.handoff??null,
    });
  }
  function next(){index=Math.min(index+1,cards.length-1);return snapshot()}
  function previous(){index=Math.max(index-1,0);return snapshot()}
  function goTo(id){const hit=cards.findIndex(x=>x.id===id);if(hit>=0)index=hit;return snapshot()}
  return freeze({schema:"ao-r26-requiem-absolution-controller-v1",supported:true,cards:freeze(cards),project:snapshot,next,previous,goTo});
}

async function readJson(fetchImpl,url,label){
  const r=await fetchImpl(url);
  if(!r?.ok)throw new Error("Unable to load "+label+" ("+(r?.status??"network")+")");
  const data=await r.json();
  if(!data||typeof data!=="object")throw new Error(label+" did not return JSON object");
  return data;
}

export async function loadRequiemAbsolutionData({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const payloadUrl=new URL("../../data/presentation/reader-requiem-absolution.v1.json",baseUrl);
  const extensionUrl=new URL("../../data/mass/special-days-extension.v1.3.json",baseUrl);
  const [payload,extension]=await Promise.all([
    readJson(fetchImpl,payloadUrl,"Requiem Absolution payload"),
    readJson(fetchImpl,extensionUrl,"special-days extension"),
  ]);
  const graph=extension?.graphs?.ABS;
  validateAbsolution({graph,payload});
  return freeze({payload,graph:freeze([...graph]),urls:freeze({payload:String(payloadUrl),extension:String(extensionUrl)})});
}
