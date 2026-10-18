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
  // The native print path uses the original named preGospelChants array
  // rather than gradual directly. Correct that *same* canonical reference
  // in the projected Gradual section too, never in an Alleluia/Tract.
  const chantCopy=(proper.preGospelChants??[]).map(entry=>{
    const kind=String(entry?.kind??"").toLowerCase();
    if(kind!=="graduale"&&kind!=="gradual")return entry;
    const text=entry?.text;
    if(!text||typeof text!=="object")return entry;
    const la=String(text.lat??"");
    if(!la.startsWith(INCORRECT+"\n")||
      !/Dominábitur a mari usque ad mare/u.test(la))return entry;
    const fr=String(text.fr??"");
    const frWrong=fr.startsWith(INCORRECT+"\n")&&
      /Il dominera de la mer à la mer/u.test(fr);
    return Object.freeze({...entry,text:Object.freeze({...text,
      lat:CORRECT+la.slice(INCORRECT.length),
      ...(frWrong?{fr:CORRECT+fr.slice(INCORRECT.length)}:{}),
    })});
  });
  const copyChanged=Array.isArray(proper.preGospelChants)&&
    chantCopy.some((entry,i)=>entry!==proper.preGospelChants[i]);
  const proof=proper.readerChantSourceProof;
  let proofCorrected=proof;
  if(proof?.status==="SOURCE_VERIFIED_EXACT" &&
     proof?.sourcePath===CHRIST_KING_SOURCE &&
     Array.isArray(proof.parts) && proof.parts.length===2){
    const first=proof.parts[0],rawLa=String(first?.lat??"");
    if(first?.kind==="GRADUAL"&&rawLa.startsWith(INCORRECT+"\n")&&
      /Dominábitur a mari usque ad mare/u.test(rawLa)){
      const rawFr=String(first?.fr??"");
      const changeFr=rawFr.startsWith(INCORRECT+"\n")&&
        /Il dominera de la mer à la mer/u.test(rawFr);
      proofCorrected=Object.freeze({...proof,parts:Object.freeze([
        Object.freeze({...first,lat:CORRECT+rawLa.slice(INCORRECT.length),
          ...(changeFr?{fr:CORRECT+rawFr.slice(INCORRECT.length)}:{})}),
        proof.parts[1],
      ])});
    }
  }
  return Object.freeze({...proper,
    ...(proofCorrected!==proof?{readerChantSourceProof:proofCorrected}:{}),
    gradual:Object.freeze({...proper.gradual,
      lat:CORRECT+latin.slice(INCORRECT.length),
      ...(frenchCorrupt?{fr:CORRECT+french.slice(INCORRECT.length)}:{}),
    }),
    ...(copyChanged?{preGospelChants:Object.freeze(chantCopy)}:{}),
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
