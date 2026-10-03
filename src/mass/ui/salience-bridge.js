
(()=>{
  const AO=window.AO=window.AO||{};
  const d=AO.LiturgicalData?.data;
  const expected=AO.BUILD?.counts||{};
  const actual=d?{macros:d.macros.length,blocks:d.blocks.length,priestEvents:d.priestEvents.length,stations:d.stations.length,postures:d.postures.length,gestures:d.gestures.length,responses:d.responses.length,schola:d.schola.length,branches:d.branches.length,concurrency:d.concurrency.length,fixture:d.fixture.length}:{};
  const countOk=Object.keys(expected).every(k=>actual[k]===expected[k]);
  const unresolved=[...document.querySelectorAll('[data-icon-missing]')].map(x=>x.dataset.iconMissing).filter(Boolean);
  const rejectedPrayerCinema=!document.querySelector('.prayer-cinema,.liturgical-focus-layer,.prayer-focus-overlay');
  AO.Audit=AO.Audit||{};
  AO.Audit.Ultimate=Object.freeze({
    version:'2.10.0',canonicalCounts:actual,canonicalCountsPass:countOk,canonicalMassSha256:'050ce4b65918890a252078c9942f1dde282d2494dabe0e522bb842c03be20b28',
    assetBank:window.AO_ICON_BANK_META?.version||'',unresolvedVisibleSemantics:unresolved,
    noBellCard:!document.getElementById('bellCard'),noScholaRailCard:!document.getElementById('scholaRailCard'),
    rejectedPrayerCinemaAbsent:rejectedPrayerCinema,singleOwnerPolicy:true
  });
  document.documentElement.dataset.aoUltimate=countOk&&unresolved.length===0&&rejectedPrayerCinema?'ready':'audit';
})();
