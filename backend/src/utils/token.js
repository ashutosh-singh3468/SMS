import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function generateVerificationToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: '1d' },
  );
}
