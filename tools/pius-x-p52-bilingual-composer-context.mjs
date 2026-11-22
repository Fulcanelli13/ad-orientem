/**
 * P2.52 — isolated, manually curated LANGUAGE ASSISTANCE for composer only.
 * The 1903 papal Latin original remains the source. These French lines merely
 * translate existing English narrow-claim readingNotes to aid small models.
 * They are NOT quotations, certified translations, or additional evidence.
 * The verifier retains its ORIGINAL untouched source-only evidence argument.
 *
 * This profile is PILOT-01 ONLY, opt-in from a research driver until observed
 * real-model behavior warrants expanding it. No P6 or source-owning mutation.
 */
import assert from 'node:assert/strict';

export const SPX_P52_PROFILE='P52_FR_UNAPPROVED_GLOSS_AID';

const frGloss=new Map([
 ['ES-INTRO-TEARS','Il témoigne avoir essayé, par des larmes et des prières, d’écarter la charge pontificale.'],
 ['ES-2-UNWORTHY','Il reconnaît sa propre indignité devant le pontificat.'],
 ['ES-2-PREDECESSOR','Il évoque la difficulté de succéder à un prédécesseur éminent; celui-ci n’est pas nommé dans ce passage.'],
 ['ES-3-FEAR','Il reconnaît sa faiblesse face aux difficultés que traverse la société.'],
 ['ES-4-STRENGTH','Il cherche dans le secours de Dieu la force nécessaire pour accepter la charge.'],
 ['ES-4-MOTTO','Il déclare que son pontificat a pour but de tout restaurer dans le Christ.'],
 ['ES-8-CHRIST','Il veut conduire les hommes au Christ et, par Lui, à Dieu; cette affirmation appartient au paragraphe 8.']
]);
export function makeP52ComposerContext(chosen,voiceMode){
 if(chosen?.status!=='eligible'||!['en','fr'].includes(chosen.language)||
    !Array.isArray(chosen.evidence)||!chosen.evidence.length)
  throw new Error('No original-scoped composer evidence');
 const isPilot=chosen.chapterId==='SPX-PILOT-01';
 const active=chosen.language==='fr'&&isPilot;
 const evidence=chosen.evidence.map(e=>{
  // Keep the original-Latin witness IDs, spelling, official source links and
  // exact excerpt in place. Transform only assistant-facing editorial notes.
  const originals=e.originalLanguageWitnesses||[];
  if(!active)return e;
  if(!originals.length||originals.some(w=>w.originalLanguage!=='la'||
     w.speaker!=='PIUS_X_AUTHOR'||!frGloss.has(w.id)))
   throw new Error('P2.52 research gloss missing or wrong speaker');
  const witnesses=originals.map(w=>({...w,readingNote:frGloss.get(w.id)}));
  return {...e,text:witnesses.map(w=>w.readingNote).join(' '),
   originalLanguageWitnesses:witnesses,
   originalLatinWitnesses:(e.originalLatinWitnesses||[]).map(w=>({
    ...w,readingNote:frGloss.get(w.id)
   })),
   originalResearchNotesStatus:'UNAPPROVED_FR_EDITORIAL_LANGUAGE_AID_NOT_PRIMARY_EVIDENCE'};
 });
 const lang=chosen.language==='fr'?'français':'English';
 return {
  task:'RESPOND_TO_VISITOR_WITH_GROUNDED_PROSE_NOT_NOTES',
  requiredOutputLanguage:chosen.language,
  requiredOutputLanguageName:lang,
  outputTextRules:chosen.language==='fr'?
   'Répondez en français, en une ou deux phrases complètes, sans listes ni points-virgules. Les notes servent à comprendre le latin; ce ne sont pas des phrases à recopier.':
   'Reply in one or two complete English sentences. Do not list or copy editorial glosses.',
  historicalAttribution:'Original Latin/Italian snippets are the only primary evidence; attributed other-speaker passages are NOT autobiographical papal speech.',
  sourceNoteLimit:'Glosses are unpublished research paraphrases, not facts beyond their cited original Latin excerpts.',
  voiceMode,
  chapterId:chosen.chapterId,
  question:chosen.question,
  language:chosen.language,
  evidence,
  history:chosen.history,
  editorialLanguageAidUsed:active,
  publishingApproved:false
 };
}
export function assertP52PilotSourceCoverage(store){
 const annex=store.primaryWitnessAnnexes.get('SPX-PILOT-01');
 assert(annex);
 const ids=new Set(annex.sourceWitnesses
  .filter(w=>w.speaker==='PIUS_X_AUTHOR')
  .map(w=>w.id));
 assert.equal(ids.size,7);
 assert.equal(frGloss.size,7);
 assert.deepEqual([...frGloss.keys()].sort(),[...ids].sort());
 return true;
}
