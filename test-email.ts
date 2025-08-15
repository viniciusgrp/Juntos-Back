import dotenv from 'dotenv';
import { EmailUtil } from './src/utils/email.util';

// Configurar dotenv
dotenv.config();

async function testEmail() {
  try {
    console.log('Testando envio de e-mail...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    
    await EmailUtil.sendEmail({
      to: 'viniciusgrp@gmail.com',
      subject: 'Teste de E-mail - Juntos',
      html: '<h1>Teste de e-mail funcionando!</h1><p>Se você recebeu este e-mail, a configuração está correta.</p>'
    });
    
    console.log('✅ E-mail enviado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
  }
}

testEmail();
