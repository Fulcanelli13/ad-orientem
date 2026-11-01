// Research-only aggregation of actual calendar-selected 1962 Masses.
// The calendar resolver owns each date's Proper; text matches are never approved notation.
export const SCHOLA_CALENDAR_BULK_SCHEMA="ao-schola-1962-selected-calendar-bulk-v1";
const permitted=new Set(["MATCHED_CANDIDATES","DAY_RESOLVER_HOLD","PROPER_SOURCE_HOLD",
 "READER_PROPER_HOLD","GABC_MATCHER_HOLD"]);
const sourcePattern=/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/;
const keyOf=row=>JSON.stringify([row.sourcePath,
 ...(row.tracks??[]).map(track=>[track.track,track.part,track.sourceLatinSha256])]);
export function summarizeSelectedCalendarChants({dates,rows,scoreArchiveCount=1195}={}){
 if(!Array.isArray(dates)||!Array.isArray(rows)||scoreArchiveCount!==1195||
   dates.length!==rows.length||new Set(dates).size!==dates.length||
   dates.some(d=>!/^\d{4}-\d\d-\d\d$/.test(d)))
   throw new Error("INVALID_CALENDAR_SWEEP_SCOPE");
 const expected=new Set(dates),seen=new Set(),dayStatuses={},candidateStatuses={},grouped=new Map();
 let matchedEntries=0,uniqueCandidateEntries=0,ambiguousEntries=0;
 const actualPaths=new Set();
 for(const row of rows){
   if(!expected.has(row?.date)||seen.has(row.date)||!permitted.has(row.status))
     throw new Error("CALENDAR_DATE_OR_STATUS_INVALID");
   seen.add(row.date);dayStatuses[row.status]=(dayStatuses[row.status]??0)+1;
   if(row.status!=="MATCHED_CANDIDATES")continue;
   if(!sourcePattern.test(row.sourcePath)||!Array.isArray(row.tracks)||!row.tracks.length||
       row.tracks.some(track=>!track.track||!track.status||
       !Array.isArray(track.candidateScoreIds)||
       (track.sourceLatinSha256!=null&&!/^[a-f0-9]{64}$/.test(track.sourceLatinSha256))))
     throw new Error("UNTRUSTED_SELECTED_FORMULARY");
   actualPaths.add(row.sourcePath);
   const sig=keyOf(row),group=grouped.get(sig)??{
     sourcePath:row.sourcePath,firstDate:row.date,dates:[],tracks:row.tracks};
   group.dates.push(row.date);
   if(row.date<group.firstDate)group.firstDate=row.date;
   grouped.set(sig,group);
   for(const track of row.tracks){
     matchedEntries++;candidateStatuses[track.status]=(candidateStatuses[track.status]??0)+1;
     if(track.status==="UNIQUE_SOURCE_TEXT_CANDIDATE")uniqueCandidateEntries++;
     if(track.status==="AMBIGUOUS_SOURCE_TEXT_VARIANTS")ambiguousEntries++;
   }
 }
 if(seen.size!==dates.length)throw new Error("INCOMPLETE_CALENDAR_DATE_SET");
 const formularies=[...grouped.values()].map(g=>({...g,dates:g.dates.sort(),
   occurrences:g.dates.length})).sort((a,b)=>a.firstDate.localeCompare(b.firstDate)||
     a.sourcePath.localeCompare(b.sourcePath));
 return Object.freeze({schema:SCHOLA_CALENDAR_BULK_SCHEMA,
   scope:{firstDate:dates[0]??null,lastDate:dates.at(-1)??null,
     daysChecked:dates.length,actualCalendarSelection:true,
     alternateVotiveAndRequiemMassesIncluded:false,
     seasonalVariantsOnlyWhenSelectedByResolver:true},
   scoreArchiveCount,
   totalReadyDays:dayStatuses.MATCHED_CANDIDATES??0,
   uniqueActualSourcePaths:actualPaths.size,
   distinctActualSourceTextSignatures:formularies.length,
   matchedChantEntries:matchedEntries,uniqueTextCandidates:uniqueCandidateEntries,
   competingTextCandidates:ambiguousEntries,
   dayStatuses,candidateStatuses,formularies,
   publication:{sourceTextMatchesOnly:true,fullTextCollationsApproved:0,
     musicalScoresApproved:0,publicScores:0,recordingsApproved:0,
     noAutomaticPublication:true}});
}
