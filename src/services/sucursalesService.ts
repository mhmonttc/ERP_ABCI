import { getSucursales, createSucursal } from '../repositories/sucursalesRepository';

export async function fetchSucursales() {
    return await getSucursales();
}

export async function addSucursal(sucursalData: any) {
    return await createSucursal(sucursalData);
}