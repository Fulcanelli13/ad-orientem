// Shared reusable liturgical sung words, not a composer-specific duplicated text.
// Latin and new editorial EN/FR are stored once per stable text/translation form.
// Different work editions map onto these units in their actual textual order;
// additional textual variants require new source-scoped units, never silently
// replacing an appointed 1962 Mass Proper or Gregorian Schola track.
// Music can repeat a unit arbitrarily without copying its translations.
// Source comparison witnesses:
// https://daytonperformingarts.org/program-note-faures-requiem/
// https://repertoire.crccm.org/display?id=6222498c5817fa69c96b5ad7
// https://oxfordsong.org/song/agnus-dei
export const SHARED_REQUIEM_TEXT_UNITS=Object.freeze({
  "REQ.INTROIT.001": {
    "latin": "Requiem aeternam dona eis, Domine.",
    "en": "Grant them eternal rest, O Lord.",
    "fr": "Donnez-leur le repos éternel, Seigneur.",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.INTROIT.002": {
    "latin": "et lux perpetua luceat eis.",
    "en": "And let perpetual light shine upon them.",
    "fr": "Et que la lumière perpétuelle brille sur eux.",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.INTROIT.003": {
    "latin": "Te decet hymnus, Deus, in Sion,",
    "en": "A hymn of praise is fitting for you, O God, in Sion,",
    "fr": "À vous convient la louange, ô Dieu, dans Sion,",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.INTROIT.004": {
    "latin": "et tibi reddetur votum in Jerusalem.",
    "en": "and to you shall the vow be fulfilled in Jerusalem.",
    "fr": "et l'on accomplira envers vous son vœu à Jérusalem.",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.INTROIT.005": {
    "latin": "Exaudi orationem meam;",
    "en": "Hear my prayer;",
    "fr": "Exaucez ma prière ;",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.INTROIT.006": {
    "latin": "ad te omnis caro veniet.",
    "en": "to you shall all flesh come.",
    "fr": "vers vous viendra toute chair.",
    "section": "INTROIT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.KYRIE.001": {
    "latin": "Kyrie eleison.",
    "en": "Lord, have mercy.",
    "fr": "Seigneur, prenez pitié.",
    "section": "KYRIE",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.KYRIE.002": {
    "latin": "Christe eleison.",
    "en": "Christ, have mercy.",
    "fr": "Ô Christ, prenez pitié.",
    "section": "KYRIE",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.001": {
    "latin": "O Domine Jesu Christe, Rex gloriae,",
    "en": "O Lord Jesus Christ, King of glory,",
    "fr": "Ô Seigneur Jésus-Christ, Roi de gloire,",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.002": {
    "latin": "libera animas defunctorum",
    "en": "deliver the souls of the departed",
    "fr": "délivrez les âmes des défunts",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.003": {
    "latin": "de poenis inferni et de profundo lacu.",
    "en": "from the pains of hell and from the deep abyss.",
    "fr": "des peines de l'enfer et de l'abîme profond.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.004": {
    "latin": "libera animas defunctorum de ore leonis,",
    "en": "deliver the souls of the departed from the lion's mouth,",
    "fr": "délivrez les âmes des défunts de la gueule du lion,",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.005": {
    "latin": "ne absorbeat Tartarus,",
    "en": "lest the abyss swallow them,",
    "fr": "afin que l'abîme ne les engloutisse pas,",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.006": {
    "latin": "ne cadant in obscurum.",
    "en": "lest they fall into darkness.",
    "fr": "et qu'elles ne tombent pas dans les ténèbres.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.007": {
    "latin": "Hostias et preces tibi, Domine,",
    "en": "Sacrifices and prayers to you, O Lord,",
    "fr": "Des sacrifices et des prières, Seigneur,",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.008": {
    "latin": "laudis offerimus.",
    "en": "we offer in praise.",
    "fr": "nous vous offrons en louange.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.009": {
    "latin": "Tu suscipe pro animabus illis",
    "en": "Receive them on behalf of those souls",
    "fr": "Recevez-les pour les âmes de ceux",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.010": {
    "latin": "quarum hodie memoriam facimus.",
    "en": "whom we commemorate today.",
    "fr": "dont nous faisons mémoire aujourd'hui.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.011": {
    "latin": "Fac eas, Domine, de morte transire ad vitam,",
    "en": "Grant, O Lord, that they may pass from death to life,",
    "fr": "Faites, Seigneur, qu'elles passent de la mort à la vie,",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.012": {
    "latin": "quam olim Abrahae promisisti et semini ejus.",
    "en": "which you promised long ago to Abraham and his descendants.",
    "fr": "que vous avez jadis promise à Abraham et à sa descendance.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.OFFERTORY.013": {
    "latin": "Amen.",
    "en": "Amen.",
    "fr": "Amen.",
    "section": "OFFERTORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.SANCTUS_BENEDICTUS.001": {
    "latin": "Sanctus, Sanctus, Sanctus,",
    "en": "Holy, holy, holy,",
    "fr": "Saint, saint, saint,",
    "section": "SANCTUS_BENEDICTUS",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.SANCTUS_BENEDICTUS.002": {
    "latin": "Dominus Deus Sabaoth.",
    "en": "Lord God of hosts.",
    "fr": "le Seigneur Dieu des armées.",
    "section": "SANCTUS_BENEDICTUS",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.SANCTUS_BENEDICTUS.003": {
    "latin": "Pleni sunt caeli et terra gloria tua.",
    "en": "Heaven and earth are full of your glory.",
    "fr": "Le ciel et la terre sont remplis de votre gloire.",
    "section": "SANCTUS_BENEDICTUS",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.SANCTUS_BENEDICTUS.004": {
    "latin": "Hosanna in excelsis.",
    "en": "Hosanna in the highest.",
    "fr": "Hosanna au plus haut des cieux.",
    "section": "SANCTUS_BENEDICTUS",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.PIE_JESU_SEQUENCE_EXCERPT.001": {
    "latin": "Pie Jesu, Domine,",
    "en": "Merciful Jesus, Lord,",
    "fr": "Doux Jésus, Seigneur,",
    "section": "PIE_JESU_SEQUENCE_EXCERPT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.PIE_JESU_SEQUENCE_EXCERPT.002": {
    "latin": "dona eis requiem.",
    "en": "grant them rest.",
    "fr": "donnez-leur le repos.",
    "section": "PIE_JESU_SEQUENCE_EXCERPT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.PIE_JESU_SEQUENCE_EXCERPT.003": {
    "latin": "dona eis sempiternam requiem.",
    "en": "grant them everlasting rest.",
    "fr": "donnez-leur le repos éternel.",
    "section": "PIE_JESU_SEQUENCE_EXCERPT",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.AGNUS_DEI.001": {
    "latin": "Agnus Dei, qui tollis peccata mundi,",
    "en": "Lamb of God, who takes away the sins of the world,",
    "fr": "Agneau de Dieu, qui enlevez les péchés du monde,",
    "section": "AGNUS_DEI",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.COMMUNION.001": {
    "latin": "Lux aeterna luceat eis, Domine,",
    "en": "May eternal light shine upon them, O Lord,",
    "fr": "Que la lumière éternelle brille sur eux, Seigneur,",
    "section": "COMMUNION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.COMMUNION.002": {
    "latin": "cum sanctis tuis in aeternum, quia pius es.",
    "en": "with your saints for ever, for you are merciful.",
    "fr": "avec vos saints pour l'éternité, car vous êtes miséricordieux.",
    "section": "COMMUNION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.COMMUNION.003": {
    "latin": "Requiem aeternam dona eis, Domine,",
    "en": "Grant them eternal rest, O Lord,",
    "fr": "Donnez-leur le repos éternel, Seigneur,",
    "section": "COMMUNION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.COMMUNION.004": {
    "latin": "et lux perpetua luceat eis.",
    "en": "and let perpetual light shine upon them.",
    "fr": "et que la lumière perpétuelle brille sur eux.",
    "section": "COMMUNION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.001": {
    "latin": "Libera me, Domine, de morte aeterna,",
    "en": "Deliver me, O Lord, from eternal death,",
    "fr": "Délivrez-moi, Seigneur, de la mort éternelle,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.002": {
    "latin": "in die illa tremenda,",
    "en": "on that dreadful day,",
    "fr": "en ce jour redoutable,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.003": {
    "latin": "quando caeli movendi sunt et terra,",
    "en": "when the heavens and the earth shall be shaken,",
    "fr": "quand les cieux et la terre seront ébranlés,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.004": {
    "latin": "dum veneris judicare saeculum per ignem.",
    "en": "when you come to judge the world by fire.",
    "fr": "lorsque vous viendrez juger le monde par le feu.",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.005": {
    "latin": "Tremens factus sum ego, et timeo,",
    "en": "I tremble and am afraid,",
    "fr": "Je tremble et je crains,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.006": {
    "latin": "dum discussio venerit, atque ventura ira.",
    "en": "as the judgment approaches and the wrath to come.",
    "fr": "quand viendront le jugement et la colère à venir.",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.007": {
    "latin": "Dies illa, dies irae,",
    "en": "That day, a day of wrath,",
    "fr": "Ce jour-là, jour de colère,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.008": {
    "latin": "calamitatis et miseriae,",
    "en": "of calamity and misery,",
    "fr": "de calamité et de misère,",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.ABSOLUTION_RESPONSORY.009": {
    "latin": "dies illa, dies magna et amara valde.",
    "en": "that day, great and exceedingly bitter.",
    "fr": "ce jour, si grand et si amer.",
    "section": "ABSOLUTION_RESPONSORY",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.001": {
    "latin": "In paradisum deducant angeli;",
    "en": "May the angels lead you into paradise;",
    "fr": "Que les anges vous conduisent au paradis ;",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.002": {
    "latin": "in tuo adventu suscipiant te martyres",
    "en": "may the martyrs receive you at your arrival",
    "fr": "qu'à votre arrivée les martyrs vous accueillent",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.003": {
    "latin": "et perducant te in civitatem sanctam Jerusalem.",
    "en": "and bring you to the holy city of Jerusalem.",
    "fr": "et vous conduisent jusqu'à la ville sainte de Jérusalem.",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.004": {
    "latin": "Chorus angelorum te suscipiat,",
    "en": "May the choir of angels receive you,",
    "fr": "Que le chœur des anges vous accueille,",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.005": {
    "latin": "et cum Lazaro, quondam paupere,",
    "en": "and with Lazarus, once a poor man,",
    "fr": "et qu'avec Lazare, autrefois pauvre,",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  },
  "REQ.FUNERAL_PROCESSION.006": {
    "latin": "aeternam habeas requiem.",
    "en": "may you have eternal rest.",
    "fr": "vous possédiez le repos éternel.",
    "section": "FUNERAL_PROCESSION",
    "authority": "EDITORIAL_SUNG_WORDS_NOT_CANONICAL_MASS_OVERRIDE"
  }
});
export const REQUIEM_TEXT_TRACK_XWALK=Object.freeze({
 INTROIT:"INTROIT",KYRIE:"KYRIE",OFFERTORY:"OFFERTORY",
 SANCTUS_BENEDICTUS:"SANCTUS_BENEDICTUS",PIE_JESU_SEQUENCE_EXCERPT:null,
 AGNUS_DEI:"AGNUS_DEI",COMMUNION:"COMMUNION",
 ABSOLUTION_RESPONSORY:null,FUNERAL_PROCESSION:null
});
// An exact textual match is needed before using an existing R17/Proper source.
// Crosswalk is a navigation hint only, NEVER a claim that every composer's
// text, order or repetitions match the 1962 rite.
export function sharedRequiemTextUnit(id){return SHARED_REQUIEM_TEXT_UNITS[id]??null;}
