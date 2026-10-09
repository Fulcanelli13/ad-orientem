
(()=>{'use strict';
const VERSION='SAINT-ART-MANIFEST-v3.3', CACHE_VERSION='saints-art-v13', APPROVAL_EPOCH='approval-pass10-gated-v1', CLOSURE_VERSION='SAINT-ART-CLOSURE-v1', CERTIFIED_NO_ART_REASON='No explicitly researched and verified reusable artwork rule exists in the frozen saint-art registry. This identity is intentionally closed with no artwork rather than using an unverified generic Commons category.', EXPECTED={saintBearingDates:252,components:311,monthly:{'01':{days:20,components:26},'02':{days:17,components:20},'03':{days:14,components:15},'04':{days:17,components:18},'05':{days:25,components:32},'06':{days:23,components:28},'07':{days:25,components:36},'08':{days:28,components:36},'09':{days:22,components:27},'10':{days:23,components:27},'11':{days:21,components:28},'12':{days:17,components:18}}};
const DENOMINATOR_RECONCILIATION=Object.freeze({previousTarget:307,resolvedTarget:311,changes:Object.freeze({January:Object.freeze({from:25,to:26,delta:1,reason:'The frozen January subtotal contradicted its own researched decisions: every retained mixed-date commemoration is independent, while the stable multi-saint titles remain one component. Those explicit decisions sum to 26, not 25.'}),August:Object.freeze({from:34,to:36,delta:2,reason:'The raw saint-art scope yields 34 components before researched composite expansion. The later locked 22 August rule intentionally splits Timothy, Hippolytus and Symphorian into three independent canonical art components, adding two.'}),November:Object.freeze({from:27,to:28,delta:1,reason:'The frozen November subtotal predated the later clearance of St Pontian on 19 November as a separate retained commemoration component. The explicit retained identities sum to 28.'})}),policy:'Correct the denominator to the explicit canonical-component decisions; do not merge historically distinct identities merely to preserve a stale total.'});
const COMMONS_API='https://commons.wikimedia.org/w/api.php', TTL=14*24*60*60*1000;
const ALLOWED_LICENSE=/\b(public domain|pd(?:-|\b)|cc0|cc by(?:-|\s)|cc-by|cc by-sa|cc-by-sa)\b/i;
const REJECT_NON_ART=/\b(map|coat of arms|signature|logo|diagram|floor plan|location map|locator map|flag|seal|stamp|coin|postcard)\b/i;
const PREFER_ART=/\b(painting|fresco|icon|mosaic|altarpiece|miniature|manuscript|stained glass|sculpture|engraving|etching|historical print|oil|tempera)\b/i;
const DANGEROUS=/\b(augustine|ignatius|boniface|agapitus|eusebius|martin|thomas|teresa|therese|hyacinth|felix|hippolytus|cyprian|tiburtius|timothy)\b/i;
const COLLECTIVE_COMPONENTS=new Set(['group.forty-martyrs-sebaste','group.twelve-holy-brothers','group.holy-maccabees','group.four-crowned-martyrs','group.ursula-companions','group.maurice-theban-legion']);
const COMPONENT_META={
 'group.eustace-family':{companionModel:'stableNamed',representationMode:'exact-group',exactType:'historical'},
 'group.januarius-companions':{companionModel:'historicalClusters',representationMode:'hybrid-exact+subgroup',exactType:'historical'},
 'group.maurice-theban-legion':{companionModel:'collectiveAnonymous',representationMode:'exact-group',exactType:'cult'},
 'group.placidus-companions':{companionModel:'conflatedIdentity',representationMode:'exact-liturgical-tradition',exactType:'liturgical'},
 'group.ursula-companions':{companionModel:'legendaryCollective',representationMode:'exact-group',exactType:'cult'},
 'group.four-crowned-martyrs':{companionModel:'conflatedIdentity',representationMode:'exact-liturgical-tradition',exactType:'liturgical'},
 'group.alexander-eventius-theodulus':{companionModel:'historicalClusters',representationMode:'exact-liturgical-tradition',exactType:'liturgical'}
};
const DISPLAY={
 'saint.augustine-canterbury':'Augustine of Canterbury','saint.augustine-hippo':'Augustine of Hippo','saint.ignatius-antioch':'Ignatius of Antioch','saint.ignatius-loyola':'Ignatius of Loyola','saint.boniface-tarsus':'Boniface of Tarsus','saint.boniface-mainz':'Boniface (Winfrid) of Mainz','saint.agapitus-praeneste':'Agapitus of Praeneste','saint.eusebius-rome':'Eusebius of Rome','saint.eusebius-vercelli':'Eusebius of Vercelli','saint.martin-tours':'Martin of Tours','saint.martin-i-pope':'Martin I, Pope','saint.thomas-apostle':'Thomas the Apostle','saint.thomas-becket':'Thomas Becket','saint.therese-lisieux':'Thérèse of Lisieux','saint.teresa-avila':'Teresa of Ávila','saint.hyacinth-poland':'Hyacinth of Poland','saint.agapitus-sixtus-companion':'Agapitus, companion of Sixtus II','saint.timothy-rome-martyr':'Timothy, Roman martyr','saint.hippolytus-aug22':'Hippolytus (22 August commemoration)','saint.symphorian-autun':'Symphorian of Autun','saint.euphemia-chalcedon':'Euphemia of Chalcedon','saint.pancras-rome':'Pancras of Rome','saint.erasmus-formia':'Erasmus of Formia','saint.victor-i-pope':'Victor I, Pope','saint.innocent-i-pope':'Innocent I, Pope','saint.martha-bethany':'Martha of Bethany','saint.felix-ii':'Felix II','saint.juvenal-narni':'Juvenal of Narni','saint.giles':'Giles','saint.thomas-villanova':'Thomas of Villanova','saint.joseph-cupertino':'Joseph of Cupertino',
 'group.domitilla-nereus-achilleus':'Domitilla, Nereus and Achilleus','group.marcellinus-peter':'Marcellinus and Peter','group.seven-holy-brothers':'Seven Holy Brothers','group.rufina-secunda':'Rufina and Secunda','group.nazarius-celsus':'Nazarius and Celsus','group.simplicius-faustinus-beatrice':'Simplicius, Faustinus and Beatrice','group.sixtus-ii-felicissimus-agapitus':'Sixtus II, Felicissimus and Agapitus','group.tiburtius-susanna':'Tiburtius and Susanna','group.hippolytus-cassian':'Hippolytus and Cassian','group.twelve-holy-brothers':'Twelve Holy Brothers','group.cornelius-cyprian-carthage':'Cornelius and Cyprian of Carthage','group.lucy-geminianus':'Lucy and Geminianus','group.januarius-companions':'Januarius and Companions','group.eustace-family':'Eustace, Theopista, Agapitus and Theopistus','group.maurice-theban-legion':'Maurice and the Theban Legion','group.placidus-companions':'Placidus and Companions','group.sergius-bacchus':'Sergius and Bacchus','group.marcellus-apuleius':'Marcellus and Apuleius','group.tryphon-respicius-nympha':'Tryphon, Respicius and Nympha','group.four-crowned-martyrs':'Four Crowned Martyrs','group.alexander-eventius-theodulus':'Alexander, Eventius and Theodulus','group.protus-hyacinth':'Protus and Hyacinth','group.cyprian-justina':'Cyprian and Justina','group.nabor-felix':'Nabor and Felix','group.felix-adauctus':'Felix and Adauctus','group.tiburtius-valerian-maximus':'Tiburtius, Valerian and Maximus',
 'saint.thomas-aquinas':'Thomas Aquinas','saint.camillus-de-lellis':'Camillus de Lellis','saint.paul-apostle':'Paul the Apostle','saint.peter-apostle':'Peter the Apostle','saint.peter-chrysologus':'Peter Chrysologus','saint.barbara-nicomedia':'Barbara of Nicomedia','saint.anastasia-sirmium':'Anastasia of Sirmium','group.vitus-modestus-crescentia':'Vitus, Modestus and Crescentia','group.basilides-cyrinus-nabor-nazarius':'Basilides, Cyrinus, Nabor and Nazarius','group.holy-innocents':'Holy Innocents','group.peter-paul-apostles':'Peter and Paul, Apostles','angel.gabriel':'Gabriel the Archangel','angel.raphael':'Raphael the Archangel','event.conversion-paul':'Conversion of St Paul','event.chair-peter':'Chair of St Peter','event.nativity-john-baptist':'Nativity of St John the Baptist','event.beheading-john-baptist':'Beheading of St John the Baptist','event.stigmata-francis':'Stigmata of St Francis','event.dedication-michael':'Dedication of St Michael','event.joseph-worker':'St Joseph the Workman','event.transfiguration-christ':'Transfiguration of Our Lord','tradition.immaculate-heart-mary':'Immaculate Heart of Mary'
};
const ART_COMPONENT_OVERRIDES={
 '05-03':['group.alexander-eventius-theodulus','saint.juvenal-narni'],
 '05-12':['group.domitilla-nereus-achilleus','saint.pancras-rome'],
 '06-02':['group.marcellinus-peter','saint.erasmus-formia'],
 '06-12':['saint.john-san-facundo','group.basilides-cyrinus-nabor-nazarius'],
 '06-15':['group.vitus-modestus-crescentia'],
 '06-30':['saint.paul-apostle','saint.peter-apostle'],
 '07-10':['group.seven-holy-brothers','group.rufina-secunda'],
 '07-28':['group.nazarius-celsus','saint.victor-i-pope','saint.innocent-i-pope'],
 '07-29':['saint.martha-bethany','saint.felix-ii','group.simplicius-faustinus-beatrice'],
 '08-06':['group.sixtus-ii-felicissimus-agapitus'],
 '08-11':['group.tiburtius-susanna'],
 '08-13':['group.hippolytus-cassian'],
 '08-22':['saint.timothy-rome-martyr','saint.hippolytus-aug22','saint.symphorian-autun'],
 '09-01':['saint.giles','group.twelve-holy-brothers'],
 '09-11':['group.protus-hyacinth'],
 '09-16':['group.cornelius-cyprian-carthage','saint.euphemia-chalcedon','group.lucy-geminianus'],
 '09-19':['group.januarius-companions'],
 '09-20':['group.eustace-family'],
 '09-22':['saint.thomas-villanova','group.maurice-theban-legion'],
 '09-26':['group.cyprian-justina'],
 '10-05':['group.placidus-companions'],
 '10-08':['saint.bridget-sweden','group.sergius-bacchus','group.marcellus-apuleius'],
 '11-08':['group.four-crowned-martyrs'],
 '11-10':['saint.andrew-avellino','group.tryphon-respicius-nympha'],
 '11-18':['group.peter-paul-apostles'],
 '12-04':['saint.peter-chrysologus','saint.barbara-nicomedia'],
 '12-25':['saint.anastasia-sirmium']
};
const DATE_IDENTITY_LOCKS=[
 ['01-14',/felic/i,'saint.felix-nola'],['01-24',/timothy/i,'saint.timothy-apostle'],['01-25',/conversion/i,'event.conversion-paul'],['01-25',/^St\.?\s+Peter$/i,'saint.peter-apostle'],
 ['02-01',/ignatius/i,'saint.ignatius-antioch'],['02-22',/chair/i,'event.chair-peter'],['02-22',/^St\.?\s+Paul$/i,'saint.paul-apostle'],['03-07',/thomas aquinas/i,'saint.thomas-aquinas'],
 ['04-14',/tiburtius|valerian|maximus/i,'group.tiburtius-valerian-maximus'],
 ['05-01',/joseph/i,'event.joseph-worker'],['05-14',/boniface/i,'saint.boniface-tarsus'],['05-28',/augustine/i,'saint.augustine-canterbury'],['05-30',/felix/i,'saint.felix-i-pope'],
 ['06-05',/boniface/i,'saint.boniface-mainz'],['06-24',/john.*baptist/i,'event.nativity-john-baptist'],['06-29',/Peter\s*(?:&|and)\s*Paul/i,'group.peter-paul-apostles'],
 ['07-12',/nabor|felic/i,'group.nabor-felix'],['07-18',/camillus/i,'saint.camillus-de-lellis'],['07-31',/ignatius/i,'saint.ignatius-loyola'],
 ['08-14',/eusebius/i,'saint.eusebius-rome'],['08-17',/hyacinth/i,'saint.hyacinth-poland'],['08-18',/agapitus/i,'saint.agapitus-praeneste'],['08-28',/augustine/i,'saint.augustine-hippo'],['08-29',/beheading/i,'event.beheading-john-baptist'],['08-30',/felix|adauctus/i,'group.felix-adauctus'],
 ['09-17',/stigmata/i,'event.stigmata-francis'],['09-18',/joseph.*cupertino/i,'saint.joseph-cupertino'],['09-29',/michael/i,'event.dedication-michael'],
 ['10-03',/theresa|therese|infant jesus/i,'saint.therese-lisieux'],['10-15',/teresa/i,'saint.teresa-avila'],
 ['11-11',/martin/i,'saint.martin-tours'],['11-12',/martin/i,'saint.martin-i-pope'],['11-20',/felix/i,'saint.felix-valois'],
 ['12-16',/eusebius/i,'saint.eusebius-vercelli'],['12-21',/thomas/i,'saint.thomas-apostle'],['12-29',/thomas/i,'saint.thomas-becket']
];
const APPROVED_ART_RULES={
 'saint.joseph-cupertino':{approved:true,files:['File:A Miracle of Saint Joseph of Cupertino (1603–1663) MET costanzi.jpg'],categories:['Joseph of Cupertino'],mustInclude:['joseph','cupertino'],block:['joseph calasanz','joseph the worker'],fallback:{title:'A Miracle of Saint Joseph of Cupertino (1603–1663)',artist:'Placido Costanzi',date:'c. 1750',credit:'The Metropolitan Museum of Art',license:'CC0',licenseUrl:'https://creativecommons.org/publicdomain/zero/1.0/',source:'https://commons.wikimedia.org/wiki/File:A_Miracle_of_Saint_Joseph_of_Cupertino_(1603%E2%80%931663)_MET_costanzi.jpg',thumb:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/A_Miracle_of_Saint_Joseph_of_Cupertino_%281603%E2%80%931663%29_MET_costanzi.jpg/960px-A_Miracle_of_Saint_Joseph_of_Cupertino_%281603%E2%80%931663%29_MET_costanzi.jpg'}},
 'saint.thomas-aquinas':{approved:true,categories:['Thomas Aquinas'],mustInclude:['thomas','aquinas'],block:['thomas apostle','thomas becket','thomas villanova']},
 'saint.camillus-de-lellis':{approved:true,categories:['Camillus de Lellis'],mustInclude:['camillus','lellis'],block:[]},
 'saint.peter-apostle':{approved:true,categories:['Saint Peter'],mustInclude:['peter'],block:['peter chrysologus','peter nolasco','peter of alexandria','peter celestine']},
 'saint.paul-apostle':{approved:true,categories:['Saint Paul'],mustInclude:['paul'],block:['paul the first hermit','paul of the cross']},
 'saint.barbara-nicomedia':{approved:true,categories:['Saint Barbara'],mustInclude:['barbara'],block:[]},
 'saint.anastasia-sirmium':{approved:true,categories:['Anastasia of Sirmium'],mustInclude:['anastasia'],block:[]},
 'angel.gabriel':{approved:true,categories:['Archangel Gabriel'],mustInclude:['gabriel'],block:[]},
 'angel.raphael':{approved:true,categories:['Archangel Raphael'],mustInclude:['raphael'],block:[]},
 'angel.michael':{approved:true,categories:['Archangel Michael'],mustInclude:['michael'],block:[]},
 'saint.augustine-canterbury':{approved:true,categories:['Augustine of Canterbury'],mustInclude:['augustine','canterbury'],block:['hippo']},
 'saint.augustine-hippo':{approved:true,categories:['Augustine of Hippo'],mustInclude:['augustine','hippo'],block:['canterbury']},
 'saint.ignatius-antioch':{approved:true,categories:['Ignatius of Antioch'],mustInclude:['ignatius','antioch'],block:['loyola']},
 'saint.ignatius-loyola':{approved:true,categories:['Ignatius of Loyola'],mustInclude:['ignatius','loyola'],block:['antioch']},
 'saint.boniface-mainz':{approved:true,categories:['Boniface of Mainz'],mustInclude:['boniface'],block:['tarsus']},
 'saint.boniface-tarsus':{approved:true,categories:['Boniface of Tarsus'],mustInclude:['boniface','tarsus'],block:['mainz','winfrid']},
 'saint.therese-lisieux':{approved:true,categories:['Thérèse of Lisieux'],mustInclude:['therese','lisieux'],block:['avila']},
 'saint.teresa-avila':{approved:true,categories:['Teresa of Ávila'],mustInclude:['teresa','avila'],block:['lisieux']},
 'event.beheading-john-baptist':{approved:true,categories:['Beheading of John the Baptist'],mustInclude:['john','baptist'],block:[]},
 'event.conversion-paul':{approved:true,categories:['Conversion of Paul the Apostle'],mustInclude:['paul'],block:[]},
 'event.stigmata-francis':{approved:true,categories:['Stigmatisation of Saint Francis'],mustInclude:['francis','stigm'],block:[]},
 'saint.martin-tours':{approved:true,categories:['Martin of Tours'],mustInclude:['martin','tours'],block:['martin i','pope martin']},
 'saint.thomas-becket':{approved:true,categories:['Thomas Becket'],mustInclude:['thomas','becket'],block:['aquinas','apostle','villanova']},
 'saint.thomas-villanova':{approved:true,categories:['Thomas of Villanova'],mustInclude:['thomas','villanova'],block:['aquinas','apostle','becket']},
 'saint.hyacinth-poland':{approved:true,categories:['Hyacinth of Poland'],mustInclude:['hyacinth'],block:[]},
 'saint.eusebius-vercelli':{approved:true,categories:['Eusebius of Vercelli'],mustInclude:['eusebius','vercelli'],block:['rome','caesarea','pope eusebius']},
 'saint.eusebius-rome':{approved:true,categories:['Eusebius of Rome'],mustInclude:['eusebius','rome'],block:['vercelli','caesarea','pope eusebius']},
 'saint.felix-valois':{approved:true,categories:['Félix de Valois'],mustInclude:['felix','valois'],block:[]},
 'saint.agapitus-praeneste':{approved:true,categories:['Saint Agapitus of Palestrina'],mustInclude:['agapitus'],block:['sixtus','felicissimus']},
 'saint.thomas-apostle':{approved:true,categories:['Saint Thomas'],mustInclude:['thomas'],block:['aquinas','becket','villanova']},
 'event.chair-peter':{approved:true,categories:['Cathedra Petri'],mustInclude:['peter'],block:[]},
 'event.nativity-john-baptist':{approved:true,categories:['Birth of John the Baptist'],mustInclude:['john','baptist'],block:[]},
 'saint.john-bosco':{approved:true,categories:['Giovanni Bosco'],mustInclude:['bosco'],block:[]},
 'saint.francis-de-sales':{approved:true,categories:['Francis de Sales'],mustInclude:['francis','sales'],block:['francis assisi','francis caracciolo','francis borgia']},
 'saint.john-chrysostom':{approved:true,categories:['John Chrysostom','John Chrysostom in art'],mustInclude:['john','chrysostom'],block:[]},
 'saint.paul-the-first-hermit':{approved:true,categories:['Paul of Thebes','Paintings of Saint Paul of Thebes'],mustInclude:['paul','thebes'],block:['paul apostle']},
 'saint.anthony':{approved:true,categories:['Saint Anthony the Great','Saint Anthony the Great in art'],mustInclude:['anthony'],block:['padua']},
 'saint.anthony-of-padua':{approved:true,categories:['Saint Anthony of Padua'],mustInclude:['anthony','padua'],block:['anthony the great']},
 'saint.agnes':{approved:true,categories:['Saint Agnes of Rome'],mustInclude:['agnes'],block:[]},
 'saint.barnabas':{approved:true,categories:['Saint Barnabas','Paintings of Saint Barnabas'],mustInclude:['barnabas'],block:[]},
 'saint.basil-the-great':{approved:true,categories:['Basil of Caesarea'],mustInclude:['basil'],block:['ancyra']},
 'saint.norbert':{approved:true,categories:['Norbert of Xanten','Norbert of Xanten in art'],mustInclude:['norbert'],block:[]},
 'saint.francis-caracciolo':{approved:true,categories:['Francesco Caracciolo'],mustInclude:['francis','caracciolo'],block:[]},
 'saint.peter-nolasco':{approved:true,categories:['Peter Nolasco'],mustInclude:['peter','nolasco'],block:['peter apostle']},
 'saint.raymond-of-penafort':{approved:true,categories:['Raimundo de Peñafort'],mustInclude:['raymond'],block:[]},
 'saint.erasmus-formia':{approved:true,categories:['Saint Erasmus'],mustInclude:['erasmus'],block:['desiderius','rotterdam']},
 'saint.euphemia-chalcedon':{approved:true,categories:['Saint Euphemia','Saint Euphemia in art'],mustInclude:['euphemia'],block:[]},
 'saint.giles':{approved:true,categories:['Saint Giles','Saint Giles in art'],mustInclude:['giles'],block:['cathedral','edinburgh']},
 'saint.juvenal-narni':{approved:true,categories:['Saint Juvenal','San Giovenale Triptych'],mustInclude:['juvenal','giovenale'],block:['juvenal satirist']},
 'saint.martin-i-pope':{approved:true,categories:['Martinus I'],mustInclude:['martin'],block:['martin of tours','luther']},
 'saint.pancras-rome':{approved:true,categories:['Saint Pancratius'],mustInclude:['pancr','pankr'],block:['station','railway','london']},
 'saint.peter-chrysologus':{approved:true,categories:['Peter Chrysologus'],mustInclude:['peter','chrysolog'],block:[]},
 'saint.symphorian-autun':{approved:true,categories:['Symphorian'],mustInclude:['symphor'],block:['abbey','church building']},
 'saint.innocent-i-pope':{approved:true,categories:['Innocentius I','Portraits of Innocentius I'],mustInclude:['innocent'],block:['innocent ii','innocent iii','innocent iv','innocent v','innocent vi','innocent vii','innocent viii','innocent ix','innocent x','innocent xi','innocent xii','innocent xiii']},
 'saint.martha-bethany':{approved:true,categories:['Saint Martha','Paintings of Saint Martha'],mustInclude:['martha'],block:['martha washington','santa marta']},
 'saint.victor-i-pope':{approved:true,categories:['Victor I'],mustInclude:['victor'],block:['victor ii','victor iii','victor iv']},
 'event.transfiguration-christ':{approved:true,categories:['Transfiguration of Jesus Christ','Transfiguration of Jesus Christ in art','Paintings of the transfiguration of Jesus Christ'],mustInclude:['transfiguration','christ'],block:[]},
 'saint.felix-ii':{approved:true,files:['File:Felix II antipapa.JPG'],categories:[],mustInclude:['felix'],block:['felix i','felix iii','felix iv','felix valois'],approvalNote:'Exact historical portrait of Felix II; Commons labels the subject Antipope Felix II. This rule represents the traditional 29 July liturgical identification without extending that label beyond the calendar evidence.'},
 'event.dedication-michael':{approved:true,files:['File:St. Michael, Archangel Met DP891138.jpg'],categories:[],mustInclude:['michael'],block:[],approvalNote:'Exact Jacques Callot September 29 St Michael print; used as representative saint-art for the Dedication of St Michael feast rather than architectural dedication imagery.'},

 'group.forty-martyrs-sebaste':{approved:true,categories:['Forty Martyrs of Sebaste in icons','Forty Martyrs of Sebaste'],mustInclude:['forty','martyrs','sebaste'],requireAll:true,block:['church building']},
 'group.four-crowned-martyrs':{approved:true,categories:['Martyrdom of the Four Crowned Saints by Jacopo Ligozzi','Triptych of the Four Crowned Martyrs','Four Crowned Martyrs'],mustInclude:['crowned','martyrs'],requireAll:true,block:['church building']},
 'group.marcellinus-peter':{approved:true,categories:['Marcellinus and Peter'],mustInclude:['marcellinus','peter'],requireAll:true,block:['pope marcellinus']},
 'group.cyprian-justina':{approved:true,categories:['Cyprian and Justina','Cyprian and Justina in icons'],mustInclude:['cyprian','justina'],requireAll:true,block:['cyprian of carthage']},
 'group.protus-hyacinth':{approved:true,categories:['Saints Protus and Hyacinth'],mustInclude:['protus','hyacinth'],requireAll:true,block:['hyacinth of poland']},
 'group.felix-adauctus':{approved:true,categories:['Saints Felix and Adauctus'],mustInclude:['felix','adauctus'],requireAll:true,block:['felix ii','felix of valois','felix of nola']},
 'group.vitus-modestus-crescentia':{approved:true,categories:['Vitus, Modestus and Crescentia'],mustInclude:['vitus','modestus','crescentia'],requireAll:true,block:[]},
 'group.sergius-bacchus':{approved:true,categories:['Icons of Serge and Bacchus','Saints Sergius and Bacchus'],mustInclude:['sergius','bacchus'],requireAll:true,block:['church building']},
 'group.maurice-theban-legion':{approved:true,categories:['Martyrdom of Saint Maurice and the Theban Legion by Jacopo Pontormo','Martyrdom of the Theban Legion by Sebastiano Vini','Theban Legion'],mustInclude:['maurice','theban'],requireAll:true,block:['church building']},
 'group.domitilla-nereus-achilleus':{approved:true,categories:['Domitilla with Nereus and Achilleus (Rubens)'],mustInclude:['domitilla','nereus','achilleus'],requireAll:true,block:[]},
 'group.holy-innocents':{approved:true,categories:['Paintings of the Massacre of the Innocents','Massacre of the Innocents'],mustInclude:['innocents','massacre'],requireAll:true,block:['church building']},
 'event.joseph-worker':{approved:true,categories:['Paintings of Saint Joseph as Carpenter','Saint Joseph as carpenter','Joseph the Carpenter by Georges de La Tour'],mustInclude:['joseph','carpenter','worker'],block:['joseph cupertino','joseph calasanz']},

 'group.seven-holy-brothers':{approved:true,files:['File:SevenBrothers.jpg'],categories:[],mustInclude:['seven','brothers'],requireAll:true,block:['seven sleepers','maccabees']},
 'group.rufina-secunda':{approved:true,categories:['Martirio delle sante Rufina e Seconda','Rufina and Secunda'],mustInclude:['rufina','secunda'],requireAll:true,block:['church building']},
 'group.nazarius-celsus':{approved:true,categories:['Nazarius and Celsus'],files:['File:St. Nazarius and St. Celsus Met DP891050.jpg','File:Nazarius Celsus.jpg'],mustInclude:['nazarius','celsus'],requireAll:true,block:['church building']},
 'group.tiburtius-valerian-maximus':{approved:true,categories:['Tiburtius, Valerian and Maximus'],files:['File:Pietro sorri the martyrdom of saints valerian tiburtius and maximus085036).jpg'],mustInclude:['tiburtius','valerian','maximus'],requireAll:true,block:['church building']},
 'group.peter-paul-apostles':{approved:true,files:['File:Masolino - Saints Paul and Peter - Google Art Project.jpg'],categories:['Saints Peter and Paul by Masolino'],mustInclude:['peter','paul'],requireAll:true,block:['church building','wildpark']},
 'group.lucy-geminianus':{approved:true,files:['File:Lucy and Geminianus (Menologion of Basil II).jpg'],categories:[],mustInclude:['lucy','geminianus'],requireAll:true,block:['lucy of syracuse']},
 'group.placidus-companions':{approved:true,files:['File:Santa Giustina (Padua) - Martyrdom of St. Placidus by Luca Giordano.jpg'],categories:[],mustInclude:['placid','companions'],requireAll:true,block:['church building']},
 'group.sixtus-ii-felicissimus-agapitus':{approved:true,files:['File:PopesixtusII.jpg'],categories:[],mustInclude:['sixtus','felicissimus','agapitus'],requireAll:true,block:['agapetus ii','pope agapetus']},
 'group.januarius-companions':{approved:true,files:['File:The Martyrdom of Saint Januarius and his Fellows (SM 1827).png'],categories:[],mustInclude:['januarius','fellows'],requireAll:true,block:[],fallback:{title:'The Martyrdom of Saint Januarius and his Fellows',artist:'Salvator Rosa',date:'17th century',credit:'Städel Museum, Frankfurt',license:'Public Domain Mark 1.0',licenseUrl:'https://creativecommons.org/publicdomain/mark/1.0/',source:'https://commons.wikimedia.org/wiki/File:The_Martyrdom_of_Saint_Januarius_and_his_Fellows_(SM_1827).png',thumb:'https://commons.wikimedia.org/wiki/Special:Redirect/file/The%20Martyrdom%20of%20Saint%20Januarius%20and%20his%20Fellows%20(SM%201827).png?width=1280'}},
 'group.hippolytus-cassian':{approved:true,files:["File:'Pietà' with Saints Hippolytus and Cassian - West entrance - Metropolitan Cathedral of Mexico City - Mexico 2024 (2).jpg"],categories:[],mustInclude:['hippolytus','cassian'],requireAll:true,block:['church building']},
 'group.cornelius-cyprian-carthage':{approved:true,files:["File:Taibon Agordino, chiesa dei Santi Cornelio e Cipriano - Pala d'altare di Paris Bordon.jpg"],categories:[],mustInclude:['cornelius','cyprian'],requireAll:true,block:['church building','last supper']},
 'group.eustace-family':{approved:true,files:['File:EustaceDeathFerdinandi.jpg'],categories:['Martyrdom of Saint Eustace and his family - San Stae (Venice)'],mustInclude:['eustace','family'],requireAll:true,block:['vision of saint eustace','stag']},
 'group.nabor-felix':{approved:true,files:['File:OrazioSamacchini-1.jpg'],categories:['Nabor and Felix'],mustInclude:['nabor','felix'],requireAll:true,block:['church building','reliquary']},
 'group.seven-servite-founders':{approved:true,files:['File:Agostino Masucci - The Madonna with the Seven Founders of the Servite Order - 1977.485 - Art Institute of Chicago.jpg'],categories:['Seven founders of the Servite Order'],mustInclude:['seven','founders','servite'],requireAll:true,block:['servite church','servite monastery','coat of arms']},
 'group.holy-maccabees':{approved:true,files:['File:Bible Etienne Harding 14 191 Martyre des sept frères Maccabées a.jpg'],categories:[],mustInclude:['maccabee','martyrs'],requireAll:true,block:['maccabean revolt','judas maccabeus','tomb']},
 'group.ursula-companions':{approved:true,files:['File:Bologna, fresco of St Ursula and companions, Chiesa della Trinità o del Martyrium (Santo Stefano).jpg'],categories:[],mustInclude:['ursula','companions'],requireAll:true,block:['saint ursula alone','portrait of saint ursula']},
};
const COMMONS_APPROVAL_PASS_1=Object.freeze({release:'v25',policy:'Approve only disambiguated Commons subject categories; resolver still requires an allowed licence and rejects non-art/blocked identities at file selection time.',newCanonicalApprovals:Object.freeze(['saint.thomas-aquinas','saint.camillus-de-lellis','saint.peter-apostle','saint.paul-apostle','saint.barbara-nicomedia','saint.anastasia-sirmium','angel.gabriel','angel.raphael','angel.michael']),verifiedCategories:Object.freeze({'saint.thomas-aquinas':'Thomas Aquinas','saint.camillus-de-lellis':'Camillus de Lellis','saint.peter-apostle':'Saint Peter','saint.paul-apostle':'Saint Paul','saint.barbara-nicomedia':'Saint Barbara','saint.anastasia-sirmium':'Anastasia of Sirmium','angel.gabriel':'Archangel Gabriel','angel.raphael':'Archangel Raphael','angel.michael':'Archangel Michael'})});
const COMMONS_APPROVAL_PASS_2=Object.freeze({release:'v26',policy:'Second conservative Commons approval tranche: exact disambiguated saint/event subject categories only; file licence and non-art filters remain independent runtime gates.',newCanonicalApprovals:Object.freeze(['saint.martin-tours','saint.thomas-becket','saint.thomas-villanova','saint.hyacinth-poland','saint.eusebius-vercelli','saint.eusebius-rome','saint.felix-valois','saint.agapitus-praeneste','saint.thomas-apostle','event.chair-peter','event.nativity-john-baptist']),verifiedCategories:Object.freeze({'saint.martin-tours':'Martin of Tours','saint.thomas-becket':'Thomas Becket','saint.thomas-villanova':'Thomas of Villanova','saint.hyacinth-poland':'Hyacinth of Poland','saint.eusebius-vercelli':'Eusebius of Vercelli','saint.eusebius-rome':'Eusebius of Rome','saint.felix-valois':'Félix de Valois','saint.agapitus-praeneste':'Saint Agapitus of Palestrina','saint.thomas-apostle':'Saint Thomas','event.chair-peter':'Cathedra Petri','event.nativity-john-baptist':'Birth of John the Baptist'})});
const COMMONS_APPROVAL_PASS_3=Object.freeze({release:'v27',policy:'Third conservative Commons approval tranche: individually identifiable saints with exact Commons subject/art categories; category approval never bypasses runtime licence, non-art, or identity filters.',newCanonicalApprovals:Object.freeze(['saint.john-bosco','saint.francis-de-sales','saint.john-chrysostom','saint.paul-the-first-hermit','saint.anthony','saint.anthony-of-padua','saint.agnes','saint.barnabas','saint.basil-the-great','saint.norbert','saint.francis-caracciolo','saint.peter-nolasco','saint.raymond-of-penafort']),verifiedCategories:Object.freeze({'saint.john-bosco':'Giovanni Bosco','saint.francis-de-sales':'Francis de Sales','saint.john-chrysostom':'John Chrysostom','saint.paul-the-first-hermit':'Paul of Thebes','saint.anthony':'Saint Anthony the Great','saint.anthony-of-padua':'Saint Anthony of Padua','saint.agnes':'Saint Agnes of Rome','saint.barnabas':'Saint Barnabas','saint.basil-the-great':'Basil of Caesarea','saint.norbert':'Norbert of Xanten','saint.francis-caracciolo':'Francesco Caracciolo','saint.peter-nolasco':'Peter Nolasco','saint.raymond-of-penafort':'Raimundo de Peñafort'})});
const COMMONS_APPROVAL_PASS_4=Object.freeze({release:'v28',policy:'Fourth conservative Commons approval tranche: exact individual saint subjects plus one exact Gospel event; ambiguous martyrs/groups remain provisional and file-level licence, non-art, and identity filters remain mandatory.',newCanonicalApprovals:Object.freeze(['saint.erasmus-formia','saint.euphemia-chalcedon','saint.giles','saint.juvenal-narni','saint.martin-i-pope','saint.pancras-rome','saint.peter-chrysologus','saint.symphorian-autun','saint.innocent-i-pope','saint.martha-bethany','saint.victor-i-pope','event.transfiguration-christ']),verifiedCategories:Object.freeze({'saint.erasmus-formia':'Saint Erasmus','saint.euphemia-chalcedon':'Saint Euphemia','saint.giles':'Saint Giles','saint.juvenal-narni':'Saint Juvenal','saint.martin-i-pope':'Martinus I','saint.pancras-rome':'Saint Pancratius','saint.peter-chrysologus':'Peter Chrysologus','saint.symphorian-autun':'Symphorian','saint.innocent-i-pope':'Innocentius I','saint.martha-bethany':'Saint Martha','saint.victor-i-pope':'Victor I','event.transfiguration-christ':'Transfiguration of Jesus Christ'})});
const COMMONS_APPROVAL_PASS_5=Object.freeze({release:'v29',policy:'Identity-sensitive Commons approval tranche: exact historical/liturgical groups and two special subjects only. Exact-category evidence is required; the four dangerous individual identities and unresolved collectives remain provisional. File-level licence, non-art, and identity filters remain mandatory.',newCanonicalApprovals:Object.freeze(['group.forty-martyrs-sebaste','group.four-crowned-martyrs','group.marcellinus-peter','group.cyprian-justina','group.protus-hyacinth','group.felix-adauctus','group.vitus-modestus-crescentia','group.sergius-bacchus','group.maurice-theban-legion','group.domitilla-nereus-achilleus','group.holy-innocents','event.joseph-worker']),verifiedCategories:Object.freeze({'group.forty-martyrs-sebaste':'Forty Martyrs of Sebaste in icons','group.four-crowned-martyrs':'Four Crowned Martyrs','group.marcellinus-peter':'Marcellinus and Peter','group.cyprian-justina':'Cyprian and Justina','group.protus-hyacinth':'Saints Protus and Hyacinth','group.felix-adauctus':'Saints Felix and Adauctus','group.vitus-modestus-crescentia':'Vitus, Modestus and Crescentia','group.sergius-bacchus':'Saints Sergius and Bacchus','group.maurice-theban-legion':'Theban Legion','group.domitilla-nereus-achilleus':'Domitilla with Nereus and Achilleus (Rubens)','group.holy-innocents':'Massacre of the Innocents','event.joseph-worker':'Saint Joseph as carpenter'})});
const COMMONS_APPROVAL_PASS_6=Object.freeze({release:'v30',policy:'Exact paired/group-art tranche. Prefer dedicated joint art categories; where Commons taxonomy is weak, lock resolution to a specifically verified reusable artwork file. Multi-person rules require all identifying tokens. Broad church/building categories and unresolved historical clusters remain provisional.',newCanonicalApprovals:Object.freeze(['group.seven-holy-brothers','group.rufina-secunda','group.nazarius-celsus','group.tiburtius-valerian-maximus','group.peter-paul-apostles','group.lucy-geminianus','group.placidus-companions']),verifiedCategories:Object.freeze({'group.rufina-secunda':'Martirio delle sante Rufina e Seconda / Rufina and Secunda','group.nazarius-celsus':'Nazarius and Celsus','group.tiburtius-valerian-maximus':'Tiburtius, Valerian and Maximus','group.peter-paul-apostles':'Saints Peter and Paul by Masolino'}),verifiedFiles:Object.freeze({'group.seven-holy-brothers':'File:SevenBrothers.jpg','group.nazarius-celsus':'File:St. Nazarius and St. Celsus Met DP891050.jpg','group.tiburtius-valerian-maximus':'File:Pietro sorri the martyrdom of saints valerian tiburtius and maximus085036).jpg','group.lucy-geminianus':'File:Lucy and Geminianus (Menologion of Basil II).jpg','group.peter-paul-apostles':'File:Masolino - Saints Paul and Peter - Google Art Project.jpg','group.placidus-companions':'File:Santa Giustina (Padua) - Martyrdom of St. Placidus by Luca Giordano.jpg'})});
const COMMONS_APPROVAL_PASS_7=Object.freeze({release:'v31',policy:'Exact-file recovery tranche for remaining small groups. Approval requires a specifically verified reusable artwork depicting the intended liturgical subject; church/building categories are not substitutes. Historical/conflated groups not covered by an exact artwork remain provisional.',newCanonicalApprovals:Object.freeze(['group.sixtus-ii-felicissimus-agapitus','group.januarius-companions','group.hippolytus-cassian','group.cornelius-cyprian-carthage','group.eustace-family','group.nabor-felix']),verifiedFiles:Object.freeze({'group.sixtus-ii-felicissimus-agapitus':'File:PopesixtusII.jpg','group.januarius-companions':'File:The Martyrdom of Saint Januarius and his Fellows (SM 1827).png','group.hippolytus-cassian':"File:'Pietà' with Saints Hippolytus and Cassian - West entrance - Metropolitan Cathedral of Mexico City - Mexico 2024 (2).jpg",'group.cornelius-cyprian-carthage':"File:Taibon Agordino, chiesa dei Santi Cornelio e Cipriano - Pala d'altare di Paris Bordon.jpg",'group.eustace-family':'File:EustaceDeathFerdinandi.jpg','group.nabor-felix':'File:OrazioSamacchini-1.jpg'})});
const COMMONS_APPROVAL_PASS_8=Object.freeze({release:'v32',policy:'Difficult-group pass. Approve only when a reusable joint artwork depicts the intended liturgical group itself. Exact subject files/categories are allowed; individual-only art, church/building categories and taxonomy-only group pages remain provisional.',newCanonicalApprovals:Object.freeze(['group.seven-servite-founders','group.holy-maccabees','group.ursula-companions']),verifiedCategories:Object.freeze({'group.seven-servite-founders':'Seven founders of the Servite Order'}),verifiedFiles:Object.freeze({'group.seven-servite-founders':'File:Agostino Masucci - The Madonna with the Seven Founders of the Servite Order - 1977.485 - Art Institute of Chicago.jpg','group.holy-maccabees':'File:Bible Etienne Harding 14 191 Martyre des sept frères Maccabées a.jpg','group.ursula-companions':'File:Bologna, fresco of St Ursula and companions, Chiesa della Trinità o del Martyrium (Santo Stefano).jpg'}),deferred:Object.freeze(['group.alexander-eventius-theodulus','group.basilides-cyrinus-nabor-nazarius','group.marcellus-apuleius','group.simplicius-faustinus-beatrice','group.tiburtius-susanna','group.tryphon-respicius-nympha','group.twelve-holy-brothers'])});
const COMMONS_APPROVAL_PASS_9=Object.freeze({release:'v33',policy:'Edge-case individual/special-subject pass. Approve only exact-file matches where the intended calendar identity or feast subject is explicit in the Commons file itself. Do not alias the 22 August Timothy or Hippolytus to better-known same-name saints; those remain provisional.',newCanonicalApprovals:Object.freeze(['saint.felix-ii','event.dedication-michael']),verifiedFiles:Object.freeze({'saint.felix-ii':'File:Felix II antipapa.JPG','event.dedication-michael':'File:St. Michael, Archangel Met DP891138.jpg'}),deferred:Object.freeze(['saint.timothy-rome-martyr','saint.hippolytus-aug22','saint.agapitus-sixtus-companion','tradition.immaculate-heart-mary']),notes:Object.freeze({felixII:'Commons labels the exact historical subject Antipope Felix II; Ad Orientem retains the 29 July liturgical identity from its pinned 1962 source while avoiding a broader historical claim.',michael:'Callot file explicitly identifies St Michael and September 29; it is representative saint-art for the feast, not an architectural depiction of the basilica dedication.',timothy:'Commons Saint Timothy taxonomy overwhelmingly identifies the apostolic Timothy or other Timothys; no exact August-22 Roman martyr file was verified.',hippolytus:'The traditional August-22 office names Hippolytus, Bishop of Porto, while modern scholarship treats the identity as confused/possibly duplicated with Hippolytus of Rome; no exact Porto file was verified.'})});
const COMMONS_APPROVAL_PASS_10=Object.freeze({release:'v35.3',policy:'Canonical-ID certification repair only. No new Commons subject is approved in this pass. Correct singular St. versus plural Sts. parsing, stop treating appositive commas as group evidence, and connect existing researched Peter/Paul/Joseph-of-Cupertino rules to the exact fixed-date occurrences that use them.',newCanonicalApprovals:Object.freeze([]),canonicalRepairs:Object.freeze({singularPrefix:'St. now resolves through the individual-saint branch; only explicit plural/group markers create group IDs.',commaPolicy:'A comma is no longer sufficient evidence of a multi-person component.',dateLocks:Object.freeze(['01-25 St Peter -> saint.peter-apostle','02-22 St Paul -> saint.paul-apostle','06-29 Sts Peter & Paul -> group.peter-paul-apostles','09-18 St Joseph of Cupertino -> saint.joseph-cupertino'])}),pinnedSourceAudit:Object.freeze({source:'mmolenda/missalemeum @ f43359b7a79a5a299158651eedf75cdaf0e43c94',saintBearingDates:252,occurrenceComponents:311,approvedOccurrencesBeforeRepair:73,approvedOccurrencesAfterRepair:89,approvedCanonicalIdsUsed:85,explicitApprovedRules:87,provisionalOccurrences:222,identityBlocked:0}),deferred:Object.freeze(['group.alexander-eventius-theodulus','group.basilides-cyrinus-nabor-nazarius','group.marcellus-apuleius','group.simplicius-faustinus-beatrice','group.tiburtius-susanna','group.tryphon-respicius-nympha','group.twelve-holy-brothers','saint.timothy-rome-martyr','saint.hippolytus-aug22']),note:'The two approved registry rules not represented as active saint-art occurrence IDs in this pinned manifest are angel.michael and event.transfiguration-christ; those belong to separate feast/event treatment rather than being forced into the 311 occurrence set.'});


const AO_ART_RULES=Object.create(null); let manifestPromise=null, lastManifest=null, activeComponentByDate=new Map(), lastDiag=null, lastNetworkAudit=null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const stripHtml=v=>{const d=document.createElement('div');d.innerHTML=String(v||'');return (d.textContent||'').replace(/\s+/g,' ').trim()};
const ascii=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=v=>ascii(v).replace(/\b(sts?|ss|saints?|blessed|pope|martyr|martyrs|virgin|confessor|bishop|abbot|apostle|evangelist)\b\.?/g,' ').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').replace(/-+/g,'-');
const diagnostic=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
function dateFromId(id){return String(id||'').match(/^sancti:(\d\d-\d\d)/)?.[1]||null}
function eventCanonical(date,title){const t=ascii(title);if(/conversion.*paul/.test(t))return 'event.conversion-paul';if(/chair.*peter/.test(t))return 'event.chair-peter';if(/nativity.*john.*baptist/.test(t))return 'event.nativity-john-baptist';if(/beheading.*john.*baptist/.test(t))return 'event.beheading-john-baptist';if(/stigmata.*francis/.test(t))return 'event.stigmata-francis';if(/dedication.*michael/.test(t))return 'event.dedication-michael';return null}
function lockedCanonical(date,title){const e=eventCanonical(date,title);if(e)return e;for(const [d,re,id] of DATE_IDENTITY_LOCKS)if(d===date&&re.test(title))return id;return null}
function genericCanonical(date,title){const locked=lockedCanonical(date,title);if(locked)return locked;const raw=String(title||'').trim();if(/Forty Holy Martyrs/i.test(raw))return 'group.forty-martyrs-sebaste';if(/Holy Machabees|Maccabees/i.test(raw))return 'group.holy-maccabees';if(/Holy Innocents/i.test(raw))return 'group.holy-innocents';if(/Seven Holy Servite Founders/i.test(raw))return 'group.seven-servite-founders';if(/Four Holy Crowned Martyrs/i.test(raw))return 'group.four-crowned-martyrs';if(/Ursula.*Companions/i.test(raw))return 'group.ursula-companions';if(/Gabriel.*Archangel/i.test(raw))return 'angel.gabriel';if(/Raphael.*Archangel/i.test(raw))return 'angel.raphael';if(/Michael.*Archangel/i.test(raw))return 'angel.michael';const clean=raw.replace(/^In Commemoratione Sancti\s+/i,'St. ').replace(/\b(Martyrs?|Confessor(?:is)?|Virginis|Virgin|Bishop|Abbot|Pope and Martyr|Pope|Apostle|Evangelist)\b[.,]?/gi,' ').replace(/\s+/g,' ').trim();if(DANGEROUS.test(clean))return null;if(/Companions|\bSts\.|\bSs\.|\band\b|&/.test(clean)&&!/^(St\.? )?[^,]+ of [^,]+$/i.test(clean))return 'group.'+slug(clean.replace(/^Sts\.?\s*|^Ss\.?\s*/i,''));if(/^(St\.?|Saint|S\.)\s+/i.test(clean))return 'saint.'+slug(clean);return null}
const NON_SAINT_ART=/^(?:Octave Day of Christmas|Epiphany of the Lord|Commemoration of the Baptism of the Lord|The Precious Blood of Our Lord Jesus Christ|Transfiguration of Our Lord|Exaltation of the Holy Cross|All Saints|Commemoration of All Souls|For Octave of the Nativity|Pro rogationibus|Holy Guardian Angels)/i;
const MARIAN_ART=/Purification of the Blessed Virgin Mary|Our Lady of Lourdes|Annunciation of the Blessed Virgin Mary|Queenship of the Blessed Virgin Mary|Visitation of the Blessed Virgin Mary|Our Lady of Mt\. Carmel|Assumption of the Blessed Virgin Mary|Immaculate Heart of Mary|Nativity of the Blessed Virgin Mary|Most Holy Name of Mary|Seven Sorrows of the Blessed Virgin Mary|Our Lady of Ransom|Our Lady of the Rosary|Maternity of the Blessed Virgin Mary|Presentation of the Blessed Virgin Mary|Immaculate Conception of the Blessed Virgin Mary|Dedication of the Basilica of St\. Mary Major/i;
const DEDICATION_NON_SUBJECT=/Dedication of the Archbasilica of Our Holy Savior/i;
function evidenceScope(title){const t=String(title||'');if(/^Vigil\b/i.test(t))return {include:false,reason:'VIGIL_NOT_NEW_ART_IDENTITY'};if(NON_SAINT_ART.test(t))return {include:false,reason:'SEPARATE_FEAST_ART_LAYER'};if(MARIAN_ART.test(t))return {include:false,reason:'MARIAN_FEAST_ART_LAYER'};if(DEDICATION_NON_SUBJECT.test(t))return {include:false,reason:'DEDICATION_ART_LAYER'};return {include:true,reason:'SAINT_ART_SCOPE'}}
function makeComponent(date,canonicalId,index,evidence,displayName){const suffix=(canonicalId||`needs-override-${index+1}`).replace(/^[^.]+\./,'').replace(/[^a-z0-9-]+/gi,'-');const meta=COMPONENT_META[canonicalId]||{};return {componentId:`cal.${date}.${suffix}${index?'-'+(index+1):''}`,canonicalId:canonicalId||null,displayName:displayName||DISPLAY[canonicalId]||evidence?.title||canonicalId||'Needs override',representationMode:meta.representationMode||(canonicalId?.startsWith('group.')?'exact-group':'individual'),exactType:meta.exactType||(canonicalId?.startsWith('group.')?'historical':null),companionModel:meta.companionModel||null,qaStatus:canonicalId?'RESOLVED':'NEEDS_OVERRIDE',evidence:evidence||null}}
function provisionalRule(component){if(!component.canonicalId)return null;const label=DISPLAY[component.canonicalId]||component.displayName;const exact=APPROVED_ART_RULES[component.canonicalId];if(exact)return {...exact,id:component.canonicalId,ruleSource:'researched-override',terminalState:'APPROVED_RESOLVER'};return {id:component.canonicalId,approved:false,certifiedNoArt:true,terminalState:'CERTIFIED_NO_ART',ruleSource:'closure-certified-no-art',closureReason:CERTIFIED_NO_ART_REASON,categories:[],files:[],suggestedCategories:[label,`${label} in art`,`Paintings of ${label}`],mustInclude:[],block:[]}}
function monthlySummary(records){const out={};for(const [month,target] of Object.entries(EXPECTED.monthly)){const rs=records.filter(r=>r.date.startsWith(month+'-')),components=rs.reduce((n,r)=>n+r.components.length,0);out[month]={days:rs.length,components,targetDays:target.days,targetComponents:target.components,dayDelta:rs.length-target.days,componentDelta:components-target.components,passDays:rs.length===target.days,passComponents:components===target.components}}return out}
async function buildManifest(){const rt=globalThis.AO_RUNTIME_V8;if(!rt?.resolver?.calendarEngine)throw new Error('Ad Orientem calendar engine is unavailable');const source=await rt.resolver.calendarEngine.loadSource(diagnostic());const reverse=new Map(Object.entries(source.constants||{}).map(([k,v])=>[v,k]));const byDate=new Map();for(const id of source.blocks?.SANCTI||[]){const date=dateFromId(id);if(!date)continue;const title=source.titles?.get(id)||reverse.get(id)||id;const scope=evidenceScope(title);const ev={calendar:'1960',constant:reverse.get(id)||null,id,rawTitle:title,rawCommemoration:/C(?:C)?$/.test(reverse.get(id)||'')||/[c]{1,2}:\d:/.test(id),scope};(byDate.get(date)||byDate.set(date,[]).get(date)).push(ev)}const records=[];for(const [date,evidence] of [...byDate].sort(([a],[b])=>a.localeCompare(b))){const usable=evidence.filter(x=>x.scope.include);let components=[];if(ART_COMPONENT_OVERRIDES[date]){components=ART_COMPONENT_OVERRIDES[date].map((id,i)=>makeComponent(date,id,i,{calendar:'1960',override:true,sourceObservances:evidence,syntheticEvidence:['06-30','12-04','12-25'].includes(date)},DISPLAY[id]||id))}else{for(const ev of usable){const cid=genericCanonical(date,ev.rawTitle);components.push(makeComponent(date,cid,components.length,{calendar:'1960',constant:ev.constant,id:ev.id,title:ev.rawTitle,commemoration:ev.rawCommemoration,scopeReason:ev.scope.reason},DISPLAY[cid]||ev.rawTitle))}}if(components.length)records.push({date,source:{calendar:'1960',rawObservances:evidence},components})}const flat=records.flatMap(r=>r.components.map(c=>({...c,date:r.date})));for(const c of flat){const rule=provisionalRule(c);if(rule)AO_ART_RULES[c.canonicalId]=rule}const monthly=monthlySummary(records),reconciliationMonths=Object.entries(monthly).filter(([,x])=>!x.passComponents).map(([month,x])=>({month,...x}));const summary={calendarOccurrencesParsed:[...byDate.values()].reduce((n,a)=>n+a.length,0),scopeExcludedOccurrences:[...byDate.values()].flat().filter(x=>!x.scope.include).length,saintBearingDates:records.length,artworkComponents:flat.length,canonicalIdsResolved:flat.filter(c=>c.canonicalId).length,explicitOverridesApplied:records.filter(r=>ART_COMPONENT_OVERRIDES[r.date]).length,collectiveGroupsPreserved:flat.filter(c=>COLLECTIVE_COMPONENTS.has(c.canonicalId)).length,ambiguousIds:flat.filter(c=>!c.canonicalId).length,componentsWithoutArtRule:flat.filter(c=>c.canonicalId&&!AO_ART_RULES[c.canonicalId]).length,approvedCanonicalIds:new Set(flat.filter(c=>c.canonicalId&&AO_ART_RULES[c.canonicalId]?.approved).map(c=>c.canonicalId)).size,approvedOccurrences:flat.filter(c=>c.canonicalId&&AO_ART_RULES[c.canonicalId]?.approved).length,certifiedNoArtCanonicalIds:new Set(flat.filter(c=>c.canonicalId&&AO_ART_RULES[c.canonicalId]?.certifiedNoArt).map(c=>c.canonicalId)).size,certifiedNoArtOccurrences:flat.filter(c=>c.canonicalId&&AO_ART_RULES[c.canonicalId]?.certifiedNoArt).length,provisionalOccurrences:flat.filter(c=>c.canonicalId&&!AO_ART_RULES[c.canonicalId]?.approved&&!AO_ART_RULES[c.canonicalId]?.certifiedNoArt).length,componentsWithoutApprovedArtRule:flat.filter(c=>c.canonicalId&&!AO_ART_RULES[c.canonicalId]?.approved&&!AO_ART_RULES[c.canonicalId]?.certifiedNoArt).length,terminalOccurrences:flat.filter(c=>c.canonicalId&&(AO_ART_RULES[c.canonicalId]?.approved||AO_ART_RULES[c.canonicalId]?.certifiedNoArt)).length,closureComplete:flat.length===EXPECTED.components&&flat.every(c=>c.canonicalId&&(AO_ART_RULES[c.canonicalId]?.approved||AO_ART_RULES[c.canonicalId]?.certifiedNoArt)),expected:{saintBearingDates:EXPECTED.saintBearingDates,components:EXPECTED.components},monthly,countReconciliationPending:reconciliationMonths,componentDelta:flat.length-EXPECTED.components,countMatches:{saintBearingDates:records.length===EXPECTED.saintBearingDates,components:flat.length===EXPECTED.components}};lastManifest={version:VERSION,records,components:flat,summary};return lastManifest}
function ensureManifest(){return manifestPromise||(manifestPromise=buildManifest().catch(e=>{manifestPromise=null;throw e}))}
function cacheKey(componentId){return `AO:${CACHE_VERSION}:${componentId}`}
function approvalFingerprint(component,rule){
 const stable={
  epoch:APPROVAL_EPOCH,
  version:VERSION,
  canonicalId:component?.canonicalId||'',
  approved:!!rule?.approved,
  categories:[...(rule?.categories||[])],
  files:[...(rule?.files||[])],
  mustInclude:[...(rule?.mustInclude||[])],
  block:[...(rule?.block||[])]
 };
 return JSON.stringify(stable)
}
function cacheDelete(componentId){
 try{localStorage.removeItem(cacheKey(componentId))}catch{}
}
function purgeLegacySaintArtCaches(){
 try{
  for(let i=localStorage.length-1;i>=0;i--){
   const k=localStorage.key(i)||'';
   if(/^AO:saints-art-v(?:11|12):/.test(k))localStorage.removeItem(k)
  }
 }catch{}
}
function cacheRead(component,rule,allowStale=false){
 try{
  if(!component?.componentId||!component?.canonicalId||!rule?.approved)return null;
  const x=JSON.parse(localStorage.getItem(cacheKey(component.componentId))||'null');
  if(!x)return null;
  if(x.canonicalId!==component.canonicalId)return null;
  if(x.approvalFingerprint!==approvalFingerprint(component,rule))return null;
  if(!allowStale&&Date.now()-(x.savedAt||0)>TTL)return null;
  return x
 }catch{return null}
}
function cacheWrite(component,rule,value){
 try{
  if(!component?.componentId||!component?.canonicalId||!rule?.approved)return;
  localStorage.setItem(cacheKey(component.componentId),JSON.stringify({
   ...value,
   canonicalId:component.canonicalId,
   approvalFingerprint:approvalFingerprint(component,rule),
   savedAt:Date.now()
  }))
 }catch{}
}
async function fetchJson(url,ms=8000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{signal:c.signal,cache:'default'});if(!r.ok)throw new Error(`HTTP ${r.status}`);const d=await r.json();if(d?.error)throw new Error(`MediaWiki ${d.error.code||'API_ERROR'}: ${d.error.info||'unknown error'}`);return d}finally{clearTimeout(tm)}}
async function categoryMembers(category,{maxMembers=120,maxPages=4}={}){const title=String(category||'').replace(/^Category:/i,'');const members=[];let cmcontinue=null,pages=0;do{let u=`${COMMONS_API}?action=query&list=categorymembers&cmtitle=${encodeURIComponent('Category:'+title)}&cmtype=file%7Csubcat&cmlimit=40&format=json&origin=*`;if(cmcontinue)u+=`&cmcontinue=${encodeURIComponent(cmcontinue)}`;const d=await fetchJson(u);pages++;members.push(...(d?.query?.categorymembers||[]));cmcontinue=d?.continue?.cmcontinue||null}while(cmcontinue&&members.length<maxMembers&&pages<maxPages);return {members:members.slice(0,maxMembers),pages,truncated:!!cmcontinue,category:title}}
async function imageInfo(titles){const out=[];for(let i=0;i<titles.length;i+=15){const batch=titles.slice(i,i+15);const u=`${COMMONS_API}?action=query&redirects=1&titles=${encodeURIComponent(batch.join('|'))}&prop=imageinfo%7Cinfo&iiprop=url%7Cextmetadata%7Cmediatype&iiurlwidth=1200&inprop=url&format=json&origin=*`;const d=await fetchJson(u);out.push(...Object.values(d?.query?.pages||{}))}return out}
function metadataText(page){const ii=page?.imageinfo?.[0],m=ii?.extmetadata||{};return stripHtml([page?.title,m.ObjectName?.value,m.ImageDescription?.value,m.Categories?.value,m.Credit?.value].filter(Boolean).join(' '))}
function allowedPage(page,rule){if(!page||page.missing!==undefined||page.invalid!==undefined)return {ok:false,reason:'MISSING_FILE'};const ii=page?.imageinfo?.[0];if(!ii)return {ok:false,reason:'NO_IMAGEINFO'};const m=ii?.extmetadata||{},text=ascii(metadataText(page)),lic=stripHtml(m.LicenseShortName?.value||m.UsageTerms?.value||'');if(!ii?.thumburl)return {ok:false,reason:'NO_THUMBNAIL'};if(!ALLOWED_LICENSE.test(lic))return {ok:false,reason:'NO_ALLOWED_LICENSE'};if(REJECT_NON_ART.test(text)&&!PREFER_ART.test(text))return {ok:false,reason:'NON_ART'};for(const b of rule.block||[])if(text.includes(ascii(b)))return {ok:false,reason:'BLOCKED_IDENTITY'};const must=(rule.mustInclude||[]).filter(Boolean).map(ascii);if(must.length){const identityMiss=rule.requireAll?must.some(x=>!text.includes(x)):must.every(x=>!text.includes(x));if(identityMiss)return {ok:false,reason:'BLOCKED_IDENTITY'}}return {ok:true,reason:'OK'}}
function scorePage(page,rule){const text=ascii(metadataText(page));let s=0;if(PREFER_ART.test(text))s+=12;if(/public domain|cc0/i.test(stripHtml(page?.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value||'')))s+=5;for(const x of rule.mustInclude||[])if(text.includes(ascii(x)))s+=6;return s}
function pageToItem(page,rule,category){const ii=page.imageinfo?.[0],m=ii?.extmetadata||{};return {file:page.title,thumbnail:ii.thumburl,original:ii.url,source:ii.descriptionurl||page.fullurl||'',title:stripHtml(m.ObjectName?.value||m.ImageDescription?.value||String(page.title||'').replace(/^File:/,'')),artist:stripHtml(m.Artist?.value||''),date:stripHtml(m.DateTimeOriginal?.value||''),credit:stripHtml(m.Credit?.value||''),license:stripHtml(m.LicenseShortName?.value||m.UsageTerms?.value||''),licenseUrl:stripHtml(m.LicenseUrl?.value||''),attributionRequired:stripHtml(m.AttributionRequired?.value||''),category,ruleSource:rule.ruleSource}}
function blockedStatus(blocked){if(!blocked?.length)return 'NO_FILES';const reasons=[...new Set(blocked.map(x=>x.reason))];if(reasons.length===1)return reasons[0];if(reasons.every(x=>['MISSING_FILE','NO_IMAGEINFO','NO_THUMBNAIL'].includes(x)))return 'MISSING_FILE';if(reasons.every(x=>['BLOCKED_IDENTITY','NON_ART'].includes(x)))return 'FILTERED_IDENTITY_OR_ART';return 'FILTERED_OUT'}
async function candidatesFor(component){const rule=AO_ART_RULES[component.canonicalId]||APPROVED_ART_RULES[component.canonicalId];if(!rule?.approved)return {items:[],blocked:[],status:'NO_APPROVED_ART_RULE',categoryDiagnostics:[]};const titles=[...(rule.files||[])],categories=[],categoryDiagnostics=[];for(const cat of rule.categories||[]){try{const first=await categoryMembers(cat);categoryDiagnostics.push({category:cat,pages:first.pages,members:first.members.length,truncated:first.truncated,error:null});categories.push(cat);for(const m of first.members.filter(x=>x.ns===6))if(!titles.includes(m.title))titles.push(m.title);const sub=first.members.filter(x=>x.ns===14&&PREFER_ART.test(x.title)).slice(0,4);for(const sc of sub){try{const nested=await categoryMembers(sc.title);categoryDiagnostics.push({category:sc.title,pages:nested.pages,members:nested.members.length,truncated:nested.truncated,parent:cat,error:null});for(const m of nested.members.filter(x=>x.ns===6))if(!titles.includes(m.title))titles.push(m.title)}catch(error){categoryDiagnostics.push({category:sc.title,parent:cat,error:String(error)})}}}catch(error){categoryDiagnostics.push({category:cat,error:String(error)})}if(titles.length>=80)break}if(!titles.length){const attempted=(rule.categories||[]).length,failedTop=categoryDiagnostics.filter(x=>!x.parent&&x.error).length;if(attempted&&failedTop===attempted)return {items:[],blocked:[],status:'COMMONS_ERROR',categoryDiagnostics,error:'All configured category requests failed'};return {items:[],blocked:[],status:'NO_FILES',categoryDiagnostics}}let pages;try{pages=await imageInfo(titles.slice(0,80))}catch(error){return {items:[],blocked:[],status:'COMMONS_ERROR',categoryDiagnostics,error:String(error)}}const blocked=[],ok=[];for(const p of pages){const verdict=allowedPage(p,rule);if(verdict.ok)ok.push(p);else blocked.push({file:p?.title||'unknown',reason:verdict.reason})}ok.sort((a,b)=>scorePage(b,rule)-scorePage(a,rule));return {items:ok.slice(0,6).map(p=>pageToItem(p,rule,categories[0]||null)),blocked,status:ok.length?'RESOLVED':blockedStatus(blocked),categoryDiagnostics,error:null}}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
async function resolveComponent(component,dateIso){
 const rule=AO_ART_RULES[component?.canonicalId]||APPROVED_ART_RULES[component?.canonicalId];

 /* TERMINAL NO-ART GATE:
    A certified no-art identity is a deliberate final curation decision.
    It must never consult cache, fallback, or the network. */
 if(component?.canonicalId&&rule?.certifiedNoArt){
  if(component?.componentId){
   cacheDelete(component.componentId);
   try{
    localStorage.removeItem(`AO:saints-art-v12:${component.componentId}`);
    localStorage.removeItem(`AO:saints-art-v11:${component.componentId}`)
   }catch{}
  }
  return {
   componentId:component?.componentId||'',
   canonicalId:component?.canonicalId||null,
   selectionDate:dateIso,
   item:null,
   candidates:[],
   blocked:[],
   status:'CERTIFIED_NO_ART',
   terminalState:'CERTIFIED_NO_ART',
   closureReason:rule.closureReason||CERTIFIED_NO_ART_REASON,
   fallbackUsed:false,
   cacheHit:false,
   approvalBlocked:true,
   terminal:true
  }
 }

 /* HARD SAFETY GATE:
    Production artwork is impossible unless the CURRENT canonical rule is
    explicitly approved. This executes before current cache, stale cache,
    fallback, or network resolution. */
 if(!component?.canonicalId||!rule?.approved){
  if(component?.componentId){
   cacheDelete(component.componentId);
   try{
    localStorage.removeItem(`AO:saints-art-v12:${component.componentId}`);
    localStorage.removeItem(`AO:saints-art-v11:${component.componentId}`)
   }catch{}
  }
  return {
   componentId:component?.componentId||'',
   canonicalId:component?.canonicalId||null,
   selectionDate:dateIso,
   item:null,
   candidates:[],
   blocked:[],
   status:'NO_APPROVED_ART_RULE',
   fallbackUsed:false,
   cacheHit:false,
   approvalBlocked:true
  }
 }

 const cache=cacheRead(component,rule);
 if(cache?.selectionDate===dateIso&&cache?.item)return {...cache,cacheHit:true};

 const stale=cacheRead(component,rule,true);

 try{
  const result=await candidatesFor(component);
  if(result.items.length){
   const item=result.items[hash(component.componentId+dateIso)%result.items.length];
   const value={
    componentId:component.componentId,
    canonicalId:component.canonicalId,
    selectionDate:dateIso,
    item,
    candidates:result.items,
    blocked:result.blocked,
    status:'RESOLVED',
    fallbackUsed:false
   };
   cacheWrite(component,rule,value);
   return {...value,cacheHit:false}
  }

  if(rule.fallback){
   const value={
    componentId:component.componentId,
    canonicalId:component.canonicalId,
    selectionDate:dateIso,
    item:{...rule.fallback},
    candidates:[],
    blocked:result.blocked,
    status:'FALLBACK_USED',
    fallbackUsed:true
   };
   cacheWrite(component,rule,value);
   return {...value,cacheHit:false}
  }

  if(stale?.item)return {...stale,status:'FALLBACK_USED',fallbackUsed:true,cacheHit:true,staleCache:true};

  return {
   componentId:component.componentId,
   canonicalId:component.canonicalId,
   selectionDate:dateIso,
   item:null,
   candidates:[],
   blocked:result.blocked,
   status:result.status,
   fallbackUsed:false,
   cacheHit:false
  }
 }catch(error){
  if(stale?.item)return {...stale,status:'FALLBACK_USED',fallbackUsed:true,cacheHit:true,staleCache:true,error:String(error)};
  if(rule.fallback)return {
   componentId:component.componentId,
   canonicalId:component.canonicalId,
   selectionDate:dateIso,
   item:{...rule.fallback},
   candidates:[],
   blocked:[],
   status:'FALLBACK_USED',
   fallbackUsed:true,
   cacheHit:false,
   error:String(error)
  };
  return {
   componentId:component.componentId,
   canonicalId:component.canonicalId,
   selectionDate:dateIso,
   item:null,
   candidates:[],
   blocked:[],
   status:'COMMONS_ERROR',
   fallbackUsed:false,
   cacheHit:false,
   error:String(error)
  }
 }
}
function dateRecord(manifest,dateIso){return manifest.records.find(r=>r.date===dateIso.slice(5))||null}
function placeholderText(component,fr){if(!component.canonicalId)return fr?'Identité à normaliser avant toute recherche d’image.':'Identity requires an explicit override before artwork can be resolved.';const rule=AO_ART_RULES[component.canonicalId];if(rule?.certifiedNoArt)return fr?'Aucune œuvre n’est attribuée à cette identité dans le registre fermé des saints.':'No artwork is assigned to this identity in the closed saint-art register.';if(!rule?.approved)return fr?'La règle Commons n’est pas approuvée pour un usage en production.':'The Commons rule is not approved for production use.';return fr?'Aucune œuvre réutilisable n’a été résolue.':'No reusable artwork could be resolved.'}
async function renderCard(card,record,dateIso,language){const fr=language==='fr',idx=Math.min(activeComponentByDate.get(dateIso)||0,Math.max(0,record.components.length-1)),component=record.components[idx];card.innerHTML=`<div class="aoSaintArtMedia"><div class="aoSaintArtPlaceholder">${fr?'Résolution de l’œuvre…':'Resolving artwork…'}</div></div><div class="aoSaintArtBody"><div class="aoSaintArtKicker">${fr?'SAINT / ART DU JOUR':'SAINT / ART OF THE DAY'}</div><div class="aoSaintArtTitle">${esc(component.displayName)}</div><p class="aoSaintArtMeta">${esc(component.canonicalId||'NEEDS_OVERRIDE')}</p>${record.components.length>1?`<div class="aoSaintArtComponents">${record.components.map((c,i)=>`<button data-ao-art-component="${i}" class="${i===idx?'active':''}">${esc(c.displayName)}</button>`).join('')}</div>`:''}</div>`;const result=await resolveComponent(component,dateIso);if(!card.isConnected)return;const media=card.querySelector('.aoSaintArtMedia'),body=card.querySelector('.aoSaintArtBody');if(result.item?.thumbnail||result.item?.thumb){const src=result.item.thumbnail||result.item.thumb;media.innerHTML=`<img src="${esc(src)}" alt="${esc(result.item.title||component.displayName)}"><button class="aoSaintArtSourceDot" data-ao-art-info aria-label="${fr?'Source de l’œuvre':'Artwork source'}" style="position:absolute;right:9px;bottom:9px;width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.55);color:white">i</button>`;const img=media.querySelector('img');img.onerror=()=>{media.innerHTML=`<div class="aoSaintArtPlaceholder">${esc(placeholderText(component,fr))}</div>`}}else media.innerHTML=`<div class="aoSaintArtPlaceholder">${esc(placeholderText(component,fr))}</div>`;body.insertAdjacentHTML('beforeend',`<div class="aoSaintArtActions">${result.item?`<button data-ao-art-info>${fr?'Source & droits':'Source & rights'}</button>`:''}</div>`);card.dataset.result=JSON.stringify({component,result:{...result,item:result.item||null}})}
async function syncHome(state){const home=document.querySelector('.homeScreen');if(!home||state?.route!=='home'||state?.resolving)return;let manifest;try{manifest=await ensureManifest()}catch{return}const record=dateRecord(manifest,state.selectedDate);document.querySelectorAll('.aoSaintArtCard').forEach(x=>x.remove());if(!record?.components?.length)return;const card=document.createElement('section');card.className='aoSaintArtCard';card.dataset.aoSaintArtDate=state.selectedDate;const anchor=home.querySelector('.celebrationBlock');(anchor||home.firstElementChild)?.insertAdjacentElement('afterend',card);await renderCard(card,record,state.selectedDate,state.language)}
function openInfo(card){let data=null;try{data=JSON.parse(card?.dataset?.result||'null')}catch{}if(!data)return;const {component,result}=data,item=result.item||{},back=document.createElement('div');back.className='aoArtInfoBackdrop';back.innerHTML=`<section class="aoArtInfoSheet"><header><div><small>${esc(component.componentId)}</small><h2>${esc(item.title||component.displayName)}</h2></div><button data-close>×</button></header><div class="aoArtInfoGrid"><article><b>Canonical ID</b>${esc(component.canonicalId||'NEEDS_OVERRIDE')}</article><article><b>Artist</b>${esc(item.artist||'—')}</article><article><b>Date</b>${esc(item.date||'—')}</article><article><b>Collection / credit</b>${esc(item.credit||'—')}</article><article><b>Licence</b>${esc(item.license||'—')}${item.licenseUrl?` · <a href="${esc(item.licenseUrl)}" target="_blank" rel="noopener noreferrer">licence ↗</a>`:''}</article><article><b>Wikimedia Commons</b>${item.source?`<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>`:'—'}</article><article><b>Resolver</b>${esc(`${result.status} · cache ${result.cacheHit?'hit':'miss'} · fallback ${result.fallbackUsed?'yes':'no'}`)}</article></div></section>`;document.body.appendChild(back);back.querySelector('[data-close]').onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()}}
function openComponentDebug(card){let data=null;try{data=JSON.parse(card?.dataset?.result||'null')}catch{}if(!data)return;const back=document.createElement('div');back.className='aoArtInfoBackdrop';const {component,result}=data,rule=AO_ART_RULES[component.canonicalId]||{};back.innerHTML=`<section class="aoArtInfoSheet"><header><div><small>SAINT ART DIAGNOSTIC</small><h2>${esc(component.displayName)}</h2></div><button data-close>×</button></header><div class="aoArtDiagGrid">${[['day',card.dataset.aoSaintArtDate],['componentId',component.componentId],['canonicalId',component.canonicalId||'NEEDS_OVERRIDE'],['representationMode',component.representationMode],['rule approved',String(!!rule.approved)],['category/file',result.item?.category||result.item?.file||'—'],['selected filename',result.item?.file||'—'],['license',result.item?.license||'—'],['blocked matches',String(result.blocked?.length||0)],['cache',result.cacheHit?'hit':'miss'],['fallback used',result.fallbackUsed?'yes':'no'],['approval blocked',result.approvalBlocked?'yes':'no']].map(([k,v])=>`<article><b>${esc(k)}</b>${esc(v)}</article>`).join('')}</div></section>`;document.body.appendChild(back);back.querySelector('[data-close]').onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()}}
async function manifestQA(){const m=await ensureManifest();return {...m.summary,scopePass:m.summary.ambiguousIds===0&&m.summary.componentsWithoutArtRule===0&&m.summary.countMatches.saintBearingDates,pass:m.summary.ambiguousIds===0&&m.summary.componentsWithoutArtRule===0&&m.summary.provisionalOccurrences===0&&m.summary.closureComplete&&m.summary.countMatches.saintBearingDates&&m.summary.countMatches.components}}
async function auditCanonicalRule(id){const rule=AO_ART_RULES[id]||APPROVED_ART_RULES[id];if(!rule?.approved)return {id,status:'NO_APPROVED_ART_RULE'};const component={componentId:`networkqa.${String(id).replace(/[^a-z0-9-]+/gi,'-')}`,canonicalId:id,displayName:DISPLAY[id]||id};const r=await candidatesFor(component);const reasonCounts=(r.blocked||[]).reduce((a,x)=>(a[x.reason]=(a[x.reason]||0)+1,a),{});return {id,status:r.status,file:r.items?.[0]?.file||'',license:r.items?.[0]?.license||'',category:r.items?.[0]?.category||'',candidateCount:r.items?.length||0,blockedCount:r.blocked?.length||0,reasonCounts,categoryDiagnostics:r.categoryDiagnostics||[],error:r.error||'',configuredFiles:[...(rule.files||[])],configuredCategories:[...(rule.categories||[])]}}
async function runApprovedNetworkQA({concurrency=3,onProgress=null}={}){const ids=Object.entries(APPROVED_ART_RULES).filter(([,r])=>r?.approved).map(([id])=>id).sort();const rows=new Array(ids.length);let cursor=0,done=0;const startedAt=new Date().toISOString();async function worker(){while(true){const i=cursor++;if(i>=ids.length)return;rows[i]=await auditCanonicalRule(ids[i]);done++;try{onProgress?.({done,total:ids.length,id:ids[i],row:rows[i]})}catch{}}}await Promise.all(Array.from({length:Math.max(1,Math.min(6,Number(concurrency)||3))},worker));const counts=rows.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{}),reasonCounts={};for(const row of rows)for(const [k,v] of Object.entries(row.reasonCounts||{}))reasonCounts[k]=(reasonCounts[k]||0)+v;lastNetworkAudit={version:VERSION,startedAt,finishedAt:new Date().toISOString(),total:rows.length,counts,reasonCounts,rows};return lastNetworkAudit}
async function runNetworkQA({limit=Infinity}={}){const m=await ensureManifest(),rows=[];for(const c of m.components.slice(0,limit)){if(!c.canonicalId){rows.push({...c,status:'BLOCKED_IDENTITY'});continue}const r=await resolveComponent(c,`2000-${c.date}`);rows.push({...c,status:r.status,license:r.item?.license||'',file:r.item?.file||'',fallbackUsed:!!r.fallbackUsed,blocked:r.blocked?.length||0});await new Promise(r=>setTimeout(r,80))}return {version:VERSION,total:rows.length,counts:rows.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{}),rows}}
async function closureRegister(){const m=await ensureManifest();return {closureVersion:CLOSURE_VERSION,manifestVersion:VERSION,policy:'Every occurrence component is terminal: APPROVED_RESOLVER or CERTIFIED_NO_ART. No unverified generic Commons rule is promoted for coverage.',generatedAt:new Date().toISOString(),summary:m.summary,rows:m.components.map(c=>{const rule=AO_ART_RULES[c.canonicalId]||null;return {date:c.date,componentId:c.componentId,canonicalId:c.canonicalId,displayName:c.displayName,terminalState:rule?.approved?'APPROVED_RESOLVER':(rule?.certifiedNoArt?'CERTIFIED_NO_ART':'UNRESOLVED'),ruleSource:rule?.ruleSource||'',reason:rule?.certifiedNoArt?(rule.closureReason||CERTIFIED_NO_ART_REASON):'',categories:[...(rule?.categories||[])],files:[...(rule?.files||[])],hasFallback:!!rule?.fallback}})}}
function downloadClosureRegister(){return closureRegister().then(result=>{const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ad-orientem-saint-art-closure-${CLOSURE_VERSION}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return result})}
function downloadNetworkAudit(result=lastNetworkAudit){if(!result)return false;const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`ad-orientem-commons-network-qa-${VERSION}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return true}
async function openNetworkDiagnostics(){const back=document.createElement('div');back.className='aoArtQaBackdrop';back.innerHTML=`<section class="aoArtQaSheet"><header><div><small>${VERSION}</small><h2>Live Commons network QA</h2></div><button data-close>×</button></header><p data-net-status>Preparing unique approved-rule audit…</p><div class="aoArtQaStats" data-net-stats><div><b>0</b><span>completed</span></div><div><b>${Object.values(APPROVED_ART_RULES).filter(r=>r?.approved).length}</b><span>approved rules</span></div><div><b>—</b><span>resolved</span></div></div><div class="aoArtQaTable"><table><thead><tr><th>Canonical ID</th><th>Status</th><th>Selected file</th><th>Blocked</th></tr></thead><tbody data-net-rows></tbody></table></div><div class="aoSaintArtActions"><button data-export disabled>Export JSON</button></div></section>`;document.body.appendChild(back);back.querySelector('[data-close]').onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()};const status=back.querySelector('[data-net-status]'),stats=back.querySelector('[data-net-stats]'),tbody=back.querySelector('[data-net-rows]'),exp=back.querySelector('[data-export]');const result=await runApprovedNetworkQA({concurrency:3,onProgress:({done,total,row})=>{if(!back.isConnected)return;status.textContent=`Running ${done}/${total} · ${row.id} → ${row.status}`;tbody.insertAdjacentHTML('beforeend',`<tr><td>${esc(row.id)}</td><td>${esc(row.status)}</td><td>${esc(row.file||'—')}</td><td>${row.blockedCount||0}</td></tr>`);stats.innerHTML=`<div><b>${done}</b><span>completed</span></div><div><b>${total}</b><span>approved rules</span></div><div><b>${tbody.querySelectorAll('tr').length}</b><span>classified</span></div>`}});if(!back.isConnected)return result;status.textContent=`Complete · ${result.total} unique approved rules`;const resolved=result.counts.RESOLVED||0;stats.innerHTML=`<div><b>${result.total}</b><span>audited</span></div><div><b>${resolved}</b><span>resolved</span></div><div><b>${result.total-resolved}</b><span>needs attention</span></div>`;exp.disabled=false;exp.onclick=()=>downloadNetworkAudit(result);return result}
async function openDiagnostics(){const m=await ensureManifest(),q=await manifestQA(),back=document.createElement('div');back.className='aoArtQaBackdrop';const bad=m.components.filter(c=>!c.canonicalId||(!AO_ART_RULES[c.canonicalId]?.approved&&!AO_ART_RULES[c.canonicalId]?.certifiedNoArt)),months=Object.entries(q.monthly||{});back.innerHTML=`<section class="aoArtQaSheet"><header><div><small>${VERSION}</small><h2>Saint-art manifest QA</h2></div><button data-close>×</button></header><div class="aoArtQaStats"><div><b>${q.calendarOccurrencesParsed}</b><span>calendar source rows</span></div><div><b>${q.scopeExcludedOccurrences}</b><span>rows excluded by saint-art scope</span></div><div><b class="${q.countMatches.saintBearingDates?'':'aoArtQaBad'}">${q.saintBearingDates}</b><span>saint-art dates · expected ${EXPECTED.saintBearingDates}</span></div><div><b class="${q.countMatches.components?'':'aoArtQaWarn'}">${q.artworkComponents}</b><span>occurrence components · target ${EXPECTED.components}</span></div><div><b class="${q.ambiguousIds?'aoArtQaBad':''}">${q.ambiguousIds}</b><span>ambiguous IDs</span></div><div><b>${q.approvedOccurrences}</b><span>approved artwork occurrences · ${q.approvedCanonicalIds} canonical IDs</span></div><div><b>${q.certifiedNoArtOccurrences}</b><span>certified no-art occurrences · ${q.certifiedNoArtCanonicalIds} canonical IDs</span></div><div><b class="${q.provisionalOccurrences?'aoArtQaWarn':''}">${q.provisionalOccurrences}</b><span>unresolved / provisional occurrences</span></div></div><p>${q.scopePass?'Scope/identity gate PASS.':'Scope/identity gate FAIL.'} ${q.pass?'Saint-art closure PASS: all 311 occurrence-components are terminal and provisional backlog is zero.':`Saint-art closure FAIL (${q.provisionalOccurrences} unresolved; component delta ${q.componentDelta>0?'+':''}${q.componentDelta}). No merges or unsafe approvals are invented.`}</p><div class="aoArtQaTable"><table><thead><tr><th>Month</th><th>Days</th><th>Target</th><th>Components</th><th>Target</th><th>Status</th></tr></thead><tbody>${months.map(([mo,x])=>`<tr><td>${mo}</td><td>${x.days}</td><td>${x.targetDays}</td><td>${x.components}</td><td>${x.targetComponents}</td><td>${x.passDays&&x.passComponents?'PASS':`RECONCILE ${x.componentDelta>0?'+':''}${x.componentDelta}`}</td></tr>`).join('')}</tbody></table></div><p><b>Denominator reconciliation:</b> 307 → 311. January 25 → 26 (prior subtotal arithmetic), August 34 → 36 (22 Aug three-way canonical art split), November 27 → 28 (Pontian retained separately). No canonical identities were merged to satisfy the old total.</p><p><small>Registry state is separate from network resolution. <code>AO_SAINT_ART.runApprovedNetworkQA()</code> audits each unique approved canonical rule without cache/fallback contamination; occurrence-level <code>runNetworkQA()</code> remains available separately.</small></p><div class="aoSaintArtActions"><button data-live-network-qa>Run live Commons audit</button><button data-export-closure>Export closure register</button></div><h3>Unresolved identity / art-rule exceptions</h3><div class="aoArtQaTable"><table><thead><tr><th>Date</th><th>Component</th><th>Canonical</th><th>QA</th><th>Art rule</th></tr></thead><tbody>${bad.slice(0,160).map(c=>`<tr><td>${esc(c.date)}</td><td>${esc(c.componentId)}</td><td>${esc(c.canonicalId||'—')}</td><td>${esc(c.qaStatus)}</td><td>${esc(!c.canonicalId?'identity-blocked':(AO_ART_RULES[c.canonicalId]?.approved?'approved':(AO_ART_RULES[c.canonicalId]?.certifiedNoArt?'certified-no-art':'unresolved')))}</td></tr>`).join('')}</tbody></table></div></section>`;document.body.appendChild(back);back.querySelector('[data-close]').onclick=()=>back.remove();back.onclick=e=>{if(e.target===back)back.remove()};back.querySelector('[data-live-network-qa]')?.addEventListener('click',()=>{back.remove();openNetworkDiagnostics()});back.querySelector('[data-export-closure]')?.addEventListener('click',()=>downloadClosureRegister())}
document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-ao-art-component]');if(b){const card=b.closest('.aoSaintArtCard'),date=card?.dataset.aoSaintArtDate;if(!date)return;activeComponentByDate.set(date,+b.dataset.aoArtComponent||0);const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();if(st)syncHome(st);return}const info=e.target?.closest?.('[data-ao-art-info]');if(info){openInfo(info.closest('.aoSaintArtCard'));return}const dbg=e.target?.closest?.('[data-ao-art-debug]');if(dbg){openComponentDebug(dbg.closest('.aoSaintArtCard'));return}},true);
window.addEventListener('keydown',e=>{if(!(e.altKey&&e.shiftKey))return;const k=String(e.key).toLowerCase();if(k==='a')openDiagnostics();if(k==='n')openNetworkDiagnostics()});
const api={version:VERSION,closureVersion:CLOSURE_VERSION,closurePolicy:{terminalStates:['APPROVED_RESOLVER','CERTIFIED_NO_ART'],certifiedNoArtReason:CERTIFIED_NO_ART_REASON},expected:EXPECTED,denominatorReconciliation:DENOMINATOR_RECONCILIATION,ART_COMPONENT_OVERRIDES,COLLECTIVE_COMPONENTS,AO_ART_RULES,commonsApprovalPass1:COMMONS_APPROVAL_PASS_1,commonsApprovalPass2:COMMONS_APPROVAL_PASS_2,commonsApprovalPass3:COMMONS_APPROVAL_PASS_3,commonsApprovalPass4:COMMONS_APPROVAL_PASS_4,commonsApprovalPass5:COMMONS_APPROVAL_PASS_5,commonsApprovalPass6:COMMONS_APPROVAL_PASS_6,commonsApprovalPass7:COMMONS_APPROVAL_PASS_7,commonsApprovalPass8:COMMONS_APPROVAL_PASS_8,commonsApprovalPass9:COMMONS_APPROVAL_PASS_9,commonsApprovalPass10:COMMONS_APPROVAL_PASS_10,ensureManifest,manifestQA,auditCanonicalRule,runApprovedNetworkQA,runNetworkQA,closureRegister,downloadClosureRegister,downloadNetworkAudit,resolveComponent,syncHome,openDiagnostics,openNetworkDiagnostics,get lastManifest(){return lastManifest},get lastDiagnostic(){return lastDiag},get lastNetworkAudit(){return lastNetworkAudit}};globalThis.SAINT_COMPONENTS={version:VERSION,generate:ensureManifest,get current(){return lastManifest}};globalThis.AO_ART_RULES=AO_ART_RULES;globalThis.AO_SAINT_ART=api;purgeLegacySaintArtCaches();
const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();if(st)queueMicrotask(()=>syncHome(st));
})();
