jest.mock('../src/models/DatabaseModel', () => ({
  getHealthInfo: jest.fn().mockResolvedValue({
    currentTime: '2026-03-28T12:00:00.000Z',
  }),
}));

const request = require('supertest');
const createApp = require('../src/app');
const DatabaseModel = require('../src/models/DatabaseModel');

describe('GET /health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns healthy when database check succeeds', async () => {
    const app = createApp();
    const res = await request(app).get('/health');

    expect(DatabaseModel.getHealthInfo).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: 'healthy',
      database: { connected: true },
    });
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
  });
});
