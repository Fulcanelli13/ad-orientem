/**
 * P2.51 — fail-closed, deterministic, superficial draft sanity filter.
 * This does NOT certify theology, language quality, translation or history.
 * It blocks obvious defects actually observed in the Qwen2.5 3B P2.50 run:
 * English output for a French question, ellipsis-led research fragments,
 * and collections of pasted original-witness readingNotes.
 *
 * This runs BEFORE the separately proposed source verifier, on the
 * private unpublished SPX composer path only.
 */
const lower=s=>String(s||'').normalize('NFD').replace(/\p{M}/gu,'')
 .toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
const words=s=>lower(s).split(' ').filter(Boolean);
const french=new Set([
 'le','la','les','des','de','du','une','un','nous','vous','votre','notre','leurs',
 'leur','pour','avec','dans','sans','est','sont','etait','etaient','cette',
 'ceux','celui','ces','cette','mais','par','sur','ses','son','que','qui','quand',
 'avait','avoir','ont','et','aux','au','elle','elles','il','ils','fut',
 'ne','pas','plus','alors','comme','vers','ainsi','afin','dieu','puis',
 'seigneur','evangile','eglise','pretre','pontificat','charite','fidele',
 'fideles','tache','charge','priere','confiance','faiblesse','oeuvre'
]);
const english=new Set([
 'the','with','his','her','and','its','from','of','to','for','that','this',
 'which','these','those','were','was','has','had','under','him','he','she',
 'we','they','our','their','when','would','could','without','through',
 'while','became','being','such','upon','after','before','nor','however',
 'weakness','predecessor','election','prayer','burden','strength','purpose'
]);
function confidence(s){
 const ws=words(s);
 const count=set=>ws.reduce((n,w)=>n+(set.has(w)?1:0),0);
 return {fr:count(french),en:count(english)};
}
export function auditDraftSurface({text,language,evidence=[],question='',
 voiceMode='documentary',experimentalComposerProfile=null}={}){
 if(!['en','fr'].includes(language)||typeof text!=='string')
  return {ok:false,reason:'invalid_draft_surface_request'};
 const plain=text.trim();
 // A P53-only stricter hold following actual 3B research output. A first-
 // person papal reconstruction must never be returned under documentary mode.
 // Historical editorial mode is separately labelled and still source-gated.
 if(experimentalComposerProfile==='P53_ATOMIC_CLAIM_CUES'){
  if(question&&lower(plain).startsWith(lower(question))&&
     lower(question).length>=16)
   return {ok:false,reason:'visitor_question_echoed_as_answer'};
  if(/\b(?:encyclop[eé]die|encyclopedia)\s+(?:de|of)\s+(?:Pius|Pie)\b/iu.test(plain))
   return {ok:false,reason:'invented_secondary_source_reference'};
  if(voiceMode==='documentary'&&(
    /\b(?:I|my|mine|we|our|ours)\b/u.test(plain)||
    /\b(?:je|j['’]|moi|mon|ma|mes|nous|notre|nos)\b/iu.test(plain)
   ))return {ok:false,reason:'first_person_roleplay_in_documentary_mode'};
 }
 if(/^\s*(?:\.\.\.|…|[-–—]\s|[;:,])/.test(plain)||
    /(?:predecessor is not named in this sentence|declared declared|as stated in §)/i.test(plain))
  return {ok:false,reason:'fragmentary_editorial_reply'};
 const lang=confidence(plain);
 // A deliberately conservative surface heuristic. Some good French prose may
 // be held; that is preferable to shipping English as if it were French.
 // It does not judge nuanced bilingual quotations or regional differences.
 if(language==='fr'&&(lang.fr<3||(lang.en>=3&&lang.en>lang.fr*0.6)))
  return {ok:false,reason:'reply_not_in_selected_language'};
 // Editorial metadata (paragraph locators, 'this claim belongs in §8')
 // is not papal dialogue. Explicit scholarly source questions are exempt.
 const sourceQuestion=/\b(?:where\s+in|which\s+(?:section|paragraph)|citez|source|paragraphe|section|dans quel passage|ou se trouve)\b/i.test(
  lower(question));
 if(!sourceQuestion&&/(?:\b(?:paragraph|paragraphe|section)\s*(?:§\s*)?\d+\b|§\s*\d+|(?:cette affirmation|ce passage|this statement|this passage).{0,50}(?:appartient|belongs)|(?:editorial research note|note de recherche éditoriale))/iu.test(plain))
  return {ok:false,reason:'editorial_source_metadata_in_reply'};
 const normalized=lower(plain);
 const notes=evidence.flatMap(e=>e.originalLanguageWitnesses||[])
  .map(w=>lower(w.readingNote)).filter(x=>x.split(' ').length>=5);
 const exactEchoes=[...new Set(notes)].filter(note=>
   normalized.includes(note));
 if(exactEchoes.length>=2)
  return {ok:false,reason:'source_glosses_spliced_as_reply'};
 // Source notes pasted into a semicolon-delimited list are not dialogue, even
 // when a short note in the list is below the minimum echo length.
 if((plain.match(/;/g)||[]).length>=3&&
    plain.split(/[.!?]+/).filter(x=>x.trim()).length<=2)
  return {ok:false,reason:'fragmentary_editorial_reply'};
 return {ok:true,reason:null,surfaceOnly:true,languageScores:lang};
}
