
(()=>{
 const need=['ao-v133-communion-salience','ao-v134-pater-fraction-pax','ao-v135-offertory-incensation','ao-v137-preface-sanctus-canon','ao-v138-canon-preconsecration','ao-v139-canon-postconsecration','ao-v140-conclusion-arc'];
 const present=need.filter(id=>document.getElementById(id));
 window.AO_SALIENCE_AUDIT={version:'2.1',expected:need.length,present:present.length,missing:need.filter(id=>!document.getElementById(id)),bellCardExists:!!document.getElementById('bellCard'),scholaRailCardExists:!!document.getElementById('scholaRailCard'),prayerTextMotion:false};
})();
