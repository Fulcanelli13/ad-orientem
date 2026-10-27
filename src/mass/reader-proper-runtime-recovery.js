import {certifyPreGospelChantParts} from "./reader-pre-gospel-chant-source.js";
import {render1962EasterPrefaceVariant} from "./1962-easter-preface-form.js";
import {recover1962InAlbisSecretFromPinnedSource} from "./1962-in-albis-secret-source.js";
import {required1962MarianPrefaceOwner,verifyMarianLatinSourceRule,render1962MarianPrefaceForm,isSelected1962MarianPrefaceForm} from "./1962-marian-preface-source.js";
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

// The pinned Missale Meum `Sancti/10-08c` has the martyrs' named
// Latin/English prayers but no corresponding French text. Divinum Officium
// retains the same three named Latin prayers and its French translation under
// the older `10-07cc` identifier. This is a source identity equivalence,
// never a date-based or generic translation fallback. Its Latin must still
// independently match the source-owned composed row.
// Sources:
// https://github.com/mmolenda/missalemeum/blob/main/backend/resources/divinum-officium-local/web/www/missa/Latin/Sancti/10-08c.txt
// https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Latin/Sancti/10-07cc.txt
// https://github.com/DivinumOfficium/divinum-officium/blob/master/web/www/missa/Francais/Sancti/10-07cc.txt
const VERIFIED_FRENCH_ORATION_EQUIVALENTS=Object.freeze({
  "Sancti/10-08c":"Sancti/10-07cc",
});


const VERIFIED_PREFACE_OWNERS=Object.freeze({
  "tempora:Pasc7-0":Object.freeze({section:"Spiritu"}),
  "sancti:10-07":Object.freeze({section:"Maria",form:"rosary"}),
  "sancti:12-08":Object.freeze({section:"Maria",form:"immaculate"}),
});
function applyMarianPrefaceForm(text,language,form){
  if(form==="rosary"){
    if(language==="la")return text.replace(/\*Festivitáte\*/,"festivitáte");
    if(language==="en")return text.replace(/\*Feast\*/,"Feast");
    if(language==="fr")return text;
  }
  if(form==="immaculate"){
    if(language==="la")return text.replace(/\*Festivitáte\*/,"Conceptióne Immaculáta");
    if(language==="en")return text.replace(/\*Feast\*/,"Immaculate Conception");
    if(language==="fr")return text.replace(/en la fête de la bienheureuse Marie/i,"en la Conception immaculée de la bienheureuse Marie");
  }
  return text;
}
// The 1960 Missal §§482, 486(a) require the Lenten Preface for a
// *principal Mass of the Lenten temporal cycle*. An inherited Common
// heading in these specifically matched host source files is a known
// normalizer defect, not a liturgical option.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
export function authenticated1962PrefaceRecoveryOwner(principalCelebrationId,sourcePath){
  const id=String(principalCelebrationId??"");
  const path=String(sourcePath??"").trim();
  const parts=id.split(":");
  const exact=VERIFIED_PREFACE_OWNERS[parts.slice(0,2).join(":")]??null;
  if(exact)return exact;
  const marian=required1962MarianPrefaceOwner(id,path);
  if(marian)return Object.freeze({section:"Maria",
    marianForm:marian.form,blocked:marian.blocked,
    sourceOwner:marian,scope:marian.scope,
    rubric:"RGMR_495",sourcePath:path});
  // Exclude selected votives, proper feast formularies, unrelated path
  // aliases and Office variants. Source ID *and* canonical source path must
  // agree before we are allowed to replace a populated Common Preface.
  const lent=/^tempora:(Quad[1-4]-[0-6]):([1-3]):v$/i.exec(id);
  if(lent&&path.toLowerCase()==="tempora/"+lent[1].toLowerCase())
    return Object.freeze({section:"Quad",scope:"LENT_TEMPORAL_1962",
      rubric:"RGMR_486_A",sourcePath:path});
  // RGMR §493(a): the Vigil and octave of Pentecost have the Holy
  // Spirit Preface. Pentecost Sunday (Pasc7-0) was already independently
  // certified above. Only extend to *identical source paths* below.
  const pentecost=/^tempora:(Pasc(?:6-6|7-[1-6])):1:r$/i.exec(id);
  if(pentecost&&path.toLowerCase()==="tempora/"+pentecost[1].toLowerCase())
    return Object.freeze({section:"Spiritu",scope:"PENTECOST_OCTAVE_1962",
      rubric:"RGMR_493_A",sourcePath:path});
  // The 1962 Paschal Preface has three *mutually exclusive* readings.
  // Source ID and actual canonical Proper path must both match: no
  // generic feria, feast in Eastertide, or votive source inheritance.
  const vigil=/^tempora:(Quad6-6r):1:vw$/i.exec(id);
  if(vigil&&path.toLowerCase()==="tempora/"+vigil[1].toLowerCase())
    return Object.freeze({section:"Pasch",variant:"VIGIL_NIGHT",
      scope:"PASCHAL_VIGIL_1962",rubric:"PREFATIO_PASCHALIS_1962",sourcePath:path});
  const octave=/^tempora:(Pasc0-[0-6]):1:w$/i.exec(id);
  if(octave&&path.toLowerCase()==="tempora/"+octave[1].toLowerCase())
    return Object.freeze({section:"Pasch",variant:"OCTAVE_DAY",
      scope:"PASCHAL_OCTAVE_1962",rubric:"PREFATIO_PASCHALIS_1962",sourcePath:path});
  const season=/^tempora:(Pasc[1-4]-[0-6]r?|Pasc5-[0-3]):[1-3]:w$/i.exec(id);
  if(season&&path.toLowerCase()==="tempora/"+season[1].toLowerCase())
    return Object.freeze({section:"Pasch",variant:"EASTERTIDE",
      scope:"PASCHAL_AFTER_OCTAVE_1962",rubric:"PREFATIO_PASCHALIS_1962",sourcePath:path});
  return null;
}
async function recoverContradictoryPreface(data,hostResolver,principalCelebrationId,diagnostic){
  // This source correction belongs only to the selected calendar Mass.
  // Never reinterpret an expressly selected votive, Requiem or special
  // formulary, even when it happens to inherit the day's base source path.
  const requested=String(data?.requestedCelebrationId??"").trim();
  if(requested&&requested!=="mass_of_day")return null;
  if(/(?:votive|requiem|mass_of_dead)/i.test(String(data?.riteProfile??data?.profile??"")))
    return null;
  const owner=authenticated1962PrefaceRecoveryOwner(principalCelebrationId,data?.sourcePath);
  if(!owner||owner.blocked)return null;
  if(owner.marianForm){
    // Named feasts must possess their authenticated Latin Rule. The 1962
    // Saturday BVM Mass is validated by its *selected C10 source identity*
    // and the printed universal Missal rubric, not by attempting to fetch
    // a missing DO-style Commune/C10 physical file from a different donor.
    if(owner.sourceOwner.rule){
      const donor=await hostResolver.resolveSource(data.sourcePath,"la",diagnostic);
      if(!verifyMarianLatinSourceRule(donor,owner.sourceOwner))return null;
    }else if(!verifyMarianLatinSourceRule(null,owner.sourceOwner))return null;
  }
  const heading=String(data.preface?.lat??data.preface?.la??"").trim();
  const currentlyCommon=/^Communis(?:\s|$)/i.test(heading);
  const unresolvedPaschalAlternatives=owner.section==="Pasch"&&
    /^Paschalis(?:\s|$)/i.test(heading)&&
    /(sed tempore Passionis|sed octava Paschæ|hoc potíssimum~)/i.test(heading);
  // The original [Pasch] contains night, octave-day, and later-season
  // options simultaneously. It is not a reader-ready printed Preface.
  if(!currentlyCommon&&!unresolvedPaschalAlternatives)return null;
  const result={};
  for(const language of ["la","en","fr"]){
    const parsed=await hostResolver.resolveSource("Ordo/Prefationes",language,diagnostic);
    const section=parsedLines(parsed,[owner.section]);
    if(!section.length)return null;
    let text=cleanLines(section,language);
    if(owner.marianForm){
      text=render1962MarianPrefaceForm(text,language,owner.marianForm);
      if(!text)return null;
    }else text=applyMarianPrefaceForm(text,language,owner.form);
    if(owner.section==="Pasch"){
      text=render1962EasterPrefaceVariant(text,language,owner.variant);
      if(!text)return null;
    }
    if(!sourceTextComplete(text)||/\*Festivitáte\*|\*Feast\*/.test(text))return null;
    // Verify the returned Latin section is the Lenten Preface itself.
    if(language==="la"&&owner.section==="Quad"&&!/^de Quadragesima(?:\s|$)/i.test(text))
      return null;
    if(language==="la"&&owner.section==="Spiritu"&&
       !/^de (?:Spiritu Sancto|Sancto Spiritu)(?:\s|$)/i.test(text))return null;
    result[language==="la"?"lat":language]=text;
  }
  if(!hasThreeLanguages(result))return null;
  if(owner.marianForm&&!isSelected1962MarianPrefaceForm(
    {...result,marianForm:owner.marianForm},owner.sourceOwner))return null;
  return Object.freeze({...result,sourcePath:"Ordo/Prefationes",prefaceSection:owner.section,
    ...(owner.marianForm?{marianForm:owner.marianForm}:{}),
    recoveryScope:owner.scope??"CERTIFIED_EXACT_FEAST",rubric:owner.rubric??null,
    prefaceVariant:owner.variant??null,
    originalProperSourcePath:String(data.sourcePath??"")});
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
  principalCelebrationId=null,
  diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]},
}={}){
  const {envelope,data}=unwrap(proper);
  if(!data||typeof data!=="object"||typeof hostResolver?.resolveSource!=="function")return proper;
  const path=String(data.sourcePath??envelope?.sourcePath??"").trim();
  if(!path)return proper;

  // Only separately named [Graduale]+[Alleluia] or [Graduale]+[Tractus]
  // that reconstruct the FLATTENED host text in la/en/fr may add cue-safe
  // reader navigation. Never change an existing Proper's printed text.
  let recoveredChants=null;
  // The host resolver is remote/cache-backed. Do not refetch a bare
  // Gradual with no second-chant evidence. This is a discovery filter ONLY:
  // a label match cannot authorize a split without trilingual source parity.
  const chantDiscoveryCandidate=/(?:allel[uú][ij]a|tr[áa]ctus|tract|alléluia)/iu
    .test(String(data.gradual?.lat??data.gradual?.la??""));
  if(!data.readerChantSourceProof && chantDiscoveryCandidate &&
     hasThreeLanguages(data.gradual)){
    try{
      const sources={};
      for(const lang of ["la","en","fr"]){
        sources[lang]=await hostResolver.resolveSource(path,lang,diagnostic);
      }
      recoveredChants=certifyPreGospelChantParts(
        {...data,sourcePath:path},{sources,normalizeRows:cleanLines});
    }catch(error){
      diagnostic?.warnings?.push?.("PRE_GOSPEL_CHANT_SOURCE_UNAVAILABLE:"+String(error?.message??error));
    }
  }
  let recoveredPreface=null;
  try{
    recoveredPreface=await recoverContradictoryPreface(data,hostResolver,
      principalCelebrationId??data.principalCelebrationId??data.mainId,diagnostic);
  }catch(error){
    // A missing remote source must not crash the Mass reader. The reader
    // Preface decision gate independently blocks the inherited Common
    // Preface for authenticated obligatory seasonal cases.
    diagnostic?.warnings?.push?.("PREFACE_SOURCE_RECOVERY_UNAVAILABLE:"+
      String(error?.message??error));
  }
  // A Secret may have a source-owned Latin body but be incomplete in one
  // vernacular. Check the exact pinned repair independently of whether a
  // Latin string alone would make the older recovery logic skip the slot.
  const sourceOwnedSecret=recover1962InAlbisSecretFromPinnedSource(
    data,principalCelebrationId??data.principalCelebrationId??data.mainId,cleanLines);
  const needs={
    epistle:!textUsable(data.epistle),
    secrets:Boolean(sourceOwnedSecret)||(!arrayUsable(data.secrets)&&!textUsable(data.secret)),
    postcommunions:!arrayUsable(data.postcommunions)&&!textUsable(data.postcommunion),
  };
  const orationGroups=[
    ["collects","collect","Oratio"],
    ["secrets","secret","Secreta"],
    ["postcommunions","postcommunion","Postcommunio"],
  ];
  const missingOrations=orationGroups.some(([plural,single])=>incompleteOrations(data,plural,single));
  const peterPaulOwner=path==="Sancti/06-30"&&
    /^sancti:06-30:3:/i.test(String(principalCelebrationId??data.principalCelebrationId??data.mainId??""));
  const needsApostolicSource=peterPaulOwner&&
    data.inseparableApostolicSources?.status!=="SOURCE_VERIFIED";
  if(!Object.values(needs).some(Boolean)&&!missingOrations&&!recoveredPreface&&
     !needsApostolicSource&&!recoveredChants)return proper;

  const next={...data};
  if(recoveredChants)next.readerChantSourceProof=recoveredChants;
  if(recoveredPreface)next.preface=recoveredPreface;
  if(needs.epistle){
    const value=await recoverText(hostResolver,path,["Lectio"],diagnostic);
    if(textUsable(value))next.epistle=value;
  }
  if(needs.secrets){
    // Exact donor correction: Tempora/Pasc1-0's [Secreta] points to
    // itself in the pinned host archive. The ordinary source resolver
    // cannot resolve this circular reference. Use the independently
    // pinned three-language Divinum Officium section only on that owner,
    // retaining all normal completeness and source identity checks.
    const value=sourceOwnedSecret??await recoverText(hostResolver,path,["Secreta"],diagnostic);
    if(hasThreeLanguages(value)&&["lat","en","fr"].every(
      lang=>sourceTextComplete(value[lang]))){
      next.secrets=Object.freeze([value]);next.secret=value;
    }
  }
  if(needs.postcommunions){
    const value=await recoverText(hostResolver,path,["Postcommunio"],diagnostic);
    if(textUsable(value)){next.postcommunions=Object.freeze([value]);next.postcommunion=value}
  }

  // June 30 contains Paul's prayer followed by Peter's inseparable text.
  // The historical host normalizer keeps only Paul's Secret/Postcommunion.
  // Recover the *other apostle's exact named source sections* in all languages
  // rather than silently inventing or dropping their second clauses.
  // Pinned canonical source: Sancti/06-30 => Sancti/02-22 [* Petri].
  if(needsApostolicSource){
    const apostolic={status:"SOURCE_VERIFIED",
      principal:"Sancti/06-30",companion:"Sancti/02-22"};
    let complete=true;
    for(const [field,section] of [
      ["collects","Oratio Petri"],["secrets","Secreta Petri"],
      ["postcommunions","Postcommunio Petri"]]){
      const resolved=await recoverText(hostResolver,"Sancti/02-22",[section],diagnostic);
      // The Collect's '$Qui vivis' is intentionally retained in the
      // reference *metadata*: production combined source already owns its
      // translated Qui vivis ending, which is validated during projection.
      const sourceOk=field==="collects"?
        hasThreeLanguages(resolved)&&
        ["lat","en","fr"].every(lang=>{
          const prefix=String(resolved[lang]??"").split("\n")[0].slice(0,50);
          return prefix.length>=25&&String(data.collects?.[0]?.[lang]??"").includes(prefix);
        }):
        hasThreeLanguages(resolved)&&
        ["lat","en","fr"].every(lang=>sourceTextComplete(resolved[lang]));
      if(!sourceOk){complete=false;break;}
      apostolic[field]=Object.freeze(resolved);
    }
    if(complete)next.inseparableApostolicSources=Object.freeze(apostolic);
    else next.inseparableApostolicSourceStatus="UNVERIFIED_NAMED_ORATION_TEXT";
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
      let sourced=await recoverText(hostResolver,owners[index],[section],diagnostic);
      if(!sourceTextComplete(sourced.lat)||
         !agreesWithLatin(current?.lat??current?.la,sourced.lat))continue;
      // A proven historical French alias may supply only the missing French,
      // provided its own Latin text matches both the pinned source and the
      // already composed row. Keep the canonical Mass/source identity intact.
      const frenchAlias=VERIFIED_FRENCH_ORATION_EQUIVALENTS[owners[index]];
      if(!sourceTextComplete(sourced.fr)&&frenchAlias){
        const alternative=await recoverText(hostResolver,frenchAlias,[section],diagnostic);
        if(sourceTextComplete(alternative.lat)&&
           agreesWithLatin(sourced.lat,alternative.lat)&&
           agreesWithLatin(current?.lat??current?.la,alternative.lat)&&
           sourceTextComplete(alternative.fr)){
          sourced={...sourced,fr:alternative.fr};
        }
      }
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
