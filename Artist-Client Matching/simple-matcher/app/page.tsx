"use client";

import bg from "../public/generalBg.jpg";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const selectRole = (role: string) => {
  localStorage.setItem("role", role);
  router.push("/pages/sign-up");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex"
      style={{
        backgroundImage: `url(${bg})`
      }}
    >
      
    <div className="flex-1 bg-[#346771] flex flex-col items-center justify-center text-center px-4 w-11/12"> 
      <h1 className="text-white text-4xl font-bold mb-2 mt-5"> Welcome to InspireArt </h1> 
      <p className="text-gray-200 mb-8"> Connect with artists or find clients for your work </p> 
      <h2 className="text-white mb-6 text-xl"> Are you... </h2> 
        <div className="flex gap-6 w-full max-w-3xl"> 
          {/* Artist Card */} 
          <div onClick={() => selectRole("artist")} 
              className="flex-1 bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition" > 
            <h3 className="text-xl font-semibold mb-2">An Artist</h3> 
            <p className="text-gray-600 text-sm"> Showcase your work and get commissions </p> 
          </div> 

          {/* Client Card */} 
          <div onClick={() => selectRole("client")} 
                className="flex-1 bg-white p-6 rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition" > 
            <h3 className="text-xl font-semibold mb-2">A Client</h3> 
            <p className="text-gray-600 text-sm"> Find artists and request custom artwork </p> 
          </div> 
        </div> 
    </div>
    </div>
  );
}