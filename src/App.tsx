import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import FlowPage from './pages/FlowPage';
import Dashboard from './pages/Dashboard';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const { user } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      useStore.getState().setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useStore.getState().setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard /> : <Navigate to="/" replace />} 
        />
        <Route path="/flow/:id" element={<FlowPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
