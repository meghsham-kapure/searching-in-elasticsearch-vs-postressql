import { createReadStream } from "fs";
import { parse } from "csv-parse";
import { getPool } from "../lib/db/client";
import { getClient } from "../lib/elastic/client";
import {
  TABLE_NAME,
  INDEX_NAME,
  INDEX_MAPPING,
  CSV_PATH,
  PG_BATCH_SIZE,
  ES_BATCH_SIZE,
  PROGRESS_INTERVAL,
} from "../lib/data/schema";

interface Product {
  title: string;
  category: string;
}

async function setupPostgres(): Promise<void> {
  const pool = getPool();
  console.log("Setting up PostgreSQL...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `);

  await pool.query(`TRUNCATE TABLE ${TABLE_NAME} RESTART IDENTITY`);
  console.log("✓ PostgreSQL table ready\n");
}

async function setupElasticsearch(): Promise<void> {
  const elastic = getClient();
  console.log("Setting up Elasticsearch...");

  const indexExists = await elastic.indices.exists({ index: INDEX_NAME });
  if (indexExists) {
    await elastic.indices.delete({ index: INDEX_NAME });
  }

  await elastic.indices.create({
    index: INDEX_NAME,
    mappings: INDEX_MAPPING,
  });

  console.log("✓ Elasticsearch index ready\n");
}

async function insertPostgresBatch(batch: Product[]): Promise<void> {
  if (batch.length === 0) return;

  const pool = getPool();
  const values: string[] = [];
  const params: string[] = [];
  let paramIndex = 1;

  for (const product of batch) {
    values.push(`($${paramIndex}, $${paramIndex + 1})`);
    params.push(product.title, product.category);
    paramIndex += 2;
  }

  const query = `INSERT INTO ${TABLE_NAME} (title, category) VALUES ${values.join(", ")}`;
  await pool.query(query, params);
}

async function insertElasticsearchBatch(batch: Product[]): Promise<void> {
  if (batch.length === 0) return;

  const elastic = getClient();
  const body: Array<Record<string, unknown> | Product> = [];

  for (const product of batch) {
    body.push({ index: { _index: INDEX_NAME } });
    body.push(product);
  }

  await elastic.bulk({ body });
}

async function populate(): Promise<void> {
  const start = Date.now();

  await setupPostgres();
  await setupElasticsearch();

  console.log("Streaming CSV and populating both stores...\n");

  let totalRows = 0;
  let pgBatch: Product[] = [];
  let esBatch: Product[] = [];

  const parser = createReadStream(CSV_PATH).pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
    })
  );

  for await (const record of parser) {
    const title = record.title?.trim();
    const category = record.category?.trim();

    if (!title || !category) continue;

    const product: Product = { title, category };

    // PostgreSQL batch
    pgBatch.push(product);
    if (pgBatch.length >= PG_BATCH_SIZE) {
      await insertPostgresBatch(pgBatch);
      pgBatch = [];
    }

    // Elasticsearch batch
    esBatch.push(product);
    if (esBatch.length >= ES_BATCH_SIZE) {
      await insertElasticsearchBatch(esBatch);
      esBatch = [];
    }

    totalRows++;

    if (totalRows % PROGRESS_INTERVAL === 0) {
      console.log(`Processed ${totalRows.toLocaleString()} rows...`);
    }
  }

  // Flush remaining batches
  if (pgBatch.length > 0) {
    await insertPostgresBatch(pgBatch);
  }

  if (esBatch.length > 0) {
    await insertElasticsearchBatch(esBatch);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`\n✓ Populated ${totalRows.toLocaleString()} rows in ${elapsed}s`);

  await getPool().end();
  await getClient().close();
}

populate().catch((err) => {
  console.error("Error populating data:", err);
  process.exit(1);
});
