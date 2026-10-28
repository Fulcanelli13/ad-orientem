/*
 * Interactivity for the research-only Mass-shaped Office surface. This file
 * is shipped to ephemeral CI scratch previews, not registered in production.
 * No network calls, redirects, external URLs, timers, auto-scroll or audio.
 * Works with pointer, keyboard and touch. Vertical scroll owns paragraph
 * focus; horizontal swipe owns source-cell card changes.
 */
(function(){
  "use strict";
  const readers=document.querySelectorAll(".aoOfficeMassReader[data-office-research-only='true']");
  for(const reader of readers)mount(reader);
  function mount(root){
    if(root.dataset.officeInteractionsMounted==="true")return;
    root.dataset.officeInteractionsMounted="true";
    const cards=[...root.querySelectorAll(".aoOfficeMassCard")];
    const viewport=root.querySelector("[data-office-card-scroll]");
    const title=root.querySelector("[data-office-card-title]");
    const position=root.querySelector("[data-office-position]");
    const progress=root.querySelector("[data-office-progress-width]");
    const segments=[...root.querySelectorAll("[data-office-jump]")];
    const navButtons=[...root.querySelectorAll("[data-office-nav]")];
    const modeLabel=root.querySelector("[data-office-mode-label]");
    if(!cards.length||!viewport||!title||!position||!progress||!modeLabel)return;
    let current=0;
    let mode="LIVE";
    let pointer=null;
    const menuMap={
      hours:["[data-office-hours-menu]","[data-office-hours-toggle]"],
      sections:["[data-office-sections-menu]","[data-office-sections-toggle]"],
      settings:["[data-office-settings-menu]","[data-office-settings-toggle]"],
    };
    function closeMenus(except){
      for(const [key,[menuSelector,buttonSelector]] of Object.entries(menuMap)){
        const open=key===except;
        const menu=root.querySelector(menuSelector);
        const trigger=root.querySelector(buttonSelector);
        if(menu)menu.hidden=!open;
        if(trigger)trigger.setAttribute("aria-expanded",String(open));
      }
    }
    function focusLine(){
      if(mode!=="LIVE")return;
      const lines=[...cards[current].querySelectorAll(".aoOfficeLiveParagraph")];
      if(!lines.length)return;
      const frame=viewport.getBoundingClientRect();
      const focus=frame.top+Math.min(frame.height*.39,Math.max(20,viewport.scrollTop*.25+32));
      let best=0,dist=Infinity;
      for(let i=0;i<lines.length;i++){
        const r=lines[i].getBoundingClientRect();
        const d=Math.abs(Math.min(Math.max(focus,r.top),r.bottom)-focus);
        if(d<dist){dist=d;best=i;}
      }
      for(let i=0;i<lines.length;i++){
        lines[i].dataset.active=String(i===best);
        lines[i].dataset.officeNear=String(Math.abs(i-best)===1);
      }
    }
    function showCard(index,arrival){
      if(!Number.isInteger(index)||index<0||index>=cards.length)return;
      const previous=current;
      current=index;
      for(let i=0;i<cards.length;i++){
        cards[i].hidden=i!==current;
        if(i===current)cards[i].dataset.officeArrive=arrival??(index<previous?"previous":"next");
      }
      root.dataset.officeCardIndex=String(current);
      title.textContent=cards[current].querySelector(".ao-prayer-title")?.textContent??"";
      const ribbonTitle=root.querySelector("[data-office-section-title]");
      if(ribbonTitle)ribbonTitle.textContent=title.textContent;
      const rail=root.querySelector("[data-office-source-role]");
      if(rail)rail.textContent=(cards[current].dataset.officeRole??"").replaceAll("_"," ");
      position.textContent=(current+1)+" / "+cards.length;
      progress.style.width=((current+1)/cards.length*100)+"%";
      for(const button of navButtons){
        const delta=Number(button.dataset.officeNav);
        button.disabled=current+delta<0||current+delta>=cards.length;
      }
      for(const [i,segment] of segments.entries()){
        segment.setAttribute("aria-current",i===current?"step":"false");
        segment.dataset.officeCompleted=String(i<current);
      }
      viewport.scrollTop=0;
      focusLine();
      closeMenus();
    }
    function setMode(next){
      if(next!=="LIVE"&&next!=="MISSAL")return;
      mode=next;
      root.dataset.officeMode=mode;
      modeLabel.textContent=mode+" · "+(root.dataset.officeLocale??"EN").toUpperCase();
      for(const button of root.querySelectorAll("[data-office-mode-select]"))
        button.setAttribute("aria-pressed",String(button.dataset.officeModeSelect===mode));
      for(const card of cards){
        const live=card.querySelector('[data-office-face="LIVE"]');
        const missal=card.querySelector('[data-office-face="MISSAL"]');
        if(live)live.hidden=mode!=="LIVE";
        if(missal)missal.hidden=mode!=="MISSAL";
      }
      viewport.scrollTop=0;
      focusLine();
      closeMenus();
    }
    root.addEventListener("click",event=>{
      const button=event.target.closest("button");
      if(!button||!root.contains(button))return;
      if(button.hasAttribute("data-office-hours-toggle")){const m=root.querySelector("[data-office-hours-menu]");closeMenus(m?.hidden?"hours":null);return;}
      if(button.hasAttribute("data-office-sections-toggle")){const m=root.querySelector("[data-office-sections-menu]");closeMenus(m?.hidden?"sections":null);return;}
      if(button.hasAttribute("data-office-settings-toggle")){const m=root.querySelector("[data-office-settings-menu]");closeMenus(m?.hidden?"settings":null);return;}
      if(button.hasAttribute("data-office-section-select")){showCard(Number(button.dataset.officeSectionSelect));return;}
      if(button.hasAttribute("data-office-jump")){showCard(Number(button.dataset.officeJump));return;}
      if(button.hasAttribute("data-office-nav")){showCard(current+Number(button.dataset.officeNav));return;}
      if(button.hasAttribute("data-office-mode-select")){setMode(button.dataset.officeModeSelect);return;}
    });
    root.addEventListener("input",event=>{
      const input=event.target;
      if(input.matches("[data-office-font-size]")){
        const size=Number(input.value);
        if(Number.isFinite(size)&&size>=.85&&size<=1.3)
          root.style.setProperty("--ao-office-size",String(size));
      }
    });
    viewport.addEventListener("scroll",focusLine,{passive:true});
    viewport.addEventListener("click",e=>{
      const line=e.target.closest(".aoOfficeLiveParagraph");
      if(!line||mode!=="LIVE")return;
      line.scrollIntoView({block:"center",behavior:"smooth"});
    });
    // Swipe is disambiguated against vertical reading, preserving pan-y.
    viewport.addEventListener("touchstart",e=>{
      if(e.touches.length!==1)return;
      pointer={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    viewport.addEventListener("touchend",e=>{
      if(!pointer||e.changedTouches.length!==1){pointer=null;return;}
      const dx=e.changedTouches[0].clientX-pointer.x;
      const dy=e.changedTouches[0].clientY-pointer.y;
      pointer=null;
      if(Math.abs(dx)<68||Math.abs(dx)<Math.abs(dy)*1.4)return;
      showCard(current+(dx<0?1:-1));
    },{passive:true});
    root.addEventListener("keydown",e=>{
      if(e.altKey||e.ctrlKey||e.metaKey||
        e.target.closest("button,input,a"))return;
      if(e.key==="ArrowRight"){e.preventDefault();showCard(current+1)}
      if(e.key==="ArrowLeft"){e.preventDefault();showCard(current-1)}
      if(e.key==="Escape")closeMenus();
    });
    setMode("LIVE");
    showCard(0);
  }
})();
