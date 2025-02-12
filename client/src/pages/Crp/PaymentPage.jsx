import { useState, useEffect } from "react";
import axios from "axios";
import DepositSlip from "../../components/GenerateInvoice";
import { toWords } from "number-to-words";

const PaymentPage = () => {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Dropdown selections
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [latePaymentCharge, setLatePaymentCharge] = useState(0);

  // Deposit Slip Data
  const [showDepositSlip, setShowDepositSlip] = useState(false);
  const [depositSlipData, setDepositSlipData] = useState({
    date: "",
    accountNumber: "",
    name: "",
    amount: "",
    amountInWords: "",
  });

  // Fetch collections when the component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const crpToken = localStorage.getItem("crp_token");
        if (!crpToken) {
          setMessage("No CRP token found");
          setIsLoading(false);
          return;
        }

        const response = await axios.get("http://localhost:5000/api/collection", {
          headers: {
            Authorization: `Bearer ${crpToken}`,
          },
        });
        
        // Check if response.data exists and is an array
        if (Array.isArray(response.data)) {
          setCollections(response.data);
        } else {
          setMessage("Invalid data format received");
        }
        setIsLoading(false);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load collections");
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Convert number to words (Indian format)
  const convertNumberToWords = (number) => {
    try {
      const [intPart, decimalPart] = number.toString().split(".");
      let words = toWords(parseInt(intPart));
      words = words.charAt(0).toUpperCase() + words.slice(1);
      words += decimalPart ? ` Rupees and ${toWords(parseInt(decimalPart))} Paise` : " Rupees Only";
      return words;
    } catch (error) {
      return "Amount in words not available";
    }
  };

  // Extract unique groups (with null check)
  const uniqueGroups = [...new Set(collections.filter(collection => 
    collection?.groupId?.name).map(collection => collection.groupId.name))];

  // Filter collections based on selected group (with null check)
  const filteredCollections = collections.filter((collection) => 
    collection?.groupId?.name === selectedGroup);

  // Extract unique collection dates for the selected group
  const uniqueDates = [...new Set(filteredCollections
    .filter(collection => collection?.collectionDate)
    .map((collection) => new Date(collection.collectionDate).toLocaleDateString()))];

  // Find the collection that matches both the selected group and date
  const selectedCollection = filteredCollections.find(
    (collection) => collection?.collectionDate && 
    new Date(collection.collectionDate).toLocaleDateString() === selectedDate
  );

  // Get members of the selected collection (with null check)
  const members = selectedCollection?.payments
    ?.filter(payment => payment?.memberId)
    .map((payment) => payment.memberId) || [];

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const crpToken = localStorage.getItem("crp_token");
      if (!crpToken) {
        setMessage("No CRP token found");
        return;
      }

      if (!selectedCollection?._id || !memberId) {
        setMessage("Missing required payment information");
        return;
      }

      const selectedPayment = selectedCollection.payments.find(
        (payment) => payment?.memberId?._id === memberId
      );
      
      if (!selectedPayment) {
        setMessage("Member not found in the selected collection");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/collection/${selectedCollection._id}/payments/${memberId}`,
        { 
          paymentMethod, 
          transactionId, 
          remarks,
          latePaymentCharge: parseFloat(latePaymentCharge) || 0 
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${crpToken}`,
          },
        }
      );

      const memberData = await axios.get(
        `http://localhost:5000/api/member/${selectedPayment.memberId._id}`,
        {
          headers: {
            Authorization: `Bearer ${crpToken}`,
          },
        }
      );

      // Calculate total amount including late payment charge
      const totalAmount = selectedPayment.totalAmount + parseFloat(latePaymentCharge || 0);

      setDepositSlipData({
        date: new Date().toLocaleDateString(),
        accountNumber: memberData.data?.accNo || "N/A",
        name: selectedPayment.memberId?.name || "N/A",
        amount: totalAmount.toFixed(2),
        amountInWords: convertNumberToWords(totalAmount),
      });

      setShowDepositSlip(true);
      setMessage(response.data.message || "Payment successful");
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        "An unexpected error occurred. Please try again.";
      setMessage(errorMessage);
      alert(errorMessage);
    }
  };

  const closeDepositSlip = () => {
    setShowDepositSlip(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-md shadow-lg rounded-lg mt-16">
      <h2 className="text-xl font-bold mb-4">Make a Payment</h2>
      {message && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {message}
        </div>
      )}
      {isLoading ? (
        <p>Loading collections...</p>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4">
          <select
            value={selectedGroup}
            onChange={(e) => {
              setSelectedGroup(e.target.value);
              setSelectedDate("");
              setMemberId("");
            }}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Group</option>
            {uniqueGroups.map((groupName) => (
              <option key={groupName} value={groupName}>
                {groupName}
              </option>
            ))}
          </select>

          {selectedGroup && (
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setMemberId("");
              }}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Date</option>
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          )}

          {selectedDate && (
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Member</option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.mobileNumber}
                </option>
              ))}
            </select>
          )}

          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="bank_transfer">Cash</option>
            <option value="upi">UPI</option>
            {/* <option value="cheque">Cheque</option> */}
            {/* <option value="cash">Cash</option> */}
          </select>

          <input
            type="text"
            placeholder="Transaction ID (if applicable)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <input
            type="number"
            placeholder="Late Payment Charge (if applicable)"
            value={latePaymentCharge}
            onChange={(e) => setLatePaymentCharge(e.target.value)}
            className="w-full p-2 border rounded"
            min="0"
            step="0.01"
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
            disabled={!selectedCollection || !memberId}
          >
            Submit Payment
          </button>
        </form>
      )}

      {showDepositSlip && (
        <div className="fixed inset-0 bg-gray-100 flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg">
            <button 
              onClick={closeDepositSlip} 
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              Close
            </button>
            <DepositSlip data={depositSlipData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;