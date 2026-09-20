import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Keep the frozen, hash-verified corpus intact; apply only reviewed UI changes.
let html = readFileSync(new URL('../legacy/Ad-Orientem-2.0-v43.33-ICON-OWNERSHIP-CONSOLIDATION.html', import.meta.url), 'utf8');
if (createHash('sha256').update(html).digest('hex') !== '7032ed01a76c747805a81d4290cf85fb8692153568767ad9d1bd66f1dc88ada3') throw Error('Unexpected baseline');
function replace(before, after) {
  if (html.split(before).length !== 2) throw Error('Patch anchor is not unique: ' + before.slice(0,100));
  html = html.replace(before, after);
}

// Silence both legacy Rosary feedback and all native/web delegated feedback.
replace("const vibrate=(pattern=6)=>{try{if('vibrate'in navigator)navigator.vibrate(pattern)}catch{}};", "const vibrate=()=>false; // v43.34: devotional interactions are silent.");
replace(" if(!enabled&&!force)return false;", " return false; // v43.34: silence all feedback, including legacy force/test callers.\n if(!enabled&&!force)return false;");
replace("enabled=true,installed=false;", "enabled=false,installed=false;");
replace(" window.addEventListener('pointerdown',onPointerDown,{capture:true,passive:true});", " // v43.34: no delegated touch feedback.");
replace(" window.addEventListener('change',onChange,{capture:true,passive:true});", " // v43.34: no delegated selection feedback.");
replace("function setEnabled(v){enabled=!!v;", "function setEnabled(v){enabled=false;");
replace("delegatedCoverage:true,windowCapture:true,explicitRosaryBypass", "delegatedCoverage:false,windowCapture:false,explicitRosaryBypass");

// Only explicit buttons change the Mass view. No swipe navigation or text-wide toggle.
replace("    swapButton(event) {", "    lastNavigationAt = -Infinity;\n    swapButton(event) {");
replace("        if (el.dataset.liveNext !== undefined) {", "        if (el.matches('[data-live-next],[data-live-prev]')) {\n            const now=performance.now();if(now-this.lastNavigationAt<350)return;this.lastNavigationAt=now;\n        }\n        if (el.dataset.liveNext !== undefined) {");
replace("cleanLiteralFragments();reconcileSurfaces();installSwipe();", "cleanLiteralFragments();reconcileSurfaces(); // v43.34: swipe navigation disabled.");
replace("        if (swapSurface) {", "        if (swapSurface && button?.hasAttribute('data-live-swap')) {");
replace("        if (el.dataset.liveJump) {", "        if (el.dataset.liveJump) {\n            if (!window.confirm(state.language==='fr'?'Aller à cette partie de la Messe ?':'Jump to this part of the Mass?')) return;");
replace("            if (state.live.stepIndex >= max) {", "            if (state.live.stepIndex >= max) {\n                if (!window.confirm(state.language==='fr'?'Terminer le suivi de la Messe ?':'Finish following this Mass?')) return;");
replace("        const directBackdrop = target?.matches?.('[data-sheet-close]') ? target : null;", "        const directBackdrop = null; // Close sheets with the explicit close button.");

// Preserve the complete resolved celebration in the existing live-session record.
replace("        const record = this.persistence.resumeRecord();", "        const record = this.persistence.resumeRecord();\n        if(record&&!record.resolvedSession){try{const active=JSON.parse(localStorage.getItem('ao-active-resolved-mass-v23')||'null');if(active?.date===record.date)record.resolvedSession=active}catch{}}");
replace("if(s?.selectedDate&&session.date!==s.selectedDate)return clearActive();", "if(s?.selectedDate&&session.date!==s.selectedDate)return; // Retain saved celebration for deliberate resume.");
replace("if (!r?.active || !r.savedAt || now - r.savedAt > SESSION_MAX_AGE)", "if (!r?.active || !Number.isFinite(r.savedAt) || !/^\\d{4}-\\d{2}-\\d{2}$/.test(r.date||'') || !Number.isInteger(r.stepIndex) || r.stepIndex<0 || now - r.savedAt > SESSION_MAX_AGE)");
replace("            await this.resolve(record.date);\n        }\n        this.store.dispatch({ type: 'set-language'", "        }\n        await this.resolve(record.date);\n        this.store.dispatch({ type: 'set-language'");
replace("textMode: state.live.textMode, language: state.language }; storage.setItem(exports.SESSION_KEY", "textMode: state.live.textMode, language: state.language, resolvedSession: globalThis.AO_ACTIVE_MASS_SESSION?.date === state.selectedDate ? globalThis.AO_ACTIVE_MASS_SESSION : null }; storage.setItem(exports.SESSION_KEY");
replace("        this.store.dispatch({ type: 'set-language', language: (record.language === 'fr' ? 'fr' : 'en') });", "        if (record.resolvedSession?.date === record.date && record.resolvedSession?.proper && record.resolvedSession?.resolvedMass) {\n            globalThis.AO_ACTIVE_MASS_SESSION = record.resolvedSession;\n            try { localStorage.setItem('ao-active-resolved-mass-v23', JSON.stringify(record.resolvedSession)); } catch {}\n        }\n        this.store.dispatch({ type: 'set-language', language: (record.language === 'fr' ? 'fr' : 'en') });");
replace("        this.store.dispatch({ type: 'enter-live', resumeIndex: record.stepIndex });", "        this.store.dispatch({ type: 'enter-live', resumeIndex: Number.isInteger(record.stepIndex) && record.stepIndex >= 0 ? record.stepIndex : 0 });");

// Restore devotional position through its existing state/render owner. Never save examination answers.
replace("window.AOTraditionalPrayerBook={open,close,back,openModule,openPrayer,openExisting:launchExisting,getState:()=>({...S,externalReturn})};", `window.AOTraditionalPrayerBook={open,close,back,openModule,openPrayer,openExisting:launchExisting,getState:()=>({...S,externalReturn}),restorePosition:(x={})=>{
 const views=['hub','prayer','confession','rosary','angelus','stations','benediction'];
 if(!views.includes(x.view)||x.view==='prayer'&&!D.prayers[x.prayer])return false;
 externalReturn=null;S.view=x.view;S.prayer=x.view==='prayer'?x.prayer:null;
 S.rosarySet=['joyful','sorrowful','glorious','luminous'].includes(x.rosarySet)?x.rosarySet:null;
 S.rosaryForm=x.rosaryForm==='devotional'?'devotional':'standard';
 const bounded=(v,max)=>Number.isInteger(v)?Math.max(0,Math.min(max,v)):0;
 S.rosaryStep=bounded(x.rosaryStep,S.rosarySet?labRosarySteps(S.rosarySet).length-1:0);
 S.station=bounded(x.station,14);S.benedictionStep=bounded(x.benedictionStep,6);S.confStep=bounded(x.confStep,7);
 root.hidden=false;root.classList.add('open');root.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';render();return true;
}};`);

// Inline assets preserve the app's existing single-file/offline delivery model.
html += '\n<style id="ao-stabilization-v4334-css">\n' + readFileSync(new URL('../src/stabilization.css',import.meta.url),'utf8') + '\n</style>\n';
html += '<script id="ao-stabilization-v4334-js">\n' + readFileSync(new URL('../src/stabilization.js',import.meta.url),'utf8') + '\n</script>\n';
writeFileSync(new URL('../index.html',import.meta.url),html);
console.log('Built v43.34 stabilization from unchanged v43.33 corpus');
