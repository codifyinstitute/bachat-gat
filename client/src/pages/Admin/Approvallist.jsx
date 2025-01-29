import React, { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, Eye } from "lucide-react";

const AdminApprovalList = () => {
  const [loans, setLoans] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
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

      const pendingLoans = response.data.filter((loan) => loan.status === "pending");
      setLoans(pendingLoans);
    } catch (error) {
      console.error("Error fetching loans:", error);
      alert("Failed to fetch loans.");
    }
  };

  const approveLoan = async () => {
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admin_token");

      await axios.put(
        `http://localhost:5000/api/loan/`,
        { status: "approved" },
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

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-6">Admin Approval List</h1>
      {message && <p className="text-green-600 text-center">{message}</p>}
      
      <div className="bg-white shadow-lg rounded-lg p-4">
        {loans.length === 0 ? (
          <p className="text-center text-gray-500">No pending loans available.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3">Loan ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Interest Rate</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan._id} className="border-b text-center bg-white hover:bg-gray-100">
                  <td className="p-3">{loan._id}</td>
                  <td className="p-3">₹{loan.totalAmount}</td>
                  <td className="p-3">{loan.interestRate}%</td>
                  <td className="p-3 flex justify-center space-x-3">
                    <button
                      onClick={() => setSelectedLoan(loan)}
                      className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
                    >
                      <Eye className="w-4 h-4 mr-1" /> View
                    </button>
                    <button
                      onClick={() => approveLoan(loan._id)}
                      disabled={loading}
                      className="bg-green-500 text-white px-3 py-1 rounded flex items-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> {loading ? "Approving..." : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Loan Details */}
      {selectedLoan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h2 className="text-xl font-bold mb-4">Loan Details</h2>
            <p><strong>Loan ID:</strong> {selectedLoan._id}</p>
            <p><strong>Total Amount:</strong> ₹{selectedLoan.totalAmount}</p>
            <p><strong>Interest Rate:</strong> {selectedLoan.interestRate}%</p>
            <p><strong>Term:</strong> {selectedLoan.termMonths} months</p>
            <p><strong>Start Date:</strong> {new Date(selectedLoan.startDate).toLocaleDateString()}</p>
            <h3 className="mt-4 text-lg font-bold">Bank Details</h3>
            <p><strong>Bank Name:</strong> {selectedLoan.bankName}</p>
            <p><strong>Branch:</strong> {selectedLoan.branch}</p>
            <p><strong>IFSC Code:</strong> {selectedLoan.ifscCode}</p>
            <p><strong>Bank Interest Rate:</strong> {selectedLoan.bankInterestRate}%</p>
            <button onClick={() => setSelectedLoan(null)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalList;
