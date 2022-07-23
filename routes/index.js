import express from 'express';
import { getUsers, register, login, updateUsers, updatePassword, resetPassword } from '../controllers/Users.js';
import { saveDocuments, getDocuments, updateDocuments, deleteDocuments } from '../controllers/DataDocument.js';
import { verifyToken } from '../middleware/VerifyToken.js';

const router = express.Router();

router.post('/api/v1/auth/login', login);
router.post('/api/v1/register/users', register);
router.get('/api/v1/users', verifyToken, getUsers);
router.patch('/api/v1/users/:id', verifyToken, updateUsers);
router.patch('/api/v1/reset-password', verifyToken, resetPassword);
router.patch('/api/v1/password/:id', verifyToken, updatePassword);
router.post('/api/v1/documents', verifyToken, saveDocuments);
router.get('/api/v1/documents', verifyToken, getDocuments);
router.patch('/api/v1/documents/:id', verifyToken, updateDocuments);
router.delete('/api/v1/documents/:id', verifyToken, deleteDocuments);

export default router;
