import { rogationProperReady } from "./rogation-mass-selection.js";
import { assertReaderProperReady, properToReaderSlots } from "./proper-reader-slots.js";

// Source-owned nine-section 1962 Rogation Proper => canonical R17 reader slots.
// No Gregorian Ordinary is copied or generated here. The preface must be
// supplied as a source-resolved trilingual text by the shared Mass owner.
export function compileRogationReaderProper({sourceGate,sourceProper,preface}={}) {
  if (!rogationProperReady(sourceGate,sourceProper))
    throw new Error("ROGATION_PROPER_NOT_PUBLISHED_AND_CERTIFIED");
  const required=["lat","en","fr"];
  if (!preface || required.some(k=>typeof preface[k]!=="string" || !preface[k].trim()) ||
      typeof preface.sourceRef!=="string" || !preface.sourceRef.trim())
    throw new Error("ROGATION_SOURCE_RESOLVED_PREFACE_REQUIRED");

  if (sourceProper.interlectionalVariants?.inSeason!=="EASTERTIDE" ||
      sourceProper.interlectionalVariants?.eastertide?.twoVerseAlleluia!==true ||
      sourceProper.massClass!==2 || sourceProper.vestmentColour!=="violet" ||
      sourceProper.gloria!==false || sourceProper.credo!==false ||
      sourceProper.massEntry!=="INTROIT" || sourceProper.ordinaryOpeningSuppressed!==true)
    throw new Error("ROGATION_1962_RITE_CONTRACT_MISMATCH");
  const map=new Map(sourceProper.sections.map(s=>[s.key,s]));
  const text=(key)=>{
    const s=map.get(key);
    if (!s)throw new Error("ROGATION_MISSING_"+key.toUpperCase());
    return Object.freeze({
      lat:s.latin,en:s.english,fr:s.french,
      sourceRef:s.sourceLocator,sourceImage:s.sourceImage,
    });
  };
  const output=Object.freeze({
    sourcePath:"Rogationes/1962/Exaudivit",
    liturgicalSource:"Missale Romanum (1962), Vatican typical edition, pp. 347–349",
    class:2,colour:"violet",hasGloria:false,showGloria:false,
    hasCredo:false,showCredo:false,opening:"INTROIT",
    introit:text("introit"),
    collects:Object.freeze([text("collect")]),
    epistle:text("epistle"),
    // The reader's GRADUAL slot owns the full source-ordered two-verse
    // Eastertide Alleluia; no duplicate Sequence is added.
    gradual:text("gradual_alleluia"),
    gospel:text("gospel"),
    offertory:text("offertory"),
    secrets:Object.freeze([text("secret")]),
    preface:Object.freeze({...preface}),
    communion:text("communion"),
    postcommunions:Object.freeze([text("postcommunion")]),
  });
  for(const language of ["en","fr"]){
    const verified=assertReaderProperReady(properToReaderSlots(output,{language}));
    if(verified.missing.length)throw new Error("ROGATION_READER_INCOMPLETE_"+language.toUpperCase());
  }
  return output;
}
