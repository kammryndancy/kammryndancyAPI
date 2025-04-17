# kammryndancyAPI

A Node.js RESTful API for:
- Scraping brewing batches from the Brewfather API and storing them in MongoDB
- Managing scavenger hunt items (animals, plants, insects) with images and descriptions

## Features

### Brewfather Batch Scraper
- Fetches batches from the Brewfather API using Basic Auth (userid:apikey, base64 encoded)
- Transforms and stores batch data as `BeerRecipe` documents in MongoDB
- Prevents duplicates using unique identifiers
- Environment-based configuration for Brewfather credentials and MongoDB connection

### Scavenger Hunt Items
- Loads scavenger hunt items from `scavengerHuntItems.json` into MongoDB on app start
- REST API to:
  - Get all items
  - Get random items with optional filters (category, season, count)
  - Get a specific item by name, category, and season
  - Update an item by name, category, and season
  - Add a new item

## API Endpoints

### BeerRecipe
- `GET /api/beerrecipes` — List all beer recipes
- `GET /api/beerrecipes/:id` — Get a beer recipe by ID
- `POST /api/beerrecipes` — Create a new beer recipe
- `PUT /api/beerrecipes/:id` — Update a beer recipe
- `DELETE /api/beerrecipes/:id` — Delete a beer recipe
- `POST /api/scrape` — Scrape and save new batches from Brewfather

### Scavenger Hunt
- `GET /api/scavengerhunt` — List all items
- `GET /api/scavengerhunt/filter?count=5&category=plants&season=spring` — Get up to 5 random plant items for spring
- `GET /api/scavengerhunt/:name/:category/:season` — Get a specific item
- `PUT /api/scavengerhunt/:name/:category/:season` — Update an item
- `POST /api/scavengerhunt` — Add a new item

## Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/kammryndancy/kammryndancyAPI.git
   cd kammryndancyAPI
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment:**
   Create a `.env` file (see `.env.example`):
   ```env
   MONGODB_URI=mongodb://localhost:27017/kammryndancyAPI
   BREWFATHER_USERID=your_brewfather_userid
   BREWFATHER_API_KEY=your_brewfather_api_key
   PORT=3000
   ```
4. **Start the server:**
   ```sh
   npm run start
   # or for development (auto-reload):
   npm run dev
   ```

## Notes
- All API requests and responses are JSON.
- The scavenger hunt loader will upsert items from the JSON file at startup.
- The Brewfather API requires a valid userid and API key (see their docs for details).
- The project uses Mongoose for MongoDB object modeling.

## License
MIT
