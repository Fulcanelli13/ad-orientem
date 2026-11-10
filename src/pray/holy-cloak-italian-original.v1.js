/** Complete 19-section Italian digital Holy Cloak witness, source-held for exact print collation.
 * The composition is historically attested in 1898 and a 1929 reprint reports
 * approval dated 22 August 1882. This data is NOT claimed to match that print
 * verbatim; the 2024 online transcript is crosschecked to two later PDF witnesses.
 * Long source language stays IT; no fabricated historic EN/FR translations.
 * Do not re-use 2021 expanded Litany for this older form.
 */
import {PRAY_CANONICAL_DATA_V435930 as CANON} from "./canonical-data.js";
import {JOSEPH_LITANY_1909_V1} from "./st-joseph-litany-1909.v1.js";
export const HOLY_CLOAK_ITALIAN_SOURCE_V1=Object.freeze({
 id:"st_joseph_holy_cloak_italian",
 originalLanguage:"it",
 sourceScope:"2024_DIGITAL_TRANSCRIPTION_CORROBORATED_TO_LATER_ITALIAN_PDFS_NOT_1882_PRINT_CERTIFIED",
 textSource:"https://giovanidelrosario.altervista.org/?p=407",
 digitalComparisonSources:Object.freeze([
 "https://www.salpan.org/LITURGIA/PREGHIERE/Sacro%20Manto.pdf",
 "https://cooperatores-veritatis.org/wp-content/uploads/2020/03/sacro-manto-di-san-giuseppe-versione-originale.pdf"
 ]),
 historicalPrintLead:"https://www.archivio.sangiuseppespicello.it/images/devozioni-e-pie-pratiche/SACRO_MANTO_1.pdf",
 originalPrintTextCollated:false,
 sourceImagePassagesReviewed:Object.freeze(["XVIII.A","XVIII.B","LITANY_1909","CLOSING"]),
 sectionXVIIIOriginalPresentation:"ALTERNATING_PETITIONS_NO_PRINTED_VERSICLE_RESPONSE_SIGNS",
 historicalTextTranslatedToEn:false,historicalTextTranslatedToFr:false,
 modernEditorialTranslations:Object.freeze(["en","fr"]),modernEditorialLanguagesReview:"DRAFT_NOT_HISTORICAL_WITNESSES",
 sameFullTextForEachDay:true,days:30,historicalIndulgencesCurrent:false,
 sourceRights:"HISTORIC_PRAYER_TEXT_PRE_1900_WITH_DIGITAL_EDITORIAL_RECENSION; PRINT_IDENTIFICATION_AND_JURISDICTION_REVIEW_PENDING"
});
const I="℣. Gesù, Giuseppe e Maria,\n℟. vi dono il cuore e l’anima mia.\n℣. Gesù, Giuseppe e Maria,\n℟. assistetemi ora e nell’ultima agonia.\n℣. Gesù, Giuseppe e Maria,\n℟. spiri in pace tra voi l’anima mia.\nRingraziamo la SS. Trinità per aver esaltato San Giuseppe ad una dignità del tutto eccezionale:";
const RAW=Object.freeze([
 {
  "id": "I",
  "it": "O eterno divin Padre, a nome di Gesù e di Maria, mi prostro riverente alla tua divina presenza e ti prego devotamente perché voglia accettare la mia ferma decisione di perseverare nella schiera di coloro che vivono sotto il patrocinio di San Giuseppe.\nBenedici quindi il prezioso manto, che io oggi dedico a lui quale segno della mia devozione.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "II",
  "it": "Eccomi, o gran Patriarca San Giuseppe, prostrato devotamente innanzi a te.\nTi offro il proposito della mia devozione fedele e sincera.\nTutto quello che potrò fare in tuo onore durante la mia vita, io intendo eseguirlo per mostrarti l’amore che ti porto.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "III",
  "it": "O glorioso Patriarca San Giuseppe, prostrato innanzi a te, ti presento e ti offro con filiale devozione questo Manto, prezioso per gli innumerevoli privilegi, grazie e virtù che lo adornano e che onorano la tua santa persona.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "IV",
  "it": "Glorioso Patriarca, in te ebbe compimento il sogno misterioso dell’antico Giuseppe, il quale fu una tua anticipata figura: non solamente, infatti, ti circondò con i suoi fulgidissimi raggi il Sole divino, ma ti rischiarò pure della sua dolce luce la mistica Luna, Maria.\nCome l’esempio di Giacobbe, che andò di persona a rallegrarsi con il figlio suo prediletto esaltato sopra il trono dell’Egitto, servì a trascinarvi anche i figli suoi, così l’esempio di Gesù e di Maria, che ti onorano di tutta la loro stima e di tutta la loro fiducia, spinge anche me ad intessere in tuo onore questo prezioso Manto.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "V",
  "it": "Salve, o glorioso San Giuseppe, depositario dei grandi tesori del Cielo e padre putativo di Colui che sostiene tutte le creature.\nDopo Maria Santissima, tu sei il Santo più degno del nostro amore e meritevole della nostra venerazione. Fra tutti i Santi, tu solo avesti l’onore di allevare, nutrire e abbracciare il Messia, che tanti Profeti e Re avevano desiderato di vedere.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "VI",
  "it": "O grande Santo, fa’ che il Signore rivolga sopra di me uno sguardo di benevolenza. E come l’antico Giuseppe non scacciò i colpevoli fratelli, anzi li accolse pieno di amore, li protesse e li salvò dalla fame e dalla morte, così tu, o glorioso Patriarca, fa’ con la tua intercessione che il Signore non voglia mai abbandonarmi in questa valle di esilio.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "VII",
  "it": "O San Giuseppe, ottienimi la grazia di conservarmi sempre nel numero dei tuoi servi devoti, che vivono sereni sotto il manto del tuo patrocinio, che io desidero avere per ogni giorno della mia vita e nel momento dell’ultimo mio respiro.\nAiutami! Assistimi ora e in tutta la mia vita, ma soprattutto assistimi nell’ora della morte, come tu fosti assistito da Gesù e da Maria, perché ti possa un giorno onorare nella patria celeste per tutta l’eternità.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "VIII",
  "it": "O potente San Giuseppe, patrono universale della Chiesa, io t’invoco fra tutti i Santi fortissimo protettore dei miseri e benedico mille volte il tuo cuore sempre pronto a soccorrere ogni sorta di bisognosi.\nA te, caro San Giuseppe, fanno ricorso la vedova, l’orfano, l’abbandonato, l’afflitto e ogni altro sventurato; non c’è dolore, angustia o disgrazia che tu non abbia pietosamente lenito o allontanato.\nInnumerevoli sono le grazie e i favori che tu ottieni per i poveri afflitti. Ammalati di ogni genere, oppressi, calunniati, traditi, abbandonati, privati di ogni umano conforto, miseri bisognosi di pane o di appoggio implorano la tua regale protezione e vengono esauditi nelle loro domande.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "IX",
  "it": "O caro San Giuseppe, a tante migliaia di persone che ti hanno pregato prima di me hai donato conforto e pace, grazie e favori. L’animo mio, mesto e addolorato, non trova riposo in mezzo alle angustie dalle quali è oppresso.\nTu, o caro Santo, conosci tutti i miei bisogni, prima ancora che io li esponga con la preghiera. Tu sai quanto mi è necessaria la grazia che ti domando. Mi prostro al tuo cospetto e sospiro sotto il grave peso che mi opprime.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "X",
  "it": "Nessun cuore umano mi è aperto, al quale possa confidare le mie pene; e, se pur dovessi trovare compassione presso qualche anima caritatevole, essa tuttavia non mi potrebbe aiutare.\nO San Giuseppe, consolatore degli afflitti, abbi pietà del mio dolore.\nA te ricorro, e spero che non mi vorrai respingere, poiché Santa Teresa ha detto e ha lasciato scritto nelle sue memorie che “Qualunque grazia si domanda a San Giuseppe verrà certamente concessa”.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XI",
  "it": "Non permettere, o San Giuseppe carissimo, che io debba essere la sola, fra tante persone beneficate, che resti priva della grazia che ti domanda.\nMostrati anche verso di me potente e generoso e io ti ringrazierò benedicendoti in eterno, o glorioso Patriarca San Giuseppe, mio grande protettore.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XII",
  "it": "O San Giuseppe, per la tua misericordia e potenza, ottienimi dalla Misericordia Divina innanzitutto quello che è necessario all’anima mia, sàlvala e poi dègnati di usare in mio favore i mezzi che Dio ha messo nelle tue mani affinché possa conseguire la grazia di cui ho particolare bisogno e per la quale umilmente ed insistentemente ti imploro.\n[in silenzio si ricorda la grazia che si desidera ottenere]",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XIII",
  "it": "O San Giuseppe, balsamo di chi soffre, ottieni alle Anime Benedette del Purgatorio, che tanto sperano nelle nostre preghiere, un grande sollievo nelle loro pene, lìberale al più presto dalle sofferenze del Purgatorio e pòrtale verso la luce e la felicità del Paradiso.\nE voi, Anime sante del Purgatorio, supplicate San Giuseppe per me.",
  "gloryAfter": true,
  "eternalRestAfter": true
 },
 {
  "id": "XIV",
  "it": "Glorioso San Giuseppe, sposo di Maria e padre verginale di Gesù, pensa a me, veglia su di me, insegnami a lavorare per la mia santificazione e prendi sotto la tua pietosa cura i bisogni urgenti che oggi io affido alle tue sollecitudini paterne. Àmen.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XV",
  "it": "Ricordati, o purissimo sposo di Maria Vergine e mio caro protettore San Giuseppe: mai si è udito che qualcuno abbia invocato la tua protezione e chiesto il tuo aiuto senza essere stato consolato: con questa certezza, con questa fiducia io mi rivolgo a te e a te fervorosamente mi raccomando.\nO San Giuseppe, ascolta la mia preghiera, accoglila pietosamente ed esaudiscila. Àmen.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XVI",
  "it": "O potentissimo Santo, allontana gli ostacoli e le difficoltà e fa’ che il felice esito di quanto ti chiedo sia per la maggior gloria del Signore e per il bene dell’anima mia.\nEd io, in segno della mia più viva riconoscenza, ti prometto di far conoscere le tue glorie, mentre con tutto l’affetto benedico il Signore che ti volle tanto potente in cielo e sulla terra. Àmen.",
  "gloryAfter": true,
  "eternalRestAfter": false
 },
 {
  "id": "XVII",
  "it": "O eccelso Santo, sposo di Maria e padre putativo di Gesù,\nper il tesoro della tua perfettissima obbedienza a Dio, abbi pietà di me;\nper la tua santa vita piena di meriti, esaudiscimi;\nper il tuo potentissimo nome, aiutami;\nper il tuo clementissimo cuore, soccorrimi;\nper la tua misericordia, proteggimi;\nper le tue lacrime, confortami;\nper i tuoi dolori, consolami;\nper le tue gioie, rincuorami;\nda ogni male dell’anima e del corpo, liberami;\nda ogni pericolo e disgrazia, scampami;\ncon la tua santa protezione, assistimi;\nquello che mi è necessario, procurami;\nla grazia di cui ho particolare bisogno, ottienimi.\nO San Giuseppe, ascoltami.\nO San Giuseppe, esaudiscimi.\nO San Giuseppe, abbi pietà di me.",
  "gloryAfter": false,
  "eternalRestAfter": false
 },
 {
  "id": "XVIII",
  "it": "O San Giuseppe,\nprega Gesù che venga nell’anima mia e la santifichi;\nnel mio cuore e lo infiammi di carità;\nnella mia intelligenza e la illumini;\nnella mia volontà e la fortifichi;\nnei miei pensieri e li purifichi;\nnei miei affetti e li regoli;\nnei miei desideri e li diriga;\nnelle mie operazioni e le benedica.\nOttienimi da Gesù il suo santo amore;\nl’imitazione delle tue virtù;\nla vera umiltà di spirito;\nla mitezza di cuore;\nla pace dell’anima;\nil santo timore di Dio;\nil desiderio della perfezione;\nla dolcezza di carattere;\nun cuore puro e caritatevole;\nla grazia di sopportare con pazienza le sofferenze della vita;\nla perseveranza nell’operare il bene;\nla fortezza nel sopportare le croci;\nil distacco dai beni di questa terra;\ndi camminare per la via stretta del cielo;\ndi essere libero da ogni occasione di peccato;\nun santo desiderio del Paradiso;\nla perseveranza finale.\nFa’ che il mio cuore non cessi mai di amarti e la mia lingua di lodarti.\nPer l’amore che portasti a Gesù, aiutami ad amarLo.\nDègnati di accogliermi come tuo devoto.\nNon mi allontanare da Te.\nIo mi dono a Te: accettami e soccorrimi.\nNon mi abbandonare nell’ora della morte.\nGesù, Giuseppe e Maria,\nVi dono il cuore e l’anima mia.\nGesù, Giuseppe e Maria,\nassistetemi ora e nell’ultima agonia.\nGesù, Giuseppe e Maria,\nspiri in pace tra Voi l’anima mia.",
  "gloryAfter": false,
  "eternalRestAfter": false
 },
 {
  "id": "XIX",
  "it": "O eterno divin Padre, per i meriti di Gesù, di Maria e di Giuseppe, dègnati di concedermi la grazia che imploro.",
  "gloryAfter": true,
  "eternalRestAfter": false
 }
]);
const LAST="O glorioso Patriarca San Giuseppe, che da Dio sei stato posto a capo e custode della più santa tra le famiglie, dègnati di essermi dal cielo custode dell’anima mia, che domanda di essere ricevuta sotto il manto del tuo patrocinio.\nIo fin da questo momento, ti eleggo a padre, a protettore e a guida e pongo sotto la tua speciale custodia l’anima mia, il mio corpo, quanto ho e quanto sono, la mia vita e la mia morte.\nGuardami come tuo figlio; difendimi da tutti i miei nemici visibili ed invisibili; assistimi in tutte le necessità; consolami in tutte le amarezze della vita, ma specialmente nell’agonia della morte. Rivolgi una parola per me a quell’amabile Redentore, che Bambino portasti e stringesti fra le tue braccia, e a quella Vergine gloriosa di cui fosti dilettissimo Sposo.\nImpetrami quelle grazie che tu vedi essere utili al mio vero bene, alla mia eterna salvezza, e io farò di tutto per non rendermi indegno del tuo speciale patrocinio. Amen.";
const CORE=CANON.prayers;
const GLORY=CORE.foundations_glory_be?.la;
const ETERNAL_REST=CORE.foundations_eternal_rest?.la;
const SIGN=CORE.foundations_sign_of_cross?.la;
const OLD_LITANY=JOSEPH_LITANY_1909_V1.la;
const OLD_INVOCATIONS=OLD_LITANY.split("\n").filter(s=>s.endsWith(", ora pro nobis.")).length;
if(RAW.length!==19||RAW.some((x,i)=>x.id!=="I II III IV V VI VII VIII IX X XI XII XIII XIV XV XVI XVII XVIII XIX".split(" ")[i])||
 !GLORY||!ETERNAL_REST||!SIGN||!OLD_LITANY||OLD_INVOCATIONS!==26)
 throw Error("Holy Cloak original Italian source/composition prerequisites incomplete");
export const HOLY_CLOAK_ITALIAN_SECTIONS_V1=RAW;
export const HOLY_CLOAK_ITALIAN_STEPS_V1=Object.freeze([
 Object.freeze({id:"opening",kind:"opening",title:"Inizio",language:"it",body:I,
  openingSignOfCross:Object.freeze({id:"foundations_sign_of_cross",language:"la",times:1,text:SIGN}),
  repeat:Object.freeze([Object.freeze({id:"foundations_glory_be",language:"la",times:3,text:GLORY})])}),
 ...RAW.map(x=>Object.freeze({
  ...x,kind:"section",title:x.id,language:"it",
  repeat:Object.freeze([
   ...(x.eternalRestAfter?[Object.freeze({id:"foundations_eternal_rest",language:"la",times:3,text:ETERNAL_REST})]:[]),
   ...(x.gloryAfter?[Object.freeze({id:"foundations_glory_be",language:"la",times:1,text:GLORY})]:[])
  ])
 })),
 Object.freeze({id:"litany",kind:"litany",title:"Litanie di San Giuseppe · forma storica",language:"la",
  body:OLD_LITANY,sourceId:JOSEPH_LITANY_1909_V1.id,includesCollect:true,
  vernacular:Object.freeze({en:JOSEPH_LITANY_1909_V1.en,fr:JOSEPH_LITANY_1909_V1.fr}),
  note:"The litany already includes its concluding versicle and collect; do not duplicate the standalone Oremus."}),
 Object.freeze({id:"closing",kind:"closing",title:"Chiusura del Sacro Manto",language:"it",body:LAST}),
 Object.freeze({id:"optional",kind:"optional",title:"A te, o Beato Giuseppe",language:"la",
  body:CORE.devotion_ad_te_beate_ioseph.la,sourceId:"devotion_ad_te_beate_ioseph",
  note:"Separate optional addition in Salpan's later edition; not a required part of this 2024 digital witness."})
]);
export function holyCloakItalianStep(index){
 return Number.isInteger(index)&&index>=0&&index<HOLY_CLOAK_ITALIAN_STEPS_V1.length?
 HOLY_CLOAK_ITALIAN_STEPS_V1[index]:null;
}
