// The 1962 Roman funeral/Absolution text is owned by
// data/presentation/reader-requiem-absolution.v1.json (Latin only).
// These ORIGINAL Ad Orientem editorial EN/FR reading translations follow
// its exact existing source rows, including two conditional collects.
// Not an approved bilingual Missal, and not a reproduced modern booklet.
// All Latin source strings are independently fingerprinted below.
export const REQUIEM_EDITORIAL_TEXT_SOURCE=Object.freeze({
  status:"AD_ORIENTEM_ORIGINAL_EDITORIAL_EN_FR_NOT_APPROVED_1962_MISSAL",
  sourceLatin:"data/presentation/reader-requiem-absolution.v1.json",
  latinWitnesses:Object.freeze([
    "https://www.latinmassfuneral.com/requiem-mass/",
    "https://www.latinmassfuneral.com/rite-of-burial-for-adults/",
    "https://propria.org/wp-content/uploads/2021/07/propers-for-funeral-mass-mass-for-the-dead-on-the-day-of-death-or-burial-for-a-lay-person.pdf",
  ]),
  translationCrosschecks:Object.freeze([
    "https://en.wikisource.org/wiki/The_Service_of_High_Mass_for_the_Dead_on_the_Day_of_Burial",
    "https://fr.wikipedia.org/wiki/Absoute",
    "https://inparadisum.fr/textes-et-traductions/",
  ]),
  note:"The two concluding orations correspond to different body-present branches; neither is interchangeable.",
});
const pair=(latinDigest,english,french)=>Object.freeze({latinDigest,english,french});
const T=Object.freeze({
  "ABS-R02-P":pair("3544eda0",
    "Enter not into judgment with Your servant, O Lord, for no one can be justified before You unless You grant him the remission of all his sins. We beseech You, therefore, that Your sentence of judgment may not weigh upon him whom the sincere prayer of Christian faith commends to You; but, with Your grace coming to his aid, may he escape the judgment of vengeance, he who in life was marked with the sign of the Holy Trinity. You who live and reign for ever and ever.",
    "N'entrez pas en jugement avec votre serviteur, Seigneur, car nul homme ne peut être justifié devant vous si vous ne lui accordez le pardon de tous ses péchés. Nous vous supplions donc de ne pas faire peser votre sentence sur celui que la prière sincère de la foi chrétienne vous recommande ; mais que votre grâce lui vienne en aide, afin qu'il échappe au jugement de vengeance, lui qui, durant sa vie, fut marqué du signe de la sainte Trinité. Vous qui vivez et régnez dans les siècles des siècles."),
  "ABS-R02-A":pair("f2c1c9be","Amen.","Ainsi soit-il."),
  "ABS-R03-1":pair("169c7964",
    "Deliver me, O Lord, from eternal death on that dreadful day, when the heavens and the earth shall be shaken, when You come to judge the world by fire.",
    "Délivrez-moi, Seigneur, de la mort éternelle en ce jour redoutable, lorsque les cieux et la terre seront ébranlés, quand vous viendrez juger le monde par le feu."),
  "ABS-R03-2":pair("cccb5f40",
    "I tremble and fear, when the judgment shall come and the wrath that is to follow.",
    "Je tremble et j'ai peur, lorsque viendra le jugement, et la colère qui doit suivre."),
  "ABS-R03-3":pair("73741a44",
    "When the heavens and the earth shall be shaken, when You come to judge the world by fire.",
    "Lorsque les cieux et la terre seront ébranlés, quand vous viendrez juger le monde par le feu."),
  "ABS-R03-4":pair("d2243022",
    "That day, a day of wrath, of calamity and of misery: a great and exceedingly bitter day.",
    "Ce jour-là, jour de colère, de calamité et de misère : jour grand et très amer."),
  "ABS-R03-5":pair("37011e6f",
    "When You come to judge the world by fire.",
    "Quand vous viendrez juger le monde par le feu."),
  "ABS-R03-6":pair("a0e66199",
    "Grant him eternal rest, O Lord, and let perpetual light shine upon him.",
    "Accordez-lui, Seigneur, le repos éternel, et que la lumière perpétuelle brille sur lui."),
  "ABS-R03-7":pair("169c7964",
    "Deliver me, O Lord, from eternal death on that dreadful day, when the heavens and the earth shall be shaken, when You come to judge the world by fire.",
    "Délivrez-moi, Seigneur, de la mort éternelle en ce jour redoutable, lorsque les cieux et la terre seront ébranlés, quand vous viendrez juger le monde par le feu."),
  "ABS-R04-K1":pair("ac79a72a","Lord, have mercy.","Seigneur, ayez pitié."),
  "ABS-R04-K2":pair("82dea02e","Christ, have mercy.","Ô Christ, ayez pitié."),
  "ABS-R04-K3":pair("ac79a72a","Lord, have mercy.","Seigneur, ayez pitié."),
  "ABS-R04-PN":pair("50520f72","Our Father.","Notre Père."),
  "ABS-R04-V1":pair("fe07ca48","And lead us not into temptation.","Et ne nous laissez pas entrer en tentation."),
  "ABS-R04-V2":pair("fb030f82","But deliver us from evil.","Mais délivrez-nous du mal."),
  "ABS-R04-V3":pair("1df2bffd","From the gate of hell.","Des portes de l'enfer."),
  "ABS-R04-V4":pair("e3181c52","Deliver his soul, O Lord.","Délivrez son âme, Seigneur."),
  "ABS-R04-V5":pair("eb3c7c25","May he rest in peace.","Qu'il repose en paix."),
  "ABS-R04-V6":pair("f2c1c9be","Amen.","Ainsi soit-il."),
  "ABS-R04-V7":pair("e4f1d41d","O Lord, hear my prayer.","Seigneur, exaucez ma prière."),
  "ABS-R04-V8":pair("b8db81d3","And let my cry come unto You.","Et que mon cri parvienne jusqu'à vous."),
  "ABS-R04-V9":pair("c72f4a94","The Lord be with you.","Le Seigneur soit avec vous."),
  "ABS-R04-V10":pair("ea7133c7","And with your spirit.","Et avec votre esprit."),
  "ABS-R04-O-present":pair("68001832",
    "O God, whose property is always to have mercy and to spare, we humbly beseech You for the soul of Your servant N., whom You have summoned today to depart this world: do not deliver him into the enemy's hands, nor forget him for ever, but command the holy Angels to receive him and bring him into the homeland of paradise; that, since he hoped and believed in You, he may not suffer the pains of hell but possess everlasting joys. Through Christ our Lord.",
    "Ô Dieu, dont le propre est de toujours faire miséricorde et de pardonner, nous vous supplions humblement pour l'âme de votre serviteur N., que vous avez appelé aujourd'hui à quitter ce monde : ne le livrez pas aux mains de l'ennemi et ne l'oubliez pas à jamais ; ordonnez plutôt à vos saints Anges de le recevoir et de le conduire dans la patrie du paradis ; afin que, puisqu'il a espéré et cru en vous, il n'endure pas les peines de l'enfer mais possède les joies éternelles. Par le Christ Notre-Seigneur."),
  "ABS-R04-O-absent":pair("338bf255",
    "We beseech You, O Lord, to absolve the soul of Your servant N. from every bond of sin, so that, raised among Your Saints and Elect, he may breathe freely in the glory of the Resurrection. Through Christ our Lord.",
    "Nous vous supplions, Seigneur, d'absoudre l'âme de votre serviteur N. de tout lien du péché, afin que, ressuscité parmi vos Saints et vos Élus, il trouve le repos dans la gloire de la Résurrection. Par le Christ Notre-Seigneur."),
  "ABS-R04-A":pair("f2c1c9be","Amen.","Ainsi soit-il."),
  "ABS-R05-I":pair("6228b893",
    "May the Angels lead you into paradise; may the Martyrs receive you at your coming and lead you into the holy city of Jerusalem.",
    "Que les Anges vous conduisent au paradis ; qu'à votre arrivée les Martyrs vous accueillent et vous mènent dans la cité sainte de Jérusalem."),
  "ABS-R05-C":pair("93e2c196",
    "May the choir of Angels receive you, and with Lazarus, once poor, may you have eternal rest.",
    "Que le chœur des Anges vous accueille et qu'avec Lazare, jadis pauvre, vous ayez le repos éternel."),
});
function digestLatin(value){
  let h=0x811c9dc5;
  for(let i=0;i<value.length;i++){
    h^=value.charCodeAt(i);
    h=Math.imul(h,0x01000193)>>>0;
  }
  return h.toString(16).padStart(8,"0");
}
export function projectRequiemBilingualRow(id,kind,latin,sourceRecordId){
  const canonical=String(latin??"").trim();
  // Two distinct 1962 orations are selected from actual conditional text,
  // never from a date inferred to indicate that a body is present.
  const sourceId=id==="ABS-R04-O"
    ? (canonical.startsWith("Deus, cui")?"ABS-R04-O-present":"ABS-R04-O-absent")
    : id;
  const record=T[sourceId];
  if(!record || !canonical || digestLatin(canonical)!==record.latinDigest)
    throw new Error("REQUIEM_SOURCE_OR_EDITORIAL_ALIGNMENT_INVALID:"+sourceId);
  if(!["TEXT","RESPONSE","VERSICLE"].includes(String(kind)))
    throw new Error("REQUIEM_UNRECOGNIZED_ROW_KIND:"+id);
  if(!["ABS-020","ABS-030","ABS-040","ABS-050"].includes(sourceRecordId))
    throw new Error("REQUIEM_UNOWNED_SOURCE_RECORD:"+id);
  return Object.freeze({
    id,kind,latin:canonical,english:record.english,french:record.french,
    sourceRecordId,
    translationSource:"AO_ORIGINAL_EDITORIAL_1962_REQUIEM_"+sourceId,
    sourceStatus:REQUIEM_EDITORIAL_TEXT_SOURCE.status,
  });
}
