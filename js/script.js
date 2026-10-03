"use strict";

// Money is kept as integer hundredths of a rupiah to avoid floating-point drift.
const STORAGE_KEY = "ruanguang-v1";
const MAX_AMOUNT = 100000000000000;
const CATEGORIES = {
  Food: { label: "Makanan", color: "#28a17a", icon: "☕" },
  Transport: { label: "Transportasi", color: "#7b70c8", icon: "↗" },
  Fun: { label: "Hiburan", color: "#e8af48", icon: "✦" },
};
const money = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const dates = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const $ = (id) => document.getElementById(id);
const formatMoney = (value) => money.format(value / 100);
let transactions = [];
let budget = 0;
let theme = "light";

function parseAmount(value) {
  const trimmed = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(trimmed)) return null;
  const [whole, fraction = ""] = trimmed.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents <= MAX_AMOUNT ? cents : null;
}

function validTransaction(item) {
  return (
    item &&
    typeof item.id === "string" &&
    item.id.length <= 100 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    item.name.length <= 80 &&
    Number.isSafeInteger(item.amount) &&
    item.amount > 0 &&
    item.amount <= MAX_AMOUNT &&
    Object.hasOwn(CATEGORIES, item.category) &&
    typeof item.createdAt === "string" &&
    item.createdAt.length <= 40 &&
    Number.isFinite(Date.parse(item.createdAt))
  );
}

function notice(message, warning = false) {
  $("app-notice").textContent = message;
  $("app-notice").classList.toggle("warning", warning);
}

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const data = JSON.parse(saved);
    if (!data || data.version !== 1 || !Array.isArray(data.transactions))
      throw new Error("Invalid saved data");
    const unique = new Set();
    transactions = data.transactions.filter((item) => {
      if (!validTransaction(item) || unique.has(item.id)) return false;
      unique.add(item.id);
      return true;
    });
    budget =
      Number.isSafeInteger(data.budget) &&
      data.budget >= 0 &&
      data.budget <= MAX_AMOUNT
        ? data.budget
        : 0;
    theme = data.theme === "dark" ? "dark" : "light";
    if (transactions.length !== data.transactions.length)
      notice("Beberapa data tersimpan tidak valid dan dilewati.", true);
  } catch {
    notice(
      "Data browser tidak dapat dibaca. Anda bisa mulai mencatat kembali; data lama belum ditimpa.",
      true,
    );
  }
}

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, transactions, budget, theme }),
    );
    document.querySelector(".local-badge").lastChild.textContent =
      " Tersimpan di perangkat";
    return true;
  } catch {
    document.querySelector(".local-badge").lastChild.textContent =
      " Penyimpanan tidak tersedia";
    notice(
      "Penyimpanan browser tidak tersedia atau penuh. Perubahan hanya tersimpan selama halaman ini terbuka.",
      true,
    );
    return false;
  }
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  $("theme-toggle").setAttribute("aria-pressed", String(theme === "dark"));
  $("theme-toggle").setAttribute(
    "aria-label",
    theme === "dark" ? "Aktifkan mode terang" : "Aktifkan mode gelap",
  );
}

function categoryTotals() {
  const totals = { Food: 0, Transport: 0, Fun: 0 };
  for (const item of transactions) totals[item.category] += item.amount;
  return totals;
}

function renderChart(totals, total) {
  const svg = $("spending-chart");
  svg.replaceChildren();
  const svgElement = (tag, attributes) => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attributes))
      element.setAttribute(key, value);
    return element;
  };
  const title = svgElement("title", { id: "chart-description" });
  title.textContent = total
    ? Object.entries(totals)
        .map(
          ([key, value]) =>
            `${CATEGORIES[key].label}: ${formatMoney(value)}, ${((value / total) * 100).toFixed(1)} persen`,
        )
        .join(". ")
    : "Belum ada pengeluaran";
  svg.append(title);
  if (!total)
    svg.append(
      svgElement("circle", { class: "empty-chart", cx: 100, cy: 100, r: 88 }),
    );
  let angle = -Math.PI / 2;
  for (const [key, value] of Object.entries(totals)) {
    if (!value) continue;
    const portion = value / total;
    if (portion === 1) {
      svg.append(
        svgElement("circle", {
          cx: 100,
          cy: 100,
          r: 88,
          fill: CATEGORIES[key].color,
        }),
      );
    } else {
      const end = angle + portion * Math.PI * 2;
      const x1 = 100 + 88 * Math.cos(angle),
        y1 = 100 + 88 * Math.sin(angle);
      const x2 = 100 + 88 * Math.cos(end),
        y2 = 100 + 88 * Math.sin(end);
      svg.append(
        svgElement("path", {
          d: `M 100 100 L ${x1} ${y1} A 88 88 0 ${portion > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z`,
          fill: CATEGORIES[key].color,
        }),
      );
      angle = end;
    }
  }
  $("chart-empty").hidden = total > 0;
  $("chart-legend").replaceChildren();
  for (const [key, category] of Object.entries(CATEGORIES)) {
    const row = createElement("li");
    const label = createElement("span", "legend-label");
    const dot = createElement("span", "color-dot");
    dot.style.background = category.color;
    dot.setAttribute("aria-hidden", "true");
    label.append(dot, createElement("span", "", category.label));
    const values = createElement("span", "legend-values");
    values.append(
      createElement("strong", "", formatMoney(totals[key])),
      createElement(
        "span",
        "legend-percent",
        `${total ? ((totals[key] / total) * 100).toFixed(1) : "0"}%`,
      ),
    );
    row.append(label, values);
    $("chart-legend").append(row);
  }
}

function renderTransactions() {
  const sorted = [...transactions];
  const sort = $("sort-order").value;
  if (sort === "amount-desc") sorted.sort((a, b) => b.amount - a.amount);
  else if (sort === "amount-asc") sorted.sort((a, b) => a.amount - b.amount);
  else if (sort === "category")
    sorted.sort((a, b) => a.category.localeCompare(b.category));
  else sorted.reverse();
  const fragment = document.createDocumentFragment();
  for (const item of sorted) {
    const category = CATEGORIES[item.category];
    const row = createElement("li", "transaction-row");
    const heading = createElement("div", "transaction-title");
    const icon = createElement("span", "category-icon", category.icon);
    icon.setAttribute("aria-hidden", "true");
    const description = createElement("div");
    description.append(
      createElement("span", "transaction-name", item.name),
      createElement(
        "span",
        "transaction-date",
        `${dates.format(new Date(item.createdAt))} · ${category.label}`,
      ),
    );
    heading.append(icon, description);
    const pill = createElement("span", "category-pill");
    const dot = createElement("span", "color-dot");
    dot.style.background = category.color;
    dot.setAttribute("aria-hidden", "true");
    pill.append(dot, createElement("span", "", category.label));
    const remove = createElement("button", "delete-button", "×");
    remove.type = "button";
    remove.dataset.id = item.id;
    remove.setAttribute("aria-label", `Hapus ${item.name}`);
    row.append(
      heading,
      pill,
      createElement("span", "transaction-amount", formatMoney(item.amount)),
      remove,
    );
    fragment.append(row);
  }
  $("transaction-list").replaceChildren(fragment);
  $("empty-state").hidden = transactions.length > 0;
  document.querySelector(".table-heading").hidden = transactions.length === 0;
}

function renderBudget(total) {
  const over = budget > 0 && total > budget;
  document.querySelector(".budget-card").classList.toggle("over-budget", over);
  $("budget-progress").style.width = budget
    ? `${Math.min((total / budget) * 100, 100)}%`
    : "0%";
  $("budget-status").textContent = !budget
    ? "Belum diatur"
    : over
      ? "Melebihi batas"
      : total === budget
        ? "Batas tercapai"
        : "Dalam anggaran";
  $("budget-help").textContent = !budget
    ? "Atur batas untuk memantau semua pengeluaran. Isi 0 atau kosongkan untuk menonaktifkan."
    : over
      ? `Pengeluaran melebihi batas sebesar ${formatMoney(total - budget)}.`
      : `Sisa anggaran ${formatMoney(budget - total)} dari ${formatMoney(budget)}.`;
}

function render() {
  const totals = categoryTotals();
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  $("total-balance").textContent = formatMoney(total);
  $("transaction-count").textContent =
    `${transactions.length} transaksi tercatat`;
  renderBudget(total);
  renderChart(totals, total);
  renderTransactions();
}

$("transaction-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = $("item-name").value.trim();
  const amount = parseAmount($("amount").value);
  const category = $("category").value;
  let error = "";
  let invalid = null;
  if (!name) {
    error = "Isi nama transaksi terlebih dahulu.";
    invalid = $("item-name");
  } else if (!amount || amount < 1) {
    error =
      "Masukkan jumlah lebih dari 0, maksimal Rp1 triliun, dengan paling banyak 2 angka desimal.";
    invalid = $("amount");
  } else if (!Object.hasOwn(CATEGORIES, category)) {
    error = "Pilih kategori transaksi.";
    invalid = $("category");
  }
  $("form-error").textContent = error;
  for (const id of ["item-name", "amount", "category"])
    $(id).removeAttribute("aria-invalid");
  if (invalid) {
    invalid.setAttribute("aria-invalid", "true");
    invalid.focus();
    return;
  }
  const total = transactions.reduce((sum, item) => sum + item.amount, 0);
  if (!Number.isSafeInteger(total + amount)) {
    $("form-error").textContent =
      "Total terlalu besar untuk dihitung dengan aman.";
    $("amount").setAttribute("aria-invalid", "true");
    $("amount").focus();
    return;
  }
  transactions.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name,
    amount,
    category,
    createdAt: new Date().toISOString(),
  });
  const saved = saveData();
  render();
  event.target.reset();
  $("item-name").focus();
  if (saved) notice(`“${name}” ditambahkan dan disimpan.`);
});

$("transaction-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;
  const removed = transactions.find((item) => item.id === button.dataset.id);
  if (!removed) return;
  transactions = transactions.filter((item) => item.id !== removed.id);
  const saved = saveData();
  render();
  $("sort-order").focus();
  if (saved) notice(`“${removed.name}” dihapus. Total dan grafik diperbarui.`);
});

$("budget-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = $("budget-limit").value.trim();
  const value = raw === "" ? 0 : parseAmount(raw);
  if (value === null) {
    notice(
      "Masukkan batas anggaran yang valid. Isi 0 atau kosongkan untuk menonaktifkan.",
      true,
    );
    $("budget-limit").focus();
    return;
  }
  budget = value;
  const saved = saveData();
  render();
  if (saved)
    notice(
      budget
        ? "Batas pengeluaran disimpan."
        : "Batas pengeluaran dinonaktifkan.",
    );
});

$("theme-toggle").addEventListener("click", () => {
  theme = theme === "light" ? "dark" : "light";
  applyTheme();
  if (saveData())
    notice(
      theme === "dark" ? "Mode gelap diaktifkan." : "Mode terang diaktifkan.",
    );
});
$("sort-order").addEventListener("change", renderTransactions);
$("demo-button").addEventListener("click", () => {
  if (transactions.length) return;
  const now = new Date().toISOString();
  transactions = [
    {
      id: "demo-1",
      name: "Contoh · Makan siang",
      amount: 3500000,
      category: "Food",
      createdAt: now,
    },
    {
      id: "demo-2",
      name: "Contoh · Ojek online",
      amount: 2000000,
      category: "Transport",
      createdAt: now,
    },
    {
      id: "demo-3",
      name: "Contoh · Tiket bioskop",
      amount: 4500000,
      category: "Fun",
      createdAt: now,
    },
  ];
  const saved = saveData();
  render();
  if (saved)
    notice(
      "3 transaksi contoh ditambahkan, bukan data pengeluaran nyata. Hapus masing-masing dengan tombol ×.",
    );
});

window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  transactions = [];
  budget = 0;
  theme = "light";
  loadData();
  applyTheme();
  $("budget-limit").value = budget ? budget / 100 : "";
  render();
  notice("Data diperbarui dari tab lain.");
});

loadData();
applyTheme();
$("budget-limit").value = budget ? budget / 100 : "";
render();
