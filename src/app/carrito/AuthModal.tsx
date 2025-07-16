'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthModal = () => {
  const { isModalOpen, closeModal, login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLoginView ? '/api/clientes/login' : '/api/clientes/register';
    const body = isLoginView
      ? JSON.stringify({ email: formData.email, password: formData.password })
      : JSON.stringify(formData);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Ocurrió un error.');
        return;
      }

      login(data);
      closeModal();
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={closeModal}>
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4">{isLoginView ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLoginView && (
            <>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre y Apellido"
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
                required
              />
               <input
                type="text"
                name="telefono"
                placeholder="Teléfono"
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            onChange={handleChange}
            className="w-full p-2 mb-4 border rounded"
            required
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isLoginView ? 'Entrar' : 'Crear Cuenta'}
          </button>
        </form>
        <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-blue-500 mt-4">
          {isLoginView ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia Sesión'}
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
