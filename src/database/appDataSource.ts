import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const appDataSource = new DataSource({
  type: "postgres",
  // Se existir a variável DB_HOST (vinda do Docker), usa ela.
  // Senão, usa "localhost" (para você conseguir rodar no seu PC fora do Docker).
  host: process.env.DB_HOST as string,
  port: Number(process.env.DB_PORT as string),
  username: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
  database: process.env.DB_NAME as string,

  // ATENÇÃO AQUI: Em produção (dentro do Docker), o caminho muda para .js
  entities: [
    process.env.NODE_ENV === "production"
      ? "dist/entities/*.js"
      : "src/entities/*.ts",
  ],

  logging: true,
  // Em produção real, synchronize deve ser false. Use migrations!
  synchronize: process.env.NODE_ENV !== "production",
});
