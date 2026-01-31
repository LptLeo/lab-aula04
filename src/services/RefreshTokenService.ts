import bcrypt from "bcryptjs";
import { jwtConfig } from "../config/jwt.config.js";
import { appDataSource } from "../database/appDataSource.js";
import type Pesquisador from "../entities/Pesquisador.js";
import RefreshToken from "../entities/RefreshToken.js";
import { randomUUID } from "crypto";
import jwt from 'jsonwebtoken'
import ms from 'ms'
import { AppError } from "../errors/AppError.js";

export default class RefreshTokenService {

    private repoRefresh = appDataSource.getRepository(RefreshToken);

    async refresh(refreshToken: string) {

        const decoded =  jwt.verify(refreshToken, jwtConfig.refresh.secret) as any;

        const jti = decoded.jti;

        const tokenSalvoNoBanco = await this.repoRefresh.findOne({ 
            where: { jti, revoked: false }, relations: ['pesquisadores']
        })

        if(!tokenSalvoNoBanco || tokenSalvoNoBanco.expireIn < new Date()) {
            throw new AppError(401, "Token Inválido!")
        }

        const tokenInvalido = await bcrypt.compare(refreshToken, tokenSalvoNoBanco.tokenhash);

        if(!tokenInvalido) {
            throw new AppError(401, "Token Inválido!")
        }

        // Torna o token inválido!
        await this.repoRefresh.update({ jti }, { revoked: true });

        const novoToken = await this.createRefreshToken(tokenSalvoNoBanco.pesquisador)

        return {
            tokenAccess: this.generateAcessToken(tokenSalvoNoBanco.pesquisador),
            refreshToken: this.generateRefreshToken(tokenSalvoNoBanco.pesquisador, novoToken.jti)
        }

    }

    private async createRefreshToken(pesquisador: Pesquisador) {
            const token  = await this.repoRefresh.create({
                jti: randomUUID(),
                pesquisador: pesquisador
            })
    
            return this.repoRefresh.save(token);
        }
    
    private async generateRefreshToken(pesq: Pesquisador, jti: string) {
    
            const tokenPlan = jwt.sign(
                {
                    sub: pesq.id,
                    jti: jti,
                    type: 'refresh'
                },
                jwtConfig.refresh.secret,
                {
                    expiresIn: jwtConfig.refresh.expiresIn!
                }
            );
    
    
            const expireInMS = typeof jwtConfig.refresh.expiresIn === "string" ?
             ms(jwtConfig.refresh.expiresIn) : jwtConfig.refresh.expiresIn! * 1000;
    
             await this.repoRefresh.update({ jti }, {
                tokenhash: await bcrypt.hash(tokenPlan, 12),
                expireIn: new Date(Date.now() + expireInMS ),
                revoked: false
             })
    
             return tokenPlan;
        }
    
    private generateAcessToken(pesquisador: Pesquisador) {
            return jwt.sign(
                {
                    sub: pesquisador.id,
                    email: pesquisador.email,
                    type: "access"
                },
                jwtConfig.access.secret,
                {
                    expiresIn: jwtConfig.access.expiresIn!
                }
            )
        }

}
