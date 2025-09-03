import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { users } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const getUserByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.addHook('preHandler', server.checkRequestJwt);

  server.get(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        summary: 'Get user by ID',
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            user: z.object({
              id: z.uuid(),
              name: z.string(),
              email: z.string(),
              role: z.enum(['student', 'manager']),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.id, id));

      if (result.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ user: result[0]! });
    },
  );
};