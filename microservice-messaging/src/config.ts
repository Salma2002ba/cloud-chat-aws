export const config = {
    port: process.env.PORT || 3002,
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'chatdb',
        user: process.env.DB_USER || 'admin_chatuser',
        password: process.env.DB_PASSWORD || 'postgres',
        ssl: process.env.DB_SSL ? { rejectUnauthorized: false } : false,
        sync: !!process.env.DB_SYNC || true,
    },
    authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    jwt: {
        secret: process.env.JWT_SECRET || 'dev-only-change-me'
    }
};
