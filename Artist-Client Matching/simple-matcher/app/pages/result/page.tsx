"use client";

import { useState, useEffect } from "react";
import { resetData } from "../../services/api";

type Match = {
  artist: string;
  score: number;
};

export default function ResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("matches");

    if (stored) {
      setMatches(JSON.parse(stored));
    }
  }, []);

  const handleReset = () => {
    resetData();
    setMatches([]);
    localStorage.removeItem("matches");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Matching Results</h1>

      <button
        onClick={handleReset}
        className="bg-red-600 text-white px-4 py-2 mb-4"
      >
        Reset Data
      </button>

      <ul className="space-y-2 mt-4">
        {matches.map((m, i) => (
          <li key={i} className="border p-3">
            {m.artist} (Score: {m.score})
          </li>
        ))}
      </ul>
    </div>
  );
}