import { useState, useMemo } from 'react';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Plus, Edit2, Trash2, ArrowUpRight, ArrowDownRight, Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useFinanceStore, Transaction } from '@/lib/store';
import { TransactionModal } from './TransactionModal';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function TransactionsList() {
  const { transactions, budgets, deleteTransaction } = useFinanceStore();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = useMemo(() => {
    const expenseCategories = budgets.map((b) => b.category);
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Other'];
    return [...new Set([...expenseCategories, ...incomeCategories])];
  }, [budgets]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (dateRange.from && dateRange.to) {
          const transactionDate = parseISO(t.date);
          if (!isWithinInterval(transactionDate, { start: dateRange.from, end: dateRange.to })) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter, dateRange]);

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) });
  };

  const handleAddTransaction = (type: 'expense' | 'income') => {
    setTransactionType(type);
    setIsAddingTransaction(true);
  };

  return (
    <>
      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold">Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'border-primary text-primary')}
            >
              <Filter className="mr-1 h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddTransaction('income')}
              className="border-success text-success hover:bg-success hover:text-success-foreground"
            >
              <Plus className="mr-1 h-4 w-4" />
              Income
            </Button>
            <Button size="sm" onClick={() => handleAddTransaction('expense')}>
              <Plus className="mr-1 h-4 w-4" />
              Expense
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="border-b px-6 pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-[200px] justify-start">
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
                      : 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full',
                        transaction.type === 'income'
                          ? 'bg-success/10 text-success'
                          : 'bg-destructive/10 text-destructive'
                      )}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(transaction.date), 'MMM d, yyyy')}
                        </span>
                        {transaction.isRecurring && (
                          <Badge variant="outline" className="text-xs">
                            Recurring
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-lg font-semibold',
                        transaction.type === 'income' ? 'text-success' : 'text-destructive'
                      )}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingTransaction(transaction)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteTransaction(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No transactions found
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TransactionModal
        open={isAddingTransaction}
        onOpenChange={setIsAddingTransaction}
        mode="add"
        type={transactionType}
      />

      <TransactionModal
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
        mode="edit"
        transaction={editingTransaction}
      />
    </>
  );
}
