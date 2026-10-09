import {CATHOLIC_BOOK_IDS} from "./canon.js";

/*
 * Chapter maxima: 73-book Catholic Vulgate/Douay convention, not universal
 * versification. Esther 16, Daniel 14, Baruch 6; Psalm numbering is
 * edition-specific. No verse maxima or cross-edition mappings are inferred.
 * Chapter directory cross-check:
 * https://vulgata.linguasacra.org/bible/
 * https://thedouayrheims.com/books/old-testament
 */
const CHAPTER_ROWS=Object.freeze({
 Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,
 "1Samuel":31,"2Samuel":24,"1Kings":22,"2Kings":25,"1Chronicles":29,"2Chronicles":36,
 Ezra:10,Nehemiah:13,Tobit:14,Judith:16,Esther:16,"1Maccabees":16,"2Maccabees":15,
 Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,SongOfSongs:8,Wisdom:19,Sirach:51,
 Isaiah:66,Jeremiah:52,Lamentations:5,Baruch:6,Ezekiel:48,Daniel:14,Hosea:14,
 Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,
 Haggai:2,Zechariah:14,Malachi:4,
 Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,"1Corinthians":16,
 "2Corinthians":13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,
 "1Thessalonians":5,"2Thessalonians":3,"1Timothy":6,"2Timothy":4,
 Titus:3,Philemon:1,Hebrews:13,James:5,"1Peter":5,"2Peter":3,
 "1John":5,"2John":1,"3John":1,Jude:1,Revelation:22
});
if(Object.keys(CHAPTER_ROWS).length!==73||CATHOLIC_BOOK_IDS.some(id=>!CHAPTER_ROWS[id]))
  throw new Error("Catholic 73-book chapter table drift");
export const CATHOLIC_CHAPTER_COUNTS=CHAPTER_ROWS;
export function scriptureChapterLimit(book){return CHAPTER_ROWS[String(book)]??null;}
export function scriptureChapterExists(book,chapter){
 return Number.isSafeInteger(chapter)&&chapter>=1&&chapter<= (scriptureChapterLimit(book)??0);
}
const ALIASES={
 "Mt":"Matthew","Matt":"Matthew","Matthieu":"Matthew",
 "Mc":"Mark","Mk":"Mark","Marc":"Mark",
 "Lc":"Luke","Lk":"Luke","Luc":"Luke",
 "Jn":"John","Jo":"John","Jean":"John",
 "Ac":"Acts","Act":"Acts","Actes":"Acts","Acts of the Apostles":"Acts",
 "Gn":"Genesis","Gen":"Genesis","Genèse":"Genesis","Genese":"Genesis",
 "Ex":"Exodus","Exode":"Exodus","Exod":"Exodus",
 "Lv":"Leviticus","Lev":"Leviticus","Lévitique":"Leviticus",
 "Nb":"Numbers","Num":"Numbers","Nombres":"Numbers",
 "Dt":"Deuteronomy","Deut":"Deuteronomy","Deutéronome":"Deuteronomy",
 "Jos":"Joshua","Josue":"Joshua","Josué":"Joshua",
 "Jg":"Judges","Juges":"Judges",
 "Rt":"Ruth",
 "1 S":"1Samuel","2 S":"2Samuel","1 Samuel":"1Samuel","2 Samuel":"2Samuel",
 "1 Sm":"1Samuel","2 Sm":"2Samuel",
 "1 Kgs":"1Kings","2 Kgs":"2Kings","1 Rois":"1Kings","2 Rois":"2Kings",
 "3 Kings":"1Kings","4 Kings":"2Kings",
 "1 Chr":"1Chronicles","2 Chr":"2Chronicles","1 Chroniques":"1Chronicles","2 Chroniques":"2Chronicles",
 "Esdras":"Ezra","1 Esdras":"Ezra","Esd":"Ezra","Néhémie":"Nehemiah","Neh":"Nehemiah",
 "Tb":"Tobit","Tobie":"Tobit","Tobias":"Tobit","Jdt":"Judith",
 "Est":"Esther","1 Mac":"1Maccabees","2 Mac":"2Maccabees",
 "1 Maccabées":"1Maccabees","2 Maccabées":"2Maccabees",
 "Jb":"Job","Ps":"Psalms","Psalm":"Psalms","Psaume":"Psalms","Psaumes":"Psalms",
 "Pr":"Proverbs","Prov":"Proverbs","Proverbes":"Proverbs",
 "Qo":"Ecclesiastes","Eccl":"Ecclesiastes","Ecclésiaste":"Ecclesiastes","Qohélet":"Ecclesiastes",
 "Ct":"SongOfSongs","Cantique des cantiques":"SongOfSongs","Song of Songs":"SongOfSongs",
 "Song of Solomon":"SongOfSongs","Canticum Canticorum":"SongOfSongs",
 "Sg":"Wisdom","Sagesse":"Wisdom","Sagesse de Salomon":"Wisdom",
 "Si":"Sirach","Ecclesiasticus":"Sirach","Ecclésiastique":"Sirach","Siracide":"Sirach",
 "Is":"Isaiah","Isaïe":"Isaiah","Isaias":"Isaiah",
 "Jr":"Jeremiah","Jérémie":"Jeremiah","Jer":"Jeremiah",
 "Lm":"Lamentations","Lam":"Lamentations","Lamentations de Jérémie":"Lamentations",
 "Ba":"Baruch","Bar":"Baruch",
 "Ez":"Ezekiel","Ézéchiel":"Ezekiel","Ezechiel":"Ezekiel","Ezechias":"Ezekiel",
 "Dn":"Daniel","Dan":"Daniel",
 "Os":"Hosea","Osée":"Hosea","Osee":"Hosea",
 "Jl":"Joel","Joël":"Joel","Am":"Amos",
 "Ab":"Obadiah","Abdias":"Obadiah","Jonas":"Jonah",
 "Mi":"Micah","Michée":"Micah","Micheas":"Micah","Na":"Nahum",
 "Ha":"Habakkuk","Habacuc":"Habakkuk","So":"Zephaniah","Sophonie":"Zephaniah",
 "Ag":"Haggai","Aggée":"Haggai","Za":"Zechariah","Zacharie":"Zechariah",
 "Ml":"Malachi","Malachie":"Malachi",
 "Rm":"Romans","Rom":"Romans","Romains":"Romans",
 "1 Cor":"1Corinthians","2 Cor":"2Corinthians","1 Corinthiens":"1Corinthians","2 Corinthiens":"2Corinthians",
 "Ga":"Galatians","Gal":"Galatians","Galates":"Galatians",
 "Ep":"Ephesians","Eph":"Ephesians","Éphésiens":"Ephesians",
 "Ph":"Philippians","Phil":"Philippians","Philippiens":"Philippians",
 "Col":"Colossians","Colossiens":"Colossians",
 "1 Th":"1Thessalonians","2 Th":"2Thessalonians",
 "1 Thess":"1Thessalonians","2 Thess":"2Thessalonians",
 "1 Thessaloniciens":"1Thessalonians","2 Thessaloniciens":"2Thessalonians",
 "1 Tim":"1Timothy","2 Tim":"2Timothy","1 Tm":"1Timothy","2 Tm":"2Timothy",
 "1 Timothée":"1Timothy","2 Timothée":"2Timothy",
 "Tt":"Titus","Tite":"Titus","Phm":"Philemon","Philémon":"Philemon",
 "He":"Hebrews","Heb":"Hebrews","Hébreux":"Hebrews",
 "Jc":"James","Jas":"James","Jacques":"James",
 "1 P":"1Peter","2 P":"2Peter","1 Pet":"1Peter","2 Pet":"2Peter",
 "1 Pierre":"1Peter","2 Pierre":"2Peter",
 "1 Jn":"1John","2 Jn":"2John","3 Jn":"3John",
 "1 Jean":"1John","2 Jean":"2John","3 Jean":"3John",
 "Jude":"Jude","Judas":"Jude",
 "Ap":"Revelation","Rev":"Revelation","Apocalypse":"Revelation"
};
function norm(value){
 return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
   .replace(/[.\s]+/g," ").trim().toLocaleLowerCase("en");
}
const byName=new Map();
for(const book of CATHOLIC_BOOK_IDS){
 byName.set(norm(book),book);
 byName.set(norm(book.replace(/^([1-3])(?=[A-Z])/,"$1 ")),book);
}
for(const [alias,id] of Object.entries(ALIASES)){
 const k=norm(alias),old=byName.get(k);
 if(old&&old!==id)throw new Error("Ambiguous Scripture alias: "+alias);
 byName.set(k,id);
}
export function resolveCatholicBookName(value){return byName.get(norm(value))??null;}
export const SCRIPTURE_CHAPTER_AUTHORITY=Object.freeze({
 countConvention:"CATHOLIC_VULGATE_DOUAY",
 url:"https://vulgata.linguasacra.org/bible/",
 caveat:"Edition-specific numbering, especially Psalms, Esther and Daniel, requires an explicit crosswalk."
});
