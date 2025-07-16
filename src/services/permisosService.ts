import { getPermisosByColaborador, upsertPermisos } from '../repositories/permisosRepository';

export async function fetchPermisosByColaborador(colaboradorId: string | null) {
    if (!colaboradorId) {
        throw new Error('colaboradorId es requerido');
    }
    
    const result = await getPermisosByColaborador(colaboradorId);
    
    if (!result) {
        return {};
    }
    
    let permisos = {};
    try {
        permisos = JSON.parse(result.menus || '{}');
    } catch {
        permisos = {};
    }
    
    return permisos;
}

export async function savePermisos(colaboradorId: number, permisos: object) {
    if (!colaboradorId || typeof permisos !== 'object') {
        throw new Error('Datos inválidos');
    }
    
    return await upsertPermisos(colaboradorId, permisos);
}