declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: string;
            PORT: string;
            DB_USER: string;
            DB_PASSWORD: string;
            DB_HOST: string;
            DB_PORT: string;
            DB_NAME: string;
            JWT_SECRET: string;
            JWT_EXPIRES_IN: string;
        }
    }
}

export { };