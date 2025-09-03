import { test, expect } from 'vitest';
import request from 'supertest';
import { server } from '../app.ts';
import { makeUser } from '../tests/factories/make-user.ts';

test('get users (manager only)', async () => {
  await server.ready();

  const { user, token } = await makeUser({ role: 'manager' });

  const response = await request(server.server)
    .get('/users')
    .set('Authorization', `Bearer ${token}`);

  expect(response.status).toEqual(200);
  expect(response.body).toEqual({
    users: expect.arrayContaining([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        email: expect.any(String),
        role: expect.any(String),
      }),
    ]),
  });
});