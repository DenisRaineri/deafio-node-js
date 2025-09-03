import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { db } from '../database/client.ts';
import { courses } from '../database/schema.ts';
import z from 'zod';
import { eq } from 'drizzle-orm';
import { checkRequestJWT } from './hooks/check-request-jwt.ts';
import { getAuthenticatedUserFromRequest } from '../utils/get-authenticated-user-from-request.ts';

export const getCoursesByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    '/courses/:id',
    {
      preHandler: [checkRequestJWT],
      schema: {
        params: z.object({
          id: z.uuid(),
        }),
        tags: ['courses'],
        summary: 'Get course by ID',
        description: 'This route searches the course by ID',
        response: {
          200: z.object({
            course: z.object({
              id: z.uuid(),
              title: z.string(),
              description: z.string().nullable(),
            }),
          }),
          404: z.string().describe('Course not found'),
        },
      },
    },
    async (request, reply) => {
      const user = getAuthenticatedUserFromRequest(request);
      const courseId = request.params.id;

      const course = await db
        .select()
        .from(courses)
        .where(eq(courses.id, courseId));

      if (course.length > 0) {
        return { course: course[0]! };
      }

      return reply.status(404).send('Course not found');
    },
  );
};
