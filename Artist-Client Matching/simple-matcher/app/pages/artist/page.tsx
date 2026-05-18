"use client";

import { useEffect, useState } from "react";
import { addArtistProfile } from "../../services/api";
import { useRouter } from "next/navigation";

export default function ArtistPage() {
  const router = useRouter();
  type ArtistForm = {
    username: string;
    bio: string;
    profilePicture: string;
    email: string;
    password: string;
    specification: string[];
    artStyle: string[];
    communication: string[];
    minBudget: number;
    maxBudget: number;
    capacity: number;
    management: string;
  };

  const [form, setForm] = useState<ArtistForm>({
    username: "",
    bio: "",
    profilePicture: "",
    email: "",
    password: "",
    specification: [] as string[],
    artStyle: [] as string[],
    communication: [] as string[],
    minBudget: 0,
    maxBudget: 0,
    capacity: 1,
    management: "",
  });

  const specOptions = [
  "Portrait-full body",
  "Portrait-waist",
  "Portrait-bust",
  "Character Sheet",
  "Background",
  "Full Illustration",
  "Profile Picture",
  "Other",
];

const artStyleOptions = ["Anime", "Realism", "Semi-Realism", "Cartoon"];
const communicationOptions = ["Discord", "Email", "WhatsApp"];

const handleMultiSelect = (
  field: keyof ArtistForm,
  value: string
) => {
  setForm((prev) => {
    const current = prev[field];

    // 👇 make sure it's an array
    if (!Array.isArray(current)) return prev;

    const exists = current.includes(value);

    return {
      ...prev,
      [field]: exists
        ? current.filter((item) => item !== value)
        : [...current, value],
    };
  });
};

const managementOptions = [
  { label: "I like to be in full control", value: "full_control" },
  { label: "I like the client to be very involved", value: "client_directed" },
  { label: "I don't mind either way", value: "flexible" },
];


  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      const parsed = JSON.parse(user);

      setForm((prev: any) => ({
        ...prev,
        username: parsed.username,
      }));
    }
  }, []);

    const handleSubmit = async (e: any) => {
    e.preventDefault();

    console.log(form);

    try {
      await addArtistProfile(form);

      alert("Profile saved!");

      router.push(`/pages/artist/${form.username}`);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col"
    style={{
    backgroundImage: `url('/generalBg.jpg')`
    }}>
      <div className="flex-1 bg-black/50 flex items-center justify-center px-4">
    <div className="max-w-2xl mx-auto p-6 space-y-4 bg-[#f6f6f6] rounded-2xl shadow-xl my-2">
      <h1 className="text-2xl font-bold mb-2 text-center">Artist Profile</h1>
      <h2 className="text-lg mb-4 text-center">Tell us about your art!</h2>

      <form onSubmit={handleSubmit} className="space-y-4 rounded p-2"> 

        {/* artStyle */}
        <div>
          <div>
            <span className="text-xl block font-semibold">Art Styles</span>
            <span className="text-sm block mb-3">(select all that apply)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {artStyleOptions.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.artStyle.includes(option)}
                  onChange={() => handleMultiSelect("artStyle", option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        <div className="border-b"></div>

        {/* Specification*/}
        <div>
          <div>
            <span className="text-xl block font-semibold">Specification</span>
            <span className="text-sm block mb-3">(select all that apply)</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {specOptions.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.specification.includes(option)}
                  onChange={() => handleMultiSelect("specification", option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        <div className="border-b"></div>

        {/* Budget */}
        <div className="flex gap-4 flex-col">
          <span className="text-xl block mb-2 font-semibold">Pricing</span>
          <div>
            <input
              name="minBudget"
              type="number"
              placeholder="Min Budget"
              onChange={handleChange}
              className="w-1/2 rounded shadow bg-[#ffffff] border p-2"
            />
            <span className="text-sm block mb-2">Your lowest commission price</span>
          </div>
          <div>
            <input
              name="maxBudget"
              type="number"
              placeholder="Max Budget"
              onChange={handleChange}
              className="w-1/2 rounded shadow bg-[#ffffff] border p-2"
            />
            <span className="text-sm block mb-2">Your highest commission price</span>
          </div>
        </div>
        <div className="border-b"></div>

        {/* Communication */}
        <div>
          <div>
            <span className="text-xl block mb-2 font-semibold">Communication Methods</span>
            <span className="text-sm block mb-2">(select all that apply)</span>
          </div>
          <div className="flex gap-4">
            {communicationOptions.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.communication.includes(option)}
                  onChange={() => handleMultiSelect("communication", option)}
                />
                {option}
              </label>
            ))}
          </div>
        </div>
        <div className="border-b"></div>

        {/* Capacity : won't be up to the artist! I'll have to find a way to make it dynamic as 
        requests are coming in and being accepted*/}
        <div>
          <span className="text-xl block mb-2 font-semibold">Capacity</span>
          <input
            name="capacity"
            type="number"
            placeholder="Capacity"
            onChange={handleChange}
            className="w-full border rounded shadow bg-[#ffffff] p-2"
          />
          <span className="text-sm">How many pieces would you like to work on at a time?</span>
        </div>
        <div className="border-b"></div>

        {/* Management*/}
        <div>
          <span className="text-xl block mb-2 font-semibold">Work Style Preference</span>

          {managementOptions.map((option) => (
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

         {/* Bio*/}
        <div>
          <span className="text-xl block mb-2 font-semibold">Bio</span>
            <label className="">Bio</label>
              <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell clients about yourself..."
              className="p-3 rounded-xl bg-zinc-800 min-h-30"
            />
        </div>

         {/* Profile Pic*/}
        <div>
            <label className="">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
              />
        </div>
       

        {/* Submit */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:cursor-pointer hover:bg-blue-800">
          Submit
        </button>

      </form>
      <div>
        <h2>We collect this information to match you with the perfect client.</h2>
      </div>
    </div>
    </div>
    </div>
  );
}