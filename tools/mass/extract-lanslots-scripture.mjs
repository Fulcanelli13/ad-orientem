#!/usr/bin/env node
/**
 * Lanslots 1897: mechanical first pass through supplied Internet Archive OCR.
 * Accepts a LOCAL UTF-8 *_djvu.txt file; no network, packages, or runtime Mass mutation.
 *
 * node tools/mass/extract-lanslots-scripture.mjs --self-test
 * node tools/mass/extract-lanslots-scripture.mjs PATH_TO_OCR.txt OUTPUT.json
 *
 * Every result is an OCR candidate: not a verified citation or printed-page locator.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const CITE = /\b((?:(?:[1-4]|I{1,3}|IV)\s*\.?\s*)?(?:Genesis|Gen|Exodus|Exod|Ex|Leviticus|Levit|Lev|Numbers|Num|Deuteronomy|Deut|Josue|Joshua|Judges|Judg|Ruth|Kings|Chronicles|Job|Psalms|Psalm|Ps|Proverbs|Prov|Ecclesiastes|Ecclesiasticus|Ecclus|Wisdom|Wisd|Isaias|Isaiah|Isa|Jeremias|Jeremiah|Jer|Ezechiel|Ezekiel|Ezech|Daniel|Dan|Osee|Hosea|Joel|Amos|Jonas|Jonah|Micheas|Micah|Nahum|Habacuc|Habakkuk|Sophonias|Zephaniah|Aggeus|Haggai|Zacharias|Zechariah|Malachias|Malachi|Mal|Matthew|Matt|Mt|Mark|Mk|Luke|Lk|John|Jn|Acts|Romans|Rom|Corinthians|Cor|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|Thessalonians|Thess|Timothy|Tim|Titus|Philemon|Philem|Hebrews|Heb|James|Jas|Peter|Pet|Jude|Apocalypse|Apoc|Revelation|Rev))\.?\s+([ivxlcdm]+|\d{1,3})\s*[.:,]\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?/gi;

function romanToInteger(value) {
  if (!/^[ivxlcdm]+$/i.test(value)) return null;
  const symbols={i:1,v:5,x:10,l:50,c:100,d:500,m:1000};
  const letters=value.toLowerCase().split('');
  let total=0;
  for(let i=0;i<letters.length;i++) total += symbols[letters[i]] < (symbols[letters[i+1]]||0) ? -symbols[letters[i]] : symbols[letters[i]];
  return total>0 && total<=150 ? total : null;
}

export function extractCandidates(ocr) {
  const source=String(ocr).replace(/\r\n/g,'\n');
  const hasPageSeparators=source.includes('\f');
  const matches=[];
  for (const match of source.matchAll(CITE)) {
    const book=match[1].replace(/\s+/g,' ').trim();
    const chapter=/^\d+$/.test(match[2]) ? Number(match[2]) : romanToInteger(match[2]);
    const verseStart=Number(match[3]), verseEnd=match[4]?Number(match[4]):verseStart;
    if(chapter===null || chapter<1 || chapter>150 || verseStart<1 || verseStart>200 || verseEnd<verseStart || verseEnd>200) continue;
    const offset=match.index;
    matches.push({
      rawReference:match[0].replace(/\s+/g,' ').trim(),
      bookAsPrinted:book, chapter, verseStart, verseEnd,
      characterOffset:offset,
      ocrScanSlot:hasPageSeparators?source.slice(0,offset).split('\f').length:null,
      printedPage:null,
      context:source.slice(Math.max(0,offset-85),Math.min(source.length,offset+match[0].length+110)).replace(/\s+/g,' ').trim(),
      reviewStatus:'OCR_CANDIDATE_NOT_PAGE_OR_VERSE_VERIFIED'
    });
  }
  return {
    schema:'ao-lanslots-ocr-scripture-firstpass-v1',
    originalWork:'D. I. Lanslots, Illustrated Explanation of the Prayers and Ceremonies of the Mass (1897)',
    contentAuthority:'OCR_ONLY_UNVERIFIED',
    hasFormFeedScanSeparators:hasPageSeparators,
    candidateCount:matches.length,
    candidates:matches,
    policy:[
      'Do not automatically promote OCR citations to the Mass Guide or Bible reader.',
      'Inspect printed pages and verify references against a named Catholic Bible edition.',
      'Separate quotation, authorial allusion, editorial analogy and typological interpretation.',
      'Associate approved results with source-first 39-step IDs, not historical 48-card IDs.',
      'Do not modify the 1962 Missal or ceremonial cue registries.'
    ]
  };
}

function selfTest() {
  const result=extractCandidates('Temple: Mal. i. 11. The angel: Apoc. v. 8.\fAnother: Gen. xiv. 18. St Paul: 1 Cor. xi. 29.');
  const expected=[['Mal',1,11],['Apoc',5,8],['Gen',14,18],['1 Cor',11,29]];
  if(result.candidateCount!==expected.length) throw new Error('OCR regression: '+result.candidateCount+' expected 4');
  for(let i=0;i<expected.length;i++) {
    const c=result.candidates[i], [b,ch,v]=expected[i];
    if(c.bookAsPrinted!==b || c.chapter!==ch || c.verseStart!==v) throw new Error('OCR citation mismatch '+i+': '+JSON.stringify(c));
  }
  if(result.candidates[0].ocrScanSlot!==1 || result.candidates[2].ocrScanSlot!==2) throw new Error('OCR scan slots mismatch');
  return true;
}

if(process.argv[1]?.replaceAll('\\','/').endsWith('/extract-lanslots-scripture.mjs')){
  if(process.argv[2]==='--self-test'){selfTest();console.log('PASS: 4 citation formats and scan-slot boundaries');}
  else if(process.argv[2]&&process.argv[3]){
    const output=extractCandidates(readFileSync(process.argv[2],'utf8'));
    writeFileSync(process.argv[3],JSON.stringify(output,null,2)+'\n');
    console.log('Wrote '+output.candidateCount+' unverified OCR candidates to '+process.argv[3]);
  } else {console.error('Usage: node tools/mass/extract-lanslots-scripture.mjs INPUT_OCR.txt OUTPUT.json | --self-test');process.exitCode=2;}
}
