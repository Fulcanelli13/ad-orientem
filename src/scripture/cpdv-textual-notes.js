import {cpdvAuthorBookUrl} from "./cpdv-primary-links.js";
import {sourceReadingLink} from "./links.js";
const TEXTUAL_NOTES=Object.freeze([
 Object.freeze({book:"John",chapter:1,verse:1,severity:"interpretive",
  text:"The Word is God and is personally distinct from the Father. Read John 1:1–3 together; the reversed English clause in CPDV should not be read as identifying the Father and the Word as the same divine Person.",
  latin:"et Deus erat Verbum",contextEnd:3}),
 Object.freeze({book:"Luke",chapter:1,verse:43,severity:"semantic",
  text:"Elizabeth marvels that the Mother of her Lord should visit her. Her words express humility and wonder, not indifference or a question about whether Mary's visit concerns her.",
  latin:"et unde hoc mihi ut veniat mater Domini mei ad me",contextEnd:45}),
 Object.freeze({book:"Sirach",chapter:24,verse:1,severity:"semantic",
  text:"Wisdom praises her own self or soul. The Latin anima suam carries more than the narrow modern sense of intellectual 'mind'; the verse should not be reduced to praise of one's own ideas.",
  latin:"sapientia laudabit animam suam",contextEnd:4}),
 Object.freeze({book:"Revelation",chapter:21,verse:8,severity:"semantic",
  text:"The traditional rendering identifies sorcerers, with the historical association of poisoning and magical practices. The expression 'drug abusers' narrows this biblical category and should not be treated as its complete meaning.",
  latin:"veneficis",contextEnd:8}),
 Object.freeze({book:"Revelation",chapter:22,verse:15,severity:"semantic",
  text:"The traditional category concerns sorcery and related occult or poisoning practices. Do not reduce this verse to modern recreational drug misuse when interpreting it.",
  latin:"venefici",contextEnd:15}),
 Object.freeze({book:"Matthew",chapter:5,verse:28,severity:"readability",
  text:"Christ condemns looking with the purpose of lusting. The moral distinction between deliberate consent and an unwanted thought must be preserved despite the awkward CPDV English tense.",
  latin:"ad concupiscendum eam",contextEnd:28}),
 Object.freeze({book:"1Corinthians",chapter:11,verse:27,severity:"readability",
  text:"Receiving the Lord's Body and Blood unworthily incurs guilt; 'liable of' is awkward English, not a denial of the Real Presence or the seriousness of sacrilegious Communion.",
  latin:"reus erit corporis et sanguinis Domini",contextEnd:29})
]);
export const CPDV_TEXTUAL_NOTES=TEXTUAL_NOTES;
export function cpdvTextualNotesFor(editionId,passage){
 if(editionId!=="cpdv-2009"||!passage)return [];
 const found=TEXTUAL_NOTES.filter(note=>note.book===passage.book&&
  note.chapter===passage.chapter&&passage.verseStart<=note.verse&&
  (passage.verseEnd??passage.verseStart)>=note.verse);
 return found.map(note=>Object.freeze({
  ...note,reference:note.book+" "+note.chapter+":"+note.verse,
  authorSource:cpdvAuthorBookUrl(note.book),
  traditionalSource:sourceReadingLink({book:note.book,chapter:note.chapter,
    verseStart:note.verse,verseEnd:note.contextEnd})
 }));
}
