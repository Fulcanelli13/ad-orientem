# Morning & Evening reader — direct access and scrolling repair (28 October 2026)

## Field report
User reported that the B04 customization-first UI is too complex and that scrolling does not work. This release gives direct prayer access priority and removes nested settings scroll capture.

## User journey
- **Morning / Evening** stays the first compact switch.
- **Pray in order / Choose a prayer** is the primary pair of immediately visible actions.
- **Pray in order** retains the 65+ scene? No: this module is strictly St Pius X daily prayer (1913 11 Morning/10 Evening; 1905 10/8), with the existing single-card manual horizontal navigation and sunrise/sunset progression.
- **Choose a prayer** lists *every complete St Pius X prayer* from the currently selected source edition, independent of which cards were retained in a Personal Brief. A collapsible **Other traditional prayers** list offers the existing source-language supplementary prayer bank without force-adding anything to the daily rule.
- Selecting a prayer opens **one complete source-owned card**, inside the current dual-axis reader and its existing scrolling region; the list remains one tap away. No new route, text, translation, source record or historical Short edition. Users can return to **Pray in order** at any time.
- **Edit my daily rule** is a lower-priority disclosure placed *after the actual prayer* or after the prayer index. It retains all B04 Brief selections, edition/language options and optional additions for those who want them. User-facing access to a prayer no longer requires changing stored preferences.

## Scrolling fix
1. Former settings CSS `max-height:55dvh; overflow-y:auto; overscroll-behavior:contain` made a scroll-trapping nested viewport and put most of the prayer selector in a confined small area. The settings now grow in the app's **native main scroll**, without a second vertical scroller.
2. Stop `scrollIntoView({block:"nearest"})` after each personalization choice: it hijacked the user's reading position. Preserve the main mount's scroll position instead.
3. Give the *existing* guided card text region `overflow-y:auto`, vertical touch scrolling (`touch-action:pan-y`) and natural overscroll. Its horizontal swipe handler remains unchanged.
4. Other Prayer modules' scrollers and routing remain untouched.

## Integrity
- Direct core prayer always resolves the original 1905/1913 text (not a saved alternate formulation); direct optional prayer resolves its own attested source, language and complete text. The saved rule, optional additions and Brief selections remain unchanged.
- A 1913 Evening Examen entry is an existing guided reflection; it is not a printed spoken prayer and is not inserted into 1905.
- Mobile acceptance exercises direct navigation, complete and optional source text, persistence, natural index scrolling and vertical text scrolling, with existing sunrise/sunset, timer, guide and other-route checks.
- No extra expenses, services, Office route, ICKSP PR or Sacred Art modifications.
