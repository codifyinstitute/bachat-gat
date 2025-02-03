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

        // Fetch groups and loans data concurrently
        const [groupsRes, loansRes] = await Promise.all([
          axios.get("http://localhost:5000/api/groups/created-by-crp", {
            headers: {
              Authorization: `Bearer ${crptoken}`,
              "Content-Type": "application/json",
            },
          }),
          axios.get("http://localhost:5000/api/loan", {
            headers: {
              Authorization: `Bearer ${crptoken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        console.log("Groups Response:", groupsRes.data); // Debugging groups data
        console.log("Loans Response:", loansRes.data); // Debugging loans data

        setGroups(groupsRes.data);
        setLoansData(loansRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err); // Log error
        setError("Error fetching data");
        setLoading(false);
      }
    };

    fetchGroupsAndLoans();
  }, [ ]); // Empty array ensures the hook runs only once

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleExpand = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
  };
  console.log(loansData,"loansdata")

  const getLoanDetails = (groupId) => {
    console.log(`Fetching loan details for groupId: ${groupId}`);
    // Log the loansData structure and groupId to check if there’s a mismatch
    console.log("Loans Data:", loansData);
    const loansForGroup = loansData.filter((loan) => {
      console.log("loan", loan)
      console.log("Loan Group ID:", loan.groupId._id); // This will show the actual groupId for each loan
      console.log("grpname",groupId)
      return loan.groupId._id === groupId;

    });
    console.log("Loans for group:", loansForGroup); // Check the resulting loans for the group
    return loansForGroup;
  };

  const filteredGroups = groups.filter((group) => {
    const groupNameMatch = group.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const memberMatch = group.members?.some((member) =>
      member?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return groupNameMatch || memberMatch;
  });
console.log("filtere", filteredGroups)

  console.log("Filtered Groups:", filteredGroups); // Debugging filtered groups

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-4">Your Groups</h2>

      <div className="flex justify-between md:gap-2 lg:gap-4 md:justify-center flex-wrap items-center mb-4">
        <input
          type="text"
          placeholder="Search Groups or Members..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-400 rounded-md w-full md:w-[40%] lg:w-1/2"
        />

        <div className="flex justify-between w-full md:w-[55%] px-4 py-2">
          <label>
            <input
              type="checkbox"
              checked={showCRP}
              onChange={() => setShowCRP(!showCRP)}
            />{" "}
            CRP Name
          </label>
          <label>
            <input
              type="checkbox"
              checked={showWhatsApp}
              onChange={() => setShowWhatsApp(!showWhatsApp)}
            />{" "}
            Get WhatsApp
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
                <th className="p-3 text-left"> Loan Amt</th>
                {/* <th className="p-3 text-left">Bank</th> */}
                {showCRP && <th className="p-3 text-left">CRP Name</th>}
                {showWhatsApp && <th className="p-3 text-left">WhatsApp Link</th>}
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, index) => {
                const groupLoans = getLoanDetails(group._id); // Use group._id to match loan details
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
                        {console.log("grploan", groupLoans)}
                      </td>
                      {/* <td className="p-3">
                        {groupLoans.length > 0
                          ? groupLoans[0].bankDetails?.name|| "N/A"
                          : "N/A"}
                          {console.log("bnkd", groupLoans[0].bankDetails)}
                      </td> */}

                      {showCRP && <td className="p-3">{group.createdBy.name || "N/A"}</td>}

                      {showWhatsApp && (<td className="p-3">
                          {console.log("whts", group.whatsappGroupLink)}
                          {showWhatsApp && <td className="p-3">{group.whatsappGroupLink || "N/A"}</td>}
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
                              <div key={i} className="py-2 px-4 border-b">
                                <div className="w-full flex justify-between mb-2">
                                  <p className=""><strong className="w-[300%]">Loan ID:</strong> {loan._id}</p>
                                  <p><strong>Sanction Amount:</strong> {loan.totalAmount}</p>
                                </div>
                                <div className="w-full flex justify-between mb-2">
                                  <p><strong>Interest Rate:</strong> {loan.interestRate}%</p>
                                  <p><strong>Status:</strong> {loan.status}</p>
                                </div>
                                <div className="w-full flex justify-between mb-2">
                                  <p><strong>Start Date:</strong> {new Date(loan.startDate).toLocaleDateString()}</p>
                                  <p><strong>Term (Months):</strong> {loan.termMonths}</p>
                                </div>
                                <div className="w-full flex justify-between mb-2">
                                  <p><strong>Per Member Amount:</strong>{(loan.perMemberAmount)}</p>
                                  <p><strong>Ifsc code:</strong> {loan.bankDetails?.ifsc || "N/A"}</p>
                                </div>
                                <div className="w-full flex justify-between mb-2">
                                  <p><strong>Bank name:</strong>{(loan.bankDetails?.name)}</p>

                                </div>
                                {loan.repaymentSchedules && loan.repaymentSchedules.length > 0 ? (
                                  loan.repaymentSchedules.map((schedule, idx) => (
                                    <div key={idx} className="p-2">
                                      {console.log("schedule",schedule)}
                                      <p><strong>Installment Schedule:</strong></p>
                                          <table className="w-full border-collapse border border-gray-400">
                                            <thead>
                                              <tr className="bg-gray-200">
                                                <th className="border border-gray-400 px-2 py-1">#</th>
                                                <th className="border border-gray-400 px-2 py-1">Due Date</th>
                                                <th className="border border-gray-400 px-2 py-1">Amount (₹)</th>
                                                <th className="border border-gray-400 px-2 py-1">Principal (₹)</th>
                                                <th className="border border-gray-400 px-2 py-1">Interest (₹)</th>
                                                <th className="border border-gray-400 px-2 py-1">Paid Amount (₹)</th>
                                                <th className="border border-gray-400 px-2 py-1">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {schedule.installments.map((inst, index) => (
                                                <tr key={inst._id} className="text-center">
                                                  <td className="border border-gray-400 px-2 py-1">{index + 1}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{new Date(inst.dueDate).toLocaleDateString()}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{inst.amount.toFixed(2)}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{inst.principal.toFixed(2)}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{inst.interest.toFixed(2)}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{inst.paidAmount.toFixed(2)}</td>
                                                  <td className="border border-gray-400 px-2 py-1">{inst.status}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                        </table>
                                    </div>
                                  ))
                                ) : (
                                  <p>No repayment schedule available.</p>
                                )}
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
