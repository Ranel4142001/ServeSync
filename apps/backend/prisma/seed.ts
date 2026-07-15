import 'reflect-metadata';
import prisma from '../src/shared/infrastructure/PrismaClient';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Predictable UUID v7 values for seeding
const ORG_ID = '019f65df-cff7-70b7-965b-06bcc4072296';
const ADMIN_ID = '019f65df-cff8-72a8-bd4f-763bc8621ce4';
const AGENT_ID = '019f65df-cff8-7efa-951b-03d54565aa27';
const CLIENT_ID = '019f65df-cff8-7eca-a79f-2df52c5477de';
const INV_1_ID = '019f65df-cff8-7547-8c3d-1143ea0b94cb';
const INV_2_ID = '019f65df-cff8-7aa3-bd2a-9e12ff48ae51';

async function main() {
  console.log('Seeding database with UUID v7 keys...');

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
      id: ORG_ID,
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
      id: ADMIN_ID,
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
      id: AGENT_ID,
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
      id: CLIENT_ID,
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
      id: INV_1_ID,
      number: 'INV-2026-00001',
      amount: 29.00,
      currency: 'USD',
      description: 'Standard SaaS Subscription - July 2026',
      organizationId: organization.id,
    },
  });

  await prisma.invoice.create({
    data: {
      id: INV_2_ID,
      number: 'INV-2026-00002',
      amount: 15.00,
      currency: 'USD',
      description: 'Add-on Support Package',
      paidAt: new Date(),
      organizationId: organization.id,
    },
  });

  console.log('Database seeded successfully with UUID v7 keys!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
