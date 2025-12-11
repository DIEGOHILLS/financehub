import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinanceStore } from '@/lib/store';
import { CalendarClock, Target, AlertCircle, TrendingUp, Banknote } from 'lucide-react';
import { differenceInDays, format, setDate, addMonths, isBefore } from 'date-fns';

export const UpcomingWidget = () => {
  const { recurringTransactions, goals } = useFinanceStore();
  const today = new Date();

  // Calculate upcoming bills (next 14 days)
  const upcomingBills = recurringTransactions
    .filter((t) => t.isActive && t.type === 'expense')
    .map((t) => {
      let nextDue = setDate(today, t.dayOfMonth);
      if (isBefore(nextDue, today)) {
        nextDue = addMonths(nextDue, 1);
      }
      const daysUntil = differenceInDays(nextDue, today);
      return { ...t, nextDue, daysUntil };
    })
    .filter((t) => t.daysUntil <= 14)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Calculate goal milestones approaching
  const goalMilestones = goals
    .map((goal) => {
      const progress = (goal.currentAmount / goal.targetAmount) * 100;
      const nextMilestone = [25, 50, 75, 100].find(
        (m) => !goal.milestonesReached.includes(m) && progress < m
      );
      const daysToDeadline = differenceInDays(new Date(goal.deadline), today);
      const amountToNextMilestone = nextMilestone
        ? (goal.targetAmount * nextMilestone) / 100 - goal.currentAmount
        : 0;
      const percentToNext = nextMilestone ? nextMilestone - progress : 0;

      return {
        ...goal,
        progress,
        nextMilestone,
        daysToDeadline,
        amountToNextMilestone,
        percentToNext,
      };
    })
    .filter((g) => g.nextMilestone && (g.percentToNext <= 15 || g.daysToDeadline <= 30))
    .sort((a, b) => a.percentToNext - b.percentToNext);

  const getDaysLabel = (days: number) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 2) return 'destructive';
    if (days <= 5) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <CalendarClock className="h-5 w-5 text-primary" />
          Upcoming
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Banknote className="h-4 w-4" />
              Bills Due Soon
            </h4>
            <div className="space-y-2">
              {upcomingBills.slice(0, 4).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{bill.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(bill.nextDue, 'MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive">
                      R {bill.amount.toLocaleString()}
                    </p>
                    <Badge variant={getUrgencyColor(bill.daysUntil)} className="mt-1 text-xs">
                      {getDaysLabel(bill.daysUntil)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goal Milestones Approaching */}
        {goalMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" />
              Milestones Approaching
            </h4>
            <div className="space-y-2">
              {goalMilestones.slice(0, 3).map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <TrendingUp className="h-4 w-4" style={{ color: goal.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{goal.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.progress.toFixed(0)}% → {goal.nextMilestone}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      R {goal.amountToNextMilestone.toLocaleString()}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {goal.daysToDeadline > 0 ? `${goal.daysToDeadline}d left` : 'Overdue'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {upcomingBills.length === 0 && goalMilestones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No upcoming items</p>
            <p className="text-xs text-muted-foreground/70">
              Add recurring bills or set goals to see them here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
