// One calendar-owned app theme. The Mass reader keeps its own selected-Proper
// palette, which may legitimately differ from the civil day's observance.
import { calendarMassColour } from "../calendar/colour-projection.js";
import { MASS_LITURGICAL_PALETTES, normalizeMassLiturgicalColour } from "../mass/reader-liturgical-theme.js";

export const APP_LITURGICAL_THEME_VERSION="app-liturgical-theme-v1";

const NEUTRAL=MASS_LITURGICAL_PALETTES.NEUTRAL;
const VALID=Object.freeze(new Set(Object.keys(MASS_LITURGICAL_PALETTES)));

export function resolveAppLiturgicalTheme(state){
  const date=String(state?.selectedDate??"");
  const r=state?.resolution;
  // Never colour today's app from yesterday's asynchronous response, an
  // unrelated calendar selection, or an unverified/outstanding resolution.
  const valid=Boolean(date&&r&&r.date===date&&r.status!=="failed"&&r.day?.main);
  const colour=valid?normalizeMassLiturgicalColour(calendarMassColour(r)):null;
  const key=colour&&VALID.has(colour)?colour:"NEUTRAL";
  return Object.freeze({
    key,
    source:key==="NEUTRAL"?"UNRESOLVED":"RESOLVED_SELECTED_DAY",
    date:date||null,
    tokens:MASS_LITURGICAL_PALETTES[key]??NEUTRAL,
    resolved:key!=="NEUTRAL",
  });
}

export function appThemeCssValues(theme){
  const tokens=theme?.tokens??NEUTRAL;
  const accent=tokens.accent??NEUTRAL.accent;
  // The foundation remains dark in every liturgical colour.
  return Object.freeze({
    "--bg":tokens.bg,
    "--surface-1":tokens.panel,
    "--surface-2":tokens.top,
    "--text":"#eef0ef",
    "--muted":"#a1acb9",
    "--border":"rgba(231,235,240,.12)",
    "--liturgical":accent,
    "--liturgical-border":`color-mix(in srgb, ${accent} 38%, transparent)`,
    "--liturgical-soft":`color-mix(in srgb, ${accent} 9%, transparent)`,
    "--ao-liturgical-accent-text":tokens.accentText??NEUTRAL.accentText,
  });
}

export function installAppLiturgicalTheme({win=globalThis}={}){
  if(win?.AO_APP_LITURGICAL_THEME_V1)return win.AO_APP_LITURGICAL_THEME_V1;
  const doc=win?.document,store=win?.AO_RUNTIME_V8?.store,html=doc?.documentElement;
  if(!html?.style?.setProperty||typeof store?.getState!=="function")return null;
  let current=null,release=null,disposed=false;
  function sync(state=store.getState()){
    if(disposed)return null;
    const theme=resolveAppLiturgicalTheme(state);
    // Avoid repaints on unrelated store updates; update only when the
    // resolved day or colour changes.
    if(current?.key===theme.key&&current?.date===theme.date&&current?.source===theme.source)return current;
    for(const [name,value] of Object.entries(appThemeCssValues(theme))){
      html.style.setProperty(name,value);
    }
    if(html.dataset){
      html.dataset.aoLiturgicalTheme=theme.key;
      html.dataset.aoLiturgicalThemeSource=theme.source;
      html.dataset.aoLiturgicalThemeOwner=APP_LITURGICAL_THEME_VERSION;
    }
    current=theme;
    return current;
  }
  sync();
  if(typeof store.subscribe==="function"){
    const unsub=store.subscribe(next=>sync(next));
    release=typeof unsub==="function"?unsub:null;
  }
  const api=Object.freeze({
    version:APP_LITURGICAL_THEME_VERSION,
    sync,
    status:()=>current,
    dispose(){
      disposed=true;
      release?.();
      release=null;
      if(win.AO_APP_LITURGICAL_THEME_V1===api)delete win.AO_APP_LITURGICAL_THEME_V1;
    },
  });
  win.AO_APP_LITURGICAL_THEME_V1=api;
  return api;
}
