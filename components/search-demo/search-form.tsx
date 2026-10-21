"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { SEARCH_TERM_MAX_LENGTH } from "@/lib/data/schema";

interface SearchFormProps {
  onSearch: (term: string) => void;
  isSearching: boolean;
}

export function SearchForm({ onSearch, isSearching }: SearchFormProps) {
  const [term, setTerm] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (term.trim()) {
      onSearch(term.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="Search products..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        maxLength={SEARCH_TERM_MAX_LENGTH}
        disabled={isSearching}
        className="flex-1"
      />
      <Button type="submit" disabled={isSearching || !term.trim()}>
        <Search className="size-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
