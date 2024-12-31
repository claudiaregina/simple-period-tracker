import React, { useState, useEffect } from 'react';
import './AllDates.css';
import TopNav from './TopNav';
import ImportFromCSV from './ImportFromCSV';
import supabase from '../lib/supabase';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';

const AllDates = ({ user }) => {
  const [dates, setDates] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const itemsPerPage = 20;

  const fetchAllDates = async () => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('dates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        return [];
      }

      setTotalPages(Math.ceil(data.length / itemsPerPage));
      return data;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching all dates:', error);
      return [];
    }
  };

  const calculateDifferences = (allDates) => {
    return allDates.map((date, index) => ({
      ...date,
      difference: index < allDates.length - 1 
        ? calculateDaysDifference(new Date(allDates[index].start_date), new Date(allDates[index + 1].start_date))
        : null
    }));
  };

  const fetchDates = async () => {
    try {
      const allDates = await fetchAllDates();
      const processedDates = calculateDifferences(allDates);

      const paginatedDates = processedDates.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

      setDates(paginatedDates);
      setHasMore(paginatedDates.length === itemsPerPage);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching dates:', error);
    }
  };

  useEffect(() => {
    fetchDates();
  }, [user, currentPage]);

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

const handleSignOut = async () => {
  await supabase.auth.signOut();
};

// Export to CSV
const exportToCSV = async () => {
  try {
    const { data, error } = await supabase
      .from('dates')
      .select('id, start_date')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching dates for CSV:', error);
      return;
    }

    const csvData = data.map(row => `${row.id},${row.start_date}`).join('\n');
    const csvBlob = new Blob([`id,start_date\n${csvData}`], { type: 'text/csv;charset=utf-8;' });
    saveAs(csvBlob, 'all-dates.csv');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
};

  return (<>
    <TopNav user={user} onSignOut={handleSignOut} />
    <div className="all-dates">

    <Link to="/" className="page-nav-link">Back to Dashboard ↩</Link>

      {error && <p className="error-message">{error}</p>}
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
      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 0}
        >
          ← Previous
        </button>
        <span>Page {currentPage + 1} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={!hasMore}
        >
          Next →
        </button>
      </div>

      <div id="import-export"> 
        
        <div className='export-csv'>
          <h2>Export</h2>
          <p>Backup your data to a CSV file</p>
          <button onClick={exportToCSV}>Export to CSV</button>
        </div>

        <ImportFromCSV 
        user={user} 
        onImportComplete={fetchDates}
        />
        </div>
      
    </div>

    <footer>
    <Link to="/privacy-policy">privacy policy</Link> • <Link to="/terms-of-service">terms of service</Link> • <a href="https://github.com/claudiaregina/spt-app">github/claudiaregina</a>
    </footer>
    </>
  );
};

export default AllDates;