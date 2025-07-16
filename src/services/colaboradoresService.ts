import { getColaboradores, createColaborador, updateColaborador, deleteColaborador, searchColaboradores } from '../repositories/colaboradoresRepository';

export async function fetchColaboradores() {
    return await getColaboradores();
}

export async function addColaborador(colaboradorData: any) {
    return await createColaborador(colaboradorData);
}

export async function editColaborador(id: string, colaboradorData: any) {
    return await updateColaborador(id, colaboradorData);
}

export async function removeColaborador(id: string) {
    return await deleteColaborador(id);
}

export async function findColaboradores(sucursalId: string, skillId: string) {
    return await searchColaboradores(sucursalId, skillId);
}