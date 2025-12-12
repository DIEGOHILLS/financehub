import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFinanceStore } from '@/lib/store';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns';

export const AnalyticsSection = () => {
  const { transactions, budgets } = useFinanceStore();

  // Calculate monthly spending data for the last 6 months
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthExpenses = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const monthIncome = transactions
        .filter(
          (t) =>
            t.type === 'income' &&
            isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
        )
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: format(monthDate, 'MMM'),
        expenses: monthExpenses,
        income: monthIncome,
        savings: monthIncome - monthExpenses,
      });
    }
    return months;
  }, [transactions]);

  // Calculate category spending
  const categorySpending = useMemo(() => {
    const currentMonth = new Date();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const spending: Record<string, number> = {};

    transactions
      .filter(
        (t) =>
          t.type === 'expense' &&
          isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
      )
      .forEach((t) => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });

    return budgets.map((budget) => ({
      category: budget.category,
      spent: spending[budget.category] || 0,
      limit: budget.limit,
      percentage: ((spending[budget.category] || 0) / budget.limit) * 100,
      color: budget.color,
    }));
  }, [transactions, budgets]);

  // Calculate insights
  const insights = useMemo(() => {
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const expenseChange = previousMonth?.expenses
      ? ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : 0;

    const savingsRate = currentMonth.income > 0
      ? (currentMonth.savings / currentMonth.income) * 100
      : 0;

    const overBudgetCategories = categorySpending.filter((c) => c.percentage > 100);
    const nearBudgetCategories = categorySpending.filter(
      (c) => c.percentage >= 80 && c.percentage <= 100
    );

    const topSpendingCategory = [...categorySpending].sort((a, b) => b.spent - a.spent)[0];

    return {
      expenseChange,
      savingsRate,
      overBudgetCategories,
      nearBudgetCategories,
      topSpendingCategory,
      currentExpenses: currentMonth.expenses,
      currentIncome: currentMonth.income,
      currentSavings: currentMonth.savings,
    };
  }, [monthlyData, categorySpending]);

  // Generate recommendations
  const recommendations = useMemo(() => {
    const recs: { type: 'warning' | 'success' | 'tip'; message: string }[] = [];

    if (insights.overBudgetCategories.length > 0) {
      insights.overBudgetCategories.forEach((cat) => {
        recs.push({
          type: 'warning',
          message: `${cat.category} is ${(cat.percentage - 100).toFixed(0)}% over budget. Consider reducing spending.`,
        });
      });
    }

    if (insights.savingsRate < 20 && insights.currentIncome > 0) {
      recs.push({
        type: 'tip',
        message: `Your savings rate is ${insights.savingsRate.toFixed(0)}%. Try to save at least 20% of your income.`,
      });
    } else if (insights.savingsRate >= 20) {
      recs.push({
        type: 'success',
        message: `Great job! You're saving ${insights.savingsRate.toFixed(0)}% of your income this month.`,
      });
    }

    if (insights.expenseChange > 20) {
      recs.push({
        type: 'warning',
        message: `Spending increased ${insights.expenseChange.toFixed(0)}% compared to last month.`,
      });
    } else if (insights.expenseChange < -10) {
      recs.push({
        type: 'success',
        message: `Excellent! You reduced spending by ${Math.abs(insights.expenseChange).toFixed(0)}% this month.`,
      });
    }

    if (insights.nearBudgetCategories.length > 0) {
      recs.push({
        type: 'tip',
        message: `${insights.nearBudgetCategories.map((c) => c.category).join(', ')} approaching budget limit.`,
      });
    }

    return recs;
  }, [insights]);

  const chartColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Monthly Expenses</p>
              <div
                className={`flex items-center gap-1 text-xs ${
                  insights.expenseChange > 0 ? 'text-destructive' : 'text-chart-2'
                }`}
              >
                {insights.expenseChange > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(insights.expenseChange).toFixed(0)}%
              </div>
            </div>
            <p className="mt-1 text-2xl font-bold">R {insights.currentExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </div>
            <p className="mt-1 text-2xl font-bold text-chart-2">
              R {insights.currentIncome.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Net Savings</p>
              {insights.currentSavings >= 0 ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p
              className={`mt-1 text-2xl font-bold ${
                insights.currentSavings >= 0 ? 'text-primary' : 'text-destructive'
              }`}
            >
              R {Math.abs(insights.currentSavings).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Savings Rate</p>
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold">{insights.savingsRate.toFixed(0)}%</p>
            <Progress value={Math.min(insights.savingsRate, 100)} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending Trends */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <BarChart3 className="h-5 w-5 text-primary" />
              Spending Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`R ${value.toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--chart-2))"
                    fill="url(#incomeGradient)"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    fill="url(#expenseGradient)"
                    strokeWidth={2}
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-xs text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <PieChart className="h-5 w-5 text-primary" />
              Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySpending} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="category" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`R ${value.toLocaleString()}`, '']}
                  />
                  <Bar dataKey="limit" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Budget" />
                  <Bar dataKey="spent" radius={[0, 4, 4, 0]} name="Spent">
                    {categorySpending.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percentage > 100 ? 'hsl(var(--destructive))' : entry.color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights & Recommendations */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="h-5 w-5 text-primary" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  rec.type === 'warning'
                    ? 'border-destructive/30 bg-destructive/5'
                    : rec.type === 'success'
                    ? 'border-chart-2/30 bg-chart-2/5'
                    : 'border-primary/30 bg-primary/5'
                }`}
              >
                {rec.type === 'warning' ? (
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
                ) : rec.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 shrink-0 text-chart-2" />
                ) : (
                  <Lightbulb className="h-5 w-5 shrink-0 text-primary" />
                )}
                <p className="text-sm">{rec.message}</p>
              </div>
            ))}
            {recommendations.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-10 w-10 text-chart-2" />
                <p className="mt-2 text-sm font-medium">You're doing great!</p>
                <p className="text-xs text-muted-foreground">
                  Keep up the good financial habits.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Spending Category */}
      {insights.topSpendingCategory && insights.topSpendingCategory.spent > 0 && (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Highest Spending Category</p>
                <p className="text-lg font-semibold">{insights.topSpendingCategory.category}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  R {insights.topSpendingCategory.spent.toLocaleString()}
                </p>
                <Badge
                  variant={insights.topSpendingCategory.percentage > 100 ? 'destructive' : 'secondary'}
                >
                  {insights.topSpendingCategory.percentage.toFixed(0)}% of budget
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
