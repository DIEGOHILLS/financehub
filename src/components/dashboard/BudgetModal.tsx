import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinanceStore } from '@/lib/store';

interface BudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget?: { category: string; limit: number } | null;
  mode: 'edit' | 'add';
}

export function BudgetModal({ open, onOpenChange, budget, mode }: BudgetModalProps) {
  const { updateBudget, addBudget } = useFinanceStore();
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if (budget && mode === 'edit') {
      setCategory(budget.category);
      setLimit(budget.limit.toString());
    } else {
      setCategory('');
      setLimit('');
    }
  }, [budget, mode, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limitValue = parseFloat(limit);
    
    if (mode === 'edit' && budget) {
      updateBudget(budget.category, limitValue);
    } else if (mode === 'add' && category && limitValue > 0) {
      const colors = [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))',
        'hsl(var(--chart-6))',
      ];
      addBudget({
        category,
        limit: limitValue,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Budget Limit' : 'Add New Budget Category'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Groceries"
              disabled={mode === 'edit'}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="limit">Budget Limit (R)</Label>
            <Input
              id="limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder="0.00"
              min="0"
              step="100"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update' : 'Add'} Budget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
