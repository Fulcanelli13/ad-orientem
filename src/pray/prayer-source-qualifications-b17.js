/** B17 editorial status derived from data/pray/novena-source-review.v3.json.
 * No new prayers, editions or print-collation claims. Contract tests reconcile
 * the immutable IDs and aggregate status to the exact registry. */
export const NOVENA_PRINT_AUDIT_B17=Object.freeze({
 schema:"ao.prayer.novena-print-qualification.v1",
 reviewedIds:Object.freeze(["holy_ghost","christmas","corpus_christi","sacred_heart","immaculate_conception","annunciation","assumption","seven_sorrows","st_joseph","holy_souls","perpetual_help","st_therese","st_anthony_nine_tuesdays","christ_the_king","immaculate_heart","st_michael"]),
 printCertified:0,printPending:16,
 digitalDayBodyAnchorsReviewed:72,digitalFullLineByLineCertificates:0
});
const EN="Source identified and digitally compared where available; independent full line-by-line collation against the original printed edition remains pending. English prayer-body and French witness status are separate: this citation does not certify either text as an exact facsimile.";
const FR="Source identifiée et comparée avec les témoins numériques disponibles ; la collation intégrale, ligne par ligne, avec l’édition imprimée originale reste à faire. Les statuts du texte anglais et du témoin français sont distincts : cette référence ne certifie aucun des deux comme reproduction exacte de l’imprimé.";
export function novenaPrintQualification(id,{french=false}={}){
 if(!NOVENA_PRINT_AUDIT_B17.reviewedIds.includes(String(id||"")))return null;
 return Object.freeze({status:"PRINT_COLLATION_PENDING",text:french?FR:EN});
}
export const TENEBRAE_DIGITAL_SOURCE_B17=Object.freeze({
 repository:"DivinumOfficium/divinum-officium",
 revision:"b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0",
 url:"https://github.com/DivinumOfficium/divinum-officium/commit/b9f8c8eb15d52b2b2c02e2ca24807cfaa73758f0",
 printCollationCertified:false,
 hourCoverage:Object.freeze(["MATINS","LAUDS"]),
 dayCoverage:Object.freeze(["Quad6-4","Quad6-5","Quad6-6"]),
 languages:Object.freeze(["la","en","fr"])
});
export function tenebraeRevisionLink(revision){
 return revision===TENEBRAE_DIGITAL_SOURCE_B17.revision?TENEBRAE_DIGITAL_SOURCE_B17.url:null;
}
