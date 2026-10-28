/**
 * ICRSP France seven accepted Office hymn selections / eight Latin recensions.
 * Historical English editions derive from Caswall 1849 where explicitly attributed.\n * Hymn Latin is historical public-domain liturgical text. No current ICRSP
 * French translation is reproduced. Hours are indications of traditional
 * Office placement, not unconditional calendar scheduling.
 * PRE-1632 Ad cenam: 1912 Antiphonale notes use where right/custom/indult allows.
 */
const F=Object.freeze;
const h=(id,title,season,office,la,sourceUrl,extra={})=>F({
  id,title,subtitle:office+" · "+season,subtitleFr:extra.subtitleFr||office+" · "+season,
  season,office,la,sourceUrl,sourceLabel:"ICRSP France · historical Roman Office Latin",
  languageStatus:"HISTORIC_LATIN_ONLY_EN_FR_SOURCE_REQUIRED",
  sourceKind:"ICRSP_PUBLISHED_HISTORICAL_LATIN",
  ...extra
});
export const ICRSP_SEASONAL_HYMNS_V1=F({
  vexilla_regis:h("vexilla_regis","Vexilla Regis","Passiontide","Vespers",
`Vexílla Regis pródeunt:
Fulget Crucis mystérium,
Qua vita mortem pértulit,
Et morte vitam prótulit.

Quæ, vulneráta lánceæ
Mucróne diro, críminum
Ut nos laváret sórdibus,
Manávit unda et sánguine.

Impléta sunt quæ cóncinit
David fidéli cármine,
Dicéndo natiónibus:
Regnávit a ligno Deus.

Arbor decóra et fúlgida,
Ornáta Regis púrpura,
Elécta digno stípite
Tam sancta membra tángere.

Beáta, cuius bráchiis
Prétium pepéndit sǽculi,
Statéra facta córporis,
Tulítque prædam tártari.

O Crux, ave, spes única,
Hoc Passiónis témpore
Piis adáuge grátiam,
Reísque dele crímina.

Te, fons salútis, Trínitas,
Colláudet omnis spíritus:
Quibus Crucis victóriam
Largíris, adde prǽmium.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=a0901_ancien",
{en:`Forth comes the Standard of the King:
All hail, thou Mystery ador'd!
Hail, Cross! on which the Life Himself
Died, and by death our life restor'd.

On which our Saviour's holy side,
Rent open with a cruel spear,
Of blood and water pour'd a stream,
To wash us from defilement clear.

O sacred Wood! in thee fulfill'd
Was holy David's truthful lay;
Which told the world, that from a Tree
The Lord should all the nations sway.

Most royally empurpled o'er,
How beauteously thy stem doth shine!
How glorious was its lot to touch
Those limbs so holy and divine!

Thrice blest, upon whose arms outstretch'd
The Saviour of the world reclin'd;
Balance sublime! upon whose beam
Was weigh'd the ransom of mankind.

Hail, Cross! thou only hope of man,
Hail on this holy Passion-day!
To saints increase the grace they have;
From sinners purge their guilt away.

Salvation's spring, blest Trinity,
Be praise to Thee through earth and skies:
Thou through the Cross the victory
Dost give; oh, also give the prize!`,englishSource:{"work":"Edward Caswall, Lyra Catholica, London: James Burns, 1849","printedPages":"89–90","pdfPagesZeroBased":[126,127],"url":"https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf","witnessStatus":"ORIGINAL_1849_PRINTED_PAGE_IMAGES_INSPECTED"},subtitleFr:"Vêpres du Temps de la Passion",rubric:"Kneel for O Crux, ave in the source rubric.",rubricFr:"La strophe « O Crux, ave » se dit à genoux selon la rubrique donnée.",fr:`L’étendard du Roi s’avance; voici briller le mystère de la Croix, sur laquelle Celui qui est la Vie a souffert la mort, et par cette mort nous a donne la vie.

C’est là que, transpercé du fer cruel d’une lance, son côté épancha l’eau et le sang, pour laver la souillure de nos crimes.

Il s’est accompli, l’oracle de David qui, dans ses vers inspirés, avait dit aux nations : « Dieu régnera par le bois. »

Tu es beau, tu es éclatant, arbre paré de la pourpre du Roi; noble tronc appelé à l’honneur de toucher des membres si sacrés.

Heureux es-tu d’avoir porté, suspendu à tes bras, celui qui fut le prix du monde ! Tu es la balance où fut pesé ce corps, notre rançon; tu as enlevé à l’enfer sa proie.

Salut, ô Croix, notre unique espérance ! En ces jours de la Passion du Sauveur, accrois la grâce dans le juste, efface le crime du pécheur.

Que toute âme vous glorifie, ô Trinité, principe de notre salut ; vous nous donnez la victoire par la Croix : daignez y ajouter la récompense. Amen.`,frenchSource:{"work":"Dom Prosper Guéranger, L’Année liturgique, La Passion et la Semaine Sainte, 19e édition (1904)","editionYear":1904,"section":"Prière du soir / Office de Vêpres · Vexilla Regis","url":"https://www.domgueranger.net/lannee-liturgique-passion-et-semaine-sainte-historique-mystique-pratique-et-prieres/","witnessStatus":"TRANSCRIPTION_OF_1904_EDITION_NOT_YET_PHYSICAL_PAGE_COLLATED"},languageStatus:"HISTORIC_LATIN_CASWALL_1849_ENGLISH_GUERANGER_1904_FRENCH"}),
  audi_benigne:h("audi_benigne","Audi, benigne Conditor","Lent","Vespers",
`Audi, benígne Cónditor,
Nostras preces cum flétibus,
In hoc sacro ieiúnio
Fusas quadragenário.

Scrutátor alme córdium,
Infírma tu scis vírium:
Ad te revérsis éxhibe
Remissiónis grátiam.

Multum quidem peccávimus,
Sed parce confiténtibus:
Ad nóminis laudem tui
Confer medélam lánguidis.

Concéde nostrum cónteri
Corpus per abstinéntiam;
Culpæ ut relínquant pábulum
Ieiúna corda críminum.

Præsta, beáta Trínitas,
Concéde, simplex Unitas:
Ut fructuósa sint tuis
Ieiuniórum múnera.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=x9ef3247f_lisible",
{subtitleFr:"Vêpres du Carême",en:`Thou loving Maker of mankind,
Before thy throne we pray and weep;
Oh, strengthen us with grace divine,
Duly this sacred Lent to keep.

Searcher of hearts! Thou dost our ills
Discern, and all our weakness know:
Again to Thee with tears we turn;
Again to us thy mercy shew.

Much have we sinn'd; but we confess
Our guilt, and all our faults deplore:
Oh, for the praise of thy great Name,
Our fainting souls to health restore!

And grant us, while by fasts we strive
This mortal body to control,
To fast from all the food of sin,
And so to purify the soul.

Hear us, O Trinity thrice blest!
Sole Unity! to Thee we cry:
Vouchsafe us from these fasts below
To reap immortal fruit on high.`,englishSource:{work:"Edward Caswall, Lyra Catholica, London: James Burns, 1849",printedPages:"70–71",pdfPagesZeroBased:[107,108],url:"https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf",witnessStatus:"COLLATED_AGAINST_1849_PRINTED_PAGE_IMAGES"},fr:`Créateur plein de bonté, daignez écouter les prières que nous vous offrons avec larmes, au milieu des jeûnes de cette sainte Quarantaine.

Vous qui scrutez le fond des cœurs, vous connaissez notre faiblesse : nous revenons à vous ; donnez-nous la grâce du pardon.

Nous avons beaucoup péché ; pardonnez-nous à cause de notre aveu ; pour la gloire de votre Nom, apportez le remède à nos langueurs.

Faites que la résistance de notre corps soit abattue par l’abstinence, et que notre cœur, soumis à un jeûne spirituel, ne se repaisse plus du péché.

Trinité bienheureuse, Unité parfaite, rendez profitable à vos fidèles le bienfait du jeûne. Amen.`,frenchSource:{work:"Dom Prosper Guéranger, L’Année liturgique, Le Carême, 16e édition (1903)",section:"Vêpres · Audi, benigne Conditor",url:"https://www.domgueranger.net/lannee-liturgique-le-careme-historique-mystique-pratique-prieres/",witnessStatus:"TRANSCRIPTION_OF_1903_EDITION_NOT_YET_PHYSICAL_PAGE_COLLATED"},languageStatus:"HISTORIC_LATIN_CASWALL_1849_ENGLISH_GUERANGER_1903_FRENCH"}),
  ad_regias_agni_dapes:h("ad_regias_agni_dapes","Ad regias Agni dapes","Eastertide","Vespers · Roman Breviary version",
`Ad régias Agni dapes,
Stolis amícti cándidis,
Post tránsitum Maris Rubri,
Christo canámus Príncipi.

Divína cuius cáritas
Sacrum propínat sánguinem,
Almíque membra córporis
Amor sacérdos ímmolat.

Sparsum cruórem póstibus
Vastátor horret Angelus:
Fugítque divísum mare;
Mergúntur hostes flúctibus.

Iam Pascha nostrum Christus est,
Paschális idem víctima,
Et pura puris méntibus
Sinceritátis ázyma.

O vera cæli víctima,
Subiécta cui sunt tártara,
Solúta mortis víncula,
Recépta vitæ prǽmia.

Victor subáctis ínferis,
Trophǽa Christus éxplicat;
Cælóque apérto, súbditum
Regem tenebrárum trahit.

Ut sis perénne méntibus
Paschále, Iesu, gáudium,
A morte dira críminum
Vitæ renátos líbera.

Deo Patri sit glória,
Et Fílio qui a mórtuis
Surréxit ac Paráclito,
In sempitérna sǽcula.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=a0913_ancien",
{en:`Now at the Lamb's high royal feast
In robes of saintly white we sing,
Through the Red Sea in safety brought
By Jesus our immortal King.

O depth of love! for us He drinks
The chalice of his agony;
For us a Victim on the Cross
He meekly lays Him down to die.

And as the avenging Angel pass'd
Of old the blood-besprinkled door;
As the cleft sea a passage gave,
Then clos'd to whelm th' Egyptians o'er:

So Christ, our Paschal Sacrifice,
Has brought us safe all perils through;
While for unleaven'd bread we need
But heart sincere and purpose true.

Hail, purest Victim Heav'n could find,
The powers of Hell to overthrow!
Who didst the chains of Death destroy;
Who dost the prize of Life bestow.

Hail, victor Christ! hail, risen King!
To Thee alone belongs the crown;
Who hast the heavenly gates unbarr'd,
And dragg'd the Prince of darkness down.

O Jesu! from the death of sin
Keep us, we pray; so shalt Thou be
The everlasting paschal joy
Of all the souls new-born in Thee.

Now to the Father, and the Son,
Who rose from death, be glory given;
With Thee, O holy Comforter,
Henceforth by all in earth and Heaven.`,englishSource:{"work":"Edward Caswall, Lyra Catholica, London: James Burns, 1849","printedPages":"94–96","pdfPagesZeroBased":[131,132,133],"url":"https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf","witnessStatus":"ORIGINAL_1849_PRINTED_PAGE_IMAGES_INSPECTED"},subtitleFr:"Vêpres du Temps Pascal · révision du Bréviaire romain",recension:"ROMAN_BREVIARY_AFTER_1632",languageStatus:"HISTORIC_LATIN_AND_CASWALL_1849_ENGLISH_FRENCH_PENDING"}),
  ad_cenam_agni_providi:h("ad_cenam_agni_providi","Ad cenam Agni providi","Eastertide","Vespers · historical pre-1632 form",
`Ad cenam Agni próvidi,
Et stolis albis cándidi,
Post tránsitum maris Rubri
Christo canámus Príncipi.

Cuius corpus sanctíssimum
In ara crucis tórridum,
Cruóre eius róseo
Gustándo vívimus Deo.

Protécti paschæ véspere
A devastánte Angelo,
Erépti de duríssimo
Pharaónis império.

Iam pascha nostrum Christus est,
Qui immolátus agnus est:
Sinceritátis ázyma
Caro eius obláta est.

O vere digna hóstia,
Per quam fracta sunt tártara,
Redémpta plebs captiváta,
Réddita vitæ prǽmia.

Consúrgit Christus túmulo,
Victor redit de bárathro,
Tyránnum trudens vínculo
Et Paradísum réserans.

Quǽsumus, Auctor ómnium,
In hoc pascháli gáudio,
Ab omni mortis ímpetu
Tuum defénde pópulum.

Glória tibi Dómine,
Qui surrexísti a mórtuis,
Cum Patre et almo Spíritu,
In sempitérna sǽcula.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=a0920_ancien",
{en:`The Lamb's high banquet we await
In snow-white robes of royal state:
And now, the Red Sea's channel past,
To Christ our Prince we sing at last.

Upon the Altar of the Cross
His Body hath redeemed our loss:
And tasting of his roseate Blood,
Our life is hid with Him in God.

That Paschal Eve God's arm was bared,
The devastating Angel spared:
By strength of hand our hosts went free
From Pharaoh's ruthless tyranny.

Now Christ, our Paschal Lamb, is slain,
The Lamb of God that knows no stain,
The true Oblation offered here,
Our own unleavened Bread sincere.

O Thou, from whom hell's monarch flies,
O great, O very Sacrifice,
Thy captive people are set free,
And endless life restored in Thee.

For Christ, arising from the dead,
From conquered hell victorious sped,
And thrust the tyrant down to chains,
And Paradise for man regains.

We pray Thee, King with glory decked,
In this our Paschal joy, protect
From all that death would fain effect
Thy ransomed flock, Thine own elect.

To Thee who, dead, again dost live,
All glory, Lord, Thy people give;
All glory, as is ever meet,
To Father and to Paraclete. Amen.`,englishSource:{"work":"The Hymnal Noted, Part I · historical Ad cenam Agni providi rendering","translator":"John Mason Neale (Anglican; 1818–1866)","editionYear":1851,"originalPublication":"The Hymnal Noted, Part I, 1851; 1852 version documents wording changes","sourceTextUrl":"https://www.preces-latinae.org/thesaurus/Hymni/AdCenamAgni.html","url":"https://www.preces-latinae.org/thesaurus/Hymni/AdCenamAgni.html","secondaryHistoricalEvidence":"https://www.hymnologyarchive.com/john-mason-neale","witnessStatus":"HISTORIC_PUBLIC_DOMAIN_ENGLISH_NONCATHOLIC_TRANSLATOR_ORIGINAL_1851_PAGES_NOT_COLLATED","editorialNote":"Historical English devotional rendering of the earlier Latin hymn tradition. Some source Latin verses differ from the exact ICRSP pre-1632 recension. Not a Catholic-authorized Office text and not an English translation of the ordinary post-1632 hymn. Original 1851 pages not visually inspected.","license":"Author died 1866; public-domain historical English translation, not modern editorial arrangement"},languageStatus:"HISTORIC_NEAL_1851_ENGLISH_UNAPPROVED_LITURGICAL_TEXT",subtitleFr:"Vêpres du Temps Pascal · hymne antérieure à 1632",recension:"PRE_1632_CONDITIONAL",
rubric:"The 1912 Antiphonale presents this form only for communities entitled by right, custom or indult. Do not treat it as the ordinary 1962 Roman recension.",
rubricFr:"L’Antiphonaire de 1912 réserve cette forme à ceux qui y ont droit, par coutume ou indult. Ce n’est pas la rédaction ordinaire de 1962."}),
  aeterne_rex_altissime:h("aeterne_rex_altissime","Æterne Rex altissime","Ascension","Matins",
`Æterne Rex altíssime,
Redémptor et fidélium,
Cui mors perémpta détulit
Summæ triúmphum glóriæ:

Ascéndis orbes síderum,
Quo te vocábat cǽlitus
Colláta, non humánitus,
Rerum potéstas ómnium:

Ut trina rerum máchina,
Cæléstium, terréstrium,
Et inferórum cóndita,
Flectat genu iam súbdita.

Tremunt vidéntes Angeli
Versam vicem mortálium:
Peccat caro, mundat caro,
Regnat Deus Dei caro.

Sis ipse nostrum gáudium,
Manens olympo prǽmium,
Mundi regis qui fábricam,
Mundána vincens gáudia.

Hinc te precántes quǽsumus,
Ignósce culpis ómnibus,
Et corda sursum súbleva
Ad te supérna grátia.

Ut, cum repénte cœperis
Clarére nube iúdicis,
Pœnas repéllas débitas,
Reddas corónas pérditas.

Iesu, tibi sit glória,
Qui victor in cælum redis,
Cum Patre, et almo Spíritu,
In sempitérna sǽcula.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=a0938_ancien",
{en:`O Thou eternal King most high!
Who didst the world redeem;
And conquering Death and Hell, receive
A dignity supreme.

Thou, through the starry orbs, this day,
Didst to thy throne ascend;
Thenceforth to reign in sovereign power,
And glory without end.

There, seated in thy majesty,
To Thee submissive bow
The Heav'n of Heav'ns, the spacious earth,
The depths of Hell below.

With trembling there the angels see
The chang'd estate of men;
The flesh which sinn'd by Flesh redeem'd;
Man in the Godhead reign.

There, waiting for thy faithful souls,
Be Thou to us, O Lord!
Our peerless joy while here we stay,
In Heav'n our great reward.

Renew our strength; our sins forgive;
Our miseries efface;
And lift our souls aloft to Thee,
By thy celestial grace.

So, when Thou shinest on the clouds,
With thy angelic train,
May we be sav'd from vengeance due,
And our lost crowns regain.

Glory to Jesus, who returns
Triumphantly to Heaven;
Praise to the Father evermore,
And Holy Ghost be given.`,englishSource:{"work":"Edward Caswall, Lyra Catholica, London: James Burns, 1849","printedPages":"101–102","pdfPagesZeroBased":[138,139],"url":"https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf","witnessStatus":"ORIGINAL_1849_PRINTED_PAGE_IMAGES_INSPECTED"},subtitleFr:"Matines de l’Ascension",languageStatus:"HISTORIC_LATIN_AND_CASWALL_1849_ENGLISH_FRENCH_PENDING"}),
  lustra_sex:h("lustra_sex","Lustra sex","Passiontide","Lauds",
`Lustra sex qui iam peregit,
Tempus implens córporis,
Sponte líbera Redémptor
Passióni deditus,
Agnus in Crucis levátur
Immolándus stipite.

Felle potus ecce languet:
Spina, clavi, láncea
Mite corpus perforárunt:
Unda manat, et cruor:
Terra, pontus, astra, mundus,
Quo lavántur flúmine!

Crux fidélis, inter omnes
Arbor una nóbilis:
Silva talem nulla profert
Fronde, flore, gérmine:
Dulce ferrum, dulce lignum,
Dulce pondus sústinent.

Flecte ramos, arbor alta,
Tensa laxa víscera,
Et rigor lentéscat ille,
Quem dedit natívitas;
Et supérni membra Regis
Tende miti stípite.

Sola digna tu fuísti
Ferre mundi víctimam;
Atque portum præparáre
Arca mundo naufrago,
Quam sacer cruor perúnxit,
Fusus Agni córpore.

Sempitérna sit beátæ
Trinitáti glória,
Æqua Patri, Filióque;
Par decus Paráclito:
Unius Triníque nomen
Laudet univérsitas.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=x628ec868_lisible",
{subtitleFr:"Laudes du Temps de la Passion",en:`And now, six lustral courses run,
His task of love is well nigh done;
The Saviour, of His own free will,
Prepares His Passion to fulfil;
And on the Cross the Victim lies,
Meek, and bound for sacrifice.

Gall His drink, behold Him languish,
While His tender frame with anguish
Thorns, and nails, and javelin fierce,
One by one, acutely pierce;
Till from His wounded side a flood
Of Water flows, with mingled Blood,
Which earth and sea, which world and skies,
From sin's pollution purifies.

O faithful Cross, thou peerless Tree,
No forest yields the like of thee,
Leaf, flower, and bud.
Sweet is the Wood, and sweet its weight,
And sweet the nails which penetrate thee,
Thou sweet Wood.

Bow thy branches, haughty Tree;
Suspend thy wonted cruelty;
Relax thy tightened arms; repress,
For once, thy native stubbornness;
Thy Royal burden gently bear,
And spare our dying God, O spare!

Thou alone wert meet esteemed
Him to bear, who man redeemed;
Thou, unshaken Ark, bedewed
With the Lamb's availing Blood,
Shipwrecked man dost safely guide,
And in port securely hide.

To the Undivided Three
In Heaven be glory, praise,
And honour given, alike to
Father, and to Son, and Paraclete,
The Three in One; yea, let the adoring world
Proclaim of Three and One the glorious Name. Amen.`,englishSource:{"work":"Devotions commemorative of the Most Adorable Passion of Our Lord and Saviour Jesus Christ","imprint":"London: James Burns, 1842","location":"The Reproaches, sung on Good Friday; Pange lingua verses Lustra sex through doxology","printedPages":"lv–lvi","pdfPagesZeroBased":[126,127],"url":"https://upload.wikimedia.org/wikipedia/commons/e/ed/Devotions_commemorative_of_the_most_adorable_Passion_of_Our_Lord_and_Saviour_Jesus_Christ-_translated_from_Catholic_sources_%28IA_DevotionsCommemorativeOf%29.pdf","witnessStatus":"ORIGINAL_1842_BILINGUAL_PRINTED_PAGES_INSPECTED","editorialNote":"Historical English rendering extracted from the 1842 Good Friday hymn; repeated responses compressed into corresponding Crux fidelis stanza for reading, not an independently attested standalone Lauds setting; keep original source linked."},fr:`Après avoir vécu six lustres, le temps de sa vie mortelle approche de son terme ; c’est librement qu’il est descendu pour être notre Rédempteur ; et le jour est venu où cet Agneau est élevé sur l’arbre de la Croix, pour y être immolé.

C’est là qu’on l’abreuve de fiel dans son agonie ; là que les épines, les clous, la lance, déchirent son corps délicat ; l’eau et le sang s’épanchent de sa plaie ; la terre, la mer, les astres, le monde tout entier, reçoivent ce jet qui les purifie.

O Croix, notre espérance, arbre le plus noble de tous ; nulle forêt n’a produit ton pareil pour le feuillage, la fleur et le fruit. Tu nous es cher, ô bois, et plus cher encore le doux fardeau suspendu à tes clous sacrés.

Arbre auguste, laisse fléchir tes rameaux ; soulage, en pliant, les membres tendus de l’Agneau ; amollis cette dureté que la nature t’avait donnée, et sois un lit plus doux pour le corps du souverain Roi.

Seule tu as été trouvée digne de porter entre tes bras la victime du monde ; pour ce monde naufragé, tu as été l’arche qui le ramène au port, toi qui fus inondée du sang divin de l’Agneau.

Gloire éternelle à l’heureuse Trinité ; honneur égal au Père, au Fils, au Paraclet ; louange de la part de tous les êtres à celui qui réunit la Trinité à l’Unité. Amen.`,frenchSource:{"work":"Dom Prosper Guéranger, L’Année liturgique, Jeudi, vendredi et samedi saint","section":"Good Friday Adoration of the Cross · Pange lingua verses, not source-specific Lauds printing","url":"https://www.domgueranger.net/lannee-liturgique-jeudi-vendredi-et-samedi-saint-propre-du-temps/","witnessStatus":"HISTORIC_FRENCH_GOOD_FRIDAY_EXCERPT_ORIGINAL_PRINT_NOT_YET_PHYSICAL_PAGE_COLLATED","secondaryWitness":{"work":"P. Louis Gladu, Les Hymnes du Bréviaire, Québec 1913","pdf":"https://www.liberius.net/livres/Les_hymnes_du_Breviaire_000000919.pdf","pagesZeroBased":[19,20],"status":"PARSED_1913_LAUDS_BILINGUAL_SOURCE_NO_PAGE_IMAGE_CROSSCHECK"},"editorialNote":"Historical French is drawn from the Good Friday Pange lingua with its Crux fidelis refrain rather than an independently collated Lauds printing. Refrains were compressed into matching verse groups for comparison. This is not a critical word-for-word translation of the ICRSP 1962 Lauds recension.","editorialNoteFr":"Cette traduction française historique provient du Pange lingua chanté le Vendredi saint, et non d’une édition des Laudes vérifiée ligne à ligne. Les refrains sont regroupés par strophe ; ce n’est pas une édition critique du texte latin des Laudes de 1962."},languageStatus:"HISTORICAL_LATIN_1842_ENGLISH_GUERANGER_GOOD_FRIDAY_FRENCH"}),
  o_sol_salutis:h("o_sol_salutis","O sol salutis intimis","Lent","Lauds",
`O sol salútis, íntimis,
Iesu, refúlge méntibus,
Dum, nocte pulsa, grátior
Orbi dies renáscitur.

Dans tempus acceptábile,
Da lacrimárum rívulis
Laváre cordis víctimam,
Quam læta adúrat cáritas.

Quo fonte manávit nefas,
Fluent perénnes lácrimæ,
Si virga pœniténtiæ
Cordis rigórem cónterat.

Dies venit, dies tua,
In qua reflórent ómnia:
Lætémur et nos, in viam
Tua redúcti déxtera.

Te prona mundi máchina,
Clemens, adóret, Trínitas,
Et nos novi per grátiam
Novum canámus cánticum.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=a0155_ancien",
{en:`O Jesus, thou Sun of the world's salvation! shine in the depths of our souls; for now is the hour of night's departure, and sweeter daybreak dawns upon the earth.

O thou that givest us this acceptable time! give us to wash, with our tears, the victim we offer thee, which is our heart; and grant that it may burn with joyous love.

If the rod of penance but strike these hearts of stone, a flood of ceaseless tears will flow from that same fount, whence came our many sins.

The day, thine own day, is at hand, when all things bloom afresh; oh! grant, that we, too, may rejoice, being brought once more to the path by thy right hand.

O merciful Trinity! may the world prostrate itself before thee, and adore; and we, made new by grace, sing a new canticle of praise. Amen.`,englishSource:{"work":"Dom Prosper Guéranger, The Liturgical Year, Vol. V: Lent","translator":"Dom Laurence Shepherd","editionYear":1870,"imprint":"Dublin: James Duffy, 1870","section":"Chapter IV · Morning and Night Prayers for Lent · Lenten Lauds hymn","url":"https://lyp.network/lyp/497-commentary-on-the-seasons/501-lent/3639-chapter-4-morning-and-night-prayers-for-lent","originalEdition":"https://en.wikisource.org/wiki/Index:The_liturgical_year_(IA_liturgicalyear05gura).pdf","witnessStatus":"1870_EDITION_COMPLETE_TRANSCRIPTION_PAGE_IMAGES_NOT_CHECKED","textForm":"FIVE_PROSE_PARAGRAPHS"},fr:`O Jésus, soleil de salut, répandez vos rayons au plus intime de notre âme, à cette heure où la nuit ayant disparu, le jour renaît pour réjouir l’univers.

C’est vous qui donnez ce temps favorable ; donnez-nous de laver dans l’eau de nos larmes la victime de notre cœur, et qu’elle devienne un holocauste offert par l’amour.

D’abondantes larmes couleront de la source même d’où sortit le péché, si la verge de la pénitence vient briser la dureté du cœur.

Le jour approche, ce jour qui est à vous, dans lequel tout doit refleurir ; que votre main nous remette dans la voie ; et nous aussi nous serons dans l’allégresse.

Que le monde entier s’humilie devant vous, ô Trinité miséricordieuse ! Renouvelez-nous par votre grâce, et nous vous chanterons un cantique nouveau. Amen.`,frenchSource:{"work":"Dom Prosper Guéranger, L’Année liturgique, Le Carême, seizième édition (1903)","section":"Chapitre IV · Prières du matin et du soir · Laudes du Carême","editionYear":1903,"url":"https://www.domgueranger.net/lannee-liturgique-le-careme-historique-mystique-pratique-prieres/","witnessStatus":"1903_HISTORICAL_EDITION_TRANSCRIPTION_PRINTED_PAGE_UNCHECKED","sourceLines":"Chapter IV, morning prayer, five paragraphs immediately following O sol salutis Latin"},languageStatus:"HISTORICAL_LATIN_SHEPHERD_1870_ENGLISH_GUERANGER_1903_FRENCH",subtitleFr:"Laudes du Carême",sourceLabel:"ICRSP France · Laudes · First Sunday of Lent Office"}),
  ex_more_docti:h("ex_more_docti","Ex more docti mystico","Lent","Matins",
`Ex more docti mýstico
Servémus hoc ieiúnium,
Deno diérum círculo
Ducto quater notíssimo.

Lex et prophétæ prímitus
Hoc prætulérunt, póstmodum
Christus sacrávit, ómnium
Rex atque factor témporum.

Utámur ergo párcius
Verbis, cibis et pótibus,
Somno, iocis, et árctius
Perstémus in custódia.

Vitémus autem nóxia,
Quæ súbruunt mentes vagas:
Nullúmque demus cállidi
Hostis locum tyránnidi.

Flectámus iram víndicem,
Plorémus ante Iúdicem,
Clamémus ore súpplici,
Dicámus omnes cérnui:

Nostris malis offéndimus
Tuam, Deus, cleméntiam:
Effúnde nobis désuper,
Remíssor, indulgéntiam.

Meménto quod sumus tui,
Licet cadúci, plásmatis:
Ne des honórem nóminis
Tui, precámur, álteri.

Laxa malum, quod fécimus,
Auge bonum, quod póscimus:
Placére quo tandem tibi
Possímus hic, et pérpetim.

Præsta, beáta Trínitas,
Concéde, simplex Unitas,
Ut fructuósa sint tuis
Ieiuniórum múnera.
Amen.`,
"https://icrspfrance.fr/textes-liturgiques.php?article=xd82464db_lisible",
{subtitleFr:"Matines du Carême",en:`Now with the slow-revolving year,
Again the Fast we greet;
Which in its mystic circle moves
Of forty days complete.

That Fast, by Law and Prophets taught,
By Jesus Christ restor'd;
Jesus, of seasons and of times
The Maker and the Lord.

Henceforth more sparing let us be
Of food, of words, of sleep;
Henceforth beneath a stricter guard
The roving senses keep.

And let us shun whatever things
Distract the careless heart;
And let us shut the soul against
The tyrant Tempter's art;

And weep before the Judge, and strive
His vengeance to appease;
Saying to Him with contrite voice,
Upon our bended knees:

“Much have we sinn'd, O Lord! and still
We sin each day we live;
Yet pour thy pity from on high,
And of thy grace forgive.

Remember that we still are thine,
Though of a fallen frame;
And take not from us in thy wrath
The glory of thy name.

Undo past evil; grant us, Lord,
More grace to do aright;
So may we now and ever find
Acceptance in thy sight.”

Blest Trinity in Unity!
Vouchsafe us, in thy love,
To gather from these fasts below
Immortal fruit above.`,englishSource:{work:"Edward Caswall, Lyra Catholica, London: James Burns, 1849",printedPages:"72–73",pdfPagesZeroBased:[109,110],url:"https://upload.wikimedia.org/wikipedia/commons/0/0e/Lyra_Catholica-_containing_all_the_Breviary_and_Missal_hymns%2C_with_others_from_various_sources._Translated_by_Edward_Caswall_%28IA_LyraCatholica%29.pdf",witnessStatus:"COLLATED_AGAINST_1849_PRINTED_PAGE_IMAGES"},fr:`Fidèles à la tradition mystérieuse, gardons avec soin ce jeûne célèbre qui parcourt le cercle de quarante journées.

La Loi et les Prophètes l’inaugurèrent autrefois ; auteur et roi de toutes les choses créées, le Christ daigna lui-même le consacrer.

Il nous faut restreindre l’usage de la parole, du manger, du boire, du sommeil et des délassements ; veillons plus strictement sur la garde de nous-mêmes.

Évitons ces périls où succombe l’âme inattentive ; gardons-nous de laisser la moindre entrée à notre tyran perfide.

Fléchissons la colère vengeresse ; pleurons aux pieds de notre juge ; poussons des cris suppliants, et, prosternés devant notre juge, disons-lui :

O Dieu ! par nos péchés, nous avons offensé votre clémence, daignez étendre sur nous votre pardon.

Souvenez-vous que, malgré notre fragilité, nous sommes l’œuvre de vos mains ; ne cédez pas à un autre l’honneur de votre Nom.

Pardonnez-nous le mal que nous avons fait ; donnez-nous avec abondance la grâce que nous implorons, afin que nous puissions vous plaire ici-bas et dans l’éternité.

Trinité bienheureuse, Unité parfaite, rendez profitable à vos fidèles le bienfait du jeûne. Amen.`,frenchSource:{"work":"Dom Prosper Guéranger, L’Année liturgique, Le Carême · Propre du temps","section":"Lenten Matins hymn after Monday of first week","url":"https://www.domgueranger.net/lannee-liturgique-le-careme-propre-du-temps/?lang=en","witnessStatus":"HISTORIC_FRENCH_FULL_TRANSCRIPTION_ORIGINAL_PRINT_NOT_YET_PHYSICAL_PAGE_COLLATED","secondaryWitness":{"work":"P. Louis Gladu, Les Hymnes du Bréviaire, Québec 1913","pdf":"https://www.liberius.net/livres/Les_hymnes_du_Breviaire_000000919.pdf","pagesZeroBased":[12,13],"status":"PARSED_1913_BILINGUAL_PRINT_NO_PAGE_IMAGE_CROSSCHECK"},"editorialNote":"Guéranger's full original French prose corresponds to the historical Lenten Matins hymn. Gladu 1913 separately prints a related French rendering; not identical editorial translations."},languageStatus:"HISTORICAL_LATIN_CASWALL_1849_ENGLISH_GUERANGER_FRENCH"})
});
export const ICRSP_SEASONAL_HYMN_IDS_V1=F(Object.keys(ICRSP_SEASONAL_HYMNS_V1));
export const ICRSP_HYMN_GROUPS_V1=F({
  "icrsp_fr_vexilla_regis":F(["vexilla_regis"]),
  "icrsp_fr_audi_benigne_conditor":F(["audi_benigne"]),
  "icrsp_fr_ad_cenam_agni":F(["ad_regias_agni_dapes","ad_cenam_agni_providi"]),
  "icrsp_fr_aeterne_rex_altissime":F(["aeterne_rex_altissime"]),
  "icrsp_fr_lustra_sex":F(["lustra_sex"]),
  "icrsp_fr_o_sol_salutis":F(["o_sol_salutis"]),
  "icrsp_fr_ex_more_docti":F(["ex_more_docti"])
});
