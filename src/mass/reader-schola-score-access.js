// Schola music-order score access. Reuse the very same source-bound
// 1961 reference selector as the inline Ordo; never match a score by
// feast title, a parish choice, a calendar guess, or unverified GABC.
import {referenceScoresForParagraph} from "./reader-inline-proper-reference.js";
import {schola1961OriginalFacsimile} from "./reader-schola-original-facsimile.js";

const freeze=Object.freeze;
const PROPER=new Set(["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"]);
const ORDINARY=new Set(["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]);
const empty=freeze({schema:"ao-schola-selected-score-access-v1",
 supported:false,proper:freeze([]),ordinary:freeze([]),
 publicApprovalsAdded:0,heardMusicInferred:false});

/** Musical references are always secondary to the selected 1962 Mass.
 * Original Kyriale facsimiles are shown only for explicitly selected local
 * settings. A matched GABC transcription remains provisional, not certified. */
export function resolveScholaSelectedScoreAccess({itinerary,resolvedMass,form}={}){
 if(String(form??"").toUpperCase()==="LOW" || itinerary?.supported!==true ||
   !Array.isArray(itinerary.properProgramme))
  return empty;
 const seenScores=new Set();
 const proper=itinerary.properProgramme.filter(entry=>
   PROPER.has(entry.trackId)).map(entry=>{
  const scores=[];
  if(entry.source==="THIS_MASS_RESOLVED_1962_PROPER" &&
     entry.status==="SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE" &&
     Array.isArray(entry.lines)){
   for(const line of entry.lines){
    if(typeof line?.id!=="string" || typeof line?.latin!=="string" ||
       !line.id.startsWith(entry.trackId+".") || !line.latin.trim())continue;
    const matches=referenceScoresForParagraph({
     paragraph:{id:line.id,kind:"TEXT",primary:line.latin},
     resolvedMass,form,
    });
    for(const score of matches){
     if(score.publicScoreApproved!==false || seenScores.has(score.id))continue;
     seenScores.add(score.id);scores.push(score);
    }
   }
  }
  return freeze({trackId:entry.trackId,eventId:entry.eventId,
    status:scores.length?"SOURCE_BOUND_PROVISIONAL_1961_NOTATION":"NO_VERIFIED_SCORE_BINDING",
    scores:freeze(scores),notAnApproval:true,actuallySinging:"UNKNOWN"});
 });
 // A Requiem has its own prescribed Ordinary: a saved non-Requiem
 // Kyriale profile must not imply that its setting was appointed here.
 const requiem=resolvedMass?.overlays?.includes("REQUIEM")===true;
 const seenMovements=new Set();
 const ordinary=(requiem?[]:itinerary.events??[]).flatMap(event=>{
  const movement=event?.trackId;
  if(event?.kind!=="CHANT" || !ORDINARY.has(movement) ||
     seenMovements.has(movement))return [];
  seenMovements.add(movement);
  const selected=itinerary.localOrdinarySelections?.[movement];
  const original=schola1961OriginalFacsimile(movement,selected);
  if(!original)return [];
  return [freeze({trackId:movement,eventId:event.id,
    settingId:selected,source:original,
    status:"EXPLICIT_SELECTION_ORIGINAL_PRINT_NOT_PERFORMANCE",
    notAnApproval:true,actuallySinging:"UNKNOWN"})];
 });
 return freeze({schema:empty.schema,supported:true,
  proper:freeze(proper),ordinary:freeze(ordinary),
  publicApprovalsAdded:0,heardMusicInferred:false});
}
