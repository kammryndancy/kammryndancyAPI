const mongoose = require('mongoose');
const ScavengerHuntItem = require('../../models/scavengerHuntItem.model');

mongoose.Promise = global.Promise;

describe('ScavengerHuntItem Model', () => {
  beforeAll(async () => {
    // Mock mongoose connection and functionality
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

  it('should create a valid scavenger hunt item', async () => {
    const itemData = {
      name: 'Blue Jay',
      image: 'https://example.com/bluejay.jpg',
      description: 'A colorful bird often found in North America',
      category: 'animals',
      season: 'spring'
    };

    const item = new ScavengerHuntItem(itemData);
    expect(item.name).toBe(itemData.name);
    expect(item.image).toBe(itemData.image);
    expect(item.description).toBe(itemData.description);
    expect(item.category).toBe(itemData.category);
    expect(item.season).toBe(itemData.season);
  });

  it('should validate required fields', async () => {
    const invalidItem = new ScavengerHuntItem({
      // Missing required fields
      name: 'Incomplete Item'
    });
    
    const validationError = invalidItem.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.image).toBeDefined();
    expect(validationError.errors.description).toBeDefined();
    expect(validationError.errors.category).toBeDefined();
    expect(validationError.errors.season).toBeDefined();
  });

  it('should enforce unique constraint on name+category+season combination', () => {
    // Check that the schema has the correct index
    const indexes = ScavengerHuntItem.schema.indexes();
    
    // Find the unique index for name+category+season
    const uniqueIndex = indexes.find(index => 
      index[0].name === 1 && 
      index[0].category === 1 && 
      index[0].season === 1 && 
      index[1].unique === true
    );
    
    expect(uniqueIndex).toBeDefined();
  });

  it('should support different categories and seasons', async () => {
    // Test with various categories and seasons
    const springItem = new ScavengerHuntItem({
      name: 'Daffodil',
      image: 'https://example.com/daffodil.jpg',
      description: 'A spring flower',
      category: 'plants',
      season: 'spring'
    });

    const winterItem = new ScavengerHuntItem({
      name: 'Cardinal',
      image: 'https://example.com/cardinal.jpg',
      description: 'A bird often spotted in winter',
      category: 'animals',
      season: 'winter'
    });

    expect(springItem.category).toBe('plants');
    expect(springItem.season).toBe('spring');
    expect(winterItem.category).toBe('animals');
    expect(winterItem.season).toBe('winter');
  });
});
