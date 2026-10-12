// Install before the first Calendar/Mass preflight selection: one 1962 Proper
// decision owner for all consumers of AO_RUNTIME_V8.resolver.resolveDay.
// Do not intercept an explicit votive/alternate Proper outside this resolver.
import {choose1962PrefaceForDay,apply1962PrefaceSelection,load1962PrefaceSource} from "./1962-preface-decision.js";
const installed=new WeakMap();
export function install1962PrefaceRuntime(win=globalThis){
  const owner=win?.AO_RUNTIME_V8?.resolver;
  if(!owner||typeof owner.resolveDay!=="function")return Object.freeze({installed:false,reason:"SOURCE_RESOLVER_UNAVAILABLE"});
  if(installed.has(owner))return installed.get(owner).status;
  const original=owner.resolveDay;
  const status=Object.freeze({installed:true,owner:"CENTRAL_1962_SOURCE_RESOLVER",publicationOwner:"1962_PREFACE_DECISION",version:"v1"});
  const wrapped=async function resolveDay1962Preface(...args){
    const resolved=await original.apply(this,args);
    const choice=choose1962PrefaceForDay(resolved);
    if(!choice)return resolved;
    try{
      const registry=await load1962PrefaceSource(win.fetch?.bind(win));
      return apply1962PrefaceSelection(resolved,registry);
    }catch(error){
      // The Mass must not claim a COMPLETE Proper whose selected Preface
      // is demonstrably an invalid Common fallback. Other calendar fields
      // remain discoverable, but the corresponding Mass is not startable.
      return Object.freeze({...resolved,proper:Object.freeze({...resolved.proper,status:"failed",
        error:"1962_PREFACE_WITNESS_UNAVAILABLE"}),
        prefaceDecision:Object.freeze({...choice,status:"SOURCE_WITNESS_BLOCKED",reason:String(error?.message??error),applied:false})});
    }
  };
  try{
    owner.resolveDay=wrapped;
    if(owner.resolveDay!==wrapped)return Object.freeze({installed:false,reason:"SOURCE_RESOLVER_READ_ONLY"});
    installed.set(owner,{original,wrapped,status});
    return status;
  }catch(error){
    return Object.freeze({installed:false,reason:"SOURCE_RESOLVER_READ_ONLY",error:String(error?.message??error)});
  }
}
