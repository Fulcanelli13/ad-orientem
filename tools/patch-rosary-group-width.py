from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")
marker = '<script type="module" src="./src/mass/browser-entry.js" data-ao-r17-browser-entry></script>'
hotfix_id = 'ao-v4334-rosary-group-width-hotfix'

if hotfix_id in html:
    print("Rosary v43.34 single-file hotfix already present.")
    raise SystemExit(0)
if marker not in html:
    raise SystemExit("Final browser-entry marker not found; refusing unsafe patch.")

hotfix = r'''<style id="ao-v4334-rosary-group-width-hotfix">
/* v43.34 — single-file Rosary Group-width authority. */
#aoPrayerBookRoot.aoRecitationGroup .aoCustomarySplit,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomarySplit{
  display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;
  writing-mode:horizontal-tb!important;text-orientation:mixed!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryLeader,
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryResponse,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryLeader,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryResponse{
  display:block!important;grid-template-columns:none!important;grid-auto-columns:auto!important;
  width:100%!important;inline-size:100%!important;max-width:100%!important;min-width:0!important;
  writing-mode:horizontal-tb!important;text-orientation:mixed!important;
  white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryLeader>.aoPrayerRole,
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryResponse>.aoPrayerRole,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryLeader>.aoPrayerRole,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryResponse>.aoPrayerRole{
  display:inline!important;position:static!important;float:none!important;
  width:auto!important;inline-size:auto!important;max-width:none!important;min-width:0!important;
  margin-right:.38em!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryLeader>span:not(.aoPrayerRole):not(.aoSrOnly),
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryResponse>span:not(.aoPrayerRole):not(.aoSrOnly),
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryLeader>span:not(.aoPrayerRole):not(.aoSrOnly),
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryResponse>span:not(.aoPrayerRole):not(.aoSrOnly){
  display:inline!important;position:static!important;float:none!important;
  width:auto!important;inline-size:auto!important;max-width:none!important;min-width:0!important;
  writing-mode:horizontal-tb!important;white-space:normal!important;word-break:normal!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoPrayerDialogueLine,
html.aoRecitationGroup #aoPrayerBookRoot .aoPrayerDialogueLine{
  grid-template-columns:max-content minmax(0,1fr)!important;width:100%!important;min-width:0!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoPrayerDialogueLine>.aoPrayerRole,
html.aoRecitationGroup #aoPrayerBookRoot .aoPrayerDialogueLine>.aoPrayerRole{
  position:static!important;float:none!important;grid-column:1!important;width:auto!important;max-width:none!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoPrayerDialogueLine>.aoPrayerDialogueBody,
#aoPrayerBookRoot.aoRecitationGroup .aoPrayerDialogueLine>.aoPrayerWords,
html.aoRecitationGroup #aoPrayerBookRoot .aoPrayerDialogueLine>.aoPrayerDialogueBody,
html.aoRecitationGroup #aoPrayerBookRoot .aoPrayerDialogueLine>.aoPrayerWords{
  grid-column:2!important;justify-self:stretch!important;width:100%!important;inline-size:100%!important;
  max-width:100%!important;min-width:0!important;writing-mode:horizontal-tb!important;
  white-space:normal!important;word-break:normal!important;overflow-wrap:break-word!important
}
</style>
<script id="ao-v4334-rosary-group-width-hotfix-js">
(()=>{'use strict';
 const repair=()=>{
  const root=document.getElementById('aoPrayerBookRoot');
  const group=document.documentElement.classList.contains('aoRecitationGroup')||root?.classList.contains('aoRecitationGroup');
  if(!root||!group)return;
  root.querySelectorAll('.lab-prayer-flip .aoCustomaryLeader,.lab-prayer-flip .aoCustomaryResponse').forEach(n=>{
   n.style.setProperty('display','block','important');
   n.style.setProperty('grid-template-columns','none','important');
   n.style.setProperty('width','100%','important');
   n.style.setProperty('max-width','100%','important');
   n.style.setProperty('min-width','0','important');
   n.style.setProperty('writing-mode','horizontal-tb','important');
  });
 };
 document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-ao-recitation],[data-p435930-recitation]'))requestAnimationFrame(repair)
 },true);
 window.addEventListener('pageshow',repair);
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair,{once:true});else repair();
 globalThis.AO_ROSARY_GROUP_WIDTH_V4334=Object.freeze({version:'43.34-single-file-width-owner',repair});
})();
</script>
'''

html = html.replace(marker, hotfix + marker, 1)
path.write_text(html, encoding="utf-8")
print("Inserted v43.34 Rosary single-file width authority.")
