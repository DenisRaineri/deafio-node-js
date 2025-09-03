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

server.register(createCourseRoute);
server.register(getCoursesRoute);
server.register(getCoursesByIdRoute);
server.register(loginRoute);

export { server };
