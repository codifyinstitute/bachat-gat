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
  const [members, setMembers] = useState([]); // State to hold members of the selected group
  const [isLoading, setIsLoading] = useState(true);

  // Fetch collections when the component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/collection");
        setCollections(response.data);
        console.log("ss",collections)
        setIsLoading(false);
      } catch (error) {
        setMessage("Failed to load collections");
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Fetch members for the selected collection (group) when a group is selected
  // useEffect(() => {
  //   if (!collectionId) return;

  //   const fetchMembers = async () => {
  //     try {
  //       const response = await axios.get(`http://localhost:5000/api/collection/${collectionId}`);
  //       console.log(response.data, "kok")
  //       setMembers(response.data.members.map((item) => item.member)); // Extract the member objects
  //     } catch (error) {
  //       setMessage("Failed to load members");
  //     }
  //   };

  //   fetchMembers();
  // }, [collectionId]);
  // console.log("mem",members)

  const handlePayment = async (e) => {
    e.preventDefault();

    try {
      // Retrieve CRP token from localStorage
      const crpToken = localStorage.getItem("crp_token");

      if (!crpToken) {
        setMessage("No CRP token found");
        return;
      }

      // Check if collectionId exists
      const collectionExists = collections.some((col) => col._id === collectionId);
      if (!collectionExists) {
        setMessage("Collection not found");
        return;
      }

      // Make POST request to the API with the Bearer token
      const response = await axios.post(
        `http://localhost:5000/api/collection/${collectionId}/payments/${memberId}`,
        { paymentMethod, transactionId, remarks },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${crpToken}`, // Add Bearer token
          },
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md shadow-lg rounded-lg mt-16">
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
              <option key={collection._id} value={collection._id}>
                {collection.groupId.name} - {new Date(collection.collectionDate).toLocaleDateString()}
              </option>
            ))}
          </select>

          {/* Dropdown to select Member based on selected Group */}
          <select
  value={memberId}
  onChange={(e) => setMemberId(e.target.value)}
  className="w-full p-2 border rounded"
  required
>
  <option value="">Select Member</option>
  {collections
    .find((collection) => collection._id === collectionId)?.payments
    .map((payment) => (
      <option key={payment.memberId?._id} value={payment.memberId?._id}>
        {payment.memberId?.name || "Unnamed Member"} {/* Display member name */}
      </option>
    ))}
</select>

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
            <option value="upi">UPI</option>
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
