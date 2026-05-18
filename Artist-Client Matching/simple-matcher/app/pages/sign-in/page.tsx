"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "artist",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      alert("Login successful!");

      if (form.role === "artist") {
        router.push(`/pages/artist/${data.username}`);
      } else {
        router.push(`/pages/client/${data.username}`);
      }
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };


  return(
    <main className="min-h-screen bg-zinc-900 flex items-center justify-center p-6">
      <div className="bg-zinc-800 p-8 rounded-3xl w-full max-w-md shadow-xl">

        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Sign In
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

<input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="p-4 rounded-xl bg-zinc-700 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="p-4 rounded-xl bg-zinc-700 text-white"
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-4 rounded-xl bg-zinc-700 text-white"
          >
            <option value="artist">Artist</option>
            <option value="client">Client</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 transition-all p-4 rounded-xl text-white font-semibold"
          >
            Sign In
          </button>

        </form>
      </div>
    </main>
  );
}