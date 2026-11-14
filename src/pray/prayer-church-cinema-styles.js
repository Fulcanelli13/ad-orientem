/**
 * Prayer Church Cinema — local CSS-3D materials adapted from the existing
 * Ad Orientem / Claude Interactive Church donor. No external service, canvas
 * texture download, WebGL dependency, or generated cartoon character.
 */
export const PRAYER_CHURCH_CINEMA_CSS=String.raw`
#aoPray435930 .aoChurchCinema{position:absolute;inset:0;z-index:2;overflow:hidden;isolation:isolate;contain:layout paint;background:radial-gradient(ellipse at 48% 26%,#373022,#17140f 62%,#090a0c 100%);--ao-cinema-shadow:.12;--ao-cinema-warm:.2}
#aoPray435930 .aoChurchCinemaViewport{position:absolute;inset:0;overflow:hidden;perspective-origin:50% 46%;touch-action:pan-y;pointer-events:none;background:radial-gradient(ellipse at 48% 44%,rgba(175,130,69,.12),transparent 80%)}
#aoPray435930 .aoChurchCinemaWorld{position:absolute;left:50%;top:46%;width:0;height:0;transform-style:preserve-3d;will-change:transform;pointer-events:none}
#aoPray435930 .aoChurchCinemaWorld .aoChurchFace{position:absolute;left:0;top:0;transform-origin:0 0;box-sizing:border-box;backface-visibility:hidden;-webkit-backface-visibility:hidden;background-color:var(--m,#aaa);background-image:var(--ao-cinema-light,linear-gradient(transparent,transparent)),var(--tex,linear-gradient(transparent,transparent));background-size:100% 100%,var(--tex-size,100% 100%)}
#aoPray435930 .aoChurchCinemaWorld .m-floor{--m:#bcb29e;--tex:repeating-conic-gradient(#cbc0af 0 25%,#9b907d 0 50%);--tex-size:43px 43px}
#aoPray435930 .aoChurchCinemaWorld .m-runner{--m:#661f27;--tex:linear-gradient(90deg,#bda16b 0 3px,transparent 3px calc(100% - 3px),#bda16b calc(100% - 3px))}
#aoPray435930 .aoChurchCinemaWorld .m-altar-floor{--m:#d5cdbb;--tex:repeating-conic-gradient(from 45deg,#e3dac9 0 25%,#afa18d 0 50%);--tex-size:28px 28px}
#aoPray435930 .aoChurchCinemaWorld .m-riser{--m:#998a74}
#aoPray435930 .aoChurchCinemaWorld .m-linen{--m:#ece7d9}
#aoPray435930 .aoChurchCinemaWorld .m-frontal{--m:#ece2d3;--tex:linear-gradient(90deg,transparent 0 30%,#c7a35b 30% 33%,transparent 33% 67%,#c7a35b 67% 70%,transparent 70%),linear-gradient(#c7a35b 0 5%,transparent 5% 94%,#c7a35b 94%)}
#aoPray435930 .aoChurchCinemaWorld .m-marble{--m:#dfd8c9;--tex:repeating-linear-gradient(32deg,transparent 0 42px,rgba(120,97,77,.075) 44px 45px,transparent 47px 105px)}
#aoPray435930 .aoChurchCinemaWorld .m-rail{--m:#c4baa6;--tex:repeating-linear-gradient(90deg,#d2c8b7 0 6px,#887e6d 7px 9px,transparent 9px 17px)}
#aoPray435930 .aoChurchCinemaWorld .m-gold{--m:#d6b46c;--tex:linear-gradient(135deg,#fae2a4,#a67b36 58%,#cfab65)}
#aoPray435930 .aoChurchCinemaWorld .m-tabernacle{--m:#e2d0a1;--tex:linear-gradient(90deg,#b28a45 0 10%,#f0e4c5 10% 46%,#bd9c54 46% 54%,#f0e4c5 54% 90%,#b28a45 90%)}
#aoPray435930 .aoChurchCinemaWorld .m-reredos{--m:#dad1be;--tex:linear-gradient(90deg,#b49257 0 3%,transparent 3% 31%,rgba(175,138,71,.7) 31% 33%,transparent 33% 67%,rgba(175,138,71,.7) 67% 69%,transparent 69% 97%,#b49257 97%),linear-gradient(#e6dfd2,#bdaf97)}
#aoPray435930 .aoChurchCinemaWorld .m-wall{--m:#c6b89e;--tex:linear-gradient(transparent 0 80%,#644e3c 80% 81.5%,#473529 81.5%),repeating-linear-gradient(90deg,transparent 0 130px,rgba(156,117,67,.20) 130px 134px)}
#aoPray435930 .aoChurchCinemaWorld .m-stone{--m:#cfc0a3;--tex:linear-gradient(#bba98b,#d3c6aa)}
#aoPray435930 .aoChurchCinemaWorld .m-wood{--m:#4e3221;--tex:repeating-linear-gradient(90deg,rgba(0,0,0,.16) 0 2px,transparent 3px 30px)}
#aoPray435930 .aoChurchCinemaWorld .m-pew{--m:#533620;--tex:repeating-linear-gradient(90deg,rgba(0,0,0,.26) 0 2px,transparent 3px 26px)}
#aoPray435930 .aoChurchCinemaWorld .m-pewtop{--m:#735037}
#aoPray435930 .aoChurchCinemaWorld .m-pewend{--m:#342014}
#aoPray435930 .aoChurchCinemaWorld .m-pewseat{--m:#563824}
#aoPray435930 .aoChurchCinemaWorld .m-confess{--m:#50321d;--tex:linear-gradient(90deg,#2d1b11 0 7%,#6f2326 7% 27%,#291910 27% 35%,#1e150f 35% 65%,#291910 65% 73%,#6f2326 73% 93%,#2d1b11 93%),linear-gradient(#24160e 0 10%,transparent 10%)}
#aoPray435930 .aoChurchCinemaWorld .m-confside{--m:#3e2719;--tex:repeating-linear-gradient(90deg,rgba(183,139,73,.19) 0 3px,transparent 3px 48px)}
#aoPray435930 .aoChurchCinemaWorld .m-confroof{--m:#48301f}
#aoPray435930 .aoChurchCinemaWorld .m-window{background:radial-gradient(ellipse at 50% 20%,rgba(255,233,177,.45),transparent 62%),repeating-linear-gradient(90deg,transparent 0 23%,#392e26 23% 26%),repeating-linear-gradient(0deg,transparent 0 16%,#322924 16% 18%),linear-gradient(#294d78,#586d81 47%,#8a4741 74%,#c0a36a);border-radius:48% 48% 0 0 / 24% 24% 0 0;box-shadow:inset 0 0 0 3px #3b2b20;opacity:.82}
#aoPray435930 .aoChurchCinemaWorld .m-cross{--m:#c9a04b;--tex:linear-gradient(90deg,#82612b,#e8c27d 48%,#715226)}
#aoPray435930 .aoChurchCinemaWorld .m-altarpiece{--m:#32261f;--tex:radial-gradient(ellipse at 48% 33%,rgba(195,156,98,.38),transparent 67%),linear-gradient(80deg,#191c23,#49392b 50%,#1b1e22)}
#aoPray435930 .aoChurchCinemaWorld .m-chancel{--m:#cbbca3}
#aoPray435930 .aoChurchCinemaWorld .m-pediment{--m:#d9c7a6;clip-path:polygon(0 100%,50% 0,100% 100%)}
#aoPray435930 .aoChurchCinemaWorld .aoChurchBillboard{position:absolute;left:0;top:0;transform-origin:50% 100%;pointer-events:none;will-change:transform}
#aoPray435930 .aoChurchBillboard .aoChurchCandle{position:absolute;left:46%;bottom:0;width:8%;height:70%;border-radius:2px;background:linear-gradient(90deg,#a49372,#ede0be 48%,#7a6b50);box-shadow:0 0 4px #111}
#aoPray435930 .aoChurchBillboard .aoChurchFlame{position:absolute;left:38%;bottom:65%;width:24%;height:29%;border-radius:55% 20% 60% 45%;transform-origin:50% 100%;background:radial-gradient(ellipse at 50% 75%,#fffef0 0 14%,#ffdd88 34%,#f9a448 60%,rgba(205,86,34,0) 82%);filter:drop-shadow(0 0 8px #e9a34f);animation:aoChurchRealFlame 1.65s ease-in-out infinite alternate;transition:opacity .72s ease,filter .72s ease}
#aoPray435930 .aoChurchBillboard.is-dark .aoChurchFlame{opacity:0;animation:none}
#aoPray435930 .aoChurchBillboard.is-concealed{opacity:0;visibility:hidden}
#aoPray435930 .aoChurchCinemaAtmosphere{position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(7,8,12,.1),rgba(7,7,9,.08) 40%,rgba(7,7,9,.34)),radial-gradient(ellipse at 55% 46%,rgba(202,148,63,var(--ao-cinema-warm)),transparent 64%);opacity:1;transition:opacity 900ms ease}
#aoPray435930 .aoChurchCinemaDarkness{position:absolute;inset:0;background:#05060a;opacity:var(--ao-cinema-shadow,0);pointer-events:none;transition:opacity 1200ms ease}
#aoPray435930 .aoChurchCinema[data-ao-cinema-kind="tenebrae"] .aoChurchCinemaAtmosphere{background:radial-gradient(ellipse at 52% 32%,rgba(181,121,45,var(--ao-cinema-warm)),transparent 58%),linear-gradient(to bottom,rgba(3,3,7,.08),rgba(3,3,7,.40))}
#aoPray435930 .aoChurchCinema[data-ao-cinema-kind="confession"] .aoChurchCinemaAtmosphere{background:radial-gradient(ellipse at 55% 39%,rgba(198,150,84,.18),transparent 56%),linear-gradient(to bottom,rgba(2,3,7,.07),rgba(3,3,7,.29))}
#aoPray435930 .aoChurchCinemaBadge{position:absolute;left:11px;bottom:11px;z-index:2;padding:4px 7px;background:rgba(8,9,11,.66);border:1px solid rgba(219,186,137,.14);border-radius:6px;color:#e7d6b4;font:400 11px/1.3 Georgia,serif;letter-spacing:.02em;pointer-events:none;max-width:75%}
#aoPray435930 .aoChurchCinema[data-ao-cinema-kind="confession"] .aoChurchCinemaBadge{display:none}
@keyframes aoChurchRealFlame{0%{transform:scale(.85) rotate(-7deg)}50%{transform:scale(1.13) rotate(4deg)}100%{transform:scale(.95) rotate(-3deg)}}
@media (prefers-reduced-motion:reduce){#aoPray435930 .aoChurchCinema *,#aoPray435930 .aoChurchCinema{animation:none!important;transition:none!important;will-change:auto!important}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-prayer-church-cinema-styles")){
 const el=document.createElement("style");el.id="ao-prayer-church-cinema-styles";el.textContent=PRAYER_CHURCH_CINEMA_CSS;(document.head||document.documentElement).appendChild(el);
}

