/** Canonical 73-book identifiers, independent of edition and language. */
export const CATHOLIC_BOOK_IDS = Object.freeze([
"Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
"1Samuel","2Samuel","1Kings","2Kings","1Chronicles","2Chronicles","Ezra","Nehemiah",
"Tobit","Judith","Esther","1Maccabees","2Maccabees","Job","Psalms","Proverbs",
"Ecclesiastes","SongOfSongs","Wisdom","Sirach","Isaiah","Jeremiah","Lamentations",
"Baruch","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah",
"Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi",
"Matthew","Mark","Luke","John","Acts","Romans","1Corinthians","2Corinthians",
"Galatians","Ephesians","Philippians","Colossians","1Thessalonians",
"2Thessalonians","1Timothy","2Timothy","Titus","Philemon","Hebrews","James",
"1Peter","2Peter","1John","2John","3John","Jude","Revelation"
]);
const CATHOLIC_BOOK_SET = new Set(CATHOLIC_BOOK_IDS);
export function isCatholicBookId(id) { return CATHOLIC_BOOK_SET.has(id); }
