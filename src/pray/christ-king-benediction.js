/** Christ the King local celebration supplements. Not a mandatory rite or independent reader. */
export const CHRIST_KING_WITNESSES=Object.freeze({
  "feast": "https://www.institute-christ-king.org/resources/sacred-music",
  "decree": "https://www.newadvent.org/library/docs_pi11qp.htm",
  "consecrationLatin": "https://preces-latinae.org/thesaurus/Filius/IesuDRedempt.html",
  "consecrationFrench": "https://www.icrsp.org/Publicationsbis/Revue-2019/01-40.pdf",
  "consecrationEnglish": "https://www.catholicculture.org/culture/liturgicalyear/prayers/view.cfm?id=920",
  "royalPraises": "https://www.vatican.va/news_services/liturgy/libretti/2012/20121007.pdf",
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
export const CHRIST_KING_ROYAL_PRAISES=Object.freeze({
  "la": "Christus vincit! Christus regnat! Christus imperat!\n\nExaudi, Christe! Exaudi, Christe!",
  "en": "Christ conquers! Christ reigns! Christ commands!\n\nHear us, O Christ! Hear us, O Christ!",
  "fr": "Le Christ est vainqueur ! Le Christ règne ! Le Christ commande !\n\nExaucez-nous, ô Christ ! Exaucez-nous, ô Christ !",
  "note": "Only the repeated acclamations: full Laudes Regiae names and petitions vary by occasion."
});
