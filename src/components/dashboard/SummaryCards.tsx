import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useFinanceStore } from '@/lib/store';

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export function SummaryCards() {
  const { transactions } = useFinanceStore();

  const summary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    return { totalIncome, totalExpenses, netSavings, savingsRate };
  }, [transactions]);

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      icon: TrendingUp,
      trend: '+12.5%',
      trendUp: true,
      bgClass: 'bg-success/10',
      iconClass: 'text-success',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      icon: TrendingDown,
      trend: '-3.2%',
      trendUp: false,
      bgClass: 'bg-destructive/10',
      iconClass: 'text-destructive',
    },
    {
      title: 'Net Savings',
      value: formatCurrency(summary.netSavings),
      icon: PiggyBank,
      trend: `${summary.savingsRate.toFixed(1)}%`,
      trendUp: summary.netSavings > 0,
      bgClass: 'bg-primary/10',
      iconClass: 'text-primary',
    },
    {
      title: 'Balance',
      value: formatCurrency(summary.netSavings),
      icon: Wallet,
      trend: 'This month',
      trendUp: true,
      bgClass: 'bg-accent/10',
      iconClass: 'text-accent',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="overflow-hidden border-none shadow-sm transition-all duration-300 hover:shadow-md animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs font-medium ${
                      card.trendUp ? 'text-success' : 'text-destructive'
                    }`}
                  >
                    {card.trend}
                  </span>
                  <span className="text-xs text-muted-foreground">vs last month</span>
                </div>
              </div>
              <div className={`rounded-xl p-3 ${card.bgClass}`}>
                <card.icon className={`h-5 w-5 ${card.iconClass}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
