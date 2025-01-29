import { useState, useEffect } from "react";
import axios from "axios";

const PaymentPage = () => {
  const [collectionId, setCollectionId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch collections when the component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/collection"
        );
        setCollections(response.data);
        setIsLoading(false);
      } catch (error) {
        setMessage("Failed to load collections");
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      // Check if collectionId exists
      const collectionExists = collections.some(
        (col) => col.id === collectionId
      );
      if (!collectionExists) {
        setMessage("Collection not found");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/collection/${collectionId}/payments/${memberId}`,
        { paymentMethod, transactionId, remarks },
        { headers: { "Content-Type": "application/json" } }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Make a Payment</h2>
      {isLoading ? (
        <p>Loading collections...</p>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4">
          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name} - {collection.dueDate}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </select>
          <input
            type="text"
            placeholder="Transaction ID (if applicable)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Payment
          </button>
        </form>
      )}
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
    </div>
  );
};

export default PaymentPage;
