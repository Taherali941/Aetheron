import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat/Chat'; 

const AppRoutes = () => {
  return (
    /* Add basename so the router knows to ignore the /Aetheron/ part of the URL */
    <Router basename="/Aetheron">
      <Routes>
        <Route path="/" element={<div>Home Page (Default)</div>} /> 
        
        {/* This will now correctly match /Aetheron/chat */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;