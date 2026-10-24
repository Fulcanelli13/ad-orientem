/**
 * P1.45: ensure stable human-facing 39-case dossier contains exact source-owner
 * EN/FR wording, P40 proposed replacements, P44 print page links and explicit
 * "pending" status. Passing checks do NOT approve a candidate.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const root='previews/pius-x-study/';
const p40=read(root+'evidence/pius-x-p40-65-answer-second-pass-20261024.v1.json');
const p39=read(root+'evidence/pius-x-p39-bilingual29-and-specialist36-20261024.v1.json');
const p44=read(root+'evidence/pius-x-p44-39-print-scan-page-index-20261024.v1.json');
const triage=read('data/learn/research/pius-x-100answer-editorial-release-triage-20261020.v1.json');
const packet=readFileSync(root+'review/pius-x-p45-specialist-39-review-packet-20261024.md','utf8');
const outreach=readFileSync(root+'review/pius-x-p45-unsent-expert-outreach-drafts-20261024.md','utf8');
const records=[
 ...p40.p39SecondPass29.map(z=>({sourceQid:z.sourceQid,en:z.finalResearchCandidateEN,fr:z.finalResearchCandidateFR})),
 ...p40.newlyFlaggedFromPreviouslyAligned36.map(z=>({sourceQid:z.sourceQid,en:z.finalResearchCandidateEN,fr:z.finalResearchCandidateFR}))
];
assert.equal(records.length,39);
assert.equal(p44.records.length,39);
assert.equal(new Set(records.map(z=>z.sourceQid)).size,39);
const old=new Map(triage.records.map(z=>[z.id,z]));
const pages=new Map(p44.records.map(z=>[z.sourceQid,z]));
const oldFindings=new Map(p39.corrections.map(z=>[z.sourceQid,z.sourceReviewFinding.replace(/\r?\n/g,' ')]));
const technical=new Set(['PX1905-Q611','PX1905-Q613','PX1905-Q657']);
const historical=new Set(['PX1905-Q574','PX1905-Q577','PX1905-Q584','PX1905-Q594']);
let t=0,h=0,l=0;
const escaped=t=>t.replace(/\|/g,'\\|');
for(const c of records){
 const prev=old.get(c.sourceQid),page=pages.get(c.sourceQid);
 assert(prev&&page);
 assert.equal(prev.published,false);
 assert(Object.values(prev.approval).every(x=>x==='NOT_SIGNED_OFF'));
 assert(packet.includes('### '+c.sourceQid+' — '+prev.questionEN),'Missing case entry '+c.sourceQid);
 if(oldFindings.has(c.sourceQid))assert(packet.includes(oldFindings.get(c.sourceQid)), 'Missing case-specific original finding '+c.sourceQid);
 for(const wording of [prev.originalDraftEN,prev.originalDraftFR,c.en,c.fr]){
   assert(packet.includes(escaped(wording)),'Missing/altered old/new bilingual text for '+c.sourceQid);
 }
 for(const link of page.pageLinks)assert(packet.includes(link),'Missing actual 1905 printed page URL for '+c.sourceQid);
 if(technical.has(c.sourceQid))t++;
 else if(historical.has(c.sourceQid))h++;
 else l++;
}
assert.deepEqual([t,h,l],[3,4,32]);
assert.equal((packet.match(/^### PX1905-Q\d+/gm)||[]).length,39);
assert(packet.includes('**Status: REQUEST FOR QUALIFIED HUMAN REVIEW — NO REVIEWS COMPLETED.**'));
assert(packet.includes('**Reviewer decision:** PENDING.'));
assert(packet.includes('**0** publication approvals'));
assert(packet.includes('423 established avatar dialogues'));
assert(outreach.includes('**Status:** Three optional messages drafted, **none sent**.'));
assert(outreach.includes('no paid work is authorized by this inquiry'));
console.log('PASS P45_REVIEW_HANDOFF_LOCK '+JSON.stringify({cases:39,technical:t,historical:h,bilingual:l,approved:0,contacted:0,changed:0}));
