import { Client } from "@elastic/elasticsearch";
import { env } from "../config/env";

let client: Client | null = null;

export function getClient(): Client {
  if (!client) {
    client = new Client({
      node: env.ELASTICSEARCH_URL,
      auth: {
        username: env.ELASTICSEARCH_USERNAME,
        password: env.ELASTICSEARCH_PASSWORD,
      },
    });
  }

  return client;
}

export default getClient();
