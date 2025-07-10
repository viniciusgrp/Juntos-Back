# Juntos Backend - API de Gestão Financeira

Backend robusto e escalável para o sistema de gestão financeira Juntos, desenvolvido com Node.js, Express e Prisma.

🌐 **API em Produção**: [apijuntos.viniciusgrp.com.br](https://apijuntos.viniciusgrp.com.br/)

## 📋 Sobre a API

Esta API fornece todos os endpoints necessários para o funcionamento da aplicação Juntos, incluindo autenticação, gestão de contas, transações financeiras, categorias e relatórios. Foi desenvolvida seguindo padrões REST e boas práticas de segurança.

### 🔧 Funcionalidades da API

- **Autenticação JWT**: Sistema seguro de login e registro
- **Gestão de Usuários**: CRUD completo de usuários
- **Contas Bancárias**: Criação, edição e consulta de contas
- **Transações**: Receitas, despesas e transferências
- **Categorias**: Sistema flexível de categorização
- **Cartões de Crédito**: Gestão específica para cartões
- **Estatísticas**: Endpoints para dashboards e relatórios
- **Validações**: Validação robusta de dados de entrada
- **Tratamento de Erros**: Sistema padronizado de resposta

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **ORM**: Prisma (MySQL)
- **Autenticação**: JWT + bcrypt
- **Validação**: Yup
- **Tipagem**: TypeScript
- **Banco de Dados**: MySQL
- **Deploy**: AWS EC2
- **Monitoramento**: Logs estruturados

## 🚀 Configuração Local

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8.0+ configurado
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd Juntos-Back
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Configure o `.env` com suas credenciais:
```env
DATABASE_URL="mysql://user:password@localhost:3306/juntos"
JWT_SECRET="sua-chave-secreta-super-segura"
PORT=3001
NODE_ENV=development
```

5. Execute as migrações do banco:
```bash
npm run db:migrate
```

6. (Opcional) Execute o seed para dados iniciais:
```bash
npm run db:seed
```

7. Inicie o servidor:
```bash
npm run dev
```

A API estará rodando em `http://localhost:3001`

### Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com nodemon
- `npm run build` - Compila TypeScript para JavaScript
- `npm run start` - Executa a versão compilada
- `npm run db:migrate` - Executa migrações do Prisma
- `npm run db:seed` - Popula o banco com dados iniciais
- `npm run db:studio` - Abre o Prisma Studio

## 📁 Arquitetura do Projeto

```
src/
├── config/              # Configurações da aplicação
├── controllers/         # Controladores das rotas
├── middleware/          # Middlewares (auth, errors, etc)
├── routes/             # Definição das rotas
├── services/           # Lógica de negócio
├── types/              # Tipos TypeScript
├── utils/              # Utilitários e helpers
├── app.ts              # Configuração do Express
└── server.ts           # Ponto de entrada
```

### 📊 Modelo de Dados

O banco utiliza as seguintes entidades principais:

- **Users**: Usuários do sistema
- **Accounts**: Contas bancárias/carteiras
- **Transactions**: Receitas e despesas
- **Categories**: Categorias de transações
- **CreditCards**: Cartões de crédito
- **Goals**: Metas financeiras (futuro)

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Hash de Senhas**: bcrypt com salt para senhas
- **Validação de Dados**: Todas as entradas são validadas
- **CORS**: Configurado para domínios específicos
- **Rate Limiting**: Proteção contra ataques (produção)
- **Sanitização**: Limpeza de dados de entrada

## 📡 Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login de usuário

### Contas
- `GET /api/accounts` - Lista contas do usuário
- `POST /api/accounts` - Cria nova conta
- `PUT /api/accounts/:id` - Atualiza conta
- `DELETE /api/accounts/:id` - Remove conta
- `GET /api/accounts/stats` - Estatísticas das contas

### Transações
- `GET /api/transactions` - Lista transações
- `POST /api/transactions` - Cria transação
- `PUT /api/transactions/:id` - Atualiza transação
- `DELETE /api/transactions/:id` - Remove transação

### Transferências
- `POST /api/accounts/transfer` - Transfere entre contas

## 🔧 Configuração de Produção

### AWS EC2 Deploy

A API está hospedada em uma instância EC2 da AWS com:

- **OS**: Ubuntu 22.04 LTS
- **Runtime**: Node.js 18 via PM2
- **Proxy**: Nginx como reverse proxy
- **SSL**: Certificado Let's Encrypt
- **Banco**: RDS MySQL
- **Monitoramento**: CloudWatch + PM2 logs

### Variáveis de Ambiente (Produção)

```env
DATABASE_URL="mysql://user:password@rds-endpoint/juntos"
JWT_SECRET="chave-super-segura-produção"
PORT=3001
NODE_ENV=production
CORS_ORIGIN="https://juntos.viniciusgrp.com.br"
```

## 📈 Monitoramento

- **Logs**: Sistema estruturado de logs
- **Health Check**: Endpoint `/health` para monitoramento
- **Performance**: Métricas de resposta e uso
- **Erros**: Captura e log de erros em produção

## 🧪 Testes

Para executar os testes (quando implementados):

```bash
npm test
```

## 🔄 Versionamento da API

A API segue versionamento semântico e mantém compatibilidade com versões anteriores quando possível.

**Versão Atual**: v1.0.0

## 📧 Suporte

Para questões relacionadas ao backend, problemas de API ou sugestões de melhorias, entre em contato através dos canais disponíveis no projeto.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, siga os padrões de código estabelecidos e certifique-se de que todos os testes passem antes de enviar um PR.
