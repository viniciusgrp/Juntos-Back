import * as yup from 'yup';

export const createTransactionSchema = yup.object({
  description: yup
    .string()
    .required('Descrição é obrigatória')
    .min(1, 'Descrição não pode estar vazia')
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .trim(),
  
  amount: yup
    .number()
    .required('Valor é obrigatório')
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito alto'),
  
  type: yup
    .string()
    .required('Tipo é obrigatório')
    .oneOf(['income', 'expense'], 'Tipo deve ser "income" ou "expense"'),
  
  date: yup
    .date()
    .required('Data é obrigatória')
    .max(new Date(), 'Data não pode ser futura'),
  
  isPaid: yup
    .boolean()
    .default(false),
  
  accountId: yup
    .string()
    .nullable()
    .when('creditCardId', {
      is: (val: any) => !val,
      then: (schema) => schema.required('Conta ou cartão de crédito é obrigatório'),
      otherwise: (schema) => schema.nullable()
    }),
  
  creditCardId: yup
    .string()
    .nullable(),
  
  categoryId: yup
    .string()
    .required('Categoria é obrigatória')
});

export const updateTransactionSchema = yup.object({
  description: yup
    .string()
    .min(1, 'Descrição não pode estar vazia')
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  
  amount: yup
    .number()
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito alto')
    .optional(),
  
  type: yup
    .string()
    .oneOf(['income', 'expense'], 'Tipo deve ser "income" ou "expense"')
    .optional(),
  
  date: yup
    .date()
    .max(new Date(), 'Data não pode ser futura')
    .optional(),
  
  isPaid: yup
    .boolean()
    .optional(),
  
  accountId: yup
    .string()
    .nullable()
    .optional(),
  
  creditCardId: yup
    .string()
    .nullable()
    .optional(),
  
  categoryId: yup
    .string()
    .optional()
});

export const transactionFiltersSchema = yup.object({
  startDate: yup
    .date()
    .optional(),
  
  endDate: yup
    .date()
    .min(yup.ref('startDate'), 'Data final deve ser posterior à data inicial')
    .optional(),
  
  type: yup
    .string()
    .oneOf(['income', 'expense'], 'Tipo deve ser "income" ou "expense"')
    .optional(),
  
  categoryId: yup
    .string()
    .optional(),
  
  accountId: yup
    .string()
    .optional(),
  
  creditCardId: yup
    .string()
    .optional(),
  
  isPaid: yup
    .boolean()
    .optional(),
  
  minAmount: yup
    .number()
    .positive('Valor mínimo deve ser positivo')
    .optional(),
  
  maxAmount: yup
    .number()
    .positive('Valor máximo deve ser positivo')
    .min(yup.ref('minAmount'), 'Valor máximo deve ser maior que o mínimo')
    .optional(),
  
  page: yup
    .number()
    .integer('Página deve ser um número inteiro')
    .min(1, 'Página deve ser maior que 0')
    .default(1),
  
  limit: yup
    .number()
    .integer('Limite deve ser um número inteiro')
    .min(1, 'Limite deve ser maior que 0')
    .max(100, 'Limite deve ser no máximo 100')
    .default(20)
});
