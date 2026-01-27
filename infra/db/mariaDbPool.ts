import mysql from "mysql2/promise";

const requiredEnv = [
  "MARIADB_HOST",
  "MARIADB_USER",
  "MARIADB_PASSWORD",
  "MARIADB_DATABASE"
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  throw new Error(`MariaDB env missing: ${missingEnv.join(", ")}`);
}

type PoolType = ReturnType<typeof mysql.createPool>;

const globalPoolKey = "gyeowooMariaDbPool";
const globalForPool = globalThis as unknown as Record<string, PoolType | undefined>;

export const mariaDbPool =
  globalForPool[globalPoolKey] ??
  mysql.createPool({
    host: process.env.MARIADB_HOST,
    port: Number(process.env.MARIADB_PORT ?? 3306),
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    connectionLimit: 2,
    maxIdle: 2,
    idleTimeout: 60000,
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });

globalForPool[globalPoolKey] = mariaDbPool;
