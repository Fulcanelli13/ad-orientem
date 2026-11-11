// A FULL Schola score can cover many SOURCE-OWNED syllable/cue segments.
// This selector never treats an individual native priest card as a musical
// duration, and does not admit provisional Kyriale research transcriptions.
// It is inert unless an explicitly approved score AND a second promotion
// record match the exact current native Schola track and selected setting.
import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {INLINE_CHANT_SCHEMA} from "./reader-inline-chant-selector.js";

const freeze=Object.freeze;
const ORDINARY=new Set(["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]);
const CUE=/^AO\.SM\.C\d{4}$/;
const SHA=/^[a-f0-9]{64}$/;
const clean=v=>String(v??"").trim();
const normalized=s=>clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[æœ]/gi,c=>c.toLowerCase()==="æ"?"ae":"oe")
 .replace(/[^\p{L}\p{N}]+/gu," ").toLowerCase().trim().replace(/\s+/g," ");
const identical=(a,b)=>Array.isArray(a)&&Array.isArray(b)&&
 a.length===b.length&&a.every((v,i)=>v===b[i]);

export function selectApprovedCompleteScholaTrackScore({
 schola,form,resolvedMass,settings,approvedScores,approvalRegistry,
 schema
}={}){
 const track=clean(schola?.trackId),cues=schola?.trackSourceCueIds;
 if(!ORDINARY.has(track) ||
    !["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(clean(form).toUpperCase()) ||
    schola?.owner!=="R17_NATIVE_SCHOLA" ||
    schola?.musicStatus!=="EXPECTED_NOT_OBSERVED" ||
    schola?.composedWorkId || !Array.isArray(cues)||!cues.length ||
    cues.length>400||cues.some(c=>!CUE.test(c))||
    new Set(cues).size!==cues.length ||
    !cues.includes(schola?.cueId) || !clean(schola?.trackSourceLatin)||
    !clean(schola?.latin) || !Array.isArray(approvedScores) ||
    !Array.isArray(approvalRegistry) || !schema)return null;
 const setting=clean(settings?.[track]);
 if(!setting)return null; // Never infer a setting from form, date or title.
 const riteScope=isExplicitRequiemMass({session:{resolvedMass}})?"REQUIEM":"ORDINARY";
 const trackLatin=normalized(schola.trackSourceLatin);
 const matches=[];
 for(const row of approvalRegistry){
   if(row?.schema!==schema || row.scoreScope!=="FULL_SCHOLA_TRACK" ||
      row.score_status!=="approved"||row.trackId!==track||
      row.settingId!==setting||row.riteScope!==riteScope||
      row.licence!=="CC0-1.0"||!SHA.test(clean(row.gabcSha256))||
      !/^https:\/\//.test(clean(row.sourceUrl))||
      !identical(row.sourceCueIds,cues)||
      normalized(row.sourceLatin)!==trackLatin)continue;
   const score=approvedScores.find(candidate=>
     candidate?.schema===INLINE_CHANT_SCHEMA&&
     candidate?.scoreId===row.scoreId &&
     candidate?.scoreScope==="FULL_SCHOLA_TRACK" &&
     candidate?.selectionKey===track &&
     candidate?.settingId===setting &&
     candidate?.riteScope===riteScope &&
     candidate?.approval==="USER_AND_MUSICAL_SOURCE_REVIEWED" &&
     candidate?.publication==="PUBLIC_APPROVED" &&
     candidate?.sourceTextVerified===true &&
     candidate?.musicalNotationVerified===true &&
     typeof candidate?.sourceWitness==="string"&&candidate.sourceWitness.length>5 &&
     candidate?.sourceUrl===row.sourceUrl &&
     candidate?.gabcSha256===row.gabcSha256 &&
     identical(candidate?.sourceCueIds,cues) &&
     normalized(candidate?.sourceLatin)===trackLatin &&
     typeof candidate?.gabc==="string"&&
     /%%\s*\([cf][1-4]\)/.test(candidate.gabc) &&
     candidate.gabc.includes("(::)"));
   if(score)matches.push(score);
 }
 return matches.length===1?freeze({
   ...matches[0],score_status:"approved",scholaTrackId:track,
   scholaSegmentId:clean(schola?.segmentId),scholaSourceCueIds:freeze([...cues]),
   musicalPerformance:"EXPECTED_NOT_OBSERVED"
 }):null;
}
