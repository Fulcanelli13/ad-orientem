// Shared, stanza-aligned editorial translations of St Thomas Aquinas's
// Pange lingua / Tantum ergo, reused by two DISTINCT 1962 ceremonial graphs.
// The Latin is never taken from this file; original Mass/rite payloads own it.
// These are readable AO editorial translations, checked against parallel
// witnesses, NOT copies of copyrighted contemporary musical paraphrases.
export const EUCHARISTIC_HYMN_TRANSLATION_SOURCE=Object.freeze({
  owner:"AO_ORIGINAL_EDITORIAL_TRANSLATION_SOURCE_CROSSCHECKED",
  sourceLatinAuthor:"Sanctus Thomas Aquinas, Pange lingua gloriosi Corporis",
  sourceLatin:"https://www.societaslaudis.org/fr/hy_Pange_lingua_gloriosi/",
  crosschecks:Object.freeze([
    "https://opusdei.org/fr/prayers/section/?section1=154&section2=33",
    "https://gustavomunhon.com/en/prayers/pange-lingua-sing-my-tongue",
    "https://www.msm-france.com/cenacles/chants-et-prieres/",
  ]),
  status:"EDITORIAL_AO_RENDERINGS_NOT_OFFICIAL_MISSAL_TRANSLATIONS",
  stanzaCount:6,
});
const H=Object.freeze([
  Object.freeze({
    latinIncipit:/^Pange,\s+l[ií]ngua,/i,
    english:"Sing, my tongue, of the mystery of the glorious Body and the precious Blood, which the King of nations, born of a noble womb, poured forth as the ransom of the world.",
    french:"Chante, ô ma langue, le mystère du Corps glorieux et du Sang précieux que le Roi des nations, né d'un sein noble, a versé pour racheter le monde.",
  }),
  Object.freeze({
    latinIncipit:/^Nobis datus,/i,
    english:"Given to us and born for us of an undefiled Virgin, He dwelt among us, scattering the seed of His word, and brought the days of His earthly sojourn to a wondrous close.",
    french:"Donné pour nous, né pour nous d'une Vierge sans tache, il a demeuré parmi les hommes en répandant la semence de sa parole, puis achevé merveilleusement son séjour terrestre.",
  }),
  Object.freeze({
    latinIncipit:/^In supr/i,
    english:"On the night of the Last Supper, reclining among His brethren, having fully observed the Law and its prescribed meal, He gives Himself with His own hands as food to the Twelve.",
    french:"La nuit de la dernière Cène, à table avec ses frères, après avoir accompli les prescriptions de la Loi pour le repas, il se donne lui-même en nourriture aux Douze, de ses propres mains.",
  }),
  Object.freeze({
    latinIncipit:/^Verbum caro,/i,
    english:"The Word made flesh, by His word, makes true bread His flesh; the wine becomes the Blood of Christ. Though the senses fail, faith alone is enough to strengthen the sincere heart.",
    french:"Le Verbe fait chair, par sa parole, fait du pain véritable sa chair; le vin devient le Sang du Christ. Quand les sens défaillent, la foi seule suffit à affermir le cœur sincère.",
  }),
  Object.freeze({
    latinIncipit:/^Tantum ergo/i,
    english:"Therefore let us bow down in adoration before so great a Sacrament. Let the ancient observance give way to the new rite, and let faith supply what our senses cannot perceive.",
    french:"Devant un si grand Sacrement, inclinons-nous pour l'adorer. Que l'ancien rite cède au nouveau, et que la foi supplée à ce que nos sens ne peuvent saisir.",
  }),
  Object.freeze({
    latinIncipit:/^Genit[oó]ri,/i,
    english:"To the Father and to the Son be praise and jubilation, salvation, honour, power and blessing; to Him who proceeds from both be equal praise. Amen.",
    french:"Au Père et au Fils soient louange et allégresse, salut, honneur, puissance et bénédiction; à Celui qui procède de l'un et de l'autre soit rendue une égale louange. Ainsi soit-il.",
  }),
]);
export function makeEucharisticHymnRows(stanzas,{prefix,sourceRecordId,startStanza=0}={}){
  if(!Array.isArray(stanzas)||!stanzas.length ||
    !Number.isInteger(startStanza)||startStanza<0||
    startStanza+stanzas.length>H.length)
    throw new Error("EUCHARISTIC_HYMN_STANZA_RANGE_INVALID");
  return Object.freeze(stanzas.map((latin,i)=>{
    const j=i+startStanza,review=H[j],canonical=String(latin??"").trim();
    if(!review.latinIncipit.test(canonical))
      throw new Error("EUCHARISTIC_HYMN_LATIN_INCORRECT_STANZA:"+j);
    return Object.freeze({
      id:String(prefix)+String(i+1),kind:"TEXT",latin:canonical,
      english:review.english,french:review.french,sourceRecordId,
      translationSource:"AO_EDITORIAL_EUCHARISTIC_HYMN_STANZA_"+(j+1),
      sourceStatus:EUCHARISTIC_HYMN_TRANSLATION_SOURCE.status,
    });
  }));
}
// Corpus Christi Benediction only: the actual original Latin continues
// to be owned by the source's BEN-010 payload, including its closing.
const BEN=Object.freeze({
  V:Object.freeze({latinIncipit:/^Panem de c[æa]lo/i,
    english:"You have given them bread from heaven.",
    french:"Vous leur avez donné le pain du ciel."}),
  R:Object.freeze({latinIncipit:/^Omne delectam/i,
    english:"Containing within itself every delight.",
    french:"Qui contient en lui toutes les délices."}),
  O:Object.freeze({latinIncipit:/^Or[eé]mus\./i,
    english:"Let us pray.",french:"Prions."}),
  P:Object.freeze({latinIncipit:/^Deus, qui nobis sub/i,
    english:"O God, who in this wonderful Sacrament have left us the memorial of Your Passion, grant, we beseech You, that we may so venerate the sacred mysteries of Your Body and Blood as to experience continually within ourselves the fruit of Your Redemption. You who live and reign for ever and ever.",
    french:"Ô Dieu, qui nous avez laissé, dans cet admirable Sacrement, le mémorial de votre Passion, accordez-nous, nous vous en supplions, de vénérer les saints mystères de votre Corps et de votre Sang, afin de ressentir sans cesse en nous le fruit de votre Rédemption. Vous qui vivez et régnez dans les siècles des siècles."}),
  A:Object.freeze({latinIncipit:/^Amen\./i,
    english:"Amen.",french:"Ainsi soit-il."}),
});
export function makeCorpusBenedictionRow(key,latin,{kind,sourceRecordId="CORPUS-BEN-010"}={}){
  const row=BEN[String(key)],canonical=String(latin??"").trim();
  if(!row||!row.latinIncipit.test(canonical))throw new Error("CORPUS_BENEDICTION_WITNESS_MISMATCH:"+key);
  return Object.freeze({id:"CORPUS-R05-"+key,kind,latin:canonical,
    english:row.english,french:row.french,sourceRecordId,
    sourceStatus:"EDITORIAL_AO_RENDERINGS_NOT_OFFICIAL_MISSAL_TRANSLATIONS"});
}
