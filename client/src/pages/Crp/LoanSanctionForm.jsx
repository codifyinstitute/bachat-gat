import { useState, useEffect } from "react";
import axios from "axios";

const LoanSanctionForm = () => {
  const [loanDetails, setLoanDetails] = useState({
    groupId: "",
    totalAmount: "",
    // perMemberAmount: "",
    interestRate: "",
    termMonths: "",
    startDate: "",
    bankDetails: [
      {
        bankName: "",
        branch: "",
        ifscCode: "",
        interestRate: "", // Ensure this is not missing
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
        <label className="block text-lg font-semibold mb-2">Select a Bank:</label>
          {error && <p className="text-red-500">{error}</p>}
          
          {loading ? (
            <p className="text-gray-600">Loading banks...</p>
          ) : (
            <select
              value={selectedBank}
              onChange={setSelectedBank}
              className="w-full px-4 py-2 border rounded bg-white shadow-sm"
            >
              <option value="" disabled>Select a bank</option>
              {banks.map((bank) => (
                <option key={bank._id} value={bank.name}>
                  {bank.name} - {bank.branch}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Interest Rate (%)</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={loanDetails.interestRate}
            onChange={(e) => handleChange("interestRate", e.target.value)}
            required
          />
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

        {/* <div className="mb-3">
          <h2 className="text-lg font-bold mb-2">Bank Details</h2>

          <label className="block text-sm font-medium">Bank Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={loanDetails.bankDetails[0].bankName}
            onChange={(e) => handleChange("bankDetails.bankName", e.target.value)}
            required
          />

          <label className="block text-sm font-medium">Branch</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={loanDetails.bankDetails[0].branch}
            onChange={(e) => handleChange("bankDetails.branch", e.target.value)}
            required
          />

          <label className="block text-sm font-medium">IFSC Code</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={loanDetails.bankDetails[0].ifscCode}
            onChange={(e) => handleChange("bankDetails.ifscCode", e.target.value)}
            required
          />

          <label className="block text-sm font-medium">Interest Rate (%)</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={loanDetails.bankDetails[0].interestRate}
            onChange={(e) => handleChange("bankDetails.interestRate", e.target.value)}
            required
          />
        </div> */}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full" disabled={loading}>
          {loading ? "Processing..." : "Sanction Loan"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default LoanSanctionForm;
