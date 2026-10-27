// Source-owned, two-Sunday 1960-rubric correction at the shared v8 resolver.
// Existing legacy "ruleInfo" reads Prefatio= but omits Prefatio1960=;
// do not change the frozen legacy bundle or fix this independently per view.
//
// 1960 Missal RGMR §§482–483, 494(b).
// Divinum Officium originals:
//   Tempora/Pent02-0r -> @Tempora/Pent02-0, Prefatio=Nat, Prefatio1960=Trinitate
//   Tempora/Pent03-0r -> Prefatio=Cord, Prefatio1960=Trinitate
// No other calendar, alternate/votive or rite profile is covered here.

export const PENTECOST_SUNDAY_PREFACE_1960_VERSION = "ao-pent-sundays-prefatio1960-v1";
const OWNERS = Object.freeze({
  "tempora:Pent02-0r:2:g":Object.freeze({path:"Tempora/Pent02-0r",legacy:"Nat",
    oldHeading:/^de\s+nativitate\s+domini\b/i}),
  "tempora:Pent03-0r:2:g":Object.freeze({path:"Tempora/Pent03-0r",legacy:"Cord",
    oldHeading:/^de\s+(?:(?:sacratissimo|sacro)\s+)?cord(?:e|is)\s+(?:iesu|jesu)\b/i}),
});
const RULES_URL="https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html";
const SOURCE_ROOT="https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/";
const installed=new WeakMap();
const first=value=>String(value??"").trim().split(/\r?\n/)[0].trim();
const validText=value=>Boolean(typeof value==="string"&&value.trim().length>100&&
  !/(?:^|\n)\s*[$@]/m.test(value));

function exact1960Rule(parsed,owner){
  const rows=parsed?.map?.get?.("Rule");
  if(!Array.isArray(rows))return false;
  const tokens=rows.map(x=>String(x).trim()).filter(x=>/^Prefatio(?:1960)?\s*=/i.test(x));
  const exact=key=>tokens.filter(t=>new RegExp("^"+key+"\\s*=","i").test(t));
  const modern=exact("Prefatio1960"),older=exact("Prefatio");
  return modern.length===1&&older.length===1&&
    /^Prefatio1960\s*=\s*Trinitate\s*$/i.test(modern[0])&&
    new RegExp("^Prefatio\\s*=\\s*"+owner.legacy+"(?:\\s*\\(.*\\))?\\s*$","i").test(older[0]);
}
function canonicalCase(resolved){
  if(resolved?.status!=="ready"||resolved?.proper?.status!=="ready")return null;
  const id=String(resolved?.day?.main?.id??"");
  const owner=OWNERS[id];
  const data=resolved?.proper?.data;
  if(!owner||String(data?.sourcePath??"")!==owner.path||
    Number(resolved?.day?.main?.rank)!==2)return null;
  const date=String(resolved?.date??"");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;
  const parsed=new Date(date+"T12:00:00.000Z");
  if(Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||
    parsed.getUTCDay()!==0)return null;
  if(/votive|requiem|mass_of_dead|alternate/i.test(
    String(data?.riteProfile??data?.profile??"")))return null;
  if(resolved?.day?.selectedMassOption?.path &&
    resolved.day.selectedMassOption.path!==owner.path)return null;
  return Object.freeze({id,date,owner});
}
export function inspectPentecostSunday1960Source(resolved){
  const match=canonicalCase(resolved);
  if(!match)return Object.freeze({status:"NOT_THIS_PRINCIPAL_MASS"});
  const header=first(resolved.proper.data.preface?.lat??resolved.proper.data.preface?.la);
  if(/^de\s+sanctissima\s+trinitate\b/i.test(header))
    return Object.freeze({status:"ALREADY_CORRECT",principalId:match.id});
  if(!match.owner.oldHeading.test(header))
    return Object.freeze({status:"UNRECOGNIZED_SOURCE",principalId:match.id,actualHeader:header});
  return Object.freeze({status:"WRONG_LEGACY_PREFACE",...match,actualHeader:header});
}
function sourceUnavailable(resolved,reason){
  const error="PENT_SUNDAY_1960_PREFACE_SOURCE_UNAVAILABLE:"+reason;
  return Object.freeze({...resolved,proper:Object.freeze({...resolved.proper,
    status:"failed",error}),preface1960SourceDecision:Object.freeze({
      status:"SOURCE_BLOCKED",error,scope:"TWO_1960_SUNDAY_PROPER_IDENTITIES"})});
}
export async function resolvePentecostSunday1960Preface(resolved,properResolver){
  const decision=inspectPentecostSunday1960Source(resolved);
  if(decision.status!=="WRONG_LEGACY_PREFACE")return resolved;
  try{
    if(typeof properResolver?.resolveSource!=="function"||
       typeof properResolver?.resolvePreface!=="function")
      throw new Error("PROPER_RESOLVER_UNAVAILABLE");
    // Verify the *source file's original 1960-specific rule* independently in
    // all three languages. Old Prefatio= cannot authorize a 1962 selection.
    const diagnostic=resolved.diagnostic??{};
    for(const lang of ["la","en","fr"]){
      const parsed=await properResolver.resolveSource(decision.owner.path,lang,diagnostic);
      if(!exact1960Rule(parsed,decision.owner))
        throw new Error("PREFATIO1960_WITNESS_MISSING_"+lang.toUpperCase());
    }
    const trinity=await properResolver.resolvePreface("Trinitate",diagnostic);
    const latin=String(trinity?.la??trinity?.lat??"");
    if(!/^de\s+sanctissima\s+trinitate\b/i.test(first(latin))||
       !validText(latin)||!validText(trinity?.en)||!validText(trinity?.fr))
      throw new Error("TRILINGUAL_TRINITY_PREFACE_UNAVAILABLE");
    const preface=Object.freeze({lat:latin,en:trinity.en,fr:trinity.fr,
      sourcePath:"Ordo/Prefationes",prefaceSection:"Trinitate",
      originalProperSourcePath:decision.owner.path,
      sourceRule:"Prefatio1960=Trinitate",rubric:"RGMR_494_B"});
    return Object.freeze({...resolved,
      proper:Object.freeze({...resolved.proper,
        data:Object.freeze({...resolved.proper.data,preface})}),
      preface1960SourceDecision:Object.freeze({
        status:"SOURCE_VERIFIED",principalId:decision.id,date:decision.date,
        selected:"Trinitate",previousHeader:decision.actualHeader,
        rubric:"RGMR_494_B",rubricUrl:RULES_URL,
        originalSourceUrl:SOURCE_ROOT+"Latin/"+decision.owner.path+".txt",
        changesReaderViaSharedSource:true})});
  }catch(error){
    // An authenticated bad Preface must not silently become a READY Mass.
    return sourceUnavailable(resolved,String(error?.message??error));
  }
}
export function installPentecostSunday1960PrefaceSource(win=globalThis){
  const owner=win?.AO_RUNTIME_V8?.resolver;
  if(!owner||typeof owner.resolveDay!=="function"||
     typeof owner.properResolver?.resolveSource!=="function")
    return Object.freeze({installed:false,reason:"SOURCE_RESOLVER_UNAVAILABLE"});
  const previous=installed.get(owner);
  if(previous)return previous.status;
  const original=owner.resolveDay;
  const wrapped=async function(...args){
    const resolved=await original.apply(this,args);
    return resolvePentecostSunday1960Preface(resolved,owner.properResolver);
  };
  try{
    owner.resolveDay=wrapped;
    if(owner.resolveDay!==wrapped)return Object.freeze({installed:false,reason:"READ_ONLY_SOURCE_RESOLVER"});
    const status=Object.freeze({installed:true,version:PENTECOST_SUNDAY_PREFACE_1960_VERSION,
      owner:"SHARED_CANONICAL_DAY_RESOLVER",scope:"TWO_PENTECOST_SUNDAYS"});
    installed.set(owner,{original,wrapped,status});
    return status;
  }catch(error){
    return Object.freeze({installed:false,reason:"READ_ONLY_SOURCE_RESOLVER",error:String(error?.message??error)});
  }
}
