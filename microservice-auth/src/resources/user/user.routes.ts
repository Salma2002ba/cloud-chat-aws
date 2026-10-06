import { Router } from 'express';
import { userController } from './user.controller';

const router = Router();

// GET /auth/user/:userId - Récupérer un utilisateur par ID
router.get('/user/:userId', userController.getUserById.bind(userController));

// GET /auth/user/username/:username - Récupérer un utilisateur par username
router.get('/user/username/:username', userController.getUserByUsername.bind(userController));

export default router;
