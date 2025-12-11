import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Shield, Car, Plane, Home, GraduationCap, Gift, Briefcase, Target } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useFinanceStore, Goal } from '@/lib/store';
import { cn } from '@/lib/utils';

interface GoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  goal?: Goal | null;
}

const icons = [
  { id: 'shield', icon: Shield, label: 'Emergency' },
  { id: 'car', icon: Car, label: 'Vehicle' },
  { id: 'plane', icon: Plane, label: 'Travel' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'graduation', icon: GraduationCap, label: 'Education' },
  { id: 'gift', icon: Gift, label: 'Gift' },
  { id: 'briefcase', icon: Briefcase, label: 'Business' },
  { id: 'target', icon: Target, label: 'Other' },
];

const colors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export function GoalModal({ open, onOpenChange, mode, goal }: GoalModalProps) {
  const { addGoal, updateGoal } = useFinanceStore();

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: new Date(),
    icon: 'target',
    color: colors[0],
  });

  useEffect(() => {
    if (mode === 'edit' && goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        deadline: new Date(goal.deadline),
        icon: goal.icon,
        color: goal.color,
      });
    } else if (mode === 'add') {
      setFormData({
        name: '',
        targetAmount: '',
        currentAmount: '0',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        icon: 'target',
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }, [mode, goal, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      name: formData.name,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: format(formData.deadline, 'yyyy-MM-dd'),
      icon: formData.icon,
      color: formData.color,
    };

    if (mode === 'edit' && goal) {
      updateGoal(goal.id, data);
    } else {
      addGoal(data);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Emergency Fund"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (R)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="50000"
                min="0"
                step="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAmount">Starting Amount (R)</Label>
              <Input
                id="currentAmount"
                type="number"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.deadline && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {icons.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: id })}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                    formData.icon === id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'edit' ? 'Update' : 'Create'} Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
