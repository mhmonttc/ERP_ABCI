import { getCupones, createCupon, getCuponById, updateCupon, deleteCupon, getUsoCupones, validateCupon } from '../repositories/cuponesRepository';

export async function fetchCupones() {
    return await getCupones();
}

export async function addCupon(cuponData: any) {
    return await createCupon(cuponData);
}

export async function fetchCuponById(id: string) {
    return await getCuponById(id);
}

export async function editCupon(id: string, cuponData: any) {
    return await updateCupon(id, cuponData);
}

export async function removeCupon(id: string) {
    return await deleteCupon(id);
}

export async function fetchUsoCupones(sucursalId: string | null) {
    return await getUsoCupones(sucursalId);
}

export async function checkCuponValidity(couponCode: string, cartDetails: any) {
    return await validateCupon(couponCode, cartDetails);
}