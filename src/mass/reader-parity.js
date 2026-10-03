// R17 reader parity contract.
// Requirements are derived from the proven v1.65 mobile-native Mass reader
// and the R17 reader-state contract. This module audits presence only;
// it does not mutate the host reader.

export const READER_PARITY_REQUIREMENTS = Object.freeze([
  {id:"mode-missal",group:"MODES",selector:'[data-mode-btn="read"]',required:true},
  {id:"mode-simple",group:"MODES",selector:'[data-mode-btn="simple"]',required:true},
  {id:"mode-live",group:"MODES",selector:'[data-mode-btn="live"]',required:true},

  {id:"reader",group:"READER",selector:"#reader",required:true},
  {id:"prev",group:"NAV",selector:"#cardPrev",required:true},
  {id:"next",group:"NAV",selector:"#cardNext",required:true},
  {id:"counter",group:"NAV",selector:"#cardCounter",required:true},

  {id:"priest-position",group:"STATE_RIBBON",selector:"#stationText",required:true},
  {id:"section-guide",group:"STATE_RIBBON",selector:"#guideCopy",required:true},
  {id:"priest-action",group:"STATE_RIBBON",selector:"#sectionAction",required:true},

  {id:"posture",group:"FAITHFUL_RAIL",selector:"#postureCard",required:true},
  {id:"gesture",group:"FAITHFUL_RAIL",selector:"#gestureCard",required:true},
  {id:"respond",group:"FAITHFUL_RAIL",selector:"#responseCard",required:true},

  {id:"priest-voice",group:"AUDIO_RAIL",selector:"#voiceCard",required:true},
  {id:"bell",group:"AUDIO_RAIL",selector:"#bellCard",required:false},
  {id:"schola-dock",group:"SCHOLA",selector:"#scholaDock",required:true},
  {id:"schola-text",group:"SCHOLA",selector:"#scholaStreamLine",required:true},
  {id:"schola-translation",group:"SCHOLA",selector:"#scholaStreamTranslation",required:true},

  {id:"part-cinema",group:"CINEMATIC",selector:"#partCinema",required:true},
  {id:"guide-next-state",group:"GUIDE",selector:"#guideNext",required:true}
]);

export function auditSelectorPresence(hasSelector){
  if(typeof hasSelector!=="function")throw new TypeError("hasSelector function required");
  const checks=READER_PARITY_REQUIREMENTS.map(req=>Object.freeze({
    ...req,
    present:Boolean(hasSelector(req.selector)),
    pass:req.required?Boolean(hasSelector(req.selector)):true,
  }));
  const required=checks.filter(x=>x.required);
  const passed=required.filter(x=>x.present).length;
  return Object.freeze({
    schema:"ao-r17-reader-parity-v1",
    passed,
    required:required.length,
    complete:passed===required.length,
    checks:Object.freeze(checks),
    missing:Object.freeze(required.filter(x=>!x.present).map(x=>x.id)),
  });
}

export function auditReaderDocument(doc){
  if(!doc?.querySelector)throw new TypeError("Document/querySelector required");
  return auditSelectorPresence(selector=>Boolean(doc.querySelector(selector)));
}
