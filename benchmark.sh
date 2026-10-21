#!/usr/bin/env bash

PG_CONTAINER="elastic_search_postgres"
PG_USER="postgres"
PG_DB="elastic_search_db"
ES_URL="http://localhost:9200"
ES_AUTH="elastic:elastic"
RUNS=5
QUERIES=("laptop" "macbook pro" "red shirt" "wireless headphones" "phone charger")

pg_time() {
  # Prints the query time in ms, as reported by psql \timing
  docker exec -i "$PG_CONTAINER" psql -U "$PG_USER" -d "$PG_DB" \
    -c '\timing on' \
    -c "SELECT id, title, category FROM products WHERE title ILIKE '%$1%' LIMIT 20;" \
    | awk '/^Time:/ {print $2}'
}

es_time() {
  # Prints the total request time in ms, as measured by curl
  curl -s -o /dev/null -u "$ES_AUTH" \
    -H 'Content-Type: application/json' \
    -w '%{time_total}' \
    "$ES_URL/products/_search" \
    -d "{\"size\":20,\"track_total_hits\":true,\"query\":{\"match\":{\"title\":{\"query\":\"$1\",\"operator\":\"and\"}}}}" \
    | awk '{printf "%.3f", $1 * 1000}'
}

avg() { awk '{s+=$1} END {printf "%.1f", s/NR}'; }

# Warm-up so the first query does not skew the results
pg_time "warmup" > /dev/null
es_time "warmup" > /dev/null

printf "\nRuns per query: %s\n\n" "$RUNS"
printf "%-22s %-16s %s\n" "Query" "Postgres (ms)" "Elasticsearch (ms)"
printf -- "------------------------------------------------------------\n"

PG_ALL=""
ES_ALL=""

for q in "${QUERIES[@]}"; do
  PG_TIMES=""
  ES_TIMES=""
  for ((i = 0; i < RUNS; i++)); do
    PG_TIMES+="$(pg_time "$q")"$'\n'
    ES_TIMES+="$(es_time "$q")"$'\n'
  done
  PG_ALL+="$PG_TIMES"
  ES_ALL+="$ES_TIMES"
  printf "%-22s %-16s %s\n" "$q" \
    "$(echo "$PG_TIMES" | sed '/^$/d' | avg)" \
    "$(echo "$ES_TIMES" | sed '/^$/d' | avg)"
done

PG_AVG=$(echo "$PG_ALL" | sed '/^$/d' | avg)
ES_AVG=$(echo "$ES_ALL" | sed '/^$/d' | avg)

printf -- "------------------------------------------------------------\n"
printf "%-22s %-16s %s\n" "OVERALL AVERAGE" "$PG_AVG" "$ES_AVG"
awk -v p="$PG_AVG" -v e="$ES_AVG" 'BEGIN {printf "\nElasticsearch is %.1fx faster\n\n", p / e}'
