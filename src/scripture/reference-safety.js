import { scripturePassage } from "./catalogue.js";
import { estherParallelVerse } from "./esther-catholic-crosswalk.js";
import { songParallelVerse } from "./song-catholic-crosswalk.js";
import { psalterParallelVerse } from "./psalter-exception-crosswalk.js";

/**
 * No fabricated cross-version Bible references. These three books have
 * confirmed source-order, speech-division or Psalter numbering differences.
 */
export const UNALIGNED_CATHOLIC_BOOKS=Object.freeze({
 Esther:Object.freeze({en:"Esther’s Greek additions have a different chapter order. One-verse correspondences are source-collated; longer passages still need checking.",fr:"Les additions grecques d’Esther suivent un ordre différent. Les correspondances par verset ont été relevées ; les passages plus longs exigent une vérification."}),
 SongOfSongs:Object.freeze({en:"All 116 Douay verses are aligned with 127 CPDV verse divisions. Single-verse references can switch to their corresponding passage; multi-verse ranges still require checking.",fr:"Les 116 versets Douay correspondent aux 127 divisions CPDV. Les références unitaires suivent la correspondance établie ; les passages plus longs restent à vérifier."}),
 Psalms:Object.freeze({en:"Source-checked verse correspondences cover 133 complete Psalms, 254 more verses and selected exceptional spans. Unsupported references cannot switch automatically.",fr:"Les correspondances vérifiées couvrent 133 psaumes entiers, 254 versets supplémentaires et quelques passages particuliers. Les références non vérifiées ne changent pas automatiquement."})
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
 if(p.book==="SongOfSongs"||p.book==="Psalms"){
  const mapped=p.book==="SongOfSongs"
    ? songParallelVerse(p,fromEdition,toEdition)
    : psalterParallelVerse(p,fromEdition,toEdition);
  if(mapped)return Object.freeze({
   kind:"source-collated-catholic-verse-span",canAutoParallel:true,
   reference:scripturePassage(mapped),
   note:"Corresponding source text span; translation and doctrinal certification remain separate."
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
