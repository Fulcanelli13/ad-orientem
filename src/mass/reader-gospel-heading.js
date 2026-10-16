// Display-only Gospel announcement for the actual resolved 1962 Proper.
// Reuse the same fail-closed scripture-source ownership as the Bible-reading link.
// Never take the evangelist from the frozen donor (C0084's Matthew was a sample).
import {massScriptureContextForCard} from "./scripture-reading-context.js";

const GOSPEL_SLOT_CARD=Object.freeze({
  blocks:Object.freeze([Object.freeze({properSlot:"GOSPEL"})]),
});
const BOOKS=Object.freeze({
  Matthew:Object.freeze({lat:"Matthǽum",en:"Matthew",fr:"Matthieu"}),
  Mark:Object.freeze({lat:"Marcum",en:"Mark",fr:"Marc"}),
  Luke:Object.freeze({lat:"Lucam",en:"Luke",fr:"Luc"}),
  John:Object.freeze({lat:"Ioánnem",en:"John",fr:"Jean"}),
});
const UNRESOLVED=Object.freeze({
  lat:"Sequéntia ✠ sancti Evangélii",
  en:"Continuation ✠ of the Holy Gospel.",
  fr:"Suite ✠ du saint Évangile.",
});

/**
 * Return a C0084 ordinary-text variant for the Gospel actually selected.
 * The existing source resolver accepts only a unique explicit Proper citation
 * or a matching source-path + Latin incipit in the certified reading registries.
 * An absent/conflicting reference MUST NOT silently become Matthew.
 * This is a projection, never an edit to the 1962 Mass donor corpus.
 */
export function gospelHeadingVariantForProper(proper,{sourcePath=null}={}){
  if(!proper || typeof proper!=="object")
    return UNRESOLVED;
  const selectedSourcePath=String(sourcePath??proper.sourcePath??"").trim();
  const prepared={
    session:{
      resolvedMass:{
        proper:{status:"READY",data:proper,sourcePath:selectedSourcePath},
      },
    },
  };
  const resolved=massScriptureContextForCard(GOSPEL_SLOT_CARD,prepared);
  const book=resolved?.state==="READY"&&resolved.slot==="GOSPEL"
    ?BOOKS[resolved.passage?.book]:null;
  if(!book)return UNRESOLVED;
  return Object.freeze({
    lat:"Sequéntia ✠ sancti Evangélii secúndum "+book.lat,
    en:"Continuation ✠ of the Holy Gospel according to "+book.en+".",
    fr:"Suite ✠ du saint Évangile selon saint "+book.fr+".",
  });
}
