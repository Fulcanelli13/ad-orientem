// Display-only, source-pinned English editorial repair for the 1962
// XXI Sunday after Pentecost Alleluia (Vulgate Ps 113:1).
// The historical Douay/Challoner verse is elliptical; the Mass presents
// only verse 1 without verse 2. Repeat the implied verbal action in a
// faithful, readable English rendering. Do NOT rewrite Latin or French,
// the Scriptural witnesses, or the original external Proper source.
//
// 1962 chant: https://gmr.sourceforge.net/nv/21_ps.html (Ps 113:1)
// Historical English: https://ccel.org/ccel/challoner/douayrheims/Psalms/113.html
// 1962 Proper: https://missale.online/proprium/en/tempore/dominica_xxi_post_pentecosten
// French independent comparison: Crampon 1923, Ps 114:1 (different numbering).
const SOURCE="Tempora/Pent21-0";
const OLD="When Israel went out of Egypt, the house of Jacob from a barbarous people.";
const NEW="When Israel went out of Egypt, the house of Jacob left a people of foreign speech.";
const EVIDENCE=Object.freeze({
 id:"MR62_PENT21_PS113_1_ALLELUIA_EN_GRAMMAR",
 sourcePath:SOURCE,sourceVerse:"VULGATE_PS_113_1",modernPsalm:"114:1",
 language:"en",original:OLD,corrected:NEW,
 correctionType:"ENGLISH_DISPLAY_EDITORIAL_PARAPHRASE_NOT_SOURCE_TEXT",
 witness:"https://ccel.org/ccel/challoner/douayrheims/Psalms/113.html",
 corroboration:"https://gmr.sourceforge.net/nv/21_ps.html",
});

function latinMatch(text){
 const latin=String(text??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
   .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replace(/\s+/g," ").toLowerCase();
 return /in exitu israel de aegypto[,.:]? domus [ij]acob de populo barbaro/.test(latin);
}
function replaceExact(text){
 return String(text??"").includes(OLD)?String(text).replace(OLD,NEW):text;
}

export function correct1962Pent21AlleluiaEnglish(proper){
 if(!proper||proper.sourcePath!==SOURCE||!latinMatch(proper.gradual?.lat))return proper;
 const gradual=proper.gradual;
 const revised=replaceExact(gradual?.en);
 if(revised===gradual?.en)return proper; // Cannot repair a different translation.
 let changedChants=false;
 const chants=Array.isArray(proper.preGospelChants)?proper.preGospelChants.map(part=>{
   if(!/^alleluia$/i.test(String(part?.kind??""))||
      !latinMatch(part?.text?.lat))return part;
   const updated=replaceExact(part?.text?.en);
   if(updated===part?.text?.en)return part;
   changedChants=true;
   return Object.freeze({...part,text:Object.freeze({...part.text,en:updated})});
 }):null;
 const proof=proper.readerChantSourceProof;
 let proofCopy=proof;
 if(proof?.status==="SOURCE_VERIFIED_EXACT"&&proof.sourcePath===SOURCE&&
    Array.isArray(proof.parts)&&proof.parts.length===2&&
    proof.parts[1]?.kind==="ALLELUIA"&&latinMatch(proof.parts[1].lat)){
   const next=replaceExact(proof.parts[1].en);
   if(next!==proof.parts[1].en){
     proofCopy=Object.freeze({...proof,parts:Object.freeze([
       proof.parts[0],Object.freeze({...proof.parts[1],en:next})
     ])});
   }
 }
 return Object.freeze({...proper,
   gradual:Object.freeze({...gradual,en:revised}),
   ...(changedChants?{preGospelChants:Object.freeze(chants)}:{}),
   ...(proofCopy!==proof?{readerChantSourceProof:proofCopy}:{}),
   editorialTranslationCorrections:Object.freeze([
     ...(proper.editorialTranslationCorrections??[]),EVIDENCE
   ]),
 });
}
