// @ts-ignore
const jwt = require('jsonwebtoken');
import { JwtPayload } from '../types/auth.types';

export class JwtUtil {
  private static getAccessTokenSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }
    return secret;
  }

  private static getRefreshTokenSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET não configurado');
    }
    return secret;
  }

  static generateAccessToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'access'
    };

    // @ts-ignore
    return jwt.sign(
      payload, 
      this.getAccessTokenSecret(), 
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
  }

  static generateRefreshToken(userId: string, email: string): string {
    const payload = {
      userId,
      email,
      type: 'refresh'
    };

    // @ts-ignore
    return jwt.sign(
      payload, 
      this.getRefreshTokenSecret(), 
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, this.getAccessTokenSecret()) as any;
      if (decoded.type !== 'access') {
        throw new Error('Token inválido');
      }
      return decoded as JwtPayload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, this.getRefreshTokenSecret()) as any;
      if (decoded.type !== 'refresh') {
        throw new Error('Refresh token inválido');
      }
      return decoded as JwtPayload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  static generateTokens(userId: string, email: string) {
    return {
      accessToken: this.generateAccessToken(userId, email),
      refreshToken: this.generateRefreshToken(userId, email),
    };
  }
}
