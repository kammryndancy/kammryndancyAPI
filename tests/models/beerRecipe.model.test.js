const mongoose = require('mongoose');
const BeerRecipe = require('../../models/beerRecipe.model');

// Use in-memory mongodb for testing
// This prevents requiring a connection to a real database
mongoose.Promise = global.Promise;

describe('BeerRecipe Model', () => {
  beforeAll(async () => {
    // Mock mongoose connection and functionality
    // We're not actually connecting to a database
    jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
    jest.spyOn(mongoose.Model.prototype, 'save').mockImplementation(function() {
      this._id = this._id || new mongoose.Types.ObjectId();
      return Promise.resolve(this);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a valid beer recipe with required fields', async () => {
    const recipeData = {
      name: 'Test IPA',
      abv: 6.5,
      og: 1.060,
      fg: 1.010,
      srm: 10,
      ibu: 65,
      malts: ['Pale Malt', 'Crystal Malt'],
      hops: ['Citra', 'Cascade'],
      yeast: ['US-05']
    };

    const recipe = new BeerRecipe(recipeData);
    expect(recipe.name).toBe(recipeData.name);
    expect(recipe.abv).toBe(recipeData.abv);
    expect(recipe.malts).toEqual(recipeData.malts);
    expect(recipe.hops).toEqual(recipeData.hops);
    expect(recipe.yeast).toEqual(recipeData.yeast);
  });

  it('should validate that name field is required', async () => {
    const invalidRecipe = new BeerRecipe({
      abv: 5.5,
      malts: ['Pale Malt'],
      hops: ['Cascade'],
      yeast: ['US-05']
    });
    
    // Use validateSync to check validation without connecting to DB
    const validationError = invalidRecipe.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.name).toBeDefined();
    expect(validationError.errors.name.kind).toBe('required');
  });

  it('should handle beer recipe with awards', async () => {
    const recipeWithAwards = new BeerRecipe({
      name: 'Award-Winning IPA',
      abv: 7.0,
      malts: ['Pale Malt', 'Crystal Malt'],
      hops: ['Citra', 'Simcoe'],
      yeast: ['US-05'],
      awards: [{
        name: 'Gold Medal',
        competition: 'Homebrew Competition 2025',
        year: 2025,
        place: '1st'
      }]
    });

    expect(recipeWithAwards.awards).toHaveLength(1);
    expect(recipeWithAwards.awards[0].name).toBe('Gold Medal');
    expect(recipeWithAwards.awards[0].year).toBe(2025);
  });

  it('should store and retrieve brewfather ID correctly', async () => {
    const brewfatherId = 'bf-123456789';
    const recipe = new BeerRecipe({
      name: 'Brewfather Recipe',
      brewfatherId: brewfatherId,
      malts: ['Pale Malt'],
      hops: ['Citra'],
      yeast: ['US-05']
    });

    expect(recipe.brewfatherId).toBe(brewfatherId);
  });
});
