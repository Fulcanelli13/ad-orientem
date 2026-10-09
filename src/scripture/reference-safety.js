import { scripturePassage } from "./catalogue.js";
import { estherParallelVerse } from "./esther-catholic-crosswalk.js";

/**
 * No fabricated cross-version Bible references. These three books have
 * confirmed source-order, speech-division or Psalter numbering differences.
 */
export const UNALIGNED_CATHOLIC_BOOKS=Object.freeze({
 Esther:Object.freeze({en:"Esther’s Greek additions have a different chapter order. One-verse correspondences are source-collated; longer passages still need checking.",fr:"Les additions grecques d’Esther suivent un ordre différent. Les correspondances par verset ont été relevées ; les passages plus longs exigent une vérification."}),
 SongOfSongs:Object.freeze({en:"The Song of Songs has edition-specific verse divisions and speaker assignments. Automatic verse switching is unavailable.",fr:"Le Cantique des cantiques comporte des divisions et des indications de locuteurs différentes. Le changement automatique de verset est indisponible."}),
 Psalms:Object.freeze({en:"Psalm numbering, titles and pause marks require an edition-specific correspondence. Do not assume the same verse number identifies the same text.",fr:"La numérotation des psaumes et des versets varie suivant l'édition. Il faut vérifier la correspondance."})
});
const supported=new Set(["cpdv-2009","dr-challoner"]);
/**
 * A provisional match means only that both sources use the same coordinate;
 * it does NOT certify the translation, doctrinal sense or a Vulgate crosswalk.
 */
export function scriptureParallelReferenceState(passage,fromEdition,toEdition){
 const p=scripturePassage(passage);
 if(typeof fromEdition!=="string"||typeof toEdition!=="string")throw new Error("Edition IDs required");
 if(fromEdition===toEdition)return Object.freeze({kind:"same-edition",canAutoParallel:true,reference:p});
 if(!supported.has(fromEdition)||!supported.has(toEdition))
   return Object.freeze({kind:"not-a-verified-pair",canAutoParallel:false,reference:null});
 if(p.book==="Esther"){
  const mapped=estherParallelVerse(p,fromEdition,toEdition);
  if(mapped)return Object.freeze({
   kind:"source-collated-esther-single-verse",canAutoParallel:true,
   reference:scripturePassage(mapped),
   note:"Catholic source correspondence, not a theological certification."
  });
 }
 const warning=UNALIGNED_CATHOLIC_BOOKS[p.book];
 if(warning)return Object.freeze({kind:"requires-crosswalk",canAutoParallel:false,reference:null,
   book:p.book,message:warning.en});
 return Object.freeze({kind:"provisional-coordinates-only",canAutoParallel:false,reference:null,
   book:p.book,message:"A same-numbered passage has not yet been certified as equivalent across these editions."});
}
export function scriptureReferenceWarning(book,language="en"){
 return UNALIGNED_CATHOLIC_BOOKS[book]?.[language==="fr"?"fr":"en"]??null;
}
