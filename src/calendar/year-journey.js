export const SEASON_GUIDE=Object.freeze({
  advent:{focus:["Vigilance and preparation","Veille et préparation"],meaning:["Four Sundays of waiting for the coming of Our Lord; violet is the normal seasonal colour.","Quatre dimanches d’attente de la venue de Notre-Seigneur ; le violet est la couleur habituelle."],highlights:["Advent Sundays · Gaudete","Dimanches de l’Avent · Gaudete"]},
  christmas:{focus:["The Word made flesh","Le Verbe fait chair"],meaning:["The Nativity and its octave celebrate the Incarnation until the days before Epiphany.","La Nativité et son octave célèbrent l’Incarnation jusqu’aux jours précédant l’Épiphanie."],highlights:["Christmas · Octave of the Nativity","Noël · Octave de la Nativité"]},
  epiphany:{focus:["Christ manifested","Le Christ manifesté"],meaning:["Epiphany and its following Sundays contemplate Our Lord made known to the nations.","L’Épiphanie et ses dimanches contemplent Notre-Seigneur manifesté aux nations."],highlights:["Epiphany · Sundays after Epiphany","Épiphanie · dimanches après l’Épiphanie"]},
  septuagesima:{focus:["Preparing for Lent","Préparation au Carême"],meaning:["Three pre-Lenten Sundays prepare the faithful for penance; violet returns and the Alleluia is omitted.","Trois dimanches avant le Carême préparent à la pénitence ; le violet revient et l’Alléluia disparaît."],highlights:["Septuagesima · Sexagesima · Quinquagesima","Septuagésime · Sexagésime · Quinquagésime"]},
  lent:{focus:["Conversion and penance","Conversion et pénitence"],meaning:["From Ash Wednesday to Passion Sunday, prayer, fasting and conversion shape the season.","Des Cendres à la Passion, la prière, le jeûne et la conversion caractérisent le temps."],highlights:["Ash Wednesday · Sundays of Lent · Laetare","Mercredi des Cendres · dimanches de Carême · Laetare"]},
  passion:{focus:["The mystery of the Cross","Le mystère de la Croix"],meaning:["Passion Sunday leads to Palm Sunday and Holy Week; the Triduum has distinctive rites and Mass colours.","La Passion mène aux Rameaux et à la Semaine sainte ; le Triduum possède ses rites et ses couleurs propres."],highlights:["Passion Sunday · Palm Sunday · Sacred Triduum","Dimanche de la Passion · Rameaux · Triduum sacré"]},
  easter:{focus:["Resurrection and new life","Résurrection et vie nouvelle"],meaning:["Eastertide rejoices in the Resurrection and Ascension of the Lord, looking towards Pentecost.","Le temps pascal célèbre la Résurrection et l’Ascension du Seigneur, dans l’attente de la Pentecôte."],highlights:["Easter · Low Sunday · Ascension","Pâques · dimanche in albis · Ascension"]},
  pentecost:{focus:["The Holy Ghost","Le Saint-Esprit"],meaning:["Pentecost and its octave honour the descent of the Holy Ghost upon the Church.","La Pentecôte et son octave célèbrent la descente du Saint-Esprit sur l’Église."],highlights:["Pentecost · its octave","Pentecôte · son octave"]},
  "after-pentecost":{focus:["The life of the Church","La vie de l’Église"],meaning:["From Trinity Sunday until Advent, green characterizes ordinary Sundays but not every day's Mass.","De la Trinité à l’Avent, le vert caractérise les dimanches ordinaires, mais pas toutes les messes."],highlights:["Trinity · Corpus Christi · Christ the King","Trinité · Fête-Dieu · Christ-Roi"]}
});
const COLOR=Object.freeze({violet:"#756284",white:"#d9d0b8",green:"#5d7d65",red:"#9e5149"});
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
export function yearSegmentGeometry(year){
  if(!year?.totalDays||!Array.isArray(year.periods))return [];
  let elapsed=0;
  return year.periods.map(p=>{
    const startPercent=100*elapsed/year.totalDays;
    elapsed+=p.days;
    return {...p,startPercent,widthPercent:100*p.days/year.totalDays,endPercent:100*elapsed/year.totalDays};
  });
}
export function renderYearJourney({year,selectedDate,focusedPeriodId,fr=false,formatDate=id=>id}={}){
 if(!year)return "";
 const L=(en,frText)=>fr?frText:en,lang=v=>v?.[fr?1:0]||"";
 const segments=yearSegmentGeometry(year),focus=segments.some(p=>p.id===focusedPeriodId)?focusedPeriodId:year.currentPeriod.id;
 const current=year.currentPeriod.id,marker=(year.dayIndex-.5)*100/year.totalDays;
 const cards=segments.map((p,i)=>{
   const data=SEASON_GUIDE[p.id]||{},expanded=focus===p.id;
   const stage=selectedDate>p.end?"past":selectedDate<p.start?"future":"present";
   return `<article class="aoCalYearSeason ${expanded?"expanded":""}" data-cal-year-id="${esc(p.id)}" data-cal-year-stage="${stage}" style="--season-color:${COLOR[p.color]||"#8c8073"}">
    <button type="button" class="aoCalYearSeasonButton" data-cal-year-period="${esc(p.id)}" aria-expanded="${expanded}" aria-controls="ao-cal-period-${esc(p.id)}">
     <span class="aoCalYearIndex">${String(i+1).padStart(2,"0")}</span>
     <span class="aoCalYearCardName"><strong>${esc(fr?p.fr:p.en)}</strong><small>${esc(formatDate(p.start))} – ${esc(formatDate(p.end))} · ${p.days} ${esc(L("days","jours"))}</small></span>
     <span class="aoCalYearState">${esc(p.id===current?L("YOU ARE HERE","VOUS ÊTES ICI"):stage==="past"?L("PAST","PASSÉ"):L("COMING","À VENIR"))}</span>
     <span class="aoCalYearPlus" aria-hidden="true">${expanded?"−":"+"}</span>
    </button>
    <div class="aoCalYearDetail" id="ao-cal-period-${esc(p.id)}" ${expanded?"":"hidden"}>
     <strong>${esc(lang(data.focus))}</strong><p>${esc(lang(data.meaning)|| (fr?p.summaryFr:p.summaryEn))}</p>
     <div class="aoCalYearHighlights"><small>${esc(L("TYPICAL CELEBRATIONS","CÉLÉBRATIONS CARACTÉRISTIQUES"))}</small><span>${esc(lang(data.highlights))}</span></div>
     <div class="aoCalYearActions">
      <button type="button" data-cal-year-open-day="${esc(p.start)}">${esc(L("Open first day","Ouvrir le premier jour"))} →</button>
      <button type="button" data-cal-year-month="${esc(p.start.slice(0,7))}">${esc(L("Browse month","Parcourir le mois"))} →</button>
     </div>
    </div>
   </article>`;
 }).join("");
 return `<section class="aoCalYearTimeline" aria-label="${esc(L("Year-long seasonal timeline","Frise des temps liturgiques"))}">
   <div class="aoCalYearHeading"><div><small>${esc(L("THE WHOLE YEAR","L’ANNÉE D’UN SEUL REGARD"))}</small><h3>${esc(L("The rhythm of the liturgical year","Le rythme de l’année liturgique"))}</h3></div><span>${esc(formatDate(year.start))} – ${esc(formatDate(year.end))}</span></div>
   <div class="aoCalYearTrackWrap"><div class="aoCalYearTrack" role="img" aria-label="${esc(L("Nine segments proportional to their actual number of days","Neuf segments proportionnels à leur durée réelle"))}">
    ${segments.map(p=>`<span class="aoCalYearSegment ${p.id===current?"current":""}" data-cal-year-segment="${esc(p.id)}" style="width:${p.widthPercent.toFixed(6)}%;background:${COLOR[p.color]||"#8c8073"}"></span>`).join("")}
   </div><span class="aoCalYearMarker" style="left:${marker.toFixed(6)}%" aria-hidden="true"><i></i></span></div>
   <div class="aoCalYearTrackCaption"><span>${esc(L("Advent","Avent"))}</span><strong>${esc(L("Selected day","Jour consulté"))}: ${esc(formatDate(selectedDate))}</strong><span>${esc(L("Before Advent","Avant l’Avent"))}</span></div>
   <p class="aoCalYearNote">${esc(L("The timeline colours describe seasons, not the colour of each Mass. Feast transfers, ranks and daily colours come from the resolved 1962 Calendar.","La frise montre les couleurs des temps, non de chaque messe. Les transferts, classes et couleurs quotidiennes viennent du calendrier 1962 résolu."))}</p>
  </section>
  <section class="aoCalYearJourney" aria-label="${esc(L("Nine liturgical periods","Les neuf temps liturgiques"))}">
   <div class="aoCalYearHeading"><div><small>${esc(L("THE PATH OF THE YEAR","LE CHEMIN DE L’ANNÉE"))}</small><h3>${esc(L("Explore the nine periods","Explorer les neuf temps"))}</h3></div><span>${esc(L("Select a period for its meaning and dates","Choisir un temps pour sa signification et ses dates"))}</span></div>
   <div class="aoCalYearGrid">${cards}</div>
  </section>`;
}
export const yearJourneyCss=`
.aoCalYearTimeline,.aoCalYearJourney{margin:22px 0 24px;padding:20px 0 0;border-top:1px solid rgba(235,225,208,.13)}
.aoCalYearHeading{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:18px}
.aoCalYearHeading small{display:block;margin-bottom:8px;color:#aba398;font:650 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em}
.aoCalYearHeading h3{font-size:24px;font-weight:400;margin:0;line-height:1.22}
.aoCalYearHeading>span{font:500 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#abb0ac;text-align:right}
.aoCalYearTrackWrap{position:relative;margin:28px 1px 9px}
.aoCalYearTrack{width:100%;height:60px;display:flex;overflow:hidden;outline:1px solid rgba(235,225,208,.23);border-radius:3px;background:#131820}
.aoCalYearSegment{flex:none;min-width:0;height:100%;border-right:1px solid rgba(8,12,18,.45)}
.aoCalYearSegment.current{box-shadow:inset 0 0 0 2px rgba(247,235,210,.8)}
.aoCalYearMarker{position:absolute;z-index:1;top:-15px;bottom:-8px;width:2px;background:#e9ddc4;transform:translateX(-50%)}
.aoCalYearMarker i{position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:11px;height:11px;border-radius:50%;background:#e9ddc4;box-shadow:0 0 0 3px #0b1118}
.aoCalYearTrackCaption{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;color:#a9a99f;font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalYearTrackCaption strong{color:#e7dcc8;font-weight:600}.aoCalYearTrackCaption span:last-child{text-align:right}
.aoCalYearNote{font-size:15px;line-height:1.5;color:#bcb8af;margin:14px 0 0}
.aoCalYearGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.aoCalYearSeason{align-self:start;min-width:0;background:#10161e;border:1px solid rgba(235,225,208,.13);border-top:3px solid var(--season-color);border-radius:8px;overflow:hidden}
.aoCalYearSeason[data-cal-year-stage="past"]{opacity:.78}.aoCalYearSeason.expanded{opacity:1;border-color:rgba(235,225,208,.27);border-top-color:var(--season-color)}
.aoCalYearSeasonButton{display:flex!important;align-items:start;gap:9px;width:100%;min-height:100px!important;padding:14px!important;text-align:left!important;background:transparent!important;border:0!important;border-radius:0!important;color:#e9e4d9!important}
.aoCalYearSeasonButton:focus-visible,.aoCalYearActions button:focus-visible{outline:2px solid #e6d5b6!important;outline-offset:-3px!important}
.aoCalYearIndex{font:600 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--season-color)}
.aoCalYearCardName{flex:1;min-width:0}.aoCalYearCardName strong{display:block;font-size:18px;line-height:1.2;font-weight:500;overflow-wrap:anywhere}
.aoCalYearCardName small{display:block;margin-top:9px;color:#b6afa2;font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalYearState{max-width:60px;text-align:right;color:#aeb3a8;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.025em}
.aoCalYearPlus{font:500 19px/1 var(--ao-font-ui,system-ui,sans-serif);color:#d9ceb9}
.aoCalYearDetail[hidden]{display:none!important}.aoCalYearDetail{padding:0 17px 17px}
.aoCalYearDetail>strong{display:block;color:#e4d9c5;font:600 14px/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoCalYearDetail p{font-size:16px;line-height:1.5;color:#d4d0c4;margin:11px 0}
.aoCalYearHighlights{border-top:1px solid rgba(235,225,208,.12);padding:12px 0;display:grid;gap:7px}
.aoCalYearHighlights small{font:700 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.05em;color:#a6aea6}
.aoCalYearHighlights span{font-size:15px;color:#d8cbbb;line-height:1.4}
.aoCalYearActions{display:flex;flex-wrap:wrap;gap:7px}
.aoCalYearActions button{min-height:44px!important;flex:1 1 120px;border-radius:7px!important;background:#17212a!important;color:#eee2cb!important;font:600 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);text-align:left!important}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalModBody{padding-bottom:max(126px,calc(78px + var(--safe-bottom,0px)))}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2YearHeroGrid{padding:18px 22px;gap:24px}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2Ring{width:min(230px,46vw)}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2YearIdentity h3{font-size:28px}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2SelectedFeast{font-size:17px;margin-bottom:12px}
@media(max-width:800px){.aoCalYearGrid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){
.aoCalYearHeading{display:grid;gap:7px}.aoCalYearHeading h3{font-size:22px}.aoCalYearHeading>span{text-align:left}
.aoCalYearGrid{grid-template-columns:1fr}.aoCalYearTimeline,.aoCalYearJourney{margin:16px 0 20px}
.aoCalYearTrack{height:52px}.aoCalYearTrackCaption{grid-template-columns:1fr auto;gap:6px}.aoCalYearTrackCaption span:last-child{display:none}
.aoCalYearSeasonButton{min-height:76px!important}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2YearHeroGrid{padding:18px 15px}
#ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalV2Ring{width:min(230px,70vw)}
}
`;
