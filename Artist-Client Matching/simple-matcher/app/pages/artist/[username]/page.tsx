"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type ArtistProfile = {
  username: string;
  bio?: string;
  artStyle?: string[];
  specification?: string[];
  minBudget?: number;
  maxBudget?: number;
  communication?: string[];
  capacity?: number;
  currentActiveCommissions?: number;
  management?: string;
  profilePicture?: string;
};

type CommissionRequest = {
  id?: string;
  _id?: string;  
  artistUsername: string;
  clientUsername: string;
  artStyle: string[];
  maxBudget: number;
  urgency: string;
  status?: string;
  createdAt?: string;
};
export default function ArtistProfilePage() {
  const router = useRouter(); 

  const params = useParams();
  const searchParams = useSearchParams();

  const username = params?.username?.toString();
  const score = searchParams.get("score");

  const [loggedInClient, setLoggedInClient] = useState<string | null>(null);

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentRequest, setSentRequest] = useState(false);

  useEffect(() => {
    const storedClient = localStorage.getItem("client");
    const storedArtist = localStorage.getItem("artist"); 

    if (storedArtist) {
      // Artist is logged in — don't show the button
      setLoggedInClient(null);
    } else if (storedClient) {
      const client = JSON.parse(storedClient);
      setLoggedInClient(client.username);
    }
  }, []);

  useEffect(() => {
    if (!username) return;

      const fetchArtist = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/artist-profiles/${username}`
          );

          if (!response.ok) throw new Error("Failed to fetch artist");

          const data = await response.json();
          setArtist(data);
        } catch (err) {
          console.error("Artist fetch error:", err);
        } finally {
          setLoading(false);
        }
      };

      const fetchRequests = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/commission-requests/artist/${username}`
          );

          if (!response.ok) {
            console.error("Requests failed:", response.status);
            return;
          }

          const data = await response.json();
          setRequests(data.filter((r: any) => r.status !== "Matched"));
        } catch (err) {
          console.error("Requests fetch error:", err);
        }
      };

      fetchArtist();
      fetchRequests();
    }, [username]);

    if (!username) {
      return (
        <div className="p-10 text-red-400">
          Invalid artist URL.
        </div>
      );
    }

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

    const handleLogout = () => {
      localStorage.removeItem("client");
      localStorage.removeItem("artist");
      window.location.href = "/pages/sign-in"; // forces a full page reload, navbar re-mounts
    };

    const percentage =
      ((artist.currentActiveCommissions || 0) /
        (artist.capacity || 1)) *
      100;

   const normalizedRequests = requests.map((r: any) => ({
    ...r,
    id: r.id || r._id, 
    clientUsername: r.clientUsername,
    artistUsername: r.artistUsername,
  }));

   const handleAccept = async (requestId: string) => {
    console.log("ACCEPTING ID:", requestId);
  console.log("URL:", `http://localhost:5000/api/commission-requests/accept/${requestId}`);
      try {
        const response = await fetch(
          `http://localhost:5000/api/commission-requests/accept/${requestId}`,
          { method: "PUT" }
        );

        if (!response.ok) {
          console.error("Failed to accept request:", response.status);
          return;
        }

        setRequests((prev) =>
          prev.map((r: any) =>
            (r.id || r._id) === requestId ? { ...r, status: "Accepted" } : r
          )
        );
      } catch (err) {
        console.error("Accept error:", err);
      }
    };

const handleReject = async (requestId: string) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/commission-requests/reject/${requestId}`,
      { method: "PUT" }
    );

    if (!response.ok) {
      console.error("Failed to reject request:", response.status);
      return;
    }

    setRequests((prev) =>
      prev.map((r: any) =>
        (r.id || r._id) === requestId ? { ...r, status: "Rejected" } : r
      )
    );
  } catch (err) {
    console.error("Reject error:", err);
  }
};


    const handleCommission = async () => {
      try {
        const storedClient = localStorage.getItem("client");
        if (!storedClient) {
          alert("You are not logged in as a client.");
          return;
        }

        const client = JSON.parse(storedClient);
        const storedRequest = localStorage.getItem("requestData");
        if (!storedRequest) {
          alert("No request data found. Please submit a request form first.");
          return;
        }

        const requestData = JSON.parse(storedRequest);

        const requestPayload = {
          artistUsername: artist!.username,
          clientUsername: client.username,
          maxBudget: requestData.maxBudget,
          urgency: requestData.urgency,
          artStyle: requestData.artStyle,
          specification: requestData.specification ?? [], 
          communication: requestData.communication ?? [], 
          management: requestData.management ?? "flexible",
        };

        const response = await fetch(
          "http://localhost:5000/api/commission-requests",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Backend error:", errorText);
          throw new Error("Failed to send request");
        }

        setSentRequest(true);

        setTimeout(() => {
          router.push(`/pages/client/${client.username}`);
        }, 1500);

      } catch (err) {
        console.error(err);
        alert("Something went wrong.");
      }
    };

  return (
    <main
      className="min-h-screen text-white"
      style={{ backgroundImage: `url('/generalBg.jpg')` }}
    >
      <div className="bg-black/50">
        <div className="max-w-4xl mx-auto bg-zinc-800 rounded-3xl p-8 shadow-lg py-2">

          {/* HEADER */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-zinc-700" />

            <div>
              <h1 className="text-4xl font-bold">
                @{artist.username}
              </h1>

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Log Out
                </button>
              </div>

              {score && (
                <div className="mt-3 inline-block bg-green-500/20 text-green-300 px-4 py-2 rounded-full">
                  {score}% Match
                </div>
              )}

              {/* COMMISSION BUTTON */}
              {loggedInClient && loggedInClient !== artist.username && (
                <div className="mt-4 flex gap-3">
                  {!sentRequest ? (
                    <button
                      onClick={handleCommission}
                      disabled={
                        !!artist.capacity &&
                        (artist.currentActiveCommissions || 0) >= artist.capacity
                      }
                      className={`px-5 py-3 rounded-xl transition-all font-semibold
                        ${
                          !!artist.capacity &&
                          (artist.currentActiveCommissions || 0) >= artist.capacity
                            ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                    >
                      Commission This Artist
                    </button>
                  ) : (
                    <div className="bg-green-500/20 text-green-300 px-5 py-3 rounded-xl font-semibold">
                      Request sent successfully ✔
                    </div>
                  )}
                </div>
             )}

              <p className="text-zinc-400 mt-2">
                {artist.management}
              </p>

              <p className="mt-2">
                {artist.capacity &&
                (artist.currentActiveCommissions || 0) <
                  artist.capacity ? (
                  <span className="text-green-400">
                    🟢 Open for commissions
                  </span>
                ) : (
                  <span className="text-red-400">
                    🔴 Currently busy
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* BIO */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              About the Artist
            </h2>

            <p className="text-zinc-300 leading-relaxed">
              {artist.bio || "No bio added yet."}
            </p>
          </section>

          {/* ART STYLES */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              Art Styles
            </h2>

            <div className="flex flex-wrap gap-3">
              {artist.artStyle?.length ? (
                artist.artStyle.map((style, index) => (
                  <span
                    key={index}
                    className="bg-pink-500/20 text-pink-300 px-4 py-2 rounded-full"
                  >
                    {style}
                  </span>
                ))
              ) : (
                <p className="text-zinc-400">No styles listed.</p>
              )}
            </div>
          </section>

          {/* SPECIALIZATION */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              Specializations
            </h2>

            <div className="flex flex-wrap gap-3">
              {artist.specification?.length ? (
                artist.specification.map((spec, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <p className="text-zinc-400">
                  No specializations listed.
                </p>
              )}
            </div>
          </section>

          {/* BUDGET */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              Budget Range
            </h2>

            <p className="text-zinc-300 text-lg">
              ₦{artist.minBudget ?? 0} - ₦{artist.maxBudget ?? 0}
            </p>
          </section>

          {/* COMMUNICATION */}
          <section className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">
              Communication Style
            </h2>

            <div className="flex flex-wrap gap-3">
              {artist.communication?.length ? (
                artist.communication.map((comm, index) => (
                  <span
                    key={index}
                    className="bg-green-500/20 text-green-300 px-4 py-2 rounded-full"
                  >
                    {comm}
                  </span>
                ))
              ) : (
                <p className="text-zinc-400">
                  No communication style listed.
                </p>
              )}
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
              {artist.capacity || 0} commissions active
            </p>
          </section>

          {/* REQUESTS */}
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">
              Incoming Commission Requests
            </h2>

            {requests.length === 0 ? (
              <p className="text-zinc-400">
                No requests yet.
              </p>
            ) : (
              <div className="space-y-4">
                {normalizedRequests.map((request, index) => (
                  <div
                    key={index}
                    className="bg-zinc-700 p-5 rounded-2xl"
                  >
                    <h3 className="text-xl font-bold">
                      @{request.clientUsername}
                    </h3>

                    <p className="mt-2">
                      Budget: ₦{request.maxBudget}
                    </p>

                    <p>Urgency: {request.urgency}</p>

                    <p>
                      Art Style:{" "}
                      {request.artStyle?.join(", ") ||
                        "Not specified"}
                    </p>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleAccept(request.id!)}
                        disabled={request.status === "Accepted" || request.status === "Rejected"}
                        className={`px-4 py-2 rounded-xl transition-all
                          ${
                            request.status === "Accepted"
                              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                              : request.status === "Rejected"
                              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {request.status === "Accepted" ? "Accepted ✓" : "Accept"}
                      </button>

                      <button
                        onClick={() => handleReject(request.id!)}
                        disabled={request.status === "Accepted" || request.status === "Rejected"}
                        className={`px-4 py-2 rounded-xl transition-all
                          ${
                            request.status === "Rejected"
                              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                              : request.status === "Accepted"
                              ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                              : "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                          }`}
                      >
                        {request.status === "Rejected" ? "Rejected ✗" : "Reject"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}