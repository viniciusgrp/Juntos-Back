export interface CreateTransactionRequest {
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  isPaid?: boolean;
  accountId?: string;
  creditCardId?: string;
  categoryId: string;
  installments?: number;
}

export interface UpdateTransactionRequest {
  description?: string;
  amount?: number;
  type?: 'INCOME' | 'EXPENSE';
  date?: string;
  isPaid?: boolean;
  accountId?: string;
  creditCardId?: string;
  categoryId?: string;
  installments?: number;
}

export interface TransactionFilters {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  accountId?: string;
  creditCardId?: string;
  startDate?: string;
  endDate?: string;
  isPaid?: boolean;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface TransactionStats {
  totalIncomes: number;
  totalExpenses: number;
  totalPaid: number;
  totalPending: number;
  currentMonthIncomes: number;
  currentMonthExpenses: number;
  balance: number;
  topCategories: {
    categoryId: string;
    categoryName: string;
    total: number;
    count: number;
  }[];
}
