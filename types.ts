export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'work' | 'personal' | 'health';
  dueDate: string;
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

export interface UserXP {
  current: number;
  total: number;
  level: number;
  streak: number;
}

export type ViewState = 'dashboard' | 'calendar' | 'finance' | 'brain';