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

        // 🔥 SAVE USER TO LOCALSTORAGE
        if (form.role === "client") {
          localStorage.removeItem("artist");
          localStorage.setItem(
            "client",
            JSON.stringify({
              username: data.username,
              role: "client",
            })
          );
          router.push(`/pages/client/${data.username}`);
        }

        if (form.role === "artist") {
          localStorage.removeItem("artist");
          localStorage.setItem(
            "artist",
            JSON.stringify({
              username: data.username,
              role: "artist",
            })
          );
          router.push(`/pages/artist/${data.username}`);
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
        <div className="mt-9 text-white">
          <div className="border-b "></div>
          <div className="flex items-center flex-col space-y-7">
            <h3 className="pt-4 ">Don't have an account? Create one!</h3>
            <button className="w-1/2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-800 transition hover: cursor-pointer"
            onClick = {() => router.push("/pages/sign-up")}
            >
              Sign Up
            </button>
          </div>
          
        </div>
      </div>
    </main>
  );
}