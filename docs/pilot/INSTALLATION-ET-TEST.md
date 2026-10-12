# Ad Orientem — controlled phone pilot / essai privé sur téléphone

**Status: INTERNAL DRAFT — NOT AN INVITATION OR RELEASE APPROVAL.** Do not distribute this handout or start a 20–50-person pilot until the release owner explicitly authorizes the scope. The app-wide donor-evidence gate [#271](https://github.com/Fulcanelli13/ad-orientem/issues/271), handset acceptance [#1055](https://github.com/Fulcanelli13/ad-orientem/issues/1055), and Rosary source-review conditions in [PILOT-HANDSET-EDITORIAL-HANDOFF](../PILOT-HANDSET-EDITORIAL-HANDOFF.md) remain independent. A green deployment or installability test does not clear them.

**Pilot candidate:** [https://fulcanelli13.github.io/ad-orientem/](https://fulcanelli13.github.io/ad-orientem/) — canonical public-repository GitHub Pages project URL; verify it opens on the actual handset before distributing. No APK, Google Play listing, Apple App Store listing, registration, subscription, or paid installation is required for this **web-app** approach. Because the GitHub Pages repository is public, a shared link is **not access-controlled**: permission is enforced through whom the pilot coordinator invites, not by the website.

## Français — instructions courtes pour un testeur invité

1. Ouvrez **[Ad Orientem](https://fulcanelli13.github.io/ad-orientem/)** sur votre téléphone, **en ligne**. Utilisez Chrome sur Android ou Safari sur iPhone.
2. **Android / Chrome :** ouvrez le menu **⋮** puis choisissez **Installer l’application** ou **Ajouter à l’écran d’accueil**, selon la version. Confirmez.
3. **iPhone / Safari :** ouvrez **Partager** (éventuellement depuis le menu de page), puis **Sur l’écran d’accueil** / **Ajouter à l’écran d’accueil**. Gardez **Ouvrir comme application web** activé et touchez **Ajouter**.
4. Lancez **Ad Orientem depuis l’icône de l’écran d’accueil**. Ouvrez **Prière → Rosaire** ; essayez quelques dizaines, puis **Chapelet de la Miséricorde divine**.
5. Laissez l’application charger une première fois **avec Internet**. Ensuite, activez temporairement le mode avion, fermez et rouvrez l’application depuis l’icône. Vérifiez que l’accueil se charge. **Tout le contenu n’est pas garanti hors ligne.**
6. Lorsqu’une version plus récente est prête, l’application peut proposer **Update / Later** : choisissez **Update** au moment qui vous convient. Une mise à jour choisie recharge l’application ; ne la lancez pas au milieu d’une prière ou de la Messe.

**Retour d’expérience :** indiquez au coordinateur le modèle *général* de téléphone (p. ex. iPhone 14), la version d’iOS/Android, le navigateur, la langue, l’étape testée et le résultat **OK / PROBLÈME / NON TESTÉ**. Ajoutez seulement une capture de l’interface si nécessaire. Ne partagez ni identifiant unique, ni données médicales, ni confessions ni prières personnelles.

## English — invited tester quickstart

1. Open **[Ad Orientem](https://fulcanelli13.github.io/ad-orientem/)** on your phone **while online**, in Chrome on Android or Safari on iPhone.
2. **Android / Chrome:** tap **⋮** and select **Install app** or **Add to Home screen** (wording can vary). Confirm installation.
3. **iPhone / Safari:** select **Share** (possibly through the Page Menu) → **Add to Home Screen**, keep **Open as Web App** enabled, and tap **Add**.
4. Start **Ad Orientem from its Home Screen icon**. Go to **Prayer → Rosary**, try several beads, then **Divine Mercy Chaplet**.
5. Open successfully **online first**. Then briefly enable airplane mode and reopen the installed app. Confirm Home loads; **not all deeper content is guaranteed offline**.
6. When **Update / Later** appears for a newer version, choose **Update** at a convenient moment. It reloads the app. Avoid updating during a prayer or Mass.

**Feedback:** send the pilot coordinator the broad device model, OS, browser, language, tested journey and **PASS / ISSUE / NOT TESTED**. Supply a screenshot of a visual fault only when necessary; never send private prayer, confession, health or unique device details.

## Pilot coordinator: release, roster and problem triage

- **Release permission first.** Check [#271](https://github.com/Fulcanelli13/ad-orientem/issues/271), [#1055](https://github.com/Fulcanelli13/ad-orientem/issues/1055) and any relevant editorial certification before enabling distribution. An *internal controlled experiment* must be explicitly authorized; do not call it public certification.
- **Start with two real handset testers** (one Android Chrome, one iPhone Safari), record actual install/standalone launch/offline result and the production commit. Then expand in small waves only after blockers are resolved. A target of 20–50 is a cap, not evidence of 20–50 tested.
- **Send a single URL once**, not version-specific APK files. The PWA service worker checks for newer snapshots online and offers explicit user-consented updates. There is **no push notification, guaranteed background sync or automatic forced update**.
- **Keep the contact/consent roster out of the public GitHub repository.** Use an access-controlled list maintained by the coordinator, with only necessary contact details, invitation status and a neutral tester ID.
- **If offline startup fails**, reconnect, open the app online, let it load and try again. Never tell testers to clear all website data as routine support: doing so can remove other locally stored information.
- **If installation differs**, note the actual OS/browser wording rather than insisting the menu match this sheet verbatim. Screen-reader, font scaling and small-screen issues are legitimate reports.
- **For reproducible failures**, record: anonymous tester ID, date, production commit, OS/browser, language, online/offline, route, reproduction steps, expected vs actual, and severity. Link the internal record to [#1055](https://github.com/Fulcanelli13/ad-orientem/issues/1055) or a new *specific* bug issue; avoid personal data and duplicate tickets.
- **Do not misrepresent privacy.** No login is required for this GitHub Pages web-app route; however, normal browser/GitHub Pages/network requests may generate server-side logs. Do not promise zero data collection without a separate privacy audit.

Official browser guidance: [Google Chrome Android web apps](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=en) · [Apple Safari iPhone web apps](https://support.apple.com/en-gb/guide/iphone/iphea86e5236/ios)

Technical notes: [OFFLINE-UPDATES](../OFFLINE-UPDATES.md), [full physical phone checklist](../PILOT-HANDSET-EDITORIAL-HANDOFF.md). **This sheet is provisional until a real phone verifies the QR-free URL and steps.**
