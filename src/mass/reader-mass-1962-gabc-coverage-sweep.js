// Offline 1962 Missal source-file -> original Solesmes GABC coverage.
// Research evidence only: an indexed file is NOT the calendar-selected Mass.
export const SCHOLA_1962_BULK_COVERAGE_SCHEMA="ao-schola-1962-91-pinned-mass-source-coverage-v1";
const freeze=Object.freeze;
const sourceKeys=["Introitus","Graduale","GradualeP","Tractus","Offertorium","Communio","Sequentia"];
const basic={"Introitus":"in","Offertorium":"of","Communio":"co","Tractus":"tr"};
function norm(value){return String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");}
function tokens(x,role){
 const a=norm(x).split(" ").filter(Boolean);
 if(role==="al")while(["alleluia","v","verse"].includes(a[0]))a.shift();
 return a;
}
const inherit=/^@((?:Tempora|Sancti|Commune)\/[A-Za-z0-9_-]+)(?::([A-Za-z0-9]+))?/;
function verifiedSection(map,path,section,chain=new Set()){
 const key=path+":"+section;
 if(chain.has(key))return {status:"INHERITANCE_CYCLE",source:key};
 if(chain.size>=8)return {status:"INHERITANCE_TOO_DEEP",source:key};
 const source=map.get(path);
 if(!source)return {status:"INHERITED_SOURCE_NOT_IN_PINNED_BATCH",source:key};
 if(source.status!=="SHA_MATCH"&&source.status!=="PINNED_REF_FETCHED")
  return {status:"SOURCE_BLOB_UNVERIFIED",source:key};
 const value=source.sections?.[section];
 if(!value)return {status:"SOURCE_SECTION_ABSENT",source:key};
 const lines=value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const pointer=inherit.exec(lines[0]??"");
 if(pointer){
   if(lines.length!==1)return {status:"MIXED_INHERITANCE_HOLD",source:key};
   const next=new Set([...chain,key]);
   const parent=verifiedSection(map,pointer[1],pointer[2]||section,next);
   return {...parent,owner:parent.owner??pointer[1],sourceOwnerChain:[key,...(parent.sourceOwnerChain??[])]};
 }
 if(lines.some(line=>/^@/.test(line)))return {status:"INLINE_INHERITANCE_HOLD",source:key};
 return {status:"DIRECT_OR_RESOLVED",source:key,owner:path,sourceOwnerChain:[key],text:value};
}
function chantLines(value){
 return String(value).split(/\r?\n/).map(x=>x.trim())
  .filter(x=>x && !/^\!/.test(x) && !/^\$/.test(x) && !/^&Gloria/i.test(x));
}
function stripVerse(s){return s.replace(/^[VvRr]\.?\s+/,"").trim()}
function candidateMatch(phrase,part,archive){
 const t=tokens(phrase,part);
 if(t.length<4)return {status:"SOURCE_TEXT_TOO_SHORT",part,wordCount:t.length,candidates:[]};
 const matches=(archive?.byRole?.[part]??[]).map(x=>{
   const s=tokens(x.normalizedScoreText,part);let length=0;
   while(length<t.length&&length<s.length&&t[length]===s[length])length++;
   return {id:x.id,sha256:x.sha256,sourceUrl:x.sourceUrl,
    originalFolio:x.gradualeRomanum1961Page,matchedOpeningWords:length};
 }).filter(x=>x.matchedOpeningWords>=4).sort((a,b)=>b.matchedOpeningWords-a.matchedOpeningWords||a.id.localeCompare(b.id));
 if(!matches.length)return {status:"NO_SAME_ROLE_TEXT_CANDIDATE",part,wordCount:t.length,candidates:[]};
 const best=matches[0].matchedOpeningWords,top=matches.filter(x=>x.matchedOpeningWords===best);
 return {status:top.length===1?"UNIQUE_TEXT_CANDIDATE":"AMBIGUOUS_TEXT_VARIANTS",
  part,wordCount:t.length,allSameRoleMatches:matches.length,candidates:top,
  editorialApproved:false,musicalVerified:false,publicScore:false};
}
function itemsForGraduale(value,mode){
 const ls=chantLines(value);
 const result=[];
 if(!ls.length)return [{kind:"UNKNOWN_PREGOSPEL",reason:"EMPTY_SOURCE"}];
 if(mode==="PASCHAL_ALTERNATIVE"){
   // Never substitute a GradualeP for an actual calendar choice without
   // the selected season and rite provenance.
   return [{kind:"PASCHAL_ALTERNATIVE",reason:"CALENDAR_BRANCH_NOT_SELECTED"}];
 }
 if(/^(?:Allel[uú]j?a|Alleluia)(?:,|\.)/iu.test(ls[0])){
   const lines=ls.filter(x=>!/^(?:Allel[uú]j?a|Alleluia)(?:,|\.)/iu.test(x));
   for(const s of lines){let words=stripVerse(s).replace(/\s+Allel[uú]j?a\.?\s*$/iu,"");
     if(words)result.push({kind:"ALLELUIA",part:"al",text:words});}
 }else{
   const first=ls[0];result.push({kind:"GRADUAL",part:"gr",text:stripVerse(first)});
   const boundary=ls.findIndex((x,i)=>i>0&&/\bAllel[uú]j?a,?\s+Allel[uú]j?a/iu.test(x));
   if(boundary>=0){
     // The double Alleluia is often appended to the Gradual verse; the
     // following source verse owns the independent Alleluia melody.
     const tail=ls.slice(boundary+1).filter(x=>!/^Allel[uú]j?a\b/i.test(x));
     for(const x of tail){const text=stripVerse(x).replace(/\s+Allel[uú]j?a\.?\s*$/iu,"").trim();
       if(text)result.push({kind:"ALLELUIA",part:"al",text});}
   }
 }
 return result.length?result:[{kind:"UNKNOWN_PREGOSPEL",reason:"NO_LITURGICAL_SEGMENT"}];
}
export function sweepPinned1962MassSourceFiles({sources,archive,baseCount=91}={}){
 if(!Array.isArray(sources)||archive?.count!==1195)throw new TypeError("Pinned source files and 1195-score archive required");
 const sourceMap=new Map();
 for(const s of sources){
   if(!s?.path||sourceMap.has(s.path))throw new Error("SOURCE_IDENTITY_DUPLICATED");
   if(s.status==="SHA_MATCH"&&s.actualSha!==s.expectedSha)throw new Error("SOURCE_SHA_DRIFT");
   sourceMap.set(s.path,s);
 }
 const base=sources.filter(s=>s.status==="SHA_MATCH"&&s.expectedSha);
 if(base.length!==baseCount)throw new Error("INCOMPLETE_1962_SOURCE_ROSTER");
 const tally={};let all=[];
 for(const s of base){
   const tracks=[];
   for(const section of sourceKeys){
     const value=verifiedSection(sourceMap,s.path,section);
     if(value.status==="SOURCE_SECTION_ABSENT"){
       if(section==="GradualeP"||section==="Tractus"||section==="Sequentia")continue;
       tracks.push({section,kind:section,part:basic[section]??null,status:"SECTION_ABSENT",candidates:[]});
       continue;
     }
     if(value.status!=="DIRECT_OR_RESOLVED"){
       tracks.push({section,kind:section,part:basic[section]??null,status:value.status,
         sourceOwnerChain:value.sourceOwnerChain??[],candidates:[]});
       continue;
     }
     const sections=section==="Graduale"||section==="GradualeP"
       ?itemsForGraduale(value.text,section==="GradualeP"?"PASCHAL_ALTERNATIVE":"NORMAL")
       :section==="Sequentia"?[{kind:"SEQUENCE",reason:"SEPARATE_1962_SOURCE_FAMILY"}]
       :[{kind:section,part:basic[section],text:stripVerse(chantLines(value.text)[0]??"")}];
     for(const piece of sections){
       const outcome=piece.part?candidateMatch(piece.text,piece.part,archive):
         {status:piece.kind==="SEQUENCE"?"SEQUENCE_OUTSIDE_1195_ARCHIVE":
             piece.kind==="PASCHAL_ALTERNATIVE"?"PASCHAL_SOURCE_SELECTION_REQUIRED":
             "PRE_GOSPEL_ROLE_NOT_VERIFIED",
          candidates:[],reason:piece.reason};
       tracks.push({section,kind:piece.kind,part:piece.part??null,
         sourceOwner:value.owner,sourceOwnerChain:value.sourceOwnerChain,
         latinIncipit:piece.text??null,...outcome});
     }
   }
   for(const t of tracks)tally[t.status]=(tally[t.status]??0)+1;
   all.push({sourcePath:s.path,sourceBlobSha:s.actualSha,
     sourceAuthenticated:true,
     actualSelectedMass1962:false,
     tracks});
 }
 return freeze({schema:SCHOLA_1962_BULK_COVERAGE_SCHEMA,
  status:"1962_SOURCE_FILE_COVERAGE_NOT_CALENDAR_SELECTION_OR_MUSIC_APPROVAL",
  pinnedSourceCount:base.length,catalogueSourceCount:archive.count,
  extraInheritanceWitnessCount:sourceMap.size-base.length,
  candidateStatuses:freeze(tally),
  publication:{approvedScores:0,approvedRecordings:0,
   dateOrFeastInferred:false,actualSelectedMassConfirmed:false},
  sourceFiles:freeze(all)});
}
