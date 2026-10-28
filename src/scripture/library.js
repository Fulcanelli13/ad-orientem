import { SCRIPTURE_EDITIONS, DEFAULT_SCRIPTURE_EDITION, scripturePassage } from "./catalogue.js";
import { scriptureBookCatalogue, sourceReadingLink, ROSARY_SCRIPTURE_LINKS } from "./links.js";
import { passageReference } from "./passages.js";
import { createScripturePreferences } from "./preferences.js";
import { searchCertifiedScripture, searchScriptureBooks } from "./search.js";
import { scriptureReferenceWarning, scriptureParallelReferenceState } from "./reference-safety.js";
import { cpdvTextualNotesFor } from "./cpdv-textual-notes.js";
import { verifiedScriptureCommentary } from "./context.js";
import {loadCatenaForPassage,isCatenaGospel} from "./catena-inline.js";
import {scriptureChapterLimit} from "./chapter-counts.js";
import {scriptureSegments,scriptureSegmentsReference} from "./segments.js";
import {hasScriptureWitness} from "./witness-loader.js";
import {scriptureMeditationPrayers} from "../pray/scripture-meditation-prayers.v1.js";
import {scriptureWitnessEmptySlots} from "./witness-gaps.js";

const L={
 en:{heading:"Sacred Scripture",notice:"Catholic Bible reading. Historical source transcriptions are labelled pending edition collation.",
  book:"Book",chapter:"Chapter",verse:"Verse",open:"Read at source",save:"Bookmark",saved:"Bookmarked",
  bookmarks:"Bookmarks",search:"Search",find:"Search approved text",results:"Results",none:"No verified local text found.",
  rosary:"Rosary mysteries",source:"Source edition", unavailable:"This chapter is not available offline. Open the Catholic edition at its source.",
  readable:"Choose Douay–Rheims or CPDV at any time. Both use source-labelled transcriptions pending edition-level collation.",
  frenchSource:"Crampon 1923 source",close:"Close",next:"Next chapter",previous:"Previous chapter",noBookmarks:"No bookmarks saved", language:"Language"},
 fr:{heading:"Sainte Écriture",notice:"Lecture de la Bible catholique. Les transcriptions historiques non collationnées sont signalées.",
  book:"Livre",chapter:"Chapitre",verse:"Verset",open:"Consulter la source",save:"Marquer",saved:"Marqué",
  bookmarks:"Signets",search:"Rechercher",find:"Chercher dans les textes autorisés",results:"Résultats",none:"Aucun texte local vérifié.",
  rosary:"Mystères du Rosaire",source:"Édition",unavailable:"Ce chapitre n'est pas disponible hors ligne. Consulter la source catholique.",
  frenchSource:"Source Crampon 1923",close:"Fermer",next:"Chapitre suivant",previous:"Chapitre précédent",noBookmarks:"Aucun signet",language:"Langue"}};
const FRENCH_INDEX="https://fr.wikisource.org/wiki/Bible_Crampon_1923";
const element=(tag,copy=null,className="")=>{
 const el=document.createElement(tag);if(copy!==null)el.textContent=copy;if(className)el.className=className;return el;
};
function validatedRecord(record,editionId) {
 const edition=SCRIPTURE_EDITIONS[editionId];
 return Boolean(((edition?.enabled && edition.rights==="cleared" && record?.reviewed===true) || (hasScriptureWitness(editionId,record?.book) && record?.sourceWitness===true && record?.reviewed===false && record?.sourceStatus==="UNCOLLATED_SOURCE_WITNESS")) &&
  record?.editionId===editionId &&
  typeof record.text==="string" && record.text.trim() && record.sourceUrl &&
  record.sourceEdition && record.licenceId);
}
/**
 * Separate Scripture reader. Source-backed links always work online.
 * Local readings/search/offline capability activate ONLY after the actual
 * edition text, provenance and reproduction permission are approved.
 */
export function mountScriptureLibrary(root,{
 language="en",openExternal=url=>window.open(url,"_blank","noopener,noreferrer"),
 storage=globalThis.localStorage,records=[],onClose=()=>{},onNeedBook=()=>{},onOpenRelatedObject=null,canOpenRelatedObject=()=>false,fetchCommentary=globalThis.fetch?.bind(globalThis),passage=null,context=null,initialDepth="selected"
}={}){
 if(!root||typeof root.replaceChildren!=="function")throw new TypeError("Scripture root required");
 if(!Array.isArray(records))throw new TypeError("Scripture records array required");
 const prefs=createScripturePreferences(storage);
 const stored=Boolean(storage?.getItem?.("ao-scripture-v1"));
 const preference=context?language:(stored?prefs.load().language:language);
 let lang=["en","fr"].includes(preference)?preference:"en";
 let segmentSet=context?.segments?scriptureSegments(context.segments):null;
 if(segmentSet && context.reference!==scriptureSegmentsReference(segmentSet))
  throw new Error("Segmented Scripture citation and coordinates disagree");
 let activeSegmentIndex=segmentSet?0:-1;
 let location=segmentSet?segmentSet[0]:
  passage?scripturePassage(passage):scripturePassage({book:"Luke",chapter:1,verseStart:28});
 const leaveSourceSegments=()=>{segmentSet=null;activeSegmentIndex=-1;};
 let query="";
 let section="read";
 let contextDepth="selected";
 let commentaryVisible=Boolean(context?.reference&&initialDepth==="commentary");
 let relatedExpanded=false;
 const relatedTrail=[];
 let browseExpanded=false;
 let toolsExpanded=false;
 // Optional reader-local devotional choices, never saved as Bible verses,
 // additional Scripture sections or replacements for canonical prayers.
 const readingPrayerOpen={before:false,after:false};
 const readingPrayerChoice={before:null,after:null};

 let editionId=lang==="en"?prefs.englishEdition():DEFAULT_SCRIPTURE_EDITION[lang];
 const editionLocations=new Map([[editionId,location]]);
 function moveEdition(nextEdition){
   if(nextEdition===editionId)return;
   editionLocations.set(editionId,location);
   const saved=editionLocations.get(nextEdition);
   const parallel=scriptureParallelReferenceState(location,editionId,nextEdition);
   // A source-collated one-verse Esther reference can be translated exactly,
   // including its rearranged Greek additions. Other unverified source moves
   // restore a previously chosen edition position rather than fabricate one.
   if(parallel.canAutoParallel&&parallel.reference){
     const target=parallel.reference;
     // Preserve an existing precise edition position when it lies inside
     // a source-aligned combined verse; e.g. CPDV Psalm 13:5 inside Douay 13:3.
     if(saved?.book===target.book && saved.chapter===target.chapter &&
        saved.verseStart>=target.verseStart && saved.verseEnd<=target.verseEnd)location=saved;
     else location=target;
   }
   else if(saved?.book===location.book)location=saved;
   else if(scriptureReferenceWarning(location.book,lang))
     location=scripturePassage({book:location.book,chapter:1,verseStart:1});
   editionId=nextEdition;
   editionLocations.set(editionId,location);
 }
 const wrap=element("section",null,"aoScriptureLibrary");
 wrap.setAttribute("aria-label","Sacred Scripture");
 root.replaceChildren(wrap);
 function editionSource() {
   if(lang==="fr")return FRENCH_INDEX;
   if(["dr-challoner","cpdv-2009"].includes(editionId))return sourceReadingLink(location,editionId);
   return null;
 }
 function linkToSource(href) {
   if(!href)return;
   // Only scheme + two known source hosts are accepted.
   const parsed=new URL(href);
   if(parsed.protocol!=="https:" || !["www.biblegateway.com","fr.wikisource.org","sacredbible.org"].includes(parsed.hostname))
     throw new Error("Untrusted Scripture source URL");
   openExternal(parsed.href);
 }
 /**
  * Only source-cleared prayers appear, in their actual language. The
  * French reader may offer the expressly labelled original Latin prayer,
  * never substitute a fabricated French or unlabelled English text.
  * These optional prayers are visually secondary to the Scripture reading.
  */
 function readingPrayerOptions(phase){
   return scriptureMeditationPrayers(phase,{language:lang});
 }
 function readingPrayerDisclosure(phase){
   const options=readingPrayerOptions(phase);
   if(!options.length)return null;
   const before=phase==="before";
   const label=before
     ?(lang==="fr"?"Prière avant la lecture · latin":"Prayer before reading")
     :(lang==="fr"?"Prière après la lecture":"Prayer after reading");
   const details=element("details",null,"aoScriptureOptionalPrayer");
   details.dataset.scripturePrayer=phase;
   details.open=readingPrayerOpen[phase];
   const summary=element("summary",label);
   details.append(summary);
   details.addEventListener("toggle",()=>{readingPrayerOpen[phase]=details.open});
   const selected=options.find(x=>x.id===readingPrayerChoice[phase])||options[0];
   readingPrayerChoice[phase]=selected.id;
   const body=element("div",null,"aoScriptureOptionalPrayerBody");
   if(options.length>1){
     const choices=element("div",null,"aoScriptureOptionalPrayerChoices");
     for(const option of options){
       const languageLabel=option.language==="la"?"Latin": "English";
       const control=element("button",languageLabel);
       control.type="button";
       control.setAttribute("aria-pressed",String(option.id===selected.id));
       control.dataset.scripturePrayerChoice=option.id;
       control.addEventListener("click",()=>{
         readingPrayerChoice[phase]=option.id;
         const fresh=readingPrayerDisclosure(phase);
         if(!fresh)return;
         fresh.open=true;readingPrayerOpen[phase]=true;
         details.replaceWith(fresh);
         fresh.querySelector('[data-scripture-prayer-choice="'+option.id+'"]')?.focus?.({preventScroll:true});
       });
       choices.append(control);
     }
     body.append(choices);
   }
   body.append(element("h4",selected.title,"aoScriptureOptionalPrayerTitle"));
   for(const paragraph of selected.text.split(/\n\s*\n/).filter(Boolean))
     body.append(element("p",paragraph,"aoScriptureOptionalPrayerText"));
   const source=element("a",lang==="fr"?"Lasance (1908) · source imprimée ↗":"Lasance (1908) · printed source ↗");
   source.href=selected.source.scanPageUrl;source.target="_blank";source.rel="noopener noreferrer";
   body.append(source);
   details.append(body);
   return details;
 }
 function draw(){
   const t=L[lang];
   wrap.replaceChildren();
   if(hasScriptureWitness(editionId,location.book) || (SCRIPTURE_EDITIONS[editionId]?.enabled && SCRIPTURE_EDITIONS[editionId]?.rights==="cleared")) {
     queueMicrotask(()=>onNeedBook({book:location.book,editionId}));
   }
   const heading=element("header",null,"aoScriptureHeader");
   heading.append(element("h2",t.heading));
   // One quiet edition flip replaces a full-height translation selection row.
   if(lang==="en"){
     const next=editionId==="dr-challoner"?"cpdv-2009":"dr-challoner";
     const flip=element("button",editionId==="dr-challoner"?"Douay  ⇄  CPDV":"CPDV  ⇄  Douay","aoScriptureEditionFlip");
     flip.type="button";flip.dataset.scriptureEnglishEdition=next;
     flip.dataset.scriptureActiveEdition=editionId;
     flip.setAttribute("aria-label",next==="cpdv-2009"?"Switch to CPDV":"Switch to Douay–Rheims");
     flip.addEventListener("click",()=>{
       moveEdition(next);prefs.setEnglishEdition(next);draw();
       queueMicrotask(()=>wrap.querySelector(".aoScriptureEditionFlip")?.focus?.({preventScroll:true}));
     });
     heading.append(flip);
   }
   const close=element("button","×");close.type="button";close.setAttribute("data-scripture-close","");
   close.setAttribute("aria-label",t.close);
   close.addEventListener("click",onClose);heading.append(close);wrap.append(heading);
   // Explicit research opt-in only: the public reader and parent Mass/Rosary
   // state remain unchanged. This opens the editor's separate source workbench.
   const researchFlag=root.ownerDocument?.defaultView?.location?.search??"";
   if(new URLSearchParams(researchFlag).get("ao_scripture_research")==="1"){
     const mine=element("a",lang==="fr"?"Analyser les sources de ce passage ↗":"Mine this passage and commentary ↗","aoScriptureEditorialMine");
     const target=new URL("../../previews/scripture-mining-workbench-20261017.html",import.meta.url);
     target.searchParams.set("module","other");
     target.searchParams.set("reference",passageReference(location));
     mine.href=target.href;mine.target="_blank";mine.rel="noopener noreferrer";
     mine.dataset.scriptureEditorialMine="";
     wrap.append(mine);
   }
   if(relatedTrail.length){
     const back=element("button",lang==="fr"?"Retour au passage précédent":"Back to previous passage");
     back.type="button";back.dataset.scriptureRelatedBack="";
     back.addEventListener("click",()=>{
       const prev=relatedTrail.pop();
       if(!prev)return;
       location=prev.location;context=prev.context;contextDepth=prev.contextDepth;
       commentaryVisible=prev.commentaryVisible;relatedExpanded=prev.relatedExpanded;
       browseExpanded=prev.browseExpanded;toolsExpanded=prev.toolsExpanded;
       segmentSet=prev.segmentSet??null;
       activeSegmentIndex=prev.activeSegmentIndex??-1;
       draw();
       root.scrollTop=prev.scrollTop;
       queueMicrotask(()=>wrap.querySelector(".aoScriptureRelated summary")?.focus?.({preventScroll:true}));
     });
     wrap.append(back);
   }
   // Citation reading is the primary surface. All-library navigation lives below it.
   const browse=element("details",null,"aoScriptureBrowse");
   browse.open=browseExpanded;
   // Native toggle is asynchronous; retain disclosure state synchronously
   // before selector change handlers rerender the reader.
   const browseSummary=element("summary",lang==="fr"?"Parcourir la Bible":"Browse the Bible");
   browseSummary.addEventListener("click",event=>{
     event.preventDefault();
     browseExpanded=!browse.open;
     browse.open=browseExpanded;
   });
   browse.append(browseSummary);
   const nav=element("div",null,"aoScriptureNav");
   const langControl=element("label",t.language);
   const languageSelect=element("select");
   for(const [value,name] of [["en","English"],["fr","Français"]]){
     const opt=element("option",name);opt.value=value;languageSelect.append(opt);
   }
   languageSelect.value=lang;
   languageSelect.addEventListener("change",()=>{
     const next=languageSelect.value;
     const nextEdition=next==="en"?prefs.englishEdition():DEFAULT_SCRIPTURE_EDITION[next];
     moveEdition(nextEdition);lang=next;prefs.setLanguage(lang);draw();
   });
   langControl.append(languageSelect);nav.append(langControl);
   const editionControl=element("label",t.source);
   const editionSelect=element("select");
   for(const edition of Object.values(SCRIPTURE_EDITIONS).filter(x=>x.language===lang)){
     const opt=element("option",edition.title);
     opt.value=edition.id;
     opt.disabled=!(["dr-challoner","cpdv-2009"].includes(edition.id) || edition.id===DEFAULT_SCRIPTURE_EDITION[lang] || (edition.enabled && edition.rights==="cleared"));
     editionSelect.append(opt);
   }
   editionSelect.value=editionId;
   editionSelect.addEventListener("change",()=>{
     const chosen=SCRIPTURE_EDITIONS[editionSelect.value];
     if(!chosen || chosen.language!==lang || (!["dr-challoner","cpdv-2009"].includes(chosen.id) && chosen.id!==DEFAULT_SCRIPTURE_EDITION[lang] && (!chosen.enabled || chosen.rights!=="cleared"))){draw();return;}
     moveEdition(chosen.id);
     if(lang==="en" && ["dr-challoner","cpdv-2009"].includes(editionId))prefs.setEnglishEdition(editionId);
     draw();
   });
   editionControl.append(editionSelect);nav.append(editionControl);
   if(lang==="en" && !hasScriptureWitness(editionId,location.book))browse.append(element("p",t.readable,"aoScriptureNotice"));
   if(editionId==="cpdv-2009"&&!hasScriptureWitness(editionId,location.book))browse.append(element("p","The source opens this book; the chapter and verse must be located there manually.","aoScriptureNotice"));
   const bookControl=element("label",t.book);
   const books=element("select");
   for(const book of scriptureBookCatalogue()){const opt=element("option",book);opt.value=book;books.append(opt);}
   books.value=location.book;
   books.addEventListener("change",()=>{leaveSourceSegments();location=scripturePassage({book:books.value,chapter:1,verseStart:1});draw();});
   bookControl.append(books);nav.append(bookControl);
   for(const [field,value] of [[t.chapter,location.chapter],[t.verse,location.verseStart]]){
     const label=element("label",field);const input=element("input");
     input.type="number";input.min="1";input.max=field===t.chapter?String(scriptureChapterLimit(location.book)):"200";input.step="1";input.value=String(value);
     input.addEventListener("change",()=>{
       const n=Number(input.value);
       if(!Number.isSafeInteger(n)||n<1||n>(field===t.chapter?scriptureChapterLimit(location.book):200)){input.value=String(value);return;}
       leaveSourceSegments();
       location=field===t.chapter
         ? scripturePassage({book:location.book,chapter:n,verseStart:1})
         : scripturePassage({book:location.book,chapter:location.chapter,verseStart:n});
       draw();
     });
     label.append(input);nav.append(label);
   }
   browse.append(nav);
   browse.append(element("p",t.notice,"aoScriptureNotice"));
   // The chosen passage, its expanded chapter and its commentary share one reading surface.
   // It never changes or replaces the Mass Proper, Rosary meditation or source.
   if(context?.reference){
     const contextBar=element("section",null,"aoScriptureContextBar");
     contextBar.dataset.aoScriptureContextReader=context.reference;
     const title=element("p",(lang==="fr"?"Passage cité · ":"Cited passage · ")+context.reference,"aoScriptureContextTitle");
     if(segmentSet?.length>1)contextBar.append(title);
     if(context.liturgicalArrangement){
       const arrangement=context.liturgicalArrangement;
       if(arrangement.schema!=="ao-liturgical-bible-verse-order-v1"||
          arrangement.canonicalReference!==context.reference)
         throw new Error("Liturgical verse-order notice does not match cited Bible coordinates");
       const notice=element("p",lang==="fr"?arrangement.noteFr:arrangement.noteEn,
         "aoScriptureNotice aoScriptureLiturgicalOrderNote");
       notice.setAttribute("data-scripture-liturgical-order",arrangement.canonicalReference);
       notice.setAttribute("role","note");
       contextBar.append(notice);
     }
     if(segmentSet?.length>1){
       const sequence=element("nav",null,"aoScriptureSegments");
       sequence.setAttribute("aria-label",lang==="fr"?"Passages de la lecture":"Reading passages");
       segmentSet.forEach((segment,index)=>{
         const label=segment.chapter+":"+segment.verseStart+
           (segment.verseStart===segment.verseEnd?"":"–"+segment.verseEnd);
         const step=element("button",label);
         step.type="button";step.dataset.scriptureSegmentIndex=String(index);
         step.setAttribute("aria-pressed",String(activeSegmentIndex===index));
         step.setAttribute("aria-label",(lang==="fr"?"Passage ":"Passage ")+(index+1)+" / "+segmentSet.length+": "+segment.book+" "+label);
         step.addEventListener("click",()=>{activeSegmentIndex=index;location=segmentSet[index];contextDepth="selected";commentaryVisible=false;draw();});
         sequence.append(step);
       });
       contextBar.append(sequence);
       contextBar.append(element("p",lang==="fr"
         ?"Les segments sont dans l’ordre liturgique. Les versets omis ne sont pas rétablis."
         :"Segments follow the liturgical reading. Omitted verses are not restored.","aoScriptureNotice"));
     }
     const controls=element("div",null,"aoScriptureContextControls");
     for(const [key,en,fr] of [["selected","Passage","Passage"],["chapter","Full chapter","Chapitre entier"],["commentary","Commentary","Commentaire"]]){
       const button=element("button",lang==="fr"?fr:en);
       button.type="button";button.dataset.scriptureContextDepth=key;
       button.setAttribute("aria-pressed",String(key==="commentary"?commentaryVisible:!commentaryVisible&&contextDepth===key));
       button.addEventListener("click",()=>{
         if(key==="commentary")commentaryVisible=!commentaryVisible;
         else{contextDepth=key;commentaryVisible=false;}
         draw();
         // Recreated tabs remain keyboard reachable after the panel changes.
         queueMicrotask(()=>wrap.querySelector(`[data-scripture-context-depth="${key}"]`)?.focus?.({preventScroll:true}));
       });
       controls.append(button);
     }
     contextBar.append(controls);
     if(commentaryVisible){
       const verified=verifiedScriptureCommentary(location);
       const area=element("div",null,"aoScriptureContextCommentary");
       area.setAttribute("role","region");
       area.setAttribute("aria-label",lang==="fr"?"Commentaire vérifié":"Verified commentary");
       if(isCatenaGospel(location)&&lang==="en"){
         area.append(element("h3","Catena Aurea · St Thomas Aquinas"));
         area.append(element("p","Original Father-attributed commentary (Oxford/Newman 1841–45), not an editorial paraphrase.","aoScriptureCommentaryDisclosure"));
         const status=element("p","Loading original commentary…","aoScriptureCommentaryDisclosure");
         status.setAttribute("role","status");area.append(status);
         loadCatenaForPassage(location,{fetcher:fetchCommentary}).then(nodes=>{
           if(!area.isConnected||!commentaryVisible||lang!=="en")return;
           status.remove();
           if(!nodes.length)area.append(element("p","No source fragment matches these exact verses.","aoScriptureCommentaryDisclosure"));
           for(const node of nodes){
             const item=element("section",null,"aoScriptureCatenaPericope");
             item.append(element("h4",node.citation,"aoScriptureCatenaHeading"));
             node.segments.forEach((segment,i)=>{
               const father=element("details",null,"aoScriptureFather");father.open=i<2;
               father.append(element("summary",segment.father));
               father.append(element("p",segment.text,"aoScriptureFatherText"));
               item.append(father);
             });
             if(node.source?.url){
               const link=element("a","Original Catena source ↗");link.href=node.source.url;
               link.target="_blank";link.rel="noopener noreferrer";
               link.dataset.scriptureCommentarySource="verified";item.append(link);
             }
             area.append(item);
           }
         }).catch(()=>{if(area.isConnected)status.textContent="Source unavailable; no commentary has been invented.";});
       }else if(isCatenaGospel(location)&&lang==="fr"){
         area.append(element("p","Le commentaire patristique français n’est pas encore intégré. Aucun texte anglais n’est substitué.","aoScriptureCommentaryDisclosure"));
       }else if(verified){
         area.append(element("h3",verified.title));
         area.append(element("p",lang==="fr"
           ?"La source est identifiée, mais son texte n’est pas encore intégré ici."
           :"The historical source is indexed, but its text is not yet transcribed here.","aoScriptureCommentaryDisclosure"));
         if(verified.scope==="PSALM_SECTION_IN_COMPLETE_WORK")
           area.append(element("p",(lang==="fr"?"Psaume ":"Traditional Psalm ")+location.chapter+" · Vulgate numbering","aoScriptureCommentaryDisclosure"));
         const link=element("a",lang==="fr"?"Source originale ↗":"Original commentary source ↗");
         link.href=verified.url;link.target="_blank";link.rel="noopener noreferrer";
         link.dataset.scriptureCommentarySource="verified";area.append(link);
       }else area.append(element("p",lang==="fr"
         ?"Aucun commentaire vérifié pour ce passage.":"No authenticated commentary for this passage."));
       contextBar.append(area);
     }
     wrap.append(contextBar);
   }
   const crosswalkWarning=scriptureReferenceWarning(location.book,lang);
   if(crosswalkWarning){
     const note=element("details",null,"aoScriptureReferenceWarning");
     const summary=element("summary",lang==="fr"?"Numérotation variable":"Verse numbering varies");
     summary.setAttribute("data-crosswalk-unverified",location.book);
     note.append(summary,element("p",crosswalkWarning,"aoScriptureNotice"));
     wrap.append(note);
   }
   const main=element("div",null,"aoScriptureReading");
   main.append(element("h3",passageReference(location)));
   const beforePrayer=readingPrayerDisclosure("before");
   if(beforePrayer)main.append(beforePrayer);
   const chapterEntries=records.filter(r=>validatedRecord(r,editionId)&&r.book===location.book&&r.chapter===location.chapter)
     .sort((a,b)=>a.verseStart-b.verseStart);
   // Display a source witness only with an explicit unreviewed notice; approved text uses its separate contract.
   if(context?.reference&&contextDepth==="chapter"&&!commentaryVisible&&!chapterEntries.length){
     const chapterLink=element("a",lang==="fr"?"Lire le chapitre complet à la source ↗":"Read full chapter at source ↗");
     // Verse-specific links remain in the usual action; this link deliberately
     // asks for the whole chapter in the selected textual witness.
     const chapterQuery=location.book+" "+location.chapter;
     chapterLink.href=lang==="fr"?FRENCH_INDEX:
       "https://www.biblegateway.com/passage/?version=DRA&search="+encodeURIComponent(chapterQuery);
     chapterLink.target="_blank";chapterLink.rel="noopener noreferrer";
     chapterLink.dataset.scriptureWholeChapter="";
     main.append(chapterLink);
     if(lang==="fr")main.append(element("p","Repérez le livre et le chapitre dans la Bible Crampon ; ce lien mène à l’index de l’édition.","aoScriptureNotice"));
   }
   const textBlock=element("div",null,"aoScriptureText");
   if(chapterEntries.length){
     if(chapterEntries.some(item=>item.sourceWitness)){
       const sourceNotice=element("details",null,"aoScriptureWitnessDetails");
       const status=element("summary",lang==="fr"?"Transcription · non collationnée":"Source transcription · uncollated");
       status.dataset.scriptureWitnessUnreviewed=editionId;
       status.setAttribute("aria-label",lang==="fr"?"Source non collationnée · afficher les détails":"Uncollated source · show provenance");
       sourceNotice.append(status,element("p",lang==="fr"
         ?"Transcription de la source, pas encore collationnée avec l'édition imprimée. Vérifier les versets incomplets ou divergents."
         :"Source transcription, not yet collated against the printed edition. Verify missing or divergent verses.","aoScriptureNotice aoScriptureWitnessNote"));
       // Source status stays visible; extended qualifications follow the text.
       textBlock._sourceDisclosure=sourceNotice;
     }
     const entireChapter=contextDepth==="chapter"||!context?.reference;
     const visible=chapterEntries.filter(item=>entireChapter||
       (item.verseStart>=location.verseStart&&item.verseStart<=location.verseEnd));
     const missing=scriptureWitnessEmptySlots(editionId,location.book,location.chapter)
       .filter(v=>entireChapter||(v>=location.verseStart&&v<=location.verseEnd));
     for(const item of visible){
       const verse=element("p",item.text,"aoScriptureVerse");verse.dataset.verse=String(item.verseStart);
       const sup=element("span",String(item.verseStart)+" ");sup.className="aoScriptureVerseNumber";
       verse.prepend(sup);textBlock.append(verse);
     }
     if(missing.length){
       const note=element("p",(lang==="fr"
         ?"La transcription de la source ne contient pas le texte des versets : "
         :"The source transcription has no text for verse(s): ")+
         missing.join(", ")+".","aoScriptureNotice aoScriptureMissingVerses");
       note.dataset.scriptureSourceGaps=missing.join(",");
       textBlock.append(note);
     }
     if(!visible.length&&!missing.length)
       textBlock.append(element("p",lang==="fr"
         ?"Aucun texte disponible pour ces versets dans la transcription de référence."
         :"The source transcription contains no text for these selected verses.","aoScriptureNotice"));
   } else textBlock.append(element("p",t.unavailable));
   if(textBlock._sourceDisclosure)textBlock.append(textBlock._sourceDisclosure);
   main.append(textBlock);
   const afterPrayer=readingPrayerDisclosure("after");
   if(afterPrayer)main.append(afterPrayer);
   const textualNotes=cpdvTextualNotesFor(editionId,location);
   for(const note of textualNotes){
     const details=element("details",null,"aoScriptureSourceNote");
     details.dataset.scriptureSourceNote=note.reference;
     details.append(element("summary","Text and traditional interpretation"));
     details.append(element("p",note.text));
     for(const [label,url] of [["CPDV original",note.authorSource],["Douay–Rheims",note.traditionalSource]]){
       const link=element("a",label);link.href=url;link.target="_blank";link.rel="noopener noreferrer";
       details.append(link);
     }
     main.append(details);
   }
   const actions=element("div",null,"aoScriptureActions");
   const source=element("button",t.open);source.type="button";
   const url=editionSource();source.disabled=!url;
   source.addEventListener("click",()=>linkToSource(editionSource()));actions.append(source);
   const bookmark=element("button",t.save);bookmark.type="button";
   const present=prefs.load().bookmarks.some(b=>b.editionId===editionId&&b.book===location.book&&b.chapter===location.chapter&&b.verseStart===location.verseStart);
   bookmark.textContent=present?t.saved:t.save;
   bookmark.setAttribute("aria-pressed",String(present));
   bookmark.addEventListener("click",()=>{prefs.toggleBookmark(location,editionId);draw();});actions.append(bookmark);
   if(!context?.reference)for(const [direction,label] of [[-1,t.previous],[1,t.next]]){
     const button=element("button",label);button.type="button";
     button.disabled=direction<0 ? location.chapter===1 : location.chapter>=scriptureChapterLimit(location.book);
     button.addEventListener("click",()=>{leaveSourceSegments();location=scripturePassage({book:location.book,chapter:location.chapter+direction,verseStart:1});draw();});
     actions.append(button);
   }
   main.append(actions);
   // Commentary is a reading-depth panel, not an additional section competing with Scripture.
   if(!commentaryVisible||!context?.reference)wrap.append(main);
   // One secondary disclosure shared by every source-owned Scripture entry.
   const tools=element("details",null,"aoScriptureTools");
   tools.open=toolsExpanded;
   const toolsSummary=element("summary",lang==="fr"?"Explorer · bibliothèque et liens":"Explore · library & connections");
   toolsSummary.addEventListener("click",event=>{
     event.preventDefault();toolsExpanded=!tools.open;tools.open=toolsExpanded;
   });
   const toolsBody=element("div",null,"aoScriptureToolsBody");
   tools.append(toolsSummary,toolsBody);wrap.append(tools);
   // Lazy reverse index from the exact same cited-object source registries.
   // Presence here indicates intersecting verses, not an identical rite.
   const related=element("details",null,"aoScriptureRelated");
   related.dataset.scriptureRelatedObjects="";
   related.open=relatedExpanded;
   const relatedSummary=element("summary",lang==="fr"?"Liens dans Ad Orientem":"Connected in Ad Orientem");
   const relatedBody=element("div",null,"aoScriptureRelatedList");
   const relationText=Object.freeze({
     COMPOSITE_DEVOTION:["Partly biblical prayer, not a verbatim whole prayer","Prière composée, non intégralement biblique"],
     GOSPEL_PASSION_CONTEXT:["Gospel context for this station","Contexte évangélique de cette station"],
     BIBLICAL_PSALM_TRADITIONAL_NUMBERING:["Psalm in traditional numbering","Psaume en numérotation traditionnelle"],
     traditional_marian_typology:["Traditional Marian typology","Typologie mariale traditionnelle"],
     related_scripture_for_doctrinal_mystery:["Supporting passage, not direct narrative","Passage associé, non récit direct"],
     LITURGICAL_ADAPTATION:["Liturgical adaptation of biblical words","Adaptation liturgique de paroles bibliques"]
   });
   const paintRelated=async()=>{
     if(!related.open||!related.isConnected)return;
     relatedBody.replaceChildren(element("p",lang==="fr"?"Recherche des liens…":"Finding source-linked objects…","aoScriptureNotice"));
     try{
       const module=await import("./related-objects.js");
       if(!related.isConnected||!related.open)return;
       const selectedCalendarState=globalThis.AO_RUNTIME_V8?.store?.getState?.()??null;
       const hits=await module.scriptureLinkedObjectsForPassageWithAtlas(location,{
         limit:40,selectedCalendarState
       });
       if(!related.isConnected||!related.open)return;
       relatedBody.replaceChildren();
       if(!hits.length){relatedBody.append(element("p",lang==="fr"?"Aucun autre objet lié à ces versets.":"No documented cross-module connections for these verses.","aoScriptureNotice"));return;}
       relatedBody.append(element("p",lang==="fr"
         ?"Objets citant explicitement un verset commun. Ce recoupement ne prouve pas une identité de rites, d’événements ou d’interprétations."
         :"Objects explicitly citing overlapping verses. Overlap does not establish identical rites, events or interpretations.","aoScriptureRelatedIntro"));
       for(const hit of hits){
         const row=element("article",null,"aoScriptureRelatedObject");
         row.dataset.scriptureLinkedObject=hit.id;
         row.append(element("strong",hit.title[lang]));
         row.append(element("small",hit.reference,"aoScriptureRelatedReference"));
         const explanation=hit.description?.[lang]||relationText[hit.relation]?.[lang==="fr"?1:0]||
           (lang==="fr"?"Référence biblique liée à cet objet":"Source-linked biblical reference for this object");
         row.append(element("p",explanation,"aoScriptureRelatedExplanation"));
         const read=element("button",lang==="fr"?"Lire ce passage cité":"Read this cited passage");
         read.type="button";read.dataset.scriptureReadLinkedObject=hit.id;
         read.addEventListener("click",()=>{
           relatedTrail.push({
             location,context,contextDepth,commentaryVisible,relatedExpanded,
             segmentSet,activeSegmentIndex,browseExpanded,toolsExpanded,scrollTop:root.scrollTop
           });
           segmentSet=hit.segments?scriptureSegments(hit.segments):null;
           activeSegmentIndex=segmentSet?0:-1;
           location=segmentSet?segmentSet[0]:scripturePassage(hit.passage);
           context=Object.freeze({reference:hit.reference,passage:location,
             ...(segmentSet?{segments:segmentSet}:{})});
           contextDepth="selected";commentaryVisible=false;
           relatedExpanded=false;browseExpanded=false;toolsExpanded=false;
           draw();root.scrollTop=0;
           queueMicrotask(()=>wrap.querySelector("[data-scripture-context-depth='selected']")?.focus?.({preventScroll:true}));
         });
         row.append(read);
         if(hit.target&&typeof onOpenRelatedObject==="function"&&canOpenRelatedObject(hit)){
           const launch=element("button",lang==="fr"?
             "Ouvrir cet objet dans Ad Orientem":"Open this object in Ad Orientem");
           launch.type="button";launch.dataset.scriptureOpenRelatedObject=hit.id;
           launch.addEventListener("click",async()=>{
             launch.disabled=true;
             let ok=false;
             try{ok=await onOpenRelatedObject(hit)}
             catch(error){console.error("Scripture object handoff failed",error)}
             // Only suppress duplicate taps during launch. A successful
             // destination must remain keyboard-focusable on reciprocal Back.
             launch.disabled=false;
             if(!ok && row.isConnected){
               launch.disabled=false;
               let warning=row.querySelector("[data-scripture-related-launch-error]");
               if(!warning){warning=element("p",null,"aoScriptureNotice");warning.dataset.scriptureRelatedLaunchError="";row.append(warning)}
               warning.textContent=lang==="fr"
                 ?"Cette fiche est indisponible ; la lecture biblique est conservée."
                 :"The destination could not open; your Scripture reading is unchanged.";
             }
           });
           row.append(launch);
         }
         relatedBody.append(row);
       }
     }catch{
       if(relatedBody.isConnected)relatedBody.replaceChildren(element("p",lang==="fr"
         ?"Index momentanément indisponible.":"Related-object index currently unavailable.","aoScriptureNotice"));
     }
   };
   relatedSummary.addEventListener("click",e=>{
     e.preventDefault();relatedExpanded=!related.open;related.open=relatedExpanded;
     if(relatedExpanded)void paintRelated();
   });
   related.append(relatedSummary,relatedBody);toolsBody.append(related);
   if(relatedExpanded)void paintRelated();
   toolsBody.append(browse);
   const searchSection=element("details",null,"aoScriptureSearch");
   searchSection.append(element("summary",t.search));
   const searchField=element("input");searchField.type="search";searchField.placeholder=t.find;searchField.value=query;
   const resultArea=element("div",null,"aoScriptureResults");
   const paintResults=()=>{
     resultArea.replaceChildren();
     const matches=searchCertifiedScripture(records,{query,editionId,limit:50})
       .filter(r=>validatedRecord(records.find(x=>x.editionId===r.editionId&&x.book===r.book&&x.chapter===r.chapter&&x.verseStart===r.verseStart),editionId));
     const bookMatches=query.trim()?searchScriptureBooks(query).slice(0,20):[];
     if(!matches.length&&!bookMatches.length)resultArea.append(element("p",t.none));
     for(const book of bookMatches){
       const button=element("button",book);button.type="button";
       button.addEventListener("click",()=>{leaveSourceSegments();location=scripturePassage({book,chapter:1,verseStart:1});draw();});resultArea.append(button);
     }
     for(const match of matches){
       const button=element("button",passageReference(match)+" — "+match.text.slice(0,140));button.type="button";
       button.addEventListener("click",()=>{leaveSourceSegments();location=scripturePassage(match);draw();});resultArea.append(button);
     }
   };
   searchField.addEventListener("input",()=>{query=searchField.value;paintResults();});
   searchSection.append(searchField,resultArea);toolsBody.append(searchSection);paintResults();
   const savedSection=element("details",null,"aoScriptureBookmarks");
   savedSection.append(element("summary",t.bookmarks));
   const marks=prefs.load().bookmarks.filter(b=>b.editionId===editionId);
   if(!marks.length)savedSection.append(element("p",t.noBookmarks));
   for(const mark of marks){
     const button=element("button",passageReference(mark));button.type="button";
     button.addEventListener("click",()=>{leaveSourceSegments();location=scripturePassage(mark);draw();});
     savedSection.append(button);
   }
   toolsBody.append(savedSection);
   const oldMarks=prefs.load().bookmarks.filter(b=>b.editionId===null);
   if(oldMarks.length){
     const older=element("details",null,"aoScriptureUnassignedBookmarks");
     older.append(element("summary",lang==="fr"?"Anciens signets sans édition":"Older bookmarks without a known edition"));
     older.append(element("p",lang==="fr"?"Ces signets ont été créés sans identifier la traduction. Attribuez-en un seulement après vérification.":"These older bookmarks did not record a Bible edition. Assign one only after confirming the source."));
     for(const mark of oldMarks){
       const add=element("button",(lang==="fr"?"Attribuer à cette édition : ":"Assign to this edition: ")+passageReference(mark));
       add.type="button";add.addEventListener("click",()=>{prefs.assignLegacyBookmark(mark,editionId);draw();});older.append(add);
     }
     toolsBody.append(older);
   }
   const rosary=element("details",null,"aoScriptureRosary");
   rosary.append(element("summary",t.rosary));
   for(const [id,item] of Object.entries(ROSARY_SCRIPTURE_LINKS)){
     const line=element("div",null,"aoScriptureMystery");
     const button=element("button",id+" · "+passageReference(item.passage));button.type="button";
     button.addEventListener("click",()=>{leaveSourceSegments();location=item.passage;draw();});
     line.append(button,element("p",item.editorialSummary[lang]));rosary.append(line);
   }
   toolsBody.append(rosary);
 }
 draw();
 return Object.freeze({
   setLanguage(next){if(!L[next])throw new Error("Unsupported language");moveEdition(next==="en"?prefs.englishEdition():DEFAULT_SCRIPTURE_EDITION[next]);lang=next;prefs.setLanguage(lang);draw();},
   setPassage(next){leaveSourceSegments();location=scripturePassage(next);draw();},
   setRecords(next){
      if(!Array.isArray(next))throw new TypeError("Scripture records array required");
      records=next;
      // Source-witness loading must never replace an actively edited chapter,
      // verse or edition control. Checking only for a changed field value is
      // insufficient: the load can complete between focus and the input event,
      // leaving Playwright/touch change on a newly recreated (stale) control.
      const focused=document.activeElement;
      if(focused?.closest?.(".aoScriptureNav") && wrap.contains(focused)){
        // The record cache has already been updated. Apply it after genuine
        // navigation focus leaves the control, unless an intervening change
        // has rebuilt the view and detached the old input.
        focused.addEventListener("blur",()=>{
          if(wrap.contains(focused))draw();
        },{once:true});
        return;
      }
      const closeFocused=wrap.querySelector("[data-scripture-close]")===focused;
      draw();
      if(closeFocused)wrap.querySelector("[data-scripture-close]")?.focus?.({preventScroll:true});
    },
   status(){return Object.freeze({language:lang,editionId,passage:location,contextReference:context?.reference??null,contextDepth,commentaryVisible,segmentCount:segmentSet?.length??0,activeSegmentIndex,bookmarks:prefs.load().bookmarks.length});},
   resume(){
     // Canonical shell transitions can detach the original reading subtree.
     // Reattach it without resetting the selected passage or edition.
     if(!root.contains(wrap)){root.replaceChildren(wrap);draw();}
     return true;
   },
   destroy(){root.replaceChildren();}
 });
}
