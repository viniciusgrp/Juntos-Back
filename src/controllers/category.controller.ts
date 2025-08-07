import { Response } from 'express';
import { CategoryService } from '../services/category.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { CreateCategoryRequest, UpdateCategoryRequest, CategoryFilters } from '../types/category';
import { AuthenticatedRequest } from '../types/auth.types';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  async createCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateCategoryRequest = req.body;

      const category = await this.categoryService.createCategory(userId, data);

      successResponse(res, category, 'Categoria criada com sucesso', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const filters: CategoryFilters = {
        type: req.query.type as any,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string
      };

      const categoriesData = await this.categoryService.getCategories(userId, filters);

      successResponse(res, categoriesData, 'Categorias listadas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async getCategoryById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const category = await this.categoryService.getCategoryById(userId, id);

      successResponse(res, category, 'Categoria encontrada com sucesso');
    } catch (error: any) {
      if (error.message === 'Categoria não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async updateCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateCategoryRequest = req.body;

      const category = await this.categoryService.updateCategory(userId, id, data);

      successResponse(res, category, 'Categoria atualizada com sucesso');
    } catch (error: any) {
      if (error.message === 'Categoria não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async deleteCategory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await this.categoryService.deleteCategory(userId, id);

      successResponse(res, result, 'Categoria deletada com sucesso');
    } catch (error: any) {
      if (error.message === 'Categoria não encontrada') {
        errorResponse(res, error.message, 404);
      } else {
        errorResponse(res, error.message, 400);
      }
    }
  }

  async getCategoryStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await this.categoryService.getCategoryStats(userId);

      successResponse(res, stats, 'Estatísticas das categorias obtidas com sucesso');
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }

  async createDefaultCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const categories = await this.categoryService.createDefaultCategories(userId);

      successResponse(res, { categories, count: categories.length }, 'Categorias padrão criadas com sucesso', 201);
    } catch (error: any) {
      errorResponse(res, error.message, 400);
    }
  }
}
