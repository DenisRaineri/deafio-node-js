import fastify from 'fastify';

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      sub: string;
      role: 'student' | 'manager';
    };
  }

  export interface FastifyInstance {
    checkRequestJwt: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    checkUserRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
