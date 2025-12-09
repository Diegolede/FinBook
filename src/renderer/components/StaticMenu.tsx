/**
 * Copyright (c) 2026 FinBook
 * Owner: Diego Ledesma
 * 
 * This file is part of FinBook, a personal finance management application.
 * All rights reserved.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Notebook, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  LogOut,
} from 'lucide-react';
import finbookLogo from '../Finbook-logo.svg';

// --- Navigation Items ---
const navItems = [
  { path: '/', icon: Notebook, label: 'Inicio' },
  { path: '/income', icon: TrendingUp, label: 'Ingresos' },
  { path: '/expenses', icon: TrendingDown, label: 'Gastos' },
  { path: '/credit-cards', icon: CreditCard, label: 'Tarjetas' },
  { path: '/savings', icon: PiggyBank, label: 'Ahorros' },
];

// --- StaticMenu Component ---
const StaticMenu: React.FC = () => {
  return (
    <aside 
      className="h-screen bg-white border-r border-gray-200 shadow-md flex flex-col animate-slide-in-left transition-all duration-300 ease-in-out w-20"
    >
      {/* Header with Logo */}
      <div className="p-4 pb-3">
        <NavLink to="/" className="flex items-center justify-center select-none group">
          <img 
            src={finbookLogo} 
            alt="Finbook Logo" 
            className="block transition-all duration-300 w-12 h-12 rounded-xl group-hover:scale-110 group-active:scale-95" 
          />
        </NavLink>
      </div>

      {/* Separator */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-center gap-1">
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 pt-3 pb-2 px-4">
        <ul className="space-y-4">
          {navItems.map((item, index) => (
            <li
              key={item.path}
              className="relative animate-fade-in-up flex justify-center"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <NavLink
                to={item.path}
                end
                className={({ isActive }) => {
                  const baseClasses = "group relative flex items-center justify-center text-sm font-medium rounded-xl transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus:outline-none transform";
                  if (isActive) {
                    return `${baseClasses} w-12 h-12 bg-[#0f0f0f] text-white shadow-sm hover:scale-110 active:scale-95`;
                  }
                  return `${baseClasses} w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm hover:scale-110 active:scale-95`;
                }}
                title={item.label}
              >
                {({ isActive }) => (
                  <item.icon className={`transition-all duration-300 w-6 h-6 ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer area - Quit button */}
      <div className="mt-auto">
        {/* Separator */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </div>

        {/* Quit button */}
        <div className="p-4 pt-2">
          <button
            onClick={async () => {
              try {
                await window.electronAPI.quitApp();
              } catch (error) {
                console.error('Error al cerrar la aplicación:', error);
              }
            }}
            className="group relative flex items-center justify-center w-12 h-12 text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm rounded-xl transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] focus:outline-none transform hover:scale-110 active:scale-95"
            title="Salir de la aplicación"
          >
            <LogOut className="transition-all duration-300 w-6 h-6 text-gray-500 group-hover:text-gray-700" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StaticMenu; 