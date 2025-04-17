const fs = require('fs');
const path = require('path');
const ScavengerHuntItem = require('../models/scavengerHuntItem.model');

// Load items from JSON and insert/update into MongoDB
async function loadScavengerHuntItems() {
  const filePath = path.join(__dirname, '../scavengerHuntItems.json');
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = [];
  for (const category of Object.keys(jsonData)) {
    for (const season of Object.keys(jsonData[category])) {
      for (const item of jsonData[category][season]) {
        items.push({ ...item, category, season });
      }
    }
  }
  for (const item of items) {
    await ScavengerHuntItem.findOneAndUpdate(
      { name: item.name, category: item.category, season: item.season },
      item,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

// API: Get all items
async function getAllItems(req, res) {
  const items = await ScavengerHuntItem.find();
  res.json(items);
}

// API: Get items with filters and limit, randomly sampled
async function getFilteredItems(req, res) {
  const { count, category, season } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (season) filter.season = season;
  let sampleSize = 5;
  if (typeof count !== 'undefined') {
    const parsed = parseInt(count, 10);
    if (!isNaN(parsed)) {
      sampleSize = Math.max(1, Math.min(parsed, 20));
    }
  }
  const pipeline = [
    { $match: filter },
    { $sample: { size: sampleSize } }
  ];
  const items = await ScavengerHuntItem.aggregate(pipeline);
  res.json(items);
}

// API: Get a single item by name, category, and season
async function getItem(req, res) {
  const { name, category, season } = req.params;
  const item = await ScavengerHuntItem.findOne({ name, category, season });
  if (!item) return res.status(404).json({ error: 'Item not found' });
  res.json(item);
}

// API: Update an item by name, category, and season
async function updateItem(req, res) {
  const { name, category, season } = req.params;
  const { image, description } = req.body;
  console.log(name, category, season, image, description);
  const updated = await ScavengerHuntItem.findOneAndUpdate(
    { name, category, season },
    { image, description },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: 'Item not found' });
  res.json(updated);
}

// API: Add a new scavenger hunt item
async function addItem(req, res) {
  try {
    const { name, category, season, image, description } = req.body;
    if (!name || !category || !season || !image || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const exists = await ScavengerHuntItem.findOne({ name, category, season });
    if (exists) {
      return res.status(409).json({ error: 'Item already exists' });
    }
    const item = new ScavengerHuntItem({ name, category, season, image, description });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  loadScavengerHuntItems,
  getAllItems,
  getFilteredItems,
  updateItem,
  getItem,
  addItem
};
