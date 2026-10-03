# Design

Static three-file app: HTML provides semantic structure, CSS provides responsive styling, and JavaScript owns state/events/rendering.

## State

Storage key: `ruanguang-v1`.

```text
version: 1
transactions: [{ id, name, amount, category, createdAt }]
budget: integer hundredths of rupiah, 0 means disabled
theme: light | dark
```

Validate loaded entries and unique IDs. Store only known categories. Accept amounts with at most two decimal places, a positive transaction amount, and an individual cap of Rp1 trillion. Prevent unsafe aggregate values on addition.

## Rendering

One render pass calculates category totals and total spending, updates the budget status, regenerates SVG pie sectors, updates the textual legend, and builds history rows. A copied array is sorted so presentation never changes the underlying creation order.

Dynamic user text is inserted with textContent. A single delegated delete listener handles history rows. Screen-reader chart description and live notices convey changes without relying only on color.

## Layout

Warm off-white background, green spending summary, separate white cards, readable typography. Two columns on desktop; a single column on mobile. Both light and dark themes use CSS variables. System fonts and native SVG avoid network dependencies.

## Failure handling

Malformed saved content triggers a notice and is not overwritten until the user explicitly changes app data. Failed writes retain the current in-memory state and show that persistence is unavailable. Same-origin storage events refresh other tabs.

