import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: string;
  isRecurring?: boolean;
  recurringDay?: number;
}

export interface Budget {
  category: string;
  limit: number;
  color: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Profile {
  name: string;
  email: string;
  avatar: string;
}

export interface RecurringTransaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  dayOfMonth: number;
  isActive: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
  milestonesReached: number[]; // percentages already celebrated
}

interface FinanceStore {
  transactions: Transaction[];
  budgets: Budget[];
  notes: Note[];
  goals: Goal[];
  profile: Profile;
  recurringTransactions: RecurringTransaction[];
  theme: 'light' | 'dark';
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  updateBudget: (category: string, limit: number) => void;
  addBudget: (budget: Budget) => void;
  deleteBudget: (category: string) => void;
  
  addNote: (content: string) => void;
  updateNote: (id: string, content: string) => void;
  deleteNote: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'milestonesReached'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => number[]; // returns new milestones reached
  
  updateProfile: (profile: Partial<Profile>) => void;
  
  addRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (id: string, transaction: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransactions: () => void;
  
  toggleTheme: () => void;
}

const defaultBudgets: Budget[] = [
  { category: 'Food & Dining', limit: 5000, color: 'hsl(var(--chart-1))' },
  { category: 'Transportation', limit: 3000, color: 'hsl(var(--chart-2))' },
  { category: 'Entertainment', limit: 2000, color: 'hsl(var(--chart-3))' },
  { category: 'Shopping', limit: 4000, color: 'hsl(var(--chart-4))' },
  { category: 'Utilities', limit: 2500, color: 'hsl(var(--chart-5))' },
  { category: 'Healthcare', limit: 1500, color: 'hsl(var(--chart-6))' },
];

const defaultProfile: Profile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: '',
};

const sampleTransactions: Transaction[] = [
  { id: '1', type: 'expense', amount: 450, category: 'Food & Dining', description: 'Grocery shopping', date: '2025-12-08' },
  { id: '2', type: 'expense', amount: 1200, category: 'Transportation', description: 'Fuel', date: '2025-12-07' },
  { id: '3', type: 'income', amount: 25000, category: 'Salary', description: 'Monthly salary', date: '2025-12-01' },
  { id: '4', type: 'expense', amount: 350, category: 'Entertainment', description: 'Movie tickets', date: '2025-12-06' },
  { id: '5', type: 'expense', amount: 2500, category: 'Shopping', description: 'New clothes', date: '2025-12-05' },
  { id: '6', type: 'expense', amount: 1800, category: 'Utilities', description: 'Electricity bill', date: '2025-12-04' },
  { id: '7', type: 'income', amount: 5000, category: 'Freelance', description: 'Side project', date: '2025-12-03' },
  { id: '8', type: 'expense', amount: 650, category: 'Healthcare', description: 'Medicine', date: '2025-12-02' },
];

const sampleGoals: Goal[] = [
  {
    id: '1',
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 32500,
    deadline: '2025-06-30',
    icon: 'shield',
    color: 'hsl(var(--chart-1))',
    milestonesReached: [25, 50],
  },
  {
    id: '2',
    name: 'New Car',
    targetAmount: 150000,
    currentAmount: 45000,
    deadline: '2026-01-15',
    icon: 'car',
    color: 'hsl(var(--chart-2))',
    milestonesReached: [25],
  },
  {
    id: '3',
    name: 'Vacation',
    targetAmount: 25000,
    currentAmount: 18750,
    deadline: '2025-04-01',
    icon: 'plane',
    color: 'hsl(var(--chart-3))',
    milestonesReached: [25, 50, 75],
  },
];

const sampleRecurringTransactions: RecurringTransaction[] = [
  { id: 'r1', type: 'expense', amount: 8500, category: 'Housing', description: 'Rent', dayOfMonth: 1, isActive: true },
  { id: 'r2', type: 'expense', amount: 1200, category: 'Utilities', description: 'Electricity Bill', dayOfMonth: 15, isActive: true },
  { id: 'r3', type: 'expense', amount: 450, category: 'Utilities', description: 'Internet', dayOfMonth: 5, isActive: true },
  { id: 'r4', type: 'expense', amount: 199, category: 'Entertainment', description: 'Netflix', dayOfMonth: 8, isActive: true },
  { id: 'r5', type: 'expense', amount: 149, category: 'Entertainment', description: 'Spotify', dayOfMonth: 12, isActive: true },
  { id: 'r6', type: 'expense', amount: 350, category: 'Transportation', description: 'Car Insurance', dayOfMonth: 20, isActive: true },
  { id: 'r7', type: 'income', amount: 25000, category: 'Salary', description: 'Monthly Salary', dayOfMonth: 25, isActive: true },
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      transactions: sampleTransactions,
      budgets: defaultBudgets,
      notes: [],
      goals: sampleGoals,
      profile: defaultProfile,
      recurringTransactions: sampleRecurringTransactions,
      theme: 'light',

      addTransaction: (transaction) => set((state) => ({
        transactions: [...state.transactions, { ...transaction, id: crypto.randomUUID() }],
      })),

      updateTransaction: (id, transaction) => set((state) => ({
        transactions: state.transactions.map((t) =>
          t.id === id ? { ...t, ...transaction } : t
        ),
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
      })),

      updateBudget: (category, limit) => set((state) => ({
        budgets: state.budgets.map((b) =>
          b.category === category ? { ...b, limit } : b
        ),
      })),

      addBudget: (budget) => set((state) => ({
        budgets: [...state.budgets, budget],
      })),

      deleteBudget: (category) => set((state) => ({
        budgets: state.budgets.filter((b) => b.category !== category),
      })),

      addNote: (content) => set((state) => ({
        notes: [...state.notes, {
          id: crypto.randomUUID(),
          content,
          createdAt: new Date().toISOString(),
        }],
      })),

      updateNote: (id, content) => set((state) => ({
        notes: state.notes.map((n) =>
          n.id === id ? { ...n, content } : n
        ),
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
      })),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: crypto.randomUUID(), milestonesReached: [] }],
      })),

      updateGoal: (id, goal) => set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...goal } : g)),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      })),

      contributeToGoal: (id, amount) => {
        const state = get();
        const goal = state.goals.find((g) => g.id === id);
        if (!goal) return [];

        const newAmount = goal.currentAmount + amount;
        const newPercentage = (newAmount / goal.targetAmount) * 100;
        const milestones = [25, 50, 75, 100];
        const newMilestonesReached: number[] = [];

        milestones.forEach((milestone) => {
          if (newPercentage >= milestone && !goal.milestonesReached.includes(milestone)) {
            newMilestonesReached.push(milestone);
          }
        });

        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? {
                  ...g,
                  currentAmount: newAmount,
                  milestonesReached: [...g.milestonesReached, ...newMilestonesReached],
                }
              : g
          ),
        }));

        return newMilestonesReached;
      },

      updateProfile: (profile) => set((state) => ({
        profile: { ...state.profile, ...profile },
      })),

      addRecurringTransaction: (transaction) => set((state) => ({
        recurringTransactions: [...state.recurringTransactions, {
          ...transaction,
          id: crypto.randomUUID(),
        }],
      })),

      updateRecurringTransaction: (id, transaction) => set((state) => ({
        recurringTransactions: state.recurringTransactions.map((t) =>
          t.id === id ? { ...t, ...transaction } : t
        ),
      })),

      deleteRecurringTransaction: (id) => set((state) => ({
        recurringTransactions: state.recurringTransactions.filter((t) => t.id !== id),
      })),

      processRecurringTransactions: () => {
        const state = get();
        const today = new Date();
        const dayOfMonth = today.getDate();

        state.recurringTransactions
          .filter((t) => t.isActive && t.dayOfMonth === dayOfMonth)
          .forEach((recurring) => {
            const existingToday = state.transactions.find(
              (t) =>
                t.date === today.toISOString().split('T')[0] &&
                t.description === recurring.description &&
                t.isRecurring
            );

            if (!existingToday) {
              state.addTransaction({
                type: recurring.type,
                amount: recurring.amount,
                category: recurring.category,
                description: recurring.description,
                date: today.toISOString().split('T')[0],
                isRecurring: true,
              });
            }
          });
      },

      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
    }),
    {
      name: 'finance-store',
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
