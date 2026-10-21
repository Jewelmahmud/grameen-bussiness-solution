const request = require('supertest');
const createApp = require('../src/app');

describe('GET /api/v1/', () => {
  it('returns API metadata', async () => {
    const app = createApp();
    const res = await request(app).get('/api/v1/');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Dokan Inventory Management API',
      version: '1.0.0',
    });
    expect(res.body.endpoints).toMatchObject({
      health: '/health',
      api: '/api/v1',
    });
  });
});
