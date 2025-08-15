import { PrismaClient } from '@prisma/client';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types/auth.types';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
import { EmailUtil } from '../utils/email.util';
import { registerSchema, loginSchema, refreshTokenSchema, validateData } from '../utils/validation.util';
import prisma from '../config/database.config';

export class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const { name, email, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await PasswordUtil.hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
      }
    });

    const { accessToken, refreshToken } = JwtUtil.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    const { accessToken, refreshToken } = JwtUtil.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
      refreshToken,
    };
  }

  async refreshToken(data: RefreshTokenRequest): Promise<{ token: string }> {
    const { refreshToken } = data;

    const decoded = JwtUtil.verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const newAccessToken = JwtUtil.generateAccessToken(user.id, user.email);

    return {
      token: newAccessToken,
    };
  }

  async getProfile(userId: string): Promise<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('E-mail não encontrado');
    }

    const newPassword = EmailUtil.generatePassword();
    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    await EmailUtil.sendEmail({
      to: user.email,
      subject: 'Juntos - Nova Senha Gerada',
      html: EmailUtil.generateResetPasswordEmail(user.email, newPassword)
    });

    return {
      message: 'Nova senha enviada para o seu e-mail'
    };
  }

  async updateProfile(userId: string, updateData: {
    name?: string;
    email?: string;
  }): Promise<{
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o email já está sendo usado por outro usuário
    if (updateData.email && updateData.email !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: updateData.email.toLowerCase().trim() }
      });

      if (existingUserWithEmail) {
        throw new Error('Este e-mail já está sendo usado');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updateData.name && { name: updateData.name.trim() }),
        ...(updateData.email && { email: updateData.email.toLowerCase().trim() }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return updatedUser;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se a senha atual está correta
    const isCurrentPasswordValid = await PasswordUtil.comparePassword(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await PasswordUtil.comparePassword(newPassword, user.password);
    
    if (isSamePassword) {
      throw new Error('A nova senha deve ser diferente da senha atual');
    }

    // Criptografar a nova senha
    const hashedNewPassword = await PasswordUtil.hashPassword(newPassword);

    // Atualizar a senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return {
      message: 'Senha alterada com sucesso'
    };
  }
}
