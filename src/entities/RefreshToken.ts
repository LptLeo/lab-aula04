import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Pesquisador from "./Pesquisador.js";

@Entity("refreshtoken")
export default class RefreshToken {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar" , nullable: false, length: 255})
    jti: string;

    @Column({ type: "varchar", nullable: false, length: 255 })
    tokenhash: string;

    @Column({  type: 'timestamp', nullable: true })
    expireIn: Date;

    @Column({ default: false })
    revoked:  boolean;

    @ManyToOne(() => Pesquisador, { onDelete: 'CASCADE' })
    pesquisador:  Pesquisador;

    @CreateDateColumn()
    createAt: Date;

}