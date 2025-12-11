import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFinanceStore, RecurringTransaction } from '@/lib/store';

interface RecurringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  transaction?: RecurringTransaction | null;
}

const expenseCategories = [
  'Rent',
  'Insurance',
  'Subscriptions',
  'Utilities',
  'Loan Payment',
  'Other',
];

const incomeCategories = ['Salary', 'Rental Income', 'Investment Dividend', 'Side Income', 'Other'];

export function RecurringModal({ open, onOpenChange, mode, transaction }: RecurringModalProps) {
  const { addRecurringTransaction, updateRecurringTransaction, budgets } = useFinanceStore();

  const [formData, setFormData] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    category: '',
    description: '',
    dayOfMonth: '1',
    isActive: true,
  });

  useEffect(() => {
    if (mode === 'edit' && transaction) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description,
        dayOfMonth: transaction.dayOfMonth.toString(),
        isActive: transaction.isActive,
      });
    } else if (mode === 'add') {
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        dayOfMonth: '1',
        isActive: true,
      });
    }
  }, [mode, transaction, open]);

  const categories = formData.type === 'expense'
    ? [...new Set([...budgets.map(b => b.category), ...expenseCategories])]
    : incomeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      dayOfMonth: parseInt(formData.dayOfMonth),
      isActive: formData.isActive,
    };

    if (mode === 'edit' && transaction) {
      updateRecurringTransaction(transaction.id, data);
    } else {
      addRecurringTransaction(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(v) => setFormData({ ...formData, type: v as 'expense' | 'income', category: '' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (R)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Monthly rent"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dayOfMonth">Day of Month</Label>
            <Select
              value={formData.dayOfMonth}
              onValueChange={(v) => setFormData({ ...formData, dayOfMonth: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update' : 'Add'} Recurring
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
