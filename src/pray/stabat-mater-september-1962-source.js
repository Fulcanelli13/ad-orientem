/**
 * Complete 20-tercet Latin Stabat Mater for the September 15 Seven Sorrows
 * sequence. Do not substitute this for Passion Friday's shorter liturgical
 * sequence or the 13 between-Station excerpts in the approved Stations reader.
 * The September 15 sequence and disputed stanza 18 have been visually
 * compared to a 1962 printed Missale Romanum, p. 671 (scan 0748).
 * Exact Benziger edition identity, 1961 comparison, and exhaustive
 * orthographic collation are not independently certified.
 * No English/French translation is claimed.
 */
export const STABAT_MATER_SEPTEMBER_SOURCE=Object.freeze({
  schema:"ao.pray.stabat.september-20.v1",
  occasion:"SEVEN_SORROWS_SEPTEMBER_15",
  language:"la",
  sourceWitnesses:Object.freeze([
    "https://extraordinaryform.org/masses/0915SevenSorrowsBVMM20.pdf"
  ]),
  printed1962ImageIndependentlyCollated:true,
  printed1962ImageCollationScope:"SEPTEMBER_15_STANZAS_18_TO_20_AND_20_TERCET_COUNT",
  originalBenzigerEditionIdentityCertified:false,
  original1961EditionCollationCertified:false,
  stanzaCount:20,
  variant19:"CHRISTE_CUM_SIT_HINC_EXIRE",
  translationStatus:"LATIN_ONLY",
  stationExtractCount:13
});
export const STABAT_MATER_SEPTEMBER_FINAL_SEVEN=Object.freeze([
  "Iuxta Crucem tecum stare,\nEt me tibi sociare,\nIn planctu desidero.",
  "Virgo virginum præclara,\nMihi iam non sis amara:\nFac me tecum plangere.",
  "Fac, ut portem Christi mortem,\nPassionis fac consortem,\nEt plagas recolere.",
  "Fac me plagis vulnerari,\nFac me Cruce inebriari,\nEt cruore Filii.",
  "Flammis ne urar succensus,\nPer te, Virgo, sim defensus,\nIn die iudicii.",
  "Christe, cum sit hinc exire,\nDa per Matrem me venire\nAd palmam victoriæ.",
  "Quando corpus morietur,\nFac, ut animæ donetur\nParadisi gloria. Amen."
]);
export function completeSeptemberStabatMater(firstThirteen){
  if(!Array.isArray(firstThirteen)||firstThirteen.length!==13||
    !firstThirteen[0]?.startsWith("Stabat Mater dolorosa")||
    !firstThirteen[12]?.startsWith("Fac me tecum pie flere"))return null;
  return Object.freeze([...firstThirteen,...STABAT_MATER_SEPTEMBER_FINAL_SEVEN]);
}
