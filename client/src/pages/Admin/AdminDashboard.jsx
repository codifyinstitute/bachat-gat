import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Retrieve the token from local storage
        const adminToken = localStorage.getItem("admin_token");

        // If token is not found, handle the error (optional: redirect to login)
        if (!adminToken) {
          console.error("Admin token not found in local storage");
          return;
        }

        // Fetch the data from the API using the token in the Authorization header
        const response = await fetch("http://localhost:5000/api/dashboard", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${adminToken}`, // Add token to the request header
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch dashboard data");

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  // Check if data exists
  const totalUsers = dashboardData?.totalUsers || 0;
  const totalAmount = dashboardData?.totalAmount || 0;
  const totalLoan = dashboardData?.totalLoan || 0;
  const totalSavings = dashboardData?.totalSavings || 0;
  const totalInterest = dashboardData?.totalInterest || 0;
  const totalCrpMembers = dashboardData?.totalCrpMembers || 0;
  const pendingList = dashboardData?.pendingList || 0;

  const chartOptions = {
    lineChart: totalInterest > 0 ? {
      title: { text: "Total Interest Over Time", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
      yAxis: { type: "value", axisLabel: { show: true, formatter: '{value}' } },
      series: [
        {
          name: "Interest",
          type: "line",
          data: [5000, 7000, 8000, 12000, 15000, totalInterest],
          itemStyle: { color: "#FF5722" },
          areaStyle: { color: "rgba(255, 87, 34, 0.2)" },
        },
      ],
      grid: { left: "20%", right: "5%", bottom: "10%", top: "20%" },
    } : null,
    
    barChart: totalAmount > 0 || totalLoan > 0 || totalSavings > 0 ? {
      title: { text: "Total Data Overview", left: "center" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: ["Users", "Amount", "Loan", "Savings", "Interest", "CRP Members", "Pending Approvals"],
      },
      yAxis: { type: "value", axisLabel: { show: true, formatter: '{value}' } },
      series: [
        {
          name: "Amount",
          type: "bar",
          data: [
            totalUsers, totalAmount, totalLoan, totalSavings, totalInterest, totalCrpMembers, pendingList,
          ],
          itemStyle: { color: "#2196F3" },
        },
      ],
      grid: { left: "15%", right: "5%", bottom: "10%", top: "20%" },
    } : null,

    pieChart: totalCrpMembers > 0 || pendingList > 0 ? {
      title: { text: "CRP vs Pending Approvals", left: "center" },
      tooltip: { trigger: "item" },
      series: [
        {
          name: "Status",
          type: "pie",
          radius: "50%",
          data: [
            { value: totalCrpMembers, name: "CRP Members" },
            { value: pendingList, name: "Pending Approvals" },
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
    } : null,

    barRaceChart: totalLoan > 0 || totalSavings > 0 || totalInterest > 0 ? {
      title: { text: "Loan, Savings, Interest Race", left: "center" },
      tooltip: { trigger: "axis" },
      animationDuration: 2000,
      yAxis: { type: "category", data: ["Loan", "Savings", "Interest"], axisLabel: { show: true, formatter: '{value}' } },
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
      grid: { left: "20%", right: "5%", bottom: "10%", top: "20%" },
    } : null,
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {/* Grid Layout for Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        {chartOptions.lineChart && (
          <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
            <ReactECharts option={chartOptions.lineChart} style={{ height: "300px" }} />
            <p className="mt-4 text-center text-gray-800">Total Interest: {totalInterest}</p>
          </div>
        )}

        {/* Bar Chart */}
        {chartOptions.barChart && (
          <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
            <ReactECharts option={chartOptions.barChart} style={{ height: "300px" }} />
            <p className="mt-4 text-center text-gray-800">
              Users: {totalUsers}, Amount: {totalAmount}, Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}, CRP Members: {totalCrpMembers}, Pending: {pendingList}
            </p>
          </div>
        )}

        {/* Pie Chart */}
        {chartOptions.pieChart && (
          <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
            <ReactECharts option={chartOptions.pieChart} style={{ height: "300px" }} />
            <p className="mt-4 text-center text-gray-800">CRP Members: {totalCrpMembers}, Pending Approvals: {pendingList}</p>
          </div>
        )}

        {/* Bar Race Chart */}
        {chartOptions.barRaceChart && (
          <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
            <ReactECharts option={chartOptions.barRaceChart} style={{ height: "300px" }} />
            <p className="mt-4 text-center text-gray-800">
              Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
