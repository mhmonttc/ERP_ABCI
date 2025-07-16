import { NextRequest, NextResponse } from "next/server";
import { fetchCampanas, addCampana, removeCampana } from '../../../services/campanasService';

export async function GET(req: NextRequest) {
    try {
        const campanas = await fetchCampanas();
        return NextResponse.json(campanas);
    } catch (error) {
        console.error('Error al obtener campañas:', error);
        return NextResponse.json({ message: 'Error al obtener campañas' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        nombre,
        descuento,
        reglas,
        sucursalId,
        fechaInicio,
        fechaFin,
    } = body;

    if (!nombre || descuento === undefined || !reglas || reglas.length === 0 || !fechaInicio || !fechaFin) {
        return NextResponse.json({ message: 'Faltan campos requeridos o reglas para la campaña.' }, { status: 400 });
    }

    try {
        const nuevaCampana = await addCampana(body);
        return NextResponse.json(nuevaCampana, { status: 201 });
    } catch (error) {
        console.error('Error al crear campaña:', error);
        const dbError = error instanceof Error ? error.message : 'Error desconocido.';
        return NextResponse.json({ message: 'Error al crear campaña', error: dbError }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
        return NextResponse.json({ message: 'ID de campaña requerido.' }, { status: 400 });
    }

    try {
        await removeCampana(id);
        return NextResponse.json({ message: 'Campaña eliminada con éxito.' }, { status: 200 });
    } catch (error) {
        console.error('Error al eliminar campaña:', error);
        const dbError = error instanceof Error ? error.message : 'Error desconocido.';
        return NextResponse.json({ message: 'Error al eliminar campaña', error: dbError }, { status: 500 });
    }
}
