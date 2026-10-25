/**
 * Optional Christ the King additions to an existing Eucharistic Benediction.
 * This is not a new universal or ICKSP-specific rite. The local celebrant
 * determines which sung prayers occur and their actual timing.
 *
 * Sources:
 * - Pius XI, Quas primas §28 (1925), annual dedication.
 * - Institute of Christ the King, Revue du séminaire St-Philippe-Néri (2019):
 *   published short-form consecration in French, not the Institute's *own*
 *   institutional consecration.
 * - Enchiridion Indulgentiarum (1999), actus dedicationis; modern short text.
 * - Royal Praises / Laudes Regiae: multiple local variants; the common
 *   Christus vincit refrain is shown, not a falsely standardised full litany.
 */
export const CHRIST_KING_CONSECRATION=Object.freeze({
 id:"benediction_christ_king_humani_generis",
 title:"Dedication of the Human Race to the Sacred Heart",
 titleFr:"Consécration du genre humain au Sacré-Cœur",
 en:`Most sweet Jesus, Redeemer of the human race, look down upon us humbly prostrate before Thee. We are Thine, and Thine we wish to be; but to be more surely united with Thee, behold each one of us freely consecrates himself today to Thy most Sacred Heart.

Many indeed have never known Thee; many too, despising Thy precepts, have rejected Thee. Have mercy on them all, most merciful Jesus, and draw them to Thy Sacred Heart.

Be Thou King, O Lord, not only of the faithful who have never forsaken Thee, but also of the prodigal children who have abandoned Thee. Grant that they may quickly return to their Father's house, lest they die of wretchedness and hunger.

Be Thou King of those who are deceived by erroneous opinions or whom discord keeps aloof. Call them back to the harbour of truth and unity of faith, so that soon there may be but one flock and one Shepherd.

Grant, O Lord, to Thy Church assurance of freedom and immunity from harm; give peace and order to all nations, and make the earth resound from pole to pole with one cry: Praise to the Divine Heart that wrought our salvation; to It be glory and honour for ever and ever. Amen.`,
 fr:`Très doux Jésus, Rédempteur du genre humain, jetez un regard sur nous, qui sommes humblement prosternés devant votre autel. Nous sommes à Vous, nous voulons être à Vous, et afin de Vous être plus étroitement unis, voici que, en ce jour, chacun de nous se consacre spontanément à votre Sacré-Cœur.

Beaucoup ne Vous ont jamais connu ; beaucoup ont méprisé vos commandements et Vous ont renié. Miséricordieux Jésus, ayez pitié des uns et des autres et ramenez-les tous à votre Sacré-Cœur.

Seigneur, soyez le Roi, non seulement des fidèles qui ne se sont jamais éloignés de Vous, mais aussi des enfants prodigues qui Vous ont abandonné ; faites qu’ils rentrent bientôt dans la maison paternelle pour qu’ils ne périssent pas de misère et de faim.

Soyez le Roi de ceux qui vivent dans l’erreur ou que la discorde a séparés de Vous ; ramenez-les au port de la vérité et à l’unité de la foi, afin que bientôt il n’y ait plus qu’un seul troupeau et un seul pasteur.

Accordez, Seigneur, à votre Église une liberté sûre et sans entraves ; accordez à tous les peuples l’ordre et la paix ; faites que d’un pôle à l’autre une seule voix retentisse : Loué soit le divin Cœur qui nous a acquis le salut ; à Lui honneur et gloire dans tous les siècles. Ainsi soit-il.`,
 la:`Iesu dulcissime, Redemptor humani generis, respice nos ante conspectum tuum humillime provolutos. Tui sumus, tui esse volumus; quo autem tibi coniuncti firmius esse possimus, en hodie sacratissimo Cordi tuo se quisque nostrum sponte dedicat.

Te quidem multi novere numquam; te, spretis mandatis tuis, multi repudiarunt. Miserere utrorumque, benignissime Iesu, atque ad sanctum Cor tuum rape universos.

Rex esto, Domine, nec fidelium tantum qui nullo tempore discessere a te, sed etiam prodigorum filiorum qui te reliquerunt: fac ut domum paternam cito repetant, ne miseria et fame pereant.

Rex esto eorum, quos aut opinionum error deceptos habet aut discordia separatos, eosque ad portum veritatis atque ad unitatem fidei revoca, ut brevi fiat unum ovile et unus pastor.

Largire, Domine, Ecclesiae tuae securam cum incolumitate libertatem; largire cunctis gentibus tranquillitatem ordinis; perfice, ut ab utroque terrae vertice una resonet vox: Sit laus divino Cordi, per quod nobis parta salus: ipsi gloria et honor in saecula. Amen.`,
 source:"Institute of Christ the King (French, 2019); Enchiridion Indulgentiarum (Latin)",
 sourceUrl:"https://www.icrsp.org/Publicationsbis/Revue-2019/01-40.pdf",
 note:"Published short form; the 1927 historical form includes additional invocations. Actual locally recited edition to be confirmed.",
 sourceStatus:"SOURCE_LINKED_EDITION_COMPARISON_PENDING",
 provenance:Object.freeze({
   work:"Actus dedicationis humani generis Iesu Christo Regi",
   witness:"ICRSP Séminaire Saint-Philippe-Néri, 2019 (French); Latin Enchiridion Indulgentiarum 1999; English historically attested short form",
   url:"https://www.icrsp.org/Publicationsbis/Revue-2019/01-40.pdf",
   quality:"SOURCE_LINKED_EDITION_COMPARISON_PENDING",
   languages:{la:"SOURCE_LINKED",fr:"SOURCE_LINKED",en:"SOURCE_LINKED"}
 })
});
export const CHRIST_KING_SOURCES=Object.freeze({
 encyclical:"https://www.vatican.va/content/pius-xi/en/encyclicals/documents/hf_p-xi_enc_11121925_quas-primas.html",
 consecration:"https://www.icrsp.org/Publicationsbis/Revue-2019/01-40.pdf",
 original1927:"https://www.vatican.va/archive/aas/documents/AAS-19-1927-ocr.pdf",
 laudes:"https://www.vatican.va/news_services/liturgy/libretti/2025/20250518-libretto-inizio-ministero-petrino.pdf",
 litany:"https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html"
});
export const CHRIST_KING_OPTION_IDS=Object.freeze(["procession","royal","litany","consecration"]);
export const CHRIST_KING_DEFAULT=Object.freeze({enabled:false,procession:true,royal:true,litany:false,consecration:true});
export const CHRIST_KING_STAGE_NAMES=Object.freeze({
 procession:["Eucharistic procession","Procession eucharistique"],
 royal:["Christus vincit · Royal Praises","Christus vincit · Laudes Regiæ"],
 litany:["Litany of the Sacred Heart","Litanies du Sacré-Cœur"],
 consecration:["Consecration of the Human Race","Consécration du genre humain"]
});
export function christKingBenedictionStages(base,options){
 if(!options?.enabled)return base;
 const extra=CHRIST_KING_OPTION_IDS.filter(k=>options[k]).map(k=>[k,...CHRIST_KING_STAGE_NAMES[k]]);
 // Every optional addition precedes Tantum ergo. The fixed Eucharistic
 // blessing / reposition order never changes.
 const split=base.findIndex(x=>x[0]==="hymn");
 if(split<0)throw new Error("Canonical Benediction hymn not found");
 return [...base.slice(0,split),...extra,...base.slice(split)];
}
