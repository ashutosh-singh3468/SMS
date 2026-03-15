import bcrypt from 'bcryptjs';
import {
  createUser,
  findUserByEmail,
  findUserByVerificationToken,
  verifyUser,
} from '../models/userModel.js';
import { sendVerificationEmail } from '../config/mailer.js';
import { generateAccessToken, generateVerificationToken } from '../utils/token.js';

export async function register(req, res) {
  const { name, email, password, role = 'Patient' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = generateVerificationToken();

  const createdUser = await createUser({
    name,
    email,
    passwordHash,
    role,
    isVerified: false,
    verificationToken,
  });

  await sendVerificationEmail(email, verificationToken);

  return res.status(201).json({
    message: 'Registration successful. Please verify your email.',
    user: {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      isVerified: createdUser.isVerified,
    },
  });
}

export async function verifyEmail(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await findUserByVerificationToken(token);
  if (!user) {
    return res.status(404).json({ message: 'Invalid verification token' });
  }

  const verified = await verifyUser(user.id);
  return res.status(200).json({ message: 'Email verified successfully', user: verified });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before login' });
  }

  const token = generateAccessToken(user);

  return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}
