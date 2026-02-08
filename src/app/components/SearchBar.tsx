import React, { useState } from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
  <div className="gap-2 p-1 rounded-lg mb-2">
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search speakers, forums, events, exhibitors..."
          className="w-full px-4 py-2 pl-10 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
      </div>
    </form>
  </div>
  );
}
