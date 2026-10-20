/**
 * P2 Living Church -> St Pius X 20-path research owner.
 * Loads pinned JSON directly from PR #1458. No doctrinal copies in the scene
 * branch; no Denzinger dependency or arbitrary remote executable code.
 * The original 1905 questions are editorial ordinals, not printed numbers.
 */
export const PIUS_20_REVIEW_PIN="6883412a1a5f56c0ff8602910d20024a3744ff33";
export const PIUS_20_REVIEW_VERSION="AO_LC_PIUS20_PINNED_CONTENT_BRIDGE_V1";
const prefix="data/learn/research/";
const paths=[
 "pius-x-20path-bilingual-choice-navigation-20261020.v1.json",
 "pius-x-source-bounded-bilingual-corrections-20261020.v1.json",
 "pius-x-chanoine-22-answer-aq04-aq05-eligibility-20261020.v1.json",
 "pius-x-historical-visual-novel-stage-20261020.v1.json",
 "pius-x-six-period-voice-candidates-20261020.v1.json",
 ...["a","b","c","d","e"].map(c=>"pius-x-batch9-sacraments-"+c+"-20261020.v1.json"),
 ...["a","b","c","d","e"].map(c=>"pius-x-batch10-eucharist-"+c+"-20261020.v1.json")
];
const refuse=reason=>{throw Error("Pius X 20-path content not available: "+reason)};
const safeSrc=x=>typeof x==="string"&&/^https:\/\/www\.museosanpiox\.it\//.test(x)&&!/[<>"'\s]/.test(x);
const allowedPath=x=>paths.slice(5).some(p=>prefix+p===x);
function verify(review){
 const {navigation:nav,corrections:patch,canon,visual,voice,shards}=review;
 if(nav?.schema!=="AO_SPX_20_BRANCHING_BILINGUAL_DIALOGUE_MENUS_V1"||
  nav.counts?.chapters!==20||nav.counts?.topicTracks!==50||
  nav.counts?.mappedUniqueSourceQuestions!==100||nav.counts?.certifiedPublication!==0||
  nav.counts?.originalDraftTurnRetentions!==200||nav.chapters?.length!==20||
  nav.questionNavigation?.length!==100||
  patch?.schema!=="AO_SPX_BILINGUAL_CORRECTED_DRAFT_CANDIDATES_V1"||
  patch.counters?.liveReplacements!==0||patch.records?.length!==10||
  canon?.schema!=="AO_SPX_AQ04_AQ05_CANON_SOURCE_ELIGIBILITY_REVIEW_V1"||
  canon.counts?.routerHandoffApproved!==0||canon.counts?.canonAvatarResponseApproved!==0||
  canon.records?.length!==22||
  visual?.schema!=="AO_SPX_HISTORICAL_VISUAL_NOVEL_SCENE_V1"||
  visual.publication!=="REVIEW_ONLY"||visual.counts?.approvedCharacterReplies!==0||
  visual.referencedOwners?.sprites?.commit!=="0a920793bcdf40cc053ad0aff31132ade8185a33"||
  voice?.schema!=="AO_SPX_SIX_FIRST_PERIOD_VOICE_CANDIDATES_V1"||
  voice.claims?.independentlyApproved!==0||voice.records?.length!==6)
  refuse("source version or publication contract");
 if(shards.length!==10||shards.some(s=>s?.records?.length!==10))refuse("incomplete original answer owners");
 const questions=new Map(nav.questionNavigation.map(q=>[q.questionId,q]));
 const families=new Map(shards.flatMap(s=>s.records.map(e=>[e.id,e])));
 const chapters=new Map(nav.chapters.map(c=>[c.id,c]));
 const patches=new Map(patch.records.map(p=>[p.turnId,p]));
 const voiceByTurn=new Map(voice.records.map(p=>[p.turnId,p]));
 const canonByTurn=new Map(canon.records.map(e=>[e.answerTurnId,e]));
 const poses=new Map(visual.arcs.map(c=>[c.id,c.defaultPose]));
 const exceptions=new Map(visual.poseExceptions.map(p=>[p.qid,p.pose]));
 if(questions.size!==100||families.size!==100||chapters.size!==20||
  patches.size!==10||voiceByTurn.size!==6||canonByTurn.size!==22||
  poses.size!==20||exceptions.size!==7)refuse("duplicate or missing source identifiers");
 for(const q of questions.values()){
  if(!/^PX1905-Q(?:5(?:6[7-9]|[7-9]\d)|6(?:[0-5]\d|6[0-6]))$/.test(q.questionId)||
   q.publicationApproved!==false||q.neverAppendNextPrintedQuestionAutomatically!==true||
   q.previouslyVisitedFilteringRequired!==true||!allowedPath(q.answerSource?.originalDraftFile)||
   !chapters.get(q.owningArcId)?.allSourceQuestionIds?.includes(q.questionId))
   refuse("invalid source question");
  const f=families.get(q.answerSource.originalDraftFamily);
  if(!f||f.source?.questionId!==q.questionId||f.release?.production!==false||
   f.turns?.length!==2||!safeSrc(f.source?.url)||
   f.turns[0].question.en!==q.questionEN||f.turns[0].question.fr!==q.questionFR||
   !f.turns.every(t=>t.response?.en&&t.response?.fr))refuse("unapproved source-owner answer "+q.questionId);
  if(q.menu.some(e=>!questions.has(e.sourceQuestionId)||e.sourceQuestionId===q.questionId))
   refuse("unowned navigation target");
 }
 return {questions,families,chapters,patches,voiceByTurn,canonByTurn,poses,exceptions};
}
export async function loadLivingChurchPius20Review({request=fetch}={}){
 if(typeof request!=="function")refuse("no source fetch implementation");
 const base="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+PIUS_20_REVIEW_PIN+"/"+prefix;
 const loads=await Promise.all(paths.map(async p=>{
  const response=await request(base+p,{cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(!response?.ok)refuse("pinned owner unreachable: "+p);
  return response.json();
 }));
 const [navigation,corrections,canon,visual,voice,...shards]=loads;
 const data={navigation,corrections,canon,visual,voice,shards},indexes=verify(data);
 const {questions,families,chapters,patches,voiceByTurn,canonByTurn,poses,exceptions}=indexes;
 const displayChapters=navigation.chapters.map(ch=>Object.freeze({id:ch.id,en:ch.chapterTitleEN,fr:ch.chapterTitleFR,
  entries:Object.freeze(ch.entryChoices.map(e=>Object.freeze({id:e.sourceQuestionId,en:e.labelEN,fr:e.labelFR})))}));
 async function inspect(id){
  const q=questions.get(id);if(!q)return null;
  const f=families.get(q.answerSource.originalDraftFamily),tid=f.id+"-T1";
  const revised=patches.get(tid),v=voiceByTurn.get(tid),eligibility=canonByTurn.get(tid);
  const pose=exceptions.get(id)||poses.get(q.owningArcId)||"neutral";
  if(!["neutral","welcoming","explaining","thoughtful","grave"].includes(pose))refuse("unknown portrait");
  return Object.freeze({id,arc:q.owningArcId,visitor:Object.freeze({...f.turns[0].question}),
   answer:Object.freeze({...f.turns[0].response}),
   originalWitness:f.source.url,editorialLocator:id,originalPrintedQuestionNumber:false,
   sourceLabel:"Compendio della dottrina cristiana · 1905 · editorial locator "+id,
   pose,reviewOnly:true,published:false,
   next:Object.freeze(q.menu.map(e=>Object.freeze({id:e.sourceQuestionId,en:e.labelEN,fr:e.labelFR}))),
   related:Object.freeze(chapters.get(q.owningArcId).crossChapterOptions.map(e=>Object.freeze({id:e.sourceQuestionId,en:e.labelEN,fr:e.labelFR}))),
   period:v?.channel==="PIUS_X_EDUCATIONAL_RECONSTRUCTION_UNAPPROVED"?Object.freeze({...v.candidate}):null,
   editorialNote:v?.channel==="OUT_OF_CHARACTER_EDITORIAL_HISTORICAL_NOTE"?Object.freeze({...v.candidate}):null,
   correction:revised?Object.freeze({...revised.revisionCandidate}):null,
   chanoine:eligibility?Object.freeze({status:eligibility.status,sourceOwner:eligibility.availableOwnerAnswerId,approvedHandoff:false}):null
  });
 }
 return Object.freeze({version:PIUS_20_REVIEW_VERSION,sourceCommit:PIUS_20_REVIEW_PIN,published:false,
  reviewOnly:true,chapters:Object.freeze(displayChapters),inspect,
  status:()=>Object.freeze({chapters:20,questions:100,originalDraftTurns:200,approvedCharacterAnswers:0,
    source:"PR1458_PINNED_READ_ONLY",denzingerRequired:false})});
}
