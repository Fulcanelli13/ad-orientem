// Two pinned, complete Project Gutenberg/GITenberg historical works.
// Edition/witness identities are fixed; this extracts ALL original
// numbered chapters without claiming a critical edition or public clearance.
const toRoman=(n)=>{
 const pieces=[[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
 let s="",v=n;for(const [q,t] of pieces)while(v>=q){v-=q;s+=t;}return s;
};
const trimmed=s=>s.replace(/\r\n?/g,"\n").replace(/^\uFEFF/,"");
const source={
 imitation:{
  workId:"WORK-THOMAS-KEMPIS-IMITATION-CHRIST",
  editionId:"ED-BENHAM-EN-PG1653-GITENBERG2018",
  witnessId:"WIT-PG1653-GITENBERG-A15DFC4B",
  upstreamCommit:"a15dfc4b9a5df8c7b12acae980d7d6a86dc5f6a8",
  url:"https://raw.githubusercontent.com/GITenberg/The-Imitation-of-Christ_1653/a15dfc4b9a5df8c7b12acae980d7d6a86dc5f6a8/1653.txt",
  language:"en",name:"The Imitation of Christ",
  translator:"Rev. William Benham",
  era:"Benham English translation, Gutenberg 1999 digital witness; exact underlying print copy-text not verified",
  partCounts:[25,12,59,18]
 },
 sales:{
  workId:"WORK-FRANCIS-SALES-DEVOUT-LIFE",
  editionId:"ED-PERISSE-1832-FR-PG53540-GITENBERG2018",
  witnessId:"WIT-PG53540-GITENBERG-6AD311EC",
  upstreamCommit:"6ad311ecadc2dd5a414b5f11230806dec46b80b8",
  url:"https://raw.githubusercontent.com/GITenberg/Introduction-a-la-vie-devote_53540/6ad311ecadc2dd5a414b5f11230806dec46b80b8/53540-0.txt",
  language:"fr",name:"Introduction à la vie dévote",
  translator:null,
  era:"Lyon/Paris, Périsse frères, 1832, French printed witness transcribed in Gutenberg #53540; original 1608/1609 text has historical variations",
  partCounts:[24,21,41,15,18]
 }
};
export const CLASSIC_WITNESSES=Object.freeze(source);
export const expectedClassicIds=kind=>{
 const x=source[kind];if(!x)throw Error("CLASSIC_KIND_UNSUPPORTED");
 const ids=["frontmatter"];
 for(let i=0;i<x.partCounts.length;i++){
  const stem=(kind==="imitation"?"book-":"part-")+String(i+1).padStart(2,"0");
  ids.push(stem+"-intro");
  for(let n=1;n<=x.partCounts[i];n++)ids.push(stem+"-ch-"+String(n).padStart(2,"0"));
 }
 if(kind==="sales")ids.push("appendix-rosary","appendix-feast-prayer");
 return ids;
};
const readHeadings=(s,kind)=>{
 const regex=kind==="imitation"?
  /^(THE (FIRST|SECOND|THIRD|FOURTH) BOOK|CHAPTER [IVXLCDM]+)\s*$/gm:
  /^(PREMIÈRE PARTIE\.|(?:SECONDE|TROISIÈME|QUATRIÈME|CINQUIÈME) PARTIE\.?|CHAPITRE (?:PREMIER|[IVXLCDM]+)\.)\s*$/gm;
 return [...s.matchAll(regex)].map(m=>({text:m[1],at:m.index}));
};
export function extractHistoricalClassic(kind,original){
 const x=source[kind];
 if(!x||typeof original!=="string"||original.length<100000||
    !original.toLowerCase().includes("gutenberg"))
  throw Error("CLASSIC_SOURCE_INVALID");
 const text=trimmed(original);
 let workStart,workEnd;
 if(kind==="imitation"){
  workStart=text.indexOf("\nTHE IMITATION OF CHRIST\n");
  workEnd=text.lastIndexOf("\nProject Gutenberg Etext Imitation of Christ");
  if(workStart<0||workEnd<workStart+20000)throw Error("CLASSIC_IMITATION_BOUNDS_INVALID");
 }else{
  workStart=text.indexOf("\n  INTRODUCTION\n\n  A\n\n  LA VIE DÉVOTE,");
  workEnd=text.indexOf("\nTABLE DES CHAPITRES.",workStart);
  const pgEnd=text.indexOf("*** END OF THIS PROJECT GUTENBERG",workStart);
  if(workStart<0||workEnd<workStart+20000||pgEnd<workEnd||
     !text.includes("1832.",workStart-20000))throw Error("CLASSIC_SALES_BOUNDS_INVALID");
 }
 let body=text.slice(workStart,workEnd).trim();
 const appendixHead=kind==="sales"?body.indexOf("\n_Manière de réciter devotement le chapelet"): -1;
 const core=appendixHead<0?body:body.slice(0,appendixHead).trim();
 const headings=readHeadings(core,kind);
 const found=[],chapters=[];
 const first=headings[0];
 if(!first)throw Error("CLASSIC_HEADINGS_REQUIRED");
 chapters.push({id:"frontmatter",title:"Front matter and introductory material",
  format:"PLAIN_PARAGRAPHS",text:core.slice(0,first.at).trim(),sourceUrl:x.url});
 let part=0,chapterNum=0,actual=[];
 const partPattern=kind==="imitation"?/^THE /:/PARTIE/;
 for(let i=0;i<headings.length;i++){
  const h=headings[i],next=headings[i+1];
  const suffix=core.slice(h.at+(h.text.length),next?next.at:core.length).trim();
  if(partPattern.test(h.text)){
   part++;chapterNum=0;
   actual.push(0);
   const id=(kind==="imitation"?"book-":"part-")+String(part).padStart(2,"0")+"-intro";
   chapters.push({id,title:h.text,format:"PLAIN_PARAGRAPHS",
    text:(h.text+"\n\n"+suffix).trim(),sourceUrl:x.url});
  }else{
   chapterNum++;actual[part-1]++;
   const declared=h.text.replace(/^CHAPTER |^CHAPITRE /,"").replace(/\.$/,"");
   const expected=kind==="sales"&&chapterNum===1?"PREMIER":toRoman(chapterNum);
   if(declared!==expected)throw Error("CLASSIC_NUMERAL_ORDER_"+kind+"_"+part+"_"+chapterNum+"_"+declared);
   const stem=(kind==="imitation"?"book-":"part-")+String(part).padStart(2,"0");
   chapters.push({id:stem+"-ch-"+String(chapterNum).padStart(2,"0"),
    title:h.text,format:"PLAIN_PARAGRAPHS",
    text:suffix,sourceUrl:x.url});
  }
 }
 if(JSON.stringify(actual)!==JSON.stringify(x.partCounts))
  throw Error("CLASSIC_EXPECTED_CHAPTER_COVERAGE_MISMATCH");
 if(kind==="sales"){
  if(appendixHead<0)throw Error("CLASSIC_SALES_APPENDIX_MISSING");
  let appendix=body.slice(appendixHead).trim();
  const division=appendix.indexOf("\n_Oraison de l'Eglise pour le jour de la fête de saint François de");
  if(division<0)throw Error("CLASSIC_SALES_FEAST_PRAYER_MISSING");
  let rosary=appendix.slice(0,division).trim();
  let prayer=appendix.slice(division).replace(/\nFIN\.\s*$/,"").trim();
  if(!rosary.includes("mystères du rosaire")||!prayer.includes("Alexandre VII"))
   throw Error("CLASSIC_SALES_APPENDIX_COVERAGE_INVALID");
  chapters.push({id:"appendix-rosary",title:"Manière de réciter dévotement le chapelet",
    format:"PLAIN_PARAGRAPHS",text:rosary,sourceUrl:x.url});
  chapters.push({id:"appendix-feast-prayer",title:"Oraison de la fête de saint François de Sales",
    format:"PLAIN_PARAGRAPHS",text:prayer,sourceUrl:x.url});
 }
 const expected=expectedClassicIds(kind);
 if(JSON.stringify(chapters.map(c=>c.id))!==JSON.stringify(expected))
  throw Error("CLASSIC_FULL_WORK_SEQUENCE_INVALID");
 if(chapters.some(c=>!c.text.trim()||
    c.text.includes("*** END OF THIS PROJECT GUTENBERG")))
  throw Error("CLASSIC_CHAPTER_TEXT_EMPTY_OR_BOILERPLATE");
 return {chapters,edition:{...x,sourceNoticeRetainedInStaging:true,
  fullPrintedEditionCertified:false,publicationApproved:false,
  matchedHistoricalChapterCounts:actual}};
}
