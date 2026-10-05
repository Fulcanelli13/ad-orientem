// R17 cue-scoped reader state projection.
// Source-backed only: exact cue IDs from the certified Sung Mass blueprint.
// No text scanning, no title/phase heuristics, no canonical chronology mutation.

const SOURCE_SHA="2f091b2f099387cbd709cadd78aff5c25ca1d4152ad0af18083edf301609891f";

export const READER_CUE_FILES=Object.freeze({
  gestures:"reader-gestures.v1.json",
  responses:"reader-responses.v1.json",
  postures:"reader-postures.v1.json",
  positions:"reader-priest-positions.v1.json",
  voices:"reader-priest-voices.v1.json",
});

const EXPECTED=Object.freeze({
  gestures:Object.freeze({schema:"ao-r17-reader-gestures-v1",count:59}),
  responses:Object.freeze({schema:"ao-r17-reader-responses-v1",count:23}),
  postures:Object.freeze({schema:"ao-r17-reader-postures-v1",count:23}),
  positions:Object.freeze({schema:"ao-r17-reader-priest-positions-v1",count:49}),
  voices:Object.freeze({schema:"ao-r17-reader-priest-voices-v1",count:126}),
});

const SUPPORTED_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);

function urlFor(file,baseUrl){
  return new URL("../../data/presentation/"+file,baseUrl);
}

async function readJson(fetchImpl,url,label){
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Unable to load "+label+" ("+(response?.status??"network")+")");
  const data=await response.json();
  if(!data || typeof data!=="object")throw new Error(label+" did not return a JSON object");
  return data;
}

export async function loadReaderCueRegistries({
  fetchImpl=globalThis.fetch,
  baseUrl=import.meta.url,
}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("fetch implementation required");
  const entries=Object.entries(READER_CUE_FILES);
  const values=await Promise.all(entries.map(([key,file])=>readJson(fetchImpl,urlFor(file,baseUrl),"reader "+key)));
  return Object.freeze(Object.fromEntries(entries.map(([key],index)=>[key,values[index]])));
}

function cueSortIndex(sungCorpus){
  if(!sungCorpus?.blocks)throw new TypeError("Verified Sung reader corpus required for cue projection");
  const index=new Map();
  for(const block of sungCorpus.blocks){
    for(const unit of block.units??[]){
      const id=String(unit?.cue_id??"");
      if(!/^AO\.SM\.C\d{4}$/.test(id))continue;
      if(index.has(id))throw new Error("Duplicate Sung cue ID "+id);
      const sort=Number(unit.sort);
      if(!Number.isFinite(sort))throw new Error(id+": missing execution sort");
      index.set(id,sort);
    }
  }
  if(index.size!==279)throw new Error("Sung cue execution index changed: "+index.size);
  return index;
}

function validateSource(data,label){
  const expected=EXPECTED[label];
  if(data?.schema!==expected.schema)throw new Error(label+": unexpected schema");
  if(data?.source?.sha256!==SOURCE_SHA)throw new Error(label+": source workbook hash changed");
  if(!Array.isArray(data.items) || data.items.length!==expected.count){
    throw new Error(label+": expected "+expected.count+" source items");
  }
}

function validateCueItems(items,label,sortIndex,{allowNullCue=false,idField=null}={}){
  const seen=new Set();
  for(const item of items){
    if(idField){
      const id=String(item?.[idField]??"");
      if(!id || seen.has(id))throw new Error(label+": duplicate/missing "+idField+" "+id);
      seen.add(id);
    }
    const cue=item?.cueId;
    if(cue==null && allowNullCue)continue;
    if(!/^AO\.SM\.C\d{4}$/.test(String(cue??"")))throw new Error(label+": invalid cue ID "+cue);
    if(!sortIndex.has(cue))throw new Error(label+": cue absent from Sung corpus "+cue);
    if(!idField){
      if(seen.has(cue))throw new Error(label+": duplicate cue "+cue);
      seen.add(cue);
    }
  }
}

export function validateReaderCueRegistries(registries,sungCorpus){
  const sortIndex=cueSortIndex(sungCorpus);
  for(const key of Object.keys(EXPECTED))validateSource(registries?.[key],key);
  validateCueItems(registries.gestures.items,"gestures",sortIndex);
  validateCueItems(registries.responses.items,"responses",sortIndex);
  validateCueItems(registries.postures.items,"postures",sortIndex,{allowNullCue:true,idField:"id"});
  validateCueItems(registries.positions.items,"positions",sortIndex);
  validateCueItems(registries.voices.items,"voices",sortIndex);
  return Object.freeze({
    sourceSha256:SOURCE_SHA,
    cueCount:sortIndex.size,
    gestures:registries.gestures.items.length,
    responses:registries.responses.items.length,
    postures:registries.postures.items.length,
    positions:registries.positions.items.length,
    voices:registries.voices.items.length,
  });
}

function conditionSet(input){
  if(input instanceof Set)return new Set([...input].map(String));
  if(Array.isArray(input))return new Set(input.filter(Boolean).map(String));
  if(input && typeof input==="object")return new Set(Object.entries(input).filter(([,v])=>v===true).map(([k])=>k));
  return new Set();
}

export function conditionPasses(expression,conditions){
  if(expression==null || String(expression).trim()==="")return true;
  const active=conditionSet(conditions);
  const tokens=String(expression).split(/\s*&&\s*/).map(x=>x.trim()).filter(Boolean);
  return tokens.length>0 && tokens.every(token=>active.has(token));
}

export function cueProjectionConditions(prepared){
  const active=new Set();
  const resolved=prepared?.session?.resolvedMass;
  const conditionSources=[
    ...(resolved?.provenance?.conditions??[]),
    ...(resolved?.conditions??[]),
  ];
  for(const value of conditionSources){
    if(typeof value==="string" && value.trim())active.add(value.trim());
    else if(value?.id)active.add(String(value.id));
  }
  const form=String(resolved?.form??"").toUpperCase();
  if(form==="MISSA_CANTATA_INCENSE" || form==="SOLEMN")active.add("INCENSE_ENABLED");
  if(form==="SOLEMN"){active.add("SOLEMN_MASS_PROFILE");active.add("SEDILIA_USED");}
  return active;
}

function displayToken(value){
  return String(value??"").replaceAll("_"," ").replace(/\s+/g," ").trim();
}

function exactByCue(items){
  return new Map(items.map(item=>[item.cueId,item]));
}

// v1.83 recovered runtime gates override ambiguous/duplicated gesture extraction
// without mutating the frozen source registry. The words of Consecration and
// the elevation action must remain distinct perceptible territories.
const V183_GESTURE_SUPPRESS=new Set([
  "AO.SM.C0173", // HOC EST ENIM CORPUS MEUM — words, not elevation
  "AO.SM.C0179", // Chalice consecration words, not elevation
  "AO.SM.C0180", // Hæc quotiescúmque — words, not elevation
]);
const V183_GESTURE_REANCHOR=Object.freeze({
  "AO.SM.C0181":"AO.SM.C0179", // reuse extracted Chalice gesture text at actual action cue
});

function gestureItemForCue(cueId,gestureMap){
  const id=String(cueId??"");
  if(V183_GESTURE_SUPPRESS.has(id))return null;
  const donorId=V183_GESTURE_REANCHOR[id]??id;
  const item=gestureMap.get(donorId)??null;
  return item && donorId!==id ? Object.freeze({...item,cueId:id}) : item;
}

function transitionList(items,sortIndex){
  return Object.freeze(items.map((item,index)=>Object.freeze({
    ...item,
    sourceIndex:index,
    executionSort:sortIndex.get(item.cueId),
  })).sort((a,b)=>a.executionSort-b.executionSort || a.sourceIndex-b.sourceIndex));
}

function latestPassing(transitions,activeSort,conditions){
  let hit=null;
  for(const item of transitions){
    if(item.executionSort>activeSort)break;
    if(conditionPasses(item.condition,conditions))hit=item;
  }
  return hit;
}

function sourceGesture(item){
  if(!item)return null;
  const action=String(item.action??"").trim();
  // The source itself explicitly marks these as conditional/advisory rather than universal.
  if(/do not hard-code as universal/i.test(action) || /depends on sung\/local calendar rule/i.test(action)){
    return Object.freeze({
      label:null,
      action,
      trigger:item.trigger??null,
      scope:item.scope??"INSTANT",
      owner:"R17_SOURCE_ADVISORY_FAIL_CLOSED",
      cueId:item.cueId,
      transient:true,
    });
  }
  return Object.freeze({
    label:action,
    action,
    trigger:item.trigger??null,
    scope:item.scope??"INSTANT",
    owner:"R17_CUE_SOURCE",
    cueId:item.cueId,
    transient:true,
  });
}

function sourceResponse(item){
  if(!item)return null;
  return Object.freeze({
    label:item.text,
    text:item.text,
    owner:item.owner,
    scope:item.scope,
    cueId:item.cueId,
    transient:true,
  });
}

function sourcePosition(item){
  if(!item)return null;
  return Object.freeze({
    label:displayToken(item.station),
    station:item.station,
    facing:item.facing??null,
    routeId:item.routeId??null,
    owner:"R17_CUE_SOURCE",
    cueId:item.cueId,
    persistent:true,
  });
}

function sourceVoice(item){
  if(!item)return null;
  return Object.freeze({
    label:item.voice,
    value:item.voice,
    scope:item.scope,
    owner:"R17_CUE_SOURCE",
    cueId:item.cueId,
  });
}

function sourcePosture(item){
  if(!item)return null;
  return Object.freeze({
    label:item.posture,
    value:item.posture,
    owner:"R17_CUE_SOURCE",
    cueId:item.cueId,
    sourcePostureId:item.id,
    authority:item.authority??null,
    sources:item.sources??null,
    persistent:true,
  });
}

export function createReaderCueStateController({
  registries,
  sungCorpus,
  prepared,
  conditions=null,
}={}){
  const audit=validateReaderCueRegistries(registries,sungCorpus);
  const sortIndex=cueSortIndex(sungCorpus);
  const form=String(prepared?.session?.resolvedMass?.form??"").toUpperCase();
  const supported=SUPPORTED_FORMS.has(form);
  const defaultConditions=conditions==null ? cueProjectionConditions(prepared) : conditionSet(conditions);

  const gestures=exactByCue(registries.gestures.items);
  const responses=exactByCue(registries.responses.items);
  const positions=transitionList(registries.positions.items,sortIndex);
  const voices=transitionList(registries.voices.items,sortIndex);
  const cuePostures=transitionList(
    registries.postures.items.filter(item=>item.cueId),
    sortIndex
  );
  const unresolvedPostureAnchors=Object.freeze(registries.postures.items.filter(item=>!item.cueId));

  function project(cueId,{conditions:overrideConditions=null}={}){
    if(!supported)return Object.freeze({
      supported:false,
      reason:"SUNG_CUE_PROJECTION_NOT_CERTIFIED_FOR_"+(form||"UNKNOWN_FORM"),
      cueId:cueId??null,
      gesture:null,response:null,priestPosition:null,priestVoice:null,posture:null,
      ownership:Object.freeze({
        gesture:"LEGACY_FALLBACK",response:"LEGACY_FALLBACK",
        priestPosition:"LEGACY_FALLBACK",priestVoice:"LEGACY_FALLBACK",
        posture:"LEGACY_FALLBACK",
      }),
    });
    if(!sortIndex.has(String(cueId??"")))return Object.freeze({
      supported:true,reason:"UNKNOWN_OR_SYNTHETIC_CUE",cueId:cueId??null,
      gesture:null,response:null,priestPosition:null,priestVoice:null,posture:null,
      ownership:Object.freeze({
        gesture:"R17_FAIL_CLOSED",response:"R17_FAIL_CLOSED",
        priestPosition:"R17_FAIL_CLOSED",priestVoice:"R17_FAIL_CLOSED",
        posture:"R17_FAIL_CLOSED",
      }),
    });

    const activeConditions=overrideConditions==null ? defaultConditions : conditionSet(overrideConditions);
    const activeSort=sortIndex.get(cueId);

    const gestureItem=gestureItemForCue(cueId,gestures);
    const gestureAllowed=gestureItem && conditionPasses(gestureItem.condition,activeConditions);
    const gesture=gestureAllowed ? sourceGesture(gestureItem) : null;

    const responseItem=responses.get(cueId);
    const response= responseItem && conditionPasses(responseItem.condition,activeConditions)
      ? sourceResponse(responseItem) : null;

    const positionItem=latestPassing(positions,activeSort,activeConditions);
    const voiceItem=latestPassing(voices,activeSort,activeConditions);
    const postureItem=latestPassing(cuePostures,activeSort,activeConditions);

    return Object.freeze({
      supported:true,
      reason:null,
      cueId,
      executionSort:activeSort,
      gesture:gesture?.label ? gesture : null,
      gestureAdvisory:gesture && !gesture.label ? gesture : null,
      response,
      priestPosition:sourcePosition(positionItem),
      priestVoice:sourceVoice(voiceItem),
      posture:sourcePosture(postureItem),
      ownership:Object.freeze({
        gesture:gesture?.label ? "R17_CUE_NATIVE" : gesture ? "R17_SOURCE_ADVISORY_FAIL_CLOSED" : "R17_EXACT_CUE_NONE",
        response:response ? "R17_CUE_NATIVE" : "R17_EXACT_CUE_NONE",
        priestPosition:positionItem ? "R17_CUE_NATIVE_PERSISTENT" : "R17_FAIL_CLOSED",
        priestVoice:voiceItem ? "R17_CUE_NATIVE_RUN" : "R17_FAIL_CLOSED",
        posture:postureItem ? "R17_CUE_NATIVE_PERSISTENT" : "R17_PROFILE_OR_ANCHOR_UNRESOLVED",
      }),
    });
  }

  return Object.freeze({
    schema:"ao-r17-reader-cue-state-controller-v1",
    supported,
    form,
    audit,
    project,
    cueSort:cueId=>sortIndex.get(String(cueId))??null,
    unresolvedPostureAnchors,
    conditions:Object.freeze([...defaultConditions]),
  });
}
