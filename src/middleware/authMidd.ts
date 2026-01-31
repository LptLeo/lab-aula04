import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError.js";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config.js";

export interface  AuthRequest extends Request {
    user?: { sub: string, email: string }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {

    try {
        
        const token = req.headers.authorization?.replace('Bearer', '').trim();

        if(!token) {
            throw new AppError(401, "Token inválido!")
        }

        const decoded = jwt.verify(token, jwtConfig.access.secret) as any;

        if (decoded.type !== "access") {
            throw new AppError(401, "Token inválido!")
        }

        req.user = { sub: decoded.sub, email: decoded.email };
        next();

    } catch (error) {
        throw new AppError(401, "Token Inválido!")
    }

}
