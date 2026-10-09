
(()=>{
'use strict';
const VERSION='25.5';
const PARTICIPATION_ENGINE_VERSION='1.0';
const AUTHORITY=Object.freeze({
 RUBRIC_1962:'RUBRIC_1962',PERIOD_1962_GUIDE:'PERIOD_1962_GUIDE',ESTABLISHED_LAY_CUSTOM:'ESTABLISHED_LAY_CUSTOM',LOCAL_CUSTOM:'LOCAL_CUSTOM',OPTIONAL_DEVOTION:'OPTIONAL_DEVOTION',PRE_1962_ONLY:'PRE_1962_ONLY',CLERGY_ONLY:'CLERGY_ONLY'
});
const SOURCE_REGISTRY=Object.freeze({
 FORT_MASS:'Adrian Fortescue, The Mass: A Study of the Roman Liturgy',
 ALPH_XIII:'St Alphonsus / Grimm, vol. XIII',
 GUERANGER:'Dom Prosper Guéranger, Explanation of the Holy Mass',
 FORT_CER:'Fortescue, Ceremonies of the Roman Rite Described',
 GIHR:'Nicholas Gihr, The Holy Sacrifice of the Mass',
 COCHEM:'Martin von Cochem, Explanation of the Holy Sacrifice of the Mass',
 MULLER:'Michael Müller, The Holy Mass',
 GAUME:'J.-J. Gaume, The Sign of the Cross',
 SCR_1958:'Sacred Congregation of Rites, De musica sacra et sacra liturgia (1958)',
 RGM_1960:'Rubricae Generales Missalis Romani (1960)',
 OCONNELL_1962:'J. B. O’Connell, The Celebration of Mass (1962)',
 MR_1962:'Missale Romanum (1962), Proper of Holy Week'
});
const GUIDE_VERSION='1.0';
const GUIDE_CONTENT=Object.freeze({
 full_cross:{
  en:{title:'Sign of the Cross',action:'With the right hand, make the full Sign of the Cross: forehead, breast, left shoulder, then right shoulder.',why:'This traditional lay gesture accompanies specific invocations or conclusions of the Mass. It is not a cue to imitate every Sign of the Cross made by the priest.'},
  fr:{title:'Signe de croix',action:'Avec la main droite, faites le signe de croix complet : front, poitrine, épaule gauche, puis épaule droite.',why:'Ce geste traditionnel des fidèles accompagne certaines invocations ou conclusions de la Messe. Il ne signifie pas qu’il faut imiter chaque signe de croix du prêtre.'}
 },
 gospel_cross:{
  en:{title:'Three small Gospel crosses',action:'With the right thumb, trace a small cross on the forehead, then the lips, then the breast.',why:'This is the traditional Gospel gesture at the announcement of the Gospel. It is a distinct action from the full Sign of the Cross.'},
  fr:{title:'Trois petites croix de l’Évangile',action:'Avec le pouce droit, tracez une petite croix sur le front, puis sur les lèvres, puis sur la poitrine.',why:'C’est le geste traditionnel à l’annonce de l’Évangile. Il est distinct du signe de croix complet.'}
 },
 breast_1:{
  en:{title:'Strike the breast once',action:'Strike the breast once at these words.',why:'Breast-striking is a traditional penitential gesture expressing contrition or unworthiness at the text where the cue appears.'},
  fr:{title:'Frapper la poitrine une fois',action:'Frappez la poitrine une fois à ces paroles.',why:'Le geste de se frapper la poitrine est un geste pénitentiel traditionnel exprimant la contrition ou l’indignité aux paroles indiquées.'}
 },
 breast_3:{
  en:{title:'Strike the breast three times',action:'Strike the breast three times in time with the threefold penitential invocation or repetition.',why:'The repeated breast-striking is a traditional penitential gesture tied to the repeated text; the app shows it only where the lay practice applies.'},
  fr:{title:'Frapper la poitrine trois fois',action:'Frappez la poitrine trois fois, au rythme de la triple invocation ou répétition pénitentielle.',why:'Les trois coups constituent un geste pénitentiel traditionnel lié au texte répété ; l’application ne l’affiche que là où cet usage concerne les fidèles.'}
 },
 genuflect:{
  en:{title:'Genuflect',action:'Lower one knee briefly to the floor in reverence, then rise unless the next cue says otherwise.',why:'A genuflection is a brief bodily act of reverence used at particular sacred words or moments. It is distinct from remaining kneeling.'},
  fr:{title:'Génuflexion',action:'Posez brièvement un genou à terre en signe de révérence, puis relevez-vous sauf indication contraire.',why:'La génuflexion est un acte bref de révérence accompli à certaines paroles ou à certains moments sacrés. Elle est distincte de la posture à genoux.'}
 },
 kneel:{
  en:{title:'Kneel',action:'Kneel at this point and remain kneeling until the posture changes.',why:'Kneeling is a posture of adoration and humility. Whether it is universal, period practice, or local custom depends on the authority shown below.'},
  fr:{title:'À genoux',action:'Mettez-vous à genoux à ce moment et restez ainsi jusqu’au prochain changement de posture.',why:'La posture à genoux exprime l’adoration et l’humilité. Son caractère universel, d’usage de l’époque ou local dépend de l’autorité indiquée ci-dessous.'}
 },
 stand:{
  en:{title:'Stand',action:'Stand at this point and remain standing until the posture changes.',why:'Standing marks the appropriate congregational posture for this portion of the Mass; in some Low-Mass contexts the exact posture follows legitimate local custom.'},
  fr:{title:'Debout',action:'Mettez-vous debout à ce moment et restez ainsi jusqu’au prochain changement de posture.',why:'La station debout est la posture des fidèles pour cette partie de la Messe ; dans certains contextes de Messe basse, la posture exacte suit légitimement l’usage local.'}
 },
 sit:{
  en:{title:'Sit',action:'Sit at this point and remain seated until the posture changes.',why:'At Sung Mass, sitting during portions such as the lesson or chant is documented period practice; local custom still governs some transitions.'},
  fr:{title:'Assis',action:'Asseyez-vous à ce moment et restez assis jusqu’au prochain changement de posture.',why:'À la Messe chantée, la position assise pendant certaines parties, comme la leçon ou le chant, est attestée par l’usage de l’époque ; certaines transitions restent régies par l’usage local.'}
 },
 bow_head:{
  en:{title:'Bow the head',action:'Incline the head briefly at these words, then return upright.',why:'A head bow is a brief act of reverence attached to particular names or words. It is not the same action as a profound bow or a genuflection.'},
  fr:{title:'Incliner la tête',action:'Inclinez brièvement la tête à ces paroles, puis redressez-vous.',why:'L’inclination de tête est un bref acte de révérence lié à certains noms ou certaines paroles. Elle se distingue de l’inclination profonde et de la génuflexion.'}
 },
 bow_profound:{
  en:{title:'Bow profoundly',action:'Make a deeper bow from the upper body at this point, then return upright.',why:'A profound bow is a stronger bodily reverence than a simple head bow. The cue is shown only when the specific practice calls for it.'},
  fr:{title:'Inclination profonde',action:'Faites ici une inclination plus profonde du haut du corps, puis redressez-vous.',why:'L’inclination profonde est une révérence corporelle plus marquée que la simple inclination de tête. Le signal n’apparaît que lorsque l’usage précis le demande.'}
 },
 adore:{
  en:{title:'Adore',action:'Remain recollected in adoration at this moment; do not add another bodily gesture unless a separate cue appears.',why:'The cue identifies a moment for adoration without teaching the faithful to copy the priest’s ceremonial movements.'},
  fr:{title:'Adorer',action:'Restez recueilli en adoration à ce moment ; n’ajoutez pas d’autre geste corporel sauf si un signal distinct apparaît.',why:'Le signal indique un moment d’adoration sans enseigner aux fidèles à reproduire les gestes cérémoniels du prêtre.'}
 },
 action:{
  en:{title:'Mass action',action:'Follow this action at the words where the cue appears.',why:'This cue is attached to the exact Mass text so that the action occurs at the correct moment.'},
  fr:{title:'Action de la Messe',action:'Accomplissez cette action aux paroles auxquelles le signal apparaît.',why:'Ce signal est rattaché au texte exact de la Messe afin que l’action soit accomplie au bon moment.'}
 }
});
const AUTHORITY_LABELS=Object.freeze({
 RUBRIC_1962:{en:'1962 rubric',fr:'Rubrique de 1962'},PERIOD_1962_GUIDE:{en:'1962 period practice',fr:'Usage attesté en 1962'},ESTABLISHED_LAY_CUSTOM:{en:'Established traditional lay custom',fr:'Usage traditionnel établi des fidèles'},LOCAL_CUSTOM:{en:'Local custom',fr:'Usage local'},OPTIONAL_DEVOTION:{en:'Optional devotion',fr:'Dévotion facultative'},PRE_1962_ONLY:{en:'Older / pre-1962 practice',fr:'Usage ancien / antérieur à 1962'},CLERGY_ONLY:{en:'Clergy only',fr:'Clergé seulement'}
});
const CUSTOM_AUTHORITY_LABELS=Object.freeze({
 traditional_holy_name_custom:{en:'Traditional Holy Name custom',fr:'Usage traditionnel au Saint Nom'},
 traditional_doxology_bow_custom:{en:'Traditional doxology bow',fr:'Inclination traditionnelle à la doxologie'},
 traditional_marian_name_custom:{en:'Traditional Marian-name custom',fr:'Usage traditionnel au nom de Notre-Dame'},
 traditional_active_saint_name_custom:{en:'Traditional saint-of-the-day custom',fr:'Usage traditionnel au nom du saint du jour'},
 traditional_pope_name_custom:{en:'Traditional papal-name custom',fr:'Usage traditionnel au nom du Pape'},
 traditional_faithful_custom:{en:'Traditional lay custom',fr:'Usage traditionnel des fidèles'},
 '1962_general_rubrics_518b':{en:'1962 rubric',fr:'Rubrique de 1962'},
 older_custom_non_normative_1962:{en:'Older / non-normative 1962 custom',fr:'Usage ancien / non normatif en 1962'}
});
const REGISTRY={"sign-cross":{"gestures":[{"kind":"cross","label":"Sign of the cross","anchorLat":"In nómine Patris","anchorEng":"In the Name of the Father","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"adjutorium":{"gestures":[{"kind":"cross","label":"Sign of the cross","anchorLat":"Adiutórium nostrum ✠","anchorEng":"Our help ✠","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"ministers-confiteor":{"gestures":[{"kind":"action","label":"Strike breast ×3","anchorLat":"mea culpa, mea culpa, mea máxima culpa","anchorEng":"through my fault, through my fault, through my most grievous fault","before":true,"status":"custom","count":3,"authority":"ESTABLISHED_LAY_CUSTOM","rubricActor":"ministers","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"indulgentiam-absolution":{"gestures":[{"kind":"cross","label":"Sign of the cross","anchorLat":"Indulgéntiam","anchorEng":"May the Almighty and merciful God","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"gloria":{"gestures":[{"kind":"bow","label":"Bow head","anchorLat":"Adorámus te","anchorEng":"we adore Thee","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"bow","label":"Bow head","anchorLat":"Grátias ágimus tibi","anchorEng":"we give Thee thanks","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"bow","label":"Bow head","anchorLat":"súscipe deprecatiónem nostram","anchorEng":"receive our prayer","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"cross","label":"Sign of the cross","anchorLat":"Cum Sancto Spíritu","anchorEng":"With the Holy Ghost","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"gospel-announcement":{"gestures":[{"kind":"cross","label":"Forehead · lips · breast","anchorLat":"Sequéntia ✠ sancti Evangélii","anchorEng":"Continuation ✠ of the Holy Gospel","before":true,"status":"custom","authority":"PERIOD_1962_GUIDE","sourceRefs":["OCONNELL_1962","GUERANGER","COCHEM","MULLER"],"prominence":"CORE","gestureForm":"SIGN_CROSS_GOSPEL"}],"ritualActions":[]},"credo":{"gestures":[{"kind":"bow","label":"Bow head","anchorLat":"Credo in unum Deum","anchorEng":"I believe in one God","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"genuflect","status":"custom","label":"Traditional/local genuflection","anchorLat":"Et incarnátus est","anchorEng":"And was incarnate","before":true,"specialIncarnationSungKind":"kneel","specialIncarnationSungStatus":"prescribed","specialIncarnationSungAuthority":"1962_general_rubrics_518b","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE","specialRule":"CHRISTMAS_ANNUNCIATION_SUNG_KNEEL"},{"kind":"rise","status":"custom","label":"Rise","anchorLat":"et homo factus est.","anchorEng":"and was made man.","after":true,"authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE","specialRule":"CHRISTMAS_ANNUNCIATION_SUNG_KNEEL"},{"kind":"bow","label":"Bow head","anchorLat":"Qui cum Patre et Fílio simul adorátur","anchorEng":"Who together with the Father and the Son is adored","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"cross","status":"custom","label":"Traditional sign of the cross","anchorLat":"Et vitam ✠ ventúri sæculi","anchorEng":"the life ✠ of the world to come","before":true,"authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"sanctus":{"gestures":[{"kind":"bow","label":"Bow head","anchorLat":"Sanctus, Sanctus, Sanctus","anchorEng":"Holy, Holy, Holy","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"},{"kind":"cross","label":"Sign of the cross","anchorLat":"Benedíctus qui venit","anchorEng":"Blessed is He who comes","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"DETAIL"}],"ritualActions":[]},"nobis-quoque":{"gestures":[{"kind":"action","label":"Strike breast","count":1,"anchorLat":"Nobis quoque peccatóribus","anchorEng":"To us also Thy sinful servants","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","rubricActor":"celebrant","sourceRefs":["GUERANGER"],"prominence":"CORE"}],"ritualActions":[]},"agnus":{"gestures":[{"kind":"action","label":"Strike breast ×3","anchorLat":"Agnus Dei","anchorEng":"Lamb of God","before":true,"status":"custom","count":3,"unlessRequiem":true,"authority":"ESTABLISHED_LAY_CUSTOM","rubricActor":"celebrant","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"domine-non-sum-dignus":{"gestures":[{"kind":"action","label":"Strike breast","count":3,"anchorLat":"Dómine, non sum dignus","anchorEng":"Lord, I am not worthy","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","rubricActor":"celebrant","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"blessing":{"gestures":[{"kind":"cross","label":"Sign of the cross","anchorLat":"Benedícat vos","anchorEng":"May almighty God bless you","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["GUERANGER","COCHEM","MULLER"],"prominence":"CORE"}],"ritualActions":[]},"last-gospel-announcement":{"gestures":[{"kind":"cross","label":"Forehead · lips · breast","anchorLat":"Initium ✠ sancti Evangélii","anchorEng":"The beginning ✠ of the holy Gospel","before":true,"status":"custom","authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE","gestureForm":"SIGN_CROSS_GOSPEL"}],"ritualActions":[]},"last-gospel":{"gestures":[{"kind":"genuflect","status":"custom","label":"Traditional/local genuflection","anchorLat":"ET VERBUM CARO FACTUM EST.","anchorEng":"AND THE WORD WAS MADE FLESH.","before":true,"authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Et habitávit in nobis","anchorEng":"And dwelt among us","status":"custom","before":true,"authority":"ESTABLISHED_LAY_CUSTOM","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE"}],"ritualActions":[]},"candlemas-distribution":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"Stand; ↓ kneel when receiving a candle according to the ceremony","source":"special_day_step"}]},"ashes-imposition":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel to receive the ashes","source":"special_day_step"}]},"ashes-after-distribution":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"↑ Rise after receiving the ashes","source":"special_day_step"}]},"palms-distribution":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel if receiving the palm at the communion rail","source":"special_day_step"}]},"palms-gospel":{"gestures":[{"kind":"cross","label":"Forehead · lips · breast","anchorLat":"Sequéntia ✠ sancti","anchorEng":"Continuation ✠ of the holy Gospel","before":true,"authority":"PERIOD_1962_GUIDE","sourceRefs":["OCONNELL_1962","GUERANGER"],"prominence":"CORE","gestureForm":"SIGN_CROSS_GOSPEL"}],"ritualActions":[{"kind":"ritual_action","label":"↑ Stand · make the three small crosses at the announcement according to custom","source":"special_day_step"},{"kind":"cross","label":"Forehead · lips · breast","source":"cue"}]},"holy-thursday-reposition":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"Follow the procession; kneel for adoration as directed","source":"special_day_step"}]},"gf-between-lessons":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[]},"gf-passion":{"gestures":[{"kind":"kneel","label":"Kneel briefly","anchorLat":"tradidit spíritum","anchorEng":"gave up the ghost","after":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"tradidit spíritum","anchorEng":"gave up the ghost","after":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[]},"gf-solemn-prayer-1":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-2":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-3":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-4":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-5":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-6":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-7":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-8":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-solemn-prayer-9":{"gestures":[{"kind":"kneel","label":"Kneel","anchorLat":"Flectámus génua","anchorEng":"Let us kneel","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"},{"kind":"rise","label":"Rise","anchorLat":"Leváte","anchorEng":"Arise","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"↓ Kneel at Flectamus genua · ↑ rise at Levate","source":"special_day_step"},{"kind":"kneel","label":"Kneel","source":"cue"},{"kind":"rise","label":"Rise","source":"cue"}]},"gf-cross-veneration":{"gestures":[{"kind":"genuflect","label":"Genuflect before veneration","anchorLat":"Pópule meus","anchorEng":"O My people","before":true,"authority":"RUBRIC_1962","sourceRefs":["MR_1962"],"prominence":"CORE"}],"ritualActions":[{"kind":"ritual_action","label":"Approach when directed · genuflect before venerating the Cross","source":"special_day_step"},{"kind":"genuflect","label":"Genuflect before veneration","source":"cue"}]},"vigil-font":{"gestures":[],"ritualActions":[{"kind":"ritual_action","label":"Kneel with the congregation during the Litany","source":"special_day_step"}]},"second-confiteor":{"gestures":[{"kind":"action","status":"custom","label":"Strike the breast ×3 at mea culpa","anchorLat":"mea culpa, mea culpa, mea máxima culpa","anchorEng":"through my fault, through my fault, through my most grievous fault","before":true,"authority":"PRE_1962_ONLY","requiresSecondConfiteorSetting":true,"count":3,"sourceRefs":["RGM_1960","OCONNELL_1962"],"prominence":"DETAIL","compatibilityOnly":true},{"kind":"cross","status":"custom","label":"Make the sign of the cross","anchorLat":"Indulgéntiam","anchorEng":"May the Almighty and merciful God","before":true,"authority":"PRE_1962_ONLY","requiresSecondConfiteorSetting":true,"sourceRefs":["RGM_1960","OCONNELL_1962"],"prominence":"DETAIL","compatibilityOnly":true}],"ritualActions":[]},"preface":{"gestures":[{"kind":"bow","label":"Bow head","anchorLat":"Grátias agámus Dómino Deo nostro","anchorEng":"Let us give thanks to the Lord our God","before":true,"status":"custom","authority":"traditional_faithful_custom","sourceKey":"oconnell1962_bows_traditional_custom","sourceRefs":["OCONNELL_1962"],"prominence":"DETAIL"}],"ritualActions":[]}};
const ICON={"stand":"./assets/generated-inline/art-c0e4a1c03e2ae64702ce.png","sit":"./assets/generated-inline/art-d9a69583ba0ad2180014.png","kneel":"./assets/generated-inline/art-66f69f70cf867e172ac3.png","genuflect":"./assets/generated-inline/art-706d89e4973a4c62e4a9.png","bow":"./assets/generated-inline/art-f8f9f29c7de680d3180c.png","cross":"./assets/generated-inline/art-b1684a9aa8365e8b8512.png","hands":"./assets/generated-inline/art-b377a5380f295928f7ad.png"};
const FR_ANCHOR={"sign-cross":["Au nom du Père"],"adjutorium":["Notre secours ✠"],"ministers-confiteor":["c’est ma faute, c’est ma faute, c’est ma très grande faute"],"indulgentiam-absolution":["Que le Dieu tout-puissant et miséricordieux"],"gloria":["Nous vous adorons","Nous vous rendons grâces","accueillez notre prière","avec le Saint-Esprit ✠"],"gospel-announcement":["Sequéntia ✠ sancti Evangélii","Suite ✠ du saint Évangile"],"credo":["JE CROIS en un seul Dieu","Et il a pris chair de la Vierge Marie","et s’est fait homme","il reçoit même adoration et même gloire","la vie ✠ du monde à venir"],"sanctus":["Saint, Saint, Saint le Seigneur","Béni soit celui qui vient"],"nobis-quoque":["À nous aussi, vos serviteurs pécheurs"],"agnus":["Agneau de Dieu"],"domine-non-sum-dignus":["Seigneur, je ne suis pas digne"],"blessing":["Que le Dieu tout-puissant vous bénisse"],"last-gospel-announcement":["Commencement ✠ du saint Évangile"],"last-gospel":["ET LE VERBE S’EST FAIT CHAIR.","Et il a habité parmi nous"],"palms-gospel":["Suite ✠ du saint Évangile"],"gf-between-lessons":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-1":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-2":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-3":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-4":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-5":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-6":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-7":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-8":["Fléchissons les genoux","Levez-vous"],"gf-solemn-prayer-9":["Fléchissons les genoux","Levez-vous"],"gf-cross-veneration":["Ô mon peuple"],"preface":["Rendons grâces au Seigneur notre Dieu"]};
const HOLY_NAME_PUBLIC_STEPS=new Set(["introit","kyrie","gloria","collect","epistle","gradual","alleluia","gospel-announcement","gospel","credo","offertory","orate-fratres","preface","sanctus","canon-doxology","pater","fraction-pax","agnus","ecce","domine-non-sum-dignus","communion-faithful","postcommunion","dismissal","blessing","candlemas-blessing","candlemas-distribution","candlemas-procession","ashes-antiphon","ashes-four-prayers","ashes-imposition","ashes-after-distribution","ashes-conclusion","palms-blessing","palms-sprinkle-incense","palms-distribution","palms-gospel","palms-procession","palms-return","holy-thursday-reposition","holy-thursday-stripping","gf-lesson-1","gf-responsory-1","gf-between-lessons","gf-lesson-2","gf-responsory-2","gf-passion","gf-cross-unveiling","gf-cross-veneration","gf-sacrament-return","gf-pater","gf-libera","gf-faithful-communion","gf-final-prayers","gf-end","vigil-fire","vigil-candle","vigil-lumen","vigil-exsultet","vigil-prophecies","vigil-font","vigil-lauds"]);
const HOLY_NAME_AUTHORITY='traditional_holy_name_custom';
const HOLY_NAME_SOURCE='oconnell1962_bows_traditional_custom';
const DOXOLOGY_BOW_AUTHORITY='traditional_doxology_bow_custom';
const MARIAN_BOW_AUTHORITY='traditional_marian_name_custom';
const SAINT_BOW_AUTHORITY='traditional_active_saint_name_custom';
const POPE_BOW_AUTHORITY='traditional_pope_name_custom';
const IDENTITY_BOW_SOURCE='ritus_servandus_1962_name_bows';
const SAINT_PRAYER_STEPS=new Set(['collect','secret','postcommunion']);
const POPE_NAME_STEPS=new Set(['te-igitur','gf-solemn-prayer-2','vigil-exsultet']);
const NON_SAINT_TITLE=/Octave Day of Christmas|Epiphany|Baptism of (?:the )?Lord|Precious Blood|Transfiguration|Exaltation of the Holy Cross|All Saints|All Souls|Guardian Angels|Holy Family|Christ the King|Sacred Heart|Corpus Christi|Dedication|Blessed Virgin Mary|Our Lady|Immaculate (?:Heart|Conception)|Most Holy Name of Mary|Maternity of the Blessed Virgin|Presentation of the Blessed Virgin|Queenship of the Blessed Virgin|Seven Sorrows|Nativity of the Blessed Virgin|Assumption of the Blessed Virgin|Visitation of the Blessed Virgin|Annunciation of the Blessed Virgin/i;
const handled=new WeakSet();
const norm=v=>String(v??'').replace(/\u00a0/g,' ').replace(/[\t\r\n]+/g,' ').replace(/\s{2,}/g,' ').trim();
const lang=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.language||'en';
const form=()=>globalThis.AO_RUNTIME_V8?.store?.getState?.()?.live?.form||'low';
function coreState(){return globalThis.AO_RUNTIME_V8?.store?.getState?.()||null}
function activeProperPath(){
 const st=coreState(),active=globalThis.AO_ACTIVE_MASS_SESSION;
 return String(active?.resolvedMass?.properSource||active?.proper?.sourcePath||st?.resolution?.proper?.data?.sourcePath||st?.resolution?.day?.selectedMassOption?.path||st?.resolution?.day?.main?.path||'');
}
function activeProper(){
 const st=coreState(),active=globalThis.AO_ACTIVE_MASS_SESSION;
 return active?.proper||st?.resolution?.proper?.data||null;
}
function activeTitleBlob(){
 const st=coreState(),active=globalThis.AO_ACTIVE_MASS_SESSION,p=activeProper(),day=st?.resolution?.day;
 return [active?.resolvedMass?.name,active?.resolvedMass?.title,p?.name,p?.nameFr,day?.selectedMassOption?.title,day?.selectedMassOption?.name,day?.main?.title,day?.main?.name,...(p?.calendarCommemorations||[]).map(x=>x?.name)].filter(Boolean).join(' · ');
}
function isMarianCelebration(){
 return /Blessed Virgin Mary|B\.?\s*V\.?\s*M\.?|Our Lady|Notre-Dame|Sainte Vierge|Immaculate (?:Heart|Conception)|Most Holy Name of Mary|Maternity of the Blessed Virgin|Presentation of the Blessed Virgin|Queenship of the Blessed Virgin|Seven Sorrows|Nativity of the Blessed Virgin|Assumption of the Blessed Virgin|Visitation of the Blessed Virgin|Annunciation of the Blessed Virgin|Purification of the Blessed Virgin|Mary Major/i.test(activeTitleBlob());
}
function hasActiveSaintContext(){
 const p=activeProper(),path=activeProperPath(),title=activeTitleBlob(),commems=p?.calendarCommemorations||[];
 if(commems.length)return true;
 if(!/^Sancti\//.test(path)||isMarianCelebration()||NON_SAINT_TITLE.test(title))return false;
 return /\b(?:St\.?|Saint|Ss\.?|Sts\.?|Apostle|Martyr|Confessor|Virgin|Bishop|Abbot|Pope|Doctor)\b/i.test(title);
}
function isRequiemMass(){
 const st=coreState(),active=globalThis.AO_ACTIVE_MASS_SESSION,p=active?.proper||st?.resolution?.proper?.data,path=activeProperPath();
 return active?.resolvedMass?.celebrationType==='requiem'||active?.resolvedMass?.exceptionalProfile==='requiem-1962'||p?.isRequiem===true||/requiem/i.test(String(p?.riteProfile||''))||/^Sancti\/11-02(?:m\d+)?$/.test(path);
}
function isSpecialIncarnationSung(){
 if(form()!=='sung')return false; const path=activeProperPath();
 return path==='Sancti/03-25'||/^Sancti\/12-25m[123]$/.test(path);
}
function eventApplies(stepId,ev){
 if(ev?.unlessRequiem&&isRequiemMass())return false;
 if(ev?.requiresSecondConfiteorSetting&&!coreState()?.settings?.secondConfiteor)return false;
 return true;
}
function effectiveEvent(stepId,ev){
 if(stepId==='credo'&&ev?.specialIncarnationSungKind&&isSpecialIncarnationSung())return {...ev,kind:ev.specialIncarnationSungKind,status:ev.specialIncarnationSungStatus||ev.status,authority:AUTHORITY.RUBRIC_1962,label:'Kneel',sourceRefs:['RGM_1960','OCONNELL_1962'],prominence:'CORE',specialRule:'CHRISTMAS_ANNUNCIATION_SUNG_KNEEL'};
 return ev;
}
function detectCompatibilityVariant(text,currentStepId=''){
 const nearCommunion=['priest-communion','second-confiteor','ecce','domine-non-sum-dignus','communion-faithful'].includes(String(currentStepId));
 if(!nearCommunion)return null;const t=norm(text).toLocaleLowerCase();
 if(/conf[ií]teor/.test(t)||(/mea culpa/.test(t)&&/maxima|maxima|máxima/.test(t)))return 'SECOND_CONFITEOR_DETECTED';return null;
}
function iconKind(kind,label=''){
 const k=String(kind||'').toLowerCase(), l=String(label||'').toLowerCase();
 if(k==='rise'||/\brise\b|stand|debout|levez/.test(l))return 'stand';
 if(k==='sit'||/\bsit\b|assis/.test(l))return 'sit';
 if(k==='kneel'||/kneel|genoux|agenou/.test(l))return 'kneel';
 if(k==='genuflect'||/genuflect|génuflex/.test(l))return 'genuflect';
 if(k==='bow'||/bow|inclina/.test(l))return 'bow';
 if(k==='cross'||/cross|croix/.test(l))return 'cross';
 return 'hands';
}
function labelFor(ev,l){
 const k=String(ev.kind||'').toLowerCase();
 const map=l==='fr'?{stand:'Debout',sit:'Assis',kneel:'À genoux',genuflect:'Génuflexion',rise:'Se relever',bow:'Incliner la tête',cross:'Signe de croix'}:{stand:'Stand',sit:'Sit',kneel:'Kneel',genuflect:'Genuflect',rise:'Rise',bow:'Bow head',cross:'Sign of the cross'};
 if(k==='action'&&/breast/i.test(ev.label||'')){const parsed=Number(ev.count)||Number((String(ev.label||'').match(/[×x]\s*(\d+)/i)||[])[1])||1;return l==='fr'?`Frapper la poitrine ×${parsed}`:`Strike breast ×${parsed}`;}
 if(/forehead/i.test(ev.label||''))return l==='fr'?'Front · lèvres · poitrine':'Forehead · lips · breast';
 if(k==='bow'&&ev.nameBow==='jesus')return l==='fr'?'Incliner · Saint Nom':'Bow · Holy Name';
 if(k==='bow'&&ev.nameBow==='mary')return l==='fr'?'Incliner · Notre-Dame':'Bow · Our Lady';
 if(k==='bow'&&ev.nameBow==='pope')return l==='fr'?'Incliner · nom du Pape':'Bow · Pope’s name';
 if(k==='bow'&&ev.nameBow==='saint')return l==='fr'?'Incliner · saint du jour':'Bow · Saint of the day';
 return map[k]||ev.label||k.replace(/_/g,' ');
}
function cue(ev,l,extra='',options={}){
 const rawLabel=String(ev?.label||''), baseKind=iconKind(ev.kind,rawLabel), crossOnlyCue=baseKind==='cross'||ev?.gestureForm==='SIGN_CROSS_GOSPEL'||/forehead|gospel cross|front · lèvres/i.test(rawLabel), kind=crossOnlyCue?'cross':baseKind, span=document.createElement('span'),label=labelFor(ev,l);
 span.className='aoInlineCue '+extra+(ev.status==='custom'||ev.source==='local'||ev.source==='special_day_step'?' aoCueLocal':'')+(crossOnlyCue?' aoCueIconOnly':'');
 span.dataset.aoCueKind=String(ev.kind||'action'); span.dataset.aoCueVersion=VERSION;
 if(ev.count)span.dataset.aoCueCount=String(ev.count); if(ev.status)span.dataset.aoCueStatus=String(ev.status); if(ev.authority)span.dataset.aoCueAuthority=String(ev.authority); if(ev.sourceKey)span.dataset.aoCueSource=String(ev.sourceKey); if(Array.isArray(ev.sourceRefs))span.dataset.aoCueSourceRefs=ev.sourceRefs.join(','); if(ev.nameBow)span.dataset.aoCueNameBow=String(ev.nameBow);
 if(crossOnlyCue){span.dataset.aoGuideable='0';span.setAttribute('role','img');span.setAttribute('aria-label',label)}else{span.dataset.aoGuideable='1';span.setAttribute('role','button');span.tabIndex=0;span.setAttribute('aria-haspopup','dialog');span._aoCueEvent={...ev};span._aoCueLang=l;}
 if(crossOnlyCue||!options.suppressIcon){const im=document.createElement('img');im.src=ICON[kind]||ICON.hands;im.alt='';im.setAttribute('aria-hidden','true');span.append(im)}else{span.dataset.aoCueIconSuppressed='printed-cross'}
 if(!crossOnlyCue)span.append(document.createTextNode(label)); return span;
}
const PRINTED_CROSS_RE=/[✠✚✙✛✜✝✞☩]/;
function printedCrossNearHit(hit){
 if(!hit?.node)return false;
 const raw=String(hit.node.nodeValue||''),at=Math.max(0,Number(hit.index)||0);
 const lineStart=raw.lastIndexOf('\n',Math.max(0,at-1))+1,nextBreak=raw.indexOf('\n',at),lineEnd=nextBreak<0?raw.length:nextBreak;
 return PRINTED_CROSS_RE.test(raw.slice(lineStart,lineEnd));
}
function guideKey(ev){
 const k=String(ev?.kind||'').toLowerCase(),label=String(ev?.label||'').toLowerCase();
 if(ev?.gestureForm==='SIGN_CROSS_GOSPEL'||/forehead|front · lèvres|gospel cross/.test(label))return 'gospel_cross';
 if(k==='cross')return 'full_cross';
 if(/breast|poitrine/.test(label)){const m=String(ev?.label||'').match(/[×x]\s*(\d+)/i),count=Number(ev?.count||(m&&m[1])||1);return count===1?'breast_1':'breast_3';}
 if(k==='genuflect'||/genuflect|génuflex/.test(label))return 'genuflect';
 if(k==='kneel'||/kneel|genoux|agenou/.test(label))return 'kneel';
 if(k==='rise'||k==='stand'||/rise|stand|debout|relever/.test(label))return 'stand';
 if(k==='sit'||/\bsit\b|assis/.test(label))return 'sit';
 if(k==='bow'||/bow|inclina/.test(label))return /profound|profonde/.test(label)?'bow_profound':'bow_head';
 if(k==='adore'||/adore|adorer/.test(label))return 'adore'; return 'action';
}
function escGuide(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function guideStatus(ev,l){const a=String(ev?.authority||'');if(AUTHORITY_LABELS[a])return AUTHORITY_LABELS[a][l]||AUTHORITY_LABELS[a].en;if(CUSTOM_AUTHORITY_LABELS[a])return CUSTOM_AUTHORITY_LABELS[a][l]||CUSTOM_AUTHORITY_LABELS[a].en;if(ev?.source==='special_day_step')return l==='fr'?'Action propre à ce jour':'Special-day action';if(ev?.status==='custom')return l==='fr'?'Usage traditionnel/local':'Traditional/local custom';return l==='fr'?'Indication pratique':'Practical guidance'}
function guideSources(ev){return (Array.isArray(ev?.sourceRefs)?ev.sourceRefs:[]).filter(id=>SOURCE_REGISTRY[id]).map(id=>SOURCE_REGISTRY[id])}
function canonicalCueRecord(stepId,ev){
 if(!stepId||!globalThis.AO_MASS_GUIDANCE_V4313)return null;
 const key=guideKey(ev),map={full_cross:'SIGN_OF_CROSS',gospel_cross:'GOSPEL_CROSSES_3',breast_1:'BREAST_STRIKE_1',breast_3:'BREAST_STRIKE_3',genuflect:'GENUFLECT',kneel:'KNEEL',stand:'STAND',sit:'SIT',bow_head:'HEAD_BOW',bow_profound:'PROFOUND_BOW',adore:'ADORATION'};
 const action=map[key]; if(!action)return null;
 const rows=globalThis.AO_MASS_GUIDANCE_V4313.gesturesFor(stepId)||[];
 const anchor=String(ev?.anchorLat||'').toLowerCase();
 return rows.find(r=>r.action===action && (!anchor || String(r.anchor_lat||'').toLowerCase().includes(anchor) || anchor.includes(String(r.anchor_lat||'').toLowerCase()))) || rows.find(r=>r.action===action) || null;
}
function guideForEvent(ev,l='en',stepId=''){
 const key=guideKey(ev),copy=(GUIDE_CONTENT[key]||GUIDE_CONTENT.action)[l]||(GUIDE_CONTENT[key]||GUIDE_CONTENT.action).en;
 const rec=canonicalCueRecord(stepId,ev), canonical=rec?globalThis.AO_MASS_GUIDANCE_V4313.guideFor(rec,l):null;
 let action=canonical?.action||copy.action,why=canonical?.why||copy.why,status=canonical?.status||guideStatus(ev,l),sources=canonical?.sources||guideSources(ev);
 if(ev?.specialRule==='CHRISTMAS_ANNUNCIATION_SUNG_KNEEL'&&key==='kneel'){
  action=l==='fr'?'À Noël ou à l’Annonciation, à la Messe chantée, mettez-vous à genoux à « Et incarnatus est » et restez à genoux jusqu’à l’indication de vous relever.':'At Christmas or the Annunciation in Sung Mass, kneel at Et incarnatus est and remain kneeling until the cue to rise.';
  why=l==='fr'?'Il s’agit ici de l’exception propre de 1962 pour l’Incarnation : à ces célébrations, la Messe chantée demande de s’agenouiller plutôt que d’effectuer la génuflexion ordinaire.':'This is the specific 1962 Incarnation exception: on these celebrations at Sung Mass, the action is kneeling rather than the ordinary genuflection.';
 }
 return {key,title:copy.title,action,why,status,sources,label:labelFor(ev,l),record:rec,stepId};
}
function ensureCueGuideSheet(){let root=document.getElementById('aoCueGuideSheet');if(root)return root;root=document.createElement('div');root.id='aoCueGuideSheet';root.className='sheetBackdrop';root.hidden=true;document.body.append(root);return root}
function closeCueGuide(){const root=document.getElementById('aoCueGuideSheet');if(root)root.hidden=true;document.body.style.overflow=''}
function openCueGuide(ev,l='en',stepId=''){
 const g=guideForEvent(ev,l,stepId),root=ensureCueGuideSheet();
 const src=g.sources.length?`<ul class="aoCueGuideSources">${g.sources.map(s=>{const label=typeof s==='string'?s:(s?.title||s?.label||'');const type=typeof s==='object'?(s?.type||s?.kind||''):'';return `<li>${type?`<small>${escGuide(type.replaceAll('_',' '))}</small>`:''}${escGuide(label)}</li>`}).join('')}</ul>`:`<p class="aoCueGuideCaution">${l==='fr'?'Aucune référence supplémentaire n’est attachée à ce signal.':'No additional source reference is attached to this cue.'}</p>`;
 root.innerHTML=`<section class="liveSheet whySheet" role="dialog" aria-modal="true" aria-labelledby="aoCueGuideTitle"><header><div><span class="sheetKicker">${l==='fr'?'Geste pendant la Messe':'Mass action'}</span><h2 id="aoCueGuideTitle">${escGuide(g.title)}</h2></div><button type="button" data-ao-cue-guide-close aria-label="${l==='fr'?'Fermer':'Close'}">×</button></header><div class="whyBlock primaryWhy"><h3>${l==='fr'?'Action':'Action'}</h3><p>${escGuide(g.action)}</p></div><div class="whyBlock"><h3>${l==='fr'?'Statut':'Status'}</h3><span class="aoCueGuideStatus">${escGuide(g.status)}</span></div><div class="whyBlock"><h3>${l==='fr'?'Pourquoi ?':'Why?'}</h3><p>${escGuide(g.why)}</p></div><div class="whyBlock"><h3>${l==='fr'?'Sources':'Sources'}</h3>${src}</div>${stepId?`<button class="aoCueStudy" type="button" data-ao-cue-guide-study="${escGuide(stepId)}">${l==='fr'?'Étudier ce moment de la Messe':'Study this Mass moment'} →</button>`:''}</section>`;
 root.hidden=false;document.body.style.overflow='hidden';queueMicrotask(()=>root.querySelector('[data-ao-cue-guide-close]')?.focus());
}
function installCueGuideEvents(){
 if(document.documentElement.dataset.aoCueGuideEvents==='1')return;document.documentElement.dataset.aoCueGuideEvents='1';
 document.addEventListener('click',e=>{const close=e.target.closest?.('[data-ao-cue-guide-close]');if(close){e.preventDefault();closeCueGuide();return}const study=e.target.closest?.('[data-ao-cue-guide-study]');if(study){e.preventDefault();const id=study.dataset.aoCueGuideStudy;closeCueGuide();globalThis.AO_UNDERSTAND_MASS?.openStep?.(id);return}const root=e.target===document.getElementById('aoCueGuideSheet');if(root){closeCueGuide();return}const pill=e.target.closest?.('.aoInlineCue[data-ao-guideable="1"]');if(pill&&pill._aoCueEvent){e.preventDefault();e.stopPropagation();const stepId=pill.closest?.('.liveScreen')?.dataset?.stepId||'';openCueGuide(pill._aoCueEvent,pill._aoCueLang||lang(),stepId)}},true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('aoCueGuideSheet')?.hidden){closeCueGuide();return}if((e.key==='Enter'||e.key===' ')&&e.target?.matches?.('.aoInlineCue[data-ao-guideable="1"]')&&e.target._aoCueEvent){e.preventDefault();const stepId=e.target.closest?.('.liveScreen')?.dataset?.stepId||'';openCueGuide(e.target._aoCueEvent,e.target._aoCueLang||lang(),stepId)}},true);
}
function textNodes(root){
 const out=[]; if(!root)return out;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){
  const p=n.parentElement;if(!p||!norm(n.nodeValue))return NodeFilter.FILTER_REJECT;
  if(p.closest('.aoInlineCue,.swapAction,.textLang,.massReadingRole,.parallelRole'))return NodeFilter.FILTER_REJECT;
  return NodeFilter.FILTER_ACCEPT;
 }}); let n; while(n=w.nextNode())out.push(n); return out;
}
function holyNameScopes(root){
 const out=[],seen=new Set();
 root.querySelectorAll('.massText').forEach(el=>{
  if(el.classList.contains('swapAlt')||el.closest('.textColumn.vernacular')||el.classList.contains('consecrationVernacular'))return;
  const sig=norm(textNodes(el).map(n=>n.nodeValue).join(' '));if(!sig||seen.has(sig))return;seen.add(sig);out.push(el);
 });
 return out;
}
function placeTextDrivenBows(root,stepId,l){
 if(!HOLY_NAME_PUBLIC_STEPS.has(stepId))return 0;
 let placed=0;
 for(const scope of holyNameScopes(root)){
  for(const node of textNodes(scope)){
   const raw=node.nodeValue||'',hits=[];
   for(const m of raw.matchAll(/\bIes(?:us|um|u)\b/giu))hits.push({m,ev:{kind:'bow',label:'Bow at the Holy Name',status:'custom',authority:HOLY_NAME_AUTHORITY,sourceKey:HOLY_NAME_SOURCE,sourceRefs:['OCONNELL_1962'],prominence:'DETAIL',nameBow:'jesus'}});
   for(const m of raw.matchAll(/Gl[oó]ria Patri/giu))hits.push({m,ev:{kind:'bow',label:'Bow head',status:'custom',authority:DOXOLOGY_BOW_AUTHORITY,sourceKey:HOLY_NAME_SOURCE,sourceRefs:['OCONNELL_1962'],prominence:'DETAIL'}});
   hits.sort((a,b)=>(b.m.index??-1)-(a.m.index??-1));
   for(const hit of hits){
    const m=hit.m,at=m.index??-1;if(at<0)continue;
    const anchor=node.splitText(at),after=anchor.splitText(m[0].length);
    anchor.parentNode.insertBefore(cue(hit.ev,l,'aoCueRitual'),anchor);placed++;
   }
  }
 }
 return placed;
}
function mariaTokenHits(raw){
 const hits=[];
 for(const m of raw.matchAll(/(?<!\p{L})Mar(?:í|i)(?:a|ae|æ|am)(?!\p{L})/giu)){
  const at=m.index??-1;if(at<0)continue;
  const around=raw.slice(Math.max(0,at-72),Math.min(raw.length,at+m[0].length+72));
  if(isMarianCelebration()||/Virg|Genetr|Mater\s+Dei|Dei\s+Mat|Deípar|Theotoc|Immaculat/i.test(around))hits.push({index:at,length:m[0].length});
 }
 return hits;
}
function popeTokenHits(raw){
 const hits=[];
 for(const m of raw.matchAll(/Papa\s+nostro\s+N\./giu)){
  const rel=m[0].lastIndexOf('N.');if((m.index??-1)>=0&&rel>=0)hits.push({index:(m.index??0)+rel,length:2});
 }
 return hits;
}
function saintInvocationHits(raw){
 const out=[],seen=new Set(),stop=/^(?:Ecclesi|Evangel|Trinit|Hosti|Sacrament|Cruc|Spirit|Domin|De|Ies|Christ|Mari|Virg|Angel|Apostol|Martyr|Confessor|Episcop|Abbat|Pontific|Doctor)/i;
 const fold=x=>String(x||'').normalize('NFD').replace(/\p{M}/gu,'').replace(/æ/gi,'ae').replace(/œ/gi,'oe');
 const add=(index,text)=>{if(index<0||!text||stop.test(fold(text)))return;const key=index+':'+text;if(seen.has(key))return;seen.add(key);out.push({index,length:text.length,text})};
 const direct=/\b(?:sanct(?:um|am|i|ae|æ)|be(?:a|á)t(?:um|am|i|ae|æ))\s+(?:(?:Apostolum|Martyrem|Confessorem|Virginem|Episcopum|Abbatem|Pontificem|Doctorem)\s+)?(?:tu(?:um|am|i|ae)\s+)?([A-ZÀ-ÖØ-ÞÆŒ][\p{L}’'’-]{2,})/gu;
 for(const m of raw.matchAll(direct)){const name=m[1],rel=m[0].lastIndexOf(name);add((m.index??0)+rel,name)}
 const role=/\b(?:Apostol(?:orum|órum)|Mart(?:yrum|ýrum)|Confessoris|Virginis|Episcopi|Abbatis|Pontificis|Doctoris)\s+(?:tu(?:orum|órum|i|ae|æ)\s+)?([A-ZÀ-ÖØ-ÞÆŒ][\p{L}’'’-]{2,})(?:\s+et\s+([A-ZÀ-ÖØ-ÞÆŒ][\p{L}’'’-]{2,}))?/gu;
 for(const m of raw.matchAll(role)){
  const a=m[1],ra=m[0].indexOf(a);add((m.index??0)+ra,a);
  if(m[2]){const rb=m[0].lastIndexOf(m[2]);add((m.index??0)+rb,m[2])}
 }
 return out;
}
function insertIdentityHits(scope,hits,l){
 let placed=0;
 const byNode=new Map();
 for(const h of hits){if(!h?.node||h.index<0||!h.length)continue;(byNode.get(h.node)||byNode.set(h.node,[]).get(h.node)).push(h)}
 for(const [node,rows] of byNode){
  rows.sort((a,b)=>b.index-a.index);
  for(const h of rows){
   if(!node.parentNode||h.index>node.nodeValue.length)continue;
   const anchor=node.splitText(h.index),after=anchor.splitText(Math.min(h.length,anchor.nodeValue.length));
   anchor.parentNode.insertBefore(cue(h.ev,l,'aoCueRitual'),anchor);placed++;
  }
 }
 return placed;
}
function placeIdentityNameBows(root,stepId,l){
 let placed=0;
 const scopes=holyNameScopes(root);
 const marian=[],pope=[],saints=[];
 for(const scope of scopes){for(const node of textNodes(scope)){
  const raw=node.nodeValue||'';
  for(const h of mariaTokenHits(raw))marian.push({node,...h,ev:{kind:'bow',label:'Bow at Our Lady’s name',status:'custom',authority:MARIAN_BOW_AUTHORITY,sourceKey:IDENTITY_BOW_SOURCE,sourceRefs:['OCONNELL_1962'],prominence:'DETAIL',nameBow:'mary'}});
  if(POPE_NAME_STEPS.has(stepId))for(const h of popeTokenHits(raw))pope.push({node,...h,ev:{kind:'bow',label:'Bow at the Pope’s name',status:'custom',authority:POPE_BOW_AUTHORITY,sourceKey:IDENTITY_BOW_SOURCE,sourceRefs:['MR_1962','OCONNELL_1962'],prominence:'DETAIL',nameBow:'pope'}});
  if(SAINT_PRAYER_STEPS.has(stepId)&&hasActiveSaintContext())for(const h of saintInvocationHits(raw))saints.push({node,...h,ev:{kind:'bow',label:'Bow at the saint’s name',status:'custom',authority:SAINT_BOW_AUTHORITY,sourceKey:IDENTITY_BOW_SOURCE,sourceRefs:['OCONNELL_1962'],prominence:'DETAIL',nameBow:'saint'}});
 }}
 placed+=insertIdentityHits(root,[...marian,...pope,...saints],l);
 return placed;
}
function exactNeedles(stepId,ev,index,l){
 const a=[]; if(l==='fr'&&FR_ANCHOR[stepId]?.[index])a.push(FR_ANCHOR[stepId][index]);
 if(l==='en'&&ev.anchorEng)a.push(ev.anchorEng); if(ev.anchorLat)a.push(ev.anchorLat); if(ev.anchorEng)a.push(ev.anchorEng);
 return [...new Set(a.filter(Boolean))];
}
function locate(root,needles){
 const scopes=[...root.querySelectorAll('.massText')]; scopes.sort((a,b)=>(a.closest('.swapAlt')?1:0)-(b.closest('.swapAlt')?1:0));
 // Some response/dialogue rows are rendered outside .massText. Search the whole step last,
 // after the preferred text panels, so exact ritual cues remain inline rather than falling back to the top.
 scopes.push(root);
 const seen=new Set();
 for(const scope of scopes){ if(seen.has(scope))continue; seen.add(scope); for(const n of textNodes(scope)){ const raw=n.nodeValue||'', folded=norm(raw);
   for(const needle of needles){ const exact=String(needle); let at=raw.indexOf(exact); if(at<0)at=raw.toLocaleLowerCase().indexOf(exact.toLocaleLowerCase());
    if(at>=0)return {node:n,index:at,length:exact.length,scope};
    const nf=norm(exact); if(nf&&folded.includes(nf)){ const first=nf.split(' ')[0], approx=raw.toLocaleLowerCase().indexOf(first.toLocaleLowerCase()); if(approx>=0)return {node:n,index:approx,length:first.length,scope}; }
   }
 }} return null;
}
function place(root,stepId,ev,index,l){
 const hit=locate(root,exactNeedles(stepId,ev,index,l));
 const el=cue(ev,l,'aoCueRitual');
 if(!hit){el.classList.add('aoCueFallback');root.prepend(el);return false;}
 const anchorStart=hit.node.splitText(hit.index), after=anchorStart.splitText(Math.min(hit.length,anchorStart.nodeValue.length));
 if(ev.after)after.parentNode.insertBefore(el,after); else anchorStart.parentNode.insertBefore(el,anchorStart); return true;
}
function ritualCueFromAction(action){
 const label=String(action.label||''); let kind='action';
 if(/genuflect|génuflex/i.test(label))kind='genuflect'; else if(/kneel|genoux|agenou/i.test(label))kind='kneel'; else if(/rise|stand|debout|levez/i.test(label))kind='rise'; else if(/cross|croix/i.test(label))kind='cross';
 return {kind,label,status:'custom',source:action.source||'special_day_step'};
}
function timeline(stepId,l){
 if(form()!=='sung'||!['gloria','credo'].includes(stepId))return null;
 const box=document.createElement('div');box.className='aoPostureTimeline';const lab=document.createElement('div');lab.className='aoPostureTimelineLabel';lab.textContent=l==='fr'?'Séquence de posture · usage local/traditionnel':'Posture sequence · local/traditional custom';box.append(lab);
 const flow=document.createElement('div');flow.className='aoPostureTimelineFlow';const seq=[['stand','Stand','Debout'],['sit','Sit while the schola continues','Assis pendant que la schola continue'],['stand','Stand at the conclusion','Debout à la conclusion']];
 seq.forEach((x,i)=>{if(i){const a=document.createElement('span');a.className='aoPostureArrow';a.textContent='→';flow.append(a)}flow.append(cue({kind:x[0],label:l==='fr'?x[2]:x[1],status:'custom',authority:AUTHORITY.LOCAL_CUSTOM,sourceRefs:['SCR_1958']},l,'aoCueLocal'))});box.append(flow);
 const note=document.createElement('p');note.className='aoPostureTimelineNote';const incarnationSpecial=stepId==='credo'&&isSpecialIncarnationSung();note.textContent=l==='fr'?(stepId==='credo'?(incarnationSpecial?'À Noël et à l’Annonciation, à la Messe chantée, tous s’agenouillent pendant « Et incarnatus est »; le repère exact apparaît ci-dessous.':'La génuflexion à « Et incarnatus est » apparaît exactement dans le texte ci-dessous.'):'Les transitions assis/debout pendant une Messe chantée relèvent de l’usage local; le signe de croix final apparaît exactement dans le texte.'):(stepId==='credo'?(incarnationSpecial?'At Christmas and the Annunciation in a Sung Mass, all kneel during Et incarnatus est; the exact cue is marked below.':'The genuflection at Et incarnatus est is marked at the exact words below.'):'Sitting/standing during a Sung Mass follows local custom; the concluding sign of the cross is marked at the exact words below.');box.append(note);return box;
}
function enhance(screen){
 if(!screen||handled.has(screen))return; const stepId=screen.dataset.stepId||''; if(!stepId)return;
 let texts=screen.querySelector('.massTexts'); if(!texts){texts=document.createElement('section');texts.className='massTexts';const actions=screen.querySelector('.liveContextActions');actions?.parentNode?.insertBefore(texts,actions||null)}
 const orientation=screen.querySelector('.liveOrientation'); if(orientation){orientation.classList.add('aoInlineOrientation');texts.prepend(orientation)}
 const l=lang(),tl=timeline(stepId,l);if(tl){const orient=texts.querySelector('.aoInlineOrientation');orient?orient.after(tl):texts.prepend(tl)}
 screen.querySelectorAll('.liveCues .gesture').forEach(x=>x.remove()); const rec=REGISTRY[stepId]||{gestures:[],ritualActions:[]};
 const indexed=(rec.gestures||[]).map((ev,i)=>({ev:effectiveEvent(stepId,ev),i})).filter(({ev})=>eventApplies(stepId,ev)), ordered=[];
 for(let i=0;i<indexed.length;){
  const cur=indexed[i];
  if(cur.ev?.after){
   let j=i+1; while(j<indexed.length&&indexed[j].ev?.after&&indexed[j].ev.anchorLat===cur.ev.anchorLat&&indexed[j].ev.anchorEng===cur.ev.anchorEng)j++;
   ordered.push(...indexed.slice(i,j).reverse()); i=j;
  }else{ordered.push(cur);i++}
 }
 ordered.forEach(({ev,i})=>place(texts,stepId,ev,i,l));
 placeTextDrivenBows(texts,stepId,l);
 placeIdentityNameBows(texts,stepId,l);
 const ritual=(rec.ritualActions||[]).filter(a=>a&&a.label); if(ritual.length){const rail=document.createElement('div');rail.className='aoPostureTimeline aoRitualActionRail';const lab=document.createElement('div');lab.className='aoPostureTimelineLabel';lab.textContent=l==='fr'?'Action rituelle':'Ritual action';rail.append(lab);const flow=document.createElement('div');flow.className='aoPostureTimelineFlow';ritual.forEach((a,i)=>{if(i){const sep=document.createElement('span');sep.className='aoPostureArrow';sep.textContent='·';flow.append(sep)}flow.append(cue(ritualCueFromAction(a),l,'aoCueRitual'))});rail.append(flow);const orient=texts.querySelector('.aoInlineOrientation'),multi=texts.querySelector('.aoPostureTimeline:not(.aoRitualActionRail)');if(multi)multi.after(rail);else if(orient)orient.after(rail);else texts.prepend(rail)}
 handled.add(screen);screen.dataset.inlineCuesV251='1';
}
function scan(){document.querySelectorAll('.liveScreen').forEach(enhance)}
let storeHooked=false;function install(){installCueGuideEvents();const store=globalThis.AO_RUNTIME_V8?.store;if(!store?.subscribe){setTimeout(install,80);return}if(!storeHooked){storeHooked=true;store.subscribe(()=>queueMicrotask(scan))}scan()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.AO_INLINE_CUES_V251={version:VERSION,participationEngineVersion:PARTICIPATION_ENGINE_VERSION,guideVersion:GUIDE_VERSION,registrySteps:Object.keys(REGISTRY).length,authorityClasses:AUTHORITY,sourceRegistry:SOURCE_REGISTRY,sourcePolicy:{bows:'traditional/custom for faithful; not asserted as universal 1962 lay rubric',holyName:'audible/sung public-text rule only',identityNames:'Marian identity phrases; Pope N. placeholder; active saint invocation formulas in Collect/Secret/Postcommunion only',sourceKey:'oconnell1962_bows_traditional_custom',identitySourceKey:IDENTITY_BOW_SOURCE},guideForEvent,openGuide:openCueGuide,closeGuide:closeCueGuide,detectCompatibilityVariant,scan,getRegistry(){return JSON.parse(JSON.stringify(REGISTRY))},context(){return {properPath:activeProperPath(),requiem:isRequiemMass(),specialIncarnationSung:isSpecialIncarnationSung(),marianCelebration:isMarianCelebration(),activeSaintContext:hasActiveSaintContext(),form:form(),language:lang()}},diagnostic(){const screen=document.querySelector('.liveScreen');if(!screen)return {version:VERSION,live:false,context:this.context()};return {version:VERSION,live:true,stepId:screen.dataset.stepId||null,orientationInsideText:!!screen.querySelector('.massTexts>.aoInlineOrientation'),detachedGestureCount:screen.querySelectorAll('.liveCues .gesture').length,inlineCueCount:screen.querySelectorAll('.massTexts .aoInlineCue').length,guideableCueCount:screen.querySelectorAll('.massTexts .aoInlineCue[data-ao-guideable="1"]').length,holyNameBowCount:screen.querySelectorAll('.aoInlineCue[data-ao-cue-authority="'+HOLY_NAME_AUTHORITY+'"]').length,doxologyBowCount:screen.querySelectorAll('.aoInlineCue[data-ao-cue-authority="'+DOXOLOGY_BOW_AUTHORITY+'"]').length,marianNameBowCount:screen.querySelectorAll('.aoInlineCue[data-ao-cue-name-bow="mary"]').length,saintNameBowCount:screen.querySelectorAll('.aoInlineCue[data-ao-cue-name-bow="saint"]').length,popeNameBowCount:screen.querySelectorAll('.aoInlineCue[data-ao-cue-name-bow="pope"]').length,multiPosture:!!screen.querySelector('.aoPostureTimeline:not(.aoRitualActionRail)'),context:this.context()}}};
window.AO_INLINE_CUES_V252=window.AO_INLINE_CUES_V251;
window.AO_INLINE_CUES_V253=window.AO_INLINE_CUES_V251;
window.AO_INLINE_CUES_V254=window.AO_INLINE_CUES_V251;
})();
