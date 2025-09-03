import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { users } from '../database/schema.ts';
import { ilike } from 'drizzle-orm';
import z from 'zod';

export const getUsersRoute: FastifyPluginAsyncZod = async (server) => {
  server.addHook('preHandler', server.checkRequestJwt);
  server.addHook('preHandler', server.checkUserRole(['manager']));

  server.get(
    '/users',
    {
      schema: {
        tags: ['users'],
        summary: 'Get all users',
        queryString: z.object({
          search: z.string().optional(),
        }),
        response: {
          200: z.object({
            users: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                email: z.string(),
                role: z.enum(['student', 'manager']),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { search } = request.query as { search?: string };

      const result = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(search ? ilike(users.name, `%${search}%`) : undefined);

      return reply.send({ users: result });
    },
  );
};