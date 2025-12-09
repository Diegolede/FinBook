/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import StaticMenu from './components/StaticMenu';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import CreditCards from './pages/CreditCards';
import Savings from './pages/Savings';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Asegurar que siempre se muestre la home al iniciar
  useEffect(() => {
    const validRoutes = ['/', '/income', '/expenses', '/credit-cards', '/savings'];
    const currentPath = location.pathname || '/';
    
    // Si la ruta no es válida, está vacía, o es index.html, redirigir a home
    if (!validRoutes.includes(currentPath) || currentPath === '' || currentPath === '/index.html' || currentPath === 'index.html') {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Asegurar que al montar el componente siempre estemos en home
  useEffect(() => {
    // Forzar navegación a home al montar si no hay una ruta válida
    const currentPath = location.pathname || '/';
    const validRoutes = ['/', '/income', '/expenses', '/credit-cards', '/savings'];
    
    if (!validRoutes.includes(currentPath)) {
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div className="flex h-screen bg-white relative">
      <StaticMenu />
      <main className="flex-1 overflow-auto bg-white relative">
        <div className="w-full max-w-[90rem] mx-auto relative z-10 px-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/income" element={<Income />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/credit-cards" element={<CreditCards />} />
            <Route path="/savings" element={<Savings />} />
            {/* Redirección por defecto a home */}
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
        {/* Versión en la parte inferior derecha */}
        <div className="fixed bottom-4 right-4 z-10 text-right">
          <p className="text-sm text-gray-400 select-none font-medium">FinBook v1.0.8</p>
        </div>
      </main>
    </div>
  );
}

export default App; 