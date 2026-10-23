import assert from 'node:assert/strict';
import {loadPrimaryWitnessAnnexes} from '../tools/pius-x-generative-review.mjs';
import {canonicalSourceText,auditWitnessPages,fetchOfficialWitnessPages} from '../tools/pius-x-audit-primary-witnesses.mjs';

// Independently transcribed Vatican context excerpts, not assembled from witness IDs.
// Source: official Vatican original-language pages checked 23 October 2026.
// These are deliberately short source windows, not complete source documents.
const vaticanWindows=new Map([
 ['SPX-PILOT-01',[
 'E supremi apostolatus cathedra, ad quam, consilio Dei inscrutabili, evecti fuimus, vobis primum eloquuturos, nihil attinet commemorare quibus Nos lacrymis magnisque precibus formidolosum hoc pontificatus onus depellere a Nobis conati simus.',
 'Etenim quae ille moeroris indicia pro se afferebat, eadem et Nobis proferre licet, ut ostendamus quo animo, qua voluntate Christi gregis pascendi gravissimum officii munus exceperimus. Testantur, sic ille [1], lacrymae meae et voces et ragitus a gemiti cordis mei.',
 'Praeterquam enim quod honore pontificatus, ob tenuitatem Nostram, nullo pacto Nos dignaremur; quem non moveret ei se successorem designari, qui, cum ecclesiam sex fere ac viginti annos sapientissime rexisset.',
 'Tanto igitur malo, pro pontificali munere quod demandabatur, occurrendum esse Nobis videbamus: verum conscii Nobis infirmitatis Nostrae, negotium, quod nihil simul haberet morae et difficultatis plurimum, suscipere verebamur.',
 'Attamen, quoniam numini divino placuit humilitatem Nostram ad hanc amplitudinem potestatis provehere; erigimus animum in eo qui Nos confortat, Deique virtute freti manum operi admoventes, in gerendo pontificatu hoc unum declaramus propositum esse Nobis instaurare omnia in Christo.',
 'Huc igitur curas intendamus oportet, ut genus hominum in Christi ditionem redigamus: eo praestito, iam ad ipsum Deum remigraverit.'
 ].join(' ')],
 ['SPX-029',[
 'Di leggieri si riconosce la necessità del concorso individuale a tant’opera, non solo per la santificazione delle anime nostre, ma anche per diffondere e sempre meglio dilatare il Regno di Dio negli individui, nelle famiglie e nella società, procurando ciascuno, secondo le proprie forze, il bene del prossimo con la diffusione della verità rivelata, con l’esercizio delle virtù cristiane e con le opere di carità o di misericordia spirituale e corporale.'
 ].join(' ')],
 ['SPX-NEW-012',[
 'Quamobrem, ne Christifideles et quotquot ex sic dictis Mariavitis sacerdotibus in bona fide perstiterunt, ludificationibus memoratae mulieris ac sacerdotis Ioannis Kowalski diutius decipiantur, decretum iterum confirmamus, quo Mariavitarum consociatio, illegitimo irritoque consilio inita, omnino supprimitur, eamque suppressam reprobatamque declaramus.',
 'Vos autem, Venerabiles Fratres, vehementer hortamur, ut sacerdotes errantes, statim ac sincere resipuerint, paterna charitate amplectamini, eosque rite probatos ad munia sacerdotalia, ductu vestro, denuo obeunda vocare non renuatis.',
 'Christi vero fideles, nunc ignoscenda ludificatione deceptos, in rectam reducere viam studeatis; atque in dioecesibus vestris christianae pietatis exercitia, multiplicibus Sedis Apostolicae documentis iamdiu recenterque comprobata.'
 ].join(' ')],
 ['SPX-PILOT-09',[
 'Illud in hac parte caput est, ut aeternarum rerum meditationi certum aliquod spatium quotidie concedatur. Nemo est sacerdos qui possit hòc sine gravi incuriae nota et animae detrimento praetermittere.',
 'In his autem ipsis, qui recogitare corde (Ger 12, 11) gravantur vel negligunt, non desunt sane qui consequentem animi sui egestatem non dissimulent, excusentque, id causae obtendentes, se totos agitationi ministerii dedidisse, in multiplicem aliorum utilitatem. Verum falluntur misere.',
 'Nec enim assueti cum Deo colloqui, quum de eo ad homines dicunt vel consilia christianae vitae impertiunt, prorsus carent divino afflatu.'
 ].join(' ')]
]);
const annexes=loadPrimaryWitnessAnnexes();
assert.equal(annexes.size,4);
const count=[...annexes.values()].reduce((n,a)=>n+a.sourceWitnesses.length,0);
assert.equal(count,23);
const checkedLines=[];
for(const a of annexes.values())for(const w of a.sourceWitnesses){
 assert.equal(w.webTextVerification?.status,'MATCHED_ORIGINAL_LANGUAGE_VATICAN_PAGE_TEXT');
 assert.equal(w.webTextVerification.checkedOn,'2026-10-23');
 assert(Number.isInteger(w.webTextVerification.sourcePageLine));
 checkedLines.push(w.webTextVerification.sourcePageLine);
}
assert(checkedLines.every(l=>l>0));
const exact=auditWitnessPages(annexes,vaticanWindows);
assert.equal(exact.status,'ALL_EXACT_SUBSTRINGS_PRESENT');
assert.equal(exact.documentCount,4);
assert.equal(exact.anchorsChecked,23);
assert.equal(exact.matched,23);
assert.equal(exact.unmatched,0);
assert.equal(exact.publishingApproved,false);
assert.equal(exact.originalSourceTextFullyCollated,false);
assert.equal(exact.claimLevelInterpretationApproved,false);
assert.equal(exact.translationsApproved,false);
const anselm=annexes.get('SPX-PILOT-01').sourceWitnesses.find(x=>x.id==='ES-INTRO-ANSELM');
assert.equal(anselm.latin,'Testantur, sic ille');
assert(anselm.footnoteCaveat.includes('citation marker'));
assert.equal(anselm.speaker,'ANSELM_QUOTED_BY_PIUS_X');

const corrupted=new Map(vaticanWindows);
corrupted.set('SPX-NEW-012',corrupted.get('SPX-NEW-012').replace('sincere resipuerint','sincere RESIPUERUNT'));
const fail=auditWitnessPages(annexes,corrupted);
assert.equal(fail.status,'INCOMPLETE_DO_NOT_USE_AS_VALIDATED');
assert.equal(fail.unmatched,1);
assert.equal(fail.details.find(x=>x.witnessId==='TC-REPENT').status,'NOT_CONFIRMED_OR_MISSING');
const missing=new Map(vaticanWindows);missing.delete('SPX-029');
assert.equal(auditWitnessPages(annexes,missing).unmatched,4);
assert.equal(canonicalSourceText('<p>vita&nbsp;<b>christiana</b></p>'),'vita christiana');

const seen=[];
const pages=await fetchOfficialWitnessPages(annexes,{fetchImpl:async (url)=>{
 seen.push(url);
 const chapter=[...annexes.values()].find(x=>(x.document.sites.original||x.document.sites.la)===url).chapterId;
 return {ok:true,url,headers:new Headers({'content-type':'text/html; charset=UTF-8'}),text:async()=>'<p>'+vaticanWindows.get(chapter)+'</p>'};
}});
assert.equal(seen.length,4);
assert.equal(auditWitnessPages(annexes,pages).matched,23);
await assert.rejects(fetchOfficialWitnessPages(annexes,{fetchImpl:async()=>({
 ok:true,url:'https://example.com/poisoned',headers:new Headers({'content-type':'text/html'}),text:async()=>''})}),/Untrusted source redirect/);

console.log('PASS SPX_ORIGINAL_WEBTEXT_AUDIT: 4 independent original-language source windows, 23/23 exact fragments, altered/missing text rejected, network optional and mocked in CI');
