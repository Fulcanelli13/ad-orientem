// Extract full sung-Latin order from the exact selected 1962 Introit.
// GABC is a musical/transcription witness, not a complete liturgical-text source.
// In particular, <eu>E u o u a e</eu> is a psalm-tone termination mnemonic
// for "saeculorum Amen" and must NEVER become standalone sung Latin.
export const INTROIT_SUNG_TEXT_SCHEMA="ao-1962-source-selected-introit-full-sung-latin-v1";
const textLines=s=>String(s??"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const stripCue=s=>s.replace(/^\s*[℣℟]\s*\.\s*/u,"").trim();
const reference=s=>/^(?:Ps(?:alm)?|Psalmus|[1-4]\s+[A-Za-z]+|[A-Za-z]+)\s+\d+\s*[:.,;]/i.test(s);
const normalized=s=>String(s??"").normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const fail=m=>{throw Error(m)};
function selectedVerse(lines,between){
 const verses=lines.slice(between[0]+1,between[1])
  .filter(x=>!reference(x)&&!/^([℣℟]\s*\.)?\s*Gl[oó]ria\s+Patri/i.test(x));
 if(verses.length!==1)fail("INTROIT_SELECTED_PSALM_VERSE_UNRESOLVED");
 return stripCue(verses[0]);
}
export function selected1962IntroitSungText({part,scoreId,sourceLatin,originalGabc}={}){
 if(part!=="in"||!/^GREGOBASE-\d+$/.test(String(scoreId??""))||
    typeof sourceLatin!=="string"||typeof originalGabc!=="string")
  fail("INTROIT_SELECTED_SOURCE_OR_ROLE_REQUIRED");
 const lines=textLines(sourceLatin);
 if(lines.length<4||lines.length>8)fail("INTROIT_SELECTED_SOURCE_LINES_INCOMPLETE");
 const antiphonLines=lines.map((s,i)=>({s,i})).filter(x=>/^[℣℟]\s*\./u.test(x.s));
 if(antiphonLines.length!==2||antiphonLines[0].i>=antiphonLines[1].i)
  fail("INTROIT_ANTIPHON_REPETITION_NOT_RESOLVED");
 const a=stripCue(antiphonLines[0].s),repeat=stripCue(antiphonLines[1].s);
 if(normalized(a)!==normalized(repeat))
  fail("INTROIT_SELECTED_1962_ANTIPHON_REPEAT_DIFFERS");
 const gloria=lines.map((s,i)=>({s,i})).filter(x=>/^Gl[oó]ria\s+Patri\b/i.test(x.s));
 if(gloria.length>1)fail("INTROIT_AMBIGUOUS_GLORIA_SOURCE");
 const lastVerseIndex=gloria.length?gloria[0].i:antiphonLines[1].i;
 const psalm=selectedVerse(lines,[antiphonLines[0].i,lastVerseIndex]);
 const nodes=[
  {role:"INTROIT_ANTIPHON",label:"Introit · antiphon",text:a},
  {role:"PSALM_VERSE",label:"Psalm verse",text:psalm}
 ];
 if(gloria.length){
  if(gloria[0].i<=antiphonLines[0].i||gloria[0].i>=antiphonLines[1].i)
   fail("INTROIT_GLORIA_ORDER_INVALID");
  if(!/\bet\s+F[ií]lio\b/i.test(gloria[0].s)||
     !/Sp[ií]ritui\s+Sancto/i.test(gloria[0].s)||
     !normalized(gloria[0].s).includes("saecula saeculorum")||
     !/\bAmen\.?$/i.test(gloria[0].s))
   fail("INTROIT_SELECTED_GLORIA_NOT_COMPLETE");
  nodes.push({role:"GLORIA_PATRI_FULL",label:"Glória Patri · complete doxology",text:gloria[0].s});
 }
 nodes.push({role:"INTROIT_ANTIPHON_REPEAT",label:"Repeat antiphon",text:repeat});
 const mnemonic=/<eu>[\s\S]*?<\/eu>/i.test(originalGabc);
 const gabcShortGloria=/Gl[oó][^()]{0,25}\([^()]*\)[\s\S]*?Pa[^()]{0,25}\([^()]*\)/i.test(originalGabc)&&
  !/Sp[ií]ritui/i.test(originalGabc);
 const originalReprintsAntiphon=originalGabc.includes("(::)")&&
  normalized(originalGabc.slice(originalGabc.lastIndexOf("(::)")+4)
   .replace(/<[^>]*>/g,"").replace(/\([^()]*\)/g,"")).startsWith(normalized(a).slice(0,18));
 const warnings=[
  ...(mnemonic?[{code:"EUOUAE_NOT_SUNG_LYRICS",
   text:"E u o u a e is a printed psalm-tone abbreviation for the ending of sæculórum. Amen; do not sing the vowels literally."}]:[]),
  ...(gabcShortGloria&&gloria.length?[{code:"GABC_GLORIA_ABBREVIATED",
   text:"The archived musical transcription abbreviates Glória Patri; the selected 1962 source supplies the complete doxology."}]:[]),
  ...(!originalReprintsAntiphon?[{code:"GABC_ANTIPHON_REPRISE_NOT_ENGRAVED",
   text:"The original GABC transcription does not reprint the concluding antiphon; the selected 1962 Mass source supplies the repeat."}]:[])
 ];
 const sungLatin=nodes.map(x=>x.text).join("\n\n");
 if(/\bE\s+u\s+o\s+u\s+a\s+e\b/i.test(sungLatin)||
    sungLatin.includes("<eu>"))fail("INTROIT_MNEMONIC_LEAKED_INTO_SUNG_TEXT");
 return Object.freeze({
  schema:INTROIT_SUNG_TEXT_SCHEMA,scoreId,
  source:"EXACT_SELECTED_1962_LATIN_NOT_GABC_PRINT_SHORTHAND",
  musicalUnderlayVerified:false,psalmToneCadenceVerified:false,
  userMusicApproval:false,publicNotationApproved:false,
  hasFullSourceDoxology:gloria.length===1,
  segments:Object.freeze(nodes.map(n=>Object.freeze(n))),
  warnings:Object.freeze(warnings.map(w=>Object.freeze(w))),
  sungLatin,
  publication:"TEXT_REFERENCE_ONLY_MUSIC_REVIEW_HOLD"
 });
}
