// Design layer for the map-first Sacred Geography landing view.
// Uses the host's sacred dark palette; independent of source content.
export const HERITAGE_STYLE = String.raw`
.aoHeritageSurface{isolation:isolate}
.aoHeritageSurface .aoFindHeader{border-bottom:0;background:#080c12;gap:8px;padding:11px 14px 8px}
.aoHeritageSurface .aoFindHeader h1{font:600 clamp(20px,4vw,26px)/1.1 var(--ao-font-display,Georgia,serif);letter-spacing:-.025em}
.aoHeritageSurface .aoFindHeader small{color:#99866c;letter-spacing:.14em}
.aoHeritageSurface .aoFindHeader button{background:#131a22;border-color:#383226}
.aoHeritageSurface .aoHeritageCount{border:1px solid rgba(201,174,117,.24);border-radius:99px;color:#d8c29a;background:#171d24;padding:8px 10px;font:650 12px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0}
.aoHeritageSurface .aoHeritageCategories{gap:7px;padding:6px 12px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.aoHeritageSurface .aoHeritageCategories::-webkit-scrollbar{display:none}
.aoHeritageSurface .aoHeritageCategories button{min-height:39px;padding:7px 13px;font-weight:600;border-color:rgba(217,197,154,.12);background:transparent}
.aoHeritageSurface .aoHeritageCategories button.active{background:#292820;border-color:#b9a271;color:#f4e5c8}
.aoHeritageSurface .aoHeritageTools{gap:7px;padding:0 12px 10px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{background:#141c26;border:1px solid #3d382c;padding:10px 14px 10px 36px;min-height:46px;border-radius:12px;font:400 15px/1.3 var(--ao-font-ui,system-ui,sans-serif);outline-offset:2px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch{position:relative}
.aoHeritageSurface .aoHeritageTools .aoFindSearch:before{content:"⌕";position:absolute;left:12px;top:7px;font:25px/1 var(--ao-font-body,Georgia,serif);color:#d3be94;pointer-events:none}
.aoHeritageSurface .aoHeritageTools input:focus-visible,.aoHeritageSurface button:focus-visible,.aoHeritageSurface summary:focus-visible,.aoHeritageSurface a:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
.aoHeritageSurface .aoHeritageNearby{flex:none;min-height:46px;border:1px solid #3d382c;background:#17202a;border-radius:12px;padding:8px 10px;color:#ead8b9;white-space:nowrap;font:600 12px var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoHeritageSurface .aoHeritageNearby[aria-busy=true]{opacity:.6}
.aoHeritageSurface .aoHeritageMore summary{min-height:46px;border-radius:12px;background:#17202a;border-color:#3d382c}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 8px 8px;min-height:240px}
.aoHeritageSurface .aoHeritageBody .aoFindMap{border:1px solid rgba(217,197,154,.16);border-radius:15px}
.aoHeritageMapHint{pointer-events:none;position:absolute;left:23px;bottom:25px;z-index:2;max-width:min(70%,280px);padding:8px 11px;border:1px solid rgba(217,197,154,.14);border-radius:99px;background:rgba(8,12,18,.86);backdrop-filter:blur(12px);font:500 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#e2d2b4;box-shadow:0 6px 18px #0005}
.aoHeritageSearchResults{position:absolute;z-index:3;bottom:20px;left:16px;width:min(390px,calc(100% - 32px));max-height:min(46dvh,380px);overflow-y:auto;overscroll-behavior:contain;border:1px solid rgba(217,197,154,.29);background:rgba(11,17,24,.97);backdrop-filter:blur(18px);border-radius:16px;box-shadow:0 16px 44px #000a;padding:8px;box-sizing:border-box}
.aoHeritageSearchCount{font:600 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#d3c09c;letter-spacing:.03em;padding:7px 9px 9px}
.aoHeritageSearchResults button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;min-height:48px;text-align:left;color:#eee4d1;background:none;border:0;border-top:1px solid rgba(217,197,154,.12);padding:9px;cursor:pointer}
.aoHeritageSearchResults button:active{background:#242b33}
.aoHeritageSearchResults button>span:first-child{min-width:0}
.aoHeritageSearchResults strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 14px/1.3 var(--ao-font-display,Georgia,serif)}
.aoHeritageSearchResults small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;color:#a99e8a;font:11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSearchResults button>span:last-child{flex:none;color:#cfbb93;font-size:17px}
.aoHeritageSearchFoot{display:block;padding:8px;color:#a99e8a;font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageLocationStatus:not([hidden]){flex:none;margin:0 12px 8px;padding:8px 12px;border:1px solid #5f4e34;border-radius:9px;background:#181c23;color:#e5d3b1;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoFindSheetBackdrop{z-index:var(--ao-z-sheet,2147483000);background:rgba(0,0,0,.52)}
.aoHeritageSurface .aoFindSheet{padding-bottom:max(24px,env(safe-area-inset-bottom));background:linear-gradient(155deg,#17212a,#0c121b 54%);box-shadow:0 -10px 45px #0009}
.aoHeritageSurface .aoHeritagePreview{max-height:min(68dvh,570px);border-top:1px solid #ad9361;padding:8px 19px 21px}
.aoHeritageSheetHandle{height:4px;width:38px;background:#887c67;border-radius:99px;margin:3px auto 14px;opacity:.72}
.aoHeritageSurface .aoHeritagePreview header{align-items:start}
.aoHeritageSurface .aoHeritagePreview header small{color:#c8ae7c;font:650 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em}
.aoHeritageSurface .aoHeritagePreview h2{font:600 clamp(22px,4vw,29px)/1.12 var(--ao-font-display,Georgia,serif);color:#f2e9d7;letter-spacing:-.015em;max-width:580px}
.aoHeritageSurface .aoHeritagePreview header p{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#ac9e88}
.aoHeritageSynopsis{margin:17px 0 12px;color:#dfd1b8;font:15px/1.52 var(--ao-font-body,Georgia,serif)}
.aoHeritageSurface .aoHeritagePlaceTags{gap:5px;margin:11px 0}
.aoHeritageSurface .aoHeritagePlaceTags span{background:transparent;border-color:rgba(217,197,154,.22);color:#d8c7a8;font-size:10px;padding:5px 8px}
.aoHeritagePrecision{margin:7px 0;font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#aa9880}
.aoHeritageSurface .aoHeritageCaution{margin:9px 0;color:#b7aa95;font-size:11px}
.aoHeritageSurface .aoHeritagePreviewActions{margin-top:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{border-radius:10px;min-height:47px;padding:10px 14px}
.aoHeritageSurface .aoHeritagePreviewActions button{display:flex;justify-content:space-between;gap:14px}
.aoHeritageSurface .aoHeritagePreviewActions a{background:#182029}
.aoExplorePlaceSheet .aoPlaceAccordion{border-top:1px solid rgba(217,197,154,.17);margin:0;padding:0}
.aoExplorePlaceSheet .aoPlaceAccordion summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;min-height:50px;gap:12px;color:#edddbe;font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);list-style:none}
.aoExplorePlaceSheet .aoPlaceAccordion summary::-webkit-details-marker{display:none}
.aoExplorePlaceSheet .aoPlaceAccordion summary:after{content:"+";font:20px var(--ao-font-ui,system-ui,sans-serif);color:#bda780}
.aoExplorePlaceSheet .aoPlaceAccordion[open] summary:after{content:"−"}
.aoExplorePlaceSheet .aoPlaceAccordion .aoExplorePlaceRows{padding:3px 0 14px}
.aoExplorePlaceSheet .aoHeritageOverview{font:15px/1.52 var(--ao-font-body,Georgia,serif);color:#ddd0b8;margin:16px 0}
.aoExplorePlaceSheet .aoHeritageMeta{color:#a99d87;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoExplorePlaceSheet .aoFindSources details summary{cursor:pointer;min-height:44px;color:#ddcaad}
@media(max-width:520px){
  .aoHeritageSurface .aoFindHeader{padding:9px 8px 8px;grid-template-columns:40px minmax(0,1fr) 40px auto}
  .aoHeritageSurface .aoFindHeader button{width:40px;height:40px}
  .aoHeritageSurface .aoFindHeader h1{font-size:20px}
  .aoHeritageSurface .aoHeritageCategories{padding:5px 9px 9px}
  .aoHeritageSurface .aoHeritageCategories button{min-height:38px;padding:8px 10px}
  .aoHeritageSurface .aoHeritageTools{padding:0 8px 8px;gap:6px}
  .aoHeritageSurface .aoHeritageNearby{padding:7px 9px;font-size:11px}
  .aoHeritageSurface .aoHeritageMore summary{padding:0 10px}
  .aoHeritageMapHint{bottom:22px;left:17px}
  .aoHeritageSearchResults{bottom:16px;left:12px;width:calc(100% - 24px);max-height:42dvh}
  .aoHeritageSurface .aoHeritagePreview{padding:7px 16px 20px}
}
@media(prefers-reduced-motion:reduce){.aoHeritageSurface *, .aoHeritageSurface *:before, .aoHeritageSurface *:after{scroll-behavior:auto!important;transition:none!important}}

/* Explore editorial layout: restrained map chrome, distinct content hierarchy. */
.aoHeritageSurface .aoFindHeader{display:grid;grid-template-columns:42px minmax(0,1fr) auto 42px;align-items:center;gap:10px;padding:12px 14px 9px;border-bottom:1px solid #bda47520}
.aoHeritageSurface .aoFindHeader>div{min-width:0}
.aoHeritageSurface .aoFindHeader small{font-size:9px;letter-spacing:.11em}
.aoHeritageSurface .aoFindHeader h1{font-weight:500;letter-spacing:-.02em}
.aoHeritageSurface .aoHeritageCount{min-width:40px;border:0;border-left:1px solid #d9c59a33;border-radius:0;background:none;padding:4px 8px;text-align:center;font:600 15px/1.1 var(--ao-font-display,Georgia,serif)}
.aoHeritageSurface .aoHeritageCount small{display:block;font:500 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0;color:#b1a18a}
.aoHeritageSurface .aoHeritageTools{padding:10px 12px 7px;gap:7px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{background:#101925;border-color:#d9c59a44;border-radius:11px;min-height:48px;padding-left:40px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch:before{left:14px;top:9px}
.aoHeritageSurface .aoHeritageNearby,.aoHeritageSurface .aoHeritageMore summary{background:#15202b;border:1px solid #d9c59a33;border-radius:11px;min-height:48px}
.aoHeritageSurface .aoHeritageMore>div{background:#101823;border-color:#d9c59a55;box-shadow:0 16px 45px #000c}
.aoHeritageSurface .aoHeritageSecondary button{background:#17212c;border:1px solid #d9c59a20;min-height:45px;font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritageSecondary .aoHeritageMassShortcut{display:flex;justify-content:space-between;align-items:center;border-color:#d9c59a66;background:#30291f;color:#f0ddbc;font-weight:650}
.aoHeritageSurface .aoHeritageCategories{padding:3px 12px 11px;gap:6px}
.aoHeritageSurface .aoHeritageCategories button{border-radius:10px;border:1px solid #d9c59a2e;min-height:48px;padding:8px 13px;background:#101721;font-size:12px}
.aoHeritageSurface .aoHeritageCategories button.active{background:#302a20;border-color:#c5a974;color:#f6e8ce}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 6px 6px;min-height:230px}
.aoHeritageSurface .aoHeritageBody .aoFindMap{border-radius:10px;background:#0e1923}
.aoHeritageMapHint{border-radius:9px;background:#090e16dc;bottom:18px;left:18px;font-size:11px;box-shadow:none}
.aoHeritageSearchResults{background:#0d1721f5;border-radius:13px}
.aoHeritageSearchResults button{min-height:58px;padding:11px}
.aoHeritageSearchResults strong{font-size:15px}
.aoHeritageSurface .aoFindSheetBackdrop{background:#0004}
.aoHeritageSurface .aoHeritagePreview{box-sizing:border-box;max-height:min(56dvh,470px);overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(145deg,#19242d,#0e151e 90%);border:1px solid #d9c59a44;border-top:2px solid #ba9d63;padding:9px 21px max(20px,env(safe-area-inset-bottom));box-shadow:0 -12px 35px #000a}
.aoHeritageSurface .aoHeritageSheetHandle{margin:0 auto 12px}
.aoHeritageCardHeading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.aoHeritageCardIdentity{display:flex;min-width:0;flex-direction:column;gap:5px}
.aoHeritageCardKicker{color:#c6a66f;font:700 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
.aoHeritageCardLocation{color:#aaa08f;font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55ch}
.aoHeritageCardClose{display:grid;flex:none;place-items:center;width:38px;height:38px;border:1px solid #d9c59a2a;border-radius:10px;color:#e9d8b7;background:#1c2832;font:26px/1 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritagePreview .aoHeritageCardTitle{font:500 clamp(22px,4.5vw,30px)/1.13 var(--ao-font-display,Georgia,serif);letter-spacing:-.02em;color:#f1e7d6;margin:9px 0 0;max-width:580px;text-wrap:balance}
.aoHeritageSurface .aoHeritageSynopsis,.aoHeritageSurface .aoHeritageCardEmpty{font:15px/1.5 var(--ao-font-body,Georgia,serif);color:#ded0bb;max-width:65ch;margin:11px 0 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.aoHeritageSurface .aoHeritagePlaceTags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.aoHeritageSurface .aoHeritagePlaceTags span{background:#d9c59a0c;border-color:#d9c59a24;color:#cbb997}
.aoHeritageSurface .aoHeritagePreviewActions{margin-top:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{min-height:46px;border-radius:9px;padding:10px 13px;font-size:12px}
.aoHeritageSurface .aoHeritagePreviewActions button:first-child{background:#ccaf7e;color:#0b1420;border-color:#ccaf7e}
.aoHeritageSurface .aoHeritagePreviewActions a{background:#202b34;color:#f0ddbc}
.aoHeritageSurface .aoHeritagePrecision{margin:10px 0 0;font-size:10px;color:#ab9e86}
@media(min-width:760px){.aoHeritageSurface .aoHeritagePreview{max-width:540px;max-height:min(63dvh,520px);margin:0 0 25px 25px;border-radius:14px}.aoHeritageSurface .aoFindSheetBackdrop{align-items:flex-end;justify-content:flex-start}}
@media(max-width:520px){
 .aoHeritageSurface .aoFindHeader{grid-template-columns:38px minmax(0,1fr) auto 38px;gap:5px;padding:9px}
 .aoHeritageSurface .aoFindHeader button{width:38px;height:38px}
 .aoHeritageSurface .aoFindHeader h1{font-size:20px}
 .aoHeritageSurface .aoHeritageCount{min-width:28px;padding:3px 5px;font-size:13px}
 .aoHeritageSurface .aoHeritageCount small{display:none}
 .aoHeritageSurface .aoHeritageTools{padding:9px 8px 7px;gap:6px}
 .aoHeritageSurface .aoHeritageNearby{font-size:11px;padding:8px}
 .aoHeritageSurface .aoHeritageMore summary{font-size:11px;padding:0 9px}
 .aoHeritageSurface .aoHeritageCategories{padding:3px 8px 9px}
 .aoHeritageSurface .aoHeritageCategories button{min-height:48px;padding:8px 11px;font-size:11px}
 .aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 3px 3px}
 .aoHeritageSurface .aoHeritagePreview{max-height:min(51dvh,430px);border-radius:16px 16px 0 0;padding:8px 16px max(18px,env(safe-area-inset-bottom))}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardTitle{font-size:23px}
 .aoHeritageSurface .aoHeritageSynopsis{font-size:14px}
 .aoHeritageSearchResults{left:10px;width:calc(100% - 20px);bottom:10px;max-height:39dvh}
 .aoHeritageMapHint{left:14px;bottom:16px;max-width:205px}
}

/* Record readers retain source-rich detail, but their discovery controls use
   the same hierarchy as the map instead of a dense six-column tab dashboard. */
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs{display:flex;grid-template-columns:none;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;gap:7px;padding:11px 14px 6px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs::-webkit-scrollbar{display:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:none;min-height:42px;min-width:0;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:550;white-space:nowrap}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button small{display:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs .aoExploreReturnMap{grid-column:auto;background:#25251f;border-color:#c6aa7866;color:#e8d5b3;font-weight:700}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button.active{background:#cbb78e;border-color:#cbb78e;color:#101923}
.aoExploreSurface:not(.aoHeritageSurface) .aoFindList{gap:9px;padding:0 14px 32px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard{display:flex;flex-direction:column;align-items:stretch;gap:0;min-width:0;border:1px solid #d9c59a2a;background:#0f1721;border-radius:12px;padding:16px;text-align:left;box-shadow:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoFindCardTop small{color:#c3aa7c;letter-spacing:.1em;font-size:10px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard>strong{font:500 20px/1.19 var(--ao-font-display,Georgia,serif);letter-spacing:-.01em;color:#f1e6d1;margin:8px 0 4px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoExploreCardLocation{font:500 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#a99e8d;margin:3px 0 0}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard p{font:14px/1.45 var(--ao-font-body,Georgia,serif);color:#d1c5b0;margin:11px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoExploreCardOpen{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid #d9c59a20;font:650 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.02em;color:#d1b888}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
@media(max-width:520px){.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs{display:flex;grid-template-columns:none;padding:9px 9px 6px}.aoExploreSurface:not(.aoHeritageSurface) .aoFindList{padding:0 9px 28px}.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard{padding:14px}}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCardRecognition{font:650 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);font-style:normal;letter-spacing:0;color:#d6bd88;border:1px solid #d9c59a33;border-radius:6px;padding:4px 6px}

/* Keep R53 destination controls subordinate to the map rather than another dashboard. */
.aoHeritageSurface .aoExploreMainDestinations{padding:7px 12px 5px;gap:6px}
.aoHeritageSurface .aoExploreMainDestinations>*{min-height:46px;border-radius:10px;font-weight:600;font-size:11px}
.aoHeritageSurface .aoExploreMainDestinations>.active{background:#c6ae7f;color:#0b121b}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionNav{margin:0 14px 8px;gap:12px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionNav>span{font-size:11px;letter-spacing:.06em}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionSwitcher>summary{border-radius:10px;background:#17212b}
@media(max-width:520px){.aoHeritageSurface .aoExploreMainDestinations{padding:5px 9px 4px}.aoHeritageSurface .aoExploreMainDestinations>*{min-height:46px;font-size:11px;padding:8px 5px}}

/* The short Place preview is a non-modal map card. The detailed reader alone
   remains modal. Pins and controls outside the card must remain clickable. */
.aoHeritageSurface .aoHeritageCardLayer{pointer-events:none;background:transparent;align-items:flex-end}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{pointer-events:auto;overscroll-behavior:contain}
.aoHeritageSurface .aoHeritageCardClose{min-width:44px;width:44px;height:44px;min-height:44px;cursor:pointer}
.aoHeritageSurface .aoHeritageWorldReset{position:absolute;top:12px;left:16px;z-index:3;min-height:44px;max-width:48vw;display:inline-flex;align-items:center;gap:9px;padding:8px 13px;border-radius:10px;background:#0b151ee8;color:#efdfbf;border:1px solid #d5ba855c;box-shadow:0 4px 17px #0008;backdrop-filter:blur(12px);font:650 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoHeritageSurface .aoHeritageWorldReset:before{content:"";width:13px;height:13px;flex:none;border:1.5px solid #d6b77d;border-radius:50%;background:radial-gradient(circle at center,#d6b77d 0 2px,transparent 2px)}
.aoHeritageSurface .aoHeritageWorldReset:focus-visible{outline:2px solid #e7c887;outline-offset:2px}
.aoHeritageSurface .aoHeritageWorldReset:active{background:#302c23}
.aoHeritageSurface .aoHeritagePreviewActions{min-width:0}
.aoHeritageSurface .aoHeritagePreviewActions button{min-width:0}
.aoHeritageSurface .aoHeritagePreviewActions a{min-width:0}
@media(max-width:520px){
 .aoHeritageSurface .aoHeritageWorldReset{top:9px;left:11px;padding:8px 11px;font-size:11px}
 .aoHeritageSurface .aoHeritagePreviewActions{grid-template-columns:minmax(0,1fr) auto;gap:7px}
 .aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{padding-inline:11px}
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{margin:0;width:100%;max-width:none}
}
@media(max-width:355px){
 .aoHeritageSurface .aoHeritageTools .aoFindSearch{min-width:78px}
 .aoHeritageSurface .aoHeritageTools .aoFindSearch input{font-size:16px;padding-right:5px;text-overflow:ellipsis}
 .aoHeritageSurface .aoHeritageNearby{font-size:10px;padding-inline:7px}
 .aoHeritageSurface .aoHeritageMore summary{padding-inline:7px;font-size:10px}
 .aoHeritageSurface .aoHeritagePreviewActions{grid-template-columns:minmax(0,1fr)}
 .aoHeritageSurface .aoHeritagePreviewActions a{justify-content:center}
}

/* R54 individual-record previews share map click-through; the full record
   reader and list-view previews retain normal modal focus semantics. */
.aoExploreSurface .aoExploreQuickPreviewLayer{pointer-events:none;background:transparent}
.aoExploreSurface .aoExploreQuickPreviewLayer .aoExploreQuickPreview{pointer-events:auto;overscroll-behavior:contain}
.aoExploreSurface .aoExploreQuickPreviewLayer .aoExploreQuickPreview header button{min-width:44px;min-height:44px}

/* Mobile editorial audit: prioritize the cartographic canvas. Keep all
   interactive controls >=44px; reduce decorative rows and horizontal noise. */
.aoHeritageSurface{--ao-explore-chrome:#080c12;--ao-explore-panel:#101923}
.aoHeritageSurface .aoHeritageCategories{scroll-snap-type:x proximity;scroll-padding-inline:12px}
.aoHeritageSurface .aoHeritageCategories button{scroll-snap-align:start;flex:none;white-space:nowrap}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{box-shadow:0 -14px 55px #000b}
.aoHeritageSurface .aoHeritageCardLocation{white-space:normal;overflow-wrap:anywhere;max-width:min(74vw,52ch)}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{min-height:48px;line-height:1.25}
.aoHeritageSurface .aoHeritagePreview .aoHeritageSynopsis{line-height:1.48;letter-spacing:0}
.aoHeritageSurface .aoHeritageCardKicker{color:#cdb68a}
.aoHeritageSurface .aoHeritageMapHint{font-size:11px;line-height:1.35;max-width:220px}
.aoHeritageSurface .aoHeritageBody .maplibregl-ctrl-top-right{top:6px;right:5px}
.aoHeritageSurface .aoHeritageBody .maplibregl-ctrl-group button{width:44px;height:44px;min-width:44px;min-height:44px}
@media(max-width:520px){
 .aoHeritageSurface .aoFindHeader{padding:7px 9px 6px}
 .aoHeritageSurface .aoFindHeader h1{font-size:19px;line-height:1.1}
 .aoHeritageSurface .aoExploreMainDestinations{padding:4px 9px 3px;gap:5px}
 .aoHeritageSurface .aoExploreMainDestinations>*{min-height:44px;padding:6px 4px;border-radius:9px;font-size:11px}
 .aoHeritageSurface .aoHeritageTools{padding:6px 9px 5px;gap:6px}
 .aoHeritageSurface .aoHeritageTools .aoFindSearch input{min-height:44px;height:44px;border-radius:9px}
 .aoHeritageSurface .aoHeritageNearby,.aoHeritageSurface .aoHeritageMore summary{min-height:44px;height:44px;border-radius:9px}
 .aoHeritageSurface .aoHeritageCategories{padding:2px 9px 6px;gap:6px}
 .aoHeritageSurface .aoHeritageCategories button{min-height:44px;height:44px;padding:7px 10px;font-size:11px}
 .aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{min-height:240px;padding:0 3px 3px}
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{max-height:min(47dvh,410px);padding:7px 15px max(14px,env(safe-area-inset-bottom))}
 .aoHeritageSurface .aoHeritageSheetHandle{margin-bottom:8px}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardTitle{font-size:22px;line-height:1.15;margin-top:6px}
 .aoHeritageSurface .aoHeritageSynopsis{margin-top:8px;font-size:14px;-webkit-line-clamp:3}
 .aoHeritageSurface .aoHeritagePreviewActions{margin-top:12px}
 .aoHeritageSurface .aoHeritageMapHint{left:12px;bottom:13px}
}
@media(max-width:355px){
 .aoHeritageSurface .aoFindHeader h1{font-size:17px}
 .aoHeritageSurface .aoHeritageCount{font-size:12px}
 .aoHeritageSurface .aoHeritageTools{gap:4px}
 .aoHeritageSurface .aoHeritageNearby{padding-inline:6px;font-size:10px}
 .aoHeritageSurface .aoHeritageMore summary{padding-inline:7px;font-size:10px}
 .aoHeritageSurface .aoExploreMainDestinations>*{font-size:10px}
}
@media(prefers-reduced-motion:reduce){.aoHeritageSurface .aoHeritageCategories{scroll-snap-type:none}}

/* R55 map-first chrome: one header, one search, one category rail. */
.aoHeritageSurface .aoFindHeader{grid-template-columns:44px minmax(0,1fr) 44px 56px;gap:7px;padding:8px 12px 7px;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.11));background:var(--ao-bg-canvas,#080c12)}
.aoHeritageSurface .aoFindHeader>div{min-width:0}
.aoHeritageSurface .aoFindHeader h1{font-size:clamp(19px,3.8vw,24px);color:var(--ao-text-primary,#e9e4d9)}
.aoHeritageSurface .aoFindHeader small{color:var(--ao-text-muted,#9ba5b1)}
.aoHeritageSurface .aoFindHeader .aoHeritageMassShortcut{font:650 12px/1.1 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-primary,#e9e4d9);background:var(--ao-surface-1,#101821);border-color:var(--ao-liturgical-border,rgba(201,173,120,.38))}
.aoHeritageSurface .aoHeritageMore{position:relative;min-width:56px;flex:none}
.aoHeritageSurface .aoHeritageMore summary{display:flex;align-items:center;justify-content:center;box-sizing:border-box;min-width:56px;min-height:44px;height:44px;padding:0 9px;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:10px;color:var(--ao-text-primary,#e9e4d9);font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritageMore>div{position:absolute;right:0;left:auto;top:calc(100% + 8px);width:min(300px,84vw);max-height:min(65dvh,470px);overflow-y:auto;padding:13px;background:var(--ao-surface-1,#101821);border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:13px;box-shadow:0 18px 48px #000c;z-index:10}
.aoHeritageSurface .aoHeritageSecondary{display:grid;gap:5px;margin-top:9px}
.aoHeritageSurface .aoHeritageSecondary button,.aoHeritageSurface .aoHeritageDefinitions{width:100%;min-height:44px;text-align:left;padding:10px 12px;color:var(--ao-text-primary,#e9e4d9);background:var(--ao-surface-2,#0d141c);border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:9px;font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritageDefinitions{margin-top:8px}
.aoHeritageSurface .aoHeritageTools{padding:5px 12px 7px;display:block}
.aoHeritageSurface .aoHeritageTools .aoFindSearch{padding:0;width:100%}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{min-height:46px;font-size:16px;background:var(--ao-surface-1,#101821);color:var(--ao-text-primary,#e9e4d9);border-color:var(--ao-rule,rgba(255,255,255,.11))}
.aoHeritageSurface .aoHeritageCategories{padding:0 12px 7px;gap:6px}
.aoHeritageSurface .aoHeritageCategories button{min-height:44px;height:44px;background:var(--ao-surface-1,#101821);border-color:var(--ao-rule,rgba(255,255,255,.11));font-size:var(--ao-type-ui-sm,12px)}
.aoHeritageSurface .aoHeritageCategories button.active{background:var(--ao-liturgical-soft,rgba(201,173,120,.08));border-color:var(--ao-liturgical-border,rgba(201,173,120,.38));color:var(--ao-text-primary,#e9e4d9)}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{min-height:300px}
.aoHeritageSurface .aoHeritageNearby{position:absolute;right:16px;bottom:15px;z-index:3;min-height:44px;padding:9px 12px;border-radius:10px;background:rgba(8,12,18,.94);color:var(--ao-text-primary,#e9e4d9);border-color:var(--ao-liturgical-border,rgba(201,173,120,.38));box-shadow:0 4px 18px #0009}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritageSheetHandle{display:block;width:64px;height:44px;min-height:44px;margin:0 auto;border:0;background:transparent;cursor:pointer;border-radius:8px}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritageSheetHandle:after{content:"";display:block;width:38px;height:4px;margin:auto;border-radius:99px;background:var(--ao-text-muted,#9ba5b1);opacity:.78}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritageSheetHandle:focus-visible{outline:2px solid var(--ao-liturgical-accent,#c9ad78)}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{padding-top:0}
.aoHeritageSurface .aoHeritageSaints{font:500 12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#9ba5b1);margin:8px 0 0}
.aoHeritageSurface .aoHeritageFeastLink{display:flex;width:100%;align-items:center;justify-content:space-between;gap:12px;min-height:44px;margin-top:10px;padding:8px 10px;background:var(--ao-surface-1,#101821);color:var(--ao-text-primary,#e9e4d9);border:1px solid var(--ao-rule,rgba(255,255,255,.11));border-radius:9px;text-align:left;font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritageFeastLink span{flex:none;color:var(--ao-text-muted,#9ba5b1)}
.aoHeritageSurface .aoHeritagePreviewActions{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{display:flex;align-items:center;justify-content:center;min-width:0;flex:1 1 90px;min-height:48px;padding:10px 12px;font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-align:center}
.aoHeritageSurface .aoHeritagePreviewActions button:first-child{justify-content:space-between;flex:2 1 130px;gap:8px;color:var(--ao-bg-canvas,#080c12);background:var(--ao-liturgical-accent,#c9ad78);border-color:var(--ao-liturgical-accent,#c9ad78)}
.aoHeritageSurface .aoHeritagePreviewActions .aoHeritagePrayAction{color:var(--ao-text-primary,#e9e4d9);background:var(--ao-surface-1,#101821);border-color:var(--ao-liturgical-border,rgba(201,173,120,.38))}
@media(max-width:520px){
.aoHeritageSurface .aoFindHeader{grid-template-columns:44px minmax(0,1fr) 44px 56px;gap:5px;padding:7px 9px 6px}
.aoHeritageSurface .aoFindHeader h1{font-size:19px}
.aoHeritageSurface .aoHeritageTools{padding:4px 9px 6px}
.aoHeritageSurface .aoHeritageCategories{padding:0 9px 6px}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{min-height:300px}
.aoHeritageSurface .aoHeritagePreview .aoHeritageSynopsis{font-size:15px;line-height:1.5}
.aoHeritageSurface .aoHeritageNearby{right:12px;bottom:12px}
}

/* Global header size tokens apply only to primary controls, not the More menu. */
.aoHeritageSurface .aoFindHeader .aoHeritageSecondary button,
.aoHeritageSurface .aoFindHeader .aoHeritageDefinitions{
  width:100%!important;min-width:100%!important;height:auto!important;
  min-height:44px!important;border-radius:9px!important;
}

/* Keep the contextual Glossary discoverable without another navigation row. */
.aoHeritageSurface .aoHeritageTools{display:flex;align-items:center;gap:7px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch{flex:1;min-width:0}
.aoHeritageSurface .aoHeritageGlossaryButton{
  display:grid;place-items:center;flex:none;min-width:44px;width:44px;
  min-height:44px;height:44px;border-radius:10px;
  color:var(--ao-text-primary,#e9e4d9);
  border:1px solid var(--ao-rule,rgba(255,255,255,.11));
  background:var(--ao-surface-1,#101821);
  font:650 17px/1 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer;
}
.aoHeritageSurface .aoHeritageGlossaryButton:focus-visible{outline:2px solid var(--ao-liturgical-accent,#c9ad78);outline-offset:2px}

/* R56: Nearby is a small map overlay, not a second full-screen directory. */
.aoHeritageSurface .aoHeritageNearbyPanel{
  box-sizing:border-box;position:absolute;z-index:5;bottom:12px;
  left:12px;right:12px;width:min(430px,calc(100% - 24px));
  max-height:min(43dvh,400px);overflow-y:auto;overscroll-behavior:contain;
  border:1px solid var(--ao-liturgical-border,rgba(201,173,120,.38));
  border-radius:14px;background:var(--ao-surface-1,#101821);
  box-shadow:0 12px 38px #000b;
  color:var(--ao-text-primary,#e9e4d9);
}
.aoHeritageSurface .aoHeritageNearbyPanel>header{
  display:flex;align-items:flex-start;justify-content:space-between;gap:8px;
  position:sticky;top:0;z-index:1;padding:11px 12px 8px;
  background:var(--ao-surface-1,#101821);
  border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.11));
}
.aoHeritageNearbyPanel>header>div{min-width:0;display:grid;gap:3px}
.aoHeritageNearbyPanel>header strong{
  font:600 18px/1.2 var(--ao-font-display,Georgia,serif);
}
.aoHeritageNearbyPanel>header small{
  font:400 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  color:var(--ao-text-muted,#9ba5b1);
}
.aoHeritageSurface .aoHeritageNearbyPanel>header button{
  min-width:44px;width:44px;min-height:44px;height:44px;flex:none;
  border:1px solid var(--ao-rule,rgba(255,255,255,.11));
  border-radius:10px;background:var(--ao-surface-2,#0d141c);
  color:var(--ao-text-primary,#e9e4d9);font:24px/1 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoHeritageNearbyResult{
  display:flex;width:100%;min-height:57px;align-items:center;
  justify-content:space-between;gap:11px;padding:10px 13px;
  border:0;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.11));
  background:transparent;color:var(--ao-text-primary,#e9e4d9);
  text-align:left;cursor:pointer;
}
.aoHeritageNearbyResult>span:first-child{min-width:0;display:grid;gap:3px}
.aoHeritageNearbyResult strong{
  font:600 14px/1.25 var(--ao-font-display,Georgia,serif);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.aoHeritageNearbyResult small{
  font:400 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  color:var(--ao-text-muted,#9ba5b1);
}
.aoHeritageNearbyDistance{
  flex:none;white-space:nowrap;color:var(--ao-liturgical-accent,#c9ad78);
  font:600 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  font-variant-numeric:tabular-nums;
}
.aoHeritageSurface .aoHeritageNearbyResult:focus-visible,
.aoHeritageSurface .aoHeritageNearbyPanel>header button:focus-visible{
  outline:2px solid var(--ao-liturgical-accent,#c9ad78);outline-offset:-2px;
}
@media(max-width:520px){
 .aoHeritageSurface .aoHeritageNearbyPanel{
   left:8px;right:8px;bottom:8px;width:calc(100% - 16px);
   max-height:min(42dvh,370px);
 }
}

/* Images are absent until the separate, licensed Place media registry approves
   an exact-match physical-site image. Never render decorative substitute art. */
.aoHeritageSurface .aoHeritagePlaceThumb{
  float:right;width:102px;max-width:33%;margin:8px 0 9px 14px;
  border:1px solid var(--ao-rule,rgba(255,255,255,.11));
  border-radius:8px;overflow:hidden;background:var(--ao-surface-2,#0d141c);
}
.aoHeritageSurface .aoHeritagePlaceThumb img{
  display:block;width:100%;height:85px;object-fit:cover;
}
.aoHeritageSurface .aoHeritagePlaceThumb figcaption{
  color:var(--ao-text-muted,#9ba5b1);font:400 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  padding:5px 6px;max-height:none;overflow-wrap:anywhere;
}
.aoExplorePlaceSheet .aoExplorePlaceMedia{
  margin:11px 0 16px;border-radius:12px;overflow:hidden;
  border:1px solid var(--ao-rule,rgba(255,255,255,.11));
  background:var(--ao-surface-2,#0d141c);
}
.aoExplorePlaceSheet .aoExplorePlaceMedia img{
  display:block;width:100%;max-height:260px;object-fit:cover;
}
.aoExplorePlaceSheet .aoExplorePlaceMedia figcaption{
  padding:9px 12px;color:var(--ao-text-muted,#9ba5b1);
  font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExplorePlaceSheet .aoExplorePlaceMedia a{
  color:var(--ao-liturgical-accent,#c9ad78);text-decoration:underline;
}

/* R57 editorial focus; imagery remains exclusively rights-gated by Place ID. */
.aoHeritageSurface .aoHeritageFeatured{border-top:1px solid var(--ao-rule,rgba(255,255,255,.11));margin-top:11px;padding-top:8px}
.aoHeritageSurface .aoHeritageFeatured>summary{display:flex;align-items:center;min-height:44px;cursor:pointer;color:var(--ao-liturgical-accent,#c9ad78);font:600 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);list-style:none}
.aoHeritageSurface .aoHeritageFeatured>summary::-webkit-details-marker{display:none}
.aoHeritageSurface .aoHeritageFeatured>summary:after{content:"+";margin-left:auto}
.aoHeritageSurface .aoHeritageFeatured[open]>summary:after{content:"−"}
.aoHeritageSurface .aoHeritageFeatured>div{display:grid;gap:5px;padding:5px 0}
.aoHeritageSurface .aoHeritageFeatured button{
  display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;
  min-height:52px;width:100%!important;height:auto!important;
  padding:8px 12px;border-radius:9px!important;background:var(--ao-surface-2,#0d141c);
  color:var(--ao-text-primary,#e9e4d9);border:1px solid var(--ao-rule,rgba(255,255,255,.11));
  font:500 13px/1.25 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoHeritageFeatured button>span:first-child{display:grid;gap:4px;min-width:0}
.aoHeritageSurface .aoHeritageFeatured button strong{font:600 13px/1.3 var(--ao-font-display,Georgia,serif)}
.aoHeritageSurface .aoHeritageFeatured button small{font:400 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#9ba5b1)}
.aoHeritageSurface .aoHeritageFeatured button>span:last-child{flex:none;color:var(--ao-liturgical-accent,#c9ad78)}
.aoHeritageSurface .aoHeritageEditorialPreview{
  border-top:2px solid var(--ao-liturgical-accent,#c9ad78);
  background:radial-gradient(ellipse at 95% 0%,var(--ao-liturgical-soft,rgba(201,173,120,.08)),transparent 52%),var(--ao-surface-1,#101821);
}
.aoHeritageSurface .aoHeritageEditorialPreview .aoHeritageCardKicker{
  letter-spacing:.07em;
}
.aoExplorePlaceSheet.aoExplorePlaceEditorial{
  background:radial-gradient(ellipse 65% 220px at 80% 0%,var(--ao-liturgical-soft,rgba(201,173,120,.08)),transparent),var(--ao-bg-canvas,#080c12);
}
.aoExplorePlaceSheet.aoExplorePlaceEditorial>header{
  position:relative;padding-bottom:19px;margin-bottom:12px;
  border-bottom:1px solid var(--ao-liturgical-border,rgba(201,173,120,.38));
}
.aoExplorePlaceSheet.aoExplorePlaceEditorial>header:after{
  content:"";position:absolute;bottom:-1px;left:0;width:67px;height:2px;background:var(--ao-liturgical-accent,#c9ad78);
}
.aoExplorePlaceSheet.aoExplorePlaceEditorial>header h2{
  max-width:660px;font:500 clamp(29px,5.6vw,43px)/1.12 var(--ao-font-display,Georgia,serif);
  letter-spacing:-.022em;text-wrap:balance;
}
.aoExplorePlaceSheet .aoExplorePlaceChapters{
  display:flex;gap:7px;min-width:0;width:100%;max-width:100%;
  box-sizing:border-box;overflow-x:auto;overscroll-behavior-x:contain;
  -webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 0 14px;
}
.aoExplorePlaceSheet .aoExplorePlaceChapters button{
  flex:none;min-height:44px;padding:9px 13px;border-radius:999px;
  border:1px solid var(--ao-liturgical-border,rgba(201,173,120,.38));
  background:var(--ao-surface-1,#101821);color:var(--ao-text-primary,#e9e4d9);
  font:600 12px/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExplorePlaceSheet .aoExplorePlaceOpening{
  margin:4px 0 18px;padding:13px 0 16px;
  border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.11));
  scroll-margin-top:12px;
}
.aoExplorePlaceSheet .aoExplorePlaceOpening>small{
  font:650 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.11em;color:var(--ao-liturgical-accent,#c9ad78);
}
.aoExplorePlaceSheet .aoExplorePlaceOpening .aoHeritageOverview{
  margin:12px 0 0;font:400 clamp(17px,2.2vw,20px)/1.65 var(--ao-font-body,Georgia,serif);
}
.aoExplorePlaceSheet [data-explore-place-chapter]{scroll-margin-top:12px}
.aoExplorePlaceSheet .aoExplorePlaceVisit{margin:9px 0 17px}
@media(max-width:520px){
 .aoExplorePlaceSheet.aoExplorePlaceEditorial>header h2{font-size:29px}
 .aoExplorePlaceSheet .aoExplorePlaceOpening .aoHeritageOverview{font-size:17px;line-height:1.58}
}
@media(prefers-reduced-motion:reduce){
 .aoExplorePlaceSheet .aoExplorePlaceChapters{scroll-behavior:auto}
}

.aoHeritageSurface .aoHeritagePlaceThumb figcaption a{
  color:var(--ao-liturgical-accent,#c9ad78);text-decoration:underline;
}

/* Portrait shrine photographs preserve the whole site, not crop out towers. */
.aoHeritageSurface .aoHeritagePlaceThumb[data-photo-orientation="portrait"] img{
  object-fit:contain;background:var(--ao-surface-2,#0d141c);
}
.aoExplorePlaceSheet .aoExplorePlaceMedia[data-photo-orientation="portrait"] img{
  height:min(46dvh,420px);max-height:420px;object-fit:contain;
  background:var(--ao-surface-2,#0d141c);
}

/* Search must reveal the actual church/shrine name before its category.
   Names remain full in data and are limited to two visible lines on phones.
   The short location line stays legible without adding map chrome. */
.aoHeritageSurface .aoHeritageSearchResults button>span:first-child{min-width:0;flex:1}
.aoHeritageSurface .aoHeritageSearchResults strong{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
  white-space:normal;overflow:hidden;text-overflow:ellipsis;
  line-height:1.35;overflow-wrap:anywhere
}
.aoHeritageSurface .aoHeritageSearchResults small{
  font-size:12px;line-height:1.4;overflow-wrap:anywhere
}
.aoHeritageSurface .aoHeritageSearchResults button{
  min-height:58px;height:auto;align-items:center
}
@media(max-width:430px){
  .aoHeritageSurface .aoHeritageSearchResults{max-height:42dvh}
  .aoHeritageSurface .aoHeritageSearchResults button{padding:11px 10px}
}

/* MapLibre's remote style can lag independently of the local directory.
   Keep a legible non-blocking status, without pretending to render a basemap. */
.aoFindMap{position:relative}
.aoFindMap>.aoExploreMapLoading{
  position:absolute;z-index:3;inset:auto 12px 14px;display:block;
  width:auto;max-width:480px;margin:0 auto;box-sizing:border-box;
  padding:9px 12px;border-radius:10px;pointer-events:none;
  background:rgba(8,12,18,.91);border:1px solid rgba(201,173,120,.3);
  color:var(--ao-text-primary,#e9e4d9);
  font:500 13px/1.45 var(--ao-font-ui,system-ui,sans-serif);
  box-shadow:0 8px 24px rgba(0,0,0,.32);
}
.aoFindMap>.aoExploreMapLoading.aoExploreMapStalled{
  inset:auto 12px 18px;border-color:rgba(201,173,120,.48);
  color:var(--ao-text-primary,#e9e4d9);
}
@media(max-width:430px){
  .aoFindMap>.aoExploreMapLoading{left:9px;right:9px;bottom:10px}
}

/* Phone-only map edge and copyright layout. Keep the map canvas,
   provider attribution, world control and search in their canonical owners. */
@media(max-width:430px){
  .aoHeritageSurface .aoFindMap .maplibregl-ctrl-bottom-left{
    left:8px;bottom:5px;max-width:calc(100% - 104px);
  }
  .aoHeritageSurface .aoFindMap .maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib{
    max-width:100%;
  }
  .aoHeritageSurface .aoHeritageMapHint{
    left:12px;bottom:68px;max-width:min(220px,calc(100% - 124px));
  }
  .aoHeritageSurface .aoHeritageNearby{
    right:12px;bottom:62px;min-height:44px;
  }
}

/* R60: a reading sequence of independently sourced canonical witnesses,
   not an unsourced manufactured pilgrimage narrative. */
.aoExplorePlaceSheet .aoExploreSourcedStory{
  display:grid;gap:14px;padding-bottom:17px;
}
.aoExplorePlaceSheet .aoExploreSourcedStory>small{
  margin-bottom:0;
}
.aoExplorePlaceSheet .aoExploreStoryChapter{
  position:relative;margin:0;padding:14px 0 15px;
  border-top:1px solid var(--ao-rule,rgba(255,255,255,.11));
}
.aoExplorePlaceSheet .aoExploreStoryChapter:first-of-type{border-top:0;padding-top:5px}
.aoExplorePlaceSheet .aoExploreStoryChapter h3{
  margin:0 0 9px;font:600 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.075em;text-transform:uppercase;color:var(--ao-liturgical-accent,#c9ad78);
}
.aoExplorePlaceSheet .aoExploreStoryChapter p{
  margin:0;color:var(--ao-text-primary,#e9e4d9);
  font:400 clamp(16px,2.15vw,19px)/1.64 var(--ao-font-body,Georgia,serif);
  text-wrap:pretty;
}
.aoExplorePlaceSheet .aoExploreStoryEvidence{
  display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;margin-top:11px;
}
.aoExplorePlaceSheet .aoExploreStoryEvidence a{
  display:inline-flex;align-items:center;min-height:44px;max-width:100%;
  font:500 11px/1.32 var(--ao-font-ui,system-ui,sans-serif);
  color:var(--ao-text-muted,#9ba5b1);text-decoration:underline;
  text-underline-offset:3px;overflow-wrap:anywhere;
}
.aoExplorePlaceSheet .aoExploreStoryEvidence a:hover,
.aoExplorePlaceSheet .aoExploreStoryEvidence a:focus-visible{
  color:var(--ao-liturgical-accent,#c9ad78);
}
.aoExplorePlaceSheet .aoExploreNovenaEvidence{margin:4px 0 0}
.aoExplorePlaceSheet .aoExploreNovenaEvidence a{
  display:inline-flex;align-items:center;min-height:44px;
  font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  color:var(--ao-liturgical-accent,#c9ad78);text-decoration:underline;
}
@media(max-width:520px){
 .aoExplorePlaceSheet .aoExploreStoryChapter p{font-size:17px;line-height:1.55}
 .aoExplorePlaceSheet .aoExploreStoryChapter{padding:12px 0}
}

/* Source-owned Ireland guide: no new unlicensed photographs or independent app route. */
.aoExplorePlaceSheet .aoExploreIllustratedGuide{padding:22px 0 10px;border-top:1px solid rgba(209,177,122,.28);display:grid;gap:24px;min-width:0}
.aoExplorePlaceSheet .aoExploreGuideIntro{padding:22px 18px;background:linear-gradient(140deg,rgba(201,174,117,.13),rgba(25,33,43,.38));border:1px solid rgba(201,174,117,.19);border-radius:14px}
.aoExplorePlaceSheet .aoExploreGuideIntro small{font:600 10px/1.5 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.16em;color:var(--ao-liturgical-accent,#c9ad78)}
.aoExplorePlaceSheet .aoExploreGuideIntro h3{font:500 clamp(20px,3.5vw,28px)/1.28 var(--ao-font-display,Georgia,serif);margin:8px 0;color:var(--ao-text-primary,#f1eadf)}
.aoExplorePlaceSheet .aoExploreGuideIntro p{font:400 13px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#abb3bd);margin:0}
.aoExplorePlaceSheet .aoExploreGuideSection{display:grid;gap:14px;min-width:0}
.aoExplorePlaceSheet .aoExploreGuideSection h4{font:500 clamp(18px,3vw,23px)/1.3 var(--ao-font-display,Georgia,serif);margin:0;padding:0 0 9px;border-bottom:1px solid rgba(201,174,117,.25);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGuideParagraph p,.aoExplorePlaceSheet .aoExploreGuideVisit>p{margin:0;font:400 clamp(16px,2.1vw,18px)/1.65 var(--ao-font-body,Georgia,serif);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGuideParagraph+.aoExploreGuideParagraph{margin-top:10px}
.aoExplorePlaceSheet .aoExploreGuideStops{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:10px}
.aoExplorePlaceSheet .aoExploreGuideStops article{border:1px solid rgba(201,174,117,.21);border-radius:11px;padding:13px 14px;background:rgba(18,24,32,.7)}
.aoExplorePlaceSheet .aoExploreGuideStops h5{font:600 15px/1.4 var(--ao-font-body,Georgia,serif);margin:0 0 6px;color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGuideStops p,.aoExplorePlaceSheet .aoExploreGuideDate p{font:400 14px/1.55 var(--ao-font-ui,system-ui,sans-serif);margin:0;color:var(--ao-text-secondary,#bec5cc)}
.aoExplorePlaceSheet .aoExploreGuideTimeline{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.aoExplorePlaceSheet .aoExploreGuideTimeline li{display:grid;grid-template-columns:minmax(95px,30%) 1fr;gap:13px;padding:12px 0;border-bottom:1px solid rgba(201,174,117,.12)}
.aoExplorePlaceSheet .aoExploreGuideTimeline time{font:600 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-liturgical-accent,#c9ad78)}
.aoExplorePlaceSheet .aoExploreGuideTimeline strong{font:500 15px/1.45 var(--ao-font-body,Georgia,serif);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGuideDate{display:grid;gap:7px;padding:12px 14px;border:1px solid rgba(201,174,117,.18);border-radius:10px}
.aoExplorePlaceSheet .aoExploreGuideDate strong{font:600 15px/1.4 var(--ao-font-body,Georgia,serif);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGuideDate time{font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-liturgical-accent,#c9ad78)}
.aoExplorePlaceSheet .aoExploreGuideDate small{font:400 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#9ca6b3)}
.aoExplorePlaceSheet .aoExploreIllustratedGuide .aoExploreStoryEvidence{margin-top:5px}
.aoExplorePlaceSheet .aoExploreGuideIntro .aoExploreStoryEvidence{margin-top:12px}
/* Narrow sanctuary folios: grid tracks and headings must shrink without
   forcing a sideways-scrolling sheet on phones. Keep evidence URLs legible. */
.aoExplorePlaceSheet>header{grid-template-columns:minmax(0,1fr) var(--ao-control-h,44px)}
.aoExplorePlaceSheet>header>div{min-width:0;max-width:100%}
.aoExplorePlaceSheet>header h2,
.aoExplorePlaceSheet>header p{overflow-wrap:anywhere}
.aoExplorePlaceSheet .aoExploreIllustratedGuide{grid-template-columns:minmax(0,1fr)}
.aoExplorePlaceSheet .aoExploreIllustratedGuide>*{min-width:0;max-width:100%;box-sizing:border-box}
.aoExplorePlaceSheet .aoExploreGuideIntro h3,
.aoExplorePlaceSheet .aoExploreGuideSection h4,
.aoExplorePlaceSheet .aoExploreGuideStops h5,
.aoExplorePlaceSheet .aoExploreGuideTimeline strong,
.aoExplorePlaceSheet .aoExploreGuideDate strong{overflow-wrap:anywhere}
.aoExplorePlaceSheet .aoExploreGuideTimeline li{grid-template-columns:minmax(0,30%) minmax(0,1fr)}
@media(max-width:520px){
 .aoExplorePlaceSheet .aoExploreIllustratedGuide{gap:18px}
 .aoExplorePlaceSheet .aoExploreGuideIntro{padding:18px 13px}
 .aoExplorePlaceSheet .aoExploreGuideTimeline li{grid-template-columns:minmax(0,92px) minmax(0,1fr);gap:9px}
}

/* Reviewed in-repository imagery: entire original frame, dark sacred palette, source credits. */
.aoExplorePlaceSheet .aoExploreGuideGallery{min-width:0;display:grid;gap:14px}
.aoExplorePlaceSheet .aoExploreGuideGallery h4{font:500 clamp(18px,3vw,23px)/1.3 var(--ao-font-display,Georgia,serif);margin:0;padding-bottom:9px;border-bottom:1px solid rgba(201,174,117,.25);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGalleryGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:13px;min-width:0}
.aoExplorePlaceSheet .aoExploreGalleryImage{margin:0;min-width:0;display:flex;flex-direction:column;border:1px solid rgba(201,174,117,.21);border-radius:12px;overflow:hidden;background:#111923}
.aoExplorePlaceSheet .aoExploreGalleryImage img{width:100%;height:clamp(190px,32vw,350px);display:block;object-fit:contain;background:#080c12}
.aoExplorePlaceSheet .aoExploreGalleryImage figcaption{padding:12px 13px 14px;display:grid;gap:6px;font:400 12px/1.48 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#aab4be)}
.aoExplorePlaceSheet .aoExploreGalleryImage figcaption strong{font:550 15px/1.42 var(--ao-font-body,Georgia,serif);color:var(--ao-text-primary,#e9e4d9)}
.aoExplorePlaceSheet .aoExploreGalleryCredits{display:flex;gap:10px;flex-wrap:wrap}
.aoExplorePlaceSheet .aoExploreGalleryCredits a{color:var(--ao-liturgical-accent,#c9ad78);text-decoration:underline;min-height:32px;display:inline-flex;align-items:center;outline-offset:3px}
.aoExplorePlaceSheet .aoExploreGalleryImage small{font-size:11px;line-height:1.4;color:var(--ao-text-muted,#aab4be)}
@media(max-width:520px){.aoExplorePlaceSheet .aoExploreGalleryGrid{grid-template-columns:1fr}.aoExplorePlaceSheet .aoExploreGalleryImage img{height:300px}}

/* P66: a source-owned editorial sanctuary folio with uncropped media. */
.aoExplorePlaceSheet .aoExplorePlaceMedia{margin:15px 0 21px;border-radius:14px;background:radial-gradient(ellipse at 50% 50%,#202c34,#080e17 74%)}
.aoExplorePlaceSheet .aoExplorePlaceMedia img{max-height:min(64vh,520px);object-fit:contain;background:transparent}
.aoExplorePlaceSheet .aoExploreEditorialOpening{margin:18px 0 24px;padding:24px clamp(17px,4vw,32px);border:1px solid rgba(202,168,112,.24);border-left:3px solid var(--ao-liturgical-accent,#c9ad78);background:linear-gradient(125deg,rgba(201,173,120,.095),rgba(23,34,46,.25) 68%);border-radius:5px 13px 13px 5px}
.aoExplorePlaceSheet .aoExploreEditorialOpening>small,.aoExplorePlaceSheet .aoExploreTreasures header>small,.aoExplorePlaceSheet .aoExplorePlaceCustoms>small{display:block;font:700 10px/1.5 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.18em;color:var(--ao-liturgical-accent,#c9ad78)}
.aoExplorePlaceSheet .aoExploreEditorialOpening h3{font:500 clamp(23px,4vw,36px)/1.2 var(--ao-font-display,Georgia,serif);color:var(--ao-text-primary,#f1e9dc);margin:11px 0 15px;overflow-wrap:anywhere}
.aoExplorePlaceSheet .aoExploreEditorialOpening>p{max-width:67ch;color:var(--ao-text-primary,#e9e4d9);font:400 clamp(15px,2.3vw,17px)/1.73 var(--ao-font-body,Georgia,serif);margin:0 0 13px;text-wrap:pretty}
.aoExplorePlaceSheet .aoExploreEditorialOpening>a,.aoExplorePlaceSheet .aoExploreTreasureActions>a{color:var(--ao-liturgical-accent,#c9ad78);font:500 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);min-height:38px;display:inline-flex;align-items:center}
.aoExplorePlaceSheet .aoExploreTreasures{margin:27px 0}
.aoExplorePlaceSheet .aoExploreTreasures>header{padding:0 0 19px}
.aoExplorePlaceSheet .aoExploreTreasures>header h3,.aoExplorePlaceSheet .aoExplorePlaceCustoms>h3{font:500 clamp(24px,4vw,35px)/1.16 var(--ao-font-display,Georgia,serif);color:var(--ao-text-primary,#f4ede1);margin:10px 0;letter-spacing:-.02em}
.aoExplorePlaceSheet .aoExploreTreasures>header p{margin:0;max-width:74ch;font:400 13px/1.66 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-text-muted,#aab4be)}
.aoExplorePlaceSheet .aoExploreTreasureGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.aoExplorePlaceSheet .aoExploreTreasureCard{min-width:0;display:flex;flex-direction:column;gap:11px;padding:22px 19px;border-radius:13px;border:1px solid var(--ao-rule,rgba(255,255,255,.12));background:radial-gradient(ellipse at 90% 0%,rgba(196,160,104,.1),transparent 55%),var(--ao-surface-1,#101923)}
.aoExplorePlaceSheet .aoExploreTreasureKind{font:650 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.075em;text-transform:uppercase;color:var(--ao-liturgical-accent,#c9ad78)}
.aoExplorePlaceSheet .aoExploreTreasureCard h4{font:500 clamp(19px,2.7vw,24px)/1.25 var(--ao-font-display,Georgia,serif);color:var(--ao-text-primary,#efe9dc);margin:0;overflow-wrap:anywhere}
.aoExplorePlaceSheet .aoExploreTreasureCard>p{margin:0;color:var(--ao-text-muted,#bdc5cb);font:400 13px/1.65 var(--ao-font-body,Georgia,serif)}
.aoExplorePlaceSheet .aoExploreTreasureCard>.aoExploreTreasureNotice{border-left:2px solid rgba(201,173,120,.45);padding-left:10px;font:400 12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoExplorePlaceSheet .aoExploreTreasureActions{margin-top:auto;padding-top:12px;border-top:1px solid var(--ao-rule,rgba(255,255,255,.1));display:flex;align-items:center;justify-content:space-between;gap:11px;flex-wrap:wrap}
.aoExplorePlaceSheet .aoExploreTreasureActions>button,.aoExplorePlaceSheet .aoExplorePlaceCustoms>button{border:1px solid var(--ao-liturgical-border,rgba(201,173,120,.42));background:transparent;border-radius:999px;color:var(--ao-liturgical-accent,#c9ad78);padding:9px 12px;font:600 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);min-height:42px;cursor:pointer}
.aoExplorePlaceSheet .aoExplorePlaceCustoms{margin:27px 0;padding:23px;border:1px solid var(--ao-rule,rgba(255,255,255,.14));background:var(--ao-surface-1,#101923);border-radius:13px}
.aoExplorePlaceSheet .aoExplorePlaceCustoms p{margin:0 0 15px;display:grid;gap:4px;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.1));padding-bottom:13px}
.aoExplorePlaceSheet .aoExplorePlaceCustoms p strong{font:500 18px/1.3 var(--ao-font-display,Georgia,serif);color:var(--ao-text-primary,#efe9dc)}
.aoExplorePlaceSheet .aoExplorePlaceCustoms p span{color:var(--ao-text-muted,#aab4be);font:400 12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
@media(max-width:640px){.aoExplorePlaceSheet .aoExploreTreasureGrid{grid-template-columns:1fr}.aoExplorePlaceSheet .aoExplorePlaceMedia img{max-height:min(50vh,420px)}.aoExplorePlaceSheet .aoExploreEditorialOpening{padding:20px 17px}.aoExplorePlaceSheet .aoExploreTreasureCard{padding:18px 16px}}


/* P67 source-described indoor placement; no simulated room map. */
.aoExplorePlaceSheet .aoExploreIndoorPosition{
 display:grid;gap:5px;padding:13px 14px 12px;border-radius:10px;
 background:rgba(168,191,201,.06);border:1px solid rgba(168,191,201,.18);
}
.aoExplorePlaceSheet .aoExploreIndoorPosition>small{
 font:700 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.12em;color:var(--ao-liturgical-accent,#c9ad78)
}
.aoExplorePlaceSheet .aoExploreIndoorPosition>strong{
 color:var(--ao-text-primary,#eee9df);
 font:500 17px/1.35 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet .aoExploreIndoorPosition>span{
 color:var(--ao-text-muted,#aab4be);
 font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif)
}
.aoExplorePlaceSheet .aoExploreIndoorPosition>a,
.aoExplorePlaceSheet .aoExploreIndoorClosure>a{
 color:var(--ao-liturgical-accent,#c9ad78);font:500 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExplorePlaceSheet .aoExploreIndoorClosure{
 margin:9px 0 0!important;padding:10px 12px;
 border-left:2px solid var(--ao-liturgical-accent,#c9ad78);
 background:rgba(182,140,78,.10);font:400 12px/1.6 var(--ao-font-ui,system-ui,sans-serif)!important;
 color:var(--ao-text-primary,#eee9df)!important
}


/* P68: a dated, attributed photograph of the exact reliquary/shrine.
   The image uses contain; never crop or visually invent a relic. */
.aoExplorePlaceSheet .aoExploreTreasurePhoto{
 margin:1px 0 4px;padding:0;overflow:hidden;
 border-radius:11px;border:1px solid rgba(190,174,143,.19);
 background:radial-gradient(ellipse at center,rgba(201,173,120,.07),rgba(4,9,15,.55) 80%);
}
.aoExplorePlaceSheet .aoExploreTreasurePhoto>img{
 width:100%;height:clamp(180px,25vw,320px);display:block;
 object-fit:contain;object-position:center center;background:transparent;
}
.aoExplorePlaceSheet .aoExploreTreasurePhoto figcaption{
 padding:11px 14px 13px;display:grid;gap:6px;
 color:var(--ao-text-muted,#aab4be);
 font:400 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExplorePlaceSheet .aoExploreTreasurePhoto figcaption small{
 font:400 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-text-muted,#aab4be);
}
.aoExplorePlaceSheet .aoExploreTreasurePhoto figcaption>span:last-child{
 display:flex;gap:14px;flex-wrap:wrap;
}
.aoExplorePlaceSheet .aoExploreTreasurePhoto figcaption a{
 color:var(--ao-liturgical-accent,#c9ad78);
 display:inline-flex;align-items:center;min-height:30px;
}
@media(max-width:640px){
 .aoExplorePlaceSheet .aoExploreTreasurePhoto>img{height:260px}
}

`;