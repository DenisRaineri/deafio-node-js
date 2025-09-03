import fastify from 'fastify';
import { fastifySwagger } from '@fastify/swagger';
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod';

import scalarAPIReference from '@scalar/fastify-api-reference';
import { createCourseRoute } from './routes/create-course.ts';
import { getCoursesRoute } from './routes/get-courses.ts';
import { getCoursesByIdRoute } from './routes/get-course-by-id.ts';
import { loginRoute } from './routes/login.ts';
import { createUserRoute } from './routes/create-user.ts';
import { getUsersRoute } from './routes/get-users.ts';
import { getUserByIdRoute } from './routes/get-user-by-id.ts';
import { updateUserRoute } from './routes/update-user.ts';
import { deleteUserRoute } from './routes/delete-user.ts';
import { checkRequestJWT } from './routes/hooks/check-request-jwt.ts';
import { checkUserRole } from './routes/hooks/check-user-role.ts';

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

if (process.env.NODE_ENV === 'development') {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Desafio Node.js',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: '/docs',
    configuration: {
      theme: 'kepler',
    },
  });
}

server.setSerializerCompiler(serializerCompiler);
server.setValidatorCompiler(validatorCompiler);

// Register hooks
server.decorate('checkRequestJwt', checkRequestJWT);
server.decorate('checkUserRole', checkUserRole);

server.register(createCourseRoute);
server.register(getCoursesRoute);
server.register(getCoursesByIdRoute);
server.register(loginRoute);
server.register(createUserRoute);
server.register(getUsersRoute);
server.register(getUserByIdRoute);
server.register(updateUserRoute);
server.register(deleteUserRoute);

export { server };
