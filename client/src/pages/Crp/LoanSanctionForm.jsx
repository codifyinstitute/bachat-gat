import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";

const LoanSanctionForm = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loanDetails, setLoanDetails] = useState({
    totalAmount: "",
    interestRate: "",
    termMonths: "",
    startDate: "",
    bankName: "",
    branch: "",
    ifscCode: "",
    bankInterestRate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch active groups on component mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("crp_token");

        if (!token) {
          alert("Authorization token is missing.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/groups", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Filter active groups only
        const activeGroups = response.data.filter(group => group.status === "active");
        const groupOptions = activeGroups.map(group => ({
          value: group._id,
          label: group.name,
        }));

        setGroups(groupOptions);
      } catch (error) {
        console.error("Error fetching groups:", error);
        alert("Failed to fetch groups. Please try again.");
      }
    };

    fetchGroups();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoanDetails((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle group selection change
  const handleGroupChange = (selectedOption) => {
    setSelectedGroup(selectedOption);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!selectedGroup) {
      setMessage("Please select a group.");
      setLoading(false);
      return;
    }

    const loanData = {
      groupId: selectedGroup.value,
      ...loanDetails,
    };

    try {
      const token = localStorage.getItem("crp_token");

      const response = await axios.post("http://localhost:5000/api/loan", loanData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Loan sanctioned successfully!");
      console.log("Response:", response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Error sanctioning loan. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white shadow-md rounded">
      <h1 className="text-xl font-bold mb-4">Loan Sanction Form</h1>
      <form onSubmit={handleSubmit}>
        {/* Group ID Select */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Group ID</label>
          <Select
            options={groups}
            value={selectedGroup}
            onChange={handleGroupChange}
            placeholder="Select Group"
            isDisabled={loading}
            required
          />
        </div>

        {/* Loan Details */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Total Amount</label>
          <input
            type="number"
            name="totalAmount"
            className="w-full border p-2 rounded"
            value={loanDetails.totalAmount}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Interest Rate</label>
          <input
            type="number"
            name="interestRate"
            className="w-full border p-2 rounded"
            value={loanDetails.interestRate}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Term Months</label>
          <input
            type="number"
            name="termMonths"
            className="w-full border p-2 rounded"
            value={loanDetails.termMonths}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            name="startDate"
            className="w-full border p-2 rounded"
            value={loanDetails.startDate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Bank Details */}
        <div className="mb-3">
          <label className="block text-sm font-medium">Bank Name</label>
          <input
            type="text"
            name="bankName"
            className="w-full border p-2 rounded"
            value={loanDetails.bankName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Branch</label>
          <input
            type="text"
            name="branch"
            className="w-full border p-2 rounded"
            value={loanDetails.branch}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">IFSC Code</label>
          <input
            type="text"
            name="ifscCode"
            className="w-full border p-2 rounded"
            value={loanDetails.ifscCode}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium">Bank Interest Rate</label>
          <input
            type="number"
            name="bankInterestRate"
            className="w-full border p-2 rounded"
            value={loanDetails.bankInterestRate}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
          disabled={loading || !selectedGroup}
        >
          {loading ? "Sanctioning Loan..." : "Sanction Loan"}
        </button>
      </form>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
};

export default LoanSanctionForm;
