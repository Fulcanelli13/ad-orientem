const GLORIA=Object.freeze({
  la:"Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.",
  en:"Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  fr:"Gloire au Père, au Fils et au Saint-Esprit. Comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Ainsi soit-il.",
});
const PER_DOM=Object.freeze({
  la:"Per Dóminum nostrum Jesum Christum Fílium tuum: qui tecum vivit et regnat in unitáte Spíritus Sancti Deus, per ómnia sǽcula sæculórum. Amen.",
  en:"Through our Lord Jesus Christ, Thy Son, who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
  fr:"Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
});

function cleanLines(lines,language){
  const out=[];
  for(let line of lines??[]){
    line=String(line??"").trim();
    if(!line)continue;
    if(/^\(sed .*rubrica (1570|1910|1930|divino afflatu)/i.test(line))continue;
    if(line==="&Gloria"){out.push(GLORIA[language]);continue;}
    if(line==="$Per Dominum"){out.push(PER_DOM[language]);continue;}
    if(line==="$Deo gratias"){out.push(language==="fr"?"℟. Deo gratias — Rendons grâce à Dieu.":"℟. Deo gratias.");continue;}
    if(/^!/.test(line)){out.push(line.slice(1).trim());continue;}
    line=line.replace(/^[Vv]\.\s*/,"℣. ").replace(/^[Rr]\.\s*/,"℟. ")
      .replace(/\+\+/g,"✠").replace(/✠|✚|✙|✛|✜|✝|✞/g,"✠")
      .replace(/(^|\s)\+(?=($|\s|[,.\;:!?)]))/g,"$1✠");
    out.push(line);
  }
  return out.join("\n").trim();
}

function empty(value){
  if(!value||typeof value!=="object")return true;
  return !String(value.lat??value.la??"").trim() &&
    !String(value.en??"").trim() &&
    !String(value.fr??"").trim();
}

async function sourcedText(properResolver,path,section,diagnostic){
  const rows={};
  for(const language of ["la","en","fr"]){
    const source=await properResolver.resolveSource(path,language,diagnostic);
    rows[language]=cleanLines(source?.map?.get?.(section)??[],language);
  }
  return Object.freeze({lat:rows.la,en:rows.en,fr:rows.fr});
}

export async function repairResolvedProper(result,resolver){
  const envelope=result?.proper;
  const proper=envelope?.status==="ready"?envelope.data:null;
  const properResolver=resolver?.properResolver;
  const path=proper?.sourcePath;
  if(!proper||!path||typeof properResolver?.resolveSource!=="function")return result;

  const diagnostic=result.diagnostic??{requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]};
  const repaired=[];

  if((!Array.isArray(proper.secrets)||proper.secrets.length===0)&&empty(proper.secret)){
    const value=await sourcedText(properResolver,path,"Secreta",diagnostic);
    if(!empty(value)){
      proper.secrets=[value];
      proper.secret=value;
      repaired.push("SECRET_SET");
    }
  }

  if((!Array.isArray(proper.postcommunions)||proper.postcommunions.length===0)&&empty(proper.postcommunion)){
    const value=await sourcedText(properResolver,path,"Postcommunio",diagnostic);
    if(!empty(value)){
      proper.postcommunions=[value];
      proper.postcommunion=value;
      repaired.push("POSTCOMMUNION_SET");
    }
  }

  if(empty(proper.epistle)){
    const value=await sourcedText(properResolver,path,"Lectio",diagnostic);
    if(!empty(value)){
      proper.epistle=value;
      repaired.push("EPISTLE_OR_LESSON");
    }
  }

  if(repaired.length){
    proper.runtimeSourceRepair=Object.freeze({
      version:"proper-runtime-repair-v1",
      recovered:Object.freeze(repaired),
      sourcePath:path,
    });
    diagnostic.warnings?.push?.("Recovered base Proper sections dropped by legacy normalization: "+repaired.join(", "));
  }
  return result;
}

export function installProperRuntimeRepair(win=globalThis){
  const resolver=win?.AO_RUNTIME_V8?.resolver;
  if(!resolver||typeof resolver.resolveDay!=="function")return false;
  if(resolver.__aoProperRuntimeRepairInstalled)return true;

  const nativeResolve=resolver.resolveDay.bind(resolver);
  resolver.resolveDay=async(...args)=>repairResolvedProper(await nativeResolve(...args),resolver);
  try{Object.defineProperty(resolver,"__aoProperRuntimeRepairInstalled",{value:true,configurable:true});}
  catch{resolver.__aoProperRuntimeRepairInstalled=true;}

  const current=win?.AO_RUNTIME_V8?.store?.getState?.();
  const proper=current?.resolution?.proper?.data;
  const missingBase=proper&&(
    ((!Array.isArray(proper.secrets)||proper.secrets.length===0)&&empty(proper.secret)) ||
    ((!Array.isArray(proper.postcommunions)||proper.postcommunions.length===0)&&empty(proper.postcommunion)) ||
    empty(proper.epistle)
  );
  if(missingBase&&current?.selectedDate&&typeof win?.AO_RUNTIME_V8?.controller?.home?.changeDate==="function"){
    queueMicrotask(()=>win.AO_RUNTIME_V8.controller.home.changeDate(current.selectedDate));
  }
  return true;
}
