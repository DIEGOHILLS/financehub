import { useState, useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { BudgetOverview } from '@/components/dashboard/BudgetOverview';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { TransactionsList } from '@/components/dashboard/TransactionsList';
import { NotesSection } from '@/components/dashboard/NotesSection';
import { RecurringTransactions } from '@/components/dashboard/RecurringTransactions';
import { ProfileSection } from '@/components/dashboard/ProfileSection';
import { MonthlyTrend } from '@/components/dashboard/MonthlyTrend';
import { GoalsSection } from '@/components/dashboard/GoalsSection';
import { UpcomingWidget } from '@/components/dashboard/UpcomingWidget';
import { CalendarView } from '@/components/dashboard/CalendarView';
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection';
import { useFinanceStore } from '@/lib/store';

const Index = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { processRecurringTransactions } = useFinanceStore();

  // Process recurring transactions on load
  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6 animate-fade-in">
            <SummaryCards />
            <div className="grid gap-6 lg:grid-cols-3">
              <SpendingChart />
              <BudgetOverview />
              <UpcomingWidget />
            </div>
            <MonthlyTrend />
          </div>
        );
      case 'transactions':
        return (
          <div className="animate-fade-in">
            <TransactionsList />
          </div>
        );
      case 'budgets':
        return (
          <div className="grid gap-6 animate-fade-in lg:grid-cols-2">
            <BudgetOverview />
            <SpendingChart />
          </div>
        );
      case 'goals':
        return (
          <div className="animate-fade-in">
            <GoalsSection />
          </div>
        );
      case 'analytics':
        return (
          <div className="animate-fade-in">
            <AnalyticsSection />
          </div>
        );
      case 'calendar':
        return (
          <div className="animate-fade-in">
            <CalendarView />
          </div>
        );
      case 'recurring':
        return (
          <div className="max-w-2xl animate-fade-in">
            <RecurringTransactions />
          </div>
        );
      case 'notes':
        return (
          <div className="max-w-2xl animate-fade-in">
            <NotesSection />
          </div>
        );
      case 'profile':
        return (
          <div className="max-w-md animate-fade-in">
            <ProfileSection />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
