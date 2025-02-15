import { useState, useEffect } from "react";
import axios from "axios";

const LoanSanctionForm = () => {
  const [loanDetails, setLoanDetails] = useState({
    groupId: "",
    totalAmount: "",
    interestRate: "",
    termMonths: "",
    loanAccountNo:"",
    savingAccountNo:"",
    startDate: "",
    bankDetails: {
      name: "",
      // accountNumber: "",
      ifsc: "",
      branch: "",
      interestRate: "",
    },
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
  
      // Filter groups where status is "active"
      const activeGroups = response.data.filter(group => group.status === "active");
  
      setGroups(activeGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setMessage("Failed to fetch groups.");
    }
  };
  

  const handleChange = (field, value) => {
    setLoanDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (e) => {
    const selectedBankId = e.target.value;
    setSelectedBank(selectedBankId);

    const bank = banks.find((b) => b._id === selectedBankId);
    if (bank) {
      setLoanDetails((prevDetails) => ({
        ...prevDetails,
        interestRate: bank.interestRate,
        bankDetails: {
          name: bank.name,
          // accountNumber: bank.accountNumber,
          ifsc: bank.ifsc,
          branch: bank.branch,
          interestRate: bank.interestRate,
        },
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
      const response = await axios.post("http://localhost:5000/api/loan", loanDetails, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Loan sanctioned successfully!");
      alert("Loan Sanctioned Successfully")
      console.log("Response:", response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sanctioning loan.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  // console.log("object", loanDetails)

  return (
    <div className="p-4 max-w-md h-[90vh] mt-10 overflow-y-auto mx-auto">
      <h1 className="text-xl font-bold mb-4">Loan Sanction</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-sm font-medium">Group ID</label>
          <select
            className="w-full border p-2"
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
            className="w-full border p-2"
            value={loanDetails.totalAmount}
            onChange={(e) => handleChange("totalAmount", e.target.value)}
            placeholder="Enter Total Amount"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Loan Acc NO</label>
          <input
            type="text"
            className="w-full border p-2"
            value={loanDetails.loanAccountNo}
            onChange={(e) => handleChange("loanAccountNo", e.target.value)}
            placeholder="Loan Account Number"
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Saving Acc no.</label>
          <input
            type="text"
            className="w-full border p-2"
            value={loanDetails.savingAccountNo}
            onChange={(e) => handleChange("savingAccountNo", e.target.value)}
            placeholder="Savings Account Number"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            className="w-full border p-2"
            value={loanDetails.startDate}
            onChange={(e) => handleChange("startDate", e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-lg font-semibold mb-2">Select a Bank:</label>
          {error && <p className="text-red-500">{error}</p>}
          {loading ? (
            <p>Loading banks...</p>
          ) : (
            <select
              value={selectedBank}
              onChange={handleBankChange}
              className="w-full px-4 py-2 border"
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
            className="w-full border p-2"
            value={loanDetails.termMonths}
            onChange={(e) => handleChange("termMonths", e.target.value)}
            placeholder="Enter Months "
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Interest Rate (%)</label>
          <input
            type="number"
            className="w-full border p-2 bg-gray-100"
            value={loanDetails.interestRate}
            readOnly
            required
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 w-full" disabled={loading}>
          {loading ? "Processing..." : "Sanction Loan"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default LoanSanctionForm;