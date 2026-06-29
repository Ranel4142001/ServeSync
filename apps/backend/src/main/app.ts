import 'reflect-metadata';
import Fastify, { FastifyError } from 'fastify';
import cors      from '@fastify/cors';
import jwt       from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { Server } from 'socket.io';
import http       from 'http'; 
import { authRoutes } from '../features/auth/infrastructure/auth.routes';
import { organizationRoutes } from '../features/organizations/infrastructure/organization.routes';
import { ticketRoutes } from '../features/tickets/infrastructure/ticket.routes';
import {registerTicketGateway} from '../features/tickets/infrastructure/tickets.gateway';
import { storageRoutes } from '@features/storage/infrastructure/storage.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors,      { origin: process.env.FRONTEND_URL || '*' });
  app.register(jwt,       { secret: process.env.JWT_SECRET! });
  app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

   // ── Socket.io setup ──────────────────────────────────────
  // Socket.io needs to attach to a raw HTTP server
  // not directly to Fastify — this is how they work together
 
  const io = new Server(app.server, {
    cors: { origin: process.env.FRONTEND_URL || '*' }
  });
  // Register Socket.io event listeners for tickets
  registerTicketGateway(io);

  // ── Register feature routes ──────────────────────────────
  app.register(authRoutes);
  app.register(organizationRoutes);
  app.register(ticketRoutes(io));
  app.register(storageRoutes);
  

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({ error: error.message });
  });

  return { app, httpServer: app.server};
}