import { Router } from 'express';
import { registerHandler, loginHandler } from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} from './auth.validator.js';

const router = Router();

router.post(
  '/register',
  registerValidation,
  handleValidationErrors,
  registerHandler,
);
router.post('/login', loginValidation, handleValidationErrors, loginHandler);

export default router;
