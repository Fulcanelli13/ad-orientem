import { scripturePassage } from "./catalogue.js";

/*
 * One citation entry point for Mass/Prayer/Formation. This parses labels;
 * it never licenses Bible text or claims an unverified verse concordance.
 */
import {resolveCatholicBookName} from "./chapter-counts.js";
const REF=/^(.+?)\s+(\d{1,3})(?:\s*[:;,]\s*(\d{1,3})(?:\s*[-–]\s*(\d{1,3}))?)?$/u;
export function parseScriptureContext(value){
  const text=String(value||"").trim();
  const match=REF.exec(text);
  if(!match)return null;
  const book=resolveCatholicBookName(match[1].trim());
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
  if(passage?.book==="Luke"&&passage.chapter===1&&passage.verseStart>=26&&passage.verseEnd<=38){
    return Object.freeze({
      title:"St Thomas Aquinas · Catena Aurea (Luke 1:26–38 · Annunciation)",
      url:"https://www.ecatholic2000.com/catena/untitled-62.shtml",
      type:"PATRISTIC_COMPILATION",scope:"PASSAGE",language:"en",
      note:"The chapter contains separately attributed comments by Bede, Ambrose and other writers; commentary is not Gospel text."
    });
  }
  if(passage?.book==="Luke"&&passage.chapter===1&&passage.verseStart>=46&&passage.verseEnd<=55){
    return Object.freeze({
      title:"St Thomas Aquinas · Catena Aurea (Luke 1:46–55 · Magnificat)",
      url:"https://www.ecatholic2000.com/catena/untitled-62.shtml",
      type:"PATRISTIC_COMPILATION",scope:"PASSAGE",language:"en",
      note:"Collected verse-by-verse patristic commentary on Mary's canticle; not inspired Scripture."
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
