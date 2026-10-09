import { SCRIPTURE_EDITIONS, DEFAULT_SCRIPTURE_EDITION, scripturePassage } from "./catalogue.js";
import { scriptureBookCatalogue, sourceReadingLink, ROSARY_SCRIPTURE_LINKS } from "./links.js";
import { passageReference } from "./passages.js";
import { createScripturePreferences } from "./preferences.js";
import { searchCertifiedScripture, searchScriptureBooks } from "./search.js";
import { scriptureReferenceWarning, scriptureParallelReferenceState } from "./reference-safety.js";
import { cpdvTextualNotesFor } from "./cpdv-textual-notes.js";
import { verifiedScriptureCommentary } from "./context.js";
import {scriptureChapterLimit} from "./chapter-counts.js";

const L={
 en:{heading:"Sacred Scripture",notice:"Traditional Catholic Bible. The full text appears here only when an approved edition is installed.",
  book:"Book",chapter:"Chapter",verse:"Verse",open:"Read at source",save:"Bookmark",saved:"Bookmarked",
  bookmarks:"Bookmarks",search:"Search",find:"Search approved text",results:"Results",none:"No verified local text found.",
  rosary:"Rosary mysteries",source:"Source edition", unavailable:"This chapter is not available offline. Open the Catholic edition at its source.",
  readable:"Douay–Rheims is the traditional reading. CPDV is the selected free alternative for easier English, but its wording and verse numbering still require verification before full text can appear inside the app.",
  frenchSource:"Crampon 1923 source",close:"Close",next:"Next chapter",previous:"Previous chapter",noBookmarks:"No bookmarks saved", language:"Language"},
 fr:{heading:"Sainte Écriture",notice:"Bible catholique traditionnelle. Le texte intégral n'apparaît qu'après validation et intégration d'une édition autorisée.",
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
 return Boolean(edition?.enabled && edition.rights==="cleared" &&
  record?.editionId===editionId && record?.reviewed===true &&
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
 storage=globalThis.localStorage,records=[],onClose=()=>{},onNeedBook=()=>{},passage=null,context=null
}={}){
 if(!root||typeof root.replaceChildren!=="function")throw new TypeError("Scripture root required");
 if(!Array.isArray(records))throw new TypeError("Scripture records array required");
 const prefs=createScripturePreferences(storage);
 const stored=Boolean(storage?.getItem?.("ao-scripture-v1"));
 const preference=stored?prefs.load().language:language;
 let lang=["en","fr"].includes(preference)?preference:"en";
 let location=passage?scripturePassage(passage):scripturePassage({book:"Luke",chapter:1,verseStart:28});
 let query="";
 let section="read";
 let contextDepth="selected";
 let commentaryVisible=false;
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
 function draw(){
   const t=L[lang];
   wrap.replaceChildren();
   if(SCRIPTURE_EDITIONS[editionId]?.enabled && SCRIPTURE_EDITIONS[editionId]?.rights==="cleared") {
     queueMicrotask(()=>onNeedBook({book:location.book,editionId}));
   }
   const heading=element("header",null,"aoScriptureHeader");
   heading.append(element("h2",t.heading));
   const close=element("button",t.close);close.type="button";close.setAttribute("data-scripture-close","");
   close.addEventListener("click",onClose);heading.append(close);wrap.append(heading);
   wrap.append(element("p",t.notice,"aoScriptureNotice"));
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
     opt.disabled=!(edition.id===DEFAULT_SCRIPTURE_EDITION[lang] || edition.id==="cpdv-2009" || (edition.enabled && edition.rights==="cleared"));
     editionSelect.append(opt);
   }
   editionSelect.value=editionId;
   editionSelect.addEventListener("change",()=>{
     const chosen=SCRIPTURE_EDITIONS[editionSelect.value];
     if(!chosen || chosen.language!==lang || (chosen.id!==DEFAULT_SCRIPTURE_EDITION[lang] && chosen.id!=="cpdv-2009" && (!chosen.enabled || chosen.rights!=="cleared"))){draw();return;}
     moveEdition(chosen.id);
     if(lang==="en" && ["dr-challoner","cpdv-2009"].includes(editionId))prefs.setEnglishEdition(editionId);
     draw();
   });
   editionControl.append(editionSelect);nav.append(editionControl);
   if(lang==="en")wrap.append(element("p",t.readable,"aoScriptureNotice"));
   if(editionId==="cpdv-2009")wrap.append(element("p","The source opens this book; the chapter and verse must be located there manually.","aoScriptureNotice"));
   const bookControl=element("label",t.book);
   const books=element("select");
   for(const book of scriptureBookCatalogue()){const opt=element("option",book);opt.value=book;books.append(opt);}
   books.value=location.book;
   books.addEventListener("change",()=>{location=scripturePassage({book:books.value,chapter:1,verseStart:1});draw();});
   bookControl.append(books);nav.append(bookControl);
   for(const [field,value] of [[t.chapter,location.chapter],[t.verse,location.verseStart]]){
     const label=element("label",field);const input=element("input");
     input.type="number";input.min="1";input.max=field===t.chapter?String(scriptureChapterLimit(location.book)):"200";input.step="1";input.value=String(value);
     input.addEventListener("change",()=>{
       const n=Number(input.value);
       if(!Number.isSafeInteger(n)||n<1||n>(field===t.chapter?scriptureChapterLimit(location.book):200)){input.value=String(value);return;}
       location=field===t.chapter
         ? scripturePassage({book:location.book,chapter:n,verseStart:1})
         : scripturePassage({book:location.book,chapter:location.chapter,verseStart:n});
       draw();
     });
     label.append(input);nav.append(label);
   }
   wrap.append(nav);
   // Context is a single quiet row beneath the Bible/edition controls.
   // It never changes or replaces the Mass Proper, Rosary meditation or source.
   if(context?.reference){
     const contextBar=element("section",null,"aoScriptureContextBar");
     contextBar.dataset.aoScriptureContextReader=context.reference;
     const title=element("p",(lang==="fr"?"Passage cité · ":"Cited passage · ")+context.reference,"aoScriptureContextTitle");
     contextBar.append(title);
     const controls=element("div",null,"aoScriptureContextControls");
     for(const [key,en,fr] of [["selected","Verses","Versets"],["chapter","Chapter","Chapitre"],["commentary","Commentary","Commentaire"]]){
       const button=element("button",lang==="fr"?fr:en);
       button.type="button";button.dataset.scriptureContextDepth=key;
       button.setAttribute("aria-pressed",String(key==="commentary"?commentaryVisible:!commentaryVisible&&contextDepth===key));
       button.addEventListener("click",()=>{
         if(key==="commentary")commentaryVisible=!commentaryVisible;
         else{contextDepth=key;commentaryVisible=false;}
         draw();
       });
       controls.append(button);
     }
     contextBar.append(controls);
     if(commentaryVisible){
       const verified=verifiedScriptureCommentary(location);
       const area=element("div",null,"aoScriptureContextCommentary");
       area.setAttribute("role","region");
       area.setAttribute("aria-label",lang==="fr"?"Commentaire vérifié":"Verified commentary");
       if(verified){
         area.append(element("p",verified.title));
         area.append(element("p",verified.type==="PATRISTIC_COMPILATION"
           ?(lang==="fr"?"Compilation patristique attribuée, distincte du texte inspiré.":"Attributed patristic compilation, distinct from inspired Scripture.")
           :(lang==="fr"?"Exégèse catholique historique ; interprétation humaine, non texte inspiré.":"Historical Catholic exegesis; human interpretation, not inspired Scripture.")));
         if(verified.scope==="PSALM_SECTION_IN_COMPLETE_WORK"){
           area.append(element("p",(lang==="fr"?"Ouvrez le sommaire à Psaume ":"Use the contents for Psalm ")+location.chapter+
             (lang==="fr"?" ; numérotation traditionnelle.":"; traditional numbering.")));
         }
         const link=element("a",lang==="fr"?"Lire le commentaire à la source ↗":"Read commentary at source ↗");
         link.href=verified.url;link.target="_blank";link.rel="noopener noreferrer";
         link.dataset.scriptureCommentarySource="verified";area.append(link);
       }else area.append(element("p",lang==="fr"
         ?"Aucun commentaire authentifié pour ce passage. Aucune attribution n’est inventée."
         :"No authenticated passage-specific commentary is currently linked. No attribution is invented."));
       contextBar.append(area);
     }
     wrap.append(contextBar);
   }
   const crosswalkWarning=scriptureReferenceWarning(location.book,lang);
   if(crosswalkWarning){
     const notice=element("p",crosswalkWarning,"aoScriptureNotice aoScriptureReferenceWarning");
     notice.setAttribute("role","status");
     notice.setAttribute("data-crosswalk-unverified",location.book);
     wrap.append(notice);
   }
   const main=element("div",null,"aoScriptureReading");
   main.append(element("h3",passageReference(location)));
   if(context?.reference&&contextDepth==="chapter"&&!commentaryVisible){
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
   const chapterEntries=records.filter(r=>validatedRecord(r,editionId)&&r.book===location.book&&r.chapter===location.chapter)
     .sort((a,b)=>a.verseStart-b.verseStart);
   const textBlock=element("div",null,"aoScriptureText");
   if(chapterEntries.length){
     for(const item of chapterEntries.filter(item=>contextDepth==="chapter"||!context?.reference|| (item.verseStart>=location.verseStart&&item.verseStart<=location.verseEnd))){
       const verse=element("p",item.text,"aoScriptureVerse");verse.dataset.verse=String(item.verseStart);
       const sup=element("span",String(item.verseStart)+" ");sup.className="aoScriptureVerseNumber";
       verse.prepend(sup);textBlock.append(verse);
     }
   } else textBlock.append(element("p",t.unavailable));
   main.append(textBlock);
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
   for(const [direction,label] of [[-1,t.previous],[1,t.next]]){
     const button=element("button",label);button.type="button";
     button.disabled=direction<0 ? location.chapter===1 : location.chapter>=scriptureChapterLimit(location.book);
     button.addEventListener("click",()=>{location=scripturePassage({book:location.book,chapter:location.chapter+direction,verseStart:1});draw();});
     actions.append(button);
   }
   main.append(actions);wrap.append(main);
   const searchSection=element("section",null,"aoScriptureSearch");
   searchSection.append(element("h3",t.search));
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
       button.addEventListener("click",()=>{location=scripturePassage({book,chapter:1,verseStart:1});draw();});resultArea.append(button);
     }
     for(const match of matches){
       const button=element("button",passageReference(match)+" — "+match.text.slice(0,140));button.type="button";
       button.addEventListener("click",()=>{location=scripturePassage(match);draw();});resultArea.append(button);
     }
   };
   searchField.addEventListener("input",()=>{query=searchField.value;paintResults();});
   searchSection.append(searchField,resultArea);wrap.append(searchSection);paintResults();
   const savedSection=element("details",null,"aoScriptureBookmarks");
   savedSection.append(element("summary",t.bookmarks));
   const marks=prefs.load().bookmarks.filter(b=>b.editionId===editionId);
   if(!marks.length)savedSection.append(element("p",t.noBookmarks));
   for(const mark of marks){
     const button=element("button",passageReference(mark));button.type="button";
     button.addEventListener("click",()=>{location=scripturePassage(mark);draw();});
     savedSection.append(button);
   }
   wrap.append(savedSection);
   const oldMarks=prefs.load().bookmarks.filter(b=>b.editionId===null);
   if(oldMarks.length){
     const older=element("details",null,"aoScriptureUnassignedBookmarks");
     older.append(element("summary",lang==="fr"?"Anciens signets sans édition":"Older bookmarks without a known edition"));
     older.append(element("p",lang==="fr"?"Ces signets ont été créés sans identifier la traduction. Attribuez-en un seulement après vérification.":"These older bookmarks did not record a Bible edition. Assign one only after confirming the source."));
     for(const mark of oldMarks){
       const add=element("button",(lang==="fr"?"Attribuer à cette édition : ":"Assign to this edition: ")+passageReference(mark));
       add.type="button";add.addEventListener("click",()=>{prefs.assignLegacyBookmark(mark,editionId);draw();});older.append(add);
     }
     wrap.append(older);
   }
   const rosary=element("details",null,"aoScriptureRosary");
   rosary.append(element("summary",t.rosary));
   for(const [id,item] of Object.entries(ROSARY_SCRIPTURE_LINKS)){
     const line=element("div",null,"aoScriptureMystery");
     const button=element("button",id+" · "+passageReference(item.passage));button.type="button";
     button.addEventListener("click",()=>{location=item.passage;draw();});
     line.append(button,element("p",item.editorialSummary[lang]));rosary.append(line);
   }
   wrap.append(rosary);
 }
 draw();
 return Object.freeze({
   setLanguage(next){if(!L[next])throw new Error("Unsupported language");moveEdition(next==="en"?prefs.englishEdition():DEFAULT_SCRIPTURE_EDITION[next]);lang=next;prefs.setLanguage(lang);draw();},
   setPassage(next){location=scripturePassage(next);draw();},
   setRecords(next){if(!Array.isArray(next))throw new TypeError("Scripture records array required");records=next;draw();},
   status(){return Object.freeze({language:lang,editionId,passage:location,contextReference:context?.reference??null,contextDepth,commentaryVisible,bookmarks:prefs.load().bookmarks.length});},
   destroy(){root.replaceChildren();}
 });
}
