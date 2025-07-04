import bcrypt from 'bcrypt';

export class PasswordUtil {
  private static saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
