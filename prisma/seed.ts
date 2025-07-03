import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@juntos.com',
      name: 'Administrador',
      password: hashedPassword,
    },
  });

  console.log('Usuário criado:', user.name);

  const categories = await prisma.category.createMany({
    data: [
      {
        name: 'Alimentação',
        type: 'expense',
        color: '#FF6B6B',
        icon: 'restaurant',
        userId: user.id,
      },
      {
        name: 'Transporte',
        type: 'expense',
        color: '#4ECDC4',
        icon: 'directions_car',
        userId: user.id,
      },
      {
        name: 'Salário',
        type: 'income',
        color: '#45B7D1',
        icon: 'attach_money',
        userId: user.id,
      },
      {
        name: 'Freelance',
        type: 'income',
        color: '#96CEB4',
        icon: 'laptop_mac',
        userId: user.id,
      },
    ],
  });

  console.log('Categorias criadas:', categories.count);

  const account = await prisma.account.create({
    data: {
      name: 'Conta Corrente',
      type: 'checking',
      balance: 1500.00,
      userId: user.id,
    },
  });

  console.log('Conta bancária criada:', account.name);

  const creditCard = await prisma.creditCard.create({
    data: {
      name: 'Cartão Principal',
      limit: 3000.00,
      dueDate: 10,
      closeDate: 5,
      userId: user.id,
    },
  });

  console.log('Cartão de crédito criado:', creditCard.name);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
