"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addClient, signupArtist } from "../../services/api";

export default function Signup() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);

  const [form, setForm] = useState({
  username: "",
  email: "",
  password: "",
  });

  // get role from localStorage
  useEffect(() => {
  const storedRole = localStorage.getItem("role");
  setRole(storedRole);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    localStorage.setItem("user", JSON.stringify(form));
    if (role === "artist") {
      await signupArtist(form);
      router.push("/pages/artist"); 
    } else {
      await addClient(form);
      router.push(`/pages/client/${form.username}`);; 
    }

    alert("Account created!");
  } catch (err) {
    console.error(err);
  }
  if (!role) {
    return <p>Loading...</p>;
  }
  };

  return (

    <div
    className="min-h-screen bg-cover bg-center flex flex-col"
    style={{
    backgroundImage: `url('/generalBg.jpg')`
    }}
    > 
    <div className="flex-1 bg-black/50 flex items-center justify-center px-4">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        
        <h1 className="text-2xl font-bold mb-2 text-center">
          Create Account
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Join InspireArt!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition hover: cursor-pointer">
            Sign Up
          </button>

        </form>
      </div>

    </div>
  </div>


  );
}
