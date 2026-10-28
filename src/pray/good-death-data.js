// Wave 4 · St Joseph / Good Death / Dying Companion convergence.
// New text is limited to source-locked Roman or French-world-attested material.
// Existing St Joseph, acts, Marian and prayers-for-the-dead texts remain owned by canonical-data.js.

export const GOOD_DEATH_DYING_SOURCES_V384=Object.freeze({
  romanJoseph1922:"https://www.vatican.va/archive/aas/documents/AAS-14-1922-ocr.pdf",
  currentIndulgences:"https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html",
  viaticum:"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_5/v_viaticum%2C_the_last_sacrament_of_the_christian.html",
  frenchInvocations:"https://www.donbosco.press/fr/invocations-usuelles/",
  frenchProficiscere:"https://fr.scribd.com/document/972950430/Manuel-Du-Soldat-Chretien",
  latinProficiscere:"https://librinostri.catholica.cz/download/RitualRom1937-OCR.pdf",
  latinAlternate1963:"https://texts.livemass.net/cgi-bin/horas/Pofficium.pl?caller=1&command=Appendix+Ordo+Commendationis+Animae&lang2=English&version=Monastic+-+1963&votive=C1",
  frenchEarlierWitness:"https://archives.carmeldelisieux.fr/au-carmel-du-temps-de-therese/le-style-de-vie/regle-et-autres-textes-de-base/etapes-de-la-vie-religieuse/priere-de-la-recommandation-de-lame/",
});

export const JESUS_MARY_JOSEPH_V384=Object.freeze({
  title:"Jesus, Mary, Joseph",
  titleFr:"Jésus, Marie, Joseph",
  en:`Jesus, Mary, Joseph, I give you my heart and my soul.

Jesus, Mary, Joseph, assist me in my last agony.

Jesus, Mary, Joseph, may I sleep and rest in peace with you.`,
  la:`Iesu, Maria, Ioseph, vobis cor et animam meam dono.

Iesu, Maria, Ioseph, adstate mihi in extremo agone.

Iesu, Maria, Ioseph, in pace vobiscum dormiam et requiescam.`,
  fr:`Jésus, Marie, Joseph, je vous donne mon cœur et mon âme.

Jésus, Marie, Joseph, assistez-moi dans ma dernière agonie.

Jésus, Marie, Joseph, qu’en paix avec vous je trouve mon sommeil et mon repos.`,
  note:"The three invocations were inserted into the Roman prayers at death in 1922; they also remain among the current Enchiridion's customary invocations.",
});

export const PROFICISCERE_V384=Object.freeze({
  title:"Go forth, Christian soul · Proficiscere",
  titleFr:"Partez de ce monde, âme chrétienne · Proficiscere",
  en:`Go forth, Christian soul, from this world, in the name of God the Father almighty, who created thee; in the name of Jesus Christ, Son of the living God, who suffered for thee; in the name of the Holy Spirit, who was poured forth upon thee; in the name of the glorious and holy Virgin Mary, Mother of God; in the name of blessed Joseph, spouse of the same Virgin; in the name of the Angels and Archangels; in the name of the Thrones and Dominations; in the name of the Principalities and Powers; in the name of the Virtues, Cherubim and Seraphim; in the name of the Patriarchs and Prophets; in the name of the holy Apostles and Evangelists; in the name of the holy Martyrs and Confessors; in the name of the holy Monks and Hermits; in the name of the holy Virgins and of all the Saints of God. May thy place today be in peace, and thy dwelling in holy Sion. Through Christ our Lord. Amen.`,
  la:`Proficiscere, anima christiana, de hoc mundo, in nomine Dei Patris omnipotentis, qui te creavit; in nomine Iesu Christi Filii Dei vivi, qui pro te passus est; in nomine Spiritus Sancti, qui in te effusus est; in nomine gloriosæ et sanctæ Dei Genitricis Virginis Mariæ; in nomine beati Ioseph, inclyti eiusdem Virginis Sponsi; in nomine Angelorum et Archangelorum; in nomine Thronorum et Dominationum; in nomine Principatuum et Potestatum; in nomine Virtutum, Cherubim et Seraphim; in nomine Patriarcharum et Prophetarum; in nomine sanctorum Apostolorum et Evangelistarum; in nomine sanctorum Martyrum et Confessorum; in nomine sanctorum Monachorum et Eremitarum; in nomine sanctarum Virginum et omnium Sanctorum et Sanctarum Dei: hodie sit in pace locus tuus, et habitatio tua in sancta Sion. Per Christum Dominum nostrum. Amen.`,
  fr:`Partez de ce monde, âme chrétienne, au nom de Dieu le Père tout-puissant, qui vous a créée; au nom de Jésus-Christ, Fils du Dieu vivant, qui a souffert pour vous; au nom de l’Esprit-Saint, qui est descendu sur vous; au nom de la glorieuse et sainte Vierge Marie, Mère de Dieu; au nom du bienheureux Joseph, illustre Époux de cette même Vierge; au nom des Anges et des Archanges; au nom des Trônes et des Dominations; au nom des Principautés et des Puissances; au nom des Vertus, des Chérubins et des Séraphins; au nom des Patriarches et des Prophètes; au nom des saints Apôtres et Évangélistes; au nom des saints Martyrs et Confesseurs; au nom des saints Moines et Solitaires; au nom des Vierges saintes; au nom de tous les Saints et de toutes les Saintes de Dieu. Que votre demeure soit aujourd’hui dans la paix et votre habitation dans la sainte Sion. Par Jésus-Christ Notre-Seigneur. Ainsi soit-il.`,
  note:"Latin sequence agrees with the 1922 Holy See insertion of the Virgin Mary and St Joseph and a 1937 Roman Ritual OCR transcription, including Virtues. English and French are readable editorial renderings aligned with this post-1922 Latin order; the accessible earlier Carmel French form is before those additions. Do not claim a fully collated 1962 typical edition or that the French editorial insertions are a verbatim historical printed witness.",
  edition:"RITUALE_ROMANUM_1937_POST_1922_ORDER_LATIN_OCR_CHECKED_1962_EXACT_EDITION_PENDING",
  languageStatus:"LATIN_POST_1922_EVIDENCE_EN_FR_EDITORIAL_ALIGNED_HISTORIC_TRANSLATION_NOT_PROVEN",
});

export const GOOD_DEATH_DYING_V384=Object.freeze({
  sources:GOOD_DEATH_DYING_SOURCES_V384,
  aspirations:JESUS_MARY_JOSEPH_V384,
  proficiscere:PROFICISCERE_V384,
  currentIndulgence:Object.freeze({
    en:"When a priest administers the sacraments to a faithful person in danger of death, he should also impart the Apostolic Blessing with its plenary indulgence. If a priest cannot be obtained, the Church grants a plenary indulgence at the point of death to a properly disposed faithful person who habitually prayed during life; in that case the Church supplies the three conditions normally required. The use of a crucifix or cross is commended. This indulgence may be gained even if another plenary indulgence was gained the same day.",
    fr:"Lorsqu’un prêtre administre les sacrements à un fidèle en danger de mort, il doit aussi lui donner la Bénédiction apostolique avec l’indulgence plénière qui y est attachée. Si un prêtre ne peut être obtenu, l’Église accorde au fidèle dûment disposé une indulgence plénière à l’article de la mort, pourvu qu’il ait eu l’habitude de prier durant sa vie; dans ce cas l’Église supplée aux trois conditions ordinairement requises. L’usage d’un crucifix ou d’une croix est recommandé. Cette indulgence peut être gagnée même si une autre indulgence plénière a déjà été obtenue le même jour.",
  }),
});
