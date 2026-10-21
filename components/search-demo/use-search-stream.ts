"use client";

import { useState } from "react";
import { StreamMessage } from "@/lib/search/types";

interface SearchState {
  postgres: StreamMessage | null;
  elasticsearch: StreamMessage | null;
  isSearching: boolean;
  error: string | null;
}

export function useSearchStream() {
  const [state, setState] = useState<SearchState>({
    postgres: null,
    elasticsearch: null,
    isSearching: false,
    error: null,
  });

  const search = async (term: string) => {
    setState({
      postgres: null,
      elasticsearch: null,
      isSearching: true,
      error: null,
    });

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const message: StreamMessage = JSON.parse(line);

              setState((prev) => ({
                ...prev,
                [message.engine]: message,
              }));
            } catch (err) {
              console.error("Failed to parse message:", err);
            }
          }
        }
      }

      setState((prev) => ({ ...prev, isSearching: false }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setState((prev) => ({
        ...prev,
        isSearching: false,
        error: errorMessage,
      }));
    }
  };

  return { ...state, search };
}
