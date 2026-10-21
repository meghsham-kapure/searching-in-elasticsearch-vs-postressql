import { NextRequest } from "next/server";
import { z } from "zod";
import { searchPostgres } from "@/lib/search/postgres";
import { searchElasticsearch } from "@/lib/search/elasticsearch";
import { StreamMessage } from "@/lib/search/types";
import { SEARCH_TERM_MAX_LENGTH } from "@/lib/data/schema";

const searchSchema = z.object({
  term: z.string().min(1, "Search term is required").max(SEARCH_TERM_MAX_LENGTH, `Search term must be ${SEARCH_TERM_MAX_LENGTH} characters or less`),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = searchSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error.issues[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { term } = validation.data;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const pgPromise = searchPostgres(term).then(
          (result) => {
            const message: StreamMessage = {
              engine: "postgres",
              ...result,
            };
            controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
          },
          (error) => {
            const errorMessage: StreamMessage = {
              engine: "postgres",
              timeMs: 0,
              totalCount: 0,
              results: [],
              error: error instanceof Error ? error.message : "PostgreSQL search failed",
            };
            controller.enqueue(encoder.encode(JSON.stringify(errorMessage) + "\n"));
          }
        );

        const esPromise = searchElasticsearch(term).then(
          (result) => {
            const message: StreamMessage = {
              engine: "elasticsearch",
              ...result,
            };
            controller.enqueue(encoder.encode(JSON.stringify(message) + "\n"));
          },
          (error) => {
            const errorMessage: StreamMessage = {
              engine: "elasticsearch",
              timeMs: 0,
              totalCount: 0,
              results: [],
              error: error instanceof Error ? error.message : "Elasticsearch search failed",
            };
            controller.enqueue(encoder.encode(JSON.stringify(errorMessage) + "\n"));
          }
        );

        await Promise.allSettled([pgPromise, esPromise]);
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
