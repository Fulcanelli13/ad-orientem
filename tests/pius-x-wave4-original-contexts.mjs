import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const p='previews/pius-x-study/evidence/pius-x-six-document-wave4-remaining60-20261023.v1.json';
const data=JSON.parse(readFileSync(p,'utf8'));
const normalize=s=>String(s).normalize('NFKC').replace(/\s+/g,' ').trim();
const windows={
 P:[
  'quin immo, subobscure alii, alii apertissime, religiones omnes contendunt esse veras. Secus autem sentire nec posse',
  'Quamobrem poscenti ulterius, an Christus vera patrarit miracula vereque futura praesenserit, an vere revixerit atque in caelum conscenderit',
  'Hinc etiam exegesim theologicam et pastoralem a scientifica et historica secernunt.',
  'Simile quid habemus in poetica inspiratione; quare quidam aiebat: Est Deus in nobis',
  'Si quis dixerit revelationem divinam externis signis credibilem fieri non posse, ideoque sola interna cuiusque experientia'
 ],
 A:[
  'E contra catechetica institutio, humilis quamvis et simplex, verbum illud est, de quo Deus ipse testatur',
  'eget tamen Ecclesiae institutione, ut ea ali augerique possit fructumque ferre.'
 ],
 E:[
  'Peiores forte quam sunt videntur. Consuetudine enim aliorum, praeiudicatis opinionibus',
  'non marte utique quemque suo atque ingenio, verum semper Episcoporum ductu atque nutu; praeesse namque',
  'Parum profecto interest quaestiones multas subtiliter agitari, deque iuribus et officiis eloquenter disseri',
  'in religione libere aperteque profitenda, in omnigenae demum caritatis operibus exercendis, nullo sui aut terrenarum utilitatum respectu'
 ],
 I:[
  'con l’esercizio delle virtù cristiane e con le opere di carità o di misericordia spirituale e corporale.',
  'procurando ciascuno, secondo le proprie forze, il bene del prossimo con la diffusione della verità rivelata',
  'che lo stesso benessere materiale degli individui, della famiglia e della società umana si trova',
  'mentre pure, a seconda dei vari bisogni a cui si applicano, prendono forme diverse e diversi mezzi adoperano'
 ],
 M:[
  'sua prima ed indispensabile fonte, che è la partecipazione attiva ai sacrosanti misteri e alla preghiera pubblica',
  'rivestire con acconcia melodia il testo liturgico che viene proposto all’intelligenza dei fedeli',
  'affinché i fedeli con tale mezzo siano più facilmente eccitati alla devozione e meglio si dispongano'
 ],
 R:[
  'sed etiam quod optabilis illa in orando varietas desideraretur, ad digne, attente, devote precandum',
  'mutatis vero et variatis psalmodia et cantu per singulas horas, renovatur emus desiderium et attentio instauratur',
  'ne recitatione integri Psalterii hebdomadae spatio conclusa, ex una parte quicquam de Sanctorum cultu decederet',
  'ut in recitando Divino Officio Lectionibus statutis sacrae Scripturae cum Responsoriis de tempore occurrentibus debitus honor',
  'Missae antiquissimae de Dominicis infra annum et de Feriis, praesertim quadragesimalibus, locum suum recuperarent'
 ]
};
assert.equal(data.summary.newOriginalVaticanExcerpts,23);
const docIDs=new Set();const witnessIDs=new Set();
for(const w of data.witnesses){
 assert(w.originalText.length>=15);
 assert(!w.translationApproved&&!w.publishingApproved);
 assert(!witnessIDs.has(w.id));witnessIDs.add(w.id);
 assert(w.sourceUrl.startsWith('https://www.vatican.va/content/pius-x/'));
 assert(Number.isInteger(w.sourcePageLine)&&w.sourcePageLine>0);
 assert(windows[w.documentGroup]);
 docIDs.add(w.documentGroup);
 const source=normalize(windows[w.documentGroup].join(' '));
 assert(source.includes(normalize(w.originalText)),
  'Independent Vatican context does not include original text of '+w.id);
 assert(w.verification==='OFFICIAL_VATICAN_EXACT_SHORT_TEXT_NOT_COMPLETE_SOURCE_CERTIFICATION');
}
assert.equal(witnessIDs.size,23);
assert.equal(docIDs.size,6);
assert(data.witnesses.some(w=>w.speaker==='VATICAN_I_QUOTED_BY_PIUS_X'));
assert(data.witnesses.some(w=>w.speaker==='ST_BASIL_QUOTED_BY_PIUS_X'));
assert(data.witnesses.some(w=>w.speaker==='PIUS_X_REPORTS_MODERNIST_VIEW'));
const altered=normalize(windows.P.join(' ').replace('religiones omnes contendunt esse veras',
 'religiones omnes contendunt esse falsas'));
assert(!altered.includes(normalize(data.witnesses.find(w=>w.id==='W4-P-REL').originalText)));
assert.equal(data.summary.newBoundedResearchCandidates+data.summary.newHeldNodes,60);
assert.equal(data.summary.fullAnswerCertifications,0);
assert.equal(data.summary.bilingualTranslationCertifications,0);
assert.equal(data.summary.publishingApprovals,0);
console.log('PASS SPX_WAVE4_ORIGINAL_TEXT: 23 original Latin/Italian short excerpts matched against separately transcribed Vatican context; first-person, reported Modernist, Vatican I and St Basil attributed; zero translation/full-answer/publication approvals');
