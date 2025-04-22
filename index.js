require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const beerRecipeRoutes = require('./routes/beerRecipe');
const scavengerHuntRoutes = require('./routes/scavengerHunt');
const blacklistRoutes = require('./routes/blacklist');
const healthRoutes = require('./routes/health');
const { scrapeAndSaveAll } = require('./brewfatherScraper');
const { loadScavengerHuntItems } = require('./controllers/scavengerHuntController');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:3000',
  'http://kammryndancy.com',
  'https://kammryndancy.com'
];

// Enable CORS for requests from the configured frontend origin
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// Health check route (no auth)
app.use('/health', healthRoutes);

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
app.use('/api/blacklist', blacklistRoutes);

app.post('/api/scrape', auth, async (req, res) => {
  try {
    await scrapeAndSaveAll();
    res.send('Scraping and saving completed!');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
