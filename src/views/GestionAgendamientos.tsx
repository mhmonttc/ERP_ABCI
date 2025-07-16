import React, { useEffect, useState, useMemo, useCallback } from "react";

interface Agendamiento {
  id: number;
  fecha: string;
  horario: string;
  colaboradorId: number;
  sucursalId: number;
  skillId: number;
  colaboradorNombre: string;
  clienteNombre: string;
  clienteApellido: string;
  skillNombre: string;
  estado: string;
}

interface Colaborador {
  id: number;
  nombreCompleto: string;
  sucursalId: number; 
}

interface Sucursal {
    id: number;
    nombre: string;
}

interface Skill {
    id: number;
    nombre: string;
}

const horarios = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00", "22:00"
];

const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function GestionAgendamientos() {
  const [agendamientos, setAgendamientos] = useState<Agendamiento[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSucursal, setSelectedSucursal] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysWithAppointments, setDaysWithAppointments] = useState<string[]>([]); 

  
  useEffect(() => {
    Promise.all([
      fetch("/api/colaboradores").then(res => res.json()),
      fetch("/api/sucursales").then(res => res.json()),
      fetch("/api/skills").then(res => res.json()),
    ]).then(([colaboradoresData, sucursalesData, skillsData]) => {
      setColaboradores(colaboradoresData);
      setSucursales(sucursalesData);
      setSkills(skillsData);
    }).catch(error => console.error("Error fetching initial data:", error));
  }, []);

  
  useEffect(() => {
    const fetchDailyAgendamientos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedSucursal !== 'all') params.append('sucursalId', selectedSucursal);
        if (selectedSkill !== 'all') params.append('skillId', selectedSkill);
        params.append('fecha', selectedDate.toISOString().split('T')[0]); 

        const res = await fetch(`/api/agendamientos?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Error al cargar agendamientos: ${res.statusText}`);
        }
        const data: Agendamiento[] = await res.json();
        setAgendamientos(data);
      } catch (err: any) {
        console.error("Error al cargar agendamientos:", err);
        setError(err.message || "Error al cargar agendamientos.");
        setAgendamientos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyAgendamientos();
  }, [selectedSucursal, selectedSkill, selectedDate]);

  
  useEffect(() => {
    const fetchMonthlyAgendamientosSummary = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedSucursal !== 'all') params.append('sucursalId', selectedSucursal);
        if (selectedSkill !== 'all') params.append('skillId', selectedSkill);
        params.append('mes', `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`);

        const res = await fetch(`/api/agendamientos?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Error al cargar resumen mensual de agendamientos: ${res.statusText}`);
        }
        const data: string[] = await res.json(); 
        setDaysWithAppointments(data);
      } catch (err) {
        console.error("Error al cargar resumen mensual de agendamientos:", err);
        setDaysWithAppointments([]);
      }
    };

    fetchMonthlyAgendamientosSummary();
  }, [currentDate, selectedSucursal, selectedSkill]); 

  const filteredColaboradores = useMemo(() => {
    if (selectedSucursal === 'all') return colaboradores;
    return colaboradores.filter(c => c.sucursalId === parseInt(selectedSucursal));
  }, [colaboradores, selectedSucursal]);

  const agendamientosPorHorarioYColaborador = useMemo(() => {
    const map = new Map<string, Map<number, Agendamiento>>();
    agendamientos.forEach(a => {
      if (!map.has(a.horario)) {
        map.set(a.horario, new Map<number, Agendamiento>());
      }
      map.get(a.horario)!.set(a.colaboradorId, a);
    });
    return map;
  }, [agendamientos]);

  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() - 1);
        return newDate;
      })}>{'<'}</button>
      <h3 className="text-xl font-bold text-black">{currentDate.toLocaleString('es-CL', { month: 'long', year: 'numeric' })}</h3>
      <button onClick={() => setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setMonth(newDate.getMonth() + 1);
        return newDate;
      })}>{'>'}</button>
    </div>
  );

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border rounded-md p-2 text-center"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const hasAgendamientos = daysWithAppointments.includes(dateString); 
      const isSelected = date.toDateString() === selectedDate.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`border rounded-md p-2 text-center cursor-pointer ${isSelected ? 'bg-blue-500 text-white' : 'text-black'} ${hasAgendamientos && !isSelected ? 'bg-blue-100' : ''}`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-black">Gestión de Agendamientos</h2>
      
      <div className="flex gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sucursal</label>
          <select onChange={e => setSelectedSucursal(e.target.value)} value={selectedSucursal} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black">
            <option value="all">Todas</option>
            {sucursales.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Skill</label>
          <select onChange={e => setSelectedSkill(e.target.value)} value={selectedSkill} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-black">
            <option value="all">Todos</option>
            {skills.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {}
        <div className="md:col-span-1">
          {renderCalendarHeader()}
          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => <div key={day} className="font-bold text-center text-black">{day}</div>)}
            {renderCalendarDays()}
          </div>
        </div>

        {}
        <div className="md:col-span-2">
          <h3 className="text-xl font-bold text-black mb-4">
            Agendamientos para el {selectedDate.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>
          {loading && <div className="text-gray-500">Cargando agendamientos...</div>}
          {error && <div className="text-red-500">Error: {error}</div>}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-black">Horario</th>
                    {filteredColaboradores.map(c => <th key={c.id} className="border p-2 text-black">{c.nombreCompleto}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map(hora => (
                    <tr key={hora}>
                      <td className="border p-2 font-mono text-black">{hora}</td>
                      {filteredColaboradores.map(col => {
                        const agendamiento = agendamientosPorHorarioYColaborador.get(hora)?.get(col.id);
                        return (
                          <td key={col.id} className={`border p-2 text-xs ${agendamiento ? 'bg-cyan-300 text-black' : ''}`}>
                            {agendamiento ? (
                              <div>
                                <p className="font-bold">{agendamiento.clienteNombre} {agendamiento.clienteApellido}</p>
                                <p>{agendamiento.skillNombre}</p>
                                <p className="text-gray-600">({agendamiento.estado})</p>
                              </div>
                            ) : ''}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
