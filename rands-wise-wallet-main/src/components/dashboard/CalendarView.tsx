import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFinanceStore } from '@/lib/store';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Banknote, 
  TrendingUp, 
  Target,
  AlertCircle 
} from 'lucide-react';
import { 
  format, 
  isSameDay, 
  setDate, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isBefore,
  isAfter 
} from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'bill' | 'income' | 'goal';
  title: string;
  amount: number;
  color: string;
}

export const CalendarView = () => {
  const { recurringTransactions, goals } = useFinanceStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Generate events for the current month
  const events = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const eventList: CalendarEvent[] = [];

    // Add recurring transactions
    recurringTransactions
      .filter((t) => t.isActive)
      .forEach((t) => {
        const eventDate = setDate(currentMonth, t.dayOfMonth);
        if (eventDate >= monthStart && eventDate <= monthEnd) {
          eventList.push({
            id: t.id,
            date: eventDate,
            type: t.type === 'expense' ? 'bill' : 'income',
            title: t.description,
            amount: t.amount,
            color: t.type === 'expense' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-2))',
          });
        }
      });

    // Add goal deadlines
    goals.forEach((goal) => {
      const deadline = new Date(goal.deadline);
      if (deadline >= monthStart && deadline <= monthEnd) {
        eventList.push({
          id: goal.id,
          date: deadline,
          type: 'goal',
          title: `${goal.name} deadline`,
          amount: goal.targetAmount - goal.currentAmount,
          color: goal.color,
        });
      }
    });

    return eventList;
  }, [currentMonth, recurringTransactions, goals]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((e) => isSameDay(e.date, date));
  };

  // Get events for selected date
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const bills = events.filter((e) => e.type === 'bill').reduce((acc, e) => acc + e.amount, 0);
    const income = events.filter((e) => e.type === 'income').reduce((acc, e) => acc + e.amount, 0);
    const goalDeadlines = events.filter((e) => e.type === 'goal').length;
    return { bills, income, goalDeadlines };
  }, [events]);

  // Custom day render to show event indicators
  const getDayContent = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="absolute bottom-0.5 left-1/2 flex -translate-x-1/2 gap-0.5">
        {dayEvents.slice(0, 3).map((event, i) => (
          <div
            key={i}
            className="h-1 w-1 rounded-full"
            style={{ backgroundColor: event.color }}
          />
        ))}
      </div>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'bill':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'income':
        return <TrendingUp className="h-4 w-4 text-chart-2" />;
      case 'goal':
        return <Target className="h-4 w-4 text-primary" />;
      default:
        return <Banknote className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Monthly Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bills This Month</p>
              <p className="text-lg font-bold text-destructive">R {monthlyTotals.bills.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-chart-2/20 bg-chart-2/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/10">
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Income Expected</p>
              <p className="text-lg font-bold text-chart-2">R {monthlyTotals.income.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Goal Deadlines</p>
              <p className="text-lg font-bold text-primary">{monthlyTotals.goalDeadlines} this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5 text-primary" />
              Financial Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[120px] text-center text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              className="pointer-events-auto w-full"
              classNames={{
                months: "w-full",
                month: "w-full space-y-4",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative flex-1 text-center text-sm p-0",
                  "[&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                ),
                day: cn(
                  "h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-muted rounded-md transition-colors relative"
                ),
                day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside: "text-muted-foreground opacity-50",
                nav: "hidden",
                caption: "hidden",
              }}
              components={{
                DayContent: ({ date }) => (
                  <div className="relative flex h-full w-full items-center justify-center">
                    <span>{date.getDate()}</span>
                    {getDayContent(date)}
                  </div>
                ),
              }}
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 border-t pt-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Bills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-chart-2" />
                <span className="text-xs text-muted-foreground">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Goal Deadline</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${event.color}20` }}
                    >
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <Badge
                        variant={event.type === 'bill' ? 'destructive' : event.type === 'income' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {event.type === 'goal' ? 'Remaining: ' : ''}R {event.amount.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No events</p>
                <p className="text-xs text-muted-foreground/70">
                  {selectedDate ? 'Nothing scheduled for this day' : 'Click a date to view events'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
