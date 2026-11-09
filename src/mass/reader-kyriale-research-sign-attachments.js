// Editorial research utility: bind original GABC sign characters to precise
// source noteheads, not just syllables. NO printed musical parity is inferred.
// This deliberately supports only the simple neume spellings in the current
// Kyrie XVI research witness; extended GABC modifiers require a separate parser.
import {sourceNoteGroupInventory} from "./reader-kyriale-source-note-groups.js";

const NOTE=/^[a-mA-M]$/;
const STAFF="abcdefghijklm";
const STAFF_POSITION=Object.freeze({
  0:"line1",1:"space1",2:"line2",3:"space2",4:"line3",
  5:"space3",6:"line4",7:"spaceAbove4",8:"ledgerAbove4",
});
export function extractKyrieXviNoteSignAttachments(gabc){
  const inventoried=sourceNoteGroupInventory(gabc);
  if(inventoried.noteBearingSourceTokens!==27)
    throw new Error("Kyrie XVI exact sign collation requires all 27 source groups");
  const noteheads=[],signs=[];
  for(const group of inventoried.groups){
    const neume=group.gabcOriginalNotes;
    let last=null;
    for(let offset=0;offset<neume.length;offset++){
      const ch=neume[offset];
      if(NOTE.test(ch)){
        const zeroBasedPosition=STAFF.indexOf(ch.toLowerCase())-3;
        if(!(zeroBasedPosition in STAFF_POSITION))
          throw new Error("Unsupported GABC staff position: "+ch);
        const head=Object.freeze({
          globalNoteOrdinal:noteheads.length+1,
          groupOrdinal:group.ordinal,
          syllable:group.syllable,
          localNoteOrdinal:noteheads.filter(n=>n.groupOrdinal===group.ordinal).length+1,
          sourcePitchLetter:ch,
          printedStaffTarget:STAFF_POSITION[zeroBasedPosition],
          sourceNeume:neume,
        });
        noteheads.push(head);
        last=head;
        if(ch!==ch.toLowerCase()){
          signs.push(Object.freeze({
            type:"PUNCTUM_INCLINATUM",
            token:ch,
            sourceGroupOrdinal:head.groupOrdinal,
            sourceGlobalNoteOrdinal:head.globalNoteOrdinal,
            sourceNoteLetter:ch,
            sourceStaffPosition:head.printedStaffTarget,
          }));
        }
      }else if(ch==="."||ch==="_"||ch==="v"){
        if(!last)throw new Error("Source sign must immediately follow a notehead");
        signs.push(Object.freeze({
          type:ch==="."?"PUNCTUM_MORA":ch==="_"?"HORIZONTAL_EPISEMA":"VIRGA",
          token:ch,
          sourceGroupOrdinal:last.groupOrdinal,
          sourceGlobalNoteOrdinal:last.globalNoteOrdinal,
          sourceNoteLetter:last.sourcePitchLetter,
          sourceStaffPosition:last.printedStaffTarget,
        }));
      }else{
        throw new Error("Kyrie XVI source has a modifier requiring manual parser review: "+ch);
      }
    }
  }
  return Object.freeze({
    schema:"ao-kyrie-xvi-source-note-attachments-v1",
    sourceOnly:true,
    musicalPrintCertification:false,
    noteheads:Object.freeze(noteheads),
    signOccurrences:Object.freeze(signs),
  });
}
