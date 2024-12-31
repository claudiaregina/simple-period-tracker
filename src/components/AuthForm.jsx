import { createClient } from '@supabase/supabase-js'
import React, { useState } from 'react'
import './AuthForm.css'
import { Link } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const redirectUrl = process.env.REACT_APP_REDIRECT_URL || 'http://localhost:3000'
const supabase = createClient(supabaseUrl, supabaseKey)

const AuthForm = () => {
  const [, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user] = useState(null)

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (user) {
    return (
      <div className="auth-form">
        <p>Welcome, {user.user_metadata?.full_name || user.email}</p>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <>
    <div className="auth-form">
      <h1>simple period tracker</h1>
      <p>it just tracks your cycles and predicts when blood will come out of your vagina again.</p>
      {error && <p className="error">{error}</p>}
      
      <button onClick={handleGoogleSignIn}>
        Sign in with Google
      </button>

    </div>

<footer>
    <Link to="/privacy-policy">privacy policy</Link> • <Link to="/terms-of-service">terms of service</Link> • <a href="https://github.com/claudiaregina/spt-app">github/claudiaregina</a>
    </footer>
    </>
  );
};

export default AuthForm;