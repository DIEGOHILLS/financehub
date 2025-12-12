import { useState } from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Plus, Edit2, Trash2, Target, TrendingUp, Sparkles, Shield, Car, Plane, Home, GraduationCap, Gift, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFinanceStore, Goal } from '@/lib/store';
import { GoalModal } from './GoalModal';
import { ContributeModal } from './ContributeModal';
import { cn } from '@/lib/utils';

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const iconMap: Record<string, React.ReactNode> = {
  shield: <Shield className="h-5 w-5" />,
  car: <Car className="h-5 w-5" />,
  plane: <Plane className="h-5 w-5" />,
  home: <Home className="h-5 w-5" />,
  graduation: <GraduationCap className="h-5 w-5" />,
  gift: <Gift className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
};

export function GoalsSection() {
  const { goals, deleteGoal } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Savings Progress</p>
                <p className="mt-1 text-3xl font-bold">{formatCurrency(totalSaved)}</p>
                <p className="text-sm text-muted-foreground">
                  of {formatCurrency(totalTarget)} goal
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
                <Target className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall progress</span>
                <span className="font-medium">{overallProgress.toFixed(1)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Goals Grid */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-warning" />
              Savings Goals
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </CardHeader>
          <CardContent>
            {goals.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                  const daysLeft = differenceInDays(parseISO(goal.deadline), new Date());
                  const isComplete = percentage >= 100;

                  return (
                    <div
                      key={goal.id}
                      className={cn(
                        'group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md',
                        isComplete && 'border-success/50 bg-success/5'
                      )}
                    >
                      {/* Milestone badges */}
                      {goal.milestonesReached.length > 0 && (
                        <div className="absolute right-2 top-2 flex gap-1">
                          {goal.milestonesReached.map((milestone) => (
                            <span
                              key={milestone}
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-[10px] font-bold text-warning"
                            >
                              {milestone === 100 ? '🎉' : `${milestone}`}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                        >
                          {iconMap[goal.icon] || <Target className="h-5 w-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{goal.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} days left` : isComplete ? 'Completed!' : 'Overdue'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                          <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <Progress
                          value={Math.min(percentage, 100)}
                          className={cn('h-2', isComplete && '[&>div]:bg-success')}
                        />
                        <p className="mt-1 text-right text-xs font-medium" style={{ color: goal.color }}>
                          {percentage.toFixed(1)}%
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setContributing(goal)}
                          disabled={isComplete}
                        >
                          <TrendingUp className="mr-1 h-3 w-3" />
                          Add Funds
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditing(goal)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Target className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No goals yet</p>
                <p className="text-xs text-muted-foreground">Create your first savings goal to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <GoalModal
        open={isAdding}
        onOpenChange={setIsAdding}
        mode="add"
      />

      <GoalModal
        open={!!editing}
        onOpenChange={() => setEditing(null)}
        mode="edit"
        goal={editing}
      />

      <ContributeModal
        open={!!contributing}
        onOpenChange={() => setContributing(null)}
        goal={contributing}
      />
    </>
  );
}
