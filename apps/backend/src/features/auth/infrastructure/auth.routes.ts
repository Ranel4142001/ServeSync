import { FastifyInstance } from 'fastify';
import prisma from '@shared/infrastructure/PrismaClient';
import { RegisterUserUseCase } from '../application/RegisterUser.usecase';
import { LoginUserUseCase }    from '../application/LoginUser.usecase';
import { RefreshTokenUseCase } from '../application/RefreshToken.usecase';
import { PrismaUserRepository } from './PrismaUserRepository';
import { BcryptHashService }    from './BcryptHashService';
import { JwtService }           from './JwtService';
import { authenticate, requireRole } from './rbac.middleware';
import { Role } from '../domain/Role.enum';
import { decodeId, encodeId } from '@shared/utils/idGenerators';

export async function authRoutes(app: FastifyInstance): Promise<void> {

  const userRepository = new PrismaUserRepository(prisma);
  const hashService    = new BcryptHashService();
  const tokenService   = new JwtService();

  const registerUseCase     = new RegisterUserUseCase(userRepository, hashService);
  const loginUseCase        = new LoginUserUseCase(userRepository, hashService, tokenService);
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService);

  // POST /auth/register — create a new user account
  app.post('/auth/register', async (request, reply) => {
    const body = request.body as {
      email:          string;
      password:       string;
      firstName:      string;
      lastName:       string;
      role:           Role;
      organizationId: string; // public ID like "ORG-0001" from frontend
    };

    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return reply.status(400).send({ error: 'All fields are required' });
    }

    const result = await registerUseCase.execute({
      ...body,
      organizationId: decodeId(body.organizationId),
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send({
      message:   'Account created successfully',
      id:        result.value.user.id,
      email:     result.value.user.email,
      fullName:  result.value.user.fullName,
      role:      result.value.user.role,
    });
  });

  // POST /auth/login — login and get access token
  app.post('/auth/login', async (request, reply) => {
    const body = request.body as {
      email:    string;
      password: string;
    };

    if (!body.email || !body.password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const result = await loginUseCase.execute(body);

    if (!result.isSuccess) {
      return reply.status(401).send({ error: result.error });
    }

    return reply.status(200).send({
      accessToken: result.value.accessToken,
      user: {
        id:             result.value.user.id,
        email:          result.value.user.email,
        fullName:       result.value.user.fullName,
        role:           result.value.user.role,
        organizationId: result.value.user.organizationId,
      },
    });
  });

  // POST /auth/refresh — refresh an expired token
  app.post('/auth/refresh', async (request, reply) => {
    const body = request.body as { token: string };

    if (!body.token) {
      return reply.status(400).send({ error: 'Token is required' });
    }

    const result = await refreshTokenUseCase.execute(body);

    if (!result.isSuccess) {
      return reply.status(401).send({ error: result.error });
    }

    return reply.status(200).send({
      accessToken: result.value.accessToken,
    });
  });

  // GET /auth/me — get currently logged in user
  app.get('/auth/me', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    return reply.status(200).send({
      id:             request.currentUser.userId,
      email:          request.currentUser.email,
      role:           request.currentUser.role,
      organizationId: request.currentUser.organizationId,
    });
  });

  // GET /auth/users — list all users in the organization (admin only)
  // Used by the admin Users page to manage team members
  app.get('/auth/users', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {
    const { organizationId } = request.currentUser;

    const users = await userRepository.findByOrganizationId(organizationId);

    return reply.status(200).send({
      users: users.map(u => ({
        id:        u.id,
        email:     u.email,
        fullName:  u.fullName,
        role:      u.role,
        isActive:  u.isActive,
        createdAt: u.createdAt,
      })),
      total: users.length,
    });
  });
}