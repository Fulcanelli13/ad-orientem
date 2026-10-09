import { scripturePassage } from "./catalogue.js";

/*
 * One citation entry point for Mass/Prayer/Formation. This parses labels;
 * it never licenses Bible text or claims an unverified verse concordance.
 */
const BOOK_ALIASES=Object.freeze({
  "Mt":"Matthew","Matthew":"Matthew","Matthieu":"Matthew",
  "Mk":"Mark","Mark":"Mark","Marc":"Mark",
  "Lk":"Luke","Luke":"Luke","Luc":"Luke",
  "Jn":"John","John":"John","Jean":"John",
  "Acts":"Acts","Actes":"Acts",
  "Gen":"Genesis","Genesis":"Genesis","Genèse":"Genesis",
  "Ex":"Exodus","Exodus":"Exodus","Exode":"Exodus",
  "Rom":"Romans","Romans":"Romans","Romains":"Romans",
  "1 Cor":"1Corinthians","1 Corinthians":"1Corinthians","1 Corinthiens":"1Corinthians",
  "2 Cor":"2Corinthians","2 Corinthians":"2Corinthians",
  "1 Thess":"1Thessalonians","1 Thessalonians":"1Thessalonians",
  "Rev":"Revelation","Revelation":"Revelation","Apocalypse":"Revelation",
  "Ps":"Psalms","Psalm":"Psalms","Psalms":"Psalms","Psaume":"Psalms","Psaumes":"Psalms",
  "Eph":"Ephesians","Ephesians":"Ephesians","Éphésiens":"Ephesians",
  "1 Peter":"1Peter","1 Pierre":"1Peter","2 Timothy":"2Timothy","2 Timothée":"2Timothy",
  "James":"James","Jacques":"James","Proverbs":"Proverbs","Proverbes":"Proverbs"
});
const REF=/^(.+?)\s+(\d{1,3})(?:\s*[:;,]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?$/u;
export function parseScriptureContext(value){
  const text=String(value||"").trim();
  const match=REF.exec(text);
  if(!match)return null;
  const book=BOOK_ALIASES[match[1].trim()];
  if(!book)return null;
  const chapter=Number(match[2]),verseStart=Number(match[3]||1),verseEnd=Number(match[4]||match[3]||1);
  try{
    return Object.freeze({reference:text,passage:scripturePassage({book,chapter,verseStart,verseEnd}),
      // Psalms deliberately retain the labelled numbering until edition-specific
      // source comparison; no silent Vulgate-to-Hebrew renumbering.
      numbering:book==="Psalms"?"SOURCE_EDITION_REQUIRED":"STANDARD_UNVERIFIED_PARALLEL"});
  }catch{return null}
}
export function verifiedScriptureCommentary(passage){
  if(passage?.book==="Matthew"&&passage.chapter===5&&
     passage.verseStart<=28&&passage.verseEnd>=27){
    return Object.freeze({
      title:"St Thomas Aquinas · Catena Aurea (Matthew 5:27–28)",
      url:"https://www.ecatholic2000.com/catena/untitled-12.shtml",
      type:"PATRISTIC_COMPILATION",scope:"PASSAGE",language:"en",
      note:"Collected patristic commentary; not the text of the Gospel."
    });
  }
  return null; // Never invent a verse-specific Father, commentary, or locator.
}
export function scriptureContextCapsule(reference,{french=false}={}){
  const parsed=parseScriptureContext(reference);
  if(!parsed)return "";
  const safe=parsed.reference.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  const label=french?"Lire en contexte":"Read in context";
  return `<button type="button" class="aoScriptureContextCapsule" data-ao-scripture-context="${safe}" aria-label="${label} : ${safe}">${french?"Contexte":"Context"} · ${french?"Bible":"Bible"}</button>`;
}
