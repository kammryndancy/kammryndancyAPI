const request = require('supertest');
const express = require('express');
const BlacklistedBatch = require('../../models/blacklistedBatch.model');
const blacklistRoutes = require('../../routes/blacklist');
require('dotenv').config();

jest.mock('../../models/blacklistedBatch.model');
jest.mock('../../middleware/auth', () => (req, res, next) => next());

const app = express();
app.use(express.json());
app.use('/api/blacklist', blacklistRoutes);

describe('Blacklist API', () => {
  const testBrewfatherId = 'blacklist-test-id-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a batch to the blacklist', async () => {
    BlacklistedBatch.create.mockResolvedValue({ brewfatherId: testBrewfatherId });
    const res = await request(app)
      .post('/api/blacklist')
      .send({ brewfatherId: testBrewfatherId })
      .expect(201);
    expect(res.body.brewfatherId).toBe(testBrewfatherId);
  });

  it('should get all blacklisted batch ids', async () => {
    BlacklistedBatch.find.mockResolvedValue([{ brewfatherId: testBrewfatherId }]);
    const res = await request(app).get('/api/blacklist').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toContain(testBrewfatherId);
  });

  it('should remove a batch from the blacklist', async () => {
    BlacklistedBatch.deleteOne.mockResolvedValue({ deletedCount: 1 });
    const res = await request(app).delete(`/api/blacklist/${testBrewfatherId}`).expect(200);
    expect(res.body.brewfatherId).toBe(testBrewfatherId);
    BlacklistedBatch.find.mockResolvedValue([]);
    const getRes = await request(app).get('/api/blacklist').expect(200);
    expect(getRes.body).not.toContain(testBrewfatherId);
  });
});
