/**
 * The visible strand is a projection of the existing canonical prayer cursor.
 * Text, prayer sequence, swipe and persistence remain owned by the reader.
 */
import {mercyBeadNavigationModel} from "./mercy-bead-navigation.js";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function mercyBeadNavHTML(steps,index,{french=false}={}){
 const m=mercyBeadNavigationModel(steps,index,{french});
 const tr=(en,fr)=>french?fr:en;
 const button=(step,title,klass,extra="",text=title)=>
  '<button type="button" class="'+klass+'" data-p435930-mercy-jump="'+step+'" aria-label="'+esc(title)+'" '+extra+'>'+esc(text)+'</button>';
 const phases='<div class="aoMercyPhases">'+
   button(m.opening,tr("Opening","Ouverture"),"aoMercyPhaseLink",m.phase==="opening"?'aria-current="step"':"")+
   '<div class="aoMercyDecades">'+m.decades.map(d=>
    button(d.start,tr("Decade ","Dizaine ")+d.decade,"aoMercyDecadeLink",
     'data-status="'+d.status+'" data-decade="'+d.decade+'" '+(d.status==="active"?'aria-current="step"':""),d.roman)
   ).join("")+'</div>'+
   button(m.conclusion,tr("Closing","Conclusion"),"aoMercyPhaseLink",m.phase==="conclusion"?'aria-current="step"':"")+
  '</div>';
 const beads=m.phase!=="decade"?"":'<div class="aoMercyStrand" role="group" aria-label="'+esc(tr("Current decade beads","Grains de la dizaine"))+'">'+
  m.beads.map(b=>button(b.step,
    b.large?tr("Large bead · Eternal Father","Gros grain · Père éternel"):
     tr("Small bead ","Petit grain ")+b.bead+tr(" of 10"," sur 10"),
    "aoMercyBeadButton",
    'data-bead="'+b.bead+'" data-status="'+b.status+'" '+(b.status==="active"?'aria-current="step"':""),
    "")).join("")+'</div>';
 return '<nav class="aoMercyBeadNavigation" data-ao-mercy-bead-navigation data-mercy-phase="'+m.phase+
  '" data-mercy-decade="'+(m.activeDecade??"")+'" data-mercy-bead="'+(m.currentBead??"")+
  '" aria-label="'+esc(tr("Chaplet bead navigation","Navigation des grains du chapelet"))+'">'+
  phases+'<div class="aoMercyBeadPosition"><span>'+esc(m.caption)+'</span><small>'+esc(m.shortName)+'</small></div>'+
  beads+'</nav>';
}
export function updateMercyBeadNav(root,steps,index,{french=false}={}){
 const nav=root?.querySelector("[data-ao-mercy-bead-navigation]");
 if(!nav)return;
 const m=mercyBeadNavigationModel(steps,index,{french});
 nav.dataset.mercyPhase=m.phase;
 nav.dataset.mercyDecade=String(m.activeDecade??"");
 nav.dataset.mercyBead=String(m.currentBead??"");
 const heading=nav.querySelector(".aoMercyBeadPosition>span");
 const small=nav.querySelector(".aoMercyBeadPosition>small");
 if(heading)heading.textContent=m.caption;
 if(small)small.textContent=m.shortName;
 for(const button of nav.querySelectorAll(".aoMercyDecadeLink")){
  const d=m.decades.find(x=>x.decade===Number(button.dataset.decade));
  if(!d)continue;
  button.dataset.status=d.status;
  if(d.status==="active")button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");
 }
 for(const button of nav.querySelectorAll(".aoMercyBeadButton")){
  const bead=Number(button.dataset.bead);
  const status=bead===m.currentBead?"active":bead<m.currentBead?"prayed":"unreached";
  button.dataset.status=status;
  if(status==="active")button.setAttribute("aria-current","step");else button.removeAttribute("aria-current");
 }
}
