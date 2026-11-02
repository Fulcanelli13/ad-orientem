/** Presentation only: two already released, full-painting Met crops. */
if(typeof document!=="undefined"&&!document.getElementById("ao-released-module-photo-css")){
 const node=document.createElement("style");node.id="ao-released-module-photo-css";
 node.textContent=[
  "#aoPray435930 .aoPrayPilotReleasedTilePhoto{width:100%;height:100%;object-fit:contain;display:block;background:#101016}",
  "#aoPray435930 .aoPrayPilotAngelusHero[data-ao-art-publication=released]{isolation:isolate;background:#101016}",
  "#aoPray435930 .aoPrayPilotAngelusHero .aoPrayerAngelusPhoto{position:absolute;inset:0;z-index:0;margin:0;min-width:0;overflow:hidden}",
  "#aoPray435930 .aoPrayPilotAngelusHero .aoPrayerAngelusPhoto>img{width:100%;height:100%;display:block;object-fit:contain;object-position:center}",
  "#aoPray435930 .aoPrayPilotAngelusHero[data-ao-art-publication=released]::before{content:'';position:absolute;inset:30% 0 0;z-index:1;pointer-events:none;background:linear-gradient(transparent,rgba(12,12,17,.93))}",
  "#aoPray435930 .aoPrayPilotAngelusHero .aoPrayPilotAngelusCoverCopy{position:relative;z-index:2}",
  "#aoPray435930 .aoPrayPilotAngelusHero .aoPrayerAngelusPhoto figcaption{position:absolute;top:6px;right:7px;z-index:3;padding:3px 6px;background:rgba(0,0,0,.68);color:#f8efe6;font:10px/1.2 Georgia,serif}",
  "#aoPray435930 .aoPrayPilotAngelusHero .aoPrayerAngelusPhoto figcaption a{color:inherit;text-decoration:underline}",
  "#aoPray435930 .aoPrayDoorArtwork[data-ao-art-binding=released]{position:relative;display:block;padding:0;background:#0d1119;overflow:hidden}",
  "#aoPray435930 .aoPrayDoorArtwork .aoPrayerEucharisticCover{height:100%;width:100%;margin:0;position:relative}",
  "#aoPray435930 .aoPrayDoorArtwork .aoPrayerEucharisticCover img{height:100%;width:100%;object-fit:contain;display:block}",
  "#aoPray435930 .aoPrayDoorArtwork .aoPrayerEucharisticCover figcaption{position:absolute;bottom:3px;right:6px;left:6px;background:rgba(0,0,0,.75);color:#faf1df;text-align:right;font:10px/1.25 Georgia,serif}",
  "#aoPray435930 .aoPrayerEucharisticCover figcaption a,#aoPray435930 .aoPrayerAdorationCover figcaption a{color:inherit;text-decoration:underline}",
  "#aoPray435930 .aoPrayerAdorationCover{height:132px;min-height:132px;width:100%;position:relative;display:block;margin:0 0 14px;background:#101016;overflow:hidden}",
  "#aoPray435930 .aoPrayerAdorationCover img{height:100%;width:100%;object-fit:contain;display:block}",
  "#aoPray435930 .aoPrayerAdorationCover figcaption{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.72);padding:3px 7px;color:#f8efe6;font:10px/1.25 Georgia,serif;text-align:center}",
  "@media(max-width:359px){#aoPray435930 .aoPrayerAdorationCover{height:110px;min-height:110px}}"
 ].join("\n");
 document.head.append(node);
}
