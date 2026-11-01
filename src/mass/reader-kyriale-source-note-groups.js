// Isolated editorial research only: deterministic source-GABC note-group inventory.
// A parenthesized neume may continue a melisma without creating a new syllable.
// Neither tokens nor review fields certify notes against printed staff pitches.
const PITCH=/[a-mA-M]/;
const CLEF=/^[a-d][1-4]$/;
export function sourceNoteGroupInventory(gabc){
 if(typeof gabc!=="string"||!gabc.includes("%%"))throw new Error("Missing source GABC");
 const body=gabc.slice(gabc.indexOf("%%")+2);
 const matches=[...body.matchAll(/([^()\s]+)\(([^()]*)\)/g)];
 const groups=[];let nonMusical=0;
 for(const match of matches){
  const raw=match[2];
  if(!PITCH.test(raw)||CLEF.test(raw)){nonMusical++;continue}
  const text=match[1].replace(/<[^>]*>/g,"").trim();
  const continuation=!/[A-Za-zÀ-ž]/.test(text);
  groups.push(Object.freeze({
   ordinal:groups.length+1,
   syllable:continuation?"[melisma continuation]":text,
   gabcOriginalNotes:raw,
   sourceTokenType:continuation?"NON_SYLLABIC_CONTINUATION":"SYLLABLE_BEARING",
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
  syllableBearingTokens:groups.filter(g=>g.sourceTokenType==="SYLLABLE_BEARING").length,
  continuationTokens:groups.filter(g=>g.sourceTokenType==="NON_SYLLABIC_CONTINUATION").length,
  groups:Object.freeze(groups)
 });
}
