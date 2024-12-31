import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import supabase from '../lib/supabase';
import './Next.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Next = ({ user, refreshKey }) => {
  const [nextInfo, setNextInfo] = useState({
    nextDate: null,
    whenAway: '',
    averageDiff: 0
  });

  const fetchNextInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('dates')
        .select('start_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate average difference
        const differences = [];
        for (let i = 0; i < data.length - 1; i++) {
          const diff = Math.abs(
            new Date(data[i].start_date) - new Date(data[i + 1].start_date)
          ) / (1000 * 60 * 60 * 24);
          differences.push(diff);
        }

        const averageDiff = differences.length > 0
          ? differences.reduce((a, b) => a + b, 0) / differences.length
          : 0;

        // Calculate next date
        const lastDate = new Date(data[0].start_date);
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + Math.round(averageDiff));

        // Calculate when away
        const today = new Date();
        const diffDays = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));
        
        let whenAway = '';
        if (diffDays > 0) {
          whenAway = diffDays === 1 ? '1 day away' : `${diffDays} days away`;
        } else if (diffDays < 0) {
          whenAway = Math.abs(diffDays) === 1 ? '1 day late' : `${Math.abs(diffDays)} days late`;
        } else {
          whenAway = 'Today';
        }

        setNextInfo({
          nextDate,
          whenAway,
          averageDiff: Math.round(averageDiff)
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchNextInfo();
  }, [user, refreshKey]);

  const formatDate = (date) => {
    if (!date) return '-';
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + tzOffset);
    
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getChartData = () => {
    if (!nextInfo.nextDate) return null;

    // Extract numeric value and direction
    const whenAwayMatch = nextInfo.whenAway.match(/\d+/);
    const whenAwayNum = whenAwayMatch 
      ? parseInt(whenAwayMatch[0])
      : nextInfo.whenAway === 'Today' 
        ? 0 
        : 0;

    const isLate = nextInfo.whenAway.includes('late');
    const actualWhenAway = isLate ? -whenAwayNum : whenAwayNum;
    const remaining = Math.abs(nextInfo.averageDiff - Math.abs(whenAwayNum));
    
    const firstSegmentColor =   actualWhenAway < 0 ? '#f44336' : // red for late
                                actualWhenAway === 0 ? '#f44336' : // red for today 
                                '#141414'; // light grey otherwise
    const backgroundColor = actualWhenAway < 0 ? '#9c27b0' : // purple for late
                            actualWhenAway === 0 ? '#f44336' : // red for today
                            '#2196f3'; // blue otherwise
  
    return {
      data: {
        datasets: [{
          data: [Math.abs(whenAwayNum), remaining],
          backgroundColor: [firstSegmentColor, backgroundColor],
          borderWidth: 0,
          cutout: '70%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: { enabled: false }
        }
      },
      plugins: [{
        id: 'centerText',
        beforeDraw: (chart) => {
          const { ctx, width, height } = chart;
          ctx.restore();
          ctx.font = 'bold 1.2rem monospace';
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = backgroundColor;
          ctx.fillText(nextInfo.whenAway, width/2, height/2);
          ctx.save();
        }
      }]
    };
  };

  return (
    <div className="next-info">
      <h2>Next period: <span>{formatDate(nextInfo.nextDate)}</span></h2>

      <div className="next-chart-container">
        {getChartData() && (
          <Doughnut 
            data={getChartData().data}
            options={getChartData().options}
            plugins={getChartData().plugins}
          />
        )}
      </div>
    </div>
  );
};

export default Next;