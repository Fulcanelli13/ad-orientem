// 1962 Exsultet: Missal-only paragraph projection over a single recovered
// donor row. The source row is immutable; no LIVE/SIMPLE or event changes.
// Boundaries are explicitly present in the donor's parallel Latin and English
// text. The 1962 rite remains the single EV-EXS-200/210 ceremonial surface.
const freeze=Object.freeze;
const LATIN_INTRO_SPLIT=" Quaprópter astántes";
const ENGLISH_INTRO_START="Therefore, dearly beloved brethren";
const incipits=freeze([
  "Exsúltet iam","Quaprópter astántes","℣. Dóminus vobíscum.",
  "Vere dignum et iustum est","Hæc nox est","O mira circa nos",
  "Huius ígitur sanctificátio","In huius ígitur noctis",
  "O vere beáta nox","Orámus ergo te","Precámur ergo te",
  "Per eúndem Dóminum"
]);
function fail(why){throw new Error("EXSULTET_SOURCE_ALIGNMENT:"+why)}
export function projectExsultetSourceParagraphs(source){
  const latin=String(source?.primary??source?.latin??"");
  // Explicitly absent French must remain absent. The source object may
  // also retain historical English fields, but those are not a translation
  // of the language actually selected in the Missal.
  const english=source && Object.hasOwn(source,"secondary")
    ? source.secondary
    : (source?.english??source?.vernacular??null);
  const latinGroups=latin.split("\n\n");
  if(latinGroups.length!==11)fail("LATIN_PARAGRAPH_COUNT");
  if(!latinGroups[0].includes(LATIN_INTRO_SPLIT))fail("INTRO_PRAYER_BOUNDARY");
  const at=latinGroups[0].indexOf(LATIN_INTRO_SPLIT);
  if(at<50)fail("INVALID_INTRO_BOUNDARY");
  const latinParts=[
    latinGroups[0].slice(0,at),
    latinGroups[0].slice(at+1),
    ...latinGroups.slice(1),
  ];
  if(latinParts.length!==12 || latinParts.some((p,i)=>!p.startsWith(incipits[i])))
    fail("LATIN_INCIPITS");
  if(latinParts[0]+" "+latinParts[1]+"\n\n"+latinParts.slice(2).join("\n\n")!==latin)
    fail("LATIN_BYTES");
  let englishParts=null;
  if(english!=null){
    englishParts=String(english).split("\n\n");
    if(englishParts.length!==12 ||
      !englishParts[1].startsWith(ENGLISH_INTRO_START) ||
      !englishParts[2].startsWith("℣. The Lord be with you.") ||
      !englishParts[11].startsWith("Through the same Jesus Christ"))
      fail("ENGLISH_BOUNDARIES");
    if(englishParts.join("\n\n")!==english)fail("ENGLISH_BYTES");
  }
  const rows=freeze(latinParts.map((text,i)=>freeze({
    ...source,
    id:String(source.id??"EV-EXSULTET")+"."+String(i+1).padStart(2,"0"),
    primary:text,
    secondary:englishParts?.[i]??null,
    // Preserve the exact source witness, not a new ritual-event cue.
    sourceRowId:source.id,
    sourceParagraphIndex:i,
    sourceTextOwner:"EV_EXSULTET_RECOVERED_PARAGRAPH_BOUNDARIES",
    displayOnly:true,
  })));
  return freeze({
    sourceRowId:source.id,sourceLatin:latin,sourceEnglish:english,
    paragraphs:rows,
    boundaries:freeze(incipits.map((text,i)=>freeze({index:i,latinIncipit:text}))),
    verified:true,
    sourceEventMutation:false,
  });
}
