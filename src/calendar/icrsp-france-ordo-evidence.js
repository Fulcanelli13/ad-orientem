// Source-attested particular Ordo, NEVER a replacement for the general 1962
// calendar, never an automatic selection of an alternate/votive Proper.
// ICRSP/ICKSP France's published Ordo describes what its priests celebrate.
// Snapshot dates are reviewed individually; no unsupported extrapolation
// to other Fridays, local chapels, institutes or future civil years.
export const ICRSP_FRANCE_ORDO_SOURCE="https://icrspfrance.fr/ordo.php";
const SOURCE_SCOPE="ICRSP_FRANCE_PARTICULAR_ORDO";
const sourceDate=date=>ICRSP_FRANCE_ORDO_SOURCE+"?d="+date+"#j"+date;
const sourceTexts=date=>"https://icrspfrance.fr/textes-de-la-messe.php?d="+date;
const records=Object.freeze({
 "2026-11-06":Object.freeze({
  date:"2026-11-06",scope:SOURCE_SCOPE,status:"SOURCE_ATTESTED",confidence:"DIRECT_INSTITUTE_ORDO",
  office:Object.freeze({name:{en:"Feria",fr:"Férie"},class:4,colour:"GREEN"}),
  mass:Object.freeze({
   kind:"VOTIVE",title:{en:"Votive Mass of the Sacred Heart of Jesus",fr:"Messe votive du Sacré-Cœur de Jésus"},
   introit:"Cogitationes",class:3,colour:"WHITE",gloria:true,credo:false,
   prayerForPope:true,preface:{en:"Sacred Heart",fr:"Sacré-Cœur"},
   epistle:"Ephesians 3:8–19",gospel:"John 19:31–37",
   // This is evidence for the Institute's stated Mass, not independent
   // rubrical permission for other locations or communities.
   selectionPermission:"INSTITUTE_PUBLIC_ORIGINAL_ORDO_ONLY"
  }),
  observances:Object.freeze(["FIRST_FRIDAY","FRIDAY_ABSTINENCE"]),
  sourceOrdo:sourceDate("2026-11-06"),sourceTexts:sourceTexts("2026-11-06"),
 }),
 "2026-11-07":Object.freeze({
  date:"2026-11-07",scope:SOURCE_SCOPE,status:"SOURCE_ATTESTED",confidence:"DIRECT_INSTITUTE_ORDO",
  office:Object.freeze({name:{en:"Our Lady on Saturday",fr:"De la Très Sainte Vierge au samedi"},class:4,colour:"WHITE"}),
  mass:Object.freeze({
   kind:"VOTIVE",title:{en:"Votive Mass of the Immaculate Heart of Mary",fr:"Messe votive du Cœur Immaculé de Marie"},
   introit:"Adeamus",class:3,colour:"WHITE",gloria:true,credo:false,
   prayerForPope:true,preface:{en:"Blessed Virgin Mary",fr:"Très Sainte Vierge"},
   epistle:null,gospel:null,selectionPermission:"INSTITUTE_PUBLIC_ORIGINAL_ORDO_ONLY"
  }),
  observances:Object.freeze(["FIRST_SATURDAY"]),
  sourceOrdo:sourceDate("2026-11-07"),sourceTexts:sourceTexts("2026-11-07")
 })
});
export function icrspFranceOrdoForDate(date){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date??"")))return null;
 return records[date]??null;
}
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[c]));
export const ICRSP_HOME_ORDO_CSS=`
.aoH4IcrspOrdo{margin:12px 12px 18px;padding:12px 14px;border-radius:12px;
 border:1px solid var(--ao-rule,rgba(191,179,153,.35));background:var(--ao-surface-1,rgba(255,255,255,.035));
 color:var(--ao-text-primary,inherit);text-align:left}
.aoH4IcrspOrdo small{font-size:11px;letter-spacing:.03em;opacity:.8}
.aoH4IcrspOrdo strong{display:block;font:500 17px/1.3 Georgia,serif;margin:5px 0}
.aoH4IcrspOrdo p{font-size:12px;line-height:1.5;margin:5px 0}
.aoH4IcrspOrdo a{font-size:12px;text-decoration:underline;color:inherit}
.aoH4IcrspOrdo button{display:block;min-height:44px;width:100%;text-align:left;padding:7px 0;
 border:0;background:transparent;color:var(--ao-liturgical,#c9ad78);
 font:600 13px system-ui,sans-serif}
`;
export function renderIcrspFranceHomeOrdo(date,language="en"){
 const record=icrspFranceOrdoForDate(date);
 if(!record)return "";
 const fr=language==="fr",lng=fr?"fr":"en",t=(en,frText)=>fr?frText:en;
 const office=record.office,mass=record.mass;
 const classLabel=x=>fr?x+"e classe":"Class "+x;
 const items=[
  t("Mass in white","Messe en blanc")+" · "+classLabel(mass.class),
  mass.introit, "Gloria",t("No Credo","Sans Credo"),
  t("Prayer for the Pope","Oraison pour le Pape"),
  t("Preface of the ","Préface du ")+mass.preface[lng]
 ].join(" · ");
 const notes=[
  office.name[lng]+" · "+classLabel(office.class)+" · "+(office.colour==="WHITE"?t("white Office","office blanc"):t("green Office","office vert"))
 ].concat(record.observances.includes("FIRST_FRIDAY")?[t("First Friday","Premier vendredi")]:[])
  .concat(record.observances.includes("FIRST_SATURDAY")?[t("First Saturday","Premier samedi")]:[])
  .concat(record.observances.includes("FRIDAY_ABSTINENCE")?[t("Friday abstinence","Abstinence du vendredi")]:[]);
 const readings=mass.epistle&&mass.gospel?
  '<p>'+esc(t("Epistle","Épître"))+": "+esc(mass.epistle)+" · "+esc(t("Gospel","Évangile"))+": "+esc(mass.gospel)+"</p>":"";
 return '<section class="aoH4IcrspOrdo" data-home-icrsp-ordo="'+esc(record.date)+'" aria-label="'+esc(t("ICRSP France particular ordo","Ordo particulier de l’ICRSP France"))+'">'+
  '<small>'+esc(t("ICRSP France · Mass celebrated in the Institute","ICRSP France · Messe célébrée par l’Institut"))+'</small>'+
  '<strong>'+esc(mass.title[lng])+'</strong>'+
  '<p>'+esc(notes.join(" · "))+'</p><p>'+esc(items)+'</p>'+readings+
  '<a href="'+esc(record.sourceOrdo)+'" target="_blank" rel="noopener noreferrer">'+esc(t("Official ICRSP ordo","Ordo officiel ICRSP"))+'</a>'+
  '<button type="button" data-home-icrsp-votive="VOTIVE">'+esc((record.date==="2026-11-06"?t("Use Sacred Heart votive · Low Mass","Choisir la messe votive du Sacré-Cœur · messe basse"):t("Find this Mass in the votive Mass catalogue","Retrouver cette messe dans le catalogue des messes votives")))+' ›</button>'+
  '<small>'+esc(t("Institute-specific record. Your actual Mass must be selected before opening the reader.","Ordo propre à l’Institut. Le formulaire réellement célébré doit être sélectionné avant d’ouvrir le lecteur."))+'</small></section>';
}
