/**
 * Version-specific Divine Praises. The Holy Spirit invocation was inserted
 * by decree 25 April 1964 (AAS 56 [1964] 338). The 1962-era thirteen-line
 * projection removes exactly that invocation from the existing 14-line
 * canonical source, without falsely attributing the modern translation to
 * the earlier printed witness.
 */
export const DIVINE_PRAISES_EDITION=Object.freeze({
 historical:"1962-thirteen-invocations",
 later:"post-1964-fourteen-invocations",
 decree:"Sacred Congregation of Rites, 25 April 1964 · AAS 56 (1964), p. 338",
 witness:"https://zenit.org/2025/03/26/questions-about-liturgy-tinkering-with-the-divine-praises/",
 baseSource:"https://www.usccb.org/prayers/divine-praises",
 provenance:"Historical sequence projection; current translations retained verbatim except omitted 1964 invocation"
});
const added=Object.freeze({
 en:/^Blessed be the Holy Spirit, the Paraclete\.$/i,
 la:/^Benedictus Spiritus Sanctus, Paraclitus\.$/i,
 fr:/^Béni soit l’Esprit Saint, le Paraclet\.$/i
});
export function divinePraisesForForm(prayer,form="1962"){
 if(!prayer||!Object.keys(added).every(k=>typeof prayer[k]==="string"))
  throw new TypeError("Canonical Divine Praises text unavailable");
 if(form!=="1962"&&form!=="later")throw new RangeError("Unknown Divine Praises edition");
 if(form==="later")return Object.freeze({...prayer,edition:DIVINE_PRAISES_EDITION.later});
 const source={...prayer};
 for(const [lang,re] of Object.entries(added)){
  const lines=prayer[lang].split("\n");
  const omitted=lines.filter(x=>re.test(x));
  if(omitted.length!==1||lines.length!==14)
   throw new Error("Divine Praises historical 1962 collation failed: "+lang);
  source[lang]=lines.filter(x=>!re.test(x)).join("\n");
 }
 return Object.freeze({...source,edition:DIVINE_PRAISES_EDITION.historical,
  provenance:{...prayer.provenance,baseLanguageWitness:prayer.provenance?.url,
   editionNote:DIVINE_PRAISES_EDITION.decree+"; 1962 13-line sequence reconstructed by removing the later invocation."}});
}
