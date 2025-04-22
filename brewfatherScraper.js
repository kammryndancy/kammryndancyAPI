const axios = require('axios');
const mongoose = require('mongoose');
const BeerRecipe = mongoose.models.BeerRecipe || require('./models/beerRecipe.model');
const BlacklistedBatch = require('./models/blacklistedBatch.model');

async function fetchBatches(startAfter = null) {
  const { BREWFATHER_USERID, BREWFATHER_API_KEY } = process.env;
  if (!BREWFATHER_USERID || !BREWFATHER_API_KEY) {
    throw new Error('Missing Brewfather credentials (BREWFATHER_USERID or BREWFATHER_API_KEY)');
  }
  const authString = Buffer.from(`${BREWFATHER_USERID}:${BREWFATHER_API_KEY}`).toString('base64');
  let url = 'https://api.brewfather.app/v2/batches?complete=true&limit=50&order_by=batchNo';
  if (startAfter) url += `&start_after=${startAfter}`;
  const headers = { 'authorization': `Basic ${authString}` };
  const response = await axios.get(url, { headers });
  return response.data;
}

function transformBatchToBeerRecipe(batch) {
  return {
    name: batch.recipe?.name || '',
    youtubeUrl: batch.recipe?.youtubeUrl || undefined,
    imageUrl: batch.recipe?.img_url || undefined,
    malts: batch.batchFermentables?.filter(f => f.type === 'Grain').map(f => f.name) || [],
    hops: batch.batchHops?.map(h => h.name) || [],
    yeast: batch.batchYeasts?.map(y => y.name + "(" + y.productId + ")") || [],
    adjuncts: batch.batchFermentables?.filter(f => f.type !== 'Grain').map(f => f.name) || [],
    abv: batch.measuredAbv || batch.estimatedAbv || 0,
    og: batch.measuredOg || batch.estimatedOg || 0,
    fg: batch.measuredFg || batch.estimatedFg || 0,
    srm: batch.estimatedColor || 0,
    ibu: batch.estimatedIbu || 0,
    buGu: batch.estimatedBuGuRatio || 0,
    description: batch.recipe?.notes || '',
    awards: [],
    brewfatherId: batch._id, // Store Brewfather batch _id for deduplication
    recipeUrl: batch.recipe?.url || undefined
  };
}

async function scrapeAndSaveAll(fetchBatchesImpl = fetchBatches) {
  let startAfter = null;
  let hasMore = true;
  let totalNew = 0;

  // Fetch blacklist from DB
  const blacklistedDocs = await BlacklistedBatch.find({}, { brewfatherId: 1 });
  const blacklist = new Set(blacklistedDocs.map(b => b.brewfatherId));

  while (hasMore) {
    const batches = await fetchBatchesImpl(startAfter);
    if (!batches.length) break;

    // Check which batches are new and not blacklisted
    const brewfatherIds = batches.map(b => b._id);
    const existing = await BeerRecipe.find({ brewfatherId: { $in: brewfatherIds } }, { brewfatherId: 1 });
    const existingIds = new Set(existing.map(e => e.brewfatherId));

    const newBatches = batches.filter(b => !existingIds.has(b._id) && !blacklist.has(b._id));
    if (newBatches.length === 0) break;

    const recipes = newBatches.map(transformBatchToBeerRecipe);
    await BeerRecipe.insertMany(recipes);
    totalNew += recipes.length;

    // Pagination: move to next batch
    startAfter = batches[batches.length - 1]._id;
    hasMore = batches.length === 50;
  }

  console.log(`Saved ${totalNew} new recipes`);
  return totalNew;
}

module.exports = {
  fetchBatches,
  transformBatchToBeerRecipe,
  scrapeAndSaveAll
};
