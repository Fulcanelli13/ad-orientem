/*
 * Formation editorial-pilot reader. This deliberately cannot return a public
 * publication status, and MUST NOT be imported into the ritual Mass reader.
 * The P0 Ultra Master source-claim/permission pipeline is independent.
 */
export const MASS_PRAYER_READING_PILOT_VERSION="ao-formation-prayer-reading-pilot-v1";
const clean=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const direct=(u)=>String(u?.english||"");
const langText=(value,fr)=>String((fr?value?.fr:value?.en)||"");

export function validatePrayerReadingPilot(pilot,sung,formation){
 const fail=(why)=>Object.freeze({ok:false,reason:why,readings:Object.freeze([])});
 if(pilot?.schema!==MASS_PRAYER_READING_PILOT_VERSION||
    pilot?.status!=="EDITORIAL_DRAFT_NOT_RELEASED"||
    pilot?.scope!=="FORMATION_ONLY"||pilot.profile!=="ORDINARY_SUNG"||
    pilot.study_level!=="DIRECT_READING_OF_PUBLISHED_LITURGICAL_TEXT"||
    !Array.isArray(pilot.entries)||pilot.entries.length!==8)return fail("INVALID_DRAFT_ENVELOPE");
 if(formation?.schema!=="ao-mass-formation-campion-v1"||
    sung?.schema===null||!Array.isArray(sung?.blocks)||!formation.stages?.find(x=>x.id==="MF03"))return fail("MISSING_SOURCE_OWNER");
 const blocks=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
 const ids=new Set(),keys=new Set(),found=[];
 for(const record of pilot.entries){
   if(!/^AO\.FORM\.PRAYER\.OFFERTORY\.0[1-8]$/.test(record?.id??"")||
      !/^AO\.SM\.B0(?:3[1-8])$/.test(record?.block_id??"")||
      record.moment_id!=="AO.CARD.010"||record.stage_id!=="MF03"||
      ids.has(record.id)||keys.has(record.block_id)||record.scripture_within_text?.some(v=>typeof v!=="string"))return fail("INVALID_PRAYER_RELATIONSHIP");
   ids.add(record.id);keys.add(record.block_id);
   const b=blocks.get(record.block_id);
   if(!b||b.Macro_ID!=="AO.SM.M10"||b.Proper_Slot||
     !b.units?.some(u=>u.english&&u.clock!=="PRIEST_ACTION"))return fail("UNPUBLISHED_OR_WRONG_MASS_TEXT");
   const original=b.units.filter(u=>u.clock!=="PRIEST_ACTION").map(direct).join("\n");
   if(typeof record.text_anchor_en!=="string"||
      !original.includes(record.text_anchor_en))return fail("PRAYER_ANCHOR_NOT_IN_PUBLISHED_TEXT");
   for(const value of record.scripture_within_text||[]){
     if(!original.includes(value))return fail("SCRIPTURE_NOT_EXPLICIT_IN_MASS_TEXT");
   }
   for(const property of ["heading","reading","observe"]){
     for(const lg of ["en","fr"]){
       const t=record[property]?.[lg];
       if(typeof t!=="string"||t.length<12||t.length>1500) return fail("MISSING_BILINGUAL_EDITORIAL_TEXT");
     }
   }
   found.push(Object.freeze({...record,
     scripture_within_text:Object.freeze([...(record.scripture_within_text||[])])}));
 }
 if(!Array.from({length:8},(_,i)=>"AO.SM.B"+String(31+i).padStart(3,"0"))
   .every(x=>keys.has(x)))return fail("INCOMPLETE_OFFERTORY");
 return Object.freeze({ok:true,reason:"EDITORIAL_PREVIEW_ONLY",
   readings:Object.freeze(found)});
}

/** A review-only preview of the new per-prayer commentary; never publish. */
export function prayerReadingEditorialPreviewHtml(validation,{french=false}={}){
 if(!validation?.ok)return "";
 const heading=french?"Lecture des prières de l’Offertoire":"Reading the Offertory prayers";
 return '<main class="aoFRPilot" data-ao-formation-editorial-only>'+
   '<header><small>'+(french?"FORMATION · ÉBAUCHE ÉDITORIALE":"FORMATION · EDITORIAL DRAFT")+'</small>'+
   '<h1>'+heading+'</h1><p>'+(french?
      "Ces notes commentent les paroles publiées de chaque prière. Elles ne certifient aucune nouvelle thèse historique ou théologique et ne sont pas intégrées au lecteur de la Messe.":
      "These notes read the words of each published prayer. They certify no new historical or theological claims and do not appear in the Mass reader.")+'</p></header>'+
   validation.readings.map(x=>
    '<article class="aoFRPilotArticle" data-ao-formation-prayer-block="'+clean(x.block_id)+'">'+
    '<small>'+clean(x.block_id)+'</small>'+
    '<h2>'+clean(langText(x.heading,french))+'</h2>'+
    '<p>'+clean(langText(x.reading,french))+'</p>'+
    '<h3>'+(french?"Observer le texte et les gestes":"Read the words and actions")+'</h3>'+
    '<p>'+clean(langText(x.observe,french))+'</p>'+
    (x.scripture_within_text.length?
      '<p class="aoFRPilotScripture">'+(french?"Citation biblique contenue dans le texte de la Messe : ":
        "Scripture expressly cited within this Mass text: ")+
        x.scripture_within_text.map(clean).join(", ")+'</p>':"")+
    '</article>').join("")+'</main>';
}
export function prayerReadingEditorialPreviewCss(){
 return `:root{color-scheme:dark;--bg:#080c12;--accent:#c9ad78;--ink:#eae3d7;--muted:#aaa7a2}
 *{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:1rem/1.7 Georgia,serif}
 .aoFRPilot{width:min(820px,100%);margin:0 auto;padding:24px 16px 80px}
 .aoFRPilot header{padding:16px 0 23px;border-bottom:1px solid #474440}
 .aoFRPilot small,.aoFRPilot h3{color:var(--accent);font:600 .7rem/1.5 system-ui;letter-spacing:.06em}
 .aoFRPilot h1{font:500 clamp(1.8rem,6vw,3rem)/1.2 Georgia,serif;margin:11px 0}
 .aoFRPilot header p{color:var(--muted);max-width:65ch}
 .aoFRPilotArticle{padding:23px 0 27px;border-bottom:1px solid #474440}
 .aoFRPilotArticle h2{font:500 1.55rem/1.25 Georgia,serif;margin:8px 0 12px}
 .aoFRPilotArticle h3{margin:19px 0 6px}
 .aoFRPilotArticle p{margin:8px 0;max-width:68ch}
 .aoFRPilotScripture{color:var(--accent);font-size:.84rem}
 @media(max-width:430px){.aoFRPilot{padding:18px 14px 55px}.aoFRPilotArticle{padding-top:18px}}
 @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}`;
}
