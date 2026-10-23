import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readCorpus} from '../tools/pius-x-generative-review.mjs';
import {canonicalSourceText} from '../tools/pius-x-audit-primary-witnesses.mjs';

const p='previews/pius-x-study/evidence/pius-x-next12-eight-opening-context-evidence-20261023.v1.json';
const pack=JSON.parse(readFileSync(p,'utf8'));
const map=JSON.parse(readFileSync(
 'previews/pius-x-study/evidence/pius-x-eight-opening-source-claims-20261023.v1.json','utf8'));
assert.equal(map.schema,'AO_SPX_P2_EIGHT_OPENING_SOURCE_CLAIM_MAP_V1');
assert.equal(map.status,'CLAIM_LEVEL_ORIGINAL_EXCERPT_SUPPORT_ONLY');
assert.equal(map.summary.openingSubjects,8);
assert.equal(map.summary.claimSupportLinks,41);
assert.equal(map.summary.fullAnswersCertified,0);

const batch=JSON.parse(readFileSync('previews/pius-x-study/evidence/pius-x-next12-primary-document-discovery-20261023.v1.json','utf8'));
const store=readCorpus(readFileSync('artifacts/pius-x-study-expanded/SPX_Study_Expanded_106_P6.html','utf8'));
assert.equal(pack.schema,'AO_SPX_P2_NEXT12_EIGHT_OPENING_CONTEXT_EVIDENCE_V1');
assert.equal(pack.status,'PRIVATE_CLAIM_SCOPED_PRIMARY_EVIDENCE_NOT_MODEL_PROMOTED');
assert.equal(pack.summary.documents,8);
assert.equal(pack.summary.openingNodes,8);
assert.equal(pack.summary.exactPhraseWitnesses,41);
assert.equal(pack.summary.newlyApprovedFullDialogues,0);
assert.equal(pack.summary.newModelEvidencePromotions,0);
assert.equal(store.chapters.size,106);
assert.equal(store.data.counts.allNodes,423);
const independentSourceWindows={
 'pascendi-dominici-gregis':[
  'Quia vero modernistarum (sic enim iure vulgus audiunt) callidissimum artificium est, ut doctrinas suas non ordine digestas proponant atque in unum collectas, sed sparsas veluti atque invicem seiunctas',
  'Iam, ut a philosopho exordiamur, philosophiae religiosae fundamentum in doctrina illa modernistae ponunt, quam vulgo agnosticismum vocant. Vi huius humana ratio phaenomenis omnino includitur',
  'Est porro hic sensus quem modernistae fidei nomine appellant, estque illis religionis initium.',
  'Evolvi tamen ac mutari dogma non posse solum sed oportere, et modernistae ipsi perfracte affirmant',
  'Iam systema universum uno quasi obtutu respicientes, nemo mirabitur si sic illud definimus, ut omnium haereseon conlectum esse affirmemus.'
 ],
 'acerbo-nimis':[
  'IV. In omnibus et singulis paroeciis consociatio canonice instituatur, cui vulgo nomen Congregatio Doctrinae christianae. Ea parochi, praesertim ubi sacerdotum numerus sit exiguus, adiutores in catechesi tradenda laicos habebunt, qui se huic dedent magisterio tum studio gloriae Dei',
  'V. Maioribus in urbibus, inque iis praecipue ubi universitates studiorum, lycea, gymnasia patent, scholae religionis fundentur ad erudiendam fidei veritatibus vitaeque christianae institutis iuventam'
 ],
 'pieni-l-animo':[
  "Né l'insistenza degli aspiranti può menomare la colpa di siffatta facilità. Il sacerdozio, istituito da Gesù Cristo per la salvezza eterna delle anime, non è per fermo un mestiere od un uffizio umano qualsiasi, al quale ognun che lo voglia e per qualunque ragione abbia diritto di liberamente dedicarsi.",
  "Promuovano adunque i Vescovi, non secondo le brame o le pretese di chi aspira, ma come prescrive il Tridentino, secondo la necessità delle diocesi; e nel promuovere in tal guisa, potranno scegliere solamente coloro che sono veramente idonei, rimandando quelli che mostrassero inclinazioni contrarie alla vocazione sacerdotale, precipua tra esse la indisciplinatezza e ciò che la genera, l'orgoglio della mente."
 ],
 'sollecitudini':[
  "La musica sacra, come parte integrante della solenne liturgia, ne partecipa il fine generale, che è la gloria di Dio e la santificazione e edificazione dei fedeli.",
  "La musica sacra deve per conseguenza possedere nel grado migliore le qualità che sono proprie della liturgia, e precisamente la santità e la bontà delle forme, onde sorge spontaneo l’altro suo carattere, che è l’universalità.",
  "Deve essere arte vera, non essendo possibile che altrimenti abbia sull’animo di chi l’ascolta quell’efficacia",
  "6. Fra i vari generi della musica moderna, quello che apparve meno acconcio ad accompagnare le funzioni del culto è lo stile teatrale, che durante il secolo scorso fu in massima voga"
 ],
 'divino-afflatu':[
  "Unde etiam nunc Psalteriumintra unius hebdomadae spatium recitandum foret integrum, nisi mutata rerum condicione talis recitatio frequenter impediretur.",
  "In ipsorum vero honorem Officia de Sanctis sensim propagari coeperunt, unde fere factum est, ut de Dominicis diebus deque Feriis Officia silerent ideoque non pauci neglegerentur Psalmi",
  "cum hoc inter cetera postularunt, ut, quoad posset, revocaretur consuetudo vetus recitandi per hebdomadam totum Psalterium, ita tamen ut clero",
  "quod Psalterium quasque Regulas et Rubricas etiam a ceteris omnibus, quoscumque obligatio tenet recitandi vel concinendi Horas canonicas, inviolate adhiberi ac servari praecipimus."
 ],
 'singulari-quadam':[
  'impulsi sumus, venerabiles fratres, omne studium curamque convertere ad eam excutiendam controversiam, quae inter eos est, de consociationibus opificum',
  'omnes autem actiones eius, quatenus bonae aut malae sunt in genere morum, id est cum iure naturali et divino congruunt aut discrepant',
  'non eos debere, si officii sui meminerint, inimicitias simultatesque alere inter ordines civium, sed pacem caritatemque mutuam.',
  'Causam socialem controversiasque ei causae subiectas de ratione spatioque operae, de modo salarii, de voluntaria cessatione opificum, non mere oeconomicae esse naturae',
  'quum contra verissimum sit eam (quaestionem socialem) moralem in primis et religiosam esse, ob eamque rem ex lege morum potissimum et religionis iudicio dirimendam'
 ],
 'editae-saepe':[
  'Horum autem praeclara facinora, non modo sunt ad commemorandum iucunda, sed etiam ad imitandum illustria',
  'propositum significavimus enitendi constanter ut « omnia instaurarentur in Christo »',
  'Hi sunt Gregorius Magnus, Ioannes Chrysostomus et Augustanus Anselmus, quorum saecularia solemnia celebrari contigit per hos annos.',
  'Nec minus movet admirationem quod Carolus, nondum exacto anno aetatis suae vicesimo, summos honores consecutus'
 ],
 'ad-diem-illum-laetissimum':[
  'Nemo itaque penitus ut illa Christum novit; nemo illa aptior dux et magister ad Christum noscendum.',
  'Hinc porro, quod iam innuimus, nullus etiam hac Virgine efficacior ad homines cum Christo iungendos.',
  'Equidem non diffitemur horum erogationem munerum privato proprioque iure esse Christi; siquidem et illa eius unius morte nobis sunt parta, et Ipse pro potestate mediator Dei atque hominum est.',
  'hoc Virgini augustae datum est, ut sit totius terrarum orbis potentissima apud unigenitum Filium suum mediatrix et conciliatrix (Pius IX in Bull. « Ineffabilis »).',
  'Fons igitur Christus est, et de plenitudine eius nos omnes accepimus',
  'Patet itaque abesse profecto plurimum ut nos Deiparae supernaturalis gratiae efficiendae vim tribuamus, quae Dei unius est.'
 ]
};
const normalize=t=>canonicalSourceText(t);
const ids=new Set(),opened=new Set(),counts={};
for(const item of pack.items){
 assert(!opened.has(item.documentKey));opened.add(item.documentKey);
 const doc=batch.documents.find(x=>x.documentKey.includes(item.documentKey));
 assert(doc);
 assert.equal(item.originalUrl,doc.officialOriginalPage);
 assert.equal(item.publicationApproved,false);
 assert.equal(item.translationApproved,false);
 assert.equal(item.fullDialogueClaimVerified,false);
 assert.equal(item.reviewedAt,'2026-10-23');
 assert(item.unresolvedClaims.length>=2);
 assert.equal(item.verificationLevel,'ORIGINAL_VATICAN_WEBPAGE_EXCERPT_SPOTCHECK_NOT_FULL_CERTIFICATION');
 const c=store.chapters.get(item.chapterId);
 assert(c && doc.chapters.some(x=>x.chapterId===c.id));
 assert.deepEqual(item.nodeIds,[c.nodes[0].id]);
 assert(item.witnesses.length>=4);
 const sourceContext=normalize((independentSourceWindows[item.documentKey]||[]).join(' '));
 assert(sourceContext.length>150);
 for(const witness of item.witnesses){
  assert(!ids.has(witness.id),'anchor IDs unique across eight docs: '+witness.id);
  ids.add(witness.id);
  assert.equal(witness.language,item.originalLanguage);
  assert(witness.originalText.length>=8);
  assert.equal(witness.status,'ORIGINAL_PAGE_LOCATED_MANUAL_LITERAL_CHECK_UNAPPROVED');
  assert(Number.isInteger(witness.webLine));
  assert(witness.speaker && witness.claimSupported);
  assert(sourceContext.includes(normalize(witness.originalText)),
   'A primary excerpt is not in independent Vatican context: '+witness.id);
 }
 counts[item.documentKey]=item.witnesses.length;
}
assert.equal(ids.size,41);
assert.equal(map.items.length,pack.items.length);
for(const summary of map.items){
 const src=pack.items.find(x=>x.chapterId===summary.chapterId);
 assert(src);
 assert.equal(summary.answerFullyApproved,false);
 assert.deepEqual(summary.unverifiedRemainder,src.unresolvedClaims);
 assert.deepEqual(summary.sourceBackedClaims.map(c=>c.witnessId),
  src.witnesses.map(w=>w.id),'claim ID map must derive from existing original excerpts only');
 assert(summary.sourceBackedClaims.every(c=>c.claim&&c.originalText&&c.speaker));
}

assert.equal(opened.size,8);
assert.equal(pack.items.reduce((s,x)=>s+x.witnesses.length,0),41);
assert.equal(pack.items.find(x=>x.documentKey==='singulari-quadam').witnesses.find(x=>x.id==='SQ-PREVPOPE').speaker,
 'EARLIER_AUTHORITY_QUOTED_BY_PIUS_X');
assert.equal(pack.items.find(x=>x.documentKey==='ad-diem-illum-laetissimum').witnesses.find(x=>x.id==='ADI-MARY').speaker,
 'PIUS_IX_QUOTED_BY_PIUS_X');
assert(pack.items.find(x=>x.documentKey==='pascendi-dominici-gregis').witnesses.some(x=>x.speaker==='PIUS_X_ANALYSIS_OF_MODERNIST_THEORY'));
const corrupted=normalize(independentSourceWindows['pieni-l-animo'].join(' ').replace('veramente idonei','inevitabilmente perfetti'));
assert(!corrupted.includes(normalize(pack.items.find(x=>x.documentKey==='pieni-l-animo').witnesses.find(x=>x.id==='PL-FIT').originalText)));
assert.equal(pack.summary.newModelEvidencePromotions,0);
console.log('PASS SPX_EIGHT_CONTEXT_CLAIM_WITNESSES: 8 document openings, 41 original-language excerpts matched to independent Vatican contexts; quoted-author and Modernist-theory distinctions; 0 full-answer promotions');
