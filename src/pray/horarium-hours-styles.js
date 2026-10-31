/**
 * Horarium — one visual family for the already source-owned Angelus,
 * Regina Cæli, Leonine prayers, daily rule and nightly examen.
 * Never supplies prayers, hour forecasts, seasonal decisions, edition
 * selection or devotional completion.
 */
export const HORARIUM_HOURS_STYLES=String.raw`
#aoPray435930 [data-ao-hours-family]{
  --ao-hours-rule:var(--liturgical-border,rgba(213,181,126,.35));
  --ao-hours-tint:var(--liturgical-soft,rgba(215,190,145,.08));
  min-width:0;
}
#aoPray435930 [data-ao-hours-family] .aoHoursBellLine{
  max-width:610px;margin:3px auto 11px;padding:9px 10px 12px;
  border-bottom:1px solid var(--ao-hours-rule);
  color:var(--muted,#c3b9ad);text-align:center;
  font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.17em;font-variant-numeric:tabular-nums;
}
#aoPray435930 [data-ao-hours-family] .aoHoursBellLine span{
  color:var(--liturgical,#c7ae6d);font-size:.8em;padding-inline:10px;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardHead{
  border-bottom:1px solid var(--ao-hours-rule);
  padding-bottom:16px;margin-bottom:5px;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardTitle{
  font:500 clamp(24px,5.8vw,32px)/1.26 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardLatin{
  color:var(--muted,#b8ae9e);font-style:italic;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardScroll{
  gap:clamp(16px,3vh,26px)!important;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardScroll .aoAngelusDialogueLine:not(:has(> .ao-liturgical-speaker)){
  grid-template-columns:minmax(0,1fr)!important;
  padding-block:9px!important;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardScroll .aoAngelusDialogueLine:not(:has(> .ao-liturgical-speaker))>span{
  grid-column:1!important;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoDevoCardScroll .aoAngelusDialogueLine.aoHoursCollective{
  margin-left:clamp(8px,3vw,18px)!important;
  padding:12px 10px 12px 15px!important;
  border-left:2px solid var(--ao-hours-rule)!important;
  background:var(--ao-hours-tint)!important;
  border-radius:0 7px 7px 0;
}
#aoPray435930 [data-ao-hours-family="ritual"] .aoHoursCollective[data-ao-devo-active="true"]{
  border-left-color:var(--liturgical,#d8bd7d)!important;
  opacity:1!important;color:var(--text,#f1e7d7);
}
#aoPray435930 [data-ao-hours-family="rule"] .aoTP381GuideCard,
#aoPray435930 [data-ao-hours-family="examen"] .aoTP381GuideCard{
  max-width:620px;margin-inline:auto;gap:clamp(15px,2.7vh,23px);
}
#aoPray435930 [data-ao-hours-family="rule"] .aoTP381GuideCard>h2,
#aoPray435930 [data-ao-hours-family="examen"] .aoTP381GuideCard>h2{
  font:500 clamp(25px,5.8vw,33px)/1.28 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 [data-ao-hours-family="rule"] .aoDevoCardScroll .aoTP381TextParagraph,
#aoPray435930 [data-ao-hours-family="examen"] .aoDevoCardScroll .aoTP381TextParagraph{
  margin-bottom:clamp(18px,3.5vh,27px);
  line-height:1.72;
}
#aoPray435930 [data-ao-hours-family="rule"] .aoDevoParagraph,
#aoPray435930 [data-ao-hours-family="examen"] .aoDevoParagraph{
  transition:opacity .22s ease;
}
#aoPray435930 .aoP435930HoursLeonine .aoP435930PrayerHead{
  padding-bottom:15px;margin-bottom:13px;
  border-bottom:1px solid var(--ao-hours-rule,var(--liturgical-border,rgba(213,181,126,.35)));
}
#aoPray435930 .aoP435930HoursLeonine .aoP435930PrayerHead{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineLang{
  min-height:44px;min-width:62px;padding:9px 12px;
  border:1px solid var(--liturgical-border,rgba(213,181,126,.35));
  border-radius:7px;background:transparent;color:var(--liturgical,#d8bd7d);
  font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineLang:focus-visible{
  outline:2px solid var(--liturgical,#d8bd7d);outline-offset:2px;
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineFaces [hidden]{display:none!important}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineSection{
  max-width:58ch;margin:0 auto 25px;padding:0 0 18px;
  border-bottom:1px solid var(--liturgical-border,rgba(213,181,126,.15));
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineSection h4{
  margin:0 0 16px;color:var(--liturgical,#d8bd7d);
  font:600 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.065em;
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineParagraph{
  display:block;margin:0 0 clamp(18px,3.5vh,28px);
  font:400 clamp(18px,4.6vw,22px)/1.72 var(--ao-font-liturgical,Georgia,serif);
  color:var(--text,#f1e7d7);
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineParagraph.aoHoursLeonineVerse{
  padding-left:clamp(10px,3vw,20px);
}
#aoPray435930 .aoP435930HoursLeonine .aoHoursLeonineParagraph.aoHoursLeonineResponse{
  padding:9px 11px;margin-left:clamp(9px,3vw,18px);
  border-left:2px solid var(--liturgical-border,rgba(213,181,126,.35));
  background:var(--liturgical-soft,rgba(213,181,126,.08));
}
#aoPray435930 [data-ao-hours-family="examen"] .aoTP381GuideCard>p{
  font:400 clamp(18px,4.5vw,22px)/1.75 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 [data-ao-hours-family="examen"] .aoTP381Source{
  margin-top:15px;
}
@media(max-width:359px){
 #aoPray435930 [data-ao-hours-family="ritual"] .aoHoursBellLine{padding:6px 4px 8px}
 #aoPray435930 [data-ao-hours-family="rule"] .aoTP381GuideCard,
 #aoPray435930 [data-ao-hours-family="examen"] .aoTP381GuideCard{padding-inline:12px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 [data-ao-hours-family] .aoDevoParagraph{transition:none!important}
}
`;
export function installHorariumStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-horarium-hours-style"))return true;
 const style=doc.createElement("style");
 style.id="ao-horarium-hours-style";
 style.textContent=HORARIUM_HOURS_STYLES;
 doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installHorariumStyles(document);
