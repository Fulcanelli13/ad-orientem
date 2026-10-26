/* In-place Calendar day-detail historical background. Not a new Calendar.
 * Open sources in a browser; only short, independently authored explanations
 * are displayed, with no copied ICRSP passages.
 */
import { calendarHistoricalNotes } from "./historical-context.js";
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
export function renderCalendarHistoricalContext(date,{fr=false}={}){
  const notes=calendarHistoricalNotes(date,{fr});
  if(!notes.length)return "";
  const L=(en,frText)=>fr?frText:en;
  return `<section class="aoCalHistoricalContext" data-cal-historical-date="${esc(date)}">
  <div class="aoCalV2SectionTitle"><div><small>${esc(L("HISTORICAL BACKGROUND · NOT A 1962 RUBRIC","HISTOIRE LITURGIQUE · NON UNE RUBRIQUE DE 1962"))}</small><h3>${esc(L("Understanding this day","Comprendre ce jour"))}</h3></div></div>
  <div class="aoCalHistoricalList">${notes.map(note=>`<details class="aoCalHistoricalCard" data-cal-historical-id="${esc(note.id)}">
    <summary>${esc(note.title)}</summary>
    <p>${esc(note.explanation)}</p>
    <div class="aoCalHistoricalSources"><small>${esc(L("Sources","Sources"))}</small>
      ${note.sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.label)}</a>`).join("")}
    </div>
  </details>`).join("")}</div></section>`;
}
