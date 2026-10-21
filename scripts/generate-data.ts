import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { join } from "path";
import { CSV_PATH, DEFAULT_ROW_COUNT, GENERATE_PROGRESS_INTERVAL } from "../lib/data/schema";

const BRANDS = ["Apple", "Dell", "HP", "Lenovo", "Asus", "Samsung", "Sony", "Nike", "Adidas", "Logitech"];
const COLORS = ["red", "blue", "black", "white", "green", "silver", "grey"];
const EXTRAS = ["pro", "max", "mini", "lite", "plus", "ultra", "2024", "edition", "series 5", "wireless"];

const CATEGORIES_AND_TYPES: Record<string, string[]> = {
  Laptops: ["laptop", "macbook pro", "gaming laptop", "ultrabook", "chromebook"],
  "Laptop Accessories": ["laptop bag", "laptop stand", "laptop charger", "laptop sleeve"],
  Phones: ["smartphone", "mobile phone", "phone case", "phone charger"],
  Clothing: ["cotton shirt", "leather jacket", "denim jeans", "running shoes", "hoodie"],
  Home: ["coffee machine", "desk lamp", "office chair", "water bottle", "backpack"],
  Electronics: ["headphones", "bluetooth speaker", "smart watch", "monitor", "keyboard"],
};

const CATEGORIES = Object.keys(CATEGORIES_AND_TYPES);

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateTitle(index: number): string {
  const category = randomItem(CATEGORIES);
  const productType = randomItem(CATEGORIES_AND_TYPES[category]);
  const brand = randomItem(BRANDS);
  const color = randomItem(COLORS);
  const extra = randomItem(EXTRAS);
  return `${brand} ${color} ${productType} ${extra} ${index}`;
}

async function generateCSV(rowCount: number): Promise<void> {
  const dataDir = join(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });

  const filePath = join(process.cwd(), CSV_PATH);
  const stream = createWriteStream(filePath, { encoding: "utf8" });

  await new Promise<void>((resolve, reject) => {
    stream.write("title,category\n", (err: Error | null | undefined) => {
      if (err) reject(err);
      else resolve();
    });
  });

  let written = 0;

  for (let i = 1; i <= rowCount; i++) {
    const title = generateTitle(i);
    const category = randomItem(CATEGORIES);
    const line = `"${title}","${category}"\n`;

    const canContinue = stream.write(line);

    if (!canContinue) {
      await new Promise<void>((resolve) => stream.once("drain", resolve));
    }

    written++;

    if (written % GENERATE_PROGRESS_INTERVAL === 0) {
      console.log(`Generated ${written.toLocaleString()} rows...`);
    }
  }

  await new Promise<void>((resolve, reject) => {
    stream.end((err: Error | null | undefined) => {
      if (err) reject(err);
      else resolve();
    });
  });

  console.log(`✓ Generated ${written.toLocaleString()} rows → ${filePath}`);
}

async function main(): Promise<void> {
  const rowCount = parseInt(process.argv[2] || String(DEFAULT_ROW_COUNT), 10);

  if (isNaN(rowCount) || rowCount <= 0) {
    console.error("Invalid row count. Please provide a positive number.");
    process.exit(1);
  }

  console.log(`Generating ${rowCount.toLocaleString()} product rows...\n`);

  const start = Date.now();
  await generateCSV(rowCount);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\nCompleted in ${elapsed}s`);
}

main().catch((err) => {
  console.error("Error generating CSV:", err);
  process.exit(1);
});
