import * as yup from 'yup';

export const createCategorySchema = yup.object({
  name: yup
    .string()
    .required('Nome da categoria é obrigatório')
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  type: yup
    .string()
    .required('Tipo da categoria é obrigatório')
    .oneOf(['income', 'expense'], 'Tipo deve ser "income" ou "expense"'),
  
  color: yup
    .string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)')
    .optional()
    .nullable(),
  
  icon: yup
    .string()
    .max(50, 'Ícone deve ter no máximo 50 caracteres')
    .optional()
    .nullable()
});

export const updateCategorySchema = yup.object({
  name: yup
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  type: yup
    .string()
    .oneOf(['income', 'expense'], 'Tipo deve ser "income" ou "expense"')
    .optional(),
  
  color: yup
    .string()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve estar no formato hexadecimal (#RRGGBB ou #RGB)')
    .optional()
    .nullable(),
  
  icon: yup
    .string()
    .max(50, 'Ícone deve ter no máximo 50 caracteres')
    .optional()
    .nullable()
});
