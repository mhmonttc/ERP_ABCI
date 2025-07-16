import { getSkills, createSkill, updateSkill, deleteSkill, getSkillsBySucursal } from '../repositories/skillsRepository';

export async function fetchSkills() {
    return await getSkills();
}

export async function addSkill(skillData: any) {
    const { nombre } = skillData;
    
    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }
    
    return await createSkill(skillData);
}

export async function editSkill(id: string, skillData: any) {
    const { nombre } = skillData;
    
    if (!nombre) {
        throw new Error('El nombre es obligatorio');
    }
    
    return await updateSkill(id, skillData);
}

export async function removeSkill(id: string) {
    return await deleteSkill(id);
}

export async function fetchSkillsBySucursal(sucursalId: string) {
    if (!sucursalId) {
        throw new Error('sucursalId is required');
    }
    
    return await getSkillsBySucursal(sucursalId);
}