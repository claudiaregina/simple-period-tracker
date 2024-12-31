import React, { useState } from 'react';
import DatePicker from './DatePicker';
import LatestList from './LatestList';
import GenInfo from './GenInfo';
import Next from './Next';
import TheChart from './TheChart';
import TopNav from './TopNav';
import './Dashboard.css';
import supabase from '../lib/supabase';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshKey, setRefreshKey] = useState(0); // Initialize refreshKey state

  const handleSubmit = async (date) => {
    console.log('Dashboard - Starting handleSubmit with date:', date);
    try {
      const { error } = await supabase
        .from('dates')
        .insert([{
          user_id: user.id,
          start_date: date,
        }]);
      
      if (error) throw error;
      
      console.log('Dashboard - Insert successful, updating states');
      setShowDatePicker(false);
      setRefreshKey(prev => prev + 1); // Update refreshKey to trigger refresh
      
    } catch (error) {
      console.error('Dashboard - Error saving date:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('dates')
        .delete()
        .match({ id: id, user_id: user.id });

      if (error) throw error;
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (<>
    
    <TopNav user={user} onSignOut={handleSignOut} />

    <div className="dashboard">
      <div className="container-center">

        <Next user={user} refreshKey={refreshKey} />

        <button 
          className="add-date-button"
          onClick={() => setShowDatePicker(!showDatePicker)}
        >
          
        </button>

        {showDatePicker && (
          <DatePicker 
            onSubmit={handleSubmit}
            onClose={() => setShowDatePicker(false)}
            initialDate={selectedDate}
          />
        )}
      
      <LatestList user={user} refreshKey={refreshKey} onDelete={handleDelete} />
      <GenInfo user={user} refreshKey={refreshKey} />
      <TheChart user={user} refreshKey={refreshKey} />
      </div>
    </div>

    <footer>
      <Link to="/privacy-policy">privacy policy</Link> • <Link to="/terms-of-service">terms of service</Link> • <a href="https://github.com/claudiaregina/spt-app">github/claudiaregina</a>
    </footer>

    </>
  );
};

export default Dashboard;