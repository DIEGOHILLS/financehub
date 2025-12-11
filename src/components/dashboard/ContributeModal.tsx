import { useState } from 'react';
import { Sparkles, PartyPopper } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useFinanceStore, Goal } from '@/lib/store';
import { toast } from 'sonner';

interface ContributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

const formatCurrency = (amount: number) => {
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const milestoneMessages: Record<number, { title: string; message: string; emoji: string }> = {
  25: {
    title: 'Great Start! 🚀',
    message: "You've reached 25% of your goal! Keep up the momentum!",
    emoji: '🎯',
  },
  50: {
    title: 'Halfway There! 🌟',
    message: "Amazing! You're 50% of the way to your goal!",
    emoji: '⭐',
  },
  75: {
    title: 'Almost There! 💪',
    message: "Incredible! Just 25% more to reach your goal!",
    emoji: '🔥',
  },
  100: {
    title: 'Goal Achieved! 🎉',
    message: 'Congratulations! You did it! Time to celebrate!',
    emoji: '🏆',
  },
};

export function ContributeModal({ open, onOpenChange, goal }: ContributeModalProps) {
  const { contributeToGoal } = useFinanceStore();
  const [amount, setAmount] = useState('');

  if (!goal) return null;

  const currentPercentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contributionAmount = parseFloat(amount);
    
    if (contributionAmount <= 0) return;

    const newMilestones = contributeToGoal(goal.id, contributionAmount);

    // Celebrate new milestones
    newMilestones.forEach((milestone) => {
      const { title, message, emoji } = milestoneMessages[milestone];
      
      toast.success(title, {
        description: message,
        duration: 5000,
        icon: milestone === 100 ? <PartyPopper className="h-5 w-5 text-warning" /> : <Sparkles className="h-5 w-5 text-warning" />,
      });
    });

    if (newMilestones.length === 0) {
      toast.success('Contribution Added!', {
        description: `${formatCurrency(contributionAmount)} added to "${goal.name}"`,
      });
    }

    setAmount('');
    onOpenChange(false);
  };

  const presetAmounts = [500, 1000, 2500, 5000];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add Funds to Goal</DialogTitle>
          <DialogDescription>
            Contribute to "{goal.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="rounded-lg bg-muted/50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Progress</span>
            <span className="font-semibold">{currentPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={currentPercentage} className="mt-2 h-2" />
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
            <span className="text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {formatCurrency(remaining)} remaining to reach your goal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (R)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="100"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick amounts</Label>
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1"
                >
                  R{preset.toLocaleString()}
                </Button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(remaining.toString())}
              className="w-full mt-2"
            >
              Complete Goal ({formatCurrency(remaining)})
            </Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!amount || parseFloat(amount) <= 0}>
              Add Funds
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
