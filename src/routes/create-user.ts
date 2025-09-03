import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { users } from '../database/schema.ts';
import { hash } from 'argon2';
import z from 'zod';

export const createUserRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    '/users',
    {
      schema: {
        tags: ['users'],
        summary: 'Create a user',
        body: z.object({
          name: z.string().min(2, 'Name must have at least 2 characters'),
          email: z.string().email('Invalid email format'),
          password: z.string().min(6, 'Password must have at least 6 characters'),
          role: z.enum(['student', 'manager']).optional().default('student'),
        }),
        response: {
          201: z.object({ userId: z.uuid() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password, role } = request.body;

      const hashedPassword = await hash(password);

      const result = await db
        .insert(users)
        .values({
          name,
          email,
          password: hashedPassword,
          role,
        })
        .returning();

      return reply.status(201).send({ userId: result[0]!.id });
    },
  );
};