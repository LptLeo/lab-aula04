import { jwtConfig } from "../config/jwt.config.js";
import { appDataSource } from "../database/appDataSource.js";
import RefreshToken from "../entities/RefreshToken.js";
import jwt from 'jsonwebtoken'
import { AppError } from "../errors/AppError.js";

export default class LogoutService {

    private repoRefresh = appDataSource.getRepository(RefreshToken);

    async logout(refrestoken: string) {

        try {
            //
            const decoded = jwt.verify(refrestoken, jwtConfig.refresh.secret)  as any;
            await this.repoRefresh.update({ jti: decoded.jti }, { revoked: true })

        } catch (error) {
            throw new AppError(401, "Token inválido")
        }

    }

    async logoutAll(pesquisadorId: string) {
        await this.repoRefresh.update(
            {
                pesquisador: { id: pesquisadorId},
            },
            {
                revoked: true
            }
        )
    }
}
