const blacklistController = require('../../controllers/blacklistController');
const BlacklistedBatch = require('../../models/blacklistedBatch.model');

jest.mock('../../models/blacklistedBatch.model');

describe('Blacklist Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
      send: jest.fn(() => res)
    };
    jest.clearAllMocks();
  });

  describe('getBlacklist', () => {
    it('should return all blacklisted batch ids', async () => {
      const docs = [{ brewfatherId: 'abc' }, { brewfatherId: 'def' }];
      BlacklistedBatch.find.mockResolvedValue(docs);
      await blacklistController.getBlacklist(req, res);
      expect(res.json).toHaveBeenCalledWith(['abc', 'def']);
    });
  });

  describe('addToBlacklist', () => {
    it('should add a batch id to the blacklist', async () => {
      req.body.brewfatherId = 'xyz';
      BlacklistedBatch.create.mockResolvedValue({ brewfatherId: 'xyz' });
      await blacklistController.addToBlacklist(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: 'Added to blacklist', brewfatherId: 'xyz' });
    });
    it('should return 400 if brewfatherId missing', async () => {
      req.body.brewfatherId = undefined;
      await blacklistController.addToBlacklist(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'brewfatherId required' });
    });
    it('should return 409 if already blacklisted', async () => {
      req.body.brewfatherId = 'dup';
      const err = new Error('Duplicate');
      err.code = 11000;
      BlacklistedBatch.create.mockRejectedValue(err);
      await blacklistController.addToBlacklist(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Already blacklisted' });
    });
    it('should return 500 on other errors', async () => {
      req.body.brewfatherId = 'err';
      const err = new Error('Some error');
      BlacklistedBatch.create.mockRejectedValue(err);
      await blacklistController.addToBlacklist(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Some error' });
    });
  });

  describe('removeFromBlacklist', () => {
    it('should remove a batch id and confirm', async () => {
      req.params.brewfatherId = 'gone';
      BlacklistedBatch.deleteOne.mockResolvedValue({ deletedCount: 1 });
      await blacklistController.removeFromBlacklist(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: 'Removed from blacklist', brewfatherId: 'gone' });
    });
    it('should return 404 if not found', async () => {
      req.params.brewfatherId = 'notfound';
      BlacklistedBatch.deleteOne.mockResolvedValue({ deletedCount: 0 });
      await blacklistController.removeFromBlacklist(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
  });
});
