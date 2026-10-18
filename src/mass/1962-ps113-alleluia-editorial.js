// Source-preserving presentation repair for the Alleluia of XXI Sunday
// after Pentecost. The Challoner/Douay sentence is elliptical because the
// following scriptural verse completes the thought; it is awkward as a
// self-contained Alleluia display. Do not mutate the original Proper,
// authenticated source proof, Latin, French, or shared Psalter.
//
// 1962 chant: https://gmr.sourceforge.net/nv/21_ps.html
// Historical Challoner: https://ccel.org/ccel/challoner/douayrheims/Psalms/113.html
// Independent Mass Proper: https://missale.online/proprium/en/tempore/dominica_xxi_post_pentecosten
// Crampon 1923 corresponds to Psalm 114:1, NOT Vulgate Psalm 113:1.
const SOURCE="Tempora/Pent21-0";
const OLD="When Israel went out of Egypt, the house of Jacob from a barbarous people.";
const NEW="When Israel went out of Egypt, the house of Jacob left a people of foreign speech.";
export const PS113_PENT21_ENGLISH_EDITORIAL=Object.freeze({
  id:"MR62_PENT21_PS113_1_ALLELUIA_EN_GRAMMAR",
  sourcePath:SOURCE,vulgateReference:"Ps 113:1",modernReference:"Ps 114:1",
  language:"en",sourceEnglish:OLD,displayEnglish:NEW,
  correctionType:"ENGLISH_DISPLAY_EDITORIAL_NOT_SOURCE_PROOF",
  witness:"https://ccel.org/ccel/challoner/douayrheims/Psalms/113.html",
  missal:"https://gmr.sourceforge.net/nv/21_ps.html",
});

function normalizedLatin(value){
 return String(value??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/\s+/g," ").toLowerCase();
}
const latinMatch=text=>
 /in exitu israel de aegypto[,.:]? domus [ij]acob de populo barbaro/
 .test(normalizedLatin(text));
export function is1962Pent21EnglishSource(proper){
 return proper?.sourcePath===SOURCE&&latinMatch(proper?.gradual?.lat)&&
  String(proper?.gradual?.en??"").includes(OLD);
}

/** Apply only after trilingual source proof validation and slot composition. */
export function project1962Pent21AlleluiaDisplayRows(proper,rows,{language="en"}={}){
 if(!String(language).startsWith("en")||!is1962Pent21EnglishSource(proper)||
    !Array.isArray(rows))return rows;
 let changed=false;
 const mapped=rows.map(row=>{
  if(!latinMatch(row?.latin)||!String(row?.vernacular??"").includes(OLD))return row;
  changed=true;
  return Object.freeze({...row,vernacular:row.vernacular.replace(OLD,NEW)});
 });
 return changed?Object.freeze(mapped):rows;
}
