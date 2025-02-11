import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

const AdminGroupsList = () => {
  const [loansData, setLoansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCRP, setShowCRP] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [savingsData, setSavingsData] = useState({});


  const fetchSavingsData = async (groups) => {
    const savings = {};
    for (const group of groups) {
      try {
        const res = await axios.get(`http://localhost:5000/api/collection/saving/${group._id}`);
        if (res.status === 200 && res.data.savingsAmount !== undefined) {
          savings[group._id] = res.data.savingsAmount; // Ensure we extract the correct value
        } else {
          savings[group._id] = "N/A"; // Handle cases where response is unexpected
        }
      } catch {
        savings[group._id] = "Not Available"; // Graceful handling of 404
      }
    }
    setSavingsData(savings);
  };

  const fetchGroupsAndLoans = async () => {
    try {
      const crptoken = localStorage.getItem("admin_token");

      if (!crptoken) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const [groupsRes, loansRes] = await Promise.all([
        axios.get("http://localhost:5000/api/groups/", {
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

      // Filter the groups to only include those with status "active"
      const activeGroups = groupsRes.data.filter(
        (group) => group.status === "active"
      );

      setGroups(activeGroups); // Set only the active groups
      setLoansData(loansRes.data);
      fetchSavingsData(activeGroups)

      setLoading(false);
    } catch (err) {
      setError("Error fetching data");
      setLoading(false);
    }
  };
  // fetchCollections()

  useEffect(() => {
    fetchGroupsAndLoans();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const toggleExpand = (groupId) => {
    setExpandedGroup(expandedGroup === groupId ? null : groupId);
    // setExpandedMember(expandedMember === idx ? null : idx);
  };

  const getLoanDetails = (groupId) => {
    // console.log("ll",loansData)
    return loansData.filter((loan) => loan.groupId?._id === groupId);
  };

  
  const filteredGroups = groups.filter((group) => {
    const groupNameMatch = group.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const memberMatch = group.members?.some((member) =>
      member?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return groupNameMatch || memberMatch;
  });

  const handleDeactivateGroup = async (groupId, e) => {
    e.stopPropagation(); // Prevent row expansion when clicking deactivate
  
    // First, check if all loans for the group are 'closed'
    const groupLoans = getLoanDetails(groupId);
  
    // Check if any loan is not closed
    const hasOpenLoans = groupLoans.some((loan) => loan.status !== "closed");
  
    if (hasOpenLoans) {
      alert("Cannot deactivate group: Some loans are still pending.");
      return;
    }
  
    // Ask for confirmation to deactivate the group
    if (
      !window.confirm(
        "Are you sure you want to deactivate this group and set all members to active?"
      )
    ) {
      return;
    }
  
    try {
      setDeleteError(null);
      const crptoken = localStorage.getItem("admin_token");
  
      // Send request to deactivate the group
      const response = await axios.delete(
        `http://localhost:5000/api/groups/del/${groupId}`,
        {}, // No request body needed
        {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      alert(response.data.message); // Show success message from backend
  
      // Refresh group and loan data
      await fetchGroupsAndLoans();
    } catch (error) {
      console.error(
        "Error deactivating group:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.message || "Failed to deactivate group.");
    }
  };
  

  if (loading) return <p className="text-center text-lg">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-center mb-4">Your Groups</h2>
  
        {deleteError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {deleteError}
          </div>
        )}
  
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
                  <th className="p-3 text-left">Loan Amt</th>
                  <th className="p-3 text-left">Saving Amt</th>
                  {showCRP && <th className="p-3 text-left">CRP Name</th>}
                  {showWhatsApp && <th className="p-3 text-left">WhatsApp Link</th>}
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group, index) => {
                  const groupLoans = getLoanDetails(group._id);
                  return (
                    <React.Fragment key={group._id}>
                      <tr
                        className="border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleExpand(group._id)}
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-semibold">{group.name}</td>
                        <td className="p-3">{group.address}</td>
                        <td className="p-3">
                          {groupLoans.length > 0 ? groupLoans[0].totalAmount : "N/A"}
                        </td>
                        <td className="p-3">{savingsData[group._id] || "Loading..."}</td>
                        {showCRP && (
                          <td className="p-3">{group.createdBy.name || "N/A"}</td>
                        )}
                        {showWhatsApp && (
                          <td className="p-3">{group.whatsappGroupLink || "N/A"}</td>
                        )}
                        <td className="p-3">
                          <Trash2
                            className="text-red-500 cursor-pointer"
                            onClick={(e) => handleDeactivateGroup(group._id, e)}
                          />
                        </td>
                      </tr>
  
                      {expandedGroup === group._id && (
                        <tr>
                          <td colSpan="7" className="p-4 bg-gray-50">
                            <h4 className="font-semibold text-lg mb-2">
                              Loan Details:
                            </h4>
                            {groupLoans.length > 0 ? (
                              groupLoans.map((loan, i) => {
                                const member = group.members[i]?.member;
                                return (
                                  <div key={i} className="py-2 px-4 border-b">
                                    <div className="w-full flex justify-between mb-2">
                                      <p>
                                        <strong>Loan ID:</strong> {loan._id}
                                      </p>
                                      <p>
                                        <strong>Sanction Amount:</strong>{" "}
                                        {loan.totalAmount}
                                      </p>
                                    </div>
  
                                    <div className="w-full flex justify-between mb-2">
                                      <p>
                                        <strong>Interest Rate:</strong>{" "}
                                        {loan.interestRate}%
                                      </p>
                                      <p>
                                        <strong>Status:</strong> {loan.status}
                                      </p>
                                    </div>
                                    <div className="w-full flex justify-between mb-2">
                                      <p>
                                        <strong>Start Date:</strong>{" "}
                                        {new Date(loan.startDate).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Term (Months):</strong>{" "}
                                        {loan.termMonths}
                                      </p>
                                    </div>
                                    <div className="w-full flex justify-between mb-2">
                                      <p>
                                        <strong>Per Member Amount:</strong>{" "}
                                        {loan.perMemberAmount}
                                      </p>
                                      <p>
                                        <strong>IFSC Code:</strong>{" "}
                                        {loan.bankDetails?.ifsc || "N/A"}
                                      </p>
                                    </div>
                                    <div className="w-full flex justify-between mb-2">
                                      <p>
                                        <strong>Bank Name:</strong>{" "}
                                        {loan.bankDetails?.name}
                                      </p>
                                    </div>
  
                                    {loan.repaymentSchedules &&
                                    loan.repaymentSchedules.length > 0 ? (
                                      loan.repaymentSchedules.map((schedule, idx) => {
                                        const members = group.members || [];
                                        const member = members[idx % members.length]?.member;
  
                                        return (
                                          <div key={idx} className="p-2">
                                            <p>
                                              <strong>
                                                Installment Schedule {idx + 1}:
                                              </strong>
                                            </p>
  
                                            {member ? (
                                              <div className="w-full flex justify-between mb-2">
                                                <p>
                                                  <strong>Member Name:</strong>{" "}
                                                  {member.name}
                                                </p>
                                                <p>
                                                  <strong>Member Mobile:</strong>{" "}
                                                  {member.mobileNumber}
                                                </p>
                                              </div>
                                            ) : (
                                              <p className="text-red-500">
                                                No corresponding member found.
                                              </p>
                                            )}
  
                                            <table className="w-full border-collapse border border-gray-400">
                                              <thead>
                                                <tr className="bg-gray-200">
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    #
                                                  </th>
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Due Date
                                                  </th>
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Amount (₹)
                                                  </th>
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Principal (₹)
                                                  </th>
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Interest (₹)
                                                  </th>
                                                  {/* <th className="border border-gray-400 px-2 py-1">
                                                    Savings (₹)
                                                  </th> */}
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Paid Amount (₹)
                                                  </th>
                                                  <th className="border border-gray-400 px-2 py-1">
                                                    Status
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {schedule.installments.map((inst, index) => {
                                                  
                                                  return (
                                                    <tr key={inst._id} className="text-center">
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {index + 1}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {new Date(
                                                          inst.dueDate
                                                        ).toLocaleDateString()}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {inst.amount.toFixed(2)}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {inst.principal.toFixed(2)}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {inst.interest.toFixed(2)}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {inst.paidAmount.toFixed(2)}
                                                      </td>
                                                      <td className="border border-gray-400 px-2 py-1">
                                                        {inst.status}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <p>No repayment schedule available.</p>
                                    )}
                                  </div>
                                );
                              })
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

export default AdminGroupsList;
