import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Eye, Trash } from "lucide-react";
import dayjs from "dayjs";


const AdminApprovalList = () => {
  const [loans, setLoans] = useState([]);
  const [expandedLoanId, setExpandedLoanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await axios.get("http://localhost:5000/api/loan", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Filter and sort the loans by 'createdAt' in descending order (most recent first)
      const pendingLoans = response.data.filter((loan) => loan.status === "pending");
      const sortedLoans = pendingLoans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setLoans(sortedLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      alert("Failed to fetch loans.");
    }
  };

  const approveLoan = async (loanId) => {
    // Confirm approval
    const isConfirmed = window.confirm("Do you want to approve this loan?");
    if (!isConfirmed) return; // If not confirmed, return early

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");

      // Sending POST request to approve the loan
      await axios.post(
        `http://localhost:5000/api/loan/${loanId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Loan approved successfully!");
      fetchLoans(); // Refresh loan list after approval
    } catch (error) {
      console.error("Error approving loan:", error);
      setMessage("Error approving loan.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle loan deletion
  const deleteLoan = async (loanId) => {
    // Confirm deletion
    const isConfirmed = window.confirm("Do you want to delete this loan?");
    if (!isConfirmed) return; // If not confirmed, return early

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");

      // Sending DELETE request to delete the loan
      await axios.delete(`http://localhost:5000/api/loan/deleteloan/${loanId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("Loan deleted successfully!");
      fetchLoans(); // Refresh loan list after deletion
    } catch (error) {
      console.error("Error deleting loan:", error);
      setMessage("Error deleting loan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Admin Approval List</h1>
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
                <p className="text-[13px] sm:text-[16px] md:text-[16px] text-gray-600">Crp Name: {loan.createdBy?.name}</p>
                <p className="text-[13px] sm:text-[16px] md:text-[16px] text-gray-600">Group Name: {loan.groupId?.name}</p>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setExpandedLoanId(expandedLoanId === loan._id ? null : loan._id)}
                    className="bg-blue-500 text-white px-3 py-1 text-sm rounded flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> {expandedLoanId === loan._id ? "Hide" : "View"}
                  </button>
                  <div className="flex gap-4">
                    {/* Delete Button */}
                    <button
                      onClick={() => deleteLoan(loan._id)}  // Call deleteLoan when clicked
                      className="bg-red-500 text-white px-3 py-1 text-sm rounded flex items-center justify-center"
                    >
                      <Trash className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> {loading ? "Deleting..." : "Delete"}
                    </button>
                    {/* Approve Button */}
                    <button
                      onClick={() => approveLoan(loan._id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-3 py-1 text-sm rounded flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> {loading ? "Approving..." : "Approve"}
                    </button>
                  </div>
                </div>

                {/* Expanded Loan Details */}
                {expandedLoanId === loan._id && (
                  <div className="mt-4 md:flex md:justify-between space-y-2">
                    <div>
                      <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Total Amount:</strong> ₹{loan.totalAmount}</p>
                      <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Per Member Amount:</strong> ₹{loan.perMemberAmount}</p>
                      <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Term:</strong> {loan.termMonths} months</p>
                      <p className="text-[14px] sm:text-[16px] md:text-[16px]"><strong>Start Date:</strong> {dayjs(loan.startDate).format('DD/MM/YYYY')}</p>
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

export default AdminApprovalList;
