import React, { useEffect, useState } from "react";
import axios from "axios";

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [loansData, setLoansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCRP, setShowCRP] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null); // Track expanded group

  useEffect(() => {
    const fetchGroupsAndLoans = async () => {
      try {
        const crptoken = localStorage.getItem("crp_token");
        if (!crptoken) {
          setError("No authentication token found. Please log in.");
          setLoading(false);
          return;
        }

        const [groupsRes, loansRes] = await Promise.all([
          axios.get("http://localhost:5000/api/groups/created-by-crp", {
            headers: { Authorization: `Bearer ${crptoken}` },
          }),
          axios.get("http://localhost:5000/api/loan", {
            headers: {
              Authorization: `Bearer ${crptoken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        setGroups(groupsRes.data);
        setLoansData(loansRes.data);  // Store loans data here
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
        setLoading(false);
      }
    };

    fetchGroupsAndLoans();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleExpand = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };

  const getLoanDetails = (groupId) => {
    // Filter loansData based on groupId and return the relevant loan details
    const loanDetails = loansData.filter((loan) => loan.groupId._id === groupId);
    return loanDetails;
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm) ||
      group.members.some((member) =>
        member?.name.toLowerCase().includes(searchTerm)
      )
  );

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Groups Created by CRP</h2>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search Groups or Members..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-400 rounded-md w-1/2"
        />

        <div className="flex gap-4">
          <label>
            <input
              type="checkbox"
              checked={showCRP}
              onChange={() => setShowCRP(!showCRP)}
            />{" "}
            Show CRP Name
          </label>
          <label>
            <input
              type="checkbox"
              checked={showWhatsApp}
              onChange={() => setShowWhatsApp(!showWhatsApp)}
            />{" "}
            Show WhatsApp Link
          </label>
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <p className="text-center text-gray-500">No groups found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-blue-500 text-white">
              <tr>
                <th className="p-3 text-left">Sr. No</th>
                <th className="p-3 text-left">Group Name</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Sanction Loan Amt</th>
                <th className="p-3 text-left">Bank</th>
                {showCRP && <th className="p-3 text-left">CRP Name</th>}
                {showWhatsApp && <th className="p-3 text-left">WhatsApp Group Link</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, index) => {
                const groupLoans = getLoanDetails(group._id); // Filter loans for each group
                return (
                  <React.Fragment key={group._id}>
                    <tr
                      className="border-b hover:bg-gray-100 cursor-pointer"
                      onClick={() => toggleExpand(group._id)}
                    >
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-semibold">{group.name}</td>
                      <td className="p-3">{group.address}</td>

                      {/* Loan Data */}
                      <td className="p-3">
                        {groupLoans.length > 0 ? groupLoans[0].totalAmount : "N/A"}
                      </td>
                      <td className="p-3">
                        {groupLoans.length > 0
                          ? groupLoans[0].bankDetails?.bankName || "N/A"
                          : "N/A"}
                      </td>

                      {showCRP && <td className="p-3">{group.createdBy.name || "N/A"}</td>}
                      {showWhatsApp && (
                        <td className="p-3">
                          <a
                            href={group.whatsappGroupLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            Link
                          </a>
                        </td>
                      )}
                    </tr>

                    {/* Expandable Loan Details */}
                    {expandedGroup === group._id && (
                      <tr>
                        <td colSpan="7" className="p-4 bg-gray-50">
                          <h4 className="font-semibold text-lg mb-2">Loan Details:</h4>
                          {groupLoans.length > 0 ? (
                            groupLoans.map((loan, i) => (
                              <div key={i} className="p-2 border-b">
                                <p><strong>Loan ID:</strong> {loan._id}</p>
                                <p><strong>Sanction Amount:</strong> {loan.totalAmount}</p>
                                <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
                                <p><strong>Bank:</strong> {loan.bankDetails?.bankName}</p>
                                <p><strong>Status:</strong> {loan.status}</p>
                                <p><strong>Installments:</strong></p>
                                <ul>
                                  {loan.repaymentSchedules[0]?.installments.map((installment, idx) => (
                                    <li key={idx}>
                                      Installment {installment.installmentNumber}: Due {installment.dueDate} - {installment.amount}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          ) : (
                            <p>No loan details available for this group.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GroupsList;
