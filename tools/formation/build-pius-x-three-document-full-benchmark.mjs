import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('../..',import.meta.url)));
const read=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const research='data/learn/research/';
const baseline=await read(research+'pius-x-document-first-three-benchmark-source-map-20261021.v1.json');
const a=await read(research+'pius-x-document-first-remaining-acerbo-esupremi-20261021.v1.json');
const h=await read(research+'pius-x-document-first-remaining-haerent-20261021.v1.json');
const editorial=await read(research+'pius-x-document-first-34-editorial-corrections-20261021.v1.json');
assert.equal(editorial.schema,'AO_SPX_DOCUMENT_FIRST_34_EDITORIAL_CORRECTIONS_V1');
assert.equal(editorial.status,'SOURCE_TETHERED_EDITORIAL_PROPOSALS_UNAPPROVED');
assert.equal(baseline.scenes.length,3);
assert.equal(a.records.length,13);
assert.equal(h.records.length,9);
const claimCatalogue=structuredClone(baseline.primaryClaimCatalogue);
for(const [id,c] of [...Object.entries(a.claims),...Object.entries(h.claims)]){
 assert(!claimCatalogue[id],id+' duplicate');
 claimCatalogue[id]=c;
}
const allNew=[...a.records,...h.records];
const byId=new Map(baseline.scenes.flatMap(s=>s.turns).concat(allNew).map(t=>[t.id,structuredClone(t)]));
assert.equal(byId.size,34);
const exceptions=[];
const acerbo4=byId.get('SPX.BENCH.ACERBO.T4');
assert.equal(acerbo4.segments.length,3);
acerbo4.segments=acerbo4.segments.slice(0,2);
acerbo4.sourceLoci=['§13'];
exceptions.push({id:acerbo4.id,type:'RESTORE_SOURCE_ORDER',description:'Earlier §13 answer also jumped to §26. Retain §13 and move simplicity of instruction to separate §25–26 turn.'});
const haerent4=byId.get('SPX.BENCH.HAERENT.T4');
assert.equal(haerent4.segments.length,3);
haerent4.segments=haerent4.segments.slice(0,1);
haerent4.segments.push({id:haerent4.id+'.S4',claimIds:['H16'],kind:'SOURCE_BOUNDED_ADAPTATION',
 en:'We also warned that a priest could recite his appointed prayers merely from habit, without giving the rest of his day to conversation with God.',
 fr:'Nous avertissions aussi qu’un prêtre pouvait réciter les prières prescrites par habitude, sans consacrer le reste de la journée à s’entretenir avec Dieu.',
 secondaryAuthority:null});
haerent4.sourceLoci=['§13','§14'];
exceptions.push({id:haerent4.id,type:'RESTORE_SOURCE_ORDER',description:'Earlier reply conflated §§13, 15–18 and 20–21. Keep prayer in §§13–14; move meditation and St Charles counsel to separate turns.'});
// Correct only the generated derivative. The 12-turn baseline and the 22 new
// owner records remain unchanged and can be compared with this audited overlay.
for(const [id,change] of Object.entries(editorial.claimMeaningOverrides)){
 assert(claimCatalogue[id],'unknown editorial claim '+id);
 assert.equal(claimCatalogue[id].meaning,change.old,'source claim changed upstream '+id);
 claimCatalogue[id].meaning=change.new;
}
const appliedEditorial=[];
for(const edit of editorial.edits){
 const turn=byId.get(edit.turnId);
 assert(turn,'unknown editorial turn '+edit.turnId);
 const segment=turn.segments.find(x=>x.id===edit.segmentId);
 assert(segment,'unknown editorial segment '+edit.segmentId);
 assert.equal(segment.en,edit.before.en,'upstream EN changed '+edit.segmentId);
 assert.equal(segment.fr,edit.before.fr,'upstream FR changed '+edit.segmentId);
 assert(segment.claimIds.some(id=>claimCatalogue[id]?.locus===edit.sourceLocus),'editorial source locus mismatch '+edit.segmentId);
 segment.en=edit.after.en;
 segment.fr=edit.after.fr;
 appliedEditorial.push({turnId:edit.turnId,segmentId:edit.segmentId,sourceLocus:edit.sourceLocus,reason:edit.reason});
}
assert.equal(appliedEditorial.length,4);
assert(new Set(appliedEditorial.map(e=>e.segmentId)).size===4);
const sequences={
 ACERBO:{core:['T1','T2','T5','T6','T3','T4','T7','T8','T9','T10'],optional:['T11'],branchAnchor:{T11:'T7'}},
 ESUPREMI:{core:['T1','T5','T2','T3','T6','T7','T4','T8','T9'],optional:['T10'],branchAnchor:{T10:'T1'}},
 HAERENT:{core:['T1','T5','T2','T3','T6','T4','T7','T8','T9','T10','T11'],optional:['T12','T13'],branchAnchor:{T12:'T7',T13:'T11'}}
};
const scenes=baseline.scenes.map(s=>{
 const seq=sequences[s.sourceId];const prefix=s.id+'.';
 const ids=[...seq.core,...seq.optional].map(x=>prefix+x);
 assert.equal(new Set(ids).size,ids.length);
 const turns=ids.map((id,i)=>{
  const t=byId.get(id);assert(t,'missing '+id);
  const out={...t,sourceId:s.sourceId,speechMode:'ADAPTED_PAPAL_VOICE_NOT_HISTORICAL_QUOTE',
   speaker:'PIUS_X_CONVERSATIONAL_SOURCE_ADAPTATION',
   documentNamedInSpeech:t.documentNamedInSpeech??(i===0),originalAddressee:baseline.sources[s.sourceId].originalAudience,
   visitorAddressee:'lay reader',grammaticalShift:'HISTORICAL_RETROSPECTIVE',
   sourceUrls:baseline.sources[s.sourceId].comparisons,
   choiceType:seq.optional.includes(id.slice(prefix.length))?'OPTIONAL_BRANCH':'CORE',
   parentChoiceTurn:seq.branchAnchor[id.slice(prefix.length)]?prefix+seq.branchAnchor[id.slice(prefix.length)]:null,
   review:{claimToLocus:'INTERNAL_PRELIMINARY_PASS',english:false,french:false,context:false,authority:false,final:false}};
  out.sourceLoci=[...new Set(out.segments.flatMap(x=>x.claimIds.map(c=>claimCatalogue[c]?.locus)))];
  assert(out.sourceLoci.every(Boolean),'claim locus '+id);
  assert(out.segments.every(x=>x.kind==='SOURCE_BOUNDED_ADAPTATION'));
  if(!out.segments.length)throw Error('no segments '+id);
  return out;
 });
 return {...s,turns,coreTurnIds:seq.core.map(x=>prefix+x),optionalTurnIds:seq.optional.map(x=>prefix+x),sourceOrderPreservedInCore:true,
  editorialNote:'Core sequence follows source argument; optional branches may refer to passages outside the main route. Original long draft was not a historical transcript.'};
});
const result={
 schema:'AO_SPX_DOCUMENT_FIRST_THREE_COMPLETE_BENCHMARKS_V2',
 date:'2026-10-21',status:'UNAPPROVED_COMPLETE_34_TURN_BILINGUAL_CLAIM_MAP',
 sourceInputs:[
 research+'pius-x-document-first-three-benchmark-source-map-20261021.v1.json',
 research+'pius-x-document-first-remaining-acerbo-esupremi-20261021.v1.json',
 research+'pius-x-document-first-remaining-haerent-20261021.v1.json',
 research+'pius-x-document-first-34-editorial-corrections-20261021.v1.json'],
 evidenceAuthority:'Primary passage / proposition matching is an internal editorial screen, not independent historical or theological certification.',
 method:baseline.method,sources:baseline.sources,claims:claimCatalogue,
 counts:{documents:3,exchanges:scenes.reduce((n,s)=>n+s.turns.length,0),
 core:scenes.reduce((n,s)=>n+s.coreTurnIds.length,0),
 optional:scenes.reduce((n,s)=>n+s.optionalTurnIds.length,0),
 segments:scenes.reduce((n,s)=>n+s.turns.reduce((m,t)=>m+t.segments.length,0),0),
 bilingualLocalizedAnswers:scenes.reduce((n,s)=>n+s.turns.length*2,0),
 canonicalOwnerMutations:0,published:0},
 exceptions,editorialCorrections:appliedEditorial,
 reviewGates:structuredClone(baseline.approvals),
 scenes};
assert.equal(result.counts.exchanges,34);
assert.equal(result.counts.core,30);
assert.equal(result.counts.optional,4);
assert.equal(result.counts.bilingualLocalizedAnswers,68);
for(const v of Object.values(result.reviewGates))assert(v===false);
const out='artifacts/pius-x-complete-corpus/';
await mkdir(resolve(root,out),{recursive:true});
await writeFile(resolve(root,out+'SPX_Three_Document_Full_34_Turn_Claim_Map.json'),JSON.stringify(result,null,2)+'\n');
const markdown=[
'# St Pius X — complete 34-exchange source-first bilingual editorial review',
'',
'**Unapproved adaptation.** This is NOT a historic transcript, independently verified translation, or release-authorized app content. Dialogue may adjust voice and audience without inventing a conclusion. Each substantive sentence is tied to an underlying claim and source.',
'',
'Core: '+result.counts.core+' exchanges; optional: '+result.counts.optional+'; source-bound speech segments: '+result.counts.segments+'.',
''];
for(const sc of scenes){
 const src=result.sources[sc.sourceId];
 markdown.push('## '+src.title,'','Original audience: '+src.originalAudience+'. <'+Object.values(src.comparisons)[0]+'>','');
 for(const t of sc.turns){
  markdown.push('### '+(t.choiceType==='OPTIONAL_BRANCH'?'Optional branch — ':'')+t.visitor.en,
   '','**Visitor (EN):** '+t.visitor.en,'','**Pius X (EN, adapted):** '+t.segments.map(x=>x.en).join(' '),
   '','**Visiteur (FR) :** '+t.visitor.fr,'','**Pie X (FR, adaptation) :** '+t.segments.map(x=>x.fr).join(' '),'',
   '**Reference:** *'+src.title+'*, '+t.sourceLoci.join(', ')+'. '+Object.entries(src.comparisons).map(([l,u])=>l.toUpperCase()+': '+u).join(' | '),'',
   '**Per-segment claim anchors:**');
  for(const segment of t.segments){
   const refs=segment.claimIds.map(id=>id+' ('+result.claims[id].locus+')').join(', ');
   markdown.push('- '+refs+(segment.secondaryAuthority?' — earlier authority: '+segment.secondaryAuthority:''));
  }
  if(t.editorialQualification)markdown.push('','**Out-of-character qualification:** '+t.editorialQualification);
  markdown.push('','**Editorial approval:** pending source, context, EN, FR, voice, theological and production review.','');
 }
}
markdown.push('## Source-order corrections',
  ...result.exceptions.map(x=>'- '+x.id+': '+x.description),
  '','## Four source-tethered editorial corrections',
  ...appliedEditorial.map(x=>'- '+x.segmentId+' ('+x.sourceLocus+'): '+x.reason),
  '','Do not publish without independent passage-level bilingual and theological review.','');
await writeFile(resolve(root,out+'SPX_Three_Document_Full_34_EN_FR_Review.md'),markdown.join('\n')+'\n');
const summary={counts:result.counts,byDocument:scenes.map(s=>({doc:s.sourceId,core:s.coreTurnIds.length,optional:s.optionalTurnIds.length,segments:s.turns.reduce((n,t)=>n+t.segments.length,0)})),exceptions,editorialCorrections:appliedEditorial};
console.log('SPX_FULL_BENCHMARK '+JSON.stringify(summary));
