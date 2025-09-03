import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { users } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import z from 'zod';

export const deleteUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.addHook('preHandler', server.checkRequestJwt);
  server.addHook('preHandler', server.checkUserRole(['manager']));

  server.delete(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        summary: 'Delete user',
        params: z.object({
          id: z.uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
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
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ message: 'User deleted successfully' });
    },
  );
};