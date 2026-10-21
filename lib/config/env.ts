import { z } from "zod";
import dotenv from "dotenv";

// Load .env.local for scripts (Next.js loads it automatically for the app)
if (typeof window === "undefined" && !process.env.NEXT_RUNTIME) {
  dotenv.config({ path: ".env.local" });
}

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL is required"),
  ELASTICSEARCH_URL: z.string().url().min(1, "ELASTICSEARCH_URL is required"),
  ELASTICSEARCH_USERNAME: z.string().min(1, "ELASTICSEARCH_USERNAME is required"),
  ELASTICSEARCH_PASSWORD: z.string().min(1, "ELASTICSEARCH_PASSWORD is required"),
});

function validateEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL,
    ELASTICSEARCH_USERNAME: process.env.ELASTICSEARCH_USERNAME,
    ELASTICSEARCH_PASSWORD: process.env.ELASTICSEARCH_PASSWORD,
  });

  if (!result.success) {
    console.error("❌ Environment validation failed:");
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    });
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

export const env = validateEnv();
