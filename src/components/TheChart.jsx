import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import supabase from '../lib/supabase';
import './TheChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DiffChart = ({ user, refreshKey }) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const fetchChartData = async () => {
    try {
      const { data, error } = await supabase
        .from('dates')
        .select('start_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const dates = [];
        const differences = [];

        for (let i = 0; i < data.length - 1; i++) {
          const currentDate = new Date(data[i].start_date);
          const nextDate = new Date(data[i + 1].start_date);
          const diff = Math.abs(currentDate - nextDate) / (1000 * 60 * 60 * 24);
          
          dates.unshift(currentDate.toLocaleDateString('pt-BR'));
          differences.unshift(diff);
        }

        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Cycle duration',
              data: differences,
              borderColor: '#2196f3',
              tension: 0.1,
              pointStyle: 'circle',
            }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [user, refreshKey]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Cycle duration'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'days'
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <Line options={options} data={chartData} height={250} />
    </div>
  );
};

export default DiffChart;