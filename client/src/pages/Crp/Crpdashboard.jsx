// import React, { useEffect, useState } from "react";
// import ReactECharts from "echarts-for-react";
// import axios from 'axios'

// const AdminDashboard = () => {
//   // Sample data (replace with actual API data)
//   const totalUsers = 1000;
//   const totalAmount = 500000;
//   const totalLoan = 200000;
//   const totalSavings = 300000;
//   const totalInterest = 50000;
//   const totalCrpMembers = 0
//   const [approvedList, setapprovedList] = useState(20);
//   const [pendingList, setpendingList] = useState(50);
//   const [completedList, setcompletedList] = useState(10)

//   // Assuming the admin_token is stored in localStorage
//   const adminToken = localStorage.getItem("admin_token");
//   console.log("Admin Token:", adminToken);

//   useEffect(() => {
//     const fetchpiedetails = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/loan/count", ({
//           headers: {
//             Authorization: `Bearer ${adminToken}`, // Pass the token in the Authorization header
//           },
//         }))

//         if (!response.data) {
//           console.log('the response data is not fetched, error in backend')
//         }

//         console.log(response.data)

//         // setpendingList(response.data.pending) 
//         // setcompletedList(response.data.completed) 
//         // setapprovedList(response.data.approved) 
//       } catch (error) {
//         console.log(error)
//       }
//     }
//     fetchpiedetails()
//   }, [])

//   // Chart options for various types
//   const chartOptions = {
//     lineChart: {
//       title: { text: "Total Interest Over Time", left: "center" },
//       tooltip: { trigger: "axis" },
//       xAxis: {
//         type: "category",
//         data: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//       },
//       yAxis: {
//         type: "value",
//         axisLabel: { show: true, formatter: '{value}' },
//       },
//       series: [
//         {
//           name: "Interest",
//           type: "line",
//           data: [5000, 7000, 8000, 12000, 15000, totalInterest],
//           itemStyle: { color: "#FF5722" },
//           areaStyle: { color: "rgba(255, 87, 34, 0.2)" },
//         },
//       ],
//       grid: {
//         left: "20%", // Increased margin to the left
//         right: "5%",
//         bottom: "10%",
//         top: "20%", // Adjusted top for proper spacing
//       },
//       // },
//     },
//     barChart: {
//       title: { text: "Total Data Overview", left: "center" },
//       tooltip: { trigger: "axis" },
//       xAxis: {
//         type: "category",
//         data: [
//           "Users", "Amount", "Loan", "Savings",
//           "Interest", "CRP Members", "Pending Approvals"
//         ],
//       },
//       yAxis: {
//         type: "value",
//         axisLabel: { show: true, formatter: '{value}' },
//       },
//       series: [
//         {
//           name: "Amount",
//           type: "bar",
//           data: [
//             totalUsers, totalAmount, totalLoan, totalSavings,
//             totalInterest, totalCrpMembers, pendingList
//           ],
//           itemStyle: { color: "#2196F3" },
//         },
//       ],
//       grid: { left: "15%", right: "5%", bottom: "10%", top: "20%" }, // Add margins for axis labels
//     },
//     pieChart: {
//       title: { text: "List", left: "center" },
//       tooltip: { trigger: "item" },
//       series: [
//         {
//           name: "Status",
//           type: "pie",
//           radius: "50%",
//           data: [
//             { value: completedList, name: "Completed Loan", itemStyle: { color: "#65de4d" } },
//             { value: pendingList, name: "Pending Loan", itemStyle: { color: "#de3939" } },
//             { value: approvedList, name: "Approved Loan", itemStyle: { color: "#f6ff00" } },
//           ],
//           emphasis: {
//             itemStyle: {
//               shadowBlur: 10,
//               shadowOffsetX: 0,
//               shadowColor: "rgba(0, 0, 0, 0.5)",
//             },
//           },
//         },
//       ],
//     },

//     barRaceChart: {
//       title: { text: "Loan, Savings, Interest Race", left: "center" },
//       tooltip: { trigger: "axis" },
//       animationDuration: 2000,
//       yAxis: {
//         type: "category",
//         data: ["Loan", "Savings", "Interest"],
//         axisLabel: { show: true, formatter: '{value}' },
//       },
//       xAxis: { type: "value" },
//       series: [
//         {
//           name: "Amount",
//           type: "bar",
//           data: [
//             { value: totalLoan, name: "Loan" },
//             { value: totalSavings, name: "Savings" },
//             { value: totalInterest, name: "Interest" },
//           ],
//           itemStyle: { color: "#FF9800" },
//           animationEasing: "elasticOut",
//         },
//       ],
//       grid: { left: "20%", right: "5%", bottom: "10%", top: "20%" }, // Adjust grid for spacing
//     },
//   };

//   return (
//     <div className="p-4 space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

//       {/* Grid Layout for Charts */}
//       <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-8">
//         {/* Line Chart */}
//         <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
//           <ReactECharts option={chartOptions.lineChart} style={{ height: "300px" }} />
//           <p className="mt-4 text-center text-gray-800">Total Interest: {totalInterest}</p>
//         </div>

//         {/* Bar Chart */}
//         <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
//           <ReactECharts option={chartOptions.barChart} style={{ height: "300px" }} />
//           <p className="mt-4 text-center text-gray-800">
//             Users: {totalUsers}, Amount: {totalAmount}, Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}, CRP Members: {totalCrpMembers}, Pending: {pendingList}
//           </p>
//         </div>

//         {/* Pie Chart */}
//         <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
//           <ReactECharts option={chartOptions.pieChart} style={{ height: "300px" }} />
//           <p className="mt-4 text-center text-gray-800">CRP Members: {totalCrpMembers}, Pending Approvals: {pendingList}</p>
//         </div>

//         {/* Bar Race Chart */}
//         <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
//           <ReactECharts option={chartOptions.barRaceChart} style={{ height: "300px" }} />
//           <p className="mt-4 text-center text-gray-800">
//             Loan: {totalLoan}, Savings: {totalSavings}, Interest: {totalInterest}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

const LoanCharts = () => {
  const [data, setData] = useState([]); // loan data
  const [collection, setCollection] = useState([]); // collection data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch both loans and collection data on mount.
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const crptoken = localStorage.getItem('crp_token');
        if (!crptoken) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/loan/', {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            'Content-Type': 'application/json',
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching loans:', err.response ? err.response.data : err.message);
        setError('Error fetching loans');
        setLoading(false);
      }
    };

    const fetchCollectionData = async () => {
      try {
        const crptoken = localStorage.getItem('crp_token');
        if (!crptoken) {
          setError('No authentication token found. Please log in.');
          setLoading(false);
          return;
        }
        const response = await axios.get('http://localhost:5000/api/collection/', {
          headers: {
            Authorization: `Bearer ${crptoken}`,
            'Content-Type': 'application/json',
          },
        });
        setCollection(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching collection:', err.response ? err.response.data : err.message);
        setError('Error fetching collection');
        setLoading(false);
      }
    };

    fetchLoans();
    fetchCollectionData();
  }, []);

  // ================================
  // LOAN DATA CHARTS
  // ================================

  /*** BAR CHART: Comparing Different Loan Data ***/
  // For each loan, extract the group name, total loan amount, and total paid (from repayment schedules)
  const barChartData = data.map((loan) => {
    const paidTotal = loan.repaymentSchedules.reduce(
      (sum, schedule) => sum + schedule.paidAmount,
      0
    );
    return {
      group: loan.groupId.name,
      totalAmount: loan.totalAmount,
      paidAmount: paidTotal,
    };
  });

  const loanGroups = barChartData.map((item) => item.group);
  const totalAmounts = barChartData.map((item) => item.totalAmount);
  const paidAmounts = barChartData.map((item) => item.paidAmount);

  const barChartOption = {
    title: {
      text: 'Comparison of Loan Data by Group',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['Total Loan Amount', 'Paid Amount'],
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: loanGroups,
      axisLabel: { interval: 0 },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: 'Total Loan Amount',
        type: 'bar',
        data: totalAmounts,
        itemStyle: { color: '#73C9E6' },
      },
      {
        name: 'Paid Amount',
        type: 'bar',
        data: paidAmounts,
        itemStyle: { color: '#E6A973' },
      },
    ],
  };

  /*** LINE CHART: Cumulative Payment Progress per Loan ***/
  // For each loan, extract paid installments with their dates and amounts,
  // then compute a cumulative sum to see payment progress over time.
  const loanSeriesData = data.map((loan) => {
    let installments = [];
    loan.repaymentSchedules.forEach((schedule) => {
      schedule.installments.forEach((inst) => {
        if (inst.status === 'paid' && inst.paidDate) {
          installments.push({
            date: inst.paidDate,
            amount: inst.paidAmount,
          });
        }
      });
    });
    // Sort installments by date
    installments.sort((a, b) => new Date(a.date) - new Date(b.date));
    let cumulative = 0;
    const seriesPoints = installments.map((inst) => {
      cumulative += inst.amount;
      return { date: inst.date, cumulative };
    });
    return {
      group: loan.groupId.name,
      seriesPoints,
    };
  });

  // Build a union of all paid dates to form a common x‑axis.
  const dateSet = new Set();
  loanSeriesData.forEach((loan) => {
    loan.seriesPoints.forEach((point) => {
      const dateStr = new Date(point.date).toLocaleString();
      dateSet.add(dateStr);
    });
  });
  const allDates = Array.from(dateSet).sort((a, b) => new Date(a) - new Date(b));

  // Align each loan’s cumulative data with the common dates.
  const alignedLoanSeries = loanSeriesData.map((loan) => {
    let alignedData = [];
    let lastCumulative = 0;
    const dateToCumulative = {};
    loan.seriesPoints.forEach((point) => {
      const dateStr = new Date(point.date).toLocaleString();
      dateToCumulative[dateStr] = point.cumulative;
    });
    allDates.forEach((dateStr) => {
      if (dateToCumulative.hasOwnProperty(dateStr)) {
        lastCumulative = dateToCumulative[dateStr];
      }
      alignedData.push(lastCumulative);
    });
    return {
      name: loan.group,
      data: alignedData,
    };
  });

  const lineSeriesOption = alignedLoanSeries.map((loan) => ({
    name: loan.name,
    type: 'line',
    data: loan.data,
    smooth: true,
  }));

  const lineChartOption = {
    title: {
      text: 'Cumulative Payment Progress by Loan',
      left: 'center',
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: alignedLoanSeries.map((loan) => loan.name),
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: allDates,
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: {
      type: 'value',
    },
    series: lineSeriesOption,
  };

  // ================================
  // COLLECTION DATA CHARTS
  // ================================

  /*** PIE CHART: Distribution of Total EMI Collected ***/
  // Aggregate totalEmiCollected by group from the collection data.
  const pieAggregation = {};
  collection.forEach((item) => {
    const groupName = item.groupId.name;
    if (!pieAggregation[groupName]) {
      pieAggregation[groupName] = 0;
    }
    pieAggregation[groupName] += item.totalEmiCollected;
  });
  const pieChartData = Object.entries(pieAggregation).map(([name, value]) => ({
    name,
    value,
  }));

  const pieChartOption = {
    title: {
      text: 'Distribution of Total EMI Collected by Group',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Total EMI Collected',
        type: 'pie',
        radius: '50%',
        data: pieChartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  /*** RACE BAR CHART: Cumulative Collection Totals Over Time ***/
  // We use the collectionDate from each record to build an animated (timeline) bar chart.
  // First, sort the collection data by date.
  const sortedCollections = [...collection].sort(
    (a, b) => new Date(a.collectionDate) - new Date(b.collectionDate)
  );
  // Extract unique dates (formatted as YYYY-MM-DD)
  const uniqueDates = [];
  sortedCollections.forEach((item) => {
    const dateStr = new Date(item.collectionDate).toISOString().split('T')[0];
    if (!uniqueDates.includes(dateStr)) {
      uniqueDates.push(dateStr);
    }
  });

  // Build timeline options. We compute cumulative totals for each group up to each unique date.
  const cumulativeTotals = {}; // group -> cumulative total
  const timelineOptions = uniqueDates.map((dateStr) => {
    // For each collection record on this date, update cumulative totals.
    sortedCollections.forEach((item) => {
      const itemDateStr = new Date(item.collectionDate).toISOString().split('T')[0];
      if (itemDateStr === dateStr) {
        const groupName = item.groupId.name;
        if (!cumulativeTotals[groupName]) {
          cumulativeTotals[groupName] = 0;
        }
        cumulativeTotals[groupName] += item.totalEmiCollected;
      }
    });
    // Prepare a snapshot for this timeline step.
    const snapshot = Object.entries(cumulativeTotals).map(([name, value]) => ({
      name,
      value,
    }));
    // Sort descending by value (so the top bar appears first).
    snapshot.sort((a, b) => b.value - a.value);
    return {
      title: { text: `Total EMI Collected as of ${dateStr}` },
      yAxis: {
        type: 'category',
        inverse: true,
        data: snapshot.map((item) => item.name),
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          type: 'bar',
          data: snapshot.map((item) => item.value),
          label: {
            show: true,
            position: 'right',
          },
          itemStyle: { color: '#73C9E6' },
          animationDuration: 300,
          animationDurationUpdate: 300,
        },
      ],
    };
  });

  const raceBarChartOption = {
    baseOption: {
      timeline: {
        axisType: 'category',
        autoPlay: true,
        playInterval: 2000,
        data: uniqueDates,
        tooltip: {
          formatter: (s) => s,
        },
      },
      title: {
        text: 'Race Bar Chart: Cumulative Total EMI Collected by Group',
        subtext: 'Animated over time',
        left: 'center',
      },
      tooltip: {},
      grid: { top: 80, bottom: 50, left: 150 },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: 'category',
        data: [],
      },
      series: [
        {
          type: 'bar',
          data: [],
        },
      ],
    },
    options: timelineOptions,
  };

  if (loading) return <div>Loading charts...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='py-5 px-2'>
      <p className='text-3xl mx-2 my-5'>CRP Dashboard</p>
      {/* Loan Charts */}
      <div className='w-full flex gap-x-4 my-4'>
        <div className="bar-chart w-1/2 p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={barChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>

        <div className="line-chart w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={lineChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>
      </div>

      {/* Collection Charts */}

      <div className='w-full flex gap-x-4 my-4'>
        <div className="pie-chart w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={pieChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>

        <div className="race-bar-chart w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400">
          <ReactECharts
            option={raceBarChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoanCharts;
