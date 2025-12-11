import { useState, useMemo } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceStore } from '@/lib/store';
import { BudgetModal } from './BudgetModal';

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

export function BudgetOverview() {
  const { budgets, transactions, deleteBudget } = useFinanceStore();
  const [editingBudget, setEditingBudget] = useState<{ category: string; limit: number } | null>(null);
  const [isAddingBudget, setIsAddingBudget] = useState(false);

  const budgetSpending = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        t.type === 'expense' &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    });

    return budgets.map((budget) => {
      const spent = monthlyExpenses
        .filter((t) => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);

      const percentage = (spent / budget.limit) * 100;

      return {
        ...budget,
        spent,
        percentage: Math.min(percentage, 100),
        isOverBudget: percentage > 100,
      };
    });
  }, [budgets, transactions]);

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold">Budget Overview</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAddingBudget(true)}
            className="h-8 gap-1 text-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetSpending.map((budget) => (
            <div key={budget.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: budget.color }}
                  />
                  <span className="font-medium">{budget.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={budget.isOverBudget ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingBudget({ category: budget.category, limit: budget.limit })}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    onClick={() => deleteBudget(budget.category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <Progress
                value={budget.percentage}
                className={`h-2 ${budget.isOverBudget ? '[&>div]:bg-destructive' : ''}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <BudgetModal
        open={!!editingBudget}
        onOpenChange={() => setEditingBudget(null)}
        budget={editingBudget}
        mode="edit"
      />

      <BudgetModal
        open={isAddingBudget}
        onOpenChange={() => setIsAddingBudget(false)}
        mode="add"
      />
    </>
  );
}
