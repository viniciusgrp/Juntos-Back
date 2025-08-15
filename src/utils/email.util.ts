import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailUtil {
  private static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: undefined,
    },
    debug: true,
    logger: true
  });

  static async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Verificar se o transporter está configurado corretamente
      await this.transporter.verify();
      console.log('Transporter verificado com sucesso');

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      console.log('Tentando enviar e-mail para:', options.to);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('E-mail enviado com sucesso:', info.messageId);
    } catch (error: any) {
      console.error('Erro detalhado ao enviar e-mail:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode
      });
      
      // Se for erro de autenticação, tentar regenerar o access token
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        console.log('Tentando regenerar access token...');
        throw new Error('Erro de autenticação OAuth2. Verifique as credenciais.');
      }
      
      throw new Error(`Falha ao enviar e-mail: ${error.message}`);
    }
  }

  static generatePassword(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  static generateResetPasswordEmail(
    email: string,
    newPassword: string
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin-bottom: 10px;">Juntos - Redefinição de Senha</h1>
          <p style="color: #666; font-size: 16px;">Sua nova senha foi gerada com sucesso</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-bottom: 15px;">Olá!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            Recebemos uma solicitação para redefinir a senha da sua conta no Juntos.
          </p>
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Sua nova senha temporária é:
          </p>
          
          <div style="background-color: white; padding: 15px; border-radius: 4px; text-align: center; margin-bottom: 20px;">
            <h3 style="color: #1976d2; font-size: 24px; margin: 0; letter-spacing: 2px;">${newPassword}</h3>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            <strong>Por favor, faça login com esta nova senha e altere-a imediatamente por uma senha de sua preferência.</strong>
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Se você não solicitou esta redefinição, entre em contato conosco imediatamente.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>Este é um e-mail automático. Por favor, não responda.</p>
          <p>© 2025 Juntos - Sistema de Gestão Financeira</p>
        </div>
      </div>
    `;
  }
}
