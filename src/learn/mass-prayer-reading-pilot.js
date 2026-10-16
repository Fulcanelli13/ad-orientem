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

/**
 * The next published-text slice crosses three Guide moments. It contains
 * exactly six fixed-text blocks. The Secret and Preface remain explicitly
 * withheld as Mass-dependent Proper slots, never generic substitutions.
 */
export function validateMassTransitionReadingPilot(pilot,sung,formation,guide){
 const fail=reason=>Object.freeze({ok:false,reason,readings:Object.freeze([]),withheld:Object.freeze([])});
 const expected=Object.freeze({
  "AO.SM.B039":Object.freeze(["AO.SM.M11","AO.CARD.011","MF03"]),
  "AO.SM.B041":Object.freeze(["AO.SM.M11","AO.CARD.011","MF03"]),
  "AO.SM.B042":Object.freeze(["AO.SM.M12","AO.CARD.012","MF01"]),
  "AO.SM.B043":Object.freeze(["AO.SM.M12","AO.CARD.012","MF01"]),
  "AO.SM.B044":Object.freeze(["AO.SM.M12","AO.CARD.012","MF01"]),
  "AO.SM.B046":Object.freeze(["AO.SM.M13","AO.CARD.013","MF01"])
 });
 if(pilot?.schema!=="ao-formation-prayer-reading-transition-pilot-v1"||
    pilot.scope!=="FORMATION_ONLY"||pilot.status!=="EDITORIAL_DRAFT_NOT_RELEASED"||
    pilot.profile!=="ORDINARY_SUNG"||
    pilot.study_level!=="DIRECT_READING_OF_PUBLISHED_LITURGICAL_TEXT"||
    !Array.isArray(pilot.entries)||pilot.entries.length!==6||
    !Array.isArray(pilot.withheld_variable_propers)||pilot.withheld_variable_propers.length!==2)
   return fail("INVALID_TRANSITION_ENVELOPE");
 if(!Array.isArray(sung?.blocks)||formation?.schema!=="ao-mass-formation-campion-v1"||
    !guide?.entries)return fail("MISSING_ORIGINAL_OWNERS");
 const blockMap=new Map(sung.blocks.map(x=>[x.Block_ID,x]));
 const withheldSlots=new Map([["AO.SM.B040","SECRET_SET"],["AO.SM.B045","PREFACE"]]);
 const heldIDs=new Set();
 for(const item of pilot.withheld_variable_propers){
  const expectedSlot=withheldSlots.get(item.block_id);
  const original=blockMap.get(item.block_id);
  if(!expectedSlot||heldIDs.has(item.block_id)||item.proper_slot!==expectedSlot||
     original?.Proper_Slot!==expectedSlot||
     original.units?.some(unit=>unit.english||unit.latin)||
     typeof item.reason!=="string"||item.reason.length<15)return fail("PROPER_HOLD_MISMATCH");
  heldIDs.add(item.block_id);
 }
 if(heldIDs.size!==2)return fail("MISSING_VARIABLE_PROPER_HOLD");
 const selected=new Set(),ids=new Set(),validated=[];
 for(const entry of pilot.entries){
  const expectedRow=expected[entry?.block_id];
  if(!expectedRow||ids.has(entry.id)||selected.has(entry.block_id)||
     !/^AO\.FORM\.PRAYER\.TRANSITION\.0[1-6]$/.test(entry.id||"")||
     entry.moment_id!==expectedRow[1]||entry.stage_id!==expectedRow[2]||
     !guide.entries[entry.moment_id]||
     !formation.stages.some(stage=>stage.id===entry.stage_id))return fail("INVALID_OR_DUPLICATE_TRANSITION_LINK");
  const original=blockMap.get(entry.block_id);
  if(!original||original.Macro_ID!==expectedRow[0]||original.Proper_Slot||
     original.Branch_Status!=="NORMATIVE_1962"||!original.units?.length)return fail("MISSING_FIXED_MASS_TEXT");
  const originalText=original.units.filter(u=>u.clock!=="PRIEST_ACTION")
     .map(u=>String(u.english||"")).join("\n");
  if(typeof entry.text_anchor_en!=="string"||
     !originalText.includes(entry.text_anchor_en)||
     !Array.isArray(entry.scripture_within_text)||
     entry.scripture_within_text.some(v=>typeof v!=="string"||!originalText.includes(v)))
    return fail("UNPUBLISHED_WORDING_OR_SCRIPTURE");
  if(entry.block_id==="AO.SM.B046"&&!original.units.every(u=>u.clock==="SCHOLA_PUBLIC"))
    return fail("SUNG_SCHOLA_OWNERSHIP_CHANGED");
  for(const kind of ["heading","reading","observe"]){
   for(const language of ["en","fr"]){
    const t=entry[kind]?.[language];
    if(typeof t!=="string"||t.trim()!==t||t.length<12||t.length>1500)
      return fail("MISSING_OR_INVALID_BILINGUAL_DRAFT");
   }
  }
  ids.add(entry.id);selected.add(entry.block_id);validated.push(Object.freeze({
   ...entry,scripture_within_text:Object.freeze([...entry.scripture_within_text])
  }));
 }
 if(selected.size!==Object.keys(expected).length)return fail("INCOMPLETE_FIXED_TRANSITION");
 return Object.freeze({ok:true,reason:"EDITORIAL_PREVIEW_ONLY",
   readings:Object.freeze(validated),
   withheld:Object.freeze(pilot.withheld_variable_propers.map(item=>Object.freeze({...item})))});
}

export function massTransitionEditorialPreviewHtml(validation,{french=false}={}){
 if(!validation?.ok)return "";
 const title=french?"Du « Orate, fratres » au Sanctus":"From Orate, fratres to the Sanctus";
 const intro=french?
   "Six commentaires sur des textes fixes publiés. La Secrète et la Préface restent des textes variables, non reproduits ici.":
   "Six readings of published fixed texts. The Secret and Preface remain variable Mass-specific texts and are not reproduced here.";
 return '<main class="aoFRPilot" data-ao-formation-editorial-only>'+
  '<header><small>'+(french?"FORMATION · ÉBAUCHE ÉDITORIALE":"FORMATION · EDITORIAL DRAFT")+'</small>'+
   '<h1>'+title+'</h1><p>'+intro+'</p></header>'+
  validation.readings.map(x=>
    '<article class="aoFRPilotArticle" data-ao-formation-prayer-block="'+clean(x.block_id)+'">'+
    '<small>'+clean(x.block_id)+' · '+clean(x.moment_id)+'</small>'+
    '<h2>'+clean(langText(x.heading,french))+'</h2>'+
    '<p>'+clean(langText(x.reading,french))+'</p>'+
    '<h3>'+(french?"Observer les paroles":"Read the words")+'</h3>'+
    '<p>'+clean(langText(x.observe,french))+'</p></article>').join("")+
   '<section class="aoFRPilotHeld" aria-label="'+(french?"Textes variables non publiés":"Unpublished variable Propers")+'">'+
   '<h2>'+(french?"Textes variables réservés":"Variable texts held")+'</h2>'+
   '<ul>'+validation.withheld.map(item=>'<li data-ao-formation-proper-held="'+clean(item.block_id)+'">'+
     clean(item.block_id)+' · '+clean(item.proper_slot)+'</li>').join("")+'</ul></section>'+
  '</main>';
}

/**
 * Roman Canon draft: exact Sung text blocks B047–B061 are a distinct
 * Formation projection, not the native LIVE 48-card projection or P0
 * manuscript segmentation. No theological assertion is approved here.
 */
export function validateRomanCanonReadingPilot(pilot,sung,formation,guide){
 const fail=reason=>Object.freeze({ok:false,reason,readings:Object.freeze([])});
 if(pilot?.schema!=="ao-formation-canon-prayer-reading-pilot-v1"||
    pilot.status!=="EDITORIAL_DRAFT_NOT_RELEASED"||
    pilot.scope!=="FORMATION_ONLY"||pilot.profile!=="ORDINARY_SUNG"||
    pilot.study_level!=="DIRECT_READING_OF_PUBLISHED_LITURGICAL_TEXT"||
    !Array.isArray(pilot.entries)||pilot.entries.length!==15)return fail("INVALID_CANON_DRAFT");
 if(!Array.isArray(sung?.blocks)||formation?.schema!=="ao-mass-formation-campion-v1"||
    !guide?.entries)return fail("MISSING_ORIGINAL_OWNERS");
 const lookup=new Map(sung.blocks.map(x=>[x.Block_ID,x]));
 const seenIDs=new Set(),seenBlocks=new Set(),validated=[];
 for(let index=0;index<15;index++){
  const record=pilot.entries[index],number=index+47;
  const expectedBlock="AO.SM.B"+String(number).padStart(3,"0");
  const expectedMoment=number<=51?"AO.CARD.014":number===52?"AO.CARD.015":
    number===53?"AO.CARD.016":number<=59?"AO.CARD.017":"AO.CARD.018";
  const expectedMacro=number<=51?"AO.SM.M14":number===52?"AO.SM.M15":
    number===53?"AO.SM.M16":number<=59?"AO.SM.M17":"AO.SM.M18";
  const expectedStage=number===52||number===53?"MF05":"MF04";
  const block=lookup.get(record?.block_id);
  if(record?.id!=="AO.FORM.PRAYER.CANON."+String(index+1).padStart(2,"0")||
     record.block_id!==expectedBlock||record.moment_id!==expectedMoment||
     record.stage_id!==expectedStage||seenIDs.has(record.id)||seenBlocks.has(record.block_id)||
     !guide.entries[record.moment_id]||
     !formation.stages.some(x=>x.id===record.stage_id))return fail("CANON_BOUNDARY_OR_OWNER_MISMATCH");
  if(!block||block.Macro_ID!==expectedMacro||block.Proper_Slot||
     block.Branch_Status!=="NORMATIVE_1962"||
     !Array.isArray(block.units)||block.units.length===0)return fail("CANON_SOURCE_BLOCK_NOT_PUBLISHED");
  const wording=block.units.filter(x=>x.clock!=="PRIEST_ACTION").map(x=>String(x.english||"")).join("\n");
  if(typeof record.text_anchor_en!=="string"||!wording.includes(record.text_anchor_en)||
     !Array.isArray(record.scripture_within_text)||
     record.scripture_within_text.some(x=>typeof x!=="string"||!wording.includes(x)))
    return fail("CANON_TEXT_ANCHOR_OR_SCRIPTURE_MISMATCH");
  // Supra quae explicitly names biblical people, but their exact citations
  // are not part of this text witness and require future P0 adjudication.
  const mentions=record.mentioned_biblical_persons_in_text;
  const names=number===55?["Abel","Abraham","Melchisedech"]:[];
  if(!Array.isArray(mentions)||mentions.length!==names.length||
     mentions.some((person,k)=>person!==names[k]||!wording.includes(person)))
    return fail("BIBLICAL_PERSON_NOT_EXPLICIT_IN_CANON");
  if(record.scripture_within_text.length)return fail("UNAPPROVED_CANON_SCRIPTURE_RELATION");
  if(number===52&&(!wording.includes("FOR THIS IS MY BODY.")||
      !block.units.some(x=>x.clock==="PRIEST_ACTION"&&x.english.includes("elevates"))))
    return fail("HOST_CONSECRATION_SOURCE_LOST");
  if(number===53&&(!wording.includes("FOR THIS IS THE CHALICE OF MY BLOOD")||
      !block.units.some(x=>x.clock==="PRIEST_ACTION"&&x.english.includes("elevates"))))
    return fail("CHALICE_CONSECRATION_SOURCE_LOST");
  if(number===58&&!block.units.every(x=>x.clock==="PUBLIC_TEXT"))
    return fail("NOBIS_PUBLIC_VOICE_NOT_PRESERVED");
  if(number===61&&(!block.units.some(x=>x.clock==="USER_RESPONSE")||
      !block.units.some(x=>x.clock==="PUBLIC_TEXT")))
    return fail("PUBLIC_CANON_AMEN_NOT_PRESERVED");
  for(const field of ["heading","reading","observe"]){
   for(const language of ["en","fr"]){
    const prose=record[field]?.[language];
    if(typeof prose!=="string"||prose.trim()!==prose||
       prose.length<12||prose.length>1800)return fail("MISSING_BILINGUAL_EDITORIAL_PROSE");
   }
  }
  seenIDs.add(record.id);seenBlocks.add(record.block_id);
  validated.push(Object.freeze({...record,
   scripture_within_text:Object.freeze([...record.scripture_within_text]),
   mentioned_biblical_persons_in_text:Object.freeze([...mentions])}));
 }
 return Object.freeze({ok:true,reason:"EDITORIAL_PREVIEW_ONLY",readings:Object.freeze(validated)});
}

export function romanCanonEditorialPreviewHtml(validation,{french=false}={}){
 if(!validation?.ok)return "";
 return '<main class="aoFRPilot" data-ao-formation-editorial-only>'+
  '<header><small>'+(french?"FORMATION · ÉBAUCHE ÉDITORIALE":"FORMATION · EDITORIAL DRAFT")+'</small>'+
  '<h1>'+(french?"Le Canon romain, prière par prière":"The Roman Canon, prayer by prayer")+'</h1>'+
  '<p>'+(french?
    "Quinze lectures descriptives des textes déjà publiés. Elles ne remplacent ni les rubriques de la Messe ni la certification des sources par P0.":
    "Fifteen descriptive readings of existing published texts, without replacing Mass rubrics or P0 source certification.")+'</p></header>'+
  validation.readings.map(row=>'<article class="aoFRPilotArticle" data-ao-formation-prayer-block="'+clean(row.block_id)+'">'+
    '<small>'+clean(row.block_id)+' · '+clean(row.moment_id)+'</small>'+
    '<h2>'+clean(langText(row.heading,french))+'</h2>'+
    '<p>'+clean(langText(row.reading,french))+'</p>'+
    '<h3>'+(french?"Observer le texte":"Read the source wording")+'</h3>'+
    '<p>'+clean(langText(row.observe,french))+'</p>'+
    (row.mentioned_biblical_persons_in_text.length?
      '<p class="aoFRPilotScripture">'+(french?
        "Personnages bibliques nommés sans référence de verset certifiée : ":
        "Biblical people named without certified verse references: ")+
        row.mentioned_biblical_persons_in_text.map(clean).join(", ")+'</p>':"")+
    '</article>').join("")+'</main>';
}

/**
 * Communion editorial projection: B062–B084 including three older/local
 * optional blocks. Keeps this prayer-by-prayer Formation exercise independent
 * of P0 certification and all ceremonial/ritual reader projections.
 */
export function validateCommunionReadingPilot(pilot,sung,formation,guide){
 const fail=reason=>Object.freeze({ok:false,reason,readings:Object.freeze([]),withheld:Object.freeze([])});
 if(pilot?.schema!=="ao-formation-communion-prayer-reading-pilot-v1"||
    pilot.status!=="EDITORIAL_DRAFT_NOT_RELEASED"||
    pilot.scope!=="FORMATION_ONLY"||pilot.profile!=="ORDINARY_SUNG"||
    pilot.study_level!=="DIRECT_READING_OF_PUBLISHED_LITURGICAL_TEXT"||
    !Array.isArray(pilot.entries)||pilot.entries.length!==23||
    !Array.isArray(pilot.withheld_variable_propers)||
    pilot.withheld_variable_propers.length!==1)return fail("INVALID_COMMUNION_DRAFT");
 if(!Array.isArray(sung?.blocks)||formation?.schema!=="ao-mass-formation-campion-v1"||
    !guide?.entries)return fail("MISSING_ORIGINAL_OWNERS");
 const lookup=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
 const held=pilot.withheld_variable_propers[0],antiphon=lookup.get("AO.SM.B085");
 if(held?.block_id!=="AO.SM.B085"||held?.proper_slot!=="COMMUNION"||
    typeof held.reason!=="string"||held.reason.length<15||
    antiphon?.Proper_Slot!=="COMMUNION"||
    antiphon?.units?.some(u=>u.english||u.latin))return fail("VARIABLE_COMMUNION_ANTIPHON_HOLD");
 const seen=new Set(),validated=[];
 for(let i=0;i<23;i++){
  const number=i+62,rec=pilot.entries[i],
    sourceId="AO.SM.B"+String(number).padStart(3,"0");
  const expectedMacro=number<=63?"AO.SM.M19":number<=67?"AO.SM.M20":
    number===68?"AO.SM.M21":number<=73?"AO.SM.M22":
    number<=76?"AO.SM.M23":number<=81?"AO.SM.M24":
    number===82?"AO.SM.M25":"AO.SM.M26";
  const momentNumber=number<=63?19:number<=67?20:number===68?21:
    number<=73?22:number<=76?23:number<=81?24:number===82?25:26;
  const momentId="AO.CARD."+String(momentNumber).padStart(3,"0");
  const stageId=number<=68?"MF01":number<=76?"MF07":
    number<=82?"MF01":"MF08";
  const optional=number>=77&&number<=79;
  const expectedStatus=optional?"LOCAL_CUSTOM_PRE1960_SURVIVAL":"NORMATIVE_1962";
  const expectedBranch=optional?"OPTIONAL_LOCAL_OLDER_CUSTOM":"NORMATIVE_FIXED_TEXT";
  const source=lookup.get(sourceId);
  if(!rec||rec.id!=="AO.FORM.PRAYER.COMMUNION."+String(i+1).padStart(2,"0")||
     rec.block_id!==sourceId||rec.moment_id!==momentId||rec.stage_id!==stageId||
     rec.source_status!==expectedStatus||rec.branch!==expectedBranch||
     seen.has(rec.id)||!guide.entries[rec.moment_id]||
     !formation.stages.some(stage=>stage.id===rec.stage_id))return fail("COMMUNION_BOUNDARY_OR_OPTIONAL_BRANCH");
  if(!source||source.Macro_ID!==expectedMacro||source.Proper_Slot||
     source.Branch_Status!==expectedStatus||!Array.isArray(source.units)||
     source.units.length===0)return fail("PUBLISHED_COMMUNION_SOURCE_NOT_FOUND");
  const wording=source.units.filter(x=>x.clock!=="PRIEST_ACTION").map(x=>String(x.english||"")).join("\n");
  if(typeof rec.text_anchor_en!=="string"||!wording.includes(rec.text_anchor_en)||
    !Array.isArray(rec.scripture_within_text)||
    rec.scripture_within_text.length!==0)return fail("COMMUNION_UNPUBLISHED_WORDING_OR_SCRIPTURE");
  // Keep the public response, thrice-repeated invocations, and older branch
  // visibly distinguishable, not blended into one generic Communion stage.
  if(number===63&&source.units.map(x=>x.clock).join("/")!=="PUBLIC_TEXT/USER_RESPONSE/PRIEST_PRIVATE")
    return fail("PATERNOSTER_RESPONSES_CHANGED");
  if(number===68&&(source.units.length!==3||!source.units.every(x=>x.clock==="SCHOLA_PUBLIC")))
    return fail("AGNUS_DEI_SCHOLA_DISTINCTION");
  if(number===73&&(source.units.length!==3||!source.units.every(x=>x.clock==="PRIEST_PRIVATE")))
    return fail("PRIEST_DOMINE_THREEFOLD");
  if(number===81&&(source.units.length!==3||!source.units.every(x=>x.clock==="PUBLIC_TEXT")))
    return fail("FAITHFUL_DOMINE_THREEFOLD");
  if((number===74||number===76||number===82)&&!source.units.some(u=>u.english?.includes("soul unto life everlasting")))
    return fail("COMMUNION_RECEPTION_PRAYER_LOST");
  if((number===78||number===79)&&!source.units.some(u=>u.clock==="USER_RESPONSE"))
    return fail("OPTIONAL_RESPONSE_LOST");
  for(const field of ["heading","reading","observe"]){
   for(const lang of ["en","fr"]){
    const prose=rec[field]?.[lang];
    if(typeof prose!=="string"||prose.length<12||prose.length>1800||prose.trim()!==prose)
      return fail("MISSING_COMMUNION_BILINGUAL_DRAFT");
   }
  }
  seen.add(rec.id);
  validated.push(Object.freeze({...rec,scripture_within_text:Object.freeze([])}));
 }
 return Object.freeze({ok:true,reason:"EDITORIAL_PREVIEW_ONLY",readings:Object.freeze(validated),
   withheld:Object.freeze([Object.freeze({...held})])});
}

export function communionEditorialPreviewHtml(validation,{french=false}={}){
 if(!validation?.ok)return "";
 return '<main class="aoFRPilot" data-ao-formation-editorial-only>'+
  '<header><small>'+(french?"FORMATION · ÉBAUCHE ÉDITORIALE":"FORMATION · EDITORIAL DRAFT")+'</small>'+
  '<h1>'+(french?"Du Notre Père aux ablutions":"From the Lord’s Prayer to the ablutions")+'</h1>'+
  '<p>'+(french?
   "Vingt textes normatifs et trois textes facultatifs liés à un usage ancien ou local. L’antienne de communion propre à la Messe reste réservée.":
   "Twenty normative fixed-text prayers and three optional older/local Communion Confiteor blocks. The variable Communion antiphon remains withheld.")+'</p></header>'+
  validation.readings.map(rec=>'<article class="aoFRPilotArticle" data-ao-formation-prayer-block="'+clean(rec.block_id)+'">'+
   '<small>'+clean(rec.block_id)+' · '+clean(rec.moment_id)+'</small>'+
   (rec.branch==="OPTIONAL_LOCAL_OLDER_CUSTOM"?
    '<strong class="aoFRPilotOptional">'+(french?"USAGE LOCAL/ANCIEN FACULTATIF":"OPTIONAL OLDER/LOCAL CUSTOM")+'</strong>':"")+
   '<h2>'+clean(langText(rec.heading,french))+'</h2>'+
   '<p>'+clean(langText(rec.reading,french))+'</p>'+
   '<h3>'+(french?"Observer le texte et ses attributions":"Read the words and speaking roles")+'</h3>'+
   '<p>'+clean(langText(rec.observe,french))+'</p></article>').join("")+
   '<p data-ao-formation-proper-held="'+clean(validation.withheld[0].block_id)+'">'+
    (french?"Antienne variable réservée : ":"Variable antiphon held: ")+
    clean(validation.withheld[0].block_id)+'</p></main>';
}

/**
 * Final fixed Sung texts B086–B095, omitting the variable Postcommunion
 * Proper B088. The label NORMATIVE_1962 on a source block does NOT imply
 * the blessing/Last Gospel or one dismissal formula appears in every Mass.
 */
export function validateConclusionReadingPilot(pilot,sung,formation,guide){
 const fail=reason=>Object.freeze({ok:false,reason,readings:Object.freeze([]),withheld:Object.freeze([])});
 if(pilot?.schema!=="ao-formation-conclusion-prayer-reading-pilot-v1"||
    pilot.status!=="EDITORIAL_DRAFT_NOT_RELEASED"||
    pilot.scope!=="FORMATION_ONLY"||pilot.profile!=="ORDINARY_SUNG"||
    pilot.study_level!=="DIRECT_READING_OF_PUBLISHED_LITURGICAL_TEXT"||
    !Array.isArray(pilot.entries)||pilot.entries.length!==9||
    !Array.isArray(pilot.withheld_variable_propers)||pilot.withheld_variable_propers.length!==1)
   return fail("INVALID_CONCLUSION_DRAFT");
 if(!Array.isArray(sung?.blocks)||formation?.schema!=="ao-mass-formation-campion-v1"||
    !guide?.entries)return fail("MISSING_ORIGINAL_OWNERS");
 const lookup=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
 const held=pilot.withheld_variable_propers[0],post=lookup.get("AO.SM.B088");
 if(held?.block_id!=="AO.SM.B088"||held?.proper_slot!=="POSTCOMMUNION_SET"||
    typeof held.reason!=="string"||held.reason.length<15||
    post?.Proper_Slot!=="POSTCOMMUNION_SET"||
    post?.units?.some(u=>u.english||u.latin))return fail("VARIABLE_POSTCOMMUNION_NOT_HELD");
 const expectedBlocks=[86,87,89,90,91,92,93,94,95];
 const expectedCondition=number=>number===89||number===90?"DISMISSAL_FORM_DEPENDENT":
    number===92?"BLESSING_MAY_BE_OMITTED":
    number>=93?"LAST_GOSPEL_MAY_BE_OMITTED":"STANDARD_FIXED";
 const seen=new Set(),readings=[];
 for(let i=0;i<expectedBlocks.length;i++){
  const number=expectedBlocks[i],entry=pilot.entries[i];
  const blockId="AO.SM.B"+String(number).padStart(3,"0");
  const momentNumber=number<=87?27:number<=90?28:number<=92?29:30;
  const momentId="AO.CARD."+String(momentNumber).padStart(3,"0");
  const macro=number<=87?"AO.SM.M27":number<=90?"AO.SM.M28":number<=92?"AO.SM.M29":"AO.SM.M30";
  const source=lookup.get(blockId);
  if(!entry||entry.id!=="AO.FORM.PRAYER.CONCLUSION."+String(i+1).padStart(2,"0")||
     entry.block_id!==blockId||entry.moment_id!==momentId||entry.stage_id!=="MF08"||
     entry.conditionality!==expectedCondition(number)||seen.has(entry.id)||
     !guide.entries[momentId]||!formation.stages.find(x=>x.id==="MF08"))
    return fail("CONCLUSION_ID_OR_CONDITIONALITY_MISMATCH");
  if(!source||source.Macro_ID!==macro||source.Proper_Slot||
     source.Branch_Status!=="NORMATIVE_1962"||!Array.isArray(source.units)||
     !source.units.length)return fail("MISSING_PUBLISHED_CONCLUSION_TEXT");
  const spoken=source.units.filter(u=>u.clock!=="PRIEST_ACTION").map(u=>String(u.english||"")).join("\n");
  if(typeof entry.text_anchor_en!=="string"||!spoken.includes(entry.text_anchor_en)||
     !Array.isArray(entry.scripture_within_text)||entry.scripture_within_text.length)
    return fail("UNVERIFIED_CONCLUSION_WORDING_OR_SCRIPTURE");
  if((number===86||number===89||number===93)&&
     source.units.map(u=>u.clock).join("/")!=="PUBLIC_TEXT/USER_RESPONSE")
    return fail("PUBLIC_GREETING_ROLE_LOST");
  if(number===87&&(source.units.length!==1||source.units[0].clock!=="PUBLIC_TEXT"))
    return fail("OREMUS_NOT_DISTINCT");
  if(number===90&&source.units.map(u=>u.clock).join("/")!=="PUBLIC_TEXT/USER_RESPONSE")
    return fail("DISMISSAL_RESPONSE_LOST");
  if(number===91&&source.units.map(u=>u.clock).join("/")!=="PRIEST_PRIVATE/PRIEST_ACTION")
    return fail("QUIET_PLACEAT_LOST");
  if(number===92&&source.units.map(u=>u.clock).join("/")!=="PRIEST_ACTION/PUBLIC_TEXT/PUBLIC_TEXT/USER_RESPONSE")
    return fail("BLESSING_ACTION_OR_AMEN_LOST");
  if(number===94&&(!source.units[0].english?.includes("Saint John")||
       source.units.map(u=>u.clock).join("/")!=="PUBLIC_TEXT/USER_RESPONSE"))
    return fail("LAST_GOSPEL_ANNOUNCEMENT_LOST");
  if(number===95&&(
     source.units.map(u=>u.clock).join("/")!=="PUBLIC_TEXT/PUBLIC_TEXT/PUBLIC_TEXT/PUBLIC_TEXT/USER_RESPONSE"||
     source.units[2].english!=="AND THE WORD WAS MADE FLESH."||
     !source.units[4].english?.includes("Thanks be to God.")))
    return fail("LAST_GOSPEL_INCARNATION_OR_RESPONSE_LOST");
  for(const field of ["heading","reading","observe"]){
   for(const lang of ["en","fr"]){
    const prose=entry[field]?.[lang];
    if(typeof prose!=="string"||prose.length<12||prose.length>1800||prose.trim()!==prose)
      return fail("MISSING_BILINGUAL_EDITORIAL_READING");
   }
  }
  seen.add(entry.id);
  readings.push(Object.freeze({...entry,scripture_within_text:Object.freeze([])}));
 }
 return Object.freeze({ok:true,reason:"EDITORIAL_PREVIEW_ONLY",readings:Object.freeze(readings),
   withheld:Object.freeze([Object.freeze({...held})])});
}

export function conclusionEditorialPreviewHtml(validation,{french=false}={}){
 if(!validation?.ok)return "";
 const conditionLabel=code=>({
   DISMISSAL_FORM_DEPENDENT:french?"FORMULE DE RENVOI VARIABLE":"DISMISSAL FORM VARIES",
   BLESSING_MAY_BE_OMITTED:french?"BÉNÉDICTION PARFOIS OMISE":"BLESSING MAY BE OMITTED",
   LAST_GOSPEL_MAY_BE_OMITTED:french?"DERNIER ÉVANGILE PARFOIS OMIS":"LAST GOSPEL MAY BE OMITTED"
 })[code]||"";
 return '<main class="aoFRPilot" data-ao-formation-editorial-only>'+
  '<header><small>'+(french?"FORMATION · ÉBAUCHE ÉDITORIALE":"FORMATION · EDITORIAL DRAFT")+'</small>'+
  '<h1>'+(french?"De la Postcommunion au dernier Évangile":"From Postcommunion to the Last Gospel")+'</h1>'+
  '<p>'+(french?
   "Neuf lectures de textes fixes. Le renvoi, la bénédiction et le dernier Évangile dépendent de la forme célébrée. La Postcommunion propre demeure réservée.":
   "Nine fixed-text readings. The dismissal, blessing and Last Gospel depend on the form of Mass. The variable Postcommunion remains held.")+'</p></header>'+
  validation.readings.map(rec=>'<article class="aoFRPilotArticle" data-ao-formation-prayer-block="'+clean(rec.block_id)+'">'+
    '<small>'+clean(rec.block_id)+' · '+clean(rec.moment_id)+'</small>'+
    (rec.conditionality!=="STANDARD_FIXED"?
     '<strong class="aoFRPilotConditional">'+clean(conditionLabel(rec.conditionality))+'</strong>':"")+
    '<h2>'+clean(langText(rec.heading,french))+'</h2>'+
    '<p>'+clean(langText(rec.reading,french))+'</p>'+
    '<h3>'+(french?"Observer la forme et le texte":"Read the form and wording")+'</h3>'+
    '<p>'+clean(langText(rec.observe,french))+'</p></article>').join("")+
  '<p data-ao-formation-proper-held="'+clean(validation.withheld[0].block_id)+'">'+
   (french?"Postcommunion variable réservée : ":"Variable Postcommunion held: ")+
   clean(validation.withheld[0].block_id)+'</p></main>';
}
