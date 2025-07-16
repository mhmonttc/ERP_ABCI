import { NextRequest, NextResponse } from "next/server";
import { addIngresoEgreso } from '../../../services/ingresosEgresosService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await addIngresoEgreso(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/ingresos-egresos:', error);
    
    if (error instanceof Error && error.message === 'Todos los campos son requeridos') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
