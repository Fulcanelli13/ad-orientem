// H7 Sanctuary: verbatim Claude prototype CSS, scoped to the source-owned Home and Mass door.
// Art, data and reader navigation remain owned by Ad Orientem.
export const H7_SANCTUARY_CSS = `.aoH7Screens{--bg:#0A0D11;--sf:#12171D;--sf2:#182029;--ln:#232C36;--ink:#EFE8DC;--ink2:#CBC2B4;--mu:#949CA5;--gold:#D9BB7E;--rub:#D58275;--sage:#86B596;--onsage:#0B1410;--sageBg:#1C2A23;
 --serif:"EB Garamond","Iowan Old Style",Garamond,Georgia,serif;--caps:"Cinzel","Trajan Pro",Georgia,serif;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
 --g:18px;background:var(--bg);color:var(--ink);font-family:var(--serif);color-scheme:dark}
body.light .aoH7Screens{--bg:#F7F2E9;--sf:#FFFFFF;--sf2:#F0E8DA;--ln:#E3D9C8;--ink:#221E1A;--ink2:#433C35;--mu:#6E6A64;--gold:#8E6A2B;--rub:#9B2C24;--sage:#3E7A57;--onsage:#fff;--sageBg:#E3EFE6;color-scheme:light}
@media(max-width:359px){.aoH7Screens{--g:14px}}
.lc-green{--lc:#62A473}.lc-white{--lc:#E9E0C9}.lc-red{--lc:#D0574A}.lc-black{--lc:#8C8C8C}.lc-violet{--lc:#9A7BC4}.lc-none{--lc:#3A4652}
body.light .lc-green{--lc:#3E7A4E}body.light .lc-white{--lc:#C8B98F}body.light .lc-red{--lc:#A3352B}body.light .lc-black{--lc:#2a2a2a}

@scope (.aoH7Screens){

/* =====================================================================
   SANCTUARY SYSTEM — tokens (dark default; body.light = light)
   ===================================================================== */
.app{--bg:#0A0D11;--sf:#12171D;--sf2:#182029;--ln:#232C36;--ink:#EFE8DC;--ink2:#CBC2B4;--mu:#949CA5;--gold:#D9BB7E;--rub:#D58275;--sage:#86B596;--onsage:#0B1410;--sageBg:#1C2A23;
 --serif:"EB Garamond","Iowan Old Style",Garamond,Georgia,serif;--caps:"Cinzel","Trajan Pro",Georgia,serif;--sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
 --g:18px;background:var(--bg);color:var(--ink);font-family:var(--serif);color-scheme:dark}
body.light .app{--bg:#F7F2E9;--sf:#FFFFFF;--sf2:#F0E8DA;--ln:#E3D9C8;--ink:#221E1A;--ink2:#433C35;--mu:#6E6A64;--gold:#8E6A2B;--rub:#9B2C24;--sage:#3E7A57;--onsage:#fff;--sageBg:#E3EFE6;color-scheme:light}
body.w320 .app{--g:14px}
.lc-green{--lc:#62A473}.lc-white{--lc:#E9E0C9}.lc-red{--lc:#D0574A}.lc-black{--lc:#8C8C8C}.lc-violet{--lc:#9A7BC4}.lc-none{--lc:#3A4652}
body.light .lc-green{--lc:#3E7A4E}body.light .lc-white{--lc:#C8B98F}body.light .lc-red{--lc:#A3352B}body.light .lc-black{--lc:#2a2a2a}
/* type roles */
.rb{font:600 10.5px/1.4 var(--serif);letter-spacing:.2em;text-transform:uppercase;color:var(--rub)}
.eb{font:700 10px/1 var(--sans);letter-spacing:.16em;text-transform:uppercase;color:var(--mu)}
.inc{font:italic 17px/1.3 var(--serif);color:var(--gold)}
.mk{display:inline-flex;align-items:center;gap:6px;font:600 10.5px/1 var(--serif);letter-spacing:.18em;text-transform:uppercase;color:var(--ink2)}
.mk::before{content:"";width:5px;height:5px;transform:rotate(45deg);background:currentColor}
.mk.k{color:var(--rub)}.mk.c::before{width:8px;height:8px;border-radius:4px;transform:none;background:var(--lc)}
/* frame */
.sx{position:relative;height:100%;overflow:hidden;background:var(--bg)}
.scr{position:absolute;inset:0;display:flex;flex-direction:column;background:var(--bg)}
.scr.push{animation:pin .32s cubic-bezier(.2,.7,.2,1)}
@keyframes pin{from{transform:translateX(100%)}to{transform:none}}
@media (prefers-reduced-motion:reduce){.scr.push{animation:none}}
.body{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;position:relative}
.ib{width:44px;height:44px;border-radius:22px;border:0;background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;flex:0 0 auto}
.bar{flex:0 0 52px;display:flex;align-items:center;gap:2px;padding:0 6px;border-bottom:1px solid var(--ln);background:var(--bg)}
.bar .tt{flex:1;min-width:0}.bar .tt .rb{display:block;font-size:9.5px}.bar .tt b{display:block;font:500 18px/1.15 var(--serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
.nav{flex:0 0 62px;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--ln);background:var(--bg)}
.nav a{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font:500 11px/1 var(--serif);color:var(--mu);text-decoration:none}.nav a.on{color:var(--sage)}
.art{background-color:#17110c;background-size:cover;background-position:var(--fp,50% 30%);position:relative}
.glow{background:radial-gradient(90% 70% at 50% 35%,color-mix(in srgb,var(--lc) 28%,#0A0D11),#0A0D11 75%)}
body.light .glow{background:radial-gradient(90% 70% at 50% 35%,color-mix(in srgb,var(--lc) 30%,#1b1712),#141110 80%)}
/* shared components */
.btn{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 10px 8px 18px;border:0;border-radius:16px;background:var(--sage);color:var(--onsage);cursor:pointer;text-align:left}
.btn>span:first-child{flex:1;min-width:0}.btn b{display:block;font:600 18px/1.15 var(--serif)}.btn small{display:block;font:italic 14px/1.3 var(--serif);opacity:.82;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.btn .ar{width:38px;height:38px;border-radius:19px;background:rgba(0,0,0,.14);display:grid;place-items:center;flex:0 0 auto}
.btn.glass{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.38);color:#F4EEE4;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.btn.glass .ar{background:rgba(255,255,255,.18)}
.btn2{min-height:44px;padding:0 16px;border-radius:14px;border:1px solid var(--ln);background:transparent;color:var(--ink);font:500 15px/1 var(--serif);cursor:pointer}
.sec{padding:0 var(--g)}.sec>h3{margin:28px 0 10px;font:500 21px/1.1 var(--serif);display:flex;justify-content:space-between;align-items:baseline}
.sec>h3 button{border:0;background:transparent;color:var(--sage);font:500 14.5px/1 var(--serif);cursor:pointer;min-height:44px;margin:-14px 0}
.card{border-radius:18px;border:1px solid var(--ln);background:var(--sf);overflow:hidden}
.row{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:8px 14px;border:0;border-top:1px solid var(--ln);background:transparent;color:var(--ink);text-align:left;cursor:pointer;font:16px/1.25 var(--serif)}
.row:first-child{border-top:0}.row .tx{flex:1;min-width:0}.row .tx b{display:block;font-weight:500}.row .tx small{display:block;font:13px/1.3 var(--sans);color:var(--mu);margin-top:2px}
.row .ch{color:var(--mu)}
.db{width:42px;flex:0 0 auto;text-align:center;position:relative;padding-bottom:7px}.db small{display:block;font:700 9px/1 var(--sans);letter-spacing:.12em;color:var(--mu);text-transform:uppercase}.db b{display:block;font:500 20px/1.1 var(--serif);margin-top:3px}
.db::after{content:"";position:absolute;left:12px;right:12px;bottom:0;height:3px;border-radius:2px;background:var(--lc)}
/* week strip (same on home, calendar, day) */
.wk{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:0 var(--g)}
.wk button{height:58px;border-radius:14px;border:1px solid transparent;background:transparent;color:var(--ink2);cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;padding:0}
.wk .w{font:600 10px/1 var(--sans);letter-spacing:.1em;color:var(--mu)}.wk .su .w{color:var(--rub)}
.wk .n{font:500 18px/1 var(--serif)}.wk .r1 .n{color:var(--gold);font-weight:600}.wk i{width:16px;height:3px;border-radius:2px;background:var(--lc)}
.wk .td .n{text-decoration:underline;text-decoration-color:var(--gold);text-underline-offset:4px;text-decoration-thickness:2px}
.wk button[aria-current=date]{background:var(--sf);border-color:color-mix(in srgb,var(--sage) 50%,transparent)}
/* ordo strip (same on day + door) */
.ordo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid color-mix(in srgb,var(--rub) 35%,transparent);border-bottom:1px solid color-mix(in srgb,var(--rub) 35%,transparent);text-align:center}
.ordo div{padding:12px 4px}.ordo div+div{border-left:1px solid color-mix(in srgb,var(--rub) 35%,transparent)}
.ordo small{display:block;font:600 9.5px/1 var(--serif);letter-spacing:.18em;text-transform:uppercase;color:var(--rub)}
.ordo b{display:block;margin-top:6px;font:500 15.5px/1.2 var(--serif)}.ordo b.no{color:var(--mu);font-style:italic;font-weight:400}
/* HOME */
.hero{position:relative;height:570px;color:#F4EEE4;flex:0 0 auto}
body.w320 .hero{height:470px}
body.light .hero{margin-bottom:28px}body.light .hero::after{content:"";position:absolute;left:0;right:0;bottom:-28px;height:28px;background:linear-gradient(#141110,var(--bg))}
.hero .art,.hero .glow{position:absolute;inset:0}
.hero .sh{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,6,8,.6) 0%,rgba(5,6,8,0) 20%,rgba(5,6,8,0) 40%,rgba(5,6,8,.8) 72%,var(--bg) 100%)}
body.light .hero .sh{background:linear-gradient(180deg,rgba(5,6,8,.6) 0%,rgba(5,6,8,0) 20%,rgba(5,6,8,0) 38%,rgba(5,6,8,.85) 80%,#141110 100%)}
.hero .top{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;padding:4px 4px 0 var(--g);z-index:2}
.hero .top .wm{flex:1;font:500 13.5px/1 var(--caps);letter-spacing:.26em}
.hero .cred{position:absolute;right:var(--g);top:50px;z-index:2;font:italic 11.5px/1.2 var(--serif);color:rgba(244,238,228,.72);border:0;background:transparent;cursor:pointer}
.hero .tx{position:absolute;left:var(--g);right:var(--g);bottom:14px;z-index:2}
.hero .date{display:inline-flex;align-items:center;gap:8px;border:0;background:transparent;color:#F4EEE4;padding:0;cursor:pointer;min-height:36px}
.hero .date .eb{color:#9FD39A}.hero .date b{font:italic 17px/1 var(--serif)}
.hero .rb{color:#E8A79B;display:block;margin-top:2px}
.hero h1{margin:6px 0 6px;font:500 50px/1 var(--serif);letter-spacing:-.01em;text-wrap:balance}
body.w320 .hero h1{font-size:40px}
.hero .ml{margin:0;font:17px/1.35 var(--serif);color:#E9E1D3}.hero .ml i{color:#E7CC93}
.hero .mks{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px}.hero .mk{color:#E9E1D3}.hero .mk.k{color:#E8A79B}
.hero .btn{margin-top:14px}
.home .wk{margin-top:6px}
.np{display:flex;align-items:center;gap:14px;padding:14px;border-radius:18px;border:1px solid var(--ln);background:var(--sf);cursor:pointer;width:100%;text-align:left;color:var(--ink)}
.np .ci{width:44px;height:44px;border-radius:22px;background:var(--sageBg);color:var(--sage);display:grid;place-items:center;flex:0 0 auto}
.np .tx{flex:1}.np .eb{color:var(--sage)}.np b{display:block;font:500 18px/1.2 var(--serif);margin-top:5px}.np small{font:13px/1.3 var(--sans);color:var(--mu)}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-top:10px}
.chips button{flex:0 0 auto;min-height:42px;padding:0 14px;border-radius:21px;border:1px solid var(--ln);background:transparent;color:var(--ink);font:500 14.5px/1 var(--serif);cursor:pointer}
.chips .mine{border-style:dashed}.chips .mine small{margin-left:6px;font:700 8.5px/1 var(--sans);letter-spacing:.12em;color:var(--mu)}
.wkc{display:flex;gap:10px;overflow-x:auto;scrollbar-width:none}
.wkc button{flex:0 0 150px;min-height:104px;border-radius:16px;border:1px solid var(--ln);background:var(--sf);color:var(--ink);text-align:left;padding:12px;cursor:pointer;position:relative;overflow:hidden;display:flex;flex-direction:column}
.wkc button::before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--lc)}
.wkc b{display:block;font:500 17px/1.2 var(--serif);margin:8px 0 auto}.wkc small{font:12.5px/1.3 var(--sans);color:var(--mu);margin-top:6px}
.endsp{height:26px}
/* DAY page */
.band{position:relative;height:190px;flex:0 0 auto}
.band .art,.band .glow{position:absolute;inset:0}
.band::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,6,8,.35),rgba(5,6,8,0) 40%,var(--bg))}
.band .back{position:absolute;left:8px;top:6px;z-index:2;color:#fff;background:rgba(0,0,0,.35)}
.band .cap{position:absolute;right:var(--g);top:16px;z-index:2;font:italic 11.5px/1 var(--serif);color:rgba(244,238,228,.8)}
.dhead{padding:0 var(--g);text-align:center}
.dhead .cr{display:block;color:var(--rub);font-size:16px;margin:4px 0 0}
.dhead h2{margin:6px 0 4px;font:500 30px/1.1 var(--serif);text-wrap:balance}
.dhead .ver{margin:0;font:italic 15.5px/1.35 var(--serif);color:var(--ink2)}
.dhead .mks{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 14px;margin:12px 0 0}
.dr{width:62%;height:5px;margin:16px auto;border-top:1px solid var(--rub);border-bottom:1px solid var(--rub);opacity:.75}
.why{margin:0 auto;max-width:330px;font:italic 14.5px/1.45 var(--serif);color:var(--ink2);text-align:center}
.dsec{padding:0 var(--g)}.dsec .ordo{margin-top:16px}
.dsec .rb{display:block;margin:22px 0 6px}
.dact{padding:16px var(--g) 0}
/* DOOR */
.door .intr p{margin:6px 0 0;font:17.5px/1.5 var(--serif)}
.drop{float:left;font:500 52px/.8 var(--serif);color:var(--rub);margin:5px 7px 0 0}
.door .intr .en{clear:both;font:italic 14px/1.45 var(--serif);color:var(--ink2);margin-top:8px}
.lrow{display:flex;align-items:center;gap:10px;width:100%;min-height:50px;padding:0 2px;border:0;border-top:1px solid color-mix(in srgb,var(--ink) 12%,transparent);background:transparent;color:var(--ink);font:16px/1.25 var(--serif);text-align:left;cursor:pointer}
.lrow span{flex:1}.lrow small{font:13px/1.2 var(--sans);color:var(--mu)}.lrow .ch{color:var(--mu)}
.foot{flex:0 0 auto;padding:10px var(--g) 10px;background:linear-gradient(180deg,transparent,var(--bg) 26%);border-top:1px solid var(--ln)}
.foot .mini{display:flex;justify-content:center;gap:2px;margin-top:4px}
.foot .mini button{min-height:40px;padding:0 12px;border:0;background:transparent;color:var(--ink2);font:500 14px/1 var(--serif);cursor:pointer}.foot .mini button:last-child{color:var(--sage)}
/* CALENDAR */
.tabs7{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;margin:12px var(--g) 0;height:40px;border-radius:20px;border:1px solid var(--ln);background:var(--sf);padding:3px}
.tabs7 button{border:0;border-radius:17px;background:transparent;color:var(--mu);font:500 14px/1 var(--serif);cursor:pointer;position:relative}
.tabs7 button::after{content:"";position:absolute;inset:-4px 0}
.tabs7 button[aria-pressed=true]{background:var(--sf2);color:var(--ink);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--sage) 45%,transparent)}
.clk{position:relative;width:300px;height:300px;margin:14px auto 0}body.w320 .clk{width:260px;height:260px}
.clk.sm{width:230px;height:230px}body.w320 .clk.sm{width:210px;height:210px}
.clk svg{width:100%;height:100%;display:block;overflow:visible}
.clk .seg2{cursor:pointer;transition:opacity .2s}.clk .seg2.dim{opacity:.35}
.clk .ctr{position:absolute;inset:26%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
.clk .ctr .rb{font-size:9px}.clk .ctr b{font:500 26px/1.05 var(--serif);margin:5px 0 4px}.clk .ctr small{font:italic 12.5px/1.3 var(--serif);color:var(--ink2)}
.clk.sm .ctr b{font-size:21px}
.leg{display:flex;justify-content:center;flex-wrap:wrap;gap:6px 14px;margin:8px var(--g) 0;font:12px/1.3 var(--sans);color:var(--mu)}
.leg span{display:inline-flex;align-items:center;gap:6px}.leg i{width:14px;height:5px;border-radius:3px;display:inline-block}
.yr{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:10px}.yr b{font:500 18px/1 var(--serif)}
.mh{display:flex;align-items:center;gap:2px;padding:12px calc(var(--g) - 10px) 6px}.mh b{flex:1;text-align:center;font:500 22px/1 var(--serif)}
.wdh{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:0 var(--g) 6px;text-align:center}.wdh span{font:600 10px/1 var(--sans);letter-spacing:.1em;color:var(--mu)}.wdh span:first-child{color:var(--rub)}
.grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:0 var(--g)}
.grid button{position:relative;height:56px;border-radius:10px;border:1px solid var(--ln);background:var(--sf);color:var(--ink);cursor:pointer;padding:6px 0 0 6px;text-align:left;font:500 15px/1 var(--serif)}
body.w320 .grid button{height:48px}
.grid button::after{content:"";position:absolute;left:5px;right:5px;bottom:5px;height:4px;border-radius:2px;background:var(--lc)}
.grid .o{opacity:.35}.grid .su{color:var(--rub)}.grid .r1{color:var(--gold);font-weight:700;border-color:color-mix(in srgb,var(--gold) 50%,var(--ln))}.grid .r2{font-weight:700}
.grid .cm::before{content:"";position:absolute;right:6px;top:7px;width:5px;height:5px;border-radius:3px;background:var(--sage)}
.grid .fa i{position:absolute;right:6px;bottom:13px;width:6px;height:6px;transform:rotate(45deg);background:var(--rub)}
.grid .td{box-shadow:inset 0 0 0 2px var(--sage)}.grid button[aria-current=date]{background:var(--sf2);box-shadow:inset 0 0 0 2px var(--ink2)}.grid .td[aria-current=date]{box-shadow:inset 0 0 0 2px var(--sage)}
.leg2{display:flex;flex-wrap:wrap;gap:6px 14px;padding:10px var(--g) 0;font:12px/1.3 var(--sans);color:var(--mu)}
.leg2 span{display:inline-flex;align-items:center;gap:6px}.leg2 .d{width:6px;height:6px;border-radius:3px;background:var(--sage)}.leg2 .k{width:6px;height:6px;transform:rotate(45deg);background:var(--rub)}
.peek{margin:14px var(--g) 0;padding:14px 16px;border-radius:18px;border:1px solid var(--ln);background:var(--sf);position:relative;overflow:hidden}
.peek::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--lc)}
.peek h4{margin:6px 0 2px;font:500 21px/1.15 var(--serif)}.peek .inc{font-size:15.5px;display:block;margin-top:4px}
.peek .mks{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px}
.peek .two{display:flex;gap:8px;margin-top:12px}.peek .two .btn{min-height:46px;padding:0 14px;border-radius:14px;flex:1}.peek .two .btn b{font-size:15.5px}
.peek .two .btn2{flex:1}
.ov{margin:14px var(--g) 0;padding:16px;border-radius:20px;border:1px solid var(--ln);background:linear-gradient(180deg,color-mix(in srgb,var(--lc) 10%,var(--sf)),var(--sf) 60%)}
.ov h4{margin:8px 0 6px;font:500 26px/1.12 var(--serif)}
.ov .mks{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:8px}
.ov .two{display:flex;gap:8px;margin-top:14px}.ov .two>*{flex:1}.ov .two .btn{min-height:46px;padding:0 14px;border-radius:14px}.ov .two .btn b{font-size:15.5px}
/* sheet */
.shb{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s}
.sht{position:absolute;left:0;right:0;bottom:0;max-height:88%;overflow:auto;background:var(--sf);border-radius:20px 20px 0 0;z-index:31;transform:translateY(102%);transition:transform .25s ease;padding:8px 18px 16px;border-top:1px solid var(--ln)}
.open .shb{opacity:1;pointer-events:auto}.open .sht{transform:none}
.sht .grab{width:36px;height:4px;border-radius:2px;background:var(--ln);margin:4px auto 10px}
.sht h5{margin:0 0 4px;font:500 22px/1.2 var(--serif)}.sht .lead{margin:0 0 6px;font:14.5px/1.45 var(--serif);color:var(--ink2)}
.q{margin-top:16px}.q>label{display:block;margin-bottom:8px}
.op{display:grid;gap:8px}.op.c2{grid-template-columns:1fr 1fr}.op.c3{grid-template-columns:repeat(3,minmax(0,1fr))}
.op button{min-height:50px;border-radius:14px;border:1px solid var(--ln);background:var(--sf2);color:var(--ink);text-align:left;padding:10px 12px;cursor:pointer}
.op.c3 button{text-align:center;padding:8px 4px}.op b{display:block;font:500 15.5px/1.2 var(--serif)}.op small{display:block;font:12px/1.3 var(--sans);color:var(--mu);margin-top:3px}
.op button[aria-pressed=true]{border-color:var(--sage);background:var(--sageBg);box-shadow:inset 0 0 0 1px var(--sage)}
.rem{display:flex;align-items:center;gap:12px;min-height:52px;margin-top:8px;font:15px/1.3 var(--serif);color:var(--ink2)}.rem span{flex:1}
.tog{width:50px;height:30px;border-radius:15px;border:0;background:var(--ln);position:relative;cursor:pointer}.tog::after{content:"";position:absolute;left:3px;top:3px;width:24px;height:24px;border-radius:12px;background:var(--ink);transition:transform .15s}
.tog[aria-pressed=true]{background:var(--sage)}.tog[aria-pressed=true]::after{transform:translateX(20px);background:#fff}

}

.aoH7Screens .hero .aoTodayV2Art{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border:0;border-radius:0;margin:0}
.aoH7Screens .hero .aoTodayV2ArtSource{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:auto!important}
.aoH7Screens .hero .aoTodayV2ArtSource img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block}
.aoH7Screens .hero .aoTodayV2ArtSource:after{display:none}
.aoH7Screens .hero.aoTodayV2ArtMissing .aoTodayV2ArtSource{background:radial-gradient(120% 90% at 55% 35%,#6e5236,#33261a 55%,#100c08)}
.aoH7Screens .aoH7DoorArt{position:absolute;inset:0;background:#1b140e;background-size:cover;background-position:center 30%}
.aoH7Screens .aoH7DoorArt img{width:100%;height:100%;object-fit:cover;object-position:center 30%;display:block}
.aoH7Screens [hidden]{display:none!important}
.aoH7Screens .aoH7DoorView{display:flex;flex-direction:column;height:calc(100dvh - var(--ao-global-ribbon-h,68px));min-height:0;overflow:hidden}
.aoH7Screens .aoH7DoorView>.body{flex:1 1 auto;min-height:0;overflow-y:auto}
.aoH7Screens .aoH7DoorView>.band{position:relative}
.aoH7Screens .aoH7DoorView>.band .back{position:absolute;top:6px;left:8px;z-index:2;color:white;background:rgba(0,0,0,.35)}
.aoH7Screens .aoH7DoorView .foot{position:relative;z-index:3}
.aoH7Screens .aoH7DoorView .dsec>.rb{display:block;text-align:left;margin:18px 0 6px}
.aoH7Screens .aoH7HomeView .hero{isolation:isolate}
.aoH7Screens .aoH7HomeView .hero .sh{pointer-events:none}
.aoH7Screens .aoH7HomeView .hero .aoTodayV2HeroActions{display:block!important}
.aoH7Screens .aoH7HomeView .hero .aoTodayV2Mass{display:block!important;margin:0!important;padding:0!important;border:0!important;background:none!important}
.aoH7Screens .aoH7Week{margin-top:6px}
.aoH7Screens .btn[disabled]{opacity:.55}
@media(max-width:359px){.aoH7Screens .hero{height:470px!important}}

/* Faithful H7 selectors mapped onto existing source-owned Home content. */
.aoH7Screens .aoH7HomeView{height:auto!important;overflow:visible!important}
.aoH7Screens .aoH7HomeView .sec{padding:0 var(--g)!important}
.aoH7Screens .aoH7HomeView .aoH4SectionHead{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:26px 0 10px}
.aoH7Screens .aoH7HomeView .aoH4SectionHead h2{font:500 21px/1.1 var(--serif)!important;margin:0}
.aoH7Screens .aoH7HomeView .aoH4SectionHead button{border:0!important;background:transparent!important;color:var(--sage)!important;font:500 14.5px/1 var(--serif)!important;min-height:44px!important;padding:4px 0!important}
.aoH7Screens .aoH7HomeView .aoH4Prayer.np{display:flex!important;align-items:center!important;gap:14px!important;width:100%!important;min-height:80px!important;padding:14px!important;border:1px solid var(--ln)!important;border-radius:18px!important;background:var(--sf)!important;color:var(--ink)!important;text-align:left!important}
.aoH7Screens .aoH7HomeView .aoH4PrayerGlyph{width:44px!important;height:44px!important;border-radius:50%!important;background:var(--sageBg)!important;color:var(--sage)!important;display:grid!important;place-items:center!important;flex:0 0 44px!important}
.aoH7Screens .aoH7HomeView .aoH4PrayerText{flex:1!important;min-width:0}
.aoH7Screens .aoH7HomeView .aoH4PrayerText strong{display:block;font:500 18px/1.2 var(--serif)!important;margin-top:5px}
.aoH7Screens .aoH7HomeView .aoH4PrayerText small{font:13px/1.3 var(--sans)!important;color:var(--mu)!important}
.aoH7Screens .aoH7HomeView .aoH4Chips.chips{display:flex!important;gap:8px!important;overflow-x:auto!important;margin-top:10px!important;padding:0!important}
.aoH7Screens .aoH7HomeView .aoH4Chips.chips button{flex:0 0 auto!important;min-height:42px!important;padding:0 14px!important;border:1px solid var(--ln)!important;border-radius:21px!important;background:transparent!important;color:var(--ink)!important;font:500 14.5px/1 var(--serif)!important}
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc{display:flex!important;gap:10px!important;overflow-x:auto!important;scrollbar-width:none!important;padding:0!important}
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc button{flex:0 0 150px!important;min-height:104px!important;border-radius:16px!important;border:1px solid var(--ln)!important;background:var(--sf)!important;color:var(--ink)!important;text-align:left!important;padding:12px!important;display:flex!important;flex-direction:column!important;gap:0!important}
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc strong{font:500 17px/1.2 var(--serif)!important;margin:8px 0 auto!important}
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc small{font:12.5px/1.3 var(--sans)!important;color:var(--mu)!important;margin-top:6px!important}
.aoH7Screens .aoH7HomeView .aoH4Read{border:1px solid var(--ln)!important;border-radius:16px!important;background:var(--sf)!important;overflow:hidden!important}
.aoH7Screens .aoH7HomeView .aoH4Read button.row{min-height:58px!important;padding:8px 14px!important;border:0!important;background:transparent!important;color:var(--ink)!important;display:flex!important;align-items:center!important;gap:12px!important;text-align:left!important}
.aoH7Screens .aoH7HomeView .aoH4Read button.row strong{font:500 16px/1.25 var(--serif)!important}
.aoH7Screens .aoH7HomeView .aoH4Read button.row small{font:13px/1.3 var(--sans)!important;color:var(--mu)!important}
.aoH7Screens .aoH7HomeView .aoH4DiscoveryStandalone{margin:26px var(--g) 0!important;padding:0!important}
.aoH7Screens .aoH7DoorView .foot>.btn{display:flex!important;min-height:56px!important;width:100%!important;padding:8px 10px 8px 18px!important;border:0!important;border-radius:16px!important;background:var(--sage)!important;color:var(--onsage)!important;text-align:left!important}
.aoH7Screens .aoH7DoorView .foot>.btn>span:first-child{flex:1;min-width:0}
.aoH7Screens .aoH7DoorView .foot>.btn strong{display:block;font:600 18px/1.15 var(--serif)!important;color:var(--onsage)!important}
.aoH7Screens .aoH7DoorView .foot>.btn small{display:block;font:500 12px/1.3 var(--sans)!important;opacity:.78}
.aoH7Screens .aoH7DoorView .foot>.btn .aoH4Arrow{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.14);font-size:23px}
.aoH7Screens .aoH7DoorView .foot .mini{display:flex!important;justify-content:center!important;gap:2px!important;margin-top:4px!important}
.aoH7Screens .aoH7DoorView .foot .mini button{min-height:40px!important;padding:0 12px!important;border:0!important;background:transparent!important;color:var(--ink2)!important;font:500 14px/1 var(--serif)!important}

/* Production app appearance donor (prototype used only body.light). */
html[data-ao-appearance-v1="light"] .aoH7Screens,
html[data-ao-appearance-choice-v1="light"] .aoH7Screens{
 --bg:#F7F2E9;--sf:#FFFFFF;--sf2:#F0E8DA;--ln:#E3D9C8;--ink:#221E1A;--ink2:#433C35;--mu:#6E6A64;--gold:#8E6A2B;--rub:#9B2C24;--sage:#3E7A57;--onsage:#fff;--sageBg:#E3EFE6;color-scheme:light
}
.homeScreen.aoTodayV2.aoTodayH4.aoH7Screens{background:var(--bg)!important;color:var(--ink)!important}
.aoH7Screens.lc-green{--lc:#62A473}
.aoH7Screens.lc-white{--lc:#E9E0C9}
.aoH7Screens.lc-red{--lc:#D0574A}
.aoH7Screens.lc-black{--lc:#8C8C8C}
.aoH7Screens.lc-violet{--lc:#9A7BC4}
.aoH7Screens.lc-rose{--lc:#D99AAE}
.aoH7Screens.lc-none{--lc:#3A4652}
.aoH7Screens .dateRail.aoH4Week .aoWeekColour[data-verified-colour]{width:16px!important;height:3px!important;background:var(--ao-h4-day-colour)!important;opacity:1!important}
`;
