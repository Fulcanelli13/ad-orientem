/** Source-attested daily prayer data, curated from the 1905 and 1913 Pius X witnesses and preconciliar printed-page prayer books. Texts are edition-bound; no invented cross-language fallback. */
export const DAILY_PERSONAL_PRAYER_SOURCE_V1=Object.freeze({
  "schema": "ao-personal-daily-prayer-source-v1",
  "policy": {
    "authority": "St Pius X daily prayer appendix; exact 1905 and 1913 sequences are kept distinct",
    "language": [
      "la",
      "en",
      "fr"
    ],
    "manuals": "Complete preconciliar prayers with print-image evidence; source-language only, no fabricated translations",
    "latin": "Some Latin readings are Ad Orientem editorial translations, not printed Latin originals",
    "hagan": "1914 Hagan edition not text-verified; comparison research only"
  },
  "editions": {
    "1905": {
      "id": "piusx-1905-it",
      "year": "1905",
      "sourceLabel": "St Pius X, Compendio (1905)",
      "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
      "dayparts": {
        "morning": [
          {
            "id": "sign-of-cross",
            "kind": "prayer",
            "titleEn": "Sign of the Cross",
            "titleFr": "Signe de croix",
            "text": {
              "la": "In nomine Patris, et Filii, et Spiritus Sancti. Amen.",
              "en": "In the name of the Father, and of the Son, and of the Holy Ghost. Amen.",
              "fr": "Au nom du Père, et du Fils, et du Saint-Esprit. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_I",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "daily-prayer",
            "kind": "prayer",
            "titleEn": "Morning Adoration, Thanksgiving and Offering",
            "titleFr": "Adoration, action de grâces et offrande",
            "text": {
              "la": "Adoro te, Deus meus, et amo te ex toto corde. Gratias tibi ago, quod me creavisti, christianum fecisti et hac nocte servavisti. Omnes actiones meas tibi offero; te oro, ut me hodie a peccato custodias et ab omni malo liberes. Amen.",
              "en": "I adore You, my God, and love You with all my heart. I thank You for having created me, made me a Christian, and preserved me through this night. I offer You all my actions, and I pray You to preserve me this day from sin and deliver me from all evil. Amen.",
              "fr": "Je vous adore, ô mon Dieu, et je vous aime de tout mon cœur. Je vous remercie de m’avoir créé, fait chrétien et gardé pendant cette nuit. Je vous offre toutes mes actions et je vous prie de me préserver aujourd’hui du péché et de me délivrer de tout mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "our-father",
            "kind": "prayer",
            "titleEn": "Our Father",
            "titleFr": "Notre Père",
            "text": {
              "la": "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.",
              "en": "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done on earth as it is in heaven. Give us this day our daily bread. And forgive us our debts as we forgive our debtors. And lead us not into temptation. But deliver us from evil. Amen.",
              "fr": "Notre Père, qui êtes aux cieux, que votre nom soit sanctifié. Que votre règne arrive. Que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd’hui notre pain quotidien. Remettez-nous nos dettes comme nous les remettons à ceux qui nous doivent. Et ne nous induisez pas en tentation. Mais délivrez-nous du mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "hail-mary",
            "kind": "prayer",
            "titleEn": "Hail Mary",
            "titleFr": "Je vous salue Marie",
            "text": {
              "la": "Ave, Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.",
              "en": "God save thee, O Mary, full of grace. The Lord is with thee. Blessed art thou among women, and blessed is Jesus, the fruit of thy womb. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
              "fr": "Dieu vous salue, ô Marie, pleine de grâce. Le Seigneur est avec vous. Vous êtes bénie entre les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pécheurs, maintenant et à l’heure de notre mort. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "creed",
            "kind": "prayer",
            "titleEn": "Apostles’ Creed",
            "titleFr": "Symbole des Apôtres",
            "text": {
              "la": "Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae, et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.",
              "en": "I believe in God the Father almighty, Creator of heaven and earth. And in Jesus Christ, His only Son, our Lord. Who was conceived by the Holy Ghost and born of the Virgin Mary. He suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell; on the third day He rose again from the dead. He ascended into heaven and sitteth at the right hand of God the Father almighty. From thence He shall come to judge the living and the dead. I believe in the Holy Ghost. The holy Catholic Church; the communion of saints. The forgiveness of sins. The resurrection of the body. Life everlasting. Amen.",
              "fr": "Je crois en Dieu le Père tout-puissant, créateur du ciel et de la terre. Et en Jésus-Christ, son Fils unique, Notre-Seigneur. Qui fut conçu du Saint-Esprit et naquit de la Vierge Marie. Il souffrit sous Ponce Pilate, fut crucifié, mourut et fut enseveli. Il descendit aux enfers; le troisième jour, il ressuscita d’entre les morts. Il monta au ciel et siège à la droite de Dieu le Père tout-puissant. De là, il viendra juger les vivants et les morts. Je crois au Saint-Esprit. À la sainte Église catholique; à la communion des saints. À la rémission des péchés. À la résurrection de la chair. À la vie éternelle. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "faith",
            "kind": "prayer",
            "titleEn": "Act of Faith",
            "titleFr": "Acte de foi",
            "text": {
              "la": "Firmiter credo, quia Deus, veritas infallibilis, hoc sanctae Ecclesiae catholicae revelavit et per eam nobis quoque revelat, unum esse Deum in tribus Personis divinis aequalibus et distinctis, quae Pater, Filius et Spiritus Sanctus appellantur; Filium hominem factum esse, carne et anima humana in sinu purissimae Virginis Mariae virtute Spiritus Sancti assumptis; pro nobis in cruce mortuum esse, resurrexisse, in caelum ascendisse, atque inde in fine mundi venturum esse ad iudicandos vivos et mortuos, ut bonis paradisum et malis infernum in aeternum tribuat. Eadem de causa credo omnia quae eadem sancta Ecclesia credit et docet.",
              "en": "I firmly believe, because God, infallible Truth, has revealed it to the holy Catholic Church and through her reveals it also to us, that there is one God in three equal and distinct divine Persons, called the Father, the Son and the Holy Ghost; that the Son became man, taking human flesh and soul in the womb of the most pure Virgin Mary by the power of the Holy Ghost; that He died for us on the cross, rose again, ascended into heaven, and shall come thence at the end of the world to judge all the living and the dead, to give heaven for ever to the good and hell to the wicked. For the same reason I believe all that the holy Church herself believes and teaches.",
              "fr": "Je crois fermement, parce que Dieu, Vérité infaillible, l’a révélé à la sainte Église catholique et, par elle, nous le révèle aussi, qu’il y a un seul Dieu en trois Personnes divines, égales et distinctes, appelées Père, Fils et Saint-Esprit; que le Fils s’est fait homme en prenant, par l’action du Saint-Esprit, un corps et une âme humains dans le sein de la très pure Vierge Marie; qu’il est mort pour nous sur la croix, qu’il est ressuscité, monté au ciel et qu’il en reviendra à la fin du monde pour juger tous les vivants et les morts, donnant pour toujours le paradis aux bons et l’enfer aux méchants. Pour la même raison, je crois tout ce que croit et enseigne cette même sainte Église."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "hope",
            "kind": "prayer",
            "titleEn": "Act of Hope",
            "titleFr": "Acte d’espérance",
            "text": {
              "la": "Deus meus, quia omnipotens es et infinite bonus atque misericors, spero te per merita passionis et mortis Iesu Christi Salvatoris nostri mihi daturum esse vitam aeternam, quam tu fidelissimus promisisti iis qui opera boni christiani faciunt, sicut ego tuo sancto auxilio facere propono.",
              "en": "My God, because You are almighty and infinitely good and merciful, I hope that through the merits of the Passion and death of Jesus Christ our Saviour You will give me eternal life, which You, ever faithful, have promised to those who perform the works of a good Christian, as I resolve to do with Your holy help.",
              "fr": "Mon Dieu, parce que vous êtes tout-puissant et infiniment bon et miséricordieux, j’espère que, par les mérites de la Passion et de la mort de Jésus-Christ notre Sauveur, vous me donnerez la vie éternelle, que vous, toujours fidèle, avez promise à ceux qui accomplissent les œuvres d’un bon chrétien, comme je me propose de le faire avec votre saint secours."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "charity",
            "kind": "prayer",
            "titleEn": "Act of Charity",
            "titleFr": "Acte de charité",
            "text": {
              "la": "Deus meus, quia summum et perfectissimum Bonum es, amo te ex toto corde super omnia; et potius omnia alia amittere paratus sum quam te offendere. Propter amorem tuum proximum meum sicut me ipsum diligo atque diligere volo.",
              "en": "My God, because You are the supreme and most perfect Good, I love You with all my heart and above all things; rather than offend You, I am ready to lose everything else, and for love of You I also love, and wish to love, my neighbour as myself.",
              "fr": "Mon Dieu, parce que vous êtes le Bien suprême et souverainement parfait, je vous aime de tout mon cœur et par-dessus toutes choses; plutôt que de vous offenser, je suis prêt à tout perdre, et, pour l’amour de vous, j’aime aussi mon prochain et veux l’aimer comme moi-même."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "salve-regina",
            "kind": "prayer",
            "titleEn": "Salve Regina",
            "titleFr": "Salve Regina",
            "text": {
              "la": "Salve, Regina, mater misericordiae, vita, dulcedo et spes nostra, salve. Ad te clamamus, exsules filii Evae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, o pia, o dulcis Virgo Maria.",
              "en": "Hail, Queen, Mother of mercy; our life, our sweetness and our hope, hail. To you we raise our cries, exiled children of Eve. To you we sigh, weeping and groaning in this valley of tears. Hear us, then, O our Advocate; turn towards us those eyes so full of mercy. And at the end of this exile show us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
              "fr": "Salut, Reine, Mère de miséricorde; notre vie, notre douceur et notre espérance, salut. Vers vous nous élevons nos cris, enfants d’Ève exilés. Vers vous nous soupirons, gémissant et pleurant dans cette vallée de larmes. Ô notre Avocate, tournez donc vers nous vos regards miséricordieux. Et après cet exil, montrez-nous Jésus, le fruit béni de vos entrailles. Ô clémente, ô pieuse, ô douce Vierge Marie."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": false
          },
          {
            "id": "guardian-angel",
            "kind": "prayer",
            "titleEn": "Guardian Angel",
            "titleFr": "Ange gardien",
            "text": {
              "la": "Angele Dei, qui custos es mei, me tibi commissum pietate superna illumina, custodi, rege et guberna. Amen.",
              "en": "Angel of God, who art my guardian by the gift of divine charity, enlighten me, protect me, direct me and govern me. Amen.",
              "fr": "Ange de Dieu, mon gardien, à qui m’a confié la bonté divine, éclairez-moi, gardez-moi, conduisez-moi et gouvernez-moi. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": false
          }
        ],
        "evening": [
          {
            "id": "daily-prayer",
            "kind": "prayer",
            "titleEn": "Evening Adoration and Thanksgiving",
            "titleFr": "Adoration et action de grâces",
            "text": {
              "la": "Adoro te, Deus meus, et amo te ex toto corde. Gratias tibi ago, quod me creavisti, christianum fecisti et per hunc diem servavisti. Omne bonum quod hodie feci tibi offero, et te oro, ut me ab omni malo liberes. Amen.",
              "en": "I adore You, my God, and love You with all my heart. I thank You for having created me, made me a Christian, and preserved me through this day. I offer You all the good I have done today, and I pray You to deliver me from all evil. Amen.",
              "fr": "Je vous adore, ô mon Dieu, et je vous aime de tout mon cœur. Je vous remercie de m’avoir créé, fait chrétien et gardé pendant cette journée. Je vous offre tout le bien que j’ai fait aujourd’hui et je vous prie de me délivrer de tout mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "our-father",
            "kind": "prayer",
            "titleEn": "Our Father",
            "titleFr": "Notre Père",
            "text": {
              "la": "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.",
              "en": "Our Father, who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done on earth as it is in heaven. Give us this day our daily bread. And forgive us our debts as we forgive our debtors. And lead us not into temptation. But deliver us from evil. Amen.",
              "fr": "Notre Père, qui êtes aux cieux, que votre nom soit sanctifié. Que votre règne arrive. Que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd’hui notre pain quotidien. Remettez-nous nos dettes comme nous les remettons à ceux qui nous doivent. Et ne nous induisez pas en tentation. Mais délivrez-nous du mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "hail-mary",
            "kind": "prayer",
            "titleEn": "Hail Mary",
            "titleFr": "Je vous salue Marie",
            "text": {
              "la": "Ave, Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.",
              "en": "God save thee, O Mary, full of grace. The Lord is with thee. Blessed art thou among women, and blessed is Jesus, the fruit of thy womb. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
              "fr": "Dieu vous salue, ô Marie, pleine de grâce. Le Seigneur est avec vous. Vous êtes bénie entre les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pécheurs, maintenant et à l’heure de notre mort. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "glory-be",
            "kind": "prayer",
            "titleEn": "Glory Be",
            "titleFr": "Gloire au Père",
            "text": {
              "la": "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc et semper, et in saecula saeculorum. Amen.",
              "en": "Glory be to the Father, and to the Son, and to the Holy Ghost, as it was in the beginning, is now, and ever shall be, world without end. Amen.",
              "fr": "Gloire au Père, au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, et dans les siècles des siècles. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_II",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "contrition",
            "kind": "prayer",
            "titleEn": "Act of Contrition",
            "titleFr": "Acte de contrition",
            "text": {
              "la": "Deus meus, quia summa Bonitas es et quia te super omnia amo, vere me paenitet ex toto corde quod te offendi; firmiter propono, sancto tuo auxilio, numquam amplius peccare et praesertim proximas peccandi occasiones fugere.",
              "en": "My God, because You are supreme Goodness, and because I love You above all things, I repent and am truly sorry from my heart for having offended You; and I firmly resolve, with Your holy help, never to sin again in future, and in particular to flee the near occasions of sin.",
              "fr": "Mon Dieu, parce que vous êtes la Bonté suprême et que je vous aime par-dessus toutes choses, je me repens et regrette sincèrement de tout mon cœur de vous avoir offensé; je prends la ferme résolution, avec votre saint secours, de ne plus jamais pécher à l’avenir et, en particulier, de fuir les occasions prochaines du péché."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Prime_nozioni_di_catechismo/Capo_III",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "jesus-joseph-mary-1",
            "kind": "prayer",
            "titleEn": "Jesus, Joseph and Mary — Dedication",
            "titleFr": "Jésus, Joseph, Marie — Offrande",
            "text": {
              "la": "Iesu, Ioseph et Maria, cor et animam meam vobis dono.",
              "en": "Jesus, Joseph and Mary, I give you my heart and my soul.",
              "fr": "Jésus, Joseph et Marie, je vous donne mon cœur et mon âme."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "jesus-joseph-mary-2",
            "kind": "prayer",
            "titleEn": "Jesus, Joseph and Mary — Last Agony",
            "titleFr": "Jésus, Joseph, Marie — Agonie",
            "text": {
              "la": "Iesu, Ioseph et Maria, assistite mihi in ultima agonia.",
              "en": "Jesus, Joseph and Mary, assist me in my last agony.",
              "fr": "Jésus, Joseph et Marie, assistez-moi dans ma dernière agonie."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "jesus-joseph-mary-3",
            "kind": "prayer",
            "titleEn": "Jesus, Joseph and Mary — Peaceful Death",
            "titleFr": "Jésus, Joseph, Marie — Mort paisible",
            "text": {
              "la": "Iesu, Ioseph et Maria, anima mea in pace vobiscum exspiret.",
              "en": "Jesus, Joseph and Mary, may my soul depart in peace with you.",
              "fr": "Jésus, Joseph et Marie, que mon âme s’en aille en paix avec vous."
            },
            "sourceLabel": "St Pius X, Compendio (1905)",
            "sourceUrl": "https://it.wikisource.org/wiki/Compendio_della_dottrina_cristiana/Orazioni_quotidiane_ed_altre_preci",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          }
        ]
      }
    },
    "1913": {
      "id": "piusx-1913-fr",
      "year": "1913",
      "sourceLabel": "St Pius X, authorized French revision (1913)",
      "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
      "dayparts": {
        "morning": [
          {
            "id": "sign-of-cross",
            "kind": "prayer",
            "titleEn": "Sign of the Cross",
            "titleFr": "Signe de croix",
            "text": {
              "la": "In nomine Patris, et Filii, et Spiritus Sancti. Amen.",
              "en": "In the name of the Father, and of the Son, and of the Holy Ghost. Amen.",
              "fr": "Au nom du Père et du Fils et du Saint-Esprit. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "daily-prayer",
            "kind": "prayer",
            "titleEn": "Morning Adoration, Thanksgiving and Offering",
            "titleFr": "Adoration, action de grâces et offrande",
            "text": {
              "la": "Adoro te, Deus meus, et amo te ex toto corde. Gratias tibi ago, quod me creavisti, christianum fecisti et hac nocte servavisti. Actiones huius diei tibi offero; fac ut omnes secundum sanctam voluntatem tuam sint, ad maiorem gloriam tuam. A peccato et ab omni malo me custodi. Gratia tua semper mecum sit et cum omnibus mihi caris. Amen.",
              "en": "I adore You, my God, and love You with all my heart. I thank You for having created me, made me a Christian, and preserved me through this night. I offer You the actions of this day; grant that they may all be according to Your holy will, for Your greater glory. Preserve me from sin and from all evil. May Your grace always be with me and with all those dear to me. Amen.",
              "fr": "Je vous adore, mon Dieu, et vous aime de tout mon cœur. Je vous remercie de m'avoir créé, fait chrétien et conservé en cette nuit. Je vous offre les actions de la journée; faites qu'elles soient toutes selon votre sainte volonté, pour votre plus grande gloire. Préservez-moi du péché et de tout mal. Que votre grâce soit toujours avec moi et avec tous ceux qui me sont chers. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "our-father",
            "kind": "prayer",
            "titleEn": "Our Father",
            "titleFr": "Notre Père",
            "text": {
              "la": "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.",
              "en": "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; forgive us our trespasses as we forgive those who trespass against us; and suffer us not to succumb to temptation, but deliver us from evil. Amen.",
              "fr": "Notre Père qui êtes aux cieux, que votre nom soit sanctifié, que votre règne arrive, que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd’hui notre pain quotidien, pardonnez-nous nos offenses comme nous pardonnons à ceux qui nous ont offensés, et ne nous laissez pas succomber à la tentation, mais délivrez-nous du mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "hail-mary",
            "kind": "prayer",
            "titleEn": "Hail Mary",
            "titleFr": "Je vous salue Marie",
            "text": {
              "la": "Ave, Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.",
              "en": "Hail Mary, full of grace; the Lord is with thee; blessed art thou among women, and blessed is Jesus, the fruit of thy womb. Holy Mary, Mother of God, pray for us poor sinners, now and at the hour of our death. Amen.",
              "fr": "Je vous salue, Marie pleine de grâce; le Seigneur est avec vous; vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l’heure de notre mort. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "glory-be",
            "kind": "prayer",
            "titleEn": "Glory Be",
            "titleFr": "Gloire au Père",
            "text": {
              "la": "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc et semper, et in saecula saeculorum. Amen.",
              "en": "Glory be to the Father, and to the Son, and to the Holy Ghost, as it was in the beginning, is now and ever shall be, world without end. Amen.",
              "fr": "Gloire au Père, et au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, dans les siècles des siècles. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "creed",
            "kind": "prayer",
            "titleEn": "Apostles’ Creed",
            "titleFr": "Symbole des Apôtres",
            "text": {
              "la": "Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae, et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.",
              "en": "I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Ghost, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried, descended into hell; on the third day He rose again from the dead; He ascended into heaven and sitteth at the right hand of God the Father almighty, whence He shall come to judge the living and the dead. I believe in the Holy Ghost, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
              "fr": "Je crois en Dieu le Père tout-puissant, créateur du ciel et de la terre, et en Jésus-Christ, son Fils unique Notre-Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce-Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers; le troisième jour est ressuscité d’entre les morts, est monté au ciel, est assis à la droite de Dieu le Père tout-puissant, d’où il viendra juger les vivants et les morts. Je crois au Saint-Esprit, à la sainte Eglise catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "faith",
            "kind": "prayer",
            "titleEn": "Act of Faith",
            "titleFr": "Acte de foi",
            "text": {
              "la": "Deus meus, firmiter credo omnia quae tu, Veritas infallibilis, revelasti et quae Ecclesia nobis credenda proponit. Expresse credo in te, unum verum Deum in tribus Personis aequalibus et distinctis, Patre, Filio et Spiritu Sancto. Credo item in Filium incarnatum et pro nobis mortuum, Iesum Christum, qui unicuique secundum merita aeterna praemia aut poenas tribuet. Semper secundum hanc fidem vivere volo. Domine, auge fidem meam.",
              "en": "My God, I firmly believe all that You, infallible Truth, have revealed and that the Church proposes to us for belief. I believe expressly in You, the one true God in three equal and distinct Persons, Father, Son and Holy Ghost. I likewise believe in the Son made man and put to death for us, Jesus Christ, who will give to each person, according to his merits, eternal reward or punishment. I desire always to live according to this faith. Lord, increase my faith.",
              "fr": "Mon Dieu, je crois fermement tout ce que vous, infaillible Vérité, avez révélé et que l’Eglise nous propose à croire. Je crois expressément en vous, unique vrai Dieu en trois personnes égales et distinctes, Père, Fils et Saint-Esprit. Je crois de même au Fils incarné et mort pour nous, Jésus-Christ, qui donnera à chacun, selon ses mérites, la récompense ou la peine éternelle. Je veux toujours vivre conformément à cette foi. — Seigneur, augmentez ma foi."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "hope",
            "kind": "prayer",
            "titleEn": "Act of Hope",
            "titleFr": "Acte d’espérance",
            "text": {
              "la": "Deus meus, spero propter bonitatem tuam et promissiones atque merita Iesu Christi Salvatoris nostri vitam aeternam et gratias necessarias ad eam merendam per bona opera quae agere debeo et volo. Domine, ne confundar in aeternum.",
              "en": "My God, I hope, through Your goodness, because of the promises and merits of Jesus Christ our Saviour, for eternal life and the graces necessary to merit it by the good works which I ought to perform and wish to accomplish. Lord, let me not be confounded for ever.",
              "fr": "Mon Dieu, j’espère de votre bonté, à cause des promesses et des mérites de Jésus-Christ notre Sauveur, la vie éternelle et les grâces nécessaires pour la mériter par les bonnes œuvres que je dois et veux accomplir. — Seigneur, que je ne sois pas éternellement confondu."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "charity",
            "kind": "prayer",
            "titleEn": "Act of Charity",
            "titleFr": "Acte de charité",
            "text": {
              "la": "Deus meus, ex toto corde super omnia te amo, Bonum infinitum et beatitudinem nostram aeternam; propter amorem tui proximum meum sicut me ipsum diligo et offensas mihi illatas remitto. Domine, fac ut te semper magis amem.",
              "en": "My God, I love You with all my heart above all things, O infinite Good and our eternal happiness. For love of You I love my neighbour as myself and forgive the offences I have received. Lord, grant that I may love You ever more.",
              "fr": "Mon Dieu, je vous aime de tout mon cœur par-dessus toutes choses, ô Bien infini et notre éternelle félicité; par amour pour vous j’aime mon prochain comme moi-même et je pardonne les offenses reçues. — Seigneur, faites que je vous aime toujours davantage."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "salve-regina",
            "kind": "prayer",
            "titleEn": "Salve Regina",
            "titleFr": "Salve Regina",
            "text": {
              "la": "Salve, Regina, mater misericordiae, vita, dulcedo et spes nostra, salve. Ad te clamamus, exsules filii Evae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, o pia, o dulcis Virgo Maria.",
              "en": "Hail, Queen, Mother of mercy; our life, our sweetness and our hope, hail. To you we raise our cries, exiled children of Eve. To you we sigh, weeping and groaning in this valley of tears. Hear us, then, O our Advocate; turn towards us those eyes so full of mercy. And at the end of this exile show us the blessed fruit of your womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
              "fr": "Salut, Reine, Mère de miséricorde; notre vie, notre douceur et notre espérance, salut. Nous élevons nos cris vers vous, enfants d’Eve exilés. Nous soupirons vers vous avec pleurs et gémissements, en cette vallée de larmes. Ecoutez-nous donc, ô notre Avocate; tournez vers nous ces regards pleins de vos miséricordes. Et au terme de cet exil, montrez-nous le fruit béni de vos entrailles, Jésus. O clémente, ô pieuse, ô douce Vierge Marie."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "guardian-angel",
            "kind": "prayer",
            "titleEn": "Guardian Angel",
            "titleFr": "Ange gardien",
            "text": {
              "la": "Angele Dei, qui custos es mei, me tibi commissum pietate superna illumina, custodi, rege et guberna. Amen.",
              "en": "Angel of God, who art my guardian by the gift of divine charity, enlighten me, protect me, direct me and govern me. Amen.",
              "fr": "Ange de Dieu, qui êtes mon gardien, par un bienfait de la divine charité, éclairez-moi, protégez-moi, dirigez-moi et gouvernez-moi. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          }
        ],
        "evening": [
          {
            "id": "daily-prayer",
            "kind": "prayer",
            "titleEn": "Evening Adoration and Thanksgiving",
            "titleFr": "Adoration et action de grâces",
            "text": {
              "la": "Adoro te, Deus meus, et amo te ex toto corde. Gratias tibi ago, quod me creavisti, christianum fecisti et per hunc diem servavisti. Ignosce mihi mala quae hodie commisi; et si quid boni egi, suscipe illud. In quiete me custodi et a periculis libera. Gratia tua semper mecum sit et cum omnibus mihi caris. Amen.",
              "en": "I adore You, my God, and love You with all my heart. I thank You for having created me, made me a Christian, and preserved me through this day. Forgive me the wrong I have done today, and if I have done any good, accept it. Keep me safe in my rest and deliver me from dangers. May Your grace always be with me and with all those dear to me. Amen.",
              "fr": "Je vous adore, mon Dieu, et vous aime de tout mon cœur. Je vous remercie de m'avoir créé, fait chrétien et conservé en ce jour. Pardonnez-moi le mal que j'ai commis aujourd'hui, et si j'ai accompli quelque bien, acceptez-le. Gardez-moi dans le repos et délivrez-moi des dangers. Que votre grâce soit toujours avec moi et avec tous ceux qui me sont chers. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "our-father",
            "kind": "prayer",
            "titleEn": "Our Father",
            "titleFr": "Notre Père",
            "text": {
              "la": "Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.",
              "en": "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; forgive us our trespasses as we forgive those who trespass against us; and suffer us not to succumb to temptation, but deliver us from evil. Amen.",
              "fr": "Notre Père qui êtes aux cieux, que votre nom soit sanctifié, que votre règne arrive, que votre volonté soit faite sur la terre comme au ciel. Donnez-nous aujourd’hui notre pain quotidien, pardonnez-nous nos offenses comme nous pardonnons à ceux qui nous ont offensés, et ne nous laissez pas succomber à la tentation, mais délivrez-nous du mal. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "hail-mary",
            "kind": "prayer",
            "titleEn": "Hail Mary",
            "titleFr": "Je vous salue Marie",
            "text": {
              "la": "Ave, Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.",
              "en": "Hail Mary, full of grace; the Lord is with thee; blessed art thou among women, and blessed is Jesus, the fruit of thy womb. Holy Mary, Mother of God, pray for us poor sinners, now and at the hour of our death. Amen.",
              "fr": "Je vous salue, Marie pleine de grâce; le Seigneur est avec vous; vous êtes bénie entre toutes les femmes, et Jésus, le fruit de vos entrailles, est béni. Sainte Marie, Mère de Dieu, priez pour nous, pauvres pécheurs, maintenant et à l’heure de notre mort. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "glory-be",
            "kind": "prayer",
            "titleEn": "Glory Be",
            "titleFr": "Gloire au Père",
            "text": {
              "la": "Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc et semper, et in saecula saeculorum. Amen.",
              "en": "Glory be to the Father, and to the Son, and to the Holy Ghost, as it was in the beginning, is now and ever shall be, world without end. Amen.",
              "fr": "Gloire au Père, et au Fils et au Saint-Esprit, comme il était au commencement, maintenant et toujours, dans les siècles des siècles. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "creed",
            "kind": "prayer",
            "titleEn": "Apostles’ Creed",
            "titleFr": "Symbole des Apôtres",
            "text": {
              "la": "Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae, et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.",
              "en": "I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Ghost, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried, descended into hell; on the third day He rose again from the dead; He ascended into heaven and sitteth at the right hand of God the Father almighty, whence He shall come to judge the living and the dead. I believe in the Holy Ghost, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
              "fr": "Je crois en Dieu le Père tout-puissant, créateur du ciel et de la terre, et en Jésus-Christ, son Fils unique Notre-Seigneur, qui a été conçu du Saint-Esprit, est né de la Vierge Marie, a souffert sous Ponce-Pilate, a été crucifié, est mort et a été enseveli, est descendu aux enfers; le troisième jour est ressuscité d’entre les morts, est monté au ciel, est assis à la droite de Dieu le Père tout-puissant, d’où il viendra juger les vivants et les morts. Je crois au Saint-Esprit, à la sainte Eglise catholique, à la communion des saints, à la rémission des péchés, à la résurrection de la chair, à la vie éternelle. Ainsi soit-il."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "STANDARD_TRADITIONAL_LATIN_FORM_MATCHED_TO_NAMED_COMMON_PRAYER_NOT_CLAIMED_AS_EDITION_LATIN_ORIGINAL",
            "sourceExact": true
          },
          {
            "id": "faith",
            "kind": "prayer",
            "titleEn": "Act of Faith",
            "titleFr": "Acte de foi",
            "text": {
              "la": "Deus meus, firmiter credo omnia quae tu, Veritas infallibilis, revelasti et quae Ecclesia nobis credenda proponit. Expresse credo in te, unum verum Deum in tribus Personis aequalibus et distinctis, Patre, Filio et Spiritu Sancto. Credo item in Filium incarnatum et pro nobis mortuum, Iesum Christum, qui unicuique secundum merita aeterna praemia aut poenas tribuet. Semper secundum hanc fidem vivere volo. Domine, auge fidem meam.",
              "en": "My God, I firmly believe all that You, infallible Truth, have revealed and that the Church proposes to us for belief. I believe expressly in You, the one true God in three equal and distinct Persons, Father, Son and Holy Ghost. I likewise believe in the Son made man and put to death for us, Jesus Christ, who will give to each person, according to his merits, eternal reward or punishment. I desire always to live according to this faith. Lord, increase my faith.",
              "fr": "Mon Dieu, je crois fermement tout ce que vous, infaillible Vérité, avez révélé et que l’Eglise nous propose à croire. Je crois expressément en vous, unique vrai Dieu en trois personnes égales et distinctes, Père, Fils et Saint-Esprit. Je crois de même au Fils incarné et mort pour nous, Jésus-Christ, qui donnera à chacun, selon ses mérites, la récompense ou la peine éternelle. Je veux toujours vivre conformément à cette foi. — Seigneur, augmentez ma foi."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "hope",
            "kind": "prayer",
            "titleEn": "Act of Hope",
            "titleFr": "Acte d’espérance",
            "text": {
              "la": "Deus meus, spero propter bonitatem tuam et promissiones atque merita Iesu Christi Salvatoris nostri vitam aeternam et gratias necessarias ad eam merendam per bona opera quae agere debeo et volo. Domine, ne confundar in aeternum.",
              "en": "My God, I hope, through Your goodness, because of the promises and merits of Jesus Christ our Saviour, for eternal life and the graces necessary to merit it by the good works which I ought to perform and wish to accomplish. Lord, let me not be confounded for ever.",
              "fr": "Mon Dieu, j’espère de votre bonté, à cause des promesses et des mérites de Jésus-Christ notre Sauveur, la vie éternelle et les grâces nécessaires pour la mériter par les bonnes œuvres que je dois et veux accomplir. — Seigneur, que je ne sois pas éternellement confondu."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "charity",
            "kind": "prayer",
            "titleEn": "Act of Charity",
            "titleFr": "Acte de charité",
            "text": {
              "la": "Deus meus, ex toto corde super omnia te amo, Bonum infinitum et beatitudinem nostram aeternam; propter amorem tui proximum meum sicut me ipsum diligo et offensas mihi illatas remitto. Domine, fac ut te semper magis amem.",
              "en": "My God, I love You with all my heart above all things, O infinite Good and our eternal happiness. For love of You I love my neighbour as myself and forgive the offences I have received. Lord, grant that I may love You ever more.",
              "fr": "Mon Dieu, je vous aime de tout mon cœur par-dessus toutes choses, ô Bien infini et notre éternelle félicité; par amour pour vous j’aime mon prochain comme moi-même et je pardonne les offenses reçues. — Seigneur, faites que je vous aime toujours davantage."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "examen",
            "kind": "guided",
            "titleEn": "Examination of Conscience",
            "titleFr": "Examen de conscience",
            "text": {
              "la": null,
              "en": null,
              "fr": null
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": null,
            "sourceExact": true
          },
          {
            "id": "contrition",
            "kind": "prayer",
            "titleEn": "Act of Contrition",
            "titleFr": "Acte de contrition",
            "text": {
              "la": "Deus meus, ex toto corde me paenitet peccatorum meorum; ea odio habeo et detestor, quia infinitam Maiestatem tuam offendunt, causae mortis divini Filii tui Iesu sunt et ruinam animae meae afferunt. Ea in posterum committere nolo et occasiones eorum fugere propono. Domine, miserere mei; ignosce mihi.",
              "en": "My God, I repent of my sins with all my heart. I hate and detest them because they offend Your infinite Majesty, are the cause of the death of Your divine Son Jesus, and bring about my spiritual ruin. I do not wish to commit them again, and I resolve to avoid their occasions. Lord, have mercy; forgive me.",
              "fr": "Mon Dieu, je me repens de mes péchés de tout mon cœur; je les hais et les déteste parce qu’ils offensent votre Majesté infinie, sont la cause de la mort de votre divin Fils Jésus, et constituent ma ruine spirituelle. Je ne veux plus en commettre à l’avenir, et je me propose d’en fuir les occasions. — Seigneur, miséricorde, pardonnez-moi."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          },
          {
            "id": "de-profundis",
            "kind": "supplement",
            "titleEn": "De profundis — For the Departed",
            "titleFr": "De profundis — Pour les défunts",
            "text": {
              "la": null,
              "en": null,
              "fr": null
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": null,
            "sourceExact": true
          },
          {
            "id": "jesus-joseph-mary",
            "kind": "supplement",
            "titleEn": "Jesus, Joseph and Mary",
            "titleFr": "Jésus, Joseph et Marie",
            "text": {
              "la": "Iesu, Ioseph et Maria, cor meum, mentem et vitam vobis dono.\nIesu, Ioseph et Maria, dignamini mihi in ultima agonia assistere.\nIesu, Ioseph et Maria, concedite, quaeso, ut animam meam in pace in consortio vestro reddam.",
              "en": "Jesus, Joseph and Mary, I give you my heart, my mind and my life.\nJesus, Joseph and Mary, deign to assist me in my last agony.\nJesus, Joseph and Mary, grant me, I pray, to surrender my soul in peace in your company.",
              "fr": "Jésus, Joseph, Marie, je vous donne mon cœur, mon esprit et ma vie.\nJésus, Joseph, Marie, daignez m’assister dans ma dernière agonie.\nJésus, Joseph, Marie, donnez-moi, je vous prie, de rendre l’âme en paix dans votre compagnie."
            },
            "sourceLabel": "St Pius X, authorized French revision (1913)",
            "sourceUrl": "https://pdfs.bibliotheque-catholique.com/pdfs/catechisme/Saint%20Pie%20X%20-%20Cat%C3%A9chisme%20de%20Saint%20Pie%20X.pdf",
            "translationStatus": "AD_ORIENTEM_EDITORIAL_LATIN_DRAFT_NOT_PRINTED_PIUS_X",
            "sourceExact": true
          }
        ]
      }
    }
  },
  "additional": [
    {
      "id": "b11-lasance-morning-adoration-thanksgiving",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Adoration and Thanksgiving",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147",
      "text": "Almighty and eternal God, I adore Thee, and I thank Thee for all the benefits which Thou, in Thy infinite goodness and mercy, hast conferred upon me. I thank Thee especially for having preserved and protected me this night.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-morning-thanksgiving",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Adoration and Thanksgiving",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20",
      "text": "O my God! I adore thee, and I love thee with my whole heart. I thank thee for all the benefits which thou hast granted me, and especially for having protected me so mercifully this night.",
      "sourceImageChecked": true
    },
    {
      "id": "b10-bbg-1925-apostleship-morning-offering",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "offering",
      "purpose": "offering",
      "title": "Morning Offering",
      "sourceLabel": "Callan and McHugh, Blessed Be God (1925)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/48",
      "text": "O Jesus, through the Immaculate Heart of Mary, I offer Thee my prayers, works and sufferings of this day for all the intentions of Thy Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, in reparation for my sins, for the intentions of all our Associates and in particular for the intention of the Apostleship of Prayer.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-lasance-apostleship-my-god",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "offering",
      "purpose": "offering",
      "title": "Morning Offering",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/137",
      "text": "O my God, I offer Thee my prayers, works, and sufferings this day in union with the Sacred Heart of Jesus, for the intentions for which He pleads and offers Himself in holy Mass, in thanksgiving for Thy favors, in reparation for our offenses, and for the petitions of all our associates; especially this month for the particular intention of the Apostleship of Prayer.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-lasance-apostleship-o-jesus",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "offering",
      "purpose": "offering",
      "title": "Morning Offering",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/137",
      "text": "O, Jesus, through the immaculate heart of Mary, I offer Thee my prayers, works, and sufferings of this day for all the intentions of Thy Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, for the intentions of all our associates and in particular for the intention recommended by our Holy Father, the Pope.",
      "sourceImageChecked": true
    },
    {
      "id": "pocket-1899-morning-sacred-heart-offering",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "offering",
      "purpose": "offering",
      "title": "Morning Offering",
      "sourceLabel": "The Catholic's Pocket Prayer Book (1899)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:TheCatholicsPocketPrayerBook.djvu/17",
      "text": "O Lord Jesus-Christ, in union with that divine intention with which Thou, whilst on earth, didst give praise to God through Thy most sacred Heart, and still dost continue to give praise to Him in the Sacrament of the Eucharist everywhere, even unto the consummation of the world, I, wishing to imitate the most sacred Heart of the ever immaculate Virgin Mary, most willingly, offer to Thee during this whole day, not excepting the smallest part therefrom, all my intentions and thoughts, all my affections and desires, all my words and actions.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-morning-good-intention",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "offering",
      "purpose": "offering",
      "title": "Morning Offering",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20",
      "text": "To thee, my God, I offer all that I shall do, all that I may suffer during the day which is now begun. I unite all my actions and sufferings to the sufferings of Jesus and Mary, and I make the intention now to gain all the indulgences to which I may be entitled for any good works of mine this day.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-morning-faith",
      "lang": "en",
      "daypart": "morning",
      "kind": "variant",
      "slot": "faith",
      "purpose": "faith",
      "title": "Faith",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147",
      "text": "O my God, I believe in Thee, because Thou art Truth itself, and I firmly believe all the sacred truths which the holy Catholic Church believes and teaches, because Thou hast revealed them.",
      "sourceImageChecked": true
    },
    {
      "id": "pocket-1899-morning-short-faith",
      "lang": "en",
      "daypart": "morning",
      "kind": "variant",
      "slot": "faith",
      "purpose": "faith",
      "title": "Faith",
      "sourceLabel": "The Catholic's Pocket Prayer Book (1899)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:TheCatholicsPocketPrayerBook.djvu/18",
      "text": "O my God! I firmly believe all the sacred truths which Thy holy Catholic Church believes and teaches, because Thou hast revealed them, who neither canst deceive nor be deceived.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-morning-hope",
      "lang": "en",
      "daypart": "morning",
      "kind": "variant",
      "slot": "hope",
      "purpose": "hopecharity",
      "title": "Hope and Charity",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/147",
      "text": "O my God, I hope in Thee, because Thou art omnipotent, most merciful, and faithful to Thy promises; I hope to obtain the pardon of my sins, the grace to live a holy life, to die a happy death, and to obtain life everlasting, through the merits of Jesus Christ, my Lord and Redeemer.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-morning-love",
      "lang": "en",
      "daypart": "morning",
      "kind": "variant",
      "slot": "charity",
      "purpose": "hopecharity",
      "title": "Hope and Charity",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148",
      "text": "O my God, I love Thee with my whole heart, and above all things, because Thou art infinitely good; and for the love of Thee I love my neighbor as myself.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-morning-grace",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "petition",
      "purpose": "petition",
      "title": "Petition and Resolution",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/20",
      "text": "O my Jesus! bear me in thy hands this day. Mary, holy Virgin! may I find shelter under thy protecting mantle. And do thou, O heavenly Father! show me mercy, for the love of Jesus and of Mary. My Guardian Angel, and all my patron Saints, help me by your holy prayers.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-morning-supplication",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "petition",
      "purpose": "petition",
      "title": "Petition and Resolution",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148",
      "text": "O my God, I beseech Thee most earnestly to bless me that I may serve Thee faithfully this day by a perfect devotedness to all my duties and a steadfast adherence to all my promises and good resolutions.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-morning-consecration",
      "lang": "en",
      "daypart": "morning",
      "kind": "additional",
      "slot": "petition",
      "purpose": "petition",
      "title": "Petition and Resolution",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/148",
      "text": "O my God, I wish to consecrate this day and all the days of my life to Thy honor and glory.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-thanks-offering",
      "lang": "fr",
      "daypart": "morning",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Thanksgiving and Offering",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38",
      "text": "Mon Dieu, je Vous remercie très humblement de toutes les grâces que Vous m'avez faites jusqu'ici. C'est encore par un effet de votre bonté que je vois ce jour ; je veux aussi l'employer uniquement à Vous servir. Je Vous en consacre toutes les pensées, les paroles, les actions et les peines. Bénissez-les, Seigneur, afin qu'il n'y en ait aucune qui ne soit animée de votre amour, et qui ne tende à votre plus grande gloire.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-act-faith",
      "lang": "fr",
      "daypart": "morning",
      "kind": "variant",
      "slot": "faith",
      "purpose": "acts",
      "title": "Faith Hope and Charity",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38",
      "text": "Mon Dieu, je crois fermement toutes les vérités que Vous avez révélées et que Vous nous enseignez par votre Eglise, parce que Vous ne pouvez ni Vous tromper, ni nous tromper.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-act-hope",
      "lang": "fr",
      "daypart": "morning",
      "kind": "variant",
      "slot": "hope",
      "purpose": "acts",
      "title": "Faith Hope and Charity",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38",
      "text": "Mon Dieu, j'espère avec une ferme confiance que Vous me donnerez, par les mérites de Jésus-Christ, votre grâce en ce monde, et, si j'observe vos commandements, votre gloire dans l'autre ; parce que Vous me l'avez promis, et que Vous êtes souverainement fidèle dans vos promesses.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-act-charity",
      "lang": "fr",
      "daypart": "morning",
      "kind": "variant",
      "slot": "charity",
      "purpose": "acts",
      "title": "Faith Hope and Charity",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38",
      "text": "Mon Dieu, je Vous aime de tout mon cœur et par-dessus toutes choses, parce que Vous êtes infiniment bon et infiniment aimable ; et j'aime mon prochain comme moi-même pour l'amour de Vous.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-evening-adoration-thanksgiving-light",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Presence and Thanksgiving",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/151",
      "text": "Almighty and eternal God, I adore Thee, and I thank Thee for all the benefits I have received this day through Thy infinite goodness and mercy. Give me light to know my faults and grant me grace to be truly sorry for my sins.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-bbg-evening-presence",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Presence and Thanksgiving",
      "sourceLabel": "Callan and McHugh, Blessed Be God (1925)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/58",
      "text": "O Almighty and eternal God, Whose majesty filleth heaven and earth, I firmly believe that Thou art here present; that Thine all-seeing eye is upon me; that Thou knowest all things, and art most intimately present in the very center of my soul. I desire to bow down all the powers of my soul to adore Thee; I desire to join my voice with all Thy blessed angels and saints, to praise Thee and glorify Thee now and forever.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-bbg-evening-thanksgiving",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "opening",
      "purpose": "opening",
      "title": "Presence and Thanksgiving",
      "sourceLabel": "Callan and McHugh, Blessed Be God (1925)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Blessedbegodcomp00call.pdf/59",
      "text": "I most heartily thank Thee, O Lord, for all Thy mercies and blessings bestowed upon me and upon Thy whole Church; and particularly for those I have received from Thee this day, in watching over me, and preserving me from so many evils, and favoring me with so many graces and inspirations. Oh, let me never more be ungrateful unto Thee, my God, Who art so good and gracious unto me.",
      "sourceImageChecked": true
    },
    {
      "id": "b12-baltimore-evening-examination-light",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "examen",
      "purpose": "examen",
      "title": "Light before Examination",
      "sourceLabel": "BAL1888",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Manualofprayersf00cath.djvu/94",
      "text": "O my God, sovereign Judge of men, who desirest not the death of a sinner, but that he should be converted and saved, enlighten my mind, that I may know the sins which I have this day committed in thought, word, or deed, and give me the grace of true contrition.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-evening-contrition",
      "lang": "en",
      "daypart": "evening",
      "kind": "variant",
      "slot": "contrition",
      "purpose": "contrition",
      "title": "Contrition",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/152",
      "text": "O my God, I am truly sorry for having sinned, because Thou art infinitely good and sin displeases Thee. I am firmly resolved, with the help of Thy grace, never more to offend Thee, and I will carefully avoid the occasions of sin.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-moran-long-contrition",
      "lang": "en",
      "daypart": "evening",
      "kind": "variant",
      "slot": "contrition",
      "purpose": "contrition",
      "title": "Contrition",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/32",
      "text": "O dread Lord, and most indulgent Father of mercies, I, a wretched worm, have sinned against heaven and before thee, and am no more worthy to be called thy servant, much less to be accounted thy child, having repaid so much bounty with contempt, and so many benefits with ingratitude. Where shall I find punishment enough to atone for my sins, or tears enough to wash out my iniquities? Alas! I grieve not merely at those pains which I have deserved for my sins; it pierces my very heart that I have offended a God who ought to be beloved and honoured above all things. What shall I say, O Lord, in detestation of the crimes I have committed? What shall I do to prevent my future relapse? Father, from henceforth the face of sin shall be more hideous to me than hell, and the least shadow of it more frightful than death. Forgive, O Almighty Lord, forgive, and have not the sins of my past life in remembrance. Why should the mighty Lord of heaven and earth be in wrath against so poor, so contemptible an object? Behold me, O God, not in thine anger, but according to the tender bowels of thy infinite mercy; for thou art our Father, and we are thy children; thou art our Maker, and we are as clay in thy hands; thou canst, with those waters drawn from the fountains of our blessed Saviour, cleanse our iniquities, and with the mixture of one drop of his most precious blood mould us again into vessels of honour. Of thee only, O merciful Father, I beg and hope for pardon; upon thee only do I call and depend for assistance, that I may hereafter constantly serve thee with a true and faithful obedience, and inseparably adhere to thee with a pure and perfect love for ever.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-evening-for-faithful-departed",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "departed",
      "purpose": "departed",
      "title": "Departed",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/33",
      "text": "O God, the Creator and Redeemer of all the faithful, grant to the souls of thy servants departed full remission of all their offences, that, through the help of pious supplications, they may obtain the pardon of which they have been always desirous: who livest and reignest, world without end. Amen.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-evening-visita-quaesumus",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "protection",
      "purpose": "protection",
      "title": "Night protection",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/34",
      "text": "Visit, we beseech thee, O Lord, this habitation, and repel from it all the snares of the enemy. Let thy holy angels dwell herein to preserve us in peace; and may thy blessing be upon us for ever: through Christ our Lord. Amen.",
      "sourceImageChecked": true
    },
    {
      "id": "moran-1883-evening-salva-nos",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "protection",
      "purpose": "protection",
      "title": "Night protection",
      "sourceLabel": "Patrick F. Moran, The Catholic Prayer Book (1883)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:The_Catholic_prayer_book.djvu/34",
      "text": "Save us, O Lord, waking; and keep us, sleeping; that we may watch with Christ, and rest in peace. Amen.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-lasance-alphonsus-night",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "protection",
      "purpose": "protection",
      "title": "Night protection",
      "sourceLabel": "F. X. Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/155",
      "text": "Jesus Christ, my God, I adore Thee and I thank Thee for all the graces Thou hast bestowed on me this day. I offer to Thee my sleep and every moment of this night, and I beseech Thee to keep me free from sin. To secure this I place myself within Thy sacred side and under the protecting mantle of Our Lady, my Mother. May Thy holy angels help me and keep me in peace, and may Thy blessing be upon me.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-thanksgiving",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "evening-acts",
      "purpose": "evening-acts",
      "title": "Thanksgiving, examination and contrition",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42",
      "text": "Quelles actions de grâces Vous rendrai-je, ô mon Dieu, pour tous les biens que j’ai reçus de Vous? Vous avez songé à moi de toute éternité; Vous m’avez tiré du néant, Vous avez donné votre vie pour me racheter, et Vous me comblez tous les jours d’une infinité de faveurs. Hélas! Seigneur, que puis-je faire en reconnaissance de tant de bontés? Joignez-vous à moi, Esprits Bienheureux, pour louer le Dieu des miséricordes, qui ne cesse de faire du bien à la plus indigne et la plus ingrate de ses créatures.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-light",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "evening-acts",
      "purpose": "evening-acts",
      "title": "Thanksgiving, examination and contrition",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42",
      "text": "Source éternelle de lumière, Esprit-Saint, dissipez les ténèbres qui me cachent la laideur et la malice du péché. Faites-m’en concevoir une si grande horreur, ô mon Dieu, que je le haïsse, s’il se peut, autant que Vous le haïssez Vous-même, et que je ne craigne rien tant que de le commettre à l’avenir.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-contrition",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "evening-acts",
      "purpose": "evening-acts",
      "title": "Thanksgiving, examination and contrition",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/43",
      "text": "Me voici, Seigneur, tout couvert de confusion, et pénétré de douleur à la vue de mes fautes. Je viens les détester devant Vous, avec un vrai déplaisir d’avoir offensé un Dieu si bon, si aimable, et si digne d’être aimé. Était-ce donc là, ô mon Dieu, ce que Vous deviez attendre de ma reconnaissance, après m’avoir aimé jusqu’à répandre votre sang pour moi! Oui, Seigneur, j’ai poussé trop loin ma malice et mon ingratitude. Je Vous en demande très humblement pardon, et je Vous conjure, ô mon Dieu! par cette même bonté dont j’ai ressenti tant de fois les effets, de m’accorder la grâce d’en faire dès aujourd’hui et jusqu’à la mort une sincère pénitence.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-bedtime",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "protection",
      "purpose": "protection",
      "title": "Night protection",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44",
      "text": "Bénissez, ô mon Dieu, le repos que je vais prendre pour réparer mes forces, afin de Vous mieux servir. Vierge sainte, Mère de mon Dieu, et après Lui mon unique espérance; mon bon Ange, mon saint Patron, intercédez pour moi, protégez-moi pendant cette nuit, tout le temps de ma vie, et à l’heure de ma mort. Ainsi soit-il.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-visita",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "protection",
      "purpose": "protection",
      "title": "Night protection",
      "sourceLabel": "Exercices de la vie chrétienne (1905 appendix to French Catechism of Trent)",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44",
      "text": "Nous Vous supplions, Seigneur, de visiter notre demeure, et d’en éloigner toutes les embûches de l’ennemi; que vos saints Anges y habitent, afin de nous conserver en paix, et que votre bénédiction soit toujours sur nous. Par Notre-Seigneur Jésus-Christ. Ainsi soit-il.",
      "sourceImageChecked": true
    },
    {
      "id": "b11-lasance-evening-love",
      "lang": "en",
      "daypart": "evening",
      "kind": "additional",
      "slot": "supplement",
      "purpose": "supplement",
      "title": "evening love",
      "sourceLabel": "Lasance, With God (1911)",
      "sourceUrl": "https://en.wikisource.org/wiki/Page:Withgodbookofpra00las.djvu/152",
      "text": "I love Thee, my Lord and my God, with my whole heart and above all things, and for the love of Thee I love my neighbor as myself. Grant that I may love Thee more and more and give me the grace of perseverance, that I may live a holy life, die a happy death, and glorify Thee eternally in heaven.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-supplication",
      "lang": "fr",
      "daypart": "morning",
      "kind": "additional",
      "slot": "petition",
      "purpose": "supplement",
      "title": "morning supplication",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/39",
      "text": "Mon Dieu, Vous connaissez ma faiblesse. Je ne puis rien sans le secours de votre grâce. Ne me la refusez pas, ô mon Dieu : proportionnez-la à mes besoins ; donnez-moi assez de force pour éviter tout le mal que Vous défendez, pour pratiquer tout le bien que Vous attendez de moi, et pour souffrir patiemment toutes les peines qu'il Vous plaira de m'envoyer.",
      "sourceImageChecked": true
    },
    {
      "id": "fr-1905-morning-resolution",
      "lang": "fr",
      "daypart": "morning",
      "kind": "additional",
      "slot": "resolution",
      "purpose": "supplement",
      "title": "morning resolution",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/38",
      "text": "Adorable Jésus, divin Modèle de la perfection à laquelle nous devons aspirer, je vais m'appliquer, autant que je le pourrai, à me rendre semblable à Vous, doux, humble, chaste, zélé, patient, charitable, obéissant et résigné comme Vous. Et je ferai particulièrement tous mes efforts pour ne pas retomber aujourd'hui dans les fautes que je commets si souvent, et dont je souhaite sincèrement de me corriger.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-adoration",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "supplement",
      "purpose": "supplement",
      "title": "evening adoration",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/42",
      "text": "Je Vous adore, ô mon Dieu, avec la soumission que m’inspire la présence de votre souveraine grandeur. Je crois en Vous, parce que Vous êtes la Vérité même. J’espère en Vous, parce que Vous êtes infiniment bon. Je Vous aime de tout mon cœur, parce que Vous êtes souverainement aimable, et j’aime mon prochain comme moi-même pour l’amour de Vous.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-resolution",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "resolution",
      "purpose": "supplement",
      "title": "evening resolution",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/43",
      "text": "Que je souhaiterais, ô mon Dieu, ne Vous avoir jamais offensé! Mais puisque j’ai été assez malheureux que de Vous déplaire, je vais Vous marquer mon repentir par une conduite meilleure que celle que j’ai gardée jusqu’ici. Je renonce dès à présent au péché et à l’occasion du péché, surtout de celui où j’ai la faiblesse de retomber si souvent. Et si Vous daignez m’accorder votre grâce, ainsi que je la demande et que je l’espère, je tâcherai de remplir fidèlement mes devoirs, et rien ne sera capable de m’arrêter quand il s’agira de Vous servir. Ainsi soit-il.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-evening-intercession",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "intercessions",
      "purpose": "supplement",
      "title": "evening intercession",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44",
      "text": "Répandez, Seigneur, vos bénédictions sur mes parents, mes bienfaiteurs, mes amis et mes ennemis. Protégez tous ceux que vous m’avez donnés pour supérieurs, tant spirituels que temporels. Secourez les pauvres, les prisonniers, les affligés, les voyageurs, les malades et les agonisants. Convertissez les hérétiques, les pécheurs, et éclairez les infidèles. Dieu de bonté et de miséricorde, ayez aussi pitié des âmes des fidèles qui sont dans le purgatoire. Mettez fin à leurs peines; et donnez à celles pour lesquelles je suis obligé de prier, le repos et la lumière éternelle. Ainsi soit-il.",
      "sourceImageChecked": true
    },
    {
      "id": "b09-fr1905-prayer-all-saints",
      "lang": "fr",
      "daypart": "evening",
      "kind": "additional",
      "slot": "supplement",
      "purpose": "supplement",
      "title": "all saints",
      "sourceLabel": "Exercices de la vie chrétienne, devotional appendix in a 1905 French edition of the Catechism of Trent",
      "sourceUrl": "https://fr.wikisource.org/wiki/Page:Cat%C3%A9chisme_du_saint_concile_de_Trente,_1905.djvu/44",
      "text": "Âmes très heureuses, qui avez eu le bonheur de parvenir à la Gloire, obtenez-nous deux choses de Celui qui est notre commun Dieu et Père: que nous ne L’offensions jamais mortellement, et qu’Il ôte de nous tout ce qui Lui déplaît. Ainsi soit-il.",
      "sourceImageChecked": true
    }
  ]
});
