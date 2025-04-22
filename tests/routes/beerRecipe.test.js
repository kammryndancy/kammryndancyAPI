const request = require('supertest');
const express = require('express');
const BeerRecipe = require('../../models/beerRecipe.model');
const beerRecipeRoutes = require('../../routes/beerRecipe');
jest.mock('../../middleware/auth', () => (req, res, next) => next());
jest.mock('../../models/beerRecipe.model');

const app = express();
app.use(express.json());
app.use('/api/beerrecipes', beerRecipeRoutes);

describe('BeerRecipe API', () => {
  let recipeId;
  const testRecipe = {
    name: 'Test IPA',
    malts: ['Pale Ale'],
    hops: ['Citra'],
    yeast: ['US-05'],
    abv: 6.5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new beer recipe', async () => {
    const mockRecipe = { ...testRecipe, _id: '123' };
    BeerRecipe.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockRecipe),
      ...mockRecipe
    }));
    const res = await request(app)
      .post('/api/beerrecipes')
      .send(testRecipe)
      .expect(201);
    expect(res.body.name).toBe(testRecipe.name);
    expect(res.body._id).toBe('123');
    recipeId = res.body._id;
  });

  it('should get all beer recipes', async () => {
    const mockSort = jest.fn().mockReturnValue(Promise.resolve([testRecipe]));
    BeerRecipe.find.mockReturnValue({ sort: mockSort });
    const res = await request(app).get('/api/beerrecipes').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a recipe by id', async () => {
    BeerRecipe.findById.mockResolvedValue({ ...testRecipe, _id: recipeId });
    const res = await request(app).get(`/api/beerrecipes/${recipeId}`).expect(200);
    expect(res.body._id).toBe(recipeId);
  });

  it('should get a recipe by name (wildcard)', async () => {
    BeerRecipe.find.mockResolvedValue([{ ...testRecipe, _id: recipeId }]);
    const res = await request(app).get('/api/beerrecipes/by-name/ipa').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (!Array.isArray(res.body) || res.body.length === 0) {
      throw new Error('Expected non-empty array for recipes by name (wildcard)');
    }
    expect(res.body.some(r => r.name && r.name.toLowerCase().includes('ipa'))).toBe(true);
  });

  it('should update a recipe', async () => {
    BeerRecipe.findByIdAndUpdate.mockResolvedValue({ ...testRecipe, abv: 7.0, _id: recipeId });
    const res = await request(app)
      .put(`/api/beerrecipes/${recipeId}`)
      .send({ abv: 7.0 })
      .expect(200);
    expect(res.body.abv).toBe(7.0);
  });

  it('should delete a recipe', async () => {
    BeerRecipe.findByIdAndDelete.mockResolvedValue({ ...testRecipe, _id: recipeId });
    const res = await request(app).delete(`/api/beerrecipes/${recipeId}`).expect(200);
    expect(res.body.success).toBe(true);
    BeerRecipe.findById.mockResolvedValue(null);
    await request(app).get(`/api/beerrecipes/${recipeId}`).expect(404);
  });
});
