import { FastifyInstance } from 'fastify';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate, requireRole } from '../../auth/infrastructure/rbac.middleware';
import { Role }                      from '../../auth/domain/Role.enum';
import { PrismaInvoiceRepository }   from './PrismaInvoiceRepository';
import { CreateInvoiceUseCase }      from '../application/CreateInvoice.usecase';
import { GetInvoicesUseCase }        from '../application/GetInvoices.usecase';
import { MarkInvoicePaidUseCase }    from '../application/MarkInvoicePaid.usecase';

export async function billingRoutes(app: FastifyInstance): Promise<void> {

  const invoiceRepository    = new PrismaInvoiceRepository(prisma);
  const createInvoiceUseCase = new CreateInvoiceUseCase(invoiceRepository);
  const getInvoicesUseCase   = new GetInvoicesUseCase(invoiceRepository);
  const markPaidUseCase      = new MarkInvoicePaidUseCase(invoiceRepository);

  // POST /billing/invoices — create invoice (admin only)
  app.post('/billing/invoices', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const body = request.body as {
      amount:       number;
      currency:     string;
      description?: string;
    };
    const { organizationId } = request.currentUser;

    if (!body.amount || !body.currency) {
      return reply.status(400).send({ error: 'Amount and currency are required' });
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

    return reply.status(201).send({
      message: `Invoice created successfully`,
      id:      result.value.invoice.id,
      amount:  result.value.invoice.formattedAmount,
    });
  });

  // GET /billing/invoices — get all invoices (admin only)
  app.get('/billing/invoices', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { organizationId, role } = request.currentUser;
    const query      = request.query as { unpaidOnly?: string };
    const unpaidOnly = query.unpaidOnly === 'true';

    const result = await getInvoicesUseCase.execute({
      organizationId,
      role,
      unpaidOnly,
    });

    if (!result.isSuccess) {
      return reply.status(403).send({ error: result.error });
    }

    return reply.status(200).send({
      invoices: result.value.invoices.map(inv => ({
        id:          inv.id,
        amount:      inv.formattedAmount,
        description: inv.description ?? 'No description',
        isPaid:      inv.isPaid,
        paidAt:      inv.paidAt,
        createdAt:   inv.createdAt,
      })),
      summary: {
        total:       result.value.invoices.length,
        totalPaid:   `$${result.value.totalPaid.toFixed(2)}`,
        totalUnpaid: `$${result.value.totalUnpaid.toFixed(2)}`,
      },
    });
  });

  // PATCH /billing/invoices/:id/pay — mark invoice as paid (admin only)
  app.patch('/billing/invoices/:id/pay', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { id }   = request.params as { id: string };
    const { role } = request.currentUser;

    const result = await markPaidUseCase.execute({ invoiceId: id, role });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(200).send({
      message: 'Invoice marked as paid successfully',
      id:      result.value.invoice.id,
      isPaid:  true,
      paidAt:  result.value.invoice.paidAt,
    });
  });

  // GET /billing/invoices/:id — get single invoice detail (admin only)
  app.get('/billing/invoices/:id', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {

    const { id } = request.params as { id: string };
    const invoice = await invoiceRepository.findById(id);

    if (!invoice) {
      return reply.status(404).send({ error: 'Invoice not found' });
    }

    return reply.status(200).send({
      id:          invoice.id,
      amount:      invoice.formattedAmount,
      description: invoice.description ?? 'No description',
      isPaid:      invoice.isPaid,
      paidAt:      invoice.paidAt,
      createdAt:   invoice.createdAt,
    });
  });
}