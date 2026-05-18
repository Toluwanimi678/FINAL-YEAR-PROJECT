"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type ArtistProfile = {
  username: string;
  artStyle?: string[];
  specification?: string[];
  minBudget?: number;
  maxBudget?: number;
  communication?: string[];
  capacity?: number;
  currentActiveCommissions?: number;
  management?: string;
};

export default function ArtistProfilePage() {
  const params = useParams();

  const username = params.username;

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/artists/${username}`)

        const data = await response.json();

        setArtist(data);
      } catch (err) {
        console.error("Failed to fetch artist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [params.username]);

  if (loading) {
    return (
      <div className="p-10 text-white">
        Loading profile...
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="p-10 text-red-400">
        Artist not found.
      </div>
    );
  }

  const percentage =
    ((artist.currentActiveCommissions || 0) /
      (artist.capacity || 1)) *
    100;

  return (
    <main className="min-h-screen text-white"
    style={{
    backgroundImage: `url('/generalBg.jpg')`
    }}>
        <div className="bg-black/50">
      <div className="max-w-4xl mx-auto bg-zinc-800 rounded-3xl p-8 shadow-lg py-2">

        {/* HEADER */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-zinc-700" />

          <div>
            <h1 className="text-4xl font-bold">
              @{artist.username}
            </h1>

            <p className="text-zinc-400 mt-2">
              {artist.management}
            </p>
          </div>
        </div>

        {/* STYLES */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Art Styles
          </h2>

          <div className="flex flex-wrap gap-3">
            {artist.artStyle?.map((style, index) => (
              <span
                key={index}
                className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full"
              >
                {style}
              </span>
            ))}
          </div>
        </section>

        {/* SPECIALIZATION */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Specializations
          </h2>

          <div className="flex flex-wrap gap-3">
            {artist.specification?.map((spec, index) => (
              <span
                key={index}
                className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>
        </section>

        {/* BUDGET */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Budget Range
          </h2>

          <p className="text-zinc-300 text-lg">
            ₦{artist.minBudget} - ₦{artist.maxBudget}
          </p>
        </section>

        {/* COMMUNICATION */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Communication Style
          </h2>

          <div className="flex flex-wrap gap-3">
            {artist.communication?.map((comm, index) => (
              <span
                key={index}
                className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full"
              >
                {comm}
              </span>
            ))}
          </div>
        </section>

        {/* CAPACITY */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Commission Capacity
          </h2>

          <div className="w-full bg-zinc-700 rounded-full h-5 overflow-hidden">
            <div
              className="bg-pink-500 h-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="mt-3 text-zinc-300">
            {artist.currentActiveCommissions || 0} /{" "}
            {artist.capacity} commissions active
          </p>
        </section>

        {/* GALLERY PLACEHOLDER */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Artwork Gallery
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="aspect-square bg-zinc-700 rounded-2xl" />
            <div className="aspect-square bg-zinc-700 rounded-2xl" />
            <div className="aspect-square bg-zinc-700 rounded-2xl" />
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}