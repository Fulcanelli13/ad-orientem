from pathlib import Path
import hashlib, re, sys

PATH = Path('index.html')
BASE_SHA256 = '7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3'
SENTINEL = 'ao-v4333-emergency-stable-js'

def replace_once(text, old, new, label):
    n = text.count(old)
    if n != 1:
        raise RuntimeError(f'{label}: expected exactly 1 match, found {n}')
    return text.replace(old, new, 1)

s = PATH.read_text(encoding='utf-8')
if SENTINEL in s:
    changed = False
    auto_resume = """    async start() {
        await this.resolve(this.store.getState().selectedDate);
        if (this.persistence.resumeRecord())
            await this.resumeSavedMass();
    }"""
    normal_start = """    async start() {
        await this.resolve(this.store.getState().selectedDate);
    }"""
    if auto_resume in s:
        s = s.replace(auto_resume, normal_start, 1)
        changed = True

    hidden_context = """html.aoEmergencyLive .liveContextActions,
body.aoEmergencyLive .liveContextActions{display:none!important}
"""
    if hidden_context in s:
        s = s.replace(hidden_context, '', 1)
        changed = True

    if changed:
        PATH.write_text(s, encoding='utf-8')
        print('Repaired emergency wrapper: restored normal Proper resolution startup and live context actions.', hashlib.sha256(s.encode('utf-8')).hexdigest())
    else:
        print('Emergency repair already applied; no changes required.')
    sys.exit(0)

sha = hashlib.sha256(s.encode('utf-8')).hexdigest()
if sha != BASE_SHA256:
    raise RuntimeError(f'Unexpected index.html SHA-256: {sha}; expected canonical v43.33 {BASE_SHA256}')

s = replace_once(s,
".liveTopbar{position:sticky;top:0;z-index:20;margin:0 -18px;padding:calc(7px + var(--safe-top)) 12px 6px;min-height:calc(54px + var(--safe-top));display:grid;grid-template-columns:42px minmax(0,1fr) 42px 42px;gap:2px;align-items:center;background:rgba(8,12,18,.985)}",
".liveTopbar{position:sticky;top:0;z-index:20;margin:0 -18px;padding:calc(7px + var(--safe-top)) 12px 6px;min-height:calc(54px + var(--safe-top));display:grid;grid-template-columns:42px minmax(0,1fr) 42px;gap:2px;align-items:center;background:rgba(8,12,18,.985)}",
'live topbar columns')

s = replace_once(s,
"    async start() {\n        await this.resolve(this.store.getState().selectedDate);\n    }",
"    async start() {\n        await this.resolve(this.store.getState().selectedDate);\n        if (this.persistence.resumeRecord())\n            await this.resumeSavedMass();\n    }",
'auto resume live Mass')

s = replace_once(s,
"        const swapSurface = target?.closest?.('[data-live-swap-surface]') || null;",
"        const swapSurface = target?.closest?.('[data-live-swap]')?.closest?.('[data-live-swap-surface]') || null;",
'inert live text surface')

old_header = "<header class=\"liveTopbar\"><button class=\"topIcon imageButton\" data-live-home aria-label=\"${esc(tr('backHome'))}\">${img(icons_1.NAV_ICON.home,'navIcon','')}<span class=\"srOnly\">${esc(tr('backHome'))}</span></button><div class=\"topTitle\"><b>${esc(vm.section)}</b></div><button class=\"topIcon imageButton\" data-live-sheet=\"lost\" aria-label=\"${esc(tr('imLost'))}\">${img(icons_1.NAV_ICON.lost,'navIcon','')}<span class=\"srOnly\">${esc(tr('imLost'))}</span></button><button class=\"topIcon imageButton\" data-live-sheet=\"settings\" aria-label=\"${esc(tr('settings'))}\">${img(icons_1.NAV_ICON.settings,'navIcon','')}</button></header>"
new_header = "<header class=\"liveTopbar\"><button class=\"topIcon imageButton\" data-live-home aria-label=\"${esc(tr('backHome'))}\">${img(icons_1.NAV_ICON.home,'navIcon','')}<span class=\"srOnly\">${esc(tr('backHome'))}</span></button><div class=\"topTitle\"><b>${esc(vm.section)}</b></div><button class=\"topIcon imageButton\" data-live-sheet=\"lost\" aria-label=\"${esc(tr('imLost'))}\">${img(icons_1.NAV_ICON.lost,'navIcon','')}<span class=\"srOnly\">${esc(tr('imLost'))}</span></button></header>"
s = replace_once(s, old_header, new_header, 'remove live settings button')

old_nav = "<nav class=\"liveNav\"><button class=\"liveBackButton\" data-live-prev ${vm.index === 0 ? 'disabled' : ''}>← <span>${esc(tr('previous'))}</span></button><button class=\"liveMapCounter\" data-live-sheet=\"map\" aria-label=\"${esc(tr('massMap'))}: ${esc(vm.progressLabel)}\"><span>${vm.index + 1}</span><small>/ ${vm.sequence.steps.length}</small></button><button class=\"liveNextButton\" data-live-next>${vm.index === vm.sequence.steps.length - 1 ? esc(tr('finish')) : `<span>${esc(tr('next'))}</span> →`}</button></nav>${renderSheet(state)}</main>`;"
new_nav = "<nav class=\"liveNav\"><button class=\"liveBackButton\" data-live-prev ${vm.index === 0 ? 'disabled' : ''}>← <span>${esc(tr('previous'))}</span></button><button class=\"liveMapCounter\" data-live-sheet=\"lost\" aria-label=\"${esc(tr('imLost'))}: ${esc(vm.progressLabel)}\"><span>${vm.index + 1}</span><small>/ ${vm.sequence.steps.length}</small></button><button class=\"liveNextButton\" data-live-next>${vm.index === vm.sequence.steps.length - 1 ? esc(tr('finish')) : `<span>${esc(tr('next'))}</span> →`}</button></nav>${renderSheet(state)}</main>`;"
s = replace_once(s, old_nav, new_nav, 'merge Mass map counter into lost recovery')

s = replace_once(s,
"if(s.route==='scripture'){rt().store.dispatch({type:'scripture-close'});return true}if(s.route==='live'){rt().store.dispatch({type:'leave-live'});return true}if(s.route==='prepare'){rt().store.dispatch({type:'leave-prepare'});return true}if(s.route==='thanksgiving'){rt().store.dispatch({type:'leave-thanksgiving'});return true}",
"if(s.route==='scripture'){rt().store.dispatch({type:'scripture-close'});return true}if(s.route==='live'){const fr=s.language==='fr';const ok=window.confirm(fr?'La Messe est en cours. Quitter le suivi ? Votre place sera enregistrée.':'Mass is in progress. Leave the follower? Your place will be saved.');if(ok)rt().store.dispatch({type:'leave-live'});return true}if(s.route==='prepare'){rt().store.dispatch({type:'leave-prepare'});return true}if(s.route==='thanksgiving'){rt().store.dispatch({type:'leave-thanksgiving'});return true}",
'legacy browser back live confirmation')

s = replace_once(s,
"if(s?.route==='live'){lastCoreRoute=null;store?.dispatch({type:'leave-live'});queueMicrotask(restoreTop);return true}",
"if(s?.route==='live'){const fr=s.language==='fr';const ok=window.confirm(fr?'La Messe est en cours. Quitter le suivi ? Votre place sera enregistrée.':'Mass is in progress. Leave the follower? Your place will be saved.');if(ok){lastCoreRoute=null;store?.dispatch({type:'leave-live'});queueMicrotask(restoreTop)}return true}",
'global browser back live confirmation')

s = replace_once(s,
"const vibrate=(pattern=6)=>{try{if('vibrate'in navigator)navigator.vibrate(pattern)}catch{}};",
"const vibrate=()=>false; /* emergency-stable: Rosary haptics disabled */",
'Rosary haptics off')

s = replace_once(s,
"let lastAt=0,lastSource='',enabled=true,installed=false;",
"let lastAt=0,lastSource='',enabled=false,installed=false;",
'global haptics default off')

hotfix = r'''

<style id="ao-v4333-emergency-stable-css">
/* v43.33 Emergency Stable — interaction-only repair; canonical Mass content/sequence untouched. */
html.aoEmergencyLive,body.aoEmergencyLive{overscroll-behavior-y:none!important}
html.aoEmergencyLive #ao-global-ribbon,
body.aoEmergencyLive #ao-global-ribbon{display:none!important;visibility:hidden!important;pointer-events:none!important}
html.aoEmergencyLive .liveScreen,
body.aoEmergencyLive .liveScreen{padding-bottom:calc(82px + var(--safe-bottom))!important;overscroll-behavior-y:contain!important}
html.aoEmergencyLive .liveContextActions,
body.aoEmergencyLive .liveContextActions{display:none!important}
html.aoEmergencyLive [data-live-sheet="settings"],
body.aoEmergencyLive [data-live-sheet="settings"]{display:none!important}
html.aoEmergencyLive .swapSurface[data-live-swap-surface],
body.aoEmergencyLive .swapSurface[data-live-swap-surface]{cursor:default!important}
html.aoEmergencyLive [data-live-swap],
body.aoEmergencyLive [data-live-swap]{cursor:pointer!important}

/* Critical shared-prayer repair: late v43.13 display ownership must never defeat HTML hidden. */
#aoPrayerBookRoot .lab-prayer-flip>[hidden],
#aoPrayerBookRoot .lab-prayer-flip [hidden]{display:none!important}

/* Mobile-safe group recitation: stack common-prayer leader/response instead of narrow grid columns. */
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryLeader,
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryResponse,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryLeader,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryResponse{
  display:block!important;grid-template-columns:none!important;width:100%!important;min-width:0!important;max-width:100%!important
}
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryLeader>.aoPrayerRole,
#aoPrayerBookRoot.aoRecitationGroup .aoCustomaryResponse>.aoPrayerRole,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryLeader>.aoPrayerRole,
html.aoRecitationGroup #aoPrayerBookRoot .aoCustomaryResponse>.aoPrayerRole{
  display:inline!important;margin-right:.34em!important
}
#aoPrayerBookRoot .lab-prayer-flip{overflow-x:hidden!important}
</style>
<script id="ao-v4333-emergency-stable-js">
(()=>{'use strict';
 const VERSION='43.33-emergency-stable';
 const rt=()=>globalThis.AO_RUNTIME_V8;
 const state=()=>rt()?.store?.getState?.();
 const L=(en,fr)=>state()?.language==='fr'?fr:en;
 let unsub=null;
 function forceHapticsOff(){
   try{globalThis.AO_HAPTICS_V4319?.setEnabled?.(false)}catch{}
   try{localStorage.setItem('ao-haptics-enabled','0')}catch{}
   try{navigator.vibrate?.(0)}catch{}
 }
 function sync(){
   const live=state()?.route==='live';
   document.documentElement.classList.toggle('aoEmergencyLive',live);
   document.body?.classList.toggle('aoEmergencyLive',live);
   const ribbon=document.getElementById('ao-global-ribbon');
   if(ribbon){ribbon.hidden=!!live;ribbon.setAttribute('aria-hidden',live?'true':'false')}
   if(live) forceHapticsOff();
 }
 function protectStructuralSettings(e){
   if(state()?.route!=='live')return;
   const el=e.target?.closest?.('[data-live-form],[data-sunday-asperges],[data-setting-form]');
   if(!el)return;
   e.preventDefault();e.stopImmediatePropagation();
   alert(L('This setting is locked while Mass is in progress. Exit Mass to change it.','Ce réglage est verrouillé pendant la Messe. Quittez le suivi de la Messe pour le modifier.'));
 }
 function install(){
   forceHapticsOff();
   document.documentElement.dataset.aoEmergencyStable='true';
   document.addEventListener('click',protectStructuralSettings,true);
   const store=rt()?.store;
   if(store?.subscribe){unsub=store.subscribe(sync);sync()}
   else setTimeout(install,50);
   window.addEventListener('pageshow',()=>{forceHapticsOff();sync()});
 }
 globalThis.AO_EMERGENCY_STABLE_V4333={version:VERSION,sync,forceHapticsOff,getState:state};
 install();
})();
</script>
'''

s = replace_once(s, '\n</body></html>', hotfix + '\n</body></html>', 'append emergency stable layer')
PATH.write_text(s, encoding='utf-8')
print('Patched index.html', len(s.encode('utf-8')), 'bytes', hashlib.sha256(s.encode('utf-8')).hexdigest())
