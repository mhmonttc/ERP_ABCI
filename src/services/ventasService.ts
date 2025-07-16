import { getVentas, createVenta } from '../repositories/ventasRepository';

export async function fetchVentas(filters: any) {
    return await getVentas(filters);
}

export async function addVenta(ventaData: any) {
    const { items, total, sucursalId } = ventaData;
    
    if (!items || items.length === 0 || !total || !sucursalId) {
        throw new Error('Faltan datos para registrar la venta.');
    }
    
    const result = await createVenta(ventaData);
    return result;
}