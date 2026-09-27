from pathlib import Path
import hashlib, re, sys

PATH = Path('index.html')
BASE_SHA256 = '7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3'
SENTINEL = 'ao-v4333-emergency-stable-js'
MASS_SOT_SENTINEL = 'mass-sot-field-hotfix-20260927'

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

    # 27 Sep 2026 field-safe Mass corrections derived from the authoritative 1962 SOT.
    # Guarded as one atomic in-memory patch: if any expected source fragment is missing,
    # abort before writing index.html.
    if MASS_SOT_SENTINEL not in s:
        # 1. Pater noster is a public/clear-spoken anchor in both Sung and Low Mass.
        pater_old = """"id":"pater","phase":"Communion","section":"Pater & Fraction","title":{"en":"Pater noster","fr":"Pater noster"},"subtitle":{"en":"The Lord’s Prayer","fr":"La prière du Seigneur"},"actor":"celebrant","priestPosition":"Centre","audibility":"quiet","privateAction":true"""
        pater_new = """"id":"pater","phase":"Communion","section":"Pater & Fraction","title":{"en":"Pater noster","fr":"Pater noster"},"subtitle":{"en":"The Lord’s Prayer","fr":"La prière du Seigneur"},"actor":"celebrant","priestPosition":"Centre","audibility":"audible","privateAction":false"""
        if s.count(pater_old) != 2:
            raise RuntimeError(f'Pater audibility: expected 2 legacy matches, found {s.count(pater_old)}')
        s = s.replace(pater_old, pater_new)

        # 2. Sung Communion chant timing branches on whether the faithful actually receive.
        communion_branch_old = """    if (options.faithfulCommunion === false) {
        out = out.filter(step => !["second-confiteor", "ecce", "domine-non-sum-dignus", "communion-faithful"].includes(step.id));
    }
    else if (options.secondConfiteor) {
        const idx = out.findIndex(step => step.id === "ecce");
        if (idx >= 0)
            out = [...out.slice(0, idx), makeSecondConfiteor(!!options.joinConfiteor), ...out.slice(idx)];
    }"""
        communion_branch_new = """    if (options.faithfulCommunion === false) {
        out = out.filter(step => !["second-confiteor", "ecce", "domine-non-sum-dignus", "communion-faithful"].includes(step.id));
    }
    else if (options.secondConfiteor) {
        const idx = out.findIndex(step => step.id === "ecce");
        if (idx >= 0)
            out = [...out.slice(0, idx), makeSecondConfiteor(!!options.joinConfiteor), ...out.slice(idx)];
    }
    // 1962 SOT: at Sung Mass, if the faithful receive, the Communion chant begins
    // with distribution after the communicants' triple Domine non sum dignus.
    // If nobody receives, it begins during the priest's Communion.
    if (options.form === "sung" && options.faithfulCommunion !== false) {
        out = out.map(step => {
            if (step.id !== "priest-communion" || !step.concurrentProperChoir)
                return step;
            const copy = { ...step };
            delete copy.concurrentProperChoir;
            return copy;
        });
    }"""
        s = replace_once(s, communion_branch_old, communion_branch_new, 'Communion chant timing branch')

        s = replace_once(
            s,
            "The celebrant communicates himself before Communion is distributed to the faithful. At an ordinary Sung Mass the Communion antiphon begins here and may continue through the Communion of the faithful.",
            "The celebrant communicates himself before Communion is distributed to the faithful. At Sung Mass, if the faithful receive, the Communion antiphon begins when distribution begins after their triple Domine non sum dignus; if nobody receives, it begins during the priest’s Communion.",
            'Sung priest Communion explanation'
        )
        # The same stale Sung-Mass explanation was accidentally embedded in the Low-Mass template.
        s = replace_once(
            s,
            "The celebrant communicates himself before Communion is distributed to the faithful. At an ordinary Sung Mass the Communion antiphon begins here and may continue through the Communion of the faithful.",
            "The celebrant communicates himself before Communion is distributed to the faithful. At Low Mass there is no liturgical Schola track; if the faithful receive, the next strong public cue is Ecce Agnus Dei and the communicants’ Domine non sum dignus.",
            'Low priest Communion explanation'
        )

        sung_comm_old = """"id":"communion-faithful","phase":"Communion","section":"Holy Communion","title":{"en":"Communion of the Faithful","fr":"Communion des fidèles"},"subtitle":{"en":"Communion chant accompanies the distribution","fr":"Le chant de Communion accompagne la distribution"},"actor":"mixed","priestPosition":"Communion rail","audibility":"audible","privateAction":false,"posture":{"value":"custom","policy":"local","source":"local"},"explanation":"The Communion antiphon, already begun at the priest’s Communion, may continue during distribution to the faithful. The celebrant’s own recitation of that proper occurs after the ablutions.""""
        sung_comm_new = """"id":"communion-faithful","phase":"Communion","section":"Holy Communion","title":{"en":"Communion of the Faithful","fr":"Communion des fidèles"},"subtitle":{"en":"Communion chant accompanies the distribution","fr":"Le chant de Communion accompagne la distribution"},"actor":"mixed","priestPosition":"Communion rail","audibility":"quiet","privateAction":false,"posture":{"value":"custom","policy":"local","source":"local"},"explanation":"When the faithful receive at Sung Mass, the Communion antiphon begins as distribution starts, after the faithful’s triple Domine non sum dignus, and may continue through the distribution. The priest’s Corpus Domini formula is quiet at the rail.""""
        s = replace_once(s, sung_comm_old, sung_comm_new, 'Sung faithful Communion timing/audibility')

        low_comm_old = """"id":"communion-faithful","phase":"Communion","section":"Holy Communion","title":{"en":"Communion of the Faithful","fr":"Communion des fidèles"},"subtitle":{"en":"At the altar rail","fr":"À la table de Communion"},"actor":"celebrant","priestPosition":"Communion rail","audibility":"audible","privateAction":false,"posture":{"value":"custom","policy":"local","source":"local"},"explanation":"The Communion antiphon, already begun at the priest’s Communion, may continue during distribution to the faithful. The celebrant’s own recitation of that proper occurs after the ablutions.""""
        low_comm_new = """"id":"communion-faithful","phase":"Communion","section":"Holy Communion","title":{"en":"Communion of the Faithful","fr":"Communion des fidèles"},"subtitle":{"en":"At the altar rail","fr":"À la table de Communion"},"actor":"celebrant","priestPosition":"Communion rail","audibility":"quiet","privateAction":false,"posture":{"value":"custom","policy":"local","source":"local"},"explanation":"At Low Mass there is no liturgical Schola track. The priest distributes Communion using Corpus Domini quietly to each communicant; the proper Communion antiphon is read later at the Epistle side after the ablutions.""""
        s = replace_once(s, low_comm_old, low_comm_new, 'Low faithful Communion audibility/explanation')

        # 3. Add a harmless navigation pause after the ordinary Gospel. If no sermon is given,
        # the user simply advances once; if preaching occurs, the Mass timeline no longer lies.
        sermon_insert = """/* mass-sot-field-hotfix-20260927 */
function insertSermonPause(steps) {
    const idx = steps.findIndex(step => step.id === "gospel");
    if (idx < 0 || steps.some(step => step.id === "sermon-pause"))
        return steps;
    const sermon = {
        id: "sermon-pause",
        phase: "Mass of the Catechumens",
        section: "Gospel & Creed",
        title: { en: "Sermon / Homily · if present", fr: "Sermon / Homélie · si présent" },
        subtitle: { en: "If preaching occurs, stay here until it ends. If not, continue.", fr: "S’il y a une prédication, restez ici jusqu’à sa fin. Sinon, continuez." },
        actor: "preacher",
        priestPosition: "Preaching place",
        audibility: "audible",
        privateAction: false,
        posture: { value: "CUSTOM", policy: "local", source: "sermon" },
        gestures: [],
        explanation: "The sermon is a navigation pause, not a prayer-text step of the Ordo Missae. Do not advance the Mass timeline because of elapsed preaching time."
    };
    return [...steps.slice(0, idx + 1), sermon, ...steps.slice(idx + 1)];
}
"""
        s = replace_once(s, "function buildMassSequence(options) {", sermon_insert + "function buildMassSequence(options) {", 'sermon pause helper')
        s = replace_once(
            s,
            "    steps = insertSuperPopulum(steps, proper, properAvailable);\n    if (options.exceptionalProfile)",
            "    steps = insertSuperPopulum(steps, proper, properAvailable);\n    if (!options.exceptionalProfile)\n        steps = insertSermonPause(steps);\n    if (options.exceptionalProfile)",
            'insert ordinary sermon pause'
        )

        # 4. Sunday Asperges: Palm/other special rites keep their own rules, but Sunday
        # Candlemas can have Asperges first. Passion Sunday omits Gloria Patri.
        asperges_mode_old = """    // Exceptional rites with their own pre-Mass ceremonial (especially Palm Sunday) do not receive this generic prepend.
    if (exceptionalProfile(inferredProfile)) return null;
    const easter = aoGregorianEasterUtc(date.getUTCFullYear());
    const pentecost = new Date(easter.getTime() + 49 * 86400000);
    return { vidiAquam: date >= easter && date <= pentecost };"""
        asperges_mode_new = """    // Exceptional rites with their own pre-Mass ceremonial normally do not receive this generic prepend.
    // Candlemas is the exception: when 2 February is a Sunday, Asperges precedes the candle rite.
    const exceptional = exceptionalProfile(inferredProfile);
    if (exceptional && exceptional !== 'candlemas-1962') return null;
    const easter = aoGregorianEasterUtc(date.getUTCFullYear());
    const pentecost = new Date(easter.getTime() + 49 * 86400000);
    const vidiAquam = date >= easter && date <= pentecost;
    const passionSunday = new Date(easter.getTime() - 14 * 86400000);
    return { vidiAquam, omitGloriaPatri: !vidiAquam && date >= passionSunday && date < easter };"""
        s = replace_once(s, asperges_mode_old, asperges_mode_new, 'Sunday Asperges precedence/Passiontide')

        asperges_step_old = """function aoAspergesSteps(sequence, mode) {
    const chant = mode.vidiAquam ? AO_SUNDAY_ASPERGES_TEXT.vidiAquam : AO_SUNDAY_ASPERGES_TEXT.asperges;"""
        asperges_step_new = """function aoAspergesSteps(sequence, mode) {
    let chant = mode.vidiAquam ? AO_SUNDAY_ASPERGES_TEXT.vidiAquam : AO_SUNDAY_ASPERGES_TEXT.asperges;
    if (mode.omitGloriaPatri && !mode.vidiAquam) {
        chant = Object.fromEntries(Object.entries(chant).map(([lang, value]) => [
            lang,
            String(value || '').replace(/\\n℣\\.[^\\n]*\\n℟\\.[^\\n]*/, '')
        ]));
    }"""
        s = replace_once(s, asperges_step_old, asperges_step_new, 'Passiontide Asperges Gloria Patri omission')

        # Final guarded invariants before any write.
        if MASS_SOT_SENTINEL not in s:
            raise RuntimeError('Mass SOT hotfix marker missing after patch')
        if s.count(pater_new) != 2:
            raise RuntimeError('Mass SOT hotfix did not produce both public Pater states')
        if 'if (options.form === "sung" && options.faithfulCommunion !== false)' not in s:
            raise RuntimeError('Communion timing branch missing after patch')
        if s.count('"id":"sermon-pause"') != 1:
            raise RuntimeError('Sermon pause insertion invalid')
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
