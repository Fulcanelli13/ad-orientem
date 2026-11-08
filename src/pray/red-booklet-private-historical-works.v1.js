/**
 * Red Booklet: four additional privately recited prayers, held apart from
 * the canonical Mass Ordinary and sacramental Confession workflow.
 *
 * Each English body is a complete independently published historical
 * witness, NOT an asserted transcription/translation of the 2013 booklet.
 * The three Confession prayers are never simulated absolution or a record
 * of a penitent's sins. No unattested Latin/French prayer body is filled.
 */
const WITNESSES=[
 {
  id:"before_mass",sourceId:"massFourEndsDeclaration1904",
  en:"Declaration of Intention Before Mass",fr:"Offrande des quatre fins de la messe",
  route:"mass.prepare",subject:"III",stage:null,printedPage:3,
  sourceEdition:"Traditional Declaration of Intention · associated with St Pius X, 1904; later English form",
  sourceUrl:"https://www.sanctatrinitas.org/Prayers_Before_Mass_Prayers_Before_Holy_Communion_Prayers_After_Holy_Communion_and_Thanksgiving_After_Mass.html",
  text:"Eternal Father, I unite myself with the intentions and affections of our Lady of Sorrows on Calvary, and I offer to you the sacrifice that your beloved Son Jesus made of himself upon the cross, and now renews upon this holy altar:\n\nTo adore you and give you the honour that is due to you, confessing your supreme dominion over all things, and the absolute dependence of everything upon you, who are our sole and our last end.\n\nTo thank you for the countless benefits that I have received.\n\nTo appease your justice, aroused against us by so many sins, and to make satisfaction for them.\n\nTo implore grace for myself, for N., for all afflicted and sorrowing, for poor sinners, for all the world, and for the holy souls in purgatory. Amen."
 },
 {
  id:"conf_exam_prayer",sourceId:"confAfterExaminationTraditional",
  en:"Prayer After Examination of Conscience",fr:"Prière après l’examen de conscience",
  route:"pray.confession",subject:"I",stage:1,printedPage:61,
  sourceEdition:"Traditional longer form · Catholic Harbor historical prayer transcription",
  sourceUrl:"https://catholicharboroffaithandmorals.com/Tenth%20Sunday%20After%20Pentecost.html",
  text:"O my God, I cry unto Thee with the prodigal: Father, I have sinned against heaven and before Thee; I am no longer worthy to be called Thy Son. I have gone astray like a sheep that is lost. O seek Thy servant, for I have not forgotten Thy commandments. Enter not into judgment with Thy servant, O Lord. O spare me for Thy mercy's sake. Prove me, O God, and know my heart; examine me, and know my paths.\n\nThou whose property is always to have mercy and to spare, O meet me in pity, embrace me in love, and forgive me all my sins.\n\nI confess my sins unto Thee, O Christ, Healer of our souls, O Lord of Life. Heal me, heal me of my spiritual sickness, Thou who art long-suffering and of tender mercy; heal me, O Lord Christ. Accept my supplications, O Thou Holy Spirit, unto whom every heart is open, every desire known, and from whom no secret is hid, and who givest life to our souls; hear and answer, O Spirit of God.\n\nO Heavenly Father, who willest not that any sinner should perish, give me true repentance for this my sin, that I perish not!\n\nTo what misery am I come by my own fault! O merciful God, pity and forgive me for Jesus' sake. Thine eyes, O God, are as a flame of fire searching my inmost heart. O pardon my sin, for it is great! Thou, God, seest me in all the foulness of my sins. Blessed Jesus, speak for me, plead for me, come between my soul and my offended God, that I perish not. Amen."
 },
 {
  id:"conf_thanksgiving",sourceId:"confThanksgivingLasance1910",
  en:"Thanksgiving After Confession",fr:"Action de grâces après la confession",
  route:"pray.confession",subject:"I",stage:3,printedPage:61,
  sourceEdition:"F. X. Lasance, The Young Man's Guide (1910), Confession Devotions",
  sourceUrl:"https://en.wikisource.org/wiki/The_young_man%27s_guide/Confession_Devotions",
  text:"Eternal Father! I thank Thee, I bless Thee, for Thy goodness and mercy. Thou hast had compassion on me, although in my folly I had wandered far away from Thee and offended Thee most grievously. With fatherly love Thou hast received me anew after so many relapses into sin and forgiven me my offenses through the holy sacrament of Penance. Blessed forever, O my God, be Thy loving-kindness, Thy infinite mercy! Never again will I grieve Thee by ingratitude, by disobedience to Thy holy will. All that I am, all that I have, all that I do shall be consecrated to Thy service and Thy glory.\n\nSacred Heart of Jesus, I trust in Thee."
 },
 {
  id:"conf_joseph",sourceId:"confJosephPurity1896",
  en:"Prayer to St Joseph for Purity",fr:"Prière à saint Joseph pour la pureté",
  route:"pray.confession",subject:"VI",stage:2,printedPage:61,
  sourceEdition:"A Manual of Prayers for the Use of the Catholic Laity · historical English form",
  sourceUrl:"https://en.wikisource.org/wiki/A_Manual_of_Prayers_for_the_Use_of_the_Catholic_Laity/Morning_Prayers",
  text:"O faithful Guardian and Father of virgins, Blessed Joseph, to whom was confided the care of Jesus, and of Mary the Queen of Virgins, I most humbly supplicate thee, by the love thou dost bear Jesus and Mary, to obtain for me that, being preserved from every stain during my whole life, I may be ever able to serve them with unspotted purity of mind and body. Amen."
 }
];
export const RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1=Object.freeze(WITNESSES.map(record=>Object.freeze({
 ...record,languages:Object.freeze(["en"]),wordingCollatedAgainst2013:false,
 readerOwner:record.route,privatePrayer:true,
 noAbsolutionSimulation:true
})));
const byId=new Map(RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.map(w=>[w.id,w]));
const bySource=new Map(RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.map(w=>[w.sourceId,w]));
export function redBookletPrivateHistoricalWork(id){return byId.get(String(id||""))||null}
export function redBookletPrivateHistoricalSource(sourceId){return bySource.get(String(sourceId||""))||null}
export function redBookletPrivateHistoricalWorksForSubject(subject,query=""){
 const q=String(query||"").trim().toLocaleLowerCase();
 if(subject!=="all"&&!RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.some(w=>w.subject===subject))return [];
 if(subject==="all"&&!q)return [];
 return RED_BOOKLET_PRIVATE_HISTORICAL_WORKS_V1.filter(w=>
  (subject==="all"||w.subject===subject)&&(!q||[w.id,w.sourceId,w.en,w.fr].some(v=>v.toLocaleLowerCase().includes(q))));
}
