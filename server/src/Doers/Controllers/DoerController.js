import asyncHandler from 'express-async-handler';
import { getDoerProfile, getDoerProfileById, updateOrCreateDoerProfile, getAllDoers } from '../Services/DoerService.js';

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await getDoerProfile(req.user.id);
  res.status(200).json({ success: true, data: profile });
});

export const getDoerById = asyncHandler(async (req, res) => {
  const profile = await getDoerProfileById(req.params.id);
  res.status(200).json({ success: true, data: profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await updateOrCreateDoerProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: profile });
});

export const getDoers = asyncHandler(async (req, res) => {
  const doers = await getAllDoers();
  res.status(200).json({ success: true, data: doers });
});
