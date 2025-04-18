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

## API Authentication & Roles

All `/api` endpoints are protected by an authentication middleware. Requests must include an `Authorization` header in the following format:

```
Authorization: Basic <base64(USER_ID:API_KEY[:role])>
```
- `USER_ID` and `API_KEY` must match the values in your `.env` file.
- Optionally, you can include a `role` (e.g., `admin`).
- If the request's `Origin` header matches your configured `FRONTEND_ORIGIN`, the user is automatically assigned the `frontend` role.
- The user's role is attached to `req.user` for use in route handlers.

### Example (using curl)

```
USER_ID=your_user_id
API_KEY=your_api_key
AUTH=$(echo -n "$USER_ID:$API_KEY" | base64)
curl -H "Authorization: Basic $AUTH" http://localhost:3000/api/scavengerhunt
```

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
   API_KEY=your_api_key
   USER_ID=your_user_id
   FRONTEND_ORIGIN=http://localhost:3000
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
- User roles are supported for fine-grained access control (see `middleware/auth.js` and `middleware/roles.js`).

## License
MIT
