# Project context

Project: Expense & Budget Visualizer (Ruang Uang).
Participant: Reza Febriadi Rauf. Batch start: 28 September 2026.

## Course constraints

- Plain HTML, CSS, and vanilla JavaScript. No React, Vue, or other frontend framework.
- No backend server and no build requirement.
- Browser Local Storage is the only persistence layer.
- Exactly one CSS file in `css/` and one JavaScript file in `js/`.
- Modern Chrome, Firefox, Edge, and Safari; mobile-friendly layout.
- Publish source on GitHub and website on GitHub Pages.

## Implementation decisions

- UI language: Indonesian; required internal categories: Food, Transport, Fun.
- Currency: Indonesian rupiah, stored as integer hundredths to preserve decimals.
- Chart: accessible native SVG pie chart without a remote dependency.
- Optional challenges: sorting, spending limit highlight, light/dark mode.
- Render user names through textContent; never inject them as HTML.
- Do not store AWS Builder ID, credentials, or personal submission values in this public source tree.

Kiro reviewed this project in its IDE on 3 October 2026 using the project specifications as context, and applied three validation/accessibility improvements. See the review findings and actual changes in `.kiro/specs/expense-budget-visualizer/review.md`. Functional browser testing is recorded separately in `VERIFICATION.md`.

