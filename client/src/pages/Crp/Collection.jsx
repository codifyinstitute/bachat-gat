import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CollectionForm = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [collectionDate, setCollectionDate] = useState("");
  const [savingsAmount, setSavingsAmount] = useState(""); // ✅ New state for savings amount

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
        toast.error("Failed to fetch groups");
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const crpToken = localStorage.getItem("crp_token");
    if (!crpToken) {
      toast.error("No CRP token found!");
      return;
    }

    const payload = {
      groupId: selectedGroupId,
      collectionDate,
      savingsAmount: Number(savingsAmount), // ✅ Include savingsAmount in the payload
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

      const result = await response.json();

      if (!response.ok) {
        if (result.message === "Loan already sanctioned") {
          toast.warning("This loan has already been sanctioned.");
          alert("This loan has already been sanctioned.")
        } else {
          toast.error("Failed to submit collection");
          alert('Failed to Submit.')
        }
        throw new Error(result.message || "Failed to submit collection");
      }

      toast.success("Collection submitted successfully!");
      alert("Collection Successfully Submitted")
      console.log(result);
    } catch (error) {
      alert("Loan is not Approved for this Collection")
      console.error("Error submitting collection:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Submit Collection</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="group" className="block text-gray-700">Select Group:</label>
          <select
            id="group"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            required
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
        <div>
          <label htmlFor="collectionDate" className="block text-gray-700">Savings Amount:</label>
          <input
            type="text"
            id="savingsAmount"
            value={savingsAmount}
            onChange={(e) => setSavingsAmount(e.target.value)}
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
