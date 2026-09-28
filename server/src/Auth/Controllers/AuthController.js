import asyncHandler from 'express-async-handler';
import { registerUser, loginUser } from '../Services/AuthService.js';

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  res.status(200).json({ success: true, data: result });
});
