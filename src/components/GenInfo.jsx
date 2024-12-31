import React, { useState, useEffect } from 'react';
import './GenInfo.css';
import supabase from '../lib/supabase';

const GenInfo = ({ user, refreshKey }) => {
  const [stats, setStats] = useState({
    lastDate: null,
    averageDiff: 0,
    standardDev: 0,
    currentDays: 0
  });

  const fetchStats = async () => {
    try {
    // Get last 10 dates ordered by start_date
    const { data, error } = await supabase
        .from('dates')
        .select('start_date')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        // Calculate differences between consecutive dates
        const differences = [];
        for (let i = 0; i < data.length - 1; i++) {
          const diff = Math.abs(
            new Date(data[i].start_date) - new Date(data[i + 1].start_date)
          ) / (1000 * 60 * 60 * 24);
          differences.push(diff);
        }

        // Calculate average
        const average = differences.length > 0
          ? differences.reduce((a, b) => a + b, 0) / differences.length
          : 0;

        // Calculate standard deviation
        const variance = differences.length > 0
          ? differences.reduce((a, b) => a + Math.pow(b - average, 2), 0) / differences.length
          : 0;

        // Calculate current days
        const today = new Date();
        const lastDate = new Date(data[0].start_date);
        const currentDays = Math.ceil(
          Math.abs(today - lastDate) / (1000 * 60 * 60 * 24)
        );

        setStats({
          lastDate: data[0].start_date,
          averageDiff: average.toFixed(1),
          standardDev: Math.sqrt(variance).toFixed(1),
          currentDays: currentDays
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, refreshKey]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() + tzOffset);
    
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  const getDaySuffix = (day) => {
    if (day % 100 >= 11 && day % 100 <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return (
    <div className="gen-info">

      <div className="gen-info-prose">
        <p>Your <em>last period</em> started on <strong>{stats.lastDate ? formatDate(stats.lastDate) : '-'}</strong>. You are currently on the <strong>{stats.currentDays}<sup>{getDaySuffix(stats.currentDays)}</sup> day</strong> of your cycle. Your <em>average cycle duration</em> is <strong>{stats.averageDiff} days</strong>, with a <em>standard deviation</em> of <strong>{stats.standardDev} days</strong>.</p>
      </div>

    </div>
  );
};

export default GenInfo;