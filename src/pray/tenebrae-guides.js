// Concise reader-facing guidance: this supplements, never modifies, the source-owned
// Matins/Lauds text. Historical ceremonial is distinguished from the 1960 rubric.
export const TENEBRAE_GUIDE_LINKS=Object.freeze({
  rubrics:"https://www.divinumofficium.com/www/horas/Help/Rubrics/Breviary%201960.html",
  history:"https://www.newadvent.org/cathen/14506a.htm",
  candles:"https://www.newadvent.org/cathen/07162c.htm"
});
const EN=Object.freeze({
  overview:"Tenebrae means ‘darkness’. It is the traditional name for Matins and Lauds of Holy Thursday, Good Friday and Holy Saturday: the Church meditates upon the Passion and burial of Christ before Easter.",
  method:"Choose a day and an Hour. Pray the text in order, or follow the clergy and choir where the Office is celebrated publicly. Use Simple for uninterrupted reading; Guided adds a brief explanation to each passage. No timer, automatic posture or candle ceremony is imposed.",
  structure:"Matins has three nocturns. Each contains three psalms, a versicle, three lessons and their responsories. Lauds follows with psalms and canticles, the Benedictus, Christus factus est and the concluding prayers.",
  ceremonial:"In an older solemn form, fifteen candles were progressively extinguished. A last light was hidden and returned; a noise called the strepitus marked the end. These historic ceremonies and their details vary by use and period. This reader follows the 1960 Roman Breviary texts and does not claim to reproduce a parish's ceremony.",
  timing:"The 1960 rubrics (§§144–145) allow Matins to be anticipated after 2 PM on the preceding day for a good reason, while Lauds is morning prayer. The older custom of a single anticipated evening Tenebrae service must not be confused with a universal 1960 requirement.",
  day:[
    "Holy Thursday: contemplate the institution of the Eucharist, Christ's agony and betrayal, and the first movement into His Passion.",
    "Good Friday: contemplate the Passion and death of the Lord; the Church mourns at the Cross.",
    "Holy Saturday: remain with Christ in the tomb, awaiting the Resurrection without anticipating the joy of Easter."
  ],
  psalm:"The psalm is framed by its proper antiphon. Read it as the prayer of the Church, with the Passion of Christ in view.",
  versicle:"This short exchange leads from the psalmody into the lessons. In communal recitation, follow the actual cantor and response.",
  lesson:[
    "The first nocturn reads Jeremiah's Lamentations over Jerusalem. In Holy Week the Church receives these words as a summons to repentance and contemplation of the Passion.",
    "The second nocturn offers St Augustine's commentary on the Psalms. Attend to the interpretation of suffering in relation to Christ.",
    "The third nocturn turns to the apostolic reading: St Paul to the Corinthians on Thursday, and to the Hebrews on Friday and Saturday."
  ],
  responsory:"The responsory answers the lesson in the language of the Passion. In these Offices the Gloria Patri is omitted; do not add it from an ordinary Office.",
  laudsPsalm:"At Lauds, the psalms and canticles form the Church's morning praise in the sombre Triduum.",
  benedictus:"The Benedictus is Zachary's Gospel canticle (Luke 1:68–79). Read it with its proper antiphon.",
  christus:"Christus factus est (Philippians 2:8–9) recalls Christ's obedience unto death; its text extends across the three days.",
  pater:"Pray the Our Father silently, as indicated by this Office's sequence.",
  collect:"The concluding oration turns the Church's meditation into petition. If following a public celebration, follow the conclusion actually used there.",
  sourceWarning:"This is a source-derived 1960/61 reading aid, not yet critically collated against a photographed printed Breviary."
});
const FR=Object.freeze({
  overview:"Ténèbres désigne les Matines et les Laudes du Jeudi saint, du Vendredi saint et du Samedi saint : l’Église médite la Passion et la sépulture du Christ dans l’attente de Pâques.",
  method:"Choisissez le jour et l’Heure. Priez les textes dans l’ordre, ou suivez le clergé et la schola lorsque l’Office est célébré publiquement. Le mode Simple privilégie la lecture ; le mode Guidé ajoute de courtes explications. Aucun minuteur, geste universel ou cérémonial des cierges n’est imposé.",
  structure:"Les Matines comprennent trois nocturnes. Chacun possède trois psaumes, un verset, trois leçons et leurs répons. Les Laudes comprennent les psaumes et cantiques, le Benedictus, Christus factus est et les prières finales.",
  ceremonial:"Dans une forme solennelle plus ancienne, quinze cierges s’éteignent progressivement. Une dernière lumière est cachée puis rapportée ; un bruit, le strepitus, marque la fin. Ces cérémonies ont varié selon les lieux et les époques. Le présent lecteur suit les textes du Bréviaire romain de 1960, sans prétendre reproduire le cérémonial paroissial.",
  timing:"Les rubriques de 1960 (§§144–145) permettent d’anticiper les Matines après 14 h la veille pour une juste cause ; les Laudes sont la prière du matin. L’ancienne coutume de célébrer les Ténèbres la veille au soir ne constitue pas une obligation universelle des rubriques de 1960.",
  day:[
    "Jeudi saint : contempler l’institution de l’Eucharistie, l’agonie et la trahison du Seigneur, au seuil de sa Passion.",
    "Vendredi saint : contempler la Passion et la mort du Seigneur ; l’Église demeure auprès de la Croix.",
    "Samedi saint : veiller auprès du tombeau du Christ, dans l’attente de la Résurrection, sans anticiper la joie pascale."
  ],
  psalm:"Le psaume est encadré par son antienne propre. Priez-le avec l’Église, à la lumière de la Passion du Christ.",
  versicle:"Ce bref échange conduit de la psalmodie aux leçons. En commun, suivez le chantre et le répons de l’assemblée.",
  lesson:[
    "Au premier nocturne, les Lamentations de Jérémie sur Jérusalem invitent l’Église à la pénitence et à la méditation de la Passion.",
    "Au deuxième nocturne, saint Augustin commente les psaumes ; recevez sa lecture de la souffrance à la lumière du Christ.",
    "Au troisième nocturne, la lecture apostolique vient de saint Paul aux Corinthiens le jeudi, et de l’Épître aux Hébreux le vendredi et le samedi."
  ],
  responsory:"Le répons répond à la leçon dans le langage de la Passion. Le Gloria Patri est omis dans ces Offices : ne l’ajoutez pas par habitude.",
  laudsPsalm:"Aux Laudes, les psaumes et cantiques sont la louange matinale de l’Église dans la gravité du Triduum.",
  benedictus:"Le Benedictus est le cantique évangélique de Zacharie (Lc 1, 68–79). Priez-le avec son antienne propre.",
  christus:"Christus factus est (Ph 2, 8–9) rappelle l’obéissance du Christ jusqu’à la mort ; son texte se développe au fil des trois jours.",
  pater:"Priez le Notre Père en silence, selon la suite de cet Office.",
  collect:"L’oraison finale fait de la méditation de l’Église une supplication. À l’église, suivez la conclusion réellement célébrée.",
  sourceWarning:"Ce lecteur est établi à partir des sources 1960/61 ; sa collation critique avec un Bréviaire imprimé photographié demeure à faire."
});
export function tenebraeGuideCopy({day=0,hour="MATINS",step=null,french=false}={}){
 const t=french?FR:EN;
 const id=String(step?.id??""),kind=String(step?.kind??"");
 let title=french?"Repère pour la prière":"Prayer guide",detail="";
 if(id.endsWith(".PATER"))detail=t.pater;
 else if(id.endsWith(".COLLECT"))detail=t.collect;
 else if(id==="L.CHRISTUS")detail=t.christus;
 else if(id==="L.BENEDICTUS")detail=t.benedictus;
 else if(kind==="LESSON"){
  const nocturn=step?.metadata?.nocturn??Math.ceil(Number(id.replace("M.LESSON",""))/3);
  detail=t.lesson[Math.max(0,Math.min(2,nocturn-1))];
  title=(french?"Nocturne ":"Nocturn ")+["I","II","III"][Math.max(0,Math.min(2,nocturn-1))];
 }else if(kind==="RESPONSORY")detail=t.responsory;
 else if(kind==="VERSICLE")detail=t.versicle;
 else if(hour==="MATINS"&&kind==="PSALM")detail=t.psalm;
 else if(hour==="LAUDS"&&kind==="PSALM")detail=t.laudsPsalm;
 return {overview:t.overview,method:t.method,structure:t.structure,ceremonial:t.ceremonial,timing:t.timing,
  day:t.day[Math.max(0,Math.min(2,day))],title,detail,sourceWarning:t.sourceWarning};
}
