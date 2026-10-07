// Wave 4 · St Joseph / Good Death / Dying Companion convergence.
// New text is limited to source-locked Roman or French-world-attested material.
// Existing St Joseph, acts, Marian and prayers-for-the-dead texts remain owned by canonical-data.js.

export const GOOD_DEATH_DYING_SOURCES_V384=Object.freeze({
  romanJoseph1922:"https://www.vatican.va/archive/aas/documents/AAS-14-1922-ocr.pdf",
  currentIndulgences:"https://www.vatican.va/roman_curia/tribunals/apost_penit/documents/rc_trib_appen_doc_20020826_enchiridion-indulgentiarum_lt.html",
  viaticum:"https://www.vatican.va/content/catechism/en/part_two/section_two/chapter_two/article_5/v_viaticum%2C_the_last_sacrament_of_the_christian.html",
  frenchInvocations:"https://www.donbosco.press/fr/invocations-usuelles/",
  frenchProficiscere:"https://fr.scribd.com/document/972950430/Manuel-Du-Soldat-Chretien",
  latinProficiscere:"https://texts.livemass.net/cgi-bin/horas/Pofficium.pl?caller=1&command=Appendix+Ordo+Commendationis+Animae&lang2=English&version=Monastic+-+1963&votive=C1",
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
  en:`Go forth, Christian soul, from this world, in the name of God the Father almighty, who created thee; in the name of Jesus Christ, Son of the living God, who suffered for thee; in the name of the Holy Spirit, who was poured forth upon thee; in the name of the Angels and Archangels; in the name of the Thrones and Dominations; in the name of the Principalities and Powers; in the name of the Cherubim and Seraphim; in the name of the Patriarchs and Prophets; in the name of the holy Apostles and Evangelists; in the name of the holy Martyrs and Confessors; in the name of the holy Monks and Hermits; in the name of the holy Virgins and of all the Saints of God. May thy place today be in peace, and thy dwelling in holy Sion. Through Christ our Lord. Amen.`,
  la:`Proficiscere, anima christiana, de hoc mundo, in nomine Dei Patris omnipotentis, qui te creavit; in nomine Iesu Christi Filii Dei vivi, qui pro te passus est; in nomine Spiritus Sancti, qui in te effusus est; in nomine Angelorum et Archangelorum; in nomine Thronorum et Dominationum; in nomine Principatuum et Potestatum; in nomine Cherubim et Seraphim; in nomine Patriarcharum et Prophetarum; in nomine sanctorum Apostolorum et Evangelistarum; in nomine sanctorum Martyrum et Confessorum; in nomine sanctorum Monachorum et Eremitarum; in nomine sanctarum Virginum et omnium Sanctorum et Sanctarum Dei: hodie sit in pace locus tuus, et habitatio tua in sancta Sion. Per Christum Dominum nostrum. Amen.`,
  fr:`Partez de ce monde, âme chrétienne, au nom de Dieu le Père tout-puissant, qui vous a créée; au nom de Jésus-Christ, Fils du Dieu vivant, qui a souffert pour vous; au nom de l’Esprit-Saint, qui est descendu sur vous; au nom des Anges et des Archanges; au nom des Trônes et des Dominations; au nom des Principautés et des Puissances; au nom des Chérubins et des Séraphins; au nom des Patriarches et des Prophètes; au nom des saints Apôtres et Évangélistes; au nom des saints Martyrs et Confesseurs; au nom des saints Moines et Solitaires; au nom des Vierges saintes; au nom de tous les Saints et de toutes les Saintes de Dieu. Que votre demeure soit aujourd’hui dans la paix et votre habitation dans la sainte Sion. Par Jésus-Christ Notre-Seigneur. Ainsi soit-il.`,
  note:"Traditional Roman Commendation of the Soul. The French form is locked to a historical French Catholic manual rather than newly translated for the app.",
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
