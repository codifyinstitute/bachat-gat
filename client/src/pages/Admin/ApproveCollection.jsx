import React, { useState, useEffect } from "react";
import axios from "axios";

const ApproveCollection = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null); // Track selected collection for dropdown

  // Fetch collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          alert("No admin token found");
          setLoading(false);
          return;
        }

        const response = await axios.get("https://bachatapi.codifyinstitute.org/api/collection", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(response.data);

        if (response.status === 200) {
          // Filter collections with status 'pending'
          const pendingCollections = response.data.filter(
            (collection) => collection.status === "pending"
          );
          setCollections(pendingCollections);
        }
      } catch (error) {
        if (error.response) {
          alert(`${error.response.data.message || "Failed to fetch collections"}`);
          console.error("Response Error:", error.response);
        } else {
          alert("Failed to fetch collections");
        }
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
        alert("No admin token found");
        return;
      }

      const response = await axios.post(
        `https://bachatapi.codifyinstitute.org/api/collection/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check response status
      if (response.status === 200) {
        alert("Collection approved successfully!");
        setCollections(collections.filter((collection) => collection._id !== id));
      }
    } catch (error) {
      if (error.response) {
        // Log the response error for debugging
        alert(`${error.response.data.message || "Failed to approve collection"}`);
        console.error("Response Error on Approve:", error.response);
      } else {
        alert("Failed to approve collection");
      }
    }
  };

  const toggleDetails = (id) => {
    if (selectedCollection === id) {
      setSelectedCollection(null); // Collapse the dropdown if it's already selected
    } else {
      setSelectedCollection(id); // Expand the dropdown for the selected collection
    }
  };

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Group ID</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Total EMI</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700">Collection Date</th>
              <th className="px-4 py-2 text-center font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <React.Fragment key={collection._id}>
                <tr className="border-b">
                  <td className="px-4 py-2">{collection.groupId?.name || "N/A"}</td>
                  <td className="px-4 py-2">{collection.totalEmiCollected}</td>
                  <td className="px-4 py-2">{new Date(collection.collectionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-center flex gap-4">
                    <button
                      onClick={() => toggleDetails(collection._id)}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                    >
                      {selectedCollection === collection._id ? "Hide " : "Show "}
                    </button>
                    <button
                      onClick={() => handleApprove(collection._id)}
                      className="mt-2 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
                    >
                      Approve
                    </button>
                  </td>
                </tr>

                {/* Dropdown details */}
                {selectedCollection === collection._id && (
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="px-4 py-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Installments Details</h3>
                        <table className="min-w-full table-auto border-collapse">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2">Installment</th>
                              <th className="px-4 py-2">EMI Amount</th>
                              <th className="px-4 py-2">Savings Amount</th>
                              <th className="px-4 py-2">Payment Method</th>
                              <th className="px-4 py-2">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {collection.payments.map((payment, index) => (
                              <tr key={index} className="border-t text-center">
                                <td className="px-4 py-2">{payment.installmentNumber}</td>
                                <td className="px-4 py-2">{payment.emiAmount}</td>
                                <td className="px-4 py-2">{payment.savingsAmount}</td>
                                <td className="px-4 py-2">{payment.paymentMethod}</td>
                                <td className="px-4 py-2">{payment.status}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApproveCollection;
