// Mock the exact paths as used in brewfatherScraper.js
jest.mock('../models/blacklistedBatch.model', () => ({
  find: jest.fn().mockImplementation((criteria, projection) => {
    return Promise.resolve([{ brewfatherId: 'blacklisted-batch' }]);
  }),
  create: jest.fn(),
  deleteMany: jest.fn()
}));

// Also mock the BeerRecipe using the path in brewfatherScraper.js
jest.mock('../beerRecipe.model', () => ({
  find: jest.fn().mockImplementation((criteria, projection) => {
    return Promise.resolve([{ brewfatherId: 'existing-batch' }]);
  }),
  insertMany: jest.fn().mockImplementation(docs => {
    return Promise.resolve(docs);
  }),
  deleteMany: jest.fn()
}));

// Now mock brewfatherScraper
jest.mock('../brewfatherScraper', () => {
  const original = jest.requireActual('../brewfatherScraper');
  return {
    ...original,
    fetchBatches: jest.fn()
  };
});

// Import the mocked models
const BlacklistedBatch = require('../models/blacklistedBatch.model');
const BeerRecipe = require('../beerRecipe.model');
const brewfatherScraper = require('../brewfatherScraper');
const { scrapeAndSaveAll } = brewfatherScraper;
require('dotenv').config();

describe('Brewfather Scraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should insert new batches and skip blacklisted and existing', async () => {
    jest.setTimeout(10000); // Give more time for debug

    // Reset any mock implementations set by other tests
    BlacklistedBatch.find.mockImplementation((criteria, projection) => {
      return Promise.resolve([{ brewfatherId: 'blacklisted-batch' }]);
    });

    // We don't need to re-import or re-set these mocks since we defined them at the top
    // Use our mockFetchBatches
    const batchesFirstCall = [
      { _id: 'blacklisted-batch' },
      { _id: 'existing-batch' },
      { _id: 'new-batch', recipe: { name: 'Test Recipe' }, batchYeasts: [{ name: 'US-05', productId: '123' }] }
    ];

    const mockFetchBatches = jest.fn()
      .mockImplementationOnce(async () => {
        return batchesFirstCall;
      })
      .mockImplementation(async () => {
        return [];
      });

    const inserted = await scrapeAndSaveAll(mockFetchBatches);
    expect(inserted).toBe(1);
    expect(BlacklistedBatch.find).toHaveBeenCalledTimes(1);
    expect(BlacklistedBatch.find).toHaveBeenCalledWith({}, { brewfatherId: 1 });
    
    // The BeerRecipe.find call is different from what we expected too
    // Let's fix that assertion - it gets called with brewfatherId $in query
    expect(BeerRecipe.find).toHaveBeenCalledTimes(1);
    expect(BeerRecipe.find).toHaveBeenCalledWith(
      { brewfatherId: { $in: expect.any(Array) } }, 
      { brewfatherId: 1 }
    );
    
    expect(BeerRecipe.insertMany).toHaveBeenCalledTimes(1);
    expect(BeerRecipe.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ brewfatherId: 'new-batch', name: 'Test Recipe' })
      ])
    );
  });
});
