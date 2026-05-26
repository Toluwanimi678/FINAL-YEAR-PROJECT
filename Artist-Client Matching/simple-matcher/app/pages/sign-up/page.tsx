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
  const storedClient = localStorage.getItem("client");
  console.log("STORED CLIENT:", storedClient);

  try {
    if (role === "artist") {
      await signupArtist(form);
      localStorage.setItem("artist", JSON.stringify({ // 👈 fix
        username: form.username,
        role: "artist"
      }));
      router.push("/pages/artist");
    } else {
      await addClient(form);
      localStorage.setItem("client", JSON.stringify({ // 👈 fix
        username: form.username,
        role: "client"
      }));
      router.push(`/pages/client/${form.username}`);
    }

    alert("Account created!");
  } catch (err) {
    console.error(err);
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
      
      <div className="w-full max-w-md bg-zinc-800 text-white p-8 rounded-2xl shadow-xl">
        
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
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
          />

          <button className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-800 transition hover: cursor-pointer">
            Sign Up
          </button>

        </form>
        <div className="mt-9">
          <div className="border-b "></div>
          <div className="flex items-center flex-col space-y-7">
            <h3 className="pt-4">Already have an account? Sign in!</h3>
            <button className="w-1/2 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-800 transition hover: cursor-pointer"
            onClick = {() => router.push("/pages/sign-in")}
            >
              Sign In
            </button>
          </div>
          
        </div>
      </div>

    </div>
  </div>


  );
}
