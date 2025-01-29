import React, { useState, useEffect } from "react";
import axios from "axios"

const CollectionForm = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  // const [error, setError] = useState(null);

  // Fetch groups data
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("crp_token");
  
        const response = await axios.get("http://localhost:5000/api/groups/created-by-crp", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
        // setMessage("Failed to fetch groups.");
      }
    };

    fetchGroups();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const crpToken = localStorage.getItem("crp_token");
    if (!crpToken) {
      alert("No CRP token found!");
      return;
    }

    const payload = {
      groupId: selectedGroupId,
      collectionDate: collectionDate,
    };

    try {
      const response = await fetch("http://localhost:5000/api/collection", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${crpToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to submit collection");
      }

      const result = await response.json();
      alert("Collection submitted successfully!");
      console.log(result);
    } catch (error) {
      console.error("Error submitting collection:", error);
      alert("Error submitting collection");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Collection</h1>

      {/* {error && <p className="text-red-500">{error}</p>} */}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group" className="block text-gray-700">Select Group:</label>
          <select
            id="group"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="collectionDate" className="block text-gray-700">Collection Date:</label>
          <input
            type="date"
            id="collectionDate"
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Collection
        </button>
      </form>
    </div>
  );
};

export default CollectionForm;
