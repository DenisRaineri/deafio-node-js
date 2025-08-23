import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { courses } from '../database/schema.ts';
import { ilike, asc } from 'drizzle-orm';
import z from 'zod';

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/courses',
    {
      schema: {
        tags: ['courses'],
        summary: 'Get all courses',
        querystring: z.object({
          search: z.string().optional(),
          orderBy: z.enum(['id', 'title']).optional().default('id'),
          page: z.coerce.number().optional().default(1),
        }),
        description: 'This route searches for all courses in the database',
        response: {
          200: z.object({
            courses: z.array(
              z.object({
                id: z.uuid(),
                title: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy, page } = request.query;

      const result = await db
        .select()
        .from(courses)
        .orderBy(asc(courses[orderBy]))
        .where(search ? ilike(courses.title, `%${search}%`) : undefined);

      return reply.send({ courses: result });
    },
  );
};
