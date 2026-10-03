# Requirements

Source: RevoU brief, “Brief_SEFC_Expense & Budget Visualizer”.

1. When the user submits a valid item name, positive amount, and category, append the transaction, clear the form, and refresh summaries.
2. When required fields are blank or invalid, show an actionable error and focus the invalid field without changing the list.
3. Show every transaction's name, amount, and category in a scrollable history.
4. When the user deletes an item, remove it from storage, history, total, and chart.
5. Display total spending prominently and calculate it automatically from all transactions.
6. Render a pie chart by Food, Transport, and Fun, with textual amounts and percentages.
7. Persist all app data in Local Storage and restore it after reopening.
8. Sort by amount ascending/descending or category; default to newest first.
9. Allow an optional budget limit; visibly warn when total spending exceeds it.
10. Toggle and persist light/dark mode.
11. At narrow widths, stack panels without page-level horizontal overflow.
12. Handle malformed stored data and blocked/quota-exceeded storage without stopping app interactions.

