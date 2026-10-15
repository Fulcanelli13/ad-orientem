// Pinned whole-work adapter for Gutenberg #13871. This identifies one
// specific digitized witness; it does not assert correspondence to another
// translation, a fresh critical edition or unrestricted production rights.
const ordinals=["FIRST","SECOND","THIRD","FOURTH","FIFTH","SIXTH","SEVENTH",
 "EIGHTH","NINTH","TENTH","ELEVENTH","TWELFTH","THIRTEENTH","FOURTEENTH","FIFTEENTH"];
export const BROTHER_LAWRENCE_CHAPTERS=[
 "frontmatter","preface",...ordinals.slice(0,4).map((_,i)=>"conversation-"+String(i+1).padStart(2,"0")),
 ...ordinals.map((_,i)=>"letter-"+String(i+1).padStart(2,"0")),"notes"];
const sourceUrl="https://raw.githubusercontent.com/GITenberg/The-Practice-of-the-Presence-of-God-the-Best-Rule-of-a-Holy-Life_13871/a2c7fd571d9abbd9f35fa6e40eef2590630505a0/13871.txt";
export function extractBrotherLawrence13871(raw){
 if(typeof raw!=="string"||raw.length<70000||
    !raw.includes("*** END: FULL LICENSE ***"))
  throw new Error("GUTENBERG_13871_FULL_SOURCE_OR_LICENSE_MISSING");
 const normalized=raw.replace(/\r\n?/g,"\n");
 const start=normalized.indexOf("*** START OF THIS PROJECT GUTENBERG");
 const stop=normalized.indexOf("*** END OF THIS PROJECT GUTENBERG",start+10);
 if(start<0||stop<0||start>=stop)
  throw new Error("GUTENBERG_13871_TEXT_BOUNDARY_INVALID");
 let text=normalized.slice(normalized.indexOf("\n",start)+1,stop).trim();
 const chunks=[{id:"frontmatter",title:"Source title and transcription credits",start:0}];
 const re=/^(PREFACE\.|(?:FIRST|SECOND|THIRD|FOURTH) CONVERSATION\.|(?:FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH) LETTER\.|NOTES:)\s*$/gm;
 for(const m of text.matchAll(re)){
  const head=m[1],str=head.replace(/\.$/,"");
  const id=head==="PREFACE."?"preface":head==="NOTES:"?"notes":
   head.endsWith("CONVERSATION.")?"conversation-"+String(ordinals.indexOf(head.split(" ")[0])+1).padStart(2,"0"):
   "letter-"+String(ordinals.indexOf(head.split(" ")[0])+1).padStart(2,"0");
  chunks.push({id,title:str.replace(/\.$/,""),start:m.index});
 }
 const ids=chunks.map(c=>c.id);
 if(JSON.stringify(ids)!==JSON.stringify(BROTHER_LAWRENCE_CHAPTERS))
  throw new Error("GUTENBERG_13871_EXPECTED_CHAPTERS_DIFFER");
 const chapters=chunks.map((c,i)=>{
  let body=text.slice(c.start,i===chunks.length-1?text.length:chunks[i+1].start).trim();
  if(c.id!=="frontmatter")body=body.replace(/^[^\n]+\n/,"").trim();
  if(!body)throw new Error("GUTENBERG_13871_EMPTY_SECTION_"+c.id);
  return {id:c.id,title:c.title,format:"PLAIN_PARAGRAPHS",text:body,sourceUrl};
 });
 return {chapters,edition:{
  workId:"WORK-BROTHER-LAWRENCE-PRACTICE-PRESENCE",
  editionId:"ED-REVELL-GUTENBERG13871-GITENBERG2018",
  witnessId:"WIT-PG13871-GITENBERG-A2C7FD57",
  releaseNoticeRetainedInStagedFile:true,
  originalWitnessUrl:sourceUrl,
  projectGutenbergBookId:13871,
  upstreamGitCommit:"a2c7fd571d9abbd9f35fa6e40eef2590630505a0",
  paperEdition:"Fleming H. Revell English translation, translator unnamed in source; original 1890s setting not independently collated",
  sourceRights:"Project Gutenberg #13871 catalogued public domain in USA; source notice and trademark terms retained. No production republication approved",
  stageQuality:"COMPLETE_ELECTRONIC_WORK_STRUCTURE_PARSE_NOT_CHAR_BY_CHAR_PRINT_CERTIFIED"
 }};
}
