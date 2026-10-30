/** B30 presentation inside the existing Pray shell; no separate engine. */
import {LITTLE_CROWN_B30_SOURCE,LITTLE_CROWN_B30_BEADS,littleCrownStep} from "./little-crown-b30.js";
export function renderLittleCrownB30({index=0,latin=false,french=false,head,L,esc,nl,f07Band=""}){
 const position=Math.max(0,Math.min(14,index));
 const langCode=latin?"la":(french?"fr":"en");
 const step=littleCrownStep(position,langCode);
 if(!step)return "";
 const bead=x=>{
  const title=x.index<3?L(["Jesus","Mary","Joseph"][x.index],["Jésus","Marie","Joseph"][x.index]):
   L("Holy Childhood · bead "+(x.index-2),"Sainte Enfance · grain "+(x.index-2));
  return '<button type="button" data-p435930-crown-bead="'+x.index+'" class="'+
   (x.group==="holy-family"?"family ":"")+(x.index===position?"active":x.index<position?"done":"")+'" '+
   (x.index===position?'aria-current="step"':'')+' aria-label="'+esc(title)+'" title="'+esc(title)+
   '"><span aria-hidden="true"></span></button>';
 };
 const group=(title,start,end)=>'<section class="aoLittleCrownGroup"><h3>'+esc(title)+'</h3>'+
  '<div class="aoLittleCrownBeads" role="group" aria-label="'+esc(title)+'">'+
  LITTLE_CROWN_B30_BEADS.slice(start,end).map(bead).join('')+'</div></section>';
 const prev=position>0?'<button type="button" data-p435930-crown-prev>'+esc(L("Previous","Précédent"))+'</button>':"";
 const next='<button type="button" class="primary" '+(step.isLast?"data-p435930-crown-finish":"data-p435930-crown-next")+'>'+
  esc(step.isLast?L("Finish chaplet","Terminer le chapelet"):L("Next prayer","Prière suivante"))+'</button>';
 const latinToggle='<button type="button" data-p435930-crown-latin aria-pressed="'+String(latin)+'" aria-label="'+
   esc(latin?L("Return to vernacular","Revenir à la langue vernaculaire"):L("Pray in Latin","Prier en latin"))+'">'+
   esc(latin?"EN / FR":"LATIN")+'</button>';
 const beadNavigator='<nav aria-label="'+esc(L("The fifteen beads","Les quinze grains"))+'">'+
  group(L("Jesus · Mary · Joseph","Jésus · Marie · Joseph"),0,3)+
  group(L("Twelve years of the Holy Childhood","Douze années de la Sainte Enfance"),3,15)+'</nav>';
 return head(L("Little Crown of the Infant Jesus","Petite Couronne de l’Enfant-Jésus"),
  L("Three Our Fathers · twelve Hail Marys","Trois Notre Père · douze Je vous salue Marie"))+
  '<main class="aoP435930Body aoLittleCrown" data-ao-little-crown-reader '+(f07Band?'data-ao-f07-variant="little-crown"':'')+'>'+
  '<header class="aoLittleCrownIntro"><small>'+esc(L("THE HOLY CHILDHOOD · 15 BEADS","SAINTE ENFANCE · 15 GRAINS"))+
  '</small><h2>'+esc(step.heading)+'</h2><p>'+esc(L("Before every bead, recall the Incarnation and pray at your own pace.",
  "Avant chaque grain, rappelez-vous l’Incarnation et priez à votre rythme."))+'</p></header>'+
  '<div class="aoLittleCrownProgress" role="progressbar" aria-label="'+esc(L("Chaplet progress","Progression du chapelet"))+
  '" aria-valuemin="0" aria-valuemax="15" aria-valuenow="'+(position+1)+'"><span style="width:'+
  Math.round((position+1)/15*100)+'%"></span></div>'+
  (f07Band?f07Band:beadNavigator)+

  '<article class="aoLittleCrownPrayer" tabindex="0"><div class="aoLittleCrownPrayerTop"><small>'+
  esc((position+1)+' / 15 · '+(step.group==="holy-family"?L("Our Father","Notre Père"):L("Hail Mary","Je vous salue Marie")))+
  '</small>'+latinToggle+'</div><p class="aoLittleCrownAspiration" lang="'+esc(langCode)+'">'+esc(step.aspiration)+
  '</p><p class="aoLittleCrownPrayerText" lang="'+esc(langCode)+'">'+nl(step.prayerText)+'</p></article>'+
  (f07Band?'<details class="aoF07JumpDisclosure"><summary>'+esc(L("Choose a bead","Choisir un grain"))+'</summary>'+beadNavigator+'</details>':'')+
  '<footer class="aoLittleCrownActions">'+prev+next+'</footer>'+
  '<details class="aoLittleCrownSource"><summary>'+esc(L("Historical form & sources","Forme historique et sources"))+
  '</summary><p>'+esc(L("The 1940 English devotional witness documents three Our Fathers for the Holy Family and twelve Hail Marys for the twelve years of Our Lord’s childhood. The Incarnation aspiration precedes each bead.",
  "Le témoin anglais de 1940 atteste trois Notre Père pour la Sainte Famille et douze Je vous salue Marie pour les douze années de l’enfance du Seigneur. L’aspiration de l’Incarnation précède chaque grain."))+
  '</p><p>'+esc(L("The French aspiration is independently attested by ICKSP; the Latin uses John 1:14. Optional medal prayers, meditations and closing Gloria from other versions are not joined to the 1940 form. Original printed-page photographic collation remains outstanding. No current indulgence, special bead or enrollment is claimed.",
  "L’aspiration française est attestée indépendamment par l’ICRSP ; le latin reprend Jn 1,14. Les prières de médaille, méditations et Gloria final d’autres versions ne sont pas ajoutés au formulaire de 1940. La collation photographique des pages imprimées d’origine reste à faire. Aucune indulgence actuelle, médaille particulière ou inscription n’est revendiquée."))+'</p>'+
  '<a href="'+esc(LITTLE_CROWN_B30_SOURCE.historicalEnglishUrl)+'" target="_blank" rel="noopener noreferrer">'+
  esc(L("Catholic Truth Society of Ireland · 1940","Catholic Truth Society of Ireland · 1940"))+'</a>'+
  '<a href="'+esc(LITTLE_CROWN_B30_SOURCE.frenchUrl)+'" target="_blank" rel="noopener noreferrer">'+
  esc(L("ICKSP France · independent witness","ICRSP France · témoin indépendant"))+'</a></details></main>';
}
