"use client";

import { useState } from "react";
import { matchRequest } from "../../../services/api";
import { useRouter } from "next/navigation";

export default function CommissionRequest() {
  const BASE_URL = "http://localhost:5000";
  const [matchResult, setMatchResult] = useState<any>(null);

  const [form, setForm] = useState({
    artStyle: "Anime",
    specification: "Portrait",
    maxBudget: 0,
    communication: [] as string[],
    management: "Collaborative",
    urgency: 1,
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleMultiSelect = (value: string) => {
    setForm((prev) => {
      const exists = prev.communication.includes(value);

      return {
        ...prev,
        communication: exists
          ? prev.communication.filter((c) => c !== value)
          : [...prev.communication, value],
      };
    });
  };

  const router = useRouter();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

 const payload = {
  username: user.username,
  artStyle: [form.artStyle],
  specification: [form.specification],
  communication: form.communication,
  maxBudget: form.maxBudget,
  urgency: form.urgency,
  management: form.management
};
  const handleSubmit = async (e: any) => {
  e.preventDefault();
  console.log("REQUEST PAYLOAD:", payload);
  console.log("Submitting request...");
    try {
      const res = await fetch(`${BASE_URL}/match-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
       },
      body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log("MATCH RESULT:", data);
      setMatchResult(data[0]); // 👈 store match result
          } catch (err) {
            console.error(err);
          }
      };

  const clientManagementOptions = [
  { label: "I prefer the artist to have full control", value: "full_control" },
  { label: "I want to be very involved", value: "client_directed" },
  { label: "I don't mind either way", value: "flexible" },
];


  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
    style={{
    backgroundImage: `url('/generalBg.jpg')`
    }}>
      <div className="flex-1 bg-black/50 flex items-center justify-center px-4">

    <div className="w-2xl mx-auto p-6 bg-zinc-700 text-white rounded-2xl my-2">
      <h1 className="text-2xl font-bold mb-4 text-center">Request a Commission</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* 🎨 Artstyle (Radio) */}
        <div>
          <p className="text-xl font-semibold mb-2">Art Style</p>
          {["Anime", "Realism", "Semi-Realism", "Cartoon"].map((option) => (
            <label key={option} className="flex gap-2">
              <input
                type="radio"
                name="artStyle"
                value={option}
                checked={form.artStyle === option}
                onChange={handleChange}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="border-b"></div>

        {/* 🖌 Specification (Radio) */}
        <div>
          <p className="text-xl font-semibold mb-2">Specification</p>
          {[
            "Portrait-full body",
            "Portrait-waist",
            "Portrait-bust",
            "Character Sheet",
            "Background",
            "Full Illustration",
          ].map((option) => (
            <label key={option} className="flex gap-2">
              <input
                type="radio"
                name="specification"
                value={option}
                checked={form.specification === option}
                onChange={handleChange}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="border-b"></div>

        {/* 💰 Budget */}
        <div>
          <span className="text-xl block font-semibold">Budget</span>
          <input
          type="number"
          name="maxBudget"
          placeholder="Your Budget"
          onChange={handleChange}
          className="w-full border p-2"
        />
        </div>
        <div className="border-b"></div>

        {/* 💬 Communication (Checkbox) */}
        <div>
          <p className="text-xl font-semibold mb-2">Preferred Communication</p>
          {["Discord", "Email", "WhatsApp"].map((option) => (
            <label key={option} className="flex gap-2">
              <input
                type="checkbox"
                checked={form.communication.includes(option)}
                onChange={() => handleMultiSelect(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="border-b"></div>

        {/* 🧠 Management (Radio) */}
        <div>
          <p className="text-xl font-semibold  mb-2">Work Style</p>
          {clientManagementOptions.map((option) => (
            <label key={option.value} className="flex gap-2">
                <input
                type="radio"
                name="management"
                value={option.value}
                checked={form.management === option.value}
                onChange={handleChange}
                />
                {option.label}
            </label>
            ))}
        </div>
        <div className="border-b"></div>

        {/* ⚡ Urgency (Radio) */}
        <div>
          <p className="text-xl font-semibold mb-2">Urgency Level</p>

          {[
            { label: "Not urgent", value: 1 },
            { label: "A little urgent", value: 5 },
            { label: "Very urgent", value: 10 },
          ].map((option) => (
            <label key={option.value} className="flex gap-2">
              <input
                type="radio"
                name="urgency"
                value={option.value}
                checked={form.urgency === option.value}
                onChange={() =>
                  setForm({ ...form, urgency: option.value })
                }
              />
              {option.label}
            </label>
          ))}
        </div>

        <button className="bg-green-500 text-white px-4 py-2 rounded hover: cursor-pointer hover:bg-green-700">
          Submit Request
        </button>
      </form>
    </div>
        {matchResult && (
          <div>
            <h2>Best Match</h2>

            <p>
              Artist: {matchResult.artist.username}
            </p>

            <p>
              Art Style: {matchResult.artist.artStyle?.join(", ")}
            </p>

            <p>
              Communication: {matchResult.artist.communication?.join(", ")}
            </p>

            <p>
              Score: {matchResult.score}
            </p>
          </div>
        )}
    </div>
    </div>
  );
}