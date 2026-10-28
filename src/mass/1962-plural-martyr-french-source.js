// Narrow 1962 Roman Missal Common source-language integrity gate.
//
// The historical Divinum Officium Commune/C6b French donor's Secret and
// Postcommunion are singular despite the plural Latin prayers (N. et N.).
// Commune/C7b refers back to those translated sections. Only the exact
// identified Common owners and exact Latin plural-name placeholders are
// guarded; this is NOT a generic French-grammar engine or text replacement.
//
// Original printed family/slot evidence: ICRSP B41, PR #1666, issue #894.
// The caller controls whether the slot can be displayed. Source stays intact.
const AFFECTED=Object.freeze(new Set(["Commune/C6b","Commune/C7b"]));
const GUARDED=Object.freeze(new Set(["SECRET_SET","POSTCOMMUNION_SET"]));
const latinPluralNames=/\bN\s*\.\s*et\s*N\s*\./iu;
const frenchName=/\bN\s*\./giu;
// Historical feast actually uses the non-Virgin female Martyrs' Common:
// the pinned French Sancti/03-06 Collect and Secret incorrectly say
// "Vierges et Martyres" although their Latin parent C7b is non-Virgin.
// The 2026 March 6 ordinary Mass remains the Lenten feria.
const PERPETUA_FELICITY="Sancti/03-06";
const ascii=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/æ/gi,"ae").replace(/œ/gi,"oe");
const WITNESS_FRENCH=/\bsaintes\s+vierges\s+et\s+martyres\s+perpetue\s+et\s+felicite(?=$|[\s.,;:])/iu;
const MARTYRS_LATIN=/\bmartyrum\b/iu;
const VIRGINS_LATIN=/\bvirgin(?:um|ibus)\b/iu;

function originalRows(proper,slot){
  if(slot==="COLLECT_SET")return Array.isArray(proper?.collects)&&proper.collects.length
    ?proper.collects:proper?.collect?[proper.collect]:[];
  if(slot==="SECRET_SET")return Array.isArray(proper?.secrets)&&proper.secrets.length
    ?proper.secrets:proper?.secret?[proper.secret]:[];
  if(slot==="POSTCOMMUNION_SET")return Array.isArray(proper?.postcommunions)&&proper.postcommunions.length
    ?proper.postcommunions:proper?.postcommunion?[proper.postcommunion]:[];
  return [];
}

/**
 * Return a hold ONLY if the printed-source plural Latin N. et N. survives in
 * the exact Common and the French donor has fewer than two saint placeholders.
 * An approved source with two plural placeholders is allowed; authenticated
 * distinct named saints no longer matching the Latin pattern are untouched.
 */
// Resolve an oration's owner through the *actual* 1962 Calendar source
// declaration when the host Proper flattener drops individual row.sourcePath.
// Never infer ownership solely from a date or position: accept index mapping
// only with exact prayer row count, attested Calendar sources and no
// multi-oration one-conclusion composition whose rows have different owners.
function exactOrationRowOwner(proper,rows,index){
  const row=rows[index];
  if(!row)return null;
  if(row.sourcePath)return String(row.sourcePath)
    .replace(/:(?:Oratio|Secreta|Postcommunio)$/iu,"")
    .replace(/\.txt$/iu,"");
  const base=String(proper?.sourcePath??"").replace(/\.txt$/iu,"");
  if(!base)return null;
  const decision=proper?.commemorationFormDecision;
  const applied=decision?.status==="CERTIFIED"&&
    decision?.source==="1962_PROPER_RESOLVER"&&
    Array.isArray(proper?.appliedCommemorations)&&
    decision.appliedCount===proper.appliedCommemorations.length
      ?proper.appliedCommemorations:null;
  const listed=(applied??proper?.calendarCommemorations??[])
    .filter(x=>x&&!x.inseparable);
  if(rows.length!==listed.length+1||
    rows.some(x=>x?.oneConclusion))return null;
  const owner=index===0?base:
    String(listed[index-1]?.prayerSourcePath??listed[index-1]?.path??"");
  return owner.replace(/:(?:Oratio|Secreta|Postcommunio)$/iu,"")
    .replace(/\.txt$/iu,"")||null;
}

export function inspect1962PluralMartyrsFrenchOrationSource(proper,slot){
  const path=String(proper?.sourcePath??"").replace(/\.txt$/iu,"");
  const rows=originalRows(proper,slot);
  // The named Saints' Proper is a separate source path from Commune/C7b.
  // Explicit source provenance is required; never infer it merely because
  // the calendar date matches another Mass.
  if(slot==="COLLECT_SET"||slot==="SECRET_SET"){
    for(const [index,row] of rows.entries()){
      const rowPath=exactOrationRowOwner(proper,rows,index);
      if(rowPath!==PERPETUA_FELICITY)continue;
      const latin=String(row?.lat??row?.la??"");
      const french=String(row?.fr??"");
      const frWrong=WITNESS_FRENCH.test(ascii(french));
      const latWrong=/\bvirginum\s+et\s+martyrum\b/iu.test(ascii(latin));
      // The pinned source itself specifies C7b, the Common of female
      // NON-Virgin Martyrs. The production host currently retains
      // "Virginum et Martyrum" even in the LATIN commemorative prayer.
      // French and Latin may therefore be wrong *together*. Comparing them
      // for agreement is not enough; check their original source ownership.
      const identifiedLatin=MARTYRS_LATIN.test(ascii(latin))&&
        /\bperpetuae\s+et\s+felicitatis\b/iu.test(ascii(latin));
      if(identifiedLatin&&(frWrong||latWrong)){
        return Object.freeze({
          status:"SOURCE_CONFLICT",
          reason:"1962 Perpetua and Felicity: C7b non-Virgin Martyrs Common incorrectly rendered as Virgins",
          sourcePath:rowPath,slot,orationIndex:index,
          rule:"ICRSP_B41_NONVIRGIN_COMMON_SANCTI_03_06_SOURCE_PARITY",
          sourceLatinIncorrect:latWrong,sourceFrenchIncorrect:frWrong,
          sourceTextAltered:false
        });
      }
    }
  }
  if(!AFFECTED.has(path)||!GUARDED.has(String(slot)))return null;
  for(const [index,row] of rows.entries()){
    const latin=String(row?.lat??row?.la??"");
    if(!latinPluralNames.test(latin))continue;
    const french=String(row?.fr??"");
    const frenchNames=[...french.matchAll(frenchName)].length;
    if(frenchNames>=2)continue;
    return Object.freeze({
      status:"SOURCE_CONFLICT",
      reason:"1962 plural-martyr Common: French prayer does not retain the Latin plural saint names",
      sourcePath:path,slot,orationIndex:index,
      rule:"ICRSP_B41_1962_PRINTED_PLURAL_MARTYRS_FR_SOURCE_PARITY",
      frenchNameCount:frenchNames,latinPluralNameCount:2,
      sourceTextAltered:false,
    });
  }
  return null;
}


// Correct ONLY the exact failed inheritance of Common C7b for Saints
// Perpetua/Felicity in the already-resolved Proper projection. The pinned
// Latin/English C7b directives each remove "Virginum et "/"Virgins and "
// from the C6b multiple Virgin Martyrs source. The French C7b directive
// likewise removes "Vierges et ". Its application was lost by the host
// source parser for Sancti/03-06; original 1962 C7b and SHA witness record
// data/mass/1962-plural-martyrs-french-source-review.v1.json prove the intent.
// This adds NO newly invented translation and NEVER mutates a host source.
//
// A correction requires the exact Calendar owner, two named Martyrs in Latin,
// three populated languages, the expected inherited offending phrase,
// and successful triplicate comparison after the three deletions.
// Unrecognized variants remain under the existing fail-closed reader guard.
const CORRECTION_ID="1962_C7B_PERPETUA_FELICITY_NONVIRGIN_INHERITANCE";
const REMOVE=Object.freeze({
 lat:/\bV[ií]rginum et (?=M[áa]rtyrum\b)/giu,
 en:/\bVirgins and (?=Martyrs\b)/giu,
 fr:/\bVierges et (?=Martyres\b)/giu,
});
const BAD=Object.freeze({
 lat:/\bvirginum\s+et\s+martyrum\b/iu,
 en:/\bvirgins\s+and\s+martyrs\b/iu,
 fr:/\bvierges\s+et\s+martyres\b/iu,
});
const WORD_MARTYRS=Object.freeze({
 lat:/\bmartyrum\b/iu,
 en:/\bmartyrs\b/iu,
 fr:/\bmartyres\b/iu,
});
const NAMED=Object.freeze({
 lat:/\bperpetuae\s+et\s+felicitatis\b/iu,
 en:/\bperpetua\s+and\s+felicit(?:as|y)\b/iu,
 fr:/\bperpetue\s+et\s+felicite\b/iu,
});

export function reconcile1962PerpetuaFelicityNonVirginCommon(proper){
  if(!proper||typeof proper!=="object")return proper;
  let result=null,proof=[];
  for(const [slot,plural,singular] of [
    ["COLLECT_SET","collects","collect"],
    ["SECRET_SET","secrets","secret"]]){
    const rows=originalRows(proper,slot);
    if(!rows.length)continue;
    let nextRows=null;
    for(const [index,row] of rows.entries()){
      if(exactOrationRowOwner(proper,rows,index)!==PERPETUA_FELICITY)continue;
      const old={lat:String(row?.lat??row?.la??""),
        en:String(row?.en??""),fr:String(row?.fr??"")};
      // Require complete, distinct, named source prayers; don't infer a
      // correction from a calendar date or a coincidental Marian phrase.
      if(Object.values(old).some(text=>text.trim().length<80) ||
        !WORD_MARTYRS.lat.test(ascii(old.lat)) ||
        !NAMED.lat.test(ascii(old.lat)) ||
        !Object.entries(WORD_MARTYRS).every(([lang,rx])=>
          rx.test(ascii(old[lang]))) ||
        !Object.entries(NAMED).every(([lang,rx])=>rx.test(ascii(old[lang]))))
        continue;
      const bad=Object.fromEntries(Object.keys(old).map(lang=>
        [lang,BAD[lang].test(ascii(old[lang]))]));
      if(!Object.values(bad).some(Boolean))continue;
      const replacement={...old};
      let valid=true;
      for(const lang of ["lat","en","fr"]){
        if(bad[lang]){
          const re=REMOVE[lang];
          const count=[...old[lang].matchAll(re)].length;
          if(count!==1){valid=false;break;}
          replacement[lang]=old[lang].replace(re,"");
          if(BAD[lang].test(ascii(replacement[lang]))){valid=false;break;}
        }
      }
      if(!valid)continue; // Fail-closed source conflict still applies.
      if(!nextRows)nextRows=rows.slice();
      nextRows[index]=Object.freeze({...row,...replacement});
      proof.push(Object.freeze({id:CORRECTION_ID,sourcePath:PERPETUA_FELICITY,
        slot,orationIndex:index,fields:Object.freeze(
          Object.keys(bad).filter(x=>bad[x])),originalSourcePreserved:true,
        witness:"DivinumOfficium/divinum-officium@126a07f91ede04664108abb6fb20ace3f4de14b9/web/www/horas/Latin/Commune/C7b.txt"}));
    }
    if(nextRows){
      result??={...proper};
      result[plural]=Object.freeze(nextRows);
      result[singular]=nextRows[0];
    }
  }
  if(!result)return proper;
  return Object.freeze({...result,
    sourceEditorialCorrections:Object.freeze([
      ...(proper.sourceEditorialCorrections??[]),...proof])});
}
