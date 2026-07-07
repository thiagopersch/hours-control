import { hash } from '@node-rs/argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../lib/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash('#mpresaPC10', {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Empresa Padrão',
      slug: 'default',
      plan: 'enterprise',
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'admin' } },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador do sistema',
      isSystem: true,
      organizationId: org.id,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'user' } },
    update: {},
    create: {
      name: 'user',
      description: 'Usuário padrão',
      isSystem: true,
      organizationId: org.id,
    },
  });

  const resources = [
    'demand',
    'client',
    'analyst',
    'contract',
    'requester',
    'department',
    'demand_type',
    'tag',
    'user',
    'role',
    'report',
    'notification',
    'settings',
  ];
  const actions = ['create', 'read', 'update', 'delete'];

  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action, description: `${resource}:${action}` },
      });
    }
  }

  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const userPermissions = ['demand:create', 'demand:read', 'demand:update'];
  for (const key of userPermissions) {
    const permission = allPermissions.find(
      (p: { resource: string; action: string }) =>
        `${p.resource}:${p.action}` === key,
    );
    if (permission) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: { roleId: userRole.id, permissionId: permission.id },
      });
    }
  }

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@perschtech.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@perschtech.com',
      passwordHash,
      organizationId: org.id,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  const analyst = await prisma.analyst.upsert({
    where: { id: 'seed-analyst-1' },
    update: {},
    create: {
      id: 'seed-analyst-1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '(11) 99999-8888',
      role: 'Analista de Suporte',
      level: 3,
      hourlyRate: 85.0,
      color: '#6366f1',
      organizationId: org.id,
    },
  });

  const client = await prisma.client.upsert({
    where: { id: 'seed-client-1' },
    update: {},
    create: {
      id: 'seed-client-1',
      name: 'Empresa Cliente Ltda',
      legalName: 'Empresa Cliente LTDA',
      document: '00.000.000/0001-00',
      email: 'contato@cliente.com',
      phone: '(11) 3333-4444',
      responsible: 'Carlos Mendes',
      color: '#22c55e',
      organizationId: org.id,
    },
  });

  await prisma.clientContract.upsert({
    where: { id: 'seed-contract-1' },
    update: {},
    create: {
      id: 'seed-contract-1',
      clientId: client.id,
      contractedHours: 160,
      hourlyRate: 120.0,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  const requester = await prisma.requester.upsert({
    where: { id: 'seed-requester-1' },
    update: {},
    create: {
      id: 'seed-requester-1',
      name: 'Maria Souza',
      email: 'maria@cliente.com',
      phone: '(11) 98888-7777',
      organizationId: org.id,
    },
  });

  const department = await prisma.department.upsert({
    where: { id: 'seed-department-1' },
    update: {},
    create: {
      id: 'seed-department-1',
      name: 'TI',
      description: 'Tecnologia da Informação',
      organizationId: org.id,
    },
  });

  const demandType = await prisma.demandType.upsert({
    where: { id: 'seed-demand-type-1' },
    update: {},
    create: {
      id: 'seed-demand-type-1',
      name: 'Suporte',
      description: 'Suporte técnico',
      color: '#a855f7',
      organizationId: org.id,
    },
  });

  await prisma.demand.upsert({
    where: { id: 'seed-demand-1' },
    update: {},
    create: {
      id: 'seed-demand-1',
      name: 'Configuração de email corporativo',
      description:
        'Realizar configuração do Outlook para novo funcionário do setor financeiro. Incluir assinatura padrão e regras de caixa de entrada.',
      date: new Date('2026-06-30'),
      durationMinutes: 270,
      priority: 'MEDIUM',
      status: 'COMPLETED',
      analystId: analyst.id,
      clientId: client.id,
      requesterId: requester.id,
      departmentId: department.id,
      demandTypeId: demandType.id,
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
