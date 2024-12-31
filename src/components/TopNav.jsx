import React from 'react';
import supabase from '../lib/supabase';
import './TopNav.css';

const TopNav = ({ user, onSignOut }) => {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onSignOut(); // Clear user state
      window.location.reload(); // Refresh page
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="topnav">
      <p>Welcome, {user.user_metadata?.full_name || user.email}</p>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default TopNav;