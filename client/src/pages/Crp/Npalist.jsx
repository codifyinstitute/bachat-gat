import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GroupsList = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMembers, setShowMembers] = useState(false); // For toggling members visibility
  const [memberDetails, setMemberDetails] = useState([]); // For storing detailed member info
  const [loans, setLoans] = useState([]); // For storing loan data
  const [showInstallments, setShowInstallments] = useState({}); // Track visibility of installments per member
  // const [searchQuery, setSearchQuery] = useState('');  

  // Fetch CRP token from localStorage
  const crpToken = localStorage.getItem('crp_token');

  // Fetch groups from API
  const fetchGroups = async () => {
    if (!crpToken) {
      setError('CRP token not found!');
      setLoading(false);
      return;
    }
  
    try {
      const response = await axios.get('http://localhost:5000/api/groups/created-by-crp', {
        headers: {
          Authorization: `Bearer ${crpToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Filter groups to include only those with status 'active'
      const activeGroups = response.data.filter(group => group.status === 'active');
      setGroups(activeGroups); // Set active groups to the state
      setLoading(false); // Stop loading
    } catch (err) {
      setError('Error fetching groups!');
      setLoading(false);
    }
  };

  // Fetch loans when the component mounts
  const fetchLoans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/loan', {
        headers: {
          Authorization: `Bearer ${crpToken}`,
          'Content-Type': 'application/json',
        },
      });
      setLoans(response.data);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };

  // Fetch groups and loans when the component mounts
  useEffect(() => {
    fetchGroups();
    fetchLoans();
  }, []);

  // Handle group click
  const handleGroupClick = async (groupId) => {
    const group = groups.find((g) => g._id === groupId);
    setSelectedGroupId(groupId);
    setSelectedGroup(group);

    // Fetch member details
    const members = await Promise.all(
      group.members.map(async (member) => {
        try {
          const memberId = typeof member.member._id === 'object' ? member.member._id.toString() : member.member._id;

          const response = await axios.get(`http://localhost:5000/api/member/${memberId}`, {
            headers: {
              Authorization: `Bearer ${crpToken}`,
              'Content-Type': 'application/json',
            },
          });

          return response.data;
        } catch (error) {
          console.error("Error fetching member details:", error);
          return null;
        }
      })
    );

    setMemberDetails(members.filter((member) => member !== null));
  };

  // Check if a member has 2 consecutive pending installments
  const hasTwoConsecutivePendingInstallments = (installments) => {
    let pendingCount = 0;
    for (let i = 0; i < installments.length; i++) {
      if (installments[i].status === 'pending') {
        pendingCount++;
      } else {
        pendingCount = 0; // Reset count if any installment is not pending
      }
      if (pendingCount >= 2) {
        return true; // Found two consecutive pending installments
      }
    }
    return false; // No two consecutive pending installments found
  };

  // Handle NPA toggle
  const toggleNPA = async (_id, event, memberInstallments, currentNPAStatus) => {
  event.stopPropagation();

  // Determine confirmation message based on the current NPA status
  const confirmationMessage = currentNPAStatus === 'YES'
    ? 'Are you sure you want to remove this member as NPA?'
    : 'Are you sure you want to add this member as NPA?';

  // Show confirmation dialog
  if (!window.confirm(confirmationMessage)) {
    return; // Exit the function if the user cancels
  }

  // If the current status is YES, check if all installments are paid
  if (currentNPAStatus === 'YES') {
    const allPaid = memberInstallments.every((installment) => installment.status === 'paid');

    if (!allPaid) {
      alert("Cannot remove NPA unless all installments are paid.");
      return; // Exit the function if not all installments are paid
    }
  }

  // Check if there are 2 consecutive pending installments
  const canToggleNPA = hasTwoConsecutivePendingInstallments(memberInstallments);
  if (!canToggleNPA && currentNPAStatus === 'NO') {
    alert("Cannot mark NPA unless there are 2 consecutive pending installments.");
    return;
  }

  try {
    // Toggle the NPA status on the backend
    const response = await axios.put(
      `http://localhost:5000/api/member/${_id}/toggle-npa`,
      {},
      { headers: { Authorization: `Bearer ${crpToken}` } }
    );

    // Update the member's NPA status in the UI
    setMemberDetails((prevMembers) =>
      prevMembers.map((member) =>
        member._id === _id
          ? { ...member, isNPA: currentNPAStatus === 'NO' ? 'YES' : 'NO' }
          : member
      )
    );
  } catch (error) {
    console.error('Error updating NPA status:', error);
    alert('Failed to update NPA status.');
  }
};

  // Toggle the visibility of installments for a specific member
  const toggleInstallments = (memberId) => {
    setShowInstallments((prev) => ({
      ...prev,
      [memberId]: !prev[memberId], // Toggle the visibility for the member
    }));
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');  // Pad single digits with a leading zero
    const month = (d.getMonth() + 1).toString().padStart(2, '0');  // Month is 0-indexed, so add 1
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h3 className="text-3xl font-semibold mb-6 text-center">Groups Created by CRP</h3>

      {/* Display all groups */}
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group._id} className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleGroupClick(group._id)}
            >
              <h4 className="text-xl font-medium text-gray-800">{group.name}</h4>
              <span className="text-gray-500">Total Members: {group.members.length}</span>
            </div>

            {selectedGroupId === group._id && selectedGroup && (
              <div className="mt-4">
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showMembers ? 'Hide Members' : 'Show Members'}
                </button>

                {showMembers && (
                  <div className="space-y-4">
                    {memberDetails.map((member) => {
                      // Filter loans that the member is part of
                      const memberLoans = loans
                        .filter((loan) => loan.repaymentSchedules.some(schedule => schedule.memberId._id === member._id));

                      // Create a Set to store unique installments for this member
                      const uniqueInstallments = new Set();
                      const memberInstallments = [];

                      // Flatten repayment schedules and installments for the member
                      memberLoans.forEach((loan) => {
                        loan.repaymentSchedules.forEach((schedule) => {
                          schedule.installments.forEach((installment) => {
                            // console.log("bnk",loan)
                            const installmentKey = `${loan._id}-${installment.installmentNumber}-${installment.dueDate}`;
                            if (!uniqueInstallments.has(installmentKey)) {
                              uniqueInstallments.add(installmentKey);

                              // If loan has a bankName, use it, otherwise log the loan object
                              const bankName = loan.bankDetails.name || 'Unknown Bank';
                              memberInstallments.push({
                                ...installment,
                                bankName: bankName,
                              });
                            }
                          });
                        });
                      });

                      return (
                        <div key={member._id} className="border p-4 rounded-lg bg-gray-50">
                          <p className="text-lg font-semibold text-gray-700">Name: {member.name}</p>
                          <p className="text-gray-600">Mobile: {member.mobileNumber}</p>
                          <p className="text-gray-600">Is NPA: {member.isNPA === 'YES' ? 'Yes' : 'No'}</p>

                          {/* NPA Toggle Button */}
                          <button
                            className={`px-3 py-1 text-sm mr-2 font-medium rounded ${member.isNPA === 'YES' ? 'bg-green-300 text-black' : 'bg-red-200 text-black'}`}
                            onClick={(event) => toggleNPA(member._id, event, memberInstallments, member.isNPA)}
                          >
                            {member.isNPA === 'YES' ? 'Yes' : 'No'}
                          </button>

                          {/* Installments toggle button */}
                          <button
                            onClick={() => toggleInstallments(member._id)}
                            className="px-3 py-1 bg-gray-200 text-black rounded mt-2"
                          >
                            {showInstallments[member._id] ? 'Hide Installments' : 'Show Installments'}
                          </button>

                          {/* Show installments if toggled */}
                          {showInstallments[member._id] && (
                            <div className="mt-2 space-y-2">
                              {memberInstallments.map((installment, idx) => (
                                <div key={idx} className="p-2 border rounded-lg bg-gray-100">
                                  <p>Installment {installment.installmentNumber}</p>
                                  <p>Bank Name: {installment.bankName}</p>
                                  <p>Total Amount: {installment.amount}</p>
                                  <p>Status: {installment.status}</p>
                                  {installment.dueDate && (
                                    <p>Due Date: {formatDate(installment.dueDate)}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupsList;
