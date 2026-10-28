/** Montfort B26 — source-faithful preparation architecture.
 * Montfort (True Devotion §§227–233) prescribes at least 12 days and then
 * three weeks. He does NOT author 33 separate fixed day readings. This
 * displays a 33-day *source-directed* programme without inventing texts.
 * English Faber 1863 consecration act is public-domain. Individual 1863
 * photographed-page collation is pending. No copyrighted 1987 text.
 */
export const MONTFORT_B26_SOURCE=Object.freeze({
 originalAuthor:"St Louis-Marie Grignion de Montfort",
 instructionWork:"True Devotion to the Blessed Virgin", instructionParagraphs:"§§227–233",
 translation:"Frederick William Faber, 1863, historical English edition",
 instructionsWitness:"https://www.ecatholic2000.com/montfort/true/devotion.shtml",
 originalActWitness:"https://1765regina.com/prayers/act-of-consecration-to-mary/",
 originalScanWitness:"https://nicaealibrary.com/works/montfort-true-devotion",
 rightsNotice:"The 1987 Montfort Missionaries English translation is copyrighted; it is not reproduced here.",
 excludedModernTranslation:"https://montfort.org.uk/Writings/TD.php",
 editionStatus:"FABER_1863_DIGITAL_WITNESS_ORIGINAL_PRINT_NOT_COLLATED",
 printedActImageCollated:false,
 montfortAuthoredDistinctDays:false,
 uniquePhaseCount:4,
 dailyReadingListAuthoredByMontfort:false,
 sourceLanguage:"en",
 latinHymnSource:"https://hymnary.org/text/ave_maris_stella"
});
export const MONTFORT_B26_PHASES=Object.freeze([
 Object.freeze({id:"spirit_world",first:1,last:12,
  titleEn:"Renounce the spirit of the world",titleFr:"Renoncer à l’esprit du monde",
  emphasisEn:"An initial period of at least twelve days, to renounce what is opposed to the spirit of Jesus Christ.",
  emphasisFr:"Au moins douze jours pour renoncer à ce qui s’oppose à l’esprit de Jésus-Christ.",
  sourceSection:"§227",dailyDirectionEn:"Examine what draws the heart away from Christ and make an act of renunciation. Montfort does not prescribe twelve separately authored readings.",
  dailyDirectionFr:"Examiner ce qui détourne le cœur du Christ et poser un acte de renoncement. Montfort ne fournit pas douze lectures quotidiennes distinctes.",
  sources:["§227"],canonicalIds:["sacrament_come_holy_spirit"]}),
 Object.freeze({id:"self",first:13,last:19,
  titleEn:"Knowledge of self",titleFr:"Connaissance de soi",
  emphasisEn:"Pray for self-knowledge, humility and contrition.",
  emphasisFr:"Demander la connaissance de soi, l’humilité et la contrition.",
  sourceSection:"§228",dailyDirectionEn:"Litany of the Holy Spirit with its prayer; Ave Maris Stella; Litany of the Blessed Virgin (Loreto). These are Montfort’s week-one directions, not a separately authored prayer for each day.",
  dailyDirectionFr:"Litanies du Saint-Esprit et oraison ; Ave Maris Stella ; litanies de la Sainte Vierge (Lorette). Ce sont les prescriptions de la première semaine, non des prières différentes chaque jour.",
  sources:["§228"],canonicalIds:["litany_loreto_1962"]}),
 Object.freeze({id:"mary",first:20,last:26,
  titleEn:"Knowledge of Mary",titleFr:"Connaissance de Marie",
  emphasisEn:"Seek to know the Blessed Virgin better through prayer and meditation.",
  emphasisFr:"Chercher à mieux connaître la Sainte Vierge par la prière et la méditation.",
  sourceSection:"§229",dailyDirectionEn:"Litany of the Holy Spirit, Ave Maris Stella, and at least five decades of the Rosary each day.",
  dailyDirectionFr:"Litanies du Saint-Esprit, Ave Maris Stella et au moins cinq dizaines du Rosaire chaque jour.",
  sources:["§229"],canonicalIds:[],ownRosary:true}),
 Object.freeze({id:"jesus",first:27,last:33,
  titleEn:"Knowledge of Jesus Christ",titleFr:"Connaissance de Jésus-Christ",
  emphasisEn:"Meditate on the Lord Jesus Christ and seek to know Him more intimately.",
  emphasisFr:"Méditer sur Notre-Seigneur Jésus-Christ et chercher à le connaître davantage.",
  sourceSection:"§230",dailyDirectionEn:"Litany of the Holy Spirit and Ave Maris Stella daily, adding the Litany of the Holy Name of Jesus. Montfort also recommends the prayer of St Augustine.",
  dailyDirectionFr:"Litanies du Saint-Esprit et Ave Maris Stella chaque jour, ainsi que les litanies du Saint Nom de Jésus. Montfort recommande aussi la prière de saint Augustin.",
  sources:["§230"],canonicalIds:[]})
]);
export const MONTFORT_B26_AVE_MARIS_LATIN=Object.freeze([
"Ave, maris stella,\nDei Mater alma,\nAtque semper Virgo,\nFelix caeli porta.",
"Sumens illud Ave\nGabrielis ore,\nFunda nos in pace,\nMutans Evae nomen.",
"Solve vincla reis,\nProfer lumen caecis,\nMala nostra pelle,\nBona cuncta posce.",
"Monstra te esse matrem,\nSumat per te preces\nQui pro nobis natus\nTulit esse tuus.",
"Virgo singularis,\nInter omnes mitis,\nNos culpis solutos\nMites fac et castos.",
"Vitam praesta puram,\nIter para tutum,\nUt videntes Jesum\nSemper collaetemur.",
"Sit laus Deo Patri,\nSummo Christo decus,\nSpiritui Sancto,\nTribus honor unus. Amen."
]);
export const MONTFORT_B26_CONSECRATION_ACT_EN=Object.freeze([
"O Eternal and Incarnate Wisdom! O sweetest and most Adorable Jesus! True God and True Man, only Son of the Eternal Father, and of Mary always Virgin! I adore Thee profoundly in the bosom and splendours of Thy Father during eternity; and I adore Thee also in the Virginal bosom of Mary, Thy most worthy Mother, in the time of Thine Incarnation.",
"I give Thee thanks for that Thou hast annihilated Thyself, in taking the form of a slave, in order to rescue me from the cruel slavery of the devil. I praise and glorify Thee for that Thou hast been pleased to submit Thyself to Mary, Thy holy Mother, in all things, in order to make me Thy faithful slave through her.",
"But, alas! ungrateful and faithless as I have been, I have not kept the promises which I made so solemnly to Thee in my Baptism; I have not fulfilled my obligations; I do not deserve to be called Thy son, nor yet Thy slave; and as there is nothing in me which does not merit Thine anger and Thy repulse, I dare no more come by myself before Thy Most Holy and August Majesty.",
"It is on this account that I have recourse to the intercession of Thy most holy Mother, whom Thou hast given me for a mediatrix with Thee. It is by her means that I hope to obtain of Thee contrition, and the pardon of my sins, the acquisition and the preservation of wisdom. I salute thee, then, O immaculate Mary, living tabernacle of the Divinity, where the Eternal Wisdom willed to be hidden, and to be adored by Angels and by men.",
"I hail thee, O Queen of heaven and earth, to whose empire everything is subject which is under God. I salute thee, O sure refuge of sinners, whose mercy fails to no one. Hear the desires which I have of the Divine Wisdom; and for that end receive the vows and offerings which my lowness presents to thee.",
"I, N., a faithless sinner—I renew and ratify today in thy hands the vows of my Baptism; I renounce for ever Satan, his pomps and works; and I give myself entirely to Jesus Christ, the Incarnate Wisdom, to carry my cross after Him all the days of my life, and to be more faithful to Him than I have ever been before.",
"In the presence of all the heavenly court I choose thee this day for my Mother and Mistress. I deliver and consecrate to thee, as thy slave, my body and soul, my goods, both interior and exterior, and even the value of all my good actions, past, present, and future; leaving to thee the entire and full right of disposing of me, and all that belongs to me, without exception, according to thy good pleasure, to the greatest glory of God, in time and in eternity.",
"Receive, O benignant Virgin, this little offering of my slavery, in the honour of, and in union with, that subjection which the Eternal Wisdom deigned to have to thy Maternity, in homage to the power which both of you have over this little worm and miserable sinner, and in thanksgiving for the privileges with which the Holy Trinity hath favoured thee. I protest that I wish henceforth, as thy true slave, to seek thy honour and to obey thee in all things.",
"O admirable Mother, present me to thy dear Son as His eternal slave, so that as He hath redeemed me by thee, by thee He may receive me. O Mother of mercy, get me the grace to obtain the true Wisdom of God; and for that end put me in the number of those whom thou lovest, whom thou teachest, whom thou conductest, and whom thou nourishest and protectest, as thy children and thy slaves.",
"O faithful Virgin, make me in all things so perfect a disciple, imitator, and slave of the Incarnate Wisdom, Jesus Christ thy Son, that I may attain, by thy intercession, and by thy example, to the fulness of His age on earth, and of His glory in the heavens. Amen."
]);
const DAY_MS=86400000;
const pad=n=>String(n).padStart(2,"0");
const validIso=x=>{if(typeof x!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+"T12:00:00Z");return Number.isFinite(d.valueOf())&&d.toISOString().slice(0,10)===x};
export function montfortAddDays(iso,delta){
 if(!validIso(iso)||!Number.isInteger(delta))return null;
 const d=new Date(iso+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10)
}
export function montfortTodayLocal(now=new Date()){
 return [now.getFullYear(),pad(now.getMonth()+1),pad(now.getDate())].join("-")
}
export function montfortNextFeast(from=montfortTodayLocal()){
 if(!validIso(from))return null;
 const y=Number(from.slice(0,4));const dates=[];
 for(let year=y;year<=y+2;year++)for(const [month,day,labelEn,labelFr] of [
 [3,25,"Annunciation","Annonciation"],
 [8,15,"Assumption","Assomption"],
 [9,8,"Nativity of Our Lady","Nativité de la Sainte Vierge"],
 [12,8,"Immaculate Conception","Immaculée Conception"]]){
  const iso=`${year}-${pad(month)}-${pad(day)}`;
  if(iso>=from)dates.push({date:iso,labelEn,labelFr,nominal1962Date:true});
 }
 dates.sort((a,b)=>a.date.localeCompare(b.date));
 return dates[0]||null;
}
export function montfortPhaseForDay(day){
 if(!Number.isInteger(day)||day<1||day>33)return null;
 return MONTFORT_B26_PHASES.find(x=>day>=x.first&&day<=x.last)||null;
}
export function montfortSchedule(target,reference=montfortTodayLocal()){
 if(!validIso(target)||!validIso(reference))return null;
 const start=montfortAddDays(target,-33),last=montfortAddDays(target,-1);
 const index=Math.min(34,Math.max(1,Math.round((Date.parse(reference+"T12:00:00Z")-Date.parse(start+"T12:00:00Z"))/DAY_MS)+1));
 return Object.freeze({
  target,start,lastPreparationDay:last,consecrationDay:target,phaseCounts:[12,7,7,7],
  dayIndex:index,inPreparation:reference>=start&&reference<target,
  onConsecrationDay:reference===target,daysBeforeStart:Math.max(0,Math.round((Date.parse(start+"T12:00:00Z")-Date.parse(reference+"T12:00:00Z"))/DAY_MS)),
  daysTotal:33,calendarDateForDay:n=>Number.isInteger(n)&&n>=1&&n<=34?montfortAddDays(start,n-1):null
 });
}
