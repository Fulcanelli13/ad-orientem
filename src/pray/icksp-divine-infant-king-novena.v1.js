// ICKSP-selected monthly novena. Existing 16 canonical novenas remain frozen.
// Two independently historic witnesses of Father Cyril's original prayer:
// English: F. X. Lasance, Prayer-Book for Religious (1904), Book IV;
// French: 2007 transcription containing a Vidi dated Ghent, 25 Aug 1885.
// The original printed 1885 source has not yet been directly inspected.
// The ICKSP contemporary English is a distinct recension, not silently copied.
// Nine prayer occasions repeat the SAME historically attested prayer;
// no invented nine daily meditations, contemporary translation, or indulgence.
const F=Object.freeze;
const bi=(en,fr)=>F({en,fr});
export const ICKSP_DIVINE_INFANT_KING_NOVENA_V1=F({
  id:"divine_infant_king",
  instituteSourceId:"icksp_us_novena_divine_infant_king",
  title:bi("Novena to the Divine Infant King","Neuvaine au Divin Enfant-Roi"),
  family:bi("Infant Jesus · Institute of Christ the King","Enfant-Jésus · Institut du Christ-Roi"),
  feast:bi("Monthly novena observance, not a liturgical feast","Dévotion mensuelle, non fête liturgique"),
  form:"REPEAT_FORM",
  pattern:"SOURCE_REPEAT_ONLY",
  calendar:F({type:"MONTHLY_DAYS",startDay:17,endDay:25,precision:"ICKSP_MONTHLY_17_25_OBSERVANCE"}),
  startKind:"TRADITIONAL_START",
  traditionalStart:bi("17th to 25th of each month, as observed by the Institute","Du 17 au 25 de chaque mois, selon la pratique de l’Institut"),
  frenchTextStatus:"TRADITIONAL_FRENCH_WITNESS_1885_NOTICE_TRANSCRIPTION",
  history:bi("The prayer to the Holy Child attributed to Venerable Father Cyril appears in Fr F. X. Lasance's 1904 Prayer-Book for Religious. The Institute uses this traditional prayer for a novena observed on the 17th–25th of each month. The 1904 English and 1885 French witnesses have different wording.","La prière au saint Enfant Jésus attribuée au vénérable père Cyrille figure dans un témoin français portant le Vidi de Gand du 25 août 1885. L’Institut récite sa neuvaine du 17 au 25 de chaque mois. Les textes anglais de 1904 et français de 1885 ne sont pas des traductions littérales l’un de l’autre."),
  meaning:bi("Seek help from the Divine Infant through Our Lady's intercession, renew confidence, repentance and love of neighbour.","Demander le secours du Divin Enfant par l’intercession de sa Mère, renouveler la confiance, le repentir et l’amour du prochain."),
  how:bi("Recite the same historical prayer once daily for nine days, naming the intention where the prayer directs. The novena may also be prayed on other days; 17–25 is the Institute's monthly practice.","Récitez la même prière historique chaque jour pendant neuf jours, en nommant votre intention à l’endroit indiqué. Elle peut aussi se prier à d’autres dates ; le 17–25 est l’usage mensuel de l’Institut."),
  commonNote:bi("This source form prescribes one repeated prayer, not nine invented daily prayers.","Cette forme comprend une prière répétée, non neuf prières quotidiennes inventées."),
  commonPrayers:F([]),
  repeatText:bi(
`O CHILD Jesus, I have recourse to Thee; by Thy holy Mother, I implore Thy assistance in this necessity (here mention your request), for I firmly believe that Thy divinity can assist me. I confidently hope to obtain Thy holy grace. I love Thee with my whole heart and my whole soul. I am heartily sorry for my sins, and I entreat of Thee, O good Jesus, to give me strength to overcome my evil passions.

I make the resolution of never again offending Thee, and I resolve to suffer everything rather than displease Thee. Henceforth I wish to serve Thee faithfully. For the love of Thee, O divine Child! I will love my neighbor as myself. O Jesus, omnipotent Child, I again implore Thy assistance on this occasion (mention it). Grant that I may possess Thee eternally, with Mary and Joseph, and adore Thee with the angels and saints in heaven. Amen.`,
`O Enfant Jésus, j'ai recours à Vous. Je Vous en prie, par votre Sainte Mère, assistez-moi dans cette nécessité (ici l'on expose l'objet de sa demande), car je crois fermement que votre Divinité peut me secourir. J'espère avec confiance obtenir votre sainte grâce. Je Vous aime de tout mon coeur et de toutes les forces de mon âme. Je me repens sincèrement de mes péchés; et je Vous supplie, ô bon Jésus, de me donner la force d'en triompher.

Je prends la résolution de ne plus jamais Vous offenser; et je viens m'offrir à Vous, dans la disposition de tout souffrir plutôt que de Vous déplaire. Désormais, je veux Vous servir avec fidélité. Pour l'amour de Vous, ô Divin Enfant, j'aimerai mon prochain comme moi-même.

Enfant plein de puissance, ô Jésus, je Vous en conjure de nouveau, assistez-moi dans cette circonstance (nommez-la), faites-moi la grâce de Vous posséder éternellement avec Marie et Joseph; et de Vous adorer avec les Saints Anges de la Cour céleste. Ainsi soit-il.`
  ),
  days:F(Array.from({length:9},(_,i)=>F({
    theme:bi("Day "+(i+1)+" · Prayer to the Divine Infant","Jour "+(i+1)+" · Prière au Divin Enfant"),
    guide:bi("Name your personal intention and recite the same historical prayer. No separate day text is required.","Nommez votre intention et récitez la même prière historique. Il n’existe pas de prière propre à ce jour dans cette forme.")
  }))),
  source:F({
    work:"Prayer to the Holy Child · same devotion selected by ICKSP",
    authors:"Venerable Fr Cyril of the Mother of God, OCD · historical attribution",
    edition:"English witness: F. X. Lasance, 1904 · French witness: transcription citing Vidi, Ghent, 25 Aug 1885",
    url:"https://en.wikisource.org/wiki/Prayer-book_for_Religious/Book_4",
    adaptation:"English and French historical recensions are separately presented; not a translation of ICKSP's modern page. No fabricated separate day texts."
  }),
  historySources:F([
    F({label:"ICKSP · Novena to the Divine Infant King",url:"https://institute-christ-king.org/resources/devotions-prayers/616-devotions-prayer-infant-king"}),
    F({label:"Fr F. X. Lasance · Prayer-Book for Religious · 1904",url:"https://en.wikisource.org/wiki/Prayer-book_for_Religious/Book_4"}),
    F({label:"French historical transcription · Vidi dated 25 Aug 1885",url:"https://prieresetdevotions.blogspot.com/2007/07/prire-efficace-lenfant-jsus-rvle-par-la.html"}),
    F({label:"ICRSP France · Father Cyril prayer, contemporary French witness",url:"https://icrspfrance.fr/?page=child-jesus-prayers"}),
    F({label:"ICKSP Kansas City · monthly practice (17–25)",url:"https://institute-christ-king.org/kansascity-home"})
  ])
});

export function monthlyInfantKingStatus(value){
  const date=value instanceof Date?value:new Date(String(value)+"T12:00:00");
  if(Number.isNaN(date.getTime()))throw new TypeError("Valid calendar date required");
  const year=date.getFullYear(),month=date.getMonth(),day=date.getDate();
  const from=(y,m,d)=>new Date(y,m,d,12);
  const shift=day>25?1:0,base=from(year,month+shift,17);
  const end=from(base.getFullYear(),base.getMonth(),25),active=day>=17&&day<=25;
  const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  const labelMonth=base.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  return F({kind:active?"active":"upcoming",day:active?day-16:1,
    label:(active?"Day "+(day-16)+" of 9":"Next monthly novena")+" · "+labelMonth+" · 17–25",
    w:F({start:base,end,feast:end}),
    window:F({start:fmt(base),end:fmt(end),feast:fmt(end)}),
    isLiturgicalFeast:false});
}
