# Verification record

Verified locally on 3 October 2026 in a Chromium-based browser using the actual user interface. These functional checks were performed separately from the static code review in Kiro IDE.

| Check | Observed result |
| --- | --- |
| JavaScript syntax | `node --check js/script.js` passed |
| Blank form | Name error; no transaction created |
| Amount zero | Amount error; no transaction created |
| Missing category | Category error; no transaction created |
| Add three categories | Food 35000, Transport 20000, Fun 45000; total 100000 |
| Pie distribution | Food 35%, Transport 20%, Fun 45%; accessible text matches |
| Single-category chart | Full circle renders and reports 100% |
| Spending limit | Budget 80000 flags excess 20000 |
| Empty budget after Kiro fix | Clearing the field and saving disables the limit; setting 150000 and reloading restores it |
| Amount/category sort | Ascending, descending, and category orders match selected mode |
| Persistence | Transactions, budget, and dark theme restored after reload |
| Delete transaction | Removing Food changes total to 65000 and removes its slice |
| Delete all | Total becomes zero; empty chart and history restored |
| Decimal precision | 0.10 + 0.20 displays 0.3; 1.001 rejected |
| Literal user text | `<b>Uji teks</b>` displays as text; no injected b element |
| 320px / 390px / 1280px | No page-level horizontal overflow |
| Console | No error or warning logged during exercised flows |
| GitHub Pages deployment | Build succeeded; public site loads, add Rp1000 updates chart/total, reload preserves it, and delete restores zero |

Only the available Chromium-based browser was tested. Firefox, Edge, and Safari were not separately exercised. Storage unavailability/corruption handling was reviewed in code but not simulated in the browser.

Screenshots and test/demo data are kept outside the source repository. The delivered source starts without transaction data on a new browser origin.
