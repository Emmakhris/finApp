import { useState } from 'react';
import { Plus, Trash2, Download, Upload } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Category } from '../types';

function CategoryManager() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? [];
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [accountType, setAccountType] = useState<'personal' | 'business' | 'both'>('personal');
  const [color, setColor] = useState('#6366f1');
  const [deleting, setDeleting] = useState<number | null>(null);

  async function addCategory() {
    if (!name.trim()) return;
    await db.categories.add({ name: name.trim(), type, accountType, color, isCustom: true });
    setName('');
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Manage Categories</h2>

      <div className="flex gap-2 flex-wrap mb-5">
        <div className="flex-1 min-w-36">
          <Input placeholder="Category name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <Select options={[{ value: 'income', label: 'Income' }, { value: 'expense', label: 'Expense' }]} value={type} onChange={e => setType(e.target.value as 'income' | 'expense')} className="w-28" />
        <Select options={[{ value: 'personal', label: 'Personal' }, { value: 'business', label: 'Business' }, { value: 'both', label: 'Both' }]} value={accountType} onChange={e => setAccountType(e.target.value as Category['accountType'])} className="w-28" />
        <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-9 rounded border border-slate-300 cursor-pointer" />
        <Button onClick={addCategory} size="sm"><Plus size={14} /> Add</Button>
      </div>

      <div className="divide-y divide-slate-100">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-3 py-2.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
            <span className="flex-1 text-sm text-slate-900">{c.name}</span>
            <span className="text-xs text-slate-400 capitalize">{c.type} · {c.accountType}</span>
            {c.isCustom && (
              <button onClick={() => setDeleting(c.id!)} className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={deleting != null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => { await db.categories.delete(deleting!); setDeleting(null); }}
        title="Delete Category"
        message="Delete this category? Existing transactions using it will still reference its ID."
      />
    </div>
  );
}

function DataBackup() {
  async function exportAll() {
    const data = {
      transactions: await db.transactions.toArray(),
      receivables: await db.receivables.toArray(),
      payables: await db.payables.toArray(),
      payments: await db.payments.toArray(),
      loans: await db.loans.toArray(),
      loanRepayments: await db.loanRepayments.toArray(),
      categories: await db.categories.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finapp-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importAll(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.categories) await db.categories.bulkPut(data.categories);
      if (data.transactions) await db.transactions.bulkPut(data.transactions.map((t: any) => ({ ...t, date: new Date(t.date), createdAt: new Date(t.createdAt), updatedAt: new Date(t.updatedAt) })));
      if (data.receivables) await db.receivables.bulkPut(data.receivables.map((r: any) => ({ ...r, dueDate: new Date(r.dueDate), createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt) })));
      if (data.payables) await db.payables.bulkPut(data.payables.map((p: any) => ({ ...p, dueDate: new Date(p.dueDate), createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) })));
      if (data.payments) await db.payments.bulkPut(data.payments.map((p: any) => ({ ...p, date: new Date(p.date), createdAt: new Date(p.createdAt) })));
      if (data.loans) await db.loans.bulkPut(data.loans.map((l: any) => ({ ...l, startDate: new Date(l.startDate), expectedRepaymentDate: new Date(l.expectedRepaymentDate), createdAt: new Date(l.createdAt), updatedAt: new Date(l.updatedAt) })));
      if (data.loanRepayments) await db.loanRepayments.bulkPut(data.loanRepayments.map((r: any) => ({ ...r, date: new Date(r.date), createdAt: new Date(r.createdAt) })));
      alert('Data restored successfully!');
    } catch {
      alert('Invalid backup file.');
    }
    e.target.value = '';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-900 mb-2">Data Backup & Restore</h2>
      <p className="text-xs text-slate-500 mb-4">All data is stored locally in your browser. Export a backup regularly to avoid data loss.</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={exportAll}><Download size={14} /> Export Backup</Button>
        <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors">
          <Upload size={14} /> Restore Backup
          <input type="file" accept=".json" onChange={importAll} className="sr-only" />
        </label>
      </div>
    </div>
  );
}

export function Settings() {
  return (
    <div className="space-y-5">
      <DataBackup />
      <CategoryManager />
    </div>
  );
}
