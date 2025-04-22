const beerRecipeController = require('../../controllers/beerRecipeController');
const BeerRecipe = require('../../models/beerRecipe.model');

jest.mock('../../models/beerRecipe.model');

describe('BeerRecipe Controller', () => {
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

  describe('getAll', () => {
    it('should return all recipes', async () => {
      const fakeRecipes = [{ name: 'A' }, { name: 'B' }];
      const mockSort = jest.fn().mockReturnValue(Promise.resolve(fakeRecipes));
      BeerRecipe.find.mockReturnValue({ sort: mockSort });
      await beerRecipeController.getAll(req, res);
      console.log(res.json);
      expect(res.json).toHaveBeenCalledWith(fakeRecipes);
    });
  });

  describe('getOne', () => {
    it('should return a recipe by id', async () => {
      req.params.id = '123';
      const fakeRecipe = { name: 'A' };
      BeerRecipe.findById.mockResolvedValue(fakeRecipe);
      await beerRecipeController.getOne(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeRecipe);
    });
    it('should return 404 if not found', async () => {
      req.params.id = '123';
      BeerRecipe.findById.mockResolvedValue(null);
      await beerRecipeController.getOne(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not found');
    });
  });

  describe('getByName', () => {
    it('should return recipes by name', async () => {
      req.params.name = 'Ale';
      const fakeRecipes = [{ name: 'Ale' }];
      BeerRecipe.find.mockResolvedValue(fakeRecipes);
      await beerRecipeController.getByName(req, res);
      expect(res.json).toHaveBeenCalledWith(fakeRecipes);
    });
    it('should return 400 if name missing', async () => {
      req.params.name = undefined;
      await beerRecipeController.getByName(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Name is required');
    });
    it('should return 404 if no recipes found', async () => {
      req.params.name = 'Ale';
      BeerRecipe.find.mockResolvedValue([]);
      await beerRecipeController.getByName(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('No recipes found');
    });
  });

  describe('create', () => {
    it('should create and return a new recipe', async () => {
      const fakeRecipe = { save: jest.fn().mockResolvedValue(), toJSON: () => ({ name: 'New' }) };
      BeerRecipe.mockImplementation(() => fakeRecipe);
      req.body = { name: 'New' };
      await beerRecipeController.create(req, res);
      expect(fakeRecipe.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeRecipe);
    });
  });

  describe('update', () => {
    it('should update and return a recipe', async () => {
      req.params.id = '123';
      req.body = { name: 'Updated' };
      const updatedRecipe = { name: 'Updated' };
      BeerRecipe.findByIdAndUpdate.mockResolvedValue(updatedRecipe);
      await beerRecipeController.update(req, res);
      expect(res.json).toHaveBeenCalledWith(updatedRecipe);
    });
    it('should return 404 if not found', async () => {
      req.params.id = '123';
      BeerRecipe.findByIdAndUpdate.mockResolvedValue(null);
      await beerRecipeController.update(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not found');
    });
  });

  describe('delete', () => {
    it('should delete and confirm success', async () => {
      req.params.id = '123';
      BeerRecipe.findByIdAndDelete.mockResolvedValue({});
      await beerRecipeController.delete(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
    it('should return 404 if not found', async () => {
      req.params.id = '123';
      BeerRecipe.findByIdAndDelete.mockResolvedValue(null);
      await beerRecipeController.delete(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith('Not found');
    });
  });
});
