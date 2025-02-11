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
        const response = await axios.get("https://bachatapi.codifyinstitute.org/api/collection");
        setCollections(response.data);
        setIsLoading(false);
      } catch (error) {
        setMessage("Failed to load collections");
        setIsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // Convert number to words (Indian format)
  const convertNumberToWords = (number) => {
    const [intPart, decimalPart] = number.toString().split(".");
    let words = toWords(parseInt(intPart));
    words = words.charAt(0).toUpperCase() + words.slice(1);
    words += decimalPart ? ` Rupees and ${toWords(parseInt(decimalPart))} Paise` : " Rupees Only";
    return words;
  };

  // Extract unique groups
  const uniqueGroups = [...new Set(collections.map((collection) => collection.groupId.name))];

  // Filter collections based on selected group
  const filteredCollections = collections.filter((collection) => collection.groupId.name === selectedGroup);

  // Extract unique collection dates for the selected group
  const uniqueDates = [...new Set(filteredCollections.map((collection) => new Date(collection.collectionDate).toLocaleDateString()))];

  // Find the collection that matches both the selected group and date
  const selectedCollection = filteredCollections.find(
    (collection) => new Date(collection.collectionDate).toLocaleDateString() === selectedDate
  );

  // Get members of the selected collection
  const members = selectedCollection ? selectedCollection.payments.map((payment) => payment.memberId) : [];

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const crpToken = localStorage.getItem("crp_token");
      if (!crpToken) {
        setMessage("No CRP token found");
        return;
      }

      const selectedPayment = selectedCollection?.payments.find((payment) => payment.memberId?._id === memberId);
      if (!selectedPayment) {
        setMessage("Member not found in the selected collection");
        return;
      }

      const response = await axios.post(
        `https://bachatapi.codifyinstitute.org/api/collection/${selectedCollection._id}/payments/${memberId}`,
        { paymentMethod, transactionId, remarks },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${crpToken}`,
          },
        }
      );

      const memberData = await axios.get(`https://bachatapi.codifyinstitute.org/api/member/${selectedPayment.memberId._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${crpToken}`,
        },
      });

      setDepositSlipData({
        date: new Date().toLocaleDateString(),
        accountNumber: memberData.data.accNo || "N/A",
        name: selectedPayment.memberId.name,
        amount: selectedPayment.totalAmount.toFixed(2),
        amountInWords: convertNumberToWords(selectedPayment.totalAmount),
      });

      setShowDepositSlip(true);
      alert(response.data.message);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          alert(error.response.data?.message || "Invalid request: Please check your inputs.");
        } else {
          alert(error.response.data?.message || "Payment failed.");
        }
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const closeDepositSlip = () => {
    setShowDepositSlip(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-md shadow-lg rounded-lg mt-16">
      <h2 className="text-xl font-bold mb-4">Make a Payment</h2>
      {isLoading ? (
        <p>Loading collections...</p>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Select Group */}
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

          {/* Select Date (only if a group is selected) */}
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

          {/* Select Member (only if a date is selected) */}
          {selectedDate && (
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">
                Select Member
              </option>
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {"Name: " + member.name} &nbsp; {"Mob: " + member.mobileNumber}
                </option>
              ))}
            </select>
          )}

          {/* Payment Details */}
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
          <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Submit Payment
          </button>
        </form>
      )}

      {showDepositSlip && (
        <div className="fixed inset-0 bg-gray-100 flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg">
            <button onClick={closeDepositSlip} className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded">
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
