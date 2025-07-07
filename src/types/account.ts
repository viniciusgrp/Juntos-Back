export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAccountRequest {
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'cash';
  balance?: number;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: 'checking' | 'savings' | 'investment' | 'cash';
  balance?: number;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
}

export interface AccountsResponse {
  accounts: Account[];
  totalBalance: number;
  accountsByType: {
    checking: number;
    savings: number;
    investment: number;
    cash: number;
  };
}

export interface AccountFilters {
  type?: 'checking' | 'savings' | 'investment' | 'cash';
  minBalance?: number;
  maxBalance?: number;
}
