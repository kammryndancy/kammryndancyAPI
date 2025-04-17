require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const beerRecipeRoutes = require('./routes/beerRecipe');
const scavengerHuntRoutes = require('./routes/scavengerHunt');
const { scrapeAndSaveAll } = require('./brewfatherScraper');
const { loadScavengerHuntItems } = require('./controllers/scavengerHuntController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('MongoDB connected');
    await loadScavengerHuntItems(); // Load items at startup
  })
  .catch(err => { console.error(err); process.exit(1); });

app.use('/api/beerrecipes', beerRecipeRoutes);
app.use('/api/scavengerhunt', scavengerHuntRoutes);

app.post('/api/scrape', async (req, res) => {
  try {
    await scrapeAndSaveAll();
    res.send('Scraping and saving completed!');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
