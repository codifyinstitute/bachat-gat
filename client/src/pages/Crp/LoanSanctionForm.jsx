import { useState, useEffect } from "react";
import axios from "axios";

const LoanSanctionForm = () => {
  const [loanDetails, setLoanDetails] = useState({
    groupId: "",
    totalAmount: "",
    interestRate: "",  // This will be auto-filled based on the selected bank
    termMonths: "",
    startDate: "",
    bankDetails: [
      {
        bankName: "",
        branch: "",
        ifscCode: "",
        interestRate: "",
      },
    ],
  });

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/banks");
        setBanks(response.data);
      } catch (err) {
        setError("Failed to fetch banks.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("crp_token");
      const response = await axios.get("http://localhost:5000/api/groups/created-by-crp", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage("Failed to fetch groups.");
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith("bankDetails.")) {
      setLoanDetails((prev) => ({
        ...prev,
        bankDetails: [
          {
            ...prev.bankDetails[0],
            [field.split(".")[1]]: value,
          },
        ],
      }));
    } else {
      setLoanDetails({ ...loanDetails, [field]: value });
    }
  };

  // ✅ Handle Bank Selection
  const handleBankChange = (e) => {
    const selectedBankId = e.target.value;
    setSelectedBank(selectedBankId);

    const bank = banks.find((b) => b._id === selectedBankId);
    if (bank) {
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        interestRate: bank.interestRate, // Set interest rate from selected bank
        bankDetails: [
          {
            ...prevDetails.bankDetails[0],
            bankName: bank.name,
            branch: bank.branch,
            ifscCode: bank.ifscCode,
            interestRate: bank.interestRate,
          },
        ],
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!loanDetails.groupId.trim()) {
      setMessage("Group ID is required.");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("crp_token");

    try {
      console.log("Submitting Loan Data:", loanDetails);

      const response = await axios.post("http://localhost:5000/api/loan", loanDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Loan sanctioned successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sanctioning loan.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md h-[90vh] mt-10 overflow-y-auto mx-auto bg-white shadow-md rounded">
      <h1 className="text-xl font-bold mb-4">Loan Sanction</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium">Group ID</label>
          <select
            className="w-full border p-2 rounded"
            value={loanDetails.groupId}
            onChange={(e) => handleChange("groupId", e.target.value)}
            required
          >
            <option value="">Select Group</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Total Amount</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={loanDetails.totalAmount}
            onChange={(e) => handleChange("totalAmount", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={loanDetails.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-lg font-semibold mb-2">Select a Bank:</label>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p className="text-gray-600">Loading banks...</p>
          ) : (
            <select
              value={selectedBank}
              onChange={handleBankChange} // ✅ Bank selection handler
              className="w-full px-4 py-2 border rounded bg-white shadow-sm"
              required
            >
              <option value="" disabled>Select a bank</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank._id}>
                  {bank.name} - {bank.branch}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Term (Months)</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={loanDetails.termMonths}
            onChange={(e) => handleChange("termMonths", e.target.value)}
            required
          />
        </div>

        {/* ✅ Interest Rate - Read-Only */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Interest Rate (%)</label>
          <input
            type="number"
            className="w-full border p-2 rounded bg-gray-100"
            value={loanDetails.interestRate}
            readOnly // ✅ Make it read-only
            required
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Processing..." : "Sanction Loan"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default LoanSanctionForm;
