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
      description: 'Usuário padrão (analista)',
      isSystem: true,
      organizationId: org.id,
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'cliente' } },
    update: {},
    create: {
      name: 'cliente',
      description: 'Portal do cliente - acesso restrito às próprias demandas',
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
    'team',
  ];
  const baseActions = ['create', 'read', 'update', 'delete'];
  const resourceActions: Record<string, string[]> = {
    demand: [...baseActions, 'export', 'import', 'approve', 'configure'],
    client: [...baseActions, 'favorite'],
  };

  for (const resource of resources) {
    for (const action of resourceActions[resource] ?? baseActions) {
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
      update: { scope: 'ALL' },
      create: { roleId: adminRole.id, permissionId: permission.id, scope: 'ALL' },
    });
  }

  // Demand/analyst access is restricted to the analyst's own records; the
  // remaining resources are read-only reference data an analyst must be able
  // to see to populate the demand form's dropdowns (client, requester,
  // department, demand type pickers), so those are granted company-wide.
  const userOwnPermissions = ['demand:create', 'demand:read', 'demand:update', 'analyst:read'];
  const userReferencePermissions = ['client:read', 'requester:read', 'department:read', 'demand_type:read'];
  const userPermissionScopes: Record<string, 'OWN' | 'COMPANY'> = {
    ...Object.fromEntries(userOwnPermissions.map((k) => [k, 'OWN' as const])),
    ...Object.fromEntries(userReferencePermissions.map((k) => [k, 'COMPANY' as const])),
  };
  for (const [key, scope] of Object.entries(userPermissionScopes)) {
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
        update: { scope },
        create: { roleId: userRole.id, permissionId: permission.id, scope },
      });
    }
  }

  const clientPortalPermission = allPermissions.find(
    (p: { resource: string; action: string }) =>
      `${p.resource}:${p.action}` === 'demand:read',
  );
  if (clientPortalPermission) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: clientRole.id,
          permissionId: clientPortalPermission.id,
        },
      },
      update: { scope: 'OWN' },
      create: {
        roleId: clientRole.id,
        permissionId: clientPortalPermission.id,
        scope: 'OWN',
      },
    });
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

  const team = await prisma.team.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Suporte N1' } },
    update: {},
    create: {
      name: 'Suporte N1',
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
      teamId: team.id,
      departmentId: department.id,
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

  const clientPortalUser = await prisma.user.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      name: 'Carlos Mendes',
      email: 'cliente@exemplo.com',
      passwordHash,
      organizationId: org.id,
    },
  });
  await prisma.client.update({
    where: { id: client.id },
    data: { userId: clientPortalUser.id },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: clientPortalUser.id, roleId: clientRole.id } },
    update: {},
    create: { userId: clientPortalUser.id, roleId: clientRole.id },
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

  // Second analyst + second client, used to verify cross-user/cross-client isolation
  const analystUser2 = await prisma.user.upsert({
    where: { email: 'maria.analista@exemplo.com' },
    update: {},
    create: {
      name: 'Maria Analista',
      email: 'maria.analista@exemplo.com',
      passwordHash,
      organizationId: org.id,
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: analystUser2.id, roleId: userRole.id } },
    update: {},
    create: { userId: analystUser2.id, roleId: userRole.id },
  });
  const analyst2 = await prisma.analyst.upsert({
    where: { id: 'seed-analyst-2' },
    update: {},
    create: {
      id: 'seed-analyst-2',
      name: 'Maria Analista',
      email: 'maria.analista@exemplo.com',
      role: 'Analista de Suporte',
      level: 2,
      hourlyRate: 75.0,
      color: '#ec4899',
      organizationId: org.id,
      userId: analystUser2.id,
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: 'seed-client-2' },
    update: {},
    create: {
      id: 'seed-client-2',
      name: 'Cliente B Ltda',
      color: '#f59e0b',
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

  await prisma.demand.upsert({
    where: { id: 'seed-demand-2' },
    update: {},
    create: {
      id: 'seed-demand-2',
      name: 'Migração de servidor',
      description: 'Demanda de teste pertencente a outro analista e outro cliente, usada para validar isolamento de dados.',
      date: new Date('2026-06-20'),
      durationMinutes: 180,
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      analystId: analyst2.id,
      clientId: client2.id,
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
