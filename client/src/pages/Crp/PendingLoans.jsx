import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Eye } from "lucide-react";

const PendingLoans = () => {
    const [loans, setLoans] = useState([]);
    const [expandedLoanId, setExpandedLoanId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
            setLoans(pendingLoans);
        } catch (error) {
            console.error("Error fetching loans:", error);
            alert("Failed to fetch loans.");
        }
    };
    console.log(loans)

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Pending Loans</h1>
            {message && <p className="text-green-600 text-center mb-4">{message}</p>}

            <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
                {loans.length === 0 ? (
                    <p className="text-center text-gray-500">No pending loans available.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4">
                        {loans.map((loan) => (
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
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Total Amount:</strong> ₹{loan.totalAmount}</p>
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Per Member Amount:</strong> ₹{loan.perMemberAmount}</p>
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Term:</strong> {loan.termMonths} months</p>
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Start Date:</strong> {new Date(loan.startDate).toLocaleDateString()}</p>
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Status:</strong> {loan.status}</p>
                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Approved By:</strong> {loan.approvedBy ? loan.approvedBy.username : "N/A"}</p>

                                        {/* Bank Details */}
                                        {loan.bankDetails && loan.bankDetails.length > 0 ? (
                                            <>
                                                <h4 className="font-bold mt-2">Bank Details</h4>
                                                {console.log()}
                                                {loan.bankDetails.map((bank, index) => (
                                                    <div key={index} className="border p-2 rounded bg-gray-50 shadow-sm">
                                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Bank Name:</strong> {bank.bankName}</p>
                                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Branch:</strong> {bank.branch}</p>
                                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>IFSC Code:</strong> {bank.ifscCode}</p>
                                                        <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Bank Interest Rate:</strong> {bank.interestRate}%</p>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <p className="text-red-500">No bank details available.</p>
                                        )}
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
