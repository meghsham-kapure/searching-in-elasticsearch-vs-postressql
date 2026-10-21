"use client";

import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  isSearching: boolean;
}

export function SearchBar({ value, onChange, onSearch, isSearching }: SearchBarProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSearch();
  }

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9 pr-9 h-11 text-base"
          placeholder="Search across Postgres & Elasticsearch…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
          autoFocus
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button
        onClick={onSearch}
        disabled={isSearching || !value.trim()}
        className="h-11 px-6 shrink-0"
      >
        {isSearching ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Searching…
          </>
        ) : (
          "Search"
        )}
      </Button>
    </div>
  );
}
