import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from './auth.controller.js';
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

router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

export default router;
