import { SCRIPTURE_EDITIONS } from "./catalogue.js";
import { scriptureBookCatalogue, sourceReadingLink, ROSARY_SCRIPTURE_LINKS } from "./links.js";
import { scripturePassage } from "./catalogue.js";
import { passageReference } from "./passages.js";
function el(tag, text, cls) {
 const element=document.createElement(tag);
 if(text!==undefined) element.textContent=text;
 if(cls) element.className=cls;
 return element;
}
/**
 * First usable Scripture entry point, functioning before in-app Bible licensing.
 * Opens a source edition externally; it never impersonates Bible text.
 */
export function mountScriptureLibrary(root, {language="en", openExternal=url=>window.open(url,"_blank","noopener,noreferrer")}={}) {
 if(!root || typeof root.replaceChildren!=="function") throw new TypeError("Root required");
 if(!["en","fr"].includes(language)) throw new Error("Unsupported language");
 let selectedLanguage=language;
 const frame=el("section",undefined,"ao-scripture-library");
 frame.setAttribute("aria-label","Sacred Scripture library");
 root.replaceChildren(frame);
 function paint() {
   frame.replaceChildren();
   const heading=el("h2",selectedLanguage==="fr"?"Sainte Écriture":"Sacred Scripture");
   frame.append(heading);
   const disclaimer=el("p",selectedLanguage==="fr"?
     "Ouvrir le texte biblique catholique dans la source indiquée. Les résumés ne sont pas des citations.":
     "Open the Catholic Bible at its source. Editorial summaries are not biblical quotations.");
   frame.append(disclaimer);
   const languageToggle=el("button",selectedLanguage==="fr"?"English":"Français");
   languageToggle.type="button";
   languageToggle.addEventListener("click",()=>{selectedLanguage=selectedLanguage==="en"?"fr":"en";paint();});
   frame.append(languageToggle);
   const editions=el("p",selectedLanguage==="fr"?"Édition française : Crampon 1923":"English default: Douay–Rheims (Challoner). Knox pending licensing.");
   frame.append(editions);
   const label=el("label",selectedLanguage==="fr"?"Livre":"Book");
   const bookSelect=el("select");
   for(const book of scriptureBookCatalogue()) {
     const opt=el("option",book);
     opt.value=book;
     bookSelect.append(opt);
   }
   label.append(bookSelect);
   frame.append(label);
   const chapLabel=el("label",selectedLanguage==="fr"?"Chapitre":"Chapter");
   const chapter=el("input");
   chapter.type="number";chapter.min="1";chapter.step="1";chapter.value="1";
   chapLabel.append(chapter);frame.append(chapLabel);
   const verseLabel=el("label",selectedLanguage==="fr"?"Verset":"Verse");
   const verse=el("input");
   verse.type="number";verse.min="1";verse.step="1";verse.value="1";
   verseLabel.append(verse);frame.append(verseLabel);
   const go=el("button",selectedLanguage==="fr"?"Consulter Crampon 1923":"Read in Douay–Rheims");
   go.type="button";
   const status=el("p");
   status.setAttribute("role","status");
   go.addEventListener("click",()=>{
     try {
       const p=scripturePassage({book:bookSelect.value,chapter:Number(chapter.value),verseStart:Number(verse.value)});
       // The general French full-book URL cannot guarantee chapter/verse resolution;
       // do not mislabel an English Douay–Rheims link as French Crampon text.
       if(selectedLanguage==="fr") {
         status.textContent="Lien vers la bibliothèque Crampon 1923 (navigation par livre sur le site source).";
         openExternal("https://fr.wikisource.org/wiki/Bible_Crampon_1923");
       } else {
         status.textContent=passageReference(p);
         openExternal(sourceReadingLink(p));
       }
     } catch { status.textContent=selectedLanguage==="fr"?"Référence invalide.":"Invalid reference."; }
   });
   frame.append(go,status);
   const sub=el("h3",selectedLanguage==="fr"?"Mystères du Rosaire":"Rosary mysteries");
   frame.append(sub);
   const index=el("div",undefined,"ao-scripture-mystery-index");
   for(const [id,item] of Object.entries(ROSARY_SCRIPTURE_LINKS)) {
     const wrap=el("article",undefined,"ao-scripture-mystery");
     wrap.append(el("h4",id+" · "+passageReference(item.passage)));
     wrap.append(el("p",item.editorialSummary[selectedLanguage]));
     const link=el("button",selectedLanguage==="fr"?"Lire dans Crampon 1923":"Read in Douay–Rheims");
     link.type="button";
     link.addEventListener("click",()=>{
       if(selectedLanguage==="en") openExternal(sourceReadingLink(item.passage));
       else openExternal("https://fr.wikisource.org/wiki/Bible_Crampon_1923");
     });
     wrap.append(link);
     index.append(wrap);
   }
   frame.append(index);
 }
 paint();
 return Object.freeze({setLanguage(lang){if(!["en","fr"].includes(lang))throw new Error("Unsupported language");selectedLanguage=lang;paint();},destroy(){root.replaceChildren();}});
}
