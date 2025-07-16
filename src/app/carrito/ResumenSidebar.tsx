"use client";
import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import UserProfile from './UserProfile';

interface Sucursal {
    id: number;
    nombre: string;
}

interface Skill {
    id: number;
    nombre: string;
}

interface Colaborador {
    id: number;
    nombreCompleto: string;
}

interface Horario {
    day: string;
    time: string;
}

interface ProductoSeleccionado {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number;
}

interface ResumenSidebarProps {
    sucursal: { id: number; nombre: string } | null;
    skill: { id: number; nombre: string } | null;
    colaborador: { id: number; nombreCompleto: string } | null;
    horario: { day: string; time: string } | null;
    productos: { id: number; nombre: string; precio: number; cantidad: number }[];
    descuento?: number;
    couponCode: string;
    setCouponCode: (code: string) => void;
    handleApplyCoupon: () => void;
    couponMessage: string;
}

const ResumenSidebar: React.FC<ResumenSidebarProps> = ({ 
    sucursal, 
    skill, 
    colaborador, 
    horario, 
    productos, 
    descuento = 0,
    couponCode,
    setCouponCode,
    handleApplyCoupon,
    couponMessage 
}) => {
    const { user, login } = useAuth();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            login(JSON.parse(storedUser));
        }
    }, [login]);

    const valorReserva = skill ? 5000 : 0;
    const totalProductos = productos.reduce((total, p) => total + p.precio * p.cantidad, 0);
    const subtotal = valorReserva + totalProductos;
    const totalGeneral = subtotal - descuento;

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <UserProfile />

            <div className="my-6">
                <label htmlFor="coupon-sidebar" className="block text-sm font-medium text-gray-700">¿Tienes un cupón?</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                        type="text"
                        name="coupon-sidebar"
                        id="coupon-sidebar"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm px-3 py-2 text-black"
                        placeholder="CUPON123"
                    />
                    <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    >
                        Aplicar
                    </button>
                </div>
                {couponMessage && <p className={`mt-2 text-sm ${descuento > 0 ? 'text-green-600' : 'text-red-600'}`}>{couponMessage}</p>}
            </div>

            <h2 className="text-2xl font-bold mb-6 border-b pb-3">Resumen del Agendamiento</h2>
            
            <div className="space-y-4">
                {sucursal && (
                    <div>
                        <h3 className="font-semibold text-lg">Sucursal</h3>
                        <p className="text-gray-700">{sucursal.nombre}</p>
                    </div>
                )}
                {skill && (
                    <div className="flex justify-between">
                        <span className="font-semibold">Servicio:</span>
                        <span>{skill.nombre}</span>
                    </div>
                )}
                {colaborador && (
                    <div className="flex justify-between">
                        <span className="font-semibold">Colaborador:</span>
                        <span>{colaborador.nombreCompleto}</span>
                    </div>
                )}
                {horario && (
                    <div className="flex justify-between">
                        <span className="font-semibold">Horario:</span>
                        <span>{horario.day}, {horario.time}</span>
                    </div>
                )}

                {(skill || productos.length > 0) && <div className="border-t my-4"></div>}

                {skill && (
                    <div className="flex justify-between">
                        <span className="font-semibold">Reserva:</span>
                        <span>${valorReserva.toLocaleString()}</span>
                    </div>
                )}

                {productos.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Productos:</h3>
                        {productos.map(p => (
                            <div key={p.id} className="flex justify-between text-sm mb-1">
                                <span>{p.nombre} x{p.cantidad}</span>
                                <span>${(p.precio * p.cantidad).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="border-t mt-auto pt-4 space-y-2">
                <div className="flex justify-between font-semibold">
                    <span>Subtotal:</span>
                    <span>${subtotal.toLocaleString()}</span>
                </div>
                {descuento > 0 && (
                    <div className="flex justify-between text-green-600 font-semibold">
                        <span>Descuento:</span>
                        <span>-${descuento.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${totalGeneral.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ResumenSidebar;
