import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from './JwtService';
import { Role } from '../domain/Role.enum';

const tokenService = new JwtService();

// Extends Fastify's request type so TypeScript knows
// about the user we attach after verifying the token
declare module 'fastify' {
  interface FastifyRequest {
    currentUser: {
      userId:         string;
      email:          string;
      role:           Role;
      organizationId: string;
    };
  }
}

// ── authenticate ─────────────────────────────────────────
// Verifies the JWT token on every protected request.
// Attach this as a preHandler on any route that needs auth.
export async function authenticate(
  request: FastifyRequest,
  reply:   FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing or invalid authorization header' });
  }

  const token   = authHeader.split(' ')[1];
  const payload = tokenService.verify(token);

  if (!payload) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }

  // Attach user info to the request so route handlers can use it
  request.currentUser = payload;
}

// ── requireRole ──────────────────────────────────────────
// Use AFTER authenticate. Checks that the current user
// has one of the allowed roles for this route.
// Usage: preHandler: [authenticate, requireRole(Role.ADMIN)]
export function requireRole(...roles: Role[]) {
  return async function (
    request: FastifyRequest,
    reply:   FastifyReply
  ): Promise<void> {
    if (!roles.includes(request.currentUser.role)) {
      return reply.status(403).send({
        error: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
  };
}