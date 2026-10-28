/**
 * Historical three-day Forty Hours companion.
 * This is a source-backed participant's *reference*, not a ceremonial book
 * or an authoritative timetable for any specific parish.
 * Public prayers/actions remain with the clergy and their local books.
 */
export const FORTY_HOURS_SOLEMN_SOURCE=Object.freeze({
 institute:"https://icksp.org.uk/institute/frequent-questions/",
 ceremonial:"https://www.newadvent.org/cathen/06151b.htm",
 status:"STRUCTURE_VERIFIED_PUBLIC_TEXTS_PENDING",
 edition:"ICKSP GB descriptive account; traditional Roman form with local variation"
});
const stage=(id,day,titleEn,titleFr,bodyEn,bodyFr,{conditional=false,kind="public"}={})=>
 Object.freeze({id,day,titleEn,titleFr,bodyEn,bodyFr,conditional,kind,
  source:FORTY_HOURS_SOLEMN_SOURCE.institute});
export const FORTY_HOURS_SOLEMN_STAGES=Object.freeze([
 stage("day1-arrival",1,"Opening observance","Ouverture des Quarante-Heures",
 "Determine which ceremonies your church is actually celebrating. The solemn form is commonly arranged across three days, not an app-controlled forty-hour timer.",
 "Vérifiez les cérémonies effectivement célébrées dans votre église. La forme solennelle s'étend habituellement sur trois jours ; l'application ne règle pas une durée de quarante heures.",{kind:"context"}),
 stage("day1-mass",1,"Opening votive Mass","Messe votive d'ouverture",
 "Where the complete solemn observance is celebrated, the clergy celebrate the opening votive Mass of the Blessed Sacrament. Follow the actual Mass and its proper texts, not private prayers shown as a substitute.", 
 "Lorsque la forme solennelle complète est célébrée, le clergé célèbre une messe votive d'ouverture du Saint-Sacrement. Suivez la messe réelle et ses textes propres, et non des prières privées en guise de remplacement.",{conditional:true}),
 stage("day1-rites",1,"Exposition, Litany and procession","Exposition, litanies et procession",
 "In the complete traditional form, exposition, the prescribed Litany of the Saints and a Eucharistic procession accompany the opening. Their order and ceremonial are governed by the actual books and clergy. Do not substitute a private Litany of Saints for this public rite.",
 "Dans la forme traditionnelle complète, l'exposition, les Litanies des saints prescrites et une procession eucharistique accompagnent l'ouverture. L'ordre et le cérémonial relèvent des livres et du clergé présents. Ne substituez pas les litanies privées au rite public.",{conditional:true}),
 stage("day1-adoration",1,"Adoration begins","L'adoration commence",
 "Remain before the Blessed Sacrament. If the church reposes the Sacrament overnight, follow its instructions; uninterrupted exposition must not be assumed.",
 "Demeurez devant le Saint-Sacrement. Si l'église procède à la reposition pendant la nuit, suivez ses instructions ; ne présumez pas une exposition ininterrompue.",{kind:"participant"}),
 stage("day2-peace",2,"Mass for Peace","Messe pour la paix",
 "The Institute describes a Mass for Peace on the intervening day of the solemn form. Attend if celebrated and follow the actual Mass readings and proper prayers.",
 "L'Institut décrit une messe pour la paix le jour intermédiaire de la forme solennelle. Participez-y si elle est célébrée, en suivant les lectures et prières propres de la messe.",{conditional:true}),
 stage("day2-vigil",2,"Continuing prayer and exposition","Prière et exposition poursuivies",
 "Follow the church's published hours and any reposition. Private prayer is optional, and silence is sufficient. Participate in public prayers only when they are actually led.",
 "Suivez les horaires affichés par l'église et toute reposition. La prière privée est facultative ; le silence suffit. Participez aux prières publiques seulement lorsqu'elles sont effectivement conduites.",{kind:"participant"}),
 stage("day3-mass",3,"Closing votive Mass","Messe votive de clôture",
 "Where celebrated in the complete form, the closing Mass of the Blessed Sacrament belongs to the clergy's public rite. Follow their order; do not invent a universal service time.",
 "Lorsqu'elle est célébrée dans la forme complète, la messe votive de clôture relève du culte public conduit par le clergé. Suivez son ordre ; n'inventez aucun horaire universel.",{conditional:true}),
 stage("day3-litany",3,"Closing Litany and procession","Litanies et procession de clôture",
 "The complete traditional closing observance includes litany and procession. Where omitted or arranged differently, follow the actual church; no ministerial action is assigned to the lay participant.",
 "La clôture traditionnelle complète comprend litanies et procession. Si elles sont omises ou organisées autrement, suivez l'église ; aucune action ministérielle n'est attribuée au fidèle.",{conditional:true}),
 stage("day3-benediction",3,"Final Benediction and Reposition","Bénédiction finale et reposition",
 "When Benediction begins, leave this historical navigator and follow the existing live Benediction reader. Receive the Eucharistic blessing without advancing screens; the clergy perform the blessing and reposition.",
 "Lorsque la Bénédiction commence, quittez ce parcours historique pour le lecteur de Bénédiction en direct. Recevez la bénédiction eucharistique sans avancer les cartes ; le clergé bénit et procède à la reposition.",{conditional:true})
]);
export function fortySolemnAt(index){return FORTY_HOURS_SOLEMN_STAGES[Math.max(0,Math.min(FORTY_HOURS_SOLEMN_STAGES.length-1,index|0))]}
