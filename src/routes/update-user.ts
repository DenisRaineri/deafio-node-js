import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { users } from '../database/schema.ts';
import { eq } from 'drizzle-orm';
import { hash } from 'argon2';
import z from 'zod';

export const updateUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.addHook('preHandler', server.checkRequestJwt);

  server.put(
    '/users/:id',
    {
      schema: {
        tags: ['users'],
        summary: 'Update user',
        params: z.object({
          id: z.uuid(),
        }),
        body: z.object({
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
          role: z.enum(['student', 'manager']).optional(),
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
      const { name, email, password, role } = request.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (password) updateData.password = await hash(password);
      if (role) updateData.role = role;

      const result = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (result.length === 0) {
        return reply.status(404).send({ message: 'User not found' });
      }

      return reply.send({ message: 'User updated successfully' });
    },
  );
};