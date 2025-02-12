import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Eye } from "lucide-react";

const PendingLoans = () => {
    const [loans, setLoans] = useState([]);
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");  // State for the search term

    useEffect(() => {
        fetchLoans();
    }, []);

    const fetchLoans = async () => {
        try {
            const token = localStorage.getItem("crp_token");

            const response = await axios.get("http://localhost:5000/api/loan", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const pendingLoans = response.data.filter((loan) => loan.status === "pending");

            // Sort the loans based on creation date (most recent first)
            const sortedLoans = pendingLoans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setLoans(sortedLoans);
        } catch (error) {
            console.error("Error fetching loans:", error);
            alert("Failed to fetch loans.");
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filter loans based on the search term
    const filteredLoans = loans.filter((loan) => {
        return (
            loan._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.totalAmount.toString().includes(searchTerm.toLowerCase()) ||
            loan.interestRate.toString().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Pending Loans</h1>
            {message && <p className="text-green-600 text-center mb-4">{message}</p>}

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    className="p-2 w-full sm:w-1/2 mx-auto border border-gray-300 rounded-md"
                    placeholder="Search by Loan ID, Amount, or Interest Rate"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                {filteredLoans.length === 0 ? (
                    <p className="text-center text-gray-500">No pending loans available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
                        {filteredLoans.map((loan) => (
                            <div key={loan._id} className="bg-white p-2 md:p-4 lg:p-4 rounded-lg shadow">
                                <h3 className="text-[14px] sm:text-sm md:text-xl lg:text-xl xl:text-xl font-semibold text-gray-800">
                                    Loan ID: {loan._id}
                                </h3> {/* Show only the first 5 characters of the Loan ID */}
                                <p className="text-[13px] sm:text-[16px] md:text-[16px] text-gray-600">Amount: ₹{loan.totalAmount}</p>
                                <p className="text-[13px] sm:text-[16px] md:text-[16px] text-gray-600">Interest Rate: {loan.interestRate}%</p>
                                <div className="flex justify-between items-center mt-4">
                                    <button
                                        onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                                        className="bg-blue-500 text-white px-3 py-1 text-sm rounded flex items-center justify-center"
                                    >
                                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> {expandedLoanId === loan._id ? "Hide" : "View"}
                                    </button>
                                </div>

                                {/* Expanded Loan Details */}
                                {expandedLoanId === loan._id && (
                                    <div className="mt-4 md:flex space-y-2 justify-between p-4">
                                        <div>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Total Amount:</strong> ₹{loan.totalAmount}</p>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Per Member Amount:</strong> ₹{loan.perMemberAmount}</p>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Term:</strong> {loan.termMonths} months</p>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Start Date:</strong> {new Date(loan.startDate).toLocaleDateString()}</p>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Status:</strong> {loan.status}</p>
                                            <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Approved By:</strong> {loan.approvedBy ? loan.approvedBy.username : "N/A"}</p>
                                        </div>

                                        {/* Bank Details */}
                                        <div className="flex flex-col">
                                            {loan.bankDetails ? (
                                                <>
                                                    <h4 className="font-bold mt-2">Bank Details</h4>
                                                    <div className="border p-2 rounded bg-gray-50 shadow-sm md:shadow-[none] md:border-0">
                                                        <p><strong>Bank Name:</strong> {loan.bankDetails.name}</p>
                                                        <p><strong>Branch:</strong> {loan.bankDetails.branch}</p>
                                                        <p><strong>IFSC Code:</strong> {loan.bankDetails.ifsc}</p>
                                                        <p><strong>Interest Rate:</strong> {loan.bankDetails.interestRate}%</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-red-500">No bank details available.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingLoans;
