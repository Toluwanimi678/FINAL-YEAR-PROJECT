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

 const handleSubmit = async (e: any) => {
  e.preventDefault();

  const storedClient = localStorage.getItem("client");
  console.log("STORED CLIENT:", storedClient);
  const user = storedClient ? JSON.parse(storedClient) : {};

  const payload = {
    username: user.username,
    artStyle: [form.artStyle],
    specification: [form.specification],
    communication: form.communication,
    maxBudget: form.maxBudget,
    urgency: form.urgency,
    management: form.management,
  };

  console.log("REQUEST PAYLOAD:", payload);

  try {
    // Step 1 — Save the commission request to MongoDB
    const saveRes = await fetch(`${BASE_URL}/api/commission-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientUsername: user.username,
        artistUsername: "",
        artStyle: payload.artStyle,
        specification: payload.specification,
        communication: payload.communication,
        maxBudget: payload.maxBudget,
        urgency: payload.urgency,
        management: payload.management,
        status: "Pending",
      }),
    });

    if (!saveRes.ok) {
      const err = await saveRes.text();
      console.error("Save error:", err);
      throw new Error("Failed to save request");
    }

    // Step 2 — Run batch match
    const matchRes = await fetch(`${BASE_URL}/api/run-batch-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!matchRes.ok) {
      const err = await matchRes.text();
      console.error("Match error:", err);
      throw new Error("Matching failed");
    }

    const matchData = await matchRes.json();
    console.log("MATCH RESULT:", matchData);

    // Step 3 — Filter results for this client only
    const myMatches = matchData.filter(
      (r: any) => r.clientUsername?.toLowerCase() === user.username?.toLowerCase()
    );

    localStorage.setItem("matches", JSON.stringify(myMatches));
    localStorage.setItem(
      "requestData",
      JSON.stringify({
        maxBudget: payload.maxBudget,
        urgency: payload.urgency,
        artStyle: payload.artStyle,
        specification: payload.specification,
        communication: payload.communication,
        management: payload.management,
      })
    );

    router.push("/pages/matches");
  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
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
          <p className="text-xl font-semibold mb-1">Urgency Level</p>
          <p className="text-sm mb-2">How urgent is your expected art work?</p>

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
       
    </div>
    </div>
  );
}