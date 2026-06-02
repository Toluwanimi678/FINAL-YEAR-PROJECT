"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ClientProfilePage() {
  const params = useParams();
  const username = params.username;

  const [client, setClient] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!username) return;

    const fetchData = async () => {
      try {
        // FETCH CLIENT
        const clientResponse = await fetch(
          `http://localhost:5000/api/client/${username}`
        );

        if (!clientResponse.ok) {
          throw new Error("Failed to fetch client");
        }

        const clientData = await clientResponse.json();
        setClient(clientData);

        // FETCH REQUESTS (SENT REQUESTS)
        const requestResponse = await fetch(
          `http://localhost:5000/api/commission-requests/client/${username}`
        );

        if (!requestResponse.ok) {
          throw new Error("Failed to fetch requests");
        }

        const requestData = await requestResponse.json();
        setRequests(requestData.filter((r: any) => r.status !== "Matched"));
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white p-10">
        Loading profile...
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-zinc-900 text-red-400 p-10">
        Client not found.
      </div>
    );
  }

  const normalizedRequests = requests.map((r: any) => ({
    ...r,
    id: r.id || r._id, 
    clientUsername: r.clientUsername,
    artistUsername: r.artistUsername,
  }));

    const handleDelete = async (requestId: string) => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/commission-requests/${requestId}`,
          { method: "DELETE" }
        );

        if (!response.ok) {
          console.error("Failed to delete request:", response.status);
          return;
        }

        // Remove from UI immediately
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } catch (err) {
        console.error("Delete error:", err);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("client");
      localStorage.removeItem("artist");
      window.location.href = "/pages/sign-in"; // forces a full page reload, navbar re-mounts
    };
  return (
    <main className="min-h-screen bg-zinc-900 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* PROFILE HEADER */}
        <div className="bg-zinc-800 rounded-3xl p-8 shadow-lg">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-zinc-700" />

            <div>
              <h1 className="text-4xl font-bold">
                @{client.username}
              </h1>
              
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  Log Out
                </button>
              </div>

              <p className="text-zinc-400 mt-3">
                {client.bio || "No bio yet."}
              </p>
            </div>
          </div>
        </div>

        {/* REQUEST SECTION */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              Commission Requests
            </h2>

            <button
              onClick={() =>
                router.push("/pages/client/request")
              }
              className="bg-pink-500 hover:bg-pink-600 transition-all px-5 py-3 rounded-xl"
            >
              New Request
            </button>
          </div>

          {/* EMPTY STATE */}
          {requests.length === 0 && (
            <div className="bg-zinc-800 p-8 rounded-3xl text-zinc-400">
              No commission requests yet.
            </div>
          )}

          {/* REQUEST CARDS */}
          <div className="grid gap-5">
            {normalizedRequests.map((request, index) => (
              <div
                key={index}
                className="bg-zinc-800 rounded-3xl p-6 shadow-lg border border-zinc-700"
              >
                {/* TOP ROW */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {request.artStyle?.join(", ") ||
                        "Custom Request"}
                    </h3>

                    <p className="text-zinc-400 mt-2">
                      Created:{" "}
                      {request.createdAt
                        ? new Date(
                            request.createdAt
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  {/* STATUS (SAFE) */}
                  <div
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold
                      ${
                        request.status === "Accepted"
                          ? "bg-green-500/20 text-green-300"
                          : request.status === "Rejected"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-yellow-500/20 text-yellow-300"
                      }
                    `}
                  >
                    {request.status || "Pending"}
                  </div>
                </div>

                {/* DETAILS */}
                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="bg-zinc-700/50 p-4 rounded-2xl">
                    <p className="text-zinc-400 text-sm">
                      Budget
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      ₦{request.maxBudget}
                    </p>
                  </div>

                  <div className="bg-zinc-700/50 p-4 rounded-2xl">
                    <p className="text-zinc-400 text-sm">
                      Communication
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {request.communication?.join(", ") ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                {/* MATCHED ARTIST */}
                <div className="mt-6">
                  <p className="text-zinc-400 text-sm">
                    Matched Artist
                  </p>

                  <p className="text-pink-400 text-lg font-semibold mt-1">
                    {request.artistUsername ||
                      request.matchedArtist ||
                      "Not matched yet"}
                  </p>
                </div>

                {/* EXPANDED DETAILS */}
                {selectedRequest === request.id && (
                  <div className="mt-6 bg-zinc-700/30 p-4 rounded-2xl space-y-2">
                    <p>
                      <span className="text-zinc-400 text-sm">Urgency: </span>
                      <span className="font-semibold">{request.urgency}</span>
                    </p>
                    <p>
                      <span className="text-zinc-400 text-sm">Specification: </span>
                      <span className="font-semibold">
                        {request.specification?.join(", ") || "Not specified"}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-400 text-sm">Management: </span>
                      <span className="font-semibold">
                        {request.management || "Not specified"}
                      </span>
                    </p>
                    <p>
                      <span className="text-zinc-400 text-sm">Created: </span>
                      <span className="font-semibold">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString()
                          : "N/A"}
                      </span>
                    </p>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() =>
                      setSelectedRequest(
                        selectedRequest === request.id ? null : request.id
                      )
                    }
                    className="bg-zinc-700 hover:bg-zinc-600 transition-all px-5 py-3 rounded-xl"
                  >
                    {selectedRequest === request.id ? "Hide Details" : "View Details"}
                  </button>

                  <button
                    onClick={() => handleDelete(request.id)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-all px-5 py-3 rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}