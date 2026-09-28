import User from '../Models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (userData) => {
  const { fullName, email, phone, password, location, role } = userData;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    location,
    role: role || 'customer',
  });

  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    token: generateToken(user.id),
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ where: { email } });

  if (user && (await user.matchPassword(password))) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    };
  } else {
    throw new Error('Invalid email or password');
  }
};
