export interface CreateCategoryRequest {
  name: string;
  description?: string;
  type: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  type?: 'INCOME' | 'EXPENSE';
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoryFilters {
  type?: 'INCOME' | 'EXPENSE';
  isActive?: boolean;
  search?: string;
}

export interface CategoryStats {
  totalCategories: number;
  incomeCategories: number;
  expenseCategories: number;
  activeCategories: number;
  inactiveCategories: number;
}
