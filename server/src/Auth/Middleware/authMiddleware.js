import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../Models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      console.log('--- AUTH MIDDLEWARE ---');
      console.log('decoded.id:', decoded.id);
      console.log('req.user:', req.user ? req.user.toJSON() : 'null');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error('Auth error:', error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export const doerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'doer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a doer');
  }
};

export const customerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'customer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as a customer');
  }
};
