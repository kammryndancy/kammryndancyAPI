const mongoose = require('mongoose');
const BeerRecipe = mongoose.models.BeerRecipe || require('../models/beerRecipe.model');

exports.getAll = async (req, res) => {
  const recipes = await BeerRecipe.find();
  res.json(recipes);
};

exports.getOne = async (req, res) => {
  const recipe = await BeerRecipe.findById(req.params.id);
  if (!recipe) return res.status(404).send('Not found');
  res.json(recipe);
};

exports.getByName = async (req, res) => {
  const name = req.params.name;
  if (!name) return res.status(400).send('Name is required');
  // Case-insensitive partial match using regex
  const regex = new RegExp(name, 'i');
  const recipes = await BeerRecipe.find({ name: { $regex: regex } });
  if (!recipes.length) return res.status(404).send('No recipes found');
  res.json(recipes);
};

exports.create = async (req, res) => {
  const recipe = new BeerRecipe(req.body);
  await recipe.save();
  res.status(201).json(recipe);
};

exports.update = async (req, res) => {
  const recipe = await BeerRecipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!recipe) return res.status(404).send('Not found');
  res.json(recipe);
};

exports.delete = async (req, res) => {
  const recipe = await BeerRecipe.findByIdAndDelete(req.params.id);
  if (!recipe) return res.status(404).send('Not found');
  res.json({ success: true });
};
