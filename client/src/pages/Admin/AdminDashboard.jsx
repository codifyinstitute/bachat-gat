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
        const crptoken = localStorage.getItem('admin_token');
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
        const crptoken = localStorage.getItem('admin_token');
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
  /*** PIE CHART: Collection Status Breakdown ***/
  // Count collections in each category
  const collectionStatusCounts = {
    Pending: 0,
    Completed: 0,
    Partial: 0,
  };

  collection.forEach((item) => {
    if (item.status === 'pending') {
      collectionStatusCounts.Pending += 1;
    } else if (item.status === 'completed') {
      collectionStatusCounts.Completed += 1;
    } else if (item.status === 'partial') {
      collectionStatusCounts.Partial += 1;
    }
  });

  const updatedPieChartData = Object.entries(collectionStatusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const pieChartOption = {
    title: {
      text: 'Collection Status Breakdown',
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
        name: 'Collection Status',
        type: 'pie',
        radius: '50%',
        data: updatedPieChartData,
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
      <p className='text-3xl mx-2 my-5'>Admin Dashboard</p>
      {/* Loan Charts */}
      <div className='w-full flex flex-col xl:flex-row gap-y-4 xl:gap-x-4 my-4'>
        <div className="bar-chart w-full xl:w-1/2 p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={barChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>

        <div className="line-chart w-full xl:w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={lineChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>
      </div>

      {/* Collection Charts */}

      <div className='w-full flex flex-col xl:flex-row gap-y-4 xl:gap-x-4 my-4'>
        <div className="pie-chart w-full xl:w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400" >
          <ReactECharts
            option={pieChartOption}
            style={{ height: '400px', width: '100%' }}
          />
        </div>

        <div className="race-bar-chart w-full xl:w-1/2  p-2 bg-white rounded-md shadow-lg shadow-gray-400">
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
