/**
 * Batch 3 Litany source/use boundary. This module deliberately does NOT
 * construct a fictional harmonised 1962 EN/FR text. The two older personal
 * transcriptions remain separate witness editions in litany-source.js.
 *
 * The ICRSP Major Litanies page is an actual Latin/French liturgical source:
 * its procession antiphon, litany, associated supplications and collects have
 * different liturgical functions. None may be silently combined.
 */
export const BATCH03_LITANY_EDITION_POLICY=Object.freeze({
  private:Object.freeze({id:"private",labelEn:"Private Litany · historical prayer-book edition",
    labelFr:"Litanies privées · édition historique",
    reader:"local-historical-online-on-first-use",
    textSource:"src/pray/litany-source.js",
    liturgical1962Certified:false}),
  major:Object.freeze({id:"major",labelEn:"Major Litanies / Rogations · public liturgical rite",
    labelFr:"Litanies majeures / Rogations · rite liturgique public",
    reader:"SOURCE_LINK_ONLY_PENDING_COMPLETE_TEXT_COLLATION",
    liturgical1962Certified:false,
    sourceUrl:"https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau",
    additionalSourceUrl:"https://icrspfrance.fr/textes-liturgiques.php?article=a0106_nouveau",
    rubric:"1960 General Rubrics 80–90: conditional procession or other supplications; prescribed litany and prayers",
    localVariation:true}),
  vigil:Object.freeze({id:"vigil",labelEn:"Easter Vigil · distinct shorter litany",
    labelFr:"Vigile pascale · litanies abrégées distinctes",
    reader:"EXISTING_SPECIAL_MASS_OWNER",
    textSource:"existing Easter Vigil reader (not private litany)",
    liturgical1962Certified:false}),
  forty:Object.freeze({id:"forty",labelEn:"Solemn Forty Hours · clergy-led rite",
    labelFr:"Quarante-Heures solennelles · rite conduit par le clergé",
    reader:"EXISTING_FORTY_HOURS_OWNER",
    textSource:"src/pray/forty-hours-solemn.js",
    liturgical1962Certified:false})
});
export const BATCH03_ICRSP_MAJOR_PROCESSION_STEPS=Object.freeze([
 Object.freeze({id:"assembly",en:"Clergy and people assemble and briefly pray kneeling; a priest and ministers vest according to the local procession.",fr:"Le clergé et les fidèles se rassemblent et prient à genoux ; le célébrant et les ministres revêtent les ornements prévus.",role:"PUBLIC_RUBRIC"}),
 Object.freeze({id:"antiphon",en:"Exsurge, Domine (Ps 43) and the prescribed psalm verse precede the litany.",fr:"Exsurge, Domine (Ps 43) et le verset prescrit précèdent les litanies.",role:"CHANTERS"}),
 Object.freeze({id:"kneeling",en:"The Litany begins while kneeling; it is not a free-form lay ceremony.",fr:"Les Litanies commencent à genoux ; il ne s’agit pas d’un cérémonial libre organisé par le fidèle.",role:"CLERGY_CHANTERS_PEOPLE"}),
 Object.freeze({id:"procession",en:"The source rubrics direct the procession to rise and proceed after Sancta Maria, with continued responses.",fr:"Les rubriques font lever la procession après Sancta Maria, et les répons continuent.",role:"PUBLIC_PROCESSION"}),
 Object.freeze({id:"suffrages",en:"The full source includes specific additional supplications, psalm verses and collects; these are NOT the private litany.",fr:"La source complète inclut des supplications, des versets et des oraisons propres ; ils ne font PAS partie des litanies privées.",role:"PUBLIC_CEREMONY"})
]);
export const BATCH03_LITANY_SOURCE_STATUS=Object.freeze({
  latinFrench:"SOURCE_IDENTIFIED_LINE_COLLATION_PENDING",
  comparisonEnglish1883:"DISTINCT_PRIVATE_1883_WITNESS_NOT_1962",
  comparisonFrench1862:"DISTINCT_PRIVATE_1862_WITNESS_NOT_1962",
  offlineComplete1962:"BLOCKED_UNTIL_ENTIRE_EDITION_VERIFIED",
  source:"https://icrspfrance.fr/textes-liturgiques.php?article=a0087_nouveau"
});
export function batch03LitanyUse(value){
 return BATCH03_LITANY_EDITION_POLICY[value]||BATCH03_LITANY_EDITION_POLICY.private;
}
