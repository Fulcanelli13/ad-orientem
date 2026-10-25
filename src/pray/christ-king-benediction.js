/** Christ the King local celebration supplements. Not a mandatory rite or independent reader. */
export const CHRIST_KING_WITNESSES=Object.freeze({
  "feast": "https://www.institute-christ-king.org/resources/sacred-music",
  "decree": "https://www.newadvent.org/library/docs_pi11qp.htm",
  "consecrationLatin": "https://preces-latinae.org/thesaurus/Filius/IesuDRedempt.html",
  "consecrationFrench": "https://www.icrsp.org/Publicationsbis/Revue-2019/01-40.pdf",
  "consecrationEnglish": "https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=920",
  "royalPraises": "https://www.vatican.va/news_services/liturgy/libretti/2012/20121007.pdf",
  "royalPraisesICKSPIndex": "https://www.icrsp.org/Livres/pub-livret-de-chant-reactualise-24-fevrier-2009.pdf",
  "royalPraisesWitness": "https://www.ordo.pallotyni.pl/index.php/naboestwa-i-modlitwy/modlitwy-do-swietych/1451-laudes-regiae",
  "sacredHeartLitany": "https://www.icrsp.org/Litanies-Sacre-Coeur",
  "christKingOrdo": "https://icrspfrance.fr/ordo.php?d=2026-10-01"
});
export const CHRIST_KING_OPTION_DEFAULTS=Object.freeze({procession:true,royalPraises:true,sacredHeartLitany:false,consecration:true});
export const CHRIST_KING_EXTRA_STAGES=Object.freeze([
 ["king-procession","Eucharistic procession","Procession eucharistique","procession"],
 ["king-royal-praises","Christus vincit","Christus vincit","royalPraises"],
 ["king-sacred-heart-litany","Litany of the Sacred Heart","Litanies du Sacré-Cœur","sacredHeartLitany"],
 ["king-consecration","Consecration of the human race","Consécration du genre humain","consecration"]
]);
export function christKingStages(ordinary,celebration,options=CHRIST_KING_OPTION_DEFAULTS){
 if(celebration!=="christKing")return ordinary;
 const beforeHymn=ordinary.findIndex(x=>x[0]==="hymn");
 if(beforeHymn<0)throw Error("Canonical Tantum Ergo stage missing");
 return [...ordinary.slice(0,beforeHymn),...CHRIST_KING_EXTRA_STAGES.filter(x=>options[x[3]]).map(x=>x.slice(0,3)),...ordinary.slice(beforeHymn)];
}
/** Consecration text is the shorter 1959 recension, not Leo XIII's longer 1899 form. */
export const CHRIST_KING_CONSECRATION=Object.freeze({
  "id": "christ_king_consecration_human_race",
  "title": "Act of Dedication of the Human Race to the Sacred Heart",
  "titleFr": "Acte de consécration du genre humain au Sacré-Cœur",
  "la": "Iesu dulcissime, Redemptor humani generis, respice nos ante conspectum tuum humillime provolutos. Tui sumus, tui esse volumus; quo autem tibi coniuncti firmius esse possimus, en hodie sacratissimo Cordi tuo se quisque nostrum sponte dedicat. Te quidem multi novere numquam; te, spretis mandatis tuis, multi repudiarunt. Miserere utrorumque, benignissime Iesu, atque ad sanctum Cor tuum rape universos.\n\nRex esto, Domine, nec fidelium tantum qui nullo tempore discessere a te, sed etiam prodigorum filiorum qui te reliquerunt: fac ut domum paternam cito repetant, ne miseria et fame pereant.\n\nRex esto eorum, quos aut opinionum error deceptos habet, aut discordia separatos, eosque ad portum veritatis atque ad unitatem fidei revoca, ut brevi fiat unum ovile et unus pastor.\n\nLargire, Domine, Ecclesiae tuae securam cum incolumitate libertatem; largire cunctis gentibus tranquillitatem ordinis; perfice, ut ab utroque terrae vertice una resonet vox: Sit laus divino Cordi, per quod nobis parta salus: ipsi gloria et honor in saecula. Amen.",
  "en": "Most sweet Jesus, Redeemer of the human race, look down upon us humbly prostrate before Thee. We are Thine, and Thine we wish to be; but to be more surely united with Thee, behold each one of us freely consecrates himself today to Thy Most Sacred Heart. Many indeed have never known Thee; many, too, despising Thy precepts, have rejected Thee. Have mercy on them all, most merciful Jesus, and draw them to Thy Sacred Heart.\n\nBe King, O Lord, not only of the faithful who have never forsaken Thee, but also of the prodigal children who have abandoned Thee; grant that they may quickly return to their Father's house, lest they die of wretchedness and hunger.\n\nBe King of those who are deceived by erroneous opinions, or whom discord keeps aloof, and call them back to the harbour of truth and the unity of faith, so that soon there may be but one flock and one Shepherd.\n\nGrant, O Lord, to Thy Church assurance of freedom and immunity from harm; give peace and order to all nations, and make the earth resound from pole to pole with one cry: Praise to the Divine Heart that wrought our salvation: to It be glory and honour for ever. Amen.",
  "fr": "Très doux Jésus, Rédempteur du genre humain, jetez un regard sur nous, qui sommes humblement prosternés devant votre autel. Nous sommes à Vous, nous voulons être à Vous, et afin de Vous être plus étroitement unis, voici que, en ce jour, chacun de nous se consacre spontanément à votre Sacré-Cœur. Beaucoup ne Vous ont jamais connu ; beaucoup ont méprisé vos commandements et Vous ont renié. Miséricordieux Jésus, ayez pitié des uns et des autres et ramenez-les tous à votre Sacré-Cœur.\n\nSeigneur, soyez le Roi, non seulement des fidèles qui ne se sont jamais éloignés de Vous, mais aussi des enfants prodigues qui Vous ont abandonné ; faites qu'ils rentrent bientôt dans la maison paternelle, pour qu'ils ne périssent pas de misère et de faim.\n\nSoyez le Roi de ceux qui vivent dans l'erreur ou que la discorde a séparés de Vous ; ramenez-les au port de la vérité et à l'unité de la foi, afin que bientôt il n'y ait plus qu'un seul troupeau et qu'un seul pasteur.\n\nAccordez, Seigneur, à votre Église une liberté sûre et sans entraves ; accordez à tous les peuples l'ordre et la paix ; faites que d'un pôle à l'autre une seule voix retentisse : Loué soit le Divin Cœur qui nous a acquis le salut ; à Lui honneur et gloire dans tous les siècles. Ainsi soit-il.",
  "note": "Shorter post-1959 text, distinct from the separate 1923 'O Jesus Christ, I acknowledge Thee as universal King' prayer.",
  "sourceEdition": "Enchiridion abbreviated Latin, traditional English and French witnesses"
});
/**
 * Source-owned complete Laudes Regiae (Royal Praises / Christus vincit).
 * Witness: Vatican papal chant booklet, 7 Oct 2012, pp. 26–41.
 * ICKSP's 2009 catalogue independently lists 'Christus vincit (avec versets
 * pour le pape, l'évêque et les fidèles)', but its full local 2026 booklet
 * has not been identified. Never assert that the exact names/verses below
 * were sung in Mauritius.
 *
 * This presentation follows the four-section 2012 witness, with a neutral
 * N. in place of the then-reigning pope's personal name. English follows
 * the Vatican booklet where attested. French renderings of these petitions
 * are editorial reader aids, not an attested liturgical French edition.
 * Local substitutions, saints and ordering belong to the actual schola.
 */
const LAUDES_CHORUS=Object.freeze({
 la:"Christus vincit, Christus regnat, Christus imperat.",
 en:"Christ conquers, Christ reigns, Christ commands.",
 fr:"Le Christ vainc, le Christ règne, le Christ commande."
});
const LAUDES_EXAUDI=Object.freeze({
 la:"Exaudi, Christe. ℟. Exaudi, Christe.",
 en:"Hear us, O Christ. ℟. Hear us, O Christ.",
 fr:"Exaucez-nous, ô Christ. ℟. Exaucez-nous, ô Christ."
});
// Each entry: [invocation in original Latin, English appellation, French
// appellation, optional Latin plural-response override]. The original order,
// including the two different Saint James invocations, is preserved.
const LRC=(la,en,fr,plural=false)=>Object.freeze({la,en,fr,plural});
export const CHRIST_KING_LAUDES_SECTIONS=Object.freeze([
 Object.freeze({
  id:"church",heading:{la:"I · Pro Ecclesia",en:"I · For the Church",fr:"I · Pour l'Église"},
  petition:{
   la:"Ecclesiae sanctae Dei, supra regnorum fines nectenti animas: salus perpetua.",
   en:"For the holy Church of God, uniting souls beyond the borders of kingdoms: lasting salvation.",
   fr:"À la sainte Église de Dieu qui unit les âmes par-delà les frontières des royaumes : salut perpétuel."
  },response:{la:"tu illam adiuva",en:"come to her aid",fr:"viens à son aide"},
  calls:Object.freeze([
   LRC("Redemptor mundi","Redeemer of the world","Rédempteur du monde"),
   LRC("Sancta Maria","Holy Mary","Sainte Marie"),
   LRC("Sancte Ioannes Baptista","Saint John the Baptist","Saint Jean-Baptiste"),
   LRC("Sancte Michael","Saint Michael","Saint Michel"),
   LRC("Sancte Ioseph","Saint Joseph","Saint Joseph")
  ])
 }),
 Object.freeze({
  id:"pope",heading:{la:"II · Pro Summo Pontifice",en:"II · For the Supreme Pontiff",fr:"II · Pour le Souverain Pontife"},
  petition:{
   la:"N. Summo Pontifici, in unum populos doctrina congreganti, caritate: Pastori gratia, gregi obsequentia.",
   en:"For N., the Supreme Pontiff, gathering peoples in unity through teaching and charity: grace for the Shepherd and obedience for the flock.",
   fr:"Pour N., Souverain Pontife, qui rassemble les peuples dans l'unité par l'enseignement et la charité : grâce au Pasteur et docilité au troupeau."
  },response:{la:"tu illum adiuva",en:"come to his aid",fr:"viens à son aide"},
  calls:Object.freeze([
   LRC("Salvator mundi","Saviour of the world","Sauveur du monde"),
   LRC("Sancte Petre","Saint Peter","Saint Pierre"),
   LRC("Sancte Paule","Saint Paul","Saint Paul")
  ])
 }),
 Object.freeze({
  id:"bishops",heading:{la:"III · Pro Episcopis et fidelibus",en:"III · For the bishops and faithful",fr:"III · Pour les évêques et les fidèles"},
  petition:{
   la:"Episcopis catholicae et apostolicae fidei cultoribus, eorumque curis concreditis fidelibus: vita.",
   en:"For the bishops, guardians of the Catholic and apostolic faith, and for the faithful entrusted to their care: life.",
   fr:"Aux évêques, gardiens de la foi catholique et apostolique, et aux fidèles confiés à leurs soins : vie."
  },response:{la:"tu illos adiuva",en:"come to their aid",fr:"viens à leur aide"},
  calls:Object.freeze([
   LRC("Sancte Andrea","Saint Andrew","Saint André"),
   LRC("Sancte Ioannes","Saint John","Saint Jean"),
   LRC("Sancte Iacobe","Saint James","Saint Jacques"),
   LRC("Sancte Thoma","Saint Thomas","Saint Thomas"),
   LRC("Sancte Philippe","Saint Philip","Saint Philippe"),
   LRC("Sancte Iacobe","Saint James","Saint Jacques"),
   LRC("Sancte Bartholomaee","Saint Bartholomew","Saint Barthélemy"),
   LRC("Sancte Matthae","Saint Matthew","Saint Matthieu"),
   LRC("Sancte Simon","Saint Simon","Saint Simon"),
   LRC("Sancte Thaddae","Saint Thaddeus","Saint Thaddée"),
   LRC("Sancte Matthia","Saint Matthias","Saint Matthias"),
   LRC("Sancta Maria Magdalena","Saint Mary Magdalene","Sainte Marie-Madeleine"),
   LRC("Sancte Stephane","Saint Stephen","Saint Étienne"),
   LRC("Sancte Ignati Antiochene","Saint Ignatius of Antioch","Saint Ignace d'Antioche"),
   LRC("Sancte Laurenti","Saint Lawrence","Saint Laurent"),
   LRC("Sanctae Perpetua et Felicitas","Saint Perpetua and Saint Felicity","Saintes Perpétue et Félicité",true),
   LRC("Sancta Agnes","Saint Agnes","Sainte Agnès"),
   LRC("Sancti Leo et Gregori","Saint Leo and Saint Gregory","Saints Léon et Grégoire",true),
   LRC("Sancte Ambrosi","Saint Ambrose","Saint Ambroise"),
   LRC("Sancte Hieronyme","Saint Jerome","Saint Jérôme"),
   LRC("Sancte Augustine","Saint Augustine","Saint Augustin"),
   LRC("Sancte Athanasi","Saint Athanasius","Saint Athanase"),
   LRC("Sancti Basili et Gregori Nazianzene","Saint Basil and Saint Gregory Nazianzen","Saints Basile et Grégoire de Nazianze",true),
   LRC("Sancte Ioannes Chrysostome","Saint John Chrysostom","Saint Jean Chrysostome"),
   LRC("Sancte Martine","Saint Martin","Saint Martin"),
   LRC("Sancte Francisce de Sales","Saint Francis de Sales","Saint François de Sales")
  ]),
  after:Object.freeze([
   {la:"Rex regum. ℟. Rex noster.",en:"King of kings. ℟. Our King.",fr:"Roi des rois. ℟. Notre Roi."},
   {la:"Spes nostra. ℟. Gloria nostra.",en:"Our hope. ℟. Our glory.",fr:"Notre espérance. ℟. Notre gloire."}
  ])
 }),
 Object.freeze({
  id:"people",heading:{la:"IV · Pro civibus et populis",en:"IV · For the people",fr:"IV · Pour les peuples"},
  petition:{
   la:"Magistratibus et omnibus concivibus nobiscum orantibus: cordis vera quies, votorum effectus.",
   en:"For the authorities and all fellow citizens praying with us: true peace of heart and fulfilment of their intentions.",
   fr:"Pour les autorités et tous nos concitoyens qui prient avec nous : véritable paix du cœur et accomplissement de leurs vœux."
  },response:{la:"tu illos adiuva",en:"come to their aid",fr:"viens à leur aide"},
  calls:Object.freeze([
   LRC("Auxilium christianorum","Help of Christians","Secours des chrétiens"),
   LRC("Sancte Antoni","Saint Anthony","Saint Antoine"),
   LRC("Sancte Benedicte","Saint Benedict","Saint Benoît"),
   LRC("Sancte Bernarde","Saint Bernard","Saint Bernard"),
   LRC("Sancti Francisce et Dominice","Saint Francis and Saint Dominic","Saints François et Dominique",true),
   LRC("Sancte Thoma de Aquino","Saint Thomas Aquinas","Saint Thomas d'Aquin"),
   LRC("Sancte Francisce Xavier","Saint Francis Xavier","Saint François Xavier"),
   LRC("Sancte Ioannes de Avila","Saint John of Avila","Saint Jean d'Ávila"),
   LRC("Sancte Ioannes Maria Vianney","Saint John Vianney","Saint Jean-Marie Vianney"),
   LRC("Sancta Hildegardis Bingensis","Saint Hildegard of Bingen","Sainte Hildegarde de Bingen"),
   LRC("Sancta Catharina Senensis","Saint Catherine of Siena","Sainte Catherine de Sienne"),
   LRC("Sancta Teresia a Iesu","Saint Teresa of Jesus","Sainte Thérèse de Jésus"),
   LRC("Sancta Teresia a Iesu Infante","Saint Thérèse of the Child Jesus","Sainte Thérèse de l'Enfant-Jésus"),
   LRC("Omnes sancti et sanctae Dei","All holy saints of God","Tous les saints et saintes de Dieu",true)
  ])
 })
]);
const LRC_CLOSING=Object.freeze([
 {la:"Ipsi soli imperium, laus et iubilatio, per infinita saecula saeculorum. ℟. Amen.",
  en:"To Him alone be dominion, praise and rejoicing, for endless ages. ℟. Amen.",
  fr:"À Lui seul le pouvoir, la louange et la jubilation, pour les siècles sans fin. ℟. Amen."},
 {la:"Tempora bona habeant! ℟. Tempora bona habeant redempti Sanguine Christi!",
  en:"May they enjoy favourable times! ℟. May those redeemed by Christ's Blood enjoy favourable times!",
  fr:"Qu'ils aient des temps favorables ! ℟. Qu'ils aient des temps favorables, les rachetés par le Sang du Christ !"},
 {la:"Feliciter! ℟. Feliciter! Feliciter!",
  en:"Happily! ℟. Happily! Happily!",
  fr:"Dans la joie ! ℟. Dans la joie ! Dans la joie !"},
 {la:"Pax Christi veniat! ℟. Regnum Christi veniat! Deo gratias! Amen.",
  en:"May the peace of Christ come! ℟. May the reign of Christ come! Thanks be to God! Amen.",
  fr:"Que vienne la paix du Christ ! ℟. Que vienne le règne du Christ ! Rendons grâces à Dieu ! Amen."}
]);
const laudesRespond=(call,section,locale)=>{
 if(locale==="la")return call.plural?"vos illos adiuvate":section.response.la;
 if(locale==="en")return section.response.en;
 return section.response.fr;
};
export function renderRoyalPraisesWitnessText(locale="la"){
 const k=["la","en","fr"].includes(locale)?locale:"la";
 const lines=[LAUDES_CHORUS[k]];
 for(const section of CHRIST_KING_LAUDES_SECTIONS){
  lines.push("",section.heading[k],LAUDES_EXAUDI[k],section.petition[k]);
  for(const call of section.calls)lines.push("℣. "+call[k]+". ℟. "+laudesRespond(call,section,k)+".");
  lines.push(LAUDES_CHORUS[k]);
  for(const line of section.after||[])lines.push("℣. "+line[k]);
 }
 lines.push("",...LRC_CLOSING.map(x=>"℣. "+x[k]));
 return lines.join("\n");
}
export const CHRIST_KING_ROYAL_PRAISES=Object.freeze({
 id:"laudes_regiae_roman_papal_2012",
 title:"Laudes Regiae — complete four-part witness",
 titleFr:"Laudes Regiæ — témoin intégral en quatre parties",
 la:renderRoyalPraisesWitnessText("la"),
 en:renderRoyalPraisesWitnessText("en"),
 fr:renderRoyalPraisesWitnessText("fr"),
 sourceEdition:"Vatican official chant booklet (7 October 2012), pages 26–41; ICKSP chant index (2009) confirms Pope/bishop/faithful verses.",
 sourceStatus:"ATTESTED_2012_WITNESS_NOT_VERIFIED_LOCAL_2026",
 note:"This is the complete four-part 2012 Roman papal witness, not the exact 2026 Mauritius booklet. N. replaces the historical Pope's personal name; saints and petitions may differ by venue. English/French are reading aids, with French translated editorially from the attested Latin; Latin is authoritative."
});
