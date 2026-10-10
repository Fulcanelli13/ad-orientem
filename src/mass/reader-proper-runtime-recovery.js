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

function hasThreeLanguages(value){
  return Boolean(value&&typeof value==="object" &&
    String(value.lat??value.la??"").trim() &&
    String(value.en??"").trim() && String(value.fr??"").trim());
}

function cleanLatinIdentity(value){
  return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zA-Z]+/g," ").trim().toLowerCase();
}

// Guard against attaching a different commemoration's translation by ordinal
// alone. Existing host Latin must actually contain the opening of the source
// identified by the Calendar owner.
function agreesWithLatin(existing,source){
  const a=cleanLatinIdentity(existing),b=cleanLatinIdentity(source);
  return Boolean(b && (!a || a.includes(b.slice(0,Math.min(45,b.length)))));
}

function sourceTextComplete(value){
  return Boolean(String(value??"").trim() && !/(^|\n)\s*[$@]/m.test(String(value)));
}

function sourceOrationOwners(data,path){
  const commemorations=(data.calendarCommemorations??[])
    .filter(comm=>comm&&!comm.inseparable);
  return [path,...commemorations.map(comm=>String(comm.prayerSourcePath??comm.path??"").trim())];
}

function incompleteOrations(data,field,single){
  const rows=Array.isArray(data[field])&&data[field].length
    ? data[field] : data[single] ? [data[single]] : [];
  return rows.length===0 || rows.some(row=>!hasThreeLanguages(row));
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
  const orationGroups=[
    ["collects","collect","Oratio"],
    ["secrets","secret","Secreta"],
    ["postcommunions","postcommunion","Postcommunio"],
  ];
  const missingOrations=orationGroups.some(([plural,single])=>incompleteOrations(data,plural,single));
  if(!Object.values(needs).some(Boolean)&&!missingOrations)return proper;

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

  // Compose exactly the source-owned prayer count: principal Proper followed
  // by each non-inseparable Calendar commemoration. Never infer a missing
  // commemoration from the preceding prayer or accept a guessed translation.
  const owners=sourceOrationOwners(data,path);
  for(const [plural,single,section] of orationGroups){
    const rows=Array.isArray(next[plural])&&next[plural].length
      ? [...next[plural]] : next[single] ? [next[single]] : [];
    if(rows.length!==owners.length||owners.some(owner=>!owner))continue;
    let changed=false;
    for(let index=0;index<rows.length;index++){
      const current=rows[index];
      if(hasThreeLanguages(current))continue;
      const sourced=await recoverText(hostResolver,owners[index],[section],diagnostic);
      if(!sourceTextComplete(sourced.lat)||
         !agreesWithLatin(current?.lat??current?.la,sourced.lat))continue;
      const candidate={...current};
      for(const lang of ["lat","en","fr"]){
        if(!String(candidate[lang]??"").trim()){
          const recovered=lang==="lat"?sourced.lat:sourced[lang];
          if(sourceTextComplete(recovered))candidate[lang]=recovered;
        }
      }
      // Don't change a row unless at least one missing text was recovered.
      if(["lat","en","fr"].some(lang=>String(candidate[lang]??"")!==String(current?.[lang]??""))){
        rows[index]=Object.freeze(candidate);
        changed=true;
      }
    }
    if(changed){
      next[plural]=Object.freeze(rows);
      next[single]=rows[0];
    }
  }
  return rewrap(envelope,Object.freeze(next));
}
