import 'reflect-metadata';
import Fastify, { FastifyError } from 'fastify';
import cors      from '@fastify/cors';
import jwt       from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { authRoutes } from '../features/auth/infrastructure/auth.routes';
import { organizationRoutes } from '../features/organizations/infrastructure/organization.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors,      { origin: process.env.FRONTEND_URL || '*' });
  app.register(jwt,       { secret: process.env.JWT_SECRET! });
  app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  // ── Register feature routes ──────────────────────────────
  app.register(authRoutes);
  app.register(organizationRoutes);
  

  app.setErrorHandler((error: FastifyError, _req, reply) => {
    const statusCode = error.statusCode ?? 500;
    reply.status(statusCode).send({ error: error.message });
  });

  return app;
}