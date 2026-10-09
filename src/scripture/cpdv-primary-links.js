import {CATHOLIC_BOOK_IDS} from "./canon.js";
// Verified against the 73-book original author index on 2026-10-09.
// These links lead to the correct BOOK, not to a guaranteed anchored verse.
const OLD=[
"Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
"1Samuel","2Samuel","1Kings","2Kings","1Chronicles","2Chronicles","Ezra","Nehemiah",
"Tobit","Judith","Esther","Job","Psalms","Proverbs","Ecclesiastes","SongOfSongs",
"Wisdom","Sirach","Isaiah","Jeremiah","Lamentations","Baruch","Ezekiel","Daniel",
"Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah",
"Haggai","Zechariah","Malachi","1Maccabees","2Maccabees"];
const NEW=[
"Matthew","Mark","Luke","John","Acts","Romans","1Corinthians","2Corinthians",
"Galatians","Ephesians","Philippians","Colossians","1Thessalonians","2Thessalonians",
"1Timothy","2Timothy","Titus","Philemon","Hebrews","James","1Peter","2Peter",
"1John","2John","3John","Jude","Revelation"];
function filename(id){return id.replace(/^([1-3])([A-Z])/,"$1-$2");}
const BASE="https://sacredbible.org/catholic/";
const items=[];
for(const [i,book] of OLD.entries()){
 const n=(i+1).toString().padStart(2,"0");
 const name=book==="SongOfSongs"?"Song2":filename(book);
 items.push([book,BASE+"OT-"+n+"_"+name+".htm"]);
}
for(const [i,book] of NEW.entries()){
 const n=(i+1).toString().padStart(2,"0");
 items.push([book,BASE+"NT-"+n+"_"+filename(book)+".htm"]);
}
export const CPDV_AUTHOR_BOOK_URLS=Object.freeze(Object.fromEntries(items));
if(Object.keys(CPDV_AUTHOR_BOOK_URLS).length!==73 ||
 CATHOLIC_BOOK_IDS.some(id=>!CPDV_AUTHOR_BOOK_URLS[id]))
 throw new Error("Incomplete original-author Catholic Bible source index");
export function cpdvAuthorBookUrl(book){
 const url=CPDV_AUTHOR_BOOK_URLS[book];
 if(!url)throw new Error("Unknown CPDV Catholic book");
 return url;
}
