"use client";
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isPast, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface HorarioGridProps {
    colaboradorId: number;
    onSelectHorario: (horario: { day: string, time: string }) => void;
    selectedHorario: { day: string, time: string } | null;
}

interface Agendamiento {
    fecha: string;
    horario: string;
}

const HorarioGrid: React.FC<HorarioGridProps> = ({ colaboradorId, onSelectHorario, selectedHorario }) => {
    const [agendamientos, setAgendamientos] = useState<Agendamiento[]>([]);
    const [semana, setSemana] = useState<Date[]>([]);

    useEffect(() => {
        const hoy = new Date();
        const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 }); 
        const diasSemana = Array.from({ length: 6 }).map((_, i) => addDays(inicioSemana, i));
        setSemana(diasSemana);

        const startDate = format(diasSemana[0], 'yyyy-MM-dd');
        const endDate = format(diasSemana[5], 'yyyy-MM-dd');

        if (colaboradorId) {
            fetch(`/api/agendamientos/by-colaborador?colaboradorId=${colaboradorId}&startDate=${startDate}&endDate=${endDate}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAgendamientos(data);
                    } else {
                        setAgendamientos([]);
                    }
                })
                .catch(() => setAgendamientos([]));
        }
    }, [colaboradorId]);

    const times = Array.from({ length: 14 }, (_, i) => `${9 + i}:00`); 

    const getEstadoHorario = (fechaDia: Date, time: string) => {
        const fechaFormateada = format(fechaDia, 'yyyy-MM-dd');

        if (selectedHorario && selectedHorario.day === fechaFormateada && selectedHorario.time === time) {
            return { estado: 'tomado', color: 'bg-teal-500 text-white' }; 
        }

        const fechaHoraSlot = parse(`${fechaFormateada} ${time}`, 'yyyy-MM-dd H:mm', new Date());

        if (isPast(fechaHoraSlot)) {
            return { estado: 'no disponible', color: 'bg-gray-700 text-white' };
        }

        
        
        
        const agendado = agendamientos.find(a => a.fecha.startsWith(fechaFormateada) && a.horario === time);

        if (agendado) {
            return { estado: 'agendado', color: 'bg-cyan-500 text-white' };
        }

        return { estado: 'disponible', color: 'bg-green-500 hover:bg-green-600 text-white' };
    };

    return (
        <div className="grid grid-cols-7 gap-2 text-center text-black">
            <div></div>
            {semana.map(dia => (
                <div key={dia.toString()} className="font-bold capitalize">
                    {format(dia, 'eeee', { locale: es })}
                    <br />
                    <span className="font-normal">{format(dia, 'dd/MM')}</span>
                </div>
            ))}

            {times.map(time => (
                <React.Fragment key={time}>
                    <div className="font-bold text-black">{time}</div>
                    {semana.map(dia => {
                        const { estado, color } = getEstadoHorario(dia, time);
                        const fechaFormateada = format(dia, 'yyyy-MM-dd');
                        return (
                            <div key={`${fechaFormateada}-${time}`} className="p-1 border">
                                {estado === 'disponible' || estado === 'tomado' ? (
                                    <button
                                        onClick={() => onSelectHorario({ day: fechaFormateada, time })}
                                        className={`w-full h-full rounded p-2 transition-colors ${color}`}
                                    >
                                        {estado === 'tomado' ? 'Tomado' : 'Disponible'}
                                    </button>
                                ) : (
                                    <div className={`w-full h-full rounded p-2 flex items-center justify-center ${color}`}>
                                        {estado === 'agendado' ? 'Agendado' : 'No Disponible'}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};

export default HorarioGrid;
