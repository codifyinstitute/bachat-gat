import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import LatePayment from '../../components/LatePayment';
import dayjs from "dayjs";
import SavingInvoice from "../../components/SavingInvoice";
import { toWords } from "number-to-words";

const AdminGroupsList = () => {
  const [loansData, setLoansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCRP, setShowCRP] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedMember, setExpandedMember] = useState(null);
  const [groups, setGroups] = useState([]);
  const [deleteError, setDeleteError] = useState(null);
  const [savingsData, setSavingsData] = useState({});
  const [crpData, setCrpData] = useState([]); // State to store CRP data
  const [showSavingInvoice, setShowSavingInvoice] = useState(false);
  const [savingInvoiceData, setSavingInvoiceData] = useState({
    date: "",
    membername: "",
    amount: "",
    amountInWords: "",
    savingAmount: "",
    groupName: "",
    termMonth: "",
    loanId:""
  });


  const fetchSavingsData = async (groups) => {
    const savings = {};
    for (const group of groups) {
      // console.log(group)
      try {
        const res = await axios.get(`http://localhost:5000/api/collection/saving/${group._id}`);
        if (res.status === 200 && res.data.savingsAmount !== undefined) {
          savings[group._id] = res.data.savingsAmount;
          // savings[totalsavingsAmount] = res // Ensure we extract the correct value
        } else {
          savings[group._id] = "N/A"; // Handle cases where response is unexpected
        }
      } catch {
        savings[group._id] = "Not Available"; // Graceful handling of 404
      }
    }
    setSavingsData(savings);
  };

  // console.log("first",savingsData)

  const fetchGroupsAndLoans = async () => {
    try {
      const crptoken = localStorage.getItem("crp_token");

      if (!crptoken) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      const [groupsRes, loansRes, crpRes] = await Promise.all([
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
        axios.get("http://localhost:5000/api/crp/allcrp", {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            "Content-Type": "application/json",
          },
        }),
      ]);
      // console.log()

      if (crpRes.data && crpRes.data.crps && Array.isArray(crpRes.data.crps)) {
        setCrpData(crpRes.data.crps); // Set CRP data if it's an array
      } else if (crpRes.data && crpRes.data.crps) {
        // If it's an object, we directly set the CRP as is
        // console.log("CRP Data is not an array:", crpRes.data);
        setCrpData(crpRes.data.crps); // Treat it as an object or as needed
      } else {
        // console.error("Unexpected CRP Data format:", crpRes.data);
        setCrpData([]); // Default to an empty array if data is not in expected format
      }

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

  const toggleMemberExpand = (memberId, e) => {
    e.stopPropagation(); // Prevent group toggle
    setExpandedMember(expandedMember === memberId ? null : memberId);
  };

  const getLoanDetails = (groupId) => {
    // console.log("ll",loansData)
    return loansData.filter((loan) => loan.groupId?._id === groupId);
  };

  const getCrpMobile = (crpId) => {
    // If crpData is an array, use .find(), else use direct lookup
    if (crpData && crpData.length > 0) {
      const crp = crpData.find((crp) => crp._id === crpId);
      return crp ? crp.mobile : "N/A"; // Return mobile or "N/A" if not found
    } else if (crpData && crpData[crpId]) {
      // If crpData is an object, directly lookup by crpId
      return crpData[crpId]?.mobile || "N/A";
    }

    return "N/A"; // Default return if crpData is empty or not found
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

  const convertNumberToWords = (number) => {
    const [intPart, decimalPart] = number.toString().split(".");
    let words = toWords(parseInt(intPart));
    words = words.charAt(0).toUpperCase() + words.slice(1);
    words += decimalPart ? ` Rupees and ${toWords(parseInt(decimalPart))} Paise` : " Rupees Only";
    return words;
  };

  const handlesavinginvoice = (group, loanid, member, savingAmount, interestMonth) => {
    const currentDate = new Date().toLocaleDateString();

    // console.log(loanid._id)

    const memberSchedule = loanid.repaymentSchedules.find(schedule =>
      schedule.memberId._id === member._id
    );

    if (!memberSchedule) {
      alert("Member not found in repayment schedules.");
      return;
    }

    // Check if all installments are paid
    const allPaid = memberSchedule.installments.every(installment => installment.status === "paid");

    if (!member || !member.name) {
      alert("Member name is missing!");
      return;
    }

    setSavingInvoiceData({
      date: currentDate,
      membername: member.name,
      amount: savingAmount || "N/A",
      amountInWords: savingAmount ? convertNumberToWords(savingAmount * interestMonth) : "N/A",
      savingAmount: savingAmount * interestMonth || "N/A",
      groupName: group.name,
      termMonth: interestMonth || "N/A",
      loanId: loanid._id || "N/A"
    });

    if (allPaid) {
      setShowSavingInvoice(true);
    }else{
      alert('member has not paid all installments')
    }

  };

  // console.log(savingInvoiceData)
  const closeSavingInvoice = () => {
    setShowSavingInvoice(false);
  };

  return (
    <div className="container mx-auto p-4 w-full">
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
                const crpMobile = getCrpMobile(group.createdBy._id);

                // { console.log("first", groupLoans) }
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
                        {/* {console.log("first", groupLoans)} */}
                      </td>
                      <td className="p-3">
                        {(() => {
                          // First, calculate the total number of repaymentSchedules across all groupLoans
                          const totalRepaymentSchedules = groupLoans.reduce((total, loan) => {
                            return total + (Array.isArray(loan.repaymentSchedules) ? loan.repaymentSchedules.length : 0);
                          }, 0);

                          // Then, multiply the totalRepaymentSchedules by the savingsData for the group
                          const savingsAmount = savingsData[group._id] || 0;
                          const totalSavings = totalRepaymentSchedules > 0 ? savingsAmount * totalRepaymentSchedules : "N/A";

                          return totalSavings;
                        })()}
                      </td>

                      {showCRP && (
                        <div>
                          <td className="p-3">{group.createdBy.name || "N/A"}</td>
                          <td className="p-3">{crpMobile}</td>
                        </div>
                      )}
                      {showWhatsApp && (
                        <td className="p-3">
                          <a
                            href={group.whatsappGroupLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {group.whatsappGroupLink ? "Join WhatsApp Group" : "N/A"}
                          </a>
                        </td>
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
                        <td colSpan="8" className="p-4 bg-gray-50">
                          <h4 className="font-semibold text-lg mb-2">
                            Loan Details:
                          </h4>
                          {groupLoans.length > 0 ? (
                            groupLoans.map((loan, i) => {
                              const member = group.members[i]?.member;
                              return (
                                <div key={i} className="py-2 px-4 border-b">
                                  <div className="flex justify-between ml-4">
                                    <div className=" mb-2 w-[30%]">
                                      <p>
                                        <strong>Sanction Amount:</strong>{" "}
                                        {loan.totalAmount}
                                      </p>
                                      <p>
                                        <strong>Loan Id:</strong> {loan._id}
                                      </p>
                                      <p>
                                        <strong>Loan Acc:</strong> {loan.loanAccountNo}
                                      </p>
                                      <p >
                                        <strong>Saving Acc:</strong>{" "}
                                        {loan.savingAccountNo}
                                      </p>
                                      <p>
                                        <strong>Interest Rate:</strong>{" "}
                                        {loan.interestRate}%
                                      </p>
                                      <p>
                                        <strong>Status:</strong> {loan.status}
                                      </p>
                                    </div>
                                    <div className="w-[30%] mb-2">
                                      <p>
                                        <strong>D.O.C:</strong> {dayjs(loan.startDate).format('DD/MM/YYYY')}
                                      </p>

                                      <p>
                                        <strong>Term (Months):</strong>{" "}
                                        {loan.termMonths}
                                      </p>
                                      <p>
                                        <strong>Per Member Amount:</strong>{" "}
                                        {loan.perMemberAmount}
                                      </p>
                                      <p>
                                        <strong>IFSC Code:</strong>{" "}
                                        {loan.bankDetails?.ifsc || "N/A"}
                                      </p>
                                      <p>
                                        <strong>Bank Name:</strong>{" "}
                                        {loan.bankDetails?.name}
                                      </p>
                                    </div>
                                  </div>

                                  {loan.repaymentSchedules && loan.repaymentSchedules.map((schedule, scheduleIndex) => {
                                    const member = group.members[scheduleIndex]?.member;
                                    const savingsAmount = savingsData[group._id] || "Loading...";

                                    return (
                                      <div key={scheduleIndex} className=" mb-1">
                                        <div
                                          className="p-3 bg-gray-100 cursor-pointer flex items-center justify-between"
                                          onClick={(e) => toggleMemberExpand(member?._id, e)}
                                        >
                                          {expandedMember === member?._id ?
                                            <ChevronDown className="w-4 h-4" /> :
                                            <ChevronRight className="w-4 h-4" />
                                          }
                                          <div className="flex-1 ml-2">
                                            <div className="grid grid-cols-3 gap-4">
                                              <p><strong>Member Name:</strong> {member?.name || "N/A"}</p>
                                              <p><strong>Mobile:</strong> {member?.mobileNumber || "N/A"}</p>
                                              <p><strong>Savings/Month:</strong> {savingsAmount}</p>
                                            </div>
                                          </div>
                                        </div>

                                        {/* {console.log(member._id)} */}

                                        {expandedMember === member?._id && (
                                          <div className="p-4">
                                            <LatePayment memberid={member._id} />
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
                                                {schedule.installments.map((inst, instIndex) => (
                                                  <tr key={inst._id} className="text-center">
                                                    <td className="border border-gray-400 px-2 py-1">{instIndex + 1}</td>
                                                    <td className="border border-gray-400 px-2 py-1">
                                                      {dayjs(inst.dueDate).format('DD/MM/YYYY')}
                                                    </td>
                                                    <td className="border border-gray-400 px-2 py-1">{inst.amount.toFixed(2)}</td>
                                                    <td className="border border-gray-400 px-2 py-1">{inst.principal.toFixed(2)}</td>
                                                    <td className="border border-gray-400 px-2 py-1">{inst.interest.toFixed(2)}</td>
                                                    <td className="border border-gray-400 px-2 py-1">{inst.paidAmount.toFixed(2)}</td>
                                                    <td className="border border-gray-400 px-2 py-1">{inst.status}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                            <button
                                            onClick={() => handlesavinginvoice(group, loan, member, savingsData[group._id], loan.termMonths)}
                                            className="bg-blue-500 py-1 px-3 text-gray-100 rounded-md mt-3 transition-all duration-150 hover:scale-102 hover:text-white"
                                          >
                                            Print Saving Invoice
                                          </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
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
      {showSavingInvoice && (
        <div className="fixed inset-0 bg-gray-100 flex justify-center items-center z-50">
          <div className="relative bg-white p-4 rounded-lg">
            <button
              onClick={closeSavingInvoice}
              className="absolute top-8 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              X
            </button>
            <SavingInvoice data={savingInvoiceData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGroupsList;
