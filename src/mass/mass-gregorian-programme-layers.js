// Three independent musical facts: the selected Roman Proper, a reusable
// Gregorian *reference*, and reported music at a particular church.
// This never creates a second archive, a parish clone or a performed-score default.
// Existing 1,195 GABCs remain in data/mass/chant-corpus (research only).
import {PROPER_CHANT_SOURCE_SCHEMA} from "./reader-proper-chant-crosswalk.js";
import {MASS_CHANT_PROGRAMME_SCHEMA} from "./mass-chant-programme.js";
import {SCHOLA_SCORE_TRACK_IDS} from "./reader-chant-score-pilot.js";

export const GREGORIAN_PROGRAMME_LAYERS_SCHEMA="ao-gregorian-programme-layers-v1";
export const GREGORIAN_LOCAL_EVIDENCE_SCHEMA="ao-local-schola-evidence-v1";
export const ROMAN_1962_GREGORIAN_RITE="ROMAN_1962";
const PROPER_TRACKS=new Set(["INTROIT","GRADUAL","ALLELUIA_TRACT_SEQUENCE","OFFERTORY","COMMUNION"]);
const STYLES=new Set(["GREGORIAN","PSALM_TONE","POLYPHONY","OTHER","OMITTED","UNREPORTED"]);
const identifier=value=>typeof value==="string" && /^[A-Za-z0-9._:-]+$/.test(value);
const cited=value=>typeof value==="string" && /^https:\/\/[^\s/]+\//.test(value);
const VALID_TRACKS=new Set(SCHOLA_SCORE_TRACK_IDS);

function documentedTracks(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const pairs=Object.entries(value);
  if(!pairs.length)return null;
  const tracks={};
  for(const [trackId,style] of pairs){
    if(!VALID_TRACKS.has(trackId) || !STYLES.has(style))return null;
    tracks[trackId]=style;
  }
  return Object.freeze(tracks);
}
function eligible(record,kind,{riteId,sourcePath,date,siteId,instituteId}){
  if(record?.schema!==GREGORIAN_LOCAL_EVIDENCE_SCHEMA||
      record?.status!=="SOURCE_DOCUMENTED"||record?.kind!==kind||
      record?.riteId!==riteId||!identifier(record.id)||!cited(record.sourceUrl))return null;
  const tracks=documentedTracks(record.tracks);
  if(!tracks)return null;
  if(kind==="SITE_MASS_PROGRAMME"){
    // No carry-over to next Sunday, other formulary or other chapel.
    if(!siteId||record.siteId!==siteId||record.massDate!==date||
       !date||record.sourcePath!==sourcePath||!sourcePath)return null;
  }else if(kind==="INSTITUTE_CUSTOM"){
    // May be displayed as context, never inherited as actual local performance.
    if(!instituteId||record.instituteId!==instituteId||
       record.sourcePath && record.sourcePath!==sourcePath)return null;
  }else return null;
  return Object.freeze({evidenceId:record.id,sourceUrl:record.sourceUrl,tracks});
}
function isolatedMatches(rows){
  if(rows.length!==1)return null; // conflicting independent claims are not adjudicated by array order
  return rows[0];
}

export function composeGregorianProgrammeLayers({
  properCrosswalk=null,chantProgramme=null,riteId=ROMAN_1962_GREGORIAN_RITE,
  date=null,siteId=null,instituteId=null,evidence=[],
}={}){
  const roman=riteId===ROMAN_1962_GREGORIAN_RITE;
  const crosswalkReady=roman&&properCrosswalk?.schema===PROPER_CHANT_SOURCE_SCHEMA&&
    properCrosswalk.status==="PARTIALLY_MATCHED"&&
    typeof properCrosswalk.sourcePath==="string"&&properCrosswalk.sourcePath.length>0;
  const sourcePath=crosswalkReady?properCrosswalk.sourcePath:null;
  // These are source-compatible preview *IDs*, NOT musical facsimile approvals.
  const references=Object.freeze(crosswalkReady?(properCrosswalk.candidates??[])
    .filter(row=>PROPER_TRACKS.has(row.trackId)&&
      row.sourcePath===sourcePath&&/^GREGOBASE-\d+$/.test(row.scoreId)&&
      row.certainty==="TEXT_MATCH_NOT_LOCAL_CHANT_OBSERVED")
    .map(row=>Object.freeze({trackId:row.trackId,scoreId:row.scoreId,
      status:"REFERENCE_ONLY_NOT_PERFORMANCE_OR_FACSIMILE_APPROVAL"})):[]);
  const usable=Array.isArray(evidence)?evidence:[];
  const context={riteId,sourcePath,date,siteId,instituteId};
  const siteClaims=usable.map(row=>eligible(row,"SITE_MASS_PROGRAMME",context)).filter(Boolean);
  const instituteClaims=usable.map(row=>eligible(row,"INSTITUTE_CUSTOM",context)).filter(Boolean);
  const site=isolatedMatches(siteClaims),institute=isolatedMatches(instituteClaims);
  // User-selected Ordinary examples are personal, not corroboration that a choir sang.
  let userIdentityMatches=false;
  try{
    const parts=JSON.parse(chantProgramme?.identity??"null");
    userIdentityMatches=Array.isArray(parts)&&parts.length===9&&
      parts[0]===date&&parts[6]===sourcePath;
  }catch{ /* malformed or stale saved programme: not evidence */ }
  const userChoices=roman&&chantProgramme?.schema===MASS_CHANT_PROGRAMME_SCHEMA&&
    chantProgramme.sourceType==="USER_REPORTED_MUSIC_NOT_RUBRICALLY_CERTIFIED"&&
    chantProgramme.date===date&&userIdentityMatches?chantProgramme.selections??{}:{};
  const userSelected=Object.freeze(Object.entries(userChoices)
    .filter(([track,id])=>/^[A-Z_]+$/.test(track)&&/^GREGOBASE-\d+$/.test(id))
    .map(([trackId,scoreId])=>Object.freeze({trackId,scoreId,
      status:"USER_REPORTED_NOT_INDEPENDENTLY_OBSERVED"})));
  return Object.freeze({
    schema:GREGORIAN_PROGRAMME_LAYERS_SCHEMA,riteId,date:date??null,sourcePath,
    standard:Object.freeze({status:references.length?
      "SOURCE_MATCHED_REFERENCE_NOT_MUSICALLY_APPROVED":"NO_SOURCE_MATCHED_REFERENCE",
      references,approvedCount:0}),
    local:Object.freeze({status:site?"SOURCE_DOCUMENTED_SITE_PROGRAMME":
      siteClaims.length>1?"CONFLICTING_SITE_EVIDENCE":"UNKNOWN",
      source:site,actualChoirPerformanceConfirmed:false}),
    institute:Object.freeze({status:institute?"DOCUMENTED_CUSTOM_NOT_SITE_PERFORMANCE":
      instituteClaims.length>1?"CONFLICTING_CUSTOM_EVIDENCE":"UNKNOWN",
      source:institute,actualChoirPerformanceConfirmed:false}),
    user:Object.freeze({status:userSelected.length?"USER_SELECTED_UNVERIFIED":"UNKNOWN",
      selections:userSelected,actualChoirPerformanceConfirmed:false}),
    liturgicalProperOwner:"EXISTING_1962_MASS_HOST",
    // Do not make calendar, institute, site or reference scores trigger playback.
    autoAssignedPerformanceScore:null,autoPlayback:false,
  });
}
