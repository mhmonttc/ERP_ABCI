import { getClientes } from '../repositories/clientesRepository';

export async function fetchClientes() {
    return await getClientes();
}