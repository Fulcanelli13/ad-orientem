// Isolated editorial research only: deterministic source-GABC note-group inventory.
// A parenthesized neume may continue a melisma without creating a new syllable.
// Neither tokens nor review fields certify notes against printed staff pitches.
const PITCH=/[a-mA-M]/;
const CLEF=/^[a-d][1-4]$/;
export function sourceNoteGroupInventory(gabc){
 if(typeof gabc!=="string"||!gabc.includes("%%"))throw new Error("Missing source GABC");
 const body=gabc.slice(gabc.indexOf("%%")+2);
 const matches=[...body.matchAll(/([^()\s]+)\(([^()]*)\)/g)];
 const groups=[];let nonMusical=0,lastMatchEnd=0;
 for(const match of matches){
  const raw=match[2],between=body.slice(lastMatchEnd,match.index);
  lastMatchEnd=match.index+match[0].length;
  if(!PITCH.test(raw)||CLEF.test(raw)){nonMusical++;continue}
  const text=match[1].replace(/<[^>]*>/g,"").trim();
  // Solesmes GABC may insert a division after a syllable's text but before
  // that syllable's notes: "di :(f.)", "tri :(h.)". The regular expression
  // sees only ":" as the token; recover the pending syllable from the span
  // after the previous neume. This is NOT an additional sung syllable.
  const punctuationAttached=text===":"||text===";";
  const pending=punctuationAttached?
   (between+match[1]).replace(/<[^>]*>/g,"").match(/([A-Za-zÀ-ž]+)\\s*[:;]\\s*$/)?.[1]:null;
  if(punctuationAttached&&!pending)
   throw new Error("Printed syllable cannot be resolved before GABC punctuation token");
  const continuation=!punctuationAttached&&!/[A-Za-zÀ-ž]/.test(text);
  groups.push(Object.freeze({
   ordinal:groups.length+1,
   syllable:punctuationAttached?pending:continuation?"[melisma continuation]":text,
   gabcOriginalNotes:raw,
   sourceTokenType:punctuationAttached?"SYLLABLE_AFTER_DIVISION":
    continuation?"NON_SYLLABIC_CONTINUATION":"SYLLABLE_BEARING",
   sourceLine:body.slice(0,match.index).split("\n").length,
   sourceGabcOffset:match.index,
   printedSystem:"REVIEWER_MUST_LOCATE_IN_ORIGINAL",
   printedPitchParity:"NOT_CERTIFIED",
   printedNeumeParity:"NOT_CERTIFIED",
   printedSyllableUnderlayParity:"NOT_CERTIFIED",
   printedRhythmicSignParity:"NOT_CERTIFIED"
  }));
 }
 if(!groups.length)throw new Error("No musical note groups found");
 return Object.freeze({
  totalParenthesizedTokens:matches.length,
  nonMusicalTokens:nonMusical,
  noteBearingSourceTokens:groups.length,
  syllableBearingTokens:groups.filter(g=>g.sourceTokenType!=="NON_SYLLABIC_CONTINUATION").length,
  divisionAttachedTokens:groups.filter(g=>g.sourceTokenType==="SYLLABLE_AFTER_DIVISION").length,
  continuationTokens:groups.filter(g=>g.sourceTokenType==="NON_SYLLABIC_CONTINUATION").length,
  groups:Object.freeze(groups)
 });
}
