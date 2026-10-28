/**
 * Public-domain Eucharistic texts of St Thomas Aquinas, as collated with
 * the ICRSP 1962 Corpus Christi witness. These are liturgical texts, not
 * newly authored private prayers. Modern French/English renderings are not
 * silently copied: source editions may be read using the linked witness.
 *
 * The last two stanzas of the full Pange lingua are the canonical Tantum
 * Ergo; the accessor reuses that existing Latin record instead of storing
 * a second, potentially divergent copy.
 */
export const EUCHARISTIC_SOURCE=Object.freeze({
 url:"https://icrspfrance.fr/textes-liturgiques.php?article=a0297_ancien",
 edition:"ICRSP France · Corpus Christi / Fête-Dieu · 1962 Latin witness",
 rights:"Original 13th-century Latin (public domain); modern vernacular translations are link-only"
});
const record=(id,titleLa,category,stanzas,more={})=>Object.freeze({
 id,titleLa,category,la:stanzas.join("\n\n"),source:EUCHARISTIC_SOURCE.url,
 languages:Object.freeze({la:"ORIGINAL_PUBLIC_DOMAIN",en:"NOT_PUBLISHED",fr:"NOT_PUBLISHED"}),...more
});
const PANGE=record("eucharistic_pange_lingua_full",
 "Pange lingua gloriosi Corporis mysterium","eucharistic-hymn",[
 "Pange, lingua, gloriosi\nCorporis mysterium,\nSanguinisque pretiosi,\nQuem in mundi pretium\nFructus ventris generosi\nRex effudit Gentium.",
 "Nobis datus, nobis natus\nEx intacta Virgine,\nEt in mundo conversatus,\nSparso verbi semine,\nSui moras incolatus\nMiro clausit ordine.",
 "In supremae nocte cenae\nRecumbens cum fratribus,\nObservata lege plene\nCibis in legalibus,\nCibum turbae duodenae\nSe dat suis manibus.",
 "Verbum caro, panem verum\nVerbo carnem efficit;\nFitque sanguis Christi merum;\nEt si sensus deficit,\nAd firmandum cor sincerum\nSola fides sufficit."
],{appendsCanonical:"benediction_tantum_ergo",completeStanzas:6,
 distinction:"Eucharistic hymn; not Pange lingua gloriosi proelium certaminis (Passiontide)"});
const LAUDA=record("eucharistic_lauda_sion_full",
 "Lauda Sion Salvatorem","corpus-christi-mass-sequence",[
 "Lauda, Sion, Salvatorem,\nLauda ducem et pastorem\nIn hymnis et canticis.",
 "Quantum potes, tantum aude:\nQuia maior omni laude,\nNec laudare sufficis.",
 "Laudis thema specialis,\nPanis vivus et vitalis\nHodie proponitur.",
 "Quem in sacrae mensa cenae,\nTurbae fratrum duodenae\nDatum non ambigitur.",
 "Sit laus plena, sit sonora,\nSit iucunda, sit decora\nMentis iubilatio.",
 "Dies enim solemnis agitur,\nIn qua mensae prima recolitur\nHuius institutio.",
 "In hac mensa novi Regis,\nNovum Pascha novae legis\nPhase vetus terminat.",
 "Vetustatem novitas,\nUmbram fugat veritas,\nNoctem lux eliminat.",
 "Quod in cena Christus gessit,\nFaciendum hoc expressit\nIn sui memoriam.",
 "Docti sacris institutis,\nPanem, vinum in salutis\nConsecramus hostiam.",
 "Dogma datur Christianis,\nQuod in carnem transit panis,\nEt vinum in sanguinem.",
 "Quod non capis, quod non vides,\nAnimosa firmat fides,\nPraeter rerum ordinem.",
 "Sub diversis speciebus,\nSignis tantum et non rebus,\nLatent res eximiae.",
 "Caro cibus, sanguis potus:\nManet tamen Christus totus\nSub utraque specie.",
 "A sumente non concisus,\nNon confractus, non divisus:\nInteger accipitur.",
 "Sumit unus, sumunt mille:\nQuantum isti, tantum ille:\nNec sumptus consumitur.",
 "Sumunt boni, sumunt mali:\nSorte tamen inaequali,\nVitae vel interitus.",
 "Mors est malis, vita bonis:\nVide paris sumptionis\nQuam sit dispar exitus.",
 "Fracto demum sacramento,\nNe vacilles, sed memento,\nTantum esse sub fragmento,\nQuantum toto tegitur.",
 "Nulla rei fit scissura:\nSigni tantum fit fractura:\nQua nec status nec statura\nSignati minuitur.",
 "Ecce panis Angelorum,\nFactus cibus viatorum:\nVere panis filiorum,\nNon mittendus canibus.",
 "In figuris praesignatur,\nCum Isaac immolatur:\nAgnus Paschae deputatur,\nDatur manna patribus.",
 "Bone pastor, panis vere,\nIesu, nostri miserere:\nTu nos pasce, nos tuere,\nTu nos bona fac videre\nIn terra viventium.",
 "Tu, qui cuncta scis et vales,\nQui nos pascis hic mortales:\nTuos ibi commensales,\nCoheredes et sodales\nFac sanctorum civium. Amen. Alleluia."
],{completeStanzas:24,context:"Corpus Christi Mass sequence; not a mandatory Benediction or private-Adoration hymn"});
const CONVIVIUM=record("eucharistic_o_sacrum_convivium",
 "O sacrum convivium","corpus-christi-office-antiphon",[
 "O sacrum convivium, in quo Christus sumitur: recolitur memoria passionis eius: mens impletur gratia: et futurae gloriae nobis pignus datur, alleluia."
],{context:"Magnificat antiphon at Vespers of Corpus Christi; Alleluia belongs to this attested feast witness"});
export const EUCHARISTIC_WITNESSES=Object.freeze([PANGE,LAUDA,CONVIVIUM]);
export const EUCHARISTIC_WITNESS_IDS=Object.freeze(EUCHARISTIC_WITNESSES.map(x=>x.id));
export function getEucharisticWitness(id,{tantum=null}={}){
 const item=EUCHARISTIC_WITNESSES.find(x=>x.id===id);
 if(!item)return null;
 if(item.appendsCanonical){
  const latin=tantum?.la;
  if(typeof latin!=="string"||!latin.trim())return Object.freeze({...item,complete:false,la:item.la});
  return Object.freeze({...item,complete:true,la:item.la+"\n\n"+latin});
 }
 return Object.freeze({...item,complete:true});
}
