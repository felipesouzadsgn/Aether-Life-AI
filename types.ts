
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health';
  dueDate?: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  time: string;
  duration: number; // in minutes
  type: 'meeting' | 'deep-work' | 'personal';
  attendees?: string[];
}

export interface FinanceMetric {
  date: string;
  balance: number;
  spent: number;
  income: number;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

export interface Note {
  id: string;
  content: string;
  category: string; // AI generated
  action: string; // AI generated
  createdAt: string;
}

export interface UserXP {
  current: number;
  total: number;
  level: number;
  streak: number;
}

export type ViewState = 'dashboard' | 'calendar' | 'finance' | 'brain';