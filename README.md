# Elastic Search Implementation

A Next.js application demonstrating search speed comparison between PostgreSQL `ILIKE` and Elasticsearch on the same dataset.

## Features

- Side-by-side comparison of PostgreSQL and Elasticsearch search performance
- Real-time streaming search results
- Automatic "fastest" engine highlighting
- Up to 5 million product records support
- TypeScript with strict type safety
- Production-grade error handling and validation

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: PostgreSQL 17, Elasticsearch 8.17.0
- **Validation**: Zod
- **Data Processing**: csv-parse, pg, @elastic/elasticsearch v8

## Setup

### 1. Start Docker Containers

Ensure you have Docker running, then start PostgreSQL and Elasticsearch:

```bash
docker compose up -d
```

This will start:
- **PostgreSQL 17** on `localhost:5432`
  - User: `postgres`
  - Password: `postgres`
  - Database: `elastic_search_db`
- **Elasticsearch 8.17.0** on `localhost:9200`
  - User: `elastic`
  - Password: `elastic`

Verify containers are running:
```bash
docker ps
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/elastic_search_db
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=elastic
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Generate Test Data

Generate 1 million product records (or specify a custom count):

```bash
# Generate 1 million rows (default)
pnpm generate

# Or specify a custom count
pnpm generate 5000000
```

This creates `data/products.csv` with synthetic product data.

### 5. Populate Databases

Load the generated CSV into both PostgreSQL and Elasticsearch:

```bash
pnpm populate
```

This will:
- Create the `products` table in PostgreSQL
- Create the `products` index in Elasticsearch
- Stream and batch-insert all records into both stores
- Display progress every 50,000 rows

### 6. Verify Data

Check that both stores have the same row count:

**PostgreSQL:**
```bash
docker exec -it elastic_search_postgres psql -U postgres -d elastic_search_db -c "SELECT COUNT(*) FROM products;"
```

**Elasticsearch:**
```bash
curl -u elastic:elastic http://localhost:9200/products/_count
```

### 7. Start the Development Server

```bash
pnpm dev
```

The application will be available at:
- **Main app**: http://localhost:3000
- **Search demo**: http://localhost:3000/search-demo

## Project Structure

```
lib/
├── config/
│   └── env.ts              # Zod-validated environment variables
├── db/
│   └── client.ts           # Singleton PostgreSQL pool
├── elastic/
│   └── client.ts           # Singleton Elasticsearch client
├── search/
│   ├── types.ts            # Shared TypeScript types
│   ├── postgres.ts         # PostgreSQL search function
│   └── elasticsearch.ts    # Elasticsearch search function
└── data/
    └── schema.ts           # Database schema and constants

scripts/
├── generate-data.ts        # CSV data generation
└── populate.ts             # Database population

app/
├── api/search/route.ts     # Streaming search API endpoint
└── search-demo/page.tsx    # Search comparison UI

components/
└── search-demo/
    ├── search-form.tsx         # Search input component
    ├── engine-card.tsx         # Result card for each engine
    ├── results-list.tsx        # Results list component
    └── use-search-stream.ts    # Client-side streaming hook
```

## Usage

1. Navigate to http://localhost:3000/search-demo
2. Enter a search term (e.g., "Apple laptop")
3. Click "Search" or press Enter
4. View side-by-side results with timing comparison
5. The faster engine will be highlighted with a "Fastest" badge

## Configuration

All constants are defined in `lib/data/schema.ts`:

- `SEARCH_RESULT_LIMIT`: Number of results to return (default: 20)
- `SEARCH_TERM_MAX_LENGTH`: Maximum search term length (default: 100)
- `SEARCH_TIMEOUT_MS`: Query timeout (default: 10,000ms)
- `PG_BATCH_SIZE`: PostgreSQL insert batch size (default: 1,000)
- `ES_BATCH_SIZE`: Elasticsearch insert batch size (default: 5,000)

## Stopping

To stop the Docker containers:

```bash
docker compose down
```

To remove volumes (deletes all data):

```bash
docker compose down -v
```

## Scripts

- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate [count]` - Generate CSV data
- `pnpm populate` - Populate databases from CSV

## License

MIT
