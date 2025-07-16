import { NextRequest, NextResponse } from "next/server";
import { fetchAgendamientos, addAgendamiento } from '../../../services/agendamientosService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sucursalId = searchParams.get('sucursalId');
    const skillId = searchParams.get('skillId');
    const fecha = searchParams.get('fecha'); 
    const mes = searchParams.get('mes'); 

    try {
        const agendamientos = await fetchAgendamientos(sucursalId, skillId, fecha, mes);
        return NextResponse.json(agendamientos);
    } catch (error) {
        console.error('Error al obtener agendamientos:', error);
        return NextResponse.json({ message: 'Error al obtener agendamientos' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        sucursalId,
        skillId,
        colaboradorId,
        fecha,
        horario,
        productos, 
        montoTotal,
        clienteId,
        cuponAplicado,
        montoDescuento,
        campanaAplicada, 
    } = body;

    if (!sucursalId || !skillId || !colaboradorId || !fecha || !horario || !montoTotal || !clienteId) {
        return NextResponse.json({ message: 'Faltan campos requeridos para el agendamiento.' }, { status: 400 });
    }

    try {
        const agendamientoId = await addAgendamiento(body, productos);
        return NextResponse.json({ message: 'Agendamiento creado con éxito', agendamientoId }, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/agendamientos:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
        const status = errorMessage.includes('disponible') ? 409 : 500;
        return NextResponse.json({ message: errorMessage }, { status });
    }
}
