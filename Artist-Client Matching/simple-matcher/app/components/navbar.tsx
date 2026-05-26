"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [profilePath, setProfilePath] = useState<string | null>(null);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");
    const storedArtist = localStorage.getItem("artist"); 

    if (storedClient) {
      const client = JSON.parse(storedClient);
      setUsername(client.username);
      setProfilePath(`/pages/client/${client.username}`);
    } else if (storedArtist) {
      const artist = JSON.parse(storedArtist);
      setUsername(artist.username);
      setProfilePath(`/pages/artist/${artist.username}`);
    }
  }, []);

  const handleProfileClick = () => {
    if (profilePath) {
      router.push(profilePath);
    } else {
      router.push("/pages/sign-in");
    }
  };

  return (
    <nav className="p-4 bg-gray-900 text-white flex justify-between items-center sticky">
      
      {/* LEFT — nav links */}
      <div className="flex gap-8">
        <Link href="/" className="hover:text-[#73d9ed]">Home</Link>
        <Link href="/pages/client/request" className="hover:text-[#73d9ed]">Requests</Link>
      </div>

      {/* RIGHT — auth */}
      <div className="flex items-center gap-6">
        {username ? (
          <>
            <span className="text-zinc-400 text-sm">
              Logged in as{" "}
              <span className="text-white font-semibold">@{username}</span>
            </span>
            <button
              onClick={handleProfileClick}
              className="bg-pink-500 hover:bg-pink-600 transition px-4 py-2 rounded-xl text-sm font-semibold"
            >
              My Profile
            </button>
          </>
        ) : (
          <>
            <Link href="/pages/sign-in" className="hover:text-[#73d9ed]">Log in</Link>
            <Link href="/pages/sign-up" className="hover:text-[#73d9ed]">Sign up</Link>
          </>
        )}
      </div>

    </nav>
  );
}