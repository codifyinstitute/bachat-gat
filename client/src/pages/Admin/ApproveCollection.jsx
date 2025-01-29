import React, { useState, useEffect } from "react";
import axios from "axios";

const ApproveCollection = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem("admin_token"); // Retrieve Bearer token from localStorage
        if (!token) {
          setError("No admin token found");
          setLoading(false);
          return;
        }

        console.log("Token:", token); // Log the token to check if it's being sent
        const response = await axios.get("http://localhost:5000/api/collection", {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log("API Response:", response.data); // Log the response to ensure data is returned
        if (response.status === 200) {
          setCollections(response.data);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("Collections not found (404)");
        } else {
          setError("Failed to fetch collections");
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Handle collection approval
  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setError("No admin token found");
        return;
      }

      await axios.post(`http://localhost:5000/api/collection/${id}/approve`, {}, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
      });
      alert("Collection approved successfully!");
      setCollections(collections.filter((collection) => collection._id !== id));
    } catch (error) {
      console.error("Error approving collection:", error);
      alert("Failed to approve collection");
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {collections.map((collection) => (
        <div key={collection._id} className="p-4 shadow-lg border border-gray-200 rounded-2xl hover:scale-105 transform transition-all">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Group ID: {collection.groupId}</h2>
            <p className="text-gray-700">Collection Date: {new Date(collection.collectionDate).toLocaleDateString()}</p>
            <p className="text-gray-500">Status: {collection.status}</p>
            <button
              onClick={() => handleApprove(collection._id)}
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApproveCollection;
