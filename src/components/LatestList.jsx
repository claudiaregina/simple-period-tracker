import React, { useEffect, useState } from 'react';
import './LatestList.css';
import supabase from '../lib/supabase';
import { Link } from 'react-router-dom';

const LatestList = ({ user, refreshKey }) => {
  const [dates, setDates] = useState([]);

  useEffect(() => {
    fetchDates();
  }, [user, refreshKey]); // Refresh when key changes

  const fetchDates = async () => {
    console.log('LatestList - Fetching dates');
    const { data, error } = await supabase
      .from('dates')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching dates:', error);
      return;
    }

    const processedDates = data.map((date, index) => ({
      ...date,
      difference: index < data.length - 1 
        ? calculateDaysDifference(new Date(data[index].start_date), new Date(data[index + 1].start_date))
        : null
    }));
    setDates(processedDates);
  };

  const calculateDaysDifference = (date1, date2) => {
    const diffTime = Math.abs(date1 - date2);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleDelete = async (id) => {
    console.log('LatestList - Attempting to delete date:', id);
    try {
      const { error } = await supabase
        .from('dates')
        .delete()
        .match({ id: id, user_id: user.id });
  
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      console.log('Date deleted successfully');
      fetchDates(); // Refresh list
      
    } catch (error) {
      console.error('Delete failed:', error.message);
    }
  };

  const formatDate = (dateString) => {
  // Create date with timezone offset correction
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localDate = new Date(date.getTime() + tzOffset);
  
  // Format to dd/mm/yyyy
  return localDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

  return (
    <div className="latest-list">
      <table>
        <thead>
          <tr>
            <th>Dates</th>
            <th>Cycles</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dates.map((date) => (
            <tr key={date.id}>
              <td>{formatDate(date.start_date)}</td>
              <td>{date.difference || '-'}</td>
              <td>
                <button 
                  onClick={() => handleDelete(date.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/all-dates" className="page-nav-link">See all dates →</Link>
    </div>
  );
};

export default LatestList;