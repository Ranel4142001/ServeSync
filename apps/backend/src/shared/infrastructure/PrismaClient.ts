import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { encodeId } from '../utils/idGenerators'; // Update path if you renamed it

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

// 1. Instantiate the raw client base
const basePrisma = new PrismaClient({ adapter });

// 2. Build the extended client that appends computed properties
export const prisma = basePrisma.$extends({
  result: {
    organization: {
      publicId: {
        needs: { id: true },
        compute(org) { return encodeId('org', org.id); }
      }
    },
    ticket: {
      publicId: {
        needs: { id: true },
        compute(ticket) { return encodeId('ticket', ticket.id); }
      }
    },
    invoice: {
      publicId: {
        needs: { id: true },
        compute(inv) { return encodeId('inv', inv.id); }
      }
    }
  }
});

export type ExtendedPrismaClient = typeof prisma;
// 3. Export the extended client as default so your existing code continues to work seamlessly
export default prisma;