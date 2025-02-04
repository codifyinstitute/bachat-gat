import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import axios from 'axios'

const Crpdashboard = () => {

  const [fetchcrpdata,setfetchcrpdata]=useState([])
  // Sample data (replace with actual API data)
  const totalUsers = 1000;
  const [totalAmount,settotalAmount] = useState(0);
  const totalLoan = 200000;
  const totalSavings = 300000;
  const [totalInterest,settotalinterest] = useState(0);
  const totalCrpMembers = 50;
  const [approvedList, setapprovedList] = useState(0);
  const [pendingList, setpendingList] = useState(20);
  const [completedList, setcompletedList] = useState(50)

  const [interestData, setInterestData] = useState([]);
  const [maxInterest, setMaxInterest] = useState(0);

  const [members, setMembers] = useState([]); // State to store fetched members

  // Assuming the admin_token is stored in localStorage
  const adminToken = localStorage.getItem("crp_token");
  console.log(adminToken);

  useEffect(() => {
    // Fetch members data from backend API
    const fetchMembers = async () => {
      try {
        // Add Authorization header with Bearer token
        const response = await axios.get("http://localhost:5000/api/crp/membycrp", {
          headers: {
            Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
          },
        });

        console.log("API Response:", response.data); // Log the full response

        // Handle different response formats
        if (Array.isArray(response.data)) {
          setMembers(response.data); // Array of members
        } else if (response.data.members && Array.isArray(response.data.members)) {
          setMembers(response.data.members); // Nested 'members' array
        } else {
          setError("The response data is not in the expected format.");
        }
      } catch (err) {
        setError("Failed to fetch members data.");
        console.error(err);
      }
    };

    fetchMembers();
  }, [adminToken]); // Ensure the token is passed into useEffect (can also use session storage, cookies, etc.)

  console.log(members)
  useEffect(() => {
    const fetchpiedetails = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/loan/", {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        });

        if (!response.data) {
          console.log("The response data is not fetched, error in backend");
          return;
        }

        setfetchcrpdata(response.data);
        console.log("Fetched Data:", fetchcrpdata);
        calculateInterest(response.data);

        chartcounting(response.data);
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    };

    fetchpiedetails();
  }, []);

  const calculateInterest = (data) => {
    let interestValues = data.map(loan => ({
      name: `Loan ${loan.groupId.name}`,
      interest: (loan.totalAmount * loan.interestRate * loan.termMonths) / (12 * 100),
    }));

    const maxInt = Math.max(...interestValues.map(item => item.interest));

    setInterestData(interestValues);
    setMaxInterest(maxInt);
  };

  const chartcounting = (fetchcrpdata) => {
    let approved = 0, pending = 0, completed = 0;
    let totalAmt = 0;
  
    fetchcrpdata.forEach((loan) => {
      if (loan.status === "approved") {
        approved++;
      } else if (loan.status === "pending") {
        pending++;
      } else {
        completed++;
      }
  
      // Add loan total amount
      totalAmt += parseInt(loan.totalAmount);
  
    });
  
    setapprovedList(approved);
    setpendingList(pending);
    setcompletedList(completed);
    settotalAmount(totalAmt);
    settotalinterest(totalInt);
  };
  

  console.log(totalAmount)

  // Chart options for various types
  const chartOptions = {
    lineChart: {
      title: { text: "Interest Comparison Across Loans", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: interestData.map(item => item.name), // X-axis as loan names
    },
    yAxis: {
      type: "value",
      min: 0,
      max: maxInterest + (maxInterest * 0.1), // Add 10% padding to max value
      axisLabel: { show: true, formatter: '{value}' },
    },
    series: [
      {
        name: "Interest",
        type: "line",
        data: interestData.map(item => item.interest), // Y-axis as calculated interests
        itemStyle: { color: "#FF5722" },
        areaStyle: { color: "rgba(255, 87, 34, 0.2)" },
      },
    ],
    grid: { left: "20%", right: "5%", bottom: "10%", top: "20%" },
      // },
    },
    barChart: {
      title: { text: "Total Data Overview", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: [
          "Users", "Amount", "Loan", "Savings", 
          "Interest", "CRP Members", "Pending Approvals"
        ],
      },
      yAxis: {
        type: "value",
        axisLabel: { show: true, formatter: '{value}' },
      },
      series: [
        {
          name: "Amount",
          type: "bar",
          data: [
            totalUsers, totalAmount, totalLoan, totalSavings, 
            totalInterest, totalCrpMembers, pendingList
          ],
          itemStyle: { color: "#2196F3" },
        },
      ],
      grid: { left: "15%", right: "5%", bottom: "10%", top: "20%" }, // Add margins for axis labels
    },
    pieChart: {
      title: { text: "List", left: "center" },
      tooltip: { trigger: "item" },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: "70%",
          data: [
            { value: completedList, name: "Completed Loan", itemStyle: { color: "#d4df33bd" } },
            { value: pendingList, name: "Pending Loan", itemStyle: { color: "#a87ae8" } },
            { value: approvedList, name: "Approved Loan", itemStyle: { color: "#cf2224" } },
          ],
          emphasis: {
            itemStyle: {  
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    },
    barRaceChart: {
      title: { text: "Loan, Savings, Interest Race", left: "center" },
      tooltip: { trigger: "axis" },
      animationDuration: 2000,
      yAxis: {
        type: "category",
        data: ["Loan", "Savings", "Interest"],
        axisLabel: { show: true, formatter: '{value}' },
      },
      xAxis: { type: "value" },
      series: [
        {
          name: "Amount",
          type: "bar",
          data: [
            { value: totalLoan, name: "Loan" },
            { value: totalSavings, name: "Savings" },
            { value: totalInterest, name: "Interest" },
          ],
          itemStyle: { color: "#FF9800" },
          animationEasing: "elasticOut",
        },
      ],
      grid: { left: "20%", right: "5%", bottom: "10%", top: "20%" }, // Adjust grid for spacing
    },
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">CRP Dashboard</h1>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          <ReactECharts option={chartOptions.lineChart} style={{ height: "300px" }} />
          <p className="mt-4 text-center text-gray-800">Total Interest: {maxInterest}</p>
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          <ReactECharts option={chartOptions.barChart} style={{ height: "300px" }} />
          <p className="mt-4 text-center text-gray-800">
            Users: {totalUsers}, Amount: {totalAmount}, Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}, CRP Members: {totalCrpMembers}, Pending: {pendingList}
          </p>
        </div>

        {/* Pie Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          <ReactECharts option={chartOptions.pieChart} style={{ height: "300px" }} />
          <p className="mt-4 text-center text-gray-800">Approved: {approvedList},Completed: {completedList}, Pending : {pendingList}</p>
        </div>

        {/* Bar Race Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          <ReactECharts option={chartOptions.barRaceChart} style={{ height: "300px" }} />
          <p className="mt-4 text-center text-gray-800">
            Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Crpdashboard;
