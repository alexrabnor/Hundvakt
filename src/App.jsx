import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Intro from './pages/Intro';
import Registry from './pages/Registry';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route element={<Layout />}>
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/registry" element={<Registry />} />
        <Route path="/finance" element={<Finance />} />
      </Route>
    </Routes>
  );
}

export default App;
