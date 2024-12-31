import React, { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import AllDates from './components/AllDates';
import supabase from './lib/supabase';
import PrivacyPolicy from './components/PrivacyPolicy';
import Tos from './components/TOS';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="App">
        {!user ? (
          <AuthForm onLogin={setUser} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/all-dates" element={<AllDates user={user} />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<Tos />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;