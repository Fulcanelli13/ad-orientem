// Small, provenance-locked corrections to *references*, never to prayers.
// The external source Proper remains auditable; this function only fixes a
// corroborated printed psalm citation at its reader/print projection boundary.
const CHRIST_KING_SOURCE="Sancti/10-DU";
const INCORRECT="Ps 71:8; 78:11";
const CORRECT="Ps 71:8; 71:11";
const VERSE=/Dominábitur a mari usque ad mare[\s\S]*?Et adorábunt eum omnes reges terræ/u;

export function correct1962ProperEditorialReferences(proper){
  if(!proper||typeof proper!=="object")return proper;
  if(String(proper.sourcePath??"")!==CHRIST_KING_SOURCE)return proper;
  const latin=String(proper.gradual?.lat??"");
  const french=String(proper.gradual?.fr??"");
  if(!latin.startsWith(INCORRECT+"\n")||!VERSE.test(latin))return proper;
  const frenchCorrupt=french.startsWith(INCORRECT+"\n") &&
    /Il dominera de la mer à la mer[\s\S]*?Et tous les rois de la terre/u.test(french);
  return Object.freeze({...proper,
    gradual:Object.freeze({...proper.gradual,
      lat:CORRECT+latin.slice(INCORRECT.length),
      ...(frenchCorrupt?{fr:CORRECT+french.slice(INCORRECT.length)}:{}),
    }),
    editorialReferenceCorrections:Object.freeze([
      ...(proper.editorialReferenceCorrections??[]),
      Object.freeze({
        id:"MR62_CHRIST_KING_GRADUAL_PSALM_71_8_11",
        fields:frenchCorrupt?["gradual.lat","gradual.fr"]:["gradual.lat"],
        sourcePath:CHRIST_KING_SOURCE,
        original:INCORRECT,corrected:CORRECT,
        witness:"https://icrspfrance.fr/textes-de-la-messe.php?d=2026-10-25",
        secondWitness:"https://ordo.fsspx.org/day/2026-10-25?lang=la&mode=liturgical",
        correctionType:"SCRIPTURE_CITATION_ONLY",
      }),
    ]),
  });
}
