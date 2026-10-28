// Distinct Institute-selected 9-day repeat prayer, not Moran's nine day-specific Immaculate novena.
// English: Blessed Be God (Callan/McHugh, 1925), Prayer to Our Lady Immaculate, Dec.
// French: Les Echos de Saint-Maurice (Dec. 1903), "Prière de Pie X", pp. 388–389.
// The EARLY French includes its original Jubilee clause. The later ICRSP
// communal form omits that time-specific clause; it is linked, not backfilled.
// Source prayer attributed to St Pius X; the two historical editions are
// distinct witnesses, NOT line-by-line interchangeable translations.
// Litany of Loreto, three invocations and parish Benediction are local/optional,
// not mandatory steps; no invention of nine day-specific prayers or Latin text.
const F=Object.freeze;
const bi=(en,fr)=>F({en,fr});
export const ICKSP_IMMACULATE_CONCEPTION_NOVENA_V1=F({
  id:"icksp_immaculate_conception",
  instituteSourceId:"icksp_us_novena_immaculate_conception",
  title:bi("Immaculate Conception · Institute Novena","Immaculée Conception · Neuvaine de l’Institut"),
  family:bi("Immaculate Conception · Pius X prayer","Immaculée Conception · prière de Pie X"),
  feast:bi("8 December · Immaculate Conception (1962 Roman calendar)","8 décembre · Immaculée Conception (calendrier romain de 1962)"),
  form:"REPEAT_FORM",
  pattern:"SOURCE_REPEAT_ONLY",
  calendar:F({type:"FIXED_ANNUAL_NOVENA",startMonth:11,startDay:30,endMonth:12,endDay:8,feastMonth:12,feastDay:8,precision:"ICKSP_INCLUSIVE_FEAST_DAY_30_NOV_8_DEC"}),
  startKind:"TRADITIONAL_START",
  traditionalStart:bi("30 November–8 December · Institute communal observance","30 novembre–8 décembre · observance communautaire de l’Institut"),
  frenchTextStatus:"TRADITIONAL_FRENCH_WITNESS_1903_PERIOD_SPECIFIC",
  history:bi(
    "The Institute uses a single prayer associated with Pope St Pius X for nine days ending on 8 December. The pre-1905 French witness is printed in December 1903; the 1925 English Catholic prayer-book witness presents a later recension. These historical texts differ from the Institute's modern standardized recital. Moran's separate nine day-specific Marian novena remains unchanged.",
    "L’Institut récite pendant neuf jours une prière de saint Pie X, jusqu’au 8 décembre inclus. Le témoin français de décembre 1903 mentionne explicitement le jubilé de la définition de 1854 ; cette clause historique ne figure pas dans la récitation actuelle de l’ICRSP. Le témoin anglais de 1925 est une autre recension. La neuvaine distincte de Moran, avec neuf prières propres, demeure inchangée."),
  meaning:bi("Prepare for the Immaculate Conception by entrusting the Church and the faithful to the protection of Our Lady.","Se préparer à l’Immaculée Conception en confiant l’Église et les fidèles à la protection de la Sainte Vierge."),
  how:bi("Recite this same historical prayer on each of nine days. The Institute's communal observance includes the feast itself (30 November–8 December); the existing 29 November–7 December preparatory novena is a separate choice. A Marian litany or repeated invocation may be added according to local usage, but is not required by this historical source.","Récitez la même prière historique pendant neuf jours. L’observance communautaire de l’Institut comprend le jour de la fête (du 30 novembre au 8 décembre) ; la neuvaine préparatoire existante du 29 novembre au 7 décembre reste une autre forme. Les litanies mariales ou les invocations peuvent être ajoutées selon l’usage local, sans être imposées par ce témoin."),
  commonNote:bi("This is the one repeated prayer of Pius X, not nine invented daily texts. The 1903 French preserves the historically dated Jubilee clause.","Une seule prière de Pie X est répétée, non neuf textes différents. Le français de 1903 conserve la mention du jubilé propre à son époque."),
  commonPrayers:F([]),
  repeatText:bi("Most holy Virgin, who wast pleasing to the Lord and became His Mother, immaculate in body and spirit, in faith and in love, look kindly on the wretched who implore thy powerful patronage.\n\nThe wicked serpent, against whom was hurled the first curse, continues fiercely to attack and ensnare the unhappy children of Eve.\n\nDo thou, then, O Blessed Mother, our queen and advocate, who from the first instant of thy conception didst crush the head of the enemy, receive the prayers which, united with thee in our single heart, we implore thee to present at the throne of God, that we may never fall into the snares which are laid out for us, and may all arrive at the port of salvation; and, in so many dangers, may the Church and Christian society sing once again the hymn of deliverance and of victory and of peace. Amen.","Vierge très sainte qui avez plu au Seigneur et êtes devenue sa mère, Vierge immaculée dans votre corps, dans votre âme, dans votre foi et dans votre amour, en ce solennel jubilé de la promulgation du dogme qui vous proclama, devant l'univers entier, conçue sans péché, regardez avec bienveillance les malheureux qui implorent votre puissante protection.\n\nLe serpent infernal, contre lequel fut jetée la première malédiction, continue, hélas ! à combattre et à tenter les pauvres fils d'Eve. Ah ! vous, ô notre Mère bénie, notre Reine et notre Avocate, vous qui avez écrasé la tête de l'ennemi dès le premier instant de votre conception, accueillez nos prières, et, — nous vous en conjurons, unis à vous en un seul cœur, — présentez-les devant le trône de Dieu, afin que nous ne nous laissions jamais prendre aux embûches qui nous sont tendues, mais que nous arrivions tous au port du salut, et qu'au milieu de tant de périls, l'Eglise et la société chrétienne, chantent encore une fois l'hymne de la délivrance, de la victoire et de la paix. Ainsi soit-il !"),
  days:F(Array.from({length:9},(_,i)=>F({
    theme:bi("Day "+(i+1)+" · Prayer of Pius X","Jour "+(i+1)+" · Prière de Pie X"),
    guide:bi("Recollect yourself and pray the same historical text; no separate day prayer is attested.","Recueillez-vous et récitez la même prière historique ; aucun texte propre à ce jour n’est attesté.")
  }))),
  source:F({
    work:"Prayer to Our Lady Immaculate · Pope Pius X / Prière de Pie X",
    authors:"St Pius X · original devotional prayer as credited by 1903 periodical",
    edition:"EN: Blessed Be God, 1925. FR: Les Echos de Saint-Maurice, December 1903, pp. 388–389; FR includes original Jubilee clause",
    url:"https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Devotions_For_The_Months_Of_The_Year",
    adaptation:"Original historical English and period-specific French kept separately; Institute 2016/2020 standardized shortened forms are comparative links, not copied as modern translations. No additional day-specific prayers or contemporary indulgence claims."
  }),
  historySources:F([
    F({label:"ICKSP UK · communal novena 30 Nov–8 Dec",url:"https://icksp.org.uk/blog/novena-to-the-immaculate-conception/"}),
    F({label:"ICKSP US · Immaculate Conception novena, 2020",url:"https://institute-christ-king.org/news/1017-immaculate-conception-novena-tota-pulchra-es-o-maria"}),
    F({label:"ICRSP Toulouse · French communal recital, 2016",url:"https://icrsp-toulouse.fr/index.php/in-christo/neuvaines/290-neuvaine-preparatoire-a-l-immaculee-conception"}),
    F({label:"Blessed Be God · English prayer, 1925",url:"https://en.wikisource.org/wiki/Blessed_be_God_(Callan)/Devotions_For_The_Months_Of_The_Year"}),
    F({label:"Les Echos de Saint-Maurice · original French, December 1903, pp. 388–389",url:"https://www.digi-archives.org/pages/echos/ESM005135.pdf"})
  ])
});
export function annualInstituteImmaculateStatus(value){
  const date=value instanceof Date?new Date(value.getFullYear(),value.getMonth(),value.getDate(),12):new Date(String(value).slice(0,10)+"T12:00:00");
  if(Number.isNaN(date.getTime()))throw new TypeError("Valid calendar date required");
  let y=date.getFullYear();
  const from=(yy,m,d)=>new Date(yy,m,d,12);
  const fmt=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  if(date>from(y,11,8))y++;
  const start=from(y,10,30),end=from(y,11,8);
  const active=date>=start&&date<=end;
  const day=active?Math.round((Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())-Date.UTC(y,10,30))/86400000)+1:1;
  return F({kind:active?"active":"upcoming",day,
    label:(active?"Day "+day+" of 9":"Next Institute novena")+" · 30 Nov–8 Dec "+y,
    w:F({start,end,feast:end}),window:F({start:fmt(start),end:fmt(end),feast:fmt(end)}),
    isLiturgicalFeast:false,feastOnLastDay:true});
}
