import * as yup from 'yup';

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim(),
  
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .matches(/(?=.*[a-zA-Z])/, 'Senha deve conter pelo menos uma letra')
    .matches(/(?=.*\d)/, 'Senha deve conter pelo menos um número')
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('Email é obrigatório')
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim(),
  
  password: yup
    .string()
    .required('Senha é obrigatória')
    .min(1, 'Senha não pode estar vazia')
});

export const refreshTokenSchema = yup.object({
  refreshToken: yup
    .string()
    .required('Refresh token é obrigatório')
    .min(1, 'Refresh token não pode estar vazio')
});

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  
  email: yup
    .string()
    .email('Email deve ter um formato válido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .lowercase()
    .trim()
    .optional()
});

// Schema para mudança de senha (futuro)  TODO
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Senha atual é obrigatória'),
  
  newPassword: yup
    .string()
    .required('Nova senha é obrigatória')
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres')
    .matches(/(?=.*[a-zA-Z])/, 'Nova senha deve conter pelo menos uma letra')
    .matches(/(?=.*\d)/, 'Nova senha deve conter pelo menos um número'),
  
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('newPassword')], 'Confirmação deve ser igual à nova senha')
});

export const validateData = async <T>(schema: yup.Schema<T>, data: any): Promise<T> => {
  try {
    return await schema.validate(data, { 
      abortEarly: false, 
      stripUnknown: true 
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => err.message);
      throw new Error(errors.join(', '));
    }
    throw error;
  }
};

export const validateDataSync = <T>(schema: yup.Schema<T>, data: any): T => {
  try {
    return schema.validateSync(data, { 
      abortEarly: false, 
      stripUnknown: true 
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      const errors = error.inner.map(err => err.message);
      throw new Error(errors.join(', '));
    }
    throw error;
  }
};
