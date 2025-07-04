import { PrismaClient } from '@prisma/client';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types/auth.types';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil } from '../utils/jwt.util';
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
}
