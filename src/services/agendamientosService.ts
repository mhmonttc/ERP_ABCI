import { getAgendamientos, createAgendamiento } from '../repositories/agendamientosRepository';

export async function fetchAgendamientos(sucursalId: string | null, skillId: string | null, fecha: string | null, mes: string | null) {
    return await getAgendamientos(sucursalId, skillId, fecha, mes);
}

export async function addAgendamiento(agendamientoData: any, productos: any[]) {
    return await createAgendamiento(agendamientoData, productos);
}
import { getAgendamientosByColaborador } from '../repositories/agendamientosRepository';

export async function fetchAgendamientosByColaborador(colaboradorId: string, startDate: string, endDate: string) {
    return await getAgendamientosByColaborador(colaboradorId, startDate, endDate);
}