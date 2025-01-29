    import React, { useState, useEffect } from "react";
    import axios from "axios";

    const LoanSanctionForm = () => {
    const [loanDetails, setLoanDetails] = useState({
        groupId: "", // Default Group ID will be set after fetching
        totalAmount: "",
        interestRate: "",
        termMonths: "",
        startDate: "",
        bankName: "",
        branch: "",
        ifscCode: "",
        bankInterestRate: "",
    });

    const [groups, setGroups] = useState([]);  // State to store fetched groups
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Fetch groups when the component mounts
    useEffect(() => {
        fetchGroups();
    }, []);

    // Fetch groups from API
    const fetchGroups = async () => {
        try {
        const token = localStorage.getItem("crp_token");
        console.log(token)
        const response = await axios.get("http://localhost:5000/api/groups", {
            headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            },
        });
        setGroups(response.data);  // Set fetched groups to state
        } catch (error) {
        console.error("Error fetching groups:", error);
        setMessage("Failed to fetch groups.");
        }
    };

    // Handle input changes
    const handleChange = (field, value) => {
        setLoanDetails({ ...loanDetails, [field]: value });
    };

    // Handle form submission
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
        <h1 className="text-xl font-bold mb-4">Loan Sanction</h1>
        <form onSubmit={handleSubmit}>
            {/* Group ID select dropdown */}
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

            <div className="mb-3">
            <h2 className="text-lg font-bold mb-2">Bank Details</h2>
            <label className="block text-sm font-medium">Bank Name</label>
            <input
                type="text"
                className="w-full border p-2 rounded"
                value={loanDetails.bankName}
                onChange={(e) => handleChange("bankName", e.target.value)}
                required
            />
            </div>

            <div className="mb-3">
            <label className="block text-sm font-medium">Branch</label>
            <input
                type="text"
                className="w-full border p-2 rounded"
                value={loanDetails.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                required
            />
            </div>

            <div className="mb-3">
            <label className="block text-sm font-medium">IFSC Code</label>
            <input
                type="text"
                className="w-full border p-2 rounded"
                value={loanDetails.ifscCode}
                onChange={(e) => handleChange("ifscCode", e.target.value)}
                required
            />
            </div>

            <div className="mb-3">
            <label className="block text-sm font-medium">Bank Interest Rate (%)</label>
            <input
                type="number"
                className="w-full border p-2 rounded"
                value={loanDetails.bankInterestRate}
                onChange={(e) => handleChange("bankInterestRate", e.target.value)}
                required
            />
            </div>

            <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded w-full"
            disabled={loading}
            >
            {loading ? "Processing..." : "Sanction Loan"}
            </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
        </div>
    );
    };

    export default LoanSanctionForm;
