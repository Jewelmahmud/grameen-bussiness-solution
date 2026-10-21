const request = require('supertest');
const createApp = require('../src/app');

describe('Unknown routes', () => {
  it('returns 404 JSON for paths with no handler', async () => {
    const app = createApp();
    const res = await request(app).get('/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      error: 'Route not found',
      path: '/this-route-does-not-exist',
    });
  });
});
