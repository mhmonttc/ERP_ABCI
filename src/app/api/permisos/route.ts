import { NextRequest, NextResponse } from "next/server";
import { fetchPermisosByColaborador, savePermisos } from '../../../services/permisosService';

export async function GET(req: NextRequest) {
  try {
    const colaboradorId = req.nextUrl.searchParams.get("colaboradorId");
    const permisos = await fetchPermisosByColaborador(colaboradorId);
    return NextResponse.json(permisos);
  } catch (error) {
    console.error("Error en GET /api/permisos:", error);
    
    if (error instanceof Error && error.message === 'colaboradorId es requerido') {
      return NextResponse.json({}, { status: 400 });
    }
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { colaboradorId, permisos } = body;
    
    await savePermisos(colaboradorId, permisos);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en POST /api/permisos:", error);
    
    if (error instanceof Error && error.message === 'Datos inválidos') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
