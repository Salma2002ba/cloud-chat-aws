import { Router } from 'express';
import { AuthController } from './auth.controller';
import {validation} from "../../middlewares/validation.middleware";
import {RegisterDto} from "./dto/register.dto";
import {LoginDto} from "./dto/login.dto";

const router = Router();
const authController = new AuthController();

router.post('/register', validation(RegisterDto), authController.register);
router.post('/login', validation(LoginDto),  authController.login);
router.post('/verify', authController.verify);
router.post('/change-password', authController.changePassword);

export default router;
