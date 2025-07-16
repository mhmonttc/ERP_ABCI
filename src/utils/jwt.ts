import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';

export class JWTUtils {
    private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key';
    private static readonly REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
    private static readonly REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
    
    static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, this.SECRET, {
            expiresIn: this.EXPIRES_IN,
            algorithm: 'HS256'
        });
    }
    
    static generateRefreshToken(colaboradorId: string): string {
        return jwt.sign({ sub: colaboradorId }, this.REFRESH_SECRET, {
            expiresIn: this.REFRESH_EXPIRES_IN,
            algorithm: 'HS256'
        });
    }
    
    static verifyToken(token: string): JWTPayload | null {
        try {
            return jwt.verify(token, this.SECRET) as JWTPayload;
        } catch (error) {
            return null;
        }
    }
    
    static verifyRefreshToken(token: string): { sub: string } | null {
        try {
            return jwt.verify(token, this.REFRESH_SECRET) as { sub: string };
        } catch (error) {
            return null;
        }
    }
    
    static getTokenFromHeader(authHeader: string): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }
    
    static decodeToken(token: string): JWTPayload | null {
        try {
            return jwt.decode(token) as JWTPayload;
        } catch (error) {
            return null;
        }
    }
    
    static isTokenExpired(token: string): boolean {
        const decoded = this.decodeToken(token);
        if (!decoded) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }
}