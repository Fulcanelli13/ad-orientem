import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const read=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const research='data/learn/research/';
const output='artifacts/pius-x-complete-corpus/';
const shortlist=await read(output+'SPX_Balanced_130_Release_Candidates.json');
const old=await read(research+'pius-x-82chapter-dialogue-authoring-index-20261021.v1.json');
const deeper=await read(research+'pius-x-12chapter-dependent-dialogue-flow-20261021.v1.json');
const v2=await read('previews/pius-x-three-voice-source-tethered-v2-20261021.json');
assert.equal(shortlist.schema,'AO_SPX_BALANCED_130_FIRST_RELEASE_CANDIDATE_SELECTION_V1');
assert.equal(shortlist.actual,130);
const original=new Set([...old.priorChapters,...old.newChapters.map(x=>x.id)]);
assert.equal(original.size,82);
const haveDepth=new Set(deeper.chapters.map(x=>x.chapterId));
const revised=new Set(v2.candidates.map(x=>x.chapterId));
const entries=shortlist.candidates.map((c,i)=>({
 rank:i+1,id:c.id,category:c.category,sourceOwner:c.ownerFile,
 question:c.topic,source:c.source,
 originalChapterAuthored:original.has(c.id),
 multiTurnDepthAvailable:haveDepth.has(c.id),
 sourceTetheredVoiceV2:revised.has(c.id),
 releaseGates:c.approval,screeningFlags:c.screeningFlags||[]
}));
assert.equal(new Set(entries.map(x=>x.id)).size,130);
const matches=entries.filter(x=>x.originalChapterAuthored);
const CATEGORY_WEIGHT={
 PAPAL_TEACHING_AND_PASTORAL:8,PRAYER_AND_SPIRITUAL_LIFE:10,
 SACRAMENTS_AND_MASS:9,MORAL_LIFE_AND_VIRTUES:8,
 PERSONAL_HISTORY:4,FAITH_AND_CREED:6,FEASTS_AND_LITURGY:7,DEATH_AND_LAST_THINGS:6
};
const score=x=>(CATEGORY_WEIGHT[x.category]||0)+(x.multiTurnDepthAvailable?6:0)
 +(x.source.url?.includes('vatican.va')?5:0)
 +(x.source.url?.includes('museosanpiox.it')?3:0)
 +(/PRIMARY_DIRECT|DIRECT_PASSAGE_ANCHOR|DIRECT_PASSAGE_SUPPORT/.test(x.source.provenance||'')?4:0)
 -(x.screeningFlags.includes('BIOGRAPHY_FACTS_NOT_PAPAL_TESTIMONY')?9:0)
 -(x.screeningFlags.includes('HISTORICAL_DISCIPLINE_CONTEXT_SCREEN')?2:0);
const queue=matches.filter(x=>!x.sourceTetheredVoiceV2).map(x=>({...x,voiceReviewPriority:score(x)}))
 .sort((a,b)=>b.voiceReviewPriority-a.voiceReviewPriority||a.rank-b.rank||a.id.localeCompare(b.id));
const summary={
 schema:'AO_SPX_RELEASE130_VS_AUTHORED82_EDITORIAL_RECONCILIATION_V1',
 asOf:'2026-10-21',
 status:'RESEARCH_PRIORITY_INVENTORY_NOT_RELEASE_APPROVAL',
 selectors:{canonical:'tools/formation/build-pius-x-810-corpus-release-selection.mjs',sourceShortlist:output+'SPX_Balanced_130_Release_Candidates.json',authoring:research+'pius-x-82chapter-dialogue-authoring-index-20261021.v1.json'},
 counts:{originalFamilies:810,selected:130,authoredChapters:82,firstReleaseCandidatesAlreadyAuthored:matches.length,
 firstReleaseCandidatesAwaitingAuthoring:130-matches.length,existingSourceTetheredVoiceV2:entries.filter(x=>x.sourceTetheredVoiceV2).length,
 selectedDepthAvailable:entries.filter(x=>x.multiTurnDepthAvailable).length,first24Queue:Math.min(queue.length,24)},
 reviewQueue:queue.slice(0,24),allReleaseCandidates:entries,
 note:'Same topic across record IDs may have overlapping intent; this does not approve uniqueness or historical authenticity. Zero changed original Q&A records.'
};
await mkdir(resolve(root,output),{recursive:true});
await writeFile(resolve(root,output+'SPX_130_vs_82_Editorial_Review_Queue.json'),JSON.stringify(summary,null,2)+'\n');
console.log('SPX_RELEASE_QUEUE '+JSON.stringify({counts:summary.counts,first24:summary.reviewQueue.map(x=>({id:x.id,rank:x.rank,priority:x.voiceReviewPriority,question:x.question.en,locus:x.source.locator,url:x.source.url,owner:x.sourceOwner,category:x.category}))}));
