const scavengerHuntController = require('../../controllers/scavengerHuntController');
const ScavengerHuntItem = require('../../models/scavengerHuntItem.model');

jest.mock('../../models/scavengerHuntItem.model');

describe('ScavengerHunt Controller', () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {}, query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn(() => res),
      send: jest.fn(() => res)
    };
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should return all items', async () => {
      const items = [{ name: 'a' }, { name: 'b' }];
      ScavengerHuntItem.find.mockResolvedValue(items);
      await scavengerHuntController.getAllItems(req, res);
      expect(res.json).toHaveBeenCalledWith(items);
    });
  });

  describe('getFilteredItems', () => {
    it('should return filtered and sampled items', async () => {
      req.query = { count: '2', category: 'cat', season: 'summer' };
      const items = [{ name: 'x' }, { name: 'y' }];
      ScavengerHuntItem.aggregate.mockResolvedValue(items);
      await scavengerHuntController.getFilteredItems(req, res);
      expect(res.json).toHaveBeenCalledWith(items);
    });
  });

  describe('getItem', () => {
    it('should return a single item', async () => {
      req.params = { name: 'item', category: 'cat', season: 'summer' };
      const item = { name: 'item' };
      ScavengerHuntItem.findOne.mockResolvedValue(item);
      await scavengerHuntController.getItem(req, res);
      expect(res.json).toHaveBeenCalledWith(item);
    });
    it('should return 404 if item not found', async () => {
      req.params = { name: 'item', category: 'cat', season: 'summer' };
      ScavengerHuntItem.findOne.mockResolvedValue(null);
      await scavengerHuntController.getItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item not found' });
    });
  });

  describe('updateItem', () => {
    it('should update and return the item', async () => {
      req.params = { name: 'item', category: 'cat', season: 'summer' };
      req.body = { image: 'img', description: 'desc' };
      const updated = { name: 'item', image: 'img', description: 'desc' };
      ScavengerHuntItem.findOneAndUpdate.mockResolvedValue(updated);
      await scavengerHuntController.updateItem(req, res);
      expect(res.json).toHaveBeenCalledWith(updated);
    });
    it('should return 404 if item not found', async () => {
      req.params = { name: 'item', category: 'cat', season: 'summer' };
      req.body = { image: 'img', description: 'desc' };
      ScavengerHuntItem.findOneAndUpdate.mockResolvedValue(null);
      await scavengerHuntController.updateItem(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item not found' });
    });
  });

  describe('addItem', () => {
    it('should add a new item', async () => {
      req.body = { name: 'item', category: 'cat', season: 'summer', image: 'img', description: 'desc' };
      ScavengerHuntItem.findOne.mockResolvedValue(null);
      const fakeSave = jest.fn().mockResolvedValue();
      ScavengerHuntItem.mockImplementation(() => ({ save: fakeSave }));
      await scavengerHuntController.addItem(req, res);
      expect(fakeSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
    it('should return 400 if required fields missing', async () => {
      req.body = { name: '', category: '', season: '', image: '', description: '' };
      await scavengerHuntController.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing required fields' });
    });
    it('should return 409 if item already exists', async () => {
      req.body = { name: 'item', category: 'cat', season: 'summer', image: 'img', description: 'desc' };
      ScavengerHuntItem.findOne.mockResolvedValue({});
      await scavengerHuntController.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Item already exists' });
    });
    it('should return 500 if save fails', async () => {
      req.body = { name: 'item', category: 'cat', season: 'summer', image: 'img', description: 'desc' };
      ScavengerHuntItem.findOne.mockResolvedValue(null);
      const fakeSave = jest.fn().mockRejectedValue(new Error('fail'));
      ScavengerHuntItem.mockImplementation(() => ({ save: fakeSave }));
      await scavengerHuntController.addItem(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});
