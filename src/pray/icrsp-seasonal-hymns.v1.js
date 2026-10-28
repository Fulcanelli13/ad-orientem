/**
 * ICRSP France seven accepted Office hymn selections / eight Latin recensions.
 * Hymn Latin is historical public-domain liturgical text. No current ICRSP
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
{subtitleFr:"Vêpres du Temps de la Passion",rubric:"Kneel for O Crux, ave in the source rubric.",rubricFr:"La strophe « O Crux, ave » se dit à genoux selon la rubrique donnée."}),
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
{subtitleFr:"Vêpres du Carême"}),
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
{subtitleFr:"Vêpres du Temps Pascal · révision du Bréviaire romain",recension:"ROMAN_BREVIARY_AFTER_1632"}),
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
{subtitleFr:"Vêpres du Temps Pascal · hymne antérieure à 1632",recension:"PRE_1632_CONDITIONAL",
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
{subtitleFr:"Matines de l’Ascension"}),
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
{subtitleFr:"Laudes du Temps de la Passion"}),
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
{subtitleFr:"Laudes du Carême",sourceLabel:"ICRSP France · Laudes · First Sunday of Lent Office"}),
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
{subtitleFr:"Matines du Carême"})
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
