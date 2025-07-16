import { getProductos, createProducto, getProductosBySucursal } from '../repositories/productosRepository';

export async function fetchProductos(code: string | null, sucursalId: string | null) {
    return await getProductos(code, sucursalId);
}

export async function addProducto(productData: any) {
    return await createProducto(productData);
}

export async function fetchProductosBySucursal(sucursalId: string) {
    return await getProductosBySucursal(sucursalId);
}