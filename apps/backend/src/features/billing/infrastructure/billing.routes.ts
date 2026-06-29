import { FastifyInstance } from 'fastify';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate, requireRole } from '../../auth/infrastructure/rbac.middleware';
import { Role }                      from '../../auth/domain/Role.enum';
import { PrismaInvoiceRepository }   from './PrismaInvoiceRepository';
import { CreateInvoiceUseCase }      from '../application/CreateInvoice.usecase';
import { GetInvoicesUseCase }        from '../application/GetInvoices.usecase';
import { MarkInvoicePaidUseCase }    from '../application/MarkInvoicePaid.usecase';

export async function billingRoutes(app: FastifyInstance): Promise<void> {

  // ── Wire up dependencies ─────────────────────────────────
  const invoiceRepository    = new PrismaInvoiceRepository(prisma);
  const createInvoiceUseCase = new CreateInvoiceUseCase(invoiceRepository);
  const getInvoicesUseCase   = new GetInvoicesUseCase(invoiceRepository);
  const markPaidUseCase      = new MarkInvoicePaidUseCase(invoiceRepository);

  // ── POST /billing/invoices ───────────────────────────────
  // Create a new invoice for an organization
  // Only admins can create invoices
  app.post('/billing/invoices', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const body = request.body as {
      amount:       number;
      currency:     string;
      description?: string;
    };

    // Get organizationId from the JWT token
    // Admin can only create invoices for their own organization
    const { organizationId } = request.currentUser;

    // Validate required fields
    if (!body.amount || !body.currency) {
      return reply.status(400).send({
        error: 'Amount and currency are required'
      });
    }

    const result = await createInvoiceUseCase.execute({
      amount:         body.amount,
      currency:       body.currency,
      description:    body.description,
      organizationId,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send(result.value);
  });

  // ── GET /billing/invoices ────────────────────────────────
  // Get all invoices for the current organization
  // Optional query param: ?unpaidOnly=true
  // Only admins can see invoices
  app.get('/billing/invoices', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { organizationId, role } = request.currentUser;

    // Check for optional query parameter
    // e.g. GET /billing/invoices?unpaidOnly=true
    const query = request.query as { unpaidOnly?: string };
    const unpaidOnly = query.unpaidOnly === 'true';

    const result = await getInvoicesUseCase.execute({
      organizationId,
      role,
      unpaidOnly,
    });

    if (!result.isSuccess) {
      return reply.status(403).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // ── PATCH /billing/invoices/:id/pay ─────────────────────
  // Mark an invoice as paid
  // Only admins can do this
  app.patch('/billing/invoices/:id/pay', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { id }   = request.params as { id: string };
    const { role } = request.currentUser;

    const result = await markPaidUseCase.execute({
      invoiceId: id,
      role,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // ── GET /billing/invoices/:id ────────────────────────────
  // Get a single invoice by ID
  // Only admins can view individual invoices
  app.get('/billing/invoices/:id', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { id } = request.params as { id: string };

    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      return reply.status(404).send({ error: 'Invoice not found' });
    }

    return reply.status(200).send({ invoice: invoice.toJSON() });
  });
}