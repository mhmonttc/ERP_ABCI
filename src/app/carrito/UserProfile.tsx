'use client';

import React from 'react';
import { useAuth } from './AuthContext';

const UserProfile = () => {
  const { user, logout, openModal } = useAuth();

  if (!user) {
    return (
      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-4 text-center">
        <button onClick={openModal} className="text-blue-600 font-semibold hover:underline">
          Inicia Sesión o Regístrate aquí
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-bold">{user.nombre} {user.apellido}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <button onClick={logout} className="text-red-500 hover:text-red-700">
          <svg xmlns="http:
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
