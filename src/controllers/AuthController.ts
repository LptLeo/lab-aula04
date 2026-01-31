import type { Request, Response } from "express";
import type AuthService from "../services/AuthService.js";
import type LogoutService from "../services/LogoutService.js";
import type RefreshTokenService from "../services/RefreshTokenService.js";

export default class AuthController {

    private autService: AuthService;
    private logoutService: LogoutService;
    private refreshService: RefreshTokenService;

    constructor(authService: AuthService, logoutService: LogoutService, refreshService: RefreshTokenService) {
        this.autService = authService;
        this.logoutService = logoutService;
        this.refreshService = refreshService;
    }

    async login(req: Request, res: Response) {
        const { email, senha } = req.body;

        const tokens = this.autService.login(email, senha);
        res.status(200).json({ tokens })

    }

    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        const tokens = await this.refreshService.refresh(refreshToken);
        res.status(200).json({ tokens })

    }

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;
        await this.logoutService.logout(refreshToken);
        res.status(200).json({ message: "Success" })
    }

}
