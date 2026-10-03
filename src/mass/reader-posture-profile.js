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
  sectionId=null,
  macroId=null,
}={}){
  const map=preferences?.localPostures ?? {};
  for(const key of [cueId,sectionId,macroId]){
    const value=key ? clean(map[key]) : null;
    if(value) return Object.freeze({key,value});
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
  const local=findLocalPostureOverride(preferences,{cueId,sectionId,macroId});

  if(profile==="FOLLOW_CONGREGATION"){
    return Object.freeze({
      posture:legacyPosture ?? null,
      owner:"FOLLOW_CONGREGATION_OBSERVED",
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
