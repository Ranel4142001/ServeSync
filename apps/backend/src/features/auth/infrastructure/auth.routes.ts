import { FastifyInstance } from 'fastify';
import prisma from '@shared/infrastructure/PrismaClient';
import { RegisterUserUseCase } from '../application/RegisterUser.usecase';
import { LoginUserUseCase }    from '../application/LoginUser.usecase';
import { RefreshTokenUseCase } from '../application/RefreshToken.usecase';
import { PrismaUserRepository } from './PrismaUserRepository';
import { BcryptHashService }    from './BcryptHashService';
import { JwtService }           from './JwtService';
import { authenticate }         from './rbac.middleware';
import { Role } from '../domain/Role.enum';

export async function authRoutes(app: FastifyInstance): Promise<void> {

  // ── Wire up dependencies ─────────────────────────────────
  // This is where everything connects together
  const userRepository = new PrismaUserRepository(prisma);
  const hashService    = new BcryptHashService();
  const tokenService   = new JwtService();

  const registerUseCase     = new RegisterUserUseCase(userRepository, hashService);
  const loginUseCase        = new LoginUserUseCase(userRepository, hashService, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

  // ── POST /auth/register ──────────────────────────────────
  app.post('/auth/register', async (request, reply) => {
    const body = request.body as {
      email:          string;
      password:       string;
      firstName:      string;
      lastName:       string;
      role:           Role;
      organizationId: string;
    };

    const result = await registerUseCase.execute(body);

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send(result.value);
  });

  // ── POST /auth/login ─────────────────────────────────────
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as {
      email:    string;
      password: string;
    };

    const result = await loginUseCase.execute(body);

    if (!result.isSuccess) {
      return reply.status(401).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // ── POST /auth/refresh ───────────────────────────────────
  app.post('/auth/refresh', async (request, reply) => {
    const body = request.body as { token: string };

    const result = await refreshTokenUseCase.execute(body);

    if (!result.isSuccess) {
      return reply.status(401).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // ── GET /auth/me ─────────────────────────────────────────
  // Returns the currently logged-in user's info from the token
  app.get('/auth/me', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    return reply.status(200).send({ user: request.currentUser });
  });
}