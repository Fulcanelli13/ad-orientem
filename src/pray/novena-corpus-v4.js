import { NOVENA_CORPUS_V3 } from "./novena-corpus.js";
import { NOVENA_FRENCH_BODY_V1 } from "./novena-french-body-v1.js";
import { NOVENA_FRENCH_BODY_V1_MARIAN } from "./novena-french-body-v1-marian.js";
import { NOVENA_FRENCH_BODY_V1_DEVOTIONAL } from "./novena-french-body-v1-devotional.js";

export const NOVENA_CORPUS_V4_VERSION="bilingual-16-target-v1";

const F=Object.freeze;
const A=v=>Object.freeze(v);
const bi=(en,fr)=>F({en:String(en||""),fr:String(fr||"")});
const TRANSLATIONS=F({
  ...NOVENA_FRENCH_BODY_V1,
  ...NOVENA_FRENCH_BODY_V1_MARIAN,
  ...NOVENA_FRENCH_BODY_V1_DEVOTIONAL,
});

function translatedSourceBody(n,t){
  const out={...n,frenchTextStatus:t?.status||"MISSING_FRENCH_BODY"};
  for(const key of ["repeatText","opening","churchPrayer","ejaculation","sharedClosingText"]){
    if(n[key])out[key]=bi(n[key],t?.[key]);
  }
  out.days=A((n.days||[]).map((d,i)=>F({
    ...d,
    ...(d.text?{text:bi(d.text,t?.days?.[i])}:{})
  })));
  return F(out);
}

const repeatedDays=(themeEn,themeFr,guideEn,guideFr)=>A(Array.from({length:9},()=>F({
  theme:F({en:themeEn,fr:themeFr}),
  guide:F({en:guideEn,fr:guideFr})
})));

const CHRIST_KING=F({
  id:"christ_the_king",
  title:F({en:"Novena to Christ the King",fr:"Neuvaine au Christ-Roi"}),
  family:F({en:"Christ the King · Sacred Kingship",fr:"Christ-Roi · Royauté sacrée"}),
  feast:F({en:"Christ the King",fr:"Christ-Roi"}),
  form:"REPEAT_FORM",
  calendar:F({type:"LAST_SUNDAY_RELATIVE",month:10,startOffset:-9,endOffset:-1,feastOffset:0,precision:"1962_LAST_SUNDAY_OCTOBER_PREP"}),
  traditionalStart:F({en:"Nine days before the last Sunday of October",fr:"Neuf jours avant le dernier dimanche d’octobre"}),
  history:F({
    en:"Pius XI instituted the feast of Christ the King in 1925. Pre-conciliar indulgence collections also encouraged nine- or three-day prayer to Christ the King without imposing one unique novena text. This form uses the indulgenced Prayer to Christ the King associated with the 1923 rescript and preserved in the 1938 Preces et Pia Opera tradition.",
    fr:"Pie XI institua la fête du Christ-Roi en 1925. Les recueils d’indulgences antérieurs au Concile encourageaient aussi une prière de neuf ou de trois jours au Christ-Roi sans imposer un texte unique de neuvaine. Cette forme emploie la prière indulgenciée au Christ-Roi liée au rescrit de 1923 et conservée dans la tradition des Preces et Pia Opera de 1938."
  }),
  meaning:F({
    en:"Renew baptismal allegiance to Christ’s universal kingship and pray that His rights and peace be acknowledged in personal and social life.",
    fr:"Renouveler l’allégeance baptismale à la royauté universelle du Christ et demander que ses droits et sa paix soient reconnus dans la vie personnelle et sociale."
  }),
  how:F({
    en:"For nine days before the traditional feast, recite the same approved Prayer to Christ the King. The historical indulgence attached to older books is preserved only as historical context and is not presented as current law.",
    fr:"Pendant les neuf jours précédant la fête traditionnelle, récitez la même prière approuvée au Christ-Roi. L’indulgence mentionnée dans les anciens recueils n’est conservée qu’à titre historique et n’est pas présentée comme droit actuel."
  }),
  source:F({
    work:"Preces et Pia Opera / Thésaurisons pour le Ciel",
    authors:"Traditional indulgenced Prayer to Christ the King",
    edition:"French collection aligned to Preces et Pia Opera, 1938",
    approval:"Prayer associated with S. Paen. Ap. / 1923 rescript in pre-conciliar collections",
    url:"https://www.liberius.net/livres/Thesaurisons_pour_le_Ciel_000001335.pdf",
    status:"SOURCE_LOCKED_TRADITIONAL_FRENCH · ENGLISH_EDITORIAL_ALIGNMENT",
    adaptation:"The French prayer is retained from the traditional witness; English is aligned editorially to the same prayer. Historical indulgence language is not asserted as current law."
  }),
  historySources:A([
    F({label:"Thésaurisons pour le Ciel · Christ-Roi",url:"https://www.liberius.net/livres/Thesaurisons_pour_le_Ciel_000001335.pdf"})
  ]),
  frenchTextStatus:"SOURCE_LOCKED_TRADITIONAL_FRENCH",
  repeatText:bi(
    "O Christ Jesus, I acknowledge Thee as universal King. All that has been made was created for Thee. Exercise over me all Thy rights. I renew my baptismal promises, renouncing Satan, his pomps and his works, and I promise to live as a good Christian. In particular I pledge myself to work, according to my means, for the triumph of the rights of God and of Thy Church. Divine Heart of Jesus, I offer Thee my poor actions to obtain that all hearts may acknowledge Thy sacred Kingship and that thus the reign of Thy peace may be established throughout the whole world. Amen.",
    "Ô Christ Jésus, je vous reconnais pour Roi universel. Tout ce qui a été fait, a été créé pour vous. Exercez sur moi tous vos droits. Je renouvelle mes promesses du baptême en renonçant à Satan, à ses pompes et à ses œuvres et je promets de vivre en bon chrétien. Et tout particulièrement je m’engage à faire triompher selon mes moyens les droits de Dieu et de votre Église. Divin Cœur de Jésus, je vous offre mes pauvres actions pour obtenir que tous les cœurs reconnaissent votre Royauté sacrée, et que, ainsi, le règne de votre paix s’établisse dans l’univers entier. Ainsi soit-il."
  ),
  commonPrayers:A([]),
  days:repeatedDays(
    "Christ’s kingship","La royauté du Christ",
    "Repeat the approved prayer slowly, renewing the baptismal renunciation of Satan and allegiance to Christ the King.",
    "Répétez lentement la prière approuvée, en renouvelant la renonciation baptismale à Satan et l’allégeance au Christ-Roi."
  )
});

const IMMACULATE_HEART=F({
  id:"immaculate_heart",
  title:F({en:"Novena to the Immaculate Heart of Mary",fr:"Neuvaine au Cœur Immaculé de Marie"}),
  family:F({en:"Our Lady · Immaculate Heart",fr:"Notre-Dame · Cœur Immaculé"}),
  feast:F({en:"Immaculate Heart of Mary",fr:"Cœur Immaculé de Marie"}),
  form:"REPEAT_FORM",
  calendar:F({type:"FIXED",startMonth:8,startDay:13,endMonth:8,endDay:21,feastMonth:8,feastDay:22,precision:"1962_FEAST_PREP"}),
  traditionalStart:F({en:"13 August · nine-day preparation for the 22 August feast",fr:"13 août · préparation de neuf jours à la fête du 22 août"}),
  history:F({
    en:"Pre-conciliar devotion did not require one unique day-by-day novena body. A 1933 grant of Pius XI concerned approved prayers in honour of the Immaculate Heart for nine consecutive days. This form therefore uses the older Raccolta Prayer to the Immaculate Heart of Mary as a repeated approved prayer.",
    fr:"La dévotion antérieure au Concile n’exigeait pas un texte quotidien unique. Une concession de Pie XI en 1933 concernait des prières approuvées en l’honneur du Cœur Immaculé pendant neuf jours consécutifs. Cette forme emploie donc, comme prière répétée, l’ancienne prière de la Raccolta au Cœur Immaculé de Marie."
  }),
  meaning:F({
    en:"Ask Mary’s Immaculate Heart to conform the heart to Jesus, protect the Church, lead the soul to Christ and assist especially at the hour of death.",
    fr:"Demander au Cœur Immaculé de Marie de conformer le cœur à celui de Jésus, de protéger l’Église, de conduire l’âme au Christ et de l’assister spécialement à l’heure de la mort."
  }),
  how:F({
    en:"Pray the same traditional approved prayer on nine consecutive days. The app does not manufacture nine pseudo-historical meditations where the older discipline allowed approved prayers chosen by the faithful.",
    fr:"Récitez la même prière traditionnelle approuvée pendant neuf jours consécutifs. L’application n’invente pas neuf méditations pseudo-historiques là où l’ancienne discipline permettait aux fidèles de choisir des prières approuvées."
  }),
  source:F({
    work:"The Raccolta · Prayer to the Immaculate Heart of Mary",
    authors:"Sacred Congregation of Indulgences and Holy Relics",
    edition:"English Raccolta witness, 1857; traditional French devotional witness",
    approval:"Prayer historically approved and indulgenced; later indulgence claims retained only as historical context",
    url:"https://en.wikisource.org/wiki/The_Raccolta_%281857%29/Prayer_to_the_Immaculate_Heart_of_Mary",
    status:"SOURCE_LOCKED_TRADITIONAL_ENGLISH · FRENCH_WORLD_TRADITIONAL_WITNESS",
    adaptation:"English follows the Raccolta witness; French is aligned to the traditional French form of the same prayer."
  }),
  historySources:A([
    F({label:"Raccolta · Prayer to the Immaculate Heart · 1857",url:"https://en.wikisource.org/wiki/The_Raccolta_%281857%29/Prayer_to_the_Immaculate_Heart_of_Mary"}),
    F({label:"French traditional form · Prière au Saint Cœur de Marie",url:"https://montfortajpm.blogspot.com/2016/09/prieres-aux-Sacres-Coeurs-de-Jesus-et-de-Marie.html"}),
    F({label:"Pre-conciliar nine-day practice witness",url:"https://www.distantreader.org/stacks/pamphlets/pdf/003376644.pdf"})
  ]),
  frenchTextStatus:"TRADITIONAL_FRENCH_WITNESS_ALIGNED",
  repeatText:bi(
    "Heart of Mary, Mother of God and our Mother, Heart most amiable, on which the adorable Trinity ever gazes with complacency, worthy of all the veneration and tenderness of angels and of men; Heart most like the Heart of Jesus, whose most perfect image thou art; Heart full of goodness, ever compassionate towards our miseries; vouchsafe to thaw our icy hearts, that they may be wholly changed to the likeness of the Heart of Jesus. Infuse into them the love of thy virtues, inflame them with that blessed fire with which thou dost ever burn. In thee let the Holy Church find safe shelter; protect it and be its sweet asylum, its tower of strength, impregnable against every inroad of its enemies. Be thou the road leading to Jesus; be thou the channel whereby we receive all graces needful for our salvation. Be thou our help in need, our comfort in trouble, our strength in temptation, our refuge in persecution, our aid in all dangers; but especially in the last struggle of our life, at the moment of our death, when all hell shall be unchained against us to snatch away our souls: in that dread moment, that hour so terrible, whereon our eternity depends, ah, then, most tender Virgin, make us feel how great is the sweetness of thy motherly Heart and the power of thy might with the Heart of Jesus, opening to us a safe refuge in the very fount of mercy itself, that so we too may join with thee in Paradise in praising the Heart of Jesus for ever and ever. Amen.",
    "Ô Cœur de Marie, Mère de Dieu et notre Mère ! Cœur très aimable, objet des complaisances de l’adorable Trinité, digne de toute la vénération et du plus tendre amour des anges et des hommes ; Cœur le plus semblable au Cœur de Jésus, dont vous êtes la plus parfaite image ; Cœur plein de bonté et toujours compatissant à nos misères, daignez fondre la glace de nos cœurs et faites qu’ils deviennent entièrement semblables au Cœur de Jésus. Communiquez-leur l’amour de vos vertus et embrasez-les de ce feu béni dont vous brûlez toujours. Que la sainte Église trouve en vous un refuge assuré ; protégez-la, soyez son doux asile, sa tour de force imprenable contre les attaques de ses ennemis. Soyez la voie qui nous conduise à Jésus et le canal par lequel nous recevions toutes les grâces nécessaires à notre salut. Soyez notre secours dans le besoin, notre consolation dans la peine, notre force dans la tentation, notre refuge dans la persécution, notre aide dans tous les dangers ; mais surtout dans le dernier combat de notre vie, à l’heure de notre mort, lorsque tout l’enfer se déchaînera contre nous pour ravir nos âmes : en ce moment redoutable, à cette heure terrible d’où dépend notre éternité, ô Vierge très tendre, faites-nous sentir la douceur de votre Cœur maternel et la puissance de votre crédit auprès du Cœur de Jésus ; ouvrez-nous dans la source même de la miséricorde un refuge assuré, afin qu’un jour nous puissions nous unir à vous dans le paradis pour louer éternellement le Cœur de Jésus. Ainsi soit-il."
  ),
  commonPrayers:A([]),
  days:repeatedDays(
    "The Immaculate Heart","Le Cœur Immaculé",
    "Repeat the approved prayer, asking that the heart be conformed to Jesus through Mary.",
    "Répétez la prière approuvée en demandant que, par Marie, votre cœur soit conformé à celui de Jésus."
  )
});

const ST_MICHAEL=F({
  id:"st_michael",
  title:F({en:"Novena to St Michael the Archangel",fr:"Neuvaine à saint Michel Archange"}),
  family:F({en:"St Michael · Prince of the heavenly host",fr:"Saint Michel · Prince de la milice céleste"}),
  feast:F({en:"Dedication of St Michael the Archangel",fr:"Dédicace de saint Michel Archange"}),
  form:"REPEAT_FORM",
  calendar:F({type:"FIXED",startMonth:9,startDay:20,endMonth:9,endDay:28,feastMonth:9,feastDay:29,precision:"1962_MICHAELMAS_PREP"}),
  traditionalStart:F({en:"20 September · nine-day preparation for Michaelmas",fr:"20 septembre · préparation de neuf jours à la Saint-Michel"}),
  history:F({
    en:"Pre-conciliar indulgence discipline allowed novenas in honour of the Archangels to be made with prayers chosen for nine consecutive days. This form uses the Leonine Prayer to St Michael, a firmly attested traditional prayer in both English and French Catholic use.",
    fr:"La discipline des indulgences antérieure au Concile permettait de faire des neuvaines en l’honneur des Archanges avec des prières choisies pendant neuf jours consécutifs. Cette forme emploie la prière léonine à saint Michel, solidement attestée dans l’usage catholique traditionnel en français comme en anglais."
  }),
  meaning:F({
    en:"Ask St Michael for protection in spiritual combat and for the defeat of the snares of the devil under God’s authority.",
    fr:"Demander à saint Michel sa protection dans le combat spirituel et la défaite des embûches du démon sous l’autorité de Dieu."
  }),
  how:F({
    en:"For nine days before the feast, recite the Leonine Prayer to St Michael. The historical novena allowed approved prayers rather than one mandatory day-specific text.",
    fr:"Pendant les neuf jours précédant la fête, récitez la prière léonine à saint Michel. La neuvaine historique permettait des prières approuvées plutôt qu’un texte quotidien obligatoire."
  }),
  source:F({
    work:"Leonine Prayer to St Michael the Archangel",
    authors:"Traditional Leonine prayers",
    edition:"Traditional English/French form",
    approval:"Public Catholic prayer long associated with the Leonine prayers",
    url:"https://laportelatine.org/spiritualite/prieres-et-devotions/priere-a-saint-michel",
    status:"SOURCE_LOCKED_TRADITIONAL_FRENCH · TRADITIONAL_ENGLISH_FORM",
    adaptation:"Traditional bilingual prayer retained; novena repetition is framed according to the older practice of chosen approved prayers over nine days."
  }),
  historySources:A([
    F({label:"La Porte Latine · Prières à Saint Michel",url:"https://laportelatine.org/spiritualite/prieres-et-devotions/priere-a-saint-michel"}),
    F({label:"Pius XII · French witness to the Leonine prayer · 1940",url:"https://laportelatine.org/formation/magistere/archange-saint-michel-discours-jeunes-epoux-1940"})
  ]),
  frenchTextStatus:"SOURCE_LOCKED_TRADITIONAL_FRENCH",
  repeatText:bi(
    "Saint Michael the Archangel, defend us in battle; be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and the other evil spirits who prowl about the world seeking the ruin of souls. Amen.",
    "Saint Michel Archange, défendez-nous dans le combat ; soyez notre soutien contre la perfidie et les embûches du démon. Que Dieu réprime son audace ! telle est notre humble prière. Et vous, Prince de la milice céleste, par la vertu divine, refoulez en enfer Satan et les autres esprits mauvais, qui sont répandus dans le monde pour perdre les âmes. Ainsi soit-il."
  ),
  commonPrayers:A([]),
  days:repeatedDays(
    "Spiritual combat","Combat spirituel",
    "Repeat the Leonine prayer with confidence in God’s authority and St Michael’s intercession.",
    "Répétez la prière léonine avec confiance dans l’autorité de Dieu et l’intercession de saint Michel."
  )
});

const ST_ANTHONY=F({
  id:"st_anthony_nine_tuesdays",
  title:F({en:"St Anthony’s Nine Tuesdays",fr:"Les neuf mardis de saint Antoine"}),
  family:F({en:"St Anthony of Padua · Nine Tuesdays",fr:"Saint Antoine de Padoue · Neuf mardis"}),
  feast:F({en:"St Anthony of Padua",fr:"Saint Antoine de Padoue"}),
  form:"REPEAT_FORM",
  calendar:F({type:"NINE_TUESDAYS_BEFORE_FIXED_FEAST",feastMonth:6,feastDay:13,precision:"TRADITIONAL_WEEKLY_TUESDAY_CADENCE"}),
  traditionalStart:F({en:"Nine consecutive Tuesdays leading to the 13 June feast",fr:"Neuf mardis consécutifs conduisant à la fête du 13 juin"}),
  history:F({
    en:"The Tuesday devotion developed from the tradition that St Anthony died on a Tuesday. French traditional sources attest the pious exercises of nine or thirteen Tuesdays, while older devotional manuals note that no single prayer text was prescribed. This form retains the commonly used prayers and preserves the weekly cadence instead of converting the devotion into nine consecutive days.",
    fr:"La dévotion du mardi s’est développée à partir de la tradition selon laquelle saint Antoine mourut un mardi. Les sources traditionnelles françaises attestent les pieux exercices de neuf ou treize mardis, tandis que les anciens manuels de dévotion précisent qu’aucun texte de prière unique n’était prescrit. Cette forme conserve les prières couramment employées et respecte le rythme hebdomadaire au lieu de transformer la dévotion en neuf jours consécutifs."
  }),
  meaning:F({
    en:"Seek St Anthony’s intercession over nine successive Tuesdays while subordinating the petition to God’s will and the salvation of the soul.",
    fr:"Recourir à l’intercession de saint Antoine pendant neuf mardis successifs, en subordonnant la demande à la volonté de Dieu et au salut de l’âme."
  }),
  how:F({
    en:"On each of nine consecutive Tuesdays, pray the same traditional prayers. Older manuals recommend, when possible, Confession, Holy Communion and prayer in church, but Ad Orientem does not present historical indulgence conditions as current law.",
    fr:"Lors de chacun des neuf mardis consécutifs, récitez les mêmes prières traditionnelles. Les anciens manuels recommandent, lorsque cela est possible, la Confession, la Sainte Communion et la prière à l’église, mais Ad Orientem ne présente pas les anciennes conditions d’indulgence comme droit actuel."
  }),
  source:F({
    work:"Devotion of the Nine Tuesdays to St Anthony",
    authors:"Traditional Franciscan devotional practice",
    edition:"Pre-conciliar English devotional pamphlet; French-world traditional attestation",
    approval:"Traditional devotional form; no single prayer text historically mandatory",
    url:"https://www.pamphlets.info/Australia/acts1014/",
    status:"SOURCE_LOCKED_TRADITIONAL_ENGLISH · FRENCH_EDITORIAL_TRANSLATION · FRENCH_WORLD_PRACTICE_WITNESS",
    adaptation:"English common prayers retained; French translated editorially. The weekly Tuesday cadence is preserved exactly as a weekly devotion."
  }),
  historySources:A([
    F({label:"Traditional Nine Tuesdays pamphlet",url:"https://www.pamphlets.info/Australia/acts1014/"}),
    F({label:"La Porte Latine · St Anthony · nine/thirteen Tuesdays attested",url:"https://laportelatine.org/spiritualite/vies-de-saints/13-juin-saint-antoine-de-padoue"})
  ]),
  frenchTextStatus:"EDITORIAL_TRANSLATION_ALIGNED_TO_TRADITIONAL_ENGLISH_SOURCE",
  repeatText:bi(
    "O Jesus my Saviour, who didst vouchsafe to appear to St Anthony in the form of an infant, I implore Thee, through the love Thou didst bear this saint when he dwelt on earth and which Thou now bearest him in heaven, graciously hear my prayer and assist me in my necessities, who livest and reignest, world without end. Amen.\n\nO glorious St Anthony, safe refuge of all the afflicted and distressed, who hast revealed that all who piously invoke thee at thy altar on nine consecutive Tuesdays shall experience the power of thy intercession. Encouraged by thy promise, and by the knowledge of the wonderful favours and graces which God bestows on those who piously invoke thy intercession, I come to thee, O powerful Saint, and with firm hope I implore thy aid, thy protection, thy counsel and thy blessing. Obtain for me, I beseech thee, my request. But if it should be opposed to the Will of God and the welfare of my soul, obtain for me such other graces as shall be conducive to my salvation. Through Christ our Lord. Amen.",
    "Ô Jésus, mon Sauveur, qui avez daigné apparaître à saint Antoine sous la forme d’un enfant, je vous supplie, par l’amour que vous portiez à ce saint lorsqu’il vivait sur la terre et que vous lui portez maintenant dans le ciel, d’écouter avec bonté ma prière et de m’assister dans mes nécessités, vous qui vivez et régnez dans les siècles des siècles. Ainsi soit-il.\n\nÔ glorieux saint Antoine, refuge assuré de tous les affligés et de tous ceux qui sont dans la détresse, vous avez fait connaître que ceux qui vous invoquent pieusement pendant neuf mardis consécutifs éprouveront la puissance de votre intercession. Encouragé par cette promesse et par la connaissance des faveurs et des grâces merveilleuses que Dieu accorde à ceux qui recourent pieusement à votre intercession, je viens à vous, ô puissant saint, et avec une ferme espérance j’implore votre secours, votre protection, votre conseil et votre bénédiction. Obtenez-moi, je vous en supplie, la grâce que je demande. Mais si elle était contraire à la volonté de Dieu et au bien de mon âme, obtenez-moi les autres grâces qui contribueront à mon salut. Par Jésus-Christ Notre-Seigneur. Ainsi soit-il."
  ),
  commonPrayers:A([]),
  days:repeatedDays(
    "The Nine Tuesdays","Les neuf mardis",
    "This is a weekly devotion: pray the traditional form on the appointed Tuesday and return the following Tuesday.",
    "Il s’agit d’une dévotion hebdomadaire : récitez la forme traditionnelle le mardi prévu et revenez le mardi suivant."
  )
});

export const NOVENA_CORPUS_V4=F(Object.fromEntries([
  ...Object.entries(NOVENA_CORPUS_V3).map(([id,n])=>[id,translatedSourceBody(n,TRANSLATIONS[id])]),
  [ST_ANTHONY.id,ST_ANTHONY],
  [CHRIST_KING.id,CHRIST_KING],
  [IMMACULATE_HEART.id,IMMACULATE_HEART],
  [ST_MICHAEL.id,ST_MICHAEL],
]));

export const NOVENA_CORPUS_V4_IDS=A(Object.keys(NOVENA_CORPUS_V4));
