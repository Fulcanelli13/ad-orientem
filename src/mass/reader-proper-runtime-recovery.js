const PER_DOM=Object.freeze({
  la:"Per Dóminum nostrum Iesum Christum, Fílium tuum: Qui tecum vivit et regnat in unitáte Spíritus Sancti, Deus, per ómnia sǽcula sæculórum. Amen.",
  en:"Through our Lord Jesus Christ, Thy Son, Who liveth and reigneth with Thee in the unity of the Holy Ghost, God, world without end. Amen.",
  fr:"Par Notre-Seigneur Jésus-Christ, votre Fils, qui, étant Dieu, vit et règne avec vous dans l’unité du Saint-Esprit, dans tous les siècles des siècles. Ainsi soit-il.",
});
const GLORIA=Object.freeze({
  la:"Glória Patri, et Fílio, et Spirítui Sancto. Sicut erat in princípio, et nunc, et semper, et in sǽcula sæculórum. Amen.",
  en:"Glory be to the Father, and to the Son, and to the Holy Ghost. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  fr:"Gloire au Père, au Fils et au Saint-Esprit. Comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Ainsi soit-il.",
});

function cleanLines(lines,language){
  const out=[];
  for(let line of lines??[]){
    line=String(line??"").trim();
    if(!line)continue;
    if(/^\(sed .*rubrica (1570|1910|1930|divino afflatu)/i.test(line))continue;
    if(line==="&Gloria"){out.push(GLORIA[language]);continue}
    if(line==="$Per Dominum"){out.push(PER_DOM[language]);continue}
    if(line==="$Deo gratias"){out.push(language==="fr"?"℟. Deo gratias — Rendons grâce à Dieu.":"℟. Deo gratias.");continue}
    if(/^!/.test(line)){out.push(line.slice(1).trim());continue}
    line=line
      .replace(/^[Vv]\.\s*/,"℣. ")
      .replace(/^[Rr]\.\s*/,"℟. ")
      .replace(/\+\+/g,"✠")
      .replace(/✠|✚|✙|✛|✜|✝|✞/g,"✠")
      .replace(/(^|\s)\+(?=($|\s|[,.\;:!?)]))/g,"$1✠");
    out.push(line);
  }
  return out.join("\n").trim();
}

function textUsable(value){
  return Boolean(value&&typeof value==="object"&&String(value.lat??value.la??"").trim());
}

function arrayUsable(value){
  return Array.isArray(value)&&value.some(textUsable);
}

function parsedLines(parsed,ids){
  for(const id of ids){
    const rows=parsed?.map?.get?.(id);
    if(Array.isArray(rows)&&rows.length)return rows;
  }
  return [];
}

async function recoverText(hostResolver,path,sectionIds,diagnostic){
  const out={lat:"",en:"",fr:""};
  for(const language of ["la","en","fr"]){
    const parsed=await hostResolver.resolveSource(path,language,diagnostic);
    const text=cleanLines(parsedLines(parsed,sectionIds),language);
    if(language==="la")out.lat=text;
    else out[language]=text;
  }
  return Object.freeze(out);
}

function unwrap(proper){
  if(!proper||typeof proper!=="object")return{envelope:null,data:null};
  if(proper.status&&proper.data)return{envelope:proper,data:proper.data};
  return{envelope:null,data:proper};
}

function rewrap(envelope,data){
  if(!envelope)return Object.freeze(data);
  return Object.freeze({...envelope,data:Object.freeze(data)});
}

/**
 * Repair reader-facing omissions caused by the historical host normalizer.
 * It never replaces populated Proper fields: it only recovers exact source
 * sections already resolved by the host ProperResolver.
 */
export async function recoverReaderProperOmissions(proper,{
  hostResolver,
  diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]},
}={}){
  const {envelope,data}=unwrap(proper);
  if(!data||typeof data!=="object"||typeof hostResolver?.resolveSource!=="function")return proper;
  const path=String(data.sourcePath??envelope?.sourcePath??"").trim();
  if(!path)return proper;

  const needs={
    epistle:!textUsable(data.epistle),
    secrets:!arrayUsable(data.secrets)&&!textUsable(data.secret),
    postcommunions:!arrayUsable(data.postcommunions)&&!textUsable(data.postcommunion),
  };
  if(!Object.values(needs).some(Boolean))return proper;

  const next={...data};
  if(needs.epistle){
    const value=await recoverText(hostResolver,path,["Lectio"],diagnostic);
    if(textUsable(value))next.epistle=value;
  }
  if(needs.secrets){
    const value=await recoverText(hostResolver,path,["Secreta"],diagnostic);
    if(textUsable(value)){next.secrets=Object.freeze([value]);next.secret=value}
  }
  if(needs.postcommunions){
    const value=await recoverText(hostResolver,path,["Postcommunio"],diagnostic);
    if(textUsable(value)){next.postcommunions=Object.freeze([value]);next.postcommunion=value}
  }

  return rewrap(envelope,Object.freeze(next));
}
