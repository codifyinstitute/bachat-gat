import { useState, useEffect } from "react";
import axios from "axios";
import DepositSlip from "../../components/GenerateInvoice";
import { toWords } from "number-to-words";

const PaymentPage = () => {
  const [collectionId, setCollectionId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [transactionId, setTransactionId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showDepositSlip, setShowDepositSlip] = useState(false);
  const [depositSlipData, setDepositSlipData] = useState({
    date: "",
    accountNumber: "",
    name: "",
    amount: "",
    amountInWords: "",
  });

  // Convert number to Indian currency words
  const convertNumberToWords = (number) => {
    const [intPart, decimalPart] = number.toString().split('.');
    
    let words = toWords(parseInt(intPart));
    words = words.charAt(0).toUpperCase() + words.slice(1);
    
    if (decimalPart) {
      const paise = toWords(parseInt(decimalPart));
      words += ' Rupees and ' + paise + ' Paise';
    } else {
      words += ' Rupees Only';
    }

    return words;
  };

  // Fetch collections when the component mounts
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/collection");
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
      const crpToken = localStorage.getItem("crp_token");
  
      if (!crpToken) {
        setMessage("No CRP token found");
        return;
      }
  
      const selectedCollection = collections.find((col) => col._id === collectionId);
      if (!selectedCollection) {
        setMessage("Collection not found");
        return;
      }
  
      const selectedPayment = selectedCollection.payments.find((payment) => payment.memberId?._id === memberId);
      if (!selectedPayment) {
        setMessage("Member not found in the selected collection");
        return;
      }
  
      const response = await axios.post(
        `http://localhost:5000/api/collection/${collectionId}/payments/${memberId}`,
        { paymentMethod, transactionId, remarks },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${crpToken}`,
          },
        }
      );

      const memberdata = await axios.get(`http://localhost:5000/api/member/${selectedPayment.memberId._id}`,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${crpToken}`,
        },
      })

      if(!memberdata) console.log("error while fetching member account no.")


  
      setDepositSlipData({
        date: new Date().toLocaleDateString(),
        accountNumber: memberdata.data.accNo || "N/A",
        name: selectedPayment.memberId.name,
        amount: selectedPayment.totalAmount.toFixed(2),
        amountInWords: convertNumberToWords(selectedPayment.totalAmount)
      });

      setShowDepositSlip(true);
      alert(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Payment failed");
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
                  {payment.memberId?.name || "Unnamed Member"}
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