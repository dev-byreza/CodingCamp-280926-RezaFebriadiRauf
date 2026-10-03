# Ruang Uang — Expense & Budget Visualizer

Mini project RevoU Coding Camp, batch **28 September 2026**. Author: **Reza Febriadi Rauf**.

## Development with Kiro

This project was developed with assistance from **Kiro IDE**. The Kiro session used the requirements, design, and task documents in `.kiro/` to review and refine the implementation against the project brief, applying these improvements:

- Allow an empty budget field to disable the spending limit.
- Focus and mark the amount field when the total exceeds the safe integer range.
- Validate stored timestamp types and lengths before parsing them.

The review findings and actual changes are documented in `.kiro/specs/expense-budget-visualizer/review.md`. Functional browser checks are recorded separately in `VERIFICATION.md`.

## Run the app

Open `index.html` in a modern browser, or use the published GitHub Pages URL after deployment. No package installation, build step, or backend is required. For predictable Local Storage behavior, use the hosted website; storage for `file://` pages can vary between browsers.

## Features

- Add transactions with item name, positive amount, and one of Food, Transport, or Fun.
- Reject blank names, missing categories, zero/negative/invalid amounts, and excessive precision.
- Scroll through transaction history and delete individual transactions.
- Automatically update total spending and a pie chart with category amounts and percentages.
- Persist transactions, budget, and theme using Local Storage. Synchronize updates between tabs on the same origin.
- Responsive layout, keyboard controls, accessible form labels, error messages, and a text alternative for the chart.

Three optional challenges implemented:

1. Sort transactions by amount or category.
2. Set a spending limit and highlight overspending.
3. Toggle light/dark mode.

The total balance is presented as **total spending**, because the brief provides expense inputs and no income input. Budget remaining is shown separately.

Demo transactions are added only by explicitly clicking **Lihat dengan data contoh** when the list is empty. Demo names are marked “Contoh”; they can be deleted individually.

## Structure

```text
index.html
css/style.css           # the only CSS file
js/script.js            # the only JavaScript file
.kiro/
  steering/project.md
  specs/expense-budget-visualizer/
    requirements.md
    design.md
    tasks.md
    review.md              # actual static review and fixes by Kiro
README.md
```

All financial data stays in the browser. No tracking, remote fonts, chart CDN, or external API calls are included. Builder ID is supplied separately in the submission form and must not be committed to the public repository.

## GitHub Pages

Repository name: `CodingCamp-280926-RezaFebriadiRauf`.

- Source: https://github.com/dev-byreza/CodingCamp-280926-RezaFebriadiRauf
- Website: https://dev-byreza.github.io/CodingCamp-280926-RezaFebriadiRauf/

Deployed from `main` and verified in the browser on 3 October 2026.

1. Push this directory to that GitHub repository.
2. Open repository **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select **main**, folder **/(root)**, and save.
5. Wait for deployment, open the resulting website, and check adding/deleting transactions.

## Submission checklist

- [x] Public GitHub repository URL.
- [x] Working GitHub Pages website URL.
- [x] Builder ID email and Kiro UserID supplied in the dedicated submission form.
- [x] `.kiro` directory included in the source.
- [x] Review/open the project in Kiro.
- [x] Submit all required values at the submission link in the course brief; Paperform showed "Submission Successful" on 3 October 2026.

The `.kiro` directory contains project requirements, design decisions, completed tasks, and the review performed in Kiro IDE. No Builder ID or authentication data is included in source control.

## Manual verification

1. With empty data, total is Rp0, the history shows the empty state, and the chart explains there is no data.
2. Submit an empty form, an amount of zero, and a missing category; none must add a transaction.
3. Add Food Rp35,000, Transport Rp20,000, and Fun Rp45,000. Expect Rp100,000 total and 35%, 20%, 45% distribution.
4. Set budget to Rp80,000. Expect an overspending highlight of Rp20,000.
5. Sort amounts ascending/descending, then by category. Verify order changes without changing totals.
6. Reload. Transactions, budget, and theme must remain.
7. Delete Food. Expect Rp65,000 and removal of its chart slice.
8. Delete remaining entries. Expect the empty state and Rp0 to return.
9. Try a name containing HTML markup. It must display literally and never execute.
10. Check 390px and 320px widths, keyboard navigation, and both themes.

