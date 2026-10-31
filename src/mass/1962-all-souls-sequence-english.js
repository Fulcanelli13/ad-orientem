// Display-only source-note correction for the appointed Dies irae on All Souls.
// The pinned English Sequentia includes "May be omitted at Daily Mass" as a
// leading editorial note. It is NOT a verse or a blanket permission on Nov 2.
// Latin, French, original Proper, source identity and the Sequence stay intact.
// Missal 1960 General Rubrics 399 and 470 condition any permitted omission.
export const ALL_SOULS_DIES_IRAE_SOURCE_NOTE=Object.freeze({
  id:"MR62_ALL_SOULS_DIES_IRAE_EN_SOURCE_NOTE_ALIGNMENT",
  sourcePaths:Object.freeze(["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"]),
  language:"en",section:"Sequentia",slot:"ALLELUIA_TRACT_SEQUENCE",
  sourceEnglishNote:"May be omitted at Daily Mass",
  correctionType:"DISPLAY_ONLY_SOURCE_EDITORIAL_NOTE_NOT_HYMN",
  sourceRule:"1960_MISSAL_GENERAL_RUBRICS_399_470",
  authority:"https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html",
});

const SOURCE_IDS=new Set(ALL_SOULS_DIES_IRAE_SOURCE_NOTE.sourcePaths);
const NOTE=/^May be omitted at Daily Mass\.?[ \t]*\r?\n/u;
const LATIN=/^Dies\s+ir(?:æ|ae|e),?\s+dies\s+illa/iu;
export function project1962AllSoulsDiesIraeEnglishDisplayRows(proper,rows,{language="en"}={}){
  if(!Array.isArray(rows)||String(language).toLowerCase()!=="en"||
     !SOURCE_IDS.has(String(proper?.sourcePath??"")))return rows;
  let changed=false;
  const mapped=rows.map(row=>{
    const english=String(row?.vernacular??"");
    if(!LATIN.test(String(row?.latin??"").trimStart())||
       !NOTE.test(english))return row;
    const corrected=english.replace(NOTE,"");
    if(!corrected.trim()||corrected===english)return row;
    changed=true;
    return Object.freeze({...row,vernacular:corrected,
      sourceEnglishEditorialNote:ALL_SOULS_DIES_IRAE_SOURCE_NOTE});
  });
  return changed?Object.freeze(mapped):rows;
}
