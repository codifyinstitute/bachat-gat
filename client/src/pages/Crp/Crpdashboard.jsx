import React from "react";
import ReactECharts from "echarts-for-react";

const Crpdashboard = () => {
  // Sample data (replace with actual API data)
  const totalUsers = 1000;
  const totalAmount = 500000;
  const totalLoan = 200000;
  const totalSavings = 300000;
  const totalInterest = 50000;
  const totalCrpMembers = 50;
  const approvedList = 10
  const completedList = 10
  const pendingList = 10;

  // Chart options for various types
  const chartOptions = {
    lineChart: {
      title: { text: "Total Interest Over Time", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      },
      yAxis: {
        type: "value",
        axisLabel: { show: true, formatter: '{value}' },
      },
      series: [
        {
          name: "Interest",
          type: "line",
          data: [5000, 7000, 8000, 12000, 15000, totalInterest],
          itemStyle: { color: "#FF5722" },
          areaStyle: { color: "rgba(255, 87, 34, 0.2)" },
        },
      ],
      grid: {
        left: "20%", // Increased margin to the left
        right: "5%",
        bottom: "10%",
        top: "20%", // Adjusted top for proper spacing
      },
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
      title: { text: "CRP vs Pending Approvals", left: "center" },
      tooltip: { trigger: "item" },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: "50%",
          data: [
            { value: approvedList, name: "Approved List" },
            { value: pendingList, name: "Pending List" },
            { value: completedList, name: "Completed list" },
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
          <ReactECharts option={chartOptions.lineChart} style={{ height: "300px" }} />
          <p className="mt-4 text-center text-gray-800">Total Interest: {totalInterest}</p>
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
          <p className="mt-4 text-center text-gray-800">CRP Members: {totalCrpMembers}, Pending Approvals: {pendingList}</p>
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
