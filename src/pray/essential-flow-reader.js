import {essentialHolyCardParts} from "./essential-holy-card-parts.js";

/**
 * Essential Prayer continuous reading alternative. The approved original
 * Claude reversible Holy Card is the default F01 presentation; this separate
 * reader is opt-in and uses the exact same canonical prayer data.
 */
export const ESSENTIAL_FLOW_READER_SCHEMA="ao-essential-flow-reader-v1";
/** An explicitly selected reading alternative; never replace the approved F01 card by default. */
export function essentialFlowReaderEnabled(win=globalThis){
 try{return new URLSearchParams(win?.location?.search||"").get("aoEssentialFlow")==="1"}
 catch{return false}
}

const safeImage=src=>typeof src==="string"&&(/^https:\/\//.test(src)||/^\/assets\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp)$/i.test(src));
const prayerBeats=(id,p,language,esc)=>!language||!p[language]?"":(essentialHolyCardParts(id,language,p[language])||[])
 .map((part,i)=>'<span class="aoEssentialFlowBeat'+(part.collective?' aoEssentialFlowCollective':'')+
 '" data-ao-essential-index="'+i+'">'+esc(part.text.trim())+'</span>').join("");
export function renderEssentialFlowReader({id,p,face,vernacular="en",esc,artUrl="",artCredit=null}={}){
 if(typeof esc!=="function")throw new TypeError("Escape function required");
 if(!id||!p)return "";
 const vern=p[vernacular]?vernacular:p.en?"en":p.fr?"fr":null;
 const latin=!!p.la;
 if(!latin&&!vern)return "";
 const available=latin&&vern;
 const selected=face==="both"&&available?"both":
  face==="la"&&latin?"la":face===vern&&vern?"vern":latin?"la":"vern";
 const title=(vern==="fr"&&p.titleFr)||p.title||id;
 const faceBlock=(key,language,contents)=>'<span class="aoEssentialFlowFace'+(key==="both"?' aoEssentialFlowBoth':'')+
  '" data-ao-essential-flow-face="'+key+'" lang="'+language+'"'+(selected===key?'':' hidden')+'>'+contents+'</span>';
 const laText=latin?prayerBeats(id,p,"la",esc):"";
 const vernText=vern?prayerBeats(id,p,vern,esc):"";
 const bothText=available?
  '<span class="aoEssentialFlowParallel" lang="la">'+laText+'</span>'+
  '<span class="aoEssentialFlowParallel" lang="'+vern+'">'+vernText+'</span>':"";
 const faceMarkup=(latin?faceBlock("la","la",laText):"")+
  (vern?faceBlock("vern",vern,vernText):"")+
  (available?faceBlock("both",vern,bothText):"");
 const image=safeImage(artUrl)?'<img src="'+esc(artUrl)+'" alt="" loading="lazy" decoding="async">':"";
 const credit=image&&artCredit?.source&&/^https:\/\//.test(artCredit.source)?
  '<a class="aoEssentialFlowCredit" href="'+esc(artCredit.source)+'" target="_blank" rel="noopener noreferrer">'+
   esc((artCredit.artist||"")+" · "+(artCredit.title||"Artwork source"))+'</a>':"";
 const label=available?(selected==="la"?"Show vernacular prayer":"Show Latin prayer"):"";
 const hint=available?(selected==="la"?"Tap the text to see the translation":"Tap the text for Latin"):"";
 const content=available?
  '<div class="aoEssentialFlowTextToggle" data-p435930-essential-flow-toggle>'+faceMarkup+'</div>':
  '<div class="aoEssentialFlowPlain">'+faceMarkup+'</div>';
 return '<article class="aoP435930Prayer aoEssentialFlow" data-ao-essential-card="'+esc(id)+
  '" data-ao-essential-flow="true" data-ao-essential-current="'+esc(selected)+
  '" data-ao-essential-vernacular="'+esc(vern||"")+'">'+
  (image?'<figure class="aoEssentialFlowArt" data-ao-editorial-slot="COV-'+esc(id)+
    '" data-ao-editorial-source="released-exact">'+image+credit+'</figure>':"")+
  '<header class="aoEssentialFlowHead"><span class="aoEssentialFlowCross" aria-hidden="true">✠</span>'+
  '<h2>'+esc(title)+'</h2></header>'+
  content+
  (hint?'<p class="aoEssentialFlowHint" data-ao-essential-flow-hint>'+esc(hint)+'</p>':"")+
  (available?'<button type="button" class="aoEssentialFlowLanguageAction" data-p435930-essential-flow-action>'+esc(label)+'</button>':"")+
  '</article>';
}
