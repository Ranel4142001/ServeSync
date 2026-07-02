import { FastifyRequest, FastifyReply } from "fastify";
import { JwtService } from "../infrastructure/security/JwtService";
import { Role } from "../domain/Role.enum";
import { TokenPayload } from "../domain/ITokenService";

const tokenService = new JwtService();

// Extends Fastify's request type to include currentUser after token verification
declare module "fastify" {
  interface FastifyRequest {
    currentUser: TokenPayload;
  }
}

// Verifies the JWT on every protected request; attach as preHandler on guarded routes
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply
      .status(401)
      .send({ error: "Missing or invalid authorization header" });
  }

  const token = authHeader.split(" ")[1];
  const payload = tokenService.verify(token);

  if (!payload) {
    return reply.status(401).send({ error: "Invalid or expired token" });
  }

  // Attach verified user to the request for use in route handlers
  request.currentUser = payload;
}

// Use after authenticate — rejects requests where the user's role is not in the allowed list
// Usage: preHandler: [authenticate, requireRole(Role.ADMIN)]
export function requireRole(...roles: Role[]) {
  return async function (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (!roles.includes(request.currentUser.role)) {
      return reply.status(403).send({
        error: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
  };
}
