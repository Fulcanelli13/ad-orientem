/**
 * Read-only 20-path St Pius X editorial conversation browser.
 * NO Denzinger lookup. Original content remains in the 10 source-owner JSON shards.
 * Does not export a published character response or change the Mass/Chanoine runtime.
 */
export const PIUS_X_20PATH_REVIEW_VERSION = "AO_SPX_20PATH_SOURCE_OWNER_REVIEW_V1";
const BASE="data/learn/research/";
const NAV=BASE+"pius-x-20path-bilingual-choice-navigation-20261020.v1.json";
const PATCH=BASE+"pius-x-source-bounded-bilingual-corrections-20261020.v1.json";
const ELIG=BASE+"pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json";
const ORIGINAL_PRINT="https://it.wikisource.org/wiki/Indice:Compendio_della_dottrina_cristiana,_Roma,_1905.djvu";
const allowedDraftPath=p=>/^data\/learn\/research\/pius-x-batch(?:9-sacraments|10-eucharist)-[a-e]-20261020\.v1\.json$/.test(p);
const qid=id=>/^PX1905-Q(?:5(?:6[7-9]|[7-9]\d)|6(?:[0-5]\d|66))$/.test(id);
const reject=why=>{throw new Error("SPX review refused: "+why)};
export async function createPiusX20PathReview(read){
 if(typeof read!=="function")reject("source owner read function missing");
 const [nav,patch,elig]=await Promise.all([read(NAV),read(PATCH),read(ELIG)]);
 if(nav?.schema!=="AO_SPX_20_BRANCHING_BILINGUAL_DIALOGUE_MENUS_V1"||
   nav?.counts?.chapters!==20||nav.counts.topicTracks!==50||
   nav.counts.mappedUniqueSourceQuestions!==100||nav.counts.certifiedPublication!==0||
   nav.counts.originalDraftTurnRetentions!==200||
   !Array.isArray(nav.chapters)||nav.chapters.length!==20||
   !Array.isArray(nav.questionNavigation)||nav.questionNavigation.length!==100)reject("unapproved navigation corpus");
 if(patch?.schema!=="AO_SPX_BILINGUAL_CORRECTED_DRAFT_CANDIDATES_V1"||
   patch.counters?.liveReplacements!==0||patch.records?.length!==10||
   elig?.schema!=="AO_SPX_AQ04_AQ05_CANON_SOURCE_ELIGIBILITY_REVIEW_V1"||
   elig?.counts?.routerHandoffApproved!==0||
   elig?.counts?.canonAvatarResponseApproved!==0||
   elig?.records?.length!==22)reject("revision or Chanoine approval bounds changed");
 const chapterIndex=new Map(nav.chapters.map(ch=>[ch.id,ch]));
 const nodes=new Map(nav.questionNavigation.map(q=>[q.questionId,q]));
 const patches=new Map(patch.records.map(p=>[p.turnId,p]));
 const canon=new Map(elig.records.map(e=>[e.answerTurnId,e]));
 if(chapterIndex.size!==20||nodes.size!==100||patches.size!==10||canon.size!==22)reject("duplicate IDs");
 const chapters=nav.chapters.map(ch=>{
  if(ch.published!==false||ch.independentlyEditoriallyApproved!==false||
   ch.denzingerVisibility!=="HIDE_UNTIL_CLAIM_AND_EDITION_VERIFIED"||
   !ch.allSourceQuestionIds.every(id=>nodes.has(id)))reject("unapproved chapter "+ch.id);
  return Object.freeze({id:ch.id,en:ch.chapterTitleEN,fr:ch.chapterTitleFR,
   entry:ch.defaultEntrySourceQuestion,entries:ch.entryChoices,all:ch.allSourceQuestionIds});
 });
 for(const q of nodes.values()){
  if(!qid(q.questionId)||!chapterIndex.has(q.owningArcId)||
   !chapterIndex.get(q.owningArcId).allSourceQuestionIds.includes(q.questionId)||
   q.publicationApproved!==false||q.neverAppendNextPrintedQuestionAutomatically!==true||
   q.previouslyVisitedFilteringRequired!==true||!allowedDraftPath(q.answerSource?.originalDraftFile)||
   q.answerSource?.status!=="EXISTING_EN_FR_UNAPPROVED_EDITORIAL_PARAPHRASE_ONLY"||
   q.answerSource?.turnIndex!==1)reject("invalid node "+q.questionId);
  for(const choice of q.menu){
   if(!nodes.has(choice.sourceQuestionId)||choice.sourceQuestionId===q.questionId||
    !choice.labelEN||!choice.labelFR)reject("unowned choice");
  }
 }
 const cache=new Map();
 async function original(path){
  if(!allowedDraftPath(path))reject("unsafe draft location");
  if(cache.has(path))return cache.get(path);
  const json=await read(path);
  if(!Array.isArray(json?.records)||json.records.length!==10)reject("invalid original shard");
  const m=new Map(json.records.map(e=>[e.id,e]));
  for(const e of m.values())if(e.release?.production!==false||e.turns?.length!==2||
    !e.turns.every(t=>t.response?.en&&t.response?.fr&&t.question?.en&&t.question?.fr))reject("unapproved original draft");
  cache.set(path,m);return m;
 }
 async function inspect(id){
  const q=nodes.get(id);if(!q)return null;
  const owned=(await original(q.answerSource.originalDraftFile)).get(q.answerSource.originalDraftFamily);
  if(!owned||owned.source?.questionId!==id)reject("question not owned by original draft");
  const turn=owned.turns[0],revised=patches.get(owned.id+"-T1")||null;
  if(turn.question.en!==q.questionEN||turn.question.fr!==q.questionFR)reject("draft question divergence");
  const options=q.menu.map(c=>Object.freeze({id:c.sourceQuestionId,en:c.labelEN,fr:c.labelFR,
   category:c.linkNature}));
  const cross=chapterIndex.get(q.owningArcId).crossChapterOptions.map(c=>
    Object.freeze({id:c.sourceQuestionId,en:c.labelEN,fr:c.labelFR,category:"CROSS_TOPIC"}));
  return Object.freeze({id:q.questionId,arc:q.owningArcId,question:turn.question,
   answer:turn.response,sourceUrl:owned.source.url,printIndex:ORIGINAL_PRINT,
   sourceLabel:"1905 Catechismo maggiore · editorial locator "+id,
   originalNumberPrinted:false,
   choices:Object.freeze(options),cross:Object.freeze(cross),reviewOnly:true,approved:false,
   proposedRevision:revised?Object.freeze({en:revised.revisionCandidate.en,
    fr:revised.revisionCandidate.fr,approved:false}):null,
   canon:canon.get(owned.id+"-T1")||null});
 }
 return Object.freeze({version:PIUS_X_20PATH_REVIEW_VERSION,reviewOnly:true,published:false,
  chapters:Object.freeze(chapters), inspect, getChapter:id=>chapters.find(x=>x.id===id)||null,
  stats:Object.freeze({chapters:20,questions:100,sourceOwnerTurns:200,revisions:10,
   narrowCanonCandidates:elig.counts.byStatus.MATCHED_NARROW_CONTENT_SUBJECT,
   denzingerRequired:false,approved:0})});
}
