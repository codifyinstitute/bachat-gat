import React, { useState, useEffect } from "react";
import axios from "axios";
import SavingInvoice from "../../components/GroupSavingInvoice";
import { toWords } from "number-to-words";

const WithdrawSavings = () => {
  // State hooks
  const [groups, setGroups] = useState([]);
  const [loans, setLoans] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedLoan, setSelectedLoan] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [groupMembers, setGroupMembers] = useState([]); // State to store group members' details
  const [loanBankDetails, setLoanBankDetails] = useState(null); // State to store loan bank details
  const [loanTermMonths, setLoanTermMonths] = useState(null); // State for storing termMonths

  const [showSavingInvoice, setShowSavingInvoice] = useState(false);
  const [savingInvoiceData, setSavingInvoiceData] = useState({
    date: "",
    amount: "",
    amountInWords: "",
    groupName: "",
    termMonth: "",
    loanId: ""
  });

  // Fetch groups created by CRP
  const crptoken = localStorage.getItem("crp_token");
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/groups/created-by-crp", {
        headers: {
          Authorization: `Bearer ${crptoken}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        // Filter groups where the status is "active"
        const activeGroups = response.data.filter(group => group.status === "active");
        setGroups(activeGroups); // Set only active groups
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
  }, [crptoken]);

  // Fetch loans when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      axios
        .get("http://localhost:5000/api/loan", {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          // Filter loans to only those that are "closed" and belong to the selected group
          const closedLoans = response.data.filter(
            (loan) =>
              loan.status === "closed" && loan.groupId?._id === selectedGroup
          );
  
          if (closedLoans.length > 0) {
            // Assuming the loan object has bankDetails and termMonths
            setLoanBankDetails(closedLoans[0].bankDetails); // Store bank details
            setLoanTermMonths(closedLoans[0].termMonths);  // Store termMonths
          }
  
          setLoans(closedLoans); // Set the loans data for the selected group
        })
        .catch((error) => {
          console.error("Error fetching loans:", error);
        });
    }
  }, [selectedGroup, crptoken]);
  

  // Fetch collections when a loan is selected
  useEffect(() => {
    if (selectedLoan) {
      axios
        .get(`http://localhost:5000/api/collection/`, {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          const collectionsForLoan = response.data.filter(
            (collection) => collection.groupId?._id === selectedGroup
          );
          setCollections(collectionsForLoan); // Set collections for the selected loan
        })
        .catch((error) => {
          console.error("Error fetching collections:", error);
        });
    }
  }, [selectedLoan, crptoken]);

  // Fetch group members when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      axios
        .get(`http://localhost:5000/api/groups/${selectedGroup}`, {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          setGroupMembers(response.data.members); // Set group members when the group is selected
        })
        .catch((error) => {
          console.error("Error fetching group members:", error);
        });
    }
  }, [selectedGroup, crptoken]);

  // Handle selection changes
  const handleGroupChange = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleLoanChange = (e) => {
    setSelectedLoan(e.target.value);
  };

  const handleCollectionChange = (e) => {
    setSelectedCollection(e.target.value);
  };

  const handleWithdraw = () => {
    // Collect the necessary data
  
    const isConfirmed = window.confirm("Do you want to withdraw the savings?");
    if (!isConfirmed) {
      console.log("Withdrawal canceled by user.");
      return; // Stop the function if user cancels
    }
  
    // Ensure selectedCollection exists and payments are available
    const selectedCollectionData = collections.find(collection => collection._id === selectedCollection);
  
    if (!selectedCollectionData || !selectedCollectionData.payments || selectedCollectionData.payments.length === 0) {
      console.error("Invalid collection data or empty payments array");
      return;
    }
  
    console.log("loan", loanTermMonths);
  
    // Use the loan's termMonths to calculate the totalSavingsAmount
    const totalSavingsAmount = selectedCollectionData.totalSavingsCollected * loanTermMonths || 'N/A';
    
    console.log("totalSavingsAmount", totalSavingsAmount);
  
    const data = {
      loanId: selectedLoan,
      groupId: selectedGroup,
      bankName: loanBankDetails ? loanBankDetails.name : '',
      groupName: groups.find(group => group._id === selectedGroup)?.name,
      loanStatus: 'closed', // Assuming the loan is active when making the withdrawal
      withdrawStatus: 'yes',
      totalSavingAmount: totalSavingsAmount, // Calculated total savings amount
  
      memberList: groupMembers.map((memberObj) => {
        const { member } = memberObj;
  
        // Find the corresponding collection
        const selectedCollectionData = collections.find(collection => collection._id === selectedCollection);
  
        // Filter the payments for the current member
        const memberPayments = selectedCollectionData?.payments.filter(payment => payment.installmentNumber * payment.savingsAmount) || [];
  
        console.log("first", memberPayments);
  
        // Calculate the total withdraw amount for the current member by multiplying savingsAmount with installmentNumber
        const withdrawAmount = memberPayments.reduce((total, payment) => {
          console.log("smt", payment.savingsAmount)
          return total = (payment.savingsAmount * loanTermMonths); // Multiply savingsAmount by installmentNumber
        }, 0);
  
        return {
          memberId: member._id,
          name: member.name,
          mobileNo: member.mobileNo,
          withdrawAmount: withdrawAmount.toString() // Ensure it's a string if your API expects that
        };
      })
    };
    console.log(data)
    axios.post('http://localhost:5000/api/withdraw/', data, {
      headers: {
        Authorization: `Bearer ${crptoken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        alert('Withdrawal Successful');
        handlesavinginvoice(data.totalSavingAmount,data.groupName,loanTermMonths,data.loanId)
        setShowSavingInvoice(true);
        // axios.put(`http://localhost:5000/api/collection/resetsavingamount/${selectedGroup}/${selectedLoan}`, {
        //   headers: {
        //     Authorization: `Bearer ${crptoken}`,
        //     'Content-Type': 'application/json',
        //   },
        // })
        //   .then((resetResponse) => {
        //     alert('Saving amount reset successfully');
        //   })
        //   .catch((error) => {
        //     alert('Error resetting saving amount:', error);
        //   });
      })
      .catch((error) => {
        if (error) {
          alert('Already withdrawn the saving amount');
        } else {
          alert(`Error withdrawing saving ${error}`);
        }
      });
  };
  





  // Helper function to truncate long IDs
  const truncateId = (id) => {
    return id.length > 8 ? id.substring(0, 8) + "..." : id;
  };

  const convertNumberToWords = (number) => {
    const [intPart, decimalPart] = number.toString().split(".");
    let words = toWords(parseInt(intPart));
    words = words.charAt(0).toUpperCase() + words.slice(1);
    words += decimalPart ? ` Rupees and ${toWords(parseInt(decimalPart))} Paise` : " Rupees Only";
    return words;
  };

  const handlesavinginvoice = (amount, group, interestMonth, loanid) => {
    const currentDate = new Date().toLocaleDateString();



    setSavingInvoiceData({
      date: currentDate,
      amount: amount || "N/A",
      amountInWords: amount ? convertNumberToWords(amount) : "N/A",
      groupName: group,
      termMonth: interestMonth || "N/A",
      loanId: loanid || "N/A"
    });

  };

  console.log(savingInvoiceData)
  const closeSavingInvoice = () => {
    setShowSavingInvoice(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center mt-20">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Withdraw Savings</h2>

        <div className="w-full flex gap-4 items-end">
          {/* Group Dropdown */}
          <div className="w-[50%]">
            <div className="mb-4 max-w-lg">
              <label htmlFor="group" className="block text-gray-600 mb-2">Select Group</label>
              <select
                id="group"
                onChange={handleGroupChange}
                value={selectedGroup}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Dropdown */}
            {selectedGroup && (
              <div className="mb-4 max-w-lg">
                <label htmlFor="loan" className="block text-gray-600 mb-2">Select Loan</label>
                <select
                  id="loan"
                  onChange={handleLoanChange}
                  value={selectedLoan}
                  className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Loan</option>
                  {loans.map((loan) => (
                    <option key={loan._id} value={loan._id}>
                      ID: {loan._id} - Total Amt: {loan.totalAmount}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Collection Dropdown */}
            {selectedLoan && (
              <div className="mb-4 max-w-lg">
                <label htmlFor="collection" className="block text-gray-600 mb-2">Select Collection</label>
                <select
                  id="collection"
                  onChange={handleCollectionChange}
                  value={selectedCollection}
                  className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Collection</option>
                  {collections.map((collection) => (
                    <option key={collection._id} value={collection._id}>
                      Collection ID: {collection._id} - Amount: {collection.totalSavingsCollected}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="w-[50%]">
            {/* Withdraw Button */}
            {selectedCollection && (
              <div className="mb-4 w-[100%]">
                <button
                  onClick={handleWithdraw}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
                >
                  Withdraw Savings
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Display Members of the Group */}
        {selectedCollection && groupMembers.length > 0 && (
          <div className="mb-4 w-full">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Group Members</h3>
            <div className="space-y-2">
              {groupMembers.map((memberObj) => {
                const { member } = memberObj;
                return (
                  <div key={member._id} className="flex items-center space-x-4 p-4 border-b border-gray-300">
                    <div className="w-[20%]">
                      <p className="font-semibold text-black">ID: {truncateId(member._id)}</p>
                    </div>
                    <div className="w-[20%]">
                      <p className="text-gray-600">Name: {member.name}</p>
                    </div>
                    {loanBankDetails && (
                      <div className="flex items-center justify-between w-[60%]">
                        <p className="text-gray-600">Bank: {loanBankDetails.name}</p>
                        <p className="text-gray-600">Branch: {loanBankDetails.branch}</p>
                        <p className="text-gray-600">IFSC: {loanBankDetails.ifsc}</p>
                        <p className="text-gray-600">Interest Rate: {loanBankDetails.interestRate}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
    </div>
  );
};

export default WithdrawSavings;
