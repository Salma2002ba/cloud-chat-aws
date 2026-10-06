import express from 'express';
import cors from 'cors';
import authRoutes from './resources/auth/auth.routes';
import userRoutes from './resources/user/user.routes';
import "reflect-metadata";
import {unknownRouteHandler} from "./middlewares/unknown-route-handler.middleware";
import {globalErrorHandlerMiddleware} from "./middlewares/global-error-handler.middleware";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/auth', userRoutes);

app.get('/health', (req, res) => {
    res.json({ service: 'auth', status: 'healthy' });
});

app.use(unknownRouteHandler);
app.use(globalErrorHandlerMiddleware);

export default app;
