import { test, expect } from 'vitest';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import { server } from '../app.ts';

test('create a user', async () => {
  await server.ready();

  const response = await request(server.server)
    .post('/users')
    .set('Content-Type', 'application/json')
    .send({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'password123',
      role: 'student',
    });

  expect(response.status).toEqual(201);
  expect(response.body).toEqual({
    userId: expect.any(String),
  });
});