"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import HorarioGrid from './HorarioGrid';
import ResumenSidebar from './ResumenSidebar';
import { AuthProvider, useAuth } from './AuthContext';
import AuthModal from './AuthModal';

interface Sucursal {
    id: number;
    nombre: string;
    direccion: string;
    enabled: boolean; 
    visible: boolean;
}

interface Skill {
    id: number;
    nombre: string;
    visible: boolean;
    habilitado: boolean;
}

interface Colaborador {
    id: number;
    nombreCompleto: string;
    
}

interface Horario {
    day: string;
    time: string;
}

interface Producto {
    id: number;
    nombre: string;
    precio: number;
    imagen?: string; 
    descripcion: string;
}

interface ProductoSeleccionado extends Producto {
    cantidad: number;
}

interface Regla {
    campo: string;
    operador: string;
    valor: string;
}

interface Campana {
    id?: string;
    nombre: string;
    descuento: number;
    reglas: Regla[];
    sucursalId?: number | null;
    fechaInicio: string;
    fechaFin: string;
}

const CarritoContent = () => {
    const { user, openModal } = useAuth();
    const [step, setStep] = useState(1);
    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [selectedProductos, setSelectedProductos] = useState<ProductoSeleccionado[]>([]);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
    const [horario, setHorario] = useState<Horario | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState('');
    const [campanas, setCampanas] = useState<Campana[]>([]); 
    const [appliedCampaign, setAppliedCampaign] = useState<Campana | null>(null); 

    useEffect(() => {
        if (step === 1) {
            fetch('/api/sucursales')
                .then(res => res.json())
                .then((data: Sucursal[] | { error: string }) => {
                    if (Array.isArray(data)) {
                        const habilitadas = data.filter(s => s.enabled === true);
                        setSucursales(habilitadas);
                    } else {
                        console.error("Error fetching sucursales or data is not an array:", data);
                        setSucursales([]); 
                    }
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                    setSucursales([]);
                });
        }
        
        fetch('/api/campanas')
            .then(res => res.json())
            .then((data: Campana[] | { error: string }) => { 
                if (Array.isArray(data)) {
                    setCampanas(data);
                } else {
                    console.error("Error fetching campañas or data is not an array:", data);
                    setCampanas([]);
                }
            })
            .catch(error => {
                console.error("Fetch error campañas:", error);
                setCampanas([]);
            });
    }, [step]);

    const handleSelectSucursal = (sucursal: Sucursal) => {
        setSelectedSucursal(sucursal);
        const skillsPromise = fetch(`/api/skills/by-sucursal/${sucursal.id}`).then(res => res.json());
        const productosPromise = fetch(`/api/productos/by-sucursal/${sucursal.id}`).then(res => res.json());

        Promise.all([skillsPromise, productosPromise])
            .then(([skillsData, productosData]) => {
                if (Array.isArray(skillsData)) {
                    setSkills(skillsData);
                } else {
                    console.error("Error fetching skills or data is not an array:", skillsData);
                    setSkills([]);
                }

                if (Array.isArray(productosData)) {
                    setProductos(productosData);
                } else {
                    console.error("Error fetching productos or data is not an array:", productosData);
                    setProductos([]);
                }
                
                setStep(2);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                setSkills([]);
                setProductos([]);
                setStep(2);
            });
    };

    const handleSelectSkill = (skill: Skill) => {
        setSelectedSkill(skill);
        if (selectedSucursal) {
            fetch(`/api/colaboradores/search?sucursalId=${selectedSucursal.id}&skillId=${skill.id}`)
                .then(res => res.json())
                .then((data: Colaborador[] | { error: string }) => {
                    if (Array.isArray(data)) {
                        setColaboradores(data);
                    } else {
                        console.error("Error fetching colaboradores or data is not an array:", data);
                        setColaboradores([]);
                    }
                    setStep(3);
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                    setColaboradores([]);
                    setStep(3);
                });
        }
    };

    const handleSelectColaborador = (colaborador: Colaborador) => {
        setSelectedColaborador(colaborador);
        setStep(4);
        
    };

    const handleSelectHorario = (clickedHorario: Horario) => {
        
        if (horario && horario.day === clickedHorario.day && horario.time === clickedHorario.time) {
            setHorario(null);
        } else {
            
            setHorario(clickedHorario);
        }
    };

    const handleProductoCantidadChange = (producto: Producto, cantidad: number) => {
        setSelectedProductos(prev => {
            const existente = prev.find(p => p.id === producto.id);
            if (existente) {
                if (cantidad === 0) {
                    return prev.filter(p => p.id !== producto.id);
                }
                return prev.map(p => p.id === producto.id ? { ...p, cantidad } : p);
            } else if (cantidad > 0) {
                return [...prev, { ...producto, cantidad }];
            }
            return prev;
        });
    };

    
    const evaluateRule = (rule: Regla, cartDetails: any): boolean => {
        const { campo, operador, valor } = rule;
        const cartValue = cartDetails[campo];

        if (cartValue === undefined || cartValue === null) {
            return false;
        }

        let parsedValor: any = valor;
        if (['montoCompra', 'clienteId'].includes(campo)) { 
            parsedValor = Number(valor);
            if (isNaN(parsedValor)) {
                return false;
            }
        }

        switch (operador) {
            case '=':
                return cartValue == parsedValor;
            case '>':
                return cartValue > parsedValor;
            case '<':
                return cartValue < parsedValor;
            case 'contiene':
                return String(cartValue).includes(String(parsedValor));
            default:
                return false;
        }
    };

    
    const findBestCampaign = (
        campanas: Campana[],
        cartDetails: any,
        selectedSucursal: Sucursal | null
    ): { bestCampaign: Campana | null; campaignDiscount: number } => {
        const montoCompra = cartDetails.montoCompra;
        const currentDate = new Date().toISOString().split('T')[0];

        let bestCampaign: Campana | null = null;
        let maxDiscountValue = 0;

        campanas.forEach(campaign => {
            const sucursalMatch = campaign.sucursalId === null || campaign.sucursalId === selectedSucursal?.id;
            const startDate = campaign.fechaInicio;
            const endDate = campaign.fechaFin;
            const dateMatch = currentDate >= startDate && currentDate <= endDate;

            if (sucursalMatch && dateMatch) {
                const allRulesMet = (campaign.reglas || []).every(rule => evaluateRule(rule, cartDetails));

                if (allRulesMet) {
                    
                    const currentCampaignDiscountValue = montoCompra * (campaign.descuento / 100);
                    if (currentCampaignDiscountValue > maxDiscountValue) {
                        maxDiscountValue = currentCampaignDiscountValue;
                        bestCampaign = campaign;
                    }
                }
            }
        });

        return { bestCampaign, campaignDiscount: maxDiscountValue };
    };

    
    useEffect(() => {
        
        if (couponCode && discount > 0 && !appliedCampaign) {
            return;
        }

        const totalProductos = selectedProductos.reduce((total, p) => total + p.precio * p.cantidad, 0);
        const valorReserva = selectedSkill ? 5000 : 0;
        const montoCompra = valorReserva + totalProductos;

        const cartDetails = {
            montoCompra: montoCompra,
            clienteId: user ? user.id : null,
            claseServicio: selectedSkill?.nombre,
        };

        const { bestCampaign, campaignDiscount } = findBestCampaign(campanas, cartDetails, selectedSucursal);

        
        if (!couponCode) {
            if (bestCampaign) {
                setDiscount(campaignDiscount);
                setAppliedCampaign(bestCampaign);
                setCouponMessage(`Campaña "${bestCampaign.nombre}" aplicada.`);
            } else {
                setDiscount(0);
                setAppliedCampaign(null);
                setCouponMessage('');
            }
        }
    }, [selectedProductos, selectedSkill, selectedSucursal, user, campanas]);


    const handleApplyCoupon = async () => {
        if (!couponCode) {
            setCouponMessage('Por favor, ingresa un código de cupón.');
            return;
        }

        const totalProductos = selectedProductos.reduce((total, p) => total + p.precio * p.cantidad, 0);
        const valorReserva = selectedSkill ? 5000 : 0;
        const montoCompra = valorReserva + totalProductos;

        const cartDetails = {
            montoCompra: montoCompra,
            clienteId: user ? user.id : null,
            claseServicio: selectedSkill?.nombre,
        };

        try {
            const response = await fetch('/api/cupones/validar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ couponCode, cartDetails }),
            });

            const data = await response.json();
            const { bestCampaign, campaignDiscount } = findBestCampaign(campanas, cartDetails, selectedSucursal);

            if (response.ok && data.isValid) {
                const couponDiscount = data.discount;

                if (couponDiscount >= campaignDiscount) {
                    setDiscount(couponDiscount);
                    setCouponMessage(data.message);
                    setAppliedCampaign(null);
                } else {
                    setDiscount(campaignDiscount);
                    setAppliedCampaign(bestCampaign);
                    setCouponMessage(`Campaña "${bestCampaign!.nombre}" es más beneficiosa.`);
                }
            } else {
                setCouponMessage(data.message || 'Cupón no válido.');
                if (bestCampaign) {
                    setDiscount(campaignDiscount);
                    setAppliedCampaign(bestCampaign);
                } else {
                    setDiscount(0);
                    setAppliedCampaign(null);
                }
            }
        } catch (error) {
            console.error('Error al aplicar el cupón:', error);
            setCouponMessage('No se pudo conectar con el servidor para validar el cupón.');
            setDiscount(0);
            setAppliedCampaign(null);
        }
    };

    const handleFinalizarAgendamiento = async () => {
        if (!selectedSucursal || !selectedSkill || !selectedColaborador || !horario) {
            alert("Faltan datos para completar el agendamiento. Por favor, revisa los pasos anteriores.");
            return;
        }

        setIsSubmitting(true);

        
        const totalProductos = selectedProductos.reduce((total, p) => total + p.precio * p.cantidad, 0);
        const valorReserva = selectedSkill ? 5000 : 0;
        const subtotal = valorReserva + totalProductos;
        const totalGeneral = subtotal - discount;

        const agendamientoData = {
            sucursalId: selectedSucursal.id,
            skillId: selectedSkill.id,
            colaboradorId: selectedColaborador.id,
            fecha: horario.day,
            horario: horario.time,
            productos: selectedProductos.map(p => ({ productoId: p.id, cantidad: p.cantidad })),
            montoTotal: totalGeneral,
            clienteId: user ? user.id : null, 
            cuponAplicado: couponCode,
            montoDescuento: discount,
            campanaAplicada: appliedCampaign?.nombre || null, 
        };

        if (!agendamientoData.clienteId) {
            alert("Por favor, inicia sesión o regístrate para continuar.");
            openModal();
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/agendamientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamientoData),
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage;

                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.message || 'Error desconocido desde la API.';
                } else {
                    const errorText = await response.text();
                    console.error("Respuesta no-JSON del servidor:", errorText); 
                    errorMessage = `El servidor respondió con un error (${response.status}). Es posible que la ruta de la API no exista o tenga un problema.`;
                }
                throw new Error(errorMessage);
            }

            alert("¡Agendamiento finalizado con éxito!");
            window.location.reload();
        } catch (error: any) {
            console.error('Error al finalizar el agendamiento:', error);
            alert(`Hubo un problema al finalizar el agendamiento: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Paso 1: Selecciona una Sucursal</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sucursales.map(sucursal => (
                                <div 
                                    key={sucursal.id} 
                                    onClick={() => setSelectedSucursal(sucursal)} 
                                    className={`border-2 rounded-lg cursor-pointer text-center transition-all ${selectedSucursal?.id === sucursal.id ? 'border-cyan-500' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-t-lg">
                                        <Image src="/globe.svg" alt="Sucursal" width={60} height={60} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold p-4 text-black">{sucursal.nombre}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={() => handleSelectSucursal(selectedSucursal!)} 
                                disabled={!selectedSucursal}
                                className="px-6 py-2 border rounded-lg bg-blue-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Paso 2: Selecciona un Skill y Productos</h2>
                        <h3 className="text-xl font-semibold mb-2">Skills</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {skills.map(skill => (
                                <div 
                                    key={skill.id} 
                                    onClick={() => setSelectedSkill(skill)} 
                                    className={`border-2 rounded-lg cursor-pointer text-center transition-all ${selectedSkill?.id === skill.id ? 'border-cyan-500' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-t-lg">
                                        <Image src="/file.svg" alt="Skill" width={60} height={60} className="text-gray-400" />
                                    </div>
                                    <h3 className="font-semibold p-4 text-black">{skill.nombre}</h3>
                                </div>
                            ))}
                        </div>

                        <h3 className="text-xl font-semibold mt-8 mb-2">Productos Disponibles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {productos.map(producto => {
                                const seleccionado = selectedProductos.find(p => p.id === producto.id);
                                const cantidad = seleccionado ? seleccionado.cantidad : 0;
                                return (
                                    <div 
                                        key={producto.id} 
                                        className={`relative border-2 rounded-lg overflow-hidden group ${cantidad > 0 ? 'border-cyan-500' : 'border-gray-200'}`}
                                        title={producto.descripcion}
                                    >
                                        <Image src={producto.imagen || "/vercel.svg"} alt={producto.nombre} width={200} height={200} className="w-full h-48 object-cover" />
                                        <div className="p-4">
                                            <h4 className="font-bold">{producto.nombre}</h4>
                                            <p className="text-gray-600">${producto.precio.toLocaleString()}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <button onClick={() => handleProductoCantidadChange(producto, Math.max(0, cantidad - 1))} className="px-3 py-1 bg-gray-200 rounded-full">-</button>
                                                <span>{cantidad}</span>
                                                <button onClick={() => handleProductoCantidadChange(producto, cantidad + 1)} className="px-3 py-1 bg-gray-200 rounded-full">+</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg bg-gray-200 font-semibold">Volver</button>
                            <button 
                                onClick={() => handleSelectSkill(selectedSkill!)} 
                                disabled={!selectedSkill}
                                className="px-6 py-2 border rounded-lg bg-blue-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Paso 3: Selecciona un Colaborador</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {colaboradores.map(colaborador => (
                                <div 
                                    key={colaborador.id} 
                                    onClick={() => setSelectedColaborador(colaborador)} 
                                    className={`border-2 rounded-lg cursor-pointer text-center transition-all ${selectedColaborador?.id === colaborador.id ? 'border-cyan-500' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                                        <svg xmlns="http:
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold p-4 text-black">{colaborador.nombreCompleto}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg bg-gray-200 font-semibold">Volver</button>
                            <button 
                                onClick={() => handleSelectColaborador(selectedColaborador!)} 
                                disabled={!selectedColaborador}
                                className="px-6 py-2 border rounded-lg bg-blue-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Paso 4: Selecciona un Horario</h2>
                        {selectedColaborador ? (
                            <HorarioGrid 
                                colaboradorId={selectedColaborador.id} 
                                onSelectHorario={handleSelectHorario}
                                selectedHorario={horario}
                            />
                        ) : (
                            <p>Por favor, selecciona un colaborador primero.</p>
                        )}
                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(3)} className="px-6 py-2 border rounded-lg bg-gray-200 font-semibold">Volver</button>
                            <button 
                                onClick={() => setStep(5)} 
                                disabled={!horario}
                                className="px-6 py-2 border rounded-lg bg-blue-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Paso 5: Confirmación del Agendamiento</h2>
                        
                        <p className="mb-4">Revisa el resumen de tu agendamiento. Si todo está correcto, acepta los términos y haz click en "Finalizar Agendamiento".</p>
                        
                        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                            <label className="flex items-start cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="mt-1 h-4 w-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                />
                                <span className="ml-3 text-sm text-gray-700">
                                    El concepto de reserva se usará como saldo a favor al realizar el pago del servicio completo una vez realizado, en caso de llegar atrasado en más de 15 minutos o no asistir a la cita agendada, este cargo no será reembolsable.
                                </span>
                            </label>
                        </div>

                        <div className="mt-6 flex justify-between">
                            <button onClick={() => setStep(4)} className="px-6 py-2 border rounded-lg bg-gray-200 font-semibold">Volver</button>
                            <button 
                                onClick={handleFinalizarAgendamiento} 
                                disabled={!termsAccepted || isSubmitting} 
                                className="px-6 py-2 border rounded-lg bg-cyan-500 text-white font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Finalizando...' : 'Finalizar Agendamiento'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Cargando...</div>;
        }
    };

    return (
        <div className="container mx-auto p-4 bg-white text-black">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3">
                    {renderStepContent()}
                </div>
                <div className="w-full md:w-1/3">
                    <div className="sticky top-4">
                        <ResumenSidebar 
                            sucursal={selectedSucursal}
                            skill={selectedSkill}
                            colaborador={selectedColaborador}
                            horario={horario}
                            productos={selectedProductos}
                            descuento={discount}
                            couponCode={couponCode}
                            setCouponCode={setCouponCode}
                            handleApplyCoupon={handleApplyCoupon}
                            couponMessage={couponMessage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Carrito = () => (
    <AuthProvider>
        <AuthModal />
        <CarritoContent />
    </AuthProvider>
);

export default Carrito;
