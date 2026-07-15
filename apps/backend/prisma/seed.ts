import 'reflect-metadata';
import prisma from '../src/shared/infrastructure/PrismaClient';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding database...');

  // Clean up existing data in correct dependency order
  await prisma.message.deleteMany();
  await prisma.document.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create default organization
  const organization = await prisma.organization.create({
    data: {
      id: 1,
      code: 'ORG-0001',
      name: 'ServeSync HQ',
      slug: 'servesync-hq',
    },
  });

  console.log('Created Organization:', organization);

  // Hash password
  const passwordHash = await bcrypt.hash('Admin@123456', 12);

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@servesync.com',
      passwordHash,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      organizationId: organization.id,
    },
  });

  // Create Agent
  const agent = await prisma.user.create({
    data: {
      email: 'agent@servesync.com',
      passwordHash,
      firstName: 'Support',
      lastName: 'Agent',
      role: Role.AGENT,
      organizationId: organization.id,
    },
  });

  // Create Client
  const client = await prisma.user.create({
    data: {
      email: 'client@servesync.com',
      passwordHash,
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      role: Role.CLIENT,
      organizationId: organization.id,
    },
  });

  console.log('Created Users:', {
    admin: admin.email,
    agent: agent.email,
    client: client.email,
  });

  // Create some mock invoices for the client dashboard to match the UI fallbacks
  await prisma.invoice.create({
    data: {
      id: 1,
      number: 'INV-2026-00001',
      amount: 29.00,
      currency: 'USD',
      description: 'Standard SaaS Subscription - July 2026',
      organizationId: organization.id,
    },
  });

  await prisma.invoice.create({
    data: {
      id: 2,
      number: 'INV-2026-00002',
      amount: 15.00,
      currency: 'USD',
      description: 'Add-on Support Package',
      paidAt: new Date(),
      organizationId: organization.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
