const mongoose = require('mongoose');
const BlacklistedBatch = require('../../models/blacklistedBatch.model');

mongoose.Promise = global.Promise;

describe('BlacklistedBatch Model', () => {
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

  it('should create a valid blacklisted batch', async () => {
    const batchData = {
      brewfatherId: 'blacklisted-batch-123'
    };

    const batch = new BlacklistedBatch(batchData);
    expect(batch.brewfatherId).toBe(batchData.brewfatherId);
  });

  it('should validate that brewfatherId field is required', async () => {
    const invalidBatch = new BlacklistedBatch({});
    
    // Validate without connecting to DB
    const validationError = invalidBatch.validateSync();
    expect(validationError).toBeDefined();
    expect(validationError.errors.brewfatherId).toBeDefined();
    expect(validationError.errors.brewfatherId.kind).toBe('required');
  });

  it('should enforce unique constraints on brewfatherId', () => {
    // Get schema path for brewfatherId to check its options
    const brewfatherIdPath = BlacklistedBatch.schema.path('brewfatherId');
    
    // Assert that the unique option is set to true
    expect(brewfatherIdPath.options.unique).toBe(true);
  });
});
