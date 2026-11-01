// Source-first Proper/GABC join. Called with the actual resolved 1962
// reader Proper slots and the existing 1961 Solesmes parsed source archive.
// Candidate identity != digital score publication, local music, or sound.
const freeze=Object.freeze;
const ROLES=freeze({INTROIT:"in",GRADUAL:"gr",ALLELUIA:"al",TRACT:"tr",OFFERTORY:"of",COMMUNION:"co"});
const TOTAL=freeze({al:284,in:229,of:185,co:225,gr:189,tr:83});
const SOURCE_SCHEMA="ao-gregobase-graduale1961-research-batch-v1";
const SLOT_SCHEMA="ao-reader-proper-slots-v1";
export const MASS_GABC_BULK_MATCH_SCHEMA="ao-mass-1962-proper-gabc-bulk-candidate-v1";
export const MASS_GABC_SOURCE_ROLES=ROLES;
const latin=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
const words=value=>latin(value).split(" ").filter(Boolean);
const validPath=path=>/^(Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+$/.test(path);
// The 1962 DayResolver supplies readable Missal text, often prefixed by a
// printed Scripture citation ("Ps 88:12; 88:15", "4 Esdr 2:34-35") and
// an optional ℣. cue. These are bibliographic / typographic marks, not sung
// opening words. Strip ONLY such anchored prefixes for textual screening;
// retain the authentic Proper Latin unchanged in reader/source records.
const LEADING_BIBLE_REFERENCE=/^(?:(?:[1-4]\s+)?[A-Za-z][A-Za-z.]{1,24}\s+){1,3}\d{1,3}\s*[:.,]\s*\d{1,3}(?:[-–]\d{1,3})?(?:\s*;\s*(?:(?:[1-4]\s+)?[A-Za-z][A-Za-z.]{1,24}\s+){0,3}\d{1,3}(?:\s*[:.,]\s*\d{1,3})?(?:[-–]\d{1,3})?)*\.?\s*/u;
export function source1962ChantOpeningForMatch(value){
 const lines=String(value??"").split(/\r?\n/).map(s=>s.trim())
   .filter(Boolean).filter(s=>!/^[$!]/.test(s)&&!/^&Gloria\b/i.test(s));
 const first=lines.join(" ").trim();
 const afterReference=first.replace(LEADING_BIBLE_REFERENCE,"");
 return afterReference.replace(/^(?:[℣℟]\.|[VR]\.)\s*/u,"").trim();
}
function gabcLatin(gabc){
 // The archive stores the score BODY, not necessarily a GABC %% header.
 // Notes are inside parentheses, often between syllables of ONE Latin word.
 return latin(String(gabc??"")
  .replace(/<i>[\s\S]*?<\/i>/gi," ")
  .replace(/<sp>[\s\S]*?<\/sp>/gi," ")
  .replace(/<[^>]*>/g,"")
  .replace(/\([^()]*\)/g,"")
  .replace(/[\{\}]/g,"").replace(/[*~]/g," "));
}
const status=(name,reason)=>freeze({status:name,reason,scoreCandidates:freeze([])});
function candidate(record,prefix,sourcePath,part){
 return freeze({scoreId:record.id,part,sourcePath,sourceUrl:record.sourceUrl,
   sourceGabcSha256:record.sha256,printed1961Page:record.gradualeRomanum1961Page,
   incipit:record.incipit,matchingOpeningWords:prefix,
   status:"SOURCE_LATIN_MATCH_ONLY",
   matchedSelectedMass:true,
   fullTextVerified:false,musicalNotationVerified:false,
   editorApproved:false,publicScore:false,recordingApproved:false});
}
export function index1961GradualeGabc(batches){
 if(!Array.isArray(batches)||batches.length!==6)
   throw new Error("SIX_ORIGINAL_ARCHIVE_BATCHES_REQUIRED");
 const all=[],counts={},ids=new Set();
 for(let i=0;i<6;i++){
   const batch=batches[i],expected=i===5?195:200;
   if(batch?.schema!==SOURCE_SCHEMA||batch.sourceEditionId!==2||
     batch.batch!==i+1||batch.status!=="STAGED_UNRELEASED"||
     !Array.isArray(batch.items)||batch.items.length!==expected)
     throw new Error("ARCHIVE_BATCH_SOURCE_IDENTITY_INVALID");
   for(const row of batch.items){
     const id=Number(/^GREGOBASE-(\d+)$/.exec(row.id??"")?.[1]);
     const role=row.officePart;
     if(!Number.isInteger(id)||id!==row.gregobaseId||ids.has(id)||
       !Object.values(ROLES).includes(role)||
       row.sourceEditionId!==2||row.sourceUrl!=="https://gregobase.selapa.net/chant.php?id="+id||
       !/^[a-f0-9]{64}$/.test(row.sha256??"")||
       typeof row.gabc!=="string"||row.gabc.length<12||
       !/^\([cf][1-4]\)/.test(row.gabc.trim())||
       !row.gabc.includes("(::)")||
       row.releaseStatus!=="RESEARCH_IMPORT_NOT_EDITORIALLY_APPROVED")
       throw new Error("UNTRUSTED_ARCHIVE_SCORE:"+row?.id);
     ids.add(id);counts[role]=(counts[role]??0)+1;
     const originalText=gabcLatin(row.gabc);
     if(!originalText||words(originalText).length<1)
       throw new Error("EMPTY_ARCHIVE_LATIN:"+id);
     all.push(freeze({...row,normalizedScoreText:originalText}));
   }
 }
 if(all.length!==1195||Object.entries(TOTAL).some(([part,count])=>counts[part]!==count)||
   Object.keys(counts).length!==6)
   throw new Error("INCOMPLETE_ARCHIVE_OR_ROLE_COUNTS");
 const byRole=Object.fromEntries(Object.values(ROLES).map(x=>[x,freeze(all.filter(r=>r.officePart===x))]));
 return freeze({schema:"ao-mass-1961-full-gabc-source-index-v1",count:1195,
  byRole:freeze(byRole),approvedDigitalScores:0});
}
function roleTokens(text,part){
 const a=words(text);
 // In certified Alleluia slots the source may print a double "Alleluia,
 // alleluia." before the verse, but the GABC writes one melodic Alleluia.
 // Compare the actual verse, never treat the repeated word as a melody ID.
 if(part==="al")while(a[0]==="alleluia"||a[0]==="alleluia"||
   a[0]==="v"||a[0]==="verse")a.shift();
 return a;
}
function matchingPrefix(sourceText,scoreText,part){
 const a=roleTokens(sourceText,part),b=roleTokens(scoreText,part);
 if(a.length<3||b.length<3)return 0;
 let matching=0;
 while(matching<a.length&&matching<b.length&&a[matching]===b[matching])matching++;
 return matching;
}
function scan(sourceText,part,index,sourcePath){
 const corpus=index.byRole?.[part]??[];
 if(!corpus.length)return status("ARCHIVE_ROLE_MISSING","SOURCE_ARCHIVE_INCOMPLETE");
 const sourceOpening=source1962ChantOpeningForMatch(sourceText);
 const w=roleTokens(sourceOpening,part);
 if(w.length<4)return status("INSUFFICIENT_SOURCE_LATIN","FOUR_SOURCE_WORDS_REQUIRED");
 const rows=corpus.map(rec=>({rec,prefix:matchingPrefix(sourceOpening,rec.normalizedScoreText,part)}))
  .filter(x=>x.prefix>=4)
  .sort((a,b)=>b.prefix-a.prefix||a.rec.gregobaseId-b.rec.gregobaseId);
 if(!rows.length)return status("NO_TEXT_CANDIDATE","NO_FOUR_WORD_OPENING_MATCH_WITHIN_SAME_ROLE");
 const top=rows[0].prefix;
 const strongest=rows.filter(x=>x.prefix===top);
 const candidates=freeze(strongest.map(x=>candidate(x.rec,x.prefix,sourcePath,part)));
 return freeze({status:candidates.length===1?"UNIQUE_SOURCE_TEXT_CANDIDATE":"AMBIGUOUS_SOURCE_TEXT_VARIANTS",
  reason:candidates.length===1?"SCORE_REFERENCE_ONLY_NOT_APPROVED":"MULTIPLE_SAME_ROLE_CANDIDATES_RETAINED",
  scoreCandidates:candidates,allSameRoleMatches:rows.length,topMatchingOpeningWords:top});
}
export function matchSelected1962ProperToGraduale({properSlots,archive}={}){
 const sourcePath=String(properSlots?.sourcePath??"");
 if(properSlots?.schema!==SLOT_SCHEMA||properSlots.ready!==true||!validPath(sourcePath)||
   archive?.schema!=="ao-mass-1961-full-gabc-source-index-v1"||archive.count!==1195)
   return freeze({schema:MASS_GABC_BULK_MATCH_SCHEMA,sourcePath:sourcePath||null,
    status:"SOURCE_NOT_READY",tracks:freeze([]),publicScores:0});
 const tracks=[];
 for(const [track,part] of [["INTROIT","in"],["GRADUAL","gr"],
  ["ALLELUIA_TRACT_SEQUENCE",null],["OFFERTORY","of"],["COMMUNION","co"]]){
  const slot=properSlots.slots?.[track],rows=slot?.data?.paragraphs??[];
  if(slot?.status==="NOT_APPLICABLE"){
   tracks.push(freeze({track,part:null,...status("NOT_APPLICABLE","RESOLVED_1962_RITE_OMISSION")}));
   continue;
  }
  if(slot?.status!=="READY"||!Array.isArray(rows)||!rows.length){
   tracks.push(freeze({track,part:null,...status("SLOT_SOURCE_HOLD","PROPER_SLOT_NOT_READY")}));
   continue;
  }
  if(track==="ALLELUIA_TRACT_SEQUENCE"){
   for(const row of rows){
    const kind=String(row?.liturgicalGroup??"").replace("AO.CHANT.","");
    const role=kind==="ALLELUIA"?"al":kind==="TRACT"?"tr":null;
    const parsed=role?scan(row.latin,role,archive,sourcePath):
       status("CHANT_ROLE_UNVERIFIED","MUST_HAVE_EXACT_ALLELUIA_OR_TRACT_SOURCE");
    tracks.push(freeze({track,part:role,sourceGroup:kind||null,...parsed}));
   }
   continue;
  }
  if(track==="GRADUAL"){
   const genuine=rows.length===1&&rows[0].liturgicalGroup==="AO.CHANT.GRADUAL";
   const parsed=genuine?scan(rows[0].latin,"gr",archive,sourcePath):
     status("CHANT_ROLE_UNVERIFIED","UNSPLIT_PREGOSPEL_TEXT_NOT_A_CERTIFIED_GRADUAL");
   tracks.push(freeze({track,part:"gr",...parsed}));
   continue;
  }
  if(rows.length!==1){
   tracks.push(freeze({track,part,...status("MULTIPLE_CHANT_GROUPS","SINGLE_SCORE_UNSAFE")}));
   continue;
  }
  tracks.push(freeze({track,part,...scan(rows[0].latin,part,archive,sourcePath)}));
 }
 return freeze({schema:MASS_GABC_BULK_MATCH_SCHEMA,sourcePath,
  status:"SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES",
  tracks:freeze(tracks),publicScores:0,
  notes:"Uses resolved 1962 source Latin, not feast names or local choir inference. Four opening words and exact chant role are minimum candidate gates; source/editorial/musical approval remains separate."});
}
export function sourceMatchedGabcForEditorialReview(match,archive,scoreId){
 if(match?.schema!==MASS_GABC_BULK_MATCH_SCHEMA||match.status!=="SOURCE_FIRST_CANDIDATES_ONLY_NOT_SCORES"||
   archive?.schema!=="ao-mass-1961-full-gabc-source-index-v1")return null;
 const candidates=match.tracks.flatMap(t=>t.scoreCandidates??[]);
 const eligible=candidates.find(c=>c.scoreId===scoreId);
 if(!eligible)return null;
 const original=(archive.byRole[eligible.part]??[]).find(r=>r.id===eligible.scoreId&&r.sha256===eligible.sourceGabcSha256);
 return original?freeze({id:original.id,sourceUrl:original.sourceUrl,gabc:original.gabc,
  printedPage:original.gradualeRomanum1961Page,sourcePath:match.sourcePath,
  editorialOnly:true,approvedForPublic:false,audio:false}):null;
}
