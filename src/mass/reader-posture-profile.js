// Reader posture profile boundary.
// Resolves display posture ownership without changing canonical Mass state.
// FOLLOW_CONGREGATION deliberately remains observational until a native
// congregation-state source exists. MY_LOCAL fails closed when no saved override exists.

import { resolvePosture } from "./reader-state.js";

function clean(value){
  const v=String(value??"").trim();
  return v || null;
}

export function findLocalPostureOverride(preferences,{
  cueId=null,
  sourceCueId=null,
  sectionId=null,
  macroId=null,
}={}){
  const map=preferences?.localPostures ?? {};
  const exact=cueId?clean(map[cueId]):null;
  if(exact)return Object.freeze({key:cueId,value:exact});
  // Saved local instructions persist for the current source posture span,
  // but end at the next canonically sourced posture transition. This makes
  // Gloria/Credo local sitting usable without fabricating a sedilia cue.
  const idNumber=id=>/^AO\.SM\.C\d{4}$/.test(String(id))?Number(String(id).slice(-4)):null;
  const now=idNumber(cueId),start=idNumber(sourceCueId);
  if(now!=null && start!=null && now>=start){
    let bestKey=null,bestNumber=-1;
    for(const [key,value] of Object.entries(map)){
      const n=idNumber(key);
      if(n!=null && n>=start && n<=now && n>bestNumber && ["STAND","SIT","KNEEL"].includes(value)){
        bestKey=key;bestNumber=n;
      }
    }
    if(bestKey)return Object.freeze({key:bestKey,value:map[bestKey]});
  }
  for(const key of [sectionId,macroId]){
    const value=key?clean(map[key]):null;
    if(value)return Object.freeze({key,value});
  }
  return null;
}

function normalizedSource(cueProjection){
  const source=cueProjection?.posture;
  if(!source?.value && !source?.label) return null;
  return Object.freeze({
    value:clean(source.value ?? source.label),
    fixed:source.fixed===true,
    cueId:source.cueId ?? cueProjection?.cueId ?? null,
    sourcePostureId:source.sourcePostureId ?? null,
    authority:source.authority ?? null,
    sources:source.sources ?? null,
  });
}

export function resolveReaderPostureChannel({
  preferences,
  cueProjection=null,
  legacyPosture=null,
  cueId=null,
  sectionId=null,
  macroId=null,
}={}){
  if(!preferences) throw new TypeError("Reader preferences required");

  const profile=String(preferences.postureProfile??"FOLLOW_CONGREGATION").toUpperCase();
  const sourced=normalizedSource(cueProjection);
  const local=findLocalPostureOverride(preferences,{cueId,sourceCueId:sourced?.cueId,sectionId,macroId});

  if(sourced?.fixed){
    return Object.freeze({
      posture:Object.freeze({...cueProjection.posture,value:sourced.value,label:sourced.value,
        owner:"SOURCED_FIXED",persistent:true}),
      owner:"SOURCED_FIXED",localKey:null,sourcePostureId:sourced.sourcePostureId,
    });
  }

  // An explicit local choice changes the participant's displayed posture
  // for this exact source cue only. A fixed ritual posture cannot be changed.
  if(local && !sourced?.fixed && ["STAND","SIT","KNEEL"].includes(local.value)){
    return Object.freeze({
      posture:Object.freeze({label:local.value,value:local.value,owner:"LOCAL_OVERRIDE",
        localKey:local.key,persistent:true}),
      owner:"LOCAL_OVERRIDE",localKey:local.key,sourcePostureId:null,
    });
  }

  if(profile==="FOLLOW_CONGREGATION"){
    if(legacyPosture){
      return Object.freeze({
        posture:legacyPosture,
        owner:"FOLLOW_CONGREGATION_OBSERVED",
        localKey:null,
        sourcePostureId:null,
      });
    }
    if(sourced?.value){
      return Object.freeze({
        posture:Object.freeze({
          ...(cueProjection?.posture ?? {}),
          label:sourced.value,
          value:sourced.value,
          owner:"FOLLOW_CONGREGATION_SOURCE_FALLBACK",
          persistent:true,
        }),
        owner:"FOLLOW_CONGREGATION_SOURCE_FALLBACK",
        localKey:null,
        sourcePostureId:sourced.sourcePostureId ?? null,
      });
    }
    return Object.freeze({
      posture:null,
      owner:"FOLLOW_CONGREGATION_UNOBSERVED_FAIL_CLOSED",
      localKey:null,
      sourcePostureId:null,
    });
  }

  const resolved=resolvePosture({
    sourcedPosture:sourced,
    localOverride:local?.value ?? null,
    preferences,
  });

  if(!resolved?.value){
    return Object.freeze({
      posture:null,
      owner:resolved?.owner ?? "PROFILE_FAIL_CLOSED",
      localKey:local?.key ?? null,
      sourcePostureId:sourced?.sourcePostureId ?? null,
    });
  }

  if(resolved.owner==="LOCAL_OVERRIDE"){
    return Object.freeze({
      posture:Object.freeze({
        label:resolved.value,
        value:resolved.value,
        owner:"LOCAL_OVERRIDE",
        localKey:local?.key ?? null,
        persistent:true,
      }),
      owner:"LOCAL_OVERRIDE",
      localKey:local?.key ?? null,
      sourcePostureId:null,
    });
  }

  return Object.freeze({
    posture:Object.freeze({
      ...(cueProjection?.posture ?? {}),
      label:resolved.value,
      value:resolved.value,
      owner:resolved.owner,
      persistent:true,
    }),
    owner:resolved.owner,
    localKey:null,
    sourcePostureId:sourced?.sourcePostureId ?? null,
  });
}
