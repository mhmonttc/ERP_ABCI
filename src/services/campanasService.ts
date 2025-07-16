import { getCampanas, createCampana, deleteCampana, getUsoCampanas } from '../repositories/campanasRepository';

export async function fetchCampanas() {
    return await getCampanas();
}

export async function addCampana(campanaData: any) {
    return await createCampana(campanaData);
}

export async function removeCampana(id: string) {
    return await deleteCampana(id);
}

export async function fetchUsoCampanas(sucursalId: string | null) {
    return await getUsoCampanas(sucursalId);
}