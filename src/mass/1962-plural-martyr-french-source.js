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

function originalRows(proper,slot){
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
export function inspect1962PluralMartyrsFrenchOrationSource(proper,slot){
  const path=String(proper?.sourcePath??"").replace(/\.txt$/iu,"");
  if(!AFFECTED.has(path)||!GUARDED.has(String(slot)))return null;
  const rows=originalRows(proper,slot);
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
