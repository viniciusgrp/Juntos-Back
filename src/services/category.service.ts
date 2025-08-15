import { PrismaClient, Category } from '@prisma/client';
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters, CategoryStats } from '../types/category';

export class CategoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCategory(userId: string, data: CreateCategoryRequest): Promise<Category> {
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        userId,
        name: data.name,
        type: data.type
      }
    });

    if (existingCategory) {
      throw new Error('Já existe uma categoria com este nome para este tipo');
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        color: data.color,
        icon: data.icon,
        userId
      }
    });

    return category;
  }

  async getCategories(userId: string, filters: CategoryFilters = {}) {
    const where: any = { userId };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        }
      ];
    }

    const categories = await this.prisma.category.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    return {
      categories,
      total: categories.length
    };
  }

  async getCategoryById(userId: string, id: string): Promise<Category> {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!category) {
      throw new Error('Categoria não encontrada');
    }

    return category;
  }

  async updateCategory(userId: string, id: string, data: UpdateCategoryRequest): Promise<Category> {
    await this.getCategoryById(userId, id); // Verificar se existe

    if (data.name || data.type) {
      const currentCategory = await this.getCategoryById(userId, id);
      const nameToCheck = data.name || currentCategory.name;
      const typeToCheck = data.type || currentCategory.type;

      const existingCategory = await this.prisma.category.findFirst({
        where: {
          userId,
          name: nameToCheck,
          type: typeToCheck,
          id: {
            not: id
          }
        }
      });

      if (existingCategory) {
        throw new Error('Já existe uma categoria com este nome para este tipo');
      }
    }

    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const category = await this.prisma.category.update({
      where: { id },
      data: updateData
    });

    return category;
  }

  async deleteCategory(userId: string, id: string): Promise<{ message: string }> {
    await this.getCategoryById(userId, id); // Verificar se existe

    // Verificar se a categoria está sendo usada em transações
    const transactionCount = await this.prisma.transaction.count({
      where: {
        categoryId: id
      }
    });

    if (transactionCount > 0) {
      throw new Error('Não é possível deletar uma categoria que possui transações associadas');
    }

    await this.prisma.category.delete({
      where: { id }
    });

    return { message: 'Categoria deletada com sucesso' };
  }

  async getCategoryStats(userId: string): Promise<CategoryStats> {
    const categories = await this.prisma.category.findMany({
      where: { userId }
    });

    const totalCategories = categories.length;
    const incomeCategories = categories.filter(c => c.type === 'INCOME').length;
    const expenseCategories = categories.filter(c => c.type === 'EXPENSE').length;
    const activeCategories = categories.filter(c => c.isActive !== false).length;
    const inactiveCategories = totalCategories - activeCategories;

    return {
      totalCategories,
      incomeCategories,
      expenseCategories,
      activeCategories,
      inactiveCategories
    };
  }

  async createDefaultCategories(userId: string): Promise<Category[]> {
    const defaultCategories = [
      { name: 'Salário', type: 'INCOME', color: '#4CAF50', icon: 'Work' },
      { name: 'Freelance', type: 'INCOME', color: '#2196F3', icon: 'Laptop' },
      { name: 'Investimentos', type: 'INCOME', color: '#FF9800', icon: 'TrendingUp' },
      { name: 'Vendas', type: 'INCOME', color: '#9C27B0', icon: 'Store' },
      { name: 'Outros', type: 'INCOME', color: '#607D8B', icon: 'AttachMoney' },
      
      { name: 'Alimentação', type: 'EXPENSE', color: '#F44336', icon: 'Restaurant' },
      { name: 'Transporte', type: 'EXPENSE', color: '#3F51B5', icon: 'DirectionsCar' },
      { name: 'Moradia', type: 'EXPENSE', color: '#795548', icon: 'Home' },
      { name: 'Saúde', type: 'EXPENSE', color: '#E91E63', icon: 'LocalHospital' },
      { name: 'Educação', type: 'EXPENSE', color: '#009688', icon: 'School' },
      { name: 'Lazer', type: 'EXPENSE', color: '#FFEB3B', icon: 'SportsEsports' },
      { name: 'Compras', type: 'EXPENSE', color: '#FF5722', icon: 'ShoppingCart' },
      { name: 'Serviços', type: 'EXPENSE', color: '#673AB7', icon: 'Build' }
    ];

    const createdCategories: Category[] = [];

    for (const categoryData of defaultCategories) {
      try {
        const category = await this.createCategory(userId, categoryData as CreateCategoryRequest);
        createdCategories.push(category);
      } catch (error) {
        console.log(`Categoria ${categoryData.name} já existe para o usuário ${userId}`);
      }
    }

    return createdCategories;
  }
}
