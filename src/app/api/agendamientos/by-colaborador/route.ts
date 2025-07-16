import { NextRequest, NextResponse } from "next/server";
import { fetchAgendamientosByColaborador } from '../../../../services/agendamientosService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const colaboradorId = searchParams.get('colaboradorId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!colaboradorId || !startDate || !endDate) {
      return NextResponse.json({ error: 'colaboradorId, startDate, and endDate are required' }, { status: 400 });
    }

    const agendamientos = await fetchAgendamientosByColaborador(colaboradorId, startDate, endDate);
    return NextResponse.json(agendamientos);
  } catch (error) {
    console.error('Error en GET /api/agendamientos/by-colaborador:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
