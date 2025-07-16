export class RutValidator {
    static isValidRut(rut: string): boolean {
        if (!rut || typeof rut !== 'string') return false;
        
        // Limpiar RUT (remover puntos, guiones y espacios)
        const cleanRut = rut.replace(/[^0-9kK]/g, '');
        
        if (cleanRut.length < 8 || cleanRut.length > 9) return false;
        
        const rutBody = cleanRut.slice(0, -1);
        const checkDigit = cleanRut.slice(-1).toUpperCase();
        
        return this.calculateCheckDigit(rutBody) === checkDigit;
    }
    
    static calculateCheckDigit(rutBody: string): string {
        let sum = 0;
        let multiplier = 2;
        
        for (let i = rutBody.length - 1; i >= 0; i--) {
            sum += parseInt(rutBody[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }
        
        const remainder = sum % 11;
        const checkDigit = 11 - remainder;
        
        if (checkDigit === 11) return '0';
        if (checkDigit === 10) return 'K';
        return checkDigit.toString();
    }
    
    static formatRut(rut: string): string {
        const cleanRut = rut.replace(/[^0-9kK]/g, '');
        const rutBody = cleanRut.slice(0, -1);
        const checkDigit = cleanRut.slice(-1);
        
        return `${rutBody.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${checkDigit}`;
    }
    
    static cleanRut(rut: string): string {
        return rut.replace(/[^0-9kK]/g, '');
    }
}