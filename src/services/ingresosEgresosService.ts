import { createIngresoEgreso } from '../repositories/ingresosEgresosRepository';

export async function addIngresoEgreso(data: any) {
    const { sucursalId, tipo, motivo, productoId, cantidad, fecha } = data;
    
    if (!sucursalId || !tipo || !motivo || !productoId || !cantidad || !fecha) {
        throw new Error('Todos los campos son requeridos');
    }
    
    return await createIngresoEgreso(data);
}