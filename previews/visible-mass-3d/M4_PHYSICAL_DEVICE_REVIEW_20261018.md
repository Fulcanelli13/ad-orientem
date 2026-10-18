# The Visible Mass — M4 physical-device review
18 October 2026 | PR #1309 | Research review, **not** authorised publication

## M4.4 — Open the self-contained genuine-photo HTML first

The **integrated** `The_Visible_Mass_M4_Photographic_Review_Offline.html` is published only as a **GitHub Actions research artifact**, not as a production deployment. Download the `The-Visible-Mass-M4-Photographic-Review-Offline` artifact from [successful original-photograph M4 run #39094002530](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39094002530), extract the HTML, and open it directly in a browser. It contains all three licensed original photographs (Brompton altar still, Brompton 360°, Dublin Newman 360°), 134 original question records, the current French study overlay, four optional guided trails and 450 canonical glossary entries. It is **not** the old `The_Visible_Mass_P0_Offline.html`.

This self-contained visitor passed disconnected `file://` Chromium at 1280×820 and mobile emulation 390×844, with all three photographed images decoded, canonical 134 questions and 450 G### entries loaded, Brompton-only object list boundary intact, six high-altar markers and direct AL01 inspection functional. The actual HTML is approximately **3.4 MB**; licensed photographed pixels and data are embedded, without an external browser server. Supplemental inspection photos remain optional external linked resources and may need a connection. The user still needs to test a real Android HTML-opening application/browser and physical Windows/Edge.

This offline original-photo preview does **not** package or simulate the native app's published Mass Explorer, LIVE, Simple or Missal. Its research candidate links remain dormant when the production shell is absent. Nothing is merged or approved for release.

## Open the actual integrated visitor

The feature under review is **`previews/visible-mass-3d/sanctuary-hotspot-pilot.html`**, not the separate `The_Visible_Mass_P0_Offline.html` 3D-engine prototype. The latter does **not** contain this integrated sanctuary-panoramas M4 visitor. Open this document in the feature branch, not in production.

From a checkout of `feature/visible-mass-3d-explorer-p0`, with Node 22 or newer:

1. On **Windows/Edge**, run `node tools/serve-visible-mass-review.mjs` from the repository root. Open `http://127.0.0.1:8765/previews/visible-mass-3d/sanctuary-hotspot-pilot.html`.
2. On **Android Chrome, same trusted Wi-Fi only**, stop the local-only server and run `node tools/serve-visible-mass-review.mjs --lan` on Windows. Use `ipconfig` to obtain the PC's Wi-Fi IPv4 address. Open `http://<PC-LAN-IPv4>:8765/previews/visible-mass-3d/sanctuary-hotspot-pilot.html` on the phone. If the Windows firewall prompts, grant access only on the trusted private network. Do not forward the port, use on public Wi-Fi, or leave the server running unattended.
3. Stop with **Ctrl+C**. The server is read-only, does not publish a live web app, and deliberately blocks `.git`, hidden files and paths outside the static review asset trees. All original panorama photographs still require an internet connection to Wikimedia Commons.

If Node is unavailable, a Python `http.server` may also work locally, but it is **not** the recommended LAN option because a generic file server may expose the entire working tree. Never copy a private local repository to an unrestricted public web server for testing.

## Visual/device acceptance sheet

Record phone model, Android version, browser version, Wi-Fi/mobile connectivity, Windows browser and viewport, the testing date, and whether actual images loaded from Commons. Screen captures should be of **actual source photographs**, not the synthetic colours used by isolated browser tests.

| Gate | Verify on Windows/Edge and Android Chrome | Result |
| --- | --- | --- |
| Initial sanctuary | The genuine Brompton high-altar still shows **six accurate existing markers**; object tabs and source ownership are unchanged | Pending human |
| Brompton 360° | Original David Iliff interior, correct upright architecture, altar visible ahead; no sixth-object marker positions copied onto panorama | Pending human |
| Newman 360° | Independent Dublin church interior, upright altar ahead; no suggestion that this is a proven 1962 Mass venue | Pending human |
| Camera controls | Drag, swipe, arrows, pitch, zoom; **↺** faces the sanctuary again; switching back preserves the last pose for each church | Pending human |
| Phone usability | No overly tall page header or horizontal layout clipping, controls comfortably tappable, touch scrolling outside panorama remains possible | Pending human |
| Guide continuity | Four optional trails remain independent; an individual suggestion or entire path can be skipped; no repeated forced pathway | Pending human |
| Content | English/French selection clearly flags French as research; the four held VMQ answers and six M3 source-review holds remain unpublished | Pending editorial |
| Provenance | Photographic author and source Commons page, CC BY-SA 3.0 licence links, explicit perspective-projection attribution visible | Pending rights sign-off |
| Network resilience | Temporarily disconnect internet: no fabricated photo or black stale scene; retry and original Commons link remain available | Pending human |
| Long-session behaviour | Move around 360°, switch scenes several times on device; check heat, battery, stalls, memory and frame responsiveness | Pending real hardware |

Screenshots required for sign-off: initial still scene, Brompton 360° first view, Newman 360° first view, expanded guide mode, selected Brompton object and visible source attribution. Capture both portrait Android and desktop Windows views. Record the approximate delay to load the source on Wi-Fi and, separately, any mobile connection.

Automated reference evidence: [actual photograph + live-network pass](https://github.com/Fulcanelli13/ad-orientem/actions/runs/39080663332). These tests certify Chromium image geometry, routing, content separation and browser HTTPS/CORS delivery **only**; they do not certify physical Android/Edge performance or user visual approval.

## Stop / no-release conditions

Do not merge PR #1309 solely because browser CI is green. M3 20 French translations are research-only; **14 source corroborations are not approval**, **six need independent source checks** (three rubrical, three historical), and four original VMQ questions remain unanswered. Rights and application distribution require further review. A failing independent R17 or Formation gate should be triaged in its own module, not worked around in M4. None of these changes changes the canonical LIVE, Simple or Missal readers.
