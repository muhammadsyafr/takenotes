import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
}
export declare function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function generateToken(userId: string): string;
//# sourceMappingURL=auth.d.ts.map