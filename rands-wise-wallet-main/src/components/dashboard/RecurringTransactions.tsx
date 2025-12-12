import { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useFinanceStore, RecurringTransaction } from '@/lib/store';
import { RecurringModal } from './RecurringModal';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function RecurringTransactions() {
  const { recurringTransactions, updateRecurringTransaction, deleteRecurringTransaction } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive });
  };

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <RefreshCw className="h-5 w-5 text-primary" />
            Recurring
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 gap-1 text-primary hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recurringTransactions.length > 0 ? (
            recurringTransactions.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-center justify-between rounded-lg border p-3 transition-all',
                  item.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={(checked) => toggleActive(item.id, checked)}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.description}</span>
                      <Badge variant={item.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                        {item.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Day {item.dayOfMonth} of each month
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'font-semibold',
                      item.type === 'income' ? 'text-success' : 'text-foreground'
                    )}
                  >
                    {formatCurrency(item.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditing(item)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteRecurringTransaction(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex h-24 items-center justify-center text-sm text-muted-foreground">
              No recurring transactions. Add monthly bills or income here.
            </div>
          )}
        </CardContent>
      </Card>

      <RecurringModal
        open={isAdding}
        onOpenChange={setIsAdding}
        mode="add"
      />

      <RecurringModal
        open={!!editing}
        onOpenChange={() => setEditing(null)}
        mode="edit"
        transaction={editing}
      />
    </>
  );
}
