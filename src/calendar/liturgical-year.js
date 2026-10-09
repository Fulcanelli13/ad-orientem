const DAY_MS=86400000;

export const isoDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
export const dateFromIso=id=>new Date(`${id}T12:00:00`);
export const addDaysIso=(id,n)=>{const d=dateFromIso(id);d.setDate(d.getDate()+Number(n||0));return isoDate(d)};
const daysBetween=(a,b)=>Math.round((dateFromIso(b)-dateFromIso(a))/DAY_MS);

function sundayOnOrAfter(id){
  const d=dateFromIso(id),offset=(7-d.getDay())%7;d.setDate(d.getDate()+offset);return isoDate(d);
}
function sundayOnOrBefore(id){
  const d=dateFromIso(id);d.setDate(d.getDate()-d.getDay());return isoDate(d);
}
function gregorianEaster(year){
  const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31),day=((h+l-7*m+114)%31)+1;
  return isoDate(new Date(year,month-1,day,12));
}
function firstAdventSunday(year){
  return sundayOnOrAfter(`${year}-11-27`);
}
function lastSundayOfOctober(year){
  return sundayOnOrBefore(`${year}-10-31`);
}
function clamp01(x){return Math.max(0,Math.min(1,x))}
function period(id,en,fr,start,end,color,summaryEn,summaryFr){
  const days=daysBetween(start,end)+1;
  return Object.freeze({id,en,fr,start,end,days,color,summaryEn,summaryFr});
}
export function buildLiturgicalYear(selectedId){
  const selected=dateFromIso(selectedId),y=selected.getFullYear(),thisAdvent=firstAdventSunday(y);
  const start=selectedId>=thisAdvent?thisAdvent:firstAdventSunday(y-1),startYear=dateFromIso(start).getFullYear(),nextStart=firstAdventSunday(startYear+1),end=addDaysIso(nextStart,-1);
  const easter=gregorianEaster(startYear+1);
  const septuagesima=addDaysIso(easter,-63),ashWednesday=addDaysIso(easter,-46),passionSunday=addDaysIso(easter,-14),pentecost=addDaysIso(easter,49),afterPentecost=addDaysIso(easter,56);
  const periods=[
    period("advent","Advent","Avent",start,`${startYear}-12-24`,"violet","Preparation for the coming of Our Lord","Préparation à la venue de Notre-Seigneur"),
    period("christmas","Christmas","Noël",`${startYear}-12-25`,`${startYear+1}-01-05`,"white","The Nativity and its octave","La Nativité et son octave"),
    period("epiphany","Epiphany","Épiphanie",`${startYear+1}-01-06`,addDaysIso(septuagesima,-1),"green","The manifestation of Christ and the early Sundays of the year","Manifestation du Christ et premiers dimanches de l’année"),
    period("septuagesima","Septuagesima","Septuagésime",septuagesima,addDaysIso(ashWednesday,-1),"violet","Preparation for Lent","Préparation au Carême"),
    period("lent","Lent","Carême",ashWednesday,addDaysIso(passionSunday,-1),"violet","Penance and preparation for Easter","Pénitence et préparation à Pâques"),
    period("passion","Passiontide","Temps de la Passion",passionSunday,addDaysIso(easter,-1),"violet","The Passion and Holy Week","La Passion et la Semaine sainte"),
    period("easter","Eastertide","Temps pascal",easter,addDaysIso(pentecost,-1),"white","Resurrection and paschal joy","Résurrection et joie pascale"),
    period("pentecost","Pentecost and its octave","Pentecôte et son octave",pentecost,addDaysIso(afterPentecost,-1),"red","The coming of the Holy Ghost","Venue du Saint-Esprit"),
    period("after-pentecost","After Pentecost","Après la Pentecôte",afterPentecost,end,"green","The life of the Church until the return of Advent","Vie de l’Église jusqu’au retour de l’Avent"),
  ];
  const currentPeriod=periods.find(p=>selectedId>=p.start&&selectedId<=p.end)||periods[0];
  const totalDays=daysBetween(start,end)+1,dayIndex=daysBetween(start,selectedId)+1,elapsed=daysBetween(start,selectedId);
  const periodDayIndex=daysBetween(currentPeriod.start,selectedId)+1,periodElapsed=daysBetween(currentPeriod.start,selectedId);
  const nextPeriod=periods.find(p=>p.start>selectedId)||null;
  return Object.freeze({
    startYear,endYear:startYear+1,label:`${startYear}–${startYear+1}`,start,end,totalDays,dayIndex,
    progress:clamp01(dayIndex/totalDays),periods,currentPeriod,periodDayIndex,
    periodProgress:clamp01(periodDayIndex/currentPeriod.days),nextPeriod,easter,pentecost
  });
}
// The major-day overview is not an independent ordo. It must still respect
// explicitly defined 1960/1962 transfer rules, never imply every Marian
// feast stays at its nominal civil date. General Rubrics 1960, nn. 96(a–b).
export function annunciationObservanceDate(civilYear){
  const original=`${civilYear}-03-25`,easter=gregorianEaster(civilYear);
  const palm=addDaysIso(easter,-7),lowSunday=addDaysIso(easter,7);
  if(original>=palm&&original<=lowSunday)return addDaysIso(lowSunday,1);
  // A first-class Sunday of Lent/Passiontide takes precedence (rubric 96).
  if(dateFromIso(original).getDay()===0)return addDaysIso(original,1);
  return original;
}
// St Joseph (19 March) is a 1st-class feast. Under the 1960 General
// Rubrics nn. 15, 95-99, a Lenten Sunday / Holy Week / Easter octave
// takes precedence. Exception n. 96(a) reserves the Monday after Low
// Sunday for a transferred Annunciation, so Joseph follows on Tuesday.
// This is ONLY a candidate-date projection; Calendar must still resolve
// the observed Mass and its rank before displaying an upcoming feast.
export function saintJosephObservanceDate(civilYear){
  const original=`${civilYear}-03-19`,easter=gregorianEaster(civilYear);
  const palm=addDaysIso(easter,-7),lowSunday=addDaysIso(easter,7);
  if(original>=palm&&original<=lowSunday){
    const first=addDaysIso(lowSunday,1);
    return first===annunciationObservanceDate(civilYear)?addDaysIso(first,1):first;
  }
  if(dateFromIso(original).getDay()===0)return addDaysIso(original,1);
  return original;
}
export function allSoulsObservanceDate(civilYear){
  const original=`${civilYear}-11-02`;
  return dateFromIso(original).getDay()===0?addDaysIso(original,1):original;
}
function celebration(date,en,fr,kind="temporale",importance="major",transferredFrom=null){
  return {date,en,fr,kind,importance,...(transferredFrom&&transferredFrom!==date?{transferredFrom}: {})};
}
export function buildMajorCelebrations(selectedId){
  const year=buildLiturgicalYear(selectedId),y=year.startYear,easter=year.easter;
  const a1=year.start,a2=addDaysIso(a1,7),a3=addDaysIso(a1,14),a4=addDaysIso(a1,21);
  const sept=addDaysIso(easter,-63),ash=addDaysIso(easter,-46),lent1=addDaysIso(easter,-42),lent2=addDaysIso(easter,-35),lent3=addDaysIso(easter,-28),lent4=addDaysIso(easter,-21);
  const passion=addDaysIso(easter,-14),palm=addDaysIso(easter,-7),holyMon=addDaysIso(easter,-6),holyTue=addDaysIso(easter,-5),holyWed=addDaysIso(easter,-4),holyThu=addDaysIso(easter,-3),goodFri=addDaysIso(easter,-2),holySat=addDaysIso(easter,-1);
  const asc=addDaysIso(easter,39),pent=addDaysIso(easter,49),trinity=addDaysIso(easter,56),corpus=addDaysIso(easter,60),sacredHeart=addDaysIso(easter,68);
  const king=lastSundayOfOctober(y+1);
  const rows=[
    celebration(a1,"First Sunday of Advent","Premier dimanche de l’Avent","sunday"),
    celebration(a2,"Second Sunday of Advent","Deuxième dimanche de l’Avent","sunday"),
    celebration(`${y}-12-08`,"Immaculate Conception of the Blessed Virgin Mary","Immaculée Conception de la Sainte Vierge","sanctorale"),
    celebration(a3,"Third Sunday of Advent · Gaudete","Troisième dimanche de l’Avent · Gaudete","sunday"),
    celebration(a4,"Fourth Sunday of Advent","Quatrième dimanche de l’Avent","sunday"),
    celebration(`${y}-12-24`,"Vigil of the Nativity","Vigile de la Nativité"),
    celebration(`${y}-12-25`,"Nativity of Our Lord","Nativité de Notre-Seigneur"),
    celebration(`${y+1}-01-01`,"Octave of the Nativity · Circumcision of Our Lord","Octave de la Nativité · Circoncision de Notre-Seigneur"),
    celebration(`${y+1}-01-06`,"Epiphany of Our Lord","Épiphanie de Notre-Seigneur"),
    celebration(`${y+1}-02-02`,"Purification of the Blessed Virgin Mary · Candlemas","Purification de la Sainte Vierge · Chandeleur","sanctorale"),
    celebration(sept,"Septuagesima Sunday","Dimanche de la Septuagésime","sunday"),
    celebration(ash,"Ash Wednesday","Mercredi des Cendres"),
    celebration(lent1,"First Sunday of Lent","Premier dimanche de Carême","sunday"),
    celebration(lent2,"Second Sunday of Lent","Deuxième dimanche de Carême","sunday"),
    celebration(lent3,"Third Sunday of Lent","Troisième dimanche de Carême","sunday"),
    celebration(lent4,"Fourth Sunday of Lent · Laetare","Quatrième dimanche de Carême · Laetare","sunday"),
    celebration(saintJosephObservanceDate(y+1),"Saint Joseph, Spouse of the Blessed Virgin Mary","Saint Joseph, époux de la Sainte Vierge","sanctorale","major",`${y+1}-03-19`),
    celebration(passion,"Passion Sunday","Dimanche de la Passion","sunday"),
    celebration(annunciationObservanceDate(y+1),"Annunciation of the Blessed Virgin Mary","Annonciation de la Bienheureuse Vierge Marie","sanctorale","major",`${y+1}-03-25`),
    celebration(palm,"Palm Sunday","Dimanche des Rameaux","sunday"),
    celebration(holyMon,"Holy Monday","Lundi saint"),
    celebration(holyTue,"Holy Tuesday","Mardi saint"),
    celebration(holyWed,"Holy Wednesday","Mercredi saint"),
    celebration(holyThu,"Holy Thursday","Jeudi saint"),
    celebration(goodFri,"Good Friday","Vendredi saint"),
    celebration(holySat,"Holy Saturday · Easter Vigil","Samedi saint · Vigile pascale"),
    celebration(easter,"Easter Sunday","Dimanche de Pâques","sunday"),
    celebration(addDaysIso(easter,7),"Low Sunday","Dimanche in albis","sunday"),
    celebration(asc,"Ascension of Our Lord","Ascension de Notre-Seigneur"),
    celebration(pent,"Pentecost Sunday","Dimanche de la Pentecôte","sunday"),
    celebration(trinity,"Trinity Sunday","Dimanche de la Sainte-Trinité","sunday"),
    celebration(corpus,"Corpus Christi","Fête-Dieu"),
    celebration(sacredHeart,"Sacred Heart of Jesus","Sacré-Cœur de Jésus"),
    celebration(`${y+1}-06-24`,"Nativity of Saint John the Baptist","Nativité de saint Jean-Baptiste","sanctorale"),
    celebration(`${y+1}-06-29`,"Saints Peter and Paul","Saints Pierre et Paul","sanctorale"),
    celebration(`${y+1}-08-15`,"Assumption of the Blessed Virgin Mary","Assomption de la Sainte Vierge","sanctorale"),
    celebration(`${y+1}-09-29`,"Dedication of Saint Michael the Archangel","Dédicace de saint Michel Archange","sanctorale"),
    celebration(king,"Christ the King","Christ-Roi","sunday"),
    celebration(`${y+1}-11-01`,"All Saints","Toussaint","sanctorale"),
    celebration(allSoulsObservanceDate(y+1),"Commemoration of All the Faithful Departed","Commémoration de tous les fidèles défunts","sanctorale","major",`${y+1}-11-02`),
  ];
  return rows.filter(x=>x.date>=year.start&&x.date<=year.end).sort((a,b)=>a.date.localeCompare(b.date));
}
export function nextMajorCelebration(selectedId){
  // The selected liturgical year's final days must still lead into next Advent.
  // Build the adjacent liturgical year rather than returning a blank dashboard CTA.
  const current=buildMajorCelebrations(selectedId).find(x=>x.date>selectedId);
  if(current)return current;
  const adjacent=addDaysIso(buildLiturgicalYear(selectedId).end,1);
  return buildMajorCelebrations(adjacent).find(x=>x.date>selectedId)||null;
}
