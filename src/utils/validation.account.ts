import * as yup from 'yup';

export const createAccountSchema = yup.object({
  name: yup
    .string()
    .required('Nome da conta é obrigatório')
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  type: yup
    .string()
    .required('Tipo da conta é obrigatório')
    .oneOf(['checking', 'savings', 'investment', 'cash'], 'Tipo deve ser: checking, savings, investment ou cash'),
  
  balance: yup
    .number()
    .default(0)
    .min(-999999999.99, 'Saldo muito baixo')
    .max(999999999.99, 'Saldo muito alto')
    .transform((value, originalValue) => {
      return originalValue === undefined || originalValue === null ? 0 : value;
    })
});

export const updateAccountSchema = yup.object({
  name: yup
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  type: yup
    .string()
    .oneOf(['checking', 'savings', 'investment', 'cash'], 'Tipo deve ser: checking, savings, investment ou cash')
    .optional(),
  
  balance: yup
    .number()
    .min(-999999999.99, 'Saldo muito baixo')
    .max(999999999.99, 'Saldo muito alto')
    .optional()
});

export const transferSchema = yup.object({
  fromAccountId: yup
    .string()
    .required('Conta de origem é obrigatória'),
  
  toAccountId: yup
    .string()
    .required('Conta de destino é obrigatória')
    .test('different-accounts', 'Contas de origem e destino devem ser diferentes', function(value) {
      return value !== this.parent.fromAccountId;
    }),
  
  amount: yup
    .number()
    .required('Valor é obrigatório')
    .positive('Valor deve ser positivo')
    .max(999999999.99, 'Valor muito alto'),
  
  description: yup
    .string()
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .trim()
    .optional()
});

export const accountFiltersSchema = yup.object({
  type: yup
    .string()
    .oneOf(['checking', 'savings', 'investment', 'cash'], 'Tipo deve ser: checking, savings, investment ou cash')
    .optional(),
  
  minBalance: yup
    .number()
    .optional(),
  
  maxBalance: yup
    .number()
    .min(yup.ref('minBalance'), 'Saldo máximo deve ser maior que o mínimo')
    .optional()
});
