const request = require('supertest');
const express = require('express');
const ScavengerHuntItem = require('../../models/scavengerHuntItem.model');
const scavengerHuntRoutes = require('../../routes/scavengerHunt');

jest.mock('../../models/scavengerHuntItem.model');

const app = express();
app.use(express.json());
app.use('/api/scavengerhunt', scavengerHuntRoutes);

describe('Scavenger Hunt API', () => {
  let itemId;
  const testItem = {
    name: 'Test Plant',
    category: 'plants',
    season: 'spring',
    image: 'https://example.com/test-plant.jpg',
    description: 'A test plant for spring.'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a new scavenger hunt item', async () => {
    ScavengerHuntItem.findOne.mockResolvedValue(null);
    const mockItem = { ...testItem, _id: 'mocked-id' };
    ScavengerHuntItem.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockItem),
      ...mockItem
    }));
    const res = await request(app)
      .post('/api/scavengerhunt')
      .send(testItem)
      .expect(201);
    expect(res.body.name).toBe(testItem.name);
    expect(res.body.category).toBe(testItem.category);
    expect(res.body.season).toBe(testItem.season);
    expect(res.body._id).toBe('mocked-id');
    itemId = res.body._id;
  });

  it('should get all scavenger hunt items', async () => {
    ScavengerHuntItem.find.mockResolvedValue([testItem]);
    const res = await request(app).get('/api/scavengerhunt').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(i => i.name === testItem.name)).toBe(true);
  });

  it('should get a specific item by name, category, and season', async () => {
    ScavengerHuntItem.findOne.mockResolvedValue(testItem);
    const res = await request(app)
      .get(`/api/scavengerhunt/${encodeURIComponent(testItem.name)}/${testItem.category}/${testItem.season}`)
      .expect(200);
    expect(res.body.name).toBe(testItem.name);
    expect(res.body.category).toBe(testItem.category);
    expect(res.body.season).toBe(testItem.season);
  });

  it('should update an item', async () => {
    const updatedDesc = 'Updated description';
    ScavengerHuntItem.findOneAndUpdate.mockResolvedValue({ ...testItem, description: updatedDesc });
    const res = await request(app)
      .put(`/api/scavengerhunt/${encodeURIComponent(testItem.name)}/${testItem.category}/${testItem.season}`)
      .send({ image: testItem.image, description: updatedDesc })
      .expect(200);
    expect(res.body.description).toBe(updatedDesc);
  });

  it('should get filtered items', async () => {
    ScavengerHuntItem.aggregate.mockResolvedValue([testItem]);
    const res = await request(app)
      .get('/api/scavengerhunt/filter?count=1&category=plants&season=spring')
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].category).toBe('plants');
    expect(res.body[0].season).toBe('spring');
  });
});
