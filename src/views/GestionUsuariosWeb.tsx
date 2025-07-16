import React, { useEffect, useState, FormEvent } from "react";


const EditIcon = () => (
    <svg xmlns="http:
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const ResetPasswordIcon = () => (
    <svg xmlns="http:
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v2H4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zm2 6V6a2 2 0 10-4 0v2h4z" clipRule="evenodd" />
    </svg>
);

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fechaRegistro: string;
}

export default function GestionUsuariosWeb() {
  const [usuarios, setUsuarios] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', telefono: '' });

  const fetchUsuarios = () => {
    setLoading(true);
    fetch("/api/clientes")
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar los usuarios');
        return res.json();
      })
      .then((data) => {
        setUsuarios(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleEditClick = (usuario: Cliente) => {
    setSelectedUser(usuario);
    setFormData({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono || '',
    });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const response = await fetch(`/api/clientes/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al actualizar el usuario.');
      
      alert('Usuario actualizado con éxito');
      handleModalClose();
      fetchUsuarios(); 
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt("Ingresa la nueva contraseña para el usuario:");
    if (newPassword && newPassword.trim().length >= 6) {
      if (confirm("¿Estás seguro de que quieres cambiar la contraseña de este usuario?")) {
        try {
          const response = await fetch(`/api/clientes/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPassword }),
          });
          if (!response.ok) throw new Error('Error al resetear la contraseña.');
          alert('Contraseña actualizada con éxito.');
        } catch (err: any) {
          alert(`Error: ${err.message}`);
        }
      }
    } else if (newPassword) {
      alert("La contraseña debe tener al menos 6 caracteres.");
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-black">Gestión de Usuarios Web</h2>
        <p className="mb-6 text-gray-600">Administra las cuentas de los clientes registrados a través del carrito de compras.</p>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de Registro</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-4">Cargando...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} className="text-center py-4 text-red-500">{error}</td></tr>
                ) : (
                  usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{usuario.nombre} {usuario.apellido}</p></td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{usuario.email}</p></td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{usuario.telefono || 'No especificado'}</p></td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{new Date(usuario.fechaRegistro).toLocaleDateString()}</p></td>
                      <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm text-center">
                        <div className="flex justify-center gap-4">
                          <button onClick={() => handleEditClick(usuario)} className="text-indigo-600 hover:text-indigo-900" title="Editar Usuario"><EditIcon /></button>
                          <button onClick={() => handleResetPassword(usuario.id)} className="text-red-600 hover:text-red-900" title="Resetear Contraseña"><ResetPasswordIcon /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <h3 className="text-2xl font-bold mb-6 text-black">Editar Usuario</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleFormChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={handleModalClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
