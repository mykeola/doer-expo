import DoerProfile from '../Models/DoerProfile.js';
import User from '../../Auth/Models/User.js';

export const getDoerProfile = async (userId) => {
  const profile = await DoerProfile.findOne({
    where: { userId },
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'location'] }]
  });
  
  if (!profile) {
    throw new Error('Doer profile not found');
  }

  return profile;
};

export const getDoerProfileById = async (id) => {
  const profile = await DoerProfile.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'location'] }]
  });
  
  if (!profile) {
    throw new Error('Doer profile not found');
  }

  return profile;
};

export const updateOrCreateDoerProfile = async (userId, profileData) => {
  let profile = await DoerProfile.findOne({ where: { userId } });

  if (profile) {
    await profile.update(profileData);
    profile = await DoerProfile.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'location'] }]
    });
  } else {
    profile = await DoerProfile.create({
      userId,
      ...profileData,
    });
    // fetch with includes
    profile = await DoerProfile.findOne({
      where: { userId },
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'location'] }]
    });
  }

  return profile;
};

export const getAllDoers = async (filters = {}) => {
  const profiles = await DoerProfile.findAll({
    where: filters,
    include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'location'] }]
  });
  return profiles;
};
