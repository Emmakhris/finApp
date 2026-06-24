# FinApp — Project Reference

## Overview
A personal finance + small business management web app built for a single user with multiple income sources. Runs entirely in the browser with no backend server. All data is stored locally using IndexedDB.

**Live dev server:** `npm run dev` → http://localhost:5173  
**Owner:** kwamebronya@gmail.com  
**Currency:** GHS (Ghanaian Cedi)  
**Business type:** Mixed — goods + services

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | React + Vite + TypeScript | React 19, Vite 8 |
| Routing | React Router v7 | — |
| Local storage | Dexie.js (IndexedDB) | v4 |
| Styling | Tailwind CSS | v3 |
| Charts | Recharts | v3 |
| PDF export | jsPDF + jspdf-autotable | — |
| Excel export | xlsx (SheetJS) | v0.18 |
| Forms | React Hook Form | v7 |
| Date handling | date-fns | v4 |
| Icons | Lucide React | — |

---

## Project Structure

```
FinApp/
├── index.html
├── vite.config.ts              # PORT env var support for preview tool
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .claude/
│   └── launch.json             # Preview server config (autoPort: true)
├── src/
│   ├── main.tsx                # Entry — seeds DB then mounts React
│   ├── App.tsx                 # Router root, all routes defined here
│   ├── index.css               # Tailwind directives
│   │
│   ├── types/index.ts          # ALL TypeScript interfaces (single source of truth)
│   │
│   ├── db/
│   │   ├── db.ts               # Dexie database class — all 7 tables defined here
│   │   └── seeds.ts            # 28 default categories, seeded once on first load
│   │
│   ├── context/
│   │   └── AppContext.tsx      # Global UI state: accountFilter, selectedMonth, openModal
│   │
│   ├── hooks/
│   │   ├── useTransactions.ts  # useTransactions(filters), useCategories()
│   │   ├── useReceivables.ts   # useReceivables(), useReceivable(id), usePaymentsFor()
│   │   ├── usePayables.ts      # usePayables(), usePayable(id)
│   │   ├── useLoans.ts         # useLoans(), useLoan(id), useLoanRepayments(loanId)
│   │   └── useDashboardSummary.ts  # useDashboardSummary(), useMonthlyChartData()
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx       # 6 summary cards + chart + recent + overdue alerts
│   │   ├── Transactions.tsx    # Table with search/filter + add/edit/delete
│   │   ├── Receivables.tsx     # Expandable list + payment history drawer
│   │   ├── Payables.tsx        # Same pattern as Receivables
│   │   ├── Loans.tsx           # Status tabs (All/Active/Overdue/Repaid) + repayment tracking
│   │   ├── Reports.tsx         # Monthly P&L + cash flow chart + outstanding receivables
│   │   └── Settings.tsx        # Category manager + JSON backup/restore
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx    # Sidebar + TopBar + MobileNav wrapper (Outlet)
│   │   │   ├── Sidebar.tsx     # Desktop nav — dark slate-900, shows overdue badge counts
│   │   │   ├── TopBar.tsx      # Page title + All/Personal/Business filter toggle
│   │   │   └── MobileNav.tsx   # Bottom nav bar (hidden on lg+)
│   │   │
│   │   ├── dashboard/
│   │   │   ├── SummaryCard.tsx         # Reusable card: label, value, icon, variant
│   │   │   ├── CashFlowChart.tsx       # Recharts LineChart — last 6 months income vs expenses
│   │   │   ├── RecentTransactions.tsx  # Last 8 transactions widget
│   │   │   └── OverdueAlerts.tsx       # Amber banner linking to overdue items
│   │   │
│   │   ├── transactions/
│   │   │   ├── TransactionForm.tsx     # Income/Expense toggle form (React Hook Form)
│   │   │   └── TransactionTable.tsx    # Sortable table with inline edit/delete
│   │   │
│   │   ├── receivables/
│   │   │   ├── ReceivableForm.tsx
│   │   │   └── ReceivableList.tsx      # Expandable rows with PaymentHistoryDrawer
│   │   │
│   │   ├── payables/
│   │   │   ├── PayableForm.tsx
│   │   │   └── PayableList.tsx
│   │   │
│   │   ├── shared/
│   │   │   └── PaymentHistoryDrawer.tsx  # Shared by Receivables + Payables
│   │   │
│   │   ├── loans/
│   │   │   ├── LoanForm.tsx            # isDrawing toggle for self-loans
│   │   │   ├── RepaymentForm.tsx       # Records repayment + updates loan totalRepaid + status
│   │   │   └── LoanList.tsx            # Expandable rows with RepaymentHistory inline
│   │   │
│   │   └── ui/                         # Shared primitives
│   │       ├── Button.tsx              # Variants: primary, secondary, danger, ghost
│   │       ├── Input.tsx               # With label, error, prefix support
│   │       ├── Select.tsx
│   │       ├── Modal.tsx               # Backdrop + Escape key close
│   │       ├── Badge.tsx               # Color variants: green, red, yellow, blue, gray, indigo
│   │       ├── EmptyState.tsx          # Icon + title + description + optional action
│   │       └── ConfirmDialog.tsx       # Delete confirmation modal
│   │
│   └── utils/
│       ├── currency.ts         # formatGHS(), toStorageAmount(), fromStorageAmount()
│       ├── dateHelpers.ts      # formatDate(), isOverdue(), isInMonth(), todayISO()
│       ├── exportPDF.ts        # jsPDF exports for Transactions, Receivables, Payables, Loans
│       └── exportExcel.ts      # SheetJS exports for same 4 entities
```

---

## Data Models (src/types/index.ts)

All monetary amounts are stored as **integers in pesewas** (1 GHS = 100 pesewas) to avoid floating-point errors. Display always divides by 100 via `formatGHS()`.

```typescript
Transaction    { id, date, type, amount, description, categoryId, accountType, source?, receivableId?, payableId?, createdAt, updatedAt }
Receivable     { id, contactName, description, originalAmount, amountPaid, dueDate, status, accountType, notes?, createdAt, updatedAt }
Payable        { id, creditorName, description, originalAmount, amountPaid, dueDate, status, accountType, notes?, createdAt, updatedAt }
Payment        { id, parentType ('receivable'|'payable'), parentId, amount, date, notes?, createdAt }
Loan           { id, borrowerName, isDrawing, principalAmount, interestRate, startDate, expectedRepaymentDate, repaymentSchedule, status, totalRepaid, notes?, createdAt, updatedAt }
LoanRepayment  { id, loanId, amount, date, notes?, createdAt }
Category       { id, name, type, accountType, color, isCustom }
```

### Status Derivation Rules (never stored, always computed)

**Receivable/Payable status:**
- `amountPaid === 0` → `unpaid`
- `0 < amountPaid < originalAmount` → `partial`
- `amountPaid >= originalAmount` → `paid`

**Loan status** (evaluated when repayment recorded):
- `totalRepaid >= principalAmount` → `repaid`
- `today > expectedRepaymentDate && totalRepaid < principalAmount` → `overdue`
- else → `active`

---

## Database (src/db/db.ts)

Dexie DB named `FinAppDB`, version 1. Tables and indexes:

```
categories:     ++id, type, accountType
transactions:   ++id, date, type, accountType, categoryId
receivables:    ++id, dueDate, status, accountType
payables:       ++id, dueDate, status, accountType
payments:       ++id, parentType, parentId, date
loans:          ++id, status, startDate, expectedRepaymentDate, isDrawing
loanRepayments: ++id, loanId, date
```

**To add a new table:** increment the version number in `db.ts` and add the new `.stores()` definition alongside all existing ones.

---

## Routes

```
/              → Dashboard
/transactions  → Transactions
/receivables   → Receivables
/payables      → Payables
/loans         → Loans
/reports       → Reports
/settings      → Settings
```

---

## Design System

- **Background:** `slate-50`
- **Cards:** `white` with `border border-slate-200 shadow-sm` and `rounded-xl`
- **Sidebar:** `slate-900` background, `white` text, `indigo-600` active link
- **Primary action:** `indigo-600` / `indigo-700` hover
- **Income:** `emerald-600`
- **Expense:** `rose-600`
- **Warning/Overdue:** `amber-500`
- **Font:** system sans-serif (`-apple-system, BlinkMacSystemFont, Segoe UI, Roboto`)
- **Base font size:** `text-sm` (14px)
- **Mobile breakpoint:** `lg` (1024px) — sidebar hidden below, bottom nav shown

---

## Income Sources Tracked
- Salary / Employment
- Rental Income
- Investment Returns
- Business Sales Revenue
- Service Revenue
- Contract Payments
- Custom / Other

---

## Default Categories (28 total, seeded in src/db/seeds.ts)

**Personal income (5):** Salary, Rental Income, Investment Returns, Gift, Other Personal Income  
**Business income (4):** Sales Revenue, Service Revenue, Contract Payment, Other Business Income  
**Personal expenses (9):** Food & Dining, Transport, Utilities, Rent/Housing, Healthcare, Education, Entertainment, Clothing, Other Personal Expense  
**Business expenses (10):** Cost of Goods Sold, Staff Salaries, Business Rent, Business Utilities, Marketing, Equipment, Professional Fees, Travel & Transport, Other Business Expense  

Custom categories can be added/deleted in Settings. Built-in categories cannot be deleted.

---

## Key Utilities

**`src/utils/currency.ts`**
- `formatGHS(pesewas: number) → string` — formats as "GHS 1,234.56"
- `toStorageAmount(value: string|number) → number` — converts GHS → pesewas (×100, rounded)
- `fromStorageAmount(pesewas: number) → string` — converts pesewas → GHS string for form inputs

**`src/utils/dateHelpers.ts`**
- `formatDate(date) → string` — "24 Jun 2026"
- `todayISO() → string` — "2026-06-24" (for date input default values)
- `isOverdue(date) → boolean`

---

## State Management Pattern

**Data layer:** `useLiveQuery()` from `dexie-react-hooks` — auto-rerenders on IndexedDB changes. All hooks are in `src/hooks/`.

**UI layer:** `AppContext` (src/context/AppContext.tsx) holds:
- `accountFilter: 'all' | 'personal' | 'business'` — shown in TopBar, filters all pages
- `selectedMonth: Date` — used by Dashboard for P&L period
- `openModal: string | null`

**Mutations:** called directly on `db.*` from form submit handlers — no action creators needed.

---

## Export / Backup

- **PDF:** jsPDF + jspdf-autotable. Functions in `src/utils/exportPDF.ts`. Each entity has its own export function.
- **Excel:** SheetJS `json_to_sheet` + `writeFile`. Functions in `src/utils/exportExcel.ts`.
- **Full DB backup:** Settings page → Export Backup → downloads a `.json` file with all 7 tables. Restore Backup imports and merges using `bulkPut`.

---

## Running the App

```bash
cd "C:\Users\kwame\Desktop\FOLDERS\PROJECTS\Claude\FinApp"
npm run dev
# Opens at http://localhost:5173
```

---

## Known Patterns & Conventions

1. **Form fields use `React Hook Form`'s `register()`** — do NOT set values via plain DOM manipulation; use `reset()` or `setValue()` from `useForm`.
2. **All list pages follow the same pattern:** header with total + export buttons, filter tabs (where applicable), card wrapper with list component or EmptyState.
3. **Expandable rows** (Receivables, Payables, Loans) use a local `expanded: number | null` state — clicking a row toggles its detail drawer inline.
4. **PaymentHistoryDrawer** is shared between Receivables and Payables via `parentType` prop.
5. **Loan self-drawings** are flagged with `isDrawing: true` and shown as "Self Drawing" in the UI.
6. **Overdue badges** in the Sidebar are computed live via `useLiveQuery` in `Sidebar.tsx`.

---

## Future Enhancement Ideas (not yet built)
- Multi-currency support (USD, GBP alongside GHS)
- Recurring transaction templates
- Budget limits per category with alerts
- Loan interest calculation (total interest owed)
- Invoice generation from receivables (PDF)
- Dark mode
- PWA (installable, offline-first)
